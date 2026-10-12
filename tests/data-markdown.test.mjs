import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
    buildExampleDocument,
    getExampleEditorialMetadata,
    getExerciseConfig,
    hasBlockingDiagnostics,
    parseExampleDocument,
    updateDocumentFileContent,
    updateExampleEditorialMetadata,
} from '../src/utils/markdown.js';
import { parseMetadataValue, serializeMetadataValue } from '../src/utils/markdown/core.js';
import { compileExampleDocument } from '../src/utils/exampleCompiler.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const F = '```';

function getCodes(documentModel) {
    return documentModel.diagnostics.map((diagnostic) => diagnostic.code);
}

function cycle(source, times = 3) {
    let text = source;
    for (let index = 0; index < times; index += 1) {
        text = buildExampleDocument(parseExampleDocument(text));
    }
    return text;
}

const HTML_BODY = `\n\n# HTML\n\n${F}html\n<p>x</p>\n${F}\n`;

// ─── #2 frontmatter escaping ────────────────────────────

test('frontmatter values with quotes and backslashes survive repeated save cycles', () => {
    const source = `---\nexample_description: "Use the \\"alt\\" attribute, C:\\\\path and a:hover"\n---${HTML_BODY}`;
    const parsed = parseExampleDocument(source);

    assert.equal(parsed.metadata.example_description, 'Use the "alt" attribute, C:\\path and a:hover');

    const once = buildExampleDocument(parsed);
    assert.equal(cycle(once, 3), once);
    assert.equal(parseExampleDocument(cycle(once, 3)).metadata.example_description, parsed.metadata.example_description);
});

test('unquoted values with double quotes and invalid escapes are kept literally', () => {
    assert.equal(parseMetadataValue('Use the "class" attribute'), 'Use the "class" attribute');
    assert.equal(parseMetadataValue('"C:\\path"'), 'C:\\path');
    assert.equal(parseMetadataValue("'It''s fine'"), "It's fine");
});

test('metadata dialog saves keep descriptions with quotes stable', () => {
    let documentModel = parseExampleDocument(`# HTML\n\n${F}html\n<p>x</p>\n${F}\n`);
    const description = 'Use the "alt" attribute on <img> \\ escape';

    documentModel = updateExampleEditorialMetadata(documentModel, { description, tags: 'html', rating: 3, importance: 'useful' });
    assert.equal(getExampleEditorialMetadata(documentModel).description, description);

    documentModel = updateExampleEditorialMetadata(documentModel, { description: getExampleEditorialMetadata(documentModel).description, tags: 'html', rating: 4, importance: 'useful' });
    assert.equal(getExampleEditorialMetadata(documentModel).description, description);
});

test('number-like and boolean-like strings keep their exact text', () => {
    const parsed = parseExampleDocument(`---\nexercise_title: 007\nexample_description: 1.50\n---${HTML_BODY}`);
    assert.equal(parsed.metadata.exercise_title, '007');
    assert.equal(parsed.metadata.example_description, '1.50');
    assert.equal(serializeMetadataValue('true'), '"true"');
    assert.equal(serializeMetadataValue('42'), '"42"');
    assert.equal(parseMetadataValue(serializeMetadataValue('42')), '42');
    assert.equal(parseMetadataValue('3'), 3);
});

// ─── #3 HTML-FULL heading ───────────────────────────────

test('"# HTML-FULL" with an html fence is an html-full block and roundtrips unchanged', async () => {
    const source = `# HTML-FULL\n\n${F}html\n<!DOCTYPE html>\n<html lang="en">\n<head><title>x</title></head>\n<body><p>full</p></body>\n</html>\n${F}`;
    const documentModel = parseExampleDocument(source);

    assert.deepEqual(documentModel.blocks.map((block) => block.type), ['html-full']);
    assert.deepEqual(getCodes(documentModel), []);
    assert.equal(buildExampleDocument(documentModel), source);

    const compiled = await compileExampleDocument(documentModel);
    assert.match(compiled.compiledDocument.fullDocumentHtml, /<p>full<\/p>/);
});

test('html-full fences keep working and repo HTML-FULL examples render as full documents', async () => {
    const legacy = parseExampleDocument(`# HTML-FULL\n\n${F}html-full\n<!DOCTYPE html>\n<html><body></body></html>\n${F}\n`);
    assert.deepEqual(legacy.blocks.map((block) => block.type), ['html-full']);
    assert.match(buildExampleDocument(legacy), /```html-full\n/);

    const repoFile = path.join(ROOT, 'material/ch01-templates/sec01-vanilla/top04-html-full/examples/ex01.md');
    if (fs.existsSync(repoFile)) {
        const repoSource = fs.readFileSync(repoFile, 'utf-8');
        const repoDocument = parseExampleDocument(repoSource);
        assert.equal(repoDocument.blocks[0].type, 'html-full');
        assert.equal(buildExampleDocument(repoDocument), repoSource.trimEnd());
        const compiled = await compileExampleDocument(repoDocument);
        assert.ok(compiled.compiledDocument.fullDocumentHtml.length > 0);
    }
});

// ─── #4 exercise lists ──────────────────────────────────

test('exercise instructions and hints split only on ||', () => {
    const documentModel = parseExampleDocument(`---
exercise: true
exercise_title: T
exercise_instructions: "Add a header, a paragraph and a footer || Use the bitwise a | b operator"
exercise_hints: "Use border-radius, not border"
exercise_locked_files: styles.css,script.js
example_stage: exercise
---

# HTML

${F}html
<p>x</p>
${F}

# CSS

${F}css
p {}
${F}

# JavaScript

${F}javascript
console.log(1);
${F}
`);
    const config = getExerciseConfig(documentModel);

    assert.deepEqual(config.instructions, ['Add a header, a paragraph and a footer', 'Use the bitwise a | b operator']);
    assert.deepEqual(config.hints, ['Use border-radius, not border']);
    assert.deepEqual(config.lockedFiles, ['styles.css', 'script.js']);
});

// ─── #6 fences ──────────────────────────────────────────

test('content with ``` lines is wrapped in a longer fence and survives save + reload', () => {
    const base = parseExampleDocument(`# HTML\n\n${F}html\n<pre id="o"></pre>\n${F}\n\n# JavaScript\n\n${F}javascript\nconsole.log(1)\n${F}\n`);
    const scriptFile = base.files.find((file) => file.language === 'javascript');
    const code = 'const md = `\n```js\nhello\n```\n`;\nconsole.log(md);';
    const saved = buildExampleDocument(updateDocumentFileContent(base, scriptFile.id, code));

    assert.match(saved, /````javascript\n/);
    const reloaded = parseExampleDocument(saved);
    assert.deepEqual(getCodes(reloaded), []);
    assert.equal(reloaded.blocks.find((block) => block.type === 'javascript').content, code);
    assert.equal(buildExampleDocument(reloaded), saved);
});

test('tilde and long backtick fences are accepted', () => {
    const tilde = parseExampleDocument('# HTML\n\n~~~html\n<p>a</p>\n```\n<p>b</p>\n~~~\n');
    assert.equal(tilde.blocks[0].content, '<p>a</p>\n```\n<p>b</p>');

    const long = parseExampleDocument('# HTML\n\n````html\n<p>a</p>\n```\n````\n');
    assert.equal(long.blocks[0].content, '<p>a</p>\n```');
    assert.deepEqual(getCodes(long), []);
});

test('an indented closing fence closes the block without swallowing the next one', () => {
    const shallow = parseExampleDocument(`# HTML\n\n${F}html\n<p>a</p>\n  ${F}\n\n# CSS\n\n${F}css\np {}\n${F}\n`);
    assert.deepEqual(shallow.blocks.map((block) => [block.type, block.content]), [['html', '<p>a</p>'], ['css', 'p {}']]);

    const deep = parseExampleDocument(`# HTML\n\n${F}html\n<p>a</p>\n      ${F}\n\n# CSS\n\n${F}css\np {}\n${F}\n`);
    assert.deepEqual(deep.blocks.map((block) => [block.type, block.content]), [['html', '<p>a</p>'], ['css', 'p {}']]);
    assert.ok(getCodes(deep).includes('recovered-unclosed-fence'));
    assert.equal(hasBlockingDiagnostics(deep), false);
});

test('a missing closing fence is recovered before the next heading and block', () => {
    const documentModel = parseExampleDocument(`# HTML\n\n${F}html\n<p>a</p>\n\n# CSS\n\n${F}css\np {}\n${F}\n`);
    assert.deepEqual(documentModel.blocks.map((block) => [block.type, block.content, block.heading]), [
        ['html', '<p>a</p>', 'HTML'],
        ['css', 'p {}', 'CSS'],
    ]);
    assert.ok(getCodes(documentModel).includes('recovered-unclosed-fence'));
});

test('virtual files recover a missing fence before the next @file section', () => {
    const documentModel = parseExampleDocument(`---
framework: react
mode: multi-file
entry: src/main.jsx
---

## @file src/main.jsx
## @lang jsx
## @role entry

${F}jsx
console.log('main');

## @file src/App.jsx
## @lang jsx

${F}jsx
export function App() { return null; }
${F}
`);
    assert.deepEqual(documentModel.files.map((file) => [file.path, file.content]), [
        ['src/main.jsx', "console.log('main');"],
        ['src/App.jsx', 'export function App() { return null; }'],
    ]);
});

// ─── #7 indentation ─────────────────────────────────────

test('the first code line keeps its indentation relative to the rest', () => {
    const documentModel = parseExampleDocument(`# JavaScript\n\n${F}javascript\n\n  const a = 1;\nconsole.log(a);  \n\n${F}\n`);
    const block = documentModel.blocks[0];

    assert.equal(block.content, '  const a = 1;\nconsole.log(a);  ');
    assert.equal(cycle(buildExampleDocument(documentModel), 2), buildExampleDocument(documentModel));
});

test('uniformly indented Pug and SASS blocks keep their nesting', async () => {
    const pug = parseExampleDocument(`# Pug\n\n${F}pug\n  p one\n  p two\n${F}\n`);
    assert.equal(pug.blocks[0].content, 'p one\np two');
    assert.equal((await compileExampleDocument(pug)).compiledDocument.html, '<p>one</p><p>two</p>');

    const nested = parseExampleDocument(`# Pug\n\n${F}pug\n  div\n    p hi\n${F}\n`);
    assert.equal(nested.blocks[0].content, 'div\n  p hi');
});

// ─── #8 markup-less vanilla examples ────────────────────

test('JS-only, TS-only and CSS-only examples are valid and compile with empty html', async () => {
    const sources = {
        javascript: `---\nconsole: true\n---\n\n# JavaScript\n\n${F}javascript\nconsole.log([1, 2].map((x) => x * 2));\n${F}\n`,
        typescript: `# TypeScript\n\n${F}typescript\nconst x: number = 1;\nconsole.log(x);\n${F}\n`,
        css: `# CSS\n\n${F}css\nbody { background: red; }\n${F}\n`,
    };

    for (const [language, source] of Object.entries(sources)) {
        const documentModel = parseExampleDocument(source);
        assert.equal(hasBlockingDiagnostics(documentModel), false, language);

        const compiled = await compileExampleDocument(documentModel);
        assert.equal(compiled.compiledDocument.html, '', language);
        assert.equal(buildExampleDocument(parseExampleDocument(buildExampleDocument(documentModel))), buildExampleDocument(documentModel));
    }

    const jsCompiled = await compileExampleDocument(parseExampleDocument(sources.javascript));
    assert.match(jsCompiled.compiledDocument.js, /console\.log/);
});

test('empty documents and Vue examples without a template are still blocking', () => {
    assert.ok(getCodes(parseExampleDocument('')).includes('missing-markup'));
    const vue = parseExampleDocument(`---\nframework: vue\n---\n\n# JavaScript\n\n${F}javascript\nexport default {};\n${F}\n`);
    assert.ok(getCodes(vue).includes('missing-markup'));
    assert.equal(hasBlockingDiagnostics(vue), true);
});

// ─── #13 exercise flag ──────────────────────────────────

test('exercise mode needs exercise: true; leftovers only warn', () => {
    const disabled = parseExampleDocument(`---\nexercise: false\nexercise_title: Old\n---${HTML_BODY}`);
    assert.equal(getExerciseConfig(disabled).enabled, false);
    assert.ok(getCodes(disabled).includes('exercise-metadata-without-flag'));

    const leftover = parseExampleDocument(`---\nexample_stage: final-solution\nexercise_instructions: "Do it"\n---${HTML_BODY}`);
    assert.equal(getExerciseConfig(leftover).enabled, false);
    assert.ok(getCodes(leftover).includes('exercise-metadata-without-flag'));

    const enabled = parseExampleDocument(`---\nexercise: true\nexercise_title: Go\n---${HTML_BODY}`);
    assert.equal(getExerciseConfig(enabled).enabled, true);
    assert.ok(!getCodes(enabled).includes('exercise-metadata-without-flag'));
});

// ─── #14 BOM ────────────────────────────────────────────

test('a UTF-8 BOM does not break parsing', () => {
    const withoutFrontmatter = parseExampleDocument(`\uFEFF# HTML\n\n${F}html\n<p>x</p>\n${F}\n`);
    assert.deepEqual(getCodes(withoutFrontmatter), []);

    const withFrontmatter = parseExampleDocument(`\uFEFF---\nconsole: true\n---${HTML_BODY}`);
    assert.equal(withFrontmatter.metadata.console, true);
    assert.deepEqual(getCodes(withFrontmatter), []);
});

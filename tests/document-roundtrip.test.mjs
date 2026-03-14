import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildExampleDocument,
    createExampleDocumentFromPreset,
    parseExampleDocument,
} from '../src/utils/markdown.js';

test('legacy HTML/CSS/JavaScript documents round-trip through Markdown serialization', () => {
    const originalDocument = createExampleDocumentFromPreset('html-css-javascript');
    const markdown = buildExampleDocument(originalDocument);
    const reparsedDocument = parseExampleDocument(markdown);

    assert.equal(reparsedDocument.sourceFormat, 'legacy-blocks');
    assert.deepEqual(
        reparsedDocument.blocks.map((block) => block.type),
        ['html', 'css', 'javascript']
    );
    assert.equal(buildExampleDocument(reparsedDocument), markdown);
});

test('React multi-file documents preserve metadata, entry and file order after round-trip', () => {
    const originalDocument = createExampleDocumentFromPreset('react-project-jsx');
    const markdown = buildExampleDocument(originalDocument);
    const reparsedDocument = parseExampleDocument(markdown);

    assert.equal(reparsedDocument.sourceFormat, 'virtual-files');
    assert.equal(reparsedDocument.metadata.framework, 'react');
    assert.equal(reparsedDocument.metadata.mode, 'multi-file');
    assert.equal(reparsedDocument.metadata.entry, 'src/main.jsx');
    assert.deepEqual(
        reparsedDocument.files.map((file) => file.path),
        originalDocument.files.map((file) => file.path)
    );
    assert.equal(buildExampleDocument(reparsedDocument), markdown);
});

test('Vue SFC multi-file documents preserve .vue files after round-trip', () => {
    const originalDocument = createExampleDocumentFromPreset('vue-project-sfc-typescript');
    const markdown = buildExampleDocument(originalDocument);
    const reparsedDocument = parseExampleDocument(markdown);

    assert.equal(reparsedDocument.sourceFormat, 'virtual-files');
    assert.equal(reparsedDocument.metadata.framework, 'vue');
    assert.equal(reparsedDocument.metadata.entry, 'src/main.ts');
    assert.ok(reparsedDocument.files.some((file) => file.path === 'src/App.vue' && file.language === 'vue'));
    assert.equal(buildExampleDocument(reparsedDocument), markdown);
});

test('HTML-FULL documents round-trip without losing standalone document semantics', () => {
    const originalDocument = parseExampleDocument(`# HTML-FULL

\`\`\`html-full
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Standalone</title>
</head>
<body>
  <main>Hello full document</main>
</body>
</html>
\`\`\``);
    const markdown = buildExampleDocument(originalDocument);
    const reparsedDocument = parseExampleDocument(markdown);

    assert.equal(reparsedDocument.blocks[0].type, 'html-full');
    assert.match(reparsedDocument.blocks[0].content, /<title>Standalone<\/title>/);
    assert.equal(buildExampleDocument(reparsedDocument), markdown);
});

test('shader documents round-trip preserving renderer, resolution and block order', () => {
    const originalDocument = createExampleDocumentFromPreset('shader-time');
    const markdown = buildExampleDocument(originalDocument);
    const reparsedDocument = parseExampleDocument(markdown);

    assert.equal(reparsedDocument.rendererMode, 'shader');
    assert.equal(reparsedDocument.metadata.renderer, 'shader');
    assert.equal(reparsedDocument.metadata.resolution, '960x540');
    assert.deepEqual(
        reparsedDocument.blocks.map((block) => block.type),
        ['vertex', 'fragment']
    );
    assert.equal(buildExampleDocument(reparsedDocument), markdown);
});

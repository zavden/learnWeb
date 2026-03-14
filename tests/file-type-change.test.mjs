import test from 'node:test';
import assert from 'node:assert/strict';

import {
    evaluateDocumentFileTypeChange,
    getDocumentFileTypeChangeOptions,
    getExpectedPathForLanguage,
    parseExampleDocument,
    updateDocumentHiddenFiles,
    updateDocumentFileType,
} from '../src/utils/markdown.js';

test('legacy markup blocks only offer markup-family badge changes', () => {
    const documentModel = parseExampleDocument(`# HTML

\`\`\`html
<main>Hello</main>
\`\`\`

# CSS

\`\`\`css
main { color: red; }
\`\`\``);
    const htmlFile = documentModel.files.find((file) => file.language === 'html');
    const options = getDocumentFileTypeChangeOptions(documentModel, htmlFile.id);
    const htmlFullResult = evaluateDocumentFileTypeChange(documentModel, htmlFile.id, 'html-full');
    const pugResult = evaluateDocumentFileTypeChange(documentModel, htmlFile.id, 'pug');

    assert.deepEqual(options.map((option) => option.value), ['html', 'html-full', 'svg', 'pug']);
    assert.equal(htmlFullResult.allowed, false);
    assert.equal(htmlFullResult.code, 'html-full-must-stand-alone');
    assert.match(htmlFullResult.reason, /only block/i);
    assert.equal(pugResult.allowed, true);
});

test('react legacy app blocks only switch inside JSX and TSX badges', () => {
    const documentModel = parseExampleDocument(`---
framework: react
---

# JSX

\`\`\`jsx
function App() {
  return <main>Hello</main>;
}
\`\`\`

# CSS

\`\`\`css
main { color: red; }
\`\`\``);
    const appFile = documentModel.files.find((file) => file.language === 'jsx');
    const options = getDocumentFileTypeChangeOptions(documentModel, appFile.id);
    const tsxResult = evaluateDocumentFileTypeChange(documentModel, appFile.id, 'tsx');
    const cssResult = evaluateDocumentFileTypeChange(documentModel, appFile.id, 'css');

    assert.deepEqual(options.map((option) => option.value), ['jsx', 'tsx']);
    assert.equal(tsxResult.allowed, true);
    assert.equal(cssResult.allowed, false);
    assert.equal(cssResult.code, 'incompatible-target-type');
    assert.match(cssResult.reason, /JSX, TSX/);
});

test('react virtual entry files keep entry-safe languages and calculate the next path', () => {
    const documentModel = parseExampleDocument(`---
framework: react
mode: multi-file
entry: src/main.jsx
---

## @file src/main.jsx
## @lang jsx
## @role entry

\`\`\`jsx
export {};
\`\`\`

## @file src/App.jsx
## @lang jsx
## @role app

\`\`\`jsx
export function App() {
  return <main>Hello</main>;
}
\`\`\``);
    const entryFile = documentModel.files.find((file) => file.role === 'entry');
    const options = getDocumentFileTypeChangeOptions(documentModel, entryFile.id);
    const tsxResult = evaluateDocumentFileTypeChange(documentModel, entryFile.id, 'tsx');
    const cssResult = evaluateDocumentFileTypeChange(documentModel, entryFile.id, 'css');

    assert.deepEqual(options.map((option) => option.value), ['jsx', 'tsx', 'javascript', 'typescript']);
    assert.equal(tsxResult.allowed, true);
    assert.equal(tsxResult.expectedPath, 'src/main.tsx');
    assert.equal(tsxResult.wouldChangePath, true);
    assert.equal(cssResult.allowed, false);
    assert.equal(cssResult.code, 'invalid-react-entry-target-language');
});

test('style virtual files can switch preprocessors and keep expected extensions in sync', () => {
    const documentModel = parseExampleDocument(`---
framework: react
mode: multi-file
entry: src/main.mjs
---

## @file src/main.mjs
## @lang javascript
## @role entry

\`\`\`javascript
export {};
\`\`\`

## @file src/styles.css
## @lang css
## @role style

\`\`\`css
body { margin: 0; }
\`\`\``);
    const styleFile = documentModel.files.find((file) => file.role === 'style');
    const styleOptions = getDocumentFileTypeChangeOptions(documentModel, styleFile.id);
    const scssResult = evaluateDocumentFileTypeChange(documentModel, styleFile.id, 'scss');

    assert.deepEqual(styleOptions.map((option) => option.value), ['css', 'scss', 'sass']);
    assert.equal(scssResult.allowed, true);
    assert.equal(scssResult.expectedPath, 'src/styles.scss');
    assert.equal(getExpectedPathForLanguage('src/main.mjs', 'typescript'), 'src/main.mts');
});

test('vue entry badge changes keep metadata.entry in sync', () => {
    const documentModel = parseExampleDocument(`---
framework: vue
mode: multi-file
entry: src/main.js
---

## @file src/main.js
## @lang javascript
## @role entry

\`\`\`javascript
export {};
\`\`\`

## @file src/App.vue
## @lang vue
## @role app

\`\`\`vue
<template><main>Hello</main></template>
\`\`\``);
    const entryFile = documentModel.files.find((file) => file.role === 'entry');
    const nextDocument = updateDocumentFileType(documentModel, entryFile.id, 'typescript');

    assert.equal(nextDocument.metadata.entry, 'src/main.ts');
    assert.ok(nextDocument.files.some((file) => file.path === 'src/main.ts' && file.language === 'typescript'));
    assert.equal(nextDocument.files.some((file) => file.path === 'src/main.js'), false);
});

test('virtual badge changes rewrite language, path extension and entry metadata consistently', () => {
    const documentModel = parseExampleDocument(`---
framework: react
mode: multi-file
entry: src/main.jsx
---

## @file src/main.jsx
## @lang jsx
## @role entry

\`\`\`jsx
export {};
\`\`\`

## @file src/styles.css
## @lang css
## @role style

\`\`\`css
body { margin: 0; }
\`\`\``);
    const entryFile = documentModel.files.find((file) => file.role === 'entry');
    const styleFile = documentModel.files.find((file) => file.role === 'style');

    const withTsxEntry = updateDocumentFileType(documentModel, entryFile.id, 'tsx');
    const withScssStyle = updateDocumentFileType(withTsxEntry, withTsxEntry.files.find((file) => file.role === 'style').id, 'scss');

    assert.equal(withTsxEntry.metadata.entry, 'src/main.tsx');
    assert.ok(withTsxEntry.files.some((file) => file.path === 'src/main.tsx' && file.language === 'tsx'));
    assert.ok(withScssStyle.files.some((file) => file.path === 'src/styles.scss' && file.language === 'scss'));
    assert.equal(withScssStyle.files.some((file) => file.path === 'src/styles.css'), false);
    assert.ok(styleFile);
});

test('virtual badge changes block path collisions before mutating the document', () => {
    const documentModel = parseExampleDocument(`---
framework: react
mode: multi-file
entry: src/main.jsx
---

## @file src/main.jsx
## @lang jsx
## @role entry

\`\`\`jsx
export {};
\`\`\`

## @file src/App.jsx
## @lang jsx
## @role app

\`\`\`jsx
export function App() {
  return <main>Hello</main>;
}
\`\`\`

## @file src/App.tsx
## @lang tsx
## @role component

\`\`\`tsx
export function AppAlt() {
  return <main>Alt</main>;
}
\`\`\``);
    const appFile = documentModel.files.find((file) => file.path === 'src/App.jsx');
    const evaluation = evaluateDocumentFileTypeChange(documentModel, appFile.id, 'tsx');
    const nextDocument = updateDocumentFileType(documentModel, appFile.id, 'tsx');

    assert.equal(evaluation.allowed, false);
    assert.equal(evaluation.code, 'file-type-change-path-collision');
    assert.match(evaluation.reason, /already exists/i);
    assert.deepEqual(
        nextDocument.files.map((file) => file.path),
        documentModel.files.map((file) => file.path),
    );
});

test('react config files stay JSON-only and markup roles are rejected explicitly', () => {
    const configDocument = parseExampleDocument(`---
framework: react
mode: multi-file
entry: src/main.jsx
---

## @file src/main.jsx
## @lang jsx
## @role entry

\`\`\`jsx
export {};
\`\`\`

## @file src/config/app.json
## @lang json
## @role config

\`\`\`json
{ "title": "Demo" }
\`\`\``);
    const markupDocument = parseExampleDocument(`---
framework: react
mode: multi-file
entry: src/main.jsx
---

## @file src/main.jsx
## @lang jsx
## @role entry

\`\`\`jsx
export {};
\`\`\`

## @file src/template.html
## @lang html
## @role markup

\`\`\`html
<main>Hello</main>
\`\`\``);
    const configFile = configDocument.files.find((file) => file.role === 'config');
    const markupFile = markupDocument.files.find((file) => file.role === 'markup');
    const configResult = evaluateDocumentFileTypeChange(configDocument, configFile.id, 'typescript');
    const markupOptions = getDocumentFileTypeChangeOptions(markupDocument, markupFile.id);
    const markupResult = evaluateDocumentFileTypeChange(markupDocument, markupFile.id, 'html');

    assert.equal(configResult.allowed, false);
    assert.equal(configResult.code, 'react-config-role-json-only');
    assert.match(configResult.reason, /role `config`/i);
    assert.deepEqual(markupOptions, []);
    assert.equal(markupResult.allowed, false);
    assert.equal(markupResult.code, 'react-markup-role-not-supported');
});

test('vue multi-file keeps HTML render modules and .vue SFC files locked to their family', () => {
    const documentModel = parseExampleDocument(`---
framework: vue
mode: multi-file
entry: src/main.js
---

## @file src/main.js
## @lang javascript
## @role entry

\`\`\`javascript
export {};
\`\`\`

## @file src/App.html
## @lang html
## @role markup

\`\`\`html
<main>{{ title }}</main>
\`\`\`

## @file src/App.vue
## @lang vue
## @role app

\`\`\`vue
<template><main>Hello</main></template>
\`\`\``);
    const markupFile = documentModel.files.find((file) => file.path === 'src/App.html');
    const sfcFile = documentModel.files.find((file) => file.path === 'src/App.vue');
    const markupToTs = evaluateDocumentFileTypeChange(documentModel, markupFile.id, 'typescript');
    const sfcToTs = evaluateDocumentFileTypeChange(documentModel, sfcFile.id, 'typescript');

    assert.equal(markupToTs.allowed, false);
    assert.equal(markupToTs.code, 'vue-markup-family-only');
    assert.equal(sfcToTs.allowed, false);
    assert.equal(sfcToTs.code, 'vue-sfc-conversion-not-supported');
});

test('vue multi-file keeps config files JSON-only and blocks direct JS-to-SFC upgrades', () => {
    const documentModel = parseExampleDocument(`---
framework: vue
mode: multi-file
entry: src/main.js
---

## @file src/main.js
## @lang javascript
## @role entry

\`\`\`javascript
export {};
\`\`\`

## @file src/App.js
## @lang javascript
## @role app

\`\`\`javascript
export default {};
\`\`\`

## @file src/data/app.json
## @lang json
## @role config

\`\`\`json
{ "title": "Demo" }
\`\`\``);
    const appFile = documentModel.files.find((file) => file.role === 'app');
    const configFile = documentModel.files.find((file) => file.role === 'config');
    const appResult = evaluateDocumentFileTypeChange(documentModel, appFile.id, 'vue');
    const configResult = evaluateDocumentFileTypeChange(documentModel, configFile.id, 'javascript');

    assert.equal(appResult.allowed, false);
    assert.equal(appResult.code, 'vue-sfc-upgrade-not-supported');
    assert.match(appResult.reason, /not supported yet/i);
    assert.equal(configResult.allowed, false);
    assert.equal(configResult.code, 'vue-config-role-json-only');
});

test('shader badge changes stay blocked to preserve the vertex and fragment pair', () => {
    const documentModel = parseExampleDocument(`---
renderer: shader
resolution: 800x600
---

# Vertex

\`\`\`vertex
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
\`\`\`

# Fragment

\`\`\`fragment
precision mediump float;

void main() {
  gl_FragColor = vec4(1.0);
}
\`\`\``);
    const vertexFile = documentModel.files.find((file) => file.language === 'vertex');
    const options = getDocumentFileTypeChangeOptions(documentModel, vertexFile.id);
    const result = evaluateDocumentFileTypeChange(documentModel, vertexFile.id, 'fragment');

    assert.deepEqual(options.map((option) => option.value), ['vertex', 'fragment']);
    assert.equal(result.allowed, false);
    assert.equal(result.code, 'shader-block-change-not-supported');
});

test('exercise locked files block badge changes before mutating the document', () => {
    const documentModel = parseExampleDocument(`---
framework: react
mode: multi-file
entry: src/main.jsx
exercise: true
exercise_locked_files: src/App.jsx
---

## @file src/main.jsx
## @lang jsx
## @role entry

\`\`\`jsx
export {};
\`\`\`

## @file src/App.jsx
## @lang jsx
## @role app

\`\`\`jsx
export function App() {
  return <main>Hello</main>;
}
\`\`\``);
    const appFile = documentModel.files.find((file) => file.path === 'src/App.jsx');
    const evaluation = evaluateDocumentFileTypeChange(documentModel, appFile.id, 'tsx');
    const nextDocument = updateDocumentFileType(documentModel, appFile.id, 'tsx');

    assert.equal(evaluation.allowed, false);
    assert.equal(evaluation.code, 'exercise-file-type-change-locked');
    assert.match(evaluation.reason, /locked by the current exercise/i);
    assert.ok(nextDocument.files.some((file) => file.path === 'src/App.jsx' && file.language === 'jsx'));
    assert.equal(nextDocument.files.some((file) => file.path === 'src/App.tsx'), false);
});

test('locked exercise files still expose badge options but keep them blocked with explicit reasons', () => {
    const documentModel = parseExampleDocument(`---
framework: react
mode: multi-file
entry: src/main.jsx
exercise: true
exercise_locked_files: src/App.jsx
---

## @file src/main.jsx
## @lang jsx
## @role entry

\`\`\`jsx
export {};
\`\`\`

## @file src/App.jsx
## @lang jsx
## @role app

\`\`\`jsx
export function App() {
  return <main>Hello</main>;
}
\`\`\``);
    const appFile = documentModel.files.find((file) => file.path === 'src/App.jsx');
    const options = getDocumentFileTypeChangeOptions(documentModel, appFile.id);

    assert.deepEqual(options.map((option) => option.value), ['jsx', 'tsx', 'javascript', 'typescript']);
    assert.ok(options.every((option) => option.allowed === false));
    assert.ok(options.every((option) => /locked by the current exercise/i.test(option.reason)));
});

test('hidden virtual files keep their hidden state when a badge change renames the path', () => {
    const documentModel = parseExampleDocument(`---
framework: react
mode: multi-file
entry: src/main.jsx
---

## @file src/main.jsx
## @lang jsx
## @role entry

\`\`\`jsx
export {};
\`\`\`

## @file src/styles.css
## @lang css
## @role style

\`\`\`css
body { margin: 0; }
\`\`\``);
    const styleFile = documentModel.files.find((file) => file.path === 'src/styles.css');
    const hiddenDocument = updateDocumentHiddenFiles(documentModel, ['file:src/styles.css']);
    const nextDocument = updateDocumentFileType(hiddenDocument, styleFile.id, 'scss');

    assert.equal(nextDocument.metadata.editor_hidden_files, 'file:src/styles.scss');
    assert.ok(nextDocument.files.some((file) => file.path === 'src/styles.scss' && file.language === 'scss'));
});

test('legacy badge changes rewrite the block type while preserving content', () => {
    const documentModel = parseExampleDocument(`# HTML

\`\`\`html
<main>Hello</main>
\`\`\`

# CSS

\`\`\`css
main { color: red; }
\`\`\``);
    const htmlFile = documentModel.files.find((file) => file.language === 'html');
    const cssFile = documentModel.files.find((file) => file.language === 'css');

    const pugDocument = updateDocumentFileType(documentModel, htmlFile.id, 'pug');
    const scssDocument = updateDocumentFileType(pugDocument, cssFile.id, 'scss');

    assert.deepEqual(
        pugDocument.blocks.map((block) => block.type),
        ['pug', 'css'],
    );
    assert.equal(pugDocument.blocks[0].content, '<main>Hello</main>');
    assert.equal(pugDocument.files[0].language, 'pug');
    assert.equal(pugDocument.files[0].path, 'template.pug');

    assert.deepEqual(
        scssDocument.blocks.map((block) => block.type),
        ['pug', 'scss'],
    );
    assert.equal(scssDocument.blocks[1].content, 'main { color: red; }');
    assert.equal(scssDocument.files[1].language, 'scss');
    assert.equal(scssDocument.files[1].path, 'styles.scss');
});

test('react legacy app blocks can switch between JSX and TSX without changing framework', () => {
    const documentModel = parseExampleDocument(`---
framework: react
---

# JSX

\`\`\`jsx
function App() {
  return <main>Hello</main>;
}
\`\`\``);
    const appFile = documentModel.files.find((file) => file.language === 'jsx');
    const nextDocument = updateDocumentFileType(documentModel, appFile.id, 'tsx');

    assert.equal(nextDocument.metadata.framework, 'react');
    assert.equal(nextDocument.blocks[0].type, 'tsx');
    assert.equal(nextDocument.blocks[0].language, 'tsx');
    assert.match(nextDocument.blocks[0].content, /function App/);
});

test('blocked legacy badge changes leave the document untouched', () => {
    const documentModel = parseExampleDocument(`# HTML

\`\`\`html
<main>Hello</main>
\`\`\`

# CSS

\`\`\`css
main { color: red; }
\`\`\``);
    const htmlFile = documentModel.files.find((file) => file.language === 'html');
    const nextDocument = updateDocumentFileType(documentModel, htmlFile.id, 'html-full');

    assert.deepEqual(
        nextDocument.blocks.map((block) => block.type),
        documentModel.blocks.map((block) => block.type),
    );
    assert.deepEqual(
        nextDocument.files.map((file) => file.path),
        documentModel.files.map((file) => file.path),
    );
});

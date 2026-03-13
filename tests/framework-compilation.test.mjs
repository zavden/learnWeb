import test from 'node:test';
import assert from 'node:assert/strict';

import { createExampleDocumentFromPreset } from '../src/utils/markdown.js';
import { compileExampleDocument } from '../src/utils/exampleCompiler.js';

function getErrorDiagnostics(diagnostics = []) {
    return diagnostics.filter((diagnostic) => diagnostic.level === 'error');
}

test('legacy HTML/CSS/JavaScript preset compiles with runtime path metadata', async () => {
    const documentModel = createExampleDocumentFromPreset('html-css-javascript');
    const result = await compileExampleDocument(documentModel);

    assert.deepEqual(getErrorDiagnostics(result.compileDiagnostics), []);
    assert.match(result.compiledDocument.html, /<h1 class="title">Hello World<\/h1>/);
    assert.match(result.compiledDocument.css, /\.title/);
    assert.match(result.compiledDocument.js, /sourceURL=script\.js/);
    assert.equal(result.compiledDocument.runtimeScriptPath, 'script.js');
});

test('React single-file JSX preset compiles into a root-mounted application', async () => {
    const documentModel = createExampleDocumentFromPreset('react-jsx-css');
    const result = await compileExampleDocument(documentModel);

    assert.deepEqual(getErrorDiagnostics(result.compileDiagnostics), []);
    assert.equal(result.compiledDocument.framework, 'react');
    assert.match(result.compiledDocument.html, /id="root"/);
    assert.match(result.compiledDocument.js, /createRoot/);
    assert.match(result.compiledDocument.css, /\.react-app/);
});

test('React multi-file TSX preset compiles with inline sourcemaps', async () => {
    const documentModel = createExampleDocumentFromPreset('react-project-tsx');
    const result = await compileExampleDocument(documentModel);

    assert.deepEqual(getErrorDiagnostics(result.compileDiagnostics), []);
    assert.equal(result.compiledDocument.framework, 'react');
    assert.match(result.compiledDocument.html, /id="root"/);
    assert.match(result.compiledDocument.js, /createRoot/);
    assert.match(result.compiledDocument.js, /sourceMappingURL=data:application\/json;base64,/);
});

test('Vue single-file TypeScript preset compiles into an app-mounted bundle', async () => {
    const documentModel = createExampleDocumentFromPreset('vue-typescript');
    const result = await compileExampleDocument(documentModel);

    assert.deepEqual(getErrorDiagnostics(result.compileDiagnostics), []);
    assert.equal(result.compiledDocument.framework, 'vue');
    assert.match(result.compiledDocument.html, /id="app"/);
    assert.match(result.compiledDocument.js, /createApp/);
});

test('Vue SFC multi-file preset compiles with bundled JS and extracted styles', async () => {
    const documentModel = createExampleDocumentFromPreset('vue-project-sfc-javascript');
    const result = await compileExampleDocument(documentModel);

    assert.deepEqual(getErrorDiagnostics(result.compileDiagnostics), []);
    assert.equal(result.compiledDocument.framework, 'vue');
    assert.match(result.compiledDocument.html, /id="app"/);
    assert.match(result.compiledDocument.js, /createApp/);
    assert.ok(result.compiledDocument.css.length > 0);
});

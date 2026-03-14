import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { parseExampleDocument } from '../src/utils/markdown.js';
import { compileExampleDocument } from '../src/utils/exampleCompiler.js';

function getErrorDiagnostics(diagnostics = []) {
    return diagnostics.filter((diagnostic) => diagnostic.level === 'error');
}

function loadExampleDocument(relativePath) {
    const absolutePath = path.resolve(process.cwd(), relativePath);
    const content = fs.readFileSync(absolutePath, 'utf-8');
    return parseExampleDocument(content);
}

test('legacy HTML/CSS/JavaScript example from ch00-tests compiles with runtime path metadata', async () => {
    const documentModel = loadExampleDocument(
        'material/ch00-tests/sec00-test/top01-olds/examples/html-css-javascript.md'
    );
    const result = await compileExampleDocument(documentModel);

    assert.deepEqual(getErrorDiagnostics(result.compileDiagnostics), []);
    assert.match(result.compiledDocument.html, /data-combo="html-css-javascript"/);
    assert.match(result.compiledDocument.css, /\.demo-card/);
    assert.match(result.compiledDocument.js, /sourceURL=script\.js/);
    assert.equal(result.compiledDocument.runtimeScriptPath, 'script.js');
});

test('React single-file JSX example from ch00-tests compiles into a root-mounted application', async () => {
    const documentModel = loadExampleDocument(
        'material/ch00-tests/sec00-test/top01-olds/examples/react-jsx-css.md'
    );
    const result = await compileExampleDocument(documentModel);

    assert.deepEqual(getErrorDiagnostics(result.compileDiagnostics), []);
    assert.equal(result.compiledDocument.framework, 'react');
    assert.match(result.compiledDocument.html, /id="root"/);
    assert.match(result.compiledDocument.js, /createRoot/);
    assert.match(result.compiledDocument.css, /\.card/);
});

test('React multi-file TSX example from ch00-tests compiles with inline sourcemaps', async () => {
    const documentModel = loadExampleDocument(
        'material/ch00-tests/sec00-test/top01-olds/examples/react-project-tsx.md'
    );
    const result = await compileExampleDocument(documentModel);

    assert.deepEqual(getErrorDiagnostics(result.compileDiagnostics), []);
    assert.equal(result.compiledDocument.framework, 'react');
    assert.match(result.compiledDocument.html, /id="root"/);
    assert.match(result.compiledDocument.js, /createRoot/);
    assert.match(result.compiledDocument.js, /sourceMappingURL=data:application\/json;base64,/);
});

test('Vue single-file TypeScript example from ch00-tests compiles into an app-mounted bundle', async () => {
    const documentModel = loadExampleDocument(
        'material/ch00-tests/sec00-test/top00-test/examples/vue-typescript.md'
    );
    const result = await compileExampleDocument(documentModel);

    assert.deepEqual(getErrorDiagnostics(result.compileDiagnostics), []);
    assert.equal(result.compiledDocument.framework, 'vue');
    assert.match(result.compiledDocument.html, /id="app"/);
    assert.match(result.compiledDocument.js, /createApp/);
});

test('Vue SFC multi-file example from ch00-tests compiles with bundled JS and extracted styles', async () => {
    const documentModel = loadExampleDocument(
        'material/ch00-tests/sec00-test/top00-test/examples/vue-project-sfc-javascript.md'
    );
    const result = await compileExampleDocument(documentModel);

    assert.deepEqual(getErrorDiagnostics(result.compileDiagnostics), []);
    assert.equal(result.compiledDocument.framework, 'vue');
    assert.match(result.compiledDocument.html, /id="app"/);
    assert.match(result.compiledDocument.js, /createApp/);
    assert.ok(result.compiledDocument.css.length > 0);
});

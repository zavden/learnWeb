import test from 'node:test';
import assert from 'node:assert/strict';

import { compileExampleDocumentIsolated, shutdownIsolatedCompiler } from '../src/utils/compiler/isolatedCompiler.js';
import { parseExampleDocument } from '../src/utils/markdown.js';

const FENCE = '```';

test('the isolated compiler compiles documents in a worker thread', async () => {
    try {
        const document = parseExampleDocument([
            '# HTML', '', `${FENCE}html`, '<p id="out"></p>', FENCE, '',
            '# SCSS', '', `${FENCE}scss`, '$c: red;', 'p { color: $c; }', FENCE, '',
            '# TypeScript', '', `${FENCE}typescript`, "const n: number = 'x';", FENCE, '',
        ].join('\n'));

        const [first, second] = await Promise.all([
            compileExampleDocumentIsolated(document),
            compileExampleDocumentIsolated(document),
        ]);

        for (const result of [first, second]) {
            assert.match(result.compiledDocument.css, /color: red/);
            assert.match(result.compiledDocument.js, /const n = 'x'/);
            assert.deepEqual(result.compileDiagnostics.map((diagnostic) => diagnostic.code), ['typescript-type']);
        }
    } finally {
        await shutdownIsolatedCompiler();
    }
});

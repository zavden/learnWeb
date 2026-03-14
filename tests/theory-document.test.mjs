import test from 'node:test';
import assert from 'node:assert/strict';

import { createTheoryDocument, getTheoryDocumentContent, isTheoryDocument } from '../src/utils/theoryDocument.js';
import { renderTheoryPreviewDocument } from '../src/utils/theoryRenderer.js';

test('theory documents are modeled as a single editable main.md file', () => {
    const documentModel = createTheoryDocument('# Title\n\nBody copy');

    assert.equal(isTheoryDocument(documentModel), true);
    assert.equal(documentModel.sourceFormat, 'virtual-files');
    assert.equal(documentModel.files.length, 1);
    assert.equal(documentModel.files[0].path, 'main.md');
    assert.equal(documentModel.files[0].language, 'markdown');
    assert.equal(getTheoryDocumentContent(documentModel), '# Title\n\nBody copy');
});

test('theory preview renders markdown into a standalone HTML document', () => {
    const previewMarkup = renderTheoryPreviewDocument('# Theory\n\nA paragraph with **bold** text.');

    assert.match(previewMarkup, /<!DOCTYPE html>/i);
    assert.match(previewMarkup, /<h1[^>]*>Theory<\/h1>/i);
    assert.match(previewMarkup, /<strong>bold<\/strong>/i);
});

test('theory preview document wires exercise embed actions for the parent app', () => {
    const previewMarkup = renderTheoryPreviewDocument('[[exercise:ex01.md]]', {
        exerciseEmbeds: {
            'ex01.md': {
                description: 'Exercise description',
                exists: true,
                filename: 'ex01.md',
                importance: 'useful',
                rating: 3,
                stage: 'exercise',
                tags: ['html'],
            },
        },
        renderId: 42,
        topicPath: 'material/ch00-tests/sec00-test/top00-test',
    });

    assert.match(previewMarkup, /data-theory-exercise-preview="ex01\.md"/);
    assert.match(previewMarkup, /data-theory-exercise-open="ex01\.md"/);
    assert.match(previewMarkup, /source: MESSAGE_SOURCE/);
    assert.match(previewMarkup, /renderId: RENDER_ID/);
});

test('theory preview escapes inline preview payload so nested srcdoc scripts do not break the parent script', () => {
    const previewMarkup = renderTheoryPreviewDocument('[[exercise:ex01.md]]', {
        exerciseEmbeds: {
            'ex01.md': {
                description: 'Nested preview with script tag',
                exists: true,
                filename: 'ex01.md',
                previewSrcdoc: '<!DOCTYPE html><html><body><script>console.log("inner")</script></body></html>',
                tags: ['html'],
            },
        },
    });

    assert.match(previewMarkup, /<\\\/script>/);
    assert.equal((previewMarkup.match(/<\/script>/g) || []).length, 1);
});

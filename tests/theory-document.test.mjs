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

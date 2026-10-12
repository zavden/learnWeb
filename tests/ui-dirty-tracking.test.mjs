import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildDiscardChangesMessage,
    createDirtyTracker,
    createRequestGate,
} from '../src/components/editor/dirtyTracker.js';
import {
    buildExampleDocument,
    cloneExampleDocument,
    parseExampleDocument,
    synchronizeDocument,
    updateDocumentFileContent,
} from '../src/utils/markdown.js';

test('dirty tracker is clean until the signature diverges from the saved one', () => {
    const tracker = createDirtyTracker();
    assert.equal(tracker.isDirty(), false);
    // Nothing saved yet: never dirty.
    assert.equal(tracker.update('anything'), false);
    assert.equal(tracker.isDirty(), false);

    tracker.markSaved('v1');
    assert.equal(tracker.update('v1'), false);
    assert.equal(tracker.isDirty(), false);

    assert.equal(tracker.update('v2'), true);
    assert.equal(tracker.isDirty(), true);
    assert.equal(tracker.update('v3'), false, 'still dirty, no state change');

    // Typing back to the saved text clears the dirty flag.
    assert.equal(tracker.update('v1'), true);
    assert.equal(tracker.isDirty(), false);

    tracker.update('v4');
    tracker.markSaved('v4');
    assert.equal(tracker.isDirty(), false);
    assert.equal(tracker.getSavedSignature(), 'v4');

    tracker.reset();
    assert.equal(tracker.getSavedSignature(), null);
    assert.equal(tracker.update('v5'), false);
});

test('discard confirmation message names the document and the action', () => {
    const message = buildDiscardChangesMessage('"ex01.md"', 'switch topic');
    assert.match(message, /"ex01\.md" has unsaved changes/);
    assert.match(message, /Discard them and switch topic\?/);
    assert.match(buildDiscardChangesMessage('', ''), /The current document has unsaved changes[\s\S]*continue\?/);
});

test('request gate lets only the latest request win', () => {
    const gate = createRequestGate();
    const first = gate.next();
    const second = gate.next();
    assert.equal(gate.isCurrent(first), false);
    assert.equal(gate.isCurrent(second), true);
    gate.invalidate();
    assert.equal(gate.isCurrent(second), false);
});

test('document signature returns to the saved value after edit + undo', () => {
    const source = [
        '---',
        'example_description: "Dirty tracking fixture"',
        'highlights: "file-0.html:2:yellow"',
        '---',
        '',
        '# HTML',
        '',
        '```html',
        '<main>',
        '  <h1>Hello</h1>',
        '</main>',
        '```',
        '',
        '# CSS',
        '',
        '```css',
        'h1 { color: tomato; }',
        '```',
        '',
    ].join('\n');
    // Mirrors Editor._applyDocument + _computeDirtySignature.
    const loaded = synchronizeDocument(cloneExampleDocument(parseExampleDocument(source)));
    const savedSignature = buildExampleDocument(loaded);

    const file = loaded.files[0];
    const edited = updateDocumentFileContent(loaded, file.id, `${file.content}\n<!-- edit -->`);
    assert.notEqual(buildExampleDocument(edited), savedSignature);

    const undone = updateDocumentFileContent(edited, file.id, file.content);
    assert.equal(buildExampleDocument(undone), savedSignature);
});

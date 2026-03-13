import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';

import {
    buildMaterialTree,
    readHiddenState,
    setChapterHidden,
} from '../src/utils/materialTree.js';

function createTopic(materialDir, chapterId, sectionId, topicId) {
    const topicDir = path.join(materialDir, chapterId, sectionId, topicId);
    fs.mkdirSync(path.join(topicDir, 'examples'), { recursive: true });
    fs.writeFileSync(path.join(topicDir, 'main.md'), '# Test topic\n', 'utf-8');
}

test('hidden chapter state defaults to an empty set when the file does not exist', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'learncode-hidden-state-'));
    const hiddenStateFile = path.join(tempDir, '.hiddens');

    assert.deepEqual(readHiddenState(hiddenStateFile), { chapters: [] });

    fs.rmSync(tempDir, { recursive: true, force: true });
});

test('setChapterHidden persists hidden chapters in .hiddens', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'learncode-hidden-state-'));
    const hiddenStateFile = path.join(tempDir, '.hiddens');

    const hiddenState = setChapterHidden(hiddenStateFile, 'ch03-react', true);

    assert.deepEqual(hiddenState, { chapters: ['ch03-react'] });
    assert.equal(fs.existsSync(hiddenStateFile), true);
    assert.match(fs.readFileSync(hiddenStateFile, 'utf-8'), /"chapters": \[/);

    fs.rmSync(tempDir, { recursive: true, force: true });
});

test('buildMaterialTree filters hidden chapters from the visible tree', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'learncode-hidden-state-'));
    const materialDir = path.join(tempDir, 'material');
    const hiddenStateFile = path.join(tempDir, '.hiddens');

    createTopic(materialDir, 'ch00-vanilla', 'sec00-basics', 'top00-intro');
    createTopic(materialDir, 'ch01-react', 'sec00-basics', 'top00-state');

    setChapterHidden(hiddenStateFile, 'ch01-react', true);

    const visibleTree = buildMaterialTree(materialDir, { hiddenStateFile });
    const fullTree = buildMaterialTree(materialDir, { hiddenStateFile, includeHidden: true });

    assert.equal(visibleTree.length, 1);
    assert.equal(visibleTree[0].id, 'ch00-vanilla');
    assert.equal(fullTree.length, 2);
    assert.equal(fullTree.find((chapter) => chapter.id === 'ch01-react')?.hidden, true);

    fs.rmSync(tempDir, { recursive: true, force: true });
});

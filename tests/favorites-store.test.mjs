import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';

import {
    addFavorite,
    readFavoritesState,
    removeFavorite,
    resolveFavorites,
    writeFavoritesState,
} from '../src/utils/favoritesStore.js';

function createTempDir(prefix) {
    return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

test('favorites store normalizes and deduplicates example paths', () => {
    const root = createTempDir('favorites-store-');
    const favoritesFile = path.join(root, '.favorites');

    const state = writeFavoritesState(favoritesFile, [
        'material/ch01-test/sec01-topic/top01-basic/examples/demo.md',
        './material/ch01-test/sec01-topic/top01-basic/examples/demo.md',
        'material/ch01-test/sec01-topic/top01-basic/examples/demo.md',
        'material/ch01-test/sec01-topic/top01-basic/main.md',
    ]);

    assert.deepEqual(state, {
        items: ['material/ch01-test/sec01-topic/top01-basic/examples/demo.md'],
    });
    assert.deepEqual(readFavoritesState(favoritesFile), state);
});

test('favorites store can add, remove and resolve missing entries', () => {
    const root = createTempDir('favorites-resolve-');
    const materialDir = path.join(root, 'material');
    const topicDir = path.join(materialDir, 'ch01-test', 'sec01-topic', 'top01-basic');
    const examplesDir = path.join(topicDir, 'examples');
    const favoritesFile = path.join(root, '.favorites');

    fs.mkdirSync(examplesDir, { recursive: true });
    fs.writeFileSync(path.join(examplesDir, 'demo.md'), '# Demo', 'utf-8');

    addFavorite(favoritesFile, 'material/ch01-test/sec01-topic/top01-basic/examples/demo.md');
    addFavorite(favoritesFile, 'material/ch01-test/sec01-topic/top01-basic/examples/missing.md');

    const resolved = resolveFavorites(favoritesFile, materialDir);
    assert.deepEqual(resolved, [
        {
            exists: true,
            filename: 'demo.md',
            path: 'material/ch01-test/sec01-topic/top01-basic/examples/demo.md',
            topicPath: 'ch01-test/sec01-topic/top01-basic',
        },
        {
            exists: false,
            filename: 'missing.md',
            path: 'material/ch01-test/sec01-topic/top01-basic/examples/missing.md',
            topicPath: 'ch01-test/sec01-topic/top01-basic',
        },
    ]);

    const nextState = removeFavorite(favoritesFile, 'material/ch01-test/sec01-topic/top01-basic/examples/demo.md');
    assert.deepEqual(nextState, {
        items: ['material/ch01-test/sec01-topic/top01-basic/examples/missing.md'],
    });
});

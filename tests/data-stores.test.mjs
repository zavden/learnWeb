import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { addFavorite, readFavoritesState, removeFavorite } from '../src/utils/favoritesStore.js';
import { addPending, readPendingState } from '../src/utils/pendingStore.js';
import {
    buildMaterialTree,
    compareMaterialEntries,
    readHiddenState,
    setChapterHidden,
} from '../src/utils/materialTree.js';
import { resolveExerciseComparison } from '../src/utils/exerciseComparison.js';
import { encodeTopicPath } from '../src/utils/api.js';

function makeTempDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'learnweb-data-'));
}

const A = 'material/ch01-a/sec01-b/top01-c/examples/ex01.md';
const B = 'material/ch01-a/sec01-b/top01-c/examples/ex02.md';
const C = 'material/ch01-a/sec01-b/top01-c/examples/ex03.md';

// ─── malformed state files ──────────────────────────────

test('a .favorites file with a trailing comma is recovered and backed up before rewriting', () => {
    const dir = makeTempDir();
    const file = path.join(dir, '.favorites');
    const original = `{\n  "items": [\n    "${A}",\n    "${B}",\n  ]\n}\n`;
    fs.writeFileSync(file, original);

    assert.deepEqual(readFavoritesState(file).items, [A, B]);

    const state = addFavorite(file, C);
    assert.deepEqual(state.items, [A, B, C]);
    assert.equal(fs.readFileSync(`${file}.bak`, 'utf-8'), original);
    assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf-8')).items, [A, B, C]);

    // Once the file is valid again no further backups are made.
    removeFavorite(file, C);
    assert.deepEqual(fs.readdirSync(dir).filter((name) => name.includes('.bak')), ['.favorites.bak']);
});

test('an unparseable .pending file is salvaged instead of wiped', () => {
    const dir = makeTempDir();
    const file = path.join(dir, '.pending');
    const original = `{ items: ["${A}" "${B}"`;
    fs.writeFileSync(file, original);

    assert.deepEqual(readPendingState(file).items, [A, B]);
    assert.deepEqual(addPending(file, C).items, [A, B, C]);
    assert.equal(fs.readFileSync(`${file}.bak`, 'utf-8'), original);
});

test('an unparseable .hiddens file keeps its chapters and is backed up', () => {
    const dir = makeTempDir();
    const file = path.join(dir, '.hiddens');
    fs.writeFileSync(file, '{"chapters": ["ch00-tests", "ch01-templates",]');

    assert.deepEqual(readHiddenState(file).chapters, ['ch00-tests', 'ch01-templates']);
    assert.deepEqual(setChapterHidden(file, 'ch02-css', true).chapters, ['ch00-tests', 'ch01-templates', 'ch02-css']);
    assert.ok(fs.existsSync(`${file}.bak`));
});

// ─── material tree ──────────────────────────────────────

test('material folders sort by their number, not lexicographically', () => {
    const names = ['top10-ten', 'top9-nine', 'top100-hundred', 'top02-two'];
    assert.deepEqual([...names].sort(compareMaterialEntries), ['top02-two', 'top9-nine', 'top10-ten', 'top100-hundred']);
    assert.deepEqual(['ch10-ts', 'ch2-js', 'ch01-html'].sort(compareMaterialEntries), ['ch01-html', 'ch2-js', 'ch10-ts']);
});

test('tree labels come from label.txt and the first main.md heading, keeping accents', () => {
    const materialDir = path.join(makeTempDir(), 'material');
    const topicDir = path.join(materialDir, 'ch01-logica', 'sec01-operadores', 'top03-logica-booleana');
    const plainTopicDir = path.join(materialDir, 'ch01-logica', 'sec01-operadores', 'top04-sin-titulo');
    fs.mkdirSync(topicDir, { recursive: true });
    fs.mkdirSync(plainTopicDir, { recursive: true });
    fs.mkdirSync(path.join(materialDir, 'ch02-css', 'sec01-a', 'top01-b'), { recursive: true });

    fs.writeFileSync(path.join(materialDir, 'ch01-logica', 'label.txt'), '﻿\n  Lógica y control  \nignored\n');
    fs.writeFileSync(path.join(materialDir, 'ch01-logica', 'sec01-operadores', 'label.txt'), 'Operadores lógicos\n');
    fs.writeFileSync(path.join(topicDir, 'main.md'), '```md\n# Not this one\n```\n\n# 3. Lógica booleana ##\n\nTexto.\n');
    fs.writeFileSync(path.join(plainTopicDir, 'main.md'), 'Sin encabezado.\n\n## Solo h2\n');
    const codeTopicDir = path.join(materialDir, 'ch01-logica', 'sec01-operadores', 'top05-const');
    fs.mkdirSync(codeTopicDir, { recursive: true });
    fs.writeFileSync(path.join(codeTopicDir, 'main.md'), '# Literales y `as const`\n');

    const tree = buildMaterialTree(materialDir, {});
    const [chapter, cssChapter] = tree;
    const [section] = chapter.sections;

    assert.equal(chapter.label, 'Lógica y control');
    assert.equal(chapter.id, 'ch01-logica');
    assert.equal(section.label, 'Operadores lógicos');
    assert.deepEqual(section.topics.map((topic) => [topic.id, topic.label, topic.path]), [
        ['top03-logica-booleana', '3. Lógica booleana', 'ch01-logica/sec01-operadores/top03-logica-booleana'],
        ['top04-sin-titulo', 'sin titulo', 'ch01-logica/sec01-operadores/top04-sin-titulo'],
        ['top05-const', 'Literales y as const', 'ch01-logica/sec01-operadores/top05-const'],
    ]);
    assert.equal(cssChapter.label, 'css');
    assert.equal(cssChapter.sections[0].label, 'a');
});

// ─── exercise comparison ────────────────────────────────

test('exercise comparison aligns lines with a real diff', () => {
    const solution = { files: [{ path: 'styles.css', content: '.card {\n  padding: 20px;\n  border: 1px solid;\n  color: red;\n}' }] };
    const attempt = { files: [{ path: 'styles.css', content: '/* my work */\n.card {\n  padding: 10px;\n  border: 1px solid;\n}\n' }] };
    const comparison = resolveExerciseComparison({ attemptDocument: attempt, solutionDocument: solution, exerciseConfig: {} });
    const rows = comparison.selectedPair.rows.map((row) => [row.state, row.attemptLineNumber, row.solutionLineNumber]);

    assert.deepEqual(rows, [
        ['removed', 1, null],
        ['same', 2, 1],
        ['changed', 3, 2],
        ['same', 4, 3],
        ['added', null, 4],
        ['same', 5, 5],
    ]);
    assert.deepEqual(comparison.selectedPair.summary, { sameCount: 3, changedCount: 1, addedCount: 1, removedCount: 1 });
});

test('identical and empty files compare as same', () => {
    const doc = { files: [{ path: 'index.html', content: '' }] };
    const comparison = resolveExerciseComparison({ attemptDocument: doc, solutionDocument: doc, exerciseConfig: {} });
    assert.deepEqual(comparison.selectedPair.rows.map((row) => row.state), ['same']);
});

// ─── api client ─────────────────────────────────────────

test('topic paths are encoded segment by segment', () => {
    assert.equal(encodeTopicPath('ch01-a/sec01-b/top01-c'), 'ch01-a/sec01-b/top01-c');
    assert.equal(encodeTopicPath('ch01-diseño web/sec01-#x/top01-50%?'), 'ch01-dise%C3%B1o%20web/sec01-%23x/top01-50%25%3F');
});

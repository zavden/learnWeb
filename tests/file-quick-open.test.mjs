import test from 'node:test';
import assert from 'node:assert/strict';

import { buildQuickOpenMatches } from '../src/utils/fileQuickOpen.js';

const files = [
    { id: 'a', language: 'jsx', name: 'App.jsx', path: 'src/App.jsx', role: 'entry' },
    { id: 'b', language: 'jsx', name: 'Button.jsx', path: 'src/components/Button.jsx', role: '' },
    { id: 'c', language: 'css', name: 'styles.css', path: 'src/styles/styles.css', role: 'style' },
    { id: 'd', language: 'json', name: 'palette.json', path: 'src/data/palette.json', role: 'data' },
];

test('quick open preserves original order when query is empty', () => {
    const matches = buildQuickOpenMatches(files, '');
    assert.deepEqual(matches.map((file) => file.id), ['a', 'b', 'c', 'd']);
});

test('quick open prioritizes exact and prefix matches on file name and path', () => {
    const matches = buildQuickOpenMatches(files, 'app');
    assert.deepEqual(matches.map((file) => file.id), ['a']);
});

test('quick open matches by multiple tokens across path and role', () => {
    const matches = buildQuickOpenMatches(files, 'style css');
    assert.deepEqual(matches.map((file) => file.id), ['c']);
});

test('quick open can match nested path segments', () => {
    const matches = buildQuickOpenMatches(files, 'components button');
    assert.deepEqual(matches.map((file) => file.id), ['b']);
});

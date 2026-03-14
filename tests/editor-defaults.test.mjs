import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';

import {
    readClipboardDefaultState,
    readVimDefaultState,
    writeClipboardDefaultState,
    writeVimDefaultState,
} from '../src/utils/editorDefaults.js';

test('vim default state falls back to enabled when .vim_enable is missing', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'learncode-vim-default-'));
    const filePath = path.join(tempDir, '.vim_enable');

    assert.deepEqual(readVimDefaultState(filePath), { enabled: true });

    fs.rmSync(tempDir, { recursive: true, force: true });
});

test('vim default state persists to .vim_enable', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'learncode-vim-default-'));
    const filePath = path.join(tempDir, '.vim_enable');

    assert.deepEqual(writeVimDefaultState(filePath, false), { enabled: false });
    assert.equal(fs.readFileSync(filePath, 'utf-8'), '0\n');
    assert.deepEqual(readVimDefaultState(filePath), { enabled: false });

    assert.deepEqual(writeVimDefaultState(filePath, true), { enabled: true });
    assert.equal(fs.readFileSync(filePath, 'utf-8'), '1\n');
    assert.deepEqual(readVimDefaultState(filePath), { enabled: true });

    fs.rmSync(tempDir, { recursive: true, force: true });
});

test('clipboard default state persists to .clipboard_default', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'learncode-clipboard-default-'));
    const filePath = path.join(tempDir, '.clipboard_default');

    assert.deepEqual(readClipboardDefaultState(filePath), { enabled: true });
    assert.deepEqual(writeClipboardDefaultState(filePath, false), { enabled: false });
    assert.equal(fs.readFileSync(filePath, 'utf-8'), '0\n');
    assert.deepEqual(readClipboardDefaultState(filePath), { enabled: false });

    assert.deepEqual(writeClipboardDefaultState(filePath, true), { enabled: true });
    assert.equal(fs.readFileSync(filePath, 'utf-8'), '1\n');
    assert.deepEqual(readClipboardDefaultState(filePath), { enabled: true });

    fs.rmSync(tempDir, { recursive: true, force: true });
});

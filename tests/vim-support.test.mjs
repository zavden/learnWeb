import test from 'node:test';
import assert from 'node:assert/strict';

import { Vim } from '@replit/codemirror-vim';
import {
    getVimModeLabelFromEvent,
    getVimModeLabelFromState,
    installSystemClipboardBridge,
    normalizeClipboardText,
    resolveVimLeaderAction,
    setSystemClipboardEnabled,
} from '../src/editor/vimSupport.js';

test('derives toolbar labels from vim state snapshots', () => {
    assert.equal(getVimModeLabelFromState(null, false), 'NORMAL');
    assert.equal(getVimModeLabelFromState({ insertMode: true }, false), 'INSERT');
    assert.equal(getVimModeLabelFromState({ insertMode: true }, true), 'REPLACE');
    assert.equal(getVimModeLabelFromState({ visualMode: true, visualLine: true }, false), 'VISUAL LINE');
    assert.equal(getVimModeLabelFromState({ visualMode: true, visualBlock: true }, false), 'VISUAL BLOCK');
    assert.equal(getVimModeLabelFromState({ mode: 'visual' }, false), 'VISUAL');
    assert.equal(getVimModeLabelFromState({ mode: 'normal' }, false), 'NORMAL');
});

test('derives toolbar labels from vim mode change events', () => {
    assert.equal(getVimModeLabelFromEvent({ mode: 'insert' }), 'INSERT');
    assert.equal(getVimModeLabelFromEvent({ mode: 'replace' }), 'REPLACE');
    assert.equal(getVimModeLabelFromEvent({ mode: 'visual', subMode: 'linewise' }), 'VISUAL LINE');
    assert.equal(getVimModeLabelFromEvent({ mode: 'visual', subMode: 'blockwise' }), 'VISUAL BLOCK');
    assert.equal(getVimModeLabelFromEvent({ mode: 'visual' }), 'VISUAL');
    assert.equal(getVimModeLabelFromEvent({ mode: 'normal' }), 'NORMAL');
});

test('normalizes clipboard values defensively', () => {
    assert.equal(normalizeClipboardText('hello'), 'hello');
    assert.equal(normalizeClipboardText(42), '42');
    assert.equal(normalizeClipboardText(null), '');
});

test('resolves single and double leader actions for vim helpers', () => {
    assert.equal(resolveVimLeaderAction(1, 'e'), 'toggleSidebar');
    assert.equal(resolveVimLeaderAction(1, 'H'), 'clearSearchHighlight');
    assert.equal(resolveVimLeaderAction(1, 'm'), 'centerWorkspace');
    assert.equal(resolveVimLeaderAction(2, 'p'), 'toggleShaderPause');
    assert.equal(resolveVimLeaderAction(2, 'c'), 'openShaderControls');
    assert.equal(resolveVimLeaderAction(2, 'u'), 'openShaderUniforms');
    assert.equal(resolveVimLeaderAction(2, 't'), 'openShaderTextures');
    assert.equal(resolveVimLeaderAction(2, 's'), 'openShaderPanel');
    assert.equal(resolveVimLeaderAction(2, 'r'), 'resetShaderRuntime');
    assert.equal(resolveVimLeaderAction(2, 'S'), null);
    assert.equal(resolveVimLeaderAction(0, 'e'), null);
});

test('clipboard bridge can fall back to local shadow clipboard when disabled', async () => {
    const originalNavigator = globalThis.navigator;
    const writes = [];
    let currentClipboardText = 'system-value';

    Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: {
            clipboard: {
                async readText() {
                    return currentClipboardText;
                },
                async writeText(value) {
                    writes.push(value);
                    currentClipboardText = value;
                },
            },
        },
    });

    try {
        assert.equal(installSystemClipboardBridge(), true);

        setSystemClipboardEnabled(false);
        await globalThis.navigator.clipboard.writeText('shadow-only');
        assert.deepEqual(writes, []);
        assert.equal(await globalThis.navigator.clipboard.readText(), 'shadow-only');

        setSystemClipboardEnabled(true);
        const registerController = Vim.getRegisterController();
        registerController.unnamedRegister.setText('visual-word');
        assert.equal(registerController.getRegister('+').toString(), 'visual-word');
        assert.equal(await globalThis.navigator.clipboard.readText(), 'visual-word');

        await globalThis.navigator.clipboard.writeText('real-system');
        assert.deepEqual(writes, ['visual-word', 'real-system']);
        assert.equal(await globalThis.navigator.clipboard.readText(), 'real-system');
    } finally {
        Object.defineProperty(globalThis, 'navigator', {
            configurable: true,
            value: originalNavigator,
        });
        setSystemClipboardEnabled(true);
    }
});

import test from 'node:test';
import assert from 'node:assert/strict';

import { Vim } from '@replit/codemirror-vim';
import {
    getVimModeLabelFromEvent,
    getVimModeLabelFromState,
    installSystemClipboardBridge,
    normalizeClipboardText,
    resolveVimLeaderAction,
    resolveVimShiftAction,
    setSystemClipboardEnabled,
} from '../src/editor/vimSupport.js';
import {
    getVimShortcutSections,
    loadVimShortcutConfig,
    parseVimShortcutConfigYaml,
} from '../src/editor/vimShortcutConfig.js';

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
    assert.equal(resolveVimLeaderAction({ stage: 1, key: 'e', layoutMode: 'tabs' }), 'toggleSidebar');
    assert.equal(resolveVimLeaderAction({ stage: 1, key: 'h', layoutMode: 'tabs' }), 'clearSearchHighlight');
    assert.equal(resolveVimLeaderAction({ stage: 1, key: 'm', layoutMode: 'tabs' }), 'centerWorkspace');
    assert.equal(resolveVimLeaderAction({ stage: 1, key: 'v', layoutMode: 'panels' }), 'normalizePanels');
    assert.equal(resolveVimLeaderAction({ stage: 1, key: 'c', layoutMode: 'panels' }), 'toggleActivePanelCollapse');
    assert.equal(resolveVimLeaderAction({ stage: 1, key: 'x', layoutMode: 'panels' }), 'toggleActivePanelMaximize');
    assert.equal(resolveVimLeaderAction({ stage: 1, key: 'a', layoutMode: 'panels' }), 'autoFitPanels');
    assert.equal(resolveVimLeaderAction({ stage: 2, key: 'p', shaderDocument: true }), 'toggleShaderPause');
    assert.equal(resolveVimLeaderAction({ stage: 2, key: 'c', shaderDocument: true }), 'openShaderControls');
    assert.equal(resolveVimLeaderAction({ stage: 2, key: 'u', shaderDocument: true }), 'openShaderUniforms');
    assert.equal(resolveVimLeaderAction({ stage: 2, key: 't', shaderDocument: true }), 'openShaderTextures');
    assert.equal(resolveVimLeaderAction({ stage: 2, key: 'n', shaderDocument: false }), 'openShortcutHelp');
    assert.equal(resolveVimLeaderAction({ stage: 2, key: 'v', shaderDocument: false }), 'toggleEditorLayout');
    assert.equal(resolveVimLeaderAction({ stage: 2, key: 's', shaderDocument: true }), 'openShaderPanel');
    assert.equal(resolveVimLeaderAction({ stage: 2, key: 'r', shaderDocument: true }), 'resetShaderRuntime');
    assert.equal(resolveVimLeaderAction({ stage: 2, key: 'S', shaderDocument: true }), null);
    assert.equal(resolveVimLeaderAction({ stage: 0, key: 'e' }), null);
});

test('resolves shift shortcuts contextually for tabs and panels', () => {
    assert.equal(resolveVimShiftAction({ key: 'H', panelsLayout: false }), 'previousTab');
    assert.equal(resolveVimShiftAction({ key: 'L', panelsLayout: false }), 'nextTab');
    assert.equal(resolveVimShiftAction({ key: 'J', panelsLayout: false }), 'openFilePicker');
    assert.equal(resolveVimShiftAction({ key: 'K', panelsLayout: false }), 'toggleAutoRender');

    assert.equal(resolveVimShiftAction({ key: 'H', panelsLayout: true }), 'openFilePicker');
    assert.equal(resolveVimShiftAction({ key: 'L', panelsLayout: true }), 'toggleAutoRender');
    assert.equal(resolveVimShiftAction({ key: 'J', panelsLayout: true }), 'movePanelDown');
    assert.equal(resolveVimShiftAction({ key: 'K', panelsLayout: true }), 'movePanelUp');

    assert.equal(resolveVimShiftAction({ key: 'C', panelsLayout: false }), 'toggleConsole');
    assert.equal(resolveVimShiftAction({ key: 'C', panelsLayout: true }), 'toggleConsole');
    assert.equal(resolveVimShiftAction({ key: 'X', panelsLayout: false }), 'togglePreviewHeader');
    assert.equal(resolveVimShiftAction({ key: 'X', panelsLayout: true }), 'togglePreviewHeader');
    assert.equal(resolveVimShiftAction({ key: 'S', panelsLayout: false }), 'quickSave');
    assert.equal(resolveVimShiftAction({ key: 'S', panelsLayout: true }), 'quickSave');
    assert.equal(resolveVimShiftAction({ key: 'Z', panelsLayout: true }), null);
});

test('vim shortcut YAML can override defaults for tabs, panels and shaders', () => {
    const config = parseVimShortcutConfigYaml(`
global:
  leader:
    toggleSidebar: o
tabs:
  shift:
    previousTab: A
panels:
  shift:
    movePanelDown: N
shaders:
  leader2:
    toggleShaderPause: q
`);

    assert.equal(resolveVimLeaderAction({ stage: 1, key: 'o', layoutMode: 'tabs', config }), 'toggleSidebar');
    assert.equal(resolveVimShiftAction({ key: 'A', panelsLayout: false, config }), 'previousTab');
    assert.equal(resolveVimShiftAction({ key: 'N', panelsLayout: true, config }), 'movePanelDown');
    assert.equal(resolveVimLeaderAction({ stage: 2, key: 'q', shaderDocument: true, config }), 'toggleShaderPause');
});

test('invalid vim shortcut YAML falls back to default config', () => {
    const state = loadVimShortcutConfig(`
global:
  leader:
    toggleSidebar: m
`);

    assert.equal(state.source, 'default');
    assert.ok(state.warnings.length > 0);
    assert.equal(resolveVimLeaderAction({ stage: 1, key: 'e', layoutMode: 'tabs', config: state.config }), 'toggleSidebar');
    assert.equal(resolveVimLeaderAction({ stage: 1, key: 'm', layoutMode: 'tabs', config: state.config }), 'centerWorkspace');
});

test('shortcut help sections are derived from the active shortcut config', () => {
    const config = parseVimShortcutConfigYaml(`
global:
  shift:
    quickSave: W
shaders:
  leader2:
    openShaderPanel: z
`);

    const sections = getVimShortcutSections({
        layoutMode: 'panels',
        shaderDocument: true,
        config,
    });

    assert.equal(sections[0].title, 'General');
    assert.ok(sections[0].items.some((item) => item.key === 'Shift+W' && /Save the current document/.test(item.description)));
    assert.ok(sections[2].items.some((item) => item.key === 'Space, Space, z' && /shader runtime panel/.test(item.description)));
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

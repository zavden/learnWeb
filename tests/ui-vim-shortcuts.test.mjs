import test from 'node:test';
import assert from 'node:assert/strict';

import {
    isVimAwaitingInput,
    resolvePanelFocusDirection,
} from '../src/editor/vimSupport.js';
import {
    getDefaultVimShortcutConfig,
    loadVimShortcutConfig,
} from '../src/editor/vimShortcutConfig.js';
import { parseSimpleYamlObject, stripYamlInlineComment } from '../src/editor/vim/yamlParser.js';

test('vim pending-input detection lets f/r/t/operators keep their next key', () => {
    assert.equal(isVimAwaitingInput(null), false);
    assert.equal(isVimAwaitingInput({ insertMode: false, inputState: { keyBuffer: [], operator: null } }), false);
    // `f` typed, waiting for the target character (e.g. `f<Space>` or `fL`).
    assert.equal(isVimAwaitingInput({ insertMode: false, inputState: { keyBuffer: ['f'], operator: null } }), true);
    // `d` typed, waiting for a motion (e.g. `dH`).
    assert.equal(isVimAwaitingInput({ insertMode: false, inputState: { keyBuffer: [], operator: 'delete' } }), true);
    // Insert mode never counts as pending normal-mode input.
    assert.equal(isVimAwaitingInput({ insertMode: true, inputState: { keyBuffer: ['f'] } }), false);
});

test('panel focus keys follow the configured movePanelDown/movePanelUp tokens', () => {
    const defaults = getDefaultVimShortcutConfig();
    assert.equal(resolvePanelFocusDirection('J', defaults), 'down');
    assert.equal(resolvePanelFocusDirection('K', defaults), 'up');
    assert.equal(resolvePanelFocusDirection('L', defaults), '');

    const remapped = loadVimShortcutConfig('panels:\n  shift:\n    movePanelDown: N\n    movePanelUp: M\n');
    assert.equal(remapped.source, 'file');
    assert.equal(resolvePanelFocusDirection('N', remapped.config), 'down');
    assert.equal(resolvePanelFocusDirection('M', remapped.config), 'up');
    // The old hard-coded keys no longer move focus once remapped.
    assert.equal(resolvePanelFocusDirection('J', remapped.config), '');
    assert.equal(resolvePanelFocusDirection('K', remapped.config), '');
});

test('yaml parser supports inline comments but keeps quoted hashes', () => {
    assert.equal(stripYamlInlineComment('    toggleSidebar: e   # sidebar'), '    toggleSidebar: e');
    assert.equal(stripYamlInlineComment('    toggleSidebar: "#"  # quoted'), '    toggleSidebar: "#"');
    assert.equal(stripYamlInlineComment("    toggleSidebar: '#'"), "    toggleSidebar: '#'");
    assert.equal(stripYamlInlineComment('    key: a#b'), '    key: a#b');

    assert.deepEqual(
        parseSimpleYamlObject('global:   # context\n  leader:\n    toggleSidebar: q # comment\n'),
        { global: { leader: { toggleSidebar: 'q' } } },
    );

    const result = loadVimShortcutConfig('global:\n  leader:\n    toggleSidebar: q  # open tree\n');
    assert.equal(result.source, 'file');
    assert.deepEqual(result.warnings, []);
    assert.equal(result.config.global.leader.toggleSidebar, 'q');
});

test('shift shortcuts must be letters so they can actually fire', () => {
    const digit = loadVimShortcutConfig('tabs:\n  shift:\n    nextTab: 1\n');
    assert.equal(digit.source, 'default');
    assert.match(digit.warnings[0], /must be a letter/);

    const lower = loadVimShortcutConfig('tabs:\n  shift:\n    nextTab: n\n');
    assert.equal(lower.source, 'file');
    assert.equal(lower.config.tabs.shift.nextTab, 'N');
});

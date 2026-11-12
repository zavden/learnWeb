// Vim mode for the editor, on top of @replit/codemirror-vim (6.3.0, see node_modules/@replit/codemirror-vim/package.json).
//
// - `createVimExtension()` is the CodeMirror extension (plus one-time setup: `:w` / `:update` ex commands
//   and the clipboard register bridge).
// - `bindVimView(view, bindings)` connects one editor view to the app: mode label updates, `:w`, and the
//   configurable app shortcuts (Shift+letter, Space / Space Space leader sequences, see
//   src/editor/vimShortcutConfig.ts). It listens to `keydown` on the view DOM in the CAPTURE phase so it
//   runs before Vim's own key handling, and returns a cleanup function.
// - Pure helpers (mode labels, pending-input detection, panel focus keys) are exported for tests.
//
// Used by src/components/Editor.ts (one `bindVimView` per editor view; `bindings` are its callbacks).
// This module also re-exports the shortcut-config and clipboard helpers so the editor has one import.
//
// Gotcha: while Vim is collecting a multi-key command (`f`, `r`, an operator, a count…) the next key
// belongs to Vim, so app shortcuts are skipped (`isVimAwaitingInput`).

import type { EditorView } from '@codemirror/view';
import type { EditorState, Extension } from '@codemirror/state';
import { type CodeMirror, type CodeMirrorV, type vimState, Vim, getCM, vim } from '@replit/codemirror-vim';
import {
    type VimShortcutConfig,
    getDefaultVimShortcutConfig,
    resolveVimLeaderAction,
    resolveVimShiftAction,
} from './vimShortcutConfig.ts';
import { installRegisterControllerBridge } from './vim/clipboardBridge.ts';

export type {
    LoadedVimShortcutConfig,
    VimLeaderAction,
    VimShiftAction,
    VimShortcutConfig,
    VimShortcutHelpItem,
    VimShortcutHelpSection,
    VimShortcutLayout,
} from './vimShortcutConfig.ts';

export {
    getDefaultVimShortcutConfig,
    getVimShortcutSections,
    resolveVimLeaderAction,
    resolveVimShiftAction,
} from './vimShortcutConfig.ts';

export {
    normalizeClipboardText,
    isSystemClipboardApiAvailable,
    installSystemClipboardBridge,
    setSystemClipboardEnabled,
    syncSystemClipboardRegister,
} from './vim/clipboardBridge.ts';

/** The mode name shown in the editor toolbar (and set as `data-vim-mode` on the editor element). */
export type VimModeLabel = 'NORMAL' | 'INSERT' | 'REPLACE' | 'VISUAL' | 'VISUAL LINE' | 'VISUAL BLOCK';

/** The fields of Vim's per-editor state that decide the mode label (all optional so tests can pass snapshots). */
export type VimModeSnapshot = Partial<
    Pick<vimState, 'insertMode' | 'visualBlock' | 'visualLine' | 'visualMode' | 'mode'>
>;

/**
 * The payload of the `vim-mode-change` event of @replit/codemirror-vim: `mode` is `normal`, `insert`,
 * `replace` or `visual`; `subMode` (visual only) is `linewise`, `blockwise` or `''`.
 */
export interface VimModeChangeEvent {
    mode?: string;
    subMode?: string;
}

/**
 * The fields of Vim's per-editor state that tell whether a multi-key command is in progress. `keyBuffer`
 * also accepts a string because older versions of the library kept the pending keys as one.
 */
export interface VimInputSnapshot {
    insertMode?: boolean;
    inputState?: {
        keyBuffer?: readonly string[] | string | null;
        operator?: string | null;
    } | null;
}

/** The direction of a panel-focus shortcut (Panels layout). */
export type PanelFocusDirection = 'up' | 'down';

// `:w` / `:update` handlers by Vim adapter (one per bound view).
const vimWriteHandlers = new WeakMap<CodeMirror, () => void>();
let exCommandsRegistered = false;

// Ex commands are global to the Vim library, so they are registered once and dispatch per editor.
function ensureVimExCommandsRegistered(): void {
    if (exCommandsRegistered) return;

    Vim.defineEx('write', 'w', (cm) => {
        const handler = vimWriteHandlers.get(cm);
        if (handler) {
            handler();
        }
    });

    Vim.defineEx('update', 'up', (cm) => {
        const handler = vimWriteHandlers.get(cm);
        if (handler) {
            handler();
        }
    });

    exCommandsRegistered = true;
}

/** The mode label for a Vim state snapshot; `overwrite` (CodeMirror's overwrite flag) turns INSERT into REPLACE. */
export function getVimModeLabelFromState(
    vimState: VimModeSnapshot | null | undefined = null,
    overwrite: boolean = false,
): VimModeLabel {
    if (!vimState) return 'NORMAL';
    if (vimState.insertMode && overwrite) return 'REPLACE';
    if (vimState.insertMode) return 'INSERT';
    if (vimState.visualBlock) return 'VISUAL BLOCK';
    if (vimState.visualLine) return 'VISUAL LINE';
    if (vimState.visualMode) return 'VISUAL';

    const mode = String(vimState.mode || 'normal')
        .trim()
        .toLowerCase();
    switch (mode) {
        case 'insert':
            return 'INSERT';
        case 'replace':
            return 'REPLACE';
        case 'visual':
            return 'VISUAL';
        default:
            return 'NORMAL';
    }
}

/** The mode label for a `vim-mode-change` event. */
export function getVimModeLabelFromEvent(event: VimModeChangeEvent | null | undefined = {}): VimModeLabel {
    const mode = String(event?.mode || 'normal')
        .trim()
        .toLowerCase();
    const subMode = String(event?.subMode || '')
        .trim()
        .toLowerCase();

    if (mode === 'insert') return 'INSERT';
    if (mode === 'replace') return 'REPLACE';
    if (mode === 'visual') {
        if (subMode === 'linewise') return 'VISUAL LINE';
        if (subMode === 'blockwise') return 'VISUAL BLOCK';
        return 'VISUAL';
    }

    return 'NORMAL';
}

/**
 * True while Vim is collecting a multi-key command (e.g. `f`, `r`, `t`, `m`,
 * a register prefix, a count, or an operator waiting for its motion). In that
 * state the next key belongs to Vim, so app shortcuts must not intercept it.
 */
export function isVimAwaitingInput(vimState: VimInputSnapshot | null | undefined = null): boolean {
    if (!vimState || vimState.insertMode) return false;

    const inputState = vimState.inputState || null;
    if (!inputState) return false;

    const keyBuffer = inputState.keyBuffer;
    const hasBufferedKeys = Array.isArray(keyBuffer)
        ? keyBuffer.length > 0
        : Boolean(keyBuffer && String(keyBuffer).length > 0);

    return hasBufferedKeys || Boolean(inputState.operator);
}

/** `down` / `up` when `key` is the configured `panels.shift.movePanelDown` / `movePanelUp` token, else `''`. */
export function resolvePanelFocusDirection(
    key: string = '',
    config: Readonly<VimShortcutConfig> | null | undefined = null,
): PanelFocusDirection | '' {
    const panelShift: Partial<VimShortcutConfig['panels']['shift']> = config?.panels?.shift || {};
    const normalizedKey = String(key || '');
    if (!normalizedKey) return '';
    if (normalizedKey === String(panelShift.movePanelDown || '')) return 'down';
    if (normalizedKey === String(panelShift.movePanelUp || '')) return 'up';
    return '';
}

/** The Vim keymap extension for a new editor state (registers the ex commands and register bridge on first use). */
export function createVimExtension(): Extension {
    ensureVimExCommandsRegistered();
    installRegisterControllerBridge();
    return vim();
}

/**
 * What `bindVimView` needs from the editor. Every member is optional; a missing callback means the
 * shortcut does nothing and the key falls through to Vim (except leader sequences, which are always
 * consumed once matched).
 */
export interface VimViewBindings {
    /** Whether the editor shows the Panels layout (picks the `panels` shortcuts instead of `tabs`). */
    isPanelsLayout?: () => boolean;
    /** Whether the open document is a shader (enables the `shaders` shortcuts). */
    isShaderDocument?: () => boolean;
    /** The current shortcut config; a falsy result means the defaults. Read at every key press. */
    getShortcutConfig?: () => Readonly<VimShortcutConfig> | null | undefined;
    /** Called with the initial label at bind time and on every Vim mode change. */
    onModeChange?: (modeLabel: VimModeLabel) => void;
    /** The `quickSave` shortcut. Return `false` to let the key reach Vim; anything else consumes it. */
    onQuickSave?: () => boolean | void;
    /** The `:w` / `:update` ex commands of this view. */
    onWrite?: () => void;
    onToggleAutoRender?: () => void;
    onPreviousTab?: () => void;
    onNextTab?: () => void;
    onOpenFilePicker?: () => void;
    onToggleSidebar?: () => void;
    onCenterWorkspace?: () => void;
    onToggleActivePanelCollapse?: () => void;
    onToggleActivePanelMaximize?: () => void;
    onAutoFitPanels?: () => void;
    onNormalizePanels?: () => void;
    /** The `toggleConsole` shortcut. Return a truthy value when it acted; otherwise the key reaches Vim. */
    onToggleConsole?: () => unknown;
    onToggleShaderPause?: () => void;
    onOpenShaderControls?: () => void;
    onOpenShaderUniforms?: () => void;
    onOpenShaderTextures?: () => void;
    onOpenShaderPanel?: () => void;
    onResetShaderRuntime?: () => void;
    onOpenShortcutHelp?: () => void;
    onToggleEditorLayout?: () => void;
    onTogglePreviewHeader?: () => void;
    /** Panels layout only: the configured `movePanelDown` / `movePanelUp` key was pressed (always consumed). */
    onMovePanelFocus?: (direction: PanelFocusDirection) => void;
}

/** Removes everything `bindVimView` attached to its view. Call it before destroying the view. */
export type VimViewCleanup = () => void;

/**
 * Connects an editor view that has the Vim extension to the app (see {@link VimViewBindings}). Returns a
 * no-op cleanup when the view has no Vim adapter. In normal mode a plain Space never reaches Vim: it
 * starts (or advances) a leader sequence, which times out after 900 ms.
 */
export function bindVimView(
    view: EditorView,
    {
        isPanelsLayout,
        isShaderDocument,
        getShortcutConfig,
        onModeChange,
        onQuickSave,
        onWrite,
        onToggleAutoRender,
        onPreviousTab,
        onNextTab,
        onOpenFilePicker,
        onToggleSidebar,
        onCenterWorkspace,
        onToggleActivePanelCollapse,
        onToggleActivePanelMaximize,
        onAutoFitPanels,
        onNormalizePanels,
        onToggleConsole,
        onToggleShaderPause,
        onOpenShaderControls,
        onOpenShaderUniforms,
        onOpenShaderTextures,
        onOpenShaderPanel,
        onResetShaderRuntime,
        onOpenShortcutHelp,
        onToggleEditorLayout,
        onTogglePreviewHeader,
        onMovePanelFocus,
    }: VimViewBindings = {},
): VimViewCleanup {
    ensureVimExCommandsRegistered();

    const cm = getCM(view);
    if (!cm) {
        return () => {};
    }

    // 0 = idle, 1 = after Space, 2 = after Space, Space.
    let leaderStage = 0;
    let leaderTimeoutId: number | null = null;

    const clearLeaderPending = (): void => {
        leaderStage = 0;
        if (leaderTimeoutId) {
            window.clearTimeout(leaderTimeoutId);
            leaderTimeoutId = null;
        }
    };

    const armLeaderPending = (stage: number = 1): void => {
        clearLeaderPending();
        leaderStage = stage;
        leaderTimeoutId = window.setTimeout(() => {
            clearLeaderPending();
        }, 900);
    };

    if (typeof onWrite === 'function') {
        vimWriteHandlers.set(cm, onWrite);
    }

    const handleModeChange = (event: VimModeChangeEvent): void => {
        if (typeof onModeChange === 'function') {
            onModeChange(getVimModeLabelFromEvent(event));
        }
    };

    if (typeof cm.on === 'function') {
        cm.on('vim-mode-change', handleModeChange);
    }

    if (typeof onModeChange === 'function') {
        // EditorState has no `overwrite` property, so this is always undefined (the label starts as
        // NORMAL/INSERT, never REPLACE); kept as it was. Vim's own flag is `cm.state.overwrite`.
        onModeChange(
            getVimModeLabelFromState(cm.state?.vim, (view.state as EditorState & { overwrite?: boolean }).overwrite),
        );
    }

    // Shift+letter shortcuts (and panel focus keys).
    const handleKeydown = (event: KeyboardEvent): void => {
        if (leaderStage !== 0) return;
        if (cm.state?.vim?.insertMode) return;
        if (isVimAwaitingInput(cm.state?.vim)) return;
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

        const panelsLayout = typeof isPanelsLayout === 'function' ? Boolean(isPanelsLayout()) : false;
        const shortcutConfig =
            typeof getShortcutConfig === 'function'
                ? getShortcutConfig() || getDefaultVimShortcutConfig()
                : getDefaultVimShortcutConfig();

        if (
            panelsLayout &&
            event.shiftKey &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey &&
            typeof onMovePanelFocus === 'function'
        ) {
            const direction = resolvePanelFocusDirection(event.key, shortcutConfig);

            if (direction) {
                // Always consume the configured panel-navigation key so Vim's
                // native command for it (e.g. `J` = join lines) never runs by surprise.
                event.preventDefault();
                event.stopPropagation();
                onMovePanelFocus(direction);
                return;
            }
        }

        if (!event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;
        const shiftAction = resolveVimShiftAction({
            key: event.key,
            panelsLayout,
            config: shortcutConfig,
        });

        switch (shiftAction) {
            case 'previousTab':
                if (typeof onPreviousTab === 'function') {
                    event.preventDefault();
                    event.stopPropagation();
                    onPreviousTab();
                }
                return;
            case 'nextTab':
                if (typeof onNextTab === 'function') {
                    event.preventDefault();
                    event.stopPropagation();
                    onNextTab();
                }
                return;
            case 'openFilePicker':
                if (typeof onOpenFilePicker === 'function') {
                    event.preventDefault();
                    event.stopPropagation();
                    onOpenFilePicker();
                }
                return;
            case 'toggleAutoRender':
                if (typeof onToggleAutoRender === 'function') {
                    event.preventDefault();
                    event.stopPropagation();
                    onToggleAutoRender();
                }
                return;
            case 'toggleConsole':
                if (typeof onToggleConsole === 'function') {
                    const consumed = onToggleConsole();
                    if (consumed) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
                return;
            case 'togglePreviewHeader':
                if (typeof onTogglePreviewHeader === 'function') {
                    event.preventDefault();
                    event.stopPropagation();
                    onTogglePreviewHeader();
                }
                return;
            case 'quickSave':
                if (typeof onQuickSave === 'function') {
                    const handled = onQuickSave();
                    if (handled === false) return;
                    event.preventDefault();
                    event.stopPropagation();
                }
                return;
            default:
                return;
        }
    };

    // Space / Space, Space leader sequences.
    const handleLeaderKeydown = (event: KeyboardEvent): void => {
        if (cm.state?.vim?.insertMode) {
            clearLeaderPending();
            return;
        }

        if (leaderStage === 0 && isVimAwaitingInput(cm.state?.vim)) {
            // e.g. `f<Space>`, `r<Space>`: the space is Vim's argument, not the leader.
            return;
        }

        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
            clearLeaderPending();
            return;
        }

        if (event.ctrlKey || event.metaKey || event.altKey) {
            clearLeaderPending();
            return;
        }

        const isSpaceKey = event.code === 'Space' || event.key === ' ';
        if (isSpaceKey && !event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
            armLeaderPending(leaderStage === 1 ? 2 : 1);
            return;
        }

        if (leaderStage === 0) {
            return;
        }

        const shortcutConfig =
            typeof getShortcutConfig === 'function'
                ? getShortcutConfig() || getDefaultVimShortcutConfig()
                : getDefaultVimShortcutConfig();
        const action = resolveVimLeaderAction({
            stage: leaderStage,
            key: event.key,
            layoutMode: typeof isPanelsLayout === 'function' && isPanelsLayout() ? 'panels' : 'tabs',
            shaderDocument: typeof isShaderDocument === 'function' ? Boolean(isShaderDocument()) : false,
            config: shortcutConfig,
        });
        clearLeaderPending();

        if (!action) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        switch (action) {
            case 'toggleSidebar':
                onToggleSidebar?.();
                return;
            case 'clearSearchHighlight':
                // getCM() found the Vim adapter, so the vim() extension is active and its state exists.
                Vim.handleEx(cm as CodeMirrorV, 'noh');
                return;
            case 'centerWorkspace':
                onCenterWorkspace?.();
                return;
            case 'normalizePanels':
                onNormalizePanels?.();
                return;
            case 'toggleActivePanelCollapse':
                onToggleActivePanelCollapse?.();
                return;
            case 'toggleActivePanelMaximize':
                onToggleActivePanelMaximize?.();
                return;
            case 'autoFitPanels':
                onAutoFitPanels?.();
                return;
            case 'toggleShaderPause':
                onToggleShaderPause?.();
                return;
            case 'openShaderControls':
                onOpenShaderControls?.();
                return;
            case 'openShaderUniforms':
                onOpenShaderUniforms?.();
                return;
            case 'openShaderTextures':
                onOpenShaderTextures?.();
                return;
            case 'toggleEditorLayout':
                onToggleEditorLayout?.();
                return;
            case 'openShortcutHelp':
                onOpenShortcutHelp?.();
                return;
            case 'openShaderPanel':
                onOpenShaderPanel?.();
                return;
            case 'resetShaderRuntime':
                onResetShaderRuntime?.();
                return;
            default:
                return;
        }
    };

    view.dom.addEventListener('keydown', handleKeydown, true);
    view.dom.addEventListener('keydown', handleLeaderKeydown, true);

    return () => {
        vimWriteHandlers.delete(cm);
        clearLeaderPending();
        view.dom.removeEventListener('keydown', handleKeydown, true);
        view.dom.removeEventListener('keydown', handleLeaderKeydown, true);
        if (typeof cm.off === 'function') {
            cm.off('vim-mode-change', handleModeChange);
        }
    };
}

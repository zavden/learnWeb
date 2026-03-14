import { Vim, getCM, vim } from '@replit/codemirror-vim';
import {
    getDefaultVimShortcutConfig,
    getVimShortcutSections,
    resolveVimLeaderAction,
    resolveVimShiftAction,
} from './vimShortcutConfig.js';
import {
    installRegisterControllerBridge,
} from './vim/clipboardBridge.js';

export {
    getDefaultVimShortcutConfig,
    getVimShortcutSections,
    resolveVimLeaderAction,
    resolveVimShiftAction,
} from './vimShortcutConfig.js';

export {
    normalizeClipboardText,
    isSystemClipboardApiAvailable,
    installSystemClipboardBridge,
    setSystemClipboardEnabled,
    syncSystemClipboardRegister,
} from './vim/clipboardBridge.js';

const vimWriteHandlers = new WeakMap();
let exCommandsRegistered = false;

function ensureVimExCommandsRegistered() {
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

export function getVimModeLabelFromState(vimState = null, overwrite = false) {
    if (!vimState) return 'NORMAL';
    if (vimState.insertMode && overwrite) return 'REPLACE';
    if (vimState.insertMode) return 'INSERT';
    if (vimState.visualBlock) return 'VISUAL BLOCK';
    if (vimState.visualLine) return 'VISUAL LINE';
    if (vimState.visualMode) return 'VISUAL';

    const mode = String(vimState.mode || 'normal').trim().toLowerCase();
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

export function getVimModeLabelFromEvent(event = {}) {
    const mode = String(event?.mode || 'normal').trim().toLowerCase();
    const subMode = String(event?.subMode || '').trim().toLowerCase();

    if (mode === 'insert') return 'INSERT';
    if (mode === 'replace') return 'REPLACE';
    if (mode === 'visual') {
        if (subMode === 'linewise') return 'VISUAL LINE';
        if (subMode === 'blockwise') return 'VISUAL BLOCK';
        return 'VISUAL';
    }

    return 'NORMAL';
}

export function createVimExtension() {
    ensureVimExCommandsRegistered();
    installRegisterControllerBridge();
    return vim();
}

export function bindVimView(view, {
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
} = {}) {
    ensureVimExCommandsRegistered();

    const cm = getCM(view);
    if (!cm) {
        return () => {};
    }

    let leaderStage = 0;
    let leaderTimeoutId = null;

    const clearLeaderPending = () => {
        leaderStage = 0;
        if (leaderTimeoutId) {
            window.clearTimeout(leaderTimeoutId);
            leaderTimeoutId = null;
        }
    };

    const armLeaderPending = (stage = 1) => {
        clearLeaderPending();
        leaderStage = stage;
        leaderTimeoutId = window.setTimeout(() => {
            clearLeaderPending();
        }, 900);
    };

    if (typeof onWrite === 'function') {
        vimWriteHandlers.set(cm, onWrite);
    }

    const handleModeChange = (event) => {
        if (typeof onModeChange === 'function') {
            onModeChange(getVimModeLabelFromEvent(event));
        }
    };

    if (typeof cm.on === 'function') {
        cm.on('vim-mode-change', handleModeChange);
    }

    if (typeof onModeChange === 'function') {
        onModeChange(getVimModeLabelFromState(cm.state?.vim, view.state.overwrite));
    }

    const handleKeydown = (event) => {
        if (leaderStage !== 0) return;
        if (cm.state?.vim?.insertMode) return;
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

        const panelsLayout = typeof isPanelsLayout === 'function' ? Boolean(isPanelsLayout()) : false;
        const shortcutConfig = typeof getShortcutConfig === 'function'
            ? (getShortcutConfig() || getDefaultVimShortcutConfig())
            : getDefaultVimShortcutConfig();

        if (
            panelsLayout
            && event.shiftKey
            && !event.ctrlKey
            && !event.metaKey
            && !event.altKey
            && typeof onMovePanelFocus === 'function'
        ) {
            let direction = '';
            if (event.key === 'J') direction = 'down';
            if (event.key === 'K') direction = 'up';

            if (direction) {
                const consumed = onMovePanelFocus(direction);
                if (consumed) {
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
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

    const handleLeaderKeydown = (event) => {
        if (cm.state?.vim?.insertMode) {
            clearLeaderPending();
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

        const shortcutConfig = typeof getShortcutConfig === 'function'
            ? (getShortcutConfig() || getDefaultVimShortcutConfig())
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
                Vim.handleEx(cm, 'noh');
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

import { Vim, getCM, vim } from '@replit/codemirror-vim';

const vimWriteHandlers = new WeakMap();
let exCommandsRegistered = false;
let clipboardBridgeInstalled = false;
let registerControllerBridgeInstalled = false;

const clipboardBridgeState = {
    enabled: true,
    originalReadText: null,
    originalWriteText: null,
    patchedClipboard: null,
    shadowText: '',
};

export function normalizeClipboardText(value) {
    return typeof value === 'string' ? value : String(value ?? '');
}

function getClipboardObject() {
    if (typeof navigator === 'undefined' || !navigator?.clipboard) {
        return null;
    }

    const { clipboard } = navigator;
    if (typeof clipboard.readText !== 'function' || typeof clipboard.writeText !== 'function') {
        return null;
    }

    return clipboard;
}

export function isSystemClipboardApiAvailable() {
    return Boolean(getClipboardObject());
}

function setClipboardMethod(target, key, value) {
    try {
        target[key] = value;
        if (target[key] === value) {
            return true;
        }
    } catch {
        // Fallback below.
    }

    try {
        Object.defineProperty(target, key, {
            configurable: true,
            writable: true,
            value,
        });
        return target[key] === value;
    } catch {
        return false;
    }
}

async function writeSystemClipboard(text) {
    clipboardBridgeState.shadowText = normalizeClipboardText(text);

    if (!clipboardBridgeState.enabled || typeof clipboardBridgeState.originalWriteText !== 'function') {
        return;
    }

    try {
        await clipboardBridgeState.originalWriteText(clipboardBridgeState.shadowText);
    } catch {
        // Ignore clipboard write failures and keep the shadow register value.
    }
}

async function readSystemClipboardSnapshot() {
    if (!clipboardBridgeState.enabled || typeof clipboardBridgeState.originalReadText !== 'function') {
        return {
            ok: false,
            text: clipboardBridgeState.shadowText,
        };
    }

    try {
        const text = normalizeClipboardText(await clipboardBridgeState.originalReadText());
        clipboardBridgeState.shadowText = text;
        return {
            ok: true,
            text,
        };
    } catch {
        return {
            ok: false,
            text: clipboardBridgeState.shadowText,
        };
    }
}

function syncPlusRegister(controller, text, linewise = false, blockwise = false) {
    if (!controller || typeof controller.getRegister !== 'function') {
        return;
    }

    const normalizedText = normalizeClipboardText(text);
    const plusRegister = controller.getRegister('+');
    if (plusRegister && typeof plusRegister.setText === 'function') {
        plusRegister.setText(normalizedText, linewise, blockwise);
    }

    if (controller.unnamedRegister && typeof controller.unnamedRegister.setText === 'function') {
        controller.unnamedRegister.setText(normalizedText, linewise, blockwise);
    }

    clipboardBridgeState.shadowText = normalizedText;
}

function installRegisterControllerBridge() {
    if (registerControllerBridgeInstalled || typeof Vim.getRegisterController !== 'function') {
        return;
    }

    const controller = Vim.getRegisterController();
    if (!controller || typeof controller.pushText !== 'function' || typeof controller.getRegister !== 'function') {
        return;
    }

    const originalPushText = controller.pushText.bind(controller);
    const originalGetRegister = controller.getRegister.bind(controller);
    const originalUnnamedSetText = controller.unnamedRegister?.setText?.bind(controller.unnamedRegister);

    if (typeof originalUnnamedSetText === 'function') {
        controller.unnamedRegister.setText = function patchedUnnamedSetText(text, linewise, blockwise) {
            originalUnnamedSetText(text, linewise, blockwise);

            const normalizedText = normalizeClipboardText(text);
            clipboardBridgeState.shadowText = normalizedText;

            if (!clipboardBridgeState.enabled) {
                return;
            }

            const plusRegister = originalGetRegister('+');
            if (plusRegister && plusRegister !== this && typeof plusRegister.setText === 'function') {
                plusRegister.setText(normalizedText, Boolean(linewise), Boolean(blockwise));
            }

            void writeSystemClipboard(normalizedText);
        };
    }

    controller.pushText = function patchedPushText(registerName, operator, text, linewise, blockwise) {
        const result = originalPushText(registerName, operator, text, linewise, blockwise);
        const normalizedRegister = typeof registerName === 'string' ? registerName.toLowerCase() : '';

        if (normalizedRegister === '_') {
            return result;
        }

        if (normalizedRegister === '+') {
            const plusRegister = originalGetRegister('+');
            clipboardBridgeState.shadowText = normalizeClipboardText(plusRegister?.toString?.() || text);
            return result;
        }
        return result;
    };

    controller.getRegister = function patchedGetRegister(name) {
        if (clipboardBridgeState.enabled && !this.isValidRegister(name)) {
            return originalGetRegister('+');
        }

        return originalGetRegister(name);
    };

    registerControllerBridgeInstalled = true;
}

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
    onModeChange,
    onWrite,
    onToggleAutoRender,
    onPreviousTab,
    onNextTab,
    onOpenFilePicker,
    onToggleSidebar,
    onCenterWorkspace,
} = {}) {
    ensureVimExCommandsRegistered();

    const cm = getCM(view);
    if (!cm) {
        return () => {};
    }

    let leaderPending = false;
    let leaderTimeoutId = null;

    const clearLeaderPending = () => {
        leaderPending = false;
        if (leaderTimeoutId) {
            window.clearTimeout(leaderTimeoutId);
            leaderTimeoutId = null;
        }
    };

    const armLeaderPending = () => {
        clearLeaderPending();
        leaderPending = true;
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
        if (!event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;
        if (cm.state?.vim?.insertMode) return;
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

        if (event.key === 'H' && typeof onPreviousTab === 'function') {
            event.preventDefault();
            event.stopPropagation();
            onPreviousTab();
            return;
        }

        if (event.key === 'L' && typeof onNextTab === 'function') {
            event.preventDefault();
            event.stopPropagation();
            onNextTab();
            return;
        }

        if (event.key === 'J' && typeof onOpenFilePicker === 'function') {
            event.preventDefault();
            event.stopPropagation();
            onOpenFilePicker();
            return;
        }

        if (event.key === 'K' && typeof onToggleAutoRender === 'function') {
            event.preventDefault();
            event.stopPropagation();
            onToggleAutoRender();
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
            armLeaderPending();
            return;
        }

        if (!leaderPending) {
            return;
        }

        clearLeaderPending();

        if ((event.key === 'e' || event.key === 'E') && typeof onToggleSidebar === 'function') {
            event.preventDefault();
            event.stopPropagation();
            onToggleSidebar();
            return;
        }

        if (event.key === 'h' || event.key === 'H') {
            event.preventDefault();
            event.stopPropagation();
            Vim.handleEx(cm, 'noh');
            return;
        }

        if ((event.key === 'm' || event.key === 'M') && typeof onCenterWorkspace === 'function') {
            event.preventDefault();
            event.stopPropagation();
            onCenterWorkspace();
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

export function installSystemClipboardBridge() {
    installRegisterControllerBridge();

    const clipboard = getClipboardObject();
    if (!clipboard) {
        return false;
    }

    if (clipboardBridgeInstalled && clipboardBridgeState.patchedClipboard === clipboard) {
        return true;
    }

    clipboardBridgeState.originalReadText = clipboard.readText.bind(clipboard);
    clipboardBridgeState.originalWriteText = clipboard.writeText.bind(clipboard);

    const patchedWriteText = async (value) => {
        await writeSystemClipboard(value);
    };

    const patchedReadText = async () => {
        const snapshot = await readSystemClipboardSnapshot();
        return snapshot.text;
    };

    const writePatched = setClipboardMethod(clipboard, 'writeText', patchedWriteText);
    const readPatched = setClipboardMethod(clipboard, 'readText', patchedReadText);

    clipboardBridgeInstalled = writePatched && readPatched;
    clipboardBridgeState.patchedClipboard = clipboardBridgeInstalled ? clipboard : null;
    return clipboardBridgeInstalled;
}

export function setSystemClipboardEnabled(enabled) {
    clipboardBridgeState.enabled = Boolean(enabled);
}

export async function syncSystemClipboardRegister() {
    installRegisterControllerBridge();

    if (!clipboardBridgeState.enabled || typeof Vim.getRegisterController !== 'function') {
        return false;
    }

    const controller = Vim.getRegisterController();
    if (!controller) {
        return false;
    }

    const snapshot = await readSystemClipboardSnapshot();
    if (!snapshot.ok) {
        return false;
    }

    syncPlusRegister(controller, snapshot.text);
    return true;
}

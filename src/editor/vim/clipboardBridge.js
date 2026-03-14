import { Vim } from '@replit/codemirror-vim';

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

export function installRegisterControllerBridge() {
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

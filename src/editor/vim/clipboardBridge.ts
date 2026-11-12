// Bridge between Vim registers and the system clipboard, for the editor's "system clipboard" toggle.
//
// While enabled: every write to Vim's unnamed register (yank, delete, change…) is copied to the `+`
// register and written to the system clipboard; reading a register with no (or an invalid) name returns
// `+`, so a plain `p` pastes it; and `syncSystemClipboardRegister()` (called when the user turns the
// toggle on) loads the system clipboard into `+` and the unnamed register. While disabled, Vim registers
// stay in-app.
//
// How: `installRegisterControllerBridge()` monkey-patches methods of the single, global Vim register
// controller of @replit/codemirror-vim (once per page). `installSystemClipboardBridge()` keeps references
// to the native `navigator.clipboard.readText/writeText` but never replaces them, so copy buttons and
// other app code keep using the real API. Clipboard failures (no permission, no focus) are swallowed and
// the last known text is kept in `shadowText`.
//
// Called through src/editor/vimSupport.ts by src/components/Editor.ts. All state is module-level and
// shared by every editor view.

import { Vim } from '@replit/codemirror-vim';

/** Vim's register controller (one per page, shared by every Vim editor). */
type VimRegisterController = ReturnType<typeof Vim.getRegisterController>;

/** One Vim register (named, unnamed or `+`). */
type VimRegister = ReturnType<VimRegisterController['getRegister']>;

interface ClipboardBridgeState {
    /** The user's toggle; when false the bridge leaves the system clipboard alone. */
    enabled: boolean;
    originalReadText: (() => Promise<string>) | null;
    originalWriteText: ((data: string) => Promise<void>) | null;
    /** The clipboard object the originals were taken from (to detect a replaced `navigator.clipboard`). */
    patchedClipboard: Clipboard | null;
    /** Last text seen in or written to the clipboard by the bridge; used when the real clipboard fails. */
    shadowText: string;
}

let clipboardBridgeInstalled = false;
let registerControllerBridgeInstalled = false;

const clipboardBridgeState: ClipboardBridgeState = {
    enabled: true,
    originalReadText: null,
    originalWriteText: null,
    patchedClipboard: null,
    shadowText: '',
};

/** Any value as clipboard text: strings unchanged, `null`/`undefined` as `''`, anything else through `String()`. */
export function normalizeClipboardText(value: unknown): string {
    return typeof value === 'string' ? value : String(value ?? '');
}

// navigator.clipboard when it exists with both readText and writeText (secure contexts only), else null.
function getClipboardObject(): Clipboard | null {
    if (typeof navigator === 'undefined' || !navigator?.clipboard) {
        return null;
    }

    const { clipboard } = navigator;
    if (typeof clipboard.readText !== 'function' || typeof clipboard.writeText !== 'function') {
        return null;
    }

    return clipboard;
}

/** Whether the async clipboard API can be used here (it needs a secure context such as localhost). */
export function isSystemClipboardApiAvailable(): boolean {
    return Boolean(getClipboardObject());
}

async function writeSystemClipboard(text: string): Promise<void> {
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

// The clipboard text; `ok: false` (with the shadow text) when disabled, not installed or the read failed.
async function readSystemClipboardSnapshot(): Promise<{ ok: boolean; text: string }> {
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

// Puts `text` into the `+` and unnamed registers (through their possibly patched setText).
function syncPlusRegister(controller: VimRegisterController, text: string, linewise: boolean = false, blockwise: boolean = false): void {
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

/**
 * Patches the global Vim register controller (idempotent; a no-op if the Vim API is missing). Runs at
 * every Vim extension creation and before any clipboard sync.
 */
export function installRegisterControllerBridge(): void {
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
        controller.unnamedRegister.setText = function patchedUnnamedSetText(this: VimRegister, text?: string, linewise?: boolean, blockwise?: boolean): void {
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

    controller.pushText = function patchedPushText(registerName: string | null | undefined, operator: string, text: string, linewise?: boolean, blockwise?: boolean): void {
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

    controller.getRegister = function patchedGetRegister(this: VimRegisterController, name?: string): VimRegister {
        if (clipboardBridgeState.enabled && !this.isValidRegister(name)) {
            return originalGetRegister('+');
        }

        return originalGetRegister(name);
    };

    registerControllerBridgeInstalled = true;
}

/**
 * Also installs the register bridge, then captures the native clipboard methods. Returns whether the
 * clipboard API is available (and therefore whether the bridge can reach the system clipboard).
 */
export function installSystemClipboardBridge(): boolean {
    installRegisterControllerBridge();

    const clipboard = getClipboardObject();
    if (!clipboard) {
        return false;
    }

    if (clipboardBridgeInstalled && clipboardBridgeState.patchedClipboard === clipboard) {
        return true;
    }

    // Keep references to the native clipboard methods, but never replace the
    // global navigator.clipboard API: other parts of the app (copy buttons,
    // explicit `"+y`) must keep working even when the Vim bridge is disabled.
    clipboardBridgeState.originalReadText = clipboard.readText.bind(clipboard);
    clipboardBridgeState.originalWriteText = clipboard.writeText.bind(clipboard);

    clipboardBridgeInstalled = true;
    clipboardBridgeState.patchedClipboard = clipboard;
    return true;
}

/** Turns the bridge on or off (the editor's toggle). Takes effect immediately for every editor. */
export function setSystemClipboardEnabled(enabled: boolean): void {
    clipboardBridgeState.enabled = Boolean(enabled);
}

/**
 * Copies the system clipboard into Vim's `+` and unnamed registers so the next `p` pastes it. Resolves to
 * false when disabled, unavailable or when reading failed (the registers are then left alone).
 */
export async function syncSystemClipboardRegister(): Promise<boolean> {
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

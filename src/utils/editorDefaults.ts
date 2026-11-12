// Persistence of the editor's global on/off defaults: Vim keys (`.vim_enable`) and the system
// clipboard (`.clipboard_default`). Each is a one-line flag file in the repository root.
//
// Runs under Node, imported by server.ts (`/api/editor/vim-default` and `/api/editor/clipboard-default`).
// The flag is ON when the file is missing; only `0`, `false` or `off` (any case) turn it off.

import fs from 'fs';
import type { EditorFlagState } from '../types/api.ts';

function readBooleanFlagState(filePath: string | null | undefined): EditorFlagState {
    if (!filePath || !fs.existsSync(filePath)) {
        return { enabled: true };
    }

    const content = fs.readFileSync(filePath, 'utf-8').trim().toLowerCase();
    return {
        enabled: !(content === '0' || content === 'false' || content === 'off'),
    };
}

function writeBooleanFlagState(filePath: string, enabled = true): EditorFlagState {
    const nextEnabled = Boolean(enabled);
    fs.writeFileSync(filePath, nextEnabled ? '1\n' : '0\n', 'utf-8');
    return { enabled: nextEnabled };
}

/** Whether Vim keys are on by default (`true` when `.vim_enable` does not exist). */
export function readVimDefaultState(filePath: string | null | undefined): EditorFlagState {
    return readBooleanFlagState(filePath);
}

/** Saves the Vim default to `filePath` as `1` or `0`. */
export function writeVimDefaultState(filePath: string, enabled: boolean = true): EditorFlagState {
    return writeBooleanFlagState(filePath, enabled);
}

/** Whether the system clipboard is used by default (`true` when `.clipboard_default` does not exist). */
export function readClipboardDefaultState(filePath: string | null | undefined): EditorFlagState {
    return readBooleanFlagState(filePath);
}

/** Saves the clipboard default to `filePath` as `1` or `0`. */
export function writeClipboardDefaultState(filePath: string, enabled: boolean = true): EditorFlagState {
    return writeBooleanFlagState(filePath, enabled);
}

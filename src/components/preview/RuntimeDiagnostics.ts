// Runtime diagnostics of the editor preview: the problems the running example reports (uncaught errors,
// unhandled rejections, console.error calls, alert/confirm/prompt skipped while typing). They are listed
// over the preview (#preview-runtime-status) and handed to the editor through the `onRuntimeDiagnosticsChange`
// option of Preview, which marks the lines in the code.
//
// A Preview mixin: src/components/Preview.ts copies these methods onto `Preview.prototype`
// (`Object.assign`), so `this` is the Preview and the state (`_runtimeDiagnostics`,
// `_runtimeDiagnosticSignatures`, `runtimeStatus`) is declared there. Preview's `_handleRuntimeMessage`
// turns the iframe's messages (src/types/runtime.ts) into `_registerRuntimeDiagnostic` calls and uses
// `_normalizeStackFrames` / `_formatRuntimeLocation` (also for console entries) to read their positions.
//
// The list is emptied at every render, keeps one entry per distinct problem, and stops growing at
// MAX_RUNTIME_DIAGNOSTICS entries.

import type { Diagnostic } from '../../types/diagnostics.ts';
import type { RuntimeLocation, RuntimeStackFrame } from '../../types/runtime.ts';
import type { Preview } from '../Preview.ts';

const MAX_RUNTIME_DIAGNOSTICS = 50;

/**
 * A problem reported by the running preview. `code` is `runtime-error`, `unhandled-rejection`,
 * `console-error` or `dialog-skipped` (a warning).
 */
export interface RuntimeDiagnostic extends Diagnostic {
    /** Script path of the frame the error points at (`script.js`, `src/App.jsx`), `''` when unknown. */
    file: string;
    line: number | null;
    column: number | null;
    /** `path:line:column` as shown in the console (see `_formatRuntimeLocation`), `''` when unknown. */
    location: string;
}

/** What `_registerRuntimeDiagnostic` accepts: every field optional (`runtime-error`, `error` and `Runtime error` by default). */
export type RuntimeDiagnosticInput = Partial<RuntimeDiagnostic>;

/**
 * A stack frame after `_normalizeStackFrames`: every field present and of the right type, whatever the
 * iframe sent. Unlike `RuntimeStackFrame`, `line` is `null` when unknown and `mapped` is always a boolean.
 */
export interface NormalizedStackFrame {
    column: number | null;
    functionName: string;
    line: number | null;
    /** The runtime mapped the frame back to a learner file. */
    mapped: boolean;
    path: string;
    raw: string;
}

/** The position fields of a runtime message: error reports carry all four, console messages only `location`. */
export interface RuntimeMessagePosition {
    /** Already mapped to the learner's file by the runtime: preferred over the other fields. */
    location?: RuntimeLocation | null;
    path?: string | null;
    line?: number | null;
    column?: number | null;
}

/** A stack frame as it arrives from the iframe: meant to be a `RuntimeStackFrame`, but every field is checked. */
type IncomingStackFrame = { [K in keyof RuntimeStackFrame]?: unknown };

export const runtimeDiagnosticsMixin = {
    /** Empties the list (each render starts clean) and tells the editor. */
    _clearRuntimeDiagnostics(): void {
        this._runtimeDiagnostics = [];
        this._runtimeDiagnosticSignatures = new Set();
        this._renderRuntimeDiagnostics();
        this._emitRuntimeDiagnostics();
    },

    _emitRuntimeDiagnostics(): void {
        if (typeof this._onRuntimeDiagnosticsChange === 'function') {
            this._onRuntimeDiagnosticsChange(this._runtimeDiagnostics.slice());
        }
    },

    /**
     * Adds a diagnostic unless the same one (code, file, line, column and message) is already listed or the
     * list is full; then re-renders the list and tells the editor.
     */
    _registerRuntimeDiagnostic(diagnostic: RuntimeDiagnosticInput = {}): void {
        const nextDiagnostic: RuntimeDiagnostic = {
            code: diagnostic.code || 'runtime-error',
            // `!`: Number.isFinite() is true only for a number, but it does not narrow.
            column: Number.isFinite(diagnostic.column) ? diagnostic.column! : null,
            file: diagnostic.file || '',
            level: diagnostic.level || 'error',
            line: Number.isFinite(diagnostic.line) ? diagnostic.line! : null,
            location: diagnostic.location || '',
            message: diagnostic.message || 'Runtime error',
        };
        const signature = JSON.stringify({
            code: nextDiagnostic.code,
            file: nextDiagnostic.file,
            line: nextDiagnostic.line,
            column: nextDiagnostic.column,
            message: nextDiagnostic.message,
        });
        if (!(this._runtimeDiagnosticSignatures instanceof Set)) {
            this._runtimeDiagnosticSignatures = new Set();
        }
        if (this._runtimeDiagnosticSignatures.has(signature)) return;
        // Bounded: a loop logging unique errors must not grow this list (and editor redraws) forever.
        if (this._runtimeDiagnostics.length >= MAX_RUNTIME_DIAGNOSTICS) return;
        this._runtimeDiagnosticSignatures.add(signature);

        this._runtimeDiagnostics.push(nextDiagnostic);
        this._renderRuntimeDiagnostics();
        this._emitRuntimeDiagnostics();
    },

    /** Rebuilds the list over the preview (hidden when empty). */
    _renderRuntimeDiagnostics(): void {
        if (!this.runtimeStatus) return;

        if (!Array.isArray(this._runtimeDiagnostics) || this._runtimeDiagnostics.length === 0) {
            this.runtimeStatus.innerHTML = '';
            this.runtimeStatus.classList.add('hidden');
            return;
        }

        this.runtimeStatus.classList.remove('hidden');
        this.runtimeStatus.innerHTML = '';

        const title = document.createElement('div');
        title.className = 'preview-runtime-status-title';
        title.innerHTML = '<span>Runtime diagnostics</span>';

        const count = document.createElement('span');
        count.className = 'preview-runtime-status-count';
        count.textContent = `${this._runtimeDiagnostics.length} issue${this._runtimeDiagnostics.length === 1 ? '' : 's'}`;
        title.appendChild(count);
        this.runtimeStatus.appendChild(title);

        const list = document.createElement('ul');
        list.className = 'preview-runtime-status-list';

        this._runtimeDiagnostics.forEach((diagnostic) => {
            const item = document.createElement('li');

            const message = document.createElement('div');
            message.className = 'preview-runtime-status-message';
            message.style.whiteSpace = 'pre-wrap';
            message.textContent = diagnostic.message;
            item.appendChild(message);

            const metaParts: string[] = [];
            if (diagnostic.location) {
                metaParts.push(diagnostic.location);
            } else if (diagnostic.file) {
                let text = diagnostic.file;
                if (diagnostic.line) {
                    text += `:${diagnostic.line}`;
                    if (diagnostic.column) {
                        text += `:${diagnostic.column}`;
                    }
                }
                metaParts.push(text);
            }
            if (diagnostic.code) {
                metaParts.push(diagnostic.code);
            }

            if (metaParts.length > 0) {
                const meta = document.createElement('div');
                meta.className = 'preview-runtime-status-meta';
                meta.textContent = metaParts.join(' • ');
                item.appendChild(meta);
            }

            list.appendChild(item);
        });

        this.runtimeStatus.appendChild(list);
    },

    /**
     * The `stackFrames` of a runtime message, made safe to read: anything that is not an array gives `[]`,
     * numbers sent as text are parsed, and frames with neither path, line nor raw text are dropped.
     */
    _normalizeStackFrames(frames: unknown = []): NormalizedStackFrame[] {
        if (!Array.isArray(frames)) return [];

        return frames
            .map((frame: IncomingStackFrame | null | undefined) => ({
                // `Number.isFinite()` is only true for a number (so `frame` is set), but it does not narrow; in
                // the other branch `parseInt` stringifies whatever arrived.
                column: Number.isFinite(frame?.column)
                    ? (frame!.column as number)
                    : Number.parseInt(frame?.column as string, 10) || null,
                functionName: typeof frame?.functionName === 'string' ? frame.functionName : '',
                line: Number.isFinite(frame?.line)
                    ? (frame!.line as number)
                    : Number.parseInt(frame?.line as string, 10) || null,
                mapped: Boolean(frame?.mapped),
                path: typeof frame?.path === 'string' ? frame.path : '',
                raw: typeof frame?.raw === 'string' ? frame.raw : '',
            }))
            .filter((frame) => frame.path || frame.line || frame.raw);
    },

    /**
     * `path:line:column` of a runtime message for display (`''` when it has neither path nor line): the
     * runtime's mapped `location` first, then the first stack frame, then the message's own fields.
     */
    _formatRuntimeLocation(data: RuntimeMessagePosition = {}, stackFrames: NormalizedStackFrame[] = []): string {
        // `data.location` is already mapped to the learner's file/line by the preview runtime.
        const mapped = data.location && typeof data.location === 'object' ? data.location : null;
        const primaryFrame = Array.isArray(stackFrames) ? stackFrames[0] : null;
        const path = mapped?.path || primaryFrame?.path || data.path || '';
        const line = mapped?.line || primaryFrame?.line || data.line || null;
        const column = mapped?.line ? mapped.column || null : primaryFrame?.column || data.column || null;

        if (!path && !line) return '';

        let value = path || 'runtime';
        if (line) {
            value += `:${line}`;
            if (column) {
                value += `:${column}`;
            }
        }
        return value;
    },
} satisfies ThisType<Preview>;

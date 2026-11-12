// The exercise preview dialog of the theory pages: when the learner activates an exercise card in a rendered
// theory page, this modal runs the referenced example (a live iframe plus a small console under it) without
// leaving the theory, with an "Open Exercise" button that hands the example to the editor.
// Created once by src/main.ts, which calls `open()` when a theory page asks to preview an exercise
// (`preview-exercise`) and passes `onOpenExample` for the button. Fetches the example (src/utils/api.ts), parses it,
// compiles it through the compile client and renders it with the same renderers as the editor preview.
//
// Things to know before editing:
// - The example runs like in the editor preview: published as a real page on the preview origin when
//   possible (hosted), otherwise as a sandboxed `srcdoc` (also the fallback if the hosted page never boots).
// - The console is fed by `learncode-preview` window messages from the dialog's iframe. Objects expand on
//   click through methods BORROWED from the editor preview's `consoleManagerMixin` (see below): they read and
//   write `iframe`, `_renderToken`, `_consoleInspectRequests` and `_consoleInspectSequence` on this object,
//   which is why those fields exist here with those names.
// - `open()` is guarded by `currentRequest`: a newer request makes the older one drop its result.
import { fetchExample } from '../utils/api.ts';
import { compileExample } from '../utils/compileClient.ts';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../utils/exampleRenderer.ts';
import { getExampleEditorialMetadata, isShaderDocument, parseExampleDocument } from '../utils/markdown.ts';
import { HOSTED_PREVIEW_SANDBOX, markHostedPreviewUnavailable, publishPreviewDocument } from '../utils/renderer/previewHost.ts';
import { errorMessage } from '../utils/errors.ts';
import { consoleManagerMixin, type PendingConsoleInspect } from './preview/ConsoleManager.ts';
import type { Diagnostic } from '../types/diagnostics.ts';
import type {
    ConsoleMessage,
    ConsoleTable,
    PreviewFrameMessage,
    RuntimeErrorMessage,
    UnhandledRejectionMessage,
} from '../types/runtime.ts';

/** What `main.ts` passes to the dialog. */
export interface TheoryExerciseDialogOptions {
    /** "Open Exercise" was pressed (the dialog has already closed): open that example in the editor. */
    onOpenExample?: (topicPath: string, filename: string) => void | Promise<void>;
}

/** The exercise a theory page asks to preview. The dialog trims both parts. */
export interface TheoryExerciseRequest {
    /** `chapter/section/topic` that holds the example. Blank or missing: the dialog says the reference is incomplete. */
    topicPath: string | null | undefined;
    /** File name of the example inside the topic's `examples/` folder. Blank or missing: as above. */
    filename: string | null | undefined;
}

/** Arguments of {@link TheoryExerciseDialog._renderPreview}. */
interface PreviewViewOptions {
    iframe: HTMLIFrameElement;
    /** Dialog title. */
    title: string;
    /** Dialog subtitle; falls back to `path`. */
    description: string;
    path: string;
    /** No markup to show: the stage gives all its space to the console. */
    consoleOnly?: boolean;
    renderId?: number;
    /** TypeScript type errors to list above the console. */
    typeErrors?: Diagnostic[];
}


/**
 * Error reports carry no console table; declared absent so `table` can be read on any message that becomes a
 * console line.
 */
interface NoTableField {
    table?: undefined;
}

/** The messages of the preview channel that become a line of the dialog console. */
type ConsoleLineMessage =
    | ConsoleMessage
    | (RuntimeErrorMessage & NoTableField)
    | (UnhandledRejectionMessage & NoTableField);

// The dialog console reuses the main console's value rendering, so objects expand on click
// (down to [[Prototype]]) by asking the dialog's iframe, exactly as in the editor preview.
const BORROWED_CONSOLE_METHODS = [
    '_createConsoleValueSpan',
    '_rejectPendingConsoleInspects',
    '_renderConsoleParts',
    '_renderConsoleProperty',
    '_renderConsoleValue',
    '_requestConsoleInspect',
    '_resolveConsoleInspect',
    '_sanitizeConsoleStyle',
] as const;

/** Name of a `consoleManagerMixin` method the dialog borrows. */
type BorrowedConsoleMethod = (typeof BORROWED_CONSOLE_METHODS)[number];

/** The borrowed methods, typed as the mixin declares them. */
type BorrowedConsoleMethods = Pick<typeof consoleManagerMixin, BorrowedConsoleMethod>;

/**
 * Same safety net as the editor preview: a hosted page that never sends `runtime-ready` within this time is
 * reloaded as a srcdoc copy.
 */
const HOSTED_READY_TIMEOUT_MS = 4000;

// TypeScript type errors don't stop the example (the JavaScript still runs), so the dialog lists
// them above the console, numbered by line of the TypeScript block, as the course texts quote them.
function buildTypeErrorsStrip(typeErrors: Diagnostic[]): HTMLElement {
    const strip = document.createElement('section');
    strip.className = 'theory-exercise-dialog-types';
    strip.setAttribute('aria-label', 'Errores de tipos');
    const title = document.createElement('p');
    title.className = 'theory-exercise-dialog-types-title';
    title.textContent = 'Errores de tipos (el código se ejecuta igual)';
    const list = document.createElement('ol');
    typeErrors.forEach((diagnostic) => {
        const item = document.createElement('li');
        item.textContent = `${diagnostic.line ? `línea ${diagnostic.line}: ` : ''}${diagnostic.message}`;
        list.appendChild(item);
    });
    strip.append(title, list);
    return strip;
}

/** A `console.table` result as a table; at most 200 rows are shown. */
function buildConsoleTable({ header, rows }: Pick<ConsoleTable, 'header' | 'rows'>): HTMLTableElement {
    const table = document.createElement('table');
    table.className = 'theory-exercise-dialog-console-table';
    const headRow = table.createTHead().insertRow();
    header.forEach((label) => {
        const cell = document.createElement('th');
        cell.textContent = String(label);
        headRow.appendChild(cell);
    });
    const body = table.createTBody();
    rows.slice(0, 200).forEach((cells) => {
        const row = body.insertRow();
        cells.forEach((value) => {
            row.insertCell().textContent = String(value ?? '');
        });
    });
    return table;
}

/**
 * The modal that previews one exercise of a theory page (see the header of this file), bound to
 * `#theory-exercise-dialog` in index.html. The members named in {@link BORROWED_CONSOLE_METHODS} are copied
 * from `consoleManagerMixin` at the bottom of the file.
 */
export class TheoryExerciseDialog {
    readonly onOpenExample: TheoryExerciseDialogOptions['onOpenExample'];
    readonly dialog: HTMLDialogElement | null;
    readonly title: HTMLHeadingElement | null;
    readonly note: HTMLParagraphElement | null;
    /** Holds the preview iframe, the type-error strip and the console while an exercise is shown. */
    readonly stage: HTMLDivElement | null;
    /** The loading / error message shown instead of the stage. */
    readonly empty: HTMLParagraphElement | null;
    readonly btnOpen: HTMLButtonElement | null;
    readonly btnClose: HTMLButtonElement | null;
    readonly btnCloseIcon: HTMLButtonElement | null;
    /** `topic::file::timestamp` of the latest `open()`; `null` after the dialog closes. Stale requests compare against it. */
    private currentRequest: string | null;
    private currentTopicPath: string;
    private currentFilename: string;
    /** The preview iframe on screen; the only window whose messages are accepted. */
    private currentFrame: HTMLIFrameElement | null;
    /** The console `<ol>` under the preview; `null` when no exercise is shown. */
    private consoleList: HTMLOListElement | null;
    /** Entries in the console (output stops at 500). */
    private consoleCount: number;
    /** Number of previews rendered; becomes the `renderId` of the next document. */
    private renderCount: number;
    /**
     * Timer of the hosted-preview safety net (`null` before the first one). `clearTimeout(null)` is a harmless
     * no-op, but its typings only accept `undefined`, so the calls below assert non-null.
     */
    private hostedWatchdog: ReturnType<typeof setTimeout> | null;
    // State used by the borrowed console methods (see BORROWED_CONSOLE_METHODS). Public on purpose: the
    // mixin reads and writes them through `this`.
    /** Same as `currentFrame`; the borrowed methods post their inspect requests to it. */
    iframe: HTMLIFrameElement | null;
    /** `renderId` of the document in `iframe`; the borrowed methods stamp their commands with it. */
    _renderToken: number;
    /** Inspect requests waiting for an answer from `iframe`, by `requestId`. */
    _consoleInspectRequests: Map<number, PendingConsoleInspect>;
    _consoleInspectSequence: number;
    /** Whether the hosted page sent `runtime-ready`; `undefined` until a hosted load starts. */
    private frameReady: boolean | undefined;

    constructor({ onOpenExample }: TheoryExerciseDialogOptions = {}) {
        this.onOpenExample = onOpenExample;
        this.dialog = document.getElementById('theory-exercise-dialog') as HTMLDialogElement | null;
        this.title = document.getElementById('theory-exercise-dialog-title') as HTMLHeadingElement | null;
        this.note = document.getElementById('theory-exercise-dialog-note') as HTMLParagraphElement | null;
        this.stage = document.getElementById('theory-exercise-dialog-stage') as HTMLDivElement | null;
        this.empty = document.getElementById('theory-exercise-dialog-empty') as HTMLParagraphElement | null;
        this.btnOpen = document.getElementById('theory-exercise-dialog-open') as HTMLButtonElement | null;
        this.btnClose = document.getElementById('theory-exercise-dialog-close') as HTMLButtonElement | null;
        this.btnCloseIcon = document.getElementById('theory-exercise-dialog-close-icon') as HTMLButtonElement | null;
        this.currentRequest = null;
        this.currentTopicPath = '';
        this.currentFilename = '';
        this.currentFrame = null;
        this.consoleList = null;
        this.consoleCount = 0;
        this.renderCount = 0;
        this.hostedWatchdog = null;
        // State used by the borrowed console methods (see BORROWED_CONSOLE_METHODS).
        this.iframe = null;
        this._renderToken = 0;
        this._consoleInspectRequests = new Map();
        this._consoleInspectSequence = 0;

        // Console output of the previewed example (theory pages have no console of their own).
        window.addEventListener('message', (event) => this._handleFrameMessage(event));

        this.btnClose?.addEventListener('click', () => this.dialog?.close());
        this.btnCloseIcon?.addEventListener('click', () => this.dialog?.close());
        // Remove the live preview on close so it stops running in the background.
        this.dialog?.addEventListener('close', () => {
            clearTimeout(this.hostedWatchdog!);
            this._rejectPendingConsoleInspects();
            this.currentRequest = null;
            this.currentFrame = null;
            this.iframe = null;
            this.consoleList = null;
            if (this.stage) {
                this.stage.innerHTML = '';
            }
        });
        this.btnOpen?.addEventListener('click', async () => {
            if (!this.currentTopicPath || !this.currentFilename) return;
            this.dialog?.close();
            await this.onOpenExample?.(this.currentTopicPath, this.currentFilename);
        });
    }

    /**
     * Shows the dialog and loads the referenced example into it. Failures (incomplete reference, fetch or
     * compile errors) are shown inside the dialog, not thrown.
     */
    async open({ topicPath, filename }: TheoryExerciseRequest): Promise<void> {
        this.currentTopicPath = String(topicPath || '').trim();
        this.currentFilename = String(filename || '').trim();
        this.currentRequest = `${this.currentTopicPath}::${this.currentFilename}::${Date.now()}`;
        const requestId = this.currentRequest;

        this._renderLoading();
        if (this.dialog && !this.dialog.open) {
            this.dialog.showModal();
        }

        if (!this.currentTopicPath || !this.currentFilename) {
            this._renderMissing('Exercise reference is incomplete.');
            return;
        }

        try {
            const data = await fetchExample(this.currentTopicPath, this.currentFilename);
            if (requestId !== this.currentRequest) return;

            const documentModel = parseExampleDocument(data?.content || '');
            const editorial = getExampleEditorialMetadata(documentModel);
            const iframe = document.createElement('iframe');
            iframe.sandbox = 'allow-scripts';
            this.renderCount += 1;
            const renderId = this.renderCount;
            let typeErrors: Diagnostic[] = [];

            if (isShaderDocument(documentModel)) {
                iframe.srcdoc = renderShaderExampleDocument(documentModel, {
                    diagnostics: documentModel.diagnostics || [],
                    renderId: 0,
                    shaderControls: {
                        paused: true,
                        stillFrame: false,
                    },
                    topicPath: this.currentTopicPath,
                });
            } else {
                const result = await compileExample({ document: documentModel });
                if (requestId !== this.currentRequest) return;
                const diagnostics = result.compileDiagnostics || [];
                typeErrors = diagnostics.filter((diagnostic) => diagnostic.code === 'typescript-type');
                const renderSrcdoc = () => renderCompiledExampleDocument(
                    result.compiledDocument,
                    this.currentTopicPath,
                    diagnostics,
                    { consoleEnabled: true, renderId }
                );
                // Like the editor preview, the example runs as a real page on the preview origin
                // (storage, cookies, IndexedDB, history.pushState, same-origin requests); the
                // sandboxed srcdoc copy is only the fallback.
                const hostedUrl = await publishPreviewDocument({
                    html: renderCompiledExampleDocument(
                        result.compiledDocument,
                        this.currentTopicPath,
                        diagnostics,
                        { consoleEnabled: true, hosted: true, renderId }
                    ),
                    renderId,
                    topicPath: this.currentTopicPath,
                });
                if (requestId !== this.currentRequest) return;
                if (hostedUrl) {
                    this._loadHosted(iframe, hostedUrl, renderSrcdoc, requestId);
                } else {
                    iframe.srcdoc = renderSrcdoc();
                }
            }

            // Script-only examples have nothing to show on the page: give the space to the console.
            const consoleOnly = !isShaderDocument(documentModel)
                && !(documentModel.blocks || []).some((block) => block.slot === 'markup' && String(block.content || '').trim());

            this._renderPreview({
                consoleOnly,
                renderId: isShaderDocument(documentModel) ? 0 : renderId,
                description: editorial.description || '',
                iframe,
                path: `/${this.currentTopicPath}/examples/${this.currentFilename}`,
                title: editorial.description || this.currentFilename,
                typeErrors,
            });
        } catch (error) {
            if (requestId !== this.currentRequest) return;
            console.error('Failed to render theory exercise preview.', error);
            this._renderMissing(`Preview unavailable: ${errorMessage(error)}`);
        }
    }

    private _renderLoading(): void {
        if (!this.stage || !this.empty || !this.title || !this.note || !this.btnOpen) return;
        this.stage.innerHTML = '';
        this.empty.classList.remove('hidden');
        this.empty.textContent = 'Loading exercise preview...';
        this.title.textContent = this.currentFilename || 'Exercise Preview';
        this.note.textContent = 'Resolving the referenced exercise from the current topic.';
        this.btnOpen.disabled = true;
    }

    private _renderMissing(message: string): void {
        if (!this.stage || !this.empty || !this.title || !this.note || !this.btnOpen) return;
        this.stage.innerHTML = '';
        this.empty.classList.remove('hidden');
        this.empty.textContent = message || 'Exercise not found.';
        this.title.textContent = this.currentFilename || 'Missing Exercise';
        this.note.textContent = 'The referenced exercise could not be loaded from this topic.';
        this.btnOpen.disabled = true;
    }

    /** Loads the example from the preview origin and arms the watchdog that falls back to `renderSrcdoc()`. */
    private _loadHosted(iframe: HTMLIFrameElement, url: string, renderSrcdoc: () => string, requestId: string): void {
        iframe.sandbox = HOSTED_PREVIEW_SANDBOX;
        // The same permissions as the editor preview (fullscreen, clipboard, camera…).
        const allow = document.getElementById('preview-frame')?.getAttribute('allow');
        if (allow) iframe.setAttribute('allow', allow);
        iframe.src = url;
        this.frameReady = false;
        clearTimeout(this.hostedWatchdog!);
        this.hostedWatchdog = setTimeout(() => {
            if (requestId !== this.currentRequest || this.currentFrame !== iframe || this.frameReady) return;
            markHostedPreviewUnavailable();
            iframe.removeAttribute('src');
            // Drop `allow-same-origin` before loading the srcdoc copy.
            iframe.sandbox = 'allow-scripts';
            iframe.srcdoc = renderSrcdoc();
        }, HOSTED_READY_TIMEOUT_MS);
    }

    private _renderPreview({ iframe, title, description, path, consoleOnly = false, renderId = 0, typeErrors = [] }: PreviewViewOptions): void {
        if (!this.stage || !this.empty || !this.title || !this.note || !this.btnOpen) return;
        this.stage.innerHTML = '';
        this.stage.classList.toggle('is-console-only', consoleOnly);
        this._rejectPendingConsoleInspects();
        this.currentFrame = iframe;
        this.iframe = iframe;
        this._renderToken = renderId;
        this.consoleCount = 0;
        this.consoleList = document.createElement('ol');
        this.consoleList.className = 'theory-exercise-dialog-console hidden';
        this.consoleList.setAttribute('aria-label', 'Console output');
        this.stage.appendChild(iframe);
        if (typeErrors.length > 0) this.stage.appendChild(buildTypeErrorsStrip(typeErrors));
        this.stage.appendChild(this.consoleList);
        this.empty.classList.add('hidden');
        this.title.textContent = title || this.currentFilename || 'Exercise Preview';
        this.note.textContent = description || path || 'Interactive preview of the referenced exercise.';
        this.btnOpen.disabled = false;
    }

    /**
     * Handles every window `message`; only those posted by the dialog's own iframe on the
     * `learncode-preview` channel count. `event.data` is untrusted: the `source` and window checks below are
     * what make it a {@link PreviewFrameMessage}.
     */
    private _handleFrameMessage(event: MessageEvent): void {
        const message: PreviewFrameMessage | null | undefined = event?.data;
        if (!message || message.source !== 'learncode-preview' || !this.currentFrame || !this.consoleList) return;
        if (event.source !== this.currentFrame.contentWindow) return;

        if (message.kind === 'runtime-ready') {
            this.frameReady = true;
            clearTimeout(this.hostedWatchdog!);
            return;
        }
        if (message.kind === 'inspect-result') {
            this._resolveConsoleInspect(message);
            return;
        }
        if (message.kind === 'console-clear') {
            this.consoleList.replaceChildren();
            this.consoleCount = 0;
            this.consoleList.classList.add('hidden');
            return;
        }
        if (!['console', 'runtime-error', 'unhandled-rejection'].includes(message.kind)) return;
        // `includes` cannot narrow the type, the check above guarantees it.
        const data = message as ConsoleLineMessage;
        if (this.consoleCount >= 500) return;

        const level = ['error', 'warn', 'info', 'debug'].includes(data.level) ? data.level : 'log';
        const item = document.createElement('li');
        item.className = `theory-exercise-dialog-console-entry is-${level}`;
        const depth = Array.isArray(data.groups) ? data.groups.length : 0;
        if (depth > 0) item.style.paddingInlineStart = `${10 + depth * 14}px`;
        if (Array.isArray(data.parts) && data.parts.length > 0) {
            this._renderConsoleParts(item, data.parts);
        } else {
            item.textContent = String(data.text ?? (Array.isArray(data.values) ? data.values.join(' ') : ''));
        }
        if (data.kind === 'runtime-error' && data.line) item.append(`  (line ${data.line})`);
        if (data.table && Array.isArray(data.table.header) && Array.isArray(data.table.rows)) {
            item.appendChild(buildConsoleTable(data.table));
        }
        this.consoleList.appendChild(item);
        this.consoleCount += 1;
        this.consoleList.classList.remove('hidden');
        if (this.consoleCount === 500) {
            const note = document.createElement('li');
            note.className = 'theory-exercise-dialog-console-entry is-info';
            note.textContent = '… more output in the editor (Open Exercise).';
            this.consoleList.appendChild(note);
        }
        this.consoleList.scrollTop = this.consoleList.scrollHeight;
    }
}

// Declaration merging: the borrowed methods become part of the dialog's instance type.
export interface TheoryExerciseDialog extends BorrowedConsoleMethods {}

BORROWED_CONSOLE_METHODS.forEach((name) => {
    (TheoryExerciseDialog.prototype as Record<BorrowedConsoleMethod, unknown>)[name] = consoleManagerMixin[name];
});

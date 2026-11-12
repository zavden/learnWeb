// The editor's live preview (the right-hand column): the preview iframe and everything under it.
// Created once by src/main.ts, which feeds it the document being edited (`update`) and calls the public
// methods below from toolbar buttons and shortcuts; Preview reports back through the `PreviewOptions`
// callbacks (compile and runtime diagnostics for the editor, theory exercise requests, uniform edits).
//
// The render loop: `update()` → `_scheduleRender()` (sets up the console/shader session, then debounces
// 300 ms unless auto-render is off) → `_render()`, which by kind of document
// - theory page (being edited): renders it with its exercise embeds (theoryRenderer.ts) as srcdoc;
// - shader example: renders the shader page (shaderRenderer.ts) as srcdoc, with the WebGL validation
//   of src/utils/shaderPreviewDiagnostics.ts as its compile diagnostics;
// - any other example: compiles it (compileClient.ts), then publishes it on the preview origin as a real
//   page ("hosted", previewHost.ts) or, when the host is unavailable, loads it as srcdoc. A hosted page
//   must send 'runtime-ready' within HOSTED_READY_TIMEOUT_MS or it is replaced by its srcdoc copy.
// The page talks back with window messages (src/types/runtime.ts), handled by `_handleRuntimeMessage`.
//
// Three mixins add most of the methods (copied onto the prototype at the end of this file; the
// `interface Preview` below merges their types): preview/ConsoleManager.ts (console panel, REPL, object
// inspector), preview/RuntimeDiagnostics.ts (runtime error list) and preview/ShaderControls.ts (shader
// panel). Every field they use is declared in this class.
//
// Things to know before editing:
// - `_renderToken` numbers the renders. It is the `renderId` of the page it produced; messages and late
//   async results from older renders are dropped by comparing against it.
// - The sandbox must change before the iframe navigates (`_showSrcdoc`): a srcdoc document must never
//   run with `allow-same-origin`, which hosted pages need.
// - Messages come from any window (learner code included): the `source`, sending-window and `renderId`
//   checks in `_handleRuntimeMessage` are what make them trustworthy; keep them.

import type { CompileResponse } from '../types/compile.ts';
import type { Diagnostic } from '../types/diagnostics.ts';
import type { ExampleDocument, ShaderResolution } from '../types/document.ts';
import type {
    PreviewFrameMessage,
    RuntimeBridgeMode,
    RuntimeReadyMessage,
    ShaderRuntimeMessage,
    TheoryPreviewMessage,
} from '../types/runtime.ts';
import type { TheoryDocument } from '../types/theory.ts';
import { compileExample } from '../utils/compileClient.ts';
import { type ConsoleHistorySession, createConsoleHistorySession } from '../utils/consoleHistory.ts';
import { errorMessage } from '../utils/errors.ts';
import { type RenderCompiledExampleOptions, renderCompiledExampleDocument, renderShaderExampleDocument } from '../utils/exampleRenderer.ts';
import {
    HOSTED_PREVIEW_SANDBOX,
    SRCDOC_PREVIEW_SANDBOX,
    markHostedPreviewUnavailable,
    publishPreviewDocument,
} from '../utils/renderer/previewHost.ts';

/** How long a hosted page has to send 'runtime-ready' before the preview loads its srcdoc copy instead. */
const HOSTED_READY_TIMEOUT_MS = 4000;
import { getShaderConfig, isShaderDocument } from '../utils/markdown.ts';
import { validateShaderPreviewDocument } from '../utils/shaderPreviewDiagnostics.ts';
import { getTheoryDocumentContent, isTheoryDocument } from '../utils/theoryDocument.ts';
import { loadTheoryExerciseEmbeds } from '../utils/theoryExerciseEmbeds.ts';
import { highlightCode, renderTheoryPreviewDocument } from '../utils/theoryRenderer.ts';
import { buildCompiledStyleFiles, COMPILED_CSS_PATH, type GeneratedCodeFile, SASS_OUTPUT_PATH } from '../utils/compiledStyleView.ts';
import { byId } from '../utils/dom.ts';
import {
    type ConsoleEntry,
    type ConsoleFilterLevel,
    consoleManagerMixin,
    type PendingConsoleInspect,
} from './preview/ConsoleManager.ts';
import {
    type NormalizedStackFrame,
    type RuntimeDiagnostic,
    runtimeDiagnosticsMixin,
    type RuntimeMessagePosition,
} from './preview/RuntimeDiagnostics.ts';
import { type ShaderControlsState, shaderControlsMixin, type ShaderStats } from './preview/ShaderControls.ts';

/**
 * What the preview renders: the example open in the editor, or the topic's theory page while it is
 * being edited.
 */
export type PreviewDocument = ExampleDocument | TheoryDocument;
/** What the panel under the preview shows: nothing, the console, or the shader panel. */
export type PreviewRuntimeMode = 'none' | 'console' | 'shader';

/** Callbacks from `src/main.ts`; every one is optional. */
export interface PreviewOptions {
    /**
     * After every render, with the compile diagnostics of what is shown: compiler output for examples,
     * the WebGL validation for shaders, `[]` for theory pages and when the preview is cleared.
     */
    onCompileStateChange?: (diagnostics: Diagnostic[]) => void;
    /** The Edit button of a custom uniform in the shader panel (the button only exists with this option). */
    onRequestShaderUniformEdit?: (uniformName: string) => void;
    /** The runtime diagnostics changed (one was added, or the list was emptied by a render); receives a copy. */
    onRuntimeDiagnosticsChange?: (diagnostics: RuntimeDiagnostic[]) => void;
    /** An exercise card of the rendered theory page asks to open its example in the editor. */
    onTheoryExerciseOpenRequest?: (topicPath: string, filename: string) => void;
    /** An exercise card of the rendered theory page asks to preview its example (theory exercise dialog). */
    onTheoryExercisePreviewRequest?: (topicPath: string, filename: string) => void;
}

/** Options of `update()`. */
export interface PreviewUpdateOptions {
    /**
     * Identifies the example (the editor's session key). A new key starts a new console session; the
     * first render of a key runs "explicitly" (alert/confirm/prompt are not suppressed).
     */
    sessionKey?: string;
}

/** Options of `setAutoRenderEnabled()`. */
export interface AutoRenderOptions {
    /** Remember the choice in localStorage. Default `true`. */
    persist?: boolean;
    /** When enabling, render the current document right away. Default `true`. */
    renderIfEnabled?: boolean;
}

/** What of the shader panel's state the editor keeps when it saves a shader example: the canvas size, as `resolution`. */
export interface ShaderPersistedState {
    resolution: ShaderResolution;
}

/** The messages that reach the console part of `_handleRuntimeMessage` (after the earlier `kind` checks). */
type ConsoleBoundMessage = WithAbsentFields<Exclude<PreviewFrameMessage, ShaderRuntimeMessage | RuntimeReadyMessage>>;

/** Every key of every member of a union (`keyof` on a union gives only the shared keys). */
type KeysOfUnion<T> = T extends unknown ? keyof T : never;

/**
 * A union whose members also declare, as `?: undefined`, the fields that only other members have, so any
 * field can be read without narrowing first (a member without it gives `undefined`, as at runtime).
 * Narrowing on a discriminant still works.
 */
type WithAbsentFields<T, K extends PropertyKey = KeysOfUnion<T>> = T extends unknown
    ? T & { [P in Exclude<K, keyof T>]?: undefined }
    : never;

/** The frame a runtime diagnostic points at (see `_getPrimaryRuntimeFrame`). */
type PrimaryRuntimeFrame = Pick<NormalizedStackFrame, 'path' | 'line' | 'column'>;

/** Options of `_showHosted`. */
interface HostedShowOptions {
    /** The render the page belongs to; the watchdog does nothing once a newer render started. */
    renderToken?: number;
    /** Builds the srcdoc copy to show if the hosted page never sends 'runtime-ready'. */
    fallbackHtml?: (() => string) | null;
}

/**
 * The editor preview (see the header of this file). Bound to the preview column of index.html; the
 * methods without a leading underscore are what `src/main.ts` calls.
 */
export class Preview {
    readonly iframe: HTMLIFrameElement | null;
    private readonly btnAutoRenderToggle: HTMLButtonElement | null;
    private readonly btnRefresh: HTMLButtonElement;
    private readonly btnOpenPreviewTab: HTMLButtonElement | null;
    /** Page URL of the current hosted document (`''` for srcdoc): what "open in a new tab" opens. */
    private _hostedUrl: string;
    // Sass examples: the «CSS» toggle and the panel with the generated CSS and the compiler messages.
    private readonly btnCompiledCss: HTMLButtonElement | null;
    private readonly compiledPanel: HTMLElement | null;
    private readonly compiledMessages: HTMLPreElement | null;
    private readonly compiledCode: HTMLElement | null;
    private _compiledPanelOpen: boolean;
    // Console panel (also the frame of the shader panel).
    readonly btnConsoleOverride: HTMLButtonElement | null;
    /** The runtime diagnostics list over the preview. */
    readonly runtimeStatus: HTMLDivElement | null;
    readonly consoleResizer: HTMLDivElement | null;
    readonly consolePanel: HTMLElement | null;
    readonly runtimeTitle: HTMLSpanElement | null;
    readonly consoleBody: HTMLDivElement | null;
    readonly consoleControls: HTMLDivElement | null;
    readonly consoleContent: HTMLDivElement | null;
    readonly consoleOutput: HTMLDivElement | null;
    /** The "no messages" line; moved in and out of `consoleOutput`. */
    readonly consoleEmpty: HTMLDivElement | null;
    readonly consoleCount: HTMLSpanElement | null;
    readonly btnClearConsole: HTMLButtonElement | null;
    readonly btnToggleConsole: HTMLButtonElement | null;
    readonly btnConsoleFontDec: HTMLButtonElement | null;
    readonly btnConsoleFontInc: HTMLButtonElement | null;
    readonly consoleForm: HTMLFormElement | null;
    /** The REPL input. */
    readonly consoleInput: HTMLInputElement | null;
    /** The level filter buttons (`data-level`: all, log, info, warn, error). */
    readonly consoleFilterButtons: HTMLButtonElement[];
    // Shader toolbar over the editor, and the shader panel.
    readonly shaderEditorControls: HTMLElement | null;
    readonly shaderEditorControlsBody: HTMLDivElement | null;
    readonly btnToggleShaderControls: HTMLButtonElement | null;
    readonly shaderPanel: HTMLDivElement | null;
    readonly shaderFps: HTMLElement | null;
    readonly shaderFrame: HTMLElement | null;
    readonly shaderUpdated: HTMLSpanElement | null;
    readonly shaderUniformList: HTMLDivElement | null;
    readonly shaderTexturePanel: HTMLElement | null;
    readonly shaderTextureSummary: HTMLSpanElement | null;
    readonly btnToggleShaderTextures: HTMLButtonElement | null;
    readonly shaderTextureViewer: HTMLDivElement | null;
    readonly shaderTextureTabs: HTMLDivElement | null;
    readonly shaderTextureStage: HTMLElement | null;
    readonly shaderTextureStageEmpty: HTMLDivElement | null;
    readonly shaderTextureImage: HTMLImageElement | null;
    readonly shaderTextureCaption: HTMLElement | null;
    readonly shaderCustomList: HTMLDivElement | null;
    readonly shaderCustomEmpty: HTMLDivElement | null;
    readonly shaderTextureList: HTMLDivElement | null;
    readonly shaderTextureEmpty: HTMLDivElement | null;
    readonly shaderResolutionSelect: HTMLSelectElement | null;
    readonly shaderWidthRange: HTMLInputElement | null;
    readonly shaderWidthInput: HTMLInputElement | null;
    readonly shaderHeightRange: HTMLInputElement | null;
    readonly shaderHeightInput: HTMLInputElement | null;
    readonly btnShaderTogglePause: HTMLButtonElement | null;
    readonly btnShaderReset: HTMLButtonElement | null;
    // Render loop.
    /**
     * Pending debounced render (`null` before the first one). `clearTimeout(null)` is a no-op, but the
     * typings only accept `undefined`, hence the `!` at the clearTimeout calls.
     */
    _debounceTimer: ReturnType<typeof setTimeout> | null;
    /** `chapter/section/topic` of the open topic (assets, theory embeds); `null` before one is selected. */
    _currentTopicPath: string | null;
    /** The document last passed to `update()`; `null` after `clear()`. */
    _lastDocument: PreviewDocument | null;
    private _lastSessionKey: string;
    /** Number of the latest render (see the header of this file). */
    _renderToken: number;
    private readonly _onCompileStateChange: PreviewOptions['onCompileStateChange'];
    readonly _onRequestShaderUniformEdit: PreviewOptions['onRequestShaderUniformEdit'];
    readonly _onRuntimeDiagnosticsChange: PreviewOptions['onRuntimeDiagnosticsChange'];
    private readonly _onTheoryExerciseOpenRequest: PreviewOptions['onTheoryExerciseOpenRequest'];
    private readonly _onTheoryExercisePreviewRequest: PreviewOptions['onTheoryExercisePreviewRequest'];
    // Console state (ConsoleManager.ts).
    _runtimeMode: PreviewRuntimeMode;
    /** Console output is shown: by metadata (or a script-only example), or turned on by hand. */
    _consoleEnabled: boolean;
    /** The document asks for a console. */
    _consoleMetadataEnabled: boolean;
    /** The learner turned the console on for this example. */
    _consoleManualOverride: boolean;
    _consoleEntries: ConsoleEntry[];
    /** Entries (new, or with a changed repeat count) waiting for the next flush. */
    _consoleQueue: ConsoleEntry[];
    _consoleFlushScheduled: boolean;
    /** Entries dropped over MAX_CONSOLE_ENTRIES in this run. */
    _consoleDroppedCount: number;
    /** `groupId`s of the collapsed console groups. */
    _consoleCollapsedGroups: Set<number>;
    /** `_consoleEnabled` when the list was last rebuilt (`null`: never), to rebuild only when it changes. */
    _consoleRenderedEnabled: boolean | null;
    /** Last entry id of this run. */
    _consoleSequence: number;
    /** Session (example) the console and REPL history belong to; `''` before the first. */
    _consoleSessionKey: string;
    /** REPL history of every example opened since the page loaded, by session key. */
    readonly _consoleHistoryBySession: Map<string, ConsoleHistorySession>;
    /** REPL history of the current example. */
    _consoleHistory: ConsoleHistorySession;
    /** Levels whose filter button is on. */
    _consoleFilters: Set<ConsoleFilterLevel>;
    /** In px (11–18). */
    _consoleFontSize: number;
    /** The panel (console or shader panel) is collapsed to its header. */
    _consoleCollapsed: boolean;
    /** Counter of REPL commands, part of their `commandId`. */
    _consoleCommandId: number;
    private readonly _autoRenderStorageKey: string;
    private _autoRenderEnabled: boolean;
    // Shader panel state (ShaderControls.ts).
    /** Session the shader panel state belongs to (`''`: none). */
    _shaderControlSessionKey: string;
    _shaderControls: ShaderControlsState;
    _shaderEditorControlsCollapsed: boolean;
    // What each shader list last rendered (see the header of ShaderControls.ts).
    _shaderResolutionOptionsSignature: string;
    _shaderResolutionSelectionValue: string;
    _shaderCustomUniformsSignature: string;
    _shaderTexturesSignature: string;
    _shaderTextureTabsSignature: string;
    _shaderTextureViewerExpanded: boolean;
    /** Texture shown in the viewer (`''`: the first one). */
    _activeShaderTextureName: string;
    _shaderStats: ShaderStats;
    // Runtime diagnostics (RuntimeDiagnostics.ts).
    _runtimeDiagnostics: RuntimeDiagnostic[];
    /** Signatures of the listed diagnostics, to skip duplicates. */
    _runtimeDiagnosticSignatures: Set<string>;
    /** Compile diagnostics of the last render (to skip runtime copies of syntax errors). */
    private _lastCompileDiagnostics: Diagnostic[];
    /** Session key of the last render: a render of another key is explicit (dialogs are not suppressed). */
    private _lastRenderedSessionKey: string | null;
    /** How the current document is loaded (`hosted` pages run on the preview origin). */
    private _frameMode: RuntimeBridgeMode;
    /** The hosted page's 'runtime-ready' watchdog (`null` before the first; see `_debounceTimer` about `!`). */
    private _hostedWatchdog: ReturnType<typeof setTimeout> | null;
    // Object inspector (ConsoleManager.ts; see ConsoleHost).
    readonly _consoleInspectRequests: Map<number, PendingConsoleInspect>;
    _consoleInspectSequence: number;

    constructor({
        onCompileStateChange,
        onRequestShaderUniformEdit,
        onRuntimeDiagnosticsChange,
        onTheoryExerciseOpenRequest,
        onTheoryExercisePreviewRequest,
    }: PreviewOptions = {}) {
        this.iframe = document.getElementById('preview-frame') as HTMLIFrameElement | null;
        this.btnAutoRenderToggle = document.getElementById('btn-auto-render-toggle') as HTMLButtonElement | null;
        this.btnRefresh = byId<HTMLButtonElement>('btn-refresh');
        this.btnOpenPreviewTab = document.getElementById('btn-open-preview-tab') as HTMLButtonElement | null;
        this._hostedUrl = '';
        this.btnOpenPreviewTab?.addEventListener('click', () => {
            // The hosted page is a normal page on the preview origin, so it also works on its own tab.
            if (this._frameMode === 'hosted' && this._hostedUrl) window.open(this._hostedUrl, '_blank', 'noopener');
        });
        this.btnCompiledCss = document.getElementById('btn-preview-compiled-css') as HTMLButtonElement | null;
        this.compiledPanel = document.getElementById('preview-compiled-panel') as HTMLElement | null;
        this.compiledMessages = document.getElementById('preview-compiled-messages') as HTMLPreElement | null;
        this.compiledCode = document.getElementById('preview-compiled-code') as HTMLElement | null;
        this._compiledPanelOpen = false;
        this.btnCompiledCss?.addEventListener('click', () => {
            this._compiledPanelOpen = !this._compiledPanelOpen;
            this._applyCompiledPanelState();
        });
        this.btnConsoleOverride = document.getElementById('btn-console-override') as HTMLButtonElement | null;
        this.runtimeStatus = document.getElementById('preview-runtime-status') as HTMLDivElement | null;
        this.consoleResizer = document.getElementById('preview-console-resizer') as HTMLDivElement | null;
        this.consolePanel = document.getElementById('preview-console') as HTMLElement | null;
        this.runtimeTitle = document.getElementById('preview-runtime-title') as HTMLSpanElement | null;
        this.consoleBody = document.getElementById('preview-console-body') as HTMLDivElement | null;
        this.consoleControls = document.getElementById('preview-console-controls') as HTMLDivElement | null;
        this.consoleContent = document.getElementById('preview-console-content') as HTMLDivElement | null;
        this.consoleOutput = document.getElementById('preview-console-output') as HTMLDivElement | null;
        this.consoleEmpty = document.getElementById('preview-console-empty') as HTMLDivElement | null;
        this.consoleCount = document.getElementById('preview-console-count') as HTMLSpanElement | null;
        this.btnClearConsole = document.getElementById('btn-clear-console') as HTMLButtonElement | null;
        this.btnToggleConsole = document.getElementById('btn-toggle-console') as HTMLButtonElement | null;
        this.btnConsoleFontDec = document.getElementById('btn-console-font-dec') as HTMLButtonElement | null;
        this.btnConsoleFontInc = document.getElementById('btn-console-font-inc') as HTMLButtonElement | null;
        this.consoleForm = document.getElementById('preview-console-form') as HTMLFormElement | null;
        this.consoleInput = document.getElementById('preview-console-input') as HTMLInputElement | null;
        this.consoleFilterButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.preview-console-filter'));
        this.shaderEditorControls = document.getElementById('shader-editor-controls') as HTMLElement | null;
        this.shaderEditorControlsBody = document.getElementById('shader-editor-controls-body') as HTMLDivElement | null;
        this.btnToggleShaderControls = document.getElementById('btn-toggle-shader-controls') as HTMLButtonElement | null;
        this.shaderPanel = document.getElementById('preview-shader-panel') as HTMLDivElement | null;
        this.shaderFps = document.getElementById('preview-shader-fps') as HTMLElement | null;
        this.shaderFrame = document.getElementById('preview-shader-frame') as HTMLElement | null;
        this.shaderUpdated = document.getElementById('preview-shader-updated') as HTMLSpanElement | null;
        this.shaderUniformList = document.getElementById('preview-shader-uniform-list') as HTMLDivElement | null;
        this.shaderTexturePanel = document.getElementById('preview-shader-texture-panel') as HTMLElement | null;
        this.shaderTextureSummary = document.getElementById('preview-shader-texture-summary') as HTMLSpanElement | null;
        this.btnToggleShaderTextures = document.getElementById('btn-toggle-shader-textures') as HTMLButtonElement | null;
        this.shaderTextureViewer = document.getElementById('preview-shader-texture-viewer') as HTMLDivElement | null;
        this.shaderTextureTabs = document.getElementById('preview-shader-texture-tabs') as HTMLDivElement | null;
        this.shaderTextureStage = document.getElementById('preview-shader-texture-stage') as HTMLElement | null;
        this.shaderTextureStageEmpty = document.getElementById('preview-shader-texture-stage-empty') as HTMLDivElement | null;
        this.shaderTextureImage = document.getElementById('preview-shader-texture-image') as HTMLImageElement | null;
        this.shaderTextureCaption = document.getElementById('preview-shader-texture-caption') as HTMLElement | null;
        this.shaderCustomList = document.getElementById('preview-shader-custom-list') as HTMLDivElement | null;
        this.shaderCustomEmpty = document.getElementById('preview-shader-custom-empty') as HTMLDivElement | null;
        this.shaderTextureList = document.getElementById('preview-shader-texture-list') as HTMLDivElement | null;
        this.shaderTextureEmpty = document.getElementById('preview-shader-texture-empty') as HTMLDivElement | null;
        this.shaderResolutionSelect = document.getElementById('preview-shader-resolution-select') as HTMLSelectElement | null;
        this.shaderWidthRange = document.getElementById('preview-shader-width-range') as HTMLInputElement | null;
        this.shaderWidthInput = document.getElementById('preview-shader-width-input') as HTMLInputElement | null;
        this.shaderHeightRange = document.getElementById('preview-shader-height-range') as HTMLInputElement | null;
        this.shaderHeightInput = document.getElementById('preview-shader-height-input') as HTMLInputElement | null;
        this.btnShaderTogglePause = document.getElementById('btn-shader-toggle-pause') as HTMLButtonElement | null;
        this.btnShaderReset = document.getElementById('btn-shader-reset') as HTMLButtonElement | null;
        this._debounceTimer = null;
        this._currentTopicPath = null;
        this._lastDocument = null;
        this._lastSessionKey = '';
        this._renderToken = 0;
        this._onCompileStateChange = onCompileStateChange;
        this._onRequestShaderUniformEdit = onRequestShaderUniformEdit;
        this._onRuntimeDiagnosticsChange = onRuntimeDiagnosticsChange;
        this._onTheoryExerciseOpenRequest = onTheoryExerciseOpenRequest;
        this._onTheoryExercisePreviewRequest = onTheoryExercisePreviewRequest;
        this._runtimeMode = 'none';
        this._consoleEnabled = false;
        this._consoleMetadataEnabled = false;
        this._consoleManualOverride = false;
        this._consoleEntries = [];
        this._consoleQueue = [];
        this._consoleFlushScheduled = false;
        this._consoleDroppedCount = 0;
        this._consoleCollapsedGroups = new Set();
        this._consoleRenderedEnabled = null;
        this._consoleSequence = 0;
        this._consoleSessionKey = '';
        this._consoleHistoryBySession = new Map();
        this._consoleHistory = createConsoleHistorySession();
        this._consoleFilters = new Set(['log', 'info', 'warn', 'error']);
        this._consoleFontSize = 12;
        this._consoleCollapsed = false;
        this._consoleCommandId = 0;
        this._autoRenderStorageKey = 'learncode.preview.autoRender';
        this._autoRenderEnabled = this._readAutoRenderEnabled();
        this._shaderControlSessionKey = '';
        this._shaderControls = this._createDefaultShaderControls();
        this._shaderEditorControlsCollapsed = false;
        this._shaderResolutionOptionsSignature = '';
        this._shaderResolutionSelectionValue = '';
        this._shaderCustomUniformsSignature = '';
        this._shaderTexturesSignature = '';
        this._shaderTextureTabsSignature = '';
        this._shaderTextureViewerExpanded = false;
        this._activeShaderTextureName = '';
        this._shaderStats = this._createEmptyShaderStats();
        this._runtimeDiagnostics = [];
        this._runtimeDiagnosticSignatures = new Set();
        this._lastCompileDiagnostics = [];
        this._lastRenderedSessionKey = null;
        this._frameMode = 'srcdoc';
        this._hostedWatchdog = null;
        this._consoleInspectRequests = new Map();
        this._consoleInspectSequence = 0;

        this.btnAutoRenderToggle?.addEventListener('click', () => this.toggleAutoRender());
        this.btnRefresh.addEventListener('click', () => this.renderNow());
        this.btnConsoleOverride?.addEventListener('click', () => this._toggleConsoleOverride());
        this.btnClearConsole?.addEventListener('click', () => this._clearConsoleEntries());
        this.btnToggleConsole?.addEventListener('click', () => this._toggleConsoleCollapsed());
        this.btnConsoleFontDec?.addEventListener('click', () => this._updateConsoleFontSize(-1));
        this.btnConsoleFontInc?.addEventListener('click', () => this._updateConsoleFontSize(1));
        this.consoleForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            this._executeConsoleCommand();
        });
        this.consoleInput?.addEventListener('keydown', (event) => this._handleConsoleInputKeydown(event));
        this.consoleInput?.addEventListener('input', () => this._handleConsoleInputChange());
        this.consoleFilterButtons.forEach((button) => {
            button.addEventListener('click', () => this._toggleConsoleFilter(button.dataset.level || ''));
        });
        this.shaderResolutionSelect?.addEventListener('change', (event) => {
            this._handleShaderResolutionChange((event.target as HTMLSelectElement).value);
        });
        this._bindShaderResolutionAxisControls('width', this.shaderWidthRange, this.shaderWidthInput);
        this._bindShaderResolutionAxisControls('height', this.shaderHeightRange, this.shaderHeightInput);
        this.btnShaderTogglePause?.addEventListener('click', () => this._toggleShaderPause());
        this.btnShaderReset?.addEventListener('click', () => this._resetShaderRuntime());
        this.btnToggleShaderTextures?.addEventListener('click', () => this._toggleShaderTextureViewer());
        this.btnToggleShaderControls?.addEventListener('click', () => this._toggleShaderEditorControlsCollapsed());
        window.addEventListener('message', (event) => this._handleRuntimeMessage(event));
        this._applyConsoleFontSize();
        this._syncConsoleVisibility();
        this._updateAutoRenderUi();
    }

    /** The saved auto-render choice (on unless it was turned off). */
    private _readAutoRenderEnabled(): boolean {
        const stored = window.localStorage.getItem(this._autoRenderStorageKey);
        return stored == null ? true : stored !== '0';
    }

    private _updateAutoRenderUi(): void {
        if (!this.btnAutoRenderToggle) return;

        this.btnAutoRenderToggle.classList.toggle('is-active', this._autoRenderEnabled);
        this.btnAutoRenderToggle.setAttribute('aria-pressed', String(this._autoRenderEnabled));
        this.btnAutoRenderToggle.title = this._autoRenderEnabled
            ? 'Disable automatic preview render'
            : 'Enable automatic preview render';
        this.btnAutoRenderToggle.setAttribute('aria-label', this.btnAutoRenderToggle.title);
    }

    /** Whether edits re-render the preview by themselves. */
    isAutoRenderEnabled(): boolean {
        return this._autoRenderEnabled;
    }

    /** Turns automatic rendering on (rendering now, by default) or off (cancelling a pending render). */
    setAutoRenderEnabled(enabled: boolean, { persist = true, renderIfEnabled = true }: AutoRenderOptions = {}): void {
        this._autoRenderEnabled = Boolean(enabled);

        if (persist) {
            window.localStorage.setItem(this._autoRenderStorageKey, this._autoRenderEnabled ? '1' : '0');
        }

        if (!this._autoRenderEnabled) {
            clearTimeout(this._debounceTimer!);
        } else if (renderIfEnabled) {
            this.renderNow();
        }

        this._updateAutoRenderUi();
    }

    /** Flips automatic rendering (saved) and returns the new state. */
    toggleAutoRender(): boolean {
        this.setAutoRenderEnabled(!this._autoRenderEnabled);
        return this._autoRenderEnabled;
    }

    /** Renders the current document right away, even with auto-render off (the Refresh button). */
    renderNow(): void {
        if (!this._lastDocument) return;
        this._scheduleRender(this._lastDocument, { forceRender: true });
    }

    /**
     * Prepares the console/shader session for the document, then renders it: now when forced, after a
     * 300 ms pause in typing otherwise, never while auto-render is off.
     */
    private _scheduleRender(documentModel: PreviewDocument, { forceRender = false }: { forceRender?: boolean } = {}): void {
        if (!documentModel) return;

        const shaderEnabled = isShaderDocument(documentModel);
        const shaderConfig = shaderEnabled ? getShaderConfig(documentModel) : null;
        const shaderResolution = shaderConfig?.resolution || null;

        this._prepareConsoleSession({
            consoleEnabled: (Boolean(documentModel?.metadata?.console) || this._isScriptOnlyDocument(documentModel)) && !shaderEnabled,
            sessionKey: this._lastSessionKey,
            shaderConfig,
            shaderEnabled,
            shaderResolution,
        });

        clearTimeout(this._debounceTimer!);

        if (!this._autoRenderEnabled && !forceRender) {
            return;
        }

        if (forceRender) {
            this._render(documentModel, { explicit: true });
            return;
        }

        // Typing re-renders are "live" runs: alert/confirm/prompt are replaced by console notices so a
        // modal dialog does not pop up on every pause. Opening an example or pressing Refresh runs it
        // for real.
        const explicit = this._lastRenderedSessionKey !== this._lastSessionKey;
        this._debounceTimer = setTimeout(() => {
            this._render(documentModel, { explicit });
        }, 300);
    }

    /** A single-file example with a script and no markup: it shows the console without asking. */
    private _isScriptOnlyDocument(documentModel: PreviewDocument): boolean {
        if (!documentModel || documentModel.sourceFormat === 'virtual-files' || documentModel.metadata?.framework) return false;
        const blocks = Array.isArray(documentModel.blocks) ? documentModel.blocks : [];
        return blocks.some((block) => block.slot === 'script') && !blocks.some((block) => block.slot === 'markup');
    }

    /** Editor path of the markup file, for mapping runtime errors back to it. */
    private _getMarkupPath(documentModel: PreviewDocument): string {
        const files = Array.isArray(documentModel?.files) ? documentModel.files : [];
        return files.find((file) => file.slot === 'markup')?.path || 'index.html';
    }

    private _applyFrameSandbox(mode: RuntimeBridgeMode): void {
        if (!this.iframe) return;
        const value = mode === 'hosted' ? HOSTED_PREVIEW_SANDBOX : SRCDOC_PREVIEW_SANDBOX;
        if (this.iframe.getAttribute('sandbox') !== value) {
            this.iframe.setAttribute('sandbox', value);
        }
    }

    // srcdoc documents: theory, shaders, and the fallback when the preview host is unavailable.
    private _showSrcdoc(html: string): void {
        if (!this.iframe) return;
        clearTimeout(this._hostedWatchdog!);
        // Order matters: drop `allow-same-origin` before navigating, otherwise a srcdoc document would
        // run with the app's own origin.
        this._applyFrameSandbox('srcdoc');
        this.iframe.srcdoc = html;
        this._frameMode = 'srcdoc';
        this._setOpenInTabUrl('');
    }

    private _setOpenInTabUrl(url: string = ''): void {
        this._hostedUrl = url;
        if (this.btnOpenPreviewTab) this.btnOpenPreviewTab.disabled = !url;
    }

    // Hosted documents live on the preview origin (cross-origin to the app).
    private _showHosted(url: string, { renderToken = this._renderToken, fallbackHtml = null }: HostedShowOptions = {}): void {
        if (!this.iframe) return;
        this._applyFrameSandbox('hosted');
        this._setOpenInTabUrl(url);

        // Safety net: if the hosted document never boots (server not restarted, blocked port…), switch
        // to srcdoc so the learner still sees the example.
        clearTimeout(this._hostedWatchdog!);
        this._hostedWatchdog = setTimeout(() => {
            if (renderToken !== this._renderToken || this._frameMode !== 'hosted') return;
            markHostedPreviewUnavailable();
            if (typeof fallbackHtml === 'function') this._showSrcdoc(fallbackHtml());
        }, HOSTED_READY_TIMEOUT_MS);

        if (this._frameMode === 'hosted' && this.iframe.contentWindow) {
            try {
                // Replace instead of push so re-renders do not pile up in the tab's history.
                this.iframe.contentWindow.location.replace(url);
                return;
            } catch {
                // Fall through to a regular navigation.
            }
        }

        this.iframe.src = url;
        if (this.iframe.hasAttribute('srcdoc')) {
            // Removing srcdoc makes the iframe navigate to its src.
            this.iframe.removeAttribute('srcdoc');
        }
        this._frameMode = 'hosted';
    }

    /** The topic whose assets and exercises relative paths resolve against (`null`: none selected). */
    setTopicPath(topicPath: string | null): void {
        this._currentTopicPath = topicPath;
    }

    /** The canvas size in use, which the editor saves as the example's `resolution`; `null` for other documents. */
    getShaderPersistedState(): ShaderPersistedState | null {
        if (!isShaderDocument(this._lastDocument)) return null;

        const currentResolution = this._shaderControls?.currentResolution
            || this._shaderControls?.baseResolution
            || getShaderConfig(this._lastDocument)?.resolution
            || null;

        if (!currentResolution) {
            return null;
        }

        return {
            resolution: {
                height: currentResolution.height,
                width: currentResolution.width,
            },
        };
    }

    /** Pauses or resumes shader time; `false` (nothing done) when no shader is shown. */
    toggleShaderPause(): boolean {
        if (this._runtimeMode !== 'shader') return false;
        this._toggleShaderPause();
        return true;
    }

    /**
     * The console shortcut: opens the console when there is none (re-rendering so output is captured),
     * otherwise collapses/expands it or turns the manual console off. `false` for shaders or without a document.
     */
    toggleConsole(): boolean {
        if (this._runtimeMode === 'shader' || !this._lastDocument) return false;

        if (this._runtimeMode === 'none') {
            this._consoleManualOverride = true;
            this._consoleEnabled = true;
            this._consoleCollapsed = false;
            this._runtimeMode = 'console';
            this._syncConsoleVisibility();

            if (this._lastDocument) {
                clearTimeout(this._debounceTimer!);
                this._render(this._lastDocument, { explicit: true });
            }
            return true;
        }

        if (this._consoleMetadataEnabled) {
            this._toggleConsoleCollapsed();
            return true;
        }

        if (this._consoleCollapsed) {
            this._toggleConsoleCollapsed();
            return true;
        }

        this._toggleConsoleOverride();
        return true;
    }

    /** Restarts the shader's time and frame count; `false` when no shader is shown. */
    resetShaderRuntime(): boolean {
        if (this._runtimeMode !== 'shader') return false;
        this._resetShaderRuntime();
        return true;
    }

    /** Collapses or expands the shader toolbar over the editor; `false` when no shader is shown. */
    openShaderControls(): boolean {
        if (this._runtimeMode !== 'shader') return false;

        this._shaderEditorControlsCollapsed = !this._shaderEditorControlsCollapsed;
        this._syncShaderEditorControlsState();
        if (!this._shaderEditorControlsCollapsed) {
            this.shaderEditorControls?.scrollIntoView({
                block: 'nearest',
            });
        }
        return true;
    }

    /** Collapses or expands the shader panel and returns its new state; `null` when no shader is shown. */
    openShaderPanel(): 'collapsed' | 'expanded' | null {
        if (this._runtimeMode !== 'shader') return null;

        this._consoleCollapsed = !this._consoleCollapsed;
        this._syncConsoleVisibility();
        return this._consoleCollapsed ? 'collapsed' : 'expanded';
    }

    /** Height in px that shows the whole shader panel (header included), or `null` when it does not apply. */
    getPreferredShaderPanelHeight(): number | null {
        if (this._runtimeMode !== 'shader' || !this.consolePanel || !this.shaderPanel) return null;

        const headerHeight = this.consolePanel.querySelector('.preview-console-header')?.getBoundingClientRect().height || 48;
        const bodyHeight = this.shaderPanel.scrollHeight || 0;
        if (!bodyHeight) return null;

        return Math.ceil(headerHeight + bodyHeight);
    }

    /** Shows a new version of the document (on every edit): renders it as `_scheduleRender` decides. */
    update(documentModel: PreviewDocument, { sessionKey = '' }: PreviewUpdateOptions = {}): void {
        this._lastDocument = documentModel;
        this._lastSessionKey = sessionKey || '';
        this._scheduleRender(documentModel);
    }

    /** `svg` lets a bare SVG document fill the frame (CSS class `is-svg-document`). */
    private _setFrameDisplayMode(mode: 'default' | 'svg' = 'default'): void {
        if (!this.iframe) return;
        this.iframe.classList.toggle('is-svg-document', mode === 'svg');
    }

    /** No document: empties the preview, the console and the diagnostics. */
    clear(): void {
        this._lastDocument = null;
        this._lastSessionKey = '';
        this._renderToken += 1;
        clearTimeout(this._debounceTimer!);
        this._clearRuntimeDiagnostics();
        this._resetConsoleSession();
        this._updateCompiledStyleView([]);
        this._setFrameDisplayMode('default');
        this._showSrcdoc(renderCompiledExampleDocument({}, this._currentTopicPath, [], {
            consoleEnabled: false,
            renderId: this._renderToken,
        }));
        this._emitCompileState([]);
    }

    // Sass examples get a «CSS» toggle that shows the generated CSS and the compiler's
    // @debug/@warn/error lines over the preview.
    private _updateCompiledStyleView(generatedFiles: GeneratedCodeFile[] = []): void {
        const css = generatedFiles.find((file) => file.path === COMPILED_CSS_PATH);
        const messages = generatedFiles.find((file) => file.path === SASS_OUTPUT_PATH);
        const available = generatedFiles.length > 0;
        this.btnCompiledCss?.classList.toggle('hidden', !available);
        if (!available) {
            this._applyCompiledPanelState(false);
            return;
        }
        if (this.compiledCode) {
            this.compiledCode.innerHTML = css
                ? highlightCode(css.content, 'css')
                : '/* No CSS: the Sass code did not compile (see the messages above). */';
        }
        if (this.compiledMessages) {
            this.compiledMessages.textContent = messages?.content || '';
            this.compiledMessages.classList.toggle('hidden', !messages);
        }
        this._applyCompiledPanelState();
    }

    private _applyCompiledPanelState(available: boolean = !this.btnCompiledCss?.classList.contains('hidden')): void {
        const open = Boolean(available && this._compiledPanelOpen);
        this.compiledPanel?.classList.toggle('hidden', !open);
        this.btnCompiledCss?.setAttribute('aria-pressed', open ? 'true' : 'false');
        this.btnCompiledCss?.classList.toggle('is-active', open);
    }

    /**
     * Renders a document into the iframe (see the header of this file) and reports its compile
     * diagnostics. `explicit: false` (a render caused by typing) replaces alert/confirm/prompt with
     * console notices. A newer render makes this one stop at its next `await`.
     */
    async _render(documentModel: PreviewDocument, { explicit = true }: { explicit?: boolean } = {}): Promise<void> {
        const renderToken = ++this._renderToken;
        this._lastRenderedSessionKey = this._lastSessionKey;
        this._clearRuntimeDiagnostics();
        // Each run starts with a clean console (REPL history is kept).
        this._clearConsoleEntries();
        this._rejectPendingConsoleInspects();

        if (isTheoryDocument(documentModel) || isShaderDocument(documentModel)) this._updateCompiledStyleView([]);

        if (isTheoryDocument(documentModel)) {
            this._setFrameDisplayMode('default');
            const content = getTheoryDocumentContent(documentModel);
            const exerciseEmbeds = await loadTheoryExerciseEmbeds(this._currentTopicPath, content);
            if (renderToken !== this._renderToken) return;
            this._showSrcdoc(renderTheoryPreviewDocument(content, {
                exerciseEmbeds,
                renderId: renderToken,
                topicPath: this._currentTopicPath,
            }));
            this._emitCompileState([]);
            return;
        }

        // Not a theory document from here on (isTheoryDocument() does not narrow, hence the casts).
        if (isShaderDocument(documentModel)) {
            this._setFrameDisplayMode('default');
            const shaderConfig = getShaderConfig(documentModel);
            this._resetShaderStats(this._shaderControls?.currentResolution || shaderConfig?.resolution || null);
            this._renderShaderPanel();
            const structuralDiagnostics = documentModel?.diagnostics || [];
            const compileDiagnostics = structuralDiagnostics.some((diagnostic) => diagnostic.level === 'error')
                ? []
                : validateShaderPreviewDocument(documentModel);
            this._showSrcdoc(renderShaderExampleDocument(documentModel, {
                consoleEnabled: false,
                diagnostics: [...structuralDiagnostics, ...compileDiagnostics],
                renderId: renderToken,
                shaderControls: this._shaderControls,
                topicPath: this._currentTopicPath,
            }));
            this._emitCompileState(compileDiagnostics);
            return;
        }

        try {
            // The theory branch above returned, so this document is an example.
            const result: CompileResponse = await compileExample({ document: documentModel as ExampleDocument });
            if (renderToken !== this._renderToken) return;

            const diagnostics = result.compileDiagnostics || [];
            this._updateCompiledStyleView(buildCompiledStyleFiles(documentModel, result));
            const renderOptions: RenderCompiledExampleOptions = {
                consoleEnabled: this._consoleEnabled,
                markupPath: this._getMarkupPath(documentModel),
                renderId: renderToken,
                suppressDialogs: !explicit,
            };
            this._setFrameDisplayMode(result.compiledDocument?.markupType === 'svg' && !result.compiledDocument?.framework ? 'svg' : 'default');
            this._emitCompileState(diagnostics);

            const hostedHtml = renderCompiledExampleDocument(result.compiledDocument, this._currentTopicPath, diagnostics, {
                ...renderOptions,
                hosted: true,
            });
            const hostedUrl = await publishPreviewDocument({
                html: hostedHtml,
                renderId: renderToken,
                topicPath: this._currentTopicPath || '',
            });
            if (renderToken !== this._renderToken) return;

            const renderSrcdoc = () => renderCompiledExampleDocument(result.compiledDocument, this._currentTopicPath, diagnostics, renderOptions);
            if (hostedUrl) {
                this._showHosted(hostedUrl, { fallbackHtml: renderSrcdoc, renderToken });
            } else {
                this._showSrcdoc(renderSrcdoc());
            }
        } catch (err) {
            if (renderToken !== this._renderToken) return;

            const diagnostics: Diagnostic[] = [
                {
                    level: 'error',
                    code: 'preview-compile-request-failed',
                    message: errorMessage(err),
                },
            ];

            this._setFrameDisplayMode('default');
            this._updateCompiledStyleView([]);
            this._showSrcdoc(renderCompiledExampleDocument({}, this._currentTopicPath, diagnostics, {
                consoleEnabled: this._consoleEnabled,
                renderId: renderToken,
            }));
            this._emitCompileState(diagnostics);
        }
    }

    /**
     * Window 'message' listener. `event.data` can come from any window, learner code included: it is read as
     * a protocol message (src/types/runtime.ts) only behind the `source`, sending-window and `renderId`
     * checks, and the fields are still checked one by one before use.
     */
    private _handleRuntimeMessage(event: MessageEvent<PreviewFrameMessage | TheoryPreviewMessage | null | undefined>): void {
        if (event?.data?.source === 'learncode-theory-preview') {
            if (event.source !== this.iframe?.contentWindow) return;
            if (event.data.renderId !== this._renderToken) return;
            const filename = String(event.data.filename || '').trim();
            if (!filename || !this._currentTopicPath) return;

            if (event.data.kind === 'open-exercise') {
                this._onTheoryExerciseOpenRequest?.(this._currentTopicPath, filename);
                return;
            }

            if (event.data.kind === 'preview-exercise') {
                this._onTheoryExercisePreviewRequest?.(this._currentTopicPath, filename);
                return;
            }
        }

        if (!event?.data || event.data.source !== 'learncode-preview') return;
        if (event.source !== this.iframe?.contentWindow) return;
        if (event.data.renderId !== this._renderToken) return;
        if (event.data.kind === 'runtime-ready') {
            clearTimeout(this._hostedWatchdog!);
            return;
        }
        if (event.data.kind === 'shader-stats') {
            if (this._runtimeMode !== 'shader') return;
            this._updateShaderStats(event.data);
            this._renderShaderPanel();
            return;
        }
        if (event.data.kind === 'shader-resize-request') {
            if (this._runtimeMode !== 'shader') return;
            this._applyShaderResolution(event.data.resolution);
            return;
        }

        const data: ConsoleBoundMessage = event.data;
        if (data.kind === 'inspect-result') {
            this._resolveConsoleInspect(data);
            return;
        }

        if (data.kind === 'console-clear') {
            if (!this._consoleEnabled) return;
            this._clearConsoleEntries();
            this._appendConsoleEntry({ kind: 'console-clear', level: 'log', message: 'Console was cleared' });
            return;
        }

        const values = Array.isArray(data.values) ? data.values.map((value) => String(value)) : [];
        const message = (typeof data.text === 'string' ? data.text : values.join(' ')).trim();
        const stackFrames = this._normalizeStackFrames(data.stackFrames);
        const location = this._formatRuntimeLocation(data, stackFrames);
        const isRuntimeDiagnostic = data.kind === 'runtime-error' || data.kind === 'unhandled-rejection';
        const isConsoleError = data.kind === 'console' && data.level === 'error';

        if (data.kind === 'dialog-suppressed') {
            this._registerRuntimeDiagnostic({
                code: 'dialog-skipped',
                level: 'warning',
                message: message || 'Dialog skipped while editing.',
            });
        }

        if ((isRuntimeDiagnostic || isConsoleError) && !this._isDuplicateOfCompileDiagnostic(data)) {
            const primaryFrame = this._getPrimaryRuntimeFrame(data, stackFrames);

            this._registerRuntimeDiagnostic({
                code: data.kind === 'console' ? 'console-error' : data.kind,
                column: primaryFrame?.column || null,
                file: primaryFrame?.path || '',
                level: 'error',
                line: primaryFrame?.line || null,
                location,
                message: message || '(empty)',
            });
        }

        if (!this._consoleEnabled) return;

        this._appendConsoleEntry({
            collapsed: Boolean(data.collapsed),
            groupId: data.groupId || null,
            groups: Array.isArray(data.groups) ? data.groups : [],
            kind: data.kind || 'console',
            level: data.level || 'log',
            location,
            message: message || (Array.isArray(data.parts) && data.parts.length ? '' : '(empty)'),
            method: data.method || '',
            parts: Array.isArray(data.parts) ? data.parts : null,
            stackFrames,
            stackText: typeof data.stackText === 'string' ? data.stackText : '',
            table: data.table && Array.isArray(data.table.header) ? data.table : null,
        });
    }

    /** Where a runtime error points: a mapped frame, else a learner-file frame, else the runtime's `location`. */
    private _getPrimaryRuntimeFrame(data: Pick<RuntimeMessagePosition, 'location'> = {}, stackFrames: NormalizedStackFrame[] = []): PrimaryRuntimeFrame | null {
        // Frames the runtime mapped back to a learner file win (e.g. user code calling a CDN library).
        const mappedFrame = stackFrames.find((frame) => frame?.mapped && frame.path && frame.line);
        if (mappedFrame) return mappedFrame;
        const fromStack = stackFrames.find((frame) => {
            const path = frame?.path || '';
            return path && frame.line && !path.includes('node_modules') && !path.startsWith('/') && !/^https?:/i.test(path);
        });
        if (fromStack) return fromStack;
        const location = data.location;
        if (location && location.path && location.line) {
            return { path: location.path, line: location.line, column: location.column || null };
        }
        return stackFrames[0] || null;
    }

    // The compiler already reports JS/TS syntax errors with exact positions; skip the runtime copy.
    private _isDuplicateOfCompileDiagnostic(data: { errorName?: string } = {}): boolean {
        if (data.errorName !== 'SyntaxError') return false;
        return (this._lastCompileDiagnostics || []).some((diagnostic) => (
            diagnostic?.level === 'error'
            && ['javascript-syntax', 'typescript-transpile'].includes(diagnostic?.code)
        ));
    }

    /** Expands the console/shader panel and toolbar again (the app's layout reset). */
    resetLayoutState(): void {
        this._consoleCollapsed = false;
        this._shaderEditorControlsCollapsed = false;
        this._shaderTextureViewerExpanded = false;
        this._activeShaderTextureName = '';
        this._shaderTextureTabsSignature = '';
        this._syncConsoleVisibility();
    }

    private _emitCompileState(diagnostics: Diagnostic[]): void {
        this._lastCompileDiagnostics = Array.isArray(diagnostics) ? diagnostics : [];
        if (this._onCompileStateChange) {
            this._onCompileStateChange(diagnostics);
        }
    }
}

// Declaration merging: the mixin methods become part of the Preview type.
export interface Preview extends ConsoleManagerMixin, RuntimeDiagnosticsMixin, ShaderControlsMixin {}
type ConsoleManagerMixin = typeof consoleManagerMixin;
type RuntimeDiagnosticsMixin = typeof runtimeDiagnosticsMixin;
type ShaderControlsMixin = typeof shaderControlsMixin;

Object.assign(Preview.prototype, consoleManagerMixin, runtimeDiagnosticsMixin, shaderControlsMixin);

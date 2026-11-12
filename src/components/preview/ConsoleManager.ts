// The console of the editor preview: the panel under the preview (#preview-console) with its entries,
// filters, groups, font size, the object inspector (values expand on click, Chrome-style) and the REPL
// input with per-example history. The same panel holds the shader panel for shader examples
// (ShaderControls.ts): `_runtimeMode` ('none' | 'console' | 'shader') decides what it shows.
//
// A Preview mixin: src/components/Preview.ts copies these methods onto `Preview.prototype`
// (`Object.assign`), so `this` is the Preview and all state is declared there. Preview's
// `_handleRuntimeMessage` turns the iframe's messages (src/types/runtime.ts) into `_appendConsoleEntry`
// calls; this file posts the REPL and inspector commands (`ConsoleCommandMessage`) to the iframe.
//
// Things to know before editing:
// - Entries are rendered in batches: `_appendConsoleEntry` queues, `_flushConsoleQueue` adds the new
//   elements at most once per frame. `_renderConsoleEntries` rebuilds everything (filters, enable/disable).
// - The methods declared with `this: ConsoleHost` (value rendering and the inspector protocol) only use
//   the `ConsoleHost` members. src/components/TheoryExerciseDialog.ts copies exactly those
//   (`ConsoleHostMethodName`) onto its own prototype to get expandable values in its console: keep them
//   free of any other Preview member. Every other method needs a whole Preview.
// - Some `{}` parameter defaults are never used by the callers (kept from the JavaScript version); where the
//   parameter type has required fields, the default is asserted (`{} as …`).

import type { ShaderConfig, ShaderResolution } from '../../types/document.ts';
import type {
    ConsoleEvalCommand,
    ConsoleGetPropertyCommand,
    ConsoleInspectCommand,
    ConsoleLevel,
    ConsoleMessageMethod,
    ConsolePart,
    ConsoleTable,
    InspectorProperty,
    InspectResponse,
    InspectResultMessage,
    RemoteValue,
    RuntimeBridgeMessageKind,
} from '../../types/runtime.ts';
import type { DistributiveOmit } from '../../types/utility.ts';
import {
    createConsoleHistorySession,
    navigateConsoleHistory,
    rememberConsoleCommand,
    resetConsoleHistoryNavigation,
} from '../../utils/consoleHistory.ts';
import type { Preview } from '../Preview.ts';
import type { NormalizedStackFrame } from './RuntimeDiagnostics.ts';

/** Keep the panel bounded: older entries are dropped (and counted) beyond this. */
export const MAX_CONSOLE_ENTRIES = 1000;

/** What produced a console entry: the kind of the runtime message, or `command` for the echo of a REPL line. */
export type ConsoleEntryKind = Exclude<RuntimeBridgeMessageKind, 'inspect-result' | 'runtime-ready'> | 'command';

/** The console filter buttons: `debug` entries count as `log`. */
export type ConsoleFilterLevel = Exclude<ConsoleLevel, 'debug'>;

/** One entry of the console panel. */
export interface ConsoleEntry {
    /** A group header (`groupId`) that starts collapsed (console.groupCollapsed). */
    collapsed: boolean;
    /** The rendered `<div>`: `null` until the next flush or rebuild renders it, and once the entry is dropped. */
    element: HTMLDivElement | null;
    /** Set on console.group headers: the id that later entries list in `groups`. */
    groupId: number | null;
    /** Ids of the open groups this entry is nested in, outermost first. */
    groups: number[];
    /** Number of the entry in the current run (from 1). */
    id: number;
    kind: ConsoleEntryKind;
    level: ConsoleLevel;
    /** `path:line:column` shown at the right (`''` when unknown). */
    location: string;
    /** Plain text, shown when there are no `parts`. */
    message: string;
    /** Console method or runtime notice (`trace`, `form-submit`…), `''` for other entries. */
    method: ConsoleMessageMethod | '';
    /** Styled text and inspectable values; `null` when the entry is plain text. */
    parts: ConsolePart[] | null;
    /** Identical consecutive entries are merged and counted here (the badge). */
    repeatedCount: number;
    stackFrames: NormalizedStackFrame[];
    stackText: string;
    table: ConsoleTable | null;
    /** The filter button that shows the entry. */
    filterLevel: ConsoleFilterLevel;
    /** `repeatedCount` changed since the badge was last drawn. */
    badgeDirty?: boolean;
    /** Dropped from the list (over MAX_CONSOLE_ENTRIES): a pending flush skips it. */
    removed?: boolean;
}

/** What `_appendConsoleEntry` accepts: the descriptive fields of an entry, all optional. */
export type ConsoleEntryInput = Partial<Pick<ConsoleEntry,
    'collapsed' | 'groupId' | 'groups' | 'kind' | 'level' | 'location' | 'message' | 'method' | 'parts' | 'stackFrames' | 'stackText' | 'table'>>;

/** Input of `_prepareConsoleSession`: the document about to be shown. */
export interface ConsoleSessionOptions {
    /** The document asks for a console (`console` metadata, or a script-only example). */
    consoleEnabled: boolean;
    /** Identifies the example; a new key starts a new session (console cleared, REPL history swapped, manual console off). */
    sessionKey: string;
    shaderEnabled?: boolean;
    /** The document's shader resolution (`null` when it has none). */
    shaderResolution?: ShaderResolution | null;
    shaderConfig?: ShaderConfig | null;
}

/** Options of `_renderConsoleValue`. */
export interface ConsoleValueOptions {
    /** Property name to show before the value (`null`: a bare value). */
    keyName?: string | null;
    /** The key is an internal slot ([[Prototype]], [[Entries]]…). */
    internal?: boolean;
    /** The key is not enumerable. */
    dimmed?: boolean;
    /** Handle to send as the `receiver` when the value is expanded (see `ConsoleInspectCommand.receiver`). */
    receiver?: number | null;
}

/** An inspector command before `_requestConsoleInspect` adds `source`, `renderId` and `requestId`. */
export type ConsoleInspectRequest = DistributiveOmit<ConsoleInspectCommand | ConsoleGetPropertyCommand, 'source' | 'renderId' | 'requestId'>;

/** An inspector request waiting for the iframe's 'inspect-result' (or for its 4 s timeout). */
export interface PendingConsoleInspect {
    resolve: (response: InspectResponse) => void;
    timer: ReturnType<typeof setTimeout>;
}

/** The methods of `consoleManagerMixin` that only need a `ConsoleHost` (the ones TheoryExerciseDialog borrows). */
export type ConsoleHostMethodName =
    | '_createConsoleValueSpan'
    | '_rejectPendingConsoleInspects'
    | '_renderConsoleParts'
    | '_renderConsoleProperty'
    | '_renderConsoleValue'
    | '_requestConsoleInspect'
    | '_resolveConsoleInspect'
    | '_sanitizeConsoleStyle';

/**
 * What the value rendering and inspector methods of the console (`ConsoleHostMethodName`) need from the
 * object they run on. `Preview` is one; `TheoryExerciseDialog` is another: it declares these four fields
 * and copies those methods from `consoleManagerMixin` onto its prototype.
 */
export interface ConsoleHost extends Pick<ConsoleManagerMixin, ConsoleHostMethodName> {
    /** The preview iframe the inspector commands are posted to (`null`: requests fail with an error answer). */
    readonly iframe: HTMLIFrameElement | null;
    /** `renderId` of the document in `iframe`; stamped on every command (the runtime ignores other ids). */
    readonly _renderToken: number;
    /** Requests waiting for an answer, by `requestId`. */
    readonly _consoleInspectRequests: Map<number, PendingConsoleInspect>;
    /** Last `requestId` used. */
    _consoleInspectSequence: number;
}

type ConsoleManagerMixin = typeof consoleManagerMixin;

export const consoleManagerMixin = {
    /**
     * Sets the console up for the document about to render: a new `sessionKey` clears the console and
     * swaps in that example's REPL history; then picks the runtime mode (shader panel, console or none)
     * and, for shaders, merges the document's uniforms and textures into the panel state.
     */
    _prepareConsoleSession({ consoleEnabled, sessionKey, shaderEnabled = false, shaderResolution = null, shaderConfig = null }: ConsoleSessionOptions): void {
        const normalizedSessionKey = String(sessionKey || '').trim() || '__draft__';
        const previousMode = this._runtimeMode;
        const shaderSessionChanged = normalizedSessionKey !== this._shaderControlSessionKey;

        if (normalizedSessionKey !== this._consoleSessionKey) {
            this._clearConsoleEntries();
            this._consoleSessionKey = normalizedSessionKey;
            this._consoleManualOverride = false;
            this._restoreConsoleHistorySession(normalizedSessionKey);
            this._resetShaderStats(shaderResolution);
        }

        if (shaderEnabled) {
            this._consoleMetadataEnabled = false;
            this._consoleManualOverride = false;
            this._consoleEnabled = false;
            this._runtimeMode = 'shader';
            this._syncShaderControls({
                customUniforms: shaderConfig?.customUniforms || [],
                textures: shaderConfig?.textures || [],
                reset: shaderSessionChanged || previousMode !== 'shader',
                resolution: shaderResolution,
                sessionKey: normalizedSessionKey,
            });
            if (previousMode !== 'shader') {
                this._clearConsoleEntries();
            }
            this._resetShaderStats(this._shaderControls?.currentResolution || shaderResolution);
        } else {
            this._consoleMetadataEnabled = Boolean(consoleEnabled);
            this._consoleEnabled = this._consoleMetadataEnabled || this._consoleManualOverride;
            this._runtimeMode = this._consoleEnabled ? 'console' : 'none';
            if (previousMode === 'shader') {
                this._shaderControlSessionKey = '';
                this._shaderControls = this._createDefaultShaderControls();
                this._resetShaderStats(null);
            }
        }

        this._syncConsoleVisibility();
    },

    /** Back to the initial state (no document): no console, no shader panel, empty REPL history. */
    _resetConsoleSession(): void {
        this._consoleSessionKey = '';
        this._consoleHistory = createConsoleHistorySession();
        this._runtimeMode = 'none';
        this._consoleMetadataEnabled = false;
        this._consoleManualOverride = false;
        this._consoleEnabled = false;
        this._clearConsoleEntries();
        this._shaderControlSessionKey = '';
        this._shaderControls = this._createDefaultShaderControls();
        this._shaderResolutionOptionsSignature = '';
        this._shaderResolutionSelectionValue = '';
        this._shaderCustomUniformsSignature = '';
        this._shaderTexturesSignature = '';
        this._shaderTextureTabsSignature = '';
        this._shaderTextureViewerExpanded = false;
        this._activeShaderTextureName = '';
        this._resetShaderStats(null);
        this._syncConsoleVisibility();
    },

    /** Removes every entry (the REPL history is kept). */
    _clearConsoleEntries(): void {
        this._consoleEntries = [];
        this._consoleQueue = [];
        this._consoleSequence = 0;
        this._consoleDroppedCount = 0;
        this._consoleCollapsedGroups = new Set();
        this._renderConsoleEntries();
    },

    /** Loads the REPL history of an example (empty the first time) and clears the input. */
    _restoreConsoleHistorySession(sessionKey: string = ''): void {
        const normalizedSessionKey = String(sessionKey || '').trim() || '__draft__';
        const storedSession = this._consoleHistoryBySession.get(normalizedSessionKey);
        this._consoleHistory = createConsoleHistorySession(storedSession);

        if (this.consoleInput) {
            this.consoleInput.value = '';
        }
    },

    _persistConsoleHistorySession(): void {
        const normalizedSessionKey = String(this._consoleSessionKey || '').trim() || '__draft__';
        this._consoleHistoryBySession.set(normalizedSessionKey, createConsoleHistorySession(this._consoleHistory));
    },

    /** Sets the REPL input and puts the caret at the end. */
    _setConsoleInputValue(value: string = ''): void {
        if (!this.consoleInput) return;
        this.consoleInput.value = value;
        const nextPosition = this.consoleInput.value.length;
        this.consoleInput.setSelectionRange(nextPosition, nextPosition);
    },

    _handleConsoleInputChange(): void {
        if (!this.consoleInput) return;

        this._consoleHistory = resetConsoleHistoryNavigation(this._consoleHistory, this.consoleInput.value);
        this._persistConsoleHistorySession();
    },

    /** ArrowUp/ArrowDown in the REPL input walk the history. */
    _handleConsoleInputKeydown(event: KeyboardEvent): void {
        if (!this._consoleEnabled || !this.consoleInput) return;
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;

        const direction = event.key === 'ArrowUp' ? -1 : 1;
        const result = navigateConsoleHistory(this._consoleHistory, this.consoleInput.value, direction);
        if (!result.changed) return;

        event.preventDefault();
        this._consoleHistory = result.session;
        this._persistConsoleHistorySession();
        this._setConsoleInputValue(result.value);
    },

    /** Shows the panel as the console, the shader panel or nothing (`_runtimeMode`), expanded or collapsed. */
    _syncConsoleVisibility(): void {
        if (!this.consolePanel || !this.consoleBody || !this.btnToggleConsole) return;

        const isConsoleMode = this._runtimeMode === 'console';
        const isShaderMode = this._runtimeMode === 'shader';
        const hasRuntimePanel = isConsoleMode || isShaderMode;
        const panelLabel = isShaderMode ? 'shader panel' : 'console';

        this.consolePanel.classList.toggle('hidden', !hasRuntimePanel);
        this.consolePanel.classList.toggle('is-collapsed', this._consoleCollapsed && hasRuntimePanel);
        this.consoleBody.classList.toggle('hidden', this._consoleCollapsed || !hasRuntimePanel);
        this.consoleResizer?.classList.toggle('hidden', !hasRuntimePanel || this._consoleCollapsed);
        this.consoleControls?.classList.toggle('hidden', !isConsoleMode || this._consoleCollapsed);
        this.consoleContent?.classList.toggle('hidden', !isConsoleMode);
        this.shaderEditorControls?.classList.toggle('hidden', !isShaderMode);
        this.shaderPanel?.classList.toggle('hidden', !isShaderMode);
        if (this.runtimeTitle) {
            this.runtimeTitle.textContent = isShaderMode ? 'Shader' : 'Console';
        }

        this.btnToggleConsole.title = this._consoleCollapsed ? `Expand ${panelLabel}` : `Collapse ${panelLabel}`;
        this.btnToggleConsole.setAttribute('aria-label', this.btnToggleConsole.title);
        this.btnToggleConsole.setAttribute('aria-expanded', String(!this._consoleCollapsed));
        this._syncShaderEditorControlsState();
        this._syncConsoleOverrideButton();
        if (isShaderMode) {
            this._renderShaderPanel();
            return;
        }

        // Only rebuild when the console switched between enabled/disabled; this runs on every keystroke.
        if (this._consoleRenderedEnabled !== this._consoleEnabled) {
            this._renderConsoleEntries();
        }
    },

    /** The Console button: automatic (metadata), manual on/off, or disabled (no document, shader). */
    _syncConsoleOverrideButton(): void {
        if (!this.btnConsoleOverride) return;

        const isShaderMode = this._runtimeMode === 'shader';
        const hasDocument = Boolean(this._lastDocument);
        const isAuto = this._consoleMetadataEnabled;
        const isManual = !isAuto && this._consoleManualOverride;

        this.btnConsoleOverride.classList.toggle('hidden', isShaderMode);
        this.btnConsoleOverride.disabled = !hasDocument || isAuto || isShaderMode;
        this.btnConsoleOverride.classList.toggle('is-active', isAuto || isManual);
        this.btnConsoleOverride.classList.toggle('is-auto', isAuto);
        this.btnConsoleOverride.setAttribute('aria-pressed', String(isAuto || isManual));

        if (isShaderMode) {
            this.btnConsoleOverride.textContent = 'Shader Panel';
            this.btnConsoleOverride.title = 'Shader documents use the shader panel instead of the console';
            return;
        }

        if (!hasDocument) {
            this.btnConsoleOverride.textContent = 'Console';
            this.btnConsoleOverride.title = 'Load an example to use the console';
            return;
        }

        if (isAuto) {
            this.btnConsoleOverride.textContent = 'Console Auto';
            this.btnConsoleOverride.title = 'Console enabled by Markdown metadata';
            return;
        }

        if (isManual) {
            this.btnConsoleOverride.textContent = 'Hide Console';
            this.btnConsoleOverride.title = 'Disable manual console for this example';
            return;
        }

        this.btnConsoleOverride.textContent = 'Open Console';
        this.btnConsoleOverride.title = 'Enable console for this example only';
    },

    /** Turns the manual console on or off for an example without `console` metadata, and re-renders. */
    _toggleConsoleOverride(): void {
        if (!this._lastDocument || this._consoleMetadataEnabled || this._runtimeMode === 'shader') return;

        this._consoleManualOverride = !this._consoleManualOverride;
        this._consoleEnabled = this._consoleMetadataEnabled || this._consoleManualOverride;
        this._runtimeMode = this._consoleEnabled ? 'console' : 'none';

        if (!this._consoleEnabled) {
            this._clearConsoleEntries();
        }

        this._syncConsoleVisibility();

        if (this._lastDocument) {
            clearTimeout(this._debounceTimer!); // `!`: see `_debounceTimer` in Preview.ts
            this._render(this._lastDocument);
        }
    },

    _getConsoleFilterLevel(entry: Partial<Pick<ConsoleEntry, 'level'>> = {}): ConsoleFilterLevel {
        if (entry.level === 'warn' || entry.level === 'error' || entry.level === 'info') return entry.level;
        return 'log';
    },

    /**
     * Adds an entry (or bumps the count of an identical previous one) and schedules its rendering. Beyond
     * MAX_CONSOLE_ENTRIES the oldest entries are dropped.
     */
    _appendConsoleEntry(entry: ConsoleEntryInput = {}): void {
        // `filterLevel` is set right below (it is computed from the entry).
        const nextEntry = {
            collapsed: Boolean(entry.collapsed),
            element: null,
            groupId: entry.groupId || null,
            groups: Array.isArray(entry.groups) ? entry.groups : [],
            id: ++this._consoleSequence,
            kind: entry.kind || 'console',
            level: entry.level || 'log',
            location: entry.location || '',
            message: entry.message || '',
            method: entry.method || '',
            parts: Array.isArray(entry.parts) && entry.parts.length > 0 ? entry.parts : null,
            repeatedCount: 1,
            stackFrames: Array.isArray(entry.stackFrames) ? entry.stackFrames : [],
            stackText: entry.stackText || '',
            table: entry.table || null,
        } as ConsoleEntry;
        nextEntry.filterLevel = this._getConsoleFilterLevel(nextEntry);
        if (!nextEntry.parts && !nextEntry.message) nextEntry.message = '(empty)';

        const previousEntry = this._consoleEntries.at(-1);
        if (this._canMergeConsoleEntries(previousEntry, nextEntry)) {
            // `!`: there is no merge without a previous entry.
            previousEntry!.repeatedCount += 1;
            previousEntry!.badgeDirty = true;
            this._consoleQueue.push(previousEntry!);
            this._scheduleConsoleFlush();
            return;
        }

        if (nextEntry.groupId && nextEntry.collapsed) {
            this._consoleCollapsedGroups.add(nextEntry.groupId);
        }

        this._consoleEntries.push(nextEntry);
        this._consoleQueue.push(nextEntry);

        while (this._consoleEntries.length > MAX_CONSOLE_ENTRIES) {
            const removed = this._consoleEntries.shift()!; // the list is longer than MAX_CONSOLE_ENTRIES here
            removed.removed = true;
            removed.element?.remove();
            removed.element = null;
            this._consoleDroppedCount += 1;
        }

        this._scheduleConsoleFlush();
    },

    /** Consecutive entries merge when they look the same and nothing in them can differ (tables, groups, objects, REPL). */
    _canMergeConsoleEntries(previousEntry: ConsoleEntry | null | undefined, nextEntry: ConsoleEntry | null | undefined): boolean {
        if (!previousEntry || !nextEntry) return false;
        if (previousEntry.table || nextEntry.table || previousEntry.groupId || nextEntry.groupId) return false;
        if (nextEntry.kind === 'command' || nextEntry.kind === 'command-result') return false;
        // Expandable objects may differ even when their previews match.
        if (this._consoleEntryHasHandles(previousEntry) || this._consoleEntryHasHandles(nextEntry)) return false;

        return previousEntry.kind === nextEntry.kind
            && previousEntry.level === nextEntry.level
            && previousEntry.location === nextEntry.location
            && this._consoleEntryText(previousEntry) === this._consoleEntryText(nextEntry)
            && previousEntry.groups.join(',') === nextEntry.groups.join(',');
    },

    _consoleEntryHasHandles(entry: ConsoleEntry | null | undefined): boolean {
        return Boolean(entry?.parts?.some((part) => part.kind === 'value' && part.value?.handle));
    },

    _consoleEntryText(entry: ConsoleEntry | null | undefined): string {
        if (!entry?.parts) return entry?.message || '';
        return entry.parts.map((part) => (part.kind === 'text' ? part.text : part.value?.preview || '')).join('');
    },

    _scheduleConsoleFlush(): void {
        if (this._consoleFlushScheduled) return;
        this._consoleFlushScheduled = true;
        const flush = () => this._flushConsoleQueue();
        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function' && document.visibilityState !== 'hidden') {
            window.requestAnimationFrame(flush);
        } else {
            setTimeout(flush, 32);
        }
    },

    // Batched, incremental DOM updates: at most one pass per frame regardless of how many messages
    // arrived, and only new entries are created.
    _flushConsoleQueue(): void {
        this._consoleFlushScheduled = false;
        const queue = this._consoleQueue;
        this._consoleQueue = [];
        if (!this.consoleOutput || !this._consoleEnabled) return;
        if (this._consoleRenderedEnabled !== true) {
            this._renderConsoleEntries();
            return;
        }

        const output = this.consoleOutput;
        const stickToBottom = output.scrollHeight - output.scrollTop - output.clientHeight < 40;
        const fragment = document.createDocumentFragment();

        queue.forEach((entry) => {
            if (entry.removed) return;
            if (entry.element) {
                if (entry.badgeDirty) this._updateConsoleEntryBadge(entry);
                return;
            }
            fragment.appendChild(this._createConsoleEntryElement(entry));
        });

        if (fragment.childNodes.length > 0) {
            if (this.consoleEmpty?.parentNode === output) this.consoleEmpty.remove();
            output.appendChild(fragment);
        }

        this._updateConsoleSummary();
        if (stickToBottom) output.scrollTop = output.scrollHeight;
    },

    /** Passes the level filters and is not inside a collapsed group. */
    _isConsoleEntryVisible(entry: ConsoleEntry): boolean {
        if (!this._consoleFilters.has(entry.filterLevel)) return false;
        return !entry.groups.some((groupId) => this._consoleCollapsedGroups.has(groupId));
    },

    _toggleConsoleCollapsed(): void {
        if (this._runtimeMode === 'none') return;

        this._consoleCollapsed = !this._consoleCollapsed;
        this._syncConsoleVisibility();
    },

    /** A filter button: `all` turns every level on (or all off when they already are on). */
    _toggleConsoleFilter(level: string): void {
        if (!['all', 'log', 'info', 'warn', 'error'].includes(level)) return;

        if (level === 'all') {
            const shouldEnableAll = this._consoleFilters.size !== 4;
            this._consoleFilters = shouldEnableAll
                ? new Set(['log', 'info', 'warn', 'error'])
                : new Set();
            this._renderConsoleEntries();
            return;
        }

        // `level` is one of the four levels here (checked above; `includes` does not narrow).
        if (this._consoleFilters.has(level as ConsoleFilterLevel)) {
            this._consoleFilters.delete(level as ConsoleFilterLevel);
        } else {
            this._consoleFilters.add(level as ConsoleFilterLevel);
        }

        this._renderConsoleEntries();
    },

    _toggleConsoleGroup(entry: ConsoleEntry | null | undefined): void {
        if (!entry?.groupId) return;
        if (this._consoleCollapsedGroups.has(entry.groupId)) {
            this._consoleCollapsedGroups.delete(entry.groupId);
        } else {
            this._consoleCollapsedGroups.add(entry.groupId);
        }
        this._consoleEntries.forEach((item) => {
            if (item.element) item.element.hidden = !this._isConsoleEntryVisible(item);
            if (item.groupId && item.element) {
                item.element.classList.toggle('is-group-collapsed', this._consoleCollapsedGroups.has(item.groupId));
            }
        });
        this._updateConsoleSummary();
    },

    _applyConsoleFontSize(): void {
        if (!this.consolePanel) return;
        this.consolePanel.style.setProperty('--preview-console-font-size', `${this._consoleFontSize}px`);
    },

    /** Changes the console font size by `delta` px, within 11–18 px. */
    _updateConsoleFontSize(delta: number): void {
        const nextSize = Math.max(11, Math.min(18, this._consoleFontSize + delta));
        if (nextSize === this._consoleFontSize) return;

        this._consoleFontSize = nextSize;
        this._applyConsoleFontSize();
    },

    /** Sends the REPL line to the iframe (the answer arrives as a 'command-result'/'command-error' message). */
    _executeConsoleCommand(): void {
        if (!this._consoleEnabled || !this.consoleInput) return;

        const command = this.consoleInput.value.trim();
        if (!command) return;

        this._consoleHistory = rememberConsoleCommand(this._consoleHistory, command);
        this._persistConsoleHistorySession();

        const commandId = `cmd-${Date.now()}-${++this._consoleCommandId}`;
        this._appendConsoleEntry({
            kind: 'command',
            level: 'info',
            location: '',
            message: `> ${command}`,
        });

        if (!this.iframe?.contentWindow) {
            this._appendConsoleEntry({
                kind: 'command-error',
                level: 'error',
                location: '',
                message: 'Preview frame is not ready yet.',
            });
            return;
        }

        this.iframe.contentWindow.postMessage({
            action: 'eval',
            source: 'learncode-console-command',
            renderId: this._renderToken,
            command,
            commandId,
        } satisfies ConsoleEvalCommand, '*');

        this._setConsoleInputValue('');
    },

    // ─── Inspector protocol (parent side) ─────────────────

    /**
     * Sends an inspector command to the iframe. Resolves with its answer, or with an `ok: false` answer
     * after 4 s, when the frame is missing, or when the preview re-renders first.
     */
    _requestConsoleInspect(this: ConsoleHost, payload: ConsoleInspectRequest = {} as ConsoleInspectRequest): Promise<InspectResponse> {
        const requestId = ++this._consoleInspectSequence;
        return new Promise((resolve) => {
            const timer = setTimeout(() => {
                this._consoleInspectRequests.delete(requestId);
                resolve({ ok: false, error: 'The preview did not answer (it may be busy or was re-rendered).' });
            }, 4000);
            this._consoleInspectRequests.set(requestId, { resolve, timer });

            try {
                // `!`: a missing frame or window throws here, and the catch answers the request.
                this.iframe!.contentWindow!.postMessage({
                    ...payload,
                    requestId,
                    renderId: this._renderToken,
                    source: 'learncode-console-command',
                } satisfies ConsoleInspectCommand | ConsoleGetPropertyCommand, '*');
            } catch (error) {
                clearTimeout(timer);
                this._consoleInspectRequests.delete(requestId);
                resolve({ ok: false, error: (error as Error | null | undefined)?.message || 'Preview frame is not available.' });
            }
        });
    },

    /** Answers the pending request an 'inspect-result' message belongs to (ignored when it already timed out). */
    _resolveConsoleInspect(this: ConsoleHost, data: InspectResultMessage = {} as InspectResultMessage): void {
        const request = this._consoleInspectRequests.get(data.requestId);
        if (!request) return;
        clearTimeout(request.timer);
        this._consoleInspectRequests.delete(data.requestId);
        request.resolve(data);
    },

    /** Answers every pending request with an error (the document they were about is gone). */
    _rejectPendingConsoleInspects(this: ConsoleHost): void {
        if (!(this._consoleInspectRequests instanceof Map)) return;
        this._consoleInspectRequests.forEach((request) => {
            clearTimeout(request.timer);
            request.resolve({ ok: false, error: 'The preview was re-rendered.' });
        });
        this._consoleInspectRequests.clear();
    },

    // ─── Rendering ────────────────────────────────────────

    /** Rebuilds the whole list (and the filter buttons, count and empty message). */
    _renderConsoleEntries(): void {
        if (!this.consoleOutput || !this.consoleEmpty || !this.consoleCount || !this.btnClearConsole) return;

        this._consoleQueue = [];
        this.consoleOutput.innerHTML = '';
        this.consoleFilterButtons.forEach((button) => {
            const level = button.dataset.level || '';
            const active = level === 'all'
                ? this._consoleFilters.size === 4
                : this._consoleFilters.has(level as ConsoleFilterLevel);
            button.classList.toggle('active', active);
        });

        this._consoleEntries.forEach((entry) => {
            entry.element = null;
        });
        this._consoleRenderedEnabled = this._consoleEnabled;

        if (!this._consoleEnabled) {
            this.consoleEmpty.textContent = 'Console disabled for this example.';
            this.consoleOutput.appendChild(this.consoleEmpty);
            this.consoleCount.textContent = '0 entries';
            this.btnClearConsole.disabled = true;
            return;
        }

        const fragment = document.createDocumentFragment();
        this._consoleEntries.forEach((entry) => fragment.appendChild(this._createConsoleEntryElement(entry)));
        this.consoleOutput.appendChild(fragment);
        this._updateConsoleSummary();
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    },

    /** Entry count (`N entries`, `visible/total visible`, dropped ones) and the empty-list message. */
    _updateConsoleSummary(): void {
        if (!this.consoleCount || !this.btnClearConsole || !this.consoleEmpty || !this.consoleOutput) return;

        const total = this._consoleEntries.length;
        const visible = this._consoleEntries.filter((entry) => this._isConsoleEntryVisible(entry)).length;
        const dropped = this._consoleDroppedCount
            ? ` (+${this._consoleDroppedCount} older dropped)`
            : '';

        if (total === 0 || visible === 0) {
            this.consoleEmpty.textContent = total === 0 ? 'No runtime messages yet.' : 'No messages for the current filters.';
            if (this.consoleEmpty.parentNode !== this.consoleOutput) this.consoleOutput.prepend(this.consoleEmpty);
        } else if (this.consoleEmpty.parentNode === this.consoleOutput) {
            this.consoleEmpty.remove();
        }

        this.consoleCount.textContent = visible === total
            ? `${total} entr${total === 1 ? 'y' : 'ies'}${dropped}`
            : `${visible}/${total} visible${dropped}`;
        this.btnClearConsole.disabled = total === 0;
    },

    _updateConsoleEntryBadge(entry: ConsoleEntry): void {
        entry.badgeDirty = false;
        const badge = entry.element?.querySelector<HTMLSpanElement>('.preview-console-entry-badge');
        if (!badge) return;
        badge.textContent = String(entry.repeatedCount);
        badge.hidden = entry.repeatedCount < 2;
    },

    /** The element of an entry: row (group toggle, message, repeat badge, location), table and stack. */
    _createConsoleEntryElement(entry: ConsoleEntry): HTMLDivElement {
        const item = document.createElement('div');
        item.className = `preview-console-entry ${entry.level} kind-${entry.kind}${entry.method ? ` method-${entry.method}` : ''}`;
        item.style.setProperty('--console-indent', String(entry.groups.length));
        item.hidden = !this._isConsoleEntryVisible(entry);

        const row = document.createElement('div');
        row.className = 'preview-console-entry-row';

        if (entry.groupId) {
            item.classList.add('is-group-header');
            item.classList.toggle('is-group-collapsed', this._consoleCollapsedGroups.has(entry.groupId));
            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'preview-console-group-toggle';
            toggle.setAttribute('aria-label', 'Toggle group');
            toggle.addEventListener('click', () => this._toggleConsoleGroup(entry));
            row.appendChild(toggle);
        }

        const message = document.createElement('div');
        message.className = 'preview-console-entry-message';
        if (entry.parts) {
            this._renderConsoleParts(message, entry.parts);
        } else {
            message.textContent = entry.message;
        }
        row.appendChild(message);

        const badge = document.createElement('span');
        badge.className = 'preview-console-entry-badge';
        badge.textContent = String(entry.repeatedCount);
        badge.hidden = entry.repeatedCount < 2;
        row.appendChild(badge);

        if (entry.location) {
            const location = document.createElement('span');
            location.className = 'preview-console-entry-location';
            location.textContent = entry.location;
            location.title = entry.location;
            row.appendChild(location);
        }

        item.appendChild(row);

        if (entry.table) {
            item.appendChild(this._renderConsoleTable(entry.table));
        }

        if (entry.stackFrames.length > 0) {
            const stack = document.createElement('div');
            stack.className = 'preview-console-entry-stack';
            const limit = entry.method === 'trace' ? 12 : 6;

            entry.stackFrames.slice(0, limit).forEach((frame) => {
                const frameRow = document.createElement('div');
                frameRow.className = 'preview-console-entry-stack-frame';
                const parts: string[] = [];
                if (frame.functionName) parts.push(frame.functionName);
                if (frame.path) {
                    let location = frame.path;
                    if (frame.line) {
                        location += `:${frame.line}`;
                        if (frame.column) location += `:${frame.column}`;
                    }
                    parts.push(location);
                } else if (frame.raw) {
                    parts.push(frame.raw);
                }
                frameRow.textContent = `at ${parts.join(' • ')}`;
                stack.appendChild(frameRow);
            });

            item.appendChild(stack);
        }

        entry.element = item;
        entry.badgeDirty = false;
        return item;
    },

    /** Appends a console line to `container`: styled text runs and expandable values. */
    _renderConsoleParts(this: ConsoleHost, container: HTMLElement, parts: ConsolePart[] = []): void {
        parts.forEach((part) => {
            if (part.kind === 'text') {
                const span = document.createElement('span');
                span.className = 'console-text';
                span.textContent = part.text;
                if (part.style) {
                    const style = this._sanitizeConsoleStyle(part.style);
                    if (style) span.style.cssText = style;
                }
                container.appendChild(span);
                return;
            }

            if (part.kind === 'value' && part.value) {
                container.appendChild(this._renderConsoleValue(part.value, {}));
            }
        });
    },

    /**
     * The declarations of a `%c` style that are safe to apply: typography, colors, borders, spacing and
     * inline display only; nothing that loads URLs or runs code.
     */
    _sanitizeConsoleStyle(this: ConsoleHost, style: string = ''): string {
        const allowed = /^(color|background|background-color|font-weight|font-style|font-size|font-family|text-decoration|text-transform|letter-spacing|line-height|text-shadow|opacity|border-radius|border(-(top|right|bottom|left))?(-(color|width|style))?|padding(-(top|right|bottom|left))?|margin(-(top|right|bottom|left))?|display)$/i;
        return String(style)
            .split(';')
            .map((declaration) => declaration.trim())
            .filter(Boolean)
            .filter((declaration) => {
                const separator = declaration.indexOf(':');
                if (separator <= 0) return false;
                const property = declaration.slice(0, separator).trim();
                const value = declaration.slice(separator + 1);
                if (!allowed.test(property)) return false;
                if (/url\s*\(|expression|@import|javascript:/i.test(value)) return false;
                if (/^display$/i.test(property) && !/^\s*(inline|inline-block|block)\s*$/i.test(value)) return false;
                return true;
            })
            .join('; ');
    },

    /** The one-line preview of a value, classed by its type (`console-number`, `console-array`…). */
    _createConsoleValueSpan(this: ConsoleHost, value: Partial<RemoteValue> = {}): HTMLSpanElement {
        const span = document.createElement('span');
        const type = value.subtype || value.type || 'object';
        span.className = `console-value console-${type}`;
        span.textContent = value.preview ?? '';
        return span;
    },

    // An expandable remote object. Children are fetched from the iframe on first expansion.
    _renderConsoleValue(
        this: ConsoleHost,
        value: Partial<RemoteValue> = {},
        { keyName = null, internal = false, dimmed = false, receiver = null }: ConsoleValueOptions = {},
    ): HTMLSpanElement {
        const keyMarkup = () => {
            if (keyName === null) return null;
            const key = document.createElement('span');
            key.className = `console-key${internal ? ' is-internal' : ''}${dimmed ? ' is-dimmed' : ''}`;
            key.textContent = keyName;
            const fragment = document.createDocumentFragment();
            fragment.appendChild(key);
            fragment.appendChild(document.createTextNode(': '));
            return fragment;
        };

        if (!value.handle) {
            const plain = document.createElement('span');
            plain.className = 'console-tree-leaf';
            const key = keyMarkup();
            if (key) plain.appendChild(key);
            plain.appendChild(this._createConsoleValueSpan(value));
            return plain;
        }

        const node = document.createElement('span');
        node.className = 'console-tree';

        const label = document.createElement('span');
        label.className = 'console-tree-label';
        label.setAttribute('role', 'button');
        label.tabIndex = 0;
        label.setAttribute('aria-expanded', 'false');

        const arrow = document.createElement('span');
        arrow.className = 'console-tree-arrow';
        label.appendChild(arrow);
        const key = keyMarkup();
        if (key) label.appendChild(key);
        label.appendChild(this._createConsoleValueSpan(value));

        const children = document.createElement('div');
        children.className = 'console-tree-children';
        children.hidden = true;

        let loaded = false;
        const toggle = async () => {
            const expanding = children.hidden;
            children.hidden = !expanding;
            node.classList.toggle('is-open', expanding);
            label.setAttribute('aria-expanded', String(expanding));
            if (!expanding || loaded) return;
            loaded = true;
            children.textContent = '…';
            const response = await this._requestConsoleInspect({
                action: 'inspect',
                handle: value.handle!, // `!`: values without a handle returned above
                receiver: receiver || value.handle,
            });
            children.textContent = '';
            if (!response?.ok) {
                loaded = false;
                const error = document.createElement('div');
                error.className = 'console-tree-row console-tree-error';
                error.textContent = response?.error || 'Unable to inspect this value.';
                children.appendChild(error);
                return;
            }
            (response.properties || []).forEach((property) => children.appendChild(this._renderConsoleProperty(property)));
            if (!response.properties?.length) {
                const empty = document.createElement('div');
                empty.className = 'console-tree-row console-tree-empty';
                empty.textContent = 'No properties';
                children.appendChild(empty);
            }
        };

        label.addEventListener('click', (event) => {
            event.stopPropagation();
            toggle();
        });
        label.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggle();
            }
        });

        node.appendChild(label);
        node.appendChild(children);
        return node;
    },

    /** One row of an expanded object: a value (expandable), a getter to invoke `(...)`, or the "more" row. */
    _renderConsoleProperty(this: ConsoleHost, property: InspectorProperty = {} as InspectorProperty): HTMLDivElement {
        const row = document.createElement('div');
        row.className = `console-tree-row${property.internal ? ' is-internal' : ''}${property.enumerable === false && !property.internal ? ' is-dimmed' : ''}`;

        if (property.more) {
            row.classList.add('console-tree-more');
            row.textContent = property.preview ? `… ${property.preview}` : '…';
            return row;
        }

        if (property.accessor) {
            const key = document.createElement('span');
            key.className = `console-key${property.enumerable === false ? ' is-dimmed' : ''}`;
            key.textContent = property.name;
            row.appendChild(key);
            row.appendChild(document.createTextNode(': '));

            if (!property.hasGetter) {
                const setterOnly = document.createElement('span');
                setterOnly.className = 'console-value console-undefined';
                setterOnly.textContent = 'undefined';
                row.appendChild(setterOnly);
                return row;
            }

            const invoke = document.createElement('button');
            invoke.type = 'button';
            invoke.className = 'console-getter';
            invoke.textContent = '(...)';
            invoke.title = 'Invoke property getter';
            invoke.addEventListener('click', async (event) => {
                event.stopPropagation();
                invoke.disabled = true;
                const response = await this._requestConsoleInspect({
                    action: 'get-property',
                    key: property.key,
                    owner: property.owner,
                    receiver: property.receiver,
                });
                if (!response?.ok) {
                    invoke.disabled = false;
                    invoke.title = response?.error || 'Unable to read this property.';
                    return;
                }
                row.replaceChildren(this._renderConsoleValue(response.value || {}, {
                    dimmed: property.enumerable === false,
                    keyName: property.name,
                }));
            });
            row.appendChild(invoke);
            return row;
        }

        row.appendChild(this._renderConsoleValue(property.value || {}, {
            dimmed: property.enumerable === false && !property.internal,
            internal: Boolean(property.internal),
            keyName: property.name,
            receiver: property.name === '[[Prototype]]' ? property.receiver : null,
        }));
        return row;
    },

    /** The table of a console.table entry. */
    _renderConsoleTable(table: Partial<ConsoleTable> = {}): HTMLDivElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'preview-console-table-wrapper';
        const element = document.createElement('table');
        element.className = 'preview-console-table';

        const head = document.createElement('thead');
        const headRow = document.createElement('tr');
        (table.header || []).forEach((cell) => {
            const th = document.createElement('th');
            th.textContent = cell;
            headRow.appendChild(th);
        });
        head.appendChild(headRow);
        element.appendChild(head);

        const body = document.createElement('tbody');
        (table.rows || []).forEach((cells) => {
            const tr = document.createElement('tr');
            cells.forEach((cell) => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            body.appendChild(tr);
        });
        element.appendChild(body);
        wrapper.appendChild(element);

        if (table.truncated) {
            const note = document.createElement('div');
            note.className = 'preview-console-table-note';
            note.textContent = 'Only the first 1000 rows are shown.';
            wrapper.appendChild(note);
        }

        return wrapper;
    },
} satisfies ThisType<Preview>;

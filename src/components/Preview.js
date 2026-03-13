import { compileExample } from '../utils/compileClient.js';
import { renderCompiledExampleDocument } from '../utils/exampleRenderer.js';

export class Preview {
    constructor({ onCompileStateChange } = {}) {
        this.iframe = document.getElementById('preview-frame');
        this.btnRefresh = document.getElementById('btn-refresh');
        this.btnConsoleOverride = document.getElementById('btn-console-override');
        this.consoleResizer = document.getElementById('preview-console-resizer');
        this.consolePanel = document.getElementById('preview-console');
        this.consoleBody = document.getElementById('preview-console-body');
        this.consoleControls = document.getElementById('preview-console-controls');
        this.consoleOutput = document.getElementById('preview-console-output');
        this.consoleEmpty = document.getElementById('preview-console-empty');
        this.consoleCount = document.getElementById('preview-console-count');
        this.btnClearConsole = document.getElementById('btn-clear-console');
        this.btnToggleConsole = document.getElementById('btn-toggle-console');
        this.btnConsoleFontDec = document.getElementById('btn-console-font-dec');
        this.btnConsoleFontInc = document.getElementById('btn-console-font-inc');
        this.consoleForm = document.getElementById('preview-console-form');
        this.consoleInput = document.getElementById('preview-console-input');
        this.consoleFilterButtons = Array.from(document.querySelectorAll('.preview-console-filter'));
        this._debounceTimer = null;
        this._currentTopicPath = null;
        this._lastDocument = null;
        this._lastSessionKey = '';
        this._renderToken = 0;
        this._onCompileStateChange = onCompileStateChange;
        this._consoleEnabled = false;
        this._consoleMetadataEnabled = false;
        this._consoleManualOverride = false;
        this._consoleEntries = [];
        this._consoleSequence = 0;
        this._consoleSessionKey = '';
        this._consoleFilters = new Set(['log', 'info', 'warn', 'error']);
        this._consoleFontSize = 12;
        this._consoleCollapsed = false;
        this._consoleCommandId = 0;

        this.btnRefresh.addEventListener('click', () => {
            if (this._lastDocument) this.update(this._lastDocument, { sessionKey: this._lastSessionKey });
        });
        this.btnConsoleOverride?.addEventListener('click', () => this._toggleConsoleOverride());
        this.btnClearConsole?.addEventListener('click', () => this._clearConsoleEntries());
        this.btnToggleConsole?.addEventListener('click', () => this._toggleConsoleCollapsed());
        this.btnConsoleFontDec?.addEventListener('click', () => this._updateConsoleFontSize(-1));
        this.btnConsoleFontInc?.addEventListener('click', () => this._updateConsoleFontSize(1));
        this.consoleForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            this._executeConsoleCommand();
        });
        this.consoleFilterButtons.forEach((button) => {
            button.addEventListener('click', () => this._toggleConsoleFilter(button.dataset.level || ''));
        });
        window.addEventListener('message', (event) => this._handleRuntimeMessage(event));
        this._applyConsoleFontSize();
        this._syncConsoleVisibility();
    }

    setTopicPath(topicPath) {
        this._currentTopicPath = topicPath;
    }

    update(documentModel, { sessionKey = '' } = {}) {
        this._lastDocument = documentModel;
        this._lastSessionKey = sessionKey || '';
        this._prepareConsoleSession({
            consoleEnabled: Boolean(documentModel?.metadata?.console),
            sessionKey: this._lastSessionKey,
        });

        clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => {
            this._render(documentModel);
        }, 300);
    }

    clear() {
        this._lastDocument = null;
        this._lastSessionKey = '';
        this._renderToken += 1;
        clearTimeout(this._debounceTimer);
        this._resetConsoleSession();
        this.iframe.srcdoc = renderCompiledExampleDocument({}, this._currentTopicPath, [], {
            consoleEnabled: false,
            renderId: this._renderToken,
        });
        this._emitCompileState([]);
    }

    async _render(documentModel) {
        const renderToken = ++this._renderToken;

        try {
            const result = await compileExample({ document: documentModel });
            if (renderToken !== this._renderToken) return;

            const diagnostics = result.compileDiagnostics || [];
            this.iframe.srcdoc = renderCompiledExampleDocument(
                result.compiledDocument,
                this._currentTopicPath,
                diagnostics,
                {
                    consoleEnabled: this._consoleEnabled,
                    renderId: renderToken,
                }
            );
            this._emitCompileState(diagnostics);
        } catch (err) {
            if (renderToken !== this._renderToken) return;

            const diagnostics = [
                {
                    level: 'error',
                    code: 'preview-compile-request-failed',
                    message: err.message,
                },
            ];

            this.iframe.srcdoc = renderCompiledExampleDocument({}, this._currentTopicPath, diagnostics, {
                consoleEnabled: this._consoleEnabled,
                renderId: renderToken,
            });
            this._emitCompileState(diagnostics);
        }
    }

    _prepareConsoleSession({ consoleEnabled, sessionKey }) {
        const normalizedSessionKey = String(sessionKey || '').trim() || '__draft__';

        if (normalizedSessionKey !== this._consoleSessionKey) {
            this._clearConsoleEntries();
            this._consoleSessionKey = normalizedSessionKey;
            this._consoleManualOverride = false;
        }

        this._consoleMetadataEnabled = Boolean(consoleEnabled);
        this._consoleEnabled = this._consoleMetadataEnabled || this._consoleManualOverride;
        this._syncConsoleVisibility();
    }

    _resetConsoleSession() {
        this._consoleSessionKey = '';
        this._consoleMetadataEnabled = false;
        this._consoleManualOverride = false;
        this._consoleEnabled = false;
        this._clearConsoleEntries();
        this._syncConsoleVisibility();
    }

    _clearConsoleEntries() {
        this._consoleEntries = [];
        this._consoleSequence = 0;
        this._renderConsoleEntries();
    }

    _syncConsoleVisibility() {
        if (!this.consolePanel || !this.consoleBody || !this.btnToggleConsole) return;

        this.consolePanel.classList.toggle('hidden', !this._consoleEnabled);
        this.consolePanel.classList.toggle('is-collapsed', this._consoleCollapsed);
        this.consoleBody.classList.toggle('hidden', this._consoleCollapsed);
        this.consoleResizer?.classList.toggle('hidden', !this._consoleEnabled || this._consoleCollapsed);
        this.btnToggleConsole.title = this._consoleCollapsed ? 'Expand console' : 'Collapse console';
        this.btnToggleConsole.setAttribute('aria-label', this.btnToggleConsole.title);
        this.btnToggleConsole.setAttribute('aria-expanded', String(!this._consoleCollapsed));
        this._syncConsoleOverrideButton();
        this._renderConsoleEntries();
    }

    _syncConsoleOverrideButton() {
        if (!this.btnConsoleOverride) return;

        const hasDocument = Boolean(this._lastDocument);
        const isAuto = this._consoleMetadataEnabled;
        const isManual = !isAuto && this._consoleManualOverride;

        this.btnConsoleOverride.disabled = !hasDocument || isAuto;
        this.btnConsoleOverride.classList.toggle('is-active', isAuto || isManual);
        this.btnConsoleOverride.classList.toggle('is-auto', isAuto);
        this.btnConsoleOverride.setAttribute('aria-pressed', String(isAuto || isManual));

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
    }

    _toggleConsoleOverride() {
        if (!this._lastDocument || this._consoleMetadataEnabled) return;

        this._consoleManualOverride = !this._consoleManualOverride;
        this._consoleEnabled = this._consoleMetadataEnabled || this._consoleManualOverride;

        if (!this._consoleEnabled) {
            this._clearConsoleEntries();
        }

        this._syncConsoleVisibility();

        if (this._lastDocument) {
            clearTimeout(this._debounceTimer);
            this._render(this._lastDocument);
        }
    }

    _handleRuntimeMessage(event) {
        if (!event?.data || event.data.source !== 'learncode-preview') return;
        if (event.source !== this.iframe?.contentWindow) return;
        if (event.data.renderId !== this._renderToken) return;
        if (!this._consoleEnabled) return;

        const values = Array.isArray(event.data.values)
            ? event.data.values.map((value) => String(value))
            : [];
        const message = values.join(' ').trim();
        const stackFrames = this._normalizeStackFrames(event.data.stackFrames);
        const location = this._formatRuntimeLocation(event.data, stackFrames);

        this._appendConsoleEntry({
            kind: event.data.kind || 'console',
            level: event.data.level || 'log',
            location,
            message: message || '(empty)',
            stackFrames,
            stackText: typeof event.data.stackText === 'string' ? event.data.stackText : '',
        });
        this._renderConsoleEntries();
    }

    _normalizeStackFrames(frames = []) {
        if (!Array.isArray(frames)) return [];

        return frames
            .map((frame) => ({
                column: Number.isFinite(frame?.column) ? frame.column : Number.parseInt(frame?.column, 10) || null,
                functionName: typeof frame?.functionName === 'string' ? frame.functionName : '',
                line: Number.isFinite(frame?.line) ? frame.line : Number.parseInt(frame?.line, 10) || null,
                path: typeof frame?.path === 'string' ? frame.path : '',
                raw: typeof frame?.raw === 'string' ? frame.raw : '',
            }))
            .filter((frame) => frame.path || frame.line || frame.raw);
    }

    _formatRuntimeLocation(data = {}, stackFrames = []) {
        const primaryFrame = Array.isArray(stackFrames) ? stackFrames[0] : null;
        const path = data.path || primaryFrame?.path || '';
        const line = data.line || primaryFrame?.line || null;
        const column = data.column || primaryFrame?.column || null;

        if (!path && !line) return '';

        let value = path || 'runtime';
        if (line) {
            value += `:${line}`;
            if (column) {
                value += `:${column}`;
            }
        }
        return value;
    }

    _appendConsoleEntry(entry) {
        const nextEntry = {
            id: ++this._consoleSequence,
            kind: entry.kind || 'console',
            level: entry.level || 'log',
            location: entry.location || '',
            message: entry.message || '(empty)',
            repeatedCount: 1,
            stackFrames: Array.isArray(entry.stackFrames) ? entry.stackFrames : [],
            stackText: entry.stackText || '',
        };

        const previousEntry = this._consoleEntries.at(-1);
        if (this._canMergeConsoleEntries(previousEntry, nextEntry)) {
            previousEntry.repeatedCount += 1;
            return;
        }

        this._consoleEntries.push(nextEntry);
    }

    _canMergeConsoleEntries(previousEntry, nextEntry) {
        if (!previousEntry || !nextEntry) return false;
        if (!['runtime-error', 'unhandled-rejection', 'command-error'].includes(nextEntry.kind)) return false;

        const previousSignature = JSON.stringify({
            kind: previousEntry.kind,
            level: previousEntry.level,
            location: previousEntry.location,
            message: previousEntry.message,
            stack: previousEntry.stackFrames.slice(0, 3),
        });
        const nextSignature = JSON.stringify({
            kind: nextEntry.kind,
            level: nextEntry.level,
            location: nextEntry.location,
            message: nextEntry.message,
            stack: nextEntry.stackFrames.slice(0, 3),
        });

        return previousSignature === nextSignature;
    }

    _toggleConsoleCollapsed() {
        if (!this._consoleEnabled) return;
        this._consoleCollapsed = !this._consoleCollapsed;
        this._syncConsoleVisibility();
    }

    _toggleConsoleFilter(level) {
        if (!['all', 'log', 'info', 'warn', 'error'].includes(level)) return;

        if (level === 'all') {
            const shouldEnableAll = this._consoleFilters.size !== 4;
            this._consoleFilters = shouldEnableAll
                ? new Set(['log', 'info', 'warn', 'error'])
                : new Set();
            this._renderConsoleEntries();
            return;
        }

        if (this._consoleFilters.has(level)) {
            this._consoleFilters.delete(level);
        } else {
            this._consoleFilters.add(level);
        }

        this._renderConsoleEntries();
    }

    _applyConsoleFontSize() {
        if (!this.consolePanel) return;
        this.consolePanel.style.setProperty('--preview-console-font-size', `${this._consoleFontSize}px`);
    }

    _updateConsoleFontSize(delta) {
        const nextSize = Math.max(11, Math.min(18, this._consoleFontSize + delta));
        if (nextSize === this._consoleFontSize) return;
        this._consoleFontSize = nextSize;
        this._applyConsoleFontSize();
    }

    _executeConsoleCommand() {
        if (!this._consoleEnabled || !this.consoleInput) return;

        const command = this.consoleInput.value.trim();
        if (!command) return;

        const commandId = `cmd-${Date.now()}-${++this._consoleCommandId}`;
        this._appendConsoleEntry({
            kind: 'command',
            level: 'info',
            location: '',
            message: `> ${command}`,
        });
        this._renderConsoleEntries();

        if (!this.iframe?.contentWindow) {
            this._appendConsoleEntry({
                kind: 'command-error',
                level: 'error',
                location: '',
                message: 'Preview frame is not ready yet.',
            });
            this._renderConsoleEntries();
            return;
        }

        this.iframe.contentWindow.postMessage({
            source: 'learncode-console-command',
            renderId: this._renderToken,
            command,
            commandId,
        }, '*');

        this.consoleInput.value = '';
    }

    _renderConsoleEntries() {
        if (!this.consoleOutput || !this.consoleEmpty || !this.consoleCount || !this.btnClearConsole) return;

        this.consoleOutput.innerHTML = '';
        this.consoleFilterButtons.forEach((button) => {
            const level = button.dataset.level || '';
            const active = level === 'all'
                ? this._consoleFilters.size === 4
                : this._consoleFilters.has(level);
            button.classList.toggle('active', active);
        });

        if (!this._consoleEnabled) {
            this.consoleEmpty.textContent = 'Console disabled for this example.';
            this.consoleOutput.appendChild(this.consoleEmpty);
            this.consoleCount.textContent = '0 entries';
            this.btnClearConsole.disabled = true;
            return;
        }

        if (this._consoleEntries.length === 0) {
            this.consoleEmpty.textContent = 'No runtime messages yet.';
            this.consoleOutput.appendChild(this.consoleEmpty);
            this.consoleCount.textContent = '0 entries';
            this.btnClearConsole.disabled = true;
            return;
        }

        const visibleEntries = this._consoleEntries.filter((entry) => this._consoleFilters.has(entry.level));

        if (visibleEntries.length === 0) {
            this.consoleEmpty.textContent = this._consoleEntries.length === 0
                ? 'No runtime messages yet.'
                : 'No messages for the current filters.';
            this.consoleOutput.appendChild(this.consoleEmpty);
            this.consoleCount.textContent = `${this._consoleEntries.length} total`;
            this.btnClearConsole.disabled = this._consoleEntries.length === 0;
            return;
        }

        visibleEntries.forEach((entry) => {
            const item = document.createElement('div');
            item.className = `preview-console-entry ${entry.level} kind-${entry.kind}`;

            const meta = document.createElement('div');
            meta.className = 'preview-console-entry-meta';
            const metaParts = [`#${entry.id}`, entry.kind === 'command' ? 'COMMAND' : entry.level.toUpperCase()];
            if (entry.location) {
                metaParts.push(entry.location);
            }
            if (entry.repeatedCount > 1) {
                metaParts.push(`x${entry.repeatedCount}`);
            }
            meta.textContent = metaParts.join(' • ');

            const message = document.createElement('pre');
            message.className = 'preview-console-entry-message';
            message.textContent = entry.message;

            item.appendChild(meta);
            item.appendChild(message);

            if (Array.isArray(entry.stackFrames) && entry.stackFrames.length > 0) {
                const stack = document.createElement('div');
                stack.className = 'preview-console-entry-stack';

                entry.stackFrames.slice(0, 6).forEach((frame) => {
                    const row = document.createElement('div');
                    row.className = 'preview-console-entry-stack-frame';
                    const parts = [];

                    if (frame.functionName) {
                        parts.push(frame.functionName);
                    }

                    if (frame.path) {
                        let location = frame.path;
                        if (frame.line) {
                            location += `:${frame.line}`;
                            if (frame.column) {
                                location += `:${frame.column}`;
                            }
                        }
                        parts.push(location);
                    } else if (frame.raw) {
                        parts.push(frame.raw);
                    }

                    row.textContent = parts.join(' • ');
                    stack.appendChild(row);
                });

                item.appendChild(stack);
            }

            this.consoleOutput.appendChild(item);
        });

        this.consoleCount.textContent = visibleEntries.length === this._consoleEntries.length
            ? `${this._consoleEntries.length} entr${this._consoleEntries.length === 1 ? 'y' : 'ies'}`
            : `${visibleEntries.length}/${this._consoleEntries.length} visible`;
        this.btnClearConsole.disabled = false;
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    _emitCompileState(diagnostics) {
        if (this._onCompileStateChange) {
            this._onCompileStateChange(diagnostics);
        }
    }
}

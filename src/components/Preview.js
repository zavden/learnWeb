import { compileExample } from '../utils/compileClient.js';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../utils/exampleRenderer.js';
import { getShaderConfig, isShaderDocument } from '../utils/markdown.js';
import { validateShaderPreviewDocument } from '../utils/shaderPreviewDiagnostics.js';

const SHADER_BUILT_IN_UNIFORMS = [
    'u_time',
    'u_delta',
    'u_resolution',
    'u_mouse',
    'u_mouse_pressed',
    'u_frame',
];
const SHADER_CONTROL_SOURCE = 'learncode-shader-control';
const SHADER_RESOLUTION_PRESETS = [
    { height: 512, label: 'Square 512', width: 512 },
    { height: 600, label: 'Classic 800 x 600', width: 800 },
    { height: 768, label: 'XGA 1024 x 768', width: 1024 },
    { height: 720, label: 'HD 1280 x 720', width: 1280 },
    { height: 900, label: 'Wide 1600 x 900', width: 1600 },
    { height: 1080, label: 'Full HD 1920 x 1080', width: 1920 },
];

function cloneShaderUniformValue(value) {
    if (Array.isArray(value)) {
        return value.map((entry) => Number(entry));
    }

    if (typeof value === 'boolean') {
        return value;
    }

    return Number(value);
}

function getShaderVectorSize(type = '') {
    const match = String(type || '').trim().match(/^vec([234])$/);
    return match ? Number.parseInt(match[1], 10) : 0;
}

function cloneShaderUniformControl(control = null) {
    return control && typeof control === 'object'
        ? { ...control }
        : null;
}

export class Preview {
    constructor({ onCompileStateChange } = {}) {
        this.iframe = document.getElementById('preview-frame');
        this.btnRefresh = document.getElementById('btn-refresh');
        this.btnConsoleOverride = document.getElementById('btn-console-override');
        this.consoleResizer = document.getElementById('preview-console-resizer');
        this.consolePanel = document.getElementById('preview-console');
        this.runtimeTitle = document.getElementById('preview-runtime-title');
        this.consoleBody = document.getElementById('preview-console-body');
        this.consoleControls = document.getElementById('preview-console-controls');
        this.consoleContent = document.getElementById('preview-console-content');
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
        this.shaderEditorControls = document.getElementById('shader-editor-controls');
        this.shaderEditorControlsBody = document.getElementById('shader-editor-controls-body');
        this.btnToggleShaderControls = document.getElementById('btn-toggle-shader-controls');
        this.shaderPanel = document.getElementById('preview-shader-panel');
        this.shaderFps = document.getElementById('preview-shader-fps');
        this.shaderResolution = document.getElementById('preview-shader-resolution');
        this.shaderFrame = document.getElementById('preview-shader-frame');
        this.shaderUpdated = document.getElementById('preview-shader-updated');
        this.shaderUniformList = document.getElementById('preview-shader-uniform-list');
        this.shaderCustomList = document.getElementById('preview-shader-custom-list');
        this.shaderCustomEmpty = document.getElementById('preview-shader-custom-empty');
        this.shaderTextureList = document.getElementById('preview-shader-texture-list');
        this.shaderTextureEmpty = document.getElementById('preview-shader-texture-empty');
        this.shaderResolutionSelect = document.getElementById('preview-shader-resolution-select');
        this.btnShaderTogglePause = document.getElementById('btn-shader-toggle-pause');
        this.btnShaderReset = document.getElementById('btn-shader-reset');
        this._debounceTimer = null;
        this._currentTopicPath = null;
        this._lastDocument = null;
        this._lastSessionKey = '';
        this._renderToken = 0;
        this._onCompileStateChange = onCompileStateChange;
        this._runtimeMode = 'none';
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
        this._shaderControlSessionKey = '';
        this._shaderControls = this._createDefaultShaderControls();
        this._shaderEditorControlsCollapsed = false;
        this._shaderResolutionOptionsSignature = '';
        this._shaderResolutionSelectionValue = '';
        this._shaderCustomUniformsSignature = '';
        this._shaderTexturesSignature = '';
        this._shaderStats = this._createEmptyShaderStats();

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
        this.shaderResolutionSelect?.addEventListener('change', (event) => {
            this._handleShaderResolutionChange(event.target.value);
        });
        this.btnShaderTogglePause?.addEventListener('click', () => this._toggleShaderPause());
        this.btnShaderReset?.addEventListener('click', () => this._resetShaderRuntime());
        this.btnToggleShaderControls?.addEventListener('click', () => this._toggleShaderEditorControlsCollapsed());
        window.addEventListener('message', (event) => this._handleRuntimeMessage(event));
        this._applyConsoleFontSize();
        this._syncConsoleVisibility();
    }

    setTopicPath(topicPath) {
        this._currentTopicPath = topicPath;
    }

    update(documentModel, { sessionKey = '' } = {}) {
        const shaderEnabled = isShaderDocument(documentModel);
        const shaderConfig = shaderEnabled ? getShaderConfig(documentModel) : null;
        const shaderResolution = shaderConfig?.resolution || null;
        this._lastDocument = documentModel;
        this._lastSessionKey = sessionKey || '';
        this._prepareConsoleSession({
            consoleEnabled: Boolean(documentModel?.metadata?.console) && !shaderEnabled,
            sessionKey: this._lastSessionKey,
            shaderConfig,
            shaderEnabled,
            shaderResolution,
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

        if (isShaderDocument(documentModel)) {
            const shaderConfig = getShaderConfig(documentModel);
            this._resetShaderStats(this._shaderControls?.currentResolution || shaderConfig?.resolution || null);
            this._renderShaderPanel();
            const structuralDiagnostics = documentModel?.diagnostics || [];
            const compileDiagnostics = structuralDiagnostics.some((diagnostic) => diagnostic.level === 'error')
                ? []
                : validateShaderPreviewDocument(documentModel);
            this.iframe.srcdoc = renderShaderExampleDocument(documentModel, {
                consoleEnabled: false,
                diagnostics: [...structuralDiagnostics, ...compileDiagnostics],
                renderId: renderToken,
                shaderControls: this._shaderControls,
                topicPath: this._currentTopicPath,
            });
            this._emitCompileState(compileDiagnostics);
            return;
        }

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

    _prepareConsoleSession({ consoleEnabled, sessionKey, shaderEnabled = false, shaderResolution = null, shaderConfig = null }) {
        const normalizedSessionKey = String(sessionKey || '').trim() || '__draft__';
        const previousMode = this._runtimeMode;
        const shaderSessionChanged = normalizedSessionKey !== this._shaderControlSessionKey;

        if (normalizedSessionKey !== this._consoleSessionKey) {
            this._clearConsoleEntries();
            this._consoleSessionKey = normalizedSessionKey;
            this._consoleManualOverride = false;
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
    }

    _resetConsoleSession() {
        this._consoleSessionKey = '';
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
        this._resetShaderStats(null);
        this._syncConsoleVisibility();
    }

    _clearConsoleEntries() {
        this._consoleEntries = [];
        this._consoleSequence = 0;
        this._renderConsoleEntries();
    }

    _syncConsoleVisibility() {
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

        this._renderConsoleEntries();
    }

    _syncConsoleOverrideButton() {
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
    }

    _toggleConsoleOverride() {
        if (!this._lastDocument || this._consoleMetadataEnabled || this._runtimeMode === 'shader') return;

        this._consoleManualOverride = !this._consoleManualOverride;
        this._consoleEnabled = this._consoleMetadataEnabled || this._consoleManualOverride;
        this._runtimeMode = this._consoleEnabled ? 'console' : 'none';

        if (!this._consoleEnabled) {
            this._clearConsoleEntries();
        }

        this._syncConsoleVisibility();

        if (this._lastDocument) {
            clearTimeout(this._debounceTimer);
            this._render(this._lastDocument);
        }
    }

    _syncShaderEditorControlsState() {
        if (!this.shaderEditorControls || !this.shaderEditorControlsBody || !this.btnToggleShaderControls) return;

        const isShaderMode = this._runtimeMode === 'shader';
        this.shaderEditorControls.classList.toggle('is-collapsed', this._shaderEditorControlsCollapsed && isShaderMode);
        this.shaderEditorControlsBody.classList.toggle('hidden', this._shaderEditorControlsCollapsed || !isShaderMode);

        const label = this._shaderEditorControlsCollapsed ? 'Expand shader controls' : 'Collapse shader controls';
        this.btnToggleShaderControls.title = label;
        this.btnToggleShaderControls.setAttribute('aria-label', label);
        this.btnToggleShaderControls.setAttribute('aria-expanded', String(!this._shaderEditorControlsCollapsed));
    }

    _toggleShaderEditorControlsCollapsed() {
        if (this._runtimeMode !== 'shader') return;
        this._shaderEditorControlsCollapsed = !this._shaderEditorControlsCollapsed;
        this._syncShaderEditorControlsState();
    }

    _handleRuntimeMessage(event) {
        if (!event?.data || event.data.source !== 'learncode-preview') return;
        if (event.source !== this.iframe?.contentWindow) return;
        if (event.data.renderId !== this._renderToken) return;
        if (event.data.kind === 'shader-stats') {
            if (this._runtimeMode !== 'shader') return;
            this._updateShaderStats(event.data);
            this._renderShaderPanel();
            return;
        }
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
        if (this._runtimeMode === 'none') return;
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

    _normalizeShaderResolution(resolution = null, fallback = { width: 800, height: 600 }) {
        const width = Number.isFinite(resolution?.width)
            ? resolution.width
            : Number.parseInt(resolution?.width, 10);
        const height = Number.isFinite(resolution?.height)
            ? resolution.height
            : Number.parseInt(resolution?.height, 10);

        if (Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0) {
            return {
                width: Math.round(width),
                height: Math.round(height),
            };
        }

        return {
            width: fallback.width,
            height: fallback.height,
        };
    }

    _createDefaultShaderControls(resolution = null) {
        const normalizedResolution = this._normalizeShaderResolution(resolution);

        return {
            baseResolution: normalizedResolution,
            currentResolution: normalizedResolution,
            customUniforms: [],
            textures: [],
            paused: false,
        };
    }

    _shaderResolutionEquals(first, second) {
        if (!first || !second) return false;
        return first.width === second.width && first.height === second.height;
    }

    _serializeShaderResolution(resolution = null) {
        const normalizedResolution = this._normalizeShaderResolution(resolution);
        return `${normalizedResolution.width}x${normalizedResolution.height}`;
    }

    _parseShaderResolution(value = '') {
        const match = String(value || '').trim().match(/^(\d+)\s*x\s*(\d+)$/i);
        if (!match) return null;

        return this._normalizeShaderResolution({
            width: Number.parseInt(match[1], 10),
            height: Number.parseInt(match[2], 10),
        });
    }

    _syncShaderControls({ sessionKey = '', resolution = null, customUniforms = [], textures = [], reset = false } = {}) {
        const normalizedResolution = this._normalizeShaderResolution(resolution);

        if (reset || !this._shaderControls) {
            this._shaderControls = this._createDefaultShaderControls(normalizedResolution);
            this._shaderControls.customUniforms = customUniforms.map((uniform) => ({
                ...uniform,
                control: cloneShaderUniformControl(uniform.control),
                defaultValue: cloneShaderUniformValue(uniform.defaultValue),
                value: cloneShaderUniformValue(uniform.value),
            }));
            this._shaderControls.textures = textures.map((texture) => ({
                ...texture,
                height: texture.height || 0,
                status: texture.status || 'idle',
                width: texture.width || 0,
            }));
            this._shaderControlSessionKey = sessionKey;
            this._shaderResolutionOptionsSignature = '';
            this._shaderResolutionSelectionValue = '';
            this._shaderCustomUniformsSignature = '';
            this._shaderTexturesSignature = '';
            return;
        }

        const previousBaseResolution = this._shaderControls.baseResolution || normalizedResolution;
        const currentResolution = this._shaderControls.currentResolution || previousBaseResolution;
        const usingBaseResolution = this._shaderResolutionEquals(currentResolution, previousBaseResolution);

        this._shaderControls.baseResolution = normalizedResolution;
        if (usingBaseResolution || !this._shaderControls.currentResolution) {
            this._shaderControls.currentResolution = normalizedResolution;
        }
        const previousUniforms = new Map(
            (this._shaderControls.customUniforms || []).map((uniform) => [uniform.name, uniform])
        );
        this._shaderControls.customUniforms = customUniforms.map((uniform) => {
            const previousUniform = previousUniforms.get(uniform.name);
            const usePreviousValue = previousUniform && previousUniform.type === uniform.type;

            return {
                ...uniform,
                control: cloneShaderUniformControl(uniform.control),
                defaultValue: cloneShaderUniformValue(uniform.defaultValue),
                value: usePreviousValue
                    ? cloneShaderUniformValue(previousUniform.value)
                    : cloneShaderUniformValue(uniform.value),
            };
        });
        const previousTextures = new Map(
            (this._shaderControls.textures || []).map((texture) => [texture.name, texture])
        );
        this._shaderControls.textures = textures.map((texture) => {
            const previousTexture = previousTextures.get(texture.name);
            return {
                ...texture,
                height: previousTexture?.height || 0,
                status: previousTexture?.status || 'idle',
                width: previousTexture?.width || 0,
            };
        });
        this._shaderControlSessionKey = sessionKey;
    }

    _buildShaderResolutionOptions() {
        const baseResolution = this._shaderControls?.baseResolution || this._normalizeShaderResolution();
        const currentResolution = this._shaderControls?.currentResolution || baseResolution;
        const options = [{
            label: `Document Default (${baseResolution.width} x ${baseResolution.height})`,
            value: 'document',
        }];

        SHADER_RESOLUTION_PRESETS.forEach((preset) => {
            options.push({
                label: preset.label,
                value: `${preset.width}x${preset.height}`,
            });
        });

        const currentValue = this._serializeShaderResolution(currentResolution);
        const hasCurrentPreset = options.some((option) => option.value === currentValue);
        if (!hasCurrentPreset && !this._shaderResolutionEquals(currentResolution, baseResolution)) {
            options.push({
                label: `Current (${currentResolution.width} x ${currentResolution.height})`,
                value: currentValue,
            });
        }

        return options;
    }

    _renderShaderResolutionOptions() {
        if (!this.shaderResolutionSelect) return;

        const options = this._buildShaderResolutionOptions();
        const currentResolution = this._shaderControls?.currentResolution || this._shaderControls?.baseResolution;
        const baseResolution = this._shaderControls?.baseResolution || currentResolution;
        const currentValue = currentResolution ? this._serializeShaderResolution(currentResolution) : 'document';
        const selectedValue = this._shaderResolutionEquals(currentResolution, baseResolution)
            ? 'document'
            : currentValue;
        const optionsSignature = JSON.stringify(options);
        const needsOptionsRefresh = this._shaderResolutionOptionsSignature !== optionsSignature;

        if (needsOptionsRefresh) {
            this.shaderResolutionSelect.innerHTML = '';
            options.forEach((option) => {
                const node = document.createElement('option');
                node.value = option.value;
                node.textContent = option.label;
                this.shaderResolutionSelect.appendChild(node);
            });
            this._shaderResolutionOptionsSignature = optionsSignature;
        }

        if (this._shaderResolutionSelectionValue !== selectedValue || this.shaderResolutionSelect.value !== selectedValue) {
            this.shaderResolutionSelect.value = selectedValue;
            this._shaderResolutionSelectionValue = selectedValue;
        }
    }

    _sendShaderControlMessage(payload = {}) {
        if (this._runtimeMode !== 'shader' || !this.iframe?.contentWindow) return;

        this.iframe.contentWindow.postMessage({
            source: SHADER_CONTROL_SOURCE,
            renderId: this._renderToken,
            ...payload,
        }, '*');
    }

    _handleShaderResolutionChange(value) {
        if (this._runtimeMode !== 'shader' || !this._shaderControls) return;

        const nextResolution = value === 'document'
            ? this._shaderControls.baseResolution
            : this._parseShaderResolution(value);
        if (!nextResolution) return;

        this._shaderControls.currentResolution = nextResolution;
        this._shaderStats.resolution = nextResolution;
        this._shaderStats.uniforms.u_resolution = [nextResolution.width, nextResolution.height];
        this._renderShaderPanel();
        this._sendShaderControlMessage({
            action: 'set-resolution',
            resolution: nextResolution,
        });
    }

    _toggleShaderPause() {
        if (this._runtimeMode !== 'shader' || !this._shaderControls) return;

        this._shaderControls.paused = !this._shaderControls.paused;
        this._shaderStats.paused = this._shaderControls.paused;
        this._renderShaderPanel();
        this._sendShaderControlMessage({
            action: 'set-paused',
            paused: this._shaderControls.paused,
        });
    }

    _resetShaderRuntime() {
        if (this._runtimeMode !== 'shader') return;

        const currentResolution = this._shaderControls?.currentResolution || this._shaderControls?.baseResolution || null;
        this._resetShaderStats(currentResolution);
        this._shaderStats.paused = Boolean(this._shaderControls?.paused);
        this._renderShaderPanel();
        this._sendShaderControlMessage({
            action: 'reset-runtime',
        });
    }

    _serializeShaderCustomUniforms(uniforms = []) {
        return JSON.stringify((uniforms || []).map((uniform) => ({
            control: uniform.control || null,
            name: uniform.name,
            type: uniform.type,
            value: uniform.value,
        })));
    }

    _serializeShaderTextures(textures = []) {
        return JSON.stringify((textures || []).map((texture) => ({
            assetPath: texture.assetPath,
            height: texture.height || 0,
            name: texture.name,
            status: texture.status || 'idle',
            width: texture.width || 0,
        })));
    }

    _renderShaderCustomUniformControls() {
        if (!this.shaderCustomList || !this.shaderCustomEmpty) return;

        const customUniforms = this._shaderControls?.customUniforms || [];
        const signature = this._serializeShaderCustomUniforms(customUniforms);
        if (signature === this._shaderCustomUniformsSignature) {
            return;
        }

        this._shaderCustomUniformsSignature = signature;
        this.shaderCustomList.innerHTML = '';

        if (customUniforms.length === 0) {
            this.shaderCustomList.appendChild(this.shaderCustomEmpty);
            this.shaderCustomEmpty.classList.remove('hidden');
            return;
        }

        this.shaderCustomEmpty.classList.add('hidden');
        customUniforms.forEach((uniform) => {
            const item = document.createElement('div');
            item.className = 'preview-shader-custom-item';

            const meta = document.createElement('div');
            meta.className = 'preview-shader-custom-meta';

            const name = document.createElement('strong');
            name.className = 'preview-shader-custom-name';
            name.textContent = uniform.name;

            const type = document.createElement('span');
            type.className = 'preview-shader-custom-type';
            type.textContent = uniform.type;

            meta.appendChild(name);
            meta.appendChild(type);
            item.appendChild(meta);

            const controls = document.createElement('div');
            controls.className = 'preview-shader-custom-controls';

            if (uniform.type === 'bool') {
                const label = document.createElement('label');
                label.className = 'preview-shader-custom-checkbox';
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = Boolean(uniform.value);
                input.addEventListener('change', () => {
                    this._handleShaderCustomUniformChange(uniform.name, input.checked);
                });
                const text = document.createElement('span');
                text.textContent = input.checked ? 'true' : 'false';
                input.addEventListener('change', () => {
                    text.textContent = input.checked ? 'true' : 'false';
                });
                label.appendChild(input);
                label.appendChild(text);
                controls.appendChild(label);
            } else if (uniform.control?.kind === 'range' && ['float', 'int'].includes(uniform.type)) {
                const rangeWrap = document.createElement('div');
                rangeWrap.className = 'preview-shader-custom-range';

                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = String(uniform.control.min);
                slider.max = String(uniform.control.max);
                slider.step = String(uniform.control.step);
                slider.className = 'preview-shader-custom-range-input';
                slider.value = String(uniform.value);

                const valueInput = document.createElement('input');
                valueInput.type = 'number';
                valueInput.min = String(uniform.control.min);
                valueInput.max = String(uniform.control.max);
                valueInput.step = String(uniform.control.step);
                valueInput.className = 'preview-shader-custom-range-value';
                valueInput.value = String(uniform.value);

                const syncRangeValue = (rawValue, { force = false } = {}) => {
                    const parsedValue = uniform.type === 'int'
                        ? Number.parseInt(rawValue, 10)
                        : Number.parseFloat(rawValue);

                    if (!Number.isFinite(parsedValue)) {
                        if (force) {
                            const fallback = String(uniform.value);
                            slider.value = fallback;
                            valueInput.value = fallback;
                        }
                        return;
                    }

                    const normalizedValue = this._normalizeShaderCustomUniformValue(uniform.type, parsedValue);
                    const clampedValue = Math.max(
                        uniform.control.min,
                        Math.min(uniform.control.max, normalizedValue),
                    );
                    const nextValue = String(clampedValue);

                    slider.value = nextValue;
                    valueInput.value = nextValue;
                    this._setShaderCustomUniformValue(uniform.name, clampedValue, { rerender: false });
                };

                slider.addEventListener('input', () => {
                    valueInput.value = slider.value;
                    this._setShaderCustomUniformValue(uniform.name, slider.value, { rerender: false });
                });

                valueInput.addEventListener('input', () => {
                    syncRangeValue(valueInput.value, { force: false });
                });
                valueInput.addEventListener('change', () => {
                    syncRangeValue(valueInput.value, { force: true });
                });
                valueInput.addEventListener('blur', () => {
                    syncRangeValue(valueInput.value, { force: true });
                });
                valueInput.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        valueInput.blur();
                    }
                });

                rangeWrap.appendChild(slider);
                rangeWrap.appendChild(valueInput);
                controls.appendChild(rangeWrap);
            } else if (getShaderVectorSize(uniform.type) > 0) {
                const vectorSize = getShaderVectorSize(uniform.type);
                const row = document.createElement('div');
                row.className = 'preview-shader-custom-control-row';
                ['x', 'y', 'z', 'w'].slice(0, vectorSize).forEach((axis, index) => {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.step = '0.01';
                    input.className = 'preview-shader-custom-input';
                    input.value = String(Array.isArray(uniform.value) ? uniform.value[index] ?? 0 : 0);
                    input.placeholder = axis;
                    input.addEventListener('change', () => {
                        const currentValue = Array.isArray(uniform.value)
                            ? [...uniform.value]
                            : Array.from({ length: vectorSize }, () => 0);
                        currentValue[index] = Number.parseFloat(input.value);
                        this._handleShaderCustomUniformChange(uniform.name, currentValue);
                    });
                    row.appendChild(input);
                });
                controls.appendChild(row);
            } else {
                const input = document.createElement('input');
                input.type = 'number';
                input.step = uniform.type === 'int' ? '1' : '0.01';
                input.className = 'preview-shader-custom-input';
                input.value = String(uniform.value);
                input.addEventListener('change', () => {
                    const nextValue = uniform.type === 'int'
                        ? Number.parseInt(input.value, 10)
                        : Number.parseFloat(input.value);
                    this._handleShaderCustomUniformChange(uniform.name, nextValue);
                });
                controls.appendChild(input);
            }

            item.appendChild(controls);
            this.shaderCustomList.appendChild(item);
        });
    }

    _renderShaderTextureStatus() {
        if (!this.shaderTextureList || !this.shaderTextureEmpty) return;

        const textures = this._shaderStats.textures?.length
            ? this._shaderStats.textures
            : (this._shaderControls?.textures || []);
        const signature = this._serializeShaderTextures(textures);
        if (signature === this._shaderTexturesSignature) {
            return;
        }

        this._shaderTexturesSignature = signature;
        this.shaderTextureList.innerHTML = '';

        if (!textures.length) {
            this.shaderTextureList.appendChild(this.shaderTextureEmpty);
            this.shaderTextureEmpty.classList.remove('hidden');
            return;
        }

        this.shaderTextureEmpty.classList.add('hidden');
        textures.forEach((texture) => {
            const item = document.createElement('div');
            item.className = 'preview-shader-custom-item';

            const meta = document.createElement('div');
            meta.className = 'preview-shader-custom-meta';

            const name = document.createElement('strong');
            name.className = 'preview-shader-custom-name';
            name.textContent = texture.name;

            const type = document.createElement('span');
            type.className = 'preview-shader-custom-type';
            type.textContent = texture.assetPath || 'asset';

            meta.appendChild(name);
            meta.appendChild(type);
            item.appendChild(meta);

            const status = document.createElement('div');
            status.className = 'preview-shader-texture-status';
            const dimensions = texture.width > 0 && texture.height > 0
                ? ` • ${texture.width} x ${texture.height}`
                : '';
            status.textContent = `${texture.status || 'idle'}${dimensions}`;
            item.appendChild(status);

            this.shaderTextureList.appendChild(item);
        });
    }

    _normalizeShaderCustomUniformValue(type, value) {
        if (type === 'bool') {
            return Boolean(value);
        }

        if (getShaderVectorSize(type) > 0) {
            const vectorSize = getShaderVectorSize(type);
            const vector = Array.isArray(value) ? value : Array.from({ length: vectorSize }, () => 0);
            return vector
                .map((entry) => Number.isFinite(Number(entry)) ? Number(entry) : 0)
                .slice(0, vectorSize);
        }

        const numeric = type === 'int'
            ? Number.parseInt(value, 10)
            : Number.parseFloat(value);

        if (!Number.isFinite(numeric)) {
            return type === 'int' ? 0 : 0;
        }

        return type === 'int' ? Math.trunc(numeric) : numeric;
    }

    _setShaderCustomUniformValue(name, rawValue, { rerender = true } = {}) {
        if (this._runtimeMode !== 'shader' || !this._shaderControls) return;

        const targetUniform = (this._shaderControls.customUniforms || []).find((uniform) => uniform.name === name);
        if (!targetUniform) return;

        let nextValue = this._normalizeShaderCustomUniformValue(targetUniform.type, rawValue);
        if (targetUniform.control?.kind === 'range' && typeof nextValue === 'number') {
            nextValue = Math.max(targetUniform.control.min, Math.min(targetUniform.control.max, nextValue));
        }

        targetUniform.value = nextValue;
        if (rerender) {
            this._shaderCustomUniformsSignature = '';
            this._renderShaderCustomUniformControls();
        } else {
            this._shaderCustomUniformsSignature = this._serializeShaderCustomUniforms(this._shaderControls.customUniforms);
        }
        this._sendShaderControlMessage({
            action: 'set-custom-uniform',
            name,
            uniformType: targetUniform.type,
            value: targetUniform.value,
        });
    }

    _handleShaderCustomUniformChange(name, rawValue) {
        this._setShaderCustomUniformValue(name, rawValue, { rerender: true });
    }

    _createEmptyShaderStats(resolution = null) {
        const width = Number.isFinite(resolution?.width) ? resolution.width : null;
        const height = Number.isFinite(resolution?.height) ? resolution.height : null;

        return {
            fps: null,
            frame: 0,
            lastUpdated: 0,
            paused: false,
            resolution: width && height ? { width, height } : null,
            textures: [],
            uniforms: {
                u_time: 0,
                u_delta: 0,
                u_resolution: width && height ? [width, height] : [0, 0],
                u_mouse: [0, 0],
                u_mouse_pressed: 0,
                u_frame: 0,
            },
        };
    }

    _resetShaderStats(resolution = null) {
        this._shaderStats = this._createEmptyShaderStats(resolution);
        this._shaderStats.paused = Boolean(this._shaderControls?.paused);
    }

    _updateShaderStats(data = {}) {
        const width = Number.isFinite(data?.resolution?.width)
            ? data.resolution.width
            : Number.parseInt(data?.resolution?.width, 10) || 0;
        const height = Number.isFinite(data?.resolution?.height)
            ? data.resolution.height
            : Number.parseInt(data?.resolution?.height, 10) || 0;
        const uniforms = data?.uniforms && typeof data.uniforms === 'object'
            ? data.uniforms
            : {};

        this._shaderStats = {
            fps: Number.isFinite(data?.fps) ? data.fps : Number.parseFloat(data?.fps) || 0,
            frame: Number.isFinite(data?.frame) ? data.frame : Number.parseInt(data?.frame, 10) || 0,
            lastUpdated: Number.isFinite(data?.timestamp)
                ? data.timestamp
                : Number.parseInt(data?.timestamp, 10) || Date.now(),
            paused: typeof data?.paused === 'boolean' ? data.paused : this._shaderStats.paused,
            resolution: width > 0 && height > 0 ? { width, height } : this._shaderStats.resolution,
            textures: Array.isArray(data?.textures)
                ? data.textures.map((texture) => ({
                    assetPath: texture.assetPath || '',
                    height: Number.isFinite(texture.height) ? texture.height : Number.parseInt(texture.height, 10) || 0,
                    name: texture.name || '',
                    status: texture.status || 'idle',
                    width: Number.isFinite(texture.width) ? texture.width : Number.parseInt(texture.width, 10) || 0,
                }))
                : this._shaderStats.textures,
            uniforms: {
                ...this._shaderStats.uniforms,
                ...uniforms,
            },
        };

        if (this._shaderControls && width > 0 && height > 0) {
            this._shaderControls.currentResolution = { width, height };
        }
        if (this._shaderControls && typeof data?.paused === 'boolean') {
            this._shaderControls.paused = data.paused;
        }
        if (this._shaderControls && Array.isArray(data?.textures)) {
            this._shaderControls.textures = this._shaderStats.textures.map((texture) => ({ ...texture }));
        }
    }

    _formatShaderUniformValue(name, value) {
        if (Array.isArray(value)) {
            return `[${value.map((entry) => this._formatShaderUniformScalar(entry)).join(', ')}]`;
        }

        if (name === 'u_resolution' && value && typeof value === 'object') {
            const width = Number.isFinite(value.width) ? value.width : Number.parseInt(value.width, 10) || 0;
            const height = Number.isFinite(value.height) ? value.height : Number.parseInt(value.height, 10) || 0;
            return `${width} x ${height}`;
        }

        return this._formatShaderUniformScalar(value);
    }

    _formatShaderUniformScalar(value) {
        const numeric = Number(value);
        if (Number.isFinite(numeric)) {
            if (Number.isInteger(numeric)) {
                return String(numeric);
            }

            return numeric.toFixed(3);
        }

        if (value == null) return '--';
        return String(value);
    }

    _renderShaderPanel() {
        if (!this.shaderPanel || !this.shaderFps || !this.shaderResolution || !this.shaderFrame || !this.shaderUpdated || !this.shaderUniformList) {
            return;
        }

        const stats = this._shaderStats || this._createEmptyShaderStats();
        const resolution = stats.resolution;
        this._renderShaderResolutionOptions();
        this._renderShaderCustomUniformControls();
        this._renderShaderTextureStatus();
        this.shaderFps.textContent = Number.isFinite(stats.fps) && stats.fps > 0
            ? `${Math.round(stats.fps)}`
            : '--';
        this.shaderResolution.textContent = resolution
            ? `${resolution.width} x ${resolution.height}`
            : '--';
        this.shaderFrame.textContent = Number.isFinite(stats.frame) ? String(stats.frame) : '--';
        this.shaderUpdated.textContent = stats.lastUpdated
            ? `${stats.paused ? 'Paused' : 'Updated'} ${new Date(stats.lastUpdated).toLocaleTimeString()}`
            : 'Waiting for first frame';
        if (this.btnShaderTogglePause) {
            this.btnShaderTogglePause.textContent = stats.paused ? 'Resume Time' : 'Pause Time';
            this.btnShaderTogglePause.classList.toggle('is-active', stats.paused);
        }

        this.shaderUniformList.innerHTML = '';
        SHADER_BUILT_IN_UNIFORMS.forEach((name) => {
            const item = document.createElement('div');
            item.className = 'preview-shader-uniform';

            const uniformName = document.createElement('div');
            uniformName.className = 'preview-shader-uniform-name';
            uniformName.textContent = name;

            const uniformValue = document.createElement('div');
            uniformValue.className = 'preview-shader-uniform-value';
            uniformValue.textContent = this._formatShaderUniformValue(name, stats.uniforms?.[name]);

            item.appendChild(uniformName);
            item.appendChild(uniformValue);
            this.shaderUniformList.appendChild(item);
        });
    }

    _emitCompileState(diagnostics) {
        if (this._onCompileStateChange) {
            this._onCompileStateChange(diagnostics);
        }
    }
}

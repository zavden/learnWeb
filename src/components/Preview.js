import { compileExample } from '../utils/compileClient.js';
import { createConsoleHistorySession } from '../utils/consoleHistory.js';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../utils/exampleRenderer.js';
import {
    HOSTED_PREVIEW_SANDBOX,
    SRCDOC_PREVIEW_SANDBOX,
    markHostedPreviewUnavailable,
    publishPreviewDocument,
} from '../utils/renderer/previewHost.js';

const HOSTED_READY_TIMEOUT_MS = 4000;
import { getShaderConfig, isShaderDocument } from '../utils/markdown.js';
import { validateShaderPreviewDocument } from '../utils/shaderPreviewDiagnostics.js';
import { getTheoryDocumentContent, isTheoryDocument } from '../utils/theoryDocument.js';
import { loadTheoryExerciseEmbeds } from '../utils/theoryExerciseEmbeds.js';
import { highlightCode, renderTheoryPreviewDocument } from '../utils/theoryRenderer.js';
import { buildCompiledStyleFiles, COMPILED_CSS_PATH, SASS_OUTPUT_PATH } from '../utils/compiledStyleView.js';
import { consoleManagerMixin } from './preview/ConsoleManager.js';
import { runtimeDiagnosticsMixin } from './preview/RuntimeDiagnostics.js';
import { shaderControlsMixin } from './preview/ShaderControls.js';

export class Preview {
    constructor({
        onCompileStateChange,
        onRequestShaderUniformEdit,
        onRuntimeDiagnosticsChange,
        onTheoryExerciseOpenRequest,
        onTheoryExercisePreviewRequest,
    } = {}) {
        this.iframe = document.getElementById('preview-frame');
        this.btnAutoRenderToggle = document.getElementById('btn-auto-render-toggle');
        this.btnRefresh = document.getElementById('btn-refresh');
        this.btnOpenPreviewTab = document.getElementById('btn-open-preview-tab');
        this._hostedUrl = '';
        this.btnOpenPreviewTab?.addEventListener('click', () => {
            // The hosted page is a normal page on the preview origin, so it also works on its own tab.
            if (this._frameMode === 'hosted' && this._hostedUrl) window.open(this._hostedUrl, '_blank', 'noopener');
        });
        this.btnCompiledCss = document.getElementById('btn-preview-compiled-css');
        this.compiledPanel = document.getElementById('preview-compiled-panel');
        this.compiledMessages = document.getElementById('preview-compiled-messages');
        this.compiledCode = document.getElementById('preview-compiled-code');
        this._compiledPanelOpen = false;
        this.btnCompiledCss?.addEventListener('click', () => {
            this._compiledPanelOpen = !this._compiledPanelOpen;
            this._applyCompiledPanelState();
        });
        this.btnConsoleOverride = document.getElementById('btn-console-override');
        this.runtimeStatus = document.getElementById('preview-runtime-status');
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
        this.shaderFrame = document.getElementById('preview-shader-frame');
        this.shaderUpdated = document.getElementById('preview-shader-updated');
        this.shaderUniformList = document.getElementById('preview-shader-uniform-list');
        this.shaderTexturePanel = document.getElementById('preview-shader-texture-panel');
        this.shaderTextureSummary = document.getElementById('preview-shader-texture-summary');
        this.btnToggleShaderTextures = document.getElementById('btn-toggle-shader-textures');
        this.shaderTextureViewer = document.getElementById('preview-shader-texture-viewer');
        this.shaderTextureTabs = document.getElementById('preview-shader-texture-tabs');
        this.shaderTextureStage = document.getElementById('preview-shader-texture-stage');
        this.shaderTextureStageEmpty = document.getElementById('preview-shader-texture-stage-empty');
        this.shaderTextureImage = document.getElementById('preview-shader-texture-image');
        this.shaderTextureCaption = document.getElementById('preview-shader-texture-caption');
        this.shaderCustomList = document.getElementById('preview-shader-custom-list');
        this.shaderCustomEmpty = document.getElementById('preview-shader-custom-empty');
        this.shaderTextureList = document.getElementById('preview-shader-texture-list');
        this.shaderTextureEmpty = document.getElementById('preview-shader-texture-empty');
        this.shaderResolutionSelect = document.getElementById('preview-shader-resolution-select');
        this.shaderWidthRange = document.getElementById('preview-shader-width-range');
        this.shaderWidthInput = document.getElementById('preview-shader-width-input');
        this.shaderHeightRange = document.getElementById('preview-shader-height-range');
        this.shaderHeightInput = document.getElementById('preview-shader-height-input');
        this.btnShaderTogglePause = document.getElementById('btn-shader-toggle-pause');
        this.btnShaderReset = document.getElementById('btn-shader-reset');
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
            this._handleShaderResolutionChange(event.target.value);
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

    _readAutoRenderEnabled() {
        const stored = window.localStorage.getItem(this._autoRenderStorageKey);
        return stored == null ? true : stored !== '0';
    }

    _updateAutoRenderUi() {
        if (!this.btnAutoRenderToggle) return;

        this.btnAutoRenderToggle.classList.toggle('is-active', this._autoRenderEnabled);
        this.btnAutoRenderToggle.setAttribute('aria-pressed', String(this._autoRenderEnabled));
        this.btnAutoRenderToggle.title = this._autoRenderEnabled
            ? 'Disable automatic preview render'
            : 'Enable automatic preview render';
        this.btnAutoRenderToggle.setAttribute('aria-label', this.btnAutoRenderToggle.title);
    }

    isAutoRenderEnabled() {
        return this._autoRenderEnabled;
    }

    setAutoRenderEnabled(enabled, { persist = true, renderIfEnabled = true } = {}) {
        this._autoRenderEnabled = Boolean(enabled);

        if (persist) {
            window.localStorage.setItem(this._autoRenderStorageKey, this._autoRenderEnabled ? '1' : '0');
        }

        if (!this._autoRenderEnabled) {
            clearTimeout(this._debounceTimer);
        } else if (renderIfEnabled) {
            this.renderNow();
        }

        this._updateAutoRenderUi();
    }

    toggleAutoRender() {
        this.setAutoRenderEnabled(!this._autoRenderEnabled);
        return this._autoRenderEnabled;
    }

    renderNow() {
        if (!this._lastDocument) return;
        this._scheduleRender(this._lastDocument, { forceRender: true });
    }

    _scheduleRender(documentModel, { forceRender = false } = {}) {
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

        clearTimeout(this._debounceTimer);

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

    _isScriptOnlyDocument(documentModel) {
        if (!documentModel || documentModel.sourceFormat === 'virtual-files' || documentModel.metadata?.framework) return false;
        const blocks = Array.isArray(documentModel.blocks) ? documentModel.blocks : [];
        return blocks.some((block) => block.slot === 'script') && !blocks.some((block) => block.slot === 'markup');
    }

    _getMarkupPath(documentModel) {
        const files = Array.isArray(documentModel?.files) ? documentModel.files : [];
        return files.find((file) => file.slot === 'markup')?.path || 'index.html';
    }

    _applyFrameSandbox(mode) {
        if (!this.iframe) return;
        const value = mode === 'hosted' ? HOSTED_PREVIEW_SANDBOX : SRCDOC_PREVIEW_SANDBOX;
        if (this.iframe.getAttribute('sandbox') !== value) {
            this.iframe.setAttribute('sandbox', value);
        }
    }

    // srcdoc documents: theory, shaders, and the fallback when the preview host is unavailable.
    _showSrcdoc(html) {
        if (!this.iframe) return;
        clearTimeout(this._hostedWatchdog);
        // Order matters: drop `allow-same-origin` before navigating, otherwise a srcdoc document would
        // run with the app's own origin.
        this._applyFrameSandbox('srcdoc');
        this.iframe.srcdoc = html;
        this._frameMode = 'srcdoc';
        this._setOpenInTabUrl('');
    }

    _setOpenInTabUrl(url = '') {
        this._hostedUrl = url;
        if (this.btnOpenPreviewTab) this.btnOpenPreviewTab.disabled = !url;
    }

    // Hosted documents live on the preview origin (cross-origin to the app).
    _showHosted(url, { renderToken = this._renderToken, fallbackHtml = null } = {}) {
        if (!this.iframe) return;
        this._applyFrameSandbox('hosted');
        this._setOpenInTabUrl(url);

        // Safety net: if the hosted document never boots (server not restarted, blocked port…), switch
        // to srcdoc so the learner still sees the example.
        clearTimeout(this._hostedWatchdog);
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

    setTopicPath(topicPath) {
        this._currentTopicPath = topicPath;
    }

    getShaderPersistedState() {
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

    toggleShaderPause() {
        if (this._runtimeMode !== 'shader') return false;
        this._toggleShaderPause();
        return true;
    }

    toggleConsole() {
        if (this._runtimeMode === 'shader' || !this._lastDocument) return false;

        if (this._runtimeMode === 'none') {
            this._consoleManualOverride = true;
            this._consoleEnabled = true;
            this._consoleCollapsed = false;
            this._runtimeMode = 'console';
            this._syncConsoleVisibility();

            if (this._lastDocument) {
                clearTimeout(this._debounceTimer);
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

    resetShaderRuntime() {
        if (this._runtimeMode !== 'shader') return false;
        this._resetShaderRuntime();
        return true;
    }

    openShaderControls() {
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

    openShaderPanel() {
        if (this._runtimeMode !== 'shader') return null;

        this._consoleCollapsed = !this._consoleCollapsed;
        this._syncConsoleVisibility();
        return this._consoleCollapsed ? 'collapsed' : 'expanded';
    }

    getPreferredShaderPanelHeight() {
        if (this._runtimeMode !== 'shader' || !this.consolePanel || !this.shaderPanel) return null;

        const headerHeight = this.consolePanel.querySelector('.preview-console-header')?.getBoundingClientRect().height || 48;
        const bodyHeight = this.shaderPanel.scrollHeight || 0;
        if (!bodyHeight) return null;

        return Math.ceil(headerHeight + bodyHeight);
    }

    update(documentModel, { sessionKey = '' } = {}) {
        this._lastDocument = documentModel;
        this._lastSessionKey = sessionKey || '';
        this._scheduleRender(documentModel);
    }

    _setFrameDisplayMode(mode = 'default') {
        if (!this.iframe) return;
        this.iframe.classList.toggle('is-svg-document', mode === 'svg');
    }

    clear() {
        this._lastDocument = null;
        this._lastSessionKey = '';
        this._renderToken += 1;
        clearTimeout(this._debounceTimer);
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
    _updateCompiledStyleView(generatedFiles = []) {
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

    _applyCompiledPanelState(available = !this.btnCompiledCss?.classList.contains('hidden')) {
        const open = Boolean(available && this._compiledPanelOpen);
        this.compiledPanel?.classList.toggle('hidden', !open);
        this.btnCompiledCss?.setAttribute('aria-pressed', open ? 'true' : 'false');
        this.btnCompiledCss?.classList.toggle('is-active', open);
    }

    async _render(documentModel, { explicit = true } = {}) {
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
            const result = await compileExample({ document: documentModel });
            if (renderToken !== this._renderToken) return;

            const diagnostics = result.compileDiagnostics || [];
            this._updateCompiledStyleView(buildCompiledStyleFiles(documentModel, result));
            const renderOptions = {
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

            const diagnostics = [
                {
                    level: 'error',
                    code: 'preview-compile-request-failed',
                    message: err.message,
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

    _handleRuntimeMessage(event) {
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
            clearTimeout(this._hostedWatchdog);
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

        const data = event.data;
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

    _getPrimaryRuntimeFrame(data = {}, stackFrames = []) {
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
    _isDuplicateOfCompileDiagnostic(data = {}) {
        if (data.errorName !== 'SyntaxError') return false;
        return (this._lastCompileDiagnostics || []).some((diagnostic) => (
            diagnostic?.level === 'error'
            && ['javascript-syntax', 'typescript-transpile'].includes(diagnostic?.code)
        ));
    }

    resetLayoutState() {
        this._consoleCollapsed = false;
        this._shaderEditorControlsCollapsed = false;
        this._shaderTextureViewerExpanded = false;
        this._activeShaderTextureName = '';
        this._shaderTextureTabsSignature = '';
        this._syncConsoleVisibility();
    }

    _emitCompileState(diagnostics) {
        this._lastCompileDiagnostics = Array.isArray(diagnostics) ? diagnostics : [];
        if (this._onCompileStateChange) {
            this._onCompileStateChange(diagnostics);
        }
    }
}

Object.assign(Preview.prototype, consoleManagerMixin, runtimeDiagnosticsMixin, shaderControlsMixin);

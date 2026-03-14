import {
    Decoration,
    EditorView,
    GutterMarker,
    drawSelection,
    gutterLineClass,
    keymap,
    lineNumbers,
    highlightActiveLine,
    highlightActiveLineGutter,
} from '@codemirror/view';
import { EditorState, RangeSet, RangeSetBuilder, StateEffect, StateField } from '@codemirror/state';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';

import { getBlockDefinition, normalizeBlockType } from '../config/exampleBlocks.js';
import { buildFrameworkFileTemplate, getFrameworkFileTemplateOptions } from '../config/fileTemplates.js';
import { glslLanguage } from '../editor/glslLanguage.js';
import {
    cssLearningSupport,
    htmlLearningSupport,
    javascriptLearningSupport,
} from '../editor/learningCompletions.js';
import {
    bindVimView,
    createVimExtension,
    installSystemClipboardBridge,
    isSystemClipboardApiAvailable,
    setSystemClipboardEnabled,
    syncSystemClipboardRegister,
} from '../editor/vimSupport.js';
import { vueScriptEnterCommand } from '../editor/vueSmartEnter.js';
import { fetchExample, fetchTopicAssets, modifyExample, modifyTopicMain, removeExample, renameExample, saveExample } from '../utils/api.js';
import { resolveExerciseComparison } from '../utils/exerciseComparison.js';
import { buildQuickOpenMatches } from '../utils/fileQuickOpen.js';
import {
    buildExampleDocument,
    cloneExampleDocument,
    createDocumentFile,
    createEmptyExampleDocument,
    duplicateDocumentFile,
    getDocumentEntryCandidates,
    getDocumentFileVisibilityEntries,
    getExerciseConfig,
    getDocumentLanguageOptions,
    getShaderConfig,
    hasBlockingDiagnostics,
    isShaderDocument,
    parseExampleDocument,
    removeDocumentFile,
    setDocumentEntryPath,
    synchronizeDocument,
    updateDocumentHiddenFiles,
    updateShaderResolution,
    updateShaderTextureDefinitions,
    updateShaderUniformDefinitions,
    updateDocumentFileDetails,
    updateDocumentFileContent,
    VIRTUAL_FILE_ROLE_OPTIONS,
} from '../utils/markdown.js';
import { createTheoryDocument, getTheoryDocumentContent, isTheoryDocument } from '../utils/theoryDocument.js';

const SHADER_UNIFORM_TYPE_OPTIONS = ['float', 'int', 'bool', 'vec2', 'vec3', 'vec4'];
const SHADER_BUILT_IN_UNIFORM_NAMES = ['u_time', 'u_delta', 'u_resolution', 'u_mouse', 'u_mouse_pressed', 'u_frame'];
const setEditorDiagnosticsEffect = StateEffect.define();
const EMPTY_EDITOR_DIAGNOSTICS = Object.freeze({
    decorations: Decoration.none,
    gutterClasses: RangeSet.empty,
});

class DiagnosticGutterMarker extends GutterMarker {
    constructor(severity) {
        super();
        this.severity = severity;
        this.elementClass = `cm-diagnostic-gutter-${severity}`;
    }

    eq(other) {
        return other.severity === this.severity;
    }
}

function getDiagnosticSeverity(level = '') {
    return level === 'error' ? 'error' : 'warning';
}

function buildEditorDiagnosticSets(doc, diagnostics = []) {
    if (!Array.isArray(diagnostics) || diagnostics.length === 0) {
        return EMPTY_EDITOR_DIAGNOSTICS;
    }

    const lines = new Map();
    diagnostics.forEach((diagnostic) => {
        const lineNumber = Number.isFinite(diagnostic?.line)
            ? Math.max(1, Math.trunc(diagnostic.line))
            : null;
        if (!lineNumber) return;

        const clampedLine = Math.min(lineNumber, doc.lines);
        const severity = getDiagnosticSeverity(diagnostic.level);
        const existing = lines.get(clampedLine);

        if (!existing || (existing.severity !== 'error' && severity === 'error')) {
            lines.set(clampedLine, { severity });
        }
    });

    if (lines.size === 0) {
        return EMPTY_EDITOR_DIAGNOSTICS;
    }

    const decorationBuilder = new RangeSetBuilder();
    const gutterClassBuilder = new RangeSetBuilder();

    Array.from(lines.entries())
        .sort((first, second) => first[0] - second[0])
        .forEach(([lineNumber, entry]) => {
            const line = doc.line(lineNumber);
            decorationBuilder.add(
                line.from,
                line.from,
                Decoration.line({ class: `cm-diagnostic-line cm-diagnostic-line-${entry.severity}` }),
            );
            gutterClassBuilder.add(line.from, line.from, new DiagnosticGutterMarker(entry.severity));
        });

    return {
        decorations: decorationBuilder.finish(),
        gutterClasses: gutterClassBuilder.finish(),
    };
}

const editorDiagnosticsField = StateField.define({
    create() {
        return EMPTY_EDITOR_DIAGNOSTICS;
    },
    update(value, transaction) {
        let nextValue = value;

        if (transaction.docChanged) {
            nextValue = {
                decorations: nextValue.decorations.map(transaction.changes),
                gutterClasses: nextValue.gutterClasses.map(transaction.changes),
            };
        }

        for (const effect of transaction.effects) {
            if (effect.is(setEditorDiagnosticsEffect)) {
                return buildEditorDiagnosticSets(transaction.state.doc, effect.value);
            }
        }

        return nextValue;
    },
    provide: (field) => [
        EditorView.decorations.from(field, (value) => value.decorations),
        gutterLineClass.from(field, (value) => value.gutterClasses),
    ],
});

export class Editor {
    constructor({
        getShaderPersistedState,
        onCodeChange,
        onExerciseStateChange,
        onRename,
        onResetShaderRuntime,
        onSessionStateChange,
        onOpenShaderControls,
        onOpenShaderPanel,
        onToggleShaderPause,
        onTogglePreviewAutoRender,
        onOpenShaderTextures,
        onOpenShaderUniforms,
        onToggleSidebar,
        onCenterWorkspace,
    }) {
        this.getShaderPersistedState = getShaderPersistedState;
        this.onCodeChange = onCodeChange;
        this.onExerciseStateChange = onExerciseStateChange;
        this.onRename = onRename;
        this.onResetShaderRuntime = onResetShaderRuntime;
        this.onSessionStateChange = onSessionStateChange;
        this.onOpenShaderControls = onOpenShaderControls;
        this.onOpenShaderPanel = onOpenShaderPanel;
        this.onToggleShaderPause = onToggleShaderPause;
        this.onTogglePreviewAutoRender = onTogglePreviewAutoRender;
        this.onOpenShaderTextures = onOpenShaderTextures;
        this.onOpenShaderUniforms = onOpenShaderUniforms;
        this.onToggleSidebar = onToggleSidebar;
        this.onCenterWorkspace = onCenterWorkspace;

        this.currentTopicPath = null;
        this.currentFilename = null;
        this.currentDocument = createEmptyExampleDocument();
        this.compileDiagnostics = [];
        this.editors = [];
        this.fontSize = 13;
        this.layoutModeStorageKey = 'learncode.editor.layout';
        this.vimEnabledStorageKey = 'learncode.editor.vim';
        this.systemClipboardStorageKey = 'learncode.editor.systemClipboard';
        this.vimEnabled = this._readVimEnabled();
        this.systemClipboardEnabled = this._readSystemClipboardEnabled();
        this.vimModeLabel = this.vimEnabled ? 'NORMAL' : '';
        this.layoutMode = this.vimEnabled ? 'tabs' : this._readLayoutMode();
        this.systemClipboardAvailable = isSystemClipboardApiAvailable();
        installSystemClipboardBridge();
        setSystemClipboardEnabled(this.systemClipboardEnabled);
        this.activeFileId = null;
        this.panelState = this._sanitizePanelState();
        this.exerciseConfig = this._createEmptyExerciseConfig();
        this.exerciseState = this._sanitizeExerciseState();
        this.exerciseComparisonSource = null;
        this.exerciseComparisonSourceError = '';
        this.exerciseComparisonSourceStatus = 'idle';
        this.exerciseComparisonRequestId = 0;
        this.pendingNavigationTarget = null;
        this.workspace = document.querySelector('.editor-panels');
        this.btnSave = document.getElementById('btn-save');
        this.btnModify = document.getElementById('btn-modify');
        this.btnRemove = document.getElementById('btn-remove');
        this.btnRename = document.getElementById('btn-rename');
        this.btnAddFile = document.getElementById('btn-add-file');
        this.btnEditShaderUniforms = document.getElementById('btn-edit-shader-uniforms');
        this.btnEditShaderTextures = document.getElementById('btn-edit-shader-textures');
        this.btnEditFileVisibility = document.getElementById('btn-edit-file-visibility');
        this.btnDuplicateFile = document.getElementById('btn-duplicate-file');
        this.btnEditFile = document.getElementById('btn-edit-file');
        this.btnDeleteFile = document.getElementById('btn-delete-file');
        this.btnQuickOpenFile = document.getElementById('btn-quick-open-file');
        this.btnLayout = document.getElementById('btn-editor-layout');
        this.btnContextHints = document.getElementById('btn-editor-context-hints');
        this.btnAutoFit = document.getElementById('btn-auto-fit');
        this.btnSystemClipboardToggle = document.getElementById('btn-system-clipboard-toggle');
        this.btnVimToggle = document.getElementById('btn-vim-toggle');
        this.vimModeIndicator = document.getElementById('vim-mode-indicator');
        this.entrySelectGroup = document.getElementById('entry-select-group');
        this.entrySelect = document.getElementById('entry-select');
        this.tabFileSelectHost = document.getElementById('editor-tab-file-select-host');
        this.previewFilenameDisplay = document.getElementById('preview-current-filename');
        this.statusDisplay = document.getElementById('editor-status');
        this.fileDialog = document.getElementById('editor-file-dialog');
        this.fileDialogTitle = document.getElementById('editor-file-dialog-title');
        this.fileDialogPathGroup = document.getElementById('editor-file-path-group');
        this.fileDialogPath = document.getElementById('editor-file-path');
        this.fileDialogTemplateGroup = document.getElementById('editor-file-template-group');
        this.fileDialogTemplate = document.getElementById('editor-file-template');
        this.fileDialogLanguage = document.getElementById('editor-file-language');
        this.fileDialogRoleGroup = document.getElementById('editor-file-role-group');
        this.fileDialogRole = document.getElementById('editor-file-role');
        this.fileDialogHint = document.getElementById('editor-file-dialog-hint');
        this.fileDialogCancel = document.getElementById('editor-file-dialog-cancel');
        this.fileDialogConfirm = document.getElementById('editor-file-dialog-confirm');
        this.fileDialogForm = document.getElementById('editor-file-form');
        this.shaderUniformDialog = document.getElementById('shader-uniform-dialog');
        this.shaderUniformList = document.getElementById('shader-uniform-list');
        this.shaderUniformEmpty = document.getElementById('shader-uniform-empty');
        this.shaderUniformName = document.getElementById('shader-uniform-name');
        this.shaderUniformType = document.getElementById('shader-uniform-type');
        this.shaderUniformScalarGroup = document.getElementById('shader-uniform-scalar-group');
        this.shaderUniformDefaultScalar = document.getElementById('shader-uniform-default-scalar');
        this.shaderUniformBoolGroup = document.getElementById('shader-uniform-bool-group');
        this.shaderUniformDefaultBool = document.getElementById('shader-uniform-default-bool');
        this.shaderUniformVectorGroup = document.getElementById('shader-uniform-vector-group');
        this.shaderUniformVectorInputs = [
            document.getElementById('shader-uniform-vector-0'),
            document.getElementById('shader-uniform-vector-1'),
            document.getElementById('shader-uniform-vector-2'),
            document.getElementById('shader-uniform-vector-3'),
        ];
        this.shaderUniformRangeGroup = document.getElementById('shader-uniform-range-group');
        this.shaderUniformRangeMin = document.getElementById('shader-uniform-range-min');
        this.shaderUniformRangeMax = document.getElementById('shader-uniform-range-max');
        this.shaderUniformRangeStep = document.getElementById('shader-uniform-range-step');
        this.shaderUniformDialogHint = document.getElementById('shader-uniform-dialog-hint');
        this.shaderUniformDialogTypeHint = document.getElementById('shader-uniform-dialog-type-hint');
        this.shaderUniformDialogMode = document.getElementById('shader-uniform-dialog-mode');
        this.btnShaderUniformAdd = document.getElementById('btn-shader-uniform-add');
        this.btnShaderUniformReset = document.getElementById('btn-shader-uniform-reset');
        this.btnShaderUniformCancel = document.getElementById('btn-shader-uniform-cancel');
        this.btnShaderUniformApply = document.getElementById('btn-shader-uniform-apply');
        this.shaderTextureDialog = document.getElementById('shader-texture-dialog');
        this.shaderTextureList = document.getElementById('shader-texture-list');
        this.shaderTextureEmpty = document.getElementById('shader-texture-empty');
        this.shaderTextureName = document.getElementById('shader-texture-name');
        this.shaderTextureAsset = document.getElementById('shader-texture-asset');
        this.shaderTextureAssets = document.getElementById('shader-texture-assets');
        this.shaderTextureAssetsEmpty = document.getElementById('shader-texture-assets-empty');
        this.shaderTextureDialogMode = document.getElementById('shader-texture-dialog-mode');
        this.shaderTextureDialogHint = document.getElementById('shader-texture-dialog-hint');
        this.btnShaderTextureAdd = document.getElementById('btn-shader-texture-add');
        this.btnShaderTextureReset = document.getElementById('btn-shader-texture-reset');
        this.btnShaderTextureCancel = document.getElementById('btn-shader-texture-cancel');
        this.btnShaderTextureApply = document.getElementById('btn-shader-texture-apply');
        this.fileVisibilityDialog = document.getElementById('editor-file-visibility-dialog');
        this.fileVisibilityList = document.getElementById('editor-file-visibility-list');
        this.fileVisibilityEmpty = document.getElementById('editor-file-visibility-empty');
        this.fileVisibilityHint = document.getElementById('editor-file-visibility-hint');
        this.btnFileVisibilityCancel = document.getElementById('editor-file-visibility-cancel');
        this.btnFileVisibilityApply = document.getElementById('editor-file-visibility-apply');
        this.quickOpenDialog = document.getElementById('editor-quick-open-dialog');
        this.quickOpenInput = document.getElementById('editor-quick-open-input');
        this.quickOpenList = document.getElementById('editor-quick-open-list');
        this.quickOpenEmpty = document.getElementById('editor-quick-open-empty');
        this.quickOpenHint = document.getElementById('editor-quick-open-hint');
        this.btnQuickOpenCancel = document.getElementById('editor-quick-open-cancel');
        this.btnQuickOpenConfirm = document.getElementById('editor-quick-open-open');
        this.btnQuickOpenCloseIcon = document.getElementById('editor-quick-open-close-icon');
        this.contextHintsDialog = document.getElementById('editor-context-hints-dialog');
        this.contextHintsDialogContent = document.getElementById('editor-context-hints-dialog-content');
        this.contextHintsDialogNote = document.getElementById('editor-context-hints-dialog-note');
        this.btnContextHintsDialogClose = document.getElementById('editor-context-hints-dialog-close');
        this.btnContextHintsDialogCloseIcon = document.getElementById('editor-context-hints-dialog-close-icon');
        this.fileContextMenu = document.getElementById('editor-file-context-menu');
        this.btnContextHideFile = document.getElementById('btn-context-hide-file');
        this.fileDialogState = {
            mode: 'create',
            fileId: null,
            suggestedPath: '',
            suggestedRole: '',
            templateId: 'custom',
        };
        this.shaderUniformDialogState = {
            editingIndex: null,
            uniforms: [],
        };
        this.shaderTextureDialogState = {
            assets: [],
            editingIndex: null,
            selectedAssetPath: '',
            textures: [],
        };
        this.fileVisibilityDialogState = {
            hiddenKeys: [],
        };
        this.quickOpenState = {
            matches: [],
            selectedIndex: 0,
        };
        this.fileContextMenuState = {
            fileId: null,
        };

        this._initButtons();
        this._initShortcuts();
        this._initPanelControls();
        this._initLayoutControls();
        this._initFileControls();
        this._initQuickOpenDialog();
        this._initShaderUniformDialog();
        this._initShaderTextureDialog();
        this._initFileVisibilityDialog();
        this._initContextHintsDialog();
        this._updateFontSize(0);
        this._applyDocument(createEmptyExampleDocument(), { notify: false });
    }

    _readLayoutMode() {
        const stored = window.localStorage.getItem(this.layoutModeStorageKey);
        return stored === 'tabs' ? 'tabs' : 'panels';
    }

    _readVimEnabled() {
        const stored = window.localStorage.getItem(this.vimEnabledStorageKey);
        return stored == null ? true : stored !== '0';
    }

    _readSystemClipboardEnabled() {
        const stored = window.localStorage.getItem(this.systemClipboardStorageKey);
        return stored == null ? true : stored !== '0';
    }

    _sanitizePanelState(panelState = {}) {
        const collapsedFileIds = Array.isArray(panelState.collapsedFileIds)
            ? Array.from(new Set(panelState.collapsedFileIds.filter((value) => typeof value === 'string' && value.trim())))
            : [];

        return {
            collapsedFileIds,
            maximizedFileId: typeof panelState.maximizedFileId === 'string' && panelState.maximizedFileId.trim()
                ? panelState.maximizedFileId
                : null,
        };
    }

    getSessionState() {
        return {
            activeFileId: this.activeFileId,
            collapsedFileIds: [...this.panelState.collapsedFileIds],
            currentFilename: this.currentFilename,
            documentTarget: this.getDocumentTarget(),
            exercise: { ...this.exerciseState },
            layoutMode: this.layoutMode,
            maximizedFileId: this.panelState.maximizedFileId,
            vimEnabled: this.vimEnabled,
        };
    }

    restoreSessionState(sessionState = {}) {
        if (typeof sessionState.vimEnabled === 'boolean') {
            this._setVimEnabled(sessionState.vimEnabled, { persist: false, rerender: false, emit: false, showToast: false });
        }

        if (sessionState.layoutMode) {
            this._setLayoutMode(sessionState.layoutMode, { persist: false, rerender: false, emit: false });
        }

        this.activeFileId = typeof sessionState.activeFileId === 'string' && sessionState.activeFileId.trim()
            ? sessionState.activeFileId
            : null;
        this.exerciseState = this._sanitizeExerciseState(sessionState.exercise || {});
        this.panelState = this._sanitizePanelState(sessionState);
        this._renderWorkspace();
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    }

    resetLayoutState() {
        this.panelState = this._sanitizePanelState();
        this._setLayoutMode(this.vimEnabled ? 'tabs' : 'panels', { persist: true, rerender: false, emit: false });
        this._renderWorkspace();
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    }

    _emitSessionStateChange() {
        if (!this.onSessionStateChange) return;
        this.onSessionStateChange(this.getSessionState());
    }

    _createEmptyExerciseConfig() {
        return {
            comparePairs: [],
            enabled: false,
            hiddenFiles: [],
            hints: [],
            instructions: [],
            lockedFiles: [],
            referenceFiles: [],
            solutionExample: '',
            solutionFiles: [],
            title: 'Exercise',
        };
    }

    getDocumentTarget() {
        return this._isTheoryDocumentTarget() ? 'theory' : 'example';
    }

    isEditingTheoryDocument() {
        return this._isTheoryDocumentTarget();
    }

    getTheoryContent() {
        return getTheoryDocumentContent(this.currentDocument);
    }

    captureWorkspaceSnapshot() {
        return {
            currentFilename: this.currentFilename,
            document: cloneExampleDocument(this.currentDocument),
            sessionState: this.getSessionState(),
        };
    }

    async restoreWorkspaceSnapshot(snapshot = null) {
        if (!snapshot?.document) {
            this.currentFilename = null;
            this.compileDiagnostics = [];
            this._resetExerciseComparisonSource();
            this._applyDocument(createEmptyExampleDocument(), { notify: false });
            this._updateButtonStates();
            this._updateFilenameDisplay();
            this._emitSessionStateChange();
            this._triggerChange();
            return;
        }

        this.currentFilename = snapshot.currentFilename || null;
        this.compileDiagnostics = [];
        this._resetExerciseComparisonSource();
        this._applyDocument(snapshot.document, { notify: false });
        this.restoreSessionState(snapshot.sessionState || {});

        if (!isTheoryDocument(snapshot.document)) {
            await this._loadExerciseComparisonSource();
        }

        this._updateButtonStates();
        this._updateFilenameDisplay();
        this._triggerChange();
    }

    _sanitizeExerciseState(exerciseState = {}) {
        const revealedHints = Number.isFinite(exerciseState.revealedHints)
            ? exerciseState.revealedHints
            : Number.parseInt(exerciseState.revealedHints, 10);

        return {
            comparisonVisible: Boolean(exerciseState.comparisonVisible),
            notesCollapsed: Boolean(exerciseState.notesCollapsed),
            referencesRevealed: Boolean(exerciseState.referencesRevealed),
            revealedHints: Number.isFinite(revealedHints) && revealedHints > 0 ? revealedHints : 0,
            selectedComparePairId: typeof exerciseState.selectedComparePairId === 'string'
                ? exerciseState.selectedComparePairId
                : '',
            solutionsRevealed: Boolean(exerciseState.solutionsRevealed),
        };
    }

    _isExerciseMode() {
        return Boolean(this.exerciseConfig?.enabled);
    }

    _syncExerciseConfig() {
        const previousConfig = this.exerciseConfig || this._createEmptyExerciseConfig();
        const nextConfig = getExerciseConfig(this.currentDocument);
        const previousSignature = JSON.stringify({
            comparePairs: previousConfig.comparePairs,
            hiddenFiles: previousConfig.hiddenFiles,
            hints: previousConfig.hints,
            lockedFiles: previousConfig.lockedFiles,
            referenceFiles: previousConfig.referenceFiles,
            solutionExample: previousConfig.solutionExample,
            solutionFiles: previousConfig.solutionFiles,
            title: previousConfig.title,
        });
        const nextSignature = JSON.stringify({
            comparePairs: nextConfig.comparePairs,
            hiddenFiles: nextConfig.hiddenFiles,
            hints: nextConfig.hints,
            lockedFiles: nextConfig.lockedFiles,
            referenceFiles: nextConfig.referenceFiles,
            solutionExample: nextConfig.solutionExample,
            solutionFiles: nextConfig.solutionFiles,
            title: nextConfig.title,
        });

        this.exerciseConfig = nextConfig.enabled ? nextConfig : this._createEmptyExerciseConfig();

        if (!this.exerciseConfig.enabled) {
            this.exerciseState = this._sanitizeExerciseState();
            this._resetExerciseComparisonSource();
            return;
        }

        const sanitizedState = this._sanitizeExerciseState(this.exerciseState);
        const nextState = {
            comparisonVisible: sanitizedState.comparisonVisible,
            notesCollapsed: sanitizedState.notesCollapsed,
            referencesRevealed: sanitizedState.referencesRevealed && this.exerciseConfig.referenceFiles.length > 0,
            revealedHints: Math.min(sanitizedState.revealedHints, this.exerciseConfig.hints.length),
            selectedComparePairId: sanitizedState.selectedComparePairId,
            solutionsRevealed: sanitizedState.solutionsRevealed && this.exerciseConfig.solutionFiles.length > 0,
        };

        this.exerciseState = previousSignature === nextSignature
            ? nextState
            : {
                comparisonVisible: false,
                referencesRevealed: false,
                revealedHints: 0,
                selectedComparePairId: '',
                solutionsRevealed: false,
            };

        if (previousConfig.solutionExample !== this.exerciseConfig.solutionExample || !this.exerciseConfig.solutionExample) {
            this._resetExerciseComparisonSource();
        }
    }

    _resetExerciseComparisonSource() {
        this.exerciseComparisonSource = null;
        this.exerciseComparisonSourceError = '';
        this.exerciseComparisonSourceStatus = 'idle';
        this.exerciseComparisonRequestId += 1;
    }

    _isExerciseFileVisible(file) {
        if (!this._isExerciseMode()) return true;
        if (!file?.path) return true;

        if (!this.exerciseState.referencesRevealed && this.exerciseConfig.referenceFiles.includes(file.path)) {
            return false;
        }

        if (!this.exerciseState.solutionsRevealed && this.exerciseConfig.solutionFiles.includes(file.path)) {
            return false;
        }

        return true;
    }

    _isExerciseFileLocked(file) {
        return this._isExerciseMode()
            && Boolean(file?.path)
            && this.exerciseConfig.lockedFiles.includes(file.path);
    }

    _getFileVisibilityEntries() {
        return getDocumentFileVisibilityEntries(this.currentDocument);
    }

    _getFileVisibilityEntryById(fileId) {
        return this._getFileVisibilityEntries().find((entry) => entry.file.id === fileId) || null;
    }

    _getManuallyHiddenFileIdSet() {
        return new Set(
            this._getFileVisibilityEntries()
                .filter((entry) => entry.hidden)
                .map((entry) => entry.file.id)
        );
    }

    _isFileManuallyHidden(file) {
        if (!file?.id) return false;
        return this._getManuallyHiddenFileIdSet().has(file.id);
    }

    _getVisibleFiles() {
        const hiddenFileIds = this._getManuallyHiddenFileIdSet();
        return (this.currentDocument.files || []).filter((file) => (
            this._isExerciseFileVisible(file)
            && !hiddenFileIds.has(file.id)
        ));
    }

    _getQuickOpenMatches(query = '') {
        return buildQuickOpenMatches(this._getVisibleFiles(), query);
    }

    getExercisePresentation() {
        if (!this._isExerciseMode()) {
            return {
                enabled: false,
            };
        }

        const revealedHints = this.exerciseConfig.hints.slice(0, this.exerciseState.revealedHints);
        const comparisonIntent = this.exerciseConfig.comparePairs.length > 0
            || Boolean(this.exerciseConfig.solutionExample);
        const comparison = resolveExerciseComparison({
            attemptDocument: this.currentDocument,
            exerciseConfig: this.exerciseConfig,
            selectedPairId: this.exerciseState.selectedComparePairId,
            solutionDocument: this.exerciseComparisonSource,
        });
        const comparisonVisible = comparisonIntent && this.exerciseState.comparisonVisible;
        const comparisonMetaParts = [];

        if (comparison.selectedPair?.source === 'external' && this.exerciseConfig.solutionExample) {
            comparisonMetaParts.push(`Source: ${this.exerciseConfig.solutionExample}`);
        } else if (comparison.selectedPair?.source === 'internal') {
            comparisonMetaParts.push('Source: hidden solution file');
        }

        if (comparison.selectedPair?.summary) {
            const { sameCount, changedCount, addedCount, removedCount } = comparison.selectedPair.summary;
            if (changedCount > 0) comparisonMetaParts.push(`${changedCount} changed`);
            if (addedCount > 0) comparisonMetaParts.push(`${addedCount} added`);
            if (removedCount > 0) comparisonMetaParts.push(`${removedCount} missing`);
            comparisonMetaParts.push(`${sameCount} matching`);
        }

        return {
            comparison: {
                available: comparison.available,
                error: this.exerciseComparisonSourceError,
                issues: comparison.issues,
                loading: this.exerciseComparisonSourceStatus === 'loading',
                meta: comparisonMetaParts.filter(Boolean).join(' • '),
                pairs: comparison.pairs.map((pair) => ({
                    id: pair.id,
                    label: pair.label,
                })),
                rows: comparison.selectedPair?.rows || [],
                selectedPairId: comparison.selectedPairId,
                showToggle: comparisonIntent,
                visible: comparisonVisible,
            },
            enabled: true,
            hiddenReferenceCount: this.exerciseState.referencesRevealed ? 0 : this.exerciseConfig.referenceFiles.length,
            hiddenSolutionCount: this.exerciseState.solutionsRevealed ? 0 : this.exerciseConfig.solutionFiles.length,
            hints: revealedHints,
            instructions: [...this.exerciseConfig.instructions],
            lockedFileCount: this.exerciseConfig.lockedFiles.length,
            notesCollapsed: this.exerciseState.notesCollapsed,
            remainingHintCount: Math.max(this.exerciseConfig.hints.length - this.exerciseState.revealedHints, 0),
            referencesRevealed: this.exerciseState.referencesRevealed,
            showRevealReferences: this.exerciseConfig.referenceFiles.length > 0,
            showRevealSolution: this.exerciseConfig.solutionFiles.length > 0,
            solutionsRevealed: this.exerciseState.solutionsRevealed,
            title: this.exerciseConfig.title,
            totalHintCount: this.exerciseConfig.hints.length,
        };
    }

    _emitExerciseStateChange() {
        if (!this.onExerciseStateChange) return;
        this.onExerciseStateChange(this.getExercisePresentation());
    }

    revealNextExerciseHint() {
        if (!this._isExerciseMode()) return;
        if (this.exerciseState.revealedHints >= this.exerciseConfig.hints.length) return;

        this.exerciseState = {
            ...this.exerciseState,
            revealedHints: this.exerciseState.revealedHints + 1,
        };
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    }

    revealExerciseReferences() {
        if (!this._isExerciseMode() || this.exerciseState.referencesRevealed) return;

        this.exerciseState = {
            ...this.exerciseState,
            referencesRevealed: true,
        };
        this._ensureActiveFile();
        this._renderWorkspace();
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    }

    revealExerciseSolutions() {
        if (!this._isExerciseMode() || this.exerciseState.solutionsRevealed) return;

        this.exerciseState = {
            ...this.exerciseState,
            solutionsRevealed: true,
        };
        this._ensureActiveFile();
        this._renderWorkspace();
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    }

    toggleExerciseNotesCollapsed() {
        if (!this._isExerciseMode()) return;

        this.exerciseState = {
            ...this.exerciseState,
            notesCollapsed: !this.exerciseState.notesCollapsed,
        };
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    }

    toggleExerciseComparison() {
        if (!this._isExerciseMode()) return;
        if (this.exerciseConfig.comparePairs.length === 0 && !this.exerciseConfig.solutionExample) return;

        this.exerciseState = {
            ...this.exerciseState,
            comparisonVisible: !this.exerciseState.comparisonVisible,
        };
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    }

    selectExerciseComparisonPair(pairId) {
        if (!this._isExerciseMode()) return;

        this.exerciseState = {
            ...this.exerciseState,
            selectedComparePairId: typeof pairId === 'string' ? pairId : '',
        };
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    }

    async _loadExerciseComparisonSource() {
        if (!this._isExerciseMode() || !this.exerciseConfig.solutionExample || !this.currentTopicPath) {
            this._resetExerciseComparisonSource();
            this._emitExerciseStateChange();
            return;
        }

        const solutionFilename = this.exerciseConfig.solutionExample;
        const requestId = this.exerciseComparisonRequestId + 1;

        this.exerciseComparisonRequestId = requestId;
        this.exerciseComparisonSource = null;
        this.exerciseComparisonSourceError = '';
        this.exerciseComparisonSourceStatus = 'loading';
        this._emitExerciseStateChange();

        try {
            const data = await fetchExample(this.currentTopicPath, solutionFilename);
            if (requestId !== this.exerciseComparisonRequestId) return;

            this.exerciseComparisonSource = data?.content
                ? parseExampleDocument(data.content)
                : createEmptyExampleDocument();
            this.exerciseComparisonSourceError = '';
            this.exerciseComparisonSourceStatus = 'ready';
        } catch (error) {
            if (requestId !== this.exerciseComparisonRequestId) return;

            this.exerciseComparisonSource = null;
            this.exerciseComparisonSourceError = error?.message || `Failed to load "${solutionFilename}".`;
            this.exerciseComparisonSourceStatus = 'error';
        }

        this._emitExerciseStateChange();
    }

    _initShortcuts() {
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                this._handleModify();
            }
        });
    }

    _initPanelControls() {
        const btnInc = document.getElementById('btn-font-inc');
        const btnDec = document.getElementById('btn-font-dec');

        if (btnInc && btnDec) {
            btnInc.addEventListener('click', () => this._updateFontSize(1));
            btnDec.addEventListener('click', () => this._updateFontSize(-1));
        }

        if (this.btnAutoFit) {
            this.btnAutoFit.addEventListener('click', () => this._handleAutoFit());
        }
    }

    _initLayoutControls() {
        this.btnSystemClipboardToggle?.addEventListener('click', () => {
            if (!this.systemClipboardAvailable) return;
            this._setSystemClipboardEnabled(!this.systemClipboardEnabled);
        });

        this.btnVimToggle?.addEventListener('click', () => {
            this._setVimEnabled(!this.vimEnabled);
        });

        this.btnLayout?.addEventListener('click', () => {
            if (this.vimEnabled) return;
            const nextMode = this.layoutMode === 'panels' ? 'tabs' : 'panels';
            this._setLayoutMode(nextMode);
        });

        this._updateLayoutButton();
        this._updateVimUi();
    }

    _initContextHintsDialog() {
        this.btnContextHints?.addEventListener('click', () => this._openContextHintsDialog());
        this.btnContextHintsDialogClose?.addEventListener('click', () => this.contextHintsDialog?.close());
        this.btnContextHintsDialogCloseIcon?.addEventListener('click', () => this.contextHintsDialog?.close());
    }

    _initFileControls() {
        this.btnQuickOpenFile?.addEventListener('click', () => this._openQuickOpenDialog());
        this.btnAddFile?.addEventListener('click', () => this._openFileDialog('create'));
        this.btnDuplicateFile?.addEventListener('click', () => this._handleDuplicateFile());
        this.btnEditFile?.addEventListener('click', () => this._openFileDialog('edit'));
        this.btnDeleteFile?.addEventListener('click', () => this._handleDeleteFile());
        this.entrySelect?.addEventListener('change', (event) => this._handleEntryChange(event.target.value));
        this.fileDialogTemplate?.addEventListener('change', () => this._handleFileTemplateChange());
        this.fileDialogPath?.addEventListener('change', () => {
            if (this.fileDialogState.mode !== 'create' || this._getActiveTemplateId() === 'custom') return;
            this._applySelectedTemplateToDialog();
        });

        this.fileDialogLanguage?.addEventListener('change', () => {
            if (this.fileDialogState.mode !== 'create' || this.currentDocument.sourceFormat !== 'virtual-files') return;

            if (this._getActiveTemplateId() !== 'custom') {
                this._applySelectedTemplateToDialog();
                return;
            }

            const nextLanguage = this.fileDialogLanguage.value;
            const nextSuggestion = this._getSuggestedVirtualPath(nextLanguage);
            const currentPath = this.fileDialogPath?.value.trim() || '';

            if (!currentPath || currentPath === this.fileDialogState.suggestedPath) {
                this.fileDialogPath.value = nextSuggestion;
            }

            this.fileDialogState.suggestedPath = nextSuggestion;
        });

        this.fileDialogCancel?.addEventListener('click', () => this.fileDialog?.close());
        this.fileDialogForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            this._handleFileDialogSubmit();
        });
    }

    _initQuickOpenDialog() {
        this.quickOpenInput?.addEventListener('input', () => this._renderQuickOpenMatches());
        this.quickOpenInput?.addEventListener('keydown', (event) => this._handleQuickOpenKeydown(event));
        this.btnQuickOpenCancel?.addEventListener('click', () => this.quickOpenDialog?.close());
        this.btnQuickOpenCloseIcon?.addEventListener('click', () => this.quickOpenDialog?.close());
        this.btnQuickOpenConfirm?.addEventListener('click', () => this._openSelectedQuickOpenMatch());
        this.quickOpenDialog?.addEventListener('close', () => {
            this.quickOpenState = {
                matches: [],
                selectedIndex: 0,
            };

            if (this.quickOpenInput) {
                this.quickOpenInput.value = '';
            }
        });
    }

    _initShaderUniformDialog() {
        this.btnEditShaderUniforms?.addEventListener('click', () => this._openShaderUniformDialog());
        this.shaderUniformType?.addEventListener('change', () => this._syncShaderUniformDialogTypeFields());
        this.btnShaderUniformAdd?.addEventListener('click', () => this._handleAddShaderUniform());
        this.btnShaderUniformReset?.addEventListener('click', () => this._resetShaderUniformDialogForm());
        this.btnShaderUniformCancel?.addEventListener('click', () => this.shaderUniformDialog?.close());
        this.btnShaderUniformApply?.addEventListener('click', () => this._applyShaderUniformDialog());
    }

    _initShaderTextureDialog() {
        this.btnEditShaderTextures?.addEventListener('click', () => this._openShaderTextureDialog());
        this.btnShaderTextureAdd?.addEventListener('click', () => this._handleAddShaderTexture());
        this.btnShaderTextureReset?.addEventListener('click', () => this._resetShaderTextureDialogForm());
        this.btnShaderTextureCancel?.addEventListener('click', () => this.shaderTextureDialog?.close());
        this.btnShaderTextureApply?.addEventListener('click', () => this._applyShaderTextureDialog());
    }

    _initFileVisibilityDialog() {
        this.btnEditFileVisibility?.addEventListener('click', () => this._openFileVisibilityDialog());
        this.btnFileVisibilityCancel?.addEventListener('click', () => this.fileVisibilityDialog?.close());
        this.btnFileVisibilityApply?.addEventListener('click', () => this._applyFileVisibilityDialog());
        this.btnContextHideFile?.addEventListener('click', () => this._handleContextHideFile());

        this.fileVisibilityDialog?.addEventListener('close', () => {
            this.fileVisibilityDialogState.hiddenKeys = [];
        });

        document.addEventListener('click', (event) => {
            if (!this.fileContextMenu || this.fileContextMenu.classList.contains('hidden')) return;
            if (this.fileContextMenu.contains(event.target)) return;
            this._closeFileContextMenu();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this._closeFileContextMenu();
            }
        });

        window.addEventListener('resize', () => this._closeFileContextMenu());
    }

    _getFileVisibilityDialogHiddenKeys() {
        return Array.isArray(this.fileVisibilityDialogState.hiddenKeys)
            ? this.fileVisibilityDialogState.hiddenKeys
            : [];
    }

    _setFileVisibilityHint(message, type = 'info') {
        if (!this.fileVisibilityHint) return;
        this.fileVisibilityHint.textContent = message;
        this.fileVisibilityHint.classList.toggle('is-error', type === 'error');
    }

    _syncFileVisibilityDialogHint() {
        const hiddenCount = this._getFileVisibilityDialogHiddenKeys().length;
        if (hiddenCount === 0) {
            this._setFileVisibilityHint('All files are currently visible.');
            return;
        }

        this._setFileVisibilityHint(`${hiddenCount} file${hiddenCount === 1 ? '' : 's'} hidden. Hidden files stay in the Markdown document and keep compiling normally.`);
    }

    _renderFileVisibilityDialogList() {
        if (!this.fileVisibilityList || !this.fileVisibilityEmpty) return;

        const visibilityEntries = this._getFileVisibilityEntries();
        const hiddenKeys = new Set(this._getFileVisibilityDialogHiddenKeys());
        this.fileVisibilityList.innerHTML = '';

        if (visibilityEntries.length === 0) {
            this.fileVisibilityList.appendChild(this.fileVisibilityEmpty);
            this.fileVisibilityEmpty.classList.remove('hidden');
            this._setFileVisibilityHint('No files available in this document.');
            return;
        }

        this.fileVisibilityEmpty.classList.add('hidden');

        visibilityEntries.forEach((entry) => {
            const row = document.createElement('div');
            const isHidden = hiddenKeys.has(entry.key);
            row.className = `file-visibility-row ${isHidden ? 'is-hidden' : ''}`;

            const meta = document.createElement('div');
            meta.className = 'file-visibility-meta';

            const title = document.createElement('div');
            title.className = 'file-visibility-title';
            title.appendChild(this._createBadge(this._getFileDefinition(entry.file)));

            const path = document.createElement('span');
            path.className = 'file-visibility-path';
            path.textContent = entry.file.path;
            path.title = entry.file.path;
            title.appendChild(path);

            const details = document.createElement('div');
            details.className = 'file-visibility-details';

            const source = document.createElement('span');
            source.textContent = entry.file.sourceKind === 'virtual' ? 'Virtual file' : 'Legacy block';
            details.appendChild(source);

            if (entry.file.role) {
                details.appendChild(this._createRolePill(entry.file.role));
            }

            const key = document.createElement('span');
            key.textContent = entry.key;
            details.appendChild(key);

            meta.appendChild(title);
            meta.appendChild(details);

            const state = document.createElement('div');
            state.className = 'file-visibility-state';

            const toggle = document.createElement('div');
            toggle.className = 'file-visibility-toggle';
            toggle.setAttribute('role', 'group');
            toggle.setAttribute('aria-label', `Visibility for ${entry.file.path}`);

            const visibleButton = document.createElement('button');
            visibleButton.type = 'button';
            visibleButton.className = 'file-visibility-toggle-btn';
            visibleButton.textContent = 'Visible';

            const hiddenButton = document.createElement('button');
            hiddenButton.type = 'button';
            hiddenButton.className = 'file-visibility-toggle-btn';
            hiddenButton.textContent = 'Hidden';

            const applyHiddenState = (nextHidden) => {
                const nextHiddenKeys = new Set(this._getFileVisibilityDialogHiddenKeys());
                if (nextHidden) {
                    nextHiddenKeys.add(entry.key);
                    row.classList.add('is-hidden');
                } else {
                    nextHiddenKeys.delete(entry.key);
                    row.classList.remove('is-hidden');
                }

                this.fileVisibilityDialogState.hiddenKeys = Array.from(nextHiddenKeys);
                visibleButton.classList.toggle('active', !nextHidden);
                hiddenButton.classList.toggle('active', nextHidden);
                visibleButton.setAttribute('aria-pressed', String(!nextHidden));
                hiddenButton.setAttribute('aria-pressed', String(nextHidden));
                this._syncFileVisibilityDialogHint();
            };

            visibleButton.addEventListener('click', () => applyHiddenState(false));
            hiddenButton.addEventListener('click', () => applyHiddenState(true));
            applyHiddenState(isHidden);

            toggle.appendChild(visibleButton);
            toggle.appendChild(hiddenButton);
            state.appendChild(toggle);

            row.appendChild(meta);
            row.appendChild(state);
            this.fileVisibilityList.appendChild(row);
        });

        this._syncFileVisibilityDialogHint();
    }

    _openFileVisibilityDialog() {
        if (!this.fileVisibilityDialog) return;

        this.fileVisibilityDialogState.hiddenKeys = this._getFileVisibilityEntries()
            .filter((entry) => entry.hidden)
            .map((entry) => entry.key);
        this._renderFileVisibilityDialogList();
        this.fileVisibilityDialog.showModal();
    }

    _applyFileVisibilityDialog() {
        const nextDocument = updateDocumentHiddenFiles(
            this.currentDocument,
            this._getFileVisibilityDialogHiddenKeys(),
        );
        const visibleFileCount = getDocumentFileVisibilityEntries(nextDocument)
            .filter((entry) => !entry.hidden)
            .length;

        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this.fileVisibilityDialog?.close();
        this._showToast(
            visibleFileCount === 0
                ? 'All files are hidden. Use Visibility to reveal one again.'
                : 'File visibility updated.',
            'success'
        );
    }

    _setFileHiddenState(fileId, hidden, { silent = false } = {}) {
        const visibilityEntries = this._getFileVisibilityEntries();
        const targetEntry = visibilityEntries.find((entry) => entry.file.id === fileId);
        if (!targetEntry?.key) return false;

        const hiddenKeys = new Set(
            visibilityEntries
                .filter((entry) => entry.hidden)
                .map((entry) => entry.key)
        );

        if (hidden) {
            hiddenKeys.add(targetEntry.key);
        } else {
            hiddenKeys.delete(targetEntry.key);
            this.activeFileId = targetEntry.file.id;
        }

        const nextDocument = updateDocumentHiddenFiles(this.currentDocument, Array.from(hiddenKeys));
        this._closeFileContextMenu();
        this._applyDocument(nextDocument);
        this._emitSessionStateChange();

        if (!silent) {
            this._showToast(
                hidden ? `Hidden: ${targetEntry.file.path}` : `Visible: ${targetEntry.file.path}`,
                'success'
            );
        }

        return true;
    }

    _openFileContextMenu(file, clientX, clientY) {
        if (!this.fileContextMenu || !this.btnContextHideFile || !file || this._isExerciseMode()) return;

        this.fileContextMenuState.fileId = file.id;
        this.btnContextHideFile.textContent = `Hide ${file.name || file.path}`;
        this.fileContextMenu.classList.remove('hidden');
        this.fileContextMenu.setAttribute('aria-hidden', 'false');

        const { innerWidth, innerHeight } = window;
        const menuRect = this.fileContextMenu.getBoundingClientRect();
        const left = Math.max(12, Math.min(clientX, innerWidth - menuRect.width - 12));
        const top = Math.max(12, Math.min(clientY, innerHeight - menuRect.height - 12));

        this.fileContextMenu.style.left = `${left}px`;
        this.fileContextMenu.style.top = `${top}px`;
    }

    _closeFileContextMenu() {
        if (!this.fileContextMenu) return;

        this.fileContextMenu.classList.add('hidden');
        this.fileContextMenu.setAttribute('aria-hidden', 'true');
        this.fileContextMenuState.fileId = null;
    }

    _handleContextHideFile() {
        const fileId = this.fileContextMenuState.fileId;
        if (!fileId) return;
        this._setFileHiddenState(fileId, true);
    }

    _getShaderVectorSize(type = '') {
        const match = String(type || '').trim().match(/^vec([234])$/);
        return match ? Number.parseInt(match[1], 10) : 0;
    }

    _cloneShaderUniform(uniform = {}) {
        return {
            control: uniform?.control ? { ...uniform.control } : null,
            defaultValue: Array.isArray(uniform?.defaultValue)
                ? [...uniform.defaultValue]
                : uniform?.defaultValue,
            name: String(uniform?.name || ''),
            type: String(uniform?.type || ''),
            value: Array.isArray(uniform?.value)
                ? [...uniform.value]
                : uniform?.value,
        };
    }

    _getShaderUniformDialogState() {
        return Array.isArray(this.shaderUniformDialogState.uniforms)
            ? this.shaderUniformDialogState.uniforms
            : [];
    }

    _setShaderUniformDialogHint(message, type = 'info') {
        if (!this.shaderUniformDialogHint) return;
        this.shaderUniformDialogHint.textContent = message;
        this.shaderUniformDialogHint.classList.toggle('is-error', type === 'error');
    }

    _getContextHints() {
        const metadata = this.currentDocument?.metadata || {};
        const hints = [];

        if (metadata.console === true && !this._isShaderDocument()) {
            hints.push({
                accent: 'console',
                body: '`console: true` enables the runtime console below the preview for this example. Logs, errors and manual commands stay scoped to the current preview.',
                label: 'console',
                title: 'Runtime Console',
            });
        }

        if (this._isExerciseMode()) {
            hints.push({
                accent: 'exercise',
                body: '`exercise: true` enables guided mode. Related `exercise_*` keys can lock files, hide references or solutions, and enable comparison flows.',
                label: 'exercise',
                title: 'Exercise Metadata',
            });
        }

        if (this._isShaderDocument()) {
            hints.push({
                accent: 'shader',
                body: '`renderer: shader` switches the preview to WebGL. `resolution: WIDTHxHEIGHT` defines the base canvas, and saving persists the current shader resolution back to frontmatter.',
                label: 'renderer / resolution',
                title: 'Shader Runtime',
            });

            hints.push({
                accent: 'uniforms',
                body: metadata.shader_uniforms
                    ? '`shader_uniforms` defines custom controls using `name:type=value[min,max,step]`. You can edit them from the `Uniforms` button and the dialog writes that metadata for you.'
                    : 'No `shader_uniforms` are defined yet. Use the `Uniforms` button to create custom controls and serialize them into frontmatter automatically.',
                label: 'shader_uniforms',
                title: 'Custom Uniforms',
            });

            hints.push({
                accent: 'textures',
                body: metadata.shader_textures
                    ? '`shader_textures` maps sampler names to files in the current topic `assets/` folder using `sampler=asset-file`.'
                    : 'Shader textures are declared with `shader_textures` and must point to files in the current topic `assets/` folder.',
                label: 'shader_textures',
                title: 'Local Textures',
            });
        }

        return hints;
    }

    _renderContextHints() {
        const hints = this._getContextHints();
        const hasHints = hints.length > 0;

        if (this.btnContextHints) {
            this.btnContextHints.classList.toggle('hidden', !hasHints);
            this.btnContextHints.disabled = !hasHints;
            this.btnContextHints.title = hasHints
                ? `Show ${hints.length} context tip${hints.length === 1 ? '' : 's'}`
                : 'No context tips for this example';
        }

        if (!this.contextHintsDialogContent) {
            return;
        }

        this.contextHintsDialogContent.innerHTML = '';
        this.contextHintsDialogNote.textContent = hasHints
            ? `${hints.length} hint${hints.length === 1 ? '' : 's'} for the current example`
            : 'No metadata tips for the current example.';

        if (!hasHints) {
            if (this.contextHintsDialog?.open) {
                this.contextHintsDialog.close();
            }
            return;
        }

        this.contextHintsDialogContent.appendChild(this._buildContextHintsContent(hints));
    }

    _buildContextHintsContent(hints) {
        const grid = document.createElement('div');
        grid.className = `editor-context-hints-grid ${hints.length > 1 ? 'is-cascade' : 'is-single'}`;

        hints.forEach((hint) => {
            const item = document.createElement('details');
            item.className = `editor-context-hint editor-context-hint-${hint.accent}`;
            item.open = hints.length === 1;

            const summary = document.createElement('summary');
            summary.className = 'editor-context-hint-summary';

            const summaryMeta = document.createElement('div');
            summaryMeta.className = 'editor-context-hint-summary-meta';

            const label = document.createElement('span');
            label.className = 'editor-context-hint-label';
            label.textContent = hint.label;
            summaryMeta.appendChild(label);

            const heading = document.createElement('strong');
            heading.className = 'editor-context-hint-title';
            heading.textContent = hint.title;
            summaryMeta.appendChild(heading);

            const summaryAction = document.createElement('span');
            summaryAction.className = 'editor-context-hint-summary-action';
            summaryAction.textContent = 'Open';

            summary.appendChild(summaryMeta);
            summary.appendChild(summaryAction);

            const body = document.createElement('p');
            body.className = 'editor-context-hint-body';
            body.textContent = hint.body;

            item.appendChild(summary);
            item.appendChild(body);
            grid.appendChild(item);
        });

        return grid;
    }

    _openContextHintsDialog() {
        const hints = this._getContextHints();
        if (!this.contextHintsDialog || hints.length === 0) return;

        this.contextHintsDialogContent.innerHTML = '';
        this.contextHintsDialogContent.appendChild(this._buildContextHintsContent(hints));
        this.contextHintsDialogNote.textContent = `${hints.length} hint${hints.length === 1 ? '' : 's'} for the current example`;
        this.contextHintsDialog.showModal();
    }

    _openQuickOpenDialog() {
        if (!this.quickOpenDialog || !this.quickOpenInput) return;
        if (this._getVisibleFiles().length === 0) return;

        this.quickOpenInput.value = '';
        this._renderQuickOpenMatches();
        this.quickOpenDialog.showModal();
        this.quickOpenInput.focus();
        this.quickOpenInput.select();
    }

    _selectAdjacentTab(direction = 1) {
        if (this.layoutMode !== 'tabs') return;

        const files = this._getVisibleFiles();
        if (files.length <= 1) return;

        const currentIndex = Math.max(0, files.findIndex((file) => file.id === this.activeFileId));
        const normalizedDirection = direction < 0 ? -1 : 1;
        const nextIndex = (currentIndex + normalizedDirection + files.length) % files.length;
        const nextFile = files[nextIndex];
        if (!nextFile || nextFile.id === this.activeFileId) return;

        this.pendingNavigationTarget = { file: nextFile };
        this.activeFileId = nextFile.id;
        this._renderWorkspace();
        this._emitSessionStateChange();
    }

    _renderQuickOpenMatches() {
        if (!this.quickOpenList || !this.quickOpenEmpty || !this.btnQuickOpenConfirm) return;

        const matches = this._getQuickOpenMatches(this.quickOpenInput?.value || '');
        const previousSelectionId = this.quickOpenState.matches[this.quickOpenState.selectedIndex]?.id || '';
        let selectedIndex = matches.findIndex((file) => file.id === previousSelectionId);

        if (selectedIndex < 0) {
            selectedIndex = matches.length > 0 ? 0 : -1;
        }

        this.quickOpenState = {
            matches,
            selectedIndex,
        };

        this.quickOpenList.innerHTML = '';
        this.quickOpenEmpty.classList.toggle('hidden', matches.length > 0);
        this.btnQuickOpenConfirm.disabled = matches.length === 0;

        matches.forEach((file, index) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = `editor-quick-open-item${index === selectedIndex ? ' is-active' : ''}`;
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', String(index === selectedIndex));

            item.addEventListener('click', () => {
                this.quickOpenState.selectedIndex = index;
                this._openFileFromQuickPicker(file);
            });

            item.addEventListener('mousemove', () => {
                if (this.quickOpenState.selectedIndex === index) return;
                this.quickOpenState.selectedIndex = index;
                this._renderQuickOpenMatches();
            });

            const meta = document.createElement('div');
            meta.className = 'editor-quick-open-item-meta';
            meta.appendChild(this._createBadge(this._getFileDefinition(file)));

            const path = document.createElement('strong');
            path.className = 'editor-quick-open-item-path';
            path.textContent = file.path;
            meta.appendChild(path);

            if (file.role) {
                meta.appendChild(this._createRolePill(file.role));
            }

            const detail = document.createElement('div');
            detail.className = 'editor-quick-open-item-detail';
            detail.textContent = file.name && file.name !== file.path
                ? `${file.name} • ${file.language}`
                : file.language;

            item.appendChild(meta);
            item.appendChild(detail);
            this.quickOpenList.appendChild(item);
        });
    }

    _handleQuickOpenKeydown(event) {
        if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
            return;
        }

        if (!this.quickOpenState.matches.length) {
            if (event.key === 'Enter') {
                event.preventDefault();
            }
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.quickOpenState.selectedIndex = Math.min(
                this.quickOpenState.matches.length - 1,
                this.quickOpenState.selectedIndex + 1,
            );
            this._renderQuickOpenMatches();
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.quickOpenState.selectedIndex = Math.max(0, this.quickOpenState.selectedIndex - 1);
            this._renderQuickOpenMatches();
            return;
        }

        event.preventDefault();
        this._openSelectedQuickOpenMatch();
    }

    _openSelectedQuickOpenMatch() {
        const file = this.quickOpenState.matches[this.quickOpenState.selectedIndex] || null;
        if (!file) return;
        this._openFileFromQuickPicker(file);
    }

    _openFileFromQuickPicker(file) {
        if (!file?.id) return;

        this.quickOpenDialog?.close();
        this.pendingNavigationTarget = { file };

        if (this.layoutMode === 'tabs' && file.id !== this.activeFileId) {
            this.activeFileId = file.id;
            this._renderWorkspace();
            this._emitSessionStateChange();
            return;
        }

        this.activeFileId = file.id;
        this._flushPendingNavigation();
        this._emitSessionStateChange();
    }

    _syncShaderUniformDialogTypeFields() {
        const type = this.shaderUniformType?.value || 'float';
        const isBoolean = type === 'bool';
        const vectorSize = this._getShaderVectorSize(type);
        const isVector = vectorSize > 0;
        const isScalar = !isBoolean && !isVector;
        const supportsRange = ['float', 'int'].includes(type);

        this.shaderUniformScalarGroup?.classList.toggle('hidden', !isScalar);
        this.shaderUniformBoolGroup?.classList.toggle('hidden', !isBoolean);
        this.shaderUniformVectorGroup?.classList.toggle('hidden', !isVector);
        this.shaderUniformRangeGroup?.classList.toggle('hidden', !supportsRange);

        const scalarStep = type === 'int' ? '1' : '0.01';
        if (this.shaderUniformDefaultScalar) {
            this.shaderUniformDefaultScalar.step = scalarStep;
        }
        [this.shaderUniformRangeMin, this.shaderUniformRangeMax, this.shaderUniformRangeStep].forEach((input) => {
            if (input) {
                input.step = scalarStep;
            }
        });

        this.shaderUniformVectorInputs.forEach((input, index) => {
            if (!input) return;
            const visible = index < vectorSize;
            input.classList.toggle('hidden', !visible);
            input.disabled = !visible;
        });

        if (this.shaderUniformDialogTypeHint) {
            this.shaderUniformDialogTypeHint.textContent = supportsRange
                ? 'Float and int can use optional slider ranges.'
                : isVector
                    ? `Set ${vectorSize} numeric components for ${type}.`
                    : 'Boolean uniforms use a true/false default value.';
        }
    }

    _resetShaderUniformDialogForm() {
        this.shaderUniformDialogState.editingIndex = null;
        if (this.shaderUniformName) this.shaderUniformName.value = '';
        if (this.shaderUniformType) this.shaderUniformType.value = 'float';
        if (this.shaderUniformDefaultScalar) {
            this.shaderUniformDefaultScalar.value = '0';
            this.shaderUniformDefaultScalar.step = '0.01';
        }
        if (this.shaderUniformDefaultBool) this.shaderUniformDefaultBool.value = 'false';
        this.shaderUniformVectorInputs.forEach((input) => {
            if (input) input.value = '0';
        });
        if (this.shaderUniformRangeMin) this.shaderUniformRangeMin.value = '';
        if (this.shaderUniformRangeMax) this.shaderUniformRangeMax.value = '';
        if (this.shaderUniformRangeStep) this.shaderUniformRangeStep.value = '';
        this._syncShaderUniformDialogTypeFields();
        if (this.shaderUniformDialogMode) {
            this.shaderUniformDialogMode.textContent = 'Adding uniform';
            this.shaderUniformDialogMode.classList.add('hidden');
        }
        if (this.btnShaderUniformReset) {
            this.btnShaderUniformReset.classList.add('hidden');
        }
        if (this.btnShaderUniformAdd) {
            this.btnShaderUniformAdd.textContent = 'Add Uniform';
        }
        this._setShaderUniformDialogHint('This dialog writes `shader_uniforms` in frontmatter. Names must be unique and cannot reuse built-in uniforms.');
    }

    _serializeShaderUniformPreview(uniform = {}) {
        const type = String(uniform?.type || '');
        const formatScalar = (value) => {
            if (typeof value === 'boolean') return value ? 'true' : 'false';
            return String(value);
        };

        const defaultValue = Array.isArray(uniform?.defaultValue)
            ? uniform.defaultValue.join(', ')
            : formatScalar(uniform?.defaultValue);
        const range = uniform?.control?.kind === 'range'
            ? `[${uniform.control.min}, ${uniform.control.max}, ${uniform.control.step}]`
            : '';

        return `${type} = ${defaultValue}${range}`;
    }

    _fillShaderUniformDialogForm(uniform = {}, index = null) {
        this.shaderUniformDialogState.editingIndex = Number.isInteger(index) ? index : null;

        if (this.shaderUniformName) this.shaderUniformName.value = String(uniform.name || '');
        if (this.shaderUniformType) this.shaderUniformType.value = String(uniform.type || 'float');

        const type = String(uniform.type || 'float');
        if (type === 'bool') {
            if (this.shaderUniformDefaultBool) {
                this.shaderUniformDefaultBool.value = uniform.defaultValue ? 'true' : 'false';
            }
        } else if (this._getShaderVectorSize(type) > 0) {
            const vectorSize = this._getShaderVectorSize(type);
            const values = Array.isArray(uniform.defaultValue)
                ? uniform.defaultValue
                : Array.from({ length: vectorSize }, () => 0);
            this.shaderUniformVectorInputs.forEach((input, componentIndex) => {
                if (!input) return;
                input.value = componentIndex < vectorSize ? String(values[componentIndex] ?? 0) : '0';
            });
        } else if (this.shaderUniformDefaultScalar) {
            this.shaderUniformDefaultScalar.value = String(uniform.defaultValue ?? 0);
        }

        if (uniform.control?.kind === 'range') {
            if (this.shaderUniformRangeMin) this.shaderUniformRangeMin.value = String(uniform.control.min);
            if (this.shaderUniformRangeMax) this.shaderUniformRangeMax.value = String(uniform.control.max);
            if (this.shaderUniformRangeStep) this.shaderUniformRangeStep.value = String(uniform.control.step);
        } else {
            if (this.shaderUniformRangeMin) this.shaderUniformRangeMin.value = '';
            if (this.shaderUniformRangeMax) this.shaderUniformRangeMax.value = '';
            if (this.shaderUniformRangeStep) this.shaderUniformRangeStep.value = '';
        }

        this._syncShaderUniformDialogTypeFields();

        if (this.shaderUniformDialogMode) {
            this.shaderUniformDialogMode.textContent = `Editing ${uniform.name || 'uniform'}`;
            this.shaderUniformDialogMode.classList.remove('hidden');
        }
        if (this.btnShaderUniformReset) {
            this.btnShaderUniformReset.classList.remove('hidden');
        }
        if (this.btnShaderUniformAdd) {
            this.btnShaderUniformAdd.textContent = 'Update Uniform';
        }

        this._setShaderUniformDialogHint('Edit the selected uniform and press `Update Uniform` to keep the metadata in sync.');
    }

    _renderShaderUniformDialogList() {
        if (!this.shaderUniformList || !this.shaderUniformEmpty) return;

        const uniforms = this._getShaderUniformDialogState();
        this.shaderUniformList.innerHTML = '';

        if (uniforms.length === 0) {
            this.shaderUniformList.appendChild(this.shaderUniformEmpty);
            this.shaderUniformEmpty.classList.remove('hidden');
            return;
        }

        this.shaderUniformEmpty.classList.add('hidden');
        uniforms.forEach((uniform, index) => {
            const item = document.createElement('div');
            item.className = 'shader-uniform-item';

            const meta = document.createElement('div');
            meta.className = 'shader-uniform-item-meta';

            const name = document.createElement('strong');
            name.className = 'shader-uniform-item-name';
            name.textContent = uniform.name;

            const details = document.createElement('span');
            details.className = 'shader-uniform-item-details';
            details.textContent = this._serializeShaderUniformPreview(uniform);

            meta.appendChild(name);
            meta.appendChild(details);

            const actions = document.createElement('div');
            actions.className = 'shader-uniform-item-actions';

            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'btn btn-secondary shader-uniform-item-edit';
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => {
                this._fillShaderUniformDialogForm(uniform, index);
                this.shaderUniformName?.focus();
            });

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'btn btn-secondary shader-uniform-item-remove';
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => {
                this.shaderUniformDialogState.uniforms.splice(index, 1);
                if (this.shaderUniformDialogState.editingIndex === index) {
                    this._resetShaderUniformDialogForm();
                } else if (
                    Number.isInteger(this.shaderUniformDialogState.editingIndex)
                    && this.shaderUniformDialogState.editingIndex > index
                ) {
                    this.shaderUniformDialogState.editingIndex -= 1;
                }
                this._renderShaderUniformDialogList();
            });

            item.appendChild(meta);
            actions.appendChild(editButton);
            actions.appendChild(removeButton);
            item.appendChild(actions);
            this.shaderUniformList.appendChild(item);
        });
    }

    _cloneShaderTexture(texture = {}) {
        return {
            assetPath: String(texture?.assetPath || '').trim(),
            name: String(texture?.name || '').trim(),
        };
    }

    _getShaderTextureDialogState() {
        return Array.isArray(this.shaderTextureDialogState.textures)
            ? this.shaderTextureDialogState.textures
            : [];
    }

    _setShaderTextureDialogHint(message, type = 'info') {
        if (!this.shaderTextureDialogHint) return;
        this.shaderTextureDialogHint.textContent = message;
        this.shaderTextureDialogHint.classList.toggle('is-error', type === 'error');
    }

    _cloneShaderTexturesFromDocument() {
        if (!this._isShaderDocument()) return [];

        return getShaderConfig(this.currentDocument).textures
            .map((texture) => this._cloneShaderTexture(texture));
    }

    _setShaderTextureDialogSelectedAsset(assetPath = '') {
        const normalizedAssetPath = String(assetPath || '').trim();
        this.shaderTextureDialogState.selectedAssetPath = normalizedAssetPath;
        if (this.shaderTextureAsset) {
            this.shaderTextureAsset.value = normalizedAssetPath;
        }
        this._renderShaderTextureAssetOptions();
    }

    _resetShaderTextureDialogForm() {
        this.shaderTextureDialogState.editingIndex = null;
        if (this.shaderTextureName) this.shaderTextureName.value = '';
        this._setShaderTextureDialogSelectedAsset('');

        if (this.shaderTextureDialogMode) {
            this.shaderTextureDialogMode.textContent = 'Adding texture';
            this.shaderTextureDialogMode.classList.add('hidden');
        }
        if (this.btnShaderTextureReset) {
            this.btnShaderTextureReset.classList.add('hidden');
        }
        if (this.btnShaderTextureAdd) {
            this.btnShaderTextureAdd.textContent = 'Add Texture';
        }
        this._setShaderTextureDialogHint('Sampler names must be unique and must match the sampler uniforms in your shader.');
    }

    _fillShaderTextureDialogForm(texture = {}, index = null) {
        this.shaderTextureDialogState.editingIndex = Number.isInteger(index) ? index : null;
        if (this.shaderTextureName) this.shaderTextureName.value = String(texture.name || '');
        this._setShaderTextureDialogSelectedAsset(texture.assetPath || '');

        if (this.shaderTextureDialogMode) {
            this.shaderTextureDialogMode.textContent = `Editing ${texture.name || 'texture'}`;
            this.shaderTextureDialogMode.classList.remove('hidden');
        }
        if (this.btnShaderTextureReset) {
            this.btnShaderTextureReset.classList.remove('hidden');
        }
        if (this.btnShaderTextureAdd) {
            this.btnShaderTextureAdd.textContent = 'Update Texture';
        }

        this._setShaderTextureDialogHint('Edit the selected mapping and press `Update Texture` to keep `shader_textures` in sync.');
    }

    _renderShaderTextureDialogList() {
        if (!this.shaderTextureList || !this.shaderTextureEmpty) return;

        const textures = this._getShaderTextureDialogState();
        this.shaderTextureList.innerHTML = '';

        if (textures.length === 0) {
            this.shaderTextureList.appendChild(this.shaderTextureEmpty);
            this.shaderTextureEmpty.classList.remove('hidden');
            return;
        }

        this.shaderTextureEmpty.classList.add('hidden');
        textures.forEach((texture, index) => {
            const item = document.createElement('div');
            item.className = 'shader-uniform-item';

            const meta = document.createElement('div');
            meta.className = 'shader-uniform-item-meta';

            const name = document.createElement('strong');
            name.className = 'shader-uniform-item-name';
            name.textContent = texture.name;

            const details = document.createElement('span');
            details.className = 'shader-uniform-item-details';
            details.textContent = texture.assetPath;

            meta.appendChild(name);
            meta.appendChild(details);

            const actions = document.createElement('div');
            actions.className = 'shader-uniform-item-actions';

            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'btn btn-secondary shader-uniform-item-edit';
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => {
                this._fillShaderTextureDialogForm(texture, index);
                this.shaderTextureName?.focus();
            });

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'btn btn-secondary shader-uniform-item-remove';
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => {
                this.shaderTextureDialogState.textures.splice(index, 1);
                if (this.shaderTextureDialogState.editingIndex === index) {
                    this._resetShaderTextureDialogForm();
                } else if (
                    Number.isInteger(this.shaderTextureDialogState.editingIndex)
                    && this.shaderTextureDialogState.editingIndex > index
                ) {
                    this.shaderTextureDialogState.editingIndex -= 1;
                }
                this._renderShaderTextureDialogList();
            });

            item.appendChild(meta);
            actions.appendChild(editButton);
            actions.appendChild(removeButton);
            item.appendChild(actions);
            this.shaderTextureList.appendChild(item);
        });
    }

    _renderShaderTextureAssetOptions() {
        if (!this.shaderTextureAssets || !this.shaderTextureAssetsEmpty) return;

        const assets = Array.isArray(this.shaderTextureDialogState.assets)
            ? this.shaderTextureDialogState.assets
            : [];

        this.shaderTextureAssets.innerHTML = '';

        if (assets.length === 0) {
            this.shaderTextureAssets.appendChild(this.shaderTextureAssetsEmpty);
            this.shaderTextureAssetsEmpty.classList.remove('hidden');
            return;
        }

        this.shaderTextureAssetsEmpty.classList.add('hidden');
        assets.forEach((asset) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = `shader-texture-asset${asset.path === this.shaderTextureDialogState.selectedAssetPath ? ' is-selected' : ''}`;
            card.addEventListener('click', () => {
                this._setShaderTextureDialogSelectedAsset(asset.path);
            });

            const image = document.createElement('img');
            image.className = 'shader-texture-asset-preview';
            image.src = asset.url;
            image.alt = asset.filename;

            const label = document.createElement('span');
            label.className = 'shader-texture-asset-label';
            label.textContent = asset.filename;

            card.appendChild(image);
            card.appendChild(label);
            this.shaderTextureAssets.appendChild(card);
        });
    }

    _readShaderTextureDialogDraft() {
        return {
            assetPath: String(this.shaderTextureDialogState.selectedAssetPath || '').trim(),
            name: String(this.shaderTextureName?.value || '').trim(),
        };
    }

    _validateShaderTextureDraft(draft) {
        const editingIndex = Number.isInteger(this.shaderTextureDialogState.editingIndex)
            ? this.shaderTextureDialogState.editingIndex
            : null;

        if (!draft.name) {
            return 'Enter a sampler name.';
        }

        if (!/^[A-Za-z_]\w*$/.test(draft.name)) {
            return 'Sampler names must start with a letter or underscore and only use letters, numbers or underscores.';
        }

        if (!draft.assetPath) {
            return 'Select an asset from the topic assets list.';
        }

        if (this._getShaderTextureDialogState().some((texture, index) => texture.name === draft.name && index !== editingIndex)) {
            return 'That sampler name already exists in this document.';
        }

        return null;
    }

    _handleAddShaderTexture() {
        const draft = this._readShaderTextureDialogDraft();
        const validationError = this._validateShaderTextureDraft(draft);

        if (validationError) {
            this._setShaderTextureDialogHint(validationError, 'error');
            return;
        }

        const nextTexture = this._cloneShaderTexture(draft);
        if (Number.isInteger(this.shaderTextureDialogState.editingIndex)) {
            this.shaderTextureDialogState.textures.splice(this.shaderTextureDialogState.editingIndex, 1, nextTexture);
        } else {
            this.shaderTextureDialogState.textures.push(nextTexture);
        }

        this._renderShaderTextureDialogList();
        this._resetShaderTextureDialogForm();
        this.shaderTextureName?.focus();
    }

    async _openShaderTextureDialog() {
        if (!this._isShaderDocument()) {
            this._showToast('Texture editing is only available for shader documents.', 'error');
            return;
        }

        if (!this.shaderTextureDialog) return;

        this.shaderTextureDialogState.textures = this._cloneShaderTexturesFromDocument();
        this.shaderTextureDialogState.assets = [];
        this._renderShaderTextureDialogList();
        this._renderShaderTextureAssetOptions();
        this._resetShaderTextureDialogForm();
        this._setShaderTextureDialogHint('Loading topic assets…');

        try {
            this.shaderTextureDialogState.assets = this.currentTopicPath
                ? await fetchTopicAssets(this.currentTopicPath)
                : [];
            this._renderShaderTextureAssetOptions();
            this._setShaderTextureDialogHint(
                this.shaderTextureDialogState.assets.length > 0
                    ? 'Sampler names must be unique and must match the sampler uniforms in your shader.'
                    : 'No assets were found in this topic. Add image files to the topic `assets/` folder first.'
            );
        } catch (error) {
            this.shaderTextureDialogState.assets = [];
            this._renderShaderTextureAssetOptions();
            this._setShaderTextureDialogHint(`Failed to load topic assets: ${error.message}`, 'error');
        }

        this.shaderTextureDialog.showModal();
        this.shaderTextureName?.focus();
    }

    _applyShaderTextureDialog() {
        if (!this._isShaderDocument()) {
            this.shaderTextureDialog?.close();
            return;
        }

        const nextDocument = updateShaderTextureDefinitions(this.currentDocument, this._getShaderTextureDialogState());
        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this.shaderTextureDialog?.close();
        this._showToast('Shader textures updated.', 'success');
    }

    _readShaderUniformDialogDraft() {
        const type = this.shaderUniformType?.value || 'float';
        const name = String(this.shaderUniformName?.value || '').trim();
        let defaultValue = 0;

        if (type === 'bool') {
            defaultValue = this.shaderUniformDefaultBool?.value === 'true';
        } else if (this._getShaderVectorSize(type) > 0) {
            const vectorSize = this._getShaderVectorSize(type);
            defaultValue = this.shaderUniformVectorInputs
                .slice(0, vectorSize)
                .map((input) => Number.parseFloat(input?.value || '0'));
        } else if (type === 'int') {
            defaultValue = Number.parseInt(this.shaderUniformDefaultScalar?.value || '0', 10);
        } else {
            defaultValue = Number.parseFloat(this.shaderUniformDefaultScalar?.value || '0');
        }

        const hasRangeInput = [this.shaderUniformRangeMin, this.shaderUniformRangeMax, this.shaderUniformRangeStep]
            .some((input) => String(input?.value || '').trim() !== '');
        let control = null;

        if (hasRangeInput && ['float', 'int'].includes(type)) {
            const parseValue = (input) => type === 'int'
                ? Number.parseInt(String(input?.value || '').trim(), 10)
                : Number.parseFloat(String(input?.value || '').trim());
            control = {
                kind: 'range',
                min: parseValue(this.shaderUniformRangeMin),
                max: parseValue(this.shaderUniformRangeMax),
                step: parseValue(this.shaderUniformRangeStep),
            };
        }

        return {
            control,
            defaultValue,
            name,
            type,
        };
    }

    _validateShaderUniformDraft(draft) {
        const editingIndex = Number.isInteger(this.shaderUniformDialogState.editingIndex)
            ? this.shaderUniformDialogState.editingIndex
            : null;

        if (!draft.name) {
            return 'Enter a uniform name.';
        }

        if (!/^[A-Za-z_]\w*$/.test(draft.name)) {
            return 'Uniform names must start with a letter or underscore and only use letters, numbers or underscores.';
        }

        if (!SHADER_UNIFORM_TYPE_OPTIONS.includes(draft.type)) {
            return 'Select a supported uniform type.';
        }

        if (SHADER_BUILT_IN_UNIFORM_NAMES.includes(draft.name)) {
            return 'Built-in uniforms cannot be redefined here.';
        }

        if (this._getShaderUniformDialogState().some((uniform, index) => uniform.name === draft.name && index !== editingIndex)) {
            return 'That uniform name already exists in this document.';
        }

        if (draft.type === 'bool') {
            return null;
        }

        if (this._getShaderVectorSize(draft.type) > 0) {
            if (!Array.isArray(draft.defaultValue) || draft.defaultValue.some((value) => !Number.isFinite(value))) {
                return `Enter valid numeric components for ${draft.type}.`;
            }
            return null;
        }

        if (!Number.isFinite(draft.defaultValue)) {
            return 'Enter a valid numeric default value.';
        }

        if (draft.type === 'int' && !Number.isInteger(draft.defaultValue)) {
            return 'Integer uniforms require an integer default value.';
        }

        if (draft.control) {
            const { min, max, step } = draft.control;
            if (![min, max, step].every((value) => Number.isFinite(value))) {
                return 'Range values must all be numeric.';
            }
            if (max <= min || step <= 0) {
                return 'Range values must satisfy max > min and step > 0.';
            }
            if (draft.type === 'int' && ![min, max, step].every((value) => Number.isInteger(value))) {
                return 'Integer uniforms require integer range values.';
            }
            if (draft.defaultValue < min || draft.defaultValue > max) {
                return 'Default value must stay inside the declared range.';
            }
        }

        return null;
    }

    _handleAddShaderUniform() {
        const draft = this._readShaderUniformDialogDraft();
        const validationError = this._validateShaderUniformDraft(draft);

        if (validationError) {
            this._setShaderUniformDialogHint(validationError, 'error');
            return;
        }

        const nextUniform = this._cloneShaderUniform({
            ...draft,
            value: Array.isArray(draft.defaultValue) ? [...draft.defaultValue] : draft.defaultValue,
        });

        if (Number.isInteger(this.shaderUniformDialogState.editingIndex)) {
            this.shaderUniformDialogState.uniforms.splice(this.shaderUniformDialogState.editingIndex, 1, nextUniform);
        } else {
            this.shaderUniformDialogState.uniforms.push(nextUniform);
        }

        this._renderShaderUniformDialogList();
        this._resetShaderUniformDialogForm();
        if (this.shaderUniformName) {
            this.shaderUniformName.focus();
        }
    }

    _openShaderUniformDialog(uniformName = null) {
        if (!this._isShaderDocument()) {
            this._showToast('Uniform editing is only available for shader documents.', 'error');
            return;
        }

        if (!this.shaderUniformDialog) return;

        this.shaderUniformDialogState.uniforms = this.currentDocument
            ? this._cloneShaderUniformsFromDocument()
            : [];
        this._renderShaderUniformDialogList();
        this._resetShaderUniformDialogForm();
        this._setShaderUniformDialogHint('This dialog writes `shader_uniforms` in frontmatter. Names must be unique and cannot reuse built-in uniforms.');
        this.shaderUniformDialog.showModal();

        if (uniformName) {
            const uniformIndex = this._getShaderUniformDialogState().findIndex((uniform) => uniform.name === uniformName);
            if (uniformIndex >= 0) {
                this._fillShaderUniformDialogForm(this._getShaderUniformDialogState()[uniformIndex], uniformIndex);
            }
        }

        this.shaderUniformName?.focus();
    }

    openShaderUniformDialog(uniformName = null) {
        this._openShaderUniformDialog(uniformName);
    }

    openShaderTextureDialog() {
        void this._openShaderTextureDialog();
    }

    _cloneShaderUniformsFromDocument() {
        if (!this._isShaderDocument()) return [];

        return getShaderConfig(this.currentDocument).customUniforms
            .map((uniform) => this._cloneShaderUniform({
                ...uniform,
                value: Array.isArray(uniform.value) ? [...uniform.value] : uniform.value,
            }));
    }

    _applyShaderUniformDialog() {
        if (!this._isShaderDocument()) {
            this.shaderUniformDialog?.close();
            return;
        }

        const nextDocument = updateShaderUniformDefinitions(this.currentDocument, this._getShaderUniformDialogState());
        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this.shaderUniformDialog?.close();
        this._showToast('Shader uniforms updated.', 'success');
    }

    _getDocumentFramework() {
        return String(this.currentDocument?.metadata?.framework || '').trim().toLowerCase();
    }

    _isVirtualFileDocument() {
        return this.currentDocument?.sourceFormat === 'virtual-files';
    }

    _isFrameworkMultiFileDocument() {
        return this._isVirtualFileDocument() && ['react', 'vue'].includes(this._getDocumentFramework());
    }

    _isTheoryDocumentTarget() {
        return isTheoryDocument(this.currentDocument);
    }

    _isShaderDocument() {
        return isShaderDocument(this.currentDocument);
    }

    _getActiveTemplateId() {
        const value = this.fileDialogTemplate?.value || this.fileDialogState.templateId || 'custom';
        return value || 'custom';
    }

    _populateTemplateOptions() {
        if (!this.fileDialogTemplate || !this.fileDialogTemplateGroup) return;

        const templateOptions = getFrameworkFileTemplateOptions(this.currentDocument);
        this.fileDialogTemplate.innerHTML = '';

        const customOption = document.createElement('option');
        customOption.value = 'custom';
        customOption.textContent = 'Custom';
        this.fileDialogTemplate.appendChild(customOption);

        templateOptions.forEach((template) => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.label;
            this.fileDialogTemplate.appendChild(option);
        });

        const shouldShow = this.fileDialogState.mode === 'create' && templateOptions.length > 0;
        this.fileDialogTemplateGroup.classList.toggle('hidden', !shouldShow);
        this.fileDialogTemplate.disabled = !shouldShow;
        this.fileDialogTemplate.value = 'custom';
        this.fileDialogState.templateId = 'custom';
    }

    _handleFileTemplateChange() {
        const templateId = this._getActiveTemplateId();
        this.fileDialogState.templateId = templateId;

        if (templateId === 'custom') {
            const nextLanguage = this.fileDialogLanguage?.value || '';
            const nextSuggestion = this._getSuggestedVirtualPath(nextLanguage);
            const currentPath = this.fileDialogPath?.value.trim() || '';

            if (this.fileDialogPath && (!currentPath || currentPath === this.fileDialogState.suggestedPath)) {
                this.fileDialogPath.value = nextSuggestion;
            }

            if (this.fileDialogRole && (!this.fileDialogRole.value || this.fileDialogRole.value === this.fileDialogState.suggestedRole)) {
                this.fileDialogRole.value = this._getDefaultVirtualRole(nextLanguage);
            }

            this.fileDialogState.suggestedPath = nextSuggestion;
            this.fileDialogState.suggestedRole = this.fileDialogRole?.value || '';
            if (this.fileDialogHint) {
                this.fileDialogHint.textContent = 'New files are stored inside the same Markdown document using @file sections.';
            }
            return;
        }

        this._applySelectedTemplateToDialog();
    }

    _applySelectedTemplateToDialog() {
        const templateId = this._getActiveTemplateId();
        if (templateId === 'custom') return;

        const currentPath = this.fileDialogPath?.value.trim() || '';
        const requestedPath = !currentPath || currentPath === this.fileDialogState.suggestedPath
            ? ''
            : currentPath;
        const requestedLanguage = this.fileDialogLanguage?.value || '';
        const requestedRole = (this.fileDialogRole?.value || '') === this.fileDialogState.suggestedRole
            ? ''
            : (this.fileDialogRole?.value || '');

        const scaffold = buildFrameworkFileTemplate(this.currentDocument, templateId, {
            language: requestedLanguage,
            path: requestedPath,
            role: requestedRole,
        });

        if (!scaffold || !scaffold.files?.length) return;

        const primaryFile = scaffold.files[0];

        if (this.fileDialogLanguage && this.fileDialogLanguage.value !== primaryFile.language) {
            this.fileDialogLanguage.value = primaryFile.language;
        }

        if (this.fileDialogPath) {
            this.fileDialogPath.value = primaryFile.path;
        }

        if (this.fileDialogRole) {
            this.fileDialogRole.value = requestedRole || primaryFile.role || '';
        }

        this.fileDialogState.suggestedPath = primaryFile.path;
        this.fileDialogState.suggestedRole = primaryFile.role || '';
        this.fileDialogState.templateId = templateId;

        if (this.fileDialogHint) {
            this.fileDialogHint.textContent = scaffold.hint || 'Scaffold ready.';
        }
    }

    _normalizeVirtualPathInput(value = '') {
        return String(value)
            .trim()
            .replaceAll('\\', '/')
            .replace(/^\.\/+/, '')
            .replace(/^\/+/, '')
            .replace(/\/{2,}/g, '/');
    }

    _getPathDirectory(path = '') {
        const normalized = this._normalizeVirtualPathInput(path);
        const slashIndex = normalized.lastIndexOf('/');
        return slashIndex === -1 ? '' : normalized.slice(0, slashIndex);
    }

    _getLanguageFromPath(path = '') {
        const normalized = this._normalizeVirtualPathInput(path).toLowerCase();

        if (normalized.endsWith('.tsx')) return 'tsx';
        if (normalized.endsWith('.jsx')) return 'jsx';
        if (normalized.endsWith('.ts') || normalized.endsWith('.mts')) return 'typescript';
        if (normalized.endsWith('.js') || normalized.endsWith('.mjs')) return 'javascript';
        if (normalized.endsWith('.scss')) return 'scss';
        if (normalized.endsWith('.sass')) return 'sass';
        if (normalized.endsWith('.css')) return 'css';
        if (normalized.endsWith('.json')) return 'json';
        if (normalized.endsWith('.vue')) return 'vue';
        if (normalized.endsWith('.svg')) return 'svg';
        if (normalized.endsWith('.pug')) return 'pug';
        if (normalized.endsWith('.html') || normalized.endsWith('.htm')) return 'html';
        return '';
    }

    _getSuggestedVirtualPath(language = '') {
        const normalizedLanguage = normalizeBlockType(language);
        const framework = this._getDocumentFramework();
        const activeDirectory = this._getPathDirectory(this._getActiveFile()?.path || '');
        const baseDirectory = activeDirectory || 'src';
        const existingPaths = new Set((this.currentDocument.files || []).map((file) => file.path));

        const fileNameMap = {
            css: 'styles.css',
            fragment: 'shader.frag',
            html: 'template.html',
            javascript: framework === 'vue' ? 'module.js' : 'module.js',
            json: 'data.json',
            jsx: 'NewComponent.jsx',
            pug: 'template.pug',
            sass: 'styles.sass',
            scss: 'styles.scss',
            svg: 'graphic.svg',
            vertex: 'shader.vert',
            tsx: 'NewComponent.tsx',
            typescript: framework === 'vue' ? 'module.ts' : 'module.ts',
            vue: 'NewComponent.vue',
        };

        const fileName = fileNameMap[normalizedLanguage] || 'new-file.txt';
        const basePath = baseDirectory ? `${baseDirectory}/${fileName}` : fileName;

        if (!existingPaths.has(basePath)) {
            return basePath;
        }

        const extensionIndex = fileName.lastIndexOf('.');
        const fileStem = extensionIndex === -1 ? fileName : fileName.slice(0, extensionIndex);
        const extension = extensionIndex === -1 ? '' : fileName.slice(extensionIndex);
        let candidateIndex = 2;
        let candidatePath = `${baseDirectory}/${fileStem}-${candidateIndex}${extension}`;

        while (existingPaths.has(candidatePath)) {
            candidateIndex += 1;
            candidatePath = `${baseDirectory}/${fileStem}-${candidateIndex}${extension}`;
        }

        return candidatePath;
    }

    _getDefaultVirtualRole(language = '') {
        const normalizedLanguage = normalizeBlockType(language);
        const framework = this._getDocumentFramework();
        const hasEntry = getDocumentEntryCandidates(this.currentDocument).length > 0;

        if (!hasEntry && (
            (framework === 'react' && ['jsx', 'tsx', 'javascript', 'typescript'].includes(normalizedLanguage))
            || (framework === 'vue' && ['javascript', 'typescript'].includes(normalizedLanguage))
        )) {
            return 'entry';
        }

        if (['css', 'scss', 'sass'].includes(normalizedLanguage)) return 'style';
        if (['html', 'svg', 'pug'].includes(normalizedLanguage)) return 'markup';
        if (normalizedLanguage === 'json') return 'config';
        if (normalizedLanguage === 'vue') return 'component';
        if (['jsx', 'tsx'].includes(normalizedLanguage)) return 'component';
        return 'util';
    }

    _toPascalCase(value = '') {
        return String(value)
            .replace(/\.[^.]+$/, '')
            .split(/[^A-Za-z0-9]+/)
            .filter(Boolean)
            .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
            .join('') || 'NewFile';
    }

    _getDefaultFileContent({ language = '', path = '', role = '' } = {}) {
        const normalizedLanguage = normalizeBlockType(language);
        const framework = this._getDocumentFramework();
        const componentName = this._toPascalCase(path.split('/').pop() || 'NewFile');
        const usesTypedVue = framework === 'vue'
            && (this.currentDocument.files || []).some((file) => ['typescript'].includes(file.language));
        const usesVueSfc = framework === 'vue'
            && (this.currentDocument.files || []).some((file) => file.language === 'vue');

        switch (normalizedLanguage) {
            case 'vertex':
                return `attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
            case 'fragment':
                return `precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
varying vec2 v_uv;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  gl_FragColor = vec4(uv, 0.5 + 0.5 * sin(u_time), 1.0);
}`;
            case 'html':
                return framework === 'vue'
                    ? `<section class="${componentName.toLowerCase()}">\n  <h2>${componentName}</h2>\n</section>`
                    : `<section>\n  <h2>${componentName}</h2>\n</section>`;
            case 'html-full':
                return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${componentName}</title>
  <style>
    body {
      margin: 0;
      padding: 24px;
      font-family: system-ui, sans-serif;
    }
  </style>
</head>
<body>
  <main>
    <h1>${componentName}</h1>
  </main>
</body>
</html>`;
            case 'vue':
                return `<template>
  <section class="${componentName.toLowerCase()}">
    <p class="${componentName.toLowerCase()}__eyebrow">Vue SFC</p>
    <h2>{{ title }}</h2>
  </section>
</template>

<script setup${usesTypedVue ? ' lang="ts"' : ''}>
import { ref } from 'vue';

const title = ref('${componentName}');
</script>

<style scoped>
.${componentName.toLowerCase()} {
  display: grid;
  gap: 8px;
}

.${componentName.toLowerCase()}__eyebrow {
  color: #58a6ff;
  text-transform: uppercase;
}
</style>`;
            case 'svg':
                return '<svg viewBox="0 0 120 120">\n  <circle cx="60" cy="60" r="40" fill="#58a6ff" />\n</svg>';
            case 'pug':
                return `section\n  h2 ${componentName}`;
            case 'css':
                return `.${componentName.toLowerCase()} {\n  display: block;\n}`;
            case 'scss':
                return `$accent: #58a6ff;\n\n.${componentName.toLowerCase()} {\n  color: $accent;\n}`;
            case 'sass':
                return `$accent: #58a6ff\n\n.${componentName.toLowerCase()}\n  color: $accent`;
            case 'javascript':
                if (framework === 'vue' && role === 'entry') {
                    return usesVueSfc
                        ? "import { createApp } from 'vue';\nimport App from './App.vue';\n\ncreateApp(App).mount('#app');"
                        : "import { createApp } from 'vue';\nimport App from './App.js';\n\ncreateApp(App).mount('#app');";
                }
                if (framework === 'vue') {
                    return `import { defineComponent } from 'vue';\nimport render from './${componentName}.html';\n\nexport default defineComponent({\n  name: '${componentName}',\n  render,\n});`;
                }
                return `export function ${componentName}() {\n  return '${componentName}';\n}`;
            case 'json':
                return `{\n  "title": "${componentName}",\n  "items": [\n    {\n      "id": 1,\n      "label": "First item"\n    },\n    {\n      "id": 2,\n      "label": "Second item"\n    }\n  ]\n}`;
            case 'typescript':
                if (framework === 'vue' && role === 'entry') {
                    return usesVueSfc
                        ? "import { createApp } from 'vue';\nimport App from './App.vue';\n\ncreateApp(App).mount('#app');"
                        : "import { createApp } from 'vue';\nimport App from './App.ts';\n\ncreateApp(App).mount('#app');";
                }
                if (framework === 'vue') {
                    return `import { defineComponent } from 'vue';\nimport render from './${componentName}.html';\n\nexport default defineComponent({\n  name: '${componentName}',\n  render,\n});`;
                }
                return `export function ${componentName}(): string {\n  return '${componentName}';\n}`;
            case 'jsx':
                if (role === 'entry') {
                    return "import { createRoot } from 'react-dom/client';\nimport { App } from './App.jsx';\n\nconst root = createRoot(document.getElementById('root'));\nroot.render(<App />);";
                }
                return `export function ${componentName}() {\n  return <section className="${componentName.toLowerCase()}">${componentName}</section>;\n}`;
            case 'tsx':
                if (role === 'entry') {
                    return "import { createRoot } from 'react-dom/client';\nimport { App } from './App.tsx';\n\nconst root = createRoot(document.getElementById('root') as HTMLElement);\nroot.render(<App />);";
                }
                return `export function ${componentName}() {\n  return <section className="${componentName.toLowerCase()}">${componentName}</section>;\n}`;
            default:
                return '';
        }
    }

    _openFileDialog(mode = 'create') {
        if (this._isExerciseMode()) {
            this._showToast('Exercise mode keeps the file structure fixed.', 'error');
            return;
        }

        if (!this.fileDialog || !this.fileDialogLanguage) return;
        if (!this.currentTopicPath) {
            this._showToast('Select a topic before editing files.', 'error');
            return;
        }

        const isVirtual = this._isVirtualFileDocument();
        const activeFile = this._getActiveFile();
        if (mode === 'edit' && (!isVirtual || !activeFile)) {
            this._showToast('Only virtual files can be edited from this dialog.', 'error');
            return;
        }

        const languageOptions = getDocumentLanguageOptions(this.currentDocument);
        if (languageOptions.length === 0) {
            this._showToast('This document cannot create additional files yet.', 'error');
            return;
        }

        this.fileDialogState = {
            mode,
            fileId: mode === 'edit' ? activeFile.id : null,
            suggestedPath: '',
            suggestedRole: '',
            templateId: 'custom',
        };

        this.fileDialogLanguage.innerHTML = '';
        languageOptions.forEach((language) => {
            const option = document.createElement('option');
            option.value = language;
            option.textContent = language.toUpperCase();
            this.fileDialogLanguage.appendChild(option);
        });

        this.fileDialogRole.innerHTML = '';
        VIRTUAL_FILE_ROLE_OPTIONS.forEach((role) => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = role ? role : 'none';
            this.fileDialogRole.appendChild(option);
        });

        this._populateTemplateOptions();

        if (mode === 'edit') {
            this.fileDialogTitle.textContent = 'Edit File';
            this.fileDialogConfirm.textContent = 'Apply';
            this.fileDialogTemplateGroup?.classList.add('hidden');
            this.fileDialogPathGroup.classList.remove('hidden');
            this.fileDialogRoleGroup.classList.remove('hidden');
            this.fileDialogHint.textContent = 'Path, language and role are serialized inside the Markdown document.';
            this.fileDialogPath.value = activeFile.path;
            this.fileDialogLanguage.value = activeFile.language;
            this.fileDialogRole.value = activeFile.role || '';
            this.fileDialogState.suggestedRole = activeFile.role || '';
        } else {
            const initialLanguage = languageOptions[0] || 'html';
            const suggestedPath = this._getSuggestedVirtualPath(initialLanguage);
            this.fileDialogTitle.textContent = isVirtual ? 'Create File' : 'Add Block';
            this.fileDialogConfirm.textContent = isVirtual ? 'Create' : 'Add';
            this.fileDialogPathGroup.classList.toggle('hidden', !isVirtual);
            this.fileDialogRoleGroup.classList.toggle('hidden', !isVirtual);
            this.fileDialogHint.textContent = isVirtual
                ? 'New files are stored inside the same Markdown document using @file sections.'
                : 'Legacy examples keep one code block per language. Add only the blocks you need.';
            this.fileDialogLanguage.value = initialLanguage;
            this.fileDialogPath.value = isVirtual ? suggestedPath : '';
            this.fileDialogRole.value = isVirtual ? this._getDefaultVirtualRole(initialLanguage) : '';
            this.fileDialogState.suggestedPath = suggestedPath;
            this.fileDialogState.suggestedRole = this.fileDialogRole.value || '';
        }

        this.fileDialog.showModal();
        if (!this.fileDialogPathGroup.classList.contains('hidden')) {
            this.fileDialogPath.focus();
            this.fileDialogPath.select();
        } else {
            this.fileDialogLanguage.focus();
        }
    }

    _handleFileDialogSubmit() {
        const mode = this.fileDialogState.mode || 'create';
        const language = normalizeBlockType(this.fileDialogLanguage?.value || '');

        if (!language) {
            this._showToast('Select a language first.', 'error');
            return;
        }

        if (mode === 'edit') {
            const activeFile = this._getActiveFile();
            if (!activeFile) return;

            const nextPath = this._normalizeVirtualPathInput(this.fileDialogPath?.value || '');
            const nextRole = this.fileDialogRole?.value || '';
            if (!nextPath) {
                this._showToast('File path cannot be empty.', 'error');
                return;
            }

            const hasConflict = (this.currentDocument.files || []).some((file) => file.id !== activeFile.id && file.path === nextPath);
            if (hasConflict) {
                this._showToast(`Another file already uses "${nextPath}".`, 'error');
                return;
            }

            const nextDocument = updateDocumentFileDetails(this.currentDocument, activeFile.id, {
                language,
                path: nextPath,
                role: nextRole,
            });

            this.fileDialog.close();
            this.activeFileId = nextDocument.files.find((file) => file.path === nextPath)?.id || null;
            this._applyDocument(nextDocument);
            this._emitSessionStateChange();
            this._showToast(`Updated file: ${nextPath}`, 'success');
            return;
        }

        if (this._isVirtualFileDocument()) {
            const path = this._normalizeVirtualPathInput(this.fileDialogPath?.value || '');
            const role = this.fileDialogRole?.value || '';
            const templateId = this._getActiveTemplateId();
            if (!path) {
                this._showToast('File path cannot be empty.', 'error');
                return;
            }

            if (templateId !== 'custom' && this._isFrameworkMultiFileDocument()) {
                const scaffold = buildFrameworkFileTemplate(this.currentDocument, templateId, {
                    language,
                    path,
                    role,
                });

                if (!scaffold || !scaffold.files?.length) {
                    this._showToast('Template scaffold could not be generated.', 'error');
                    return;
                }

                const existingPaths = new Set((this.currentDocument.files || []).map((file) => file.path));
                const nextPaths = new Set();

                for (const file of scaffold.files) {
                    if (!file.path) {
                        this._showToast('Template generated an invalid empty path.', 'error');
                        return;
                    }

                    if (existingPaths.has(file.path) || nextPaths.has(file.path)) {
                        this._showToast(`Another file already uses "${file.path}".`, 'error');
                        return;
                    }

                    nextPaths.add(file.path);
                }

                let nextDocument = this.currentDocument;
                scaffold.files.forEach((file) => {
                    nextDocument = createDocumentFile(nextDocument, file);
                });

                this.fileDialog.close();
                this.activeFileId = nextDocument.files.find((file) => file.path === scaffold.primaryPath)?.id || null;
                this._applyDocument(nextDocument);
                this._emitSessionStateChange();
                this._showToast(
                    scaffold.files.length === 1
                        ? `Created file: ${scaffold.primaryPath}`
                        : `Created ${scaffold.files.length} files from template`,
                    'success',
                );
                return;
            }

            const hasConflict = (this.currentDocument.files || []).some((file) => file.path === path);
            if (hasConflict) {
                this._showToast(`Another file already uses "${path}".`, 'error');
                return;
            }

            const nextDocument = createDocumentFile(this.currentDocument, {
                content: this._getDefaultFileContent({ language, path, role }),
                language,
                path,
                role,
            });

            this.fileDialog.close();
            this.activeFileId = nextDocument.files.find((file) => file.path === path)?.id || null;
            this._applyDocument(nextDocument);
            this._emitSessionStateChange();
            this._showToast(`Created file: ${path}`, 'success');
            return;
        }

        const nextDocument = createDocumentFile(this.currentDocument, {
            content: this._getDefaultFileContent({ language }),
            language,
        });
        const nextFile = [...(nextDocument.files || [])].reverse().find((file) => file.language === language) || nextDocument.files.at(-1) || null;

        this.fileDialog.close();
        this.activeFileId = nextFile?.id || null;
        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this._showToast(`Added block: ${language.toUpperCase()}`, 'success');
    }

    _handleDuplicateFile() {
        if (this._isExerciseMode()) {
            this._showToast('Duplicate is disabled in exercise mode.', 'error');
            return;
        }

        const activeFile = this._getActiveFile();
        if (!activeFile) return;

        const fileIndex = (this.currentDocument.files || []).findIndex((file) => file.id === activeFile.id);
        const nextDocument = duplicateDocumentFile(this.currentDocument, activeFile.id);
        const nextFile = nextDocument.files[fileIndex + 1] || nextDocument.files.at(-1) || null;

        this.activeFileId = nextFile?.id || null;
        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this._showToast(`Duplicated: ${activeFile.path}`, 'success');
    }

    _handleDeleteFile() {
        if (this._isExerciseMode()) {
            this._showToast('Delete is disabled in exercise mode.', 'error');
            return;
        }

        const activeFile = this._getActiveFile();
        if (!activeFile) return;

        if (this._isVirtualFileDocument() && (this.currentDocument.files || []).length <= 1) {
            this._showToast('A multi-file document must keep at least one file.', 'error');
            return;
        }

        const confirmDelete = confirm(`Delete "${activeFile.path}" from this document?`);
        if (!confirmDelete) return;

        const fileIndex = (this.currentDocument.files || []).findIndex((file) => file.id === activeFile.id);
        const nextDocument = removeDocumentFile(this.currentDocument, activeFile.id);
        const nextFile = nextDocument.files[Math.min(fileIndex, Math.max(nextDocument.files.length - 1, 0))] || null;

        this.activeFileId = nextFile?.id || null;
        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this._showToast(`Removed: ${activeFile.path}`, 'success');
    }

    _handleEntryChange(entryPath) {
        if (this._isExerciseMode()) {
            this._showToast('Entry selection is disabled in exercise mode.', 'error');
            return;
        }

        if (!this._isFrameworkMultiFileDocument()) return;

        const activeFileId = this.activeFileId;
        const nextDocument = setDocumentEntryPath(this.currentDocument, entryPath);
        this.activeFileId = nextDocument.files.find((file) => file.id === activeFileId)?.id || activeFileId;
        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this._showToast(`Entry set to: ${entryPath}`, 'success');
    }

    _updateFontSize(delta) {
        const minFont = 10;
        const maxFont = 24;
        this.fontSize = Math.max(minFont, Math.min(maxFont, this.fontSize + delta));
        document.documentElement.style.setProperty('--editor-font-size', `${this.fontSize}px`);
    }

    async _handleSave() {
        if (!this.currentTopicPath || hasBlockingDiagnostics(this.currentDocument)) return;
        if ((this.currentDocument.files || []).length === 0) return;
        if (this._isTheoryDocumentTarget()) {
            await this._handleModifyTheory();
            return;
        }

        const documentToPersist = this._getPersistableDocument();
        const content = buildExampleDocument(documentToPersist);

        try {
            const result = await saveExample(this.currentTopicPath, content);
            this.currentFilename = result.filename;
            this.currentDocument = documentToPersist;
            this._updateButtonStates();
            this._updateFilenameDisplay();
            this._triggerChange();
            this._emitSessionStateChange();
            this._showToast(`Saved: ${result.filename}`, 'success');
        } catch (error) {
            console.error(error);
            this._showToast(`Failed to save: ${error.message}`, 'error');
        }
    }

    _handleVimWrite() {
        if (!this.currentTopicPath) {
            this._showToast('Select a topic before saving.', 'error');
            return;
        }

        if (hasBlockingDiagnostics(this.currentDocument)) {
            this._showToast('Fix blocking errors before saving.', 'error');
            return;
        }

        if (this.currentFilename) {
            this._handleModify();
            return;
        }

        this._handleSave();
    }

    _initButtons() {
        this.btnSave.addEventListener('click', async () => this._handleSave());

        this.btnModify.addEventListener('click', () => this._handleModify());

        this.btnRemove.addEventListener('click', async () => {
            if (!this.currentTopicPath || !this.currentFilename) return;
            const confirmDelete = confirm(`Delete "${this.currentFilename}"?`);
            if (!confirmDelete) return;

            try {
                await removeExample(this.currentTopicPath, this.currentFilename);
                this.currentFilename = null;
                this._applyDocument(createEmptyExampleDocument());
                this._updateButtonStates();
                this._updateFilenameDisplay();
                this._emitSessionStateChange();
                this._showToast('Example deleted', 'success');
            } catch (error) {
                console.error(error);
                this._showToast(`Delete failed: ${error.message}`, 'error');
            }
        });

        this.btnRename.addEventListener('click', async () => {
            if (!this.currentTopicPath || !this.currentFilename) return;
            const newName = prompt('Enter new filename:', this.currentFilename);
            if (!newName || newName === this.currentFilename) return;

            const newFilename = newName.endsWith('.md') ? newName : `${newName}.md`;

            try {
                await renameExample(this.currentTopicPath, this.currentFilename, newFilename);
                const oldFilename = this.currentFilename;
                this.currentFilename = newFilename;
                this._updateFilenameDisplay();
                this._emitSessionStateChange();
                this._showToast(`Renamed to: ${newFilename}`, 'success');
                if (this.onRename) this.onRename(newFilename, oldFilename);
            } catch (error) {
                console.error(error);
                this._showToast(`Rename failed: ${error.message}`, 'error');
            }
        });
    }

    async loadExample(filename) {
        const data = await fetchExample(this.currentTopicPath, filename);
        if (!data?.content) return;

        const documentModel = parseExampleDocument(data.content);
        this.currentFilename = filename;
        this._applyDocument(documentModel);
        await this._loadExerciseComparisonSource();
        this._updateButtonStates();
        this._updateFilenameDisplay();
        this._emitSessionStateChange();

        if (hasBlockingDiagnostics(documentModel)) {
            this._showToast(`Loaded in safe mode: ${filename}`, 'error');
        } else {
            this._showToast(`Loaded: ${filename}`, 'success');
        }
    }

    loadTheoryDocument(content = '') {
        this.currentFilename = 'main.md';
        this.compileDiagnostics = [];
        this._resetExerciseComparisonSource();
        this._setLayoutMode('tabs', { persist: true, rerender: false, emit: false });
        this._applyDocument(createTheoryDocument(content));
        this._updateButtonStates();
        this._updateFilenameDisplay();
        this._emitSessionStateChange();
        this._showToast('Editing theory: main.md', 'success');
    }

    setTopicPath(path) {
        this.currentTopicPath = path;
        this.currentFilename = null;
        this.compileDiagnostics = [];
        this._resetExerciseComparisonSource();
        this._applyDocument(createEmptyExampleDocument(), { notify: false });
        this._updateButtonStates();
        this._updateFilenameDisplay();
        this._emitSessionStateChange();
    }

    _applyDocument(documentModel, { notify = true } = {}) {
        this.currentDocument = synchronizeDocument(cloneExampleDocument(documentModel));
        this.compileDiagnostics = [];
        this._syncExerciseConfig();
        this._ensureActiveFile();
        this._renderWorkspace();
        this._updateStatus();
        this._renderContextHints();
        this._updateButtonStates();
        this._syncAllEditorDiagnostics();
        this._emitExerciseStateChange();

        if (notify) {
            this._triggerChange();
        }
    }

    _ensureActiveFile() {
        const files = this._getVisibleFiles();

        if (files.length === 0) {
            this.activeFileId = null;
            return;
        }

        if (!files.some((file) => file.id === this.activeFileId)) {
            this.activeFileId = files[0].id;
        }
    }

    _setLayoutMode(mode, { persist = true, rerender = true, emit = true } = {}) {
        this.layoutMode = this.vimEnabled ? 'tabs' : (mode === 'tabs' ? 'tabs' : 'panels');

        if (persist) {
            window.localStorage.setItem(this.layoutModeStorageKey, this.layoutMode);
        }

        this._updateLayoutButton();
        this._updatePanelControlStates();

        if (rerender) {
            this._renderWorkspace();
        }

        if (emit) {
            this._emitSessionStateChange();
        }
    }

    _updateLayoutButton() {
        if (!this.btnLayout) return;

        const label = this.vimEnabled
            ? 'Tabs'
            : (this.layoutMode === 'panels' ? 'Tabs' : 'Panels');
        const description = this.vimEnabled
            ? 'Disable Vim mode to use vertical panels'
            : (this.layoutMode === 'panels'
                ? 'Switch to tabs view'
                : 'Switch to vertical panels');
        const labelNode = this.btnLayout.querySelector('.editor-layout-label');

        if (labelNode) {
            labelNode.textContent = label;
        } else {
            this.btnLayout.textContent = label;
        }

        this.btnLayout.disabled = this.vimEnabled;
        this.btnLayout.title = description;
        this.btnLayout.setAttribute('aria-label', description);
        this.btnLayout.dataset.mode = this.layoutMode;
    }

    _updatePanelControlStates() {
        if (!this.btnAutoFit) return;
        this.btnAutoFit.disabled = this.vimEnabled || this.layoutMode !== 'panels' || this._getVisibleFiles().length === 0;
    }

    _updateVimUi() {
        if (this.btnSystemClipboardToggle) {
            this.btnSystemClipboardToggle.classList.toggle('is-active', this.systemClipboardEnabled && this.systemClipboardAvailable);
            this.btnSystemClipboardToggle.toggleAttribute('disabled', !this.systemClipboardAvailable);
            this.btnSystemClipboardToggle.setAttribute('aria-pressed', String(this.systemClipboardEnabled && this.systemClipboardAvailable));
            this.btnSystemClipboardToggle.title = this.systemClipboardAvailable
                ? (this.systemClipboardEnabled ? 'Disable system clipboard' : 'Enable system clipboard')
                : 'System clipboard unavailable in this browser context';
            this.btnSystemClipboardToggle.setAttribute(
                'aria-label',
                this.systemClipboardAvailable
                    ? (this.systemClipboardEnabled ? 'Disable system clipboard' : 'Enable system clipboard')
                    : 'System clipboard unavailable in this browser context',
            );
        }

        if (this.btnVimToggle) {
            this.btnVimToggle.classList.toggle('is-active', this.vimEnabled);
            this.btnVimToggle.setAttribute('aria-pressed', String(this.vimEnabled));
            this.btnVimToggle.title = this.vimEnabled ? 'Disable Vim mode' : 'Enable Vim mode';
            this.btnVimToggle.setAttribute('aria-label', this.vimEnabled ? 'Disable Vim mode' : 'Enable Vim mode');
        }

        if (this.vimModeIndicator) {
            this.vimModeIndicator.classList.toggle('hidden', !this.vimEnabled);
            this.vimModeIndicator.textContent = this.vimEnabled ? (this.vimModeLabel || 'NORMAL') : '';
        }
    }

    _setVimEnabled(enabled, { persist = true, rerender = true, emit = true, showToast = true } = {}) {
        const nextEnabled = Boolean(enabled);
        const changed = this.vimEnabled !== nextEnabled;

        this.vimEnabled = nextEnabled;
        this.vimModeLabel = this.vimEnabled ? (this.vimModeLabel || 'NORMAL') : '';

        if (this.vimEnabled) {
            this.layoutMode = 'tabs';
        }

        if (persist) {
            window.localStorage.setItem(this.vimEnabledStorageKey, this.vimEnabled ? '1' : '0');
        }

        if (this.vimEnabled && persist) {
            window.localStorage.setItem(this.layoutModeStorageKey, 'tabs');
        }

        this._updateLayoutButton();
        this._updatePanelControlStates();
        this._updateVimUi();

        if (rerender) {
            this._renderWorkspace();
        }

        if (emit) {
            this._emitSessionStateChange();
        }

        if (changed && showToast) {
            this._showToast(
                this.vimEnabled
                    ? 'Vim mode enabled. Tabs layout is now required.'
                    : 'Vim mode disabled. Panels layout is available again.',
                'success',
            );
        }
    }

    _setSystemClipboardEnabled(enabled, { persist = true, showToast = true } = {}) {
        const nextEnabled = Boolean(enabled);
        const changed = this.systemClipboardEnabled !== nextEnabled;

        this.systemClipboardEnabled = nextEnabled;
        setSystemClipboardEnabled(this.systemClipboardEnabled);

        if (persist) {
            window.localStorage.setItem(this.systemClipboardStorageKey, this.systemClipboardEnabled ? '1' : '0');
        }

        this._updateVimUi();

        if (this.systemClipboardEnabled) {
            void syncSystemClipboardRegister();
        }

        if (changed && showToast) {
            this._showToast(
                this.systemClipboardEnabled
                    ? 'System clipboard integration enabled for Vim.'
                    : 'System clipboard integration disabled for Vim.',
                'success',
            );
        }
    }

    setGlobalVimDefaultEnabled(enabled, { showToast = false } = {}) {
        this._setVimEnabled(enabled, {
            persist: true,
            rerender: true,
            emit: true,
            showToast,
        });
    }

    setGlobalSystemClipboardDefaultEnabled(enabled, { showToast = false } = {}) {
        this._setSystemClipboardEnabled(enabled, {
            persist: true,
            showToast,
        });
    }

    _updateFileControls() {
        const hasTopic = Boolean(this.currentTopicPath);
        const files = this._getVisibleFiles();
        const activeFile = this._getActiveFile();
        const isVirtual = this._isVirtualFileDocument();
        const isFrameworkMultiFile = this._isFrameworkMultiFileDocument();
        const isTheory = this._isTheoryDocumentTarget();
        const isShader = this._isShaderDocument();
        const isExerciseMode = this._isExerciseMode();
        const entryCandidates = getDocumentEntryCandidates(this.currentDocument);
        const languageOptions = getDocumentLanguageOptions(this.currentDocument);

        if (this.btnAddFile) {
            this.btnAddFile.disabled = !hasTopic || isExerciseMode || isTheory || languageOptions.length === 0;
            const addFileLabel = this.btnAddFile.querySelector('.toolbar-btn-label');
            if (addFileLabel) {
                addFileLabel.textContent = isVirtual ? 'File' : 'Block';
            } else {
                this.btnAddFile.textContent = isVirtual ? 'File' : 'Block';
            }
            this.btnAddFile.title = isTheory
                ? 'Theory editing keeps a fixed single file'
                : isExerciseMode
                ? 'Exercise mode keeps the file structure fixed'
                : languageOptions.length === 0
                    ? (isShader ? 'Shader documents already contain all supported blocks' : 'No additional blocks are available for this document')
                    : (isVirtual ? 'Create a new virtual file' : 'Add a new code block');
        }

        if (this.btnQuickOpenFile) {
            this.btnQuickOpenFile.disabled = files.length === 0 || isTheory;
            this.btnQuickOpenFile.title = files.length > 0
                ? (isTheory ? 'Theory editing keeps a single active file' : 'Quick search visible files')
                : 'No visible files to open';
        }

        if (this.btnEditShaderUniforms) {
            this.btnEditShaderUniforms.classList.toggle('hidden', !isShader);
            this.btnEditShaderUniforms.disabled = !hasTopic || !isShader || isExerciseMode;
            this.btnEditShaderUniforms.title = isExerciseMode
                ? 'Exercise mode keeps shader uniforms fixed'
                : 'Create or remove custom shader uniforms';
        }

        if (this.btnEditShaderTextures) {
            this.btnEditShaderTextures.classList.toggle('hidden', !isShader);
            this.btnEditShaderTextures.disabled = !hasTopic || !isShader || isExerciseMode;
            this.btnEditShaderTextures.title = isExerciseMode
                ? 'Exercise mode keeps shader textures fixed'
                : 'Map sampler uniforms to topic assets';
        }

        if (this.btnEditFileVisibility) {
            const allFiles = this.currentDocument.files || [];
            this.btnEditFileVisibility.disabled = !hasTopic || allFiles.length === 0 || isExerciseMode || isTheory;
            this.btnEditFileVisibility.title = isTheory
                ? 'Theory editing keeps a single visible file'
                : isExerciseMode
                ? 'Exercise mode keeps file visibility fixed'
                : 'Show, hide and inspect tabs or vertical panels';
        }

        if (this.btnDuplicateFile) {
            this.btnDuplicateFile.disabled = !activeFile || isExerciseMode || isShader || isTheory;
        }

        if (this.btnEditFile) {
            this.btnEditFile.disabled = !activeFile || !isVirtual || isExerciseMode || isTheory;
        }

        if (this.btnDeleteFile) {
            this.btnDeleteFile.disabled = !activeFile || isExerciseMode || isTheory || (isVirtual && files.length <= 1);
        }

        if (!this.entrySelectGroup || !this.entrySelect) return;

        this.entrySelectGroup.classList.toggle('hidden', !isFrameworkMultiFile);
        if (!isFrameworkMultiFile) {
            this.entrySelect.innerHTML = '';
            this.entrySelect.disabled = true;
            return;
        }

        const currentEntry = String(this.currentDocument.metadata?.entry || '');
        this.entrySelect.innerHTML = '';

        if (entryCandidates.length === 0) {
            const option = document.createElement('option');
            option.textContent = 'No valid entry file';
            option.value = '';
            option.selected = true;
            this.entrySelect.appendChild(option);
            this.entrySelect.disabled = true;
            return;
        }

        entryCandidates.forEach((file) => {
            const option = document.createElement('option');
            option.value = file.path;
            option.textContent = file.path;
            option.selected = file.path === currentEntry;
            this.entrySelect.appendChild(option);
        });

        if (!entryCandidates.some((file) => file.path === currentEntry)) {
            this.entrySelect.value = entryCandidates[0].path;
        }

        this.entrySelect.disabled = isExerciseMode;
    }

    _renderWorkspace() {
        this._closeFileContextMenu();
        this._destroyEditors();
        this.workspace.innerHTML = '';
        this._clearTabFileSelectHost();
        this.workspace.dataset.layoutMode = this.layoutMode;
        this._ensureActiveFile();

        if (this._getVisibleFiles().length === 0) {
            const empty = document.createElement('div');
            empty.className = 'editor-empty-state';
            empty.textContent = this._isExerciseMode()
                ? 'All exercise files are hidden. Reveal reference or solution files from the exercise panel.'
                : (this.currentDocument.files || []).length > 0
                    ? 'All files are hidden. Use Visibility to reveal one again.'
                    : 'Select an example from the gallery to begin.';
            this.workspace.appendChild(empty);
            this._updatePanelControlStates();
            this._updateFileControls();
            this.pendingNavigationTarget = null;
            return;
        }

        if (this.layoutMode === 'tabs') {
            this._renderTabsLayout();
        } else {
            this._renderPanelsLayout();
        }

        this._updatePanelControlStates();
        this._updateFileControls();
        this._flushPendingNavigation();
    }

    _renderPanelsLayout() {
        const stack = document.createElement('div');
        stack.className = 'editor-panels-stack';

        this._getVisibleFiles().forEach((file, index) => {
            const definition = this._getFileDefinition(file);
            const panel = document.createElement('div');
            panel.className = 'editor-panel';
            panel.dataset.fileId = file.id;
            panel.dataset.language = file.language;
            panel.style.flex = '1 1 0px';

            const header = document.createElement('div');
            header.className = 'panel-header';
            if (index > 0) {
                header.classList.add('resizable');
            }

            const btnCollapse = document.createElement('button');
            btnCollapse.className = 'btn-icon btn-collapse';
            btnCollapse.title = 'Toggle Panel';
            btnCollapse.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            `;

            const badge = this._createBadge(definition);
            const pathLabel = document.createElement('span');
            pathLabel.className = 'panel-path';
            pathLabel.textContent = file.path;
            pathLabel.title = file.path;

            header.appendChild(btnCollapse);
            header.appendChild(badge);
            header.appendChild(pathLabel);

            if (file.role) {
                header.appendChild(this._createRolePill(file.role));
            }

            if (this._isExerciseFileLocked(file)) {
                header.appendChild(this._createRolePill('locked'));
            }

            const btnMaximize = document.createElement('button');
            btnMaximize.className = 'btn-icon btn-maximize';
            btnMaximize.title = 'Maximize Panel';
            btnMaximize.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
            `;
            header.appendChild(btnMaximize);

            const editorHost = document.createElement('div');
            editorHost.className = 'panel-editor';

            panel.appendChild(header);
            panel.appendChild(editorHost);
            stack.appendChild(panel);

            const { view, vimCleanup } = this._createEditor(editorHost, file);

            btnCollapse.addEventListener('click', (event) => {
                event.stopPropagation();
                panel.classList.toggle('collapsed');
                this._syncPanelStateFromDom();
                this._emitSessionStateChange();
            });

            btnMaximize.addEventListener('click', (event) => {
                event.stopPropagation();
                this._toggleMaximize(panel);
                this._syncPanelStateFromDom();
                this._emitSessionStateChange();
            });

            header.addEventListener('mousedown', (event) => {
                if (index === 0 || event.target.closest('button')) return;
                this._startResize(panel.previousElementSibling, panel, event);
            });

            header.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                this._openFileContextMenu(file, event.clientX, event.clientY);
            });

            this.editors.push({
                id: file.id,
                panel,
                view,
                vimCleanup,
            });
        });

        this.workspace.appendChild(stack);
        this._applyPanelSessionState();
    }

    _renderTabsLayout() {
        const layout = document.createElement('div');
        layout.className = 'editor-tabs-layout';

        const header = document.createElement('div');
        header.className = 'editor-tabs-header';

        const nav = document.createElement('div');
        nav.className = 'editor-tabs-nav';

        this._getVisibleFiles().forEach((file) => {
            const definition = this._getFileDefinition(file);
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.className = `editor-tab ${file.id === this.activeFileId ? 'active' : ''}`;
            tab.title = file.path;

            tab.appendChild(this._createBadge(definition));

            const label = document.createElement('span');
            label.className = 'editor-tab-label';
            label.textContent = file.name || file.path;
            tab.appendChild(label);

            tab.addEventListener('click', () => {
                this.activeFileId = file.id;
                this._renderWorkspace();
                this._emitSessionStateChange();
            });

            tab.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                this._openFileContextMenu(file, event.clientX, event.clientY);
            });

            nav.appendChild(tab);
        });

        header.appendChild(nav);
        layout.appendChild(header);
        this._renderTabFileSelectHost();

        const activeFile = this._getActiveFile();
        const meta = document.createElement('div');
        meta.className = 'editor-tab-meta';
        meta.appendChild(this._createBadge(this._getFileDefinition(activeFile)));

        const pathLabel = document.createElement('span');
        pathLabel.className = 'file-path-label';
        pathLabel.textContent = activeFile.path;
        pathLabel.title = activeFile.path;
        meta.appendChild(pathLabel);

        if (activeFile.role) {
            meta.appendChild(this._createRolePill(activeFile.role));
        }

        if (this._isExerciseFileLocked(activeFile)) {
            meta.appendChild(this._createRolePill('locked'));
        }

        layout.appendChild(meta);

        const editorHost = document.createElement('div');
        editorHost.className = 'editor-tab-surface';
        layout.appendChild(editorHost);

        const { view, vimCleanup } = this._createEditor(editorHost, activeFile);
        this.editors.push({
            id: activeFile.id,
            panel: editorHost,
            view,
            vimCleanup,
        });

        this.workspace.appendChild(layout);
    }

    _clearTabFileSelectHost() {
        if (!this.tabFileSelectHost) return;
        this.tabFileSelectHost.innerHTML = '';
        this.tabFileSelectHost.classList.add('hidden');
    }

    _renderTabFileSelectHost() {
        if (!this.tabFileSelectHost) return;

        this.tabFileSelectHost.innerHTML = '';

        const files = this._getVisibleFiles();
        if (this.layoutMode !== 'tabs' || files.length === 0) {
            this.tabFileSelectHost.classList.add('hidden');
            return;
        }

        const menu = document.createElement('div');
        menu.className = 'editor-file-menu';

        const select = document.createElement('select');
        select.className = 'editor-file-select';
        select.setAttribute('aria-label', 'Select file');

        files.forEach((file) => {
            const option = document.createElement('option');
            option.value = file.id;
            option.textContent = file.path;
            option.selected = file.id === this.activeFileId;
            select.appendChild(option);
        });

        select.addEventListener('change', (event) => {
            this.activeFileId = event.target.value;
            this._renderWorkspace();
            this._emitSessionStateChange();
        });

        menu.appendChild(select);
        this.tabFileSelectHost.appendChild(menu);
        this.tabFileSelectHost.classList.remove('hidden');
    }

    _getActiveFile() {
        this._ensureActiveFile();
        const files = this._getVisibleFiles();
        return files.find((file) => file.id === this.activeFileId) || files[0];
    }

    _createBadge(definition) {
        const badge = document.createElement('span');
        badge.className = `lang-badge ${definition.badgeClass}`;
        badge.textContent = definition.badgeLabel;
        return badge;
    }

    _createRolePill(role) {
        const pill = document.createElement('span');
        pill.className = 'file-role-pill';
        pill.textContent = role;
        return pill;
    }

    _getFileDefinition(file) {
        const definition = getBlockDefinition(file?.language || '');
        if (definition) return definition;

        return {
            badgeClass: 'preview',
            badgeLabel: (file?.language || 'file').toUpperCase(),
        };
    }

    _destroyEditors() {
        this.editors.forEach((entry) => {
            entry.vimCleanup?.();
            entry.view?.destroy();
        });
        this.editors = [];
    }

    _createEditor(container, file) {
        const isLocked = this._isExerciseFileLocked(file);
        const langExtensions = this._getLanguageExtensions(file.language);
        const languageKeymap = file.language === 'vue'
            ? [{ key: 'Enter', run: vueScriptEnterCommand }]
            : [];
        const vimExtensions = this.vimEnabled ? createVimExtension() : [];
        const updateListener = EditorView.updateListener.of((update) => {
            if (!update.docChanged) return;
            this._setFileContent(file.id, update.state.doc.toString());
            this._updateStatus();
            this._updateButtonStates();
            this._syncAllEditorDiagnostics();
            this._triggerChange();
        });

        const state = EditorState.create({
            doc: file.content || '',
            extensions: [
                EditorState.allowMultipleSelections.of(true),
                editorDiagnosticsField,
                lineNumbers(),
                drawSelection(),
                highlightActiveLine(),
                highlightActiveLineGutter(),
                history(),
                indentOnInput(),
                bracketMatching(),
                closeBrackets(),
                highlightSelectionMatches(),
                ...vimExtensions,
                keymap.of([
                    ...languageKeymap,
                    ...defaultKeymap,
                    ...historyKeymap,
                    ...closeBracketsKeymap,
                    ...completionKeymap,
                    ...searchKeymap,
                    indentWithTab,
                ]),
                ...langExtensions,
                oneDark,
                autocompletion(),
                EditorState.readOnly.of(isLocked),
                updateListener,
                EditorView.theme({
                    '&': { height: '100%' },
                    '&.cm-editor': isLocked ? { opacity: 0.78 } : {},
                    '.cm-scroller': { overflow: 'auto' },
                }),
            ],
        });

        const view = new EditorView({ state, parent: container });
        this._applyDiagnosticsToView(view, file);

        const vimCleanup = this.vimEnabled
            ? bindVimView(view, {
                onModeChange: (modeLabel) => {
                    this.vimModeLabel = modeLabel;
                    this._updateVimUi();
                    view.dom.dataset.vimMode = modeLabel;
                },
                onPreviousTab: () => {
                    this._selectAdjacentTab(-1);
                },
                onNextTab: () => {
                    this._selectAdjacentTab(1);
                },
                onOpenFilePicker: () => {
                    this._openQuickOpenDialog();
                },
                onToggleSidebar: () => {
                    this.onToggleSidebar?.();
                },
                onCenterWorkspace: () => {
                    this.onCenterWorkspace?.();
                },
                onToggleAutoRender: () => {
                    this.onTogglePreviewAutoRender?.();
                },
                onToggleShaderPause: () => {
                    if (!this._isShaderDocument()) return;
                    this.onToggleShaderPause?.();
                },
                onOpenShaderControls: () => {
                    if (!this._isShaderDocument()) return;
                    this.onOpenShaderControls?.();
                },
                onOpenShaderUniforms: () => {
                    if (!this._isShaderDocument()) return;
                    (this.onOpenShaderUniforms || this.openShaderUniformDialog).call(this, null);
                },
                onOpenShaderTextures: () => {
                    if (!this._isShaderDocument()) return;
                    (this.onOpenShaderTextures || this.openShaderTextureDialog).call(this);
                },
                onOpenShaderPanel: () => {
                    if (!this._isShaderDocument()) return;
                    this.onOpenShaderPanel?.();
                },
                onResetShaderRuntime: () => {
                    if (!this._isShaderDocument()) return;
                    this.onResetShaderRuntime?.();
                },
                onQuickSave: () => {
                    if (!this._isTheoryDocumentTarget()) return false;
                    this._handleModify();
                    return true;
                },
                onWrite: () => {
                    this._handleVimWrite();
                },
            })
            : null;

        view.dom.dataset.vim = this.vimEnabled ? 'on' : 'off';
        view.dom.dataset.vimMode = this.vimModeLabel || '';

        return {
            view,
            vimCleanup,
        };
    }

    _getLanguageExtensions(type) {
        switch (type) {
            case 'vertex':
            case 'fragment':
                return glslLanguage();
            case 'jsx':
                return [javascript({ jsx: true })];
            case 'tsx':
                return [javascript({ jsx: true, typescript: true })];
            case 'html':
            case 'html-full':
            case 'vue':
            case 'svg':
                return [html(), htmlLearningSupport()];
            case 'css':
            case 'scss':
            case 'sass':
                return [css(), cssLearningSupport()];
            case 'javascript':
                return [javascript(), javascriptLearningSupport()];
            case 'typescript':
                return [javascript({ typescript: true }), javascriptLearningSupport()];
            case 'json':
                return [javascript({ json: true })];
            case 'pug':
            default:
                return [];
        }
    }

    _setFileContent(fileId, content) {
        this.currentDocument = updateDocumentFileContent(this.currentDocument, fileId, content);
    }

    _collectDiagnosticsForFile(fileId) {
        if (!fileId) return [];

        const diagnostics = [
            ...(this.currentDocument.diagnostics || []),
            ...(this.compileDiagnostics || []),
        ];

        return diagnostics
            .map((diagnostic) => this._resolveDiagnosticTarget(diagnostic))
            .filter((target) => target.file?.id === fileId && target.line)
            .map((target) => ({
                column: target.column,
                level: target.diagnostic?.level || 'warning',
                line: target.line,
            }));
    }

    _applyDiagnosticsToView(view, file) {
        if (!view || !file?.id) return;

        view.dispatch({
            effects: setEditorDiagnosticsEffect.of(this._collectDiagnosticsForFile(file.id)),
        });
    }

    _syncAllEditorDiagnostics() {
        this.editors.forEach((entry) => {
            const file = (this.currentDocument.files || []).find((item) => item.id === entry.id);
            if (!file) return;
            this._applyDiagnosticsToView(entry.view, file);
        });
    }

    _getPanels() {
        return Array.from(this.workspace.querySelectorAll('.editor-panel'));
    }

    _getEditorEntry(fileId) {
        return this.editors.find((entry) => entry.id === fileId) || null;
    }

    _applyPanelSessionState() {
        const panels = this._getPanels();
        if (panels.length === 0) return;

        panels.forEach((panel) => {
            panel.classList.remove('collapsed');
            panel.style.flex = '1 1 0px';
            panel.style.height = '';
        });

        const maximizedPanel = this.panelState.maximizedFileId
            ? panels.find((panel) => panel.dataset.fileId === this.panelState.maximizedFileId)
            : null;

        if (maximizedPanel) {
            this._toggleMaximize(maximizedPanel);
            return;
        }

        this.panelState.collapsedFileIds.forEach((fileId) => {
            const panel = panels.find((entry) => entry.dataset.fileId === fileId);
            if (!panel) return;
            panel.classList.add('collapsed');
            panel.style.flex = '';
        });
    }

    _syncPanelStateFromDom() {
        const panels = this._getPanels();
        if (panels.length === 0) {
            this.panelState = this._sanitizePanelState();
            return;
        }

        const collapsedFileIds = panels
            .filter((panel) => panel.classList.contains('collapsed'))
            .map((panel) => panel.dataset.fileId)
            .filter(Boolean);
        const visiblePanels = panels.filter((panel) => !panel.classList.contains('collapsed'));
        const maximizedFileId = panels.length > 1 && visiblePanels.length === 1 && collapsedFileIds.length === panels.length - 1
            ? visiblePanels[0].dataset.fileId
            : null;

        this.panelState = this._sanitizePanelState({ collapsedFileIds, maximizedFileId });
    }

    _toggleMaximize(activePanel) {
        const panels = this._getPanels();
        const others = panels.filter((panel) => panel !== activePanel);
        const allOthersCollapsed = others.every((panel) => panel.classList.contains('collapsed'));

        if (allOthersCollapsed) {
            panels.forEach((panel) => {
                panel.classList.remove('collapsed');
                panel.style.flex = '1 1 0px';
                panel.style.height = '';
            });
            return;
        }

        others.forEach((panel) => {
            panel.classList.add('collapsed');
            panel.style.flex = '';
        });

        activePanel.classList.remove('collapsed');
        activePanel.style.flex = '1 1 0px';
        activePanel.style.height = '';
    }

    _startResize(prevPanel, currentPanel, event) {
        if (!prevPanel || !currentPanel) return;

        event.preventDefault();

        const panels = this._getPanels();
        panels.forEach((panel) => panel.classList.remove('collapsed'));

        const containerHeight = this.workspace.getBoundingClientRect().height;
        const startY = event.clientY;
        const startPrevHeight = prevPanel.getBoundingClientRect().height;
        const startCurrentHeight = currentPanel.getBoundingClientRect().height;
        const minHeight = 32;

        const onMouseMove = (moveEvent) => {
            const delta = moveEvent.clientY - startY;
            let newPrevHeight = startPrevHeight + delta;
            let newCurrentHeight = startCurrentHeight - delta;

            if (newPrevHeight < minHeight) {
                const correction = minHeight - newPrevHeight;
                newPrevHeight = minHeight;
                newCurrentHeight -= correction;
            }

            if (newCurrentHeight < minHeight) {
                const correction = minHeight - newCurrentHeight;
                newCurrentHeight = minHeight;
                newPrevHeight -= correction;
            }

            prevPanel.style.flex = `${newPrevHeight / containerHeight} 1 0px`;
            currentPanel.style.flex = `${newCurrentHeight / containerHeight} 1 0px`;
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            this._syncPanelStateFromDom();
            this._emitSessionStateChange();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    _handleAutoFit() {
        if (this.layoutMode !== 'panels') return;

        const panels = this._getPanels();
        if (panels.length === 0 || this.editors.length === 0) return;

        panels.forEach((panel) => {
            panel.classList.remove('collapsed');
            panel.style.height = '';
        });

        const lineHeight = this.fontSize * 1.6;
        const headerHeight = 32;
        const scrollbarPadding = 20;
        const minPanelHeight = 32;
        const availableHeight = this.workspace.getBoundingClientRect().height;

        const neededHeights = this.editors.map((entry) => {
            const lines = entry.view.state.doc.lines;
            return (lines * lineHeight) + headerHeight + scrollbarPadding;
        });

        const totalNeeded = neededHeights.reduce((sum, value) => sum + value, 0);

        if (totalNeeded <= availableHeight) {
            panels.forEach((panel, index) => {
                panel.style.flex = `${neededHeights[index]} 1 0px`;
            });
            this._syncPanelStateFromDom();
            this._emitSessionStateChange();
            return;
        }

        let remainingSpace = availableHeight - (minPanelHeight * panels.length);
        const allocations = panels.map(() => minPanelHeight);

        neededHeights.forEach((height, index) => {
            if (remainingSpace <= 0) return;
            const extra = Math.max(0, height - minPanelHeight);
            const taken = Math.min(extra, remainingSpace);
            allocations[index] += taken;
            remainingSpace -= taken;
        });

        if (remainingSpace > 0) {
            allocations[allocations.length - 1] += remainingSpace;
        }

        panels.forEach((panel, index) => {
            panel.style.flex = `${allocations[index]} 1 0px`;
        });

        this._syncPanelStateFromDom();
        this._emitSessionStateChange();
    }

    _updateButtonStates() {
        const hasFile = Boolean(this.currentFilename);
        const hasTopic = Boolean(this.currentTopicPath);
        const hasContent = (this.currentDocument.files || []).length > 0;
        const isSafeToWrite = !hasBlockingDiagnostics(this.currentDocument);
        const isTheory = this._isTheoryDocumentTarget();

        this.btnSave.disabled = !hasTopic || !hasContent || !isSafeToWrite;
        this.btnModify.disabled = isTheory
            ? (!hasTopic || !hasContent || !isSafeToWrite)
            : (!hasFile || !isSafeToWrite);
        this.btnRemove.disabled = !hasFile || isTheory;
        this.btnRename.disabled = !hasFile || isTheory;
        this._updatePanelControlStates();
        this._updateFileControls();
    }

    _updateFilenameDisplay() {
        if (this.currentFilename) {
            if (this.previewFilenameDisplay) {
                this.previewFilenameDisplay.textContent = this.currentFilename;
                this.previewFilenameDisplay.title = this.currentFilename;
            }
            return;
        }

        if (this.previewFilenameDisplay) {
            this.previewFilenameDisplay.textContent = 'Preview';
            this.previewFilenameDisplay.title = 'Preview';
        }
    }

    _updateStatus() {
        if (!this.statusDisplay) return;

        const structuralDiagnostics = this.currentDocument.diagnostics || [];
        const compileDiagnostics = this.compileDiagnostics || [];
        const diagnosticsCount = structuralDiagnostics.length + compileDiagnostics.length;

        if (diagnosticsCount === 0) {
            this.statusDisplay.innerHTML = '';
            this.statusDisplay.className = 'editor-status hidden';
            return;
        }

        const hasErrors = [...structuralDiagnostics, ...compileDiagnostics]
            .some((diagnostic) => diagnostic.level === 'error');

        this.statusDisplay.innerHTML = '';
        this.statusDisplay.className = `editor-status ${hasErrors ? 'error' : 'warning'}`;

        const summary = document.createElement('div');
        summary.className = 'editor-status-summary';
        summary.textContent = `${diagnosticsCount} issue${diagnosticsCount === 1 ? '' : 's'} found`;
        this.statusDisplay.appendChild(summary);

        if (structuralDiagnostics.length > 0) {
            this.statusDisplay.appendChild(this._buildDiagnosticSection('Structure', structuralDiagnostics, 'structural'));
        }

        if (compileDiagnostics.length > 0) {
            this.statusDisplay.appendChild(this._buildDiagnosticSection('Compile', compileDiagnostics, 'compile'));
        }
    }

    setCompileDiagnostics(diagnostics = []) {
        this.compileDiagnostics = diagnostics;
        this._updateStatus();
        this._syncAllEditorDiagnostics();
    }

    _triggerChange() {
        if (this.onCodeChange) {
            this.onCodeChange(cloneExampleDocument(this.currentDocument));
        }
    }

    _showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    _getPersistableDocument() {
        if (!this._isShaderDocument() || !this.getShaderPersistedState) {
            return this.currentDocument;
        }

        const persistedState = this.getShaderPersistedState();
        if (!persistedState?.resolution) {
            return this.currentDocument;
        }

        return updateShaderResolution(this.currentDocument, persistedState.resolution);
    }

    async _handleModifyTheory() {
        if (!this.currentTopicPath || hasBlockingDiagnostics(this.currentDocument)) return false;

        const content = getTheoryDocumentContent(this.currentDocument);

        try {
            await modifyTopicMain(this.currentTopicPath, content);
            this._triggerChange();
            this._emitSessionStateChange();
            this._showToast('Theory saved: main.md', 'success');
            return true;
        } catch (error) {
            console.error(error);
            this._showToast(`Theory save failed: ${error.message}`, 'error');
            return false;
        }
    }

    async saveTheoryDocument() {
        return this._handleModifyTheory();
    }

    async _handleModify() {
        if (!this.currentTopicPath || !this.currentFilename || hasBlockingDiagnostics(this.currentDocument)) return;
        if (this._isTheoryDocumentTarget()) {
            await this._handleModifyTheory();
            return;
        }

        const documentToPersist = this._getPersistableDocument();
        const content = buildExampleDocument(documentToPersist);

        try {
            await modifyExample(this.currentTopicPath, this.currentFilename, content);
            this.currentDocument = documentToPersist;
            this._triggerChange();
            this._emitSessionStateChange();
            this._showToast(`Modified: ${this.currentFilename}`, 'success');
        } catch (error) {
            console.error(error);
            this._showToast(`Modify failed: ${error.message}`, 'error');
        }
    }

    _buildDiagnosticSection(title, diagnostics, category) {
        const section = document.createElement('section');
        section.className = `diagnostic-section ${category}`;

        const header = document.createElement('div');
        header.className = 'diagnostic-section-header';

        const heading = document.createElement('span');
        heading.className = 'diagnostic-section-title';
        heading.textContent = title;

        const count = document.createElement('span');
        count.className = 'diagnostic-section-count';
        count.textContent = String(diagnostics.length);

        header.appendChild(heading);
        header.appendChild(count);
        section.appendChild(header);

        const list = document.createElement('div');
        list.className = 'diagnostic-list';

        diagnostics.forEach((diagnostic) => {
            list.appendChild(this._buildDiagnosticItem(diagnostic, category));
        });

        section.appendChild(list);
        return section;
    }

    _buildDiagnosticItem(diagnostic, category) {
        const target = this._resolveDiagnosticTarget(diagnostic);
        const actionable = Boolean(target?.file);
        const item = document.createElement(actionable ? 'button' : 'div');

        item.className = `diagnostic-item ${diagnostic.level === 'error' ? 'error' : 'warning'} ${actionable ? 'is-actionable' : ''}`;
        if (actionable) {
            item.type = 'button';
            item.addEventListener('click', () => this._navigateToDiagnostic(target));
        }

        const message = document.createElement('div');
        message.className = 'diagnostic-item-message';
        message.textContent = diagnostic.message;

        const meta = document.createElement('div');
        meta.className = 'diagnostic-item-meta';
        meta.textContent = this._formatDiagnosticMeta(diagnostic, target, category);

        item.appendChild(message);
        item.appendChild(meta);
        return item;
    }

    _formatDiagnosticMeta(diagnostic, target, category) {
        const parts = [category === 'structural' ? 'Structure' : 'Compile'];

        if (target?.file?.path) {
            let location = target.file.path;

            if (target.line) {
                location += `:${target.line}`;
                if (target.column) {
                    location += `:${target.column}`;
                }
            }

            parts.push(location);
        } else if (diagnostic.path) {
            parts.push(diagnostic.path);
        } else if (diagnostic.entry) {
            parts.push(`entry: ${diagnostic.entry}`);
        } else if (diagnostic.line) {
            parts.push(`line ${diagnostic.line}`);
        } else if (diagnostic.slot) {
            parts.push(`slot: ${diagnostic.slot}`);
        }

        if (diagnostic.code) {
            parts.push(diagnostic.code);
        }

        return parts.join(' • ');
    }

    _normalizeDiagnosticPath(value = '') {
        const raw = String(value || '').trim().replaceAll('\\', '/');
        if (!raw) return '';

        if (raw.startsWith('learncode-virtual:')) {
            return raw.slice('learncode-virtual:'.length);
        }

        if (raw.startsWith('learncode-inline:src/component')) {
            return '__slot__:script';
        }

        if (raw.startsWith('learncode-inline:src/template')) {
            return '__slot__:markup';
        }

        if (raw.startsWith('learncode-inline:src/entry')) {
            return '__slot__:entry';
        }

        return raw;
    }

    _resolveDiagnosticTarget(diagnostic) {
        const file = this._findFileForDiagnostic(diagnostic);

        return {
            column: Number.isFinite(diagnostic.column) ? Math.max(1, Math.trunc(diagnostic.column)) : null,
            diagnostic,
            file,
            line: Number.isFinite(diagnostic.line) ? Math.max(1, Math.trunc(diagnostic.line)) : null,
        };
    }

    _findFileForDiagnostic(diagnostic) {
        const files = this.currentDocument.files || [];
        if (files.length === 0) return null;

        const candidates = [];
        const pushCandidate = (value) => {
            const normalized = this._normalizeDiagnosticPath(value);
            if (normalized) {
                candidates.push(normalized);
            }
        };

        pushCandidate(diagnostic.file);
        pushCandidate(diagnostic.path);
        pushCandidate(diagnostic.entry);
        pushCandidate(diagnostic.rolePath);

        (diagnostic.files || []).forEach((value) => pushCandidate(value));

        for (const candidate of candidates) {
            if (candidate === '__slot__:script') {
                return files.find((file) => file.slot === 'script') || null;
            }

            if (candidate === '__slot__:markup') {
                return files.find((file) => file.slot === 'markup') || null;
            }

            if (candidate === '__slot__:entry') {
                return files.find((file) => file.role === 'entry') || null;
            }

            const exactMatch = files.find((file) => file.path === candidate);
            if (exactMatch) return exactMatch;

            const suffixMatch = files.find((file) => candidate.endsWith(file.path));
            if (suffixMatch) return suffixMatch;

            const nameMatch = files.find((file) => file.name === candidate);
            if (nameMatch) return nameMatch;
        }

        if (diagnostic.slot) {
            const slotMatch = files.find((file) => file.slot === diagnostic.slot || file.role === diagnostic.slot);
            if (slotMatch) return slotMatch;
        }

        if (diagnostic.type) {
            const typeMatches = files.filter((file) => file.language === diagnostic.type || file.blockType === diagnostic.type);
            if (typeMatches.length === 1) {
                return typeMatches[0];
            }
        }

        return null;
    }

    _navigateToDiagnostic(target) {
        if (!target?.file) return;

        if (this._isFileManuallyHidden(target.file)) {
            const didReveal = this._setFileHiddenState(target.file.id, false, { silent: true });
            if (!didReveal) return;
        }

        this.pendingNavigationTarget = target;

        if (this.layoutMode === 'tabs' && target.file.id !== this.activeFileId) {
            this.activeFileId = target.file.id;
            this._renderWorkspace();
            return;
        }

        this._flushPendingNavigation();
    }

    _flushPendingNavigation() {
        if (!this.pendingNavigationTarget) return;

        const target = this.pendingNavigationTarget;
        const entry = this._getEditorEntry(target.file?.id);
        if (!entry?.view) return;

        const position = this._getDocumentPosition(entry.view, target.line, target.column);
        entry.view.dispatch({
            selection: { anchor: position },
            scrollIntoView: true,
        });
        entry.view.focus();

        if (this.layoutMode === 'panels' && entry.panel) {
            entry.panel.classList.remove('collapsed');
            entry.panel.scrollIntoView({ block: 'nearest' });
            this._flashDiagnosticTarget(entry.panel);
        }

        this.pendingNavigationTarget = null;
    }

    _getDocumentPosition(view, line, column) {
        if (!line) {
            return view.state.selection.main.head;
        }

        const lineNumber = Math.max(1, Math.min(line, view.state.doc.lines));
        const lineRef = view.state.doc.line(lineNumber);
        const columnNumber = column ? Math.max(1, column) : 1;
        const offset = Math.min(lineRef.length, columnNumber - 1);

        return lineRef.from + offset;
    }

    _flashDiagnosticTarget(element) {
        if (!element) return;

        element.classList.remove('diagnostic-target');
        void element.offsetWidth;
        element.classList.add('diagnostic-target');

        window.setTimeout(() => {
            element.classList.remove('diagnostic-target');
        }, 1200);
    }
}

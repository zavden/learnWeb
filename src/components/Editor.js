import { EditorView, drawSelection, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { css, cssLanguage } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';

import { getBlockDefinition } from '../config/exampleBlocks.js';
import { HIGHLIGHT_COLORS } from '../config/highlightColors.js';
import { glslLanguage } from '../editor/glslLanguage.js';
import {
    cssLearningSupport,
    htmlLearningSupport,
    javascriptLearningSupport,
} from '../editor/learningCompletions.js';
import {
    bindVimView,
    createVimExtension,
    getDefaultVimShortcutConfig,
    installSystemClipboardBridge,
    isSystemClipboardApiAvailable,
    setSystemClipboardEnabled,
    syncSystemClipboardRegister,
} from '../editor/vimSupport.js';
import { vueScriptEnterCommand } from '../editor/vueSmartEnter.js';
import { getWrappedPanelIndex, findDirectionalPanelTargetIndex } from '../utils/panelNavigation.js';
import {
    cloneExampleDocument,
    createEmptyExampleDocument,
    getDocumentEntryCandidates,
    getDocumentLanguageOptions,
    hasBlockingDiagnostics,
    isShaderDocument,
    updateDocumentFileContent,
} from '../utils/markdown.js';
import { isTheoryDocument } from '../utils/theoryDocument.js';

import {
    setEditorDiagnosticsEffect,
    EMPTY_EDITOR_DIAGNOSTICS,
    editorDiagnosticsField,
    diagnosticsMixin,
} from './editor/diagnostics.js';
import { lineHighlightField, lineHighlightTheme } from './editor/lineHighlightExtension.js';
import { lineHighlightsMixin } from './editor/lineHighlightsMixin.js';

import { sessionManagerMixin } from './editor/sessionManager.js';
import { exercisePanelMixin } from './editor/exercisePanel.js';
import { theoryEditorMixin } from './editor/theoryEditor.js';
import { SHADER_UNIFORM_TYPE_OPTIONS, SHADER_BUILT_IN_UNIFORM_NAMES, shaderDialogsMixin } from './editor/shaderDialogs.js';
import { EXAMPLE_IMPORTANCE_OPTIONS, metadataDialogsMixin } from './editor/metadataDialogs.js';
import { fileOperationsMixin } from './editor/fileOperations.js';

const COLUMN_GUIDE_COLUMN = 80;

function createColumnGuideExtension(column = COLUMN_GUIDE_COLUMN) {
    return EditorView.theme({
        '.cm-content': {
            position: 'relative',
        },
        '.cm-content::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            bottom: '0',
            left: `${column}ch`,
            width: '1px',
            background: 'rgba(240, 136, 62, 0.26)',
            boxShadow: '0 0 0 1px rgba(240, 136, 62, 0.1)',
            pointerEvents: 'none',
        },
    });
}

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
        onTogglePreviewHeader,
        onToggleShaderPause,
        onTogglePreviewAutoRender,
        onToggleConsole,
        onOpenShaderTextures,
        onOpenShaderUniforms,
        onToggleFavoriteCurrentExample,
        onTogglePendingCurrentExample,
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
        this.onTogglePreviewHeader = onTogglePreviewHeader;
        this.onToggleShaderPause = onToggleShaderPause;
        this.onTogglePreviewAutoRender = onTogglePreviewAutoRender;
        this.onToggleConsole = onToggleConsole;
        this.onOpenShaderTextures = onOpenShaderTextures;
        this.onOpenShaderUniforms = onOpenShaderUniforms;
        this.onToggleFavoriteCurrentExample = onToggleFavoriteCurrentExample;
        this.onTogglePendingCurrentExample = onTogglePendingCurrentExample;
        this.onToggleSidebar = onToggleSidebar;
        this.onCenterWorkspace = onCenterWorkspace;

        this.currentTopicPath = null;
        this.currentFilename = null;
        this.currentDocument = createEmptyExampleDocument();
        this.compileDiagnostics = [];
        this.runtimeDiagnostics = [];
        this.editors = [];
        this.lineHighlights = new Map();
        this.activeHighlightColor = HIGHLIGHT_COLORS[0].id;
        this.fontSize = 13;
        this.layoutModeStorageKey = 'learncode.editor.layout';
        this.vimEnabledStorageKey = 'learncode.editor.vim';
        this.systemClipboardStorageKey = 'learncode.editor.systemClipboard';
        this.columnGuideStorageKey = 'learncode.editor.columnGuide';
        this.vimEnabled = this._readVimEnabled();
        this.systemClipboardEnabled = this._readSystemClipboardEnabled();
        this.columnGuideEnabled = this._readColumnGuideEnabled();
        this.vimShortcutConfig = getDefaultVimShortcutConfig();
        this.vimModeLabel = this.vimEnabled ? 'NORMAL' : '';
        this.layoutMode = this._readLayoutMode(this.vimEnabled ? 'tabs' : 'panels');
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
        this.btnAddFile = document.getElementById('btn-add-file');
        this.btnToggleFavoriteExample = document.getElementById('btn-toggle-favorite-example');
        this.btnTogglePendingExample = document.getElementById('btn-toggle-pending-example');
        this.btnEditExampleMetadata = document.getElementById('btn-edit-example-metadata');
        this.btnEditShaderUniforms = document.getElementById('btn-edit-shader-uniforms');
        this.btnEditShaderTextures = document.getElementById('btn-edit-shader-textures');
        this.btnEditFileVisibility = document.getElementById('btn-edit-file-visibility');
        this.btnDuplicateFile = document.getElementById('btn-duplicate-file');
        this.btnEditFile = document.getElementById('btn-edit-file');
        this.btnDeleteFile = document.getElementById('btn-delete-file');
        this.btnColumnGuideToggle = document.getElementById('btn-column-guide-toggle');
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
        this.exampleMetadataDialog = document.getElementById('editor-example-metadata-dialog');
        this.exampleDescriptionInput = document.getElementById('editor-example-description');
        this.exampleTagsInput = document.getElementById('editor-example-tags');
        this.exampleRatingStars = document.getElementById('editor-example-rating-stars');
        this.btnExampleRatingClear = document.getElementById('btn-editor-example-rating-clear');
        this.exampleImportanceSelect = document.getElementById('editor-example-importance');
        this.exampleImportancePreview = document.getElementById('editor-example-importance-preview');
        this.exampleMetadataHint = document.getElementById('editor-example-metadata-hint');
        this.btnExampleMetadataCancel = document.getElementById('editor-example-metadata-cancel');
        this.btnExampleMetadataApply = document.getElementById('editor-example-metadata-apply');
        this.fileTypeDialog = document.getElementById('editor-file-type-dialog');
        this.fileTypeDialogTitle = document.getElementById('editor-file-type-dialog-title');
        this.fileTypeDialogNote = document.getElementById('editor-file-type-dialog-note');
        this.fileTypeCurrentBadge = document.getElementById('editor-file-type-current-badge');
        this.fileTypeCurrentLabel = document.getElementById('editor-file-type-current-label');
        this.fileTypeNextBadge = document.getElementById('editor-file-type-next-badge');
        this.fileTypeNextLabel = document.getElementById('editor-file-type-next-label');
        this.fileTypePathPreview = document.getElementById('editor-file-type-path-preview');
        this.fileTypeOptions = document.getElementById('editor-file-type-options');
        this.fileTypeEmpty = document.getElementById('editor-file-type-empty');
        this.fileTypeDialogHint = document.getElementById('editor-file-type-dialog-hint');
        this.btnFileTypeCancel = document.getElementById('editor-file-type-cancel');
        this.btnFileTypeApply = document.getElementById('editor-file-type-apply');
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
        this.shortcutsDialog = document.getElementById('editor-shortcuts-dialog');
        this.shortcutsDialogContent = document.getElementById('editor-shortcuts-dialog-content');
        this.shortcutsDialogNote = document.getElementById('editor-shortcuts-dialog-note');
        this.btnShortcutsDialogClose = document.getElementById('editor-shortcuts-dialog-close');
        this.btnShortcutsDialogCloseIcon = document.getElementById('editor-shortcuts-dialog-close-icon');
        this.fileContextMenu = document.getElementById('editor-file-context-menu');
        this.btnContextHideFile = document.getElementById('btn-context-hide-file');
        this.btnInsertExerciseEmbed = document.getElementById('btn-insert-exercise-embed');
        this.exerciseEmbedDialog = document.getElementById('exercise-embed-dialog');
        this.exerciseEmbedList = document.getElementById('exercise-embed-list');
        this.btnExerciseEmbedDialogClose = document.getElementById('exercise-embed-dialog-close');
        this.fileDialogState = {
            mode: 'create',
            fileId: null,
            suggestedPath: '',
            suggestedRole: '',
            templateId: 'custom',
        };
        this.exampleMetadataDialogState = {
            rating: 0,
        };
        this.fileTypeDialogState = {
            fileId: null,
            options: [],
            selectedType: '',
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
        this._dialogFocusTargetFileId = null;
        this._restoreFocusFrameId = 0;
        this.currentExampleFavorite = false;
        this.currentExamplePending = false;

        this._initButtons();
        this._initShortcuts();
        this._initPanelControls();
        this._initLayoutControls();
        this._initFileControls();
        this._initExampleMetadataDialog();
        this._initFileTypeDialog();
        this._initQuickOpenDialog();
        this._initShaderUniformDialog();
        this._initShaderTextureDialog();
        this._initFileVisibilityDialog();
        this._initContextHintsDialog();
        this._initShortcutsDialog();
        this._initExerciseEmbedDialog();
        this._updateFontSize(0);
        this._applyDocument(createEmptyExampleDocument(), { notify: false });
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

        this.btnColumnGuideToggle?.addEventListener('click', () => {
            this._setColumnGuideEnabled(!this.columnGuideEnabled);
        });
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
            this._toggleLayoutMode();
        });

        this._updateLayoutButton();
        this._updateVimUi();
        this._updateColumnGuideUi();
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
        this.fileDialog?.addEventListener('close', () => this._scheduleEditorFocusRestore());
    }

    _setLayoutMode(mode, { persist = true, rerender = true, emit = true } = {}) {
        this.layoutMode = mode === 'tabs' ? 'tabs' : 'panels';

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

        const label = this.layoutMode === 'panels' ? 'Tabs' : 'Panels';
        const description = this.layoutMode === 'panels'
            ? 'Switch to tabs view'
            : 'Switch to vertical panels';
        const labelNode = this.btnLayout.querySelector('.editor-layout-label');

        if (labelNode) {
            labelNode.textContent = label;
        } else {
            this.btnLayout.textContent = label;
        }

        this.btnLayout.title = description;
        this.btnLayout.setAttribute('aria-label', description);
        this.btnLayout.dataset.mode = this.layoutMode;
    }

    _updatePanelControlStates() {
        if (!this.btnAutoFit) return;
        this.btnAutoFit.disabled = this.layoutMode !== 'panels' || this._getVisibleFiles().length === 0;
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

    _updateColumnGuideUi() {
        if (!this.btnColumnGuideToggle) return;

        this.btnColumnGuideToggle.classList.toggle('is-active', this.columnGuideEnabled);
        this.btnColumnGuideToggle.setAttribute('aria-pressed', String(this.columnGuideEnabled));
        this.btnColumnGuideToggle.title = this.columnGuideEnabled
            ? 'Hide 80-column guide'
            : 'Show 80-column guide';
        this.btnColumnGuideToggle.setAttribute(
            'aria-label',
            this.columnGuideEnabled
                ? 'Hide 80-column guide'
                : 'Show 80-column guide',
        );
    }

    _setColumnGuideEnabled(enabled, { persist = true, rerender = true, showToast = true } = {}) {
        const nextEnabled = Boolean(enabled);
        const changed = this.columnGuideEnabled !== nextEnabled;
        const activeFile = this._getActiveFile();

        this.columnGuideEnabled = nextEnabled;

        if (persist) {
            window.localStorage.setItem(this.columnGuideStorageKey, this.columnGuideEnabled ? '1' : '0');
        }

        this._updateColumnGuideUi();

        if (rerender) {
            if (activeFile) {
                this.pendingNavigationTarget = { file: activeFile };
            }
            this._renderWorkspace();
        }

        if (changed && showToast) {
            this._showToast(
                this.columnGuideEnabled
                    ? '80-column guide enabled.'
                    : '80-column guide disabled.',
                'success',
            );
        }
    }

    _setVimEnabled(enabled, { persist = true, rerender = true, emit = true, showToast = true } = {}) {
        const nextEnabled = Boolean(enabled);
        const changed = this.vimEnabled !== nextEnabled;

        this.vimEnabled = nextEnabled;
        this.vimModeLabel = this.vimEnabled ? (this.vimModeLabel || 'NORMAL') : '';

        if (persist) {
            window.localStorage.setItem(this.vimEnabledStorageKey, this.vimEnabled ? '1' : '0');
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
                    ? 'Vim mode enabled.'
                    : 'Vim mode disabled.',
                'success',
            );
        }
    }

    _toggleLayoutMode({ preserveFocus = false } = {}) {
        const nextMode = this.layoutMode === 'panels' ? 'tabs' : 'panels';
        const activeFile = preserveFocus ? this._getActiveFile() : null;
        if (activeFile) {
            this.pendingNavigationTarget = { file: activeFile };
        }
        this._setLayoutMode(nextMode);
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

        if (this.btnEditExampleMetadata) {
            this.btnEditExampleMetadata.disabled = !hasTopic || !files.length || isTheory;
            this.btnEditExampleMetadata.title = isTheory
                ? 'Theory metadata uses main.md directly'
                : 'Edit description, tags, rating and importance';
        }

        if (this.btnInsertExerciseEmbed) {
            this.btnInsertExerciseEmbed.classList.toggle('hidden', !isTheory);
            this.btnInsertExerciseEmbed.disabled = !hasTopic || !isTheory;
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
        this._captureHighlightsFromViews();
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
            panel.classList.toggle('is-active', file.id === this.activeFileId);

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

            const badge = this._createBadge(definition, { file, interactive: true });
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

            const btnHighlightColor = this._buildHighlightColorButton();
            const btnHighlightApply = this._buildHighlightApplyButton();
            header.appendChild(btnHighlightColor);
            header.appendChild(btnHighlightApply);

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

            btnHighlightColor.addEventListener('click', (event) => {
                event.stopPropagation();
                this._toggleHighlightColorPicker(btnHighlightColor);
            });

            btnHighlightApply.addEventListener('click', (event) => {
                event.stopPropagation();
                this._applyHighlightToCurrentLine(view);
            });

            btnCollapse.addEventListener('click', (event) => {
                event.stopPropagation();
                panel.classList.toggle('collapsed');
                this._syncPanelStateFromDom();
                this._syncActivePanelState();
                this._emitSessionStateChange();
            });

            btnMaximize.addEventListener('click', (event) => {
                event.stopPropagation();
                this._toggleMaximize(panel);
                this._syncPanelStateFromDom();
                this._syncActivePanelState();
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

            header.addEventListener('click', (event) => {
                if (event.target.closest('button')) return;
                this._setActivePanel(file.id, { focusEditor: true, syncModeLabel: true });
            });

            view.dom.addEventListener('focusin', () => {
                this._setActivePanel(file.id, { syncModeLabel: true });
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
        this._syncActivePanelState();
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

            tab.appendChild(this._createBadge(definition, { file, interactive: true }));

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
        meta.appendChild(this._createBadge(this._getFileDefinition(activeFile), { file: activeFile, interactive: true }));

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

        const btnHighlightColor = this._buildHighlightColorButton();
        const btnHighlightApply = this._buildHighlightApplyButton();
        meta.appendChild(btnHighlightColor);
        meta.appendChild(btnHighlightApply);

        layout.appendChild(meta);

        const editorHost = document.createElement('div');
        editorHost.className = 'editor-tab-surface';
        layout.appendChild(editorHost);

        const { view, vimCleanup } = this._createEditor(editorHost, activeFile);

        btnHighlightColor.addEventListener('click', (event) => {
            event.stopPropagation();
            this._toggleHighlightColorPicker(btnHighlightColor);
        });

        btnHighlightApply.addEventListener('click', (event) => {
            event.stopPropagation();
            this._applyHighlightToCurrentLine(view);
        });

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

    _createBadge(definition, { file = null, interactive = false } = {}) {
        const badge = document.createElement('span');
        badge.className = `lang-badge ${definition.badgeClass}`;
        badge.textContent = definition.badgeLabel;

        if (interactive && this._canEditFileType(file)) {
            badge.classList.add('is-clickable');
            badge.setAttribute('role', 'button');
            badge.setAttribute('tabindex', '0');
            badge.title = `Change ${definition.heading || definition.badgeLabel} badge`;

            const activate = (event) => {
                event.preventDefault();
                event.stopPropagation();
                this._openFileTypeDialog(file);
            };

            badge.addEventListener('click', activate);
            badge.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                activate(event);
            });
        }

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
        if (this._restoreFocusFrameId) {
            window.cancelAnimationFrame(this._restoreFocusFrameId);
            this._restoreFocusFrameId = 0;
        }
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
                lineHighlightField,
                lineHighlightTheme,
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
                ...(this.columnGuideEnabled ? [createColumnGuideExtension()] : []),
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
        this._applyHighlightsToView(view, file);

        const vimCleanup = this.vimEnabled
            ? bindVimView(view, {
                isPanelsLayout: () => this.layoutMode === 'panels',
                isShaderDocument: () => this._isShaderDocument(),
                getShortcutConfig: () => this.vimShortcutConfig,
                onModeChange: (modeLabel) => {
                    view.dom.dataset.vimMode = modeLabel;
                    if (this.layoutMode === 'panels' && file.id !== this.activeFileId) {
                        return;
                    }
                    this.vimModeLabel = modeLabel;
                    this._updateVimUi();
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
                onMovePanelFocus: (direction) => {
                    return this._handleShiftPanelNavigation(direction);
                },
                onToggleSidebar: () => {
                    this.onToggleSidebar?.();
                },
                onCenterWorkspace: () => {
                    this.onCenterWorkspace?.();
                },
                onToggleActivePanelCollapse: () => {
                    return this._toggleActivePanelCollapsed();
                },
                onToggleActivePanelMaximize: () => {
                    return this._toggleActivePanelMaximize();
                },
                onAutoFitPanels: () => {
                    return this._autoFitPanelsFromVim();
                },
                onNormalizePanels: () => {
                    return this._normalizePanelsFromVim();
                },
                onToggleAutoRender: () => {
                    this.onTogglePreviewAutoRender?.();
                },
                onToggleConsole: () => {
                    return this.onToggleConsole?.();
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
                onToggleEditorLayout: () => {
                    this._toggleLayoutMode({ preserveFocus: true });
                },
                onOpenShaderPanel: () => {
                    if (!this._isShaderDocument()) return;
                    this.onOpenShaderPanel?.();
                },
                onOpenShortcutHelp: () => {
                    this.openShortcutHelpDialog();
                },
                onResetShaderRuntime: () => {
                    if (!this._isShaderDocument()) return;
                    this.onResetShaderRuntime?.();
                },
                onTogglePreviewHeader: () => {
                    this.onTogglePreviewHeader?.();
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
        view.dom.addEventListener('focusin', () => {
            this._syncVimModeFromView(view);
        });

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
            case 'svg':
                return [html(), htmlLearningSupport()];
            case 'vue':
                return [html({
                    nestedLanguages: [{
                        tag: 'style',
                        attrs: (attrs) => /^(scss|sass|less)$/.test(attrs.lang),
                        parser: cssLanguage.parser,
                    }],
                }), htmlLearningSupport()];
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

    _getPanels() {
        return Array.from(this.workspace.querySelectorAll('.editor-panel'));
    }

    _getEditorEntry(fileId) {
        return this.editors.find((entry) => entry.id === fileId) || null;
    }

    _rememberEditorFocusTarget() {
        this._dialogFocusTargetFileId = this.pendingNavigationTarget?.file?.id
            || this.activeFileId
            || (this.layoutMode === 'panels' ? this._getPreferredActivePanelId() : null)
            || this._getVisibleFiles()[0]?.id
            || null;
    }

    _scheduleEditorFocusRestore() {
        if (this._restoreFocusFrameId) {
            window.cancelAnimationFrame(this._restoreFocusFrameId);
        }

        const fallbackFileId = this._dialogFocusTargetFileId;
        this._restoreFocusFrameId = window.requestAnimationFrame(() => {
            this._restoreFocusFrameId = 0;
            this._restoreEditorFocus(fallbackFileId);
        });
    }

    _restoreEditorFocus(fallbackFileId = null) {
        if (this.pendingNavigationTarget) {
            this._flushPendingNavigation();
            this._dialogFocusTargetFileId = null;
            return true;
        }

        const targetFileId = this.activeFileId || fallbackFileId || this._getVisibleFiles()[0]?.id || null;
        this._dialogFocusTargetFileId = null;
        if (!targetFileId) return false;

        const entry = this._getEditorEntry(targetFileId) || this.editors[0] || null;
        if (!entry?.view) return false;

        if (this.layoutMode === 'panels') {
            this._setActivePanel(entry.id, { focusEditor: true, syncModeLabel: true });
            return true;
        }

        entry.view.focus();
        if (this.vimEnabled) {
            this._syncVimModeFromView(entry.view);
        }
        return true;
    }

    focusActiveEditor() {
        this._scheduleEditorFocusRestore();
    }

    _getPreferredActivePanelId() {
        const panels = this._getPanels();
        if (panels.length === 0) return null;

        const activePanel = panels.find((panel) => panel.dataset.fileId === this.activeFileId);
        if (activePanel && !activePanel.classList.contains('collapsed')) {
            return activePanel.dataset.fileId || null;
        }

        const firstVisiblePanel = panels.find((panel) => !panel.classList.contains('collapsed'));
        if (firstVisiblePanel) {
            return firstVisiblePanel.dataset.fileId || null;
        }

        return panels[0]?.dataset.fileId || null;
    }

    _getPanelByFileId(fileId) {
        if (!fileId) return null;
        return this._getPanels().find((panel) => panel.dataset.fileId === fileId) || null;
    }

    _syncActivePanelState() {
        if (this.layoutMode !== 'panels') return;

        const nextActiveFileId = this._getPreferredActivePanelId();
        if (!nextActiveFileId) return;

        this.activeFileId = nextActiveFileId;
        this._getPanels().forEach((panel) => {
            const isActive = panel.dataset.fileId === this.activeFileId;
            panel.classList.toggle('is-active', isActive);
            panel.setAttribute('aria-selected', String(isActive));
        });
    }

    _setActivePanel(fileId, { focusEditor = false, syncModeLabel = false } = {}) {
        if (this.layoutMode !== 'panels' || !fileId) return;

        const changed = this.activeFileId !== fileId;
        this.activeFileId = fileId;
        this._syncActivePanelState();

        const entry = this._getEditorEntry(fileId);
        if (!entry) {
            if (changed) {
                this._emitSessionStateChange();
            }
            return;
        }

        if (syncModeLabel && this.vimEnabled) {
            this._syncVimModeFromView(entry.view);
        }

        if (focusEditor) {
            entry.view?.focus();
        }

        if (changed) {
            this._emitSessionStateChange();
        }
    }

    _movePanelFocus(direction = '') {
        if (this.layoutMode !== 'panels') return false;

        const panels = this._getPanels().filter((panel) => !panel.classList.contains('collapsed'));
        if (panels.length <= 1) return false;

        const currentPanel = panels.find((panel) => panel.dataset.fileId === this.activeFileId) || panels[0];
        if (!currentPanel) return false;

        const currentIndex = Math.max(0, panels.indexOf(currentPanel));
        const panelRects = panels.map((panel) => {
            const rect = panel.getBoundingClientRect();
            return {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
            };
        });
        const targetIndex = findDirectionalPanelTargetIndex(panelRects, currentIndex, direction);
        const bestPanel = targetIndex >= 0 ? panels[targetIndex] || null : null;

        const nextFileId = bestPanel?.dataset?.fileId || '';
        if (!nextFileId) return false;

        this._setActivePanel(nextFileId, { focusEditor: true, syncModeLabel: true });
        bestPanel.scrollIntoView({ block: 'nearest' });
        return true;
    }

    _moveMaximizedPanelFocus(direction = '') {
        if (this.layoutMode !== 'panels') return false;

        const panels = this._getPanels();
        if (panels.length <= 1) return false;

        const currentIndex = Math.max(0, panels.findIndex((panel) => panel.dataset.fileId === this.activeFileId));
        const isPreviousDirection = direction === 'up' || direction === 'left';
        const isNextDirection = direction === 'down' || direction === 'right';

        if (!isPreviousDirection && !isNextDirection) {
            return false;
        }

        const nextIndex = getWrappedPanelIndex(panels.length, currentIndex, direction);
        const nextPanel = panels[nextIndex] || null;
        const nextFileId = nextPanel?.dataset?.fileId || '';

        if (!nextFileId || nextFileId === this.activeFileId) {
            return false;
        }

        this._setExclusiveMaximizedPanel(nextPanel);
        this._syncPanelStateFromDom();
        this._setActivePanel(nextFileId, { focusEditor: true, syncModeLabel: true });
        nextPanel.scrollIntoView({ block: 'nearest' });
        this._emitSessionStateChange();
        return true;
    }

    _handleShiftPanelNavigation(direction = '') {
        if (this.layoutMode !== 'panels') return false;

        if (this.panelState.maximizedFileId) {
            return this._moveMaximizedPanelFocus(direction);
        }

        return this._movePanelFocus(direction);
    }

    _toggleActivePanelCollapsed() {
        if (this.layoutMode !== 'panels') return false;

        const activePanel = this._getPanelByFileId(this.activeFileId) || this._getPanels()[0] || null;
        if (!activePanel) return false;

        const isCollapsed = activePanel.classList.contains('collapsed');
        const visiblePanels = this._getPanels().filter((panel) => !panel.classList.contains('collapsed'));

        if (!isCollapsed && visiblePanels.length <= 1) {
            return false;
        }

        activePanel.classList.toggle('collapsed', !isCollapsed);
        this._syncPanelStateFromDom();

        if (isCollapsed) {
            this._setActivePanel(activePanel.dataset.fileId, { focusEditor: true, syncModeLabel: true });
        } else {
            const nextActiveId = this._getPreferredActivePanelId();
            if (nextActiveId) {
                this._setActivePanel(nextActiveId, { focusEditor: true, syncModeLabel: true });
            }
        }

        this._emitSessionStateChange();
        return true;
    }

    _toggleActivePanelMaximize() {
        if (this.layoutMode !== 'panels') return false;

        const activePanel = this._getPanelByFileId(this.activeFileId) || this._getPanels()[0] || null;
        if (!activePanel) return false;

        this._toggleMaximize(activePanel);
        this._syncPanelStateFromDom();
        this._setActivePanel(activePanel.dataset.fileId, { focusEditor: true, syncModeLabel: true });
        this._emitSessionStateChange();
        return true;
    }

    _autoFitPanelsFromVim() {
        if (this.layoutMode !== 'panels') return false;
        this._handleAutoFit();
        this._restoreEditorFocus(this.activeFileId);
        return true;
    }

    _normalizePanelsFromVim() {
        if (this.layoutMode !== 'panels') return false;

        const panels = this._getPanels();
        if (panels.length === 0) return false;

        panels.forEach((panel) => {
            panel.classList.remove('collapsed');
            panel.style.flex = '1 1 0px';
            panel.style.height = '';
        });

        this._syncPanelStateFromDom();
        this._restoreEditorFocus(this.activeFileId);
        this._emitSessionStateChange();
        return true;
    }

    _syncVimModeFromView(view) {
        if (!this.vimEnabled || !view) return;
        this.vimModeLabel = view.dom?.dataset?.vimMode || this.vimModeLabel || 'NORMAL';
        this._updateVimUi();
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

        this._syncActivePanelState();
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
        this._syncActivePanelState();
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

        this._setExclusiveMaximizedPanel(activePanel);
    }

    _setExclusiveMaximizedPanel(activePanel) {
        if (!activePanel) return;

        const panels = this._getPanels();
        panels.forEach((panel) => {
            const isActive = panel === activePanel;
            panel.classList.toggle('collapsed', !isActive);
            panel.style.flex = isActive ? '1 1 0px' : '';
            panel.style.height = '';
        });
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
        const canRenameCurrentFile = hasFile && !isTheory;

        this.btnSave.disabled = !hasTopic || !hasContent || !isSafeToWrite;
        this.btnModify.disabled = isTheory
            ? (!hasTopic || !hasContent || !isSafeToWrite)
            : (!hasFile || !isSafeToWrite);
        this.btnRemove.disabled = !hasFile || isTheory;
        if (this.btnToggleFavoriteExample) {
            this.btnToggleFavoriteExample.disabled = !hasFile || isTheory;
            this.btnToggleFavoriteExample.classList.toggle('is-active', this.currentExampleFavorite);
            this.btnToggleFavoriteExample.setAttribute('aria-pressed', String(this.currentExampleFavorite));
            this.btnToggleFavoriteExample.title = this.currentExampleFavorite
                ? 'Remove from favorites'
                : 'Add to favorites';
        }
        if (this.btnTogglePendingExample) {
            this.btnTogglePendingExample.disabled = !hasFile || isTheory;
            this.btnTogglePendingExample.classList.toggle('is-active', this.currentExamplePending);
            this.btnTogglePendingExample.setAttribute('aria-pressed', String(this.currentExamplePending));
            this.btnTogglePendingExample.title = this.currentExamplePending
                ? 'Remove from pending'
                : 'Add to pending';
        }
        if (this.previewFilenameDisplay) {
            this.previewFilenameDisplay.classList.toggle('is-actionable', canRenameCurrentFile);
            this.previewFilenameDisplay.setAttribute('role', canRenameCurrentFile ? 'button' : 'status');
            this.previewFilenameDisplay.setAttribute('tabindex', canRenameCurrentFile ? '0' : '-1');
            this.previewFilenameDisplay.setAttribute('aria-disabled', String(!canRenameCurrentFile));
        }
        this._updatePanelControlStates();
        this._updateFileControls();
    }

    _updateFilenameDisplay() {
        if (this.currentFilename) {
            if (this.previewFilenameDisplay) {
                this.previewFilenameDisplay.textContent = this.currentFilename;
                this.previewFilenameDisplay.title = this._isTheoryDocumentTarget()
                    ? this.currentFilename
                    : `Rename ${this.currentFilename}`;
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
        const runtimeDiagnostics = this.runtimeDiagnostics || [];
        const diagnosticsCount = structuralDiagnostics.length + compileDiagnostics.length + runtimeDiagnostics.length;

        if (diagnosticsCount === 0) {
            this.statusDisplay.innerHTML = '';
            this.statusDisplay.className = 'editor-status hidden';
            return;
        }

        const hasErrors = [...structuralDiagnostics, ...compileDiagnostics, ...runtimeDiagnostics]
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

        if (runtimeDiagnostics.length > 0) {
            this.statusDisplay.appendChild(this._buildDiagnosticSection('Runtime', runtimeDiagnostics, 'runtime'));
        }
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
}

Object.assign(
    Editor.prototype,
    diagnosticsMixin,
    lineHighlightsMixin,
    sessionManagerMixin,
    exercisePanelMixin,
    theoryEditorMixin,
    shaderDialogsMixin,
    metadataDialogsMixin,
    fileOperationsMixin,
);

export { editorDiagnosticsField, setEditorDiagnosticsEffect, EMPTY_EDITOR_DIAGNOSTICS };

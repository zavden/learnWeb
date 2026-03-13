import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
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
import { fetchExamples, fetchExample, saveExample, modifyExample, removeExample, renameExample } from '../utils/api.js';
import { resolveExerciseComparison } from '../utils/exerciseComparison.js';
import {
    buildExampleDocument,
    cloneExampleDocument,
    createDocumentFile,
    createEmptyExampleDocument,
    duplicateDocumentFile,
    getDocumentEntryCandidates,
    getExerciseConfig,
    getDocumentLanguageOptions,
    hasBlockingDiagnostics,
    parseExampleDocument,
    removeDocumentFile,
    setDocumentEntryPath,
    synchronizeDocument,
    updateDocumentFileDetails,
    updateDocumentFileContent,
    VIRTUAL_FILE_ROLE_OPTIONS,
} from '../utils/markdown.js';

export class Editor {
    constructor({ onCodeChange, onExerciseStateChange, onRename, onSessionStateChange }) {
        this.onCodeChange = onCodeChange;
        this.onExerciseStateChange = onExerciseStateChange;
        this.onRename = onRename;
        this.onSessionStateChange = onSessionStateChange;

        this.currentTopicPath = null;
        this.currentFilename = null;
        this.currentDocument = createEmptyExampleDocument();
        this.compileDiagnostics = [];
        this.editors = [];
        this.fontSize = 13;
        this.layoutModeStorageKey = 'learncode.editor.layout';
        this.layoutMode = this._readLayoutMode();
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
        this.btnLoad = document.getElementById('btn-load');
        this.btnModify = document.getElementById('btn-modify');
        this.btnRemove = document.getElementById('btn-remove');
        this.btnRename = document.getElementById('btn-rename');
        this.btnAddFile = document.getElementById('btn-add-file');
        this.btnDuplicateFile = document.getElementById('btn-duplicate-file');
        this.btnEditFile = document.getElementById('btn-edit-file');
        this.btnDeleteFile = document.getElementById('btn-delete-file');
        this.btnLayout = document.getElementById('btn-editor-layout');
        this.btnAutoFit = document.getElementById('btn-auto-fit');
        this.entrySelectGroup = document.getElementById('entry-select-group');
        this.entrySelect = document.getElementById('entry-select');
        this.filenameDisplay = document.getElementById('current-filename');
        this.statusDisplay = document.getElementById('editor-status');
        this.loadDropdown = document.getElementById('load-dropdown');
        this.loadList = document.getElementById('load-list');
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
        this.fileDialogState = {
            mode: 'create',
            fileId: null,
            suggestedPath: '',
            suggestedRole: '',
            templateId: 'custom',
        };

        this._initButtons();
        this._initShortcuts();
        this._initPanelControls();
        this._initLayoutControls();
        this._initFileControls();
        this._updateFontSize(0);
        this._applyDocument(createEmptyExampleDocument(), { notify: false });
    }

    _readLayoutMode() {
        const stored = window.localStorage.getItem(this.layoutModeStorageKey);
        return stored === 'tabs' ? 'tabs' : 'panels';
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
            exercise: { ...this.exerciseState },
            layoutMode: this.layoutMode,
            maximizedFileId: this.panelState.maximizedFileId,
        };
    }

    restoreSessionState(sessionState = {}) {
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

    _getVisibleFiles() {
        return (this.currentDocument.files || []).filter((file) => this._isExerciseFileVisible(file));
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
        if (!this.btnLayout) return;

        this.btnLayout.addEventListener('click', () => {
            const nextMode = this.layoutMode === 'panels' ? 'tabs' : 'panels';
            this._setLayoutMode(nextMode);
        });

        this._updateLayoutButton();
    }

    _initFileControls() {
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

    _getDocumentFramework() {
        return String(this.currentDocument?.metadata?.framework || '').trim().toLowerCase();
    }

    _isVirtualFileDocument() {
        return this.currentDocument?.sourceFormat === 'virtual-files';
    }

    _isFrameworkMultiFileDocument() {
        return this._isVirtualFileDocument() && ['react', 'vue'].includes(this._getDocumentFramework());
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
            html: 'template.html',
            javascript: framework === 'vue' ? 'module.js' : 'module.js',
            json: 'data.json',
            jsx: 'NewComponent.jsx',
            pug: 'template.pug',
            sass: 'styles.sass',
            scss: 'styles.scss',
            svg: 'graphic.svg',
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

    _initButtons() {
        this.btnSave.addEventListener('click', async () => {
            if (!this.currentTopicPath || hasBlockingDiagnostics(this.currentDocument)) return;

            const content = buildExampleDocument(this.currentDocument);

            try {
                const result = await saveExample(this.currentTopicPath, content);
                this.currentFilename = result.filename;
                this._updateButtonStates();
                this._updateFilenameDisplay();
                this._emitSessionStateChange();
                this._showToast(`Saved: ${result.filename}`, 'success');
            } catch (error) {
                console.error(error);
                this._showToast(`Failed to save: ${error.message}`, 'error');
            }
        });

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

        this.btnLoad.addEventListener('click', async () => {
            if (!this.currentTopicPath) return;

            if (!this.loadDropdown.classList.contains('hidden')) {
                this.loadDropdown.classList.add('hidden');
                return;
            }

            await this._populateLoadList();
            this.loadDropdown.classList.remove('hidden');
        });

        document.addEventListener('click', (event) => {
            if (!this.btnLoad.contains(event.target) && !this.loadDropdown.contains(event.target)) {
                this.loadDropdown.classList.add('hidden');
            }
        });
    }

    async _populateLoadList() {
        const examples = await fetchExamples(this.currentTopicPath);
        this.loadList.innerHTML = '';

        if (examples.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No examples yet';
            li.style.color = 'var(--text-muted)';
            li.style.fontStyle = 'italic';
            li.style.cursor = 'default';
            this.loadList.appendChild(li);
            return;
        }

        examples.forEach((filename) => {
            const li = document.createElement('li');
            li.textContent = filename;
            li.addEventListener('click', async () => {
                await this.loadExample(filename);
                this.loadDropdown.classList.add('hidden');
            });
            this.loadList.appendChild(li);
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
        this._updateButtonStates();
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

    _updateFileControls() {
        const hasTopic = Boolean(this.currentTopicPath);
        const files = this._getVisibleFiles();
        const activeFile = this._getActiveFile();
        const isVirtual = this._isVirtualFileDocument();
        const isFrameworkMultiFile = this._isFrameworkMultiFileDocument();
        const isExerciseMode = this._isExerciseMode();
        const entryCandidates = getDocumentEntryCandidates(this.currentDocument);

        if (this.btnAddFile) {
            this.btnAddFile.disabled = !hasTopic || isExerciseMode;
            this.btnAddFile.textContent = isVirtual ? '+ File' : '+ Block';
            this.btnAddFile.title = isExerciseMode
                ? 'Exercise mode keeps the file structure fixed'
                : (isVirtual ? 'Create a new virtual file' : 'Add a new code block');
        }

        if (this.btnDuplicateFile) {
            this.btnDuplicateFile.disabled = !activeFile || isExerciseMode;
        }

        if (this.btnEditFile) {
            this.btnEditFile.disabled = !activeFile || !isVirtual || isExerciseMode;
        }

        if (this.btnDeleteFile) {
            this.btnDeleteFile.disabled = !activeFile || isExerciseMode || (isVirtual && files.length <= 1);
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
        this._destroyEditors();
        this.workspace.innerHTML = '';
        this.workspace.dataset.layoutMode = this.layoutMode;
        this._ensureActiveFile();

        if (this._getVisibleFiles().length === 0) {
            const empty = document.createElement('div');
            empty.className = 'editor-empty-state';
            empty.textContent = this._isExerciseMode()
                ? 'All exercise files are hidden. Reveal reference or solution files from the exercise panel.'
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

            const view = this._createEditor(editorHost, file);

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

            this.editors.push({
                id: file.id,
                panel,
                view,
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

            nav.appendChild(tab);
        });

        const menu = document.createElement('div');
        menu.className = 'editor-file-menu';

        const select = document.createElement('select');
        select.className = 'editor-file-select';
        select.setAttribute('aria-label', 'Select file');

        this._getVisibleFiles().forEach((file) => {
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
        header.appendChild(nav);
        header.appendChild(menu);
        layout.appendChild(header);

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

        const view = this._createEditor(editorHost, activeFile);
        this.editors.push({
            id: activeFile.id,
            panel: editorHost,
            view,
        });

        this.workspace.appendChild(layout);
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
        this.editors.forEach((entry) => entry.view?.destroy());
        this.editors = [];
    }

    _createEditor(container, file) {
        const isLocked = this._isExerciseFileLocked(file);
        const langExtensions = this._getLanguageExtensions(file.language);
        const updateListener = EditorView.updateListener.of((update) => {
            if (!update.docChanged) return;
            this._setFileContent(file.id, update.state.doc.toString());
            this._triggerChange();
        });

        const state = EditorState.create({
            doc: file.content || '',
            extensions: [
                lineNumbers(),
                highlightActiveLine(),
                highlightActiveLineGutter(),
                history(),
                indentOnInput(),
                bracketMatching(),
                closeBrackets(),
                highlightSelectionMatches(),
                keymap.of([
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

        return new EditorView({ state, parent: container });
    }

    _getLanguageExtensions(type) {
        switch (type) {
            case 'jsx':
                return [javascript({ jsx: true })];
            case 'tsx':
                return [javascript({ jsx: true, typescript: true })];
            case 'html':
            case 'html-full':
            case 'vue':
            case 'svg':
                return [html()];
            case 'css':
            case 'scss':
            case 'sass':
                return [css()];
            case 'javascript':
                return [javascript()];
            case 'typescript':
                return [javascript({ typescript: true })];
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

        this.btnSave.disabled = !hasTopic || !hasContent || !isSafeToWrite;
        this.btnLoad.disabled = !hasTopic;
        this.btnModify.disabled = !hasFile || !isSafeToWrite;
        this.btnRemove.disabled = !hasFile;
        this.btnRename.disabled = !hasFile;
        this._updatePanelControlStates();
        this._updateFileControls();
    }

    _updateFilenameDisplay() {
        if (!this.filenameDisplay) return;

        if (this.currentFilename) {
            this.filenameDisplay.textContent = this.currentFilename;
            this.filenameDisplay.classList.add('visible');
            return;
        }

        this.filenameDisplay.textContent = '';
        this.filenameDisplay.classList.remove('visible');
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

    async _handleModify() {
        if (!this.currentTopicPath || !this.currentFilename || hasBlockingDiagnostics(this.currentDocument)) return;

        const content = buildExampleDocument(this.currentDocument);

        try {
            await modifyExample(this.currentTopicPath, this.currentFilename, content);
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

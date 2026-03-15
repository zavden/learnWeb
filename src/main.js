// ─── Learning App — Main Entry ──────────────────────────

import './style.css';
import { Sidebar } from './components/Sidebar.js';
import { TheoryViewer } from './components/TheoryViewer.js';
import { Editor } from './components/Editor.js';
import { ExercisePanel } from './components/ExercisePanel.js';
import { Preview } from './components/Preview.js';
import { CreateDialog } from './components/CreateDialog.js';
import { FavoritesDialog } from './components/FavoritesDialog.js';
import { Gallery } from './components/Gallery.js';
import { TheoryExerciseDialog } from './components/TheoryExerciseDialog.js';
import { formatExampleRatingStars, getExampleImportanceMeta } from './utils/exampleEditorial.js';
import {
    addFavorite,
    fetchFavorites,
    fetchVimShortcutConfig,
    fetchTopicMain,
    fetchClipboardDefaultState,
    fetchVimDefaultState,
    removeFavorite,
    updateClipboardDefaultState,
    updateVimDefaultState,
} from './utils/api.js';

class App {
    constructor() {
        this.currentTopicPath = null;
        this.sidebarMinWidth = 220;
        this.sidebarMaxWidth = 520;
        this.workspaceMinEditorWidth = 280;
        this.previewMinWidth = 320;
        this.previewFrameMinHeight = 180;
        this.previewConsoleMinHeight = 132;
        this.previewConsoleDefaultHeight = 220;
        this.sessionStorageKey = 'learncode.session';
        this.sidebarWidthStorageKey = 'learncode.sidebar.width';
        this.sidebarCollapsedStorageKey = 'learncode.sidebar.collapsed';
        this.previewEditorialSummaryVisibleStorageKey = 'learncode.preview.editorialSummaryVisible';
        this.previewWidthMode = 'full';
        this.customPreviewWidth = 375;
        this.previewViewportSliderVisible = false;
        this.previewZoomPercent = 100;
        this.previewZoomSliderVisible = false;
        this.previewHeaderHidden = false;
        this.previewEditorialSummaryVisible = window.localStorage.getItem(this.previewEditorialSummaryVisibleStorageKey) !== '0';
        this.clipboardDefaultEnabled = true;
        this.vimDefaultEnabled = true;
        this.theoryReturnState = null;
        this.favoritePaths = new Set();
        this.favoriteEntries = [];

        // UI Elements for View Switching
        this.appShell = document.getElementById('app');
        this.sidebarElement = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('btn-toggle-sidebar');
        this.sidebarResizer = document.getElementById('sidebar-resizer');
        this.workspaceElement = document.getElementById('workspace');
        this.editorColumn = document.getElementById('editor-column');
        this.workspaceResizer = document.getElementById('workspace-resizer');
        this.galleryView = document.getElementById('gallery-view');
        this.editorToolbar = document.querySelector('.editor-toolbar');
        this.editorPanels = document.querySelector('.editor-panels');
        this.btnResetLayout = document.getElementById('btn-reset-layout');
        this.previewColumn = document.getElementById('preview-column');
        this.previewHeader = document.querySelector('.preview-header');
        this.previewEditorialSummary = document.getElementById('preview-editorial-summary');
        this.previewEditorialDescription = document.getElementById('preview-editorial-description');
        this.previewEditorialMeta = document.getElementById('preview-editorial-meta');
        this.previewFrame = document.getElementById('preview-frame');
        this.previewFrameContainer = document.getElementById('preview-frame-container');
        this.btnViewportSliderToggle = document.getElementById('btn-viewport-slider-toggle');
        this.btnViewportWidthInc = document.getElementById('btn-viewport-width-inc');
        this.btnViewportWidthDec = document.getElementById('btn-viewport-width-dec');
        this.previewViewportRail = document.getElementById('preview-viewport-rail');
        this.btnExitTheoryEditor = document.getElementById('btn-exit-theory-editor');
        this.previewConsole = document.getElementById('preview-console');
        this.previewConsoleResizer = document.getElementById('preview-console-resizer');
        this.dragShield = document.getElementById('drag-shield');
        this.btnPreviewZoomDec = document.getElementById('btn-preview-zoom-dec');
        this.btnPreviewZoomInc = document.getElementById('btn-preview-zoom-inc');
        this.btnPreviewZoomToggle = document.getElementById('btn-preview-zoom-toggle');
        this.btnPreviewZoomReset = document.getElementById('btn-preview-zoom-reset');
        this.previewZoomControls = document.getElementById('preview-zoom-controls');
        this.previewZoomSlider = document.getElementById('preview-zoom-slider');
        this.previewZoomDisplay = document.getElementById('preview-zoom-display');
        this.viewportSelect = document.getElementById('viewport-select');
        this.viewportSlider = document.getElementById('viewport-slider');
        this.viewportWidthDisplay = document.getElementById('viewport-width-display');

        // Initialize components
        this.preview = new Preview({
            onCompileStateChange: (diagnostics) => {
                this.editor?.setCompileDiagnostics(diagnostics);
            },
            onRuntimeDiagnosticsChange: (diagnostics) => {
                this.editor?.setRuntimeDiagnostics(diagnostics);
            },
            onRequestShaderUniformEdit: (uniformName) => {
                this.editor?.openShaderUniformDialog?.(uniformName);
            },
            onTheoryExerciseOpenRequest: (topicPath, filename) => {
                this._openTheoryExercise(topicPath, filename);
            },
            onTheoryExercisePreviewRequest: (topicPath, filename) => {
                this._openTheoryExercisePreview(topicPath, filename);
            },
        });

        this.exercisePanel = new ExercisePanel({
            onRevealHint: () => this.editor.revealNextExerciseHint(),
            onRevealReferences: () => this.editor.revealExerciseReferences(),
            onRevealSolution: () => this.editor.revealExerciseSolutions(),
            onSelectComparisonPair: (pairId) => this.editor.selectExerciseComparisonPair(pairId),
            onToggleCollapse: () => this.editor.toggleExerciseNotesCollapsed(),
            onToggleComparison: () => this.editor.toggleExerciseComparison(),
        });

        this.editor = new Editor({
            getShaderPersistedState: () => this.preview.getShaderPersistedState(),
            onCodeChange: (documentModel) => {
                this.exercisePanel.render(this.editor.getExercisePresentation());
                if (this.editor.isEditingTheoryDocument()) {
                    this.theoryViewer.renderContent(this.editor.getTheoryContent());
                }
                this._syncPreviewEditorialSummary();
                this.preview.update(documentModel, {
                    sessionKey: this._getPreviewSessionKey(documentModel),
                });
            },
            onExerciseStateChange: (presentation) => this.exercisePanel.render(presentation),
            onSessionStateChange: () => {
                this._syncTheoryEditorUi();
                this._syncCurrentExampleFavoriteState();
                this._persistSessionState();
            },
            onResetShaderRuntime: () => {
                this.preview?.resetShaderRuntime?.();
            },
            onOpenShaderControls: () => {
                this.preview?.openShaderControls?.();
            },
            onOpenShaderPanel: () => {
                this._openShaderPreviewPanel();
            },
            onTogglePreviewHeader: () => {
                this._togglePreviewHeaderHidden();
            },
            onToggleShaderPause: () => {
                this.preview?.toggleShaderPause?.();
            },
            onTogglePreviewAutoRender: () => this.preview.toggleAutoRender(),
            onToggleConsole: () => this.preview.toggleConsole(),
            onOpenShaderTextures: () => {
                this.editor?.openShaderTextureDialog?.();
            },
            onOpenShaderUniforms: () => {
                this.editor?.openShaderUniformDialog?.();
            },
            onToggleFavoriteCurrentExample: () => this._toggleCurrentExampleFavorite(),
            onToggleSidebar: () => {
                const nextState = !this.appShell.classList.contains('sidebar-collapsed');
                this._setSidebarCollapsed(nextState);
            },
            onCenterWorkspace: () => this._centerWorkspaceSplit(),
            onRename: () => {
                if (this.currentTopicPath) {
                    this.gallery.load(this.currentTopicPath);
                }
            }
        });

        this.gallery = new Gallery({
            onExampleSelect: (filename) => this.loadExample(filename),
        });

        this.favoritesDialog = new FavoritesDialog({
            onExampleSelect: (topicPath, filename) => this._openFavoriteExample(topicPath, filename),
            onRemoveFavorite: (favoritePath) => this._removeFavoritePath(favoritePath),
        });

        this.theoryExerciseDialog = new TheoryExerciseDialog({
            onOpenExample: (topicPath, filename) => this._openTheoryExercise(topicPath, filename),
        });

        this.theoryViewer = new TheoryViewer({
            onEditRequest: () => this.openTheoryEditor(),
            onExerciseOpenRequest: (topicPath, filename) => this._openTheoryExercise(topicPath, filename),
            onExercisePreviewRequest: (topicPath, filename) => this._openTheoryExercisePreview(topicPath, filename),
        });

        this.sidebar = new Sidebar({
            onClipboardDefaultToggle: (enabled) => this._handleClipboardDefaultToggle(enabled),
            onFavoritesClick: () => this._openFavoritesDialog(),
            onPreviewInfoToggle: (visible) => this._setPreviewEditorialSummaryVisible(visible),
            onTopicSelect: (path, label) => this.selectTopic(path, label),
            onCreateClick: (topicPath) => this.openCreateDialog(topicPath),
            onVimDefaultToggle: (enabled) => this._handleVimDefaultToggle(enabled),
        });
        this.sidebar.setPreviewInfoVisible(this.previewEditorialSummaryVisible);

        // Gallery Button
        const btnGallery = document.getElementById('btn-gallery');
        if (btnGallery) {
            btnGallery.addEventListener('click', () => this.showGallery());
        }

        this.createDialog = new CreateDialog({
            onCreated: ({ type, parentPath }) => {
                this.sidebar.load();
                if (type === 'example' && parentPath === this.currentTopicPath) {
                    this.gallery.load(this.currentTopicPath);
                }
            },
        });

        this._initSidebarControls();
        this._initViewportResizer();
        this._initWorkspaceResizer();
        this._initConsoleResizer();
        this._initLayoutResetControl();
        this._initTheoryEditorControls();
        this._initPreviewZoomControls();
        this._bootstrap().catch((error) => {
            console.error('Failed to bootstrap application state.', error);
        });
    }

    _openShaderPreviewPanel() {
        const state = this.preview?.openShaderPanel?.();
        if (state !== 'expanded') return;

        window.requestAnimationFrame(() => {
            const preferredHeight = this.preview?.getPreferredShaderPanelHeight?.();
            if (!Number.isFinite(preferredHeight) || preferredHeight <= 0) return;
            this._setConsoleHeight(preferredHeight);
        });
    }

    async _bootstrap() {
        await this.sidebar.load();
        await this._loadClipboardDefaultState();
        await this._loadVimDefaultState({ persist: false });
        await this._loadVimShortcutConfig();
        await this._loadFavorites();
        await this._restoreSessionState();
    }

    async _loadVimShortcutConfig() {
        try {
            const state = await fetchVimShortcutConfig();
            this.editor.setVimShortcutConfig(state?.config || null);

            if (Array.isArray(state?.warnings) && state.warnings.length > 0) {
                console.warn('Falling back to default Vim shortcuts.', state.warnings.join(' | '));
            }
        } catch (error) {
            console.error('Failed to load vim-shortcuts.yaml.', error);
        }
    }

    async _loadFavorites() {
        try {
            const state = await fetchFavorites();
            this.favoriteEntries = Array.isArray(state?.entries) ? state.entries : [];
            this.favoritePaths = new Set(Array.isArray(state?.items) ? state.items : []);
            this._syncCurrentExampleFavoriteState();
        } catch (error) {
            console.error('Failed to load favorites.', error);
        }
    }

    async _openTheoryExercise(topicPath, filename) {
        const normalizedTopicPath = String(topicPath || '').trim();
        const normalizedFilename = String(filename || '').trim();
        if (!normalizedTopicPath || !normalizedFilename) return;

        if (this.editor?.isEditingTheoryDocument?.()) {
            const saved = await this.editor.saveTheoryDocument();
            if (!saved) return;
            this.theoryReturnState = null;
            this._syncTheoryEditorUi();
        }

        this.theoryViewer?.hide?.();

        if (normalizedTopicPath !== this.currentTopicPath) {
            await this.selectTopic(normalizedTopicPath, normalizedTopicPath, { persist: false });
        }

        await this.loadExample(normalizedFilename);
    }

    async _openTheoryExercisePreview(topicPath, filename) {
        await this.theoryExerciseDialog?.open?.({ topicPath, filename });
    }

    async _loadClipboardDefaultState() {
        try {
            const state = await fetchClipboardDefaultState();
            this.clipboardDefaultEnabled = state?.enabled !== false;
            this.sidebar.setClipboardDefaultEnabled(this.clipboardDefaultEnabled);
            this.editor.setGlobalSystemClipboardDefaultEnabled(this.clipboardDefaultEnabled, { showToast: false });
        } catch (error) {
            console.error('Failed to load default clipboard state.', error);
        }
    }

    async _loadVimDefaultState({ persist = true } = {}) {
        try {
            const state = await fetchVimDefaultState();
            this.vimDefaultEnabled = state?.enabled !== false;
            this.sidebar.setVimDefaultEnabled(this.vimDefaultEnabled);
            this.editor.setGlobalVimDefaultEnabled(this.vimDefaultEnabled, { showToast: false });
            if (persist) {
                this._persistSessionState();
            }
        } catch (error) {
            console.error('Failed to load default Vim state.', error);
        }
    }

    async _handleVimDefaultToggle(enabled) {
        try {
            const state = await updateVimDefaultState(enabled);
            this.vimDefaultEnabled = state?.enabled !== false;
            this.sidebar.setVimDefaultEnabled(this.vimDefaultEnabled);
            this.editor.setGlobalVimDefaultEnabled(this.vimDefaultEnabled, { showToast: true });
            this._persistSessionState();
        } catch (error) {
            console.error('Failed to update default Vim state.', error);
            window.alert(`Could not update Vim default: ${error.message}`);
        }
    }

    async _handleClipboardDefaultToggle(enabled) {
        try {
            const state = await updateClipboardDefaultState(enabled);
            this.clipboardDefaultEnabled = state?.enabled !== false;
            this.sidebar.setClipboardDefaultEnabled(this.clipboardDefaultEnabled);
            this.editor.setGlobalSystemClipboardDefaultEnabled(this.clipboardDefaultEnabled, { showToast: true });
        } catch (error) {
            console.error('Failed to update clipboard default state.', error);
            window.alert(`Could not update clipboard default: ${error.message}`);
        }
    }

    async selectTopic(topicPath, label, { persist = true } = {}) {
        this.sidebar.setActive(topicPath);
        this.currentTopicPath = topicPath;

        // Update components
        this.editor.setTopicPath(topicPath);
        this.preview.setTopicPath(topicPath);
        this.gallery.currentTopicPath = topicPath;

        // Load theory content
        this.theoryViewer.load(topicPath);
        this.exercisePanel.clear();

        await this.gallery.load(topicPath);
        this.showGallery();
        this._syncCurrentExampleFavoriteState();

        if (persist) {
            this._persistSessionState();
        }
    }

    async loadExample(filename, { persist = true } = {}) {
        this.showEditor();
        await this.editor.loadExample(filename);
        this._syncTheoryEditorUi();
        this._syncCurrentExampleFavoriteState();

        if (persist) {
            this._persistSessionState();
        }
    }

    async openTheoryEditor({ persist = true } = {}) {
        if (!this.currentTopicPath) return;

        try {
            if (!this.editor.isEditingTheoryDocument()) {
                this.theoryReturnState = this.galleryView.classList.contains('hidden')
                    ? {
                        mode: 'editor',
                        snapshot: this.editor.captureWorkspaceSnapshot(),
                    }
                    : { mode: 'gallery' };
            }

            const data = await fetchTopicMain(this.currentTopicPath);
            this.showEditor();
            this.theoryViewer.hide();
            this.editor.loadTheoryDocument(data?.content || '');
            this.preview.renderNow();
            this._syncTheoryEditorUi();
            this.editor.focusActiveEditor();

            if (persist) {
                this._persistSessionState();
            }
        } catch (error) {
            console.error('Failed to open theory editor.', error);
            window.alert(`Could not open theory editor: ${error.message}`);
        }
    }

    async closeTheoryEditor({ persist = true } = {}) {
        if (!this.editor.isEditingTheoryDocument()) return;

        const saved = await this.editor.saveTheoryDocument();
        if (!saved) return;

        const returnState = this.theoryReturnState;
        this.theoryReturnState = null;

        if (returnState?.mode === 'editor' && returnState.snapshot) {
            this.showEditor();
            await this.editor.restoreWorkspaceSnapshot(returnState.snapshot);
            this.editor.focusActiveEditor();
        } else {
            this.showGallery();
        }

        this._syncTheoryEditorUi();

        if (persist) {
            this._persistSessionState();
        }
    }

    showGallery() {
        this.galleryView.classList.remove('hidden');
        this.editorToolbar.classList.add('hidden');
        this.editorPanels.classList.add('hidden');
        this.exercisePanel.clear();
        this.preview.clear();
        this._clearPreviewEditorialSummary();
        this._syncTheoryEditorUi();
        this._syncCurrentExampleFavoriteState();
    }

    showEditor() {
        this.galleryView.classList.add('hidden');
        this.editorToolbar.classList.remove('hidden');
        this.editorPanels.classList.remove('hidden');
        this._syncTheoryEditorUi();
        this._syncCurrentExampleFavoriteState();
        this._syncPreviewEditorialSummary();
    }

    _getCurrentExampleFavoritePath() {
        const filename = String(this.editor?.currentFilename || '').trim();
        if (!this.currentTopicPath || !filename || this.editor?.isEditingTheoryDocument?.()) {
            return '';
        }

        return `material/${this.currentTopicPath}/examples/${filename}`;
    }

    _syncCurrentExampleFavoriteState() {
        const favoritePath = this._getCurrentExampleFavoritePath();
        this.editor?.setCurrentExampleFavorite?.(favoritePath ? this.favoritePaths.has(favoritePath) : false);
    }

    async _toggleCurrentExampleFavorite() {
        const favoritePath = this._getCurrentExampleFavoritePath();
        if (!favoritePath) return;

        try {
            const state = this.favoritePaths.has(favoritePath)
                ? await removeFavorite(favoritePath)
                : await addFavorite(favoritePath);

            this.favoriteEntries = Array.isArray(state?.entries) ? state.entries : [];
            this.favoritePaths = new Set(Array.isArray(state?.items) ? state.items : []);
            this._syncCurrentExampleFavoriteState();

            if (this.favoritesDialog?.dialog?.open) {
                await this.favoritesDialog.render(this.favoriteEntries);
            }

            this.editor?._showToast?.(
                this.favoritePaths.has(favoritePath)
                    ? 'Added to favorites.'
                    : 'Removed from favorites.',
                'success',
            );
        } catch (error) {
            console.error('Failed to toggle favorite.', error);
            this.editor?._showToast?.(`Favorite update failed: ${error.message}`, 'error');
        }
    }

    async _removeFavoritePath(favoritePath) {
        try {
            const state = await removeFavorite(favoritePath);
            this.favoriteEntries = Array.isArray(state?.entries) ? state.entries : [];
            this.favoritePaths = new Set(Array.isArray(state?.items) ? state.items : []);
            this._syncCurrentExampleFavoriteState();
            await this.favoritesDialog.render(this.favoriteEntries);
        } catch (error) {
            console.error('Failed to remove favorite.', error);
            this.editor?._showToast?.(`Favorite remove failed: ${error.message}`, 'error');
        }
    }

    async _openFavoritesDialog() {
        await this._loadFavorites();
        this.favoritesDialog.open(this.favoriteEntries);
    }

    async _openFavoriteExample(topicPath, filename) {
        const topic = this._findTopicByPath(topicPath);
        if (!topic) return;

        if (this.currentTopicPath !== topicPath) {
            await this.selectTopic(topicPath, topic.label, { persist: false });
        }

        await this.loadExample(filename);
    }

    _initTheoryEditorControls() {
        this.btnExitTheoryEditor?.addEventListener('click', () => {
            this.closeTheoryEditor();
        });
    }

    _syncTheoryEditorUi() {
        const isEditingTheory = this.editor?.isEditingTheoryDocument?.() === true;
        this.btnExitTheoryEditor?.classList.toggle('hidden', !isEditingTheory);
    }

    _getPreviewHeaderHeight() {
        if (!this.previewHeader || this.previewHeader.classList.contains('hidden')) {
            return 0;
        }

        return this.previewHeader.getBoundingClientRect().height || 40;
    }

    _setPreviewHeaderHidden(hidden, { persist = true } = {}) {
        this.previewHeaderHidden = Boolean(hidden);
        this.previewHeader?.classList.toggle('hidden', this.previewHeaderHidden);
        this._setConsoleHeight(
            Number.parseInt(this.previewColumn?.style.getPropertyValue('--preview-console-height') || '', 10)
                || this.previewConsoleDefaultHeight,
            { persist: false },
        );

        if (persist) {
            this._persistSessionState();
        }
    }

    _togglePreviewHeaderHidden() {
        this._setPreviewHeaderHidden(!this.previewHeaderHidden);
        return this.previewHeaderHidden;
    }

    _initViewportResizer() {
        if (!this.viewportSelect || !this.viewportSlider || !this.viewportWidthDisplay || !this.previewFrame) return;

        this.viewportSelect.addEventListener('change', (event) => {
            if (event.target.value === '100%') {
                this._applyFullPreviewWidth();
                return;
            }

            this._applyCustomPreviewWidth(event.target.value);
        });

        this.viewportSlider.addEventListener('input', (event) => {
            this._applyCustomPreviewWidth(event.target.value);
        });

        this.btnViewportSliderToggle?.addEventListener('click', () => {
            this._setViewportSliderVisible(!this.previewViewportSliderVisible);
        });

        this.btnViewportWidthInc?.addEventListener('click', () => {
            this._adjustPreviewViewportWidth(1);
        });

        this.btnViewportWidthDec?.addEventListener('click', () => {
            this._adjustPreviewViewportWidth(-1);
        });

        this._setViewportSliderVisible(false);
    }

    _initPreviewZoomControls() {
        if (!this.previewFrame || !this.previewZoomSlider || !this.previewZoomDisplay || !this.btnPreviewZoomToggle) {
            return;
        }

        this._applyPreviewZoom(this.previewZoomPercent, { persist: false });
        this._setPreviewZoomControlsVisible(false);

        this.previewZoomSlider.addEventListener('input', (event) => {
            this._applyPreviewZoom(event.target.value);
        });

        this.btnPreviewZoomToggle.addEventListener('click', () => {
            this._setPreviewZoomControlsVisible(!this.previewZoomSliderVisible);
        });

        this.btnPreviewZoomDec?.addEventListener('click', () => {
            this._adjustPreviewZoom(-5);
        });

        this.btnPreviewZoomInc?.addEventListener('click', () => {
            this._adjustPreviewZoom(5);
        });

        this.btnPreviewZoomReset?.addEventListener('click', () => {
            this._applyPreviewZoom(100);
        });
    }

    _initSidebarControls() {
        if (!this.appShell || !this.sidebarElement || !this.sidebarToggle || !this.sidebarResizer) return;

        const storedWidth = this._readStoredNumber(this.sidebarWidthStorageKey, 280);
        const isCollapsed = window.localStorage.getItem(this.sidebarCollapsedStorageKey) === '1';

        this._setSidebarWidth(storedWidth, { persist: false });
        this._setSidebarCollapsed(isCollapsed, { persist: false });

        this.sidebarToggle.addEventListener('click', () => {
            const nextState = !this.appShell.classList.contains('sidebar-collapsed');
            this._setSidebarCollapsed(nextState);
        });

        this.sidebarResizer.addEventListener('mousedown', (event) => this._startSidebarResize(event));

        window.addEventListener('resize', () => {
            const currentWidth = this._readStoredNumber(
                this.sidebarWidthStorageKey,
                this.sidebarElement.getBoundingClientRect().width || 280,
            );
            this._setSidebarWidth(currentWidth, { persist: false });
        });
    }

    _readStoredNumber(key, fallback) {
        const value = Number.parseInt(window.localStorage.getItem(key) || '', 10);
        return Number.isFinite(value) ? value : fallback;
    }

    _getSidebarBounds() {
        const maxWidth = Math.max(this.sidebarMinWidth, Math.min(this.sidebarMaxWidth, window.innerWidth - 280));
        return {
            min: this.sidebarMinWidth,
            max: maxWidth,
        };
    }

    _setSidebarWidth(width, { persist = true } = {}) {
        const { min, max } = this._getSidebarBounds();
        const nextWidth = Math.max(min, Math.min(max, Number(width) || min));

        this.appShell.style.setProperty('--sidebar-width', `${nextWidth}px`);

        if (!persist) return;
        window.localStorage.setItem(this.sidebarWidthStorageKey, String(nextWidth));
    }

    _setSidebarCollapsed(collapsed, { persist = true } = {}) {
        this.appShell.classList.toggle('sidebar-collapsed', collapsed);
        this.sidebarElement.setAttribute('aria-hidden', String(collapsed));

        const label = collapsed ? 'Show navigation' : 'Hide navigation';
        this.sidebarToggle.title = label;
        this.sidebarToggle.setAttribute('aria-label', label);
        this.sidebarToggle.setAttribute('aria-expanded', String(!collapsed));

        if (!persist) return;
        window.localStorage.setItem(this.sidebarCollapsedStorageKey, collapsed ? '1' : '0');
    }

    _centerWorkspaceSplit() {
        const applyHalfSplit = () => {
            const workspaceWidth = this.workspaceElement?.getBoundingClientRect().width || window.innerWidth;
            const dividerWidth = this.workspaceResizer?.getBoundingClientRect().width || 10;
            const nextPreviewWidth = Math.round((workspaceWidth - dividerWidth) / 2);
            this._setPreviewColumnWidth(nextPreviewWidth, { persist: false });
            this._persistSessionState();
        };

        if (!this.appShell.classList.contains('sidebar-collapsed')) {
            this._setSidebarCollapsed(true);
            window.requestAnimationFrame(() => {
                applyHalfSplit();
            });
            return;
        }

        applyHalfSplit();
    }

    _showDragShield(direction = 'ew') {
        if (!this.dragShield) return;

        this.dragShield.classList.remove('hidden', 'is-ew-resize', 'is-ns-resize');
        this.dragShield.classList.add(direction === 'ns' ? 'is-ns-resize' : 'is-ew-resize');
    }

    _hideDragShield() {
        if (!this.dragShield) return;

        this.dragShield.classList.add('hidden');
        this.dragShield.classList.remove('is-ew-resize', 'is-ns-resize');
    }

    _startSidebarResize(event) {
        if (this.appShell.classList.contains('sidebar-collapsed')) return;

        event.preventDefault();

        const startX = event.clientX;
        const startWidth = this.sidebarElement.getBoundingClientRect().width;
        let nextWidth = startWidth;

        this.sidebarResizer.classList.add('resizing');
        document.body.classList.add('is-resizing-sidebar');
        this._showDragShield('ew');
        const dragTarget = this.dragShield || document;

        const onMouseMove = (moveEvent) => {
            nextWidth = startWidth + (moveEvent.clientX - startX);
            this._setSidebarWidth(nextWidth, { persist: false });
        };

        const onMouseUp = () => {
            dragTarget.removeEventListener('mousemove', onMouseMove);
            dragTarget.removeEventListener('mouseup', onMouseUp);
            this.sidebarResizer.classList.remove('resizing');
            document.body.classList.remove('is-resizing-sidebar');
            this._hideDragShield();
            this._setSidebarWidth(nextWidth);
        };

        dragTarget.addEventListener('mousemove', onMouseMove);
        dragTarget.addEventListener('mouseup', onMouseUp);
    }

    _initWorkspaceResizer() {
        if (!this.workspaceElement || !this.workspaceResizer || !this.previewColumn) return;

        const initialWidth = Math.round(this.previewColumn.getBoundingClientRect().width || 640);
        this._setPreviewColumnWidth(initialWidth, { persist: false });
        this._applyFullPreviewWidth({ persist: false });

        this.workspaceResizer.addEventListener('mousedown', (event) => this._startWorkspaceResize(event));

        window.addEventListener('resize', () => {
            if (this.previewWidthMode === 'full') {
                this._applyFullPreviewWidth({ persist: false });
            } else {
                this._applyCustomPreviewWidth(this.customPreviewWidth, { persist: false });
            }
        });
    }

    _initConsoleResizer() {
        if (!this.previewColumn || !this.previewConsoleResizer) return;

        this._setConsoleHeight(this.previewConsoleDefaultHeight, { persist: false });
        this.previewConsoleResizer.addEventListener('mousedown', (event) => this._startConsoleResize(event));

        window.addEventListener('resize', () => {
            const currentHeight = Number.parseInt(
                this.previewColumn.style.getPropertyValue('--preview-console-height') || '',
                10,
            );
            this._setConsoleHeight(
                Number.isFinite(currentHeight) ? currentHeight : this.previewConsoleDefaultHeight,
                { persist: false },
            );
        });
    }

    _initLayoutResetControl() {
        this.btnResetLayout?.addEventListener('click', () => this._resetLayoutState());
    }

    _getWorkspaceBounds() {
        const workspaceWidth = this.workspaceElement?.getBoundingClientRect().width || window.innerWidth;
        const dividerWidth = this.workspaceResizer?.getBoundingClientRect().width || 10;
        const maxWidth = Math.max(
            this.previewMinWidth,
            Math.round(workspaceWidth - this.workspaceMinEditorWidth - dividerWidth),
        );

        return {
            min: this.previewMinWidth,
            max: maxWidth,
        };
    }

    _setPreviewColumnWidth(width, { persist = true } = {}) {
        const { min, max } = this._getWorkspaceBounds();
        const nextWidth = Math.max(min, Math.min(max, Math.round(Number(width) || min)));
        this.appShell.style.setProperty('--preview-column-width', `${nextWidth}px`);

        if (persist) {
            this._persistSessionState();
        }

        return nextWidth;
    }

    _getConsoleBounds() {
        const previewColumnHeight = this.previewColumn?.getBoundingClientRect().height || window.innerHeight;
        const previewHeaderHeight = this._getPreviewHeaderHeight();
        const resizerHeight = this.previewConsoleResizer?.getBoundingClientRect().height || 10;
        const maxHeight = Math.max(
            this.previewConsoleMinHeight,
            Math.round(previewColumnHeight - previewHeaderHeight - resizerHeight - this.previewFrameMinHeight),
        );

        return {
            min: this.previewConsoleMinHeight,
            max: maxHeight,
        };
    }

    _setConsoleHeight(height, { persist = true } = {}) {
        if (!this.previewColumn) return this.previewConsoleDefaultHeight;

        const { min, max } = this._getConsoleBounds();
        const nextHeight = Math.max(min, Math.min(max, Math.round(Number(height) || min)));
        this.previewColumn.style.setProperty('--preview-console-height', `${nextHeight}px`);

        if (persist) {
            this._persistSessionState();
        }

        return nextHeight;
    }

    _getDefaultPreviewColumnWidth() {
        const preferredWidth = Math.min(Math.round(window.innerWidth * 0.48), 640);
        const { min, max } = this._getWorkspaceBounds();
        return Math.max(min, Math.min(max, preferredWidth));
    }

    _syncPreviewControls(width, mode = 'custom') {
        if (!this.viewportSlider || !this.viewportWidthDisplay || !this.viewportSelect) return;

        if (mode === 'full') {
            this.viewportWidthDisplay.textContent = 'Full';
            this.viewportSlider.value = Math.min(Number(this.viewportSlider.max), width);
            this.viewportSelect.value = '100%';
            return;
        }

        this.viewportWidthDisplay.textContent = `${width}px`;
        this.viewportSlider.value = Math.min(Number(this.viewportSlider.max), width);
        this.viewportSelect.value = 'custom';
    }

    _setViewportSliderVisible(visible) {
        this.previewViewportSliderVisible = Boolean(visible);
        this.previewViewportRail?.classList.toggle('hidden', !this.previewViewportSliderVisible);
        this.previewViewportRail?.setAttribute('aria-hidden', String(!this.previewViewportSliderVisible));
        this.btnViewportSliderToggle?.setAttribute('aria-expanded', String(this.previewViewportSliderVisible));
        this.btnViewportSliderToggle?.classList.toggle('is-active', this.previewViewportSliderVisible);
        this._syncPreviewRailOffsets();

        if (this.btnViewportSliderToggle) {
            this.btnViewportSliderToggle.title = this.previewViewportSliderVisible
                ? 'Hide viewport width slider'
                : 'Show viewport width slider';
            this.btnViewportSliderToggle.setAttribute('aria-label', this.btnViewportSliderToggle.title);
        }
    }

    _applyFullPreviewWidth({ persist = true } = {}) {
        if (!this.previewFrame) return;

        const columnWidth = Math.round(this.previewColumn?.getBoundingClientRect().width || this.previewMinWidth);
        this.previewWidthMode = 'full';
        this._syncPreviewControls(columnWidth, 'full');
        this._applyPreviewZoom(this.previewZoomPercent, { persist: false });

        if (persist) {
            this._persistSessionState();
        }
    }

    _applyCustomPreviewWidth(width, { persist = true } = {}) {
        if (!this.previewFrame) return;

        const nextWidth = Math.max(this.previewMinWidth, Math.round(Number.parseInt(width, 10) || this.previewMinWidth));
        this.previewWidthMode = 'custom';
        this.customPreviewWidth = nextWidth;
        this._syncPreviewControls(nextWidth, 'custom');
        this._applyPreviewZoom(this.previewZoomPercent, { persist: false });

        if (persist) {
            this._persistSessionState();
        }
    }

    _adjustPreviewViewportWidth(delta = 0) {
        if (!this.previewFrame) return;

        const currentWidth = this.previewWidthMode === 'full'
            ? Math.round(this.previewColumn?.getBoundingClientRect().width || this.previewMinWidth)
            : this.customPreviewWidth;
        const sliderMin = Number.parseInt(this.viewportSlider?.min || '', 10);
        const sliderMax = Number.parseInt(this.viewportSlider?.max || '', 10);
        const minWidth = Number.isFinite(sliderMin) ? sliderMin : this.previewMinWidth;
        const maxWidth = Number.isFinite(sliderMax) ? sliderMax : 1440;
        const nextWidth = Math.max(minWidth, Math.min(maxWidth, currentWidth + Math.trunc(delta)));

        this._applyCustomPreviewWidth(nextWidth);
    }

    _setPreviewZoomControlsVisible(visible) {
        this.previewZoomSliderVisible = Boolean(visible);
        this.previewZoomControls?.classList.toggle('hidden', !this.previewZoomSliderVisible);
        this.previewZoomControls?.setAttribute('aria-hidden', String(!this.previewZoomSliderVisible));
        this.btnPreviewZoomToggle?.setAttribute('aria-expanded', String(this.previewZoomSliderVisible));
        this.btnPreviewZoomToggle?.classList.toggle('is-active', this.previewZoomSliderVisible);
        this._syncPreviewRailOffsets();
        if (this.btnPreviewZoomToggle) {
            this.btnPreviewZoomToggle.title = this.previewZoomSliderVisible
                ? 'Hide preview zoom controls'
                : 'Show preview zoom controls';
        }
    }

    _syncPreviewRailOffsets() {
        this.previewZoomControls?.classList.toggle(
            'is-shifted-for-viewport',
            this.previewZoomSliderVisible && this.previewViewportSliderVisible,
        );
    }

    _adjustPreviewZoom(delta = 0) {
        this._applyPreviewZoom(this.previewZoomPercent + delta);
    }

    _applyPreviewZoom(percent, { persist = true } = {}) {
        if (!this.previewFrame || !this.previewZoomSlider || !this.previewZoomDisplay) return;

        const nextZoom = Math.max(50, Math.min(300, Math.round((Number(percent) || 100) / 5) * 5));
        this.previewZoomPercent = nextZoom;
        const scale = nextZoom / 100;
        const isDefaultZoom = nextZoom === 100;
        const widthValue = this.previewWidthMode === 'full'
            ? '100%'
            : `${this.customPreviewWidth}px`;

        this.previewFrame.style.setProperty('--preview-zoom-scale', String(scale));
        this.previewFrame.style.width = isDefaultZoom
            ? widthValue
            : this.previewWidthMode === 'full'
                ? `${100 / scale}%`
                : `${this.customPreviewWidth / scale}px`;
        this.previewFrame.style.height = isDefaultZoom ? '100%' : `${100 / scale}%`;
        this.previewFrame.style.transform = isDefaultZoom ? '' : `scale(${scale})`;
        this.previewZoomSlider.value = String(nextZoom);
        this.previewZoomDisplay.textContent = `${nextZoom}%`;
        this.btnPreviewZoomDec?.toggleAttribute('disabled', nextZoom <= 50);
        this.btnPreviewZoomInc?.toggleAttribute('disabled', nextZoom >= 300);
        if (this.btnPreviewZoomReset) {
            this.btnPreviewZoomReset.textContent = `${nextZoom}%`;
            this.btnPreviewZoomReset.title = nextZoom === 100
                ? 'Preview zoom is already at 100%'
                : 'Reset preview zoom to 100%';
            this.btnPreviewZoomReset.classList.toggle('is-active', nextZoom !== 100);
            this.btnPreviewZoomReset.toggleAttribute('disabled', nextZoom === 100);
        }

        if (persist) {
            this._persistSessionState();
        }
    }

    _resetLayoutState() {
        this.editor?.resetLayoutState?.();
        this.preview?.resetLayoutState?.();
        this._setPreviewColumnWidth(this._getDefaultPreviewColumnWidth(), { persist: false });
        this._setConsoleHeight(this.previewConsoleDefaultHeight, { persist: false });
        this._applyFullPreviewWidth({ persist: false });
        this._applyPreviewZoom(100, { persist: false });
        this._setPreviewZoomControlsVisible(false);
        this._persistSessionState();
    }

    _startWorkspaceResize(event) {
        if (!this.workspaceResizer || !this.previewColumn) return;

        event.preventDefault();

        const startX = event.clientX;
        const startWidth = this.previewColumn.getBoundingClientRect().width;
        let nextWidth = startWidth;

        this.workspaceResizer.classList.add('resizing');
        document.body.classList.add('is-resizing-workspace');
        this._showDragShield('ew');
        const dragTarget = this.dragShield || document;

        const onMouseMove = (moveEvent) => {
            nextWidth = startWidth - (moveEvent.clientX - startX);
            this._setPreviewColumnWidth(nextWidth, { persist: false });
            if (this.previewWidthMode === 'full') {
                this._applyFullPreviewWidth({ persist: false });
            }
        };

        const onMouseUp = () => {
            dragTarget.removeEventListener('mousemove', onMouseMove);
            dragTarget.removeEventListener('mouseup', onMouseUp);
            this.workspaceResizer.classList.remove('resizing');
            document.body.classList.remove('is-resizing-workspace');
            this._hideDragShield();
            this._setPreviewColumnWidth(nextWidth, { persist: false });
            if (this.previewWidthMode === 'full') {
                this._applyFullPreviewWidth({ persist: false });
            }
            this._persistSessionState();
        };

        dragTarget.addEventListener('mousemove', onMouseMove);
        dragTarget.addEventListener('mouseup', onMouseUp);
    }

    _startConsoleResize(event) {
        if (!this.previewConsoleResizer || !this.previewConsole || this.previewConsoleResizer.classList.contains('hidden')) {
            return;
        }

        event.preventDefault();

        const startY = event.clientY;
        const startHeight = this.previewConsole.getBoundingClientRect().height || this.previewConsoleDefaultHeight;
        let nextHeight = startHeight;

        this.previewConsoleResizer.classList.add('resizing');
        document.body.classList.add('is-resizing-console');
        this._showDragShield('ns');
        const dragTarget = this.dragShield || document;

        const onMouseMove = (moveEvent) => {
            nextHeight = startHeight - (moveEvent.clientY - startY);
            this._setConsoleHeight(nextHeight, { persist: false });
        };

        const onMouseUp = () => {
            dragTarget.removeEventListener('mousemove', onMouseMove);
            dragTarget.removeEventListener('mouseup', onMouseUp);
            this.previewConsoleResizer.classList.remove('resizing');
            document.body.classList.remove('is-resizing-console');
            this._hideDragShield();
            this._setConsoleHeight(nextHeight);
        };

        dragTarget.addEventListener('mousemove', onMouseMove);
        dragTarget.addEventListener('mouseup', onMouseUp);
    }

    _readSessionState() {
        try {
            const raw = window.localStorage.getItem(this.sessionStorageKey);
            if (!raw) return null;

            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : null;
        } catch {
            return null;
        }
    }

    _captureSessionState() {
        const editorState = this.editor?.getSessionState?.() || {};
        const previewColumnWidth = Math.round(this.previewColumn?.getBoundingClientRect().width || 0);

        return {
            version: 1,
            documentFilename: this.editor?.currentFilename || '',
            documentTarget: this.editor?.getDocumentTarget?.() || 'example',
            topicPath: this.currentTopicPath || '',
            exampleFilename: this.editor?.currentFilename || '',
            editor: {
                activeFileId: editorState.activeFileId || '',
                collapsedFileIds: Array.isArray(editorState.collapsedFileIds) ? editorState.collapsedFileIds : [],
                layoutMode: editorState.layoutMode || 'panels',
                maximizedFileId: editorState.maximizedFileId || '',
            },
            preview: {
                columnWidth: previewColumnWidth || this.previewMinWidth,
                consoleHeight: Number.parseInt(
                    this.previewColumn?.style.getPropertyValue('--preview-console-height') || '',
                    10,
                ) || this.previewConsoleDefaultHeight,
                customWidth: this.previewWidthMode === 'custom' ? this.customPreviewWidth : null,
                headerHidden: this.previewHeaderHidden,
                zoom: this.previewZoomPercent,
                widthMode: this.previewWidthMode,
            },
        };
    }

    _getPreviewSessionKey(documentModel) {
        const parts = [
            this.currentTopicPath || '',
            this.editor?.currentFilename || documentModel?.sessionId || 'draft',
        ];

        return parts.join('::');
    }

    _persistSessionState() {
        try {
            window.localStorage.setItem(this.sessionStorageKey, JSON.stringify(this._captureSessionState()));
        } catch {
            // Ignore storage errors so editing remains functional.
        }
    }

    _findTopicByPath(topicPath) {
        for (const chapter of this.sidebar.getTree()) {
            for (const section of chapter.sections || []) {
                const topic = (section.topics || []).find((entry) => entry.path === topicPath);
                if (topic) return topic;
            }
        }

        return null;
    }

    _restorePreviewState(previewState = {}) {
        this._setPreviewHeaderHidden(previewState.headerHidden === true, { persist: false });

        const columnWidth = Number.isFinite(previewState.columnWidth)
            ? previewState.columnWidth
            : Number.parseInt(previewState.columnWidth, 10);
        if (Number.isFinite(columnWidth) && columnWidth > 0) {
            this._setPreviewColumnWidth(columnWidth, { persist: false });
        }

        const consoleHeight = Number.isFinite(previewState.consoleHeight)
            ? previewState.consoleHeight
            : Number.parseInt(previewState.consoleHeight, 10);
        this._setConsoleHeight(
            Number.isFinite(consoleHeight) && consoleHeight > 0
                ? consoleHeight
                : this.previewConsoleDefaultHeight,
            { persist: false },
        );

        const customWidth = Number.isFinite(previewState.customWidth)
            ? previewState.customWidth
            : Number.parseInt(previewState.customWidth, 10);

        if (previewState.widthMode === 'custom' && Number.isFinite(customWidth) && customWidth > 0) {
            this._applyCustomPreviewWidth(customWidth, { persist: false });
        } else {
            this._applyFullPreviewWidth({ persist: false });
        }

        const zoom = Number.isFinite(previewState.zoom)
            ? previewState.zoom
            : Number.parseInt(previewState.zoom, 10);
        this._applyPreviewZoom(Number.isFinite(zoom) && zoom > 0 ? zoom : 100, { persist: false });
    }

    async _restoreSessionState() {
        const sessionState = this._readSessionState();
        if (!sessionState) return;

        this._restorePreviewState(sessionState.preview || {});

        const topicPath = typeof sessionState.topicPath === 'string' ? sessionState.topicPath.trim() : '';
        if (!topicPath) {
            this.editor.restoreSessionState(sessionState.editor || {});
            this.editor.focusActiveEditor();
            this._persistSessionState();
            return;
        }

        const topic = this._findTopicByPath(topicPath);
        if (!topic) {
            this.editor.restoreSessionState(sessionState.editor || {});
            this.editor.focusActiveEditor();
            this._persistSessionState();
            return;
        }

        await this.selectTopic(topic.path, topic.label, { persist: false });
        this.editor.restoreSessionState(sessionState.editor || {});

        const documentTarget = sessionState.documentTarget === 'theory' ? 'theory' : 'example';
        const documentFilename = typeof sessionState.documentFilename === 'string'
            ? sessionState.documentFilename.trim()
            : '';
        const exampleFilename = typeof sessionState.exampleFilename === 'string'
            ? sessionState.exampleFilename.trim()
            : '';
        if (documentTarget === 'theory') {
            try {
                await this.openTheoryEditor({ persist: false });
                this.editor.restoreSessionState(sessionState.editor || {});
                this.editor.focusActiveEditor();
            } catch (error) {
                console.warn('Failed to restore previous theory session.', error);
                this.showGallery();
            }

            this._persistSessionState();
            return;
        }

        const filenameToRestore = documentFilename || exampleFilename;
        if (!filenameToRestore) {
            this._persistSessionState();
            return;
        }

        try {
            await this.loadExample(filenameToRestore, { persist: false });
            this.editor.restoreSessionState(sessionState.editor || {});
            this.editor.focusActiveEditor();
        } catch (error) {
            console.warn('Failed to restore previous example session.', error);
            this.showGallery();
        }

        this._persistSessionState();
    }

    openCreateDialog(preselectedTopicPath = null) {
        const tree = this.sidebar.getTree();
        this.createDialog.open(tree, preselectedTopicPath);
    }

    _clearPreviewEditorialSummary() {
        if (!this.previewEditorialSummary || !this.previewEditorialDescription || !this.previewEditorialMeta) return;
        this.previewEditorialSummary.classList.add('hidden');
        this.previewEditorialDescription.textContent = '';
        this.previewEditorialMeta.innerHTML = '';
    }

    _setPreviewEditorialSummaryVisible(visible) {
        this.previewEditorialSummaryVisible = visible !== false;
        window.localStorage.setItem(
            this.previewEditorialSummaryVisibleStorageKey,
            this.previewEditorialSummaryVisible ? '1' : '0'
        );
        this.sidebar?.setPreviewInfoVisible?.(this.previewEditorialSummaryVisible);
        this._syncPreviewEditorialSummary();
    }

    _syncPreviewEditorialSummary() {
        if (!this.previewEditorialSummary || !this.previewEditorialDescription || !this.previewEditorialMeta) return;

        if (
            !this.previewEditorialSummaryVisible
            || !this.galleryView.classList.contains('hidden')
            || this.editor?.isEditingTheoryDocument?.()
        ) {
            this._clearPreviewEditorialSummary();
            return;
        }

        const metadata = this.editor?.getCurrentEditorialMetadata?.();
        if (!metadata) {
            this._clearPreviewEditorialSummary();
            return;
        }

        this.previewEditorialDescription.textContent = metadata.description || 'Example metadata';
        this.previewEditorialMeta.innerHTML = '';

        const importanceMeta = getExampleImportanceMeta(metadata.importance);
        if (importanceMeta) {
            const importance = document.createElement('span');
            importance.className = `preview-editorial-pill is-${importanceMeta.accent}`;
            importance.textContent = importanceMeta.label;
            this.previewEditorialMeta.appendChild(importance);
        }

        const ratingStars = formatExampleRatingStars(metadata.rating);
        if (ratingStars) {
            const rating = document.createElement('span');
            rating.className = 'preview-editorial-stars';
            rating.textContent = ratingStars;
            this.previewEditorialMeta.appendChild(rating);
        }

        (metadata.tags || []).slice(0, 4).forEach((tag) => {
            const tagPill = document.createElement('span');
            tagPill.className = 'preview-editorial-tag';
            tagPill.textContent = tag;
            this.previewEditorialMeta.appendChild(tagPill);
        });

        this.previewEditorialSummary.classList.remove('hidden');
    }
}

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

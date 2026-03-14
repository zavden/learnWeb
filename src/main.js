// ─── Learning App — Main Entry ──────────────────────────

import './style.css';
import { Sidebar } from './components/Sidebar.js';
import { TheoryViewer } from './components/TheoryViewer.js';
import { Editor } from './components/Editor.js';
import { ExercisePanel } from './components/ExercisePanel.js';
import { Preview } from './components/Preview.js';
import { CreateDialog } from './components/CreateDialog.js';
import { Gallery } from './components/Gallery.js';
import {
    fetchClipboardDefaultState,
    fetchVimDefaultState,
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
        this.previewWidthMode = 'full';
        this.customPreviewWidth = 375;
        this.clipboardDefaultEnabled = true;
        this.vimDefaultEnabled = true;

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
        this.previewFrame = document.getElementById('preview-frame');
        this.previewFrameContainer = document.getElementById('preview-frame-container');
        this.previewConsole = document.getElementById('preview-console');
        this.previewConsoleResizer = document.getElementById('preview-console-resizer');
        this.dragShield = document.getElementById('drag-shield');
        this.viewportSelect = document.getElementById('viewport-select');
        this.viewportSlider = document.getElementById('viewport-slider');
        this.viewportWidthDisplay = document.getElementById('viewport-width-display');

        // Initialize components
        this.preview = new Preview({
            onCompileStateChange: (diagnostics) => {
                this.editor?.setCompileDiagnostics(diagnostics);
            },
            onRequestShaderUniformEdit: (uniformName) => {
                this.editor?.openShaderUniformDialog?.(uniformName);
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
                this.preview.update(documentModel, {
                    sessionKey: this._getPreviewSessionKey(documentModel),
                });
            },
            onExerciseStateChange: (presentation) => this.exercisePanel.render(presentation),
            onSessionStateChange: () => this._persistSessionState(),
            onTogglePreviewAutoRender: () => this.preview.toggleAutoRender(),
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

        this.theoryViewer = new TheoryViewer();

        this.sidebar = new Sidebar({
            onClipboardDefaultToggle: (enabled) => this._handleClipboardDefaultToggle(enabled),
            onTopicSelect: (path, label) => this.selectTopic(path, label),
            onCreateClick: (topicPath) => this.openCreateDialog(topicPath),
            onVimDefaultToggle: (enabled) => this._handleVimDefaultToggle(enabled),
        });

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
        this._bootstrap().catch((error) => {
            console.error('Failed to bootstrap application state.', error);
        });
    }

    async _bootstrap() {
        await this.sidebar.load();
        await this._restoreSessionState();
        await this._loadClipboardDefaultState();
        await this._loadVimDefaultState();
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

    async _loadVimDefaultState() {
        try {
            const state = await fetchVimDefaultState();
            this.vimDefaultEnabled = state?.enabled !== false;
            this.sidebar.setVimDefaultEnabled(this.vimDefaultEnabled);
            this.editor.setGlobalVimDefaultEnabled(this.vimDefaultEnabled, { showToast: false });
            this._persistSessionState();
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

        if (persist) {
            this._persistSessionState();
        }
    }

    async loadExample(filename, { persist = true } = {}) {
        this.showEditor();
        await this.editor.loadExample(filename);

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
    }

    showEditor() {
        this.galleryView.classList.add('hidden');
        this.editorToolbar.classList.remove('hidden');
        this.editorPanels.classList.remove('hidden');
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
        const previewHeaderHeight = this.previewHeader?.getBoundingClientRect().height || 40;
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

    _applyFullPreviewWidth({ persist = true } = {}) {
        if (!this.previewFrame) return;

        const columnWidth = Math.round(this.previewColumn?.getBoundingClientRect().width || this.previewMinWidth);
        this.previewFrame.style.width = '100%';
        this.previewWidthMode = 'full';
        this._syncPreviewControls(columnWidth, 'full');

        if (persist) {
            this._persistSessionState();
        }
    }

    _applyCustomPreviewWidth(width, { persist = true } = {}) {
        if (!this.previewFrame) return;

        const nextWidth = Math.max(this.previewMinWidth, Math.round(Number.parseInt(width, 10) || this.previewMinWidth));
        this.previewFrame.style.width = `${nextWidth}px`;
        this.previewWidthMode = 'custom';
        this.customPreviewWidth = nextWidth;
        this._syncPreviewControls(nextWidth, 'custom');

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
            return;
        }

        this._applyFullPreviewWidth({ persist: false });
    }

    async _restoreSessionState() {
        const sessionState = this._readSessionState();
        if (!sessionState) return;

        this._restorePreviewState(sessionState.preview || {});

        const topicPath = typeof sessionState.topicPath === 'string' ? sessionState.topicPath.trim() : '';
        if (!topicPath) {
            this.editor.restoreSessionState(sessionState.editor || {});
            this._persistSessionState();
            return;
        }

        const topic = this._findTopicByPath(topicPath);
        if (!topic) {
            this.editor.restoreSessionState(sessionState.editor || {});
            this._persistSessionState();
            return;
        }

        await this.selectTopic(topic.path, topic.label, { persist: false });
        this.editor.restoreSessionState(sessionState.editor || {});

        const exampleFilename = typeof sessionState.exampleFilename === 'string'
            ? sessionState.exampleFilename.trim()
            : '';
        if (!exampleFilename) {
            this._persistSessionState();
            return;
        }

        try {
            await this.loadExample(exampleFilename, { persist: false });
            this.editor.restoreSessionState(sessionState.editor || {});
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
}

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

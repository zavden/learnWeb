// ─── Learning App — Main Entry ──────────────────────────

import './style.css';
import { Sidebar } from './components/Sidebar.js';
import { TheoryViewer } from './components/TheoryViewer.js';
import { Editor } from './components/Editor.js';
import { Preview } from './components/Preview.js';
import { CreateDialog } from './components/CreateDialog.js';
import { Gallery } from './components/Gallery.js';

class App {
    constructor() {
        this.currentTopicPath = null;
        this.sidebarMinWidth = 220;
        this.sidebarMaxWidth = 520;
        this.workspaceMinEditorWidth = 280;
        this.previewMinWidth = 320;
        this.sidebarWidthStorageKey = 'learncode.sidebar.width';
        this.sidebarCollapsedStorageKey = 'learncode.sidebar.collapsed';
        this.previewWidthMode = 'full';
        this.customPreviewWidth = 375;

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
        this.previewColumn = document.getElementById('preview-column');
        this.previewFrame = document.getElementById('preview-frame');
        this.viewportSelect = document.getElementById('viewport-select');
        this.viewportSlider = document.getElementById('viewport-slider');
        this.viewportWidthDisplay = document.getElementById('viewport-width-display');

        // Initialize components
        this.preview = new Preview({
            onCompileStateChange: (diagnostics) => {
                this.editor?.setCompileDiagnostics(diagnostics);
            },
        });

        this.editor = new Editor({
            onCodeChange: (documentModel) => this.preview.update(documentModel),
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
            onTopicSelect: (path, label) => this.selectTopic(path, label),
            onCreateClick: (topicPath) => this.openCreateDialog(topicPath),
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

        // Initial load
        this.sidebar.load();
        this._initSidebarControls();
        this._initViewportResizer();
        this._initWorkspaceResizer();
    }

    async selectTopic(topicPath, label) {
        this.currentTopicPath = topicPath;

        // Update components
        this.editor.setTopicPath(topicPath);
        this.preview.setTopicPath(topicPath);
        this.gallery.currentTopicPath = topicPath;

        // Load theory content
        this.theoryViewer.load(topicPath);

        await this.gallery.load(topicPath);
        this.showGallery();
    }

    async loadExample(filename) {
        this.showEditor();
        await this.editor.loadExample(filename);
    }

    showGallery() {
        this.galleryView.classList.remove('hidden');
        this.editorToolbar.classList.add('hidden');
        this.editorPanels.classList.add('hidden');
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

    _startSidebarResize(event) {
        if (this.appShell.classList.contains('sidebar-collapsed')) return;

        event.preventDefault();

        const startX = event.clientX;
        const startWidth = this.sidebarElement.getBoundingClientRect().width;
        let nextWidth = startWidth;

        this.sidebarResizer.classList.add('resizing');
        document.body.classList.add('is-resizing-sidebar');

        const onMouseMove = (moveEvent) => {
            nextWidth = startWidth + (moveEvent.clientX - startX);
            this._setSidebarWidth(nextWidth, { persist: false });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            this.sidebarResizer.classList.remove('resizing');
            document.body.classList.remove('is-resizing-sidebar');
            this._setSidebarWidth(nextWidth);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    _initWorkspaceResizer() {
        if (!this.workspaceElement || !this.workspaceResizer || !this.previewColumn) return;

        const initialWidth = Math.round(this.previewColumn.getBoundingClientRect().width || 640);
        this._setPreviewColumnWidth(initialWidth);
        this._applyFullPreviewWidth();

        this.workspaceResizer.addEventListener('mousedown', (event) => this._startWorkspaceResize(event));

        window.addEventListener('resize', () => {
            if (this.previewWidthMode === 'full') {
                this._applyFullPreviewWidth();
            } else {
                this._applyCustomPreviewWidth(this.customPreviewWidth);
            }
        });
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

    _setPreviewColumnWidth(width) {
        const { min, max } = this._getWorkspaceBounds();
        const nextWidth = Math.max(min, Math.min(max, Math.round(Number(width) || min)));
        this.appShell.style.setProperty('--preview-column-width', `${nextWidth}px`);
        return nextWidth;
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

    _applyFullPreviewWidth() {
        if (!this.previewFrame) return;

        const columnWidth = Math.round(this.previewColumn?.getBoundingClientRect().width || this.previewMinWidth);
        this.previewFrame.style.width = '100%';
        this.previewWidthMode = 'full';
        this._syncPreviewControls(columnWidth, 'full');
    }

    _applyCustomPreviewWidth(width) {
        if (!this.previewFrame) return;

        const nextWidth = Math.max(this.previewMinWidth, Math.round(Number.parseInt(width, 10) || this.previewMinWidth));
        this.previewFrame.style.width = `${nextWidth}px`;
        this.previewWidthMode = 'custom';
        this.customPreviewWidth = nextWidth;
        this._syncPreviewControls(nextWidth, 'custom');
    }

    _startWorkspaceResize(event) {
        if (!this.workspaceResizer || !this.previewColumn) return;

        event.preventDefault();

        const startX = event.clientX;
        const startWidth = this.previewColumn.getBoundingClientRect().width;
        let nextWidth = startWidth;

        this.workspaceResizer.classList.add('resizing');
        document.body.classList.add('is-resizing-workspace');

        const onMouseMove = (moveEvent) => {
            nextWidth = startWidth - (moveEvent.clientX - startX);
            this._setPreviewColumnWidth(nextWidth);
            if (this.previewWidthMode === 'full') {
                this._applyFullPreviewWidth();
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            this.workspaceResizer.classList.remove('resizing');
            document.body.classList.remove('is-resizing-workspace');
            this._setPreviewColumnWidth(nextWidth);
            if (this.previewWidthMode === 'full') {
                this._applyFullPreviewWidth();
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
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

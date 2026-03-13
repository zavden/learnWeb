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

        // UI Elements for View Switching
        this.galleryView = document.getElementById('gallery-view');
        this.editorToolbar = document.querySelector('.editor-toolbar');
        this.editorPanels = document.querySelector('.editor-panels');
        this.previewColumn = document.getElementById('preview-column');

        // Initialize components
        this.preview = new Preview();

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
        this._initViewportResizer();
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
        const viewportSelect = document.getElementById('viewport-select');
        const slider = document.getElementById('viewport-slider');
        const display = document.getElementById('viewport-width-display');
        const previewFrame = document.getElementById('preview-frame');

        if (!viewportSelect || !slider || !display || !previewFrame) return;

        const updatePreview = (width) => {
            previewFrame.style.width = width;
            if (width === '100%') {
                display.textContent = 'Full';
                slider.value = slider.max;
            } else {
                const px = parseInt(width, 10);
                display.textContent = `${px}px`;
                slider.value = px;
            }
        };

        viewportSelect.addEventListener('change', (e) => {
            updatePreview(e.target.value);
        });

        slider.addEventListener('input', (e) => {
            const px = e.target.value;
            previewFrame.style.width = `${px}px`;
            display.textContent = `${px}px`;
            viewportSelect.value = 'custom';
        });
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

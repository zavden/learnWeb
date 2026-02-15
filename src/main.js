// ─── Learning App — Main Entry ──────────────────────────

import './style.css';
import { Sidebar } from './components/Sidebar.js';
import { TheoryViewer } from './components/TheoryViewer.js';
import { Editor } from './components/Editor.js';
import { Preview } from './components/Preview.js';
import { CreateDialog } from './components/CreateDialog.js';

class App {
    constructor() {
        this.currentTopicPath = null;

        // Initialize components
        this.preview = new Preview();

        this.editor = new Editor({
            onCodeChange: (code) => this.preview.update(code),
        });

        this.theoryViewer = new TheoryViewer();

        this.sidebar = new Sidebar({
            onTopicSelect: (path, label) => this.selectTopic(path, label),
            onCreateClick: () => this.openCreateDialog(),
        });

        this.createDialog = new CreateDialog({
            onCreated: () => this.sidebar.load(),
        });

        // Initial load
        this.sidebar.load();

        this._initViewportResizer();
    }

    async selectTopic(topicPath, label) {
        this.currentTopicPath = topicPath;

        // Update editor and preview topic
        this.editor.setTopicPath(topicPath);
        this.preview.setTopicPath(topicPath);

        // Load theory content
        await this.theoryViewer.load(topicPath);

        // Load first example into editor
        await this.editor.loadFirstExample();
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

    openCreateDialog() {
        const tree = this.sidebar.getTree();
        this.createDialog.open(tree);
    }
}

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

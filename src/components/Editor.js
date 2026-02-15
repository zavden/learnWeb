// ─── Code Editor Component (CodeMirror 6) ───────────────

import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';

import { fetchExamples, fetchExample, saveExample, modifyExample, removeExample, renameExample } from '../utils/api.js';
import { parseExampleMd, buildExampleMd } from '../utils/markdown.js';

export class Editor {
    constructor({ onCodeChange, onRename }) {
        this.onCodeChange = onCodeChange;
        this.onRename = onRename;
        this.currentTopicPath = null;
        this.currentFilename = null; // Track loaded filename

        this.htmlEditor = null;
        this.cssEditor = null;
        this.jsEditor = null;

        this.btnSave = document.getElementById('btn-save');
        this.btnLoad = document.getElementById('btn-load');
        this.btnModify = document.getElementById('btn-modify');
        this.btnRemove = document.getElementById('btn-remove');
        this.btnRename = document.getElementById('btn-rename');
        this.filenameDisplay = document.getElementById('current-filename');
        this.loadDropdown = document.getElementById('load-dropdown');
        this.loadList = document.getElementById('load-list');

        this._initEditors();
        this._initButtons();
        this._initShortcuts();
        this._initPanelControls();
    }

    _initShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this._handleModify();
            }
        });
    }

    _initPanelControls() {
        // Collapse logic
        document.querySelectorAll('.btn-collapse').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Handle click on button or SVG inside it
                const button = e.target.closest('.btn-collapse');
                if (!button) return;

                const panel = button.closest('.editor-panel');
                if (panel) {
                    panel.classList.toggle('collapsed');
                }
            });
        });

        // Font size logic
        let fontSize = 13;
        const minFont = 10;
        const maxFont = 24;
        const updateFont = (delta) => {
            fontSize = Math.max(minFont, Math.min(maxFont, fontSize + delta));
            document.documentElement.style.setProperty('--editor-font-size', `${fontSize}px`);
        };

        const btnInc = document.getElementById('btn-font-inc');
        const btnDec = document.getElementById('btn-font-dec');

        if (btnInc && btnDec) {
            btnInc.addEventListener('click', () => updateFont(1));
            btnDec.addEventListener('click', () => updateFont(-1));
        }
    }

    _createEditor(container, langExtension) {
        const updateListener = EditorView.updateListener.of((update) => {
            if (update.docChanged) {
                this._triggerChange();
            }
        });

        const state = EditorState.create({
            doc: '',
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
                    ...searchKeymap,
                    indentWithTab,
                ]),
                langExtension,
                oneDark,
                updateListener,
                EditorView.theme({
                    '&': { height: '100%' },
                    '.cm-scroller': { overflow: 'auto' },
                }),
            ],
        });

        return new EditorView({ state, parent: container });
    }

    _initEditors() {
        this.htmlEditor = this._createEditor(document.getElementById('editor-html'), html());
        this.cssEditor = this._createEditor(document.getElementById('editor-css'), css());
        this.jsEditor = this._createEditor(document.getElementById('editor-js'), javascript());
    }

    _initButtons() {
        // Save button - creates new file
        this.btnSave.addEventListener('click', async () => {
            if (!this.currentTopicPath) return;
            const content = buildExampleMd(this.getHTML(), this.getCSS(), this.getJS());
            try {
                const result = await saveExample(this.currentTopicPath, content);
                this._showToast(`Saved: ${result.filename}`, 'success');
                // Update current filename and enable modify/remove/rename
                this.currentFilename = result.filename;
                this._updateButtonStates();
                this._updateFilenameDisplay();
            } catch (err) {
                console.error(err);
                this._showToast('Failed to save', 'error');
            }
        });

        // Modify button - updates current file
        this.btnModify.addEventListener('click', () => this._handleModify());

        // Remove button - deletes current file
        this.btnRemove.addEventListener('click', async () => {
            if (!this.currentTopicPath || !this.currentFilename) return;
            const confirmDelete = confirm(`Delete "${this.currentFilename}"?`);
            if (!confirmDelete) return;

            try {
                await removeExample(this.currentTopicPath, this.currentFilename);
                this._showToast(`Deleted: ${this.currentFilename}`, 'success');

                // Clear editor and reset state
                this.currentFilename = null;
                this.setContent('<h1>Hello World</h1>', 'h1 {\n  color: #58a6ff;\n}', 'console.log("Ready");');
                this._updateButtonStates();
                this._updateFilenameDisplay();
            } catch (err) {
                console.error(err);
                this._showToast(`Delete failed: ${err.message}`, 'error');
            }
        });

        // Rename button - renames current file
        this.btnRename.addEventListener('click', async () => {
            if (!this.currentTopicPath || !this.currentFilename) return;
            const newName = prompt('Enter new filename:', this.currentFilename);
            if (!newName || newName === this.currentFilename) return;

            // Ensure .md extension
            const newFilename = newName.endsWith('.md') ? newName : `${newName}.md`;

            try {
                await renameExample(this.currentTopicPath, this.currentFilename, newFilename);
                this._showToast(`Renamed to: ${newFilename}`, 'success');
                const oldName = this.currentFilename;
                this.currentFilename = newFilename;
                this._updateFilenameDisplay();
                if (this.onRename) this.onRename(newFilename, oldName);
            } catch (err) {
                console.error(err);
                this._showToast(`Rename failed: ${err.message}`, 'error');
            }
        });

        // Load button toggle
        this.btnLoad.addEventListener('click', async () => {
            if (!this.currentTopicPath) return;
            if (!this.loadDropdown.classList.contains('hidden')) {
                this.loadDropdown.classList.add('hidden');
                return;
            }
            await this._populateLoadList();
            this.loadDropdown.classList.remove('hidden');
        });

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!this.btnLoad.contains(e.target) && !this.loadDropdown.contains(e.target)) {
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
        if (!data.content) return;
        const { html: h, css: c, js: j } = parseExampleMd(data.content);
        this.setContent(h, c, j);
        this.currentFilename = filename;
        this._updateButtonStates();
        this._updateFilenameDisplay();
        this._showToast(`Loaded: ${filename}`, 'success');
    }

    setTopicPath(path) {
        this.currentTopicPath = path;
        this.currentFilename = null;
        this._updateButtonStates();
        this._updateFilenameDisplay();
    }

    setContent(htmlStr, cssStr, jsStr) {
        this._setValue(this.htmlEditor, htmlStr);
        this._setValue(this.cssEditor, cssStr);
        this._setValue(this.jsEditor, jsStr);
        this._triggerChange();
    }

    _setValue(editor, value) {
        editor.dispatch({
            changes: {
                from: 0,
                to: editor.state.doc.length,
                insert: value,
            },
        });
    }

    _updateButtonStates() {
        const hasFile = !!this.currentFilename;
        this.btnModify.disabled = !hasFile;
        this.btnRemove.disabled = !hasFile;
        this.btnRename.disabled = !hasFile;
    }

    _updateFilenameDisplay() {
        if (this.filenameDisplay) {
            if (this.currentFilename) {
                this.filenameDisplay.textContent = this.currentFilename;
                this.filenameDisplay.classList.add('visible');
            } else {
                this.filenameDisplay.textContent = '';
                this.filenameDisplay.classList.remove('visible');
            }
        }
    }

    getHTML() { return this.htmlEditor.state.doc.toString(); }
    getCSS() { return this.cssEditor.state.doc.toString(); }
    getJS() { return this.jsEditor.state.doc.toString(); }

    _triggerChange() {
        this.onCodeChange({
            html: this.getHTML(),
            css: this.getCSS(),
            js: this.getJS(),
        });
    }

    _showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    async _handleModify() {
        if (!this.currentTopicPath || !this.currentFilename) return;
        const content = buildExampleMd(this.getHTML(), this.getCSS(), this.getJS());
        try {
            await modifyExample(this.currentTopicPath, this.currentFilename, content);
            this._showToast(`Modified: ${this.currentFilename}`, 'success');
        } catch (err) {
            console.error(err);
            this._showToast(`Modify failed: ${err.message}`, 'error');
        }
    }

    async loadFirstExample() {
        if (!this.currentTopicPath) return;
        const examples = await fetchExamples(this.currentTopicPath);
        if (examples.length > 0) {
            await this.loadExample(examples[0]);
        } else {
            this.setContent(
                '<h1>Hello World</h1>',
                'h1 {\n  color: #58a6ff;\n  font-family: sans-serif;\n}',
                'console.log("Hello!");'
            );
            this.currentFilename = null;
            this._updateButtonStates();
        }
    }
}

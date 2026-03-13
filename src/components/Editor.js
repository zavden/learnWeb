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

import { getBlockDefinition } from '../config/exampleBlocks.js';
import { fetchExamples, fetchExample, saveExample, modifyExample, removeExample, renameExample } from '../utils/api.js';
import {
    buildExampleDocument,
    cloneExampleDocument,
    createEmptyExampleDocument,
    hasBlockingDiagnostics,
    parseExampleDocument,
} from '../utils/markdown.js';

export class Editor {
    constructor({ onCodeChange, onRename }) {
        this.onCodeChange = onCodeChange;
        this.onRename = onRename;

        this.currentTopicPath = null;
        this.currentFilename = null;
        this.currentDocument = createEmptyExampleDocument();
        this.compileDiagnostics = [];
        this.editors = [];
        this.fontSize = 13;

        this.panelsContainer = document.querySelector('.editor-panels');
        this.btnSave = document.getElementById('btn-save');
        this.btnLoad = document.getElementById('btn-load');
        this.btnModify = document.getElementById('btn-modify');
        this.btnRemove = document.getElementById('btn-remove');
        this.btnRename = document.getElementById('btn-rename');
        this.filenameDisplay = document.getElementById('current-filename');
        this.statusDisplay = document.getElementById('editor-status');
        this.loadDropdown = document.getElementById('load-dropdown');
        this.loadList = document.getElementById('load-list');

        this._initButtons();
        this._initShortcuts();
        this._initPanelControls();
        this._applyDocument(createEmptyExampleDocument(), { notify: false });
    }

    _initShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                this._handleModify();
            }
        });
    }

    _initPanelControls() {
        const btnInc = document.getElementById('btn-font-inc');
        const btnDec = document.getElementById('btn-font-dec');
        const btnAuto = document.getElementById('btn-auto-fit');

        if (btnInc && btnDec) {
            btnInc.addEventListener('click', () => this._updateFontSize(1));
            btnDec.addEventListener('click', () => this._updateFontSize(-1));
        }

        if (btnAuto) {
            btnAuto.addEventListener('click', () => this._handleAutoFit());
        }
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
                this._showToast(`Saved: ${result.filename}`, 'success');
            } catch (err) {
                console.error(err);
                this._showToast(`Failed to save: ${err.message}`, 'error');
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
                this._showToast('Example deleted', 'success');
            } catch (err) {
                console.error(err);
                this._showToast(`Delete failed: ${err.message}`, 'error');
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
                this._showToast(`Renamed to: ${newFilename}`, 'success');
                if (this.onRename) this.onRename(newFilename, oldFilename);
            } catch (err) {
                console.error(err);
                this._showToast(`Rename failed: ${err.message}`, 'error');
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
        if (!data?.content) return;

        const documentModel = parseExampleDocument(data.content);
        this.currentFilename = filename;
        this._applyDocument(documentModel);
        this._updateButtonStates();
        this._updateFilenameDisplay();

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
        this._applyDocument(createEmptyExampleDocument(), { notify: false });
        this._updateButtonStates();
        this._updateFilenameDisplay();
    }

    _applyDocument(documentModel, { notify = true } = {}) {
        this.currentDocument = cloneExampleDocument(documentModel);
        this.compileDiagnostics = [];
        this._renderPanels();
        this._updateStatus();
        this._updateButtonStates();

        if (notify) {
            this._triggerChange();
        }
    }

    _renderPanels() {
        this._destroyEditors();
        this.panelsContainer.innerHTML = '';

        if (this.currentDocument.blocks.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'editor-empty-state';
            empty.textContent = 'Select an example from the gallery to begin.';
            this.panelsContainer.appendChild(empty);
            return;
        }

        this.currentDocument.blocks.forEach((block, index) => {
            const definition = getBlockDefinition(block.type);
            const panel = document.createElement('div');
            panel.className = 'editor-panel';
            panel.dataset.slot = block.slot;
            panel.dataset.type = block.type;
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

            const badge = document.createElement('span');
            badge.className = `lang-badge ${definition.badgeClass}`;
            badge.textContent = definition.badgeLabel;

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

            const editorHost = document.createElement('div');
            editorHost.className = 'panel-editor';

            header.appendChild(btnCollapse);
            header.appendChild(badge);
            header.appendChild(btnMaximize);
            panel.appendChild(header);
            panel.appendChild(editorHost);
            this.panelsContainer.appendChild(panel);

            const view = this._createEditor(editorHost, block);

            btnCollapse.addEventListener('click', (e) => {
                e.stopPropagation();
                panel.classList.toggle('collapsed');
            });

            btnMaximize.addEventListener('click', (e) => {
                e.stopPropagation();
                this._toggleMaximize(panel);
            });

            header.addEventListener('mousedown', (e) => {
                if (index === 0 || e.target.closest('button')) return;
                this._startResize(panel.previousElementSibling, panel, e);
            });

            this.editors.push({
                id: block.id,
                slot: block.slot,
                type: block.type,
                panel,
                view,
            });
        });
    }

    _destroyEditors() {
        this.editors.forEach((entry) => entry.view.destroy());
        this.editors = [];
    }

    _createEditor(container, block) {
        const langExtensions = this._getLanguageExtensions(block.type);
        const updateListener = EditorView.updateListener.of((update) => {
            if (!update.docChanged) return;
            this._setBlockContent(block.id, update.state.doc.toString());
            this._triggerChange();
        });

        const state = EditorState.create({
            doc: block.content || '',
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
                updateListener,
                EditorView.theme({
                    '&': { height: '100%' },
                    '.cm-scroller': { overflow: 'auto' },
                }),
            ],
        });

        return new EditorView({ state, parent: container });
    }

    _getLanguageExtensions(type) {
        switch (type) {
            case 'html':
            case 'svg':
                return [html()];
            case 'pug':
                return [];
            case 'css':
            case 'scss':
            case 'sass':
                return [css()];
            case 'javascript':
                return [javascript()];
            case 'typescript':
                return [javascript({ typescript: true })];
            default:
                return [];
        }
    }

    _setBlockContent(blockId, content) {
        const block = this.currentDocument.blocks.find((entry) => entry.id === blockId);
        if (!block) return;
        block.content = content;
        this.currentDocument.sessionId = this.currentDocument.blocks.map((entry) => entry.type).join('-');
    }

    _getPanels() {
        return Array.from(this.panelsContainer.querySelectorAll('.editor-panel'));
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

        const containerHeight = this.panelsContainer.getBoundingClientRect().height;
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
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    _handleAutoFit() {
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
        const availableHeight = this.panelsContainer.getBoundingClientRect().height;

        const neededHeights = this.editors.map((entry) => {
            const lines = entry.view.state.doc.lines;
            return (lines * lineHeight) + headerHeight + scrollbarPadding;
        });

        const totalNeeded = neededHeights.reduce((sum, value) => sum + value, 0);

        if (totalNeeded <= availableHeight) {
            panels.forEach((panel, index) => {
                panel.style.flex = `${neededHeights[index]} 1 0px`;
            });
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
    }

    _updateButtonStates() {
        const hasFile = Boolean(this.currentFilename);
        const hasTopic = Boolean(this.currentTopicPath);
        const hasBlocks = this.currentDocument.blocks.length > 0;
        const isSafeToWrite = !hasBlockingDiagnostics(this.currentDocument);

        this.btnSave.disabled = !hasTopic || !hasBlocks || !isSafeToWrite;
        this.btnLoad.disabled = !hasTopic;
        this.btnModify.disabled = !hasFile || !isSafeToWrite;
        this.btnRemove.disabled = !hasFile;
        this.btnRename.disabled = !hasFile;
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
        const structuralErrors = structuralDiagnostics.filter((diagnostic) => diagnostic.level === 'error');
        const structuralWarnings = structuralDiagnostics.filter((diagnostic) => diagnostic.level !== 'error');
        const diagnostics = structuralErrors.length > 0
            ? structuralErrors
            : (this.compileDiagnostics.length > 0 ? this.compileDiagnostics : structuralWarnings);

        if (diagnostics.length === 0) {
            this.statusDisplay.textContent = '';
            this.statusDisplay.className = 'editor-status hidden';
            return;
        }

        const primary = diagnostics[0];
        const remainder = diagnostics.length - 1;
        const suffix = remainder > 0 ? ` (+${remainder} more)` : '';

        this.statusDisplay.textContent = `${primary.message}${suffix}`;
        this.statusDisplay.className = `editor-status ${primary.level === 'error' ? 'error' : 'warning'}`;
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
        } catch (err) {
            console.error(err);
            this._showToast(`Modify failed: ${err.message}`, 'error');
        }
    }
}

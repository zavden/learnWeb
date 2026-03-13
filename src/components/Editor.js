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
    synchronizeDocument,
    updateDocumentFileContent,
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
        this.layoutModeStorageKey = 'learncode.editor.layout';
        this.layoutMode = this._readLayoutMode();
        this.activeFileId = null;

        this.workspace = document.querySelector('.editor-panels');
        this.btnSave = document.getElementById('btn-save');
        this.btnLoad = document.getElementById('btn-load');
        this.btnModify = document.getElementById('btn-modify');
        this.btnRemove = document.getElementById('btn-remove');
        this.btnRename = document.getElementById('btn-rename');
        this.btnLayout = document.getElementById('btn-editor-layout');
        this.btnAutoFit = document.getElementById('btn-auto-fit');
        this.filenameDisplay = document.getElementById('current-filename');
        this.statusDisplay = document.getElementById('editor-status');
        this.loadDropdown = document.getElementById('load-dropdown');
        this.loadList = document.getElementById('load-list');

        this._initButtons();
        this._initShortcuts();
        this._initPanelControls();
        this._initLayoutControls();
        this._updateFontSize(0);
        this._applyDocument(createEmptyExampleDocument(), { notify: false });
    }

    _readLayoutMode() {
        const stored = window.localStorage.getItem(this.layoutModeStorageKey);
        return stored === 'tabs' ? 'tabs' : 'panels';
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
        this.currentDocument = synchronizeDocument(cloneExampleDocument(documentModel));
        this.compileDiagnostics = [];
        this._ensureActiveFile();
        this._renderWorkspace();
        this._updateStatus();
        this._updateButtonStates();

        if (notify) {
            this._triggerChange();
        }
    }

    _ensureActiveFile() {
        const files = this.currentDocument.files || [];

        if (files.length === 0) {
            this.activeFileId = null;
            return;
        }

        if (!files.some((file) => file.id === this.activeFileId)) {
            this.activeFileId = files[0].id;
        }
    }

    _setLayoutMode(mode, { persist = true, rerender = true } = {}) {
        this.layoutMode = mode === 'tabs' ? 'tabs' : 'panels';

        if (persist) {
            window.localStorage.setItem(this.layoutModeStorageKey, this.layoutMode);
        }

        this._updateLayoutButton();
        this._updatePanelControlStates();

        if (rerender) {
            this._renderWorkspace();
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
        this.btnAutoFit.disabled = this.layoutMode !== 'panels' || (this.currentDocument.files || []).length === 0;
    }

    _renderWorkspace() {
        this._destroyEditors();
        this.workspace.innerHTML = '';
        this.workspace.dataset.layoutMode = this.layoutMode;
        this._ensureActiveFile();

        if ((this.currentDocument.files || []).length === 0) {
            const empty = document.createElement('div');
            empty.className = 'editor-empty-state';
            empty.textContent = 'Select an example from the gallery to begin.';
            this.workspace.appendChild(empty);
            this._updatePanelControlStates();
            return;
        }

        if (this.layoutMode === 'tabs') {
            this._renderTabsLayout();
        } else {
            this._renderPanelsLayout();
        }

        this._updatePanelControlStates();
    }

    _renderPanelsLayout() {
        const stack = document.createElement('div');
        stack.className = 'editor-panels-stack';

        this.currentDocument.files.forEach((file, index) => {
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
            });

            btnMaximize.addEventListener('click', (event) => {
                event.stopPropagation();
                this._toggleMaximize(panel);
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
    }

    _renderTabsLayout() {
        const layout = document.createElement('div');
        layout.className = 'editor-tabs-layout';

        const header = document.createElement('div');
        header.className = 'editor-tabs-header';

        const nav = document.createElement('div');
        nav.className = 'editor-tabs-nav';

        this.currentDocument.files.forEach((file) => {
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
            });

            nav.appendChild(tab);
        });

        const menu = document.createElement('div');
        menu.className = 'editor-file-menu';

        const select = document.createElement('select');
        select.className = 'editor-file-select';
        select.setAttribute('aria-label', 'Select file');

        this.currentDocument.files.forEach((file) => {
            const option = document.createElement('option');
            option.value = file.id;
            option.textContent = file.path;
            option.selected = file.id === this.activeFileId;
            select.appendChild(option);
        });

        select.addEventListener('change', (event) => {
            this.activeFileId = event.target.value;
            this._renderWorkspace();
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
        return this.currentDocument.files.find((file) => file.id === this.activeFileId) || this.currentDocument.files[0];
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
            case 'jsx':
                return [javascript({ jsx: true })];
            case 'tsx':
                return [javascript({ jsx: true, typescript: true })];
            case 'html':
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
        const hasContent = (this.currentDocument.files || []).length > 0;
        const isSafeToWrite = !hasBlockingDiagnostics(this.currentDocument);

        this.btnSave.disabled = !hasTopic || !hasContent || !isSafeToWrite;
        this.btnLoad.disabled = !hasTopic;
        this.btnModify.disabled = !hasFile || !isSafeToWrite;
        this.btnRemove.disabled = !hasFile;
        this.btnRename.disabled = !hasFile;
        this._updatePanelControlStates();
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
        } catch (error) {
            console.error(error);
            this._showToast(`Modify failed: ${error.message}`, 'error');
        }
    }
}

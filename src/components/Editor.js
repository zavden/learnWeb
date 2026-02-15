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
        this._initResizers();
        this._initPanelControls();
        this._initMaximizeButtons();
    }

    _initShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this._handleModify();
            }
        });
    }

    _initResizers() {
        const setupResizer = (headerId, prevPanelId) => {
            const currentPanel = document.querySelector(headerId);
            const header = currentPanel ? currentPanel.querySelector('.panel-header') : null;
            const prevPanel = document.getElementById(prevPanelId);
            const container = document.querySelector('.editor-panels');

            if (!header || !prevPanel || !currentPanel || !container) return;

            header.addEventListener('mousedown', (e) => {
                // Ignore if clicking buttons
                if (e.target.closest('button')) return;

                e.preventDefault();

                // FORCE RESET: If user drags, we exit "Maximized" or "Collapsed" modes
                // Remove .collapsed from ALL panels to allow free resizing
                document.querySelectorAll('.editor-panel').forEach(p => {
                    p.classList.remove('collapsed');
                });

                const startY = e.clientY;
                const totalHeight = container.getBoundingClientRect().height;
                const panels = document.querySelectorAll('.editor-panel');

                // 1. Calculate ratios based on current pixel usage (which might have just changed if we removed .collapsed)
                // We must recalculate sizes after removing classes, might need a micro-tick or just force layout
                // But getting BCR immediately after class removal usually works in modern browsers

                const startRatios = new Map();
                let currentTotalRatio = 0;

                panels.forEach(p => {
                    const h = p.getBoundingClientRect().height;
                    const ratio = h / totalHeight;
                    startRatios.set(p.id, ratio);
                    currentTotalRatio += ratio;
                });

                // Normalize if they result in weird sums (e.g. if we just uncollapsed 32px panels)
                // If we don't normalize, flex-direction column might leave gaps if sum < 1 (actually flex grows to fill, but let's be precise)
                // Actually, if we set flex-grow, they will fill regardless of sum, unless sum is very small ??
                // Better to normalize to 1 for sanity

                if (currentTotalRatio > 0) {
                    panels.forEach(p => {
                        const raw = startRatios.get(p.id);
                        const normalized = raw / currentTotalRatio;
                        p.style.flex = `${normalized} 1 0px`;
                        p.style.height = '';
                        startRatios.set(p.id, normalized);
                    });
                }

                const startRatioPrev = startRatios.get(prevPanel.id);
                const startRatioCurr = startRatios.get(currentPanel.id);
                // Min pixel height / total height
                const minRatio = 32 / totalHeight;

                const onMouseMove = (MoveEvent) => {
                    const deltaPixels = MoveEvent.clientY - startY;
                    const deltaRatio = deltaPixels / totalHeight;

                    let newRatioPrev = startRatioPrev + deltaRatio;
                    let newRatioCurr = startRatioCurr - deltaRatio;

                    if (newRatioPrev < minRatio) {
                        const correction = minRatio - newRatioPrev;
                        newRatioPrev += correction;
                        newRatioCurr -= correction;
                    }
                    if (newRatioCurr < minRatio) {
                        const correction = minRatio - newRatioCurr;
                        newRatioCurr += correction;
                        newRatioPrev -= correction;
                    }

                    prevPanel.style.flex = `${newRatioPrev} 1 0px`;
                    currentPanel.style.flex = `${newRatioCurr} 1 0px`;
                };

                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
        };

        setupResizer('#panel-css', 'panel-html');
        setupResizer('#panel-js', 'panel-css');
    }

    _initMaximizeButtons() {
        // "Maximize" means collapsing the OTHER two panels
        const panels = ['panel-html', 'panel-css', 'panel-js'];

        panels.forEach(panelId => {
            const panel = document.getElementById(panelId);
            if (!panel) return;

            const btnMax = panel.querySelector('.btn-maximize');
            if (!btnMax) return;

            btnMax.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent drag start if near header

                // Check if this panel is already maximized (others are collapsed)
                const others = panels.filter(p => p !== panelId).map(id => document.getElementById(id));
                const allOthersCollapsed = others.every(p => p.classList.contains('collapsed'));

                if (allOthersCollapsed) {
                    // RESTORE: Remove collapsed from everyone and reset flex to equal
                    panels.forEach(id => {
                        const p = document.getElementById(id);
                        p.classList.remove('collapsed');
                        // Reset to equal distribution to avoid "black void" issues
                        // We lose custom ratios, but it guarantees a clean state
                        p.style.flex = '1 1 0px';
                        p.style.height = '';
                    });
                } else {
                    // MAXIMIZE: Collapse others, expand current
                    // We use flex-grow to ensure the maximized panel takes all available space
                    // Collapsed panels are handled by CSS (flex: 0 0 32px !important)
                    others.forEach(p => {
                        p.classList.add('collapsed');
                        p.style.flex = ''; // Let CSS class handle it
                    });

                    panel.classList.remove('collapsed');
                    // Give it a huge flex grow to dominate any remaining space logic
                    panel.style.flex = '1 1 0px';
                    panel.style.height = '';
                }
            });
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
        const btnAuto = document.getElementById('btn-auto-fit');

        if (btnInc && btnDec) {
            btnInc.addEventListener('click', () => updateFont(1));
            btnDec.addEventListener('click', () => updateFont(-1));
        }

        if (btnAuto) {
            btnAuto.addEventListener('click', () => {
                this._handleAutoFit(fontSize);
            });
        }
    }

    _handleAutoFit(currentFontSize) {
        // Reset all panels first
        const panels = ['panel-html', 'panel-css', 'panel-js'].map(id => document.getElementById(id));
        panels.forEach(p => {
            p.classList.remove('collapsed');
            p.style.height = '';
        });

        // Get editors
        const editors = [this.htmlEditor, this.cssEditor, this.jsEditor];

        // Calculate needed pixels for each
        // Line height is approx 1.6em. We add padding/margin safety.
        const lineHeight = currentFontSize * 1.6;
        const headerHeight = 32;
        const scrollbarPadding = 20; // Extra space for horizontal Scrollbar if needed

        const neededHeights = editors.map(editor => {
            const lines = editor.state.doc.lines;
            return (lines * lineHeight) + headerHeight + scrollbarPadding;
        });

        // Get total available height
        const container = document.querySelector('.editor-panels');
        const availableHeight = container.getBoundingClientRect().height;
        const minPanelHeight = 32;

        const totalNeeded = neededHeights.reduce((a, b) => a + b, 0);

        if (totalNeeded <= availableHeight) {
            // Case A: Everything fits! 
            // We distribute proportionally based on needed height to fill the space
            // But usually we want them to just be their height. 
            // Flex requires we fill the space. 
            // So we use the needed heights as flex-grow weights.

            // However, if one is tiny (3 lines) and others are huge, the tiny one gets huge too in flex-grow.
            // But the user wants "see all 3". 
            // Proportional allocation based on content length is exactly what we want.
            panels.forEach((p, i) => {
                p.style.flex = `${neededHeights[i]} 1 0px`;
            });

        } else {
            // Case B: Content exceeds space. Priority: HTML > CSS > JS.
            // We implement "Waterfall Allocation" logic.

            // 1. Reserve min height for everyone
            let remainingSpace = availableHeight - (minPanelHeight * 3);
            const allocations = [minPanelHeight, minPanelHeight, minPanelHeight];

            // 2. Adjust needed to exclude what we already reserved
            // If needed < min, we don't need more.
            const extraNeeded = neededHeights.map(h => Math.max(0, h - minPanelHeight));

            // 3. Give HTML what it needs (clamped to remaining)
            const takeHtml = Math.min(extraNeeded[0], remainingSpace);
            allocations[0] += takeHtml;
            remainingSpace -= takeHtml;

            // 4. Give CSS what it needs
            if (remainingSpace > 0) {
                const takeCss = Math.min(extraNeeded[1], remainingSpace);
                allocations[1] += takeCss;
                remainingSpace -= takeCss;
            }

            // 5. Give JS the rest (if any)
            if (remainingSpace > 0) {
                // If JS needs more, it gets what's left. 
                // If it needs less, it gets what's left anyway because we must fill container.
                allocations[2] += remainingSpace;
            }

            // Apply as flex-grow based on calculated pixels
            // We use the calculated pixels as relative weights
            panels.forEach((p, i) => {
                p.style.flex = `${allocations[i]} 1 0px`;
            });
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

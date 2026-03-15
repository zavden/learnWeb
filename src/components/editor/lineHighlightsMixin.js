import { HIGHLIGHT_COLORS } from '../../config/highlightColors.js';
import { parseHighlights, serializeHighlights } from '../../utils/highlights.js';
import {
    addLineHighlightEffect,
    getHighlightsByLine,
    setAllHighlightsEffect,
} from './lineHighlightExtension.js';

export { parseHighlights, serializeHighlights };

export const lineHighlightsMixin = {
    _captureHighlightsFromViews() {
        for (const entry of this.editors) {
            if (!entry.view) continue;
            const fileHighlights = getHighlightsByLine(entry.view.state);
            if (fileHighlights.size > 0) {
                this.lineHighlights.set(entry.id, fileHighlights);
            } else {
                this.lineHighlights.delete(entry.id);
            }
        }
    },

    _loadHighlightsFromDocument(documentModel) {
        const highlightsStr = String(documentModel?.metadata?.highlights || '').trim();
        this.lineHighlights = parseHighlights(highlightsStr, documentModel?.files || []);
    },

    _applyHighlightsToView(view, file) {
        if (!view || !file?.id) return;
        view.dispatch({
            effects: setAllHighlightsEffect.of(this.lineHighlights.get(file.id) || new Map()),
        });
    },

    _syncAllEditorHighlights() {
        this.editors.forEach((entry) => {
            const file = (this.currentDocument.files || []).find((item) => item.id === entry.id);
            if (!file) return;
            this._applyHighlightsToView(entry.view, file);
        });
    },

    _buildHighlightsForPersist() {
        // Start from the cached state (covers files not currently in a view)
        const result = new Map(this.lineHighlights);

        // Override with live state from currently open views
        for (const entry of this.editors) {
            if (!entry.view) continue;
            const fileHighlights = getHighlightsByLine(entry.view.state);
            if (fileHighlights.size > 0) {
                result.set(entry.id, fileHighlights);
            } else {
                result.delete(entry.id);
            }
        }

        return result;
    },

    _injectHighlightsIntoDocument(doc) {
        const highlightsStr = serializeHighlights(
            this._buildHighlightsForPersist(),
            doc.files || []
        );
        const metadata = { ...(doc.metadata || {}) };
        if (highlightsStr) {
            metadata.highlights = highlightsStr;
        } else {
            delete metadata.highlights;
        }
        return { ...doc, metadata };
    },

    // ── Highlight UI helpers ──────────────────────────────────────

    _buildHighlightColorButton() {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-icon btn-highlight-color';
        const color = HIGHLIGHT_COLORS.find((c) => c.id === this.activeHighlightColor) || HIGHLIGHT_COLORS[0];
        btn.style.setProperty('--hl-swatch-bg', color.bg);
        btn.style.setProperty('--hl-swatch-border', color.border);
        btn.title = `Highlight color: ${color.label}`;
        return btn;
    },

    _buildHighlightApplyButton() {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-icon btn-highlight-apply';
        btn.title = 'Highlight current line';
        btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
        return btn;
    },

    _applyHighlightToCurrentLine(view) {
        if (!view) return;
        const line = view.state.doc.lineAt(view.state.selection.main.head).number;
        view.dispatch({
            effects: addLineHighlightEffect.of({ line, colorId: this.activeHighlightColor }),
        });
        view.focus();
    },

    _setActiveHighlightColor(colorId) {
        this.activeHighlightColor = colorId;
        const color = HIGHLIGHT_COLORS.find((c) => c.id === colorId) || HIGHLIGHT_COLORS[0];
        document.querySelectorAll('.btn-highlight-color').forEach((btn) => {
            btn.style.setProperty('--hl-swatch-bg', color.bg);
            btn.style.setProperty('--hl-swatch-border', color.border);
            btn.title = `Highlight color: ${color.label}`;
        });
    },

    _toggleHighlightColorPicker(anchorBtn) {
        const existing = document.querySelector('.highlight-color-picker');
        if (existing) {
            existing.remove();
            if (existing._anchorBtn === anchorBtn) return;
        }

        const picker = document.createElement('div');
        picker.className = 'highlight-color-picker';
        picker._anchorBtn = anchorBtn;

        for (const color of HIGHLIGHT_COLORS) {
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'highlight-color-picker-option';
            option.style.setProperty('--picker-option-bg', color.bg);
            option.style.setProperty('--picker-option-border', color.border);
            if (color.id === this.activeHighlightColor) {
                option.classList.add('is-active');
            }
            option.title = color.label;
            option.addEventListener('click', (event) => {
                event.stopPropagation();
                this._setActiveHighlightColor(color.id);
                picker.remove();
            });
            picker.appendChild(option);
        }

        document.body.appendChild(picker);

        const rect = anchorBtn.getBoundingClientRect();
        picker.style.top = `${rect.bottom + 4}px`;
        picker.style.left = `${rect.left}px`;

        setTimeout(() => {
            const closeHandler = (event) => {
                if (!picker.contains(event.target)) {
                    picker.remove();
                    document.removeEventListener('click', closeHandler, true);
                }
            };
            document.addEventListener('click', closeHandler, true);
        }, 0);
    },
};

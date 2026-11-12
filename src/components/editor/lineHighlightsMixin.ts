// Line highlights in the editor: the colored lines a learner marks with the highlight button of each
// editor, kept per file and saved in the example's `highlights` frontmatter (`path:line:colorId,…`).
//
// `lineHighlightsMixin` is an Editor mixin: src/components/Editor.ts copies its methods onto
// `Editor.prototype`, so `this` is the Editor and the state (`lineHighlights`, `activeHighlightColor`,
// `editors`, `currentDocument`) is declared there. The CodeMirror side (the state field, its effects and
// `getHighlightsByLine`) is ./lineHighlightExtension.ts; the metadata format is src/utils/highlights.ts.
//
// Before editing:
// - While an editor is open, its CodeMirror state holds the live highlights; `lineHighlights` is only the
//   copy taken at the last capture. Every render destroys the views, so `_renderWorkspace` captures first
//   (`_captureHighlightsFromViews`) and each new view gets its lines back (`_applyHighlightsToView`).
// - `_injectHighlightsIntoDocument` writes the live highlights into a copy of a document for saving,
//   snapshots and dirty tracking; the order of files decides the metadata text, so it must stay stable.
// - Highlights are keyed by file id (`path:order`), which changes when files are added or removed.

import { HIGHLIGHT_COLORS } from '../../config/highlightColors.ts';
import { parseHighlights, serializeHighlights } from '../../utils/highlights.ts';
import {
    addLineHighlightEffect,
    getHighlightsByLine,
    setAllHighlightsEffect,
} from './lineHighlightExtension.ts';
import type { EditorView } from '@codemirror/view';
import type {
    DocumentHighlights,
    ExampleDocumentInput,
    ExampleMetadata,
    FileLineHighlights,
    HighlightColorId,
} from '../../types/document.ts';
import type { Editor, EditorDocument, EditorFile, HighlightColorPickerElement } from '../Editor.ts';

export { parseHighlights, serializeHighlights };

/** Editor mixin: line highlights and the highlight color picker (see the header). */
export const lineHighlightsMixin = {
    /** Copies the live highlights of every open editor into `lineHighlights` (files without any are dropped). */
    _captureHighlightsFromViews(): void {
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

    /** Replaces `lineHighlights` with what the document's `highlights` metadata says. */
    _loadHighlightsFromDocument(documentModel: ExampleDocumentInput | null | undefined): void {
        const highlightsStr = String(documentModel?.metadata?.highlights || '').trim();
        this.lineHighlights = parseHighlights(highlightsStr, documentModel?.files || []);
    },

    /** Shows the file's stored highlights in its editor (replacing whatever the view had). */
    _applyHighlightsToView(view: EditorView | null | undefined, file: EditorFile | null | undefined): void {
        if (!view || !file?.id) return;
        view.dispatch({
            effects: setAllHighlightsEffect.of(this.lineHighlights.get(file.id) || new Map<number, string>()),
        });
    },

    /** Pushes the stored highlights into every open editor. */
    _syncAllEditorHighlights(): void {
        this.editors.forEach((entry) => {
            const file = (this.currentDocument.files || []).find((item) => item.id === entry.id);
            if (!file) return;
            this._applyHighlightsToView(entry.view, file);
        });
    },

    /** The highlights to save: the stored ones, overridden by the live state of the open editors. */
    _buildHighlightsForPersist(): DocumentHighlights {
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

    /**
     * A shallow copy of `doc` whose `highlights` metadata holds the live highlights (the key is removed when
     * there are none). `doc` itself is not modified; a theory document stays a theory document.
     */
    _injectHighlightsIntoDocument<T extends EditorDocument>(doc: T): T {
        // Serialize in document file order so the metadata string is stable
        // (dirty tracking compares serialized documents).
        const liveHighlights = this._buildHighlightsForPersist();
        const orderedHighlights = new Map<string, FileLineHighlights>();
        (doc.files || []).forEach((file) => {
            if (liveHighlights.has(file.id)) {
                orderedHighlights.set(file.id, liveHighlights.get(file.id)!); // has() just checked
            }
        });
        const highlightsStr = serializeHighlights(
            orderedHighlights,
            doc.files || []
        );
        const metadata: ExampleMetadata = { ...(doc.metadata || {}) };
        if (highlightsStr) {
            metadata.highlights = highlightsStr;
        } else {
            delete metadata.highlights;
        }
        return { ...doc, metadata };
    },

    // ── Highlight UI helpers ──────────────────────────────────────

    /** The swatch button of an editor's toolbar, showing the active color; it opens the color picker. */
    _buildHighlightColorButton(): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-icon btn-highlight-color';
        const color = HIGHLIGHT_COLORS.find((c) => c.id === this.activeHighlightColor) || HIGHLIGHT_COLORS[0];
        btn.style.setProperty('--hl-swatch-bg', color.bg);
        btn.style.setProperty('--hl-swatch-border', color.border);
        btn.title = `Highlight color: ${color.label}`;
        return btn;
    },

    /** The pen button of an editor's toolbar: toggles a highlight on the cursor's line. */
    _buildHighlightApplyButton(): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-icon btn-highlight-apply';
        btn.title = 'Highlight current line';
        btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
        return btn;
    },

    /**
     * Highlights the line of the main cursor with the active color, or removes its highlight when it has
     * one of any color (`addLineHighlightEffect` toggles), and gives the focus back to the editor.
     */
    _applyHighlightToCurrentLine(view: EditorView | null | undefined): void {
        if (!view) return;
        const line = view.state.doc.lineAt(view.state.selection.main.head).number;
        view.dispatch({
            effects: addLineHighlightEffect.of({ line, colorId: this.activeHighlightColor }),
        });
        view.focus();
    },

    /** Makes `colorId` the active color and repaints every swatch button on the page. */
    _setActiveHighlightColor(colorId: HighlightColorId): void {
        this.activeHighlightColor = colorId;
        const color = HIGHLIGHT_COLORS.find((c) => c.id === colorId) || HIGHLIGHT_COLORS[0];
        document.querySelectorAll<HTMLButtonElement>('.btn-highlight-color').forEach((btn) => {
            btn.style.setProperty('--hl-swatch-bg', color.bg);
            btn.style.setProperty('--hl-swatch-border', color.border);
            btn.title = `Highlight color: ${color.label}`;
        });
    },

    /**
     * Opens the color picker under `anchorBtn`, or closes it when it is already open for that button.
     * Only one picker exists at a time (an open one is closed first). It closes on a pick or on a click
     * outside it; it stores `_anchorBtn` and `_close` on its element so the next toggle (and
     * `_renderWorkspace`) can close it.
     */
    _toggleHighlightColorPicker(anchorBtn: HTMLElement): void {
        const existing = document.querySelector<HighlightColorPickerElement>('.highlight-color-picker');
        if (existing) {
            const sameAnchor = existing._anchorBtn === anchorBtn;
            if (typeof existing._close === 'function') {
                existing._close();
            } else {
                existing.remove();
            }
            if (sameAnchor) return;
        }

        const picker = document.createElement('div') as HighlightColorPickerElement;
        picker.className = 'highlight-color-picker';
        picker._anchorBtn = anchorBtn;

        const closeHandler = (event: MouseEvent): void => {
            // Clicks on the anchor button are handled by the toggle itself.
            if (picker.contains(event.target as Node | null) || anchorBtn.contains(event.target as Node | null)) return;
            close();
        };

        const close = (): void => {
            picker.remove();
            document.removeEventListener('click', closeHandler, true);
        };
        picker._close = close;

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
                close();
            });
            picker.appendChild(option);
        }

        document.body.appendChild(picker);

        const rect = anchorBtn.getBoundingClientRect();
        picker.style.top = `${rect.bottom + 4}px`;
        picker.style.left = `${rect.left}px`;

        document.addEventListener('click', closeHandler, true);
    },
} satisfies ThisType<Editor>;

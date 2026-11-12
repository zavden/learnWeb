// ─── Theory Viewer Component ────────────────────────────
// The slide-over "Theory" panel (#theory-panel): shows a topic's theory (`main.md`) as HTML with its
// example embeds, and exports the page as a standalone HTML file. Created once by the app shell
// (src/main.ts), which also feeds it the editor's unsaved theory text while the user edits
// (`renderContent`). The Markdown-to-HTML work is src/utils/theoryRenderer.ts; the exercise cards and
// code embeds come from src/utils/theoryExerciseEmbeds.ts.
//
// Worth knowing before editing:
// - `_renderToken` guards against races: `load`, `renderContent` and `clear` each bump it, and an async
//   step that finds a newer token drops its result, so a slow response never overwrites a newer topic
//   (covered by tests/data-theory.test.ts).
// - Exercise cards are plain HTML inside the rendered page. Their clicks are handled by delegation on
//   the container; their live previews are filled in afterwards (`_hydrateExercisePreviewSlots`) as
//   sandboxed iframes.
// - tests/data-theory.test.ts runs this class against a minimal fake `document` (`getElementById` returning
//   objects with `addEventListener`, `classList`, `innerHTML`, `querySelectorAll`): keep the constructor,
//   `load` and `renderContent` within those members.

import { fetchTopicMain } from '../utils/api.ts';
import { byId } from '../utils/dom.ts';
import { renderTheoryExportDocument, renderTheoryHtml } from '../utils/theoryRenderer.ts';
import { loadTheoryExerciseEmbeds } from '../utils/theoryExerciseEmbeds.ts';
import type { TopicMainResponse } from '../types/api.ts';
import type { TheoryExerciseEmbeds } from '../types/theory.ts';

/** What the app shell passes to `new TheoryViewer(...)`; every callback is optional. */
export interface TheoryViewerOptions {
    /** The edit button was clicked on a loaded topic; `content` is the theory text currently shown. */
    onEditRequest?: (topicPath: string, content: string) => void;
    /** "Open" on an exercise card: open `filename` (an example of the topic) in the editor. */
    onExerciseOpenRequest?: (topicPath: string, filename: string) => void;
    /** The exercise card itself was clicked: preview `filename` in the exercise dialog. */
    onExercisePreviewRequest?: (topicPath: string, filename: string) => void;
}

/**
 * The theory panel. Wires its elements of `index.html` in the constructor; call `load(topicPath)` when a
 * topic is selected and `clear()` when none is.
 */
export class TheoryViewer {
    private readonly onEditRequest: TheoryViewerOptions['onEditRequest'];
    private readonly onExerciseOpenRequest: TheoryViewerOptions['onExerciseOpenRequest'];
    private readonly onExercisePreviewRequest: TheoryViewerOptions['onExercisePreviewRequest'];
    /** `#theory-panel`: the overlay that is shown and hidden. */
    readonly panel: HTMLElement;
    private readonly container: HTMLElement;
    /** `#btn-theory`: the button that toggles the panel (it lives in the editor toolbar, outside the panel). */
    readonly btnTheory: HTMLElement;
    private readonly btnEdit: HTMLButtonElement | null;
    private readonly btnExport: HTMLButtonElement | null;
    private readonly btnClose: HTMLElement;
    /** Theory text currently rendered (a saved `main.md`, or the editor's unsaved text); `''` when none. */
    currentContent: string;
    /** Path (`chapterId/sectionId/topicId`) of the loaded topic; `''` when none. */
    private currentTopicPath: string;
    private _renderToken: number;

    constructor({ onEditRequest, onExerciseOpenRequest, onExercisePreviewRequest }: TheoryViewerOptions = {}) {
        this.onEditRequest = onEditRequest;
        this.onExerciseOpenRequest = onExerciseOpenRequest;
        this.onExercisePreviewRequest = onExercisePreviewRequest;
        this.panel = byId('theory-panel');
        this.container = byId('theory-content');
        this.btnTheory = byId('btn-theory');
        this.btnEdit = document.getElementById('btn-edit-theory') as HTMLButtonElement | null;
        this.btnExport = document.getElementById('btn-export-theory') as HTMLButtonElement | null;
        this.btnClose = byId('btn-close-theory');
        this.currentContent = '';
        this.currentTopicPath = '';
        this._renderToken = 0;

        this._initEvents();
    }

    private _initEvents(): void {
        this.btnTheory.addEventListener('click', () => {
            this.toggle();
        });

        this.btnClose.addEventListener('click', () => {
            this.hide();
        });

        this.btnEdit?.addEventListener('click', () => {
            if (!this.currentTopicPath || typeof this.onEditRequest !== 'function') return;
            this.onEditRequest(this.currentTopicPath, this.currentContent);
        });

        this.btnExport?.addEventListener('click', () => this._exportHtml());

        this.container?.addEventListener('click', (event) => {
            const openButton = (event.target as HTMLElement).closest('[data-theory-exercise-open]');
            if (openButton) {
                event.preventDefault();
                event.stopPropagation();
                this._handleExerciseOpen(openButton.getAttribute('data-theory-exercise-open'));
                return;
            }

            const previewButton = (event.target as HTMLElement).closest('[data-theory-exercise-preview]');
            if (previewButton) {
                event.preventDefault();
                event.stopPropagation();
                this._handleExercisePreview(previewButton.getAttribute('data-theory-exercise-preview'));
                return;
            }

            const card = (event.target as HTMLElement).closest(
                '.theory-exercise-embed[data-theory-exercise-exists="1"]',
            );
            if (card) {
                event.preventDefault();
                this._handleExercisePreview(card.getAttribute('data-theory-exercise-file'));
            }
        });

        this.container?.addEventListener('keydown', (event) => {
            const card = (event.target as HTMLElement).closest(
                '.theory-exercise-embed[data-theory-exercise-exists="1"]',
            );
            if (!card) return;
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            this._handleExercisePreview(card.getAttribute('data-theory-exercise-file'));
        });
    }

    /**
     * Shows the theory of `topicPath` (`chapterId/sectionId/topicId`) and enables the edit/export buttons.
     * A failed fetch renders the empty state; a response that arrives after another `load`, `renderContent`
     * or `clear` is dropped.
     */
    async load(topicPath: string): Promise<void> {
        this.currentTopicPath = topicPath || '';
        if (this.btnEdit) {
            this.btnEdit.disabled = !this.currentTopicPath;
        }
        if (this.btnExport) {
            this.btnExport.disabled = !this.currentTopicPath;
        }

        // Take the token before fetching: if another topic is loaded while this request is
        // still in flight, the slower response must not overwrite the newer topic.
        const loadToken = ++this._renderToken;
        let data: TopicMainResponse | null = null;
        try {
            data = await fetchTopicMain(topicPath);
        } catch {
            data = null;
        }
        if (loadToken !== this._renderToken) return;
        await this.renderContent(data?.content || '');
    }

    /**
     * Renders `content` (theory Markdown) for the loaded topic, loading the examples its shortcodes refer to
     * first. Also how the app shows the editor's unsaved theory text. Empty content shows the empty state.
     */
    async renderContent(content: string = ''): Promise<void> {
        this.currentContent = typeof content === 'string' ? content : String(content ?? '');
        const renderToken = ++this._renderToken;
        const topicPath = this.currentTopicPath;

        if (this.currentContent) {
            const exerciseEmbeds = await loadTheoryExerciseEmbeds(topicPath, this.currentContent);
            if (renderToken !== this._renderToken) return;
            this.container.innerHTML = renderTheoryHtml(this.currentContent, {
                exerciseEmbeds,
                topicPath,
            });
            this._hydrateExercisePreviewSlots(exerciseEmbeds);
            this._hydrateCodeEmbedTabs();
            return;
        }

        this.container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📝</span>
        <p>No theory content for this topic yet</p>
      </div>
    `;
    }

    /** Shows the panel if it is hidden and hides it otherwise. */
    toggle(): void {
        this.panel.classList.toggle('hidden');
    }

    /** Shows the panel. */
    show(): void {
        this.panel.classList.remove('hidden');
    }

    /** Hides the panel; the rendered content stays. */
    hide(): void {
        this.panel.classList.add('hidden');
    }

    /** Forgets the loaded topic, shows the "select a topic" empty state and hides the panel. */
    clear(): void {
        this.currentTopicPath = '';
        this.currentContent = '';
        this._renderToken += 1;
        if (this.btnEdit) {
            this.btnEdit.disabled = true;
        }
        if (this.btnExport) {
            this.btnExport.disabled = true;
        }
        this.container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📖</span>
        <p>Select a topic from the sidebar to begin</p>
      </div>
    `;
        this.hide();
    }

    /** Downloads the shown page as a standalone `<topic>.html` (embeds loaded again for the export). */
    private async _exportHtml(): Promise<void> {
        if (!this.currentTopicPath || !this.currentContent) return;

        const topicSlug = this.currentTopicPath.split('/').filter(Boolean).pop() || 'theory';
        const exerciseEmbeds = await loadTheoryExerciseEmbeds(this.currentTopicPath, this.currentContent);
        const html = renderTheoryExportDocument(this.currentContent, {
            title: topicSlug,
            topicPath: this.currentTopicPath,
            exerciseEmbeds,
        });

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topicSlug}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }

    private _handleExercisePreview(filename: string | null): void {
        const normalizedFilename = String(filename || '').trim();
        if (!normalizedFilename || !this.currentTopicPath || typeof this.onExercisePreviewRequest !== 'function')
            return;
        this.onExercisePreviewRequest(this.currentTopicPath, normalizedFilename);
    }

    private _handleExerciseOpen(filename: string | null): void {
        const normalizedFilename = String(filename || '').trim();
        if (!normalizedFilename || !this.currentTopicPath || typeof this.onExerciseOpenRequest !== 'function') return;
        this.onExerciseOpenRequest(this.currentTopicPath, normalizedFilename);
    }

    /** Fills each card's preview slot with a sandboxed iframe of its example, or marks the slot empty. */
    private _hydrateExercisePreviewSlots(exerciseEmbeds: TheoryExerciseEmbeds = {}): void {
        if (!this.container) return;

        this.container.querySelectorAll('[data-theory-exercise-preview-slot]').forEach((slot) => {
            const filename = String(slot.getAttribute('data-theory-exercise-preview-slot') || '').trim();
            const previewSrcdoc = exerciseEmbeds?.[filename]?.previewSrcdoc || '';
            if (!previewSrcdoc) {
                slot.classList.add('is-empty');
                slot.innerHTML = `<span>${
                    slot.closest<HTMLElement>('.theory-exercise-embed')?.dataset?.theoryExerciseExists === '1'
                        ? 'Preview unavailable'
                        : 'Exercise missing'
                }</span>`;
                return;
            }

            const iframe = document.createElement('iframe');
            iframe.sandbox = 'allow-scripts';
            iframe.loading = 'lazy';
            iframe.srcdoc = previewSrcdoc;
            slot.classList.remove('is-empty');
            slot.innerHTML = '';
            slot.appendChild(iframe);
        });
    }

    /** Makes the tabs of each code embed switch panels (the rendered HTML carries no behaviour of its own). */
    private _hydrateCodeEmbedTabs(): void {
        if (!this.container) return;

        this.container.querySelectorAll('.theory-code-embed').forEach((embed) => {
            embed.addEventListener('click', (event) => {
                const tab = (event.target as HTMLElement).closest('.theory-code-embed-tab');
                if (!tab) return;
                const index = tab.getAttribute('data-code-tab');
                embed.querySelectorAll('.theory-code-embed-tab').forEach((t) => {
                    t.classList.toggle('is-active', t.getAttribute('data-code-tab') === index);
                });
                embed.querySelectorAll('.theory-code-embed-panel').forEach((p) => {
                    p.classList.toggle('is-active', p.getAttribute('data-code-panel') === index);
                });
            });
        });
    }
}

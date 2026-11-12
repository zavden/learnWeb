// The favorites dialog: a modal grid with a live preview card for every favorite example, from all topics.
// Created once by src/main.ts, which hands it the entries (`FavoriteEntry`, resolved against the disk by
// the API) through `open()` and re-renders it with `render()` whenever the list changes while it is open.
// Each card previews the example in a sandboxed iframe (compile client + renderers, like the gallery) and
// has Open and Remove buttons; a missing file shows a "Missing" card that can only be removed.
//
// Near-duplicate of src/components/PendingDialog.ts (same structure, different ids and texts): keep the two
// in step when changing one.
import { fetchExample } from '../utils/api.ts';
import { compileExample } from '../utils/compileClient.ts';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../utils/exampleRenderer.ts';
import { loadSrcdocWhenLaidOut } from '../utils/renderer/previewHost.ts';
import { getExampleStage, isShaderDocument, parseExampleDocument } from '../utils/markdown.ts';
import type { ExampleStage } from '../types/document.ts';
import type { FavoriteEntry } from '../types/material.ts';

/** What `main.ts` passes to the dialog. The callbacks are optional: the dialog calls them with `?.`. */
export interface FavoritesDialogOptions {
    /** Readable name of a topic, shown under each card's title; a falsy result falls back to the raw topic path. */
    getTopicLabel?: (topicPath: string) => string;
    /** The learner opened a favorite (the dialog has already closed): open that example in the editor. */
    onExampleSelect?: (topicPath: string, filename: string) => void | Promise<void>;
    /** The Remove button was pressed: remove that favorite (`path` is the repository-relative example path). */
    onRemoveFavorite?: (favoritePath: string) => void | Promise<void>;
}

/** Badge data of an `example_stage` value; only its presence matters here (it sets `data-stage` on the card). */
interface ExampleStageMeta {
    label: string;
    rank: number;
    className: string;
}

// `satisfies` keeps the table in step with `ExampleStage`; the annotation lets it be indexed with any string.
const EXAMPLE_STAGE_META: Readonly<Record<string, ExampleStageMeta | undefined>> = {
    minimal: { label: 'Minimal', rank: 0, className: 'stage-minimal' },
    intermediate: { label: 'Intermediate', rank: 1, className: 'stage-intermediate' },
    'common-error': { label: 'Common Error', rank: 2, className: 'stage-common-error' },
    exercise: { label: 'Exercise', rank: 3, className: 'stage-exercise' },
    'final-solution': { label: 'Final Solution', rank: 4, className: 'stage-final-solution' },
    professional: { label: 'Professional', rank: 5, className: 'stage-professional' },
} satisfies Record<ExampleStage, ExampleStageMeta>;

/** The modal grid of favorite examples (see the header of this file), bound to `#favorites-dialog` in index.html. */
export class FavoritesDialog {
    readonly onExampleSelect: FavoritesDialogOptions['onExampleSelect'];
    readonly getTopicLabel: FavoritesDialogOptions['getTopicLabel'];
    readonly onRemoveFavorite: FavoritesDialogOptions['onRemoveFavorite'];
    /** The `<dialog>`; `main.ts` reads `dialog.open` to know whether the list must be re-rendered. */
    readonly dialog: HTMLDialogElement | null;
    readonly grid: HTMLDivElement | null;
    /** The "No favorites yet." hint; lives inside the grid only while the list is empty. */
    readonly empty: HTMLParagraphElement | null;
    readonly note: HTMLParagraphElement | null;
    readonly btnClose: HTMLButtonElement | null;
    readonly btnCloseIcon: HTMLButtonElement | null;
    /** Counts renders (and dialog closes): a render whose token is stale drops its result. */
    private _renderToken: number;

    /**
     * Starts the preview of a card built by `_createCard()`. A sandboxed copy only loads once its frame is
     * in the page (`loadSrcdocWhenLaidOut`), and `render()` attaches the cards after all of them are built.
     */
    private readonly _previewLoads = new WeakMap<HTMLDivElement, () => void>();

    constructor({ getTopicLabel, onExampleSelect, onRemoveFavorite }: FavoritesDialogOptions) {
        this.onExampleSelect = onExampleSelect;
        this.getTopicLabel = getTopicLabel;
        this.onRemoveFavorite = onRemoveFavorite;
        this.dialog = document.getElementById('favorites-dialog') as HTMLDialogElement | null;
        this.grid = document.getElementById('favorites-grid') as HTMLDivElement | null;
        this.empty = document.getElementById('favorites-empty') as HTMLParagraphElement | null;
        this.note = document.getElementById('favorites-dialog-note') as HTMLParagraphElement | null;
        this.btnClose = document.getElementById('favorites-dialog-close') as HTMLButtonElement | null;
        this.btnCloseIcon = document.getElementById('favorites-dialog-close-icon') as HTMLButtonElement | null;

        this._renderToken = 0;

        this.btnClose?.addEventListener('click', () => this.dialog?.close());
        this.btnCloseIcon?.addEventListener('click', () => this.dialog?.close());
        // Drop preview iframes when the dialog closes so they stop running.
        this.dialog?.addEventListener('close', () => this._releasePreviews());
    }

    private _releasePreviews(): void {
        this._renderToken += 1;
        this.grid?.querySelectorAll('iframe').forEach((iframe) => iframe.remove());
    }

    /** Renders `entries` and shows the dialog as a modal. */
    open(entries: FavoriteEntry[] = []): void {
        this.render(entries);
        this.dialog?.showModal();
    }

    /**
     * Rebuilds the grid from `entries` (also while the dialog is open, after a change). A render that is
     * superseded by a newer one, or by closing the dialog, drops its result.
     */
    async render(entries: FavoriteEntry[] = []): Promise<void> {
        if (!this.grid || !this.empty || !this.note) return;

        const renderToken = ++this._renderToken;
        this.grid.innerHTML = '';
        this.note.textContent =
            entries.length === 0
                ? 'Your favorites list is empty.'
                : `${entries.length} favorite${entries.length === 1 ? '' : 's'} across all topics.`;

        if (entries.length === 0) {
            this.empty.classList.remove('hidden');
            this.grid.appendChild(this.empty);
            return;
        }

        this.empty.classList.add('hidden');
        const cards = await Promise.all(entries.map((entry) => this._createCard(entry)));
        // A newer render (or closing the dialog) superseded this one.
        if (renderToken !== this._renderToken) return;
        this.grid.innerHTML = '';
        cards.forEach((card) => {
            this.grid!.appendChild(card); // checked at the top; narrowing does not reach the callback
            this._previewLoads.get(card)?.();
        });
    }

    private async _createCard(entry: FavoriteEntry): Promise<HTMLDivElement> {
        const div = document.createElement('div');
        div.className = `example-card favorite-card ${entry.exists ? '' : 'is-missing'}`;
        div.title = entry.path;

        const preview = document.createElement('div');
        preview.className = 'card-preview';

        if (entry.exists && entry.topicPath && entry.filename) {
            try {
                const data = await fetchExample(entry.topicPath, entry.filename);
                if (data?.content) {
                    const documentModel = parseExampleDocument(data.content);
                    const stage = getExampleStage(documentModel);
                    const stageMeta = EXAMPLE_STAGE_META[stage] || null;
                    if (stageMeta) {
                        div.dataset.stage = stage;
                    }

                    const iframe = document.createElement('iframe');
                    iframe.sandbox = 'allow-scripts';
                    iframe.loading = 'lazy';

                    let srcdoc: string;
                    if (isShaderDocument(documentModel)) {
                        srcdoc = renderShaderExampleDocument(documentModel, {
                            diagnostics: documentModel.diagnostics || [],
                            renderId: 0,
                            shaderControls: {
                                paused: true,
                                stillFrame: true,
                            },
                            topicPath: entry.topicPath,
                        });
                    } else {
                        const result = await compileExample({ document: documentModel });
                        srcdoc = renderCompiledExampleDocument(
                            result.compiledDocument,
                            entry.topicPath,
                            result.compileDiagnostics || [],
                        );
                    }

                    preview.appendChild(iframe);
                    // The card is not in the page yet: render() starts the preview once it is attached.
                    this._previewLoads.set(div, () => loadSrcdocWhenLaidOut(iframe, srcdoc));
                }
            } catch (error) {
                console.error(`Failed to load favorite preview for ${entry.path}`, error);
                preview.textContent = 'Preview unavailable';
            }
        } else {
            preview.innerHTML = '<div class="favorite-card-missing-preview">Missing</div>';
        }

        const footer = document.createElement('div');
        footer.className = 'card-footer favorite-card-footer';

        const textMeta = document.createElement('div');
        textMeta.className = 'favorite-card-meta';

        const title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = entry.filename || 'Missing favorite';
        textMeta.appendChild(title);

        const pathText = document.createElement('div');
        pathText.className = 'favorite-card-path';
        pathText.textContent = this.getTopicLabel?.(entry.topicPath) || entry.topicPath || entry.path;
        pathText.title = entry.path;
        textMeta.appendChild(pathText);

        footer.appendChild(textMeta);

        const actions = document.createElement('div');
        actions.className = 'favorite-card-actions';

        if (entry.exists) {
            const openButton = document.createElement('button');
            openButton.type = 'button';
            openButton.className = 'btn btn-secondary btn-favorite-open';
            openButton.textContent = 'Open';
            openButton.addEventListener('click', (event) => {
                event.stopPropagation();
                this.dialog?.close();
                this.onExampleSelect?.(entry.topicPath, entry.filename);
            });
            actions.appendChild(openButton);
        }

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'btn btn-secondary btn-favorite-remove';
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', async (event) => {
            event.stopPropagation();
            await this.onRemoveFavorite?.(entry.path);
        });
        actions.appendChild(removeButton);

        footer.appendChild(actions);

        div.appendChild(preview);
        div.appendChild(footer);

        if (entry.exists) {
            div.addEventListener('click', () => {
                this.dialog?.close();
                this.onExampleSelect?.(entry.topicPath, entry.filename);
            });
        }

        return div;
    }
}

// The gallery: the grid of example cards shown while no example is open. It lists the examples of the
// selected topic (`load`) or, at startup, the pending examples of every topic (`renderPendingEntries`).
// Every card holds a live preview (a sandboxed iframe), the editorial info overlay, a stage badge, a type
// tag and a delete button; the type buttons in the header filter the grid.
//
// Created once by src/main.ts, which calls `load()` on topic selection and `setPreviewsSuspended()` when the
// editor covers the gallery. Fetches examples through src/utils/api.ts, parses them with src/utils/markdown.ts
// and builds each preview with the compile client and the renderers (src/utils/exampleRenderer.ts).
//
// Things to know before editing:
// - Previews are lazy: a card's iframe only exists while the card is near the visible part of the grid and
//   the gallery itself is visible (see "Lazy card previews"): hundreds of live frames would keep the CPU busy.
// - `load`/`render` are guarded by a request gate: a newer call makes older ones drop their result.
// - Examples that only run a script (no markup, not a shader) show their code instead of a live frame.
import { fetchExamples, fetchExample, removeExample } from '../utils/api.ts';
import { compileExample } from '../utils/compileClient.ts';
import {
    formatExampleRatingStars,
    getExampleImportanceMeta,
    hasExampleEditorialMetadata,
} from '../utils/exampleEditorial.ts';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../utils/exampleRenderer.ts';
import { loadSrcdocWhenLaidOut } from '../utils/renderer/previewHost.ts';
import { highlightCode } from '../utils/theoryRenderer.ts';
import { createRequestGate, type RequestGate } from './editor/dirtyTracker.ts';
import { showToast } from './editor/toast.ts';
import {
    getExampleEditorialMetadata,
    getExampleStage,
    isShaderDocument,
    parseExampleDocument,
} from '../utils/markdown.ts';
import { byId } from '../utils/dom.ts';
import { errorMessage } from '../utils/errors.ts';
import type { ExamplesListResponse } from '../types/api.ts';
import type { ExampleBlock, ExampleDocument, ExampleEditorialMetadata, ExampleStage } from '../types/document.ts';
import type { PendingEntry } from '../types/material.ts';

/** What `main.ts` passes to the gallery. The callbacks are optional: the gallery calls them with `?.`. */
export interface GalleryOptions {
    /** A card was clicked: open that example of the current topic. */
    onExampleSelect?: (filename: string) => void | Promise<void>;
    /** A card's delete button succeeded and the grid was reloaded: let the app refresh its own state. */
    onExampleDeleted?: (topicPath: string, filename: string) => void | Promise<void>;
    /** Readable name of a topic, shown on pending cards; a falsy result falls back to the raw topic path. */
    getTopicLabel?: (topicPath: string) => string;
}

/** Options of {@link Gallery.load}. */
export interface GalleryLoadOptions {
    /** Reloading the same topic: keep the cards on screen and restore the scroll position afterwards. */
    preserveScroll?: boolean;
}

/** Options of {@link Gallery.render}. */
export interface GalleryRenderOptions {
    /** Gate token of the request this render belongs to. When omitted a fresh one is taken, which supersedes any load in flight. */
    token?: number;
    /** Topic the examples belong to (default: the gallery's current topic). */
    topicPath?: string | null;
}

/** Options of {@link Gallery.renderPendingEntries}. */
export interface GalleryPendingOptions {
    /** A pending card was clicked: open that example. */
    onOpenEntry?: (topicPath: string, filename: string) => void | Promise<void>;
}

/** Label and CSS class of the type tag (and of the filter button) of one kind of example. */
interface ExampleTypeMeta {
    label: string;
    className: string;
}

const EXAMPLE_TYPE_META = {
    html: { label: 'HTML', className: 'type-html' },
    js: { label: 'JS', className: 'type-js' },
    ts: { label: 'TS', className: 'type-ts' },
    vue: { label: 'VUE', className: 'type-vue' },
    react: { label: 'REACT', className: 'type-react' },
    svg: { label: 'SVG', className: 'type-svg' },
    shader: { label: 'SHADER', className: 'type-shader' },
} satisfies Record<string, ExampleTypeMeta>;

/** The kinds of example the gallery tells apart (the keys of {@link EXAMPLE_TYPE_META}). */
export type GalleryExampleType = keyof typeof EXAMPLE_TYPE_META;

/** Badge text, sort rank (lowest first) and CSS class of an `example_stage` value. */
interface ExampleStageMeta {
    label: string;
    rank: number;
    className: string;
}

// `satisfies` keeps the table in step with `ExampleStage`; the annotation lets it be indexed with any
// string (a card without a stage looks up '').
const EXAMPLE_STAGE_META: Readonly<Record<string, ExampleStageMeta | undefined>> = {
    minimal: { label: 'Minimal', rank: 0, className: 'stage-minimal' },
    intermediate: { label: 'Intermediate', rank: 1, className: 'stage-intermediate' },
    'common-error': { label: 'Common Error', rank: 2, className: 'stage-common-error' },
    exercise: { label: 'Exercise', rank: 3, className: 'stage-exercise' },
    'final-solution': { label: 'Final Solution', rank: 4, className: 'stage-final-solution' },
    professional: { label: 'Professional', rank: 5, className: 'stage-professional' },
} satisfies Record<ExampleStage, ExampleStageMeta>;

/** Cards load their preview when they come within this distance of the visible part of the grid. */
const PREVIEW_ROOT_MARGIN = '360px 0px';

/** Compiles and renders a card's example into the `srcdoc` of its preview; called when the card first becomes visible. */
type PreviewBuilder = () => Promise<string>;

/** A card as the gallery keeps it: its DOM plus what the lazy previewer and the sort need. */
export interface GalleryCard {
    element: HTMLDivElement;
    /** The `.card-preview` box the iframe is inserted into. */
    preview: HTMLDivElement;
    /** `null` when the card shows code instead of a live frame, or when it could not be loaded. */
    buildPreview: PreviewBuilder | null;
    filename: string;
    exampleType: GalleryExampleType;
    isPending: boolean;
    /** Rank of the example's stage; cards without a (known) stage sort last. */
    stageRank: number;
}

/** The part of a card the pending list needs. */
type PendingCard = Pick<GalleryCard, 'element' | 'preview' | 'buildPreview'>;

/** Bookkeeping of one card's lazy preview, keyed by its `.card-preview` box. */
interface PreviewRecord {
    build: PreviewBuilder;
    /** Building the `srcdoc` threw: the card shows "Preview unavailable" and is not retried. */
    failed: boolean;
    iframe: HTMLIFrameElement | null;
    /** A build is in flight. */
    loading: boolean;
    /** The built `srcdoc`, kept so remounting after a scroll does not recompile. */
    srcdoc: string | null;
    /** The box intersects the observed area. */
    visible: boolean;
}

/** Number of cards per example type, for the filter buttons. */
type TypeCounts = Partial<Record<string, number>>;

/** The `srcdoc` of a card's preview: a shader page frozen on its first frame, or the compiled example. */
async function buildExamplePreviewSrcdoc(documentModel: ExampleDocument, topicPath: string | null): Promise<string> {
    if (isShaderDocument(documentModel)) {
        return renderShaderExampleDocument(documentModel, {
            diagnostics: documentModel.diagnostics || [],
            renderId: 0,
            shaderControls: {
                paused: true,
                stillFrame: true,
            },
            topicPath,
        });
    }

    const result = await compileExample({ document: documentModel });
    return renderCompiledExampleDocument(result.compiledDocument, topicPath, result.compileDiagnostics || []);
}

/** Longest code excerpt shown on a console-only card; the rest is summarized as "N more lines". */
const CODE_PREVIEW_MAX_LINES = 18;

// The script block of an example whose page would be empty (no markup, not a shader).
function getScriptOnlyBlock(documentModel: ExampleDocument): ExampleBlock | null {
    if (isShaderDocument(documentModel) || documentModel?.metadata?.framework) return null;
    const blocks = documentModel?.blocks || [];
    const hasMarkup = blocks.some((block) => block.slot === 'markup' && String(block.content || '').trim());
    if (hasMarkup) return null;
    return blocks.find((block) => block.slot === 'script' && String(block.content || '').trim()) || null;
}

/** The highlighted first lines of a script block, shown instead of a live frame. */
function buildCodePreview(block: ExampleBlock): HTMLPreElement {
    const lines = String(block.content || '').split('\n');
    const visible = lines.slice(0, CODE_PREVIEW_MAX_LINES).join('\n');
    const pre = document.createElement('pre');
    pre.className = 'card-code-preview';
    const code = document.createElement('code');
    code.className = 'hljs';
    code.innerHTML = highlightCode(visible, block.type === 'typescript' ? 'typescript' : 'javascript');
    pre.appendChild(code);
    if (lines.length > CODE_PREVIEW_MAX_LINES) {
        const more = document.createElement('span');
        more.className = 'card-code-preview-more';
        more.textContent = `… ${lines.length - CODE_PREVIEW_MAX_LINES} more lines`;
        pre.appendChild(more);
    }
    return pre;
}

/**
 * The grid of example cards (see the header of this file). One instance, created by `main.ts`, bound to the
 * `#gallery-view` markup of index.html.
 */
export class Gallery {
    readonly view: HTMLElement;
    readonly grid: HTMLDivElement;
    readonly btnMetaToggle: HTMLButtonElement | null;
    readonly filtersContainer: HTMLDivElement | null;
    readonly heading: HTMLHeadingElement | null;
    readonly onExampleSelect: GalleryOptions['onExampleSelect'];
    readonly onExampleDeleted: GalleryOptions['onExampleDeleted'];
    readonly getTopicLabel: GalleryOptions['getTopicLabel'];
    /** Repository-relative paths (`material/<topic>/examples/<file>`) of the pending examples, to badge their cards. */
    pendingPaths: Set<string>;
    /** Topic whose examples the grid shows; `main.ts` also sets it directly when a topic is selected. `null`: none (pending list). */
    currentTopicPath: string | null;
    readonly metaOverlayHiddenStorageKey: string;
    metaOverlayHidden: boolean;
    /** Type filter currently applied to the grid (`null`: all cards). */
    activeTypeFilter: GalleryExampleType | null;
    private readonly _loadGate: RequestGate;
    private _previewRecords: Map<Element, PreviewRecord>;
    private _previewsSuspended: boolean;
    private readonly _previewObserver: IntersectionObserver | null;
    /** The cards of the last `render()`. Written, never read. */
    private _cards: GalleryCard[] | undefined;

    constructor({ onExampleSelect, onExampleDeleted, getTopicLabel }: GalleryOptions) {
        this.view = byId('gallery-view');
        this.grid = byId<HTMLDivElement>('gallery-grid');
        this.btnMetaToggle = document.getElementById('btn-gallery-meta-toggle') as HTMLButtonElement | null;
        this.filtersContainer = document.getElementById('gallery-type-filters') as HTMLDivElement | null;
        this.heading = this.view?.querySelector<HTMLHeadingElement>('.gallery-header h2') || null;
        this.onExampleSelect = onExampleSelect;
        this.onExampleDeleted = onExampleDeleted;
        this.getTopicLabel = getTopicLabel;
        this.pendingPaths = new Set();
        this.currentTopicPath = null;
        this.metaOverlayHiddenStorageKey = 'learncode.gallery.metaOverlayHidden';
        this.metaOverlayHidden = window.localStorage.getItem(this.metaOverlayHiddenStorageKey) === '1';
        this.activeTypeFilter = null;
        this._loadGate = createRequestGate();
        this._previewRecords = new Map();
        this._previewsSuspended = false;
        this._previewObserver =
            typeof IntersectionObserver === 'function'
                ? new IntersectionObserver((entries) => this._handlePreviewIntersections(entries), {
                      root: this.grid,
                      rootMargin: PREVIEW_ROOT_MARGIN,
                  })
                : null;

        this.btnMetaToggle?.addEventListener('click', () => {
            this.setMetaOverlayHidden(!this.metaOverlayHidden);
        });
        this._syncMetaToggle();
        this._renderTypeFilters();
    }

    /** Shows the gallery and resumes the card previews. (`main.ts` does the same inline in `showGallery()` and does not call this.) */
    show(): void {
        this.view.classList.remove('hidden');
        this.setPreviewsSuspended(false);
    }

    /** Hides the gallery and stops the card previews. (`main.ts` does the same inline in `showEditor()` and does not call this.) */
    hide(): void {
        this.view.classList.add('hidden');
        this.setPreviewsSuspended(true);
    }

    /** Sets the title above the grid (`Examples` when blank); the full text is also its tooltip. */
    setHeading(text: string = ''): void {
        if (!this.heading) return;
        const label = String(text || '').trim();
        this.heading.textContent = label || 'Examples';
        this.heading.title = label;
    }

    /**
     * Replaces the set of pending example paths used to badge cards. A `Set` is adopted as is (not copied), so
     * the caller's later changes show up in cards created afterwards.
     */
    setPendingPaths(paths: Iterable<string> | null | undefined): void {
        this.pendingPaths = paths instanceof Set ? paths : new Set(paths || []);
    }

    /**
     * Fetches the examples of `topicPath` and renders them. Resolves to `false` when a newer load superseded
     * this one or the load failed (the grid then shows an error); `true` once the cards are on screen.
     */
    async load(topicPath: string, { preserveScroll = false }: GalleryLoadOptions = {}): Promise<boolean> {
        const token = this._loadGate.next();
        const previousScrollTop = this.grid.scrollTop;
        const topicChanged = topicPath !== this.currentTopicPath;
        const keepCurrentCards = preserveScroll && !topicChanged;
        this.currentTopicPath = topicPath;

        if (!keepCurrentCards) {
            // New topic: start at the top instead of the previous topic's scroll offset.
            this._resetPreviews();
            this.grid.innerHTML = '<div class="loading">Loading examples...</div>';
            this.grid.scrollTop = 0;
        }

        try {
            const examples = await fetchExamples(topicPath);
            if (!this._loadGate.isCurrent(token)) return false;
            const rendered = await this.render(examples, { token, topicPath });
            if (rendered && keepCurrentCards) {
                this.grid.scrollTop = previousScrollTop;
            }
            return rendered;
        } catch (err) {
            if (!this._loadGate.isCurrent(token)) return false;
            console.error(err);
            this.grid.innerHTML = '<div class="error">Failed to load examples</div>';
            return false;
        }
    }

    /**
     * Builds the cards for `examples` (file names) and replaces the grid's content. Resolves to `false` when
     * the token went stale while the cards were being prepared; `true` otherwise (also for an empty list).
     */
    async render(
        examples: ExamplesListResponse | null | undefined,
        { token = this._loadGate.next(), topicPath = this.currentTopicPath }: GalleryRenderOptions = {},
    ): Promise<boolean> {
        const list = Array.isArray(examples) ? examples : [];
        const cards = await Promise.all(list.map((filename) => this.createCard(filename, topicPath)));
        // A newer load/render started while previews were being prepared: drop this one.
        if (!this._loadGate.isCurrent(token)) return false;

        this._resetPreviews();
        this.grid.innerHTML = '';
        this.grid.classList.toggle('meta-overlay-hidden', this.metaOverlayHidden);

        if (list.length === 0) {
            this.grid.innerHTML = '<div class="empty-state">No examples yet</div>';
            this._updateTypeFilterCounts({});
            return true;
        }

        this._cards = cards;
        cards
            .sort((left, right) => {
                const leftPending = left.isPending ? 0 : 1;
                const rightPending = right.isPending ? 0 : 1;
                if (leftPending !== rightPending) return leftPending - rightPending;

                if (left.stageRank !== right.stageRank) {
                    return left.stageRank - right.stageRank;
                }

                return left.filename.localeCompare(right.filename, undefined, { numeric: true });
            })
            .forEach((card) => {
                this.grid.appendChild(card.element);
                this._registerPreview(card.preview, card.buildPreview);
            });

        const typeCounts: TypeCounts = {};
        for (const card of cards) {
            typeCounts[card.exampleType] = (typeCounts[card.exampleType] || 0) + 1;
        }
        if (this.activeTypeFilter && !typeCounts[this.activeTypeFilter]) {
            // The new topic has nothing of the active type: don't show an empty grid.
            this.activeTypeFilter = null;
        }
        this._updateTypeFilterCounts(typeCounts);
        this._applyTypeFilter();
        return true;
    }

    /**
     * Builds the card of one example: fetches and parses it, and prepares (without running it) the builder of
     * its preview. A file that fails to load still gets a card, with "Preview unavailable".
     */
    async createCard(filename: string, topicPath: string | null = this.currentTopicPath): Promise<GalleryCard> {
        const div = document.createElement('div');
        div.className = 'example-card';
        div.title = filename;

        const preview = document.createElement('div');
        preview.className = 'card-preview';
        let exampleType: GalleryExampleType = 'html';
        let buildPreview: PreviewBuilder | null = null;

        try {
            // A topic is always selected when cards are created (load() takes one, render() defaults to it).
            const data = await fetchExample(topicPath!, filename);
            if (data?.content) {
                const documentModel = parseExampleDocument(data.content);
                const editorialMetadata = getExampleEditorialMetadata(documentModel);
                const stage = getExampleStage(documentModel);
                const stageMeta = EXAMPLE_STAGE_META[stage] || null;
                if (stageMeta) {
                    div.dataset.stage = stage;
                    div.dataset.stageRank = String(stageMeta.rank);
                }

                exampleType = this._getExampleType(documentModel);
                const scriptOnlyBlock = getScriptOnlyBlock(documentModel);
                if (scriptOnlyBlock) {
                    // Console-only examples have an empty page: show their code instead of a live frame.
                    preview.appendChild(buildCodePreview(scriptOnlyBlock));
                } else {
                    buildPreview = () => buildExamplePreviewSrcdoc(documentModel, topicPath);
                }
                preview.appendChild(this._createEditorialOverlay(editorialMetadata));
            }
        } catch (err) {
            console.error(`Failed to load preview for ${filename}`, err);
            this._renderPreviewUnavailable(preview);
        }

        div.dataset.exampleType = exampleType;

        const footer = document.createElement('div');
        footer.className = 'card-footer';
        const title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = filename;
        footer.appendChild(title);

        const pendingKey = topicPath ? `material/${topicPath}/examples/${filename}` : '';
        const isPending = pendingKey ? this.pendingPaths.has(pendingKey) : false;
        if (isPending) {
            const pendingBadge = document.createElement('span');
            pendingBadge.className = 'card-stage-badge stage-pending';
            pendingBadge.textContent = 'Pending';
            footer.appendChild(pendingBadge);
        }

        const stage = div.dataset.stage || '';
        const stageMeta = EXAMPLE_STAGE_META[stage] || null;
        if (stageMeta) {
            const badge = document.createElement('span');
            badge.className = `card-stage-badge ${stageMeta.className}`;
            badge.textContent = stageMeta.label;
            footer.appendChild(badge);
        }

        const typeMeta = EXAMPLE_TYPE_META[exampleType];
        if (typeMeta) {
            const typeTag = document.createElement('span');
            typeTag.className = `card-type-tag ${typeMeta.className}`;
            typeTag.textContent = typeMeta.label;
            footer.appendChild(typeTag);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'card-delete-btn';
        deleteBtn.title = 'Delete example';
        deleteBtn.setAttribute('aria-label', 'Delete example');
        deleteBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            this._deleteExample(filename, topicPath);
        });
        footer.appendChild(deleteBtn);

        div.appendChild(preview);
        div.appendChild(footer);

        div.addEventListener('click', () => {
            if (this.onExampleSelect) {
                this.onExampleSelect(filename);
            }
        });

        return {
            element: div,
            preview,
            buildPreview,
            filename,
            exampleType,
            isPending,
            stageRank: stageMeta?.rank ?? Number.MAX_SAFE_INTEGER,
        };
    }

    /**
     * Replaces the grid with the cards of the pending examples (from every topic) that still exist; used at
     * startup and when no topic is selected. Resolves to `false` when there is nothing to show or a newer
     * load superseded this one.
     */
    async renderPendingEntries(
        entries: PendingEntry[] | null | undefined,
        { onOpenEntry }: GalleryPendingOptions,
    ): Promise<boolean> {
        const token = this._loadGate.next();
        this.currentTopicPath = null;
        this.setHeading('Pending examples');
        this._resetPreviews();
        this.grid.innerHTML = '';
        this.grid.scrollTop = 0;
        this.grid.classList.toggle('meta-overlay-hidden', this.metaOverlayHidden);
        this._updateTypeFilterCounts({});

        const existingEntries = (entries || []).filter((entry) => entry?.exists);
        if (existingEntries.length === 0) {
            this.grid.innerHTML =
                '<div class="empty-state">No pending examples. Pick a topic in the sidebar to browse its examples.</div>';
            return false;
        }

        const cards = await Promise.all(existingEntries.map((entry) => this._createPendingCard(entry, onOpenEntry)));
        if (!this._loadGate.isCurrent(token)) return false;

        cards.forEach((card) => {
            this.grid.appendChild(card.element);
            this._registerPreview(card.preview, card.buildPreview);
        });
        return true;
    }

    /** Card of a pending entry: like `createCard`, but it names the example's topic and opens through `onOpenEntry`. */
    private async _createPendingCard(
        entry: PendingEntry,
        onOpenEntry: GalleryPendingOptions['onOpenEntry'],
    ): Promise<PendingCard> {
        const div = document.createElement('div');
        div.className = 'example-card';
        div.title = entry.path;

        const preview = document.createElement('div');
        preview.className = 'card-preview';
        let buildPreview: PreviewBuilder | null = null;

        if (entry.topicPath && entry.filename) {
            try {
                const data = await fetchExample(entry.topicPath, entry.filename);
                if (data?.content) {
                    const documentModel = parseExampleDocument(data.content);
                    const stage = getExampleStage(documentModel);
                    const stageMeta = EXAMPLE_STAGE_META[stage] || null;
                    if (stageMeta) {
                        div.dataset.stage = stage;
                    }

                    buildPreview = () => buildExamplePreviewSrcdoc(documentModel, entry.topicPath);
                }
            } catch (error) {
                console.error(`Failed to load pending preview for ${entry.path}`, error);
                this._renderPreviewUnavailable(preview);
            }
        }

        const footer = document.createElement('div');
        footer.className = 'card-footer';

        const title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = entry.filename;
        footer.appendChild(title);

        const pendingBadge = document.createElement('span');
        pendingBadge.className = 'card-stage-badge stage-pending';
        pendingBadge.textContent = 'Pending';
        footer.appendChild(pendingBadge);

        const pathTag = document.createElement('span');
        pathTag.className = 'favorite-card-path';
        pathTag.textContent = this.getTopicLabel?.(entry.topicPath) || entry.topicPath;
        pathTag.title = entry.path;
        footer.appendChild(pathTag);

        div.appendChild(preview);
        div.appendChild(footer);

        div.addEventListener('click', () => {
            onOpenEntry?.(entry.topicPath, entry.filename);
        });

        return { element: div, preview, buildPreview };
    }

    // ── Lazy card previews ──────────────────────────────
    // Card iframes only exist while the card is near the visible part of the
    // gallery and the gallery itself is visible. This keeps CPU/heat low with
    // many examples and while the editor covers the gallery.

    /**
     * Suspends (`true`) or resumes (`false`) every card preview: suspending removes all iframes so nothing runs
     * while the editor covers the gallery; resuming remounts the cards that are near the viewport.
     */
    setPreviewsSuspended(suspended: boolean): void {
        const nextSuspended = Boolean(suspended);
        if (this._previewsSuspended === nextSuspended) return;
        this._previewsSuspended = nextSuspended;

        this._previewRecords.forEach((record, preview) => {
            if (nextSuspended) {
                this._unmountPreview(record);
            } else if (record.visible || !this._previewObserver) {
                this._mountPreview(preview, record);
            }
        });
    }

    private _registerPreview(
        preview: Element | null | undefined,
        buildPreview: PreviewBuilder | null | undefined,
    ): void {
        if (!preview || typeof buildPreview !== 'function') return;

        const record: PreviewRecord = {
            build: buildPreview,
            failed: false,
            iframe: null,
            loading: false,
            srcdoc: null,
            visible: false,
        };
        this._previewRecords.set(preview, record);

        if (this._previewObserver) {
            this._previewObserver.observe(preview);
        } else if (!this._previewsSuspended) {
            record.visible = true;
            this._mountPreview(preview, record);
        }
    }

    private _handlePreviewIntersections(entries: IntersectionObserverEntry[]): void {
        entries.forEach((entry) => {
            const record = this._previewRecords.get(entry.target);
            if (!record) return;

            record.visible = entry.isIntersecting;
            if (record.visible && !this._previewsSuspended) {
                this._mountPreview(entry.target, record);
            } else {
                this._unmountPreview(record);
            }
        });
    }

    /** Builds the preview's `srcdoc` (once) and inserts its iframe, unless the card was hidden or replaced meanwhile. */
    private async _mountPreview(preview: Element, record: PreviewRecord): Promise<void> {
        if (record.iframe || record.failed) return;

        if (record.srcdoc === null) {
            if (record.loading) return;
            record.loading = true;
            try {
                record.srcdoc = await record.build();
            } catch (error) {
                console.error('Failed to build gallery preview.', error);
                record.failed = true;
                this._renderPreviewUnavailable(preview);
                return;
            } finally {
                record.loading = false;
            }
        }

        if (
            record.iframe ||
            this._previewsSuspended ||
            (!record.visible && this._previewObserver) ||
            this._previewRecords.get(preview) !== record ||
            !preview.isConnected
        ) {
            return;
        }

        const iframe = document.createElement('iframe');
        iframe.sandbox = 'allow-scripts';
        iframe.setAttribute('tabindex', '-1');
        preview.insertBefore(iframe, preview.firstChild);
        record.iframe = iframe;
        loadSrcdocWhenLaidOut(iframe, record.srcdoc, () => record.iframe === iframe);
    }

    private _unmountPreview(record: PreviewRecord | null | undefined): void {
        if (!record?.iframe) return;
        record.iframe.remove();
        record.iframe = null;
    }

    /** Forgets every card preview (removing their iframes); called before the grid's content is replaced. */
    private _resetPreviews(): void {
        this._previewObserver?.disconnect();
        this._previewRecords.forEach((record) => this._unmountPreview(record));
        this._previewRecords = new Map();
    }

    private _renderPreviewUnavailable(preview: Element | null | undefined): void {
        if (!preview) return;
        const message = document.createElement('div');
        message.className = 'card-preview-unavailable';
        message.textContent = 'Preview unavailable';
        preview.querySelector('.card-preview-unavailable')?.remove();
        preview.insertBefore(message, preview.firstChild);
    }

    /** Which type tag and filter an example belongs to: shader, framework, SVG, script-only (JS/TS) or plain HTML. */
    private _getExampleType(documentModel: ExampleDocument): GalleryExampleType {
        if (isShaderDocument(documentModel)) return 'shader';
        const framework = String(documentModel?.metadata?.framework || '')
            .trim()
            .toLowerCase();
        if (framework === 'vue') return 'vue';
        if (framework === 'react') return 'react';
        const files = documentModel?.files || [];
        const blocks = documentModel?.blocks || [];
        if (files.some((f) => f.language === 'svg') || blocks.some((b) => b.type === 'svg')) return 'svg';
        const scriptOnlyBlock = getScriptOnlyBlock(documentModel);
        if (scriptOnlyBlock) return scriptOnlyBlock.type === 'typescript' ? 'ts' : 'js';
        return 'html';
    }

    private _renderTypeFilters(): void {
        if (!this.filtersContainer) return;
        this.filtersContainer.innerHTML = '';

        for (const [type, meta] of Object.entries(EXAMPLE_TYPE_META) as [GalleryExampleType, ExampleTypeMeta][]) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `gallery-filter-btn ${meta.className}`;
            btn.dataset.filterType = type;
            btn.textContent = meta.label;
            btn.addEventListener('click', () => this._setTypeFilter(type));
            this.filtersContainer.appendChild(btn);
        }
    }

    /** Dims the filter buttons of types with no card (the active one stays enabled so it can be turned off). */
    private _updateTypeFilterCounts(typeCounts: TypeCounts): void {
        if (!this.filtersContainer) return;
        this.filtersContainer.querySelectorAll<HTMLButtonElement>('.gallery-filter-btn').forEach((btn) => {
            const type = btn.dataset.filterType as string; // set by _renderTypeFilters
            const count = typeCounts[type] || 0;
            btn.classList.toggle('is-empty', count === 0);
            btn.disabled = count === 0 && this.activeTypeFilter !== type;
        });
    }

    /** Clicking the active type's button clears the filter. */
    private _setTypeFilter(type: GalleryExampleType): void {
        this.activeTypeFilter = this.activeTypeFilter === type ? null : type;
        this._applyTypeFilter();
    }

    /** Marks the active filter button and hides the cards of other types (`is-filtered-out`). */
    private _applyTypeFilter(): void {
        if (!this.filtersContainer) return;

        this.filtersContainer.querySelectorAll<HTMLButtonElement>('.gallery-filter-btn').forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.filterType === this.activeTypeFilter);
        });

        this.grid?.querySelectorAll<HTMLElement>('.example-card').forEach((card) => {
            if (!this.activeTypeFilter) {
                card.classList.remove('is-filtered-out');
            } else {
                card.classList.toggle('is-filtered-out', card.dataset.exampleType !== this.activeTypeFilter);
            }
        });
    }

    /** Deletes an example after a confirm, reloads the grid when it is still the current topic and notifies `onExampleDeleted`. */
    private async _deleteExample(filename: string, topicPath: string | null = this.currentTopicPath): Promise<void> {
        if (!topicPath) return;
        if (!window.confirm(`Delete "${filename}"?`)) return;

        try {
            await removeExample(topicPath, filename);
            if (topicPath === this.currentTopicPath) {
                await this.load(topicPath, { preserveScroll: true });
            }
            this.onExampleDeleted?.(topicPath, filename);
        } catch (err) {
            console.error('Failed to delete example:', err);
            showToast(`Delete failed: ${errorMessage(err)}`, 'error');
        }
    }

    /** Shows or hides the info overlays of all cards; the choice is remembered in localStorage. */
    setMetaOverlayHidden(hidden: boolean): void {
        this.metaOverlayHidden = hidden === true;
        window.localStorage.setItem(this.metaOverlayHiddenStorageKey, this.metaOverlayHidden ? '1' : '0');
        this._syncMetaToggle();
        this.grid?.classList.toggle('meta-overlay-hidden', this.metaOverlayHidden);
        this.grid?.querySelectorAll('.card-meta-overlay').forEach((overlay) => {
            overlay.classList.toggle('is-hidden', this.metaOverlayHidden);
        });
    }

    private _syncMetaToggle(): void {
        if (!this.btnMetaToggle) return;
        this.btnMetaToggle.textContent = this.metaOverlayHidden ? 'Show Info' : 'Hide Info';
        this.btnMetaToggle.setAttribute('aria-pressed', String(!this.metaOverlayHidden));
        this.btnMetaToggle.title = this.metaOverlayHidden ? 'Show example info overlay' : 'Hide example info overlay';
    }

    /** The card's info overlay (description, tags, rating, importance); an empty one when there is nothing to show. */
    private _createEditorialOverlay(metadata: ExampleEditorialMetadata): HTMLDivElement {
        const overlay = document.createElement('div');
        overlay.className = 'card-meta-overlay';
        if (this.metaOverlayHidden) {
            overlay.classList.add('is-hidden');
        }

        if (!hasExampleEditorialMetadata(metadata)) {
            overlay.classList.add('is-empty');
            return overlay;
        }

        const header = document.createElement('div');
        header.className = 'card-meta-overlay-header';

        const hideButton = document.createElement('button');
        hideButton.type = 'button';
        hideButton.className = 'card-meta-hide';
        hideButton.title = 'Hide info overlays';
        hideButton.setAttribute('aria-label', 'Hide info overlays');
        hideButton.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.9-2.54 2.66-4.74 4.94-6.23"></path>
              <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58"></path>
              <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.78 11.78 0 0 1-1.67 2.87"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>`;
        hideButton.addEventListener('click', (event) => {
            event.stopPropagation();
            this.setMetaOverlayHidden(true);
        });
        header.appendChild(hideButton);
        overlay.appendChild(header);

        const body = document.createElement('div');
        body.className = 'card-meta-overlay-body';

        if (metadata.description) {
            const description = document.createElement('p');
            description.className = 'card-meta-description';
            description.textContent = metadata.description;
            body.appendChild(description);
        }

        if (Array.isArray(metadata.tags) && metadata.tags.length > 0) {
            const tags = document.createElement('div');
            tags.className = 'card-meta-tags';
            metadata.tags.slice(0, 5).forEach((tag) => {
                const pill = document.createElement('span');
                pill.className = 'card-meta-tag';
                pill.textContent = tag;
                tags.appendChild(pill);
            });
            body.appendChild(tags);
        }

        const ratingStars = formatExampleRatingStars(metadata.rating);
        const importanceMeta = getExampleImportanceMeta(metadata.importance);
        if (ratingStars || importanceMeta) {
            const summaryRow = document.createElement('div');
            summaryRow.className = 'card-meta-summary';

            if (ratingStars) {
                const rating = document.createElement('div');
                rating.className = 'card-meta-rating';
                rating.textContent = ratingStars;
                summaryRow.appendChild(rating);
            }

            if (importanceMeta) {
                const importance = document.createElement('span');
                importance.className = `card-meta-importance is-${importanceMeta.accent}`;
                importance.textContent = importanceMeta.label;
                summaryRow.appendChild(importance);
            }

            body.appendChild(summaryRow);
        }

        overlay.appendChild(body);
        return overlay;
    }
}

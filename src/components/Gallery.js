import { fetchExamples, fetchExample, removeExample } from '../utils/api.js';
import { compileExample } from '../utils/compileClient.js';
import {
    formatExampleRatingStars,
    getExampleImportanceMeta,
    hasExampleEditorialMetadata,
} from '../utils/exampleEditorial.js';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../utils/exampleRenderer.js';
import { highlightCode } from '../utils/theoryRenderer.js';
import { createRequestGate } from './editor/dirtyTracker.js';
import { showToast } from './editor/toast.js';
import {
    getExampleEditorialMetadata,
    getExampleStage,
    isShaderDocument,
    parseExampleDocument,
} from '../utils/markdown.js';

const EXAMPLE_TYPE_META = {
    html:    { label: 'HTML',    className: 'type-html' },
    js:      { label: 'JS',      className: 'type-js' },
    ts:      { label: 'TS',      className: 'type-ts' },
    vue:     { label: 'VUE',     className: 'type-vue' },
    react:   { label: 'REACT',   className: 'type-react' },
    svg:     { label: 'SVG',     className: 'type-svg' },
    shader:  { label: 'SHADER',  className: 'type-shader' },
};

const EXAMPLE_STAGE_META = {
    minimal: { label: 'Minimal', rank: 0, className: 'stage-minimal' },
    intermediate: { label: 'Intermediate', rank: 1, className: 'stage-intermediate' },
    'common-error': { label: 'Common Error', rank: 2, className: 'stage-common-error' },
    exercise: { label: 'Exercise', rank: 3, className: 'stage-exercise' },
    'final-solution': { label: 'Final Solution', rank: 4, className: 'stage-final-solution' },
    professional: { label: 'Professional', rank: 5, className: 'stage-professional' },
};

const PREVIEW_ROOT_MARGIN = '360px 0px';

async function buildExamplePreviewSrcdoc(documentModel, topicPath) {
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
    return renderCompiledExampleDocument(
        result.compiledDocument,
        topicPath,
        result.compileDiagnostics || []
    );
}

const CODE_PREVIEW_MAX_LINES = 18;

// The script block of an example whose page would be empty (no markup, not a shader).
function getScriptOnlyBlock(documentModel) {
    if (isShaderDocument(documentModel) || documentModel?.metadata?.framework) return null;
    const blocks = documentModel?.blocks || [];
    const hasMarkup = blocks.some((block) => block.slot === 'markup' && String(block.content || '').trim());
    if (hasMarkup) return null;
    return blocks.find((block) => block.slot === 'script' && String(block.content || '').trim()) || null;
}

function buildCodePreview(block) {
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

export class Gallery {
    constructor({ onExampleSelect, onExampleDeleted, getTopicLabel }) {
        this.view = document.getElementById('gallery-view');
        this.grid = document.getElementById('gallery-grid');
        this.btnMetaToggle = document.getElementById('btn-gallery-meta-toggle');
        this.filtersContainer = document.getElementById('gallery-type-filters');
        this.heading = this.view?.querySelector('.gallery-header h2') || null;
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
        this._previewObserver = typeof IntersectionObserver === 'function'
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

    show() {
        this.view.classList.remove('hidden');
        this.setPreviewsSuspended(false);
    }

    hide() {
        this.view.classList.add('hidden');
        this.setPreviewsSuspended(true);
    }

    setHeading(text = '') {
        if (!this.heading) return;
        const label = String(text || '').trim();
        this.heading.textContent = label || 'Examples';
        this.heading.title = label;
    }

    setPendingPaths(paths) {
        this.pendingPaths = paths instanceof Set ? paths : new Set(paths || []);
    }

    async load(topicPath, { preserveScroll = false } = {}) {
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

    async render(examples, { token = this._loadGate.next(), topicPath = this.currentTopicPath } = {}) {
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

        const typeCounts = {};
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

    async createCard(filename, topicPath = this.currentTopicPath) {
        const div = document.createElement('div');
        div.className = 'example-card';
        div.title = filename;

        const preview = document.createElement('div');
        preview.className = 'card-preview';
        let exampleType = 'html';
        let buildPreview = null;

        try {
            const data = await fetchExample(topicPath, filename);
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

        const pendingKey = topicPath
            ? `material/${topicPath}/examples/${filename}`
            : '';
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

    async renderPendingEntries(entries, { onOpenEntry }) {
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
            this.grid.innerHTML = '<div class="empty-state">No pending examples. Pick a topic in the sidebar to browse its examples.</div>';
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

    async _createPendingCard(entry, onOpenEntry) {
        const div = document.createElement('div');
        div.className = 'example-card';
        div.title = entry.path;

        const preview = document.createElement('div');
        preview.className = 'card-preview';
        let buildPreview = null;

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

    setPreviewsSuspended(suspended) {
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

    _registerPreview(preview, buildPreview) {
        if (!preview || typeof buildPreview !== 'function') return;

        const record = {
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

    _handlePreviewIntersections(entries) {
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

    async _mountPreview(preview, record) {
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
            record.iframe
            || this._previewsSuspended
            || (!record.visible && this._previewObserver)
            || this._previewRecords.get(preview) !== record
            || !preview.isConnected
        ) {
            return;
        }

        const iframe = document.createElement('iframe');
        iframe.sandbox = 'allow-scripts';
        iframe.setAttribute('tabindex', '-1');
        iframe.srcdoc = record.srcdoc;
        preview.insertBefore(iframe, preview.firstChild);
        record.iframe = iframe;
    }

    _unmountPreview(record) {
        if (!record?.iframe) return;
        record.iframe.remove();
        record.iframe = null;
    }

    _resetPreviews() {
        this._previewObserver?.disconnect();
        this._previewRecords.forEach((record) => this._unmountPreview(record));
        this._previewRecords = new Map();
    }

    _renderPreviewUnavailable(preview) {
        if (!preview) return;
        const message = document.createElement('div');
        message.className = 'card-preview-unavailable';
        message.textContent = 'Preview unavailable';
        preview.querySelector('.card-preview-unavailable')?.remove();
        preview.insertBefore(message, preview.firstChild);
    }

    _getExampleType(documentModel) {
        if (isShaderDocument(documentModel)) return 'shader';
        const framework = String(documentModel?.metadata?.framework || '').trim().toLowerCase();
        if (framework === 'vue') return 'vue';
        if (framework === 'react') return 'react';
        const files = documentModel?.files || [];
        const blocks = documentModel?.blocks || [];
        if (files.some((f) => f.language === 'svg') || blocks.some((b) => b.type === 'svg')) return 'svg';
        const scriptOnlyBlock = getScriptOnlyBlock(documentModel);
        if (scriptOnlyBlock) return scriptOnlyBlock.type === 'typescript' ? 'ts' : 'js';
        return 'html';
    }

    _renderTypeFilters() {
        if (!this.filtersContainer) return;
        this.filtersContainer.innerHTML = '';

        for (const [type, meta] of Object.entries(EXAMPLE_TYPE_META)) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `gallery-filter-btn ${meta.className}`;
            btn.dataset.filterType = type;
            btn.textContent = meta.label;
            btn.addEventListener('click', () => this._setTypeFilter(type));
            this.filtersContainer.appendChild(btn);
        }
    }

    _updateTypeFilterCounts(typeCounts) {
        if (!this.filtersContainer) return;
        this.filtersContainer.querySelectorAll('.gallery-filter-btn').forEach((btn) => {
            const type = btn.dataset.filterType;
            const count = typeCounts[type] || 0;
            btn.classList.toggle('is-empty', count === 0);
            btn.disabled = count === 0 && this.activeTypeFilter !== type;
        });
    }

    _setTypeFilter(type) {
        this.activeTypeFilter = this.activeTypeFilter === type ? null : type;
        this._applyTypeFilter();
    }

    _applyTypeFilter() {
        if (!this.filtersContainer) return;

        this.filtersContainer.querySelectorAll('.gallery-filter-btn').forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.filterType === this.activeTypeFilter);
        });

        this.grid?.querySelectorAll('.example-card').forEach((card) => {
            if (!this.activeTypeFilter) {
                card.classList.remove('is-filtered-out');
            } else {
                card.classList.toggle('is-filtered-out', card.dataset.exampleType !== this.activeTypeFilter);
            }
        });
    }

    async _deleteExample(filename, topicPath = this.currentTopicPath) {
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
            showToast(`Delete failed: ${err.message}`, 'error');
        }
    }

    setMetaOverlayHidden(hidden) {
        this.metaOverlayHidden = hidden === true;
        window.localStorage.setItem(this.metaOverlayHiddenStorageKey, this.metaOverlayHidden ? '1' : '0');
        this._syncMetaToggle();
        this.grid?.classList.toggle('meta-overlay-hidden', this.metaOverlayHidden);
        this.grid?.querySelectorAll('.card-meta-overlay').forEach((overlay) => {
            overlay.classList.toggle('is-hidden', this.metaOverlayHidden);
        });
    }

    _syncMetaToggle() {
        if (!this.btnMetaToggle) return;
        this.btnMetaToggle.textContent = this.metaOverlayHidden ? 'Show Info' : 'Hide Info';
        this.btnMetaToggle.setAttribute('aria-pressed', String(!this.metaOverlayHidden));
        this.btnMetaToggle.title = this.metaOverlayHidden
            ? 'Show example info overlay'
            : 'Hide example info overlay';
    }

    _createEditorialOverlay(metadata) {
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

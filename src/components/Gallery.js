import { fetchExamples, fetchExample, removeExample } from '../utils/api.js';
import { compileExample } from '../utils/compileClient.js';
import {
    formatExampleRatingStars,
    getExampleImportanceMeta,
    hasExampleEditorialMetadata,
} from '../utils/exampleEditorial.js';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../utils/exampleRenderer.js';
import {
    getExampleEditorialMetadata,
    getExampleStage,
    isShaderDocument,
    parseExampleDocument,
} from '../utils/markdown.js';

const EXAMPLE_STAGE_META = {
    minimal: { label: 'Minimal', rank: 0, className: 'stage-minimal' },
    intermediate: { label: 'Intermediate', rank: 1, className: 'stage-intermediate' },
    'common-error': { label: 'Common Error', rank: 2, className: 'stage-common-error' },
    exercise: { label: 'Exercise', rank: 3, className: 'stage-exercise' },
    'final-solution': { label: 'Final Solution', rank: 4, className: 'stage-final-solution' },
};

export class Gallery {
    constructor({ onExampleSelect }) {
        this.view = document.getElementById('gallery-view');
        this.grid = document.getElementById('gallery-grid');
        this.btnMetaToggle = document.getElementById('btn-gallery-meta-toggle');
        this.onExampleSelect = onExampleSelect;
        this.currentTopicPath = null;
        this.metaOverlayHiddenStorageKey = 'learncode.gallery.metaOverlayHidden';
        this.metaOverlayHidden = window.localStorage.getItem(this.metaOverlayHiddenStorageKey) === '1';

        this.btnMetaToggle?.addEventListener('click', () => {
            this.setMetaOverlayHidden(!this.metaOverlayHidden);
        });
        this._syncMetaToggle();
    }

    show() {
        this.view.classList.remove('hidden');
    }

    hide() {
        this.view.classList.add('hidden');
    }

    async load(topicPath) {
        this.currentTopicPath = topicPath;
        this.grid.innerHTML = '<div class="loading">Loading examples...</div>';

        try {
            const examples = await fetchExamples(topicPath);
            await this.render(examples);
        } catch (err) {
            console.error(err);
            this.grid.innerHTML = '<div class="error">Failed to load examples</div>';
        }
    }

    async render(examples) {
        this.grid.innerHTML = '';
        this.grid.classList.toggle('meta-overlay-hidden', this.metaOverlayHidden);

        if (examples.length === 0) {
            this.grid.innerHTML = '<div class="empty-state">No examples yet</div>';
            return;
        }

        const cards = await Promise.all(examples.map((filename) => this.createCard(filename)));
        cards
            .sort((left, right) => {
                if (left.stageRank !== right.stageRank) {
                    return left.stageRank - right.stageRank;
                }

                return left.filename.localeCompare(right.filename);
            })
            .forEach((card) => this.grid.appendChild(card.element));
    }

    async createCard(filename) {
        const div = document.createElement('div');
        div.className = 'example-card';
        div.title = filename;

        const preview = document.createElement('div');
        preview.className = 'card-preview';

        try {
            const data = await fetchExample(this.currentTopicPath, filename);
            if (data?.content) {
                const documentModel = parseExampleDocument(data.content);
                const editorialMetadata = getExampleEditorialMetadata(documentModel);
                const stage = getExampleStage(documentModel);
                const stageMeta = EXAMPLE_STAGE_META[stage] || null;
                if (stageMeta) {
                    div.dataset.stage = stage;
                    div.dataset.stageRank = String(stageMeta.rank);
                }
                const iframe = document.createElement('iframe');
                iframe.sandbox = 'allow-scripts';

                if (isShaderDocument(documentModel)) {
                    iframe.srcdoc = renderShaderExampleDocument(documentModel, {
                        diagnostics: documentModel.diagnostics || [],
                        renderId: 0,
                        shaderControls: {
                            paused: true,
                            stillFrame: true,
                        },
                        topicPath: this.currentTopicPath,
                    });
                } else {
                    const result = await compileExample({ document: documentModel });
                    iframe.srcdoc = renderCompiledExampleDocument(
                        result.compiledDocument,
                        this.currentTopicPath,
                        result.compileDiagnostics || []
                    );
                }

                preview.appendChild(iframe);
                preview.appendChild(this._createEditorialOverlay(editorialMetadata));
            }
        } catch (err) {
            console.error(`Failed to load preview for ${filename}`, err);
            preview.textContent = 'Preview unavailable';
            preview.style.display = 'flex';
            preview.style.alignItems = 'center';
            preview.style.justifyContent = 'center';
            preview.style.color = '#888';
            preview.style.fontSize = '12px';
        }

        const footer = document.createElement('div');
        footer.className = 'card-footer';
        const title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = filename;
        footer.appendChild(title);

        const stage = div.dataset.stage || '';
        const stageMeta = EXAMPLE_STAGE_META[stage] || null;
        if (stageMeta) {
            const badge = document.createElement('span');
            badge.className = `card-stage-badge ${stageMeta.className}`;
            badge.textContent = stageMeta.label;
            footer.appendChild(badge);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'card-delete-btn';
        deleteBtn.title = 'Delete example';
        deleteBtn.setAttribute('aria-label', 'Delete example');
        deleteBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            this._deleteExample(filename);
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
            filename,
            stageRank: stageMeta?.rank ?? Number.MAX_SAFE_INTEGER,
        };
    }

    async _deleteExample(filename) {
        if (!this.currentTopicPath) return;
        if (!window.confirm(`Delete "${filename}"?`)) return;

        try {
            await removeExample(this.currentTopicPath, filename);
            await this.load(this.currentTopicPath);
        } catch (err) {
            console.error('Failed to delete example:', err);
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

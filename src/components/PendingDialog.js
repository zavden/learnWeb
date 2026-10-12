import { fetchExample } from '../utils/api.js';
import { compileExample } from '../utils/compileClient.js';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../utils/exampleRenderer.js';
import { getExampleStage, isShaderDocument, parseExampleDocument } from '../utils/markdown.js';

const EXAMPLE_STAGE_META = {
    minimal: { label: 'Minimal', rank: 0, className: 'stage-minimal' },
    intermediate: { label: 'Intermediate', rank: 1, className: 'stage-intermediate' },
    'common-error': { label: 'Common Error', rank: 2, className: 'stage-common-error' },
    exercise: { label: 'Exercise', rank: 3, className: 'stage-exercise' },
    'final-solution': { label: 'Final Solution', rank: 4, className: 'stage-final-solution' },
    professional: { label: 'Professional', rank: 5, className: 'stage-professional' },
};

export class PendingDialog {
    constructor({ getTopicLabel, onExampleSelect, onRemovePending }) {
        this.onExampleSelect = onExampleSelect;
        this.getTopicLabel = getTopicLabel;
        this.onRemovePending = onRemovePending;
        this.dialog = document.getElementById('pending-dialog');
        this.grid = document.getElementById('pending-grid');
        this.empty = document.getElementById('pending-empty');
        this.note = document.getElementById('pending-dialog-note');
        this.btnClose = document.getElementById('pending-dialog-close');
        this.btnCloseIcon = document.getElementById('pending-dialog-close-icon');

        this._renderToken = 0;

        this.btnClose?.addEventListener('click', () => this.dialog?.close());
        this.btnCloseIcon?.addEventListener('click', () => this.dialog?.close());
        // Drop preview iframes when the dialog closes so they stop running.
        this.dialog?.addEventListener('close', () => this._releasePreviews());
    }

    _releasePreviews() {
        this._renderToken += 1;
        this.grid?.querySelectorAll('iframe').forEach((iframe) => iframe.remove());
    }

    open(entries = []) {
        this.render(entries);
        this.dialog?.showModal();
    }

    async render(entries = []) {
        if (!this.grid || !this.empty || !this.note) return;

        const renderToken = ++this._renderToken;
        this.grid.innerHTML = '';
        this.note.textContent = entries.length === 0
            ? 'Your pending list is empty.'
            : `${entries.length} pending item${entries.length === 1 ? '' : 's'} across all topics.`;

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
        cards.forEach((card) => this.grid.appendChild(card));
    }

    async _createCard(entry) {
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

                    if (isShaderDocument(documentModel)) {
                        iframe.srcdoc = renderShaderExampleDocument(documentModel, {
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
                        iframe.srcdoc = renderCompiledExampleDocument(
                            result.compiledDocument,
                            entry.topicPath,
                            result.compileDiagnostics || []
                        );
                    }

                    preview.appendChild(iframe);
                }
            } catch (error) {
                console.error(`Failed to load pending preview for ${entry.path}`, error);
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
        title.textContent = entry.filename || 'Missing pending';
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
            await this.onRemovePending?.(entry.path);
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

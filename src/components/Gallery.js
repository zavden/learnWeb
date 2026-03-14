import { fetchExamples, fetchExample } from '../utils/api.js';
import { compileExample } from '../utils/compileClient.js';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../utils/exampleRenderer.js';
import { getExampleStage, isShaderDocument, parseExampleDocument } from '../utils/markdown.js';

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
        this.onExampleSelect = onExampleSelect;
        this.currentTopicPath = null;
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
}

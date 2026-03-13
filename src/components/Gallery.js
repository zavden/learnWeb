import { fetchExamples, fetchExample } from '../utils/api.js';
import { parseExampleDocument } from '../utils/markdown.js';
import { renderExampleDocument } from '../utils/exampleRenderer.js';

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

        for (const filename of examples) {
            const card = await this.createCard(filename);
            this.grid.appendChild(card);
        }
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
                const iframe = document.createElement('iframe');
                iframe.sandbox = 'allow-scripts';
                iframe.srcdoc = renderExampleDocument(documentModel, this.currentTopicPath);
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

        div.appendChild(preview);
        div.appendChild(footer);

        div.addEventListener('click', () => {
            if (this.onExampleSelect) {
                this.onExampleSelect(filename);
            }
        });

        return div;
    }
}

import { fetchTopicAssets } from '../utils/api.js';
import { highlightCode } from '../utils/theoryRenderer.js';

// Read-only browser for the files in a topic's assets/ folder (data files, helper scripts,
// stylesheets, images) that examples load with relative URLs.

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'ico', 'bmp']);
const TEXT_LANGUAGES = {
    css: 'css',
    csv: 'plaintext',
    htm: 'html',
    html: 'html',
    js: 'javascript',
    json: 'json',
    md: 'markdown',
    mjs: 'javascript',
    scss: 'scss',
    svg: 'xml',
    ts: 'typescript',
    txt: 'plaintext',
    wgsl: 'plaintext',
    glsl: 'glsl',
    xml: 'xml',
};
const MAX_TEXT_BYTES = 400_000;

function getExtension(filename = '') {
    const name = String(filename).split('/').pop() || '';
    return name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
}

function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export class AssetsDialog {
    constructor() {
        this.dialog = document.getElementById('assets-dialog');
        this.title = document.getElementById('assets-dialog-title');
        this.list = document.getElementById('assets-dialog-list');
        this.viewer = document.getElementById('assets-dialog-viewer');
        this.btnClose = document.getElementById('assets-dialog-close');
        this.btnCloseIcon = document.getElementById('assets-dialog-close-icon');
        this.topicPath = '';
        this.request = 0;

        this.btnClose?.addEventListener('click', () => this.dialog?.close());
        this.btnCloseIcon?.addEventListener('click', () => this.dialog?.close());
        this.dialog?.addEventListener('close', () => {
            this.request += 1;
            this.viewer?.replaceChildren();
        });
    }

    async open(topicPath, { topicLabel = '' } = {}) {
        if (!this.dialog || !topicPath) return;
        this.topicPath = topicPath;
        const request = ++this.request;
        this.title.textContent = topicLabel ? `Assets · ${topicLabel}` : 'Assets';
        this.list.replaceChildren(this._message('Loading…'));
        this.viewer.replaceChildren(this._message('Pick a file to see it.'));
        if (!this.dialog.open) this.dialog.showModal();

        let assets = [];
        try {
            assets = await fetchTopicAssets(topicPath);
        } catch (error) {
            if (request !== this.request) return;
            this.list.replaceChildren(this._message(`Could not list assets: ${error.message}`));
            return;
        }
        if (request !== this.request) return;

        if (!Array.isArray(assets) || assets.length === 0) {
            this.list.replaceChildren(this._message('This topic has no assets/ folder files.'));
            this.viewer.replaceChildren(this._message('Examples load files from assets/ with relative URLs, e.g. fetch(\'data.json\').'));
            return;
        }

        this.list.replaceChildren(...assets.map((asset) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'assets-dialog-item';
            button.textContent = asset.path || asset.filename;
            button.title = asset.path || asset.filename;
            button.addEventListener('click', () => {
                this.list.querySelectorAll('.assets-dialog-item.is-active').forEach((item) => item.classList.remove('is-active'));
                button.classList.add('is-active');
                this._show(asset);
            });
            return button;
        }));
        this.list.querySelector('.assets-dialog-item')?.click();
    }

    async _show(asset) {
        const request = ++this.request;
        const path = asset.path || asset.filename;
        const extension = getExtension(path);
        const header = document.createElement('div');
        header.className = 'assets-dialog-viewer-header';
        const name = document.createElement('code');
        name.textContent = path;
        const raw = document.createElement('a');
        raw.href = asset.url;
        raw.target = '_blank';
        raw.rel = 'noopener';
        raw.textContent = 'Open raw ↗';
        header.append(name, raw);

        if (IMAGE_EXTENSIONS.has(extension)) {
            const image = document.createElement('img');
            image.src = asset.url;
            image.alt = path;
            image.className = 'assets-dialog-image';
            this.viewer.replaceChildren(header, image);
            if (extension !== 'svg') return;
        }

        const language = TEXT_LANGUAGES[extension];
        if (!language) {
            this.viewer.replaceChildren(header, this._message('Binary file: use «Open raw» to download or inspect it.'));
            return;
        }

        try {
            const response = await fetch(asset.url);
            const size = Number(response.headers.get('content-length'));
            if (size > MAX_TEXT_BYTES) {
                if (request === this.request) this.viewer.replaceChildren(header, this._message(`Large file (${formatBytes(size)}): use «Open raw».`));
                return;
            }
            const text = await response.text();
            if (request !== this.request) return;
            const pre = document.createElement('pre');
            pre.className = 'assets-dialog-code';
            const code = document.createElement('code');
            code.className = 'hljs';
            code.innerHTML = language === 'plaintext'
                ? text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
                : highlightCode(text, language);
            pre.appendChild(code);
            if (IMAGE_EXTENSIONS.has(extension)) this.viewer.append(pre);
            else this.viewer.replaceChildren(header, pre);
        } catch (error) {
            if (request === this.request) this.viewer.replaceChildren(header, this._message(`Could not load the file: ${error.message}`));
        }
    }

    _message(text) {
        const paragraph = document.createElement('p');
        paragraph.className = 'dialog-hint assets-dialog-message';
        paragraph.textContent = text;
        return paragraph;
    }
}

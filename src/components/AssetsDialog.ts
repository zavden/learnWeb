// ─── Assets Dialog ──────────────────────────────────────
// Read-only browser for the files in a topic's assets/ folder (data files, helper scripts,
// stylesheets, images) that examples load with relative URLs. Created once by the app shell
// (src/main.ts), which opens it from the gallery's "Assets" button; the file list comes from
// `fetchTopicAssets` (src/utils/api.ts) and code is highlighted with `highlightCode`
// (src/utils/theoryRenderer.ts).
//
// Worth knowing before editing:
// - `request` is a generation counter, bumped by `open`, by `_show` and when the dialog closes. An async
//   step that finds a newer value drops its result, so a slow file never overwrites the one picked after it.
// - Images are shown as `<img>`; SVG additionally falls through to the text viewer, so its source is
//   listed under the picture. Extensions missing from `TEXT_LANGUAGES` count as binary.

import { fetchTopicAssets } from '../utils/api.ts';
import { byId } from '../utils/dom.ts';
import { errorMessage } from '../utils/errors.ts';
import { highlightCode } from '../utils/theoryRenderer.ts';
import type { TopicAsset, TopicAssetsResponse } from '../types/api.ts';

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'ico', 'bmp']);
/** File extension (lower case) to the highlight.js language used to show the file; `plaintext` is escaped, not highlighted. */
const TEXT_LANGUAGES: Readonly<Record<string, string | undefined>> = {
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
/** Text files whose `content-length` is above this are not loaded into the viewer. */
const MAX_TEXT_BYTES = 400_000;

/** Lower-case extension of the last path segment, or `''` when it has none. */
function getExtension(filename: string = ''): string {
    const name = String(filename).split('/').pop() || '';
    return name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
}

function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Options of {@link AssetsDialog.open}. */
export interface AssetsDialogOpenOptions {
    /** Shown in the dialog title (`Assets · <label>`); the plain title `Assets` when empty. */
    topicLabel?: string;
}

/** The assets dialog: a file list on the left, a viewer on the right. Call `open` to show it for a topic. */
export class AssetsDialog {
    private readonly dialog: HTMLDialogElement | null;
    private readonly title: HTMLElement;
    private readonly list: HTMLElement;
    private readonly viewer: HTMLElement;
    private readonly btnClose: HTMLElement | null;
    private readonly btnCloseIcon: HTMLElement | null;
    private topicPath: string;
    /** Generation counter, see the header comment. */
    private request: number;

    constructor() {
        this.dialog = document.getElementById('assets-dialog') as HTMLDialogElement | null;
        this.title = byId('assets-dialog-title');
        this.list = byId('assets-dialog-list');
        this.viewer = byId('assets-dialog-viewer');
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

    /**
     * Opens the dialog for the assets of `topicPath` (`chapterId/sectionId/topicId`) and shows the first file.
     * Does nothing without a dialog element or a topic path.
     */
    async open(topicPath: string, { topicLabel = '' }: AssetsDialogOpenOptions = {}): Promise<void> {
        if (!this.dialog || !topicPath) return;
        this.topicPath = topicPath;
        const request = ++this.request;
        this.title.textContent = topicLabel ? `Assets · ${topicLabel}` : 'Assets';
        this.list.replaceChildren(this._message('Loading…'));
        this.viewer.replaceChildren(this._message('Pick a file to see it.'));
        if (!this.dialog.open) this.dialog.showModal();

        let assets: TopicAssetsResponse = [];
        try {
            assets = await fetchTopicAssets(topicPath);
        } catch (error) {
            if (request !== this.request) return;
            this.list.replaceChildren(this._message(`Could not list assets: ${errorMessage(error)}`));
            return;
        }
        if (request !== this.request) return;

        if (!Array.isArray(assets) || assets.length === 0) {
            this.list.replaceChildren(this._message('This topic has no assets/ folder files.'));
            this.viewer.replaceChildren(
                this._message("Examples load files from assets/ with relative URLs, e.g. fetch('data.json')."),
            );
            return;
        }

        this.list.replaceChildren(
            ...assets.map((asset) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'assets-dialog-item';
                button.textContent = asset.path || asset.filename;
                button.title = asset.path || asset.filename;
                button.addEventListener('click', () => {
                    this.list
                        .querySelectorAll('.assets-dialog-item.is-active')
                        .forEach((item) => item.classList.remove('is-active'));
                    button.classList.add('is-active');
                    this._show(asset);
                });
                return button;
            }),
        );
        this.list.querySelector<HTMLElement>('.assets-dialog-item')?.click();
    }

    /** Shows one asset in the viewer pane: an image, highlighted text, or a hint to open it raw. */
    private async _show(asset: TopicAsset): Promise<void> {
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
            this.viewer.replaceChildren(
                header,
                this._message('Binary file: use «Open raw» to download or inspect it.'),
            );
            return;
        }

        try {
            const response = await fetch(asset.url);
            const size = Number(response.headers.get('content-length'));
            if (size > MAX_TEXT_BYTES) {
                if (request === this.request)
                    this.viewer.replaceChildren(
                        header,
                        this._message(`Large file (${formatBytes(size)}): use «Open raw».`),
                    );
                return;
            }
            const text = await response.text();
            if (request !== this.request) return;
            const pre = document.createElement('pre');
            pre.className = 'assets-dialog-code';
            const code = document.createElement('code');
            code.className = 'hljs';
            code.innerHTML =
                language === 'plaintext'
                    ? text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
                    : highlightCode(text, language);
            pre.appendChild(code);
            if (IMAGE_EXTENSIONS.has(extension)) this.viewer.append(pre);
            else this.viewer.replaceChildren(header, pre);
        } catch (error) {
            if (request === this.request)
                this.viewer.replaceChildren(header, this._message(`Could not load the file: ${errorMessage(error)}`));
        }
    }

    private _message(text: string): HTMLParagraphElement {
        const paragraph = document.createElement('p');
        paragraph.className = 'dialog-hint assets-dialog-message';
        paragraph.textContent = text;
        return paragraph;
    }
}

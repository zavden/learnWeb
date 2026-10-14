import { fetchExample } from '../utils/api.js';
import { compileExample } from '../utils/compileClient.js';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../utils/exampleRenderer.js';
import { getExampleEditorialMetadata, isShaderDocument, parseExampleDocument } from '../utils/markdown.js';
import { HOSTED_PREVIEW_SANDBOX, markHostedPreviewUnavailable, publishPreviewDocument } from '../utils/renderer/previewHost.js';
import { consoleManagerMixin } from './preview/ConsoleManager.js';

// The dialog console reuses the main console's value rendering, so objects expand on click
// (down to [[Prototype]]) by asking the dialog's iframe, exactly as in the editor preview.
const BORROWED_CONSOLE_METHODS = [
    '_createConsoleValueSpan',
    '_rejectPendingConsoleInspects',
    '_renderConsoleParts',
    '_renderConsoleProperty',
    '_renderConsoleValue',
    '_requestConsoleInspect',
    '_resolveConsoleInspect',
    '_sanitizeConsoleStyle',
];

// Same safety net as the editor preview: a hosted page that never boots falls back to srcdoc.
const HOSTED_READY_TIMEOUT_MS = 4000;

// TypeScript type errors don't stop the example (the JavaScript still runs), so the dialog lists
// them above the console, numbered by line of the TypeScript block, as the course texts quote them.
function buildTypeErrorsStrip(typeErrors) {
    const strip = document.createElement('section');
    strip.className = 'theory-exercise-dialog-types';
    strip.setAttribute('aria-label', 'Errores de tipos');
    const title = document.createElement('p');
    title.className = 'theory-exercise-dialog-types-title';
    title.textContent = 'Errores de tipos (el código se ejecuta igual)';
    const list = document.createElement('ol');
    typeErrors.forEach((diagnostic) => {
        const item = document.createElement('li');
        item.textContent = `${diagnostic.line ? `línea ${diagnostic.line}: ` : ''}${diagnostic.message}`;
        list.appendChild(item);
    });
    strip.append(title, list);
    return strip;
}

function buildConsoleTable({ header, rows }) {
    const table = document.createElement('table');
    table.className = 'theory-exercise-dialog-console-table';
    const headRow = table.createTHead().insertRow();
    header.forEach((label) => {
        const cell = document.createElement('th');
        cell.textContent = String(label);
        headRow.appendChild(cell);
    });
    const body = table.createTBody();
    rows.slice(0, 200).forEach((cells) => {
        const row = body.insertRow();
        cells.forEach((value) => {
            row.insertCell().textContent = String(value ?? '');
        });
    });
    return table;
}

export class TheoryExerciseDialog {
    constructor({ onOpenExample } = {}) {
        this.onOpenExample = onOpenExample;
        this.dialog = document.getElementById('theory-exercise-dialog');
        this.title = document.getElementById('theory-exercise-dialog-title');
        this.note = document.getElementById('theory-exercise-dialog-note');
        this.stage = document.getElementById('theory-exercise-dialog-stage');
        this.empty = document.getElementById('theory-exercise-dialog-empty');
        this.btnOpen = document.getElementById('theory-exercise-dialog-open');
        this.btnClose = document.getElementById('theory-exercise-dialog-close');
        this.btnCloseIcon = document.getElementById('theory-exercise-dialog-close-icon');
        this.currentRequest = null;
        this.currentTopicPath = '';
        this.currentFilename = '';
        this.currentFrame = null;
        this.consoleList = null;
        this.consoleCount = 0;
        this.renderCount = 0;
        this.hostedWatchdog = null;
        // State used by the borrowed console methods (see BORROWED_CONSOLE_METHODS).
        this.iframe = null;
        this._renderToken = 0;
        this._consoleInspectRequests = new Map();
        this._consoleInspectSequence = 0;

        // Console output of the previewed example (theory pages have no console of their own).
        window.addEventListener('message', (event) => this._handleFrameMessage(event));

        this.btnClose?.addEventListener('click', () => this.dialog?.close());
        this.btnCloseIcon?.addEventListener('click', () => this.dialog?.close());
        // Remove the live preview on close so it stops running in the background.
        this.dialog?.addEventListener('close', () => {
            clearTimeout(this.hostedWatchdog);
            this._rejectPendingConsoleInspects();
            this.currentRequest = null;
            this.currentFrame = null;
            this.iframe = null;
            this.consoleList = null;
            if (this.stage) {
                this.stage.innerHTML = '';
            }
        });
        this.btnOpen?.addEventListener('click', async () => {
            if (!this.currentTopicPath || !this.currentFilename) return;
            this.dialog?.close();
            await this.onOpenExample?.(this.currentTopicPath, this.currentFilename);
        });
    }

    async open({ topicPath, filename }) {
        this.currentTopicPath = String(topicPath || '').trim();
        this.currentFilename = String(filename || '').trim();
        this.currentRequest = `${this.currentTopicPath}::${this.currentFilename}::${Date.now()}`;
        const requestId = this.currentRequest;

        this._renderLoading();
        if (this.dialog && !this.dialog.open) {
            this.dialog.showModal();
        }

        if (!this.currentTopicPath || !this.currentFilename) {
            this._renderMissing('Exercise reference is incomplete.');
            return;
        }

        try {
            const data = await fetchExample(this.currentTopicPath, this.currentFilename);
            if (requestId !== this.currentRequest) return;

            const documentModel = parseExampleDocument(data?.content || '');
            const editorial = getExampleEditorialMetadata(documentModel);
            const iframe = document.createElement('iframe');
            iframe.sandbox = 'allow-scripts';
            this.renderCount += 1;
            const renderId = this.renderCount;
            let typeErrors = [];

            if (isShaderDocument(documentModel)) {
                iframe.srcdoc = renderShaderExampleDocument(documentModel, {
                    diagnostics: documentModel.diagnostics || [],
                    renderId: 0,
                    shaderControls: {
                        paused: true,
                        stillFrame: false,
                    },
                    topicPath: this.currentTopicPath,
                });
            } else {
                const result = await compileExample({ document: documentModel });
                if (requestId !== this.currentRequest) return;
                const diagnostics = result.compileDiagnostics || [];
                typeErrors = diagnostics.filter((diagnostic) => diagnostic.code === 'typescript-type');
                const renderSrcdoc = () => renderCompiledExampleDocument(
                    result.compiledDocument,
                    this.currentTopicPath,
                    diagnostics,
                    { consoleEnabled: true, renderId }
                );
                // Like the editor preview, the example runs as a real page on the preview origin
                // (storage, cookies, IndexedDB, history.pushState, same-origin requests); the
                // sandboxed srcdoc copy is only the fallback.
                const hostedUrl = await publishPreviewDocument({
                    html: renderCompiledExampleDocument(
                        result.compiledDocument,
                        this.currentTopicPath,
                        diagnostics,
                        { consoleEnabled: true, hosted: true, renderId }
                    ),
                    renderId,
                    topicPath: this.currentTopicPath,
                });
                if (requestId !== this.currentRequest) return;
                if (hostedUrl) {
                    this._loadHosted(iframe, hostedUrl, renderSrcdoc, requestId);
                } else {
                    iframe.srcdoc = renderSrcdoc();
                }
            }

            // Script-only examples have nothing to show on the page: give the space to the console.
            const consoleOnly = !isShaderDocument(documentModel)
                && !(documentModel.blocks || []).some((block) => block.slot === 'markup' && String(block.content || '').trim());

            this._renderPreview({
                consoleOnly,
                renderId: isShaderDocument(documentModel) ? 0 : renderId,
                description: editorial.description || '',
                iframe,
                path: `/${this.currentTopicPath}/examples/${this.currentFilename}`,
                title: editorial.description || this.currentFilename,
                typeErrors,
            });
        } catch (error) {
            if (requestId !== this.currentRequest) return;
            console.error('Failed to render theory exercise preview.', error);
            this._renderMissing(`Preview unavailable: ${error.message}`);
        }
    }

    _renderLoading() {
        if (!this.stage || !this.empty || !this.title || !this.note || !this.btnOpen) return;
        this.stage.innerHTML = '';
        this.empty.classList.remove('hidden');
        this.empty.textContent = 'Loading exercise preview...';
        this.title.textContent = this.currentFilename || 'Exercise Preview';
        this.note.textContent = 'Resolving the referenced exercise from the current topic.';
        this.btnOpen.disabled = true;
    }

    _renderMissing(message) {
        if (!this.stage || !this.empty || !this.title || !this.note || !this.btnOpen) return;
        this.stage.innerHTML = '';
        this.empty.classList.remove('hidden');
        this.empty.textContent = message || 'Exercise not found.';
        this.title.textContent = this.currentFilename || 'Missing Exercise';
        this.note.textContent = 'The referenced exercise could not be loaded from this topic.';
        this.btnOpen.disabled = true;
    }

    _loadHosted(iframe, url, renderSrcdoc, requestId) {
        iframe.sandbox = HOSTED_PREVIEW_SANDBOX;
        // The same permissions as the editor preview (fullscreen, clipboard, camera…).
        const allow = document.getElementById('preview-frame')?.getAttribute('allow');
        if (allow) iframe.setAttribute('allow', allow);
        iframe.src = url;
        this.frameReady = false;
        clearTimeout(this.hostedWatchdog);
        this.hostedWatchdog = setTimeout(() => {
            if (requestId !== this.currentRequest || this.currentFrame !== iframe || this.frameReady) return;
            markHostedPreviewUnavailable();
            iframe.removeAttribute('src');
            // Drop `allow-same-origin` before loading the srcdoc copy.
            iframe.sandbox = 'allow-scripts';
            iframe.srcdoc = renderSrcdoc();
        }, HOSTED_READY_TIMEOUT_MS);
    }

    _renderPreview({ iframe, title, description, path, consoleOnly = false, renderId = 0, typeErrors = [] }) {
        if (!this.stage || !this.empty || !this.title || !this.note || !this.btnOpen) return;
        this.stage.innerHTML = '';
        this.stage.classList.toggle('is-console-only', consoleOnly);
        this._rejectPendingConsoleInspects();
        this.currentFrame = iframe;
        this.iframe = iframe;
        this._renderToken = renderId;
        this.consoleCount = 0;
        this.consoleList = document.createElement('ol');
        this.consoleList.className = 'theory-exercise-dialog-console hidden';
        this.consoleList.setAttribute('aria-label', 'Console output');
        this.stage.appendChild(iframe);
        if (typeErrors.length > 0) this.stage.appendChild(buildTypeErrorsStrip(typeErrors));
        this.stage.appendChild(this.consoleList);
        this.empty.classList.add('hidden');
        this.title.textContent = title || this.currentFilename || 'Exercise Preview';
        this.note.textContent = description || path || 'Interactive preview of the referenced exercise.';
        this.btnOpen.disabled = false;
    }

    _handleFrameMessage(event) {
        const data = event?.data;
        if (!data || data.source !== 'learncode-preview' || !this.currentFrame || !this.consoleList) return;
        if (event.source !== this.currentFrame.contentWindow) return;

        if (data.kind === 'runtime-ready') {
            this.frameReady = true;
            clearTimeout(this.hostedWatchdog);
            return;
        }
        if (data.kind === 'inspect-result') {
            this._resolveConsoleInspect(data);
            return;
        }
        if (data.kind === 'console-clear') {
            this.consoleList.replaceChildren();
            this.consoleCount = 0;
            this.consoleList.classList.add('hidden');
            return;
        }
        if (!['console', 'runtime-error', 'unhandled-rejection'].includes(data.kind)) return;
        if (this.consoleCount >= 500) return;

        const level = ['error', 'warn', 'info', 'debug'].includes(data.level) ? data.level : 'log';
        const item = document.createElement('li');
        item.className = `theory-exercise-dialog-console-entry is-${level}`;
        const depth = Array.isArray(data.groups) ? data.groups.length : 0;
        if (depth > 0) item.style.paddingInlineStart = `${10 + depth * 14}px`;
        if (Array.isArray(data.parts) && data.parts.length > 0) {
            this._renderConsoleParts(item, data.parts);
        } else {
            item.textContent = String(data.text ?? (Array.isArray(data.values) ? data.values.join(' ') : ''));
        }
        if (data.kind === 'runtime-error' && data.line) item.append(`  (line ${data.line})`);
        if (data.table && Array.isArray(data.table.header) && Array.isArray(data.table.rows)) {
            item.appendChild(buildConsoleTable(data.table));
        }
        this.consoleList.appendChild(item);
        this.consoleCount += 1;
        this.consoleList.classList.remove('hidden');
        if (this.consoleCount === 500) {
            const note = document.createElement('li');
            note.className = 'theory-exercise-dialog-console-entry is-info';
            note.textContent = '… more output in the editor (Open Exercise).';
            this.consoleList.appendChild(note);
        }
        this.consoleList.scrollTop = this.consoleList.scrollHeight;
    }
}

BORROWED_CONSOLE_METHODS.forEach((name) => {
    TheoryExerciseDialog.prototype[name] = consoleManagerMixin[name];
});

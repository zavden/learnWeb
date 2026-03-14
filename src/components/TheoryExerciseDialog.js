import { fetchExample } from '../utils/api.js';
import { compileExample } from '../utils/compileClient.js';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../utils/exampleRenderer.js';
import { getExampleEditorialMetadata, isShaderDocument, parseExampleDocument } from '../utils/markdown.js';

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

        this.btnClose?.addEventListener('click', () => this.dialog?.close());
        this.btnCloseIcon?.addEventListener('click', () => this.dialog?.close());
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
                iframe.srcdoc = renderCompiledExampleDocument(
                    result.compiledDocument,
                    this.currentTopicPath,
                    result.compileDiagnostics || []
                );
            }

            this._renderPreview({
                description: editorial.description || '',
                iframe,
                path: `/${this.currentTopicPath}/examples/${this.currentFilename}`,
                title: editorial.description || this.currentFilename,
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

    _renderPreview({ iframe, title, description, path }) {
        if (!this.stage || !this.empty || !this.title || !this.note || !this.btnOpen) return;
        this.stage.innerHTML = '';
        this.stage.appendChild(iframe);
        this.empty.classList.add('hidden');
        this.title.textContent = title || this.currentFilename || 'Exercise Preview';
        this.note.textContent = description || path || 'Interactive preview of the referenced exercise.';
        this.btnOpen.disabled = false;
    }
}

import { compileExample } from '../utils/api.js';
import { renderCompiledExampleDocument } from '../utils/exampleRenderer.js';

export class Preview {
    constructor({ onCompileStateChange } = {}) {
        this.iframe = document.getElementById('preview-frame');
        this.btnRefresh = document.getElementById('btn-refresh');
        this._debounceTimer = null;
        this._currentTopicPath = null;
        this._lastDocument = null;
        this._renderToken = 0;
        this._onCompileStateChange = onCompileStateChange;

        this.btnRefresh.addEventListener('click', () => {
            if (this._lastDocument) this.update(this._lastDocument);
        });
    }

    setTopicPath(topicPath) {
        this._currentTopicPath = topicPath;
    }

    update(documentModel) {
        this._lastDocument = documentModel;

        clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => {
            this._render(documentModel);
        }, 300);
    }

    clear() {
        this._lastDocument = null;
        this._renderToken += 1;
        clearTimeout(this._debounceTimer);
        this.iframe.srcdoc = renderCompiledExampleDocument({}, this._currentTopicPath, []);
        this._emitCompileState([]);
    }

    async _render(documentModel) {
        const renderToken = ++this._renderToken;

        try {
            const result = await compileExample({ document: documentModel });
            if (renderToken !== this._renderToken) return;

            const diagnostics = result.compileDiagnostics || [];
            this.iframe.srcdoc = renderCompiledExampleDocument(
                result.compiledDocument,
                this._currentTopicPath,
                diagnostics
            );
            this._emitCompileState(diagnostics);
        } catch (err) {
            if (renderToken !== this._renderToken) return;

            const diagnostics = [
                {
                    level: 'error',
                    code: 'preview-compile-request-failed',
                    message: err.message,
                },
            ];

            this.iframe.srcdoc = renderCompiledExampleDocument({}, this._currentTopicPath, diagnostics);
            this._emitCompileState(diagnostics);
        }
    }

    _emitCompileState(diagnostics) {
        if (this._onCompileStateChange) {
            this._onCompileStateChange(diagnostics);
        }
    }
}

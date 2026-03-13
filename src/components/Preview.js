import { renderExampleDocument } from '../utils/exampleRenderer.js';

export class Preview {
    constructor() {
        this.iframe = document.getElementById('preview-frame');
        this.btnRefresh = document.getElementById('btn-refresh');
        this._debounceTimer = null;
        this._currentTopicPath = null;
        this._lastDocument = null;

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
        clearTimeout(this._debounceTimer);
        this.iframe.srcdoc = renderExampleDocument({ blocks: [] }, this._currentTopicPath);
    }

    _render(documentModel) {
        this.iframe.srcdoc = renderExampleDocument(documentModel, this._currentTopicPath);
    }
}

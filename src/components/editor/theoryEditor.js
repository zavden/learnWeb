import { getExampleEditorialMetadata, buildExampleDocument, isShaderDocument } from '../../utils/markdown.js';
import { getTheoryDocumentContent, isTheoryDocument } from '../../utils/theoryDocument.js';
import { modifyTopicMain } from '../../utils/api.js';

export const theoryEditorMixin = {
    getDocumentTarget() {
        return this._isTheoryDocumentTarget() ? 'theory' : 'example';
    },

    isEditingTheoryDocument() {
        return this._isTheoryDocumentTarget();
    },

    getTheoryContent() {
        return getTheoryDocumentContent(this.currentDocument);
    },

    _isTheoryDocumentTarget() {
        return isTheoryDocument(this.currentDocument);
    },

    getCurrentEditorialMetadata() {
        if (this._isTheoryDocumentTarget()) return null;

        const metadata = getExampleEditorialMetadata(this.currentDocument);
        if (
            !String(metadata.description || '').trim()
            && (!Array.isArray(metadata.tags) || metadata.tags.length === 0)
            && !Number.isInteger(metadata.rating)
            && !String(metadata.importance || '').trim()
        ) {
            return null;
        }

        return metadata;
    },

    _getPersistableDocument() {
        if (!this._isShaderDocument() || !this.getShaderPersistedState) {
            return this.currentDocument;
        }

        const persistedState = this.getShaderPersistedState();
        if (!persistedState?.resolution) {
            return this.currentDocument;
        }

        return updateShaderResolution(this.currentDocument, persistedState.resolution);
    },

    async _handleModifyTheory() {
        if (!this.currentTopicPath || hasBlockingDiagnostics(this.currentDocument)) return false;

        const content = getTheoryDocumentContent(this.currentDocument);

        try {
            await modifyTopicMain(this.currentTopicPath, content);
            this._triggerChange();
            this._emitSessionStateChange();
            this._showToast('Theory saved: main.md', 'success');
            return true;
        } catch (error) {
            console.error(error);
            this._showToast(`Theory save failed: ${error.message}`, 'error');
            return false;
        }
    },

    async saveTheoryDocument() {
        return this._handleModifyTheory();
    },
};

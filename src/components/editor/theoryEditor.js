import { getExampleEditorialMetadata, buildExampleDocument, isShaderDocument, hasBlockingDiagnostics, parseExampleDocument, updateShaderResolution } from '../../utils/markdown.js';
import { getTheoryDocumentContent, isTheoryDocument } from '../../utils/theoryDocument.js';
import { modifyTopicMain, fetchExamples, fetchExample } from '../../utils/api.js';
import { compileExample } from '../../utils/compileClient.js';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../../utils/exampleRenderer.js';
import { loadSrcdocWhenLaidOut } from '../../utils/renderer/previewHost.js';

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
        let doc;

        if (!this._isShaderDocument() || !this.getShaderPersistedState) {
            doc = this.currentDocument;
        } else {
            const persistedState = this.getShaderPersistedState();
            doc = persistedState?.resolution
                ? updateShaderResolution(this.currentDocument, persistedState.resolution)
                : this.currentDocument;
        }

        return this._injectHighlightsIntoDocument(doc);
    },

    async _handleModifyTheory() {
        if (!this.currentTopicPath || hasBlockingDiagnostics(this.currentDocument)) return false;

        const documentBeforeSave = this.currentDocument;
        const content = getTheoryDocumentContent(documentBeforeSave);

        try {
            await modifyTopicMain(this.currentTopicPath, content);
            this._markDocumentSaved(documentBeforeSave, { recheck: true });
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

    _initExerciseEmbedDialog() {
        if (!this.btnInsertExerciseEmbed || !this.exerciseEmbedDialog) return;

        this.btnInsertExerciseEmbed.addEventListener('click', () => {
            this._openExerciseEmbedDialog();
        });

        this.btnExerciseEmbedDialogClose?.addEventListener('click', () => {
            this.exerciseEmbedDialog.close();
        });

        this.exerciseEmbedDialog.addEventListener('click', (event) => {
            if (event.target === this.exerciseEmbedDialog) {
                this.exerciseEmbedDialog.close();
            }
        });

        // Drop the preview iframes on close so they stop running in the background.
        this.exerciseEmbedDialog.addEventListener('close', () => {
            this._exerciseEmbedRequestId = (this._exerciseEmbedRequestId || 0) + 1;
            if (this.exerciseEmbedList) {
                this.exerciseEmbedList.innerHTML = '';
            }
        });
    },

    async _openExerciseEmbedDialog() {
        if (!this.currentTopicPath || !this.exerciseEmbedDialog) return;

        const requestId = (this._exerciseEmbedRequestId || 0) + 1;
        this._exerciseEmbedRequestId = requestId;
        this.exerciseEmbedList.innerHTML = '<p class="dialog-hint">Loading examples...</p>';
        this.exerciseEmbedDialog.showModal();

        try {
            const examples = await fetchExamples(this.currentTopicPath);
            if (requestId !== this._exerciseEmbedRequestId) return;

            if (!examples || examples.length === 0) {
                this.exerciseEmbedList.innerHTML = '<p class="dialog-hint">No examples in this topic.</p>';
                return;
            }

            this.exerciseEmbedList.innerHTML = '';

            for (const filename of examples) {
                const card = document.createElement('div');
                card.className = 'exercise-embed-card';

                const preview = document.createElement('div');
                preview.className = 'exercise-embed-card-preview';
                preview.innerHTML = '<span class="exercise-embed-card-loading">Loading...</span>';

                const footer = document.createElement('div');
                footer.className = 'exercise-embed-card-footer';
                const nameLabel = document.createElement('span');
                nameLabel.className = 'exercise-embed-card-name';
                nameLabel.textContent = filename;
                footer.appendChild(nameLabel);

                const actions = document.createElement('div');
                actions.className = 'exercise-embed-card-actions';

                const btnEmbed = document.createElement('button');
                btnEmbed.type = 'button';
                btnEmbed.className = 'exercise-embed-card-action';
                btnEmbed.textContent = 'Embed';
                btnEmbed.title = `Copy [[exercise:${filename}]]`;
                btnEmbed.addEventListener('click', () => {
                    const tag = `[[exercise:${filename}]]`;
                    navigator.clipboard.writeText(tag).then(() => {
                        this._showToast(`Copied: ${tag}`, 'success');
                    }).catch(() => {
                        this._showToast(`Tag: ${tag}`, 'success');
                    });
                    this.exerciseEmbedDialog.close();
                });

                const btnCode = document.createElement('button');
                btnCode.type = 'button';
                btnCode.className = 'exercise-embed-card-action is-code';
                btnCode.textContent = 'Code';
                btnCode.title = `Copy [[exercise:${filename}-]]`;
                btnCode.addEventListener('click', () => {
                    const tag = `[[exercise:${filename}-]]`;
                    navigator.clipboard.writeText(tag).then(() => {
                        this._showToast(`Copied: ${tag}`, 'success');
                    }).catch(() => {
                        this._showToast(`Tag: ${tag}`, 'success');
                    });
                    this.exerciseEmbedDialog.close();
                });

                actions.appendChild(btnEmbed);
                actions.appendChild(btnCode);

                card.appendChild(preview);
                card.appendChild(footer);
                card.appendChild(actions);

                this.exerciseEmbedList.appendChild(card);

                this._loadExerciseEmbedPreview(filename, preview, requestId);
            }
        } catch (error) {
            console.error(error);
            this.exerciseEmbedList.innerHTML = '<p class="dialog-hint is-error">Failed to load examples.</p>';
        }
    },

    async _loadExerciseEmbedPreview(filename, previewElement, requestId = this._exerciseEmbedRequestId) {
        try {
            const data = await fetchExample(this.currentTopicPath, filename);
            if (requestId !== this._exerciseEmbedRequestId) return;
            if (!data?.content) {
                previewElement.innerHTML = '<span class="exercise-embed-card-loading">No content</span>';
                return;
            }

            const documentModel = parseExampleDocument(data.content);
            const iframe = document.createElement('iframe');
            iframe.sandbox = 'allow-scripts';

            let srcdoc;
            if (isShaderDocument(documentModel)) {
                srcdoc = renderShaderExampleDocument(documentModel, {
                    diagnostics: documentModel.diagnostics || [],
                    renderId: 0,
                    shaderControls: { paused: true, stillFrame: true },
                    topicPath: this.currentTopicPath,
                });
            } else {
                const result = await compileExample({ document: documentModel });
                if (requestId !== this._exerciseEmbedRequestId) return;
                srcdoc = renderCompiledExampleDocument(
                    result.compiledDocument,
                    this.currentTopicPath,
                    result.compileDiagnostics || [],
                );
            }

            if (requestId !== this._exerciseEmbedRequestId || !previewElement.isConnected) return;
            previewElement.innerHTML = '';
            previewElement.appendChild(iframe);
            loadSrcdocWhenLaidOut(iframe, srcdoc);
        } catch (error) {
            console.error(`Failed to load preview for ${filename}`, error);
            previewElement.innerHTML = '<span class="exercise-embed-card-loading">Preview unavailable</span>';
        }
    },
};

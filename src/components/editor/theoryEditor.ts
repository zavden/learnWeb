// Theory editing: the editor can hold a topic's `main.md` instead of an example. src/main.ts opens it with
// `loadTheoryDocument()` (./fileOperations.ts) and saves it with `saveTheoryDocument()`; meanwhile
// `currentDocument` is the theory pseudo-document of src/utils/theoryDocument.ts (one `main.md` file, see
// src/types/theory.ts) and the app renders the page live in the theory panel.
//
// Also here: what the save paths share (`_getPersistableDocument`: an example as it is written to disk,
// with the preview's shader resolution and the live highlights), the editorial metadata the app shows for
// the open example, and the "insert exercise embed" dialog of the theory editor, which lists the topic's
// examples with small live previews and copies an `[[exercise:…]]` shortcode to the clipboard.
//
// `theoryEditorMixin` is an Editor mixin: src/components/Editor.ts copies its methods onto
// `Editor.prototype`, so `this` is the Editor and every field used here is declared there.
//
// Before editing: example-only features must check `_isTheoryDocumentTarget()` first. The embed dialog
// versions its loads with `_exerciseEmbedRequestId` (also bumped when the dialog closes) so previews that
// arrive late are dropped.

import {
    getExampleEditorialMetadata,
    isShaderDocument,
    hasBlockingDiagnostics,
    parseExampleDocument,
    updateShaderResolution,
} from '../../utils/markdown.ts';
import { getTheoryDocumentContent, isTheoryDocument } from '../../utils/theoryDocument.ts';
import { modifyTopicMain, fetchExamples, fetchExample } from '../../utils/api.ts';
import { compileExample } from '../../utils/compileClient.ts';
import { errorMessage } from '../../utils/errors.ts';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../../utils/exampleRenderer.ts';
import { loadSrcdocWhenLaidOut } from '../../utils/renderer/previewHost.ts';
import type { ExampleEditorialMetadata } from '../../types/document.ts';
import type { Editor, EditorDocument, EditorDocumentTarget } from '../Editor.ts';

/**
 * The view of the editor that the parameter default of `_loadExerciseEmbedPreview` reads. TypeScript types
 * `this` in a parameter default only through an explicit `this` parameter, and reading a member of
 * `this: Editor` there makes the `Editor` type circular (it is built from `typeof theoryEditorMixin`), so
 * the default reads the field through this narrower type.
 */
interface ExerciseEmbedRequestHolder {
    readonly _exerciseEmbedRequestId?: number;
}

/** Editor mixin: theory editing, the persisted form of a document and the exercise embed dialog (see the header). */
export const theoryEditorMixin = {
    /** What the editor holds: the topic's theory or an example (the app stores it in the session). */
    getDocumentTarget(): EditorDocumentTarget {
        return this._isTheoryDocumentTarget() ? 'theory' : 'example';
    },

    /** Public form of `_isTheoryDocumentTarget()`, for the app. */
    isEditingTheoryDocument(): boolean {
        return this._isTheoryDocumentTarget();
    },

    /** The current `main.md` text while theory is edited (`''` otherwise). */
    getTheoryContent(): string {
        return getTheoryDocumentContent(this.currentDocument);
    },

    /** Whether `currentDocument` is the theory pseudo-document. */
    _isTheoryDocumentTarget(): boolean {
        return isTheoryDocument(this.currentDocument);
    },

    /**
     * The editorial metadata of the open example (description, tags, rating, importance) for the summary
     * the app shows above the preview; `null` for theory or when the example has none.
     */
    getCurrentEditorialMetadata(): ExampleEditorialMetadata | null {
        if (this._isTheoryDocumentTarget()) return null;

        const metadata = getExampleEditorialMetadata(this.currentDocument);
        if (
            !String(metadata.description || '').trim() &&
            (!Array.isArray(metadata.tags) || metadata.tags.length === 0) &&
            !Number.isInteger(metadata.rating) &&
            !String(metadata.importance || '').trim()
        ) {
            return null;
        }

        return metadata;
    },

    /**
     * The document as it is written to disk: for a shader example, the canvas resolution the preview
     * currently uses is written into its metadata; the live line highlights always are.
     */
    _getPersistableDocument(): EditorDocument {
        let doc: EditorDocument;

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

    /** Writes the theory text to the topic's `main.md`; resolves whether it was saved (failures show a toast). */
    async _handleModifyTheory(): Promise<boolean> {
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
            this._showToast(`Theory save failed: ${errorMessage(error)}`, 'error');
            return false;
        }
    },

    /** Saves the theory being edited (src/main.ts, before it leaves the theory editor); resolves whether it was saved. */
    async saveTheoryDocument(): Promise<boolean> {
        return this._handleModifyTheory();
    },

    /** Wires the exercise embed dialog: its toolbar button, the close button, backdrop clicks and cleanup on close. */
    _initExerciseEmbedDialog(): void {
        if (!this.btnInsertExerciseEmbed || !this.exerciseEmbedDialog) return;

        this.btnInsertExerciseEmbed.addEventListener('click', () => {
            this._openExerciseEmbedDialog();
        });

        // `exerciseEmbedDialog!` in the listeners below: checked at the top of the method.
        this.btnExerciseEmbedDialogClose?.addEventListener('click', () => {
            this.exerciseEmbedDialog!.close();
        });

        this.exerciseEmbedDialog.addEventListener('click', (event) => {
            if (event.target === this.exerciseEmbedDialog) {
                this.exerciseEmbedDialog!.close();
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

    /**
     * Opens the exercise embed dialog: one card per example of the topic, with a live preview and two
     * buttons that copy `[[exercise:file.md]]` (card embed) or `[[exercise:file.md-]]` (code embed).
     */
    async _openExerciseEmbedDialog(): Promise<void> {
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

                // `exerciseEmbedDialog!` in the click listeners: checked at the top of the method.
                const btnEmbed = document.createElement('button');
                btnEmbed.type = 'button';
                btnEmbed.className = 'exercise-embed-card-action';
                btnEmbed.textContent = 'Embed';
                btnEmbed.title = `Copy [[exercise:${filename}]]`;
                btnEmbed.addEventListener('click', () => {
                    const tag = `[[exercise:${filename}]]`;
                    navigator.clipboard
                        .writeText(tag)
                        .then(() => {
                            this._showToast(`Copied: ${tag}`, 'success');
                        })
                        .catch(() => {
                            this._showToast(`Tag: ${tag}`, 'success');
                        });
                    this.exerciseEmbedDialog!.close();
                });

                const btnCode = document.createElement('button');
                btnCode.type = 'button';
                btnCode.className = 'exercise-embed-card-action is-code';
                btnCode.textContent = 'Code';
                btnCode.title = `Copy [[exercise:${filename}-]]`;
                btnCode.addEventListener('click', () => {
                    const tag = `[[exercise:${filename}-]]`;
                    navigator.clipboard
                        .writeText(tag)
                        .then(() => {
                            this._showToast(`Copied: ${tag}`, 'success');
                        })
                        .catch(() => {
                            this._showToast(`Tag: ${tag}`, 'success');
                        });
                    this.exerciseEmbedDialog!.close();
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

    /**
     * Fills one card's preview with an iframe of the example (shader examples paused on a still frame,
     * others compiled). Does nothing once `requestId` is stale (the dialog was reopened or closed) or the
     * card left the page.
     */
    async _loadExerciseEmbedPreview(
        this: Editor,
        filename: string,
        previewElement: HTMLElement,
        requestId: number | undefined = (this as unknown as ExerciseEmbedRequestHolder)._exerciseEmbedRequestId,
    ): Promise<void> {
        try {
            // `!`: only called from `_openExerciseEmbedDialog`, which checked the topic.
            const data = await fetchExample(this.currentTopicPath!, filename);
            if (requestId !== this._exerciseEmbedRequestId) return;
            if (!data?.content) {
                previewElement.innerHTML = '<span class="exercise-embed-card-loading">No content</span>';
                return;
            }

            const documentModel = parseExampleDocument(data.content);
            const iframe = document.createElement('iframe');
            iframe.sandbox = 'allow-scripts';

            let srcdoc: string;
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
} satisfies ThisType<Editor>;

import { historyField } from '@codemirror/commands';
import { buildExampleDocument, cloneExampleDocument, createEmptyExampleDocument } from '../../utils/markdown.js';
import { getTheoryDocumentContent, isTheoryDocument } from '../../utils/theoryDocument.js';

const DIRTY_CHECK_DELAY_MS = 250;

export const sessionManagerMixin = {
    _readLayoutMode(fallback = 'panels') {
        const stored = window.localStorage.getItem(this.layoutModeStorageKey);
        if (stored === 'tabs' || stored === 'panels') {
            return stored;
        }

        return fallback === 'tabs' ? 'tabs' : 'panels';
    },

    _readVimEnabled() {
        const stored = window.localStorage.getItem(this.vimEnabledStorageKey);
        return stored == null ? true : stored !== '0';
    },

    _readSystemClipboardEnabled() {
        const stored = window.localStorage.getItem(this.systemClipboardStorageKey);
        return stored == null ? true : stored !== '0';
    },

    _readColumnGuideEnabled() {
        const stored = window.localStorage.getItem(this.columnGuideStorageKey);
        return stored == null ? false : stored !== '0';
    },

    _sanitizePanelState(panelState = {}) {
        const collapsedFileIds = Array.isArray(panelState.collapsedFileIds)
            ? Array.from(new Set(panelState.collapsedFileIds.filter((value) => typeof value === 'string' && value.trim())))
            : [];

        return {
            collapsedFileIds,
            maximizedFileId: typeof panelState.maximizedFileId === 'string' && panelState.maximizedFileId.trim()
                ? panelState.maximizedFileId
                : null,
        };
    },

    getSessionState() {
        const layoutMode = this._isTheoryDocumentTarget() && this._layoutModeBeforeTheory
            ? this._layoutModeBeforeTheory
            : this.layoutMode;

        return {
            activeFileId: this.activeFileId,
            collapsedFileIds: [...this.panelState.collapsedFileIds],
            currentFilename: this.currentFilename,
            documentTarget: this.getDocumentTarget(),
            exercise: { ...this.exerciseState },
            layoutMode,
            maximizedFileId: this.panelState.maximizedFileId,
            vimEnabled: this.vimEnabled,
        };
    },

    restoreSessionState(sessionState = {}) {
        if (typeof sessionState.vimEnabled === 'boolean') {
            this._setVimEnabled(sessionState.vimEnabled, { persist: false, rerender: false, emit: false, showToast: false });
        }

        if (sessionState.layoutMode) {
            if (this._isTheoryDocumentTarget()) {
                // Theory always edits in Tabs; remember the user's layout for later.
                this._layoutModeBeforeTheory = sessionState.layoutMode === 'tabs' ? 'tabs' : 'panels';
            } else {
                this._setLayoutMode(sessionState.layoutMode, { persist: false, rerender: false, emit: false });
            }
        }

        this.activeFileId = typeof sessionState.activeFileId === 'string' && sessionState.activeFileId.trim()
            ? sessionState.activeFileId
            : null;
        this.exerciseState = this._sanitizeExerciseState(sessionState.exercise || {});
        this.panelState = this._sanitizePanelState(sessionState);
        this._renderWorkspace();
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    },

    resetLayoutState() {
        this.panelState = this._sanitizePanelState();
        this._setLayoutMode(this.vimEnabled ? 'tabs' : 'panels', { persist: true, rerender: false, emit: false });
        this._renderWorkspace();
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    },

    _emitSessionStateChange() {
        if (!this.onSessionStateChange) return;
        this.onSessionStateChange(this.getSessionState());
    },

    captureWorkspaceSnapshot() {
        this._captureEditorStates();
        const dirty = this.hasUnsavedChanges();

        return {
            currentFilename: this.currentFilename,
            dirty,
            // Live (possibly unsaved) highlights travel with the snapshot.
            document: cloneExampleDocument(this._injectHighlightsIntoDocument(this.currentDocument)),
            editorStates: new Map(this._editorStateCache),
            savedSignature: this.dirtyTracker.getSavedSignature(),
            sessionState: this.getSessionState(),
        };
    },

    async restoreWorkspaceSnapshot(snapshot = null) {
        this._restoreLayoutAfterTheory();

        if (!snapshot?.document) {
            this.currentFilename = null;
            this.compileDiagnostics = [];
            this.runtimeDiagnostics = [];
            this._resetExerciseComparisonSource();
            this._applyDocument(createEmptyExampleDocument(), { notify: false, reset: true });
            this._markDocumentSaved();
            this._updateButtonStates();
            this._updateFilenameDisplay();
            this._emitSessionStateChange();
            this._triggerChange();
            return;
        }

        this.currentFilename = snapshot.currentFilename || null;
        this.compileDiagnostics = [];
        this.runtimeDiagnostics = [];
        this._resetExerciseComparisonSource();
        this._applyDocument(snapshot.document, {
            notify: false,
            reset: true,
            editorStates: snapshot.editorStates || null,
        });
        this.restoreSessionState(snapshot.sessionState || {});

        if (typeof snapshot.savedSignature === 'string') {
            this.dirtyTracker.markSaved(snapshot.savedSignature);
            this._refreshDirtyState();
        } else {
            this._markDocumentSaved();
        }

        if (!isTheoryDocument(snapshot.document)) {
            await this._loadExerciseComparisonSource();
        }

        this._updateButtonStates();
        this._updateFilenameDisplay();
        this._triggerChange();
    },
    _restoreLayoutAfterTheory() {
        if (!this._layoutModeBeforeTheory) return;

        const layoutMode = this._layoutModeBeforeTheory;
        this._layoutModeBeforeTheory = null;
        this._setLayoutMode(layoutMode, { persist: false, rerender: false, emit: false });
    },

    // ── Editor state cache (cursor, selection, undo history, scroll) ──

    _getEditorStateCacheKey(file) {
        return String(file?.path || file?.id || '');
    },

    _captureEditorStates() {
        if (!this._editorStateCache) return;

        const files = this.currentDocument?.files || [];
        this.editors.forEach((entry) => {
            if (!entry?.view) return;
            const file = files.find((item) => item.id === entry.id);
            const key = this._getEditorStateCacheKey(file);
            if (!key) return;

            try {
                this._editorStateCache.set(key, {
                    json: entry.view.state.toJSON({ history: historyField }),
                    scroll: entry.view.scrollSnapshot(),
                });
            } catch {
                this._editorStateCache.delete(key);
            }
        });
    },

    _getCachedEditorState(file) {
        const key = this._getEditorStateCacheKey(file);
        if (!key || !this._editorStateCache?.has(key)) return null;

        const cached = this._editorStateCache.get(key);
        // Only reuse the state when it still describes the same text.
        if (!cached?.json || cached.json.doc !== String(file?.content || '')) {
            this._editorStateCache.delete(key);
            return null;
        }

        return cached;
    },

    _resetEditorStateCache(seed = null) {
        this._editorStateCache = seed instanceof Map ? new Map(seed) : new Map();
    },

    // ── Dirty tracking ──

    _computeDirtySignature(documentModel = this.currentDocument) {
        if (!documentModel) return '';

        if (isTheoryDocument(documentModel)) {
            return `theory:${getTheoryDocumentContent(documentModel)}`;
        }

        if ((documentModel.files || []).length === 0) return '';

        try {
            return buildExampleDocument(this._injectHighlightsIntoDocument(documentModel));
        } catch {
            return '';
        }
    },

    _markDocumentSaved(documentModel = this.currentDocument, { recheck = false } = {}) {
        if (this._dirtyCheckTimer) {
            window.clearTimeout(this._dirtyCheckTimer);
            this._dirtyCheckTimer = 0;
        }

        const wasDirty = this.dirtyTracker.isDirty();
        this.dirtyTracker.markSaved(this._computeDirtySignature(documentModel));

        if (recheck) {
            this._refreshDirtyState();
            return;
        }

        this._updateDirtyIndicator();
        if (wasDirty) {
            this.onDirtyStateChange?.(false);
        }
    },

    _scheduleDirtyCheck() {
        if (this._dirtyCheckTimer) {
            window.clearTimeout(this._dirtyCheckTimer);
        }

        this._dirtyCheckTimer = window.setTimeout(() => {
            this._dirtyCheckTimer = 0;
            this._refreshDirtyState();
        }, DIRTY_CHECK_DELAY_MS);
    },

    _refreshDirtyState() {
        const changed = this.dirtyTracker.update(this._computeDirtySignature());
        this._updateDirtyIndicator();

        if (changed) {
            this.onDirtyStateChange?.(this.dirtyTracker.isDirty());
        }

        return this.dirtyTracker.isDirty();
    },

    hasUnsavedChanges() {
        if (this._dirtyCheckTimer) {
            window.clearTimeout(this._dirtyCheckTimer);
            this._dirtyCheckTimer = 0;
        }

        return this._refreshDirtyState();
    },

    getDocumentLabel() {
        if (this._isTheoryDocumentTarget()) return 'Theory (main.md)';
        return this.currentFilename ? `"${this.currentFilename}"` : 'The current document';
    },

    _updateDirtyIndicator() {
        const dirty = this.dirtyTracker?.isDirty?.() === true;

        if (this.previewFilenameDisplay) {
            this.previewFilenameDisplay.classList.toggle('is-dirty', dirty);
            this.previewFilenameDisplay.dataset.dirty = dirty ? '1' : '0';
        }

        if (this.btnModify) {
            this.btnModify.classList.toggle('is-dirty', dirty);
            this.btnModify.title = dirty ? 'Save changes to this file (unsaved changes)' : 'Save changes to this file';
        }

        if (typeof document !== 'undefined' && this._baseDocumentTitle !== undefined) {
            document.title = dirty ? `\u2022 ${this._baseDocumentTitle}` : this._baseDocumentTitle;
        }
    },
};

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
        return {
            activeFileId: this.activeFileId,
            collapsedFileIds: [...this.panelState.collapsedFileIds],
            currentFilename: this.currentFilename,
            documentTarget: this.getDocumentTarget(),
            exercise: { ...this.exerciseState },
            layoutMode: this.layoutMode,
            maximizedFileId: this.panelState.maximizedFileId,
            vimEnabled: this.vimEnabled,
        };
    },

    restoreSessionState(sessionState = {}) {
        if (typeof sessionState.vimEnabled === 'boolean') {
            this._setVimEnabled(sessionState.vimEnabled, { persist: false, rerender: false, emit: false, showToast: false });
        }

        if (sessionState.layoutMode) {
            this._setLayoutMode(sessionState.layoutMode, { persist: false, rerender: false, emit: false });
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
        return {
            currentFilename: this.currentFilename,
            document: cloneExampleDocument(this.currentDocument),
            sessionState: this.getSessionState(),
        };
    },

    async restoreWorkspaceSnapshot(snapshot = null) {
        if (!snapshot?.document) {
            this.currentFilename = null;
            this.compileDiagnostics = [];
            this.runtimeDiagnostics = [];
            this._resetExerciseComparisonSource();
            this._applyDocument(createEmptyExampleDocument(), { notify: false });
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
        this._applyDocument(snapshot.document, { notify: false });
        this.restoreSessionState(snapshot.sessionState || {});

        if (!isTheoryDocument(snapshot.document)) {
            await this._loadExerciseComparisonSource();
        }

        this._updateButtonStates();
        this._updateFilenameDisplay();
        this._triggerChange();
    },
};

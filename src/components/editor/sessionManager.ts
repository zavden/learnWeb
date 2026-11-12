// Session state of the editor: what survives a reload (layout, active file, collapsed/maximized panels,
// exercise state), the workspace snapshot that brings an example back after theory editing, the per-file
// editor state cache (cursor, selection, undo history, scroll) and unsaved-changes ("dirty") tracking.
//
// `sessionManagerMixin` is an Editor mixin: src/components/Editor.ts copies its methods onto
// `Editor.prototype`, so `this` is the Editor and every field used here is declared there. The `_read…`
// methods run in the constructor (localStorage preferences). src/main.ts stores `getSessionState()` (it is
// pushed through `onSessionStateChange`) and gives it back to `restoreSessionState()` at start-up; it calls
// `captureWorkspaceSnapshot()` / `restoreWorkspaceSnapshot()` around theory editing and
// `hasUnsavedChanges()` / `getDocumentLabel()` for its "discard changes?" prompt.
//
// Before editing:
// - Session input is untrusted (localStorage, possibly from an older version or hand-edited): every field
//   is re-checked on restore.
// - Dirty tracking compares "signatures" (./dirtyTracker.ts): for an example, the Markdown it would be saved
//   as, live highlights included; for theory, its text. Edits only schedule the comparison
//   (`_scheduleDirtyCheck`, 250 ms); `hasUnsavedChanges()` runs it at once.
// - Every render recreates the CodeMirror views, so their state is cached by file path
//   (`_editorStateCache`) and reused only while the file's text is unchanged.

import { historyField } from '@codemirror/commands';
import { buildExampleDocument, cloneExampleDocument, createEmptyExampleDocument } from '../../utils/markdown.ts';
import { getTheoryDocumentContent, isTheoryDocument } from '../../utils/theoryDocument.ts';
import type {
    CachedEditorState,
    Editor,
    EditorDocument,
    EditorFile,
    EditorLayoutMode,
    EditorSessionState,
    EditorWorkspaceSnapshot,
    PanelState,
} from '../Editor.ts';

const DIRTY_CHECK_DELAY_MS = 250;

/**
 * A panel state as `_sanitizePanelState()` accepts it: either field, of any type. Editor.ts passes what it
 * reads from the DOM, `restoreSessionState()` the whole (untrusted) session object.
 */
export type PanelStateInput = { readonly [K in keyof PanelState]?: unknown };

/**
 * What `restoreSessionState()` accepts: a `getSessionState()` result, or the subset src/main.ts stored
 * (`''` for "none"). Any field may be missing; the values are re-checked.
 */
export type EditorSessionStateInput = Partial<EditorSessionState>;

/** Options of `_markDocumentSaved()`. */
export interface MarkDocumentSavedOptions {
    /**
     * Compare the current document with the new saved version right away (after a save: edits typed while
     * the request was in flight stay dirty). Without it the editor is simply clean. Default false.
     */
    recheck?: boolean;
}

/**
 * The view of the editor that the parameter defaults of `_computeDirtySignature` and `_markDocumentSaved`
 * read. TypeScript types `this` in a parameter default only through an explicit `this` parameter, and
 * reading a member of `this: Editor` there makes the `Editor` type circular (it is built from
 * `typeof sessionManagerMixin`), so the default reads `currentDocument` through this narrower type.
 */
interface CurrentDocumentHolder {
    readonly currentDocument: EditorDocument;
}

/** Editor mixin: session state, workspace snapshots, the editor state cache and dirty tracking (see the header). */
export const sessionManagerMixin = {
    /** The stored layout preference, else `fallback` (anything but `tabs` means Panels). */
    _readLayoutMode(fallback: EditorLayoutMode = 'panels'): EditorLayoutMode {
        const stored = window.localStorage.getItem(this.layoutModeStorageKey);
        if (stored === 'tabs' || stored === 'panels') {
            return stored;
        }

        return fallback === 'tabs' ? 'tabs' : 'panels';
    },

    /** The stored Vim preference; on unless stored as `'0'`. */
    _readVimEnabled(): boolean {
        const stored = window.localStorage.getItem(this.vimEnabledStorageKey);
        return stored == null ? true : stored !== '0';
    },

    /** The stored system-clipboard preference; on unless stored as `'0'`. */
    _readSystemClipboardEnabled(): boolean {
        const stored = window.localStorage.getItem(this.systemClipboardStorageKey);
        return stored == null ? true : stored !== '0';
    },

    /** The stored 80-column guide preference; off until stored as anything but `'0'`. */
    _readColumnGuideEnabled(): boolean {
        const stored = window.localStorage.getItem(this.columnGuideStorageKey);
        return stored == null ? false : stored !== '0';
    },

    /**
     * A valid `PanelState` from untrusted input: the non-blank string ids without duplicates, and the
     * maximized id when it is a non-blank string. No argument gives the initial state (nothing collapsed).
     */
    _sanitizePanelState(panelState: PanelStateInput = {}): PanelState {
        const collapsedFileIds = Array.isArray(panelState.collapsedFileIds)
            ? Array.from(
                  new Set<string>(
                      panelState.collapsedFileIds.filter((value: unknown) => typeof value === 'string' && value.trim()),
                  ),
              )
            : [];

        return {
            collapsedFileIds,
            maximizedFileId:
                typeof panelState.maximizedFileId === 'string' && panelState.maximizedFileId.trim()
                    ? panelState.maximizedFileId
                    : null,
        };
    },

    /** The editor part of the UI session (see `EditorSessionState`); while theory is edited, the layout to return to. */
    getSessionState(): EditorSessionState {
        const layoutMode =
            this._isTheoryDocumentTarget() && this._layoutModeBeforeTheory
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

    /**
     * Applies a stored session to the open document: Vim mode and layout (while theory is edited, the
     * layout is only remembered for later), active file, exercise state and panels. Does not load a
     * document; `currentFilename` and `documentTarget` are ignored here.
     */
    restoreSessionState(sessionState: EditorSessionStateInput = {}): void {
        if (typeof sessionState.vimEnabled === 'boolean') {
            this._setVimEnabled(sessionState.vimEnabled, {
                persist: false,
                rerender: false,
                emit: false,
                showToast: false,
            });
        }

        if (sessionState.layoutMode) {
            if (this._isTheoryDocumentTarget()) {
                // Theory always edits in Tabs; remember the user's layout for later.
                this._layoutModeBeforeTheory = sessionState.layoutMode === 'tabs' ? 'tabs' : 'panels';
            } else {
                this._setLayoutMode(sessionState.layoutMode, { persist: false, rerender: false, emit: false });
            }
        }

        this.activeFileId =
            typeof sessionState.activeFileId === 'string' && sessionState.activeFileId.trim()
                ? sessionState.activeFileId
                : null;
        this.exerciseState = this._sanitizeExerciseState(sessionState.exercise || {});
        this.panelState = this._sanitizePanelState(sessionState);
        this._renderWorkspace();
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    },

    /** "Reset layout": no collapsed or maximized panels, and the default layout for the Vim setting (stored). */
    resetLayoutState(): void {
        this.panelState = this._sanitizePanelState();
        this._setLayoutMode(this.vimEnabled ? 'tabs' : 'panels', { persist: true, rerender: false, emit: false });
        this._renderWorkspace();
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    },

    /** Sends `getSessionState()` to `onSessionStateChange` (the app persists it). */
    _emitSessionStateChange(): void {
        if (!this.onSessionStateChange) return;
        this.onSessionStateChange(this.getSessionState());
    },

    /**
     * Everything needed to bring the open document back later, unsaved edits included (src/main.ts takes
     * one before opening the theory editor). Runs the pending dirty check now.
     */
    captureWorkspaceSnapshot(): EditorWorkspaceSnapshot {
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

    /**
     * Restores a `captureWorkspaceSnapshot()` result: document, editor states, session state and the saved
     * signature (so unsaved edits still count as unsaved). Without a snapshot the editor is emptied.
     * Leaves theory mode (the user's layout comes back) and reloads an exercise's solution example.
     */
    async restoreWorkspaceSnapshot(snapshot: EditorWorkspaceSnapshot | null = null): Promise<void> {
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
    /** Leaving theory: switches back to the layout the user had before (no-op when theory was not open). */
    _restoreLayoutAfterTheory(): void {
        if (!this._layoutModeBeforeTheory) return;

        const layoutMode = this._layoutModeBeforeTheory;
        this._layoutModeBeforeTheory = null;
        this._setLayoutMode(layoutMode, { persist: false, rerender: false, emit: false });
    },

    // ── Editor state cache (cursor, selection, undo history, scroll) ──

    /** The cache key of a file: its path, or its id when the path is empty; `''` (not cacheable) without a file. */
    _getEditorStateCacheKey(file: EditorFile | null | undefined): string {
        return String(file?.path || file?.id || '');
    },

    /** Stores the state of every open editor in the cache (called before the views are destroyed). */
    _captureEditorStates(): void {
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

    /** The cached state of `file`, or `null`; a cached state whose text no longer matches the file is discarded. */
    _getCachedEditorState(file: EditorFile | null | undefined): CachedEditorState | null {
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

    /** Starts a new cache: a copy of `seed` (a workspace snapshot's states), or empty. */
    _resetEditorStateCache(seed: Map<string, CachedEditorState> | null = null): void {
        this._editorStateCache = seed instanceof Map ? new Map(seed) : new Map();
    },

    // ── Dirty tracking ──

    /**
     * The dirty-tracking signature of a document: `theory:` + the text for theory, the Markdown it would be
     * saved as (live highlights included) for an example, `''` for an empty document or when serializing fails.
     */
    _computeDirtySignature(
        this: Editor,
        documentModel: EditorDocument = (this as unknown as CurrentDocumentHolder).currentDocument,
    ): string {
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

    /**
     * Records `documentModel` as the saved version (after a load or save) and cancels a pending dirty
     * check. Without `recheck`, the editor becomes clean and `onDirtyStateChange(false)` fires if it was dirty.
     */
    _markDocumentSaved(
        this: Editor,
        documentModel: EditorDocument = (this as unknown as CurrentDocumentHolder).currentDocument,
        { recheck = false }: MarkDocumentSavedOptions = {},
    ): void {
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

    /** Compares the document with the saved version after a short pause (called on every edit). */
    _scheduleDirtyCheck(): void {
        if (this._dirtyCheckTimer) {
            window.clearTimeout(this._dirtyCheckTimer);
        }

        this._dirtyCheckTimer = window.setTimeout(() => {
            this._dirtyCheckTimer = 0;
            this._refreshDirtyState();
        }, DIRTY_CHECK_DELAY_MS);
    },

    /** Compares the current document with the saved version now; updates the markers and notifies a change. Returns whether it is dirty. */
    _refreshDirtyState(): boolean {
        const changed = this.dirtyTracker.update(this._computeDirtySignature());
        this._updateDirtyIndicator();

        if (changed) {
            this.onDirtyStateChange?.(this.dirtyTracker.isDirty());
        }

        return this.dirtyTracker.isDirty();
    },

    /** Whether the open document has unsaved changes (checked now, not after the edit pause). */
    hasUnsavedChanges(): boolean {
        if (this._dirtyCheckTimer) {
            window.clearTimeout(this._dirtyCheckTimer);
            this._dirtyCheckTimer = 0;
        }

        return this._refreshDirtyState();
    },

    /** How the app's "discard changes?" prompt names the open document. */
    getDocumentLabel(): string {
        if (this._isTheoryDocumentTarget()) return 'Theory (main.md)';
        return this.currentFilename ? `"${this.currentFilename}"` : 'The current document';
    },

    /** Shows the dirty state: on the file name above the preview, on the Modify button (class and tooltip) and as a `•` in the page title. */
    _updateDirtyIndicator(): void {
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
            document.title = dirty ? `• ${this._baseDocumentTitle}` : this._baseDocumentTitle;
        }
    },
} satisfies ThisType<Editor>;

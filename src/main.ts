// ─── Learning App — Main Entry ──────────────────────────
//
// The application shell: the module `index.html` loads (`<script type="module" src="/src/main.ts">`).
// On DOMContentLoaded it builds one `App`, which creates every UI component, wires them together through
// the callbacks of their option objects, and owns everything that belongs to none of them.
//
// Who does what
//   Sidebar          material tree (chapters / sections / topics), Favorites and Pending buttons, the
//                    default-Vim / default-clipboard / preview-info switches.
//   Gallery          cards of the examples of the open topic (it is also the start page listing pending examples).
//   TheoryViewer     the rendered theory (`main.md`) of the open topic, shown as a panel over the editor.
//   Editor           the CodeMirror panels/tabs of the open example, or of `main.md` while theory is edited;
//                    save / rename / delete, dirty tracking, its own part of the saved session.
//   ExercisePanel    the notes panel of exercise examples; the Editor decides what it shows.
//   Preview          the iframe, console, runtime diagnostics and shader controls.
//   FavoritesDialog, PendingDialog, TheoryExerciseDialog, AssetsDialog, CreateDialog: modal dialogs.
//   App              the layout (sidebar and workspace resizers, console height, preview viewport width and
//                    zoom), the two main views (gallery / editor), the unsaved-work guard, the favorites and
//                    pending lists, and the session saved in localStorage.
//
// How a user action flows
//   1. Pick a topic in the Sidebar: `selectTopic()` points the Editor, Preview, Gallery and TheoryViewer at it
//      and shows the Gallery.
//   2. Pick an example card (or open one from Favorites / Pending / a theory page): `loadExample()` shows the
//      editor view and the Editor fetches, parses and displays the file.
//   3. Every edit: the Editor calls `onCodeChange(document)`, which updates the ExercisePanel and Preview.
//      The Preview compiles and renders, and reports compile / runtime diagnostics back to the Editor.
//   4. Save / rename / delete in the Editor: `onExampleListChanged` reloads favorites and pending and refreshes
//      the Gallery.
//   5. "Edit theory" (`openTheoryEditor()`): `main.md` is loaded into the Editor as a pseudo-document and
//      `theoryReturnState` remembers where to go back to (gallery, or a snapshot of the example being edited).
//      The TheoryViewer re-renders from the editor text, debounced.
//
// Things to know before editing
//   - Leaving a document goes through `_confirmDiscardUnsavedChanges()`; callers that have already asked
//     pass `skipGuard: true`.
//   - Session persistence (`learncode.session`) stays off until `_bootstrap()` has restored the saved session
//     (`_sessionPersistenceReady`), otherwise start-up side effects would overwrite it. What is read back from
//     localStorage is untrusted: every restore method re-checks its input.
//   - The DOM elements are looked up once, in the constructor, from ids and classes of `index.html`.
//     A field is `| null` when the code around it tolerates a missing element (`?.` or an early return);
//     the few non-null assertions on such fields sit in callbacks created after that check, where
//     TypeScript no longer sees it.
//   - There are no automated tests for this module.

import './style.css';
import { Sidebar } from './components/Sidebar.ts';
import { TheoryViewer } from './components/TheoryViewer.ts';
import { Editor, type EditorDocument, type EditorWorkspaceSnapshot } from './components/Editor.ts';
import { ExercisePanel, type ExercisePresentation } from './components/ExercisePanel.ts';
import { Preview } from './components/Preview.ts';
import { CreateDialog } from './components/CreateDialog.ts';
import { FavoritesDialog } from './components/FavoritesDialog.ts';
import { PendingDialog } from './components/PendingDialog.ts';
import { Gallery } from './components/Gallery.ts';
import { TheoryExerciseDialog } from './components/TheoryExerciseDialog.ts';
import { AssetsDialog } from './components/AssetsDialog.ts';
import { formatExampleRatingStars, getExampleImportanceMeta } from './utils/exampleEditorial.ts';
import { showToast } from './components/editor/toast.ts';
import { buildDiscardChangesMessage } from './components/editor/dirtyTracker.ts';
import { byId, queryRequired } from './utils/dom.ts';
import { errorMessage } from './utils/errors.ts';
import {
    addFavorite,
    addPending,
    fetchFavorites,
    fetchPending,
    fetchVimShortcutConfig,
    fetchTopicMain,
    fetchClipboardDefaultState,
    fetchVimDefaultState,
    removeFavorite,
    removePending,
    updateClipboardDefaultState,
    updateVimDefaultState,
} from './utils/api.ts';
import type { CreateItemType } from './types/api.ts';
import type { Diagnostic } from './types/diagnostics.ts';
import type { FavoriteEntry, MaterialTopic, PendingEntry } from './types/material.ts';

/** How the preview iframe is sized: filling its column ('full') or at a fixed width ('custom'). */
type PreviewWidthMode = 'full' | 'custom';

/** Axis of a drag: 'ew' for the vertical dividers (cursor east-west), 'ns' for the console divider. */
type DragDirection = 'ew' | 'ns';

/** Allowed range of a resizable dimension, in px. */
interface Bounds {
    min: number;
    max: number;
}

/** Options of the layout setters: `persist` (default true) saves the session after the change. */
interface PersistOptions {
    persist?: boolean;
}

/** Options of `selectTopic()` and `loadExample()`. */
interface NavigationOptions extends PersistOptions {
    /** Skip the "discard unsaved changes?" confirm: the caller has asked already (or is restoring state). */
    skipGuard?: boolean;
}

/**
 * Where "Done editing theory" goes back to. `snapshot` is present only for `mode: 'editor'` and holds the
 * example that was open in the Editor when theory editing started.
 */
interface TheoryReturnState {
    mode: 'editor' | 'gallery';
    snapshot?: EditorWorkspaceSnapshot;
}

/**
 * A change to a topic's list of examples, reported by the Editor (save as new, delete, rename) and by the
 * Gallery (delete, with `source: 'gallery'`). Only the fields App reads are listed.
 */
interface ExampleListChange {
    reason?: 'created' | 'deleted' | 'renamed' | '';
    filename?: string | null;
    topicPath?: string | null;
    /** Who deleted: 'gallery' means the Editor was not the one that deleted the file. */
    source?: 'editor' | 'gallery';
}

/** The preview-column part of the saved session, as `_captureSessionState()` writes it. */
interface SessionPreviewState {
    columnWidth: number;
    consoleHeight: number;
    /** Only set when `widthMode` is 'custom'. */
    customWidth: number | null;
    headerHidden: boolean;
    zoom: number;
    widthMode: PreviewWidthMode;
}

/** The editor part of the saved session: the fields of `Editor.getSessionState()` that App keeps. */
interface SessionEditorState {
    activeFileId: string;
    collapsedFileIds: string[];
    layoutMode: 'tabs' | 'panels';
    maximizedFileId: string;
}

/** The session App saves in localStorage (`learncode.session`) and restores at start-up. */
interface SessionState {
    version: 1;
    /** File open in the Editor ('main.md' while theory is edited, '' for none). */
    documentFilename: string;
    documentTarget: 'example' | 'theory';
    topicPath: string;
    /** Same as `documentFilename`; read as a fallback by sessions written before `documentFilename` existed. */
    exampleFilename: string;
    editor: SessionEditorState;
    preview: SessionPreviewState;
}

/** `SessionPreviewState` as read back from storage: every field is whatever was stored. */
type StoredPreviewState = { [K in keyof SessionPreviewState]?: unknown };

/** `SessionState` as read back from storage: any part may be missing or hand-edited, so each is re-checked. */
type StoredSessionState = Partial<Omit<SessionState, 'preview'>> & { preview?: StoredPreviewState | null };

/** The application shell. One instance is created at DOMContentLoaded (see the end of this file). */
class App {
    // Topic and layout limits
    currentTopicPath: string | null;
    readonly sidebarMinWidth: number;
    readonly sidebarMaxWidth: number;
    readonly workspaceMinEditorWidth: number;
    readonly previewMinWidth: number;
    readonly previewFrameMinHeight: number;
    readonly previewConsoleMinHeight: number;
    readonly previewConsoleDefaultHeight: number;
    // localStorage keys
    readonly sessionStorageKey: string;
    readonly sidebarWidthStorageKey: string;
    readonly sidebarCollapsedStorageKey: string;
    readonly previewEditorialSummaryVisibleStorageKey: string;
    // Preview controls state
    previewWidthMode: PreviewWidthMode;
    /** Width (px) of the preview iframe in 'custom' mode. */
    customPreviewWidth: number;
    previewViewportSliderVisible: boolean;
    previewZoomPercent: number;
    previewZoomSliderVisible: boolean;
    previewHeaderHidden: boolean;
    previewEditorialSummaryVisible: boolean;
    // Editor defaults, favorites and pending
    clipboardDefaultEnabled: boolean;
    vimDefaultEnabled: boolean;
    theoryReturnState: TheoryReturnState | null;
    /** Repository-relative paths of the favorite examples (`material/<topic>/examples/<file>`). */
    favoritePaths: Set<string>;
    favoriteEntries: FavoriteEntry[];
    pendingPaths: Set<string>;
    pendingEntries: PendingEntry[];
    // Session persistence and the theory viewer's debounced render
    _sessionPersistenceReady: boolean;
    /** Handle of the pending `window.setTimeout` that re-renders the theory viewer; 0 when none. */
    _theoryViewerRenderTimer: number;
    /** The editor text changed since the theory viewer last rendered it. */
    _theoryViewerStale: boolean;
    readonly theoryViewerRenderDelayMs: number;

    // UI elements for view switching and layout
    readonly appShell: HTMLElement;
    readonly sidebarElement: HTMLElement;
    readonly sidebarToggle: HTMLButtonElement;
    readonly sidebarResizer: HTMLElement;
    readonly workspaceElement: HTMLElement | null;
    readonly editorColumn: HTMLElement;
    readonly workspaceResizer: HTMLElement | null;
    readonly galleryView: HTMLElement;
    readonly editorToolbar: HTMLElement;
    readonly editorPanels: HTMLElement;
    readonly btnResetLayout: HTMLButtonElement | null;
    readonly previewColumn: HTMLElement | null;
    readonly previewHeader: HTMLElement | null;
    readonly previewEditorialSummary: HTMLElement | null;
    readonly previewEditorialDescription: HTMLParagraphElement | null;
    readonly previewEditorialMeta: HTMLElement | null;
    readonly previewFrame: HTMLIFrameElement | null;
    readonly previewFrameContainer: HTMLElement;
    readonly btnViewportSliderToggle: HTMLButtonElement | null;
    readonly btnViewportWidthInc: HTMLButtonElement | null;
    readonly btnViewportWidthDec: HTMLButtonElement | null;
    readonly previewViewportRail: HTMLElement | null;
    readonly btnExitTheoryEditor: HTMLButtonElement | null;
    readonly previewConsole: HTMLElement | null;
    readonly previewConsoleResizer: HTMLElement | null;
    /** Transparent layer shown over the iframe during a drag so the iframe cannot swallow mouse events. */
    readonly dragShield: HTMLElement | null;
    readonly btnPreviewZoomDec: HTMLButtonElement | null;
    readonly btnPreviewZoomInc: HTMLButtonElement | null;
    readonly btnPreviewZoomToggle: HTMLButtonElement | null;
    readonly btnPreviewZoomReset: HTMLButtonElement | null;
    readonly previewZoomControls: HTMLElement | null;
    readonly previewZoomSlider: HTMLInputElement | null;
    readonly previewZoomDisplay: HTMLSpanElement | null;
    readonly viewportSelect: HTMLSelectElement | null;
    readonly viewportSlider: HTMLInputElement | null;
    readonly viewportWidthDisplay: HTMLSpanElement | null;

    // Components
    readonly preview: Preview;
    readonly exercisePanel: ExercisePanel;
    readonly editor: Editor;
    readonly gallery: Gallery;
    readonly favoritesDialog: FavoritesDialog;
    readonly pendingDialog: PendingDialog;
    readonly theoryExerciseDialog: TheoryExerciseDialog;
    readonly assetsDialog: AssetsDialog;
    readonly btnGalleryAssets: HTMLButtonElement | null;
    readonly theoryViewer: TheoryViewer;
    readonly sidebar: Sidebar;
    readonly createDialog: CreateDialog;

    constructor() {
        this.currentTopicPath = null;
        this.sidebarMinWidth = 220;
        this.sidebarMaxWidth = 520;
        this.workspaceMinEditorWidth = 280;
        this.previewMinWidth = 320;
        this.previewFrameMinHeight = 180;
        this.previewConsoleMinHeight = 132;
        this.previewConsoleDefaultHeight = 220;
        this.sessionStorageKey = 'learncode.session';
        this.sidebarWidthStorageKey = 'learncode.sidebar.width';
        this.sidebarCollapsedStorageKey = 'learncode.sidebar.collapsed';
        this.previewEditorialSummaryVisibleStorageKey = 'learncode.preview.editorialSummaryVisible';
        this.previewWidthMode = 'full';
        this.customPreviewWidth = 375;
        this.previewViewportSliderVisible = false;
        this.previewZoomPercent = 100;
        this.previewZoomSliderVisible = false;
        this.previewHeaderHidden = false;
        this.previewEditorialSummaryVisible = window.localStorage.getItem(this.previewEditorialSummaryVisibleStorageKey) !== '0';
        this.clipboardDefaultEnabled = true;
        this.vimDefaultEnabled = true;
        this.theoryReturnState = null;
        this.favoritePaths = new Set();
        this.favoriteEntries = [];
        this.pendingPaths = new Set();
        this.pendingEntries = [];
        // Session persistence stays off until the saved session has been restored,
        // otherwise bootstrap side effects overwrite it before it is read.
        this._sessionPersistenceReady = false;
        this._theoryViewerRenderTimer = 0;
        this._theoryViewerStale = false;
        this.theoryViewerRenderDelayMs = 700;

        // UI Elements for View Switching
        this.appShell = byId('app');
        this.sidebarElement = byId('sidebar');
        this.sidebarToggle = byId<HTMLButtonElement>('btn-toggle-sidebar');
        this.sidebarResizer = byId('sidebar-resizer');
        this.workspaceElement = document.getElementById('workspace');
        this.editorColumn = byId('editor-column');
        this.workspaceResizer = document.getElementById('workspace-resizer');
        this.galleryView = byId('gallery-view');
        this.editorToolbar = queryRequired('.editor-toolbar');
        this.editorPanels = queryRequired('.editor-panels');
        this.btnResetLayout = document.getElementById('btn-reset-layout') as HTMLButtonElement | null;
        this.previewColumn = document.getElementById('preview-column');
        this.previewHeader = document.querySelector<HTMLElement>('.preview-header');
        this.previewEditorialSummary = document.getElementById('preview-editorial-summary');
        this.previewEditorialDescription = document.getElementById('preview-editorial-description') as HTMLParagraphElement | null;
        this.previewEditorialMeta = document.getElementById('preview-editorial-meta');
        this.previewFrame = document.getElementById('preview-frame') as HTMLIFrameElement | null;
        this.previewFrameContainer = byId('preview-frame-container');
        this.btnViewportSliderToggle = document.getElementById('btn-viewport-slider-toggle') as HTMLButtonElement | null;
        this.btnViewportWidthInc = document.getElementById('btn-viewport-width-inc') as HTMLButtonElement | null;
        this.btnViewportWidthDec = document.getElementById('btn-viewport-width-dec') as HTMLButtonElement | null;
        this.previewViewportRail = document.getElementById('preview-viewport-rail');
        this.btnExitTheoryEditor = document.getElementById('btn-exit-theory-editor') as HTMLButtonElement | null;
        this.previewConsole = document.getElementById('preview-console');
        this.previewConsoleResizer = document.getElementById('preview-console-resizer');
        this.dragShield = document.getElementById('drag-shield');
        this.btnPreviewZoomDec = document.getElementById('btn-preview-zoom-dec') as HTMLButtonElement | null;
        this.btnPreviewZoomInc = document.getElementById('btn-preview-zoom-inc') as HTMLButtonElement | null;
        this.btnPreviewZoomToggle = document.getElementById('btn-preview-zoom-toggle') as HTMLButtonElement | null;
        this.btnPreviewZoomReset = document.getElementById('btn-preview-zoom-reset') as HTMLButtonElement | null;
        this.previewZoomControls = document.getElementById('preview-zoom-controls');
        this.previewZoomSlider = document.getElementById('preview-zoom-slider') as HTMLInputElement | null;
        this.previewZoomDisplay = document.getElementById('preview-zoom-display') as HTMLSpanElement | null;
        this.viewportSelect = document.getElementById('viewport-select') as HTMLSelectElement | null;
        this.viewportSlider = document.getElementById('viewport-slider') as HTMLInputElement | null;
        this.viewportWidthDisplay = document.getElementById('viewport-width-display') as HTMLSpanElement | null;

        // Initialize components
        this.preview = new Preview({
            onCompileStateChange: (diagnostics: Diagnostic[]) => {
                this.editor?.setCompileDiagnostics(diagnostics);
            },
            onRuntimeDiagnosticsChange: (diagnostics: Diagnostic[]) => {
                this.editor?.setRuntimeDiagnostics(diagnostics);
            },
            onRequestShaderUniformEdit: (uniformName: string) => {
                this.editor?.openShaderUniformDialog?.(uniformName);
            },
            onTheoryExerciseOpenRequest: (topicPath: string | null, filename: string) => {
                this._openTheoryExercise(topicPath, filename);
            },
            onTheoryExercisePreviewRequest: (topicPath: string | null, filename: string) => {
                this._openTheoryExercisePreview(topicPath, filename);
            },
        });

        this.exercisePanel = new ExercisePanel({
            onRevealHint: () => this.editor.revealNextExerciseHint(),
            onRevealReferences: () => this.editor.revealExerciseReferences(),
            onRevealSolution: () => this.editor.revealExerciseSolutions(),
            onSelectComparisonPair: (pairId: string) => this.editor.selectExerciseComparisonPair(pairId),
            onToggleCollapse: () => this.editor.toggleExerciseNotesCollapsed(),
            onToggleComparison: () => this.editor.toggleExerciseComparison(),
        });

        this.editor = new Editor({
            getShaderPersistedState: () => this.preview.getShaderPersistedState(),
            onCodeChange: (documentModel: EditorDocument) => {
                this.exercisePanel.render(this.editor.getExercisePresentation());
                if (this.editor.isEditingTheoryDocument()) {
                    this._scheduleTheoryViewerRender();
                }
                this._syncPreviewEditorialSummary();
                this.preview.update(documentModel, {
                    sessionKey: this._getPreviewSessionKey(documentModel),
                });
            },
            onExerciseStateChange: (presentation: ExercisePresentation) => this.exercisePanel.render(presentation),
            onSessionStateChange: () => {
                this._syncTheoryEditorUi();
                this._syncCurrentExampleFavoriteState();
                this._syncCurrentExamplePendingState();
                this._persistSessionState();
            },
            onResetShaderRuntime: () => {
                this.preview?.resetShaderRuntime?.();
            },
            onOpenShaderControls: () => {
                this.preview?.openShaderControls?.();
            },
            onOpenShaderPanel: () => {
                this._openShaderPreviewPanel();
            },
            onTogglePreviewHeader: () => {
                this._togglePreviewHeaderHidden();
            },
            onToggleShaderPause: () => {
                this.preview?.toggleShaderPause?.();
            },
            onTogglePreviewAutoRender: () => {
                const enabled = this.preview.toggleAutoRender();
                if (enabled) {
                    this._flushTheoryViewerRender({ onlyIfStale: true });
                }
                return enabled;
            },
            onToggleConsole: () => this.preview.toggleConsole(),
            onOpenShaderTextures: () => {
                this.editor?.openShaderTextureDialog?.();
            },
            onOpenShaderUniforms: () => {
                this.editor?.openShaderUniformDialog?.();
            },
            onToggleFavoriteCurrentExample: () => this._toggleCurrentExampleFavorite(),
            onTogglePendingCurrentExample: () => this._toggleCurrentExamplePending(),
            onToggleSidebar: () => {
                const nextState = !this.appShell.classList.contains('sidebar-collapsed');
                this._setSidebarCollapsed(nextState);
            },
            onCenterWorkspace: () => this._centerWorkspaceSplit(),
            onExampleListChanged: (change: ExampleListChange) => this._handleExampleListChanged(change),
        });

        this.gallery = new Gallery({
            getTopicLabel: (topicPath: string) => this.sidebar?.describeTopic?.(topicPath) || '',
            onExampleSelect: (filename: string) => this._openExampleFromGallery(filename),
            onExampleDeleted: (topicPath: string, filename: string) => this._handleExampleListChanged({
                reason: 'deleted',
                filename,
                topicPath,
                source: 'gallery',
            }),
        });

        this.favoritesDialog = new FavoritesDialog({
            getTopicLabel: (topicPath: string) => this.sidebar?.describeTopic?.(topicPath) || '',
            onExampleSelect: (topicPath: string, filename: string) => this._openFavoriteExample(topicPath, filename),
            onRemoveFavorite: (favoritePath: string) => this._removeFavoritePath(favoritePath),
        });

        this.pendingDialog = new PendingDialog({
            getTopicLabel: (topicPath: string) => this.sidebar?.describeTopic?.(topicPath) || '',
            onExampleSelect: (topicPath: string, filename: string) => this._openPendingExample(topicPath, filename),
            onRemovePending: (pendingPath: string) => this._removePendingPath(pendingPath),
        });

        this.theoryExerciseDialog = new TheoryExerciseDialog({
            onOpenExample: (topicPath: string, filename: string) => this._openTheoryExercise(topicPath, filename),
        });

        this.assetsDialog = new AssetsDialog();
        this.btnGalleryAssets = document.getElementById('btn-gallery-assets') as HTMLButtonElement | null;
        this.btnGalleryAssets?.addEventListener('click', () => {
            if (!this.currentTopicPath) return;
            this.assetsDialog.open(this.currentTopicPath, {
                topicLabel: this.sidebar.findTopic(this.currentTopicPath)?.label || '',
            });
        });

        this.theoryViewer = new TheoryViewer({
            onEditRequest: () => this.openTheoryEditor(),
            onExerciseOpenRequest: (topicPath: string, filename: string) => this._openTheoryExercise(topicPath, filename),
            onExercisePreviewRequest: (topicPath: string, filename: string) => this._openTheoryExercisePreview(topicPath, filename),
        });

        this.sidebar = new Sidebar({
            onClipboardDefaultToggle: (enabled: boolean) => this._handleClipboardDefaultToggle(enabled),
            onFavoritesClick: () => this._openFavoritesDialog(),
            onPendingClick: () => this._openPendingDialog(),
            onPreviewInfoToggle: (visible: boolean) => this._setPreviewEditorialSummaryVisible(visible),
            onTopicSelect: (path: string, label: string) => this.selectTopic(path, label),
            onCreateClick: (topicPath?: string) => this.openCreateDialog(topicPath),
            onVimDefaultToggle: (enabled: boolean) => this._handleVimDefaultToggle(enabled),
        });
        this.sidebar.setPreviewInfoVisible(this.previewEditorialSummaryVisible);

        window.addEventListener('beforeunload', (event) => {
            if (!this._hasUnsavedWork()) return;
            event.preventDefault();
            event.returnValue = '';
        });

        // Re-render a stale theory panel as soon as it becomes visible.
        this.theoryViewer.btnTheory?.addEventListener('click', () => {
            window.requestAnimationFrame(() => this._flushTheoryViewerRender({ onlyIfStale: true }));
        });

        // Gallery Button
        const btnGallery = document.getElementById('btn-gallery');
        if (btnGallery) {
            btnGallery.addEventListener('click', () => this.showGallery());
        }

        this.createDialog = new CreateDialog({
            onCreated: ({ type, parentPath }: { type: CreateItemType; parentPath: string }) => {
                this.sidebar.load();
                if (type === 'example' && parentPath === this.currentTopicPath) {
                    this.gallery.load(this.currentTopicPath);
                }
            },
        });

        this._initSidebarControls();
        this._initViewportResizer();
        this._initWorkspaceResizer();
        this._initConsoleResizer();
        this._initLayoutResetControl();
        this._initTheoryEditorControls();
        this._initPreviewZoomControls();
        this._bootstrap().catch((error) => {
            console.error('Failed to bootstrap application state.', error);
        });
    }

    /**
     * Toggles the shader panel of the preview console (the Editor's "shader panel" shortcut) and, when it
     * opens, grows the console to the height the panel asks for.
     */
    _openShaderPreviewPanel(): void {
        const state = this.preview?.openShaderPanel?.();
        if (state !== 'expanded') return;

        window.requestAnimationFrame(() => {
            // The non-null assertion is backed by the Number.isFinite check right below, which rejects null.
            const preferredHeight = this.preview?.getPreferredShaderPanelHeight?.()!;
            if (!Number.isFinite(preferredHeight) || preferredHeight <= 0) return;
            this._setConsoleHeight(preferredHeight);
        });
    }

    /**
     * Start-up sequence: load the sidebar and the global state, then restore the saved session. The saved
     * session is read first and persistence stays disabled until it has been applied.
     */
    async _bootstrap(): Promise<void> {
        // Read the saved session before anything below can persist a fresh one.
        const sessionState = this._readSessionState();
        this._sessionPersistenceReady = false;

        try {
            await this.sidebar.load();
            await this._loadClipboardDefaultState();
            await this._loadVimDefaultState({ persist: false });
            await this._loadVimShortcutConfig();
            await this._loadFavorites();
            await this._loadPending();
            await this._restoreSessionState(sessionState);
        } finally {
            this._sessionPersistenceReady = true;
        }

        this._persistSessionState();
        this._showPendingOnStartup();
    }

    /** With no topic restored, the start page is the Gallery listing the pending examples that still exist. */
    _showPendingOnStartup(): void {
        if (this.currentTopicPath) return;

        const existingEntries = this.pendingEntries.filter((entry) => entry?.exists);
        if (existingEntries.length === 0) return;

        this.showGallery();
        this.gallery.renderPendingEntries(existingEntries, {
            onOpenEntry: (topicPath: string, filename: string) => this._openPendingExample(topicPath, filename),
        });
    }

    // ── Unsaved changes guard ──

    /** The Editor has unsaved edits, or the example parked behind a theory edit has. */
    _hasUnsavedWork(): boolean {
        if (this.editor?.hasUnsavedChanges?.()) return true;
        return this.theoryReturnState?.snapshot?.dirty === true;
    }

    /** Asks the user before work is thrown away; true when there is none or the user agrees. */
    _confirmDiscardUnsavedChanges(actionLabel: string = 'continue'): boolean {
        if (!this._hasUnsavedWork()) return true;

        const label = this.editor?.hasUnsavedChanges?.()
            ? this.editor.getDocumentLabel()
            : 'The example you were editing before opening the theory';
        return window.confirm(buildDiscardChangesMessage(label, actionLabel));
    }

    async _openExampleFromGallery(filename: string): Promise<void> {
        if (!this._confirmDiscardUnsavedChanges(`open "${filename}"`)) return;
        this.theoryReturnState = null;
        await this.loadExample(filename, { skipGuard: true });
    }

    /**
     * Reacts to a created, renamed or deleted example: reloads favorites and pending (their entries may now
     * point at a missing file), and refreshes the Gallery when the open topic is the one that changed.
     */
    async _handleExampleListChanged({ reason = '', filename = '', topicPath = '', source = 'editor' }: ExampleListChange = {}): Promise<void> {
        const affectsCurrentTopic = Boolean(topicPath) && topicPath === this.currentTopicPath;

        if (
            reason === 'deleted'
            && source === 'gallery'
            && affectsCurrentTopic
            && this.editor?.currentFilename === filename
            && !this.editor?.isEditingTheoryDocument?.()
        ) {
            // The example open in the editor no longer exists on disk.
            this.editor.clearCurrentExample();
        }

        await Promise.all([this._loadFavorites(), this._loadPending()]);

        if (affectsCurrentTopic && source !== 'gallery') {
            if (reason === 'deleted') {
                // The deleted example was open in the editor: go back to the topic gallery.
                this.showGallery();
            }
            // affectsCurrentTopic implies this.currentTopicPath is set (topicPath is truthy and equal to it).
            await this.gallery.load(this.currentTopicPath!, { preserveScroll: true });
        }

        this._syncCurrentExampleFavoriteState();
        this._syncCurrentExamplePendingState();
        this._persistSessionState();
    }

    // ── Theory viewer live render (debounced while editing main.md) ──

    _isTheoryPanelVisible(): boolean {
        return Boolean(this.theoryViewer?.panel) && !this.theoryViewer.panel.classList.contains('hidden');
    }

    /**
     * Marks the theory viewer stale and, if it is visible and auto-render is on, re-renders it after
     * `theoryViewerRenderDelayMs` of quiet. Otherwise the render waits for `_flushTheoryViewerRender`.
     */
    _scheduleTheoryViewerRender(): void {
        this._theoryViewerStale = true;
        window.clearTimeout(this._theoryViewerRenderTimer);
        this._theoryViewerRenderTimer = 0;

        // Respect the preview auto-render toggle and skip work while the panel is hidden;
        // stale content is rendered when the panel is shown or theory editing ends.
        if (this.preview?.isAutoRenderEnabled?.() === false) return;
        if (!this._isTheoryPanelVisible()) return;

        this._theoryViewerRenderTimer = window.setTimeout(() => {
            this._theoryViewerRenderTimer = 0;
            this._flushTheoryViewerRender();
        }, this.theoryViewerRenderDelayMs);
    }

    /** Renders the editor's `main.md` text into the theory viewer now (only if stale and visible with `onlyIfStale`). */
    _flushTheoryViewerRender({ onlyIfStale = false }: { onlyIfStale?: boolean } = {}): void {
        if (onlyIfStale && !this._theoryViewerStale) return;
        if (onlyIfStale && !this._isTheoryPanelVisible()) return;
        if (!this.editor?.isEditingTheoryDocument?.()) {
            this._theoryViewerStale = false;
            return;
        }

        window.clearTimeout(this._theoryViewerRenderTimer);
        this._theoryViewerRenderTimer = 0;
        this._theoryViewerStale = false;
        this.theoryViewer.renderContent(this.editor.getTheoryContent());
    }

    async _loadVimShortcutConfig(): Promise<void> {
        try {
            const state = await fetchVimShortcutConfig();
            this.editor.setVimShortcutConfig(state?.config || null);

            if (Array.isArray(state?.warnings) && state.warnings.length > 0) {
                console.warn('Falling back to default Vim shortcuts.', state.warnings.join(' | '));
                showToast(`vim-shortcuts.yaml ignored (using defaults): ${state.warnings[0]}`, 'warning');
            }
        } catch (error) {
            console.error('Failed to load vim-shortcuts.yaml.', error);
        }
    }

    async _loadFavorites(): Promise<void> {
        try {
            const state = await fetchFavorites();
            this.favoriteEntries = Array.isArray(state?.entries) ? state.entries : [];
            this.favoritePaths = new Set(Array.isArray(state?.items) ? state.items : []);
            this._syncCurrentExampleFavoriteState();
        } catch (error) {
            console.error('Failed to load favorites.', error);
        }
    }

    /**
     * Opens an example linked from a theory page. When theory is being edited it is saved first (and the
     * example parked behind it is dropped, after a confirm if it has unsaved edits).
     */
    async _openTheoryExercise(topicPath: string | null, filename: string): Promise<void> {
        const normalizedTopicPath = String(topicPath || '').trim();
        const normalizedFilename = String(filename || '').trim();
        if (!normalizedTopicPath || !normalizedFilename) return;

        if (this.editor?.isEditingTheoryDocument?.()) {
            const saved = await this.editor.saveTheoryDocument();
            if (!saved) return;
            if (
                this.theoryReturnState?.snapshot?.dirty
                && !window.confirm(buildDiscardChangesMessage(
                    'The example you were editing before opening the theory',
                    `open "${normalizedFilename}"`,
                ))
            ) {
                return;
            }
            this.theoryReturnState = null;
            this._syncTheoryEditorUi();
        } else if (!this._confirmDiscardUnsavedChanges(`open "${normalizedFilename}"`)) {
            return;
        }

        this.theoryViewer?.hide?.();

        if (normalizedTopicPath !== this.currentTopicPath) {
            await this.selectTopic(normalizedTopicPath, normalizedTopicPath, { persist: false, skipGuard: true });
        }

        await this.loadExample(normalizedFilename, { skipGuard: true });
    }

    /** Shows an example from a theory page in the preview dialog, without leaving the theory. */
    async _openTheoryExercisePreview(topicPath: string | null, filename: string): Promise<void> {
        await this.theoryExerciseDialog?.open?.({ topicPath, filename });
    }

    async _loadClipboardDefaultState(): Promise<void> {
        try {
            const state = await fetchClipboardDefaultState();
            this.clipboardDefaultEnabled = state?.enabled !== false;
            this.sidebar.setClipboardDefaultEnabled(this.clipboardDefaultEnabled);
            this.editor.setGlobalSystemClipboardDefaultEnabled(this.clipboardDefaultEnabled, { showToast: false });
        } catch (error) {
            console.error('Failed to load default clipboard state.', error);
        }
    }

    async _loadVimDefaultState({ persist = true }: PersistOptions = {}): Promise<void> {
        try {
            const state = await fetchVimDefaultState();
            this.vimDefaultEnabled = state?.enabled !== false;
            this.sidebar.setVimDefaultEnabled(this.vimDefaultEnabled);
            this.editor.setGlobalVimDefaultEnabled(this.vimDefaultEnabled, { showToast: false });
            if (persist) {
                this._persistSessionState();
            }
        } catch (error) {
            console.error('Failed to load default Vim state.', error);
        }
    }

    async _handleVimDefaultToggle(enabled: boolean): Promise<void> {
        try {
            const state = await updateVimDefaultState(enabled);
            this.vimDefaultEnabled = state?.enabled !== false;
            this.sidebar.setVimDefaultEnabled(this.vimDefaultEnabled);
            this.editor.setGlobalVimDefaultEnabled(this.vimDefaultEnabled, { showToast: true });
            this._persistSessionState();
        } catch (error) {
            console.error('Failed to update default Vim state.', error);
            window.alert(`Could not update Vim default: ${errorMessage(error)}`);
        }
    }

    async _handleClipboardDefaultToggle(enabled: boolean): Promise<void> {
        try {
            const state = await updateClipboardDefaultState(enabled);
            this.clipboardDefaultEnabled = state?.enabled !== false;
            this.sidebar.setClipboardDefaultEnabled(this.clipboardDefaultEnabled);
            this.editor.setGlobalSystemClipboardDefaultEnabled(this.clipboardDefaultEnabled, { showToast: true });
        } catch (error) {
            console.error('Failed to update clipboard default state.', error);
            window.alert(`Could not update clipboard default: ${errorMessage(error)}`);
        }
    }

    /**
     * Opens a topic: points every component at it and shows its Gallery. Returns false when the user
     * declined to discard unsaved work, or when another topic was selected while the Gallery was loading.
     */
    async selectTopic(topicPath: string, label: string, { persist = true, skipGuard = false }: NavigationOptions = {}): Promise<boolean> {
        if (!skipGuard && !this._confirmDiscardUnsavedChanges('switch topic')) {
            // Keep the sidebar highlight on the topic that is still open.
            this.sidebar.setActive(this.currentTopicPath);
            return false;
        }

        this.theoryReturnState = null;
        window.clearTimeout(this._theoryViewerRenderTimer);
        this._theoryViewerStale = false;
        this.sidebar.setActive(topicPath);
        this.currentTopicPath = topicPath;

        // Update components
        this.editor.setTopicPath(topicPath);
        this.preview.setTopicPath(topicPath);
        this.gallery.currentTopicPath = topicPath;
        if (this.btnGalleryAssets) this.btnGalleryAssets.disabled = !topicPath;
        const topicLabel = this.sidebar.findTopic(topicPath)?.label || label || '';
        this.gallery.setHeading(topicLabel ? `Examples · ${topicLabel}` : 'Examples');

        // Load theory content
        this.theoryViewer.load(topicPath);
        this.exercisePanel.clear();

        this.showGallery();
        await this.gallery.load(topicPath);
        if (this.currentTopicPath !== topicPath) return false;
        this._syncCurrentExampleFavoriteState();
        this._syncCurrentExamplePendingState();

        if (persist) {
            this._persistSessionState();
        }

        return true;
    }

    /** Opens `filename` of the current topic in the Editor. Returns whether an example was actually loaded. */
    async loadExample(filename: string, { persist = true, skipGuard = false }: NavigationOptions = {}): Promise<boolean> {
        if (!skipGuard && !this._confirmDiscardUnsavedChanges(`open "${filename}"`)) return false;

        this.showEditor();
        let loaded = false;
        try {
            loaded = await this.editor.loadExample(filename);
        } catch (error) {
            console.error(`Failed to load example "${filename}".`, error);
            showToast(`Could not open ${filename}: ${errorMessage(error)}`, 'error');
            if (this.currentTopicPath) {
                this.showGallery();
            }
            return false;
        }
        if (loaded && !this.editor.isEditingTheoryDocument()) {
            // A different example replaced whatever the theory editor would return to.
            this.theoryReturnState = null;
        }
        this._syncTheoryEditorUi();
        this._syncCurrentExampleFavoriteState();
        this._syncCurrentExamplePendingState();

        if (persist) {
            this._persistSessionState();
        }

        return loaded;
    }

    /**
     * Loads the open topic's `main.md` into the Editor. If an example (or the Gallery) was showing, it is
     * remembered in `theoryReturnState` so `closeTheoryEditor()` can go back to it.
     */
    async openTheoryEditor({ persist = true }: PersistOptions = {}): Promise<void> {
        if (!this.currentTopicPath) return;

        try {
            if (!this.editor.isEditingTheoryDocument()) {
                this.theoryReturnState = this.galleryView.classList.contains('hidden')
                    ? {
                        mode: 'editor',
                        snapshot: this.editor.captureWorkspaceSnapshot(),
                    }
                    : { mode: 'gallery' };
            }

            const data = await fetchTopicMain(this.currentTopicPath);
            this._theoryViewerStale = false;
            this.showEditor();
            this.theoryViewer.hide();
            this.editor.loadTheoryDocument(data?.content || '');
            this.preview.renderNow();
            this._syncTheoryEditorUi();
            this.editor.focusActiveEditor();

            if (persist) {
                this._persistSessionState();
            }
        } catch (error) {
            console.error('Failed to open theory editor.', error);
            window.alert(`Could not open theory editor: ${errorMessage(error)}`);
        }
    }

    /** Saves `main.md` and goes back to where `openTheoryEditor()` came from. Stays in the theory editor if saving fails. */
    async closeTheoryEditor({ persist = true }: PersistOptions = {}): Promise<void> {
        if (!this.editor.isEditingTheoryDocument()) return;

        const saved = await this.editor.saveTheoryDocument();
        if (!saved) return;

        // The theory panel may have skipped live renders (hidden / auto-render off).
        this._flushTheoryViewerRender();

        const returnState = this.theoryReturnState;
        this.theoryReturnState = null;

        if (returnState?.mode === 'editor' && returnState.snapshot) {
            this.showEditor();
            await this.editor.restoreWorkspaceSnapshot(returnState.snapshot);
            this.editor.focusActiveEditor();
        } else {
            this.showGallery();
        }

        this._syncTheoryEditorUi();

        if (persist) {
            this._persistSessionState();
        }
    }

    /** Switches to the Gallery view and empties the editor-side panels (exercise notes, preview, summary). */
    showGallery(): void {
        this.galleryView.classList.remove('hidden');
        this.gallery.setPreviewsSuspended(false);
        this.editorToolbar.classList.add('hidden');
        this.editorPanels.classList.add('hidden');
        this.exercisePanel.clear();
        this.preview.clear();
        this._clearPreviewEditorialSummary();
        this._syncTheoryEditorUi();
        this._syncCurrentExampleFavoriteState();
        this._syncCurrentExamplePendingState();
    }

    /** Switches to the editor view (the Gallery's card previews are paused while it covers them). */
    showEditor(): void {
        this.galleryView.classList.add('hidden');
        // Gallery card iframes stop running while the editor covers the gallery.
        this.gallery.setPreviewsSuspended(true);
        this.editorToolbar.classList.remove('hidden');
        this.editorPanels.classList.remove('hidden');
        this._syncTheoryEditorUi();
        this._syncCurrentExampleFavoriteState();
        this._syncCurrentExamplePendingState();
        this._syncPreviewEditorialSummary();
    }

    /**
     * The key of the open example in the favorites and pending lists, or '' when none is open (or when
     * theory is being edited). Favorites and pending use the same path format.
     */
    _getCurrentExampleFavoritePath(): string {
        const filename = String(this.editor?.currentFilename || '').trim();
        if (!this.currentTopicPath || !filename || this.editor?.isEditingTheoryDocument?.()) {
            return '';
        }

        return `material/${this.currentTopicPath}/examples/${filename}`;
    }

    _syncCurrentExampleFavoriteState(): void {
        const favoritePath = this._getCurrentExampleFavoritePath();
        this.editor?.setCurrentExampleFavorite?.(favoritePath ? this.favoritePaths.has(favoritePath) : false);
    }

    async _toggleCurrentExampleFavorite(): Promise<void> {
        const favoritePath = this._getCurrentExampleFavoritePath();
        if (!favoritePath) return;

        try {
            const state = this.favoritePaths.has(favoritePath)
                ? await removeFavorite(favoritePath)
                : await addFavorite(favoritePath);

            this.favoriteEntries = Array.isArray(state?.entries) ? state.entries : [];
            this.favoritePaths = new Set(Array.isArray(state?.items) ? state.items : []);
            this._syncCurrentExampleFavoriteState();

            if (this.favoritesDialog?.dialog?.open) {
                await this.favoritesDialog.render(this.favoriteEntries);
            }

            this.editor?._showToast?.(
                this.favoritePaths.has(favoritePath)
                    ? 'Added to favorites.'
                    : 'Removed from favorites.',
                'success',
            );
        } catch (error) {
            console.error('Failed to toggle favorite.', error);
            this.editor?._showToast?.(`Favorite update failed: ${errorMessage(error)}`, 'error');
        }
    }

    async _removeFavoritePath(favoritePath: string): Promise<void> {
        try {
            const state = await removeFavorite(favoritePath);
            this.favoriteEntries = Array.isArray(state?.entries) ? state.entries : [];
            this.favoritePaths = new Set(Array.isArray(state?.items) ? state.items : []);
            this._syncCurrentExampleFavoriteState();
            await this.favoritesDialog.render(this.favoriteEntries);
        } catch (error) {
            console.error('Failed to remove favorite.', error);
            this.editor?._showToast?.(`Favorite remove failed: ${errorMessage(error)}`, 'error');
        }
    }

    async _openFavoritesDialog(): Promise<void> {
        await this._loadFavorites();
        this.favoritesDialog.open(this.favoriteEntries);
    }

    async _openFavoriteExample(topicPath: string, filename: string): Promise<void> {
        await this._openExampleFromTopic(topicPath, filename);
    }

    /** Opens an example of any topic (used by Favorites and Pending): selects its topic first when needed. */
    async _openExampleFromTopic(topicPath: string, filename: string): Promise<void> {
        const topic = this._findTopicByPath(topicPath);
        if (!topic) {
            showToast(`Topic not found: ${topicPath}`, 'error');
            return;
        }

        if (!this._confirmDiscardUnsavedChanges(`open "${filename}"`)) return;
        this.theoryReturnState = null;

        if (this.currentTopicPath !== topicPath) {
            const selected = await this.selectTopic(topicPath, topic.label, { persist: false, skipGuard: true });
            if (selected === false) return;
        }

        await this.loadExample(filename, { skipGuard: true });
    }

    async _loadPending(): Promise<void> {
        try {
            const state = await fetchPending();
            this.pendingEntries = Array.isArray(state?.entries) ? state.entries : [];
            this.pendingPaths = new Set(Array.isArray(state?.items) ? state.items : []);
            this.gallery.setPendingPaths(this.pendingPaths);
            this._syncCurrentExamplePendingState();
        } catch (error) {
            console.error('Failed to load pending.', error);
        }
    }

    _syncCurrentExamplePendingState(): void {
        const pendingPath = this._getCurrentExampleFavoritePath();
        this.editor?.setCurrentExamplePending?.(pendingPath ? this.pendingPaths.has(pendingPath) : false);
    }

    async _toggleCurrentExamplePending(): Promise<void> {
        const pendingPath = this._getCurrentExampleFavoritePath();
        if (!pendingPath) return;

        try {
            const state = this.pendingPaths.has(pendingPath)
                ? await removePending(pendingPath)
                : await addPending(pendingPath);

            this.pendingEntries = Array.isArray(state?.entries) ? state.entries : [];
            this.pendingPaths = new Set(Array.isArray(state?.items) ? state.items : []);
            this.gallery.setPendingPaths(this.pendingPaths);
            this._syncCurrentExamplePendingState();

            if (this.pendingDialog?.dialog?.open) {
                await this.pendingDialog.render(this.pendingEntries);
            }

            this.editor?._showToast?.(
                this.pendingPaths.has(pendingPath)
                    ? 'Added to pending.'
                    : 'Removed from pending.',
                'success',
            );
        } catch (error) {
            console.error('Failed to toggle pending.', error);
            this.editor?._showToast?.(`Pending update failed: ${errorMessage(error)}`, 'error');
        }
    }

    async _removePendingPath(pendingPath: string): Promise<void> {
        try {
            const state = await removePending(pendingPath);
            this.pendingEntries = Array.isArray(state?.entries) ? state.entries : [];
            this.pendingPaths = new Set(Array.isArray(state?.items) ? state.items : []);
            this.gallery.setPendingPaths(this.pendingPaths);
            this._syncCurrentExamplePendingState();
            await this.pendingDialog.render(this.pendingEntries);
        } catch (error) {
            console.error('Failed to remove pending.', error);
            this.editor?._showToast?.(`Pending remove failed: ${errorMessage(error)}`, 'error');
        }
    }

    async _openPendingDialog(): Promise<void> {
        await this._loadPending();
        this.pendingDialog.open(this.pendingEntries);
    }

    async _openPendingExample(topicPath: string, filename: string): Promise<void> {
        await this._openExampleFromTopic(topicPath, filename);
    }

    _initTheoryEditorControls(): void {
        this.btnExitTheoryEditor?.addEventListener('click', () => {
            this.closeTheoryEditor();
        });
    }

    /** Shows the "Done editing theory" button only while `main.md` is open in the Editor. */
    _syncTheoryEditorUi(): void {
        const isEditingTheory = this.editor?.isEditingTheoryDocument?.() === true;
        this.btnExitTheoryEditor?.classList.toggle('hidden', !isEditingTheory);
    }

    /** Height (px) the preview header takes, 0 when it is hidden. */
    _getPreviewHeaderHeight(): number {
        if (!this.previewHeader || this.previewHeader.classList.contains('hidden')) {
            return 0;
        }

        return this.previewHeader.getBoundingClientRect().height || 40;
    }

    _setPreviewHeaderHidden(hidden: boolean, { persist = true }: PersistOptions = {}): void {
        this.previewHeaderHidden = Boolean(hidden);
        this.previewHeader?.classList.toggle('hidden', this.previewHeaderHidden);
        this._setConsoleHeight(
            Number.parseInt(this.previewColumn?.style.getPropertyValue('--preview-console-height') || '', 10)
                || this.previewConsoleDefaultHeight,
            { persist: false },
        );

        if (persist) {
            this._persistSessionState();
        }
    }

    _togglePreviewHeaderHidden(): boolean {
        this._setPreviewHeaderHidden(!this.previewHeaderHidden);
        return this.previewHeaderHidden;
    }

    _initViewportResizer(): void {
        if (!this.viewportSelect || !this.viewportSlider || !this.viewportWidthDisplay || !this.previewFrame) return;

        this.viewportSelect.addEventListener('change', (event) => {
            if ((event.target as HTMLSelectElement).value === '100%') {
                this._applyFullPreviewWidth();
                return;
            }

            this._applyCustomPreviewWidth((event.target as HTMLSelectElement).value);
        });

        this.viewportSlider.addEventListener('input', (event) => {
            this._applyCustomPreviewWidth((event.target as HTMLInputElement).value);
        });

        this.btnViewportSliderToggle?.addEventListener('click', () => {
            this._setViewportSliderVisible(!this.previewViewportSliderVisible);
        });

        this.btnViewportWidthInc?.addEventListener('click', () => {
            this._adjustPreviewViewportWidth(1);
        });

        this.btnViewportWidthDec?.addEventListener('click', () => {
            this._adjustPreviewViewportWidth(-1);
        });

        this._setViewportSliderVisible(false);
    }

    _initPreviewZoomControls(): void {
        if (!this.previewFrame || !this.previewZoomSlider || !this.previewZoomDisplay || !this.btnPreviewZoomToggle) {
            return;
        }

        this._applyPreviewZoom(this.previewZoomPercent, { persist: false });
        this._setPreviewZoomControlsVisible(false);

        this.previewZoomSlider.addEventListener('input', (event) => {
            this._applyPreviewZoom((event.target as HTMLInputElement).value);
        });

        this.btnPreviewZoomToggle.addEventListener('click', () => {
            this._setPreviewZoomControlsVisible(!this.previewZoomSliderVisible);
        });

        this.btnPreviewZoomDec?.addEventListener('click', () => {
            this._adjustPreviewZoom(-5);
        });

        this.btnPreviewZoomInc?.addEventListener('click', () => {
            this._adjustPreviewZoom(5);
        });

        this.btnPreviewZoomReset?.addEventListener('click', () => {
            this._applyPreviewZoom(100);
        });
    }

    /** Restores the saved sidebar width / collapsed state and wires the toggle, the resizer and window resize. */
    _initSidebarControls(): void {
        if (!this.appShell || !this.sidebarElement || !this.sidebarToggle || !this.sidebarResizer) return;

        const storedWidth = this._readStoredNumber(this.sidebarWidthStorageKey, 280);
        const isCollapsed = window.localStorage.getItem(this.sidebarCollapsedStorageKey) === '1';

        this._setSidebarWidth(storedWidth, { persist: false });
        this._setSidebarCollapsed(isCollapsed, { persist: false });

        this.sidebarToggle.addEventListener('click', () => {
            const nextState = !this.appShell.classList.contains('sidebar-collapsed');
            this._setSidebarCollapsed(nextState);
        });

        this.sidebarResizer.addEventListener('mousedown', (event) => this._startSidebarResize(event));

        window.addEventListener('resize', () => {
            const currentWidth = this._readStoredNumber(
                this.sidebarWidthStorageKey,
                this.sidebarElement.getBoundingClientRect().width || 280,
            );
            this._setSidebarWidth(currentWidth, { persist: false });
        });
    }

    /** An integer stored under `key` in localStorage, or `fallback` when it is missing or not a number. */
    _readStoredNumber(key: string, fallback: number): number {
        const value = Number.parseInt(window.localStorage.getItem(key) || '', 10);
        return Number.isFinite(value) ? value : fallback;
    }

    _getSidebarBounds(): Bounds {
        const maxWidth = Math.max(this.sidebarMinWidth, Math.min(this.sidebarMaxWidth, window.innerWidth - 280));
        return {
            min: this.sidebarMinWidth,
            max: maxWidth,
        };
    }

    /** Sets the sidebar width (clamped to `_getSidebarBounds()`) through the `--sidebar-width` CSS variable. */
    _setSidebarWidth(width: number, { persist = true }: PersistOptions = {}): void {
        const { min, max } = this._getSidebarBounds();
        const nextWidth = Math.max(min, Math.min(max, Number(width) || min));

        this.appShell.style.setProperty('--sidebar-width', `${nextWidth}px`);

        if (!persist) return;
        window.localStorage.setItem(this.sidebarWidthStorageKey, String(nextWidth));
    }

    _setSidebarCollapsed(collapsed: boolean, { persist = true }: PersistOptions = {}): void {
        this.appShell.classList.toggle('sidebar-collapsed', collapsed);
        this.sidebarElement.setAttribute('aria-hidden', String(collapsed));

        const label = collapsed ? 'Show navigation' : 'Hide navigation';
        this.sidebarToggle.title = label;
        this.sidebarToggle.setAttribute('aria-label', label);
        this.sidebarToggle.setAttribute('aria-expanded', String(!collapsed));

        if (!persist) return;
        window.localStorage.setItem(this.sidebarCollapsedStorageKey, collapsed ? '1' : '0');
    }

    /** Collapses the sidebar and gives the editor and the preview half of the workspace each. */
    _centerWorkspaceSplit(): void {
        const applyHalfSplit = () => {
            const workspaceWidth = this.workspaceElement?.getBoundingClientRect().width || window.innerWidth;
            const dividerWidth = this.workspaceResizer?.getBoundingClientRect().width || 10;
            const nextPreviewWidth = Math.round((workspaceWidth - dividerWidth) / 2);
            this._setPreviewColumnWidth(nextPreviewWidth, { persist: false });
            this._persistSessionState();
        };

        if (!this.appShell.classList.contains('sidebar-collapsed')) {
            this._setSidebarCollapsed(true);
            window.requestAnimationFrame(() => {
                applyHalfSplit();
            });
            return;
        }

        applyHalfSplit();
    }

    _showDragShield(direction: DragDirection = 'ew'): void {
        if (!this.dragShield) return;

        this.dragShield.classList.remove('hidden', 'is-ew-resize', 'is-ns-resize');
        this.dragShield.classList.add(direction === 'ns' ? 'is-ns-resize' : 'is-ew-resize');
    }

    _hideDragShield(): void {
        if (!this.dragShield) return;

        this.dragShield.classList.add('hidden');
        this.dragShield.classList.remove('is-ew-resize', 'is-ns-resize');
    }

    /** Drag of the sidebar divider. Mouse events are listened to on the drag shield (or the document if missing). */
    _startSidebarResize(event: MouseEvent): void {
        if (this.appShell.classList.contains('sidebar-collapsed')) return;

        event.preventDefault();

        const startX = event.clientX;
        const startWidth = this.sidebarElement.getBoundingClientRect().width;
        let nextWidth = startWidth;

        this.sidebarResizer.classList.add('resizing');
        document.body.classList.add('is-resizing-sidebar');
        this._showDragShield('ew');
        const dragTarget = this.dragShield || document;

        const onMouseMove = (moveEvent: Event) => {
            nextWidth = startWidth + ((moveEvent as MouseEvent).clientX - startX);
            this._setSidebarWidth(nextWidth, { persist: false });
        };

        const onMouseUp = () => {
            dragTarget.removeEventListener('mousemove', onMouseMove);
            dragTarget.removeEventListener('mouseup', onMouseUp);
            this.sidebarResizer.classList.remove('resizing');
            document.body.classList.remove('is-resizing-sidebar');
            this._hideDragShield();
            this._setSidebarWidth(nextWidth);
        };

        dragTarget.addEventListener('mousemove', onMouseMove);
        dragTarget.addEventListener('mouseup', onMouseUp);
    }

    _initWorkspaceResizer(): void {
        if (!this.workspaceElement || !this.workspaceResizer || !this.previewColumn) return;

        const initialWidth = Math.round(this.previewColumn.getBoundingClientRect().width || 640);
        this._setPreviewColumnWidth(initialWidth, { persist: false });
        this._applyFullPreviewWidth({ persist: false });

        this.workspaceResizer.addEventListener('mousedown', (event) => this._startWorkspaceResize(event));

        window.addEventListener('resize', () => {
            if (this.previewWidthMode === 'full') {
                this._applyFullPreviewWidth({ persist: false });
            } else {
                this._applyCustomPreviewWidth(this.customPreviewWidth, { persist: false });
            }
        });
    }

    _initConsoleResizer(): void {
        if (!this.previewColumn || !this.previewConsoleResizer) return;

        this._setConsoleHeight(this.previewConsoleDefaultHeight, { persist: false });
        this.previewConsoleResizer.addEventListener('mousedown', (event) => this._startConsoleResize(event));

        window.addEventListener('resize', () => {
            // Non-null: this listener is only registered after the check at the top of the method.
            const currentHeight = Number.parseInt(
                this.previewColumn!.style.getPropertyValue('--preview-console-height') || '',
                10,
            );
            this._setConsoleHeight(
                Number.isFinite(currentHeight) ? currentHeight : this.previewConsoleDefaultHeight,
                { persist: false },
            );
        });
    }

    _initLayoutResetControl(): void {
        this.btnResetLayout?.addEventListener('click', () => this._resetLayoutState());
    }

    /** Range of the preview column width: the editor keeps at least `workspaceMinEditorWidth`. */
    _getWorkspaceBounds(): Bounds {
        const workspaceWidth = this.workspaceElement?.getBoundingClientRect().width || window.innerWidth;
        const dividerWidth = this.workspaceResizer?.getBoundingClientRect().width || 10;
        const maxWidth = Math.max(
            this.previewMinWidth,
            Math.round(workspaceWidth - this.workspaceMinEditorWidth - dividerWidth),
        );

        return {
            min: this.previewMinWidth,
            max: maxWidth,
        };
    }

    /** Sets the preview column width (clamped to `_getWorkspaceBounds()`) through `--preview-column-width`; returns the width applied. */
    _setPreviewColumnWidth(width: number, { persist = true }: PersistOptions = {}): number {
        const { min, max } = this._getWorkspaceBounds();
        const nextWidth = Math.max(min, Math.min(max, Math.round(Number(width) || min)));
        this.appShell.style.setProperty('--preview-column-width', `${nextWidth}px`);

        if (persist) {
            this._persistSessionState();
        }

        return nextWidth;
    }

    /** Range of the console height: the preview frame keeps at least `previewFrameMinHeight`. */
    _getConsoleBounds(): Bounds {
        const previewColumnHeight = this.previewColumn?.getBoundingClientRect().height || window.innerHeight;
        const previewHeaderHeight = this._getPreviewHeaderHeight();
        const resizerHeight = this.previewConsoleResizer?.getBoundingClientRect().height || 10;
        const maxHeight = Math.max(
            this.previewConsoleMinHeight,
            Math.round(previewColumnHeight - previewHeaderHeight - resizerHeight - this.previewFrameMinHeight),
        );

        return {
            min: this.previewConsoleMinHeight,
            max: maxHeight,
        };
    }

    /** Sets the console height (clamped to `_getConsoleBounds()`) through `--preview-console-height`; returns the height applied. */
    _setConsoleHeight(height: number, { persist = true }: PersistOptions = {}): number {
        if (!this.previewColumn) return this.previewConsoleDefaultHeight;

        const { min, max } = this._getConsoleBounds();
        const nextHeight = Math.max(min, Math.min(max, Math.round(Number(height) || min)));
        this.previewColumn.style.setProperty('--preview-console-height', `${nextHeight}px`);

        if (persist) {
            this._persistSessionState();
        }

        return nextHeight;
    }

    _getDefaultPreviewColumnWidth(): number {
        const preferredWidth = Math.min(Math.round(window.innerWidth * 0.48), 640);
        const { min, max } = this._getWorkspaceBounds();
        return Math.max(min, Math.min(max, preferredWidth));
    }

    /** Mirrors the preview width into the viewport select, slider and readout. */
    _syncPreviewControls(width: number, mode: PreviewWidthMode = 'custom'): void {
        if (!this.viewportSlider || !this.viewportWidthDisplay || !this.viewportSelect) return;

        if (mode === 'full') {
            this.viewportWidthDisplay.textContent = 'Full';
            this.viewportSlider.value = String(Math.min(Number(this.viewportSlider.max), width));
            this.viewportSelect.value = '100%';
            return;
        }

        this.viewportWidthDisplay.textContent = `${width}px`;
        this.viewportSlider.value = String(Math.min(Number(this.viewportSlider.max), width));
        this.viewportSelect.value = 'custom';
    }

    _setViewportSliderVisible(visible: boolean): void {
        this.previewViewportSliderVisible = Boolean(visible);
        this.previewViewportRail?.classList.toggle('hidden', !this.previewViewportSliderVisible);
        this.previewViewportRail?.setAttribute('aria-hidden', String(!this.previewViewportSliderVisible));
        this.btnViewportSliderToggle?.setAttribute('aria-expanded', String(this.previewViewportSliderVisible));
        this.btnViewportSliderToggle?.classList.toggle('is-active', this.previewViewportSliderVisible);
        this._syncPreviewRailOffsets();

        if (this.btnViewportSliderToggle) {
            this.btnViewportSliderToggle.title = this.previewViewportSliderVisible
                ? 'Hide viewport width slider'
                : 'Show viewport width slider';
            this.btnViewportSliderToggle.setAttribute('aria-label', this.btnViewportSliderToggle.title);
        }
    }

    /** Makes the preview iframe fill its column (viewport select "100%"). */
    _applyFullPreviewWidth({ persist = true }: PersistOptions = {}): void {
        if (!this.previewFrame) return;

        const columnWidth = Math.round(this.previewColumn?.getBoundingClientRect().width || this.previewMinWidth);
        this.previewWidthMode = 'full';
        this._syncPreviewControls(columnWidth, 'full');
        this._applyPreviewZoom(this.previewZoomPercent, { persist: false });

        if (persist) {
            this._persistSessionState();
        }
    }

    /** Fixes the preview iframe at `width` px (at least `previewMinWidth`); a numeric string is accepted. */
    _applyCustomPreviewWidth(width: number | string, { persist = true }: PersistOptions = {}): void {
        if (!this.previewFrame) return;

        // parseInt turns a number into its string first, so the cast is only for the type checker.
        const nextWidth = Math.max(this.previewMinWidth, Math.round(Number.parseInt(width as string, 10) || this.previewMinWidth));
        this.previewWidthMode = 'custom';
        this.customPreviewWidth = nextWidth;
        this._syncPreviewControls(nextWidth, 'custom');
        this._applyPreviewZoom(this.previewZoomPercent, { persist: false });

        if (persist) {
            this._persistSessionState();
        }
    }

    /** Moves the preview width by `delta` px within the viewport slider's range (the +/- 1px buttons). */
    _adjustPreviewViewportWidth(delta: number = 0): void {
        if (!this.previewFrame) return;

        const currentWidth = this.previewWidthMode === 'full'
            ? Math.round(this.previewColumn?.getBoundingClientRect().width || this.previewMinWidth)
            : this.customPreviewWidth;
        const sliderMin = Number.parseInt(this.viewportSlider?.min || '', 10);
        const sliderMax = Number.parseInt(this.viewportSlider?.max || '', 10);
        const minWidth = Number.isFinite(sliderMin) ? sliderMin : this.previewMinWidth;
        const maxWidth = Number.isFinite(sliderMax) ? sliderMax : 1440;
        const nextWidth = Math.max(minWidth, Math.min(maxWidth, currentWidth + Math.trunc(delta)));

        this._applyCustomPreviewWidth(nextWidth);
    }

    _setPreviewZoomControlsVisible(visible: boolean): void {
        this.previewZoomSliderVisible = Boolean(visible);
        this.previewZoomControls?.classList.toggle('hidden', !this.previewZoomSliderVisible);
        this.previewZoomControls?.setAttribute('aria-hidden', String(!this.previewZoomSliderVisible));
        this.btnPreviewZoomToggle?.setAttribute('aria-expanded', String(this.previewZoomSliderVisible));
        this.btnPreviewZoomToggle?.classList.toggle('is-active', this.previewZoomSliderVisible);
        this._syncPreviewRailOffsets();
        if (this.btnPreviewZoomToggle) {
            this.btnPreviewZoomToggle.title = this.previewZoomSliderVisible
                ? 'Hide preview zoom controls'
                : 'Show preview zoom controls';
        }
    }

    /** The zoom rail moves aside when the viewport rail is open too. */
    _syncPreviewRailOffsets(): void {
        this.previewZoomControls?.classList.toggle(
            'is-shifted-for-viewport',
            this.previewZoomSliderVisible && this.previewViewportSliderVisible,
        );
    }

    _adjustPreviewZoom(delta: number = 0): void {
        this._applyPreviewZoom(this.previewZoomPercent + delta);
    }

    /**
     * Zooms the preview iframe by CSS-scaling it (50-300%, steps of 5; `percent` may be a numeric string).
     * The iframe is made `100 / scale` times larger first, so after the transform it still fills its column.
     */
    _applyPreviewZoom(percent: number | string, { persist = true }: PersistOptions = {}): void {
        if (!this.previewFrame || !this.previewZoomSlider || !this.previewZoomDisplay) return;

        const nextZoom = Math.max(50, Math.min(300, Math.round((Number(percent) || 100) / 5) * 5));
        this.previewZoomPercent = nextZoom;
        const scale = nextZoom / 100;
        const isDefaultZoom = nextZoom === 100;
        const widthValue = this.previewWidthMode === 'full'
            ? '100%'
            : `${this.customPreviewWidth}px`;

        this.previewFrame.style.setProperty('--preview-zoom-scale', String(scale));
        this.previewFrame.style.width = isDefaultZoom
            ? widthValue
            : this.previewWidthMode === 'full'
                ? `${100 / scale}%`
                : `${this.customPreviewWidth / scale}px`;
        this.previewFrame.style.height = isDefaultZoom ? '100%' : `${100 / scale}%`;
        this.previewFrame.style.transform = isDefaultZoom ? '' : `scale(${scale})`;
        this.previewZoomSlider.value = String(nextZoom);
        this.previewZoomDisplay.textContent = `${nextZoom}%`;
        this.btnPreviewZoomDec?.toggleAttribute('disabled', nextZoom <= 50);
        this.btnPreviewZoomInc?.toggleAttribute('disabled', nextZoom >= 300);
        if (this.btnPreviewZoomReset) {
            this.btnPreviewZoomReset.textContent = `${nextZoom}%`;
            this.btnPreviewZoomReset.title = nextZoom === 100
                ? 'Preview zoom is already at 100%'
                : 'Reset preview zoom to 100%';
            this.btnPreviewZoomReset.classList.toggle('is-active', nextZoom !== 100);
            this.btnPreviewZoomReset.toggleAttribute('disabled', nextZoom === 100);
        }

        if (persist) {
            this._persistSessionState();
        }
    }

    /** The "Restore layout" button: resets the Editor's panels, the preview console and this class's layout. */
    _resetLayoutState(): void {
        this.editor?.resetLayoutState?.();
        this.preview?.resetLayoutState?.();
        this._setPreviewColumnWidth(this._getDefaultPreviewColumnWidth(), { persist: false });
        this._setConsoleHeight(this.previewConsoleDefaultHeight, { persist: false });
        this._applyFullPreviewWidth({ persist: false });
        this._applyPreviewZoom(100, { persist: false });
        this._setPreviewZoomControlsVisible(false);
        this._persistSessionState();
    }

    /** Drag of the editor / preview divider; the preview column grows as the pointer moves left. */
    _startWorkspaceResize(event: MouseEvent): void {
        if (!this.workspaceResizer || !this.previewColumn) return;

        event.preventDefault();

        const startX = event.clientX;
        const startWidth = this.previewColumn.getBoundingClientRect().width;
        let nextWidth = startWidth;

        this.workspaceResizer.classList.add('resizing');
        document.body.classList.add('is-resizing-workspace');
        this._showDragShield('ew');
        const dragTarget = this.dragShield || document;

        const onMouseMove = (moveEvent: Event) => {
            nextWidth = startWidth - ((moveEvent as MouseEvent).clientX - startX);
            this._setPreviewColumnWidth(nextWidth, { persist: false });
            if (this.previewWidthMode === 'full') {
                this._applyFullPreviewWidth({ persist: false });
            }
        };

        const onMouseUp = () => {
            dragTarget.removeEventListener('mousemove', onMouseMove);
            dragTarget.removeEventListener('mouseup', onMouseUp);
            // Non-null: the method returned early above when the divider was missing.
            this.workspaceResizer!.classList.remove('resizing');
            document.body.classList.remove('is-resizing-workspace');
            this._hideDragShield();
            this._setPreviewColumnWidth(nextWidth, { persist: false });
            if (this.previewWidthMode === 'full') {
                this._applyFullPreviewWidth({ persist: false });
            }
            this._persistSessionState();
        };

        dragTarget.addEventListener('mousemove', onMouseMove);
        dragTarget.addEventListener('mouseup', onMouseUp);
    }

    /** Drag of the preview / console divider; the console grows as the pointer moves up. */
    _startConsoleResize(event: MouseEvent): void {
        if (!this.previewConsoleResizer || !this.previewConsole || this.previewConsoleResizer.classList.contains('hidden')) {
            return;
        }

        event.preventDefault();

        const startY = event.clientY;
        const startHeight = this.previewConsole.getBoundingClientRect().height || this.previewConsoleDefaultHeight;
        let nextHeight = startHeight;

        this.previewConsoleResizer.classList.add('resizing');
        document.body.classList.add('is-resizing-console');
        this._showDragShield('ns');
        const dragTarget = this.dragShield || document;

        const onMouseMove = (moveEvent: Event) => {
            nextHeight = startHeight - ((moveEvent as MouseEvent).clientY - startY);
            this._setConsoleHeight(nextHeight, { persist: false });
        };

        const onMouseUp = () => {
            dragTarget.removeEventListener('mousemove', onMouseMove);
            dragTarget.removeEventListener('mouseup', onMouseUp);
            // Non-null: the method returned early above when the divider was missing.
            this.previewConsoleResizer!.classList.remove('resizing');
            document.body.classList.remove('is-resizing-console');
            this._hideDragShield();
            this._setConsoleHeight(nextHeight);
        };

        dragTarget.addEventListener('mousemove', onMouseMove);
        dragTarget.addEventListener('mouseup', onMouseUp);
    }

    // ── Session persistence ──

    /** The saved session, or null when there is none or it is not a JSON object. Nothing else is validated here. */
    _readSessionState(): StoredSessionState | null {
        try {
            const raw = window.localStorage.getItem(this.sessionStorageKey);
            if (!raw) return null;

            const parsed: unknown = JSON.parse(raw);
            // The stored object is untrusted: the restore methods re-check every field they use.
            return parsed && typeof parsed === 'object' ? parsed as StoredSessionState : null;
        } catch {
            return null;
        }
    }

    /** The current layout, topic and open document as the object saved by `_persistSessionState()`. */
    _captureSessionState(): SessionState {
        const editorState = this.editor?.getSessionState?.() || {};
        const previewColumnWidth = Math.round(this.previewColumn?.getBoundingClientRect().width || 0);

        return {
            version: 1,
            documentFilename: this.editor?.currentFilename || '',
            documentTarget: this.editor?.getDocumentTarget?.() || 'example',
            topicPath: this.currentTopicPath || '',
            exampleFilename: this.editor?.currentFilename || '',
            editor: {
                activeFileId: editorState.activeFileId || '',
                collapsedFileIds: Array.isArray(editorState.collapsedFileIds) ? editorState.collapsedFileIds : [],
                layoutMode: editorState.layoutMode || 'panels',
                maximizedFileId: editorState.maximizedFileId || '',
            },
            preview: {
                columnWidth: previewColumnWidth || this.previewMinWidth,
                consoleHeight: Number.parseInt(
                    this.previewColumn?.style.getPropertyValue('--preview-console-height') || '',
                    10,
                ) || this.previewConsoleDefaultHeight,
                customWidth: this.previewWidthMode === 'custom' ? this.customPreviewWidth : null,
                headerHidden: this.previewHeaderHidden,
                zoom: this.previewZoomPercent,
                widthMode: this.previewWidthMode,
            },
        };
    }

    /** Key that tells the Preview which document it is rendering: the topic plus the file, or the draft's session id. */
    _getPreviewSessionKey(documentModel: EditorDocument): string {
        const parts = [
            this.currentTopicPath || '',
            this.editor?.currentFilename || documentModel?.sessionId || 'draft',
        ];

        return parts.join('::');
    }

    /** Saves the session; a no-op until the saved one has been restored, and silent when storage fails. */
    _persistSessionState(): void {
        if (!this._sessionPersistenceReady) return;

        try {
            window.localStorage.setItem(this.sessionStorageKey, JSON.stringify(this._captureSessionState()));
        } catch {
            // Ignore storage errors so editing remains functional.
        }
    }

    _findTopicByPath(topicPath: string): MaterialTopic | null {
        // Includes topics inside hidden chapters (hidden only affects the sidebar view).
        return this.sidebar.findTopic(topicPath);
    }

    /**
     * Applies the preview part of a saved session. Each number may have been stored as a number or as a
     * numeric string, so it is parsed when it is not already finite; the casts below are for the type
     * checker only (`parseInt` stringifies whatever it gets).
     */
    _restorePreviewState(previewState: StoredPreviewState = {}): void {
        this._setPreviewHeaderHidden(previewState.headerHidden === true, { persist: false });

        const columnWidth = Number.isFinite(previewState.columnWidth)
            ? previewState.columnWidth as number
            : Number.parseInt(previewState.columnWidth as string, 10);
        if (Number.isFinite(columnWidth) && columnWidth > 0) {
            this._setPreviewColumnWidth(columnWidth, { persist: false });
        }

        const consoleHeight = Number.isFinite(previewState.consoleHeight)
            ? previewState.consoleHeight as number
            : Number.parseInt(previewState.consoleHeight as string, 10);
        this._setConsoleHeight(
            Number.isFinite(consoleHeight) && consoleHeight > 0
                ? consoleHeight
                : this.previewConsoleDefaultHeight,
            { persist: false },
        );

        const customWidth = Number.isFinite(previewState.customWidth)
            ? previewState.customWidth as number
            : Number.parseInt(previewState.customWidth as string, 10);

        if (previewState.widthMode === 'custom' && Number.isFinite(customWidth) && customWidth > 0) {
            this._applyCustomPreviewWidth(customWidth, { persist: false });
        } else {
            this._applyFullPreviewWidth({ persist: false });
        }

        const zoom = Number.isFinite(previewState.zoom)
            ? previewState.zoom as number
            : Number.parseInt(previewState.zoom as string, 10);
        this._applyPreviewZoom(Number.isFinite(zoom) && zoom > 0 ? zoom : 100, { persist: false });
    }

    /**
     * Brings the saved session back: layout, then the topic, then the theory editor or the example that was
     * open. Anything that no longer exists (topic, example) falls back to the Gallery or an empty editor.
     */
    async _restoreSessionState(sessionState: StoredSessionState | null = this._readSessionState()): Promise<void> {
        if (!sessionState) return;

        this._restorePreviewState(sessionState.preview || {});

        const topicPath = typeof sessionState.topicPath === 'string' ? sessionState.topicPath.trim() : '';
        if (!topicPath) {
            this.editor.restoreSessionState(sessionState.editor || {});
            this.editor.focusActiveEditor();
            this._persistSessionState();
            return;
        }

        const topic = this._findTopicByPath(topicPath);
        if (!topic) {
            this.editor.restoreSessionState(sessionState.editor || {});
            this.editor.focusActiveEditor();
            this._persistSessionState();
            return;
        }

        await this.selectTopic(topic.path, topic.label, { persist: false, skipGuard: true });
        this.editor.restoreSessionState(sessionState.editor || {});

        const documentTarget = sessionState.documentTarget === 'theory' ? 'theory' : 'example';
        const documentFilename = typeof sessionState.documentFilename === 'string'
            ? sessionState.documentFilename.trim()
            : '';
        const exampleFilename = typeof sessionState.exampleFilename === 'string'
            ? sessionState.exampleFilename.trim()
            : '';
        if (documentTarget === 'theory') {
            try {
                await this.openTheoryEditor({ persist: false });
                this.editor.restoreSessionState(sessionState.editor || {});
                this.editor.focusActiveEditor();
            } catch (error) {
                console.warn('Failed to restore previous theory session.', error);
                this.showGallery();
            }

            this._persistSessionState();
            return;
        }

        const filenameToRestore = documentFilename || exampleFilename;
        if (!filenameToRestore) {
            this._persistSessionState();
            return;
        }

        try {
            const loaded = await this.loadExample(filenameToRestore, { persist: false, skipGuard: true });
            if (!loaded) throw new Error(`Example "${filenameToRestore}" could not be loaded.`);
            this.editor.restoreSessionState(sessionState.editor || {});
            this.editor.focusActiveEditor();
        } catch (error) {
            console.warn('Failed to restore previous example session.', error);
            this.showGallery();
        }

        this._persistSessionState();
    }

    /** Opens the "Create" dialog; with a topic path (the "+" on a topic row) it starts on "example" in that topic. */
    openCreateDialog(preselectedTopicPath: string | null = null): void {
        // Offer hidden chapters too when the user is looking at them (or created
        // from a topic inside one), so the preselected parent always exists.
        const includeHidden = this.sidebar.showHiddenChapters || Boolean(preselectedTopicPath);
        const tree = this.sidebar.getTree({ includeHidden });
        this.createDialog.open(tree, preselectedTopicPath);
    }

    _clearPreviewEditorialSummary(): void {
        if (!this.previewEditorialSummary || !this.previewEditorialDescription || !this.previewEditorialMeta) return;
        this.previewEditorialSummary.classList.add('hidden');
        this.previewEditorialDescription.textContent = '';
        this.previewEditorialMeta.innerHTML = '';
    }

    _setPreviewEditorialSummaryVisible(visible: boolean): void {
        this.previewEditorialSummaryVisible = visible !== false;
        window.localStorage.setItem(
            this.previewEditorialSummaryVisibleStorageKey,
            this.previewEditorialSummaryVisible ? '1' : '0'
        );
        this.sidebar?.setPreviewInfoVisible?.(this.previewEditorialSummaryVisible);
        this._syncPreviewEditorialSummary();
    }

    /**
     * Fills the strip above the preview with the open example's description, importance, rating and first
     * four tags; hidden in the Gallery, while theory is edited, when the user turned it off, or when the
     * example has no editorial metadata.
     */
    _syncPreviewEditorialSummary(): void {
        if (!this.previewEditorialSummary || !this.previewEditorialDescription || !this.previewEditorialMeta) return;

        if (
            !this.previewEditorialSummaryVisible
            || !this.galleryView.classList.contains('hidden')
            || this.editor?.isEditingTheoryDocument?.()
        ) {
            this._clearPreviewEditorialSummary();
            return;
        }

        const metadata = this.editor?.getCurrentEditorialMetadata?.();
        if (!metadata) {
            this._clearPreviewEditorialSummary();
            return;
        }

        this.previewEditorialDescription.textContent = metadata.description || 'Example metadata';
        this.previewEditorialMeta.innerHTML = '';

        const importanceMeta = getExampleImportanceMeta(metadata.importance);
        if (importanceMeta) {
            const importance = document.createElement('span');
            importance.className = `preview-editorial-pill is-${importanceMeta.accent}`;
            importance.textContent = importanceMeta.label;
            this.previewEditorialMeta.appendChild(importance);
        }

        const ratingStars = formatExampleRatingStars(metadata.rating);
        if (ratingStars) {
            const rating = document.createElement('span');
            rating.className = 'preview-editorial-stars';
            rating.textContent = ratingStars;
            this.previewEditorialMeta.appendChild(rating);
        }

        (metadata.tags || []).slice(0, 4).forEach((tag) => {
            const tagPill = document.createElement('span');
            tagPill.className = 'preview-editorial-tag';
            tagPill.textContent = tag;
            // Non-null: checked at the top of the method.
            this.previewEditorialMeta!.appendChild(tagPill);
        });

        this.previewEditorialSummary.classList.remove('hidden');
    }
}

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

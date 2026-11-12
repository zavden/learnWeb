// The code editor: the CodeMirror editors of the open example (or of a topic's theory), their layout
// (vertical Panels or Tabs), the toolbar around them and the editor dialogs.
//
// src/main.ts creates the one instance, passes the callbacks of `EditorOptions` and drives it through the
// public methods (`setTopicPath`, `loadExample`, `loadTheoryDocument`, `captureWorkspaceSnapshot`…). The
// editor holds the open document in `currentDocument` and edits it only through the immutable document API
// of src/utils/markdown.ts: every edit replaces the document, and `onCodeChange` hands a copy to the app,
// which renders the preview.
//
// The class is split across files. This one declares every field and holds the constructor, the layout
// (Panels/Tabs, panel focus, resize, collapse and maximize), the creation of the CodeMirror views and the
// toolbar state. The mixins in src/components/editor/ (diagnostics, line highlights, session state and
// dirty tracking, exercise mode, theory editing, shader dialogs, metadata/visibility/quick-open dialogs,
// file operations) are object literals whose methods are copied onto `Editor.prototype` at the end of
// this file; declaration merging (`interface Editor extends …Mixin`) adds them to the `Editor` type.
//
// Before editing:
// - All instance state is declared here, including the fields only a mixin uses. Mixins never add fields.
// - Every render (`_renderWorkspace`) destroys and recreates the CodeMirror views. Cursor, selection, undo
//   history and scroll survive in `_editorStateCache`; line highlights in `lineHighlights`.
// - While theory is edited, `currentDocument` is the pseudo-document of src/utils/theoryDocument.ts (one
//   `main.md` file), not an example: check `_isTheoryDocumentTarget()` before example-only features.

import {
    EditorView,
    type EditorViewConfig,
    type KeyBinding,
    drawSelection,
    keymap,
    lineNumbers,
    highlightActiveLine,
    highlightActiveLineGutter,
} from '@codemirror/view';
import { EditorState, type Extension, type StateEffect } from '@codemirror/state';
import { defaultKeymap, indentWithTab, history, historyField, historyKeymap } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { css, cssLanguage } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';

import type { TopicAsset } from '../types/api.ts';
import type { Diagnostic } from '../types/diagnostics.ts';
import type {
    BlockDefinition,
    DocumentFileInput,
    DocumentHighlights,
    ExampleDocument,
    ExerciseConfig,
    FileTypeChangeOption,
    FileVisibilityKey,
    HighlightColorId,
    ShaderResolution,
    ShaderTexture,
    ShaderUniformControl,
    ShaderUniformValue,
} from '../types/document.ts';
import type { TheoryDocument } from '../types/theory.ts';
import type { ExercisePresentation } from './ExercisePanel.ts';
import { getBlockDefinition } from '../config/exampleBlocks.ts';
import { HIGHLIGHT_COLORS } from '../config/highlightColors.ts';
import { glslLanguage } from '../editor/glslLanguage.ts';
import { cssLearningSupport, htmlLearningSupport, javascriptLearningSupport } from '../editor/learningCompletions.ts';
import {
    type VimModeLabel,
    type VimShortcutConfig,
    type VimShortcutLayout,
    type VimViewCleanup,
    bindVimView,
    createVimExtension,
    getDefaultVimShortcutConfig,
    installSystemClipboardBridge,
    isSystemClipboardApiAvailable,
    setSystemClipboardEnabled,
    syncSystemClipboardRegister,
} from '../editor/vimSupport.ts';
import { vueScriptEnterCommand } from '../editor/vueSmartEnter.ts';
import { byId, queryRequired } from '../utils/dom.ts';
import {
    type PanelDirection,
    getWrappedPanelIndex,
    findDirectionalPanelTargetIndex,
} from '../utils/panelNavigation.ts';
import {
    cloneExampleDocument,
    createEmptyExampleDocument,
    getDocumentEntryCandidates,
    getDocumentLanguageOptions,
    hasBlockingDiagnostics,
    updateDocumentFileContent,
} from '../utils/markdown.ts';
import { type ToastType, showToast } from './editor/toast.ts';
import { type DirtyTracker, createDirtyTracker } from './editor/dirtyTracker.ts';

import {
    type EditorNavigationTarget,
    setEditorDiagnosticsEffect,
    EMPTY_EDITOR_DIAGNOSTICS,
    editorDiagnosticsField,
    diagnosticsMixin,
} from './editor/diagnostics.ts';
import {
    addLineHighlightEffect,
    lineHighlightField,
    lineHighlightTheme,
    removeLineHighlightEffect,
} from './editor/lineHighlightExtension.ts';
import { lineHighlightsMixin } from './editor/lineHighlightsMixin.ts';

import { sessionManagerMixin } from './editor/sessionManager.ts';
import { exercisePanelMixin } from './editor/exercisePanel.ts';
import { theoryEditorMixin } from './editor/theoryEditor.ts';
import { shaderDialogsMixin } from './editor/shaderDialogs.ts';
import { metadataDialogsMixin } from './editor/metadataDialogs.ts';
import { fileOperationsMixin } from './editor/fileOperations.ts';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * The document the editor holds (`Editor.currentDocument`): a parsed example, or the theory
 * pseudo-document while a topic's `main.md` is edited (see src/types/theory.ts).
 */
export type EditorDocument = ExampleDocument | TheoryDocument;

/** One file of the editor's document: a legacy or virtual file of an example, or the theory `main.md`. */
export type EditorFile = DocumentFileInput;

/** The two editor layouts: stacked vertical panels (one editor per file) or tabs (one editor at a time). */
export type EditorLayoutMode = VimShortcutLayout;

/** What the editor is editing: an example, or the theory (`main.md`) of the current topic. */
export type EditorDocumentTarget = 'example' | 'theory';

/** One live CodeMirror editor of the workspace (`Editor.editors`); rebuilt by every render. */
export interface EditorEntry {
    /** `EditorFile.id` of the file the editor shows. */
    id: string;
    /** Panels layout: the `.editor-panel` element; Tabs layout: the element that hosts the editor. */
    panel: HTMLElement;
    view: EditorView;
    /** Detaches the Vim bindings; `null` when Vim mode is off. */
    vimCleanup: VimViewCleanup | null;
}

/** The serialized form of an editor state (`EditorState.toJSON({ history: historyField })`). */
export interface EditorStateJson {
    /** The document text when the state was captured. */
    doc: string;
    [field: string]: unknown;
}

/**
 * The state of one file's editor kept across renders (`Editor._editorStateCache`, keyed by file path, or
 * id when the path is empty). Reused only while the file still has the same text.
 */
export interface CachedEditorState {
    /** Cursor, selection and undo history. */
    json: EditorStateJson;
    /** `view.scrollSnapshot()`, replayed through `scrollTo` when the view is recreated. */
    scroll: StateEffect<unknown>;
}

/** Collapsed and maximized panels of the Panels layout (`Editor.panelState`); part of the session state. */
export interface PanelState {
    /** File ids of the collapsed panels, without duplicates. */
    collapsedFileIds: string[];
    /** File id of the only expanded panel when every other panel is collapsed, else `null`. */
    maximizedFileId: string | null;
}

/** What the learner has revealed or toggled in exercise mode (`Editor.exerciseState`); part of the session state. */
export interface ExerciseState {
    comparisonVisible: boolean;
    /**
     * Absent right after the exercise metadata changed: `_syncExerciseConfig` resets the state with an
     * object that omits it, which reads as `false`.
     */
    notesCollapsed?: boolean;
    referencesRevealed: boolean;
    /** How many hints are shown, from 0. */
    revealedHints: number;
    /** Id of the attempt/solution pair shown in the comparison; `''` selects the first pair. */
    selectedComparePairId: string;
    solutionsRevealed: boolean;
}

/** Loading state of the linked solution example (`exercise_solution_example`) used for the comparison. */
export type ExerciseComparisonStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * The editor part of the persisted UI session (`getSessionState()`), restored with `restoreSessionState()`.
 * Passed to `EditorOptions.onSessionStateChange` and stored by src/main.ts.
 */
export interface EditorSessionState {
    activeFileId: string | null;
    collapsedFileIds: string[];
    currentFilename: string | null;
    documentTarget: EditorDocumentTarget;
    exercise: ExerciseState;
    /** The user's layout; while theory is edited (always Tabs), the layout to return to afterwards. */
    layoutMode: EditorLayoutMode;
    maximizedFileId: string | null;
    vimEnabled: boolean;
}

/**
 * Everything needed to come back to the open example after editing theory (`captureWorkspaceSnapshot()`,
 * `restoreWorkspaceSnapshot()`), including unsaved edits, highlights and editor states.
 */
export interface EditorWorkspaceSnapshot {
    currentFilename: string | null;
    /** Whether the document had unsaved changes when captured. */
    dirty: boolean;
    /** A copy of the document with its live line highlights written into the metadata. */
    document: EditorDocument;
    editorStates: Map<string, CachedEditorState>;
    /** The dirty tracker's saved signature, so unsaved changes still count as unsaved after the restore. */
    savedSignature: string | null;
    sessionState: EditorSessionState;
}

/** Why the topic's example list changed (`EditorOptions.onExampleListChanged`). */
export interface ExampleListChange {
    reason: 'created' | 'deleted' | 'renamed';
    /** The example's file name now (for `deleted`: the name it had). */
    filename: string;
    /** `created`: the name before the save (`null` for a new example); `renamed`: the old name. */
    previousFilename?: string | null;
    topicPath: string;
}

/** Mode of the file dialog: add a file/block, or edit the active virtual file's path, language and role. */
export type FileDialogMode = 'create' | 'edit';

/** State of the add/edit file dialog (`Editor.fileDialogState`, editor/fileOperations.ts). */
export interface FileDialogState {
    mode: FileDialogMode;
    /** The edited file (`edit` mode); `null` when creating. */
    fileId: string | null;
    /** The path the dialog proposed; a path still equal to it is replaced when the language changes. */
    suggestedPath: string;
    /** The role the dialog proposed; same rule as `suggestedPath`. */
    suggestedRole: string;
    /** Selected framework file template, `custom` for none. */
    templateId: string;
}

/** State of the example metadata dialog (`Editor.exampleMetadataDialogState`, editor/metadataDialogs.ts). */
export interface ExampleMetadataDialogState {
    /** Selected star rating, 0 (none) to 5. */
    rating: number;
}

/**
 * One choice of the file-type (badge) dialog: an option of `getDocumentFileTypeChangeOptions()`, or the
 * dialog's own fallback for the current type (which has no `expectedExtensions`).
 */
export type FileTypeDialogOption = Omit<FileTypeChangeOption, 'expectedExtensions'>;

/** State of the file-type (badge) dialog (`Editor.fileTypeDialogState`, editor/metadataDialogs.ts). */
export interface FileTypeDialogState {
    /** The file whose type is being changed; `null` while the dialog is closed. */
    fileId: string | null;
    options: FileTypeDialogOption[];
    /** The `value` of the selected option. */
    selectedType: string;
}

/** A uniform as the shader uniform dialog lists and edits it: a copy of a `ShaderUniform`, or a new draft. */
export interface ShaderUniformDialogEntry {
    name: string;
    /** Checked against `SHADER_UNIFORM_TYPE_OPTIONS` by the dialog before it is added. */
    type: string;
    control: ShaderUniformControl | null;
    defaultValue?: ShaderUniformValue | null;
    value?: ShaderUniformValue | null;
}

/** State of the shader uniform dialog (`Editor.shaderUniformDialogState`, editor/shaderDialogs.ts). */
export interface ShaderUniformDialogState {
    /** Index in `uniforms` of the uniform loaded in the form, `null` when the form adds a new one. */
    editingIndex: number | null;
    /** The edited list, written to the document only when the dialog is applied. */
    uniforms: ShaderUniformDialogEntry[];
}

/** State of the shader texture dialog (`Editor.shaderTextureDialogState`, editor/shaderDialogs.ts). */
export interface ShaderTextureDialogState {
    /** The topic's asset files offered as texture sources (loaded when the dialog opens). */
    assets: TopicAsset[];
    /** Index in `textures` of the texture loaded in the form, `null` when the form adds a new one. */
    editingIndex: number | null;
    /** `TopicAsset.path` of the asset picked in the form, `''` for none. */
    selectedAssetPath: string;
    /** The edited list, written to the document only when the dialog is applied. */
    textures: ShaderTexture[];
}

/** State of the file visibility dialog (`Editor.fileVisibilityDialogState`, editor/metadataDialogs.ts). */
export interface FileVisibilityDialogState {
    /** Visibility keys of the files marked hidden in the dialog (applied to `editor_hidden_files` on Apply). */
    hiddenKeys: FileVisibilityKey[];
}

/** State of the quick-open file picker (`Editor.quickOpenState`, editor/metadataDialogs.ts). */
export interface QuickOpenState {
    /** Visible files matching the query, best first. */
    matches: EditorFile[];
    /** Index of the highlighted match; `-1` when there is none. */
    selectedIndex: number;
}

/** State of the file context menu (`Editor.fileContextMenuState`, editor/metadataDialogs.ts). */
export interface FileContextMenuState {
    /** The file the open menu acts on; `null` while it is closed. */
    fileId: string | null;
}

/** What a file badge shows: a block definition, or a generic badge for languages without one. */
export interface FileBadgeDefinition extends Pick<BlockDefinition, 'badgeClass' | 'badgeLabel'> {
    /** Display name of the language; absent on the generic badge. */
    heading?: string;
}

/**
 * The line-highlight color picker popup (`.highlight-color-picker`, built by `_toggleHighlightColorPicker`
 * in editor/lineHighlightsMixin.ts). It stores its anchor button and its close function on the element, so
 * a later toggle or render can close whichever picker is open.
 */
export interface HighlightColorPickerElement extends HTMLDivElement {
    _anchorBtn?: HTMLElement;
    _close?: () => void;
}

/** The view of a new editor and the cleanup of its Vim bindings (`_createEditor`). */
type CreatedEditor = Pick<EditorEntry, 'view' | 'vimCleanup'>;

/**
 * The callbacks src/main.ts passes to the constructor. Every one is optional: the editor checks for each
 * before calling it.
 */
export interface EditorOptions {
    /**
     * The preview's live shader state; its `resolution` (changed in the preview) is written into the
     * document when a shader example is saved.
     */
    getShaderPersistedState?: () => { resolution?: ShaderResolution | null } | null;
    /**
     * The document changed (edit, load, mutation): receives a copy of it (the theory pseudo-document while
     * theory is edited). Drives the preview.
     */
    onCodeChange?: (documentModel: EditorDocument) => void;
    /** Exercise mode changed (document, revealed hints, comparison…): receives what the exercise panel shows. */
    onExerciseStateChange?: (presentation: ExercisePresentation) => void;
    /** The current example was renamed on disk. */
    onRename?: (newFilename: string, oldFilename: string) => void;
    onResetShaderRuntime?: () => void;
    /** Anything persisted in the session changed (layout, active file, panels, exercise state, document). */
    onSessionStateChange?: (sessionState: EditorSessionState) => void;
    onOpenShaderControls?: () => void;
    onOpenShaderPanel?: () => void;
    onTogglePreviewHeader?: () => void;
    onToggleShaderPause?: () => void;
    onTogglePreviewAutoRender?: () => void;
    /** Returns whether the console was toggled; a falsy result lets the Vim key reach Vim. */
    onToggleConsole?: () => boolean;
    /** Replaces the editor's own texture dialog for the Vim shortcut (called with the editor as `this`). */
    onOpenShaderTextures?: () => void;
    /** Replaces the editor's own uniform dialog for the Vim shortcut (called with the editor as `this` and `null`). */
    onOpenShaderUniforms?: (uniformName?: string | null) => void;
    onToggleFavoriteCurrentExample?: () => void | Promise<void>;
    onTogglePendingCurrentExample?: () => void | Promise<void>;
    onToggleSidebar?: () => void;
    onCenterWorkspace?: () => void;
    /** An example of the topic was created, deleted or renamed from the editor. */
    onExampleListChanged?: (change: ExampleListChange) => void;
    /** The unsaved-changes state flipped (called only on changes). */
    onDirtyStateChange?: (dirty: boolean) => void;
}

interface SetLayoutModeOptions {
    /** Store the choice in localStorage (default true). */
    persist?: boolean;
    /** Re-render the workspace (default true). */
    rerender?: boolean;
    /** Notify `onSessionStateChange` (default true). */
    emit?: boolean;
}

interface SetVimEnabledOptions extends SetLayoutModeOptions {
    /** Show a toast when the value changed (default true). */
    showToast?: boolean;
}

interface SetColumnGuideEnabledOptions {
    persist?: boolean;
    rerender?: boolean;
    showToast?: boolean;
}

interface SetSystemClipboardEnabledOptions {
    persist?: boolean;
    showToast?: boolean;
}

interface GlobalDefaultOptions {
    /** Show a toast when the value changed (default false). */
    showToast?: boolean;
}

interface CreateBadgeOptions {
    /** The file the badge belongs to; needed for `interactive`. */
    file?: EditorFile | null;
    /** Clicking the badge (or Enter/Space) opens the file-type dialog, when the file's type can be changed. */
    interactive?: boolean;
}

interface SetActivePanelOptions {
    /** Also move the keyboard focus into the panel's editor. */
    focusEditor?: boolean;
    /** Show the Vim mode of the panel's editor in the toolbar. */
    syncModeLabel?: boolean;
}

type DiagnosticsMixin = typeof diagnosticsMixin;
type LineHighlightsMixin = typeof lineHighlightsMixin;
type SessionManagerMixin = typeof sessionManagerMixin;
type ExercisePanelMixin = typeof exercisePanelMixin;
type TheoryEditorMixin = typeof theoryEditorMixin;
type ShaderDialogsMixin = typeof shaderDialogsMixin;
type MetadataDialogsMixin = typeof metadataDialogsMixin;
type FileOperationsMixin = typeof fileOperationsMixin;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLUMN_GUIDE_COLUMN = 80;

/** A faint vertical line at `column` characters (the 80-column guide). */
function createColumnGuideExtension(column: number = COLUMN_GUIDE_COLUMN): Extension {
    return EditorView.theme({
        '.cm-content': {
            position: 'relative',
        },
        '.cm-content::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            bottom: '0',
            left: `${column}ch`,
            width: '1px',
            background: 'rgba(240, 136, 62, 0.26)',
            boxShadow: '0 0 0 1px rgba(240, 136, 62, 0.1)',
            pointerEvents: 'none',
        },
    });
}

// ─── The class ────────────────────────────────────────────────────────────────

/**
 * The editor panel of the app (see the header of this file). Most methods live in the mixins of
 * src/components/editor/; the `Editor` interface below merges them into this type.
 */
export class Editor {
    readonly getShaderPersistedState: EditorOptions['getShaderPersistedState'];
    readonly onCodeChange: EditorOptions['onCodeChange'];
    readonly onExerciseStateChange: EditorOptions['onExerciseStateChange'];
    readonly onRename: EditorOptions['onRename'];
    readonly onResetShaderRuntime: EditorOptions['onResetShaderRuntime'];
    readonly onSessionStateChange: EditorOptions['onSessionStateChange'];
    readonly onOpenShaderControls: EditorOptions['onOpenShaderControls'];
    readonly onOpenShaderPanel: EditorOptions['onOpenShaderPanel'];
    readonly onTogglePreviewHeader: EditorOptions['onTogglePreviewHeader'];
    readonly onToggleShaderPause: EditorOptions['onToggleShaderPause'];
    readonly onTogglePreviewAutoRender: EditorOptions['onTogglePreviewAutoRender'];
    readonly onToggleConsole: EditorOptions['onToggleConsole'];
    readonly onOpenShaderTextures: EditorOptions['onOpenShaderTextures'];
    readonly onOpenShaderUniforms: EditorOptions['onOpenShaderUniforms'];
    readonly onToggleFavoriteCurrentExample: EditorOptions['onToggleFavoriteCurrentExample'];
    readonly onTogglePendingCurrentExample: EditorOptions['onTogglePendingCurrentExample'];
    readonly onToggleSidebar: EditorOptions['onToggleSidebar'];
    readonly onCenterWorkspace: EditorOptions['onCenterWorkspace'];
    readonly onExampleListChanged: EditorOptions['onExampleListChanged'];
    readonly onDirtyStateChange: EditorOptions['onDirtyStateChange'];

    /** `ch/sec/top` of the selected topic; `null` before one is selected. */
    currentTopicPath: string | null;
    /** File name of the open example (`main.md` while theory is edited); `null` for an unsaved or empty document. */
    currentFilename: string | null;
    /** The open document. Replaced (never mutated) on every edit. */
    currentDocument: EditorDocument;
    /** Diagnostics of the last compile (`setCompileDiagnostics`). */
    compileDiagnostics: Diagnostic[];
    /** Runtime errors reported by the preview (`setRuntimeDiagnostics`). */
    runtimeDiagnostics: Diagnostic[];
    /** The live CodeMirror editors, in render order. */
    editors: EditorEntry[];
    /** Line highlights per file id, as of the last capture from the views (the views hold the live ones). */
    lineHighlights: DocumentHighlights;
    /** Color the highlight button applies. */
    activeHighlightColor: HighlightColorId;
    /** Editor font size in px (10–24); also drives the auto-fit line height. */
    fontSize: number;
    readonly layoutModeStorageKey: string;
    readonly vimEnabledStorageKey: string;
    readonly systemClipboardStorageKey: string;
    readonly columnGuideStorageKey: string;
    vimEnabled: boolean;
    /** Vim registers use the system clipboard (only when `systemClipboardAvailable`). */
    systemClipboardEnabled: boolean;
    /** Shows the 80-column guide. */
    columnGuideEnabled: boolean;
    /** The Vim shortcut config loaded from vim-shortcuts.yaml (the defaults until the app loads it). */
    vimShortcutConfig: VimShortcutConfig;
    /** Vim mode shown in the toolbar; `''` when Vim mode is off. */
    vimModeLabel: VimModeLabel | '';
    layoutMode: EditorLayoutMode;
    readonly systemClipboardAvailable: boolean;
    /** The file that has the focus (Panels) or the open tab (Tabs); `null` when no file is visible. */
    activeFileId: string | null;
    panelState: PanelState;
    /** The exercise metadata of the document; `enabled: false` (and empty lists) outside exercise mode. */
    exerciseConfig: ExerciseConfig;
    exerciseState: ExerciseState;
    /** The parsed linked solution example, once loaded. */
    exerciseComparisonSource: ExampleDocument | null;
    /** Why loading the solution example failed; `''` otherwise. */
    exerciseComparisonSourceError: string;
    exerciseComparisonSourceStatus: ExerciseComparisonStatus;
    /** Incremented per solution load; a response for an older id is ignored. */
    exerciseComparisonRequestId: number;
    /** Where to put the cursor once the editor of its file exists (after the next render, or now). */
    pendingNavigationTarget: EditorNavigationTarget | null;
    readonly dirtyTracker: DirtyTracker;
    /** `window.setTimeout` handle of the pending dirty check; 0 when none. */
    _dirtyCheckTimer: number;
    /** `document.title` without the unsaved-changes bullet. */
    readonly _baseDocumentTitle: string;
    /** Editor states kept across renders, keyed by file path (see `CachedEditorState`). */
    _editorStateCache: Map<string, CachedEditorState>;
    /** The user's layout while theory is edited in Tabs; restored when theory editing ends. */
    _layoutModeBeforeTheory: EditorLayoutMode | null;
    /** Incremented per example load (and by anything that replaces the document); stale loads are dropped. */
    _exampleLoadRequestId: number;
    // Elements of index.html, all present on the page. `| null` (looked up with getElementById) where every
    // use checks for the element first; non-null (looked up with byId) where some code path uses it unchecked.
    /** `.editor-panels`: the container the layouts render into. */
    readonly workspace: HTMLDivElement;
    readonly dragShield: HTMLDivElement | null;
    readonly btnSave: HTMLButtonElement;
    readonly btnModify: HTMLButtonElement;
    readonly btnRemove: HTMLButtonElement;
    readonly btnAddFile: HTMLButtonElement | null;
    readonly btnToggleFavoriteExample: HTMLButtonElement | null;
    readonly btnTogglePendingExample: HTMLButtonElement | null;
    readonly btnEditExampleMetadata: HTMLButtonElement | null;
    readonly btnEditShaderUniforms: HTMLButtonElement | null;
    readonly btnEditShaderTextures: HTMLButtonElement | null;
    readonly btnEditFileVisibility: HTMLButtonElement | null;
    readonly btnDuplicateFile: HTMLButtonElement | null;
    readonly btnEditFile: HTMLButtonElement | null;
    readonly btnDeleteFile: HTMLButtonElement | null;
    readonly btnColumnGuideToggle: HTMLButtonElement | null;
    readonly btnQuickOpenFile: HTMLButtonElement | null;
    readonly btnLayout: HTMLButtonElement | null;
    readonly btnContextHints: HTMLButtonElement | null;
    readonly btnAutoFit: HTMLButtonElement | null;
    readonly btnSystemClipboardToggle: HTMLButtonElement | null;
    readonly btnVimToggle: HTMLButtonElement | null;
    readonly vimModeIndicator: HTMLSpanElement | null;
    readonly entrySelectGroup: HTMLLabelElement | null;
    readonly entrySelect: HTMLSelectElement | null;
    readonly tabFileSelectHost: HTMLDivElement | null;
    readonly previewFilenameDisplay: HTMLSpanElement | null;
    readonly statusDisplay: HTMLDivElement | null;
    readonly fileDialog: HTMLDialogElement;
    readonly fileDialogTitle: HTMLHeadingElement;
    readonly fileDialogPathGroup: HTMLDivElement;
    readonly fileDialogPath: HTMLInputElement;
    readonly fileDialogTemplateGroup: HTMLDivElement | null;
    readonly fileDialogTemplate: HTMLSelectElement | null;
    readonly fileDialogLanguage: HTMLSelectElement | null;
    readonly fileDialogRoleGroup: HTMLDivElement;
    readonly fileDialogRole: HTMLSelectElement;
    readonly fileDialogHint: HTMLParagraphElement;
    readonly fileDialogCancel: HTMLButtonElement | null;
    readonly fileDialogConfirm: HTMLButtonElement;
    readonly fileDialogForm: HTMLFormElement | null;
    readonly exampleMetadataDialog: HTMLDialogElement | null;
    readonly exampleDescriptionInput: HTMLTextAreaElement | null;
    readonly exampleTagsInput: HTMLInputElement | null;
    readonly exampleRatingStars: HTMLDivElement | null;
    readonly btnExampleRatingClear: HTMLButtonElement | null;
    readonly exampleImportanceSelect: HTMLSelectElement | null;
    readonly exampleImportancePreview: HTMLSpanElement | null;
    readonly exampleMetadataHint: HTMLParagraphElement | null;
    readonly btnExampleMetadataCancel: HTMLButtonElement | null;
    readonly btnExampleMetadataApply: HTMLButtonElement | null;
    readonly fileTypeDialog: HTMLDialogElement | null;
    readonly fileTypeDialogTitle: HTMLHeadingElement | null;
    readonly fileTypeDialogNote: HTMLParagraphElement | null;
    readonly fileTypeCurrentBadge: HTMLSpanElement | null;
    readonly fileTypeCurrentLabel: HTMLElement | null;
    readonly fileTypeNextBadge: HTMLSpanElement | null;
    readonly fileTypeNextLabel: HTMLElement | null;
    readonly fileTypePathPreview: HTMLElement | null;
    readonly fileTypeOptions: HTMLDivElement | null;
    readonly fileTypeEmpty: HTMLParagraphElement | null;
    readonly fileTypeDialogHint: HTMLParagraphElement | null;
    readonly btnFileTypeCancel: HTMLButtonElement | null;
    readonly btnFileTypeApply: HTMLButtonElement | null;
    readonly shaderUniformDialog: HTMLDialogElement | null;
    readonly shaderUniformList: HTMLDivElement | null;
    readonly shaderUniformEmpty: HTMLParagraphElement | null;
    readonly shaderUniformName: HTMLInputElement | null;
    readonly shaderUniformType: HTMLSelectElement | null;
    readonly shaderUniformScalarGroup: HTMLDivElement | null;
    readonly shaderUniformDefaultScalar: HTMLInputElement | null;
    readonly shaderUniformBoolGroup: HTMLDivElement | null;
    readonly shaderUniformDefaultBool: HTMLSelectElement | null;
    readonly shaderUniformVectorGroup: HTMLDivElement | null;
    /** The four component inputs of a vector uniform (`vec2`–`vec4` use the first N). */
    readonly shaderUniformVectorInputs: (HTMLInputElement | null)[];
    readonly shaderUniformRangeGroup: HTMLDivElement | null;
    readonly shaderUniformRangeMin: HTMLInputElement | null;
    readonly shaderUniformRangeMax: HTMLInputElement | null;
    readonly shaderUniformRangeStep: HTMLInputElement | null;
    readonly shaderUniformDialogHint: HTMLParagraphElement | null;
    readonly shaderUniformDialogTypeHint: HTMLSpanElement | null;
    readonly shaderUniformDialogMode: HTMLParagraphElement | null;
    readonly btnShaderUniformAdd: HTMLButtonElement | null;
    readonly btnShaderUniformReset: HTMLButtonElement | null;
    readonly btnShaderUniformCancel: HTMLButtonElement | null;
    readonly btnShaderUniformApply: HTMLButtonElement | null;
    readonly shaderTextureDialog: HTMLDialogElement | null;
    readonly shaderTextureList: HTMLDivElement | null;
    readonly shaderTextureEmpty: HTMLParagraphElement | null;
    readonly shaderTextureName: HTMLInputElement | null;
    readonly shaderTextureAsset: HTMLInputElement | null;
    readonly shaderTextureAssets: HTMLDivElement | null;
    readonly shaderTextureAssetsEmpty: HTMLParagraphElement | null;
    readonly shaderTextureDialogMode: HTMLParagraphElement | null;
    readonly shaderTextureDialogHint: HTMLParagraphElement | null;
    readonly btnShaderTextureAdd: HTMLButtonElement | null;
    readonly btnShaderTextureReset: HTMLButtonElement | null;
    readonly btnShaderTextureCancel: HTMLButtonElement | null;
    readonly btnShaderTextureApply: HTMLButtonElement | null;
    readonly fileVisibilityDialog: HTMLDialogElement | null;
    readonly fileVisibilityList: HTMLDivElement | null;
    readonly fileVisibilityEmpty: HTMLParagraphElement | null;
    readonly fileVisibilityHint: HTMLParagraphElement | null;
    readonly btnFileVisibilityCancel: HTMLButtonElement | null;
    readonly btnFileVisibilityApply: HTMLButtonElement | null;
    readonly quickOpenDialog: HTMLDialogElement | null;
    readonly quickOpenInput: HTMLInputElement | null;
    readonly quickOpenList: HTMLDivElement | null;
    readonly quickOpenEmpty: HTMLParagraphElement | null;
    readonly quickOpenHint: HTMLParagraphElement | null;
    readonly btnQuickOpenCancel: HTMLButtonElement | null;
    readonly btnQuickOpenConfirm: HTMLButtonElement | null;
    readonly btnQuickOpenCloseIcon: HTMLButtonElement | null;
    readonly contextHintsDialog: HTMLDialogElement | null;
    readonly contextHintsDialogContent: HTMLDivElement;
    readonly contextHintsDialogNote: HTMLParagraphElement;
    readonly btnContextHintsDialogClose: HTMLButtonElement | null;
    readonly btnContextHintsDialogCloseIcon: HTMLButtonElement | null;
    readonly shortcutsDialog: HTMLDialogElement | null;
    readonly shortcutsDialogContent: HTMLDivElement | null;
    readonly shortcutsDialogNote: HTMLParagraphElement | null;
    readonly btnShortcutsDialogClose: HTMLButtonElement | null;
    readonly btnShortcutsDialogCloseIcon: HTMLButtonElement | null;
    readonly fileContextMenu: HTMLDivElement | null;
    readonly btnContextHideFile: HTMLButtonElement | null;
    readonly btnInsertExerciseEmbed: HTMLButtonElement | null;
    readonly exerciseEmbedDialog: HTMLDialogElement | null;
    readonly exerciseEmbedList: HTMLDivElement;
    readonly btnExerciseEmbedDialogClose: HTMLButtonElement | null;
    fileDialogState: FileDialogState;
    readonly exampleMetadataDialogState: ExampleMetadataDialogState;
    fileTypeDialogState: FileTypeDialogState;
    readonly shaderUniformDialogState: ShaderUniformDialogState;
    readonly shaderTextureDialogState: ShaderTextureDialogState;
    readonly fileVisibilityDialogState: FileVisibilityDialogState;
    quickOpenState: QuickOpenState;
    readonly fileContextMenuState: FileContextMenuState;
    /** The file to focus when the open dialog closes (remembered when it opened). */
    _dialogFocusTargetFileId: string | null;
    /** `requestAnimationFrame` id of the pending focus restore; 0 when none. */
    _restoreFocusFrameId: number;
    /** The open example is a favorite (set by the app; drives the star button). */
    currentExampleFavorite: boolean;
    /** The open example is marked pending (set by the app). */
    currentExamplePending: boolean;
    /**
     * Incremented per opening and closing of the exercise embed dialog (editor/theoryEditor.ts) so late
     * previews are dropped. Never set by the constructor: undefined until the dialog is first used.
     */
    _exerciseEmbedRequestId?: number;

    /**
     * Wires the editor to the page (every element is looked up in index.html) and shows an empty document.
     * Vim mode, the layout, the system clipboard and the column guide start from localStorage.
     */
    constructor({
        getShaderPersistedState,
        onCodeChange,
        onExerciseStateChange,
        onRename,
        onResetShaderRuntime,
        onSessionStateChange,
        onOpenShaderControls,
        onOpenShaderPanel,
        onTogglePreviewHeader,
        onToggleShaderPause,
        onTogglePreviewAutoRender,
        onToggleConsole,
        onOpenShaderTextures,
        onOpenShaderUniforms,
        onToggleFavoriteCurrentExample,
        onTogglePendingCurrentExample,
        onToggleSidebar,
        onCenterWorkspace,
        onExampleListChanged,
        onDirtyStateChange,
    }: EditorOptions) {
        this.getShaderPersistedState = getShaderPersistedState;
        this.onCodeChange = onCodeChange;
        this.onExerciseStateChange = onExerciseStateChange;
        this.onRename = onRename;
        this.onResetShaderRuntime = onResetShaderRuntime;
        this.onSessionStateChange = onSessionStateChange;
        this.onOpenShaderControls = onOpenShaderControls;
        this.onOpenShaderPanel = onOpenShaderPanel;
        this.onTogglePreviewHeader = onTogglePreviewHeader;
        this.onToggleShaderPause = onToggleShaderPause;
        this.onTogglePreviewAutoRender = onTogglePreviewAutoRender;
        this.onToggleConsole = onToggleConsole;
        this.onOpenShaderTextures = onOpenShaderTextures;
        this.onOpenShaderUniforms = onOpenShaderUniforms;
        this.onToggleFavoriteCurrentExample = onToggleFavoriteCurrentExample;
        this.onTogglePendingCurrentExample = onTogglePendingCurrentExample;
        this.onToggleSidebar = onToggleSidebar;
        this.onCenterWorkspace = onCenterWorkspace;
        this.onExampleListChanged = onExampleListChanged;
        this.onDirtyStateChange = onDirtyStateChange;

        this.currentTopicPath = null;
        this.currentFilename = null;
        this.currentDocument = createEmptyExampleDocument();
        this.compileDiagnostics = [];
        this.runtimeDiagnostics = [];
        this.editors = [];
        this.lineHighlights = new Map();
        this.activeHighlightColor = HIGHLIGHT_COLORS[0].id;
        this.fontSize = 13;
        this.layoutModeStorageKey = 'learncode.editor.layout';
        this.vimEnabledStorageKey = 'learncode.editor.vim';
        this.systemClipboardStorageKey = 'learncode.editor.systemClipboard';
        this.columnGuideStorageKey = 'learncode.editor.columnGuide';
        this.vimEnabled = this._readVimEnabled();
        this.systemClipboardEnabled = this._readSystemClipboardEnabled();
        this.columnGuideEnabled = this._readColumnGuideEnabled();
        this.vimShortcutConfig = getDefaultVimShortcutConfig();
        this.vimModeLabel = this.vimEnabled ? 'NORMAL' : '';
        this.layoutMode = this._readLayoutMode(this.vimEnabled ? 'tabs' : 'panels');
        this.systemClipboardAvailable = isSystemClipboardApiAvailable();
        installSystemClipboardBridge();
        setSystemClipboardEnabled(this.systemClipboardEnabled);
        this.activeFileId = null;
        this.panelState = this._sanitizePanelState();
        this.exerciseConfig = this._createEmptyExerciseConfig();
        this.exerciseState = this._sanitizeExerciseState();
        this.exerciseComparisonSource = null;
        this.exerciseComparisonSourceError = '';
        this.exerciseComparisonSourceStatus = 'idle';
        this.exerciseComparisonRequestId = 0;
        this.pendingNavigationTarget = null;
        this.dirtyTracker = createDirtyTracker();
        this._dirtyCheckTimer = 0;
        this._baseDocumentTitle = document.title;
        this._editorStateCache = new Map();
        this._layoutModeBeforeTheory = null;
        this._exampleLoadRequestId = 0;
        this.workspace = queryRequired<HTMLDivElement>('.editor-panels');
        this.dragShield = document.getElementById('drag-shield') as HTMLDivElement | null;
        this.btnSave = byId<HTMLButtonElement>('btn-save');
        this.btnModify = byId<HTMLButtonElement>('btn-modify');
        this.btnRemove = byId<HTMLButtonElement>('btn-remove');
        this.btnAddFile = document.getElementById('btn-add-file') as HTMLButtonElement | null;
        this.btnToggleFavoriteExample = document.getElementById(
            'btn-toggle-favorite-example',
        ) as HTMLButtonElement | null;
        this.btnTogglePendingExample = document.getElementById(
            'btn-toggle-pending-example',
        ) as HTMLButtonElement | null;
        this.btnEditExampleMetadata = document.getElementById('btn-edit-example-metadata') as HTMLButtonElement | null;
        this.btnEditShaderUniforms = document.getElementById('btn-edit-shader-uniforms') as HTMLButtonElement | null;
        this.btnEditShaderTextures = document.getElementById('btn-edit-shader-textures') as HTMLButtonElement | null;
        this.btnEditFileVisibility = document.getElementById('btn-edit-file-visibility') as HTMLButtonElement | null;
        this.btnDuplicateFile = document.getElementById('btn-duplicate-file') as HTMLButtonElement | null;
        this.btnEditFile = document.getElementById('btn-edit-file') as HTMLButtonElement | null;
        this.btnDeleteFile = document.getElementById('btn-delete-file') as HTMLButtonElement | null;
        this.btnColumnGuideToggle = document.getElementById('btn-column-guide-toggle') as HTMLButtonElement | null;
        this.btnQuickOpenFile = document.getElementById('btn-quick-open-file') as HTMLButtonElement | null;
        this.btnLayout = document.getElementById('btn-editor-layout') as HTMLButtonElement | null;
        this.btnContextHints = document.getElementById('btn-editor-context-hints') as HTMLButtonElement | null;
        this.btnAutoFit = document.getElementById('btn-auto-fit') as HTMLButtonElement | null;
        this.btnSystemClipboardToggle = document.getElementById(
            'btn-system-clipboard-toggle',
        ) as HTMLButtonElement | null;
        this.btnVimToggle = document.getElementById('btn-vim-toggle') as HTMLButtonElement | null;
        this.vimModeIndicator = document.getElementById('vim-mode-indicator') as HTMLSpanElement | null;
        this.entrySelectGroup = document.getElementById('entry-select-group') as HTMLLabelElement | null;
        this.entrySelect = document.getElementById('entry-select') as HTMLSelectElement | null;
        this.tabFileSelectHost = document.getElementById('editor-tab-file-select-host') as HTMLDivElement | null;
        this.previewFilenameDisplay = document.getElementById('preview-current-filename') as HTMLSpanElement | null;
        this.statusDisplay = document.getElementById('editor-status') as HTMLDivElement | null;
        this.fileDialog = byId<HTMLDialogElement>('editor-file-dialog');
        this.fileDialogTitle = byId<HTMLHeadingElement>('editor-file-dialog-title');
        this.fileDialogPathGroup = byId<HTMLDivElement>('editor-file-path-group');
        this.fileDialogPath = byId<HTMLInputElement>('editor-file-path');
        this.fileDialogTemplateGroup = document.getElementById('editor-file-template-group') as HTMLDivElement | null;
        this.fileDialogTemplate = document.getElementById('editor-file-template') as HTMLSelectElement | null;
        this.fileDialogLanguage = document.getElementById('editor-file-language') as HTMLSelectElement | null;
        this.fileDialogRoleGroup = byId<HTMLDivElement>('editor-file-role-group');
        this.fileDialogRole = byId<HTMLSelectElement>('editor-file-role');
        this.fileDialogHint = byId<HTMLParagraphElement>('editor-file-dialog-hint');
        this.fileDialogCancel = document.getElementById('editor-file-dialog-cancel') as HTMLButtonElement | null;
        this.fileDialogConfirm = byId<HTMLButtonElement>('editor-file-dialog-confirm');
        this.fileDialogForm = document.getElementById('editor-file-form') as HTMLFormElement | null;
        this.exampleMetadataDialog = document.getElementById(
            'editor-example-metadata-dialog',
        ) as HTMLDialogElement | null;
        this.exampleDescriptionInput = document.getElementById(
            'editor-example-description',
        ) as HTMLTextAreaElement | null;
        this.exampleTagsInput = document.getElementById('editor-example-tags') as HTMLInputElement | null;
        this.exampleRatingStars = document.getElementById('editor-example-rating-stars') as HTMLDivElement | null;
        this.btnExampleRatingClear = document.getElementById(
            'btn-editor-example-rating-clear',
        ) as HTMLButtonElement | null;
        this.exampleImportanceSelect = document.getElementById('editor-example-importance') as HTMLSelectElement | null;
        this.exampleImportancePreview = document.getElementById(
            'editor-example-importance-preview',
        ) as HTMLSpanElement | null;
        this.exampleMetadataHint = document.getElementById(
            'editor-example-metadata-hint',
        ) as HTMLParagraphElement | null;
        this.btnExampleMetadataCancel = document.getElementById(
            'editor-example-metadata-cancel',
        ) as HTMLButtonElement | null;
        this.btnExampleMetadataApply = document.getElementById(
            'editor-example-metadata-apply',
        ) as HTMLButtonElement | null;
        this.fileTypeDialog = document.getElementById('editor-file-type-dialog') as HTMLDialogElement | null;
        this.fileTypeDialogTitle = document.getElementById(
            'editor-file-type-dialog-title',
        ) as HTMLHeadingElement | null;
        this.fileTypeDialogNote = document.getElementById(
            'editor-file-type-dialog-note',
        ) as HTMLParagraphElement | null;
        this.fileTypeCurrentBadge = document.getElementById('editor-file-type-current-badge') as HTMLSpanElement | null;
        this.fileTypeCurrentLabel = document.getElementById('editor-file-type-current-label') as HTMLElement | null;
        this.fileTypeNextBadge = document.getElementById('editor-file-type-next-badge') as HTMLSpanElement | null;
        this.fileTypeNextLabel = document.getElementById('editor-file-type-next-label') as HTMLElement | null;
        this.fileTypePathPreview = document.getElementById('editor-file-type-path-preview') as HTMLElement | null;
        this.fileTypeOptions = document.getElementById('editor-file-type-options') as HTMLDivElement | null;
        this.fileTypeEmpty = document.getElementById('editor-file-type-empty') as HTMLParagraphElement | null;
        this.fileTypeDialogHint = document.getElementById(
            'editor-file-type-dialog-hint',
        ) as HTMLParagraphElement | null;
        this.btnFileTypeCancel = document.getElementById('editor-file-type-cancel') as HTMLButtonElement | null;
        this.btnFileTypeApply = document.getElementById('editor-file-type-apply') as HTMLButtonElement | null;
        this.shaderUniformDialog = document.getElementById('shader-uniform-dialog') as HTMLDialogElement | null;
        this.shaderUniformList = document.getElementById('shader-uniform-list') as HTMLDivElement | null;
        this.shaderUniformEmpty = document.getElementById('shader-uniform-empty') as HTMLParagraphElement | null;
        this.shaderUniformName = document.getElementById('shader-uniform-name') as HTMLInputElement | null;
        this.shaderUniformType = document.getElementById('shader-uniform-type') as HTMLSelectElement | null;
        this.shaderUniformScalarGroup = document.getElementById('shader-uniform-scalar-group') as HTMLDivElement | null;
        this.shaderUniformDefaultScalar = document.getElementById(
            'shader-uniform-default-scalar',
        ) as HTMLInputElement | null;
        this.shaderUniformBoolGroup = document.getElementById('shader-uniform-bool-group') as HTMLDivElement | null;
        this.shaderUniformDefaultBool = document.getElementById(
            'shader-uniform-default-bool',
        ) as HTMLSelectElement | null;
        this.shaderUniformVectorGroup = document.getElementById('shader-uniform-vector-group') as HTMLDivElement | null;
        this.shaderUniformVectorInputs = [
            document.getElementById('shader-uniform-vector-0') as HTMLInputElement | null,
            document.getElementById('shader-uniform-vector-1') as HTMLInputElement | null,
            document.getElementById('shader-uniform-vector-2') as HTMLInputElement | null,
            document.getElementById('shader-uniform-vector-3') as HTMLInputElement | null,
        ];
        this.shaderUniformRangeGroup = document.getElementById('shader-uniform-range-group') as HTMLDivElement | null;
        this.shaderUniformRangeMin = document.getElementById('shader-uniform-range-min') as HTMLInputElement | null;
        this.shaderUniformRangeMax = document.getElementById('shader-uniform-range-max') as HTMLInputElement | null;
        this.shaderUniformRangeStep = document.getElementById('shader-uniform-range-step') as HTMLInputElement | null;
        this.shaderUniformDialogHint = document.getElementById(
            'shader-uniform-dialog-hint',
        ) as HTMLParagraphElement | null;
        this.shaderUniformDialogTypeHint = document.getElementById(
            'shader-uniform-dialog-type-hint',
        ) as HTMLSpanElement | null;
        this.shaderUniformDialogMode = document.getElementById(
            'shader-uniform-dialog-mode',
        ) as HTMLParagraphElement | null;
        this.btnShaderUniformAdd = document.getElementById('btn-shader-uniform-add') as HTMLButtonElement | null;
        this.btnShaderUniformReset = document.getElementById('btn-shader-uniform-reset') as HTMLButtonElement | null;
        this.btnShaderUniformCancel = document.getElementById('btn-shader-uniform-cancel') as HTMLButtonElement | null;
        this.btnShaderUniformApply = document.getElementById('btn-shader-uniform-apply') as HTMLButtonElement | null;
        this.shaderTextureDialog = document.getElementById('shader-texture-dialog') as HTMLDialogElement | null;
        this.shaderTextureList = document.getElementById('shader-texture-list') as HTMLDivElement | null;
        this.shaderTextureEmpty = document.getElementById('shader-texture-empty') as HTMLParagraphElement | null;
        this.shaderTextureName = document.getElementById('shader-texture-name') as HTMLInputElement | null;
        this.shaderTextureAsset = document.getElementById('shader-texture-asset') as HTMLInputElement | null;
        this.shaderTextureAssets = document.getElementById('shader-texture-assets') as HTMLDivElement | null;
        this.shaderTextureAssetsEmpty = document.getElementById(
            'shader-texture-assets-empty',
        ) as HTMLParagraphElement | null;
        this.shaderTextureDialogMode = document.getElementById(
            'shader-texture-dialog-mode',
        ) as HTMLParagraphElement | null;
        this.shaderTextureDialogHint = document.getElementById(
            'shader-texture-dialog-hint',
        ) as HTMLParagraphElement | null;
        this.btnShaderTextureAdd = document.getElementById('btn-shader-texture-add') as HTMLButtonElement | null;
        this.btnShaderTextureReset = document.getElementById('btn-shader-texture-reset') as HTMLButtonElement | null;
        this.btnShaderTextureCancel = document.getElementById('btn-shader-texture-cancel') as HTMLButtonElement | null;
        this.btnShaderTextureApply = document.getElementById('btn-shader-texture-apply') as HTMLButtonElement | null;
        this.fileVisibilityDialog = document.getElementById(
            'editor-file-visibility-dialog',
        ) as HTMLDialogElement | null;
        this.fileVisibilityList = document.getElementById('editor-file-visibility-list') as HTMLDivElement | null;
        this.fileVisibilityEmpty = document.getElementById(
            'editor-file-visibility-empty',
        ) as HTMLParagraphElement | null;
        this.fileVisibilityHint = document.getElementById('editor-file-visibility-hint') as HTMLParagraphElement | null;
        this.btnFileVisibilityCancel = document.getElementById(
            'editor-file-visibility-cancel',
        ) as HTMLButtonElement | null;
        this.btnFileVisibilityApply = document.getElementById(
            'editor-file-visibility-apply',
        ) as HTMLButtonElement | null;
        this.quickOpenDialog = document.getElementById('editor-quick-open-dialog') as HTMLDialogElement | null;
        this.quickOpenInput = document.getElementById('editor-quick-open-input') as HTMLInputElement | null;
        this.quickOpenList = document.getElementById('editor-quick-open-list') as HTMLDivElement | null;
        this.quickOpenEmpty = document.getElementById('editor-quick-open-empty') as HTMLParagraphElement | null;
        this.quickOpenHint = document.getElementById('editor-quick-open-hint') as HTMLParagraphElement | null;
        this.btnQuickOpenCancel = document.getElementById('editor-quick-open-cancel') as HTMLButtonElement | null;
        this.btnQuickOpenConfirm = document.getElementById('editor-quick-open-open') as HTMLButtonElement | null;
        this.btnQuickOpenCloseIcon = document.getElementById(
            'editor-quick-open-close-icon',
        ) as HTMLButtonElement | null;
        this.contextHintsDialog = document.getElementById('editor-context-hints-dialog') as HTMLDialogElement | null;
        this.contextHintsDialogContent = byId<HTMLDivElement>('editor-context-hints-dialog-content');
        this.contextHintsDialogNote = byId<HTMLParagraphElement>('editor-context-hints-dialog-note');
        this.btnContextHintsDialogClose = document.getElementById(
            'editor-context-hints-dialog-close',
        ) as HTMLButtonElement | null;
        this.btnContextHintsDialogCloseIcon = document.getElementById(
            'editor-context-hints-dialog-close-icon',
        ) as HTMLButtonElement | null;
        this.shortcutsDialog = document.getElementById('editor-shortcuts-dialog') as HTMLDialogElement | null;
        this.shortcutsDialogContent = document.getElementById(
            'editor-shortcuts-dialog-content',
        ) as HTMLDivElement | null;
        this.shortcutsDialogNote = document.getElementById(
            'editor-shortcuts-dialog-note',
        ) as HTMLParagraphElement | null;
        this.btnShortcutsDialogClose = document.getElementById(
            'editor-shortcuts-dialog-close',
        ) as HTMLButtonElement | null;
        this.btnShortcutsDialogCloseIcon = document.getElementById(
            'editor-shortcuts-dialog-close-icon',
        ) as HTMLButtonElement | null;
        this.fileContextMenu = document.getElementById('editor-file-context-menu') as HTMLDivElement | null;
        this.btnContextHideFile = document.getElementById('btn-context-hide-file') as HTMLButtonElement | null;
        this.btnInsertExerciseEmbed = document.getElementById('btn-insert-exercise-embed') as HTMLButtonElement | null;
        this.exerciseEmbedDialog = document.getElementById('exercise-embed-dialog') as HTMLDialogElement | null;
        this.exerciseEmbedList = byId<HTMLDivElement>('exercise-embed-list');
        this.btnExerciseEmbedDialogClose = document.getElementById(
            'exercise-embed-dialog-close',
        ) as HTMLButtonElement | null;
        this.fileDialogState = {
            mode: 'create',
            fileId: null,
            suggestedPath: '',
            suggestedRole: '',
            templateId: 'custom',
        };
        this.exampleMetadataDialogState = {
            rating: 0,
        };
        this.fileTypeDialogState = {
            fileId: null,
            options: [],
            selectedType: '',
        };
        this.shaderUniformDialogState = {
            editingIndex: null,
            uniforms: [],
        };
        this.shaderTextureDialogState = {
            assets: [],
            editingIndex: null,
            selectedAssetPath: '',
            textures: [],
        };
        this.fileVisibilityDialogState = {
            hiddenKeys: [],
        };
        this.quickOpenState = {
            matches: [],
            selectedIndex: 0,
        };
        this.fileContextMenuState = {
            fileId: null,
        };
        this._dialogFocusTargetFileId = null;
        this._restoreFocusFrameId = 0;
        this.currentExampleFavorite = false;
        this.currentExamplePending = false;

        this._initButtons();
        this._initShortcuts();
        this._initPanelControls();
        this._initLayoutControls();
        this._initFileControls();
        this._initExampleMetadataDialog();
        this._initFileTypeDialog();
        this._initQuickOpenDialog();
        this._initShaderUniformDialog();
        this._initShaderTextureDialog();
        this._initFileVisibilityDialog();
        this._initContextHintsDialog();
        this._initShortcutsDialog();
        this._initExerciseEmbedDialog();
        this._updateFontSize(0);
        this._applyDocument(createEmptyExampleDocument(), { notify: false, reset: true });
        this._markDocumentSaved();
    }

    /** Ctrl/Cmd+S anywhere saves the open example (or theory) in place. */
    _initShortcuts(): void {
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                this._handleModify();
            }
        });
    }

    _initPanelControls(): void {
        const btnInc = document.getElementById('btn-font-inc');
        const btnDec = document.getElementById('btn-font-dec');

        if (btnInc && btnDec) {
            btnInc.addEventListener('click', () => this._updateFontSize(1));
            btnDec.addEventListener('click', () => this._updateFontSize(-1));
        }

        if (this.btnAutoFit) {
            this.btnAutoFit.addEventListener('click', () => this._handleAutoFit());
        }

        this.btnColumnGuideToggle?.addEventListener('click', () => {
            this._setColumnGuideEnabled(!this.columnGuideEnabled);
        });
    }

    _initLayoutControls(): void {
        this.btnSystemClipboardToggle?.addEventListener('click', () => {
            if (!this.systemClipboardAvailable) return;
            this._setSystemClipboardEnabled(!this.systemClipboardEnabled);
        });

        this.btnVimToggle?.addEventListener('click', () => {
            this._setVimEnabled(!this.vimEnabled);
        });

        this.btnLayout?.addEventListener('click', () => {
            this._toggleLayoutMode();
        });

        this._updateLayoutButton();
        this._updateVimUi();
        this._updateColumnGuideUi();
    }

    /** File toolbar buttons, the entry selector and the inputs of the file dialog. */
    _initFileControls(): void {
        this.btnQuickOpenFile?.addEventListener('click', () => this._openQuickOpenDialog());
        this.btnAddFile?.addEventListener('click', () => this._openFileDialog('create'));
        this.btnDuplicateFile?.addEventListener('click', () => this._handleDuplicateFile());
        this.btnEditFile?.addEventListener('click', () => this._openFileDialog('edit'));
        this.btnDeleteFile?.addEventListener('click', () => this._handleDeleteFile());
        this.entrySelect?.addEventListener('change', (event) =>
            this._handleEntryChange((event.target as HTMLSelectElement).value),
        );
        this.fileDialogTemplate?.addEventListener('change', () => this._handleFileTemplateChange());
        this.fileDialogPath?.addEventListener('change', () => {
            if (this.fileDialogState.mode !== 'create' || this._getActiveTemplateId() === 'custom') return;
            this._applySelectedTemplateToDialog();
        });

        this.fileDialogLanguage?.addEventListener('change', () => {
            if (this.fileDialogState.mode !== 'create' || this.currentDocument.sourceFormat !== 'virtual-files') return;

            if (this._getActiveTemplateId() !== 'custom') {
                this._applySelectedTemplateToDialog();
                return;
            }

            // This is the select's own change listener, so the select exists.
            const nextLanguage = this.fileDialogLanguage!.value;
            const nextSuggestion = this._getSuggestedVirtualPath(nextLanguage);
            const currentPath = this.fileDialogPath?.value.trim() || '';

            if (!currentPath || currentPath === this.fileDialogState.suggestedPath) {
                this.fileDialogPath.value = nextSuggestion;
            }

            this.fileDialogState.suggestedPath = nextSuggestion;
        });

        this.fileDialogCancel?.addEventListener('click', () => this.fileDialog?.close());
        this.fileDialogForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            this._handleFileDialogSubmit();
        });
        this.fileDialog?.addEventListener('close', () => this._scheduleEditorFocusRestore());
    }

    /**
     * Switches between Panels and Tabs. Anything other than `tabs` means Panels (session data is not
     * trusted). The options default to persisting, re-rendering and notifying the session.
     */
    _setLayoutMode(
        mode: EditorLayoutMode,
        { persist = true, rerender = true, emit = true }: SetLayoutModeOptions = {},
    ): void {
        this.layoutMode = mode === 'tabs' ? 'tabs' : 'panels';

        if (persist) {
            window.localStorage.setItem(this.layoutModeStorageKey, this.layoutMode);
        }

        this._updateLayoutButton();
        this._updatePanelControlStates();

        if (rerender) {
            this._renderWorkspace();
        }

        if (emit) {
            this._emitSessionStateChange();
        }
    }

    /** The layout button names the layout it switches to. */
    _updateLayoutButton(): void {
        if (!this.btnLayout) return;

        const label = this.layoutMode === 'panels' ? 'Tabs' : 'Panels';
        const description = this.layoutMode === 'panels' ? 'Switch to tabs view' : 'Switch to vertical panels';
        const labelNode = this.btnLayout.querySelector('.editor-layout-label');

        if (labelNode) {
            labelNode.textContent = label;
        } else {
            this.btnLayout.textContent = label;
        }

        this.btnLayout.title = description;
        this.btnLayout.setAttribute('aria-label', description);
        this.btnLayout.dataset.mode = this.layoutMode;
    }

    /** Auto-fit only works in Panels with at least one visible file. */
    _updatePanelControlStates(): void {
        if (!this.btnAutoFit) return;
        this.btnAutoFit.disabled = this.layoutMode !== 'panels' || this._getVisibleFiles().length === 0;
    }

    /** Syncs the system clipboard and Vim toggles and the Vim mode indicator with the current state. */
    _updateVimUi(): void {
        if (this.btnSystemClipboardToggle) {
            this.btnSystemClipboardToggle.classList.toggle(
                'is-active',
                this.systemClipboardEnabled && this.systemClipboardAvailable,
            );
            this.btnSystemClipboardToggle.toggleAttribute('disabled', !this.systemClipboardAvailable);
            this.btnSystemClipboardToggle.setAttribute(
                'aria-pressed',
                String(this.systemClipboardEnabled && this.systemClipboardAvailable),
            );
            this.btnSystemClipboardToggle.title = this.systemClipboardAvailable
                ? this.systemClipboardEnabled
                    ? 'Disable system clipboard'
                    : 'Enable system clipboard'
                : 'System clipboard unavailable in this browser context';
            this.btnSystemClipboardToggle.setAttribute(
                'aria-label',
                this.systemClipboardAvailable
                    ? this.systemClipboardEnabled
                        ? 'Disable system clipboard'
                        : 'Enable system clipboard'
                    : 'System clipboard unavailable in this browser context',
            );
        }

        if (this.btnVimToggle) {
            this.btnVimToggle.classList.toggle('is-active', this.vimEnabled);
            this.btnVimToggle.setAttribute('aria-pressed', String(this.vimEnabled));
            this.btnVimToggle.title = this.vimEnabled ? 'Disable Vim mode' : 'Enable Vim mode';
            this.btnVimToggle.setAttribute('aria-label', this.vimEnabled ? 'Disable Vim mode' : 'Enable Vim mode');
        }

        if (this.vimModeIndicator) {
            this.vimModeIndicator.classList.toggle('hidden', !this.vimEnabled);
            this.vimModeIndicator.textContent = this.vimEnabled ? this.vimModeLabel || 'NORMAL' : '';
        }
    }

    _updateColumnGuideUi(): void {
        if (!this.btnColumnGuideToggle) return;

        this.btnColumnGuideToggle.classList.toggle('is-active', this.columnGuideEnabled);
        this.btnColumnGuideToggle.setAttribute('aria-pressed', String(this.columnGuideEnabled));
        this.btnColumnGuideToggle.title = this.columnGuideEnabled ? 'Hide 80-column guide' : 'Show 80-column guide';
        this.btnColumnGuideToggle.setAttribute(
            'aria-label',
            this.columnGuideEnabled ? 'Hide 80-column guide' : 'Show 80-column guide',
        );
    }

    /** Shows or hides the 80-column guide; re-rendering keeps the focus on the active file. */
    _setColumnGuideEnabled(
        enabled: boolean,
        { persist = true, rerender = true, showToast = true }: SetColumnGuideEnabledOptions = {},
    ): void {
        const nextEnabled = Boolean(enabled);
        const changed = this.columnGuideEnabled !== nextEnabled;
        const activeFile = this._getActiveFile();

        this.columnGuideEnabled = nextEnabled;

        if (persist) {
            window.localStorage.setItem(this.columnGuideStorageKey, this.columnGuideEnabled ? '1' : '0');
        }

        this._updateColumnGuideUi();

        if (rerender) {
            if (activeFile) {
                this.pendingNavigationTarget = { file: activeFile };
            }
            this._renderWorkspace();
        }

        if (changed && showToast) {
            this._showToast(
                this.columnGuideEnabled ? '80-column guide enabled.' : '80-column guide disabled.',
                'success',
            );
        }
    }

    /** Turns Vim mode on or off (the editors are rebuilt with or without the Vim keymap when re-rendered). */
    _setVimEnabled(
        enabled: boolean,
        { persist = true, rerender = true, emit = true, showToast = true }: SetVimEnabledOptions = {},
    ): void {
        const nextEnabled = Boolean(enabled);
        const changed = this.vimEnabled !== nextEnabled;

        this.vimEnabled = nextEnabled;
        this.vimModeLabel = this.vimEnabled ? this.vimModeLabel || 'NORMAL' : '';

        if (persist) {
            window.localStorage.setItem(this.vimEnabledStorageKey, this.vimEnabled ? '1' : '0');
        }

        this._updateLayoutButton();
        this._updatePanelControlStates();
        this._updateVimUi();

        if (rerender) {
            this._renderWorkspace();
        }

        if (emit) {
            this._emitSessionStateChange();
        }

        if (changed && showToast) {
            this._showToast(this.vimEnabled ? 'Vim mode enabled.' : 'Vim mode disabled.', 'success');
        }
    }

    /**
     * The layout button and its Vim shortcut. An explicit choice also forgets the layout remembered for
     * after theory editing; `preserveFocus` keeps the active file focused across the re-render.
     */
    _toggleLayoutMode({ preserveFocus = false }: { preserveFocus?: boolean } = {}): void {
        const nextMode = this.layoutMode === 'panels' ? 'tabs' : 'panels';
        // An explicit layout choice wins over the layout remembered before theory editing.
        this._layoutModeBeforeTheory = null;
        const activeFile = preserveFocus ? this._getActiveFile() : null;
        if (activeFile) {
            this.pendingNavigationTarget = { file: activeFile };
        }
        this._setLayoutMode(nextMode);
    }

    /** Lets Vim's registers use the system clipboard (and pulls its current text when enabling). */
    _setSystemClipboardEnabled(
        enabled: boolean,
        { persist = true, showToast = true }: SetSystemClipboardEnabledOptions = {},
    ): void {
        const nextEnabled = Boolean(enabled);
        const changed = this.systemClipboardEnabled !== nextEnabled;

        this.systemClipboardEnabled = nextEnabled;
        setSystemClipboardEnabled(this.systemClipboardEnabled);

        if (persist) {
            window.localStorage.setItem(this.systemClipboardStorageKey, this.systemClipboardEnabled ? '1' : '0');
        }

        this._updateVimUi();

        if (this.systemClipboardEnabled) {
            void syncSystemClipboardRegister();
        }

        if (changed && showToast) {
            this._showToast(
                this.systemClipboardEnabled
                    ? 'System clipboard integration enabled for Vim.'
                    : 'System clipboard integration disabled for Vim.',
                'success',
            );
        }
    }

    /** Applies the app-wide Vim default (sidebar setting, server-stored): persisted, re-rendered, notified. */
    setGlobalVimDefaultEnabled(enabled: boolean, { showToast = false }: GlobalDefaultOptions = {}): void {
        this._setVimEnabled(enabled, {
            persist: true,
            rerender: true,
            emit: true,
            showToast,
        });
    }

    /** Applies the app-wide system clipboard default (sidebar setting, server-stored), persisted. */
    setGlobalSystemClipboardDefaultEnabled(enabled: boolean, { showToast = false }: GlobalDefaultOptions = {}): void {
        this._setSystemClipboardEnabled(enabled, {
            persist: true,
            showToast,
        });
    }

    /**
     * Enables, labels and shows the file toolbar buttons for the current document (theory, exercise and
     * shader documents restrict them), and fills the entry selector of React/Vue multi-file documents.
     */
    _updateFileControls(): void {
        const hasTopic = Boolean(this.currentTopicPath);
        const files = this._getVisibleFiles();
        const activeFile = this._getActiveFile();
        const isVirtual = this._isVirtualFileDocument();
        const isFrameworkMultiFile = this._isFrameworkMultiFileDocument();
        const isTheory = this._isTheoryDocumentTarget();
        const isShader = this._isShaderDocument();
        const isExerciseMode = this._isExerciseMode();
        const entryCandidates = getDocumentEntryCandidates(this.currentDocument);
        const languageOptions = getDocumentLanguageOptions(this.currentDocument);

        if (this.btnAddFile) {
            this.btnAddFile.disabled = !hasTopic || isExerciseMode || isTheory || languageOptions.length === 0;
            const addFileLabel = this.btnAddFile.querySelector('.toolbar-btn-label');
            if (addFileLabel) {
                addFileLabel.textContent = isVirtual ? 'File' : 'Block';
            } else {
                this.btnAddFile.textContent = isVirtual ? 'File' : 'Block';
            }
            this.btnAddFile.title = isTheory
                ? 'Theory editing keeps a fixed single file'
                : isExerciseMode
                  ? 'Exercise mode keeps the file structure fixed'
                  : languageOptions.length === 0
                    ? isShader
                        ? 'Shader documents already contain all supported blocks'
                        : 'No additional blocks are available for this document'
                    : isVirtual
                      ? 'Create a new virtual file'
                      : 'Add a new code block';
        }

        if (this.btnQuickOpenFile) {
            this.btnQuickOpenFile.disabled = files.length === 0 || isTheory;
            this.btnQuickOpenFile.title =
                files.length > 0
                    ? isTheory
                        ? 'Theory editing keeps a single active file'
                        : 'Quick search visible files'
                    : 'No visible files to open';
        }

        if (this.btnEditExampleMetadata) {
            this.btnEditExampleMetadata.disabled = !hasTopic || !files.length || isTheory;
            this.btnEditExampleMetadata.title = isTheory
                ? 'Theory metadata uses main.md directly'
                : 'Edit description, tags, rating and importance';
        }

        if (this.btnInsertExerciseEmbed) {
            this.btnInsertExerciseEmbed.classList.toggle('hidden', !isTheory);
            this.btnInsertExerciseEmbed.disabled = !hasTopic || !isTheory;
        }

        if (this.btnEditShaderUniforms) {
            this.btnEditShaderUniforms.classList.toggle('hidden', !isShader);
            this.btnEditShaderUniforms.disabled = !hasTopic || !isShader || isExerciseMode;
            this.btnEditShaderUniforms.title = isExerciseMode
                ? 'Exercise mode keeps shader uniforms fixed'
                : 'Create or remove custom shader uniforms';
        }

        if (this.btnEditShaderTextures) {
            this.btnEditShaderTextures.classList.toggle('hidden', !isShader);
            this.btnEditShaderTextures.disabled = !hasTopic || !isShader || isExerciseMode;
            this.btnEditShaderTextures.title = isExerciseMode
                ? 'Exercise mode keeps shader textures fixed'
                : 'Map sampler uniforms to topic assets';
        }

        if (this.btnEditFileVisibility) {
            const allFiles = this.currentDocument.files || [];
            this.btnEditFileVisibility.disabled = !hasTopic || allFiles.length === 0 || isExerciseMode || isTheory;
            this.btnEditFileVisibility.title = isTheory
                ? 'Theory editing keeps a single visible file'
                : isExerciseMode
                  ? 'Exercise mode keeps file visibility fixed'
                  : 'Show, hide and inspect tabs or vertical panels';
        }

        if (this.btnDuplicateFile) {
            this.btnDuplicateFile.disabled = !activeFile || isExerciseMode || isShader || isTheory;
        }

        if (this.btnEditFile) {
            this.btnEditFile.disabled = !activeFile || !isVirtual || isExerciseMode || isTheory;
        }

        if (this.btnDeleteFile) {
            this.btnDeleteFile.disabled = !activeFile || isExerciseMode || isTheory || (isVirtual && files.length <= 1);
        }

        if (!this.entrySelectGroup || !this.entrySelect) return;

        this.entrySelectGroup.classList.toggle('hidden', !isFrameworkMultiFile);
        if (!isFrameworkMultiFile) {
            this.entrySelect.innerHTML = '';
            this.entrySelect.disabled = true;
            return;
        }

        const currentEntry = String(this.currentDocument.metadata?.entry || '');
        this.entrySelect.innerHTML = '';

        if (entryCandidates.length === 0) {
            const option = document.createElement('option');
            option.textContent = 'No valid entry file';
            option.value = '';
            option.selected = true;
            this.entrySelect.appendChild(option);
            this.entrySelect.disabled = true;
            return;
        }

        entryCandidates.forEach((file) => {
            const option = document.createElement('option');
            option.value = file.path;
            option.textContent = file.path;
            option.selected = file.path === currentEntry;
            // Checked at the top of the method.
            this.entrySelect!.appendChild(option);
        });

        if (!entryCandidates.some((file) => file.path === currentEntry)) {
            this.entrySelect.value = entryCandidates[0].path;
        }

        this.entrySelect.disabled = isExerciseMode;
    }

    /**
     * Rebuilds the whole workspace for the current layout: captures editor states and highlights,
     * destroys the views, renders the visible files (or an empty-state message) and applies
     * `pendingNavigationTarget`. Called after almost every state change.
     */
    _renderWorkspace(): void {
        this._closeFileContextMenu();
        document.querySelector<HighlightColorPickerElement>('.highlight-color-picker')?._close?.();
        this._captureEditorStates();
        this._captureHighlightsFromViews();
        this._destroyEditors();
        this.workspace.innerHTML = '';
        this._clearTabFileSelectHost();
        this.workspace.dataset.layoutMode = this.layoutMode;
        this._ensureActiveFile();

        if (this._getVisibleFiles().length === 0) {
            const empty = document.createElement('div');
            empty.className = 'editor-empty-state';
            empty.textContent = this._isExerciseMode()
                ? 'All exercise files are hidden. Reveal reference or solution files from the exercise panel.'
                : (this.currentDocument.files || []).length > 0
                  ? 'All files are hidden. Use Visibility to reveal one again.'
                  : this.currentTopicPath
                    ? 'Select an example from the gallery to begin.'
                    : 'Select a topic in the sidebar, then pick an example from its gallery.';
            this.workspace.appendChild(empty);
            this._updatePanelControlStates();
            this._updateFileControls();
            this.pendingNavigationTarget = null;
            return;
        }

        if (this.layoutMode === 'tabs') {
            this._renderTabsLayout();
        } else {
            this._renderPanelsLayout();
        }

        this._updatePanelControlStates();
        this._updateFileControls();
        this._flushPendingNavigation();
    }

    /**
     * One `.editor-panel` per visible file, stacked vertically: header (collapse, badge, path, role pills,
     * highlight buttons, maximize; drag to resize) and an editor. Panel sizes come from `panelState`.
     */
    _renderPanelsLayout(): void {
        const stack = document.createElement('div');
        stack.className = 'editor-panels-stack';

        this._getVisibleFiles().forEach((file, index) => {
            const definition = this._getFileDefinition(file);
            const panel = document.createElement('div');
            panel.className = 'editor-panel';
            panel.dataset.fileId = file.id;
            panel.dataset.language = file.language;
            panel.style.flex = '1 1 0px';
            panel.classList.toggle('is-active', file.id === this.activeFileId);

            const header = document.createElement('div');
            header.className = 'panel-header';
            if (index > 0) {
                header.classList.add('resizable');
            }

            const btnCollapse = document.createElement('button');
            btnCollapse.className = 'btn-icon btn-collapse';
            btnCollapse.title = 'Toggle Panel';
            btnCollapse.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            `;

            const badge = this._createBadge(definition, { file, interactive: true });
            const pathLabel = document.createElement('span');
            pathLabel.className = 'panel-path';
            pathLabel.textContent = file.path;
            pathLabel.title = file.path;

            header.appendChild(btnCollapse);
            header.appendChild(badge);
            header.appendChild(pathLabel);

            if (file.role) {
                header.appendChild(this._createRolePill(file.role));
            }

            if (this._isExerciseFileLocked(file)) {
                header.appendChild(this._createRolePill('locked'));
            }

            const btnHighlightColor = this._buildHighlightColorButton();
            const btnHighlightApply = this._buildHighlightApplyButton();
            header.appendChild(btnHighlightColor);
            header.appendChild(btnHighlightApply);

            const btnMaximize = document.createElement('button');
            btnMaximize.className = 'btn-icon btn-maximize';
            btnMaximize.title = 'Maximize Panel';
            btnMaximize.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
            `;
            header.appendChild(btnMaximize);

            const editorHost = document.createElement('div');
            editorHost.className = 'panel-editor';

            panel.appendChild(header);
            panel.appendChild(editorHost);
            stack.appendChild(panel);

            const { view, vimCleanup } = this._createEditor(editorHost, file);

            btnHighlightColor.addEventListener('click', (event) => {
                event.stopPropagation();
                this._toggleHighlightColorPicker(btnHighlightColor);
            });

            btnHighlightApply.addEventListener('click', (event) => {
                event.stopPropagation();
                this._applyHighlightToCurrentLine(view);
            });

            btnCollapse.addEventListener('click', (event) => {
                event.stopPropagation();
                panel.classList.toggle('collapsed');
                this._syncPanelStateFromDom();
                this._syncActivePanelState();
                this._emitSessionStateChange();
            });

            btnMaximize.addEventListener('click', (event) => {
                event.stopPropagation();
                this._toggleMaximize(panel);
                this._syncPanelStateFromDom();
                this._syncActivePanelState();
                this._emitSessionStateChange();
            });

            header.addEventListener('mousedown', (event) => {
                if (index === 0 || (event.target as Element).closest('button')) return;
                this._startResize(panel.previousElementSibling as HTMLElement | null, panel, event);
            });

            header.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                this._openFileContextMenu(file, event.clientX, event.clientY);
            });

            header.addEventListener('click', (event) => {
                if ((event.target as Element).closest('button')) return;
                this._setActivePanel(file.id, { focusEditor: true, syncModeLabel: true });
            });

            view.dom.addEventListener('focusin', () => {
                this._setActivePanel(file.id, { syncModeLabel: true });
            });

            this.editors.push({
                id: file.id,
                panel,
                view,
                vimCleanup,
            });
        });

        this.workspace.appendChild(stack);
        this._applyPanelSessionState();
        this._syncActivePanelState();
    }

    /** A tab per visible file plus one editor for the active file (and the compact file select of the toolbar). */
    _renderTabsLayout(): void {
        const layout = document.createElement('div');
        layout.className = 'editor-tabs-layout';

        const header = document.createElement('div');
        header.className = 'editor-tabs-header';

        const nav = document.createElement('div');
        nav.className = 'editor-tabs-nav';

        this._getVisibleFiles().forEach((file) => {
            const definition = this._getFileDefinition(file);
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.className = `editor-tab ${file.id === this.activeFileId ? 'active' : ''}`;
            tab.title = file.path;

            tab.appendChild(this._createBadge(definition, { file, interactive: true }));

            const label = document.createElement('span');
            label.className = 'editor-tab-label';
            label.textContent = file.name || file.path;
            tab.appendChild(label);

            tab.addEventListener('click', () => {
                this.activeFileId = file.id;
                this._renderWorkspace();
                this._emitSessionStateChange();
            });

            tab.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                this._openFileContextMenu(file, event.clientX, event.clientY);
            });

            nav.appendChild(tab);
        });

        header.appendChild(nav);
        layout.appendChild(header);
        this._renderTabFileSelectHost();

        // `_renderWorkspace` renders a layout only when at least one file is visible.
        const activeFile = this._getActiveFile()!;
        const meta = document.createElement('div');
        meta.className = 'editor-tab-meta';
        meta.appendChild(
            this._createBadge(this._getFileDefinition(activeFile), { file: activeFile, interactive: true }),
        );

        const pathLabel = document.createElement('span');
        pathLabel.className = 'file-path-label';
        pathLabel.textContent = activeFile.path;
        pathLabel.title = activeFile.path;
        meta.appendChild(pathLabel);

        if (activeFile.role) {
            meta.appendChild(this._createRolePill(activeFile.role));
        }

        if (this._isExerciseFileLocked(activeFile)) {
            meta.appendChild(this._createRolePill('locked'));
        }

        const btnHighlightColor = this._buildHighlightColorButton();
        const btnHighlightApply = this._buildHighlightApplyButton();
        meta.appendChild(btnHighlightColor);
        meta.appendChild(btnHighlightApply);

        layout.appendChild(meta);

        const editorHost = document.createElement('div');
        editorHost.className = 'editor-tab-surface';
        layout.appendChild(editorHost);

        const { view, vimCleanup } = this._createEditor(editorHost, activeFile);

        btnHighlightColor.addEventListener('click', (event) => {
            event.stopPropagation();
            this._toggleHighlightColorPicker(btnHighlightColor);
        });

        btnHighlightApply.addEventListener('click', (event) => {
            event.stopPropagation();
            this._applyHighlightToCurrentLine(view);
        });

        this.editors.push({
            id: activeFile.id,
            panel: editorHost,
            view,
            vimCleanup,
        });

        this.workspace.appendChild(layout);
    }

    _clearTabFileSelectHost(): void {
        if (!this.tabFileSelectHost) return;
        this.tabFileSelectHost.innerHTML = '';
        this.tabFileSelectHost.classList.add('hidden');
    }

    /** The toolbar's file `<select>` of the Tabs layout (hidden in Panels or without files). */
    _renderTabFileSelectHost(): void {
        if (!this.tabFileSelectHost) return;

        this.tabFileSelectHost.innerHTML = '';

        const files = this._getVisibleFiles();
        if (this.layoutMode !== 'tabs' || files.length === 0) {
            this.tabFileSelectHost.classList.add('hidden');
            return;
        }

        const menu = document.createElement('div');
        menu.className = 'editor-file-menu';

        const select = document.createElement('select');
        select.className = 'editor-file-select';
        select.setAttribute('aria-label', 'Select file');

        files.forEach((file) => {
            const option = document.createElement('option');
            option.value = file.id;
            option.textContent = file.path;
            option.selected = file.id === this.activeFileId;
            select.appendChild(option);
        });

        select.addEventListener('change', (event) => {
            this.activeFileId = (event.target as HTMLSelectElement).value;
            this._renderWorkspace();
            this._emitSessionStateChange();
        });

        menu.appendChild(select);
        this.tabFileSelectHost.appendChild(menu);
        this.tabFileSelectHost.classList.remove('hidden');
    }

    /**
     * The active visible file (making `activeFileId` valid first), or the first visible file;
     * `undefined` when no file is visible.
     */
    _getActiveFile(): EditorFile | undefined {
        this._ensureActiveFile();
        const files = this._getVisibleFiles();
        return files.find((file) => file.id === this.activeFileId) || files[0];
    }

    /** A language badge; `interactive` badges open the file-type dialog when the file's type can change. */
    _createBadge(
        definition: FileBadgeDefinition,
        { file = null, interactive = false }: CreateBadgeOptions = {},
    ): HTMLSpanElement {
        const badge = document.createElement('span');
        badge.className = `lang-badge ${definition.badgeClass}`;
        badge.textContent = definition.badgeLabel;

        if (interactive && this._canEditFileType(file)) {
            badge.classList.add('is-clickable');
            badge.setAttribute('role', 'button');
            badge.setAttribute('tabindex', '0');
            badge.title = `Change ${definition.heading || definition.badgeLabel} badge`;

            const activate = (event: Event): void => {
                event.preventDefault();
                event.stopPropagation();
                this._openFileTypeDialog(file);
            };

            badge.addEventListener('click', activate);
            badge.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                activate(event);
            });
        }

        return badge;
    }

    /** A small pill with a file role (`entry`, `style`…) or `locked`. */
    _createRolePill(role: string): HTMLSpanElement {
        const pill = document.createElement('span');
        pill.className = 'file-role-pill';
        pill.textContent = role;
        return pill;
    }

    /** The badge definition of a file's language; a generic badge (upper-cased language) for unknown ones. */
    _getFileDefinition(file: { language?: string | null } | null | undefined): FileBadgeDefinition {
        const definition = getBlockDefinition(file?.language || '');
        if (definition) return definition;

        return {
            badgeClass: 'preview',
            badgeLabel: (file?.language || 'file').toUpperCase(),
        };
    }

    /** Destroys every editor view (and its Vim bindings) and cancels a pending focus restore. */
    _destroyEditors(): void {
        if (this._restoreFocusFrameId) {
            window.cancelAnimationFrame(this._restoreFocusFrameId);
            this._restoreFocusFrameId = 0;
        }
        this.editors.forEach((entry) => {
            entry.vimCleanup?.();
            entry.view?.destroy();
        });
        this.editors = [];
    }

    /**
     * Creates the CodeMirror view of one file inside `container`: language support, Vim (when enabled),
     * diagnostics and highlights, read-only for locked exercise files. Edits update `currentDocument`
     * through the document API. The previous editor state of the file is reused when its text is unchanged.
     */
    _createEditor(container: HTMLElement, file: EditorFile): CreatedEditor {
        const isLocked = this._isExerciseFileLocked(file);
        const langExtensions = this._getLanguageExtensions(file.language);
        const languageKeymap: KeyBinding[] =
            file.language === 'vue' ? [{ key: 'Enter', run: vueScriptEnterCommand }] : [];
        // `vim()` is typed as a single Extension but returns an array, which is spread below.
        const vimExtensions = this.vimEnabled ? (createVimExtension() as Extension[]) : [];
        const updateListener = EditorView.updateListener.of((update) => {
            if (!update.docChanged) {
                const touchedHighlights = update.transactions.some((transaction) =>
                    transaction.effects.some(
                        (effect) => effect.is(addLineHighlightEffect) || effect.is(removeLineHighlightEffect),
                    ),
                );
                if (touchedHighlights) {
                    this._scheduleDirtyCheck();
                }
                return;
            }
            this._setFileContent(file.id, update.state.doc.toString());
            this._updateStatus();
            this._updateButtonStates();
            this._syncAllEditorDiagnostics();
            this._triggerChange();
            this._scheduleDirtyCheck();
        });

        const extensions: Extension[] = [
            EditorState.allowMultipleSelections.of(true),
            editorDiagnosticsField,
            lineHighlightField,
            lineHighlightTheme,
            lineNumbers(),
            drawSelection(),
            highlightActiveLine(),
            highlightActiveLineGutter(),
            history(),
            indentOnInput(),
            bracketMatching(),
            closeBrackets(),
            highlightSelectionMatches(),
            ...vimExtensions,
            keymap.of([
                ...languageKeymap,
                ...defaultKeymap,
                ...historyKeymap,
                ...closeBracketsKeymap,
                ...completionKeymap,
                ...searchKeymap,
                indentWithTab,
            ]),
            ...langExtensions,
            oneDark,
            autocompletion(),
            ...(this.columnGuideEnabled ? [createColumnGuideExtension()] : []),
            EditorState.readOnly.of(isLocked),
            updateListener,
            EditorView.theme({
                '&': { height: '100%' },
                '&.cm-editor': isLocked ? { opacity: 0.78 } : {},
                '.cm-scroller': { overflow: 'auto' },
            }),
        ];

        // Reuse the previous EditorState (cursor, selection, undo history) and
        // scroll position when the same file is re-rendered (tab switch, layout
        // toggle, metadata change...). Extensions are always rebuilt fresh.
        const cachedState = this._getCachedEditorState(file);
        let state: EditorState | null = null;
        if (cachedState?.json) {
            try {
                state = EditorState.fromJSON(cachedState.json, { extensions }, { history: historyField });
            } catch {
                state = null;
            }
        }
        if (!state) {
            state = EditorState.create({
                doc: file.content || '',
                extensions,
            });
        }

        const viewConfig: EditorViewConfig = { state, parent: container };
        if (state && cachedState?.scroll) {
            viewConfig.scrollTo = cachedState.scroll;
        }
        const view = new EditorView(viewConfig);
        this._applyDiagnosticsToView(view, file);
        this._applyHighlightsToView(view, file);

        const vimCleanup = this.vimEnabled
            ? bindVimView(view, {
                  isPanelsLayout: () => this.layoutMode === 'panels',
                  isShaderDocument: () => this._isShaderDocument(),
                  getShortcutConfig: () => this.vimShortcutConfig,
                  onModeChange: (modeLabel) => {
                      view.dom.dataset.vimMode = modeLabel;
                      if (this.layoutMode === 'panels' && file.id !== this.activeFileId) {
                          return;
                      }
                      this.vimModeLabel = modeLabel;
                      this._updateVimUi();
                  },
                  onPreviousTab: () => {
                      this._selectAdjacentTab(-1);
                  },
                  onNextTab: () => {
                      this._selectAdjacentTab(1);
                  },
                  onOpenFilePicker: () => {
                      this._openQuickOpenDialog();
                  },
                  onMovePanelFocus: (direction) => {
                      return this._handleShiftPanelNavigation(direction);
                  },
                  onToggleSidebar: () => {
                      this.onToggleSidebar?.();
                  },
                  onCenterWorkspace: () => {
                      this.onCenterWorkspace?.();
                  },
                  onToggleActivePanelCollapse: () => {
                      return this._toggleActivePanelCollapsed();
                  },
                  onToggleActivePanelMaximize: () => {
                      return this._toggleActivePanelMaximize();
                  },
                  onAutoFitPanels: () => {
                      return this._autoFitPanelsFromVim();
                  },
                  onNormalizePanels: () => {
                      return this._normalizePanelsFromVim();
                  },
                  onToggleAutoRender: () => {
                      this.onTogglePreviewAutoRender?.();
                  },
                  onToggleConsole: () => {
                      return this.onToggleConsole?.();
                  },
                  onToggleShaderPause: () => {
                      if (!this._isShaderDocument()) return;
                      this.onToggleShaderPause?.();
                  },
                  onOpenShaderControls: () => {
                      if (!this._isShaderDocument()) return;
                      this.onOpenShaderControls?.();
                  },
                  onOpenShaderUniforms: () => {
                      if (!this._isShaderDocument()) return;
                      (this.onOpenShaderUniforms || this.openShaderUniformDialog).call(this, null);
                  },
                  onOpenShaderTextures: () => {
                      if (!this._isShaderDocument()) return;
                      (this.onOpenShaderTextures || this.openShaderTextureDialog).call(this);
                  },
                  onToggleEditorLayout: () => {
                      this._toggleLayoutMode({ preserveFocus: true });
                  },
                  onOpenShaderPanel: () => {
                      if (!this._isShaderDocument()) return;
                      this.onOpenShaderPanel?.();
                  },
                  onOpenShortcutHelp: () => {
                      this.openShortcutHelpDialog();
                  },
                  onResetShaderRuntime: () => {
                      if (!this._isShaderDocument()) return;
                      this.onResetShaderRuntime?.();
                  },
                  onTogglePreviewHeader: () => {
                      this.onTogglePreviewHeader?.();
                  },
                  onQuickSave: () => {
                      this._handleVimWrite();
                      return true;
                  },
                  onWrite: () => {
                      this._handleVimWrite();
                  },
              })
            : null;

        view.dom.dataset.vim = this.vimEnabled ? 'on' : 'off';
        view.dom.dataset.vimMode = this.vimModeLabel || '';
        view.dom.addEventListener('focusin', () => {
            this._syncVimModeFromView(view);
        });

        return {
            view,
            vimCleanup,
        };
    }

    /** CodeMirror language support (and learning completions) for a file language; none for Pug and unknown ones. */
    _getLanguageExtensions(type: string): Extension[] {
        switch (type) {
            case 'vertex':
            case 'fragment':
                return glslLanguage();
            case 'jsx':
                return [javascript({ jsx: true })];
            case 'tsx':
                return [javascript({ jsx: true, typescript: true })];
            case 'html':
            case 'html-full':
            case 'svg':
                return [html(), htmlLearningSupport()];
            case 'vue':
                return [
                    html({
                        nestedLanguages: [
                            {
                                tag: 'style',
                                attrs: (attrs) => /^(scss|sass|less)$/.test(attrs.lang),
                                parser: cssLanguage.parser,
                            },
                        ],
                    }),
                    htmlLearningSupport(),
                ];
            case 'css':
            case 'scss':
            case 'sass':
                return [css(), cssLearningSupport()];
            case 'javascript':
                return [javascript(), javascriptLearningSupport()];
            case 'typescript':
                return [javascript({ typescript: true }), javascriptLearningSupport()];
            case 'json':
                // `json` is not an option of javascript() and is ignored: JSON gets plain JavaScript support.
                return [javascript({ json: true } as Parameters<typeof javascript>[0])];
            case 'pug':
            default:
                return [];
        }
    }

    /** Writes an editor's text into a new `currentDocument` (no re-render). */
    _setFileContent(fileId: string, content: string): void {
        this.currentDocument = updateDocumentFileContent(this.currentDocument, fileId, content);
    }

    /** The `.editor-panel` elements of the Panels layout, in order (none in Tabs). */
    _getPanels(): HTMLElement[] {
        return Array.from(this.workspace.querySelectorAll<HTMLElement>('.editor-panel'));
    }

    _getEditorEntry(fileId: string | null | undefined): EditorEntry | null {
        return this.editors.find((entry) => entry.id === fileId) || null;
    }

    /** Remembers which file to focus when the dialog being opened closes. */
    _rememberEditorFocusTarget(): void {
        this._dialogFocusTargetFileId =
            this.pendingNavigationTarget?.file?.id ||
            this.activeFileId ||
            (this.layoutMode === 'panels' ? this._getPreferredActivePanelId() : null) ||
            this._getVisibleFiles()[0]?.id ||
            null;
    }

    /** Puts the focus back into the editor on the next frame (after a dialog closed). */
    _scheduleEditorFocusRestore(): void {
        if (this._restoreFocusFrameId) {
            window.cancelAnimationFrame(this._restoreFocusFrameId);
        }

        const fallbackFileId = this._dialogFocusTargetFileId;
        this._restoreFocusFrameId = window.requestAnimationFrame(() => {
            this._restoreFocusFrameId = 0;
            this._restoreEditorFocus(fallbackFileId);
        });
    }

    /**
     * Focuses the editor of the pending navigation target, else of the active file, else of `fallbackFileId`
     * or the first visible file. Returns whether an editor was focused.
     */
    _restoreEditorFocus(fallbackFileId: string | null = null): boolean {
        if (this.pendingNavigationTarget) {
            this._flushPendingNavigation();
            this._dialogFocusTargetFileId = null;
            return true;
        }

        const targetFileId = this.activeFileId || fallbackFileId || this._getVisibleFiles()[0]?.id || null;
        this._dialogFocusTargetFileId = null;
        if (!targetFileId) return false;

        const entry = this._getEditorEntry(targetFileId) || this.editors[0] || null;
        if (!entry?.view) return false;

        if (this.layoutMode === 'panels') {
            this._setActivePanel(entry.id, { focusEditor: true, syncModeLabel: true });
            return true;
        }

        entry.view.focus();
        if (this.vimEnabled) {
            this._syncVimModeFromView(entry.view);
        }
        return true;
    }

    /** Focuses the active editor on the next frame (after the app switched views or loaded a document). */
    focusActiveEditor(): void {
        this._scheduleEditorFocusRestore();
    }

    /** The file id of the active panel if it is expanded, else of the first expanded panel, else of the first panel. */
    _getPreferredActivePanelId(): string | null {
        const panels = this._getPanels();
        if (panels.length === 0) return null;

        const activePanel = panels.find((panel) => panel.dataset.fileId === this.activeFileId);
        if (activePanel && !activePanel.classList.contains('collapsed')) {
            return activePanel.dataset.fileId || null;
        }

        const firstVisiblePanel = panels.find((panel) => !panel.classList.contains('collapsed'));
        if (firstVisiblePanel) {
            return firstVisiblePanel.dataset.fileId || null;
        }

        return panels[0]?.dataset.fileId || null;
    }

    _getPanelByFileId(fileId: string | null | undefined): HTMLElement | null {
        if (!fileId) return null;
        return this._getPanels().find((panel) => panel.dataset.fileId === fileId) || null;
    }

    /** Panels only: moves `activeFileId` off collapsed panels and marks the active panel. */
    _syncActivePanelState(): void {
        if (this.layoutMode !== 'panels') return;

        const nextActiveFileId = this._getPreferredActivePanelId();
        if (!nextActiveFileId) return;

        this.activeFileId = nextActiveFileId;
        this._getPanels().forEach((panel) => {
            const isActive = panel.dataset.fileId === this.activeFileId;
            panel.classList.toggle('is-active', isActive);
            panel.setAttribute('aria-selected', String(isActive));
        });
    }

    /** Panels only: makes a file's panel the active one (notifying the session when it changed). */
    _setActivePanel(
        fileId: string | null | undefined,
        { focusEditor = false, syncModeLabel = false }: SetActivePanelOptions = {},
    ): void {
        if (this.layoutMode !== 'panels' || !fileId) return;

        const changed = this.activeFileId !== fileId;
        this.activeFileId = fileId;
        this._syncActivePanelState();

        const entry = this._getEditorEntry(fileId);
        if (!entry) {
            if (changed) {
                this._emitSessionStateChange();
            }
            return;
        }

        if (syncModeLabel && this.vimEnabled) {
            this._syncVimModeFromView(entry.view);
        }

        if (focusEditor) {
            entry.view?.focus();
        }

        if (changed) {
            this._emitSessionStateChange();
        }
    }

    /** Panels only: focuses the nearest expanded panel in a direction (Vim). Returns whether the focus moved. */
    _movePanelFocus(direction: PanelDirection | '' = ''): boolean {
        if (this.layoutMode !== 'panels') return false;

        const panels = this._getPanels().filter((panel) => !panel.classList.contains('collapsed'));
        if (panels.length <= 1) return false;

        const currentPanel = panels.find((panel) => panel.dataset.fileId === this.activeFileId) || panels[0];
        if (!currentPanel) return false;

        const currentIndex = Math.max(0, panels.indexOf(currentPanel));
        const panelRects = panels.map((panel) => {
            const rect = panel.getBoundingClientRect();
            return {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
            };
        });
        const targetIndex = findDirectionalPanelTargetIndex(panelRects, currentIndex, direction);
        const bestPanel = targetIndex >= 0 ? panels[targetIndex] || null : null;

        const nextFileId = bestPanel?.dataset?.fileId || '';
        if (!nextFileId) return false;

        this._setActivePanel(nextFileId, { focusEditor: true, syncModeLabel: true });
        // A file id was read from bestPanel, so it is set.
        bestPanel!.scrollIntoView({ block: 'nearest' });
        return true;
    }

    /**
     * Panels with one maximized panel: maximizes the previous (`up`/`left`) or next (`down`/`right`)
     * panel instead, wrapping around. Returns whether it moved.
     */
    _moveMaximizedPanelFocus(direction: PanelDirection | '' = ''): boolean {
        if (this.layoutMode !== 'panels') return false;

        const panels = this._getPanels();
        if (panels.length <= 1) return false;

        const currentIndex = Math.max(
            0,
            panels.findIndex((panel) => panel.dataset.fileId === this.activeFileId),
        );
        const isPreviousDirection = direction === 'up' || direction === 'left';
        const isNextDirection = direction === 'down' || direction === 'right';

        if (!isPreviousDirection && !isNextDirection) {
            return false;
        }

        const nextIndex = getWrappedPanelIndex(panels.length, currentIndex, direction);
        const nextPanel = panels[nextIndex] || null;
        const nextFileId = nextPanel?.dataset?.fileId || '';

        if (!nextFileId || nextFileId === this.activeFileId) {
            return false;
        }

        this._setExclusiveMaximizedPanel(nextPanel);
        this._syncPanelStateFromDom();
        this._setActivePanel(nextFileId, { focusEditor: true, syncModeLabel: true });
        // A file id was read from nextPanel, so it is set.
        nextPanel!.scrollIntoView({ block: 'nearest' });
        this._emitSessionStateChange();
        return true;
    }

    /** The Vim panel-navigation keys: moves the maximized panel when one is maximized, the focus otherwise. */
    _handleShiftPanelNavigation(direction: PanelDirection | '' = ''): boolean {
        if (this.layoutMode !== 'panels') return false;

        if (this.panelState.maximizedFileId) {
            return this._moveMaximizedPanelFocus(direction);
        }

        return this._movePanelFocus(direction);
    }

    /** Vim: collapses or expands the active panel (the last expanded panel cannot collapse). */
    _toggleActivePanelCollapsed(): boolean {
        if (this.layoutMode !== 'panels') return false;

        const activePanel = this._getPanelByFileId(this.activeFileId) || this._getPanels()[0] || null;
        if (!activePanel) return false;

        const isCollapsed = activePanel.classList.contains('collapsed');
        const visiblePanels = this._getPanels().filter((panel) => !panel.classList.contains('collapsed'));

        if (!isCollapsed && visiblePanels.length <= 1) {
            return false;
        }

        activePanel.classList.toggle('collapsed', !isCollapsed);
        this._syncPanelStateFromDom();

        if (isCollapsed) {
            this._setActivePanel(activePanel.dataset.fileId, { focusEditor: true, syncModeLabel: true });
        } else {
            const nextActiveId = this._getPreferredActivePanelId();
            if (nextActiveId) {
                this._setActivePanel(nextActiveId, { focusEditor: true, syncModeLabel: true });
            }
        }

        this._emitSessionStateChange();
        return true;
    }

    /** Vim: maximizes the active panel, or restores all panels when it already is. */
    _toggleActivePanelMaximize(): boolean {
        if (this.layoutMode !== 'panels') return false;

        const activePanel = this._getPanelByFileId(this.activeFileId) || this._getPanels()[0] || null;
        if (!activePanel) return false;

        this._toggleMaximize(activePanel);
        this._syncPanelStateFromDom();
        this._setActivePanel(activePanel.dataset.fileId, { focusEditor: true, syncModeLabel: true });
        this._emitSessionStateChange();
        return true;
    }

    _autoFitPanelsFromVim(): boolean {
        if (this.layoutMode !== 'panels') return false;
        this._handleAutoFit();
        this._restoreEditorFocus(this.activeFileId);
        return true;
    }

    /** Vim: expands every panel to equal sizes. */
    _normalizePanelsFromVim(): boolean {
        if (this.layoutMode !== 'panels') return false;

        const panels = this._getPanels();
        if (panels.length === 0) return false;

        panels.forEach((panel) => {
            panel.classList.remove('collapsed');
            panel.style.flex = '1 1 0px';
            panel.style.height = '';
        });

        this._syncPanelStateFromDom();
        this._restoreEditorFocus(this.activeFileId);
        this._emitSessionStateChange();
        return true;
    }

    /** Shows the Vim mode of `view` (its `data-vim-mode`) in the toolbar. */
    _syncVimModeFromView(view: EditorView | null | undefined): void {
        if (!this.vimEnabled || !view) return;
        // `data-vim-mode` is only ever set from a VimModeLabel (or '').
        this.vimModeLabel =
            (view.dom?.dataset?.vimMode as VimModeLabel | '' | undefined) || this.vimModeLabel || 'NORMAL';
        this._updateVimUi();
    }

    /** Applies `panelState` to freshly rendered panels: the maximized panel, or the collapsed ones. */
    _applyPanelSessionState(): void {
        const panels = this._getPanels();
        if (panels.length === 0) return;

        panels.forEach((panel) => {
            panel.classList.remove('collapsed');
            panel.style.flex = '1 1 0px';
            panel.style.height = '';
        });

        const maximizedPanel = this.panelState.maximizedFileId
            ? panels.find((panel) => panel.dataset.fileId === this.panelState.maximizedFileId)
            : null;

        if (maximizedPanel) {
            this._toggleMaximize(maximizedPanel);
            return;
        }

        this.panelState.collapsedFileIds.forEach((fileId) => {
            const panel = panels.find((entry) => entry.dataset.fileId === fileId);
            if (!panel) return;
            panel.classList.add('collapsed');
            panel.style.flex = '';
        });

        this._syncActivePanelState();
    }

    /** Reads `panelState` back from the DOM after the user collapsed, maximized or resized panels. */
    _syncPanelStateFromDom(): void {
        const panels = this._getPanels();
        if (panels.length === 0) {
            this.panelState = this._sanitizePanelState();
            return;
        }

        const collapsedFileIds = panels
            .filter((panel) => panel.classList.contains('collapsed'))
            .map((panel) => panel.dataset.fileId)
            .filter(Boolean);
        const visiblePanels = panels.filter((panel) => !panel.classList.contains('collapsed'));
        const maximizedFileId =
            panels.length > 1 && visiblePanels.length === 1 && collapsedFileIds.length === panels.length - 1
                ? visiblePanels[0].dataset.fileId
                : null;

        this.panelState = this._sanitizePanelState({ collapsedFileIds, maximizedFileId });
        this._syncActivePanelState();
    }

    /** Collapses every other panel, or expands them all again when they already are collapsed. */
    _toggleMaximize(activePanel: HTMLElement): void {
        const panels = this._getPanels();
        const others = panels.filter((panel) => panel !== activePanel);
        const allOthersCollapsed = others.every((panel) => panel.classList.contains('collapsed'));

        if (allOthersCollapsed) {
            panels.forEach((panel) => {
                panel.classList.remove('collapsed');
                panel.style.flex = '1 1 0px';
                panel.style.height = '';
            });
            return;
        }

        this._setExclusiveMaximizedPanel(activePanel);
    }

    /** Expands `activePanel` and collapses every other panel. */
    _setExclusiveMaximizedPanel(activePanel: HTMLElement | null | undefined): void {
        if (!activePanel) return;

        const panels = this._getPanels();
        panels.forEach((panel) => {
            const isActive = panel === activePanel;
            panel.classList.toggle('collapsed', !isActive);
            panel.style.flex = isActive ? '1 1 0px' : '';
            panel.style.height = '';
        });
    }

    /**
     * Starts dragging the boundary between two adjacent panels (mousedown on the lower panel's header).
     * Sizes become flex-grow ratios; collapsed panels expand only once the pointer moved 3px.
     */
    _startResize(prevPanel: HTMLElement | null, currentPanel: HTMLElement | null, event: MouseEvent): void {
        if (!prevPanel || !currentPanel) return;
        if (typeof event.button === 'number' && event.button !== 0) return;

        event.preventDefault();

        const startY = event.clientY;
        const minHeight = 32;
        const dragThreshold = 3;
        let dragging = false;
        let containerHeight = 0;
        let startPrevHeight = 0;
        let startCurrentHeight = 0;

        // Collapsed panels are only expanded once a real drag starts, so a
        // plain click on a header (to focus that panel) keeps maximize/collapse state.
        const beginDrag = (): void => {
            dragging = true;
            this._getPanels().forEach((panel) => panel.classList.remove('collapsed'));
            containerHeight = this.workspace.getBoundingClientRect().height || 1;
            startPrevHeight = prevPanel.getBoundingClientRect().height;
            startCurrentHeight = currentPanel.getBoundingClientRect().height;
            this._setPanelDragShieldVisible(true);
        };

        const onMouseMove = (moveEvent: MouseEvent): void => {
            const delta = moveEvent.clientY - startY;

            if (!dragging) {
                if (Math.abs(delta) < dragThreshold) return;
                beginDrag();
            }

            let newPrevHeight = startPrevHeight + delta;
            let newCurrentHeight = startCurrentHeight - delta;

            if (newPrevHeight < minHeight) {
                const correction = minHeight - newPrevHeight;
                newPrevHeight = minHeight;
                newCurrentHeight -= correction;
            }

            if (newCurrentHeight < minHeight) {
                const correction = minHeight - newCurrentHeight;
                newCurrentHeight = minHeight;
                newPrevHeight -= correction;
            }

            prevPanel.style.flex = `${newPrevHeight / containerHeight} 1 0px`;
            currentPanel.style.flex = `${newCurrentHeight / containerHeight} 1 0px`;
        };

        const onMouseUp = (): void => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('blur', onMouseUp);
            this._setPanelDragShieldVisible(false);

            if (!dragging) return;
            this._syncPanelStateFromDom();
            this._emitSessionStateChange();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        window.addEventListener('blur', onMouseUp);
    }

    _setPanelDragShieldVisible(visible: boolean): void {
        document.body.classList.toggle('is-resizing-editor-panels', Boolean(visible));
        if (!this.dragShield) return;

        // The shield covers the preview iframe so mouseup is never lost inside it.
        this.dragShield.classList.toggle('hidden', !visible);
        this.dragShield.classList.toggle('is-ns-resize', Boolean(visible));
        if (!visible) {
            this.dragShield.classList.remove('is-ew-resize');
        }
    }

    /**
     * Sizes the panels to their line counts (`fontSize * 1.6` per line); when they do not all fit, each
     * keeps 32px and the rest of the height goes to the panels in order.
     */
    _handleAutoFit(): void {
        if (this.layoutMode !== 'panels') return;

        const panels = this._getPanels();
        if (panels.length === 0 || this.editors.length === 0) return;

        panels.forEach((panel) => {
            panel.classList.remove('collapsed');
            panel.style.height = '';
        });

        const lineHeight = this.fontSize * 1.6;
        const headerHeight = 32;
        const scrollbarPadding = 20;
        const minPanelHeight = 32;
        const availableHeight = this.workspace.getBoundingClientRect().height;

        const neededHeights = this.editors.map((entry) => {
            const lines = entry.view.state.doc.lines;
            return lines * lineHeight + headerHeight + scrollbarPadding;
        });

        const totalNeeded = neededHeights.reduce((sum, value) => sum + value, 0);

        if (totalNeeded <= availableHeight) {
            panels.forEach((panel, index) => {
                panel.style.flex = `${neededHeights[index]} 1 0px`;
            });
            this._syncPanelStateFromDom();
            this._emitSessionStateChange();
            return;
        }

        let remainingSpace = availableHeight - minPanelHeight * panels.length;
        const allocations = panels.map(() => minPanelHeight);

        neededHeights.forEach((height, index) => {
            if (remainingSpace <= 0) return;
            const extra = Math.max(0, height - minPanelHeight);
            const taken = Math.min(extra, remainingSpace);
            allocations[index] += taken;
            remainingSpace -= taken;
        });

        if (remainingSpace > 0) {
            allocations[allocations.length - 1] += remainingSpace;
        }

        panels.forEach((panel, index) => {
            panel.style.flex = `${allocations[index]} 1 0px`;
        });

        this._syncPanelStateFromDom();
        this._emitSessionStateChange();
    }

    /**
     * Enables the document buttons (save, modify, remove, favorite, pending, rename) for the current
     * document: writing is blocked while it has blocking diagnostics; theory only saves in place.
     */
    _updateButtonStates(): void {
        const hasFile = Boolean(this.currentFilename);
        const hasTopic = Boolean(this.currentTopicPath);
        const hasContent = (this.currentDocument.files || []).length > 0;
        const isSafeToWrite = !hasBlockingDiagnostics(this.currentDocument);
        const isTheory = this._isTheoryDocumentTarget();
        const canRenameCurrentFile = hasFile && !isTheory;

        this.btnSave.disabled = !hasTopic || !hasContent || !isSafeToWrite;
        this.btnModify.disabled = isTheory ? !hasTopic || !hasContent || !isSafeToWrite : !hasFile || !isSafeToWrite;
        this.btnRemove.disabled = !hasFile || isTheory;
        if (this.btnToggleFavoriteExample) {
            this.btnToggleFavoriteExample.disabled = !hasFile || isTheory;
            this.btnToggleFavoriteExample.classList.toggle('is-active', this.currentExampleFavorite);
            this.btnToggleFavoriteExample.setAttribute('aria-pressed', String(this.currentExampleFavorite));
            this.btnToggleFavoriteExample.title = this.currentExampleFavorite
                ? 'Remove from favorites'
                : 'Add to favorites';
        }
        if (this.btnTogglePendingExample) {
            this.btnTogglePendingExample.disabled = !hasFile || isTheory;
            this.btnTogglePendingExample.classList.toggle('is-active', this.currentExamplePending);
            this.btnTogglePendingExample.setAttribute('aria-pressed', String(this.currentExamplePending));
            this.btnTogglePendingExample.title = this.currentExamplePending ? 'Remove from pending' : 'Add to pending';
        }
        if (this.previewFilenameDisplay) {
            this.previewFilenameDisplay.classList.toggle('is-actionable', canRenameCurrentFile);
            this.previewFilenameDisplay.setAttribute('role', canRenameCurrentFile ? 'button' : 'status');
            this.previewFilenameDisplay.setAttribute('tabindex', canRenameCurrentFile ? '0' : '-1');
            this.previewFilenameDisplay.setAttribute('aria-disabled', String(!canRenameCurrentFile));
        }
        this._updatePanelControlStates();
        this._updateFileControls();
    }

    /** The file name above the preview (clickable to rename an example) and the dirty markers. */
    _updateFilenameDisplay(): void {
        if (this.currentFilename) {
            if (this.previewFilenameDisplay) {
                this.previewFilenameDisplay.textContent = this.currentFilename;
                this.previewFilenameDisplay.title = this._isTheoryDocumentTarget()
                    ? this.currentFilename
                    : `Rename ${this.currentFilename}`;
            }
            this._updateDirtyIndicator();
            return;
        }

        if (this.previewFilenameDisplay) {
            this.previewFilenameDisplay.textContent = 'Preview';
            this.previewFilenameDisplay.title = 'Preview';
        }
        this._updateDirtyIndicator();
    }

    /** The status panel under the editor: a count, then the structural, compile and runtime diagnostics. */
    _updateStatus(): void {
        if (!this.statusDisplay) return;

        const structuralDiagnostics = this.currentDocument.diagnostics || [];
        const compileDiagnostics = this.compileDiagnostics || [];
        const runtimeDiagnostics = this.runtimeDiagnostics || [];
        const diagnosticsCount = structuralDiagnostics.length + compileDiagnostics.length + runtimeDiagnostics.length;

        if (diagnosticsCount === 0) {
            this.statusDisplay.innerHTML = '';
            this.statusDisplay.className = 'editor-status hidden';
            return;
        }

        const hasErrors = [...structuralDiagnostics, ...compileDiagnostics, ...runtimeDiagnostics].some(
            (diagnostic) => diagnostic.level === 'error',
        );

        this.statusDisplay.innerHTML = '';
        this.statusDisplay.className = `editor-status ${hasErrors ? 'error' : 'warning'}`;

        const summary = document.createElement('div');
        summary.className = 'editor-status-summary';
        summary.textContent = `${diagnosticsCount} issue${diagnosticsCount === 1 ? '' : 's'} found`;
        this.statusDisplay.appendChild(summary);

        if (structuralDiagnostics.length > 0) {
            this.statusDisplay.appendChild(
                this._buildDiagnosticSection('Structure', structuralDiagnostics, 'structural'),
            );
        }

        if (compileDiagnostics.length > 0) {
            this.statusDisplay.appendChild(this._buildDiagnosticSection('Compile', compileDiagnostics, 'compile'));
        }

        if (runtimeDiagnostics.length > 0) {
            this.statusDisplay.appendChild(this._buildDiagnosticSection('Runtime', runtimeDiagnostics, 'runtime'));
        }
    }

    /** Sends a copy of the current document to `onCodeChange`. */
    _triggerChange(): void {
        if (this.onCodeChange) {
            this.onCodeChange(cloneExampleDocument(this.currentDocument));
        }
    }

    /** Shows a toast (also used by src/main.ts for favorite/pending messages). */
    _showToast(message: string, type: ToastType = 'success'): void {
        showToast(message, type);
    }
}

// Declaration merging: the methods the mixins below add to the prototype become members of `Editor`.
export interface Editor
    extends
        DiagnosticsMixin,
        LineHighlightsMixin,
        SessionManagerMixin,
        ExercisePanelMixin,
        TheoryEditorMixin,
        ShaderDialogsMixin,
        MetadataDialogsMixin,
        FileOperationsMixin {}

Object.assign(
    Editor.prototype,
    diagnosticsMixin,
    lineHighlightsMixin,
    sessionManagerMixin,
    exercisePanelMixin,
    theoryEditorMixin,
    shaderDialogsMixin,
    metadataDialogsMixin,
    fileOperationsMixin,
);

export { editorDiagnosticsField, setEditorDiagnosticsEffect, EMPTY_EDITOR_DIAGNOSTICS };

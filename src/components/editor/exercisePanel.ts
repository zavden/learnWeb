// Exercise mode of the editor, and which files the workspace shows.
//
// An example with `exercise: true` in its frontmatter is an exercise (`getExerciseConfig()` parses the
// `exercise_*` keys): reference and solution files stay hidden until the learner reveals them, locked
// files cannot be edited or change type, hints are revealed one at a time, and the learner's attempt can be
// compared with a solution, either hidden solution files of the same example or a separate solution
// example of the topic (`exercise_solution_example`, fetched from the server).
//
// `exercisePanelMixin` is an Editor mixin: src/components/Editor.ts copies its methods onto
// `Editor.prototype`, so `this` is the Editor and the state is declared there: `exerciseConfig` (derived
// from the document by `_syncExerciseConfig`, which `_applyDocument` in ./fileOperations.ts calls),
// `exerciseState` (what the learner revealed or toggled; part of `getSessionState()` in
// ./sessionManager.ts) and the `exerciseComparison…` fields (the loaded solution example). The editor
// keeps no view of its own here: `getExercisePresentation()` describes what to show, `onExerciseStateChange`
// hands it to src/main.ts, which renders it with src/components/ExercisePanel.ts and wires that panel's
// buttons back to the public `reveal…` / `toggle…` / `select…` methods below.
//
// The file-visibility helpers also live here because `_getVisibleFiles()` (what tabs, panels and quick
// open list) combines both reasons a file is hidden: exercise concealment and the author's
// `editor_hidden_files` metadata.
//
// Before editing: `_syncExerciseConfig` keeps the learner's state only while the exercise metadata stays
// the same, and solution loads are versioned with `exerciseComparisonRequestId` so a late response for an
// older request is dropped.

import { resolveExerciseComparison } from '../../utils/exerciseComparison.ts';
import { buildQuickOpenMatches } from '../../utils/fileQuickOpen.ts';
import {
    createEmptyExampleDocument,
    getDocumentFileVisibilityEntries,
    getExerciseConfig,
    parseExampleDocument,
} from '../../utils/markdown.ts';
import { fetchExample } from '../../utils/api.ts';
import type { ExerciseConfig, FileVisibilityEntry } from '../../types/document.ts';
import type { ExercisePresentation } from '../ExercisePanel.ts';
import type { Editor, EditorFile, ExerciseState } from '../Editor.ts';

/**
 * An exercise state as `_sanitizeExerciseState()` accepts it: any of the `ExerciseState` fields, each of
 * any type, because it may come from session data stored in localStorage.
 */
export type ExerciseStateInput = { readonly [K in keyof ExerciseState]?: unknown };

/** Editor mixin: exercise mode, file visibility and quick-open matching (see the header). */
export const exercisePanelMixin = {
    /** The config of a document that is not an exercise: disabled, empty lists, default title. */
    _createEmptyExerciseConfig(): ExerciseConfig {
        return {
            comparePairs: [],
            enabled: false,
            hiddenFiles: [],
            hints: [],
            instructions: [],
            lockedFiles: [],
            referenceFiles: [],
            solutionExample: '',
            solutionFiles: [],
            title: 'Exercise',
        };
    },

    /**
     * A complete, well-typed exercise state from untrusted input: flags become booleans, `revealedHints`
     * a non-negative number (numeric text is parsed), anything else its default. No argument gives the
     * initial state. The hint count is not capped here (`_syncExerciseConfig` caps it).
     */
    _sanitizeExerciseState(exerciseState: ExerciseStateInput = {}): ExerciseState {
        // Number.isFinite is true only for numbers; parseInt stringifies anything else (`'2'` → 2).
        const revealedHints = Number.isFinite(exerciseState.revealedHints)
            ? (exerciseState.revealedHints as number)
            : Number.parseInt(exerciseState.revealedHints as string, 10);

        return {
            comparisonVisible: Boolean(exerciseState.comparisonVisible),
            notesCollapsed: Boolean(exerciseState.notesCollapsed),
            referencesRevealed: Boolean(exerciseState.referencesRevealed),
            revealedHints: Number.isFinite(revealedHints) && revealedHints > 0 ? revealedHints : 0,
            selectedComparePairId:
                typeof exerciseState.selectedComparePairId === 'string' ? exerciseState.selectedComparePairId : '',
            solutionsRevealed: Boolean(exerciseState.solutionsRevealed),
        };
    },

    /** Whether the open document is an exercise (`exercise: true`). */
    _isExerciseMode(): boolean {
        return Boolean(this.exerciseConfig?.enabled);
    },

    /**
     * Re-reads `exerciseConfig` from the document and reconciles `exerciseState` with it. While the
     * exercise metadata is unchanged the learner's state is kept (clamped to what exists); when it changed
     * the state is reset, and a changed or removed solution example drops the loaded solution.
     */
    _syncExerciseConfig(): void {
        const previousConfig = this.exerciseConfig || this._createEmptyExerciseConfig();
        const nextConfig = getExerciseConfig(this.currentDocument);
        const previousSignature = JSON.stringify({
            comparePairs: previousConfig.comparePairs,
            hiddenFiles: previousConfig.hiddenFiles,
            hints: previousConfig.hints,
            lockedFiles: previousConfig.lockedFiles,
            referenceFiles: previousConfig.referenceFiles,
            solutionExample: previousConfig.solutionExample,
            solutionFiles: previousConfig.solutionFiles,
            title: previousConfig.title,
        });
        const nextSignature = JSON.stringify({
            comparePairs: nextConfig.comparePairs,
            hiddenFiles: nextConfig.hiddenFiles,
            hints: nextConfig.hints,
            lockedFiles: nextConfig.lockedFiles,
            referenceFiles: nextConfig.referenceFiles,
            solutionExample: nextConfig.solutionExample,
            solutionFiles: nextConfig.solutionFiles,
            title: nextConfig.title,
        });

        this.exerciseConfig = nextConfig.enabled ? nextConfig : this._createEmptyExerciseConfig();

        if (!this.exerciseConfig.enabled) {
            this.exerciseState = this._sanitizeExerciseState();
            this._resetExerciseComparisonSource();
            return;
        }

        const sanitizedState = this._sanitizeExerciseState(this.exerciseState);
        const nextState = {
            comparisonVisible: sanitizedState.comparisonVisible,
            notesCollapsed: sanitizedState.notesCollapsed,
            referencesRevealed: sanitizedState.referencesRevealed && this.exerciseConfig.referenceFiles.length > 0,
            revealedHints: Math.min(sanitizedState.revealedHints, this.exerciseConfig.hints.length),
            selectedComparePairId: sanitizedState.selectedComparePairId,
            solutionsRevealed: sanitizedState.solutionsRevealed && this.exerciseConfig.solutionFiles.length > 0,
        };

        this.exerciseState =
            previousSignature === nextSignature
                ? nextState
                : {
                      comparisonVisible: false,
                      referencesRevealed: false,
                      revealedHints: 0,
                      selectedComparePairId: '',
                      solutionsRevealed: false,
                  };

        if (
            previousConfig.solutionExample !== this.exerciseConfig.solutionExample ||
            !this.exerciseConfig.solutionExample
        ) {
            this._resetExerciseComparisonSource();
        }
    },

    /** Forgets the loaded solution example and invalidates a load in flight. */
    _resetExerciseComparisonSource(): void {
        this.exerciseComparisonSource = null;
        this.exerciseComparisonSourceError = '';
        this.exerciseComparisonSourceStatus = 'idle';
        this.exerciseComparisonRequestId += 1;
    },

    /** False for a reference or solution file that the learner has not revealed yet; always true outside exercises. */
    _isExerciseFileVisible(file: EditorFile | null | undefined): boolean {
        if (!this._isExerciseMode()) return true;
        if (!file?.path) return true;

        if (!this.exerciseState.referencesRevealed && this.exerciseConfig.referenceFiles.includes(file.path)) {
            return false;
        }

        if (!this.exerciseState.solutionsRevealed && this.exerciseConfig.solutionFiles.includes(file.path)) {
            return false;
        }

        return true;
    },

    /** Whether the file is read-only because the exercise locks it (`exercise_locked_files`). */
    _isExerciseFileLocked(file: EditorFile | null | undefined): boolean {
        return this._isExerciseMode() && Boolean(file?.path) && this.exerciseConfig.lockedFiles.includes(file!.path); // `Boolean(file?.path)` just checked it
    },

    /** One entry per document file with its `editor_hidden_files` key and whether it is hidden there. */
    _getFileVisibilityEntries(): FileVisibilityEntry[] {
        return getDocumentFileVisibilityEntries(this.currentDocument);
    },

    /** The visibility entry of one file, or `null`. (No caller at the moment.) */
    _getFileVisibilityEntryById(fileId: string): FileVisibilityEntry | null {
        return this._getFileVisibilityEntries().find((entry) => entry.file.id === fileId) || null;
    },

    /** Ids of the files the author hid with `editor_hidden_files`. */
    _getManuallyHiddenFileIdSet(): Set<string> {
        return new Set(
            this._getFileVisibilityEntries()
                .filter((entry) => entry.hidden)
                .map((entry) => entry.file.id),
        );
    },

    /** Whether the file is hidden by `editor_hidden_files` (exercise concealment does not count). */
    _isFileManuallyHidden(file: EditorFile | null | undefined): boolean {
        if (!file?.id) return false;
        return this._getManuallyHiddenFileIdSet().has(file.id);
    },

    /** The files the workspace shows, in document order: not concealed by the exercise and not hidden by the author. */
    _getVisibleFiles(): EditorFile[] {
        const hiddenFileIds = this._getManuallyHiddenFileIdSet();
        return (this.currentDocument.files || []).filter(
            (file) => this._isExerciseFileVisible(file) && !hiddenFileIds.has(file.id),
        );
    },

    /** The visible files matching a quick-open query, best first (all of them, in order, for an empty query). */
    _getQuickOpenMatches(query: string = ''): EditorFile[] {
        return buildQuickOpenMatches(this._getVisibleFiles(), query);
    },

    /**
     * What the exercise panel shows for the current document and learner state (`{ enabled: false }`
     * outside exercise mode), including the attempt/solution comparison of the selected file pair.
     */
    getExercisePresentation(): ExercisePresentation {
        if (!this._isExerciseMode()) {
            return {
                enabled: false,
            };
        }

        const revealedHints = this.exerciseConfig.hints.slice(0, this.exerciseState.revealedHints);
        const comparisonIntent =
            this.exerciseConfig.comparePairs.length > 0 || Boolean(this.exerciseConfig.solutionExample);
        const comparison = resolveExerciseComparison({
            attemptDocument: this.currentDocument,
            exerciseConfig: this.exerciseConfig,
            selectedPairId: this.exerciseState.selectedComparePairId,
            solutionDocument: this.exerciseComparisonSource,
        });
        const comparisonVisible = comparisonIntent && this.exerciseState.comparisonVisible;
        const comparisonMetaParts: string[] = [];

        if (comparison.selectedPair?.source === 'external' && this.exerciseConfig.solutionExample) {
            comparisonMetaParts.push(`Source: ${this.exerciseConfig.solutionExample}`);
        } else if (comparison.selectedPair?.source === 'internal') {
            comparisonMetaParts.push('Source: hidden solution file');
        }

        if (comparison.selectedPair?.summary) {
            const { sameCount, changedCount, addedCount, removedCount } = comparison.selectedPair.summary;
            if (changedCount > 0) comparisonMetaParts.push(`${changedCount} changed`);
            if (addedCount > 0) comparisonMetaParts.push(`${addedCount} added`);
            if (removedCount > 0) comparisonMetaParts.push(`${removedCount} missing`);
            comparisonMetaParts.push(`${sameCount} matching`);
        }

        return {
            comparison: {
                available: comparison.available,
                error: this.exerciseComparisonSourceError,
                issues: comparison.issues,
                loading: this.exerciseComparisonSourceStatus === 'loading',
                meta: comparisonMetaParts.filter(Boolean).join(' • '),
                pairs: comparison.pairs.map((pair) => ({
                    id: pair.id,
                    label: pair.label,
                })),
                rows: comparison.selectedPair?.rows || [],
                selectedPairId: comparison.selectedPairId,
                showToggle: comparisonIntent,
                visible: comparisonVisible,
            },
            enabled: true,
            hiddenReferenceCount: this.exerciseState.referencesRevealed ? 0 : this.exerciseConfig.referenceFiles.length,
            hiddenSolutionCount: this.exerciseState.solutionsRevealed ? 0 : this.exerciseConfig.solutionFiles.length,
            hints: revealedHints,
            instructions: [...this.exerciseConfig.instructions],
            lockedFileCount: this.exerciseConfig.lockedFiles.length,
            notesCollapsed: this.exerciseState.notesCollapsed,
            remainingHintCount: Math.max(this.exerciseConfig.hints.length - this.exerciseState.revealedHints, 0),
            referencesRevealed: this.exerciseState.referencesRevealed,
            showRevealReferences: this.exerciseConfig.referenceFiles.length > 0,
            showRevealSolution: this.exerciseConfig.solutionFiles.length > 0,
            solutionsRevealed: this.exerciseState.solutionsRevealed,
            title: this.exerciseConfig.title,
            totalHintCount: this.exerciseConfig.hints.length,
        };
    },

    /** Sends the current presentation to `onExerciseStateChange` (when the app passed one). */
    _emitExerciseStateChange(): void {
        if (!this.onExerciseStateChange) return;
        this.onExerciseStateChange(this.getExercisePresentation());
    },

    /** Shows one more hint (no-op once all are shown). */
    revealNextExerciseHint(): void {
        if (!this._isExerciseMode()) return;
        if (this.exerciseState.revealedHints >= this.exerciseConfig.hints.length) return;

        this.exerciseState = {
            ...this.exerciseState,
            revealedHints: this.exerciseState.revealedHints + 1,
        };
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    },

    /** Reveals the reference files (they appear in the workspace). */
    revealExerciseReferences(): void {
        if (!this._isExerciseMode() || this.exerciseState.referencesRevealed) return;

        this.exerciseState = {
            ...this.exerciseState,
            referencesRevealed: true,
        };
        this._ensureActiveFile();
        this._renderWorkspace();
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    },

    /** Reveals the solution files (they appear in the workspace). */
    revealExerciseSolutions(): void {
        if (!this._isExerciseMode() || this.exerciseState.solutionsRevealed) return;

        this.exerciseState = {
            ...this.exerciseState,
            solutionsRevealed: true,
        };
        this._ensureActiveFile();
        this._renderWorkspace();
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    },

    /** Folds or unfolds the body of the exercise panel. */
    toggleExerciseNotesCollapsed(): void {
        if (!this._isExerciseMode()) return;

        this.exerciseState = {
            ...this.exerciseState,
            notesCollapsed: !this.exerciseState.notesCollapsed,
        };
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    },

    /** Shows or hides the comparison (only when the exercise has something to compare). */
    toggleExerciseComparison(): void {
        if (!this._isExerciseMode()) return;
        if (this.exerciseConfig.comparePairs.length === 0 && !this.exerciseConfig.solutionExample) return;

        this.exerciseState = {
            ...this.exerciseState,
            comparisonVisible: !this.exerciseState.comparisonVisible,
        };
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    },

    /** Selects the file pair the comparison shows (an `ExerciseComparisonPairOption` id). */
    selectExerciseComparisonPair(pairId: string): void {
        if (!this._isExerciseMode()) return;

        this.exerciseState = {
            ...this.exerciseState,
            selectedComparePairId: typeof pairId === 'string' ? pairId : '',
        };
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    },

    /**
     * Fetches and parses the linked solution example (`exercise_solution_example`) for the comparison,
     * emitting the presentation when the load starts and when it ends. Without a solution example (or
     * outside exercise mode, or without a topic) it only resets the comparison source.
     */
    async _loadExerciseComparisonSource(): Promise<void> {
        if (!this._isExerciseMode() || !this.exerciseConfig.solutionExample || !this.currentTopicPath) {
            this._resetExerciseComparisonSource();
            this._emitExerciseStateChange();
            return;
        }

        const solutionFilename = this.exerciseConfig.solutionExample;
        const requestId = this.exerciseComparisonRequestId + 1;

        this.exerciseComparisonRequestId = requestId;
        this.exerciseComparisonSource = null;
        this.exerciseComparisonSourceError = '';
        this.exerciseComparisonSourceStatus = 'loading';
        this._emitExerciseStateChange();

        try {
            const data = await fetchExample(this.currentTopicPath, solutionFilename);
            if (requestId !== this.exerciseComparisonRequestId) return;

            this.exerciseComparisonSource = data?.content
                ? parseExampleDocument(data.content)
                : createEmptyExampleDocument();
            this.exerciseComparisonSourceError = '';
            this.exerciseComparisonSourceStatus = 'ready';
        } catch (error) {
            if (requestId !== this.exerciseComparisonRequestId) return;

            this.exerciseComparisonSource = null;
            this.exerciseComparisonSourceError =
                (error as Error | null | undefined)?.message || `Failed to load "${solutionFilename}".`;
            this.exerciseComparisonSourceStatus = 'error';
        }

        this._emitExerciseStateChange();
    },
} satisfies ThisType<Editor>;

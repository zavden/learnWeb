// ─── Exercise Panel Component ───────────────────────────
// The exercise notes panel (#exercise-panel) above the editor workspace: instructions, revealable hints,
// the buttons that reveal reference and solution files, and the attempt-versus-solution comparison grid.
// Created once by the app shell (src/main.ts).
//
// A pure view: it keeps no exercise state. The Editor (src/components/editor/exercisePanel.ts) owns the
// state and describes what to show in an `ExercisePresentation` (`getExercisePresentation`); main.ts hands
// that to `render` whenever the editor says it changed. The user's clicks go back out through the
// callbacks, which main.ts wires to the Editor's `reveal…` / `toggle…` / `select…` methods.
// Every element is looked up with `getElementById` and tolerated missing: `render` skips what is absent.

import type { ComparisonRow } from '../utils/exerciseComparison.ts';

/** What the app shell passes to `new ExercisePanel(...)`; every callback is optional. */
export interface ExercisePanelOptions {
    /** "Show Hint" was clicked. */
    onRevealHint?: () => void;
    /** "Reveal Reference Files" was clicked. */
    onRevealReferences?: () => void;
    /** "Reveal Solution Files" was clicked. */
    onRevealSolution?: () => void;
    /** Another file pair was picked in the comparison selector (`pairId` is `ExercisePresentation` pair `id`). */
    onSelectComparisonPair?: (pairId: string) => void;
    /** "Hide Notes" / "Show Notes" was clicked. */
    onToggleCollapse?: () => void;
    /** "Show Comparison" / "Hide Comparison" was clicked. */
    onToggleComparison?: () => void;
}

/** One entry of the comparison's file-pair selector. */
export interface ExerciseComparisonPairOption {
    id: string;
    label: string;
}

/** The comparison part of an {@link EnabledExercisePresentation}. */
export interface ExerciseComparisonPresentation {
    /** Whether there is at least one pair to compare (not read by the panel). */
    available: boolean;
    /** Why the linked solution example could not be loaded; shown in place of `issues`. `''` when it loaded. */
    error: string;
    /** Reasons the comparison is incomplete (unknown files, nothing to match); only the first is shown. */
    issues: string[];
    /** The linked solution example is being fetched. */
    loading: boolean;
    /** One line under the selector: the solution's source and the changed/added/missing/matching counts. */
    meta: string;
    pairs: ExerciseComparisonPairOption[];
    /** Rows of the selected pair, in display order. */
    rows: ComparisonRow[];
    /** Id of the pair whose rows are shown; `''` when there is none. */
    selectedPairId: string;
    /** The exercise has something to compare, so the "Show Comparison" button is offered. */
    showToggle: boolean;
    /** The user opened the comparison section. */
    visible: boolean;
}

/** An example that is not an exercise (or `render()` with no argument): the panel hides itself. */
export interface DisabledExercisePresentation {
    enabled?: false;
}

/** An exercise example: everything the panel shows. */
export interface EnabledExercisePresentation {
    enabled: true;
    comparison: ExerciseComparisonPresentation;
    /** Reference files still hidden (`0` once revealed); the count in the reveal button. */
    hiddenReferenceCount: number;
    /** Solution files still hidden (`0` once revealed); the count in the reveal button. */
    hiddenSolutionCount: number;
    /** The hints revealed so far, in order. */
    hints: string[];
    instructions: string[];
    lockedFileCount: number;
    /**
     * The notes body is folded away (only the header stays). Absent right after the exercise metadata
     * changes (the editor resets its exercise state without this field), which reads as not folded.
     */
    notesCollapsed?: boolean;
    /** Hints not revealed yet. */
    remainingHintCount: number;
    referencesRevealed: boolean;
    /** The exercise has reference files, so their reveal button is offered. */
    showRevealReferences: boolean;
    /** The exercise has solution files, so their reveal button is offered. */
    showRevealSolution: boolean;
    solutionsRevealed: boolean;
    title: string;
    /** All hints of the exercise, revealed or not; `0` hides the hint button. */
    totalHintCount: number;
}

/** What {@link ExercisePanel.render} shows; produced by `getExercisePresentation()` of the Editor. */
export type ExercisePresentation = DisabledExercisePresentation | EnabledExercisePresentation;

/** The exercise notes panel. Starts hidden (the constructor calls `clear()`); `render` fills and shows it. */
export class ExercisePanel {
    private readonly panel: HTMLElement | null;
    private readonly body: HTMLElement | null;
    private readonly title: HTMLElement | null;
    private readonly summary: HTMLElement | null;
    private readonly instructions: HTMLElement | null;
    private readonly hintsSection: HTMLElement | null;
    private readonly hintsList: HTMLElement | null;
    private readonly btnToggle: HTMLButtonElement | null;
    private readonly btnHint: HTMLButtonElement | null;
    private readonly btnRevealReferences: HTMLButtonElement | null;
    private readonly btnRevealSolution: HTMLButtonElement | null;
    private readonly btnCompare: HTMLButtonElement | null;
    private readonly comparisonSection: HTMLElement | null;
    private readonly comparisonSelectLabel: HTMLElement | null;
    private readonly comparisonSelect: HTMLSelectElement | null;
    private readonly comparisonMeta: HTMLElement | null;
    private readonly comparisonStatus: HTMLElement | null;
    private readonly comparisonGrid: HTMLElement | null;

    constructor({ onRevealHint, onRevealReferences, onRevealSolution, onSelectComparisonPair, onToggleCollapse, onToggleComparison }: ExercisePanelOptions = {}) {
        this.panel = document.getElementById('exercise-panel');
        this.body = document.getElementById('exercise-panel-body');
        this.title = document.getElementById('exercise-title');
        this.summary = document.getElementById('exercise-summary');
        this.instructions = document.getElementById('exercise-instructions');
        this.hintsSection = document.getElementById('exercise-hints-section');
        this.hintsList = document.getElementById('exercise-hints-list');
        this.btnToggle = document.getElementById('btn-exercise-toggle') as HTMLButtonElement | null;
        this.btnHint = document.getElementById('btn-exercise-hint') as HTMLButtonElement | null;
        this.btnRevealReferences = document.getElementById('btn-exercise-references') as HTMLButtonElement | null;
        this.btnRevealSolution = document.getElementById('btn-exercise-solution') as HTMLButtonElement | null;
        this.btnCompare = document.getElementById('btn-exercise-compare') as HTMLButtonElement | null;
        this.comparisonSection = document.getElementById('exercise-comparison-section');
        this.comparisonSelectLabel = document.getElementById('exercise-comparison-select-label');
        this.comparisonSelect = document.getElementById('exercise-comparison-select') as HTMLSelectElement | null;
        this.comparisonMeta = document.getElementById('exercise-comparison-meta');
        this.comparisonStatus = document.getElementById('exercise-comparison-status');
        this.comparisonGrid = document.getElementById('exercise-comparison-grid');

        this.btnToggle?.addEventListener('click', () => onToggleCollapse?.());
        this.btnHint?.addEventListener('click', () => onRevealHint?.());
        this.btnRevealReferences?.addEventListener('click', () => onRevealReferences?.());
        this.btnRevealSolution?.addEventListener('click', () => onRevealSolution?.());
        this.btnCompare?.addEventListener('click', () => onToggleComparison?.());
        this.comparisonSelect?.addEventListener('change', (event) => onSelectComparisonPair?.((event.target as HTMLSelectElement).value));

        this.clear();
    }

    /** Hides the panel (no exercise is open). */
    clear(): void {
        this.render({ enabled: false });
    }

    /** Shows `presentation`; one that is not `enabled` just hides the panel and leaves its content as it was. */
    render(presentation: ExercisePresentation = {}): void {
        if (!this.panel) return;

        if (!presentation?.enabled) {
            this.panel.classList.add('hidden');
            return;
        }

        this.panel.classList.remove('hidden');
        const notesCollapsed = Boolean(presentation.notesCollapsed);
        this.panel.classList.toggle('is-collapsed', notesCollapsed);
        this.body?.classList.toggle('hidden', notesCollapsed);

        if (this.btnToggle) {
            this.btnToggle.textContent = notesCollapsed ? 'Show Notes' : 'Hide Notes';
            this.btnToggle.setAttribute('aria-expanded', String(!notesCollapsed));
        }

        if (this.title) {
            this.title.textContent = presentation.title || 'Exercise';
        }

        if (this.instructions) {
            this.instructions.innerHTML = '';
            const items = Array.isArray(presentation.instructions) ? presentation.instructions : [];

            items.forEach((instruction) => {
                const item = document.createElement('li');
                item.textContent = instruction;
                this.instructions!.appendChild(item); // non-null: inside the `if (this.instructions)` guard; closures lose the narrowing
            });
        }

        if (this.summary) {
            const parts = [];

            if (presentation.lockedFileCount > 0) {
                parts.push(`${presentation.lockedFileCount} locked file${presentation.lockedFileCount === 1 ? '' : 's'}`);
            }

            if (presentation.hiddenReferenceCount > 0) {
                parts.push(`${presentation.hiddenReferenceCount} hidden reference file${presentation.hiddenReferenceCount === 1 ? '' : 's'}`);
            }

            if (presentation.hiddenSolutionCount > 0) {
                parts.push(`${presentation.hiddenSolutionCount} hidden solution file${presentation.hiddenSolutionCount === 1 ? '' : 's'}`);
            }

            this.summary.textContent = parts.length > 0
                ? parts.join(' • ')
                : 'Exercise workspace ready';
        }

        const hints = Array.isArray(presentation.hints) ? presentation.hints : [];
        if (this.hintsList) {
            this.hintsList.innerHTML = '';
            hints.forEach((hint) => {
                const item = document.createElement('li');
                item.textContent = hint;
                this.hintsList!.appendChild(item); // non-null: inside the `if (this.hintsList)` guard
            });
        }

        if (this.hintsSection) {
            this.hintsSection.classList.toggle('hidden', hints.length === 0);
        }

        if (this.btnHint) {
            const remaining = Number(presentation.remainingHintCount || 0);
            this.btnHint.classList.toggle('hidden', Number(presentation.totalHintCount || 0) === 0);
            this.btnHint.disabled = remaining === 0;
            this.btnHint.textContent = remaining > 0
                ? `Show Hint (${remaining})`
                : 'All Hints Shown';
        }

        if (this.btnRevealReferences) {
            this.btnRevealReferences.classList.toggle('hidden', !presentation.showRevealReferences);
            this.btnRevealReferences.disabled = Boolean(presentation.referencesRevealed);
            this.btnRevealReferences.textContent = presentation.referencesRevealed
                ? 'Reference Files Visible'
                : `Reveal Reference Files (${presentation.hiddenReferenceCount || 0})`;
        }

        if (this.btnRevealSolution) {
            this.btnRevealSolution.classList.toggle('hidden', !presentation.showRevealSolution);
            this.btnRevealSolution.disabled = Boolean(presentation.solutionsRevealed);
            this.btnRevealSolution.textContent = presentation.solutionsRevealed
                ? 'Solution Files Visible'
                : `Reveal Solution Files (${presentation.hiddenSolutionCount || 0})`;
        }

        const comparison: Partial<ExerciseComparisonPresentation> = presentation.comparison || {};

        if (this.btnCompare) {
            this.btnCompare.classList.toggle('hidden', !comparison.showToggle);
            this.btnCompare.textContent = comparison.visible ? 'Hide Comparison' : 'Show Comparison';
            this.btnCompare.disabled = !comparison.showToggle;
            this.btnCompare.setAttribute('aria-expanded', String(Boolean(comparison.visible)));
        }

        if (this.comparisonSection) {
            const shouldShowComparison = Boolean(comparison.showToggle) && Boolean(comparison.visible);
            this.comparisonSection.classList.toggle('hidden', !shouldShowComparison);
        }

        if (this.comparisonSelect && this.comparisonSelectLabel) {
            const pairs = Array.isArray(comparison.pairs) ? comparison.pairs : [];

            this.comparisonSelect.innerHTML = '';
            pairs.forEach((pair) => {
                const option = document.createElement('option');
                option.value = pair.id;
                option.textContent = pair.label;
                this.comparisonSelect!.appendChild(option); // non-null: inside the `if (this.comparisonSelect && …)` guard
            });

            this.comparisonSelect.value = comparison.selectedPairId || '';
            this.comparisonSelectLabel.classList.toggle('hidden', pairs.length <= 1);
        }

        if (this.comparisonMeta) {
            this.comparisonMeta.textContent = comparison.meta || '';
            this.comparisonMeta.classList.toggle('hidden', !comparison.meta);
        }

        if (this.comparisonStatus) {
            const issues = Array.isArray(comparison.issues) ? comparison.issues : [];
            const statusMessage = comparison.loading
                ? 'Loading linked solution example...'
                : comparison.error
                    ? comparison.error
                    : issues[0] || '';

            this.comparisonStatus.textContent = statusMessage;
            this.comparisonStatus.classList.toggle('hidden', !statusMessage);
            this.comparisonStatus.classList.toggle('is-error', Boolean(comparison.error));
        }

        if (this.comparisonGrid) {
            this.comparisonGrid.innerHTML = '';

            const rows = Array.isArray(comparison.rows) ? comparison.rows : [];
            if (rows.length === 0 && comparison.visible && !comparison.loading && !comparison.error) {
                const empty = document.createElement('p');
                empty.className = 'exercise-comparison-empty';
                empty.textContent = 'No comparison rows available for this exercise yet.';
                this.comparisonGrid.appendChild(empty);
            }

            rows.forEach((row) => {
                const rowEl = document.createElement('div');
                rowEl.className = `exercise-comparison-row is-${row.state || 'same'}`;

                const attemptCell = document.createElement('div');
                attemptCell.className = 'exercise-comparison-cell';
                attemptCell.appendChild(this._createComparisonLineNumber(row.attemptLineNumber));
                attemptCell.appendChild(this._createComparisonCode(row.attemptText));

                const solutionCell = document.createElement('div');
                solutionCell.className = 'exercise-comparison-cell';
                solutionCell.appendChild(this._createComparisonLineNumber(row.solutionLineNumber));
                solutionCell.appendChild(this._createComparisonCode(row.solutionText));

                rowEl.appendChild(attemptCell);
                rowEl.appendChild(solutionCell);
                this.comparisonGrid!.appendChild(rowEl); // non-null: inside the `if (this.comparisonGrid)` guard
            });
        }
    }

    private _createComparisonLineNumber(value: number | null | undefined): HTMLSpanElement {
        const lineNumber = document.createElement('span');
        lineNumber.className = 'exercise-comparison-line-number';
        lineNumber.textContent = value == null ? '·' : String(value);
        return lineNumber;
    }

    private _createComparisonCode(value: string): HTMLElement {
        const code = document.createElement('code');
        code.className = 'exercise-comparison-code';
        code.textContent = value === '' ? ' ' : value;
        return code;
    }
}

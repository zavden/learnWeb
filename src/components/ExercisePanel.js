export class ExercisePanel {
    constructor({ onRevealHint, onRevealReferences, onRevealSolution, onSelectComparisonPair, onToggleCollapse, onToggleComparison } = {}) {
        this.panel = document.getElementById('exercise-panel');
        this.body = document.getElementById('exercise-panel-body');
        this.title = document.getElementById('exercise-title');
        this.summary = document.getElementById('exercise-summary');
        this.instructions = document.getElementById('exercise-instructions');
        this.hintsSection = document.getElementById('exercise-hints-section');
        this.hintsList = document.getElementById('exercise-hints-list');
        this.btnToggle = document.getElementById('btn-exercise-toggle');
        this.btnHint = document.getElementById('btn-exercise-hint');
        this.btnRevealReferences = document.getElementById('btn-exercise-references');
        this.btnRevealSolution = document.getElementById('btn-exercise-solution');
        this.btnCompare = document.getElementById('btn-exercise-compare');
        this.comparisonSection = document.getElementById('exercise-comparison-section');
        this.comparisonSelectLabel = document.getElementById('exercise-comparison-select-label');
        this.comparisonSelect = document.getElementById('exercise-comparison-select');
        this.comparisonMeta = document.getElementById('exercise-comparison-meta');
        this.comparisonStatus = document.getElementById('exercise-comparison-status');
        this.comparisonGrid = document.getElementById('exercise-comparison-grid');

        this.btnToggle?.addEventListener('click', () => onToggleCollapse?.());
        this.btnHint?.addEventListener('click', () => onRevealHint?.());
        this.btnRevealReferences?.addEventListener('click', () => onRevealReferences?.());
        this.btnRevealSolution?.addEventListener('click', () => onRevealSolution?.());
        this.btnCompare?.addEventListener('click', () => onToggleComparison?.());
        this.comparisonSelect?.addEventListener('change', (event) => onSelectComparisonPair?.(event.target.value));

        this.clear();
    }

    clear() {
        this.render({ enabled: false });
    }

    render(presentation = {}) {
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
                this.instructions.appendChild(item);
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
                this.hintsList.appendChild(item);
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

        const comparison = presentation.comparison || {};

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
                this.comparisonSelect.appendChild(option);
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
                this.comparisonGrid.appendChild(rowEl);
            });
        }
    }

    _createComparisonLineNumber(value) {
        const lineNumber = document.createElement('span');
        lineNumber.className = 'exercise-comparison-line-number';
        lineNumber.textContent = value == null ? '·' : String(value);
        return lineNumber;
    }

    _createComparisonCode(value) {
        const code = document.createElement('code');
        code.className = 'exercise-comparison-code';
        code.textContent = value === '' ? ' ' : value;
        return code;
    }
}

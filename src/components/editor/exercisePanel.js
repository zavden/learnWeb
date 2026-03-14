import { resolveExerciseComparison } from '../../utils/exerciseComparison.js';
import { buildQuickOpenMatches } from '../../utils/fileQuickOpen.js';
import { getDocumentFileVisibilityEntries, getExerciseConfig } from '../../utils/markdown.js';
import { fetchExample } from '../../utils/api.js';

export const exercisePanelMixin = {
    _createEmptyExerciseConfig() {
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

    _sanitizeExerciseState(exerciseState = {}) {
        const revealedHints = Number.isFinite(exerciseState.revealedHints)
            ? exerciseState.revealedHints
            : Number.parseInt(exerciseState.revealedHints, 10);

        return {
            comparisonVisible: Boolean(exerciseState.comparisonVisible),
            notesCollapsed: Boolean(exerciseState.notesCollapsed),
            referencesRevealed: Boolean(exerciseState.referencesRevealed),
            revealedHints: Number.isFinite(revealedHints) && revealedHints > 0 ? revealedHints : 0,
            selectedComparePairId: typeof exerciseState.selectedComparePairId === 'string'
                ? exerciseState.selectedComparePairId
                : '',
            solutionsRevealed: Boolean(exerciseState.solutionsRevealed),
        };
    },

    _isExerciseMode() {
        return Boolean(this.exerciseConfig?.enabled);
    },

    _syncExerciseConfig() {
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

        this.exerciseState = previousSignature === nextSignature
            ? nextState
            : {
                comparisonVisible: false,
                referencesRevealed: false,
                revealedHints: 0,
                selectedComparePairId: '',
                solutionsRevealed: false,
            };

        if (previousConfig.solutionExample !== this.exerciseConfig.solutionExample || !this.exerciseConfig.solutionExample) {
            this._resetExerciseComparisonSource();
        }
    },

    _resetExerciseComparisonSource() {
        this.exerciseComparisonSource = null;
        this.exerciseComparisonSourceError = '';
        this.exerciseComparisonSourceStatus = 'idle';
        this.exerciseComparisonRequestId += 1;
    },

    _isExerciseFileVisible(file) {
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

    _isExerciseFileLocked(file) {
        return this._isExerciseMode()
            && Boolean(file?.path)
            && this.exerciseConfig.lockedFiles.includes(file.path);
    },

    _getFileVisibilityEntries() {
        return getDocumentFileVisibilityEntries(this.currentDocument);
    },

    _getFileVisibilityEntryById(fileId) {
        return this._getFileVisibilityEntries().find((entry) => entry.file.id === fileId) || null;
    },

    _getManuallyHiddenFileIdSet() {
        return new Set(
            this._getFileVisibilityEntries()
                .filter((entry) => entry.hidden)
                .map((entry) => entry.file.id)
        );
    },

    _isFileManuallyHidden(file) {
        if (!file?.id) return false;
        return this._getManuallyHiddenFileIdSet().has(file.id);
    },

    _getVisibleFiles() {
        const hiddenFileIds = this._getManuallyHiddenFileIdSet();
        return (this.currentDocument.files || []).filter((file) => (
            this._isExerciseFileVisible(file)
            && !hiddenFileIds.has(file.id)
        ));
    },

    _getQuickOpenMatches(query = '') {
        return buildQuickOpenMatches(this._getVisibleFiles(), query);
    },

    getExercisePresentation() {
        if (!this._isExerciseMode()) {
            return {
                enabled: false,
            };
        }

        const revealedHints = this.exerciseConfig.hints.slice(0, this.exerciseState.revealedHints);
        const comparisonIntent = this.exerciseConfig.comparePairs.length > 0
            || Boolean(this.exerciseConfig.solutionExample);
        const comparison = resolveExerciseComparison({
            attemptDocument: this.currentDocument,
            exerciseConfig: this.exerciseConfig,
            selectedPairId: this.exerciseState.selectedComparePairId,
            solutionDocument: this.exerciseComparisonSource,
        });
        const comparisonVisible = comparisonIntent && this.exerciseState.comparisonVisible;
        const comparisonMetaParts = [];

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

    _emitExerciseStateChange() {
        if (!this.onExerciseStateChange) return;
        this.onExerciseStateChange(this.getExercisePresentation());
    },

    revealNextExerciseHint() {
        if (!this._isExerciseMode()) return;
        if (this.exerciseState.revealedHints >= this.exerciseConfig.hints.length) return;

        this.exerciseState = {
            ...this.exerciseState,
            revealedHints: this.exerciseState.revealedHints + 1,
        };
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    },

    revealExerciseReferences() {
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

    revealExerciseSolutions() {
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

    toggleExerciseNotesCollapsed() {
        if (!this._isExerciseMode()) return;

        this.exerciseState = {
            ...this.exerciseState,
            notesCollapsed: !this.exerciseState.notesCollapsed,
        };
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    },

    toggleExerciseComparison() {
        if (!this._isExerciseMode()) return;
        if (this.exerciseConfig.comparePairs.length === 0 && !this.exerciseConfig.solutionExample) return;

        this.exerciseState = {
            ...this.exerciseState,
            comparisonVisible: !this.exerciseState.comparisonVisible,
        };
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    },

    selectExerciseComparisonPair(pairId) {
        if (!this._isExerciseMode()) return;

        this.exerciseState = {
            ...this.exerciseState,
            selectedComparePairId: typeof pairId === 'string' ? pairId : '',
        };
        this._emitExerciseStateChange();
        this._emitSessionStateChange();
    },

    async _loadExerciseComparisonSource() {
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
            this.exerciseComparisonSourceError = error?.message || `Failed to load "${solutionFilename}".`;
            this.exerciseComparisonSourceStatus = 'error';
        }

        this._emitExerciseStateChange();
    },
};

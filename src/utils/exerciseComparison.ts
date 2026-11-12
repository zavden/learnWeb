// Side-by-side comparison of a learner's exercise attempt against its solution, for the exercise
// panel's "compare" view (src/components/editor/exercisePanel.ts).
//
// Pure: given the attempt document, an optional solution document (the linked solution example) and
// the exercise's compare config, it decides WHICH file pairs to compare and diffs each pair line by
// line. Solution files come from two places: an `external` solution example (a separate document), and
// `internal` ones, files of the attempt document itself (hidden solution files). Matching is by
// normalized file path.

/** The file fields a comparison reads; a document file of the editor has more. */
export interface ComparableFile {
    path: string;
    content?: string;
    language?: string;
}

/** A document as far as comparison is concerned: just its files. */
export interface ComparableDocument {
    files?: readonly ComparableFile[];
}

// TODO(ts-migration): use the compare-pair type of the exercise config from src/types/document.ts once it exists
/** An explicit pairing from the exercise config: compare `attemptPath` against `solutionPath`. */
export interface ComparePairConfig {
    attemptPath: string;
    solutionPath: string;
}

/** The part of the exercise config that drives comparison. */
export interface ExerciseComparisonConfig {
    /** When non-empty, only these pairs are compared; otherwise files with the same path in both documents are. */
    comparePairs?: readonly ComparePairConfig[];
}

/** Options of {@link resolveExerciseComparison}. */
export interface ResolveExerciseComparisonOptions {
    /** The learner's document (needed in practice: without it nothing can be paired). */
    attemptDocument?: ComparableDocument | null;
    /** The parsed linked solution example, or `null` while it is not loaded / when there is none. */
    solutionDocument?: ComparableDocument | null;
    exerciseConfig?: ExerciseComparisonConfig;
    /** Id of the pair to select; the first pair is selected when it is empty or unknown. */
    selectedPairId?: string;
}

/** How one aligned line pair differs. */
export type ComparisonRowState = 'same' | 'changed' | 'added' | 'removed';

/** One row of the side-by-side view. A side without a line has `null` as its number and `''` as its text. */
export interface ComparisonRow {
    /** 1-based line in the attempt, or `null` for an `added` row (a line only the solution has). */
    attemptLineNumber: number | null;
    attemptText: string;
    /** 1-based line in the solution, or `null` for a `removed` row (a line only the attempt has). */
    solutionLineNumber: number | null;
    solutionText: string;
    state: ComparisonRowState;
}

/** Row counts per state of one comparison. */
export interface ComparisonSummary {
    sameCount: number;
    changedCount: number;
    addedCount: number;
    removedCount: number;
}

/** Where the solution side of a pair comes from. */
export type ComparisonSource = 'internal' | 'external';

/** A pair of files that will be compared, before diffing. */
interface FilePair {
    /** `attemptPath=>solutionPath`: unique within a comparison. */
    id: string;
    /** Text for the pair picker: the path, or `attempt -> solution` when they differ. */
    label: string;
    attemptFile: ComparableFile;
    attemptPath: string;
    solutionFile: ComparableFile;
    solutionPath: string;
    source: ComparisonSource;
}

/** A compared pair of files with its diff. */
export interface ComparisonPair extends FilePair {
    /** Language of the attempt file, else of the solution file, else `text`. */
    language: string;
    rows: ComparisonRow[];
    summary: ComparisonSummary;
}

/** Result of {@link resolveExerciseComparison}. */
export interface ExerciseComparison {
    /** Whether there is at least one pair to show. */
    available: boolean;
    /** Human-readable reasons why pairs are missing (unknown files, no matching files). */
    issues: string[];
    pairs: ComparisonPair[];
    /** The pair named by `selectedPairId`, else the first pair, else `null`. */
    selectedPair: ComparisonPair | null;
    selectedPairId: string;
}

/** An edit operation of the line diff, in output order. */
type DiffOperation =
    | { type: 'same'; attemptIndex: number; solutionIndex: number }
    | { type: 'removed'; attemptIndex: number; solutionIndex: null }
    | { type: 'added'; attemptIndex: null; solutionIndex: number };

function normalizePath(value = ''): string {
    return String(value || '')
        .trim()
        .replaceAll('\\', '/')
        .replace(/^\.\/+/, '')
        .replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/');
}

function splitLines(content = ''): string[] {
    const lines = String(content || '').replace(/\r\n/g, '\n').split('\n');

    while (lines.length > 1 && lines.at(-1) === '') {
        lines.pop();
    }

    return lines;
}

function summarizeRows(rows: readonly ComparisonRow[] = []): ComparisonSummary {
    return rows.reduce((summary: ComparisonSummary, row) => {
        if (row.state === 'same') {
            summary.sameCount += 1;
        } else if (row.state === 'added') {
            summary.addedCount += 1;
        } else if (row.state === 'removed') {
            summary.removedCount += 1;
        } else {
            summary.changedCount += 1;
        }

        return summary;
    }, {
        sameCount: 0,
        changedCount: 0,
        addedCount: 0,
        removedCount: 0,
    });
}

// Above this many DP cells the middle section falls back to a positional comparison.
const MAX_LINE_DIFF_CELLS = 2_000_000;

// Line diff based on the longest common subsequence. Returns edit operations in order:
// { type: 'same' | 'removed' | 'added', attemptIndex, solutionIndex }.
function diffLines(attemptLines: readonly string[] = [], solutionLines: readonly string[] = []): DiffOperation[] {
    const operations: DiffOperation[] = [];
    let prefix = 0;

    while (
        prefix < attemptLines.length
        && prefix < solutionLines.length
        && attemptLines[prefix] === solutionLines[prefix]
    ) {
        operations.push({ type: 'same', attemptIndex: prefix, solutionIndex: prefix });
        prefix += 1;
    }

    let attemptEnd = attemptLines.length;
    let solutionEnd = solutionLines.length;
    const suffix: DiffOperation[] = [];

    while (
        attemptEnd > prefix
        && solutionEnd > prefix
        && attemptLines[attemptEnd - 1] === solutionLines[solutionEnd - 1]
    ) {
        attemptEnd -= 1;
        solutionEnd -= 1;
        suffix.unshift({ type: 'same', attemptIndex: attemptEnd, solutionIndex: solutionEnd });
    }

    const attemptCount = attemptEnd - prefix;
    const solutionCount = solutionEnd - prefix;

    if (attemptCount > 0 || solutionCount > 0) {
        if (attemptCount === 0 || solutionCount === 0 || (attemptCount + 1) * (solutionCount + 1) > MAX_LINE_DIFF_CELLS) {
            for (let index = 0; index < attemptCount; index += 1) {
                operations.push({ type: 'removed', attemptIndex: prefix + index, solutionIndex: null });
            }
            for (let index = 0; index < solutionCount; index += 1) {
                operations.push({ type: 'added', attemptIndex: null, solutionIndex: prefix + index });
            }
        } else {
            const width = solutionCount + 1;
            const lengths = new Uint32Array((attemptCount + 1) * width);

            for (let i = attemptCount - 1; i >= 0; i -= 1) {
                for (let j = solutionCount - 1; j >= 0; j -= 1) {
                    lengths[i * width + j] = attemptLines[prefix + i] === solutionLines[prefix + j]
                        ? lengths[(i + 1) * width + j + 1] + 1
                        : Math.max(lengths[(i + 1) * width + j], lengths[i * width + j + 1]);
                }
            }

            let i = 0;
            let j = 0;
            while (i < attemptCount && j < solutionCount) {
                if (attemptLines[prefix + i] === solutionLines[prefix + j]) {
                    operations.push({ type: 'same', attemptIndex: prefix + i, solutionIndex: prefix + j });
                    i += 1;
                    j += 1;
                } else if (lengths[(i + 1) * width + j] >= lengths[i * width + j + 1]) {
                    operations.push({ type: 'removed', attemptIndex: prefix + i, solutionIndex: null });
                    i += 1;
                } else {
                    operations.push({ type: 'added', attemptIndex: null, solutionIndex: prefix + j });
                    j += 1;
                }
            }
            for (; i < attemptCount; i += 1) {
                operations.push({ type: 'removed', attemptIndex: prefix + i, solutionIndex: null });
            }
            for (; j < solutionCount; j += 1) {
                operations.push({ type: 'added', attemptIndex: null, solutionIndex: prefix + j });
            }
        }
    }

    return operations.concat(suffix);
}

function buildComparisonRows(
    attemptContent = '',
    solutionContent = '',
): { rows: ComparisonRow[]; summary: ComparisonSummary } {
    const attemptLines = splitLines(attemptContent);
    const solutionLines = splitLines(solutionContent);
    const operations = diffLines(attemptLines, solutionLines);
    const rows: ComparisonRow[] = [];
    let removedRun: number[] = [];
    let addedRun: number[] = [];

    const createRow = (attemptIndex: number | null, solutionIndex: number | null, state: ComparisonRowState): ComparisonRow => ({
        attemptLineNumber: attemptIndex == null ? null : attemptIndex + 1,
        attemptText: attemptIndex == null ? '' : attemptLines[attemptIndex],
        solutionLineNumber: solutionIndex == null ? null : solutionIndex + 1,
        solutionText: solutionIndex == null ? '' : solutionLines[solutionIndex],
        state,
    });

    // Within a run of edits, pair removed and added lines side by side as "changed" rows,
    // then list whatever is left over.
    const flushRuns = () => {
        const pairedCount = Math.min(removedRun.length, addedRun.length);
        for (let index = 0; index < pairedCount; index += 1) {
            rows.push(createRow(removedRun[index], addedRun[index], 'changed'));
        }
        removedRun.slice(pairedCount).forEach((attemptIndex) => rows.push(createRow(attemptIndex, null, 'removed')));
        addedRun.slice(pairedCount).forEach((solutionIndex) => rows.push(createRow(null, solutionIndex, 'added')));
        removedRun = [];
        addedRun = [];
    };

    operations.forEach((operation) => {
        if (operation.type === 'removed') {
            removedRun.push(operation.attemptIndex);
            return;
        }

        if (operation.type === 'added') {
            addedRun.push(operation.solutionIndex);
            return;
        }

        flushRuns();
        rows.push(createRow(operation.attemptIndex, operation.solutionIndex, 'same'));
    });
    flushRuns();

    return {
        rows,
        summary: summarizeRows(rows),
    };
}

function getFileMap(documentModel: ComparableDocument | null | undefined): Map<string, ComparableFile> {
    const files: readonly ComparableFile[] = Array.isArray(documentModel?.files) ? documentModel.files : [];
    return new Map(files.map((file) => [normalizePath(file.path), file]));
}

function createPairId(attemptPath: string, solutionPath: string): string {
    return `${attemptPath}=>${solutionPath}`;
}

function createPairLabel(attemptPath: string, solutionPath: string): string {
    return attemptPath === solutionPath
        ? attemptPath
        : `${attemptPath} -> ${solutionPath}`;
}

interface ExplicitPairsInput {
    attemptMap: Map<string, ComparableFile>;
    internalSolutionMap: Map<string, ComparableFile>;
    externalSolutionMap: Map<string, ComparableFile>;
    comparePairs: readonly ComparePairConfig[];
    /** Receives a message for every file that cannot be resolved. */
    issues: string[];
}

function resolveExplicitPairs({ attemptMap, internalSolutionMap, externalSolutionMap, comparePairs, issues }: ExplicitPairsInput): FilePair[] {
    // A pair can miss either file at first; the filter at the end keeps only complete ones.
    type MaybePair = Omit<FilePair, 'attemptFile' | 'solutionFile'> & {
        attemptFile: ComparableFile | null;
        solutionFile: ComparableFile | null;
    };

    return comparePairs.map((pair): MaybePair => {
        const attemptPath = normalizePath(pair.attemptPath);
        const solutionPath = normalizePath(pair.solutionPath);
        const attemptFile = attemptMap.get(attemptPath) || null;
        const solutionFile = externalSolutionMap.get(solutionPath)
            || internalSolutionMap.get(solutionPath)
            || null;

        if (!attemptFile) {
            issues.push(`Attempt file "${attemptPath}" is not available in this exercise.`);
        }

        if (!solutionFile) {
            issues.push(`Solution file "${solutionPath}" could not be resolved for comparison.`);
        }

        return {
            id: createPairId(attemptPath, solutionPath),
            label: createPairLabel(attemptPath, solutionPath),
            attemptFile,
            attemptPath,
            solutionFile,
            solutionPath,
            source: externalSolutionMap.has(solutionPath) ? 'external' : 'internal',
        };
    }).filter((pair): pair is FilePair => Boolean(pair.attemptFile && pair.solutionFile));
}

function resolveAutomaticPairs(
    { attemptMap, externalSolutionMap }: Pick<ExplicitPairsInput, 'attemptMap' | 'externalSolutionMap'>,
): FilePair[] {
    const pairs: FilePair[] = [];

    attemptMap.forEach((attemptFile, attemptPath) => {
        const solutionFile = externalSolutionMap.get(attemptPath);
        if (!solutionFile) return;

        pairs.push({
            id: createPairId(attemptPath, attemptPath),
            label: createPairLabel(attemptPath, attemptPath),
            attemptFile,
            attemptPath,
            solutionFile,
            solutionPath: attemptPath,
            source: 'external',
        });
    });

    return pairs;
}

/**
 * Decides which files to compare and diffs them. Explicit `comparePairs` win; without them (or when
 * none resolves) files with the same path in both documents are paired, but only if a solution
 * document is given. Unresolvable paths are reported in `issues` rather than thrown.
 */
export function resolveExerciseComparison({
    attemptDocument,
    solutionDocument = null,
    exerciseConfig = {},
    selectedPairId = '',
}: ResolveExerciseComparisonOptions = {}): ExerciseComparison {
    const issues: string[] = [];
    const attemptMap = getFileMap(attemptDocument);
    const internalSolutionMap = getFileMap(attemptDocument);
    const externalSolutionMap = getFileMap(solutionDocument);
    const comparePairs = Array.isArray(exerciseConfig.comparePairs) ? exerciseConfig.comparePairs : [];

    let pairs = comparePairs.length > 0
        ? resolveExplicitPairs({
            attemptMap,
            internalSolutionMap,
            externalSolutionMap,
            comparePairs,
            issues,
        })
        : [];

    if (pairs.length === 0 && solutionDocument) {
        pairs = resolveAutomaticPairs({
            attemptMap,
            externalSolutionMap,
        });

        if (pairs.length === 0) {
            issues.push('No matching files were found between the exercise and the linked solution example.');
        }
    }

    const enrichedPairs = pairs.map((pair): ComparisonPair => {
        const comparison = buildComparisonRows(pair.attemptFile?.content || '', pair.solutionFile?.content || '');

        return {
            ...pair,
            language: pair.attemptFile?.language || pair.solutionFile?.language || 'text',
            rows: comparison.rows,
            summary: comparison.summary,
        };
    });

    const availablePair = enrichedPairs.find((pair) => pair.id === selectedPairId) || enrichedPairs[0] || null;

    return {
        available: enrichedPairs.length > 0,
        issues,
        pairs: enrichedPairs,
        selectedPair: availablePair,
        selectedPairId: availablePair?.id || '',
    };
}

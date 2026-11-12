function normalizePath(value = '') {
    return String(value || '')
        .trim()
        .replaceAll('\\', '/')
        .replace(/^\.\/+/, '')
        .replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/');
}

function splitLines(content = '') {
    const lines = String(content || '').replace(/\r\n/g, '\n').split('\n');

    while (lines.length > 1 && lines.at(-1) === '') {
        lines.pop();
    }

    return lines;
}

function summarizeRows(rows = []) {
    return rows.reduce((summary, row) => {
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
function diffLines(attemptLines = [], solutionLines = []) {
    const operations = [];
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
    const suffix = [];

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

function buildComparisonRows(attemptContent = '', solutionContent = '') {
    const attemptLines = splitLines(attemptContent);
    const solutionLines = splitLines(solutionContent);
    const operations = diffLines(attemptLines, solutionLines);
    const rows = [];
    let removedRun = [];
    let addedRun = [];

    const createRow = (attemptIndex, solutionIndex, state) => ({
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

function getFileMap(documentModel) {
    const files = Array.isArray(documentModel?.files) ? documentModel.files : [];
    return new Map(files.map((file) => [normalizePath(file.path), file]));
}

function createPairId(attemptPath, solutionPath) {
    return `${attemptPath}=>${solutionPath}`;
}

function createPairLabel(attemptPath, solutionPath) {
    return attemptPath === solutionPath
        ? attemptPath
        : `${attemptPath} -> ${solutionPath}`;
}

function resolveExplicitPairs({ attemptMap, internalSolutionMap, externalSolutionMap, comparePairs, issues }) {
    return comparePairs.map((pair) => {
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
    }).filter((pair) => pair.attemptFile && pair.solutionFile);
}

function resolveAutomaticPairs({ attemptMap, externalSolutionMap }) {
    const pairs = [];

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

export function resolveExerciseComparison({
    attemptDocument,
    solutionDocument = null,
    exerciseConfig = {},
    selectedPairId = '',
} = {}) {
    const issues = [];
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

    const enrichedPairs = pairs.map((pair) => {
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

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

function buildComparisonRows(attemptContent = '', solutionContent = '') {
    const attemptLines = splitLines(attemptContent);
    const solutionLines = splitLines(solutionContent);
    const length = Math.max(attemptLines.length, solutionLines.length, 1);
    const rows = [];

    for (let index = 0; index < length; index += 1) {
        const attemptText = attemptLines[index] ?? '';
        const solutionText = solutionLines[index] ?? '';

        let state = 'same';
        if (index >= attemptLines.length) {
            state = 'added';
        } else if (index >= solutionLines.length) {
            state = 'removed';
        } else if (attemptText !== solutionText) {
            state = 'changed';
        }

        rows.push({
            attemptLineNumber: index < attemptLines.length ? index + 1 : null,
            attemptText,
            solutionLineNumber: index < solutionLines.length ? index + 1 : null,
            solutionText,
            state,
        });
    }

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

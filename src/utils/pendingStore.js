import fs from 'fs';
import path from 'path';

function normalizePendingPath(value = '') {
    return String(value || '')
        .trim()
        .replaceAll('\\', '/')
        .replace(/^\.\/+/, '')
        .replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/');
}

function isExampleMarkdownPath(relativePath = '') {
    return /^material\/[^/]+\/[^/]+\/[^/]+\/examples\/.+\.md$/i.test(relativePath);
}

function buildState(items = []) {
    return {
        items,
    };
}

export function readPendingState(filePath) {
    if (!fs.existsSync(filePath)) {
        return buildState([]);
    }

    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        const inputItems = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed?.items)
                ? parsed.items
                : [];

        const items = Array.from(new Set(
            inputItems
                .map((entry) => normalizePendingPath(entry))
                .filter((entry) => entry && isExampleMarkdownPath(entry))
        ));

        return buildState(items);
    } catch {
        return buildState([]);
    }
}

export function writePendingState(filePath, items = []) {
    const state = buildState(Array.from(new Set(
        (Array.isArray(items) ? items : [])
            .map((entry) => normalizePendingPath(entry))
            .filter((entry) => entry && isExampleMarkdownPath(entry))
    )));

    fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, 'utf-8');
    return state;
}

export function addPending(filePath, relativePath) {
    const normalizedPath = normalizePendingPath(relativePath);
    if (!isExampleMarkdownPath(normalizedPath)) {
        return readPendingState(filePath);
    }

    const state = readPendingState(filePath);
    if (state.items.includes(normalizedPath)) {
        return state;
    }

    return writePendingState(filePath, [...state.items, normalizedPath]);
}

export function removePending(filePath, relativePath) {
    const normalizedPath = normalizePendingPath(relativePath);
    const state = readPendingState(filePath);
    return writePendingState(
        filePath,
        state.items.filter((entry) => entry !== normalizedPath),
    );
}

export function isPendingPath(filePath, relativePath) {
    const normalizedPath = normalizePendingPath(relativePath);
    return readPendingState(filePath).items.includes(normalizedPath);
}

export function resolvePending(filePath, materialDir) {
    const state = readPendingState(filePath);

    return state.items.map((relativePath) => {
        const absolutePath = path.join(path.dirname(materialDir), relativePath);
        const exists = fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile();
        const normalizedPath = normalizePendingPath(relativePath);
        const segments = normalizedPath.split('/');
        const filename = segments[segments.length - 1] || '';
        const topicSegments = segments.slice(1, 4);
        const topicPath = topicSegments.length === 3 ? topicSegments.join('/') : '';

        return {
            exists,
            filename,
            path: normalizedPath,
            topicPath,
        };
    });
}

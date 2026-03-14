import fs from 'fs';
import path from 'path';

function normalizeFavoritePath(value = '') {
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

export function readFavoritesState(filePath) {
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
                .map((entry) => normalizeFavoritePath(entry))
                .filter((entry) => entry && isExampleMarkdownPath(entry))
        ));

        return buildState(items);
    } catch {
        return buildState([]);
    }
}

export function writeFavoritesState(filePath, items = []) {
    const state = buildState(Array.from(new Set(
        (Array.isArray(items) ? items : [])
            .map((entry) => normalizeFavoritePath(entry))
            .filter((entry) => entry && isExampleMarkdownPath(entry))
    )));

    fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, 'utf-8');
    return state;
}

export function addFavorite(filePath, relativePath) {
    const normalizedPath = normalizeFavoritePath(relativePath);
    if (!isExampleMarkdownPath(normalizedPath)) {
        return readFavoritesState(filePath);
    }

    const state = readFavoritesState(filePath);
    if (state.items.includes(normalizedPath)) {
        return state;
    }

    return writeFavoritesState(filePath, [...state.items, normalizedPath]);
}

export function removeFavorite(filePath, relativePath) {
    const normalizedPath = normalizeFavoritePath(relativePath);
    const state = readFavoritesState(filePath);
    return writeFavoritesState(
        filePath,
        state.items.filter((entry) => entry !== normalizedPath),
    );
}

export function isFavoritePath(filePath, relativePath) {
    const normalizedPath = normalizeFavoritePath(relativePath);
    return readFavoritesState(filePath).items.includes(normalizedPath);
}

export function resolveFavorites(filePath, materialDir) {
    const state = readFavoritesState(filePath);

    return state.items.map((relativePath) => {
        const absolutePath = path.join(path.dirname(materialDir), relativePath);
        const exists = fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile();
        const normalizedPath = normalizeFavoritePath(relativePath);
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

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

// ─── Shared helpers for the JSON dotfiles (.favorites, .pending, .hiddens) ──────

// Reads a JSON state file without ever throwing. Hand-edited files with trailing commas are
// recovered; anything else unparseable is reported as "invalid" with its raw text so the
// caller can salvage entries instead of silently starting from an empty state.
export function readJsonStateFile(filePath) {
    if (!filePath || !fs.existsSync(filePath)) {
        return { raw: '', status: 'missing', value: null };
    }

    let raw = '';
    try {
        raw = fs.readFileSync(filePath, 'utf-8');
    } catch {
        return { raw: '', status: 'invalid', value: null };
    }

    const text = raw.replace(/^\uFEFF/, '');
    if (!text.trim()) {
        return { raw, status: 'empty', value: null };
    }

    try {
        return { raw, status: 'ok', value: JSON.parse(text) };
    } catch { /* try a lenient parse */ }

    try {
        const lenient = text
            .replace(/^\s*\/\/.*$/gm, '')
            .replace(/,(\s*[\]}])/g, '$1');
        return { raw, status: 'recovered', value: JSON.parse(lenient) };
    } catch {
        return { raw, status: 'invalid', value: null };
    }
}

// Before overwriting a state file that was not valid JSON, keep a copy of it next to the
// original (".bak", or ".bak-<timestamp>" when a backup already exists).
export function backupUnreadableStateFile(filePath) {
    const current = readJsonStateFile(filePath);
    if (current.status !== 'recovered' && current.status !== 'invalid') {
        return '';
    }

    const backupPath = fs.existsSync(`${filePath}.bak`)
        ? `${filePath}.bak-${Date.now()}`
        : `${filePath}.bak`;
    fs.writeFileSync(backupPath, current.raw, 'utf-8');
    return backupPath;
}

export function salvageQuotedStrings(raw = '', pattern = /"([^"\n]+)"/g) {
    return Array.from(String(raw || '').matchAll(pattern), (match) => match[1]);
}

function getStateItems(fileState) {
    if (fileState.status === 'invalid') {
        return salvageQuotedStrings(fileState.raw);
    }

    const parsed = fileState.value;
    return Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.items)
            ? parsed.items
            : [];
}

export function readFavoritesState(filePath) {
    const inputItems = getStateItems(readJsonStateFile(filePath));
    const items = Array.from(new Set(
        inputItems
            .map((entry) => normalizeFavoritePath(entry))
            .filter((entry) => entry && isExampleMarkdownPath(entry))
    ));

    return buildState(items);
}

export function writeFavoritesState(filePath, items = []) {
    const state = buildState(Array.from(new Set(
        (Array.isArray(items) ? items : [])
            .map((entry) => normalizeFavoritePath(entry))
            .filter((entry) => entry && isExampleMarkdownPath(entry))
    )));

    backupUnreadableStateFile(filePath);
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

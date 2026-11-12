// Storage of the favorite examples: the `.favorites` dotfile in the repository root, a JSON list of
// repository-relative example paths (`material/chNN-x/secNN-y/topNN-z/examples/name.md`).
//
// Runs under Node, imported by server.ts (the `/api/favorites` routes) and by pendingStore.ts and
// materialTree.ts, which reuse the JSON helpers below for `.pending` and `.hiddens`. Users edit these
// files by hand, so reading never throws and never trusts the content: entries are normalized, unknown
// ones dropped, and a file that cannot be parsed is salvaged and backed up before it is overwritten.
// pendingStore.ts keeps its own copy of the favorites logic on purpose; change both together.

import fs from 'fs';
import path from 'path';
import type {
    ExampleListState,
    ExampleReferenceEntry,
    FavoritesState,
    RawExampleListState,
} from '../types/material.ts';

// Entries come from a hand-edited file, so they can be any JSON value.
function normalizeFavoritePath(value: unknown = ''): string {
    return String(value || '')
        .trim()
        .replaceAll('\\', '/')
        .replace(/^\.\/+/, '')
        .replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/');
}

function isExampleMarkdownPath(relativePath = ''): boolean {
    return /^material\/[^/]+\/[^/]+\/[^/]+\/examples\/.+\.md$/i.test(relativePath);
}

function buildState(items: string[] = []): ExampleListState {
    return {
        items,
    };
}

// ─── Shared helpers for the JSON dotfiles (.favorites, .pending, .hiddens) ──────

/** How reading a state file went: `recovered` means a lenient parse (comments, trailing commas) was needed. */
export type JsonStateStatus = 'missing' | 'empty' | 'ok' | 'recovered' | 'invalid';

/** Result of {@link readJsonStateFile}: the raw text and, when it parsed, the untrusted parsed value. */
export interface JsonStateFile {
    /** The file text as read (`''` when missing or unreadable). */
    raw: string;
    status: JsonStateStatus;
    /** What `JSON.parse` returned (any JSON value: not validated), or `null` unless the status is `ok` or `recovered`. */
    value: unknown;
}

/**
 * Reads a JSON state file without ever throwing. Hand-edited files with trailing commas are
 * recovered; anything else unparseable is reported as "invalid" with its raw text so the
 * caller can salvage entries instead of silently starting from an empty state.
 */
export function readJsonStateFile(filePath: string | null | undefined): JsonStateFile {
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
    } catch {
        /* try a lenient parse */
    }

    try {
        const lenient = text.replace(/^\s*\/\/.*$/gm, '').replace(/,(\s*[\]}])/g, '$1');
        return { raw, status: 'recovered', value: JSON.parse(lenient) };
    } catch {
        return { raw, status: 'invalid', value: null };
    }
}

/**
 * Before overwriting a state file that was not valid JSON, keep a copy of it next to the
 * original (".bak", or ".bak-<timestamp>" when a backup already exists). Returns the backup path,
 * or `''` when the file needed no backup.
 */
export function backupUnreadableStateFile(filePath: string): string {
    const current = readJsonStateFile(filePath);
    if (current.status !== 'recovered' && current.status !== 'invalid') {
        return '';
    }

    const backupPath = fs.existsSync(`${filePath}.bak`) ? `${filePath}.bak-${Date.now()}` : `${filePath}.bak`;
    fs.writeFileSync(backupPath, current.raw, 'utf-8');
    return backupPath;
}

/** Every string between double quotes in broken JSON text (the first capture group of `pattern`). */
export function salvageQuotedStrings(raw: string = '', pattern: RegExp = /"([^"\n]+)"/g): string[] {
    return Array.from(String(raw || '').matchAll(pattern), (match) => match[1]);
}

// The untrusted entries of a state file, before normalization.
function getStateItems(fileState: JsonStateFile): unknown[] {
    if (fileState.status === 'invalid') {
        return salvageQuotedStrings(fileState.raw);
    }

    const parsed = fileState.value as RawExampleListState | null;
    return Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : [];
}

/** The favorites in `filePath`, cleaned: normalized paths, only example `.md` files, no duplicates. */
export function readFavoritesState(filePath: string): FavoritesState {
    const inputItems = getStateItems(readJsonStateFile(filePath));
    const items = Array.from(
        new Set(
            inputItems
                .map((entry) => normalizeFavoritePath(entry))
                .filter((entry) => entry && isExampleMarkdownPath(entry)),
        ),
    );

    return buildState(items);
}

/** Overwrites the favorites file with the cleaned `items` (backing up an unparseable file first). */
export function writeFavoritesState(filePath: string, items: readonly string[] = []): FavoritesState {
    const state = buildState(
        Array.from(
            new Set(
                (Array.isArray(items) ? items : [])
                    .map((entry) => normalizeFavoritePath(entry))
                    .filter((entry) => entry && isExampleMarkdownPath(entry)),
            ),
        ),
    );

    backupUnreadableStateFile(filePath);
    fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, 'utf-8');
    return state;
}

/** Appends an example path to the favorites. Anything that is not an example `.md` path is ignored. */
export function addFavorite(filePath: string, relativePath: string): FavoritesState {
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

/** Removes an example path from the favorites (a no-op rewrite when it was not there). */
export function removeFavorite(filePath: string, relativePath: string): FavoritesState {
    const normalizedPath = normalizeFavoritePath(relativePath);
    const state = readFavoritesState(filePath);
    return writeFavoritesState(
        filePath,
        state.items.filter((entry) => entry !== normalizedPath),
    );
}

/** Whether the (normalized) path is currently a favorite. */
export function isFavoritePath(filePath: string, relativePath: string): boolean {
    const normalizedPath = normalizeFavoritePath(relativePath);
    return readFavoritesState(filePath).items.includes(normalizedPath);
}

/**
 * The favorites with their file name, topic and whether the file still exists. `materialDir` is the
 * `material/` folder: the stored paths are relative to its parent.
 */
export function resolveFavorites(filePath: string, materialDir: string): ExampleReferenceEntry[] {
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

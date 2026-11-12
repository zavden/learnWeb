// Storage of the pending examples (examples still to review): the `.pending` dotfile in the repository
// root, a JSON list of repository-relative example paths. Same format, same rules and same
// hand-edit tolerance as the favorites; the logic is a deliberate copy of favoritesStore.ts (only the
// JSON file helpers are shared), so change both together. Runs under Node, imported by server.ts.

import fs from 'fs';
import path from 'path';
import type { ExampleListState, ExampleReferenceEntry, PendingState, RawExampleListState } from '../types/material.ts';
import { backupUnreadableStateFile, readJsonStateFile, salvageQuotedStrings } from './favoritesStore.ts';
import type { JsonStateFile } from './favoritesStore.ts';

// Entries come from a hand-edited file, so they can be any JSON value.
function normalizePendingPath(value: unknown = ''): string {
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

// The untrusted entries of a state file, before normalization.
function getStateItems(fileState: JsonStateFile): unknown[] {
    if (fileState.status === 'invalid') {
        return salvageQuotedStrings(fileState.raw);
    }

    const parsed = fileState.value as RawExampleListState | null;
    return Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.items)
            ? parsed.items
            : [];
}

/** The pending list in `filePath`, cleaned: normalized paths, only example `.md` files, no duplicates. */
export function readPendingState(filePath: string): PendingState {
    const inputItems = getStateItems(readJsonStateFile(filePath));
    const items = Array.from(new Set(
        inputItems
            .map((entry) => normalizePendingPath(entry))
            .filter((entry) => entry && isExampleMarkdownPath(entry))
    ));

    return buildState(items);
}

/** Overwrites the pending file with the cleaned `items` (backing up an unparseable file first). */
export function writePendingState(filePath: string, items: readonly string[] = []): PendingState {
    const state = buildState(Array.from(new Set(
        (Array.isArray(items) ? items : [])
            .map((entry) => normalizePendingPath(entry))
            .filter((entry) => entry && isExampleMarkdownPath(entry))
    )));

    backupUnreadableStateFile(filePath);
    fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, 'utf-8');
    return state;
}

/** Appends an example path to the pending list. Anything that is not an example `.md` path is ignored. */
export function addPending(filePath: string, relativePath: string): PendingState {
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

/** Removes an example path from the pending list (a no-op rewrite when it was not there). */
export function removePending(filePath: string, relativePath: string): PendingState {
    const normalizedPath = normalizePendingPath(relativePath);
    const state = readPendingState(filePath);
    return writePendingState(
        filePath,
        state.items.filter((entry) => entry !== normalizedPath),
    );
}

/** Whether the (normalized) path is currently pending. */
export function isPendingPath(filePath: string, relativePath: string): boolean {
    const normalizedPath = normalizePendingPath(relativePath);
    return readPendingState(filePath).items.includes(normalizedPath);
}

/**
 * The pending examples with their file name, topic and whether the file still exists. `materialDir` is
 * the `material/` folder: the stored paths are relative to its parent.
 */
export function resolvePending(filePath: string, materialDir: string): ExampleReferenceEntry[] {
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

// Line-highlight metadata: the `highlights:` frontmatter text of an example <-> the editor's highlight maps.
//
// Text format (`ExampleMetadata.highlights`): `path:line:colorId,line:colorId||path2:line:colorId`, one
// `||`-separated segment per file, addressed by its virtual path (e.g. `src/App.jsx:3:yellow,5:blue`).
// In memory the highlights are keyed by file id instead (`DocumentHighlights`), because the editor tracks
// files by id. Used by the editor (src/components/editor/lineHighlightsMixin.ts, fileOperations.ts) and by
// the theory embeds (src/utils/theoryExerciseEmbeds.ts). Color ids are not validated here.

import type { DocumentHighlights, FileLineHighlights, VirtualFile } from '../types/document.ts';

/**
 * The part of a document file this module needs: highlights map file ids to paths and back. Any document's
 * `files` fit, including the theory document's.
 */
export type HighlightFileRef = Pick<VirtualFile, 'id' | 'path'>;

/**
 * Writes highlights as `path:line:colorId,…` segments joined by `||`, lines in ascending order. Files with
 * no highlights or that are not in `files` are skipped, so the result follows the order of `highlights`.
 */
export function serializeHighlights(highlights: DocumentHighlights, files: readonly HighlightFileRef[]): string {
    const parts: string[] = [];
    for (const [fileId, lineMap] of highlights) {
        if (lineMap.size === 0) continue;
        const file = files.find((f) => f.id === fileId);
        if (!file) continue;
        const pairs = Array.from(lineMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([line, colorId]) => `${line}:${colorId}`)
            .join(',');
        parts.push(`${file.path}:${pairs}`);
    }
    return parts.join('||');
}

/**
 * Reads the text produced by `serializeHighlights()` (or written by hand in the frontmatter) into
 * highlights keyed by file id. Tolerant: segments for unknown paths and pairs with a bad line number
 * (not a number, or below 1) or an empty color are skipped; empty input gives an empty map.
 */
export function parseHighlights(str: string | null | undefined, files: readonly HighlightFileRef[] | null | undefined): DocumentHighlights {
    const result: DocumentHighlights = new Map();
    if (!str || !files) return result;

    for (const segment of String(str).split('||')) {
        const match = segment.match(/^([^:]+):(\d.*)/);
        if (!match) continue;
        const path = match[1].trim();
        const pairsStr = match[2];
        const file = files.find((f) => f.path === path);
        if (!file) continue;

        const lineMap: FileLineHighlights = new Map();
        for (const pair of pairsStr.split(',')) {
            const colonIdx = pair.indexOf(':');
            if (colonIdx === -1) continue;
            const lineNum = Number.parseInt(pair.slice(0, colonIdx), 10);
            const colorId = pair.slice(colonIdx + 1).trim();
            if (!Number.isFinite(lineNum) || lineNum < 1 || !colorId) continue;
            lineMap.set(lineNum, colorId);
        }

        if (lineMap.size > 0) {
            result.set(file.id, lineMap);
        }
    }

    return result;
}

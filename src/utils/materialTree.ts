// Builds the chapter > section > topic tree of the `material/` folder and keeps the hidden-chapters
// state file (`.hiddens`).
//
// Runs under Node, imported by server.ts (`GET /api/tree` and the hide/show chapter route); the
// browser only sees the JSON result (types in src/types/material.ts). Folders are `chNN-slug`,
// `secNN-slug`, `topNN-slug`; the tree is sorted by those numbers, and labels come from `label.txt`
// (chapters, sections) or the first heading of `main.md` (topics), falling back to the slug. The
// course snapshot (scripts/snapshot-material.ts) hashes this output, so any change here is visible there.
// `.hiddens` is edited by hand too: reading it never throws and a broken file keeps its chapters.

import fs from 'fs';
import path from 'path';
import type {
    HiddenState,
    MaterialChapter,
    MaterialSection,
    MaterialTopic,
    MaterialTree,
    RawHiddenState,
} from '../types/material.ts';
import { backupUnreadableStateFile, readJsonStateFile, salvageQuotedStrings } from './favoritesStore.ts';

/** The parts of a `chNN-slug` / `secNN-slug` / `topNN-slug` folder name. */
interface ParsedDirName {
    type: 'ch' | 'sec' | 'top';
    number: number;
    /** The slug after the number (still with its dashes). */
    label: string;
}

function parseDirName(name: string): ParsedDirName | null {
    const match = String(name || '').match(/^(ch|sec|top)(\d+)-(.+)$/);
    if (!match) return null;
    return { type: match[1] as ParsedDirName['type'], number: Number.parseInt(match[2], 10), label: match[3] };
}

const LABEL_FILE_NAME = 'label.txt';
const LABEL_READ_BYTES = 2048;

// The first `byteCount` bytes of a file as text (without BOM), or '' when it is missing or unreadable.
function readFileHead(filePath: string, byteCount = LABEL_READ_BYTES): string {
    let descriptor: number | null = null;

    try {
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return '';
        descriptor = fs.openSync(filePath, 'r');
        const buffer = Buffer.alloc(byteCount);
        const bytesRead = fs.readSync(descriptor, buffer, 0, byteCount, 0);
        return buffer
            .subarray(0, bytesRead)
            .toString('utf-8')
            .replace(/^\uFEFF/, '');
    } catch {
        return '';
    } finally {
        if (descriptor !== null) {
            try {
                fs.closeSync(descriptor);
            } catch {
                /* ignore */
            }
        }
    }
}

/**
 * Display label of a chapter/section folder: first non-empty line of its optional
 * label.txt (lets Spanish titles keep accents while folder slugs stay ASCII). `''` when there is none.
 */
export function readFolderLabel(folderPath: string): string {
    const head = readFileHead(path.join(folderPath, LABEL_FILE_NAME));
    const firstLine = head
        .split(/\r?\n/)
        .map((line) => line.trim())
        .find(Boolean);
    return firstLine || '';
}

/**
 * Display label of a topic: text of the first "# " heading in the first 2KB of main.md,
 * ignoring fenced code. Trailing "#" closers and the backticks of inline code (`as const`) are
 * removed; everything else is kept as written. `''` when there is no such heading.
 */
export function readTopicHeadingLabel(topicPath: string): string {
    const head = readFileHead(path.join(topicPath, 'main.md'));
    const lines = head.split(/\r?\n/);
    let fence: string | null = null;

    for (const line of lines) {
        const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/);
        if (fenceMatch) {
            if (!fence) {
                fence = fenceMatch[1];
            } else if (fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) {
                fence = null;
            }
            continue;
        }
        if (fence) continue;

        const headingMatch = line.match(/^ {0,3}#[ \t]+(.+?)[ \t]*$/);
        if (headingMatch) {
            const text = headingMatch[1]
                .replace(/[ \t]+#+$/, '')
                .replace(/`([^`]+)`/g, '$1')
                .trim();
            if (text) return text;
        }
    }

    return '';
}

const naturalCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'variant' });

/**
 * Sort comparator for chNN-/secNN-/topNN- folders: by their number (top9 before top10, ch2 before
 * ch10), then by name.
 */
export function compareMaterialEntries(left = '', right = ''): number {
    const leftNumber = String(left).match(/^(?:ch|sec|top)(\d+)/);
    const rightNumber = String(right).match(/^(?:ch|sec|top)(\d+)/);

    if (leftNumber && rightNumber) {
        const difference = Number.parseInt(leftNumber[1], 10) - Number.parseInt(rightNumber[1], 10);
        if (difference !== 0) return difference;
    }

    return naturalCollator.compare(String(left), String(right));
}

/**
 * Cleans the content of `.hiddens`, whatever it parsed to: keeps the chapter folder names (`chNN-...`),
 * trimmed, unique and sorted. Anything else (other shapes, other entries) is dropped.
 */
export function normalizeHiddenState(rawState: unknown = {}): HiddenState {
    const state = rawState as RawHiddenState | null | undefined;
    const chapterIds: unknown[] = Array.isArray(state?.chapters) ? state.chapters : [];
    const chapters = Array.from(
        new Set(
            chapterIds
                .map((chapterId) => String(chapterId || '').trim())
                .filter(Boolean)
                .filter((chapterId) => /^ch\d+-.+/.test(chapterId)),
        ),
    ).sort();

    return { chapters };
}

/** The hidden chapters in `.hiddens` (`{ chapters: [] }` when it is missing or empty). Never throws. */
export function readHiddenState(hiddenStateFile: string | null | undefined): HiddenState {
    const fileState = readJsonStateFile(hiddenStateFile);

    if (fileState.status === 'invalid') {
        // Salvage chapter ids from a broken file instead of un-hiding everything.
        return normalizeHiddenState({ chapters: salvageQuotedStrings(fileState.raw) });
    }

    return normalizeHiddenState(fileState.value || {});
}

/** Normalizes and saves the hidden chapters (backing up an unparseable `.hiddens` first); returns what was saved. */
export function writeHiddenState(hiddenStateFile: string, hiddenState: RawHiddenState): HiddenState {
    const normalized = normalizeHiddenState(hiddenState);

    fs.mkdirSync(path.dirname(hiddenStateFile), { recursive: true });
    backupUnreadableStateFile(hiddenStateFile);
    fs.writeFileSync(hiddenStateFile, `${JSON.stringify(normalized, null, 2)}\n`, 'utf-8');

    return normalized;
}

/** Adds (`hidden`) or removes a chapter from `.hiddens`; returns the saved state. */
export function setChapterHidden(hiddenStateFile: string, chapterId: string, hidden: boolean): HiddenState {
    const normalizedChapterId = String(chapterId || '').trim();
    const nextHiddenState = readHiddenState(hiddenStateFile);
    const chapters = new Set(nextHiddenState.chapters);

    if (hidden) {
        chapters.add(normalizedChapterId);
    } else {
        chapters.delete(normalizedChapterId);
    }

    return writeHiddenState(hiddenStateFile, { chapters: Array.from(chapters) });
}

/** Options of {@link buildMaterialTree}. */
export interface BuildMaterialTreeOptions {
    /** Path of `.hiddens`; without it no chapter is marked hidden. */
    hiddenStateFile?: string;
    /** Keep the hidden chapters in the result (they stay flagged with `hidden: true`). */
    includeHidden?: boolean;
}

/**
 * Reads `materialDir` and returns its chapters with their sections and topics, in numeric folder order.
 * Returns `[]` when the folder does not exist.
 */
export function buildMaterialTree(
    materialDir: string | null | undefined,
    { hiddenStateFile, includeHidden = false }: BuildMaterialTreeOptions = {},
): MaterialTree {
    if (!materialDir || !fs.existsSync(materialDir)) {
        return [];
    }

    const hiddenChapters = new Set(readHiddenState(hiddenStateFile).chapters);
    const chapters = fs
        .readdirSync(materialDir)
        .filter((entry) => entry.startsWith('ch') && fs.statSync(path.join(materialDir, entry)).isDirectory())
        .sort(compareMaterialEntries);

    return chapters
        .map((chapterId): MaterialChapter => {
            const chapterPath = path.join(materialDir, chapterId);
            const parsedChapter = parseDirName(chapterId);
            const sections = fs
                .readdirSync(chapterPath)
                .filter((entry) => entry.startsWith('sec') && fs.statSync(path.join(chapterPath, entry)).isDirectory())
                .sort(compareMaterialEntries);

            const chapterLabel = readFolderLabel(chapterPath);
            return {
                id: chapterId,
                hidden: hiddenChapters.has(chapterId),
                label: chapterLabel || (parsedChapter ? parsedChapter.label.replace(/-/g, ' ') : chapterId),
                labelSource: chapterLabel ? 'custom' : 'slug',
                number: parsedChapter?.number ?? 0,
                sections: sections.map((sectionId): MaterialSection => {
                    const sectionPath = path.join(chapterPath, sectionId);
                    const parsedSection = parseDirName(sectionId);
                    const topics = fs
                        .readdirSync(sectionPath)
                        .filter(
                            (entry) =>
                                entry.startsWith('top') && fs.statSync(path.join(sectionPath, entry)).isDirectory(),
                        )
                        .sort(compareMaterialEntries);

                    const sectionLabel = readFolderLabel(sectionPath);
                    return {
                        id: sectionId,
                        label: sectionLabel || (parsedSection ? parsedSection.label.replace(/-/g, ' ') : sectionId),
                        labelSource: sectionLabel ? 'custom' : 'slug',
                        number: parsedSection?.number ?? 0,
                        topics: topics.map((topicId): MaterialTopic => {
                            const parsedTopic = parseDirName(topicId);
                            const topicLabel = readTopicHeadingLabel(path.join(sectionPath, topicId));
                            return {
                                id: topicId,
                                label: topicLabel || (parsedTopic ? parsedTopic.label.replace(/-/g, ' ') : topicId),
                                labelSource: topicLabel ? 'custom' : 'slug',
                                number: parsedTopic?.number ?? 0,
                                path: `${chapterId}/${sectionId}/${topicId}`,
                            };
                        }),
                    };
                }),
            };
        })
        .filter((chapter) => includeHidden || !chapter.hidden);
}

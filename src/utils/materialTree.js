import fs from 'fs';
import path from 'path';
import { backupUnreadableStateFile, readJsonStateFile, salvageQuotedStrings } from './favoritesStore.js';

function parseDirName(name) {
    const match = String(name || '').match(/^(ch|sec|top)(\d+)-(.+)$/);
    if (!match) return null;
    return { type: match[1], number: Number.parseInt(match[2], 10), label: match[3] };
}

const LABEL_FILE_NAME = 'label.txt';
const LABEL_READ_BYTES = 2048;

function readFileHead(filePath, byteCount = LABEL_READ_BYTES) {
    let descriptor = null;

    try {
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return '';
        descriptor = fs.openSync(filePath, 'r');
        const buffer = Buffer.alloc(byteCount);
        const bytesRead = fs.readSync(descriptor, buffer, 0, byteCount, 0);
        return buffer.subarray(0, bytesRead).toString('utf-8').replace(/^\uFEFF/, '');
    } catch {
        return '';
    } finally {
        if (descriptor !== null) {
            try {
                fs.closeSync(descriptor);
            } catch { /* ignore */ }
        }
    }
}

// Display label of a chapter/section folder: first non-empty line of its optional
// label.txt (lets Spanish titles keep accents while folder slugs stay ASCII).
export function readFolderLabel(folderPath) {
    const head = readFileHead(path.join(folderPath, LABEL_FILE_NAME));
    const firstLine = head.split(/\r?\n/).map((line) => line.trim()).find(Boolean);
    return firstLine || '';
}

// Display label of a topic: text of the first "# " heading in the first 2KB of main.md,
// ignoring fenced code. Trailing "#" closers are removed; everything else is kept as written.
export function readTopicHeadingLabel(topicPath) {
    const head = readFileHead(path.join(topicPath, 'main.md'));
    const lines = head.split(/\r?\n/);
    let fence = null;

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
            const text = headingMatch[1].replace(/[ \t]+#+$/, '').trim();
            if (text) return text;
        }
    }

    return '';
}

const naturalCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'variant' });

// Orders chNN-/secNN-/topNN- folders by their number (top9 before top10, ch2 before ch10),
// then by name.
export function compareMaterialEntries(left = '', right = '') {
    const leftNumber = String(left).match(/^(?:ch|sec|top)(\d+)/);
    const rightNumber = String(right).match(/^(?:ch|sec|top)(\d+)/);

    if (leftNumber && rightNumber) {
        const difference = Number.parseInt(leftNumber[1], 10) - Number.parseInt(rightNumber[1], 10);
        if (difference !== 0) return difference;
    }

    return naturalCollator.compare(String(left), String(right));
}

export function normalizeHiddenState(rawState = {}) {
    const chapterIds = Array.isArray(rawState?.chapters) ? rawState.chapters : [];
    const chapters = Array.from(new Set(
        chapterIds
            .map((chapterId) => String(chapterId || '').trim())
            .filter(Boolean)
            .filter((chapterId) => /^ch\d+-.+/.test(chapterId)),
    )).sort();

    return { chapters };
}

export function readHiddenState(hiddenStateFile) {
    const fileState = readJsonStateFile(hiddenStateFile);

    if (fileState.status === 'invalid') {
        // Salvage chapter ids from a broken file instead of un-hiding everything.
        return normalizeHiddenState({ chapters: salvageQuotedStrings(fileState.raw) });
    }

    return normalizeHiddenState(fileState.value || {});
}

export function writeHiddenState(hiddenStateFile, hiddenState) {
    const normalized = normalizeHiddenState(hiddenState);

    fs.mkdirSync(path.dirname(hiddenStateFile), { recursive: true });
    backupUnreadableStateFile(hiddenStateFile);
    fs.writeFileSync(hiddenStateFile, `${JSON.stringify(normalized, null, 2)}\n`, 'utf-8');

    return normalized;
}

export function setChapterHidden(hiddenStateFile, chapterId, hidden) {
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

export function buildMaterialTree(materialDir, { hiddenStateFile, includeHidden = false } = {}) {
    if (!materialDir || !fs.existsSync(materialDir)) {
        return [];
    }

    const hiddenChapters = new Set(readHiddenState(hiddenStateFile).chapters);
    const chapters = fs
        .readdirSync(materialDir)
        .filter((entry) => entry.startsWith('ch') && fs.statSync(path.join(materialDir, entry)).isDirectory())
        .sort(compareMaterialEntries);

    return chapters
        .map((chapterId) => {
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
                label: chapterLabel
                    || (parsedChapter ? parsedChapter.label.replace(/-/g, ' ') : chapterId),
                labelSource: chapterLabel ? 'custom' : 'slug',
                number: parsedChapter?.number ?? 0,
                sections: sections.map((sectionId) => {
                    const sectionPath = path.join(chapterPath, sectionId);
                    const parsedSection = parseDirName(sectionId);
                    const topics = fs
                        .readdirSync(sectionPath)
                        .filter((entry) => entry.startsWith('top') && fs.statSync(path.join(sectionPath, entry)).isDirectory())
                        .sort(compareMaterialEntries);

                    const sectionLabel = readFolderLabel(sectionPath);
                    return {
                        id: sectionId,
                        label: sectionLabel
                            || (parsedSection ? parsedSection.label.replace(/-/g, ' ') : sectionId),
                        labelSource: sectionLabel ? 'custom' : 'slug',
                        number: parsedSection?.number ?? 0,
                        topics: topics.map((topicId) => {
                            const parsedTopic = parseDirName(topicId);
                            const topicLabel = readTopicHeadingLabel(path.join(sectionPath, topicId));
                            return {
                                id: topicId,
                                label: topicLabel
                                    || (parsedTopic ? parsedTopic.label.replace(/-/g, ' ') : topicId),
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

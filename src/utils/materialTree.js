import fs from 'fs';
import path from 'path';

function parseDirName(name) {
    const match = String(name || '').match(/^(ch|sec|top)(\d+)-(.+)$/);
    if (!match) return null;
    return { type: match[1], number: Number.parseInt(match[2], 10), label: match[3] };
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
    if (!hiddenStateFile || !fs.existsSync(hiddenStateFile)) {
        return normalizeHiddenState();
    }

    try {
        const rawContent = fs.readFileSync(hiddenStateFile, 'utf-8');
        if (!rawContent.trim()) {
            return normalizeHiddenState();
        }

        return normalizeHiddenState(JSON.parse(rawContent));
    } catch {
        return normalizeHiddenState();
    }
}

export function writeHiddenState(hiddenStateFile, hiddenState) {
    const normalized = normalizeHiddenState(hiddenState);

    fs.mkdirSync(path.dirname(hiddenStateFile), { recursive: true });
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
        .sort();

    return chapters
        .map((chapterId) => {
            const chapterPath = path.join(materialDir, chapterId);
            const parsedChapter = parseDirName(chapterId);
            const sections = fs
                .readdirSync(chapterPath)
                .filter((entry) => entry.startsWith('sec') && fs.statSync(path.join(chapterPath, entry)).isDirectory())
                .sort();

            return {
                id: chapterId,
                hidden: hiddenChapters.has(chapterId),
                label: parsedChapter ? parsedChapter.label.replace(/-/g, ' ') : chapterId,
                number: parsedChapter?.number ?? 0,
                sections: sections.map((sectionId) => {
                    const sectionPath = path.join(chapterPath, sectionId);
                    const parsedSection = parseDirName(sectionId);
                    const topics = fs
                        .readdirSync(sectionPath)
                        .filter((entry) => entry.startsWith('top') && fs.statSync(path.join(sectionPath, entry)).isDirectory())
                        .sort();

                    return {
                        id: sectionId,
                        label: parsedSection ? parsedSection.label.replace(/-/g, ' ') : sectionId,
                        number: parsedSection?.number ?? 0,
                        topics: topics.map((topicId) => {
                            const parsedTopic = parseDirName(topicId);
                            return {
                                id: topicId,
                                label: parsedTopic ? parsedTopic.label.replace(/-/g, ' ') : topicId,
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

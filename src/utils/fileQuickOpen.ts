// Fuzzy file picker behind Ctrl+P-style "quick open" in the editor (see
// src/components/editor/exercisePanel.ts): ranks a document's files against a typed query.
// Pure and independent of the document model: it only reads the four fields of QuickOpenFile.

/** The file fields the search looks at. Any of the text fields may be missing. */
export interface QuickOpenFile {
    language?: string;
    name?: string;
    /** Full path inside the example; also the tie-breaker when two files score the same. */
    path: string;
    role?: string;
}

/** The lowercased text each query token is scored against. */
interface SearchFields {
    language: string;
    name: string;
    path: string;
    role: string;
}

function normalizeToken(value = ''): string {
    return String(value || '')
        .trim()
        .toLowerCase();
}

function buildSearchFields(file: Partial<QuickOpenFile> = {}): SearchFields {
    return {
        language: normalizeToken(file.language),
        name: normalizeToken(file.name || file.path || ''),
        path: normalizeToken(file.path || ''),
        role: normalizeToken(file.role || ''),
    };
}

function scoreToken(fields: SearchFields, token: string): number {
    if (!token) return 0;

    let score = 0;

    if (fields.name === token) score += 120;
    else if (fields.name.startsWith(token)) score += 80;
    else if (fields.name.includes(token)) score += 48;

    if (fields.path === token) score += 110;
    else if (fields.path.startsWith(token)) score += 72;
    else if (fields.path.includes(token)) score += 44;

    if (fields.role === token) score += 36;
    else if (fields.role.includes(token)) score += 18;

    if (fields.language === token) score += 30;
    else if (fields.language.includes(token)) score += 14;

    return score;
}

/**
 * The files that match every whitespace-separated token of `query`, best first. A token scores on
 * the name, path, role and language (exact > prefix > substring); a file missing any token is
 * dropped, equal scores sort by path then original order. An empty query keeps the original order.
 */
export function buildQuickOpenMatches<T extends QuickOpenFile>(files: readonly T[] = [], query = ''): T[] {
    const normalizedQuery = normalizeToken(query);
    if (!normalizedQuery) {
        return Array.isArray(files) ? [...files] : [];
    }

    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

    return (Array.isArray(files) ? files : [])
        .map((file, index): { file: T; index: number; score: number } | null => {
            const fields = buildSearchFields(file);
            let score = 0;

            for (const token of tokens) {
                const tokenScore = scoreToken(fields, token);
                if (tokenScore <= 0) {
                    return null;
                }
                score += tokenScore;
            }

            return {
                file,
                index,
                score,
            };
        })
        .filter((entry): entry is { file: T; index: number; score: number } => Boolean(entry))
        .sort((left, right) => {
            if (right.score !== left.score) {
                return right.score - left.score;
            }

            if (left.file.path !== right.file.path) {
                return left.file.path.localeCompare(right.file.path);
            }

            return left.index - right.index;
        })
        .map((entry) => entry.file);
}

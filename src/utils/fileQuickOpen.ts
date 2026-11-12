function normalizeToken(value = '') {
    return String(value || '').trim().toLowerCase();
}

function buildSearchFields(file = {}) {
    return {
        language: normalizeToken(file.language),
        name: normalizeToken(file.name || file.path || ''),
        path: normalizeToken(file.path || ''),
        role: normalizeToken(file.role || ''),
    };
}

function scoreToken(fields, token) {
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

export function buildQuickOpenMatches(files = [], query = '') {
    const normalizedQuery = normalizeToken(query);
    if (!normalizedQuery) {
        return Array.isArray(files) ? [...files] : [];
    }

    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

    return (Array.isArray(files) ? files : [])
        .map((file, index) => {
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
        .filter(Boolean)
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

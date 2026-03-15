export function serializeHighlights(highlights, files) {
    const parts = [];
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

export function parseHighlights(str, files) {
    const result = new Map();
    if (!str || !files) return result;

    for (const segment of String(str).split('||')) {
        const match = segment.match(/^([^:]+):(\d.*)/);
        if (!match) continue;
        const path = match[1].trim();
        const pairsStr = match[2];
        const file = files.find((f) => f.path === path);
        if (!file) continue;

        const lineMap = new Map();
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

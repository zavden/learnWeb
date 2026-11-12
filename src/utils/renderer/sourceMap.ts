const VLQ_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const VLQ_LOOKUP = new Map(Array.from(VLQ_CHARS, (char, index) => [char, index]));
const INLINE_SOURCE_MAP_PATTERN = /\/\/[#@] sourceMappingURL=data:application\/json;(?:charset=[^;,]+;)?base64,([A-Za-z0-9+/=]+)/g;

function decodeBase64(value = '') {
    if (typeof globalThis.atob === 'function') {
        const binary = globalThis.atob(value);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    }

    return Buffer.from(value, 'base64').toString('utf8');
}

function decodeVlqSegment(segment = '') {
    const values = [];
    let shift = 0;
    let value = 0;

    for (const char of segment) {
        const digit = VLQ_LOOKUP.get(char);
        if (digit === undefined) continue;
        value += (digit & 31) << shift;
        if (digit & 32) {
            shift += 5;
        } else {
            values.push(value & 1 ? -(value >> 1) : value >> 1);
            shift = 0;
            value = 0;
        }
    }

    return values;
}

/**
 * Extract the last inline (base64) source map from compiled code and reduce it to a compact
 * generated-line → [sourceIndex, sourceLine] table (1-based lines) the preview runtime can ship.
 */
export function extractInlineSourceMapLines(code = '') {
    const matches = Array.from(String(code || '').matchAll(INLINE_SOURCE_MAP_PATTERN));
    const match = matches.at(-1);
    if (!match) return null;

    let json;
    try {
        json = JSON.parse(decodeBase64(match[1]));
    } catch {
        return null;
    }

    if (!json || typeof json.mappings !== 'string' || !Array.isArray(json.sources)) return null;

    const lineMap = [];
    let sourceIndex = 0;
    let sourceLine = 0;

    json.mappings.split(';').forEach((lineMappings, generatedLineIndex) => {
        if (!lineMappings) return;

        lineMappings.split(',').forEach((segment) => {
            if (!segment) return;
            const values = decodeVlqSegment(segment);
            if (values.length < 4) return;

            sourceIndex += values[1];
            sourceLine += values[2];

            const generatedLine = generatedLineIndex + 1;
            if (!lineMap[generatedLine]) {
                lineMap[generatedLine] = [sourceIndex, sourceLine + 1];
            }
        });
    });

    for (let index = 0; index < lineMap.length; index += 1) {
        if (!lineMap[index]) lineMap[index] = 0;
    }

    return {
        lineMap,
        sources: json.sources.map((source) => String(source || '').replace(/^\.\//, '')),
    };
}

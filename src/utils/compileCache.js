function stableSerialize(value) {
    if (value === null || value === undefined) {
        return String(value);
    }

    const valueType = typeof value;
    if (valueType === 'number' || valueType === 'boolean' || valueType === 'bigint') {
        return String(value);
    }

    if (valueType === 'string') {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        return `[${value.map((entry) => stableSerialize(entry)).join(',')}]`;
    }

    if (valueType === 'object') {
        const keys = Object.keys(value).sort();
        return `{${keys.map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`).join(',')}}`;
    }

    return JSON.stringify(String(value));
}

// Two independent 53-bit hashes (cyrb53 with different seeds) + the input length: ~106 bits, so
// accidental collisions between cached documents are practically impossible (the old 32-bit FNV key
// could silently serve another document's compile result).
function cyrb53(value = '', seed = 0) {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;

    for (let index = 0; index < value.length; index += 1) {
        const code = value.charCodeAt(index);
        h1 = Math.imul(h1 ^ code, 2654435761);
        h2 = Math.imul(h2 ^ code, 1597334677);
    }

    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

function hashString(value = '') {
    return `${cyrb53(value, 0x9e3779b9)}.${cyrb53(value, 0x85ebca6b)}.${value.length.toString(36)}`;
}

export function createCompileCacheKey({ document, content } = {}) {
    const payload = document
        ? { type: 'document', value: document }
        : { type: 'content', value: String(content || '') };

    const serialized = stableSerialize(payload);
    return `compile:${hashString(serialized)}`;
}

export function cloneSerializable(value) {
    return JSON.parse(JSON.stringify(value));
}

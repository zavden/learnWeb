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

function hashString(value = '') {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return (hash >>> 0).toString(36);
}

export function createCompileCacheKey({ document, content } = {}) {
    const payload = document
        ? { type: 'document', value: document }
        : { type: 'content', value: String(content || '') };

    return `compile:${hashString(stableSerialize(payload))}`;
}

export function cloneSerializable(value) {
    return JSON.parse(JSON.stringify(value));
}

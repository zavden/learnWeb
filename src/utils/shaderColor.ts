function clampUnit(value, fallback = 0) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return fallback;
    }

    return Math.max(0, Math.min(1, numeric));
}

function channelToHex(value) {
    return Math.round(clampUnit(value) * 255)
        .toString(16)
        .padStart(2, '0');
}

export function shaderVecToHex(vector = []) {
    const source = Array.isArray(vector) ? vector : [];
    return `#${channelToHex(source[0])}${channelToHex(source[1])}${channelToHex(source[2])}`;
}

export function shaderHexToVec(hex = '') {
    const normalized = String(hex || '').trim().toLowerCase();
    const match = normalized.match(/^#?([0-9a-f]{6})$/i);
    if (!match) {
        return [0, 0, 0];
    }

    const value = match[1];
    return [
        Number.parseInt(value.slice(0, 2), 16) / 255,
        Number.parseInt(value.slice(2, 4), 16) / 255,
        Number.parseInt(value.slice(4, 6), 16) / 255,
    ];
}

export function shaderAlphaToUnit(value, fallback = 1) {
    return clampUnit(value, fallback);
}

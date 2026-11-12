// Conversions between the shader uniform editor's color values (arrays of 0..1 floats, as GLSL
// vec3/vec4 uniforms hold them) and the CSS `#rrggbb` strings of the `<input type="color">` used by
// the shader controls (src/components/preview/ShaderControls.ts).

/** A color as the three 0..1 floats of a GLSL `vec3`. */
export type ShaderRgb = [red: number, green: number, blue: number];

// Any value coerced with Number(): non-finite results give `fallback`; the rest is clamped to 0..1.
function clampUnit(value: unknown, fallback = 0): number {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return fallback;
    }

    return Math.max(0, Math.min(1, numeric));
}

function channelToHex(value: unknown): string {
    return Math.round(clampUnit(value) * 255)
        .toString(16)
        .padStart(2, '0');
}

/** `#rrggbb` for the first three components of a 0..1 vector; missing or invalid components count as 0. */
export function shaderVecToHex(vector: readonly number[] = []): string {
    const source = Array.isArray(vector) ? vector : [];
    return `#${channelToHex(source[0])}${channelToHex(source[1])}${channelToHex(source[2])}`;
}

/** The 0..1 floats of a `#rrggbb` color (the `#` is optional); `[0, 0, 0]` for anything else. */
export function shaderHexToVec(hex = ''): ShaderRgb {
    const normalized = String(hex || '')
        .trim()
        .toLowerCase();
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

/** An alpha value clamped to 0..1 (slider strings accepted); `fallback` when it is not a finite number. */
export function shaderAlphaToUnit(value: unknown, fallback = 1): number {
    return clampUnit(value, fallback);
}

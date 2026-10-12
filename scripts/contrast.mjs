#!/usr/bin/env node
// WCAG 2.x contrast ratio between two colors, for checking course examples.
//
// Usage:
//   node scripts/contrast.mjs "#777777" "#fff"
//   node scripts/contrast.mjs "oklch(0.45 0.12 260)" "rgb(250 250 250)"
//   node scripts/contrast.mjs "#1f2937" "#ffffff" "#2563eb"      (every pair)
//
// Supports #rgb/#rrggbb (alpha ignored), rgb()/rgba(), hsl()/hsla() and oklch().

function clamp01(value) {
    return Math.min(1, Math.max(0, value));
}

function parseNumberList(body) {
    return body.replace(/\//g, ' ').replace(/,/g, ' ').trim().split(/\s+/);
}

function parseChannel(token, scale = 255) {
    return token.endsWith('%') ? (parseFloat(token) / 100) : parseFloat(token) / scale;
}

function hslToRgb(h, s, l) {
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
        const k = (n + h / 30) % 12;
        return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return [f(0), f(8), f(4)];
}

function oklchToRgb(L, C, H) {
    const hr = (H * Math.PI) / 180;
    const a = C * Math.cos(hr);
    const b = C * Math.sin(hr);
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    const l = l_ ** 3;
    const m = m_ ** 3;
    const s = s_ ** 3;
    const linear = [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ];
    return linear.map((channel) => {
        const value = clamp01(channel);
        return value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
    });
}

function parseColor(input) {
    const text = String(input).trim().toLowerCase();
    let match = /^#([0-9a-f]{3,8})$/.exec(text);
    if (match) {
        let hex = match[1];
        if (hex.length === 3 || hex.length === 4) hex = [...hex.slice(0, 3)].map((digit) => digit + digit).join('');
        hex = hex.slice(0, 6);
        return [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
    }
    match = /^rgba?\((.+)\)$/.exec(text);
    if (match) return parseNumberList(match[1]).slice(0, 3).map((token) => parseChannel(token));
    match = /^hsla?\((.+)\)$/.exec(text);
    if (match) {
        const [h, s, l] = parseNumberList(match[1]);
        return hslToRgb(parseFloat(h), parseFloat(s) / 100, parseFloat(l) / 100);
    }
    match = /^oklch\((.+)\)$/.exec(text);
    if (match) {
        const [L, C, H] = parseNumberList(match[1]);
        return oklchToRgb(L.endsWith('%') ? parseFloat(L) / 100 : parseFloat(L), parseFloat(C), parseFloat(H) || 0);
    }
    throw new Error(`Unsupported color: ${input}`);
}

function luminance([r, g, b]) {
    const linear = (channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

export function contrastRatio(first, second) {
    const [lighter, darker] = [luminance(parseColor(first)), luminance(parseColor(second))].sort((a, b) => b - a);
    return (lighter + 0.05) / (darker + 0.05);
}

const colors = process.argv.slice(2);
if (colors.length < 2) {
    console.log('Usage: node scripts/contrast.mjs <color> <color> [more colors...]');
    process.exit(1);
}
for (let i = 0; i < colors.length; i += 1) {
    for (let j = i + 1; j < colors.length; j += 1) {
        const ratio = contrastRatio(colors[i], colors[j]);
        const verdict = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA large text / UI only' : 'FAIL';
        console.log(`${colors[i]}  vs  ${colors[j]}  →  ${ratio.toFixed(2)}:1  ${verdict}`);
    }
}

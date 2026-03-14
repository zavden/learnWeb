import path from 'path';

export const VIRTUAL_NAMESPACE = 'learncode-virtual';
export const VIRTUAL_ENTRY = '__learncode_entry__';
export const VIRTUAL_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.html', '.css', '.scss', '.sass', '.json', '.vue'];
export const INLINE_NAMESPACE = 'learncode-inline';

export function createCompileDiagnostic(level, code, message, details = {}) {
    return { level, code, message, ...details };
}

export function normalizeSourcePath(value = '', fallback = 'source.js') {
    const normalized = normalizeVirtualPath(value);
    return normalized || fallback;
}

export function normalizeVirtualPath(value = '') {
    return String(value)
        .trim()
        .replaceAll('\\', '/')
        .replace(/^\.\/+/, '')
        .replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/');
}

export function hasDiagnosticCode(diagnostics = [], code = '') {
    return diagnostics.some((diagnostic) => diagnostic.code === code);
}

export function inferLoader(language = '') {
    switch (language) {
        case 'tsx':
            return 'tsx';
        case 'jsx':
            return 'jsx';
        case 'typescript':
        case 'ts':
            return 'ts';
        case 'javascript':
        case 'js':
            return 'js';
        case 'css':
        case 'scss':
        case 'sass':
            return 'css';
        case 'json':
            return 'json';
        default:
            return 'js';
    }
}

export function getBlockBySlot(sourceDocument, slot) {
    return (sourceDocument?.blocks || []).find((block) => block.slot === slot) || null;
}

export function getFileBySlot(sourceDocument, slot) {
    return (sourceDocument?.files || []).find((file) => file.slot === slot) || null;
}

// Small helpers shared by the compilers in this folder (and src/utils/exampleCompiler.ts): diagnostic
// construction, virtual path normalization, esbuild loader choice and block/file lookup by slot.
// Runs under Node only (the compilers are never bundled for the browser).

import type { Loader } from 'esbuild';
import type { CompileSourceDocument } from '../../types/compile.ts';
import type { Diagnostic, DiagnosticDetails, DiagnosticLevel } from '../../types/diagnostics.ts';
import type { BlockSlot, ExampleBlock, VirtualFile } from '../../types/document.ts';

/** esbuild namespace of the files of a multi-file project; it prefixes the file names in build errors. */
export const VIRTUAL_NAMESPACE = 'learncode-virtual';
/** Entry point name of multi-file builds; `createVirtualFilesPlugin()` maps it to the project's `entry` file. */
export const VIRTUAL_ENTRY = '__learncode_entry__';
/** Extensions tried, in this order, for an import without one (`./App` → `./App.tsx`, then `./App/index.tsx`…). */
export const VIRTUAL_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.html', '.css', '.scss', '.sass', '.json', '.vue'];
/** esbuild namespace of the in-memory modules of single-file React/Vue builds. */
export const INLINE_NAMESPACE = 'learncode-inline';

/** A compile diagnostic: `level`, `code` and `message` first, then the details in the order given. */
export function createCompileDiagnostic(
    level: DiagnosticLevel,
    code: string,
    message: string,
    details: DiagnosticDetails = {},
): Diagnostic {
    return { level, code, message, ...details };
}

/** `normalizeVirtualPath(value)`, or `fallback` when that is empty. */
export function normalizeSourcePath(value: string = '', fallback: string = 'source.js'): string {
    const normalized = normalizeVirtualPath(value);
    return normalized || fallback;
}

/** A project-relative path: trimmed, forward slashes, no leading `./` or `/`, no repeated `/`. */
export function normalizeVirtualPath(value: string = ''): string {
    return String(value)
        .trim()
        .replaceAll('\\', '/')
        .replace(/^\.\/+/, '')
        .replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/');
}

/** Whether one of `diagnostics` has this `code` (used to report a problem only once). */
export function hasDiagnosticCode(diagnostics: readonly Diagnostic[] = [], code: string = ''): boolean {
    return diagnostics.some((diagnostic) => diagnostic.code === code);
}

/** esbuild loader for a file language (or extension-like name); Sass is expected to be compiled to CSS already. */
export function inferLoader(language: string = ''): Loader {
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

/** The first legacy block in `slot`, or `null` (virtual-files documents have no blocks). */
export function getBlockBySlot(
    sourceDocument: CompileSourceDocument | null | undefined,
    slot: BlockSlot,
): ExampleBlock | null {
    return (sourceDocument?.blocks || []).find((block) => block.slot === slot) || null;
}

/** The first file of a legacy block in `slot` (its `path` names the block in diagnostics and stack traces), or `null`. */
export function getFileBySlot(
    sourceDocument: CompileSourceDocument | null | undefined,
    slot: BlockSlot,
): VirtualFile | null {
    return (sourceDocument?.files || []).find((file) => file.slot === slot) || null;
}

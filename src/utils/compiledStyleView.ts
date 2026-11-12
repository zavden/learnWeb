// Read-only views of what the Sass compiler produced, so Sass lessons can show the generated CSS
// and the @debug/@warn/error output next to the source (theory code embeds and the editor preview).
// TypeScript examples get the same treatment for the JavaScript they compile to (`compiled.js`).
// Used by src/components/Preview.ts (the «CSS» panel over the preview), src/utils/theoryExerciseEmbeds.ts
// (extra code-embed tabs) and scripts/snapshot-material.ts. Reads the `CompileResult` of
// src/utils/exampleCompiler.ts: the Sass diagnostics come from src/utils/compiler/styleCompiler.ts.

import type { CompileResult } from '../types/compile.ts';
import type { Diagnostic, SassStackFrame } from '../types/diagnostics.ts';
import type { ExampleDocumentInput, LineHighlight, VirtualFile } from '../types/document.ts';
import type { TheoryCodeFile } from '../types/theory.ts';

/** A generated, read-only code tab (`compiled.css`, `sass-output.txt`, `compiled.js`). */
export interface GeneratedCodeFile extends TheoryCodeFile {
    generated: true;
    /** Always empty. */
    highlights: LineHighlight[];
    language: 'css' | 'text' | 'javascript';
}

/** Label of each diagnostic code shown in the Sass output; other diagnostics are not shown. */
const SASS_MESSAGE_LABELS: Readonly<Record<string, string | undefined>> = {
    'compile-out-of-memory': 'Error',
    'compile-timeout': 'Error',
    'compile-worker-crashed': 'Error',
    'sass-compile-error': 'Error',
    'sass-debug': '@debug',
    'sass-deprecation': 'Deprecation warning',
    'sass-warning': '@warn',
};

// Failures that leave the page without CSS: Sass errors and the isolated compiler stopping a job
// (an endless @while hits the timeout or the memory limit).
const COMPILE_FAILURE_CODES = new Set(['compile-out-of-memory', 'compile-timeout', 'compile-worker-crashed', 'sass-compile-error']);

/** Path (and name) of the generated CSS tab. */
export const COMPILED_CSS_PATH = 'compiled.css';
/** Path (and name) of the generated JavaScript tab of TypeScript examples. */
export const COMPILED_JS_PATH = 'compiled.js';
/** Path (and name) of the Sass messages tab. */
export const SASS_OUTPUT_PATH = 'sass-output.txt';

/** The SCSS/Sass file of a legacy example's style slot, or `null`. */
export function getPreprocessedStyleFile(documentModel: ExampleDocumentInput | null | undefined): VirtualFile | null {
    const files = Array.isArray(documentModel?.files) ? documentModel.files : [];
    return files.find((file): file is VirtualFile => file?.slot === 'style' && (file.language === 'scss' || file.language === 'sass')) || null;
}

/**
 * The Sass messages (and isolated-compiler failures) among `diagnostics`, formatted for `sass-output.txt`:
 * one entry per message, like the Sass command line: "styles.scss:4 @debug: 12px". Messages raised
 * inside a mixin/function are followed by their call stack, as the CLI prints it:
 * ```
 *     styles.scss 1:30  breakpoint()
 *     styles.scss 3:3   root stylesheet
 * ```
 */
export function formatSassMessages(diagnostics: readonly Diagnostic[] = [], fileName: string = 'styles.scss'): string[] {
    return (Array.isArray(diagnostics) ? diagnostics : [])
        .filter((diagnostic) => SASS_MESSAGE_LABELS[diagnostic?.code])
        .map((diagnostic) => {
            const where = diagnostic.line ? `${fileName}:${diagnostic.line}` : fileName;
            const message = String(diagnostic.message || '')
                .replace(/^@debug:\s*/, '')
                .replace(/\s*\(line \d+, column \d+\)$/, '')
                .trim();
            const frames: SassStackFrame[] = Array.isArray(diagnostic.stack) ? diagnostic.stack : [];
            const width = Math.max(0, ...frames.map((frame) => `${frame.line}:${frame.column}`.length));
            const stackLines = frames.map((frame) => `    ${fileName} ${`${frame.line}:${frame.column}`.padEnd(width)}  ${frame.member}`);
            return [`${where} ${SASS_MESSAGE_LABELS[diagnostic.code]}: ${message}`, ...stackLines].join('\n');
        });
}

/** Whether the compile left the page without CSS (a Sass error, or the compiler stopped the job). */
export function hasSassCompileError(diagnostics: readonly Diagnostic[] = []): boolean {
    return (Array.isArray(diagnostics) ? diagnostics : []).some((diagnostic) => COMPILE_FAILURE_CODES.has(diagnostic?.code));
}

/**
 * Generated code files for a Sass example: the compiled CSS (when it compiled) and the compiler
 * messages (when there are any). Returns [] for examples without a SCSS/SASS block.
 */
export function buildCompiledStyleFiles(documentModel: ExampleDocumentInput | null | undefined, compileResult: CompileResult | null | undefined): GeneratedCodeFile[] {
    const styleFile = getPreprocessedStyleFile(documentModel);
    if (!styleFile || !compileResult) return [];

    const diagnostics = compileResult.compileDiagnostics || [];
    const files: GeneratedCodeFile[] = [];
    if (!hasSassCompileError(diagnostics)) {
        const css = String(compileResult.compiledDocument?.css || '').trim();
        files.push({
            content: css || '/* El código Sass no generó ninguna regla CSS. */',
            generated: true,
            highlights: [],
            language: 'css',
            name: COMPILED_CSS_PATH,
            path: COMPILED_CSS_PATH,
        });
    }

    const messages = formatSassMessages(diagnostics, styleFile.name || styleFile.path || 'styles.scss');
    if (messages.length > 0) {
        files.push({
            content: messages.join('\n'),
            generated: true,
            highlights: [],
            language: 'text',
            name: SASS_OUTPUT_PATH,
            path: SASS_OUTPUT_PATH,
        });
    }
    return files;
}

/** The TypeScript file of a legacy example's script slot, or `null`. */
export function getTypeScriptFile(documentModel: ExampleDocumentInput | null | undefined): VirtualFile | null {
    const files = Array.isArray(documentModel?.files) ? documentModel.files : [];
    return files.find((file): file is VirtualFile => file?.slot === 'script' && file.language === 'typescript') || null;
}

/**
 * The JavaScript a TypeScript example compiles to (types erased; `enum` and parameter properties
 * become real code). Returns [] for other examples or when the TypeScript has syntax errors.
 */
export function buildCompiledScriptFiles(documentModel: ExampleDocumentInput | null | undefined, compileResult: CompileResult | null | undefined): GeneratedCodeFile[] {
    if (!getTypeScriptFile(documentModel) || !compileResult) return [];
    const js = String(compileResult.compiledDocument?.jsView || '').trimEnd();
    if (!js) return [];
    return [{
        content: `${js}\n`,
        generated: true,
        highlights: [],
        language: 'javascript',
        name: COMPILED_JS_PATH,
        path: COMPILED_JS_PATH,
    }];
}

/**
 * `codeFiles` with `generatedFiles` inserted right after the file at `styleFilePath` (the Sass or
 * TypeScript source tab), or appended when it is not there. Returns `codeFiles` itself when there is
 * nothing to insert.
 */
export function withCompiledStyleFiles<F extends { path: string }, G extends { path: string }>(
    codeFiles: F[] = [],
    styleFilePath: string = '',
    generatedFiles: G[] = [],
): (F | G)[] {
    if (generatedFiles.length === 0) return codeFiles;
    const index = codeFiles.findIndex((file) => file.path === styleFilePath);
    if (index === -1) return [...codeFiles, ...generatedFiles];
    return [...codeFiles.slice(0, index + 1), ...generatedFiles, ...codeFiles.slice(index + 1)];
}

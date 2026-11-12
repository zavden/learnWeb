// Script step of plain examples (called by src/utils/exampleCompiler.ts):
// - JavaScript: syntax check (syntaxCheck.ts, as Chrome would report it), loop guards, `//# sourceURL=`;
// - TypeScript: `ts.transpileModule` (strict mode, ES2022, inline source map), loop guards, type check
//   (typeChecker.ts; non-blocking `typescript-type` warnings/errors, skipped with `typecheck: false`) and
//   `jsView`, the JavaScript as a learner would see it from `tsc` (the read-only `compiled.js` tab).
// Loop guards are only inserted into code that parses, so they never move a real syntax error.

import ts from 'typescript';
import type { Diagnostic } from '../../types/diagnostics.ts';
import { errorMessage } from '../errors.ts';
import { createCompileDiagnostic, normalizeSourcePath } from './helpers.ts';
import { addLoopGuards } from './loopGuard.ts';
import { checkJavaScriptSyntax } from './syntaxCheck.ts';
import { typeCheckTypeScript } from './typeChecker.ts';
import type { CompilerBlock } from './types.ts';

/** `compileScript()` output. */
export interface ScriptCompileResult {
    /**
     * The code to run: loop-guarded unless disabled, with `//# sourceURL=<path>` (JavaScript) or an inline
     * source map (TypeScript). JavaScript with syntax errors is returned as written.
     */
    js: string;
    /**
     * TypeScript only: the transpiled code without loop guards or source map (`''` when it has syntax
     * errors). Absent for JavaScript.
     */
    jsView?: string;
    diagnostics: Diagnostic[];
}

/** `compileScript()` options. */
export interface CompileScriptOptions {
    /** Document path of the script (`script.js`, `script.ts`): names it in diagnostics and stack traces. */
    sourcePath?: string;
    /** Insert infinite-loop guards (default `true`; `loop_protect: false` turns it off). */
    loopProtect?: boolean;
    /** Type-check TypeScript (default `true`; `typecheck: false` turns it off). */
    typeCheck?: boolean;
}

interface GuardLoopsOptions {
    enabled: boolean;
    fileName: string;
    scriptKind: ts.ScriptKind;
}

function formatTsDiagnostic(diagnostic: ts.Diagnostic): string {
    return ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
}

function appendSourceUrl(js: string = '', sourcePath: string = ''): string {
    if (!js || !sourcePath) return js || '';
    if (/sourceURL=|sourceMappingURL=/i.test(js)) return js;
    return `${js}\n//# sourceURL=${sourcePath}`;
}

function guardLoops(source: string, { enabled, fileName, scriptKind }: GuardLoopsOptions): string {
    if (!enabled) return source;
    try {
        return addLoopGuards(source, { fileName, scriptKind }).code;
    } catch {
        // Never block a run because the guard could not be inserted.
        return source;
    }
}

function compileJavaScript(block: CompilerBlock, { sourcePath, loopProtect }: { sourcePath: string; loopProtect: boolean }): ScriptCompileResult {
    const filePath = normalizeSourcePath(sourcePath, 'script.js');
    const source = block.content || '';
    const syntaxDiagnostics = checkJavaScriptSyntax(source, { fileName: filePath });

    const diagnostics = syntaxDiagnostics.map((diagnostic) => createCompileDiagnostic(
        'error',
        'javascript-syntax',
        /^SyntaxError\b/.test(diagnostic.message) ? diagnostic.message : `SyntaxError: ${diagnostic.message}`,
        {
            column: diagnostic.column,
            file: filePath,
            line: diagnostic.line,
            slot: 'script',
            type: 'javascript',
        }
    ));

    // Inserting guards into code that does not parse could move the real error around.
    const code = syntaxDiagnostics.length === 0
        ? guardLoops(source, { enabled: loopProtect, fileName: filePath, scriptKind: ts.ScriptKind.JS })
        : source;

    return {
        js: appendSourceUrl(code, filePath),
        diagnostics,
    };
}

function compileTypeScript(block: CompilerBlock, { sourcePath, loopProtect, typeCheck }: Required<CompileScriptOptions>): ScriptCompileResult {
    const filePath = normalizeSourcePath(sourcePath, 'script.ts');
    const source = block.content || '';
    const transpileOptions: ts.TranspileOptions = {
        compilerOptions: {
            // Like `tsc --strict`: scripts without imports/exports get "use strict" (modules already are),
            // so the code runs with the semantics the type checker assumes (writes to frozen objects throw…).
            alwaysStrict: true,
            inlineSourceMap: true,
            inlineSources: true,
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
            useDefineForClassFields: true,
        },
        fileName: filePath,
        reportDiagnostics: true,
    };

    const syntaxCheck = ts.transpileModule(source, transpileOptions);
    const syntaxDiagnostics = syntaxCheck.diagnostics || [];
    const guardedSource = syntaxDiagnostics.length === 0
        ? guardLoops(source, { enabled: loopProtect, fileName: filePath, scriptKind: ts.ScriptKind.TS })
        : source;
    const result = guardedSource === source
        ? syntaxCheck
        : ts.transpileModule(guardedSource, transpileOptions);

    const diagnostics = syntaxDiagnostics.map((diagnostic) => {
        const sourceFile = diagnostic.file;
        const start = typeof diagnostic.start === 'number' ? diagnostic.start : null;
        const position = sourceFile && start != null ? sourceFile.getLineAndCharacterOfPosition(start) : null;

        return createCompileDiagnostic(
            diagnostic.category === ts.DiagnosticCategory.Warning ? 'warning' : 'error',
            'typescript-transpile',
            formatTsDiagnostic(diagnostic),
            {
                column: position ? position.character + 1 : null,
                file: filePath,
                line: position ? position.line + 1 : null,
                slot: 'script',
                type: 'typescript',
            }
        );
    });

    if (typeCheck && syntaxDiagnostics.length === 0) {
        try {
            for (const diagnostic of typeCheckTypeScript(source, { sourcePath: filePath })) {
                diagnostics.push(createCompileDiagnostic(
                    diagnostic.warning ? 'warning' : 'error',
                    'typescript-type',
                    `TS${diagnostic.code}: ${diagnostic.message}`,
                    {
                        // Like `tsc`, type errors are reported but the JavaScript still runs.
                        blocking: false,
                        column: diagnostic.column,
                        file: filePath,
                        line: diagnostic.line,
                        slot: 'script',
                        type: 'typescript',
                    }
                ));
            }
        } catch (error) {
            diagnostics.push(createCompileDiagnostic(
                'warning',
                'typescript-typecheck-failed',
                `Type checking failed: ${errorMessage(error)}`,
                { blocking: false, slot: 'script', type: 'typescript' }
            ));
        }
    }

    return {
        js: result.outputText || '',
        // The JavaScript TypeScript generates, as a learner would see it from `tsc`: no loop guards and
        // no inline source map (theory code embeds show it in a `compiled.js` tab).
        jsView: syntaxDiagnostics.length === 0 ? stripSourceMapComment(syntaxCheck.outputText) : '',
        diagnostics,
    };
}

function stripSourceMapComment(code: string = ''): string {
    return String(code || '').replace(/\n?\/\/# sourceMappingURL=\S*\s*$/, '\n');
}

/**
 * Compiles the script block of a plain example (`javascript` or `typescript`); `null` (no script block)
 * gives empty output, any other block type an `unsupported-script-compiler` error.
 */
export function compileScript(block: CompilerBlock | null, { sourcePath = '', loopProtect = true, typeCheck = true }: CompileScriptOptions = {}): ScriptCompileResult {
    if (!block) {
        return {
            js: '',
            diagnostics: [],
        };
    }

    if (block.type === 'javascript') {
        return compileJavaScript(block, { loopProtect, sourcePath });
    }

    if (block.type === 'typescript') {
        return compileTypeScript(block, { loopProtect, sourcePath, typeCheck });
    }

    return {
        js: '',
        diagnostics: [
            createCompileDiagnostic(
                'error',
                'unsupported-script-compiler',
                `No compiler available for script type "${block.type}".`,
                { slot: 'script', type: block.type }
            ),
        ],
    };
}

// Markup step of plain examples (called by src/utils/exampleCompiler.ts): HTML and SVG pass through,
// HTML-FULL becomes `fullDocumentHtml`, Pug is rendered with pug. Inline `<script>` loops then get the
// infinite-loop guards of loopGuard.ts (without changing the line count) unless `loopProtect` is false.

import pug from 'pug';
import type { Diagnostic } from '../../types/diagnostics.ts';
import { createCompileDiagnostic } from './helpers.ts';
import { addLoopGuardsToHtml } from './loopGuard.ts';
import type { CompilerBlock } from './types.ts';

/** `compileMarkup()` output. */
export interface MarkupCompileResult {
    /** Body markup: HTML/SVG as written or the rendered Pug; `''` for HTML-FULL and on errors. */
    html: string;
    /** The HTML-FULL document; `''` for every other markup type. */
    fullDocumentHtml: string;
    diagnostics: Diagnostic[];
}

/** `compileMarkup()` options. */
export interface CompileMarkupOptions {
    /** Add infinite-loop guards to inline scripts (default `true`; `loop_protect: false` turns it off). */
    loopProtect?: boolean;
}

/** What pug attaches to the errors it throws: 1-based `line`/`column` and the bare message in `msg`. */
interface PugCompileError extends Error {
    msg?: string;
    line?: number;
    column?: number;
}

/** Compiles the markup block of a plain example; `null` (no markup block) gives empty output. */
export function compileMarkup(
    block: CompilerBlock | null,
    { loopProtect = true }: CompileMarkupOptions = {},
): MarkupCompileResult {
    const result = compileMarkupSource(block);
    if (!loopProtect) return result;
    return {
        ...result,
        fullDocumentHtml: result.fullDocumentHtml
            ? addLoopGuardsToHtml(result.fullDocumentHtml)
            : result.fullDocumentHtml,
        html: result.html ? addLoopGuardsToHtml(result.html) : result.html,
    };
}

function compileMarkupSource(block: CompilerBlock | null): MarkupCompileResult {
    if (!block) {
        return {
            html: '',
            fullDocumentHtml: '',
            diagnostics: [],
        };
    }

    if (block.type === 'html' || block.type === 'svg') {
        return {
            html: block.content || '',
            fullDocumentHtml: '',
            diagnostics: [],
        };
    }

    if (block.type === 'html-full') {
        return {
            html: '',
            fullDocumentHtml: block.content || '',
            diagnostics: [],
        };
    }

    if (block.type === 'pug') {
        try {
            return {
                html: pug.render(block.content || '', {
                    doctype: 'html',
                }),
                fullDocumentHtml: '',
                diagnostics: [],
            };
        } catch (caught) {
            const error = caught as PugCompileError | null;
            const line = Number.isFinite(error?.line) ? error!.line : null;
            const column = Number.isFinite(error?.column) ? error!.column : null;
            const message = String(error?.msg || error?.message || 'Failed to compile Pug.').trim();
            return {
                html: '',
                fullDocumentHtml: '',
                diagnostics: [
                    createCompileDiagnostic(
                        'error',
                        'pug-compile-error',
                        line ? `${message} (line ${line}${column ? `, column ${column}` : ''})` : message,
                        { column, line, slot: 'markup', type: 'pug' },
                    ),
                ],
            };
        }
    }

    return {
        html: '',
        fullDocumentHtml: '',
        diagnostics: [
            createCompileDiagnostic(
                'error',
                'unsupported-markup-compiler',
                `No compiler available for markup type "${block.type}".`,
                { slot: 'markup', type: block.type },
            ),
        ],
    };
}

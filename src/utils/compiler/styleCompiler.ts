// Style step of plain examples and of the React/Vue single-file compilers: CSS passes through, SCSS and
// the indented Sass syntax are compiled with Dart Sass (`sass.compileString`, expanded output).
// `@debug`, `@warn` and deprecation messages become non-blocking warnings (at most 20 per block) with the
// Sass call stack when they come from inside a mixin/function; src/utils/compiledStyleView.ts prints them
// like the Sass command line. Errors in multi-file projects are handled by the React/Vue compilers.

import * as sass from 'sass';
import type { Diagnostic, SassStackFrame } from '../../types/diagnostics.ts';
import { createCompileDiagnostic } from './helpers.ts';
import type { CompilerBlock } from './types.ts';

/** `compileStyle()` output. */
export interface StyleCompileResult {
    /** The CSS; `''` when Sass failed or there is no style block. */
    css: string;
    /** Sass messages (warnings), then the compile error if any. */
    diagnostics: Diagnostic[];
}

/** The start of a Sass span (0-based line and column): a real `SourceSpan` or one rebuilt by `spanFromStack()`. */
interface SpanStart {
    start?: Pick<sass.SourceLocation, 'line' | 'column'>;
}

/**
 * What a failed `sass.compileString()` throws: a `sass.Exception` (`sassMessage`, `sassStack`, `span`).
 * Partial because an internal error would be a plain `Error`.
 */
type SassFailure = Partial<sass.Exception> | null | undefined;

/** The 1-based position of a span, or `{}` without one. */
function spanLocation(span: SpanStart | null | undefined): Pick<Diagnostic, 'column' | 'line'> {
    const start = span?.start;
    if (!start || !Number.isFinite(start.line)) return {};
    return {
        column: Number.isFinite(start.column) ? start.column + 1 : null,
        line: start.line + 1,
    };
}

// `@warn` messages come without a span; their stack trace looks like "- 3:1  root stylesheet".
function spanFromStack(stack: string = ''): SpanStart | null {
    const match = /(\d+):(\d+)\s+root stylesheet/.exec(String(stack || ''));
    if (!match) return null;
    return { start: { column: Number(match[2]) - 1, line: Number(match[1]) - 1 } };
}

// Dart Sass call stacks look like "- 1:30  bp()\n- 3:3   root stylesheet". Kept only when the message
// comes from inside a mixin/function (more than one frame), so the learner can see where it was called.
function parseSassStack(stack: string = ''): SassStackFrame[] {
    const frames = (
        String(stack || '')
            .split('\n')
            .map((line) => /^-?\s*(\d+):(\d+)\s+(.+?)\s*$/.exec(line.trim()))
            .filter(Boolean) as RegExpExecArray[]
    ).map(([, line, column, member]) => ({ column: Number(column), line: Number(line), member }));
    return frames.length > 1 ? frames : [];
}

function formatSassErrorMessage(error: SassFailure): string {
    // `error.message` embeds an ascii-art excerpt of the source; the editor already shows the line.
    const message = String(error?.sassMessage || error?.message || 'Failed to compile style block.').trim();
    const location = spanLocation(error?.span);
    return location.line ? `${message} (line ${location.line}, column ${location.column})` : message;
}

/** Compiles a style block; `null` (no style block) gives empty output. */
export function compileStyle(block: CompilerBlock | null): StyleCompileResult {
    if (!block) {
        return {
            css: '',
            diagnostics: [],
        };
    }

    if (block.type === 'css') {
        return {
            css: block.content || '',
            diagnostics: [],
        };
    }

    if (block.type === 'scss' || block.type === 'sass') {
        const warnings: Diagnostic[] = [];
        const pushLoggedMessage = (
            code: string,
            message: string,
            span: SpanStart | null | undefined,
            stack: string = '',
        ): void => {
            if (warnings.length >= 20) return;
            const frames = parseSassStack(stack);
            warnings.push(
                createCompileDiagnostic('warning', code, String(message || '').trim(), {
                    blocking: false,
                    slot: 'style',
                    type: block.type,
                    ...spanLocation(span),
                    ...(frames.length ? { stack: frames } : {}),
                }),
            );
        };

        try {
            const result = sass.compileString(block.content || '', {
                logger: {
                    debug: (message: string, { span }: { span?: sass.SourceSpan } = {}) =>
                        pushLoggedMessage('sass-debug', `@debug: ${message}`, span),
                    warn: (
                        message: string,
                        {
                            deprecation,
                            span,
                            stack,
                        }: { deprecation?: boolean; span?: sass.SourceSpan; stack?: string } = {},
                    ) =>
                        pushLoggedMessage(
                            deprecation ? 'sass-deprecation' : 'sass-warning',
                            message,
                            span || spanFromStack(stack),
                            stack,
                        ),
                },
                syntax: block.type === 'sass' ? 'indented' : 'scss',
                style: 'expanded',
            });

            return {
                css: result.css,
                diagnostics: warnings,
            };
        } catch (caught) {
            const error = caught as SassFailure;
            return {
                css: '',
                diagnostics: [
                    ...warnings,
                    createCompileDiagnostic('error', 'sass-compile-error', formatSassErrorMessage(error), {
                        slot: 'style',
                        type: block.type,
                        ...spanLocation(error?.span),
                        ...(parseSassStack(error?.sassStack).length ? { stack: parseSassStack(error?.sassStack) } : {}),
                    }),
                ],
            };
        }
    }

    return {
        css: '',
        diagnostics: [
            createCompileDiagnostic(
                'error',
                'unsupported-style-compiler',
                `No compiler available for style type "${block.type}".`,
                { slot: 'style', type: block.type },
            ),
        ],
    };
}

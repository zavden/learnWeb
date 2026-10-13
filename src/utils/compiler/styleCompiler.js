import * as sass from 'sass';
import { createCompileDiagnostic } from './helpers.js';

function spanLocation(span) {
    const start = span?.start;
    if (!start || !Number.isFinite(start.line)) return {};
    return {
        column: Number.isFinite(start.column) ? start.column + 1 : null,
        line: start.line + 1,
    };
}

// `@warn` messages come without a span; their stack trace looks like "- 3:1  root stylesheet".
function spanFromStack(stack = '') {
    const match = /(\d+):(\d+)\s+root stylesheet/.exec(String(stack || ''));
    if (!match) return null;
    return { start: { column: Number(match[2]) - 1, line: Number(match[1]) - 1 } };
}

// Dart Sass call stacks look like "- 1:30  bp()\n- 3:3   root stylesheet". Kept only when the message
// comes from inside a mixin/function (more than one frame), so the learner can see where it was called.
function parseSassStack(stack = '') {
    const frames = String(stack || '')
        .split('\n')
        .map((line) => /^-?\s*(\d+):(\d+)\s+(.+?)\s*$/.exec(line.trim()))
        .filter(Boolean)
        .map(([, line, column, member]) => ({ column: Number(column), line: Number(line), member }));
    return frames.length > 1 ? frames : [];
}

function formatSassErrorMessage(error) {
    // `error.message` embeds an ascii-art excerpt of the source; the editor already shows the line.
    const message = String(error?.sassMessage || error?.message || 'Failed to compile style block.').trim();
    const location = spanLocation(error?.span);
    return location.line ? `${message} (line ${location.line}, column ${location.column})` : message;
}

export function compileStyle(block) {
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
        const warnings = [];
        const pushLoggedMessage = (code, message, span, stack = '') => {
            if (warnings.length >= 20) return;
            const frames = parseSassStack(stack);
            warnings.push(createCompileDiagnostic(
                'warning',
                code,
                String(message || '').trim(),
                { blocking: false, slot: 'style', type: block.type, ...spanLocation(span), ...(frames.length ? { stack: frames } : {}) }
            ));
        };

        try {
            const result = sass.compileString(block.content || '', {
                logger: {
                    debug: (message, { span } = {}) => pushLoggedMessage('sass-debug', `@debug: ${message}`, span),
                    warn: (message, { deprecation, span, stack } = {}) => pushLoggedMessage(
                        deprecation ? 'sass-deprecation' : 'sass-warning',
                        message,
                        span || spanFromStack(stack),
                        stack
                    ),
                },
                syntax: block.type === 'sass' ? 'indented' : 'scss',
                style: 'expanded',
            });

            return {
                css: result.css,
                diagnostics: warnings,
            };
        } catch (error) {
            return {
                css: '',
                diagnostics: [
                    ...warnings,
                    createCompileDiagnostic(
                        'error',
                        'sass-compile-error',
                        formatSassErrorMessage(error),
                        {
                            slot: 'style',
                            type: block.type,
                            ...spanLocation(error?.span),
                            ...(parseSassStack(error?.sassStack).length ? { stack: parseSassStack(error?.sassStack) } : {}),
                        }
                    ),
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
                { slot: 'style', type: block.type }
            ),
        ],
    };
}

import pug from 'pug';
import { createCompileDiagnostic } from './helpers.js';
import { addLoopGuardsToHtml } from './loopGuard.js';

export function compileMarkup(block, { loopProtect = true } = {}) {
    const result = compileMarkupSource(block);
    if (!loopProtect) return result;
    return {
        ...result,
        fullDocumentHtml: result.fullDocumentHtml ? addLoopGuardsToHtml(result.fullDocumentHtml) : result.fullDocumentHtml,
        html: result.html ? addLoopGuardsToHtml(result.html) : result.html,
    };
}

function compileMarkupSource(block) {
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
        } catch (error) {
            const line = Number.isFinite(error?.line) ? error.line : null;
            const column = Number.isFinite(error?.column) ? error.column : null;
            const message = String(error?.msg || error?.message || 'Failed to compile Pug.').trim();
            return {
                html: '',
                fullDocumentHtml: '',
                diagnostics: [
                    createCompileDiagnostic(
                        'error',
                        'pug-compile-error',
                        line ? `${message} (line ${line}${column ? `, column ${column}` : ''})` : message,
                        { column, line, slot: 'markup', type: 'pug' }
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
                { slot: 'markup', type: block.type }
            ),
        ],
    };
}

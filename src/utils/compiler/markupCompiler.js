import pug from 'pug';
import { createCompileDiagnostic } from './helpers.js';

export function compileMarkup(block) {
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
            return {
                html: '',
                fullDocumentHtml: '',
                diagnostics: [
                    createCompileDiagnostic(
                        'error',
                        'pug-compile-error',
                        error.message || 'Failed to compile Pug.',
                        { slot: 'markup', type: 'pug' }
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

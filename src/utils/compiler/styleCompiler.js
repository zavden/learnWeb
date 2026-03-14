import * as sass from 'sass';
import { createCompileDiagnostic } from './helpers.js';

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
        try {
            const result = sass.compileString(block.content || '', {
                syntax: block.type === 'sass' ? 'indented' : 'scss',
                style: 'expanded',
            });

            return {
                css: result.css,
                diagnostics: [],
            };
        } catch (error) {
            return {
                css: '',
                diagnostics: [
                    createCompileDiagnostic(
                        'error',
                        'sass-compile-error',
                        error.message || 'Failed to compile style block.',
                        { slot: 'style', type: block.type }
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

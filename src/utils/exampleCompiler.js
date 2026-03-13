import pug from 'pug';
import * as sass from 'sass';
import ts from 'typescript';

function createCompileDiagnostic(level, code, message, details = {}) {
    return { level, code, message, ...details };
}

function formatTsDiagnostic(diagnostic) {
    return ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
}

function compileMarkup(block) {
    if (!block) {
        return {
            html: '',
            diagnostics: [],
        };
    }

    if (block.type === 'html' || block.type === 'svg') {
        return {
            html: block.content || '',
            diagnostics: [],
        };
    }

    if (block.type === 'pug') {
        try {
            return {
                html: pug.render(block.content || '', {
                    doctype: 'html',
                }),
                diagnostics: [],
            };
        } catch (error) {
            return {
                html: '',
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

function compileStyle(block) {
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

function compileScript(block) {
    if (!block) {
        return {
            js: '',
            diagnostics: [],
        };
    }

    if (block.type === 'javascript') {
        return {
            js: block.content || '',
            diagnostics: [],
        };
    }

    if (block.type === 'typescript') {
        const result = ts.transpileModule(block.content || '', {
            compilerOptions: {
                target: ts.ScriptTarget.ES2020,
                module: ts.ModuleKind.ES2020,
            },
            reportDiagnostics: true,
        });

        const diagnostics = (result.diagnostics || []).map((diagnostic) => createCompileDiagnostic(
            diagnostic.category === ts.DiagnosticCategory.Warning ? 'warning' : 'error',
            'typescript-transpile',
            formatTsDiagnostic(diagnostic),
            { slot: 'script', type: 'typescript' }
        ));

        return {
            js: result.outputText || '',
            diagnostics,
        };
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

function getBlockBySlot(sourceDocument, slot) {
    return (sourceDocument?.blocks || []).find((block) => block.slot === slot) || null;
}

export function compileExampleDocument(sourceDocument) {
    const markupBlock = getBlockBySlot(sourceDocument, 'markup');
    const styleBlock = getBlockBySlot(sourceDocument, 'style');
    const scriptBlock = getBlockBySlot(sourceDocument, 'script');

    const markupResult = compileMarkup(markupBlock);
    const styleResult = compileStyle(styleBlock);
    const scriptResult = compileScript(scriptBlock);

    return {
        compiledDocument: {
            html: markupResult.html,
            css: styleResult.css,
            js: scriptResult.js,
        },
        compileDiagnostics: [
            ...markupResult.diagnostics,
            ...styleResult.diagnostics,
            ...scriptResult.diagnostics,
        ],
    };
}

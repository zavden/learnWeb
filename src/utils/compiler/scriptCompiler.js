import ts from 'typescript';
import { createCompileDiagnostic, normalizeSourcePath } from './helpers.js';

function formatTsDiagnostic(diagnostic) {
    return ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
}

function appendSourceUrl(js = '', sourcePath = '') {
    if (!js || !sourcePath) return js || '';
    if (/sourceURL=|sourceMappingURL=/i.test(js)) return js;
    return `${js}\n//# sourceURL=${sourcePath}`;
}

export function compileScript(block, { sourcePath = '' } = {}) {
    if (!block) {
        return {
            js: '',
            diagnostics: [],
        };
    }

    if (block.type === 'javascript') {
        return {
            js: appendSourceUrl(block.content || '', normalizeSourcePath(sourcePath, 'script.js')),
            diagnostics: [],
        };
    }

    if (block.type === 'typescript') {
        const result = ts.transpileModule(block.content || '', {
            compilerOptions: {
                inlineSourceMap: true,
                inlineSources: true,
                target: ts.ScriptTarget.ES2020,
                module: ts.ModuleKind.ES2020,
            },
            fileName: normalizeSourcePath(sourcePath, 'script.ts'),
            reportDiagnostics: true,
        });

        const diagnostics = (result.diagnostics || []).map((diagnostic) => {
            const sourceFile = diagnostic.file;
            const start = typeof diagnostic.start === 'number' ? diagnostic.start : null;
            const position = sourceFile && start != null ? sourceFile.getLineAndCharacterOfPosition(start) : null;

            return createCompileDiagnostic(
                diagnostic.category === ts.DiagnosticCategory.Warning ? 'warning' : 'error',
                'typescript-transpile',
                formatTsDiagnostic(diagnostic),
                {
                    column: position ? position.character + 1 : null,
                    file: normalizeSourcePath(sourcePath, 'script.ts'),
                    line: position ? position.line + 1 : null,
                    slot: 'script',
                    type: 'typescript',
                }
            );
        });

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

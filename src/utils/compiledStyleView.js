// Read-only views of what the Sass compiler produced, so Sass lessons can show the generated CSS
// and the @debug/@warn/error output next to the source (theory code embeds and the editor preview).

const SASS_MESSAGE_LABELS = {
    'sass-compile-error': 'Error',
    'sass-debug': '@debug',
    'sass-deprecation': 'Deprecation warning',
    'sass-warning': '@warn',
};

export const COMPILED_CSS_PATH = 'compiled.css';
export const SASS_OUTPUT_PATH = 'sass-output.txt';

export function getPreprocessedStyleFile(documentModel) {
    const files = Array.isArray(documentModel?.files) ? documentModel.files : [];
    return files.find((file) => file?.slot === 'style' && (file.language === 'scss' || file.language === 'sass')) || null;
}

// One line per message, like the Sass command line: "styles.scss:4 @debug: 12px".
export function formatSassMessages(diagnostics = [], fileName = 'styles.scss') {
    return (Array.isArray(diagnostics) ? diagnostics : [])
        .filter((diagnostic) => SASS_MESSAGE_LABELS[diagnostic?.code])
        .map((diagnostic) => {
            const where = diagnostic.line ? `${fileName}:${diagnostic.line}` : fileName;
            const message = String(diagnostic.message || '')
                .replace(/^@debug:\s*/, '')
                .replace(/\s*\(line \d+, column \d+\)$/, '')
                .trim();
            return `${where} ${SASS_MESSAGE_LABELS[diagnostic.code]}: ${message}`;
        });
}

export function hasSassCompileError(diagnostics = []) {
    return (Array.isArray(diagnostics) ? diagnostics : []).some((diagnostic) => diagnostic?.code === 'sass-compile-error');
}

/**
 * Generated code files for a Sass example: the compiled CSS (when it compiled) and the compiler
 * messages (when there are any). Returns [] for examples without a SCSS/SASS block.
 */
export function buildCompiledStyleFiles(documentModel, compileResult) {
    const styleFile = getPreprocessedStyleFile(documentModel);
    if (!styleFile || !compileResult) return [];

    const diagnostics = compileResult.compileDiagnostics || [];
    const files = [];
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

// Inserts the generated files right after the Sass source tab.
export function withCompiledStyleFiles(codeFiles = [], styleFilePath = '', generatedFiles = []) {
    if (generatedFiles.length === 0) return codeFiles;
    const index = codeFiles.findIndex((file) => file.path === styleFilePath);
    if (index === -1) return [...codeFiles, ...generatedFiles];
    return [...codeFiles.slice(0, index + 1), ...generatedFiles, ...codeFiles.slice(index + 1)];
}

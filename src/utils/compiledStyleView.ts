// Read-only views of what the Sass compiler produced, so Sass lessons can show the generated CSS
// and the @debug/@warn/error output next to the source (theory code embeds and the editor preview).
// TypeScript examples get the same treatment for the JavaScript they compile to (`compiled.js`).

const SASS_MESSAGE_LABELS = {
    'compile-out-of-memory': 'Error',
    'compile-timeout': 'Error',
    'compile-worker-crashed': 'Error',
    'sass-compile-error': 'Error',
    'sass-debug': '@debug',
    'sass-deprecation': 'Deprecation warning',
    'sass-warning': '@warn',
};

// Failures that leave the page without CSS: Sass errors and the isolated compiler stopping a job
// (an endless @while hits the timeout or the memory limit).
const COMPILE_FAILURE_CODES = new Set(['compile-out-of-memory', 'compile-timeout', 'compile-worker-crashed', 'sass-compile-error']);

export const COMPILED_CSS_PATH = 'compiled.css';
export const COMPILED_JS_PATH = 'compiled.js';
export const SASS_OUTPUT_PATH = 'sass-output.txt';

export function getPreprocessedStyleFile(documentModel) {
    const files = Array.isArray(documentModel?.files) ? documentModel.files : [];
    return files.find((file) => file?.slot === 'style' && (file.language === 'scss' || file.language === 'sass')) || null;
}

// One line per message, like the Sass command line: "styles.scss:4 @debug: 12px". Messages raised
// inside a mixin/function are followed by their call stack, as the CLI prints it:
//     styles.scss 1:30  breakpoint()
//     styles.scss 3:3   root stylesheet
export function formatSassMessages(diagnostics = [], fileName = 'styles.scss') {
    return (Array.isArray(diagnostics) ? diagnostics : [])
        .filter((diagnostic) => SASS_MESSAGE_LABELS[diagnostic?.code])
        .map((diagnostic) => {
            const where = diagnostic.line ? `${fileName}:${diagnostic.line}` : fileName;
            const message = String(diagnostic.message || '')
                .replace(/^@debug:\s*/, '')
                .replace(/\s*\(line \d+, column \d+\)$/, '')
                .trim();
            const frames = Array.isArray(diagnostic.stack) ? diagnostic.stack : [];
            const width = Math.max(0, ...frames.map((frame) => `${frame.line}:${frame.column}`.length));
            const stackLines = frames.map((frame) => `    ${fileName} ${`${frame.line}:${frame.column}`.padEnd(width)}  ${frame.member}`);
            return [`${where} ${SASS_MESSAGE_LABELS[diagnostic.code]}: ${message}`, ...stackLines].join('\n');
        });
}

export function hasSassCompileError(diagnostics = []) {
    return (Array.isArray(diagnostics) ? diagnostics : []).some((diagnostic) => COMPILE_FAILURE_CODES.has(diagnostic?.code));
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

export function getTypeScriptFile(documentModel) {
    const files = Array.isArray(documentModel?.files) ? documentModel.files : [];
    return files.find((file) => file?.slot === 'script' && file.language === 'typescript') || null;
}

/**
 * The JavaScript a TypeScript example compiles to (types erased; `enum` and parameter properties
 * become real code). Returns [] for other examples or when the TypeScript has syntax errors.
 */
export function buildCompiledScriptFiles(documentModel, compileResult) {
    if (!getTypeScriptFile(documentModel) || !compileResult) return [];
    const js = String(compileResult.compiledDocument?.jsView || '').trimEnd();
    if (!js) return [];
    return [{
        content: `${js}\n`,
        generated: true,
        highlights: [],
        language: 'javascript',
        name: COMPILED_JS_PATH,
        path: COMPILED_JS_PATH,
    }];
}

// Inserts the generated files right after the Sass source tab.
export function withCompiledStyleFiles(codeFiles = [], styleFilePath = '', generatedFiles = []) {
    if (generatedFiles.length === 0) return codeFiles;
    const index = codeFiles.findIndex((file) => file.path === styleFilePath);
    if (index === -1) return [...codeFiles, ...generatedFiles];
    return [...codeFiles.slice(0, index + 1), ...generatedFiles, ...codeFiles.slice(index + 1)];
}

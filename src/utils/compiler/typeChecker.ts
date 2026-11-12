import ts from 'typescript';

// Type-checks a single TypeScript script block the way `tsc --strict` would, against the
// ES2023 + DOM libraries. A language service keeps the parsed lib files cached, so only the
// first check pays the cost of loading lib.dom.d.ts (~200ms); later checks take a few ms.

const ROOT = '/__learnweb__';
const AMBIENT_FILE = `${ROOT}/learnweb-ambient.d.ts`;
// Module resolution is not available in the preview, so any import is typed as `any`.
const AMBIENT_SOURCE = "declare module '*';\n";

const COMPILER_OPTIONS = {
    lib: ['lib.es2023.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
    module: ts.ModuleKind.ESNext,
    // Every example runs in its own scope, so top-level names like `name` or `status`
    // must not clash with the DOM globals declared in lib.dom.d.ts.
    moduleDetection: ts.ModuleDetectionKind.Force,
    noEmit: true,
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ES2022,
    types: [],
    useDefineForClassFields: true,
};

let service = null;
let currentFileName = '';
let currentSource = '';
let currentVersion = 0;
const libSnapshots = new Map();

function readLibSnapshot(fileName) {
    if (libSnapshots.has(fileName)) return libSnapshots.get(fileName);
    const text = ts.sys.fileExists(fileName) ? ts.sys.readFile(fileName) : undefined;
    const snapshot = text == null ? undefined : ts.ScriptSnapshot.fromString(text);
    libSnapshots.set(fileName, snapshot);
    return snapshot;
}

function getService() {
    if (service) return service;

    const host = {
        directoryExists: (dirName) => dirName === ROOT || ts.sys.directoryExists(dirName),
        fileExists: (fileName) => fileName === currentFileName || fileName === AMBIENT_FILE || ts.sys.fileExists(fileName),
        getCompilationSettings: () => COMPILER_OPTIONS,
        getCurrentDirectory: () => ROOT,
        getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
        getDirectories: () => [],
        getScriptFileNames: () => [currentFileName, AMBIENT_FILE],
        getScriptSnapshot: (fileName) => {
            if (fileName === currentFileName) return ts.ScriptSnapshot.fromString(currentSource);
            if (fileName === AMBIENT_FILE) return ts.ScriptSnapshot.fromString(AMBIENT_SOURCE);
            return readLibSnapshot(fileName);
        },
        getScriptVersion: (fileName) => (fileName === currentFileName ? String(currentVersion) : '1'),
        readFile: (fileName) => {
            if (fileName === currentFileName) return currentSource;
            if (fileName === AMBIENT_FILE) return AMBIENT_SOURCE;
            return ts.sys.readFile(fileName);
        },
    };

    service = ts.createLanguageService(host, ts.createDocumentRegistry());
    return service;
}

function toVirtualFileName(sourcePath = 'script.ts') {
    const baseName = String(sourcePath || 'script.ts').split('/').pop() || 'script.ts';
    return `${ROOT}/${/\.tsx?$/i.test(baseName) ? baseName : `${baseName}.ts`}`;
}

export function typeCheckTypeScript(source = '', { sourcePath = 'script.ts' } = {}) {
    currentFileName = toVirtualFileName(sourcePath);
    currentSource = String(source ?? '');
    currentVersion += 1;

    const languageService = getService();
    // Syntax errors are already reported by the transpiler, so only semantic ones are collected.
    return languageService.getSemanticDiagnostics(currentFileName)
        .filter((diagnostic) => diagnostic.file?.fileName === currentFileName)
        .map((diagnostic) => {
            const position = typeof diagnostic.start === 'number'
                ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
                : null;
            return {
                code: diagnostic.code,
                column: position ? position.character + 1 : null,
                line: position ? position.line + 1 : null,
                message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
                warning: diagnostic.category === ts.DiagnosticCategory.Warning
                    || diagnostic.category === ts.DiagnosticCategory.Suggestion,
            };
        });
}

import ts from 'typescript';
import type { SyntaxDiagnostic } from './types.ts';

// Inserts a time-based guard into every loop of a learner's script so an accidental infinite
// loop (very easy to create while typing, since the preview re-renders on every pause) stops
// after a short while instead of freezing the app and heating the machine.
//
// Every insertion stays on the line of the loop it belongs to, and the guard helper is appended
// as one extra line after the learner's code, so error line numbers and source maps keep pointing
// at the learner's own lines.
//
// Used by scriptCompiler.ts (script blocks) and markupCompiler.ts (inline <script> tags, through
// `addLoopGuardsToHtml`); syntaxCheck.ts reuses `getSyntaxDiagnostics` for module scripts. The preview
// runtime installs its own copy of the helper for inline scripts (src/utils/renderer/runtimeBridgeRuntime.ts):
// keep both in sync.

/** Name of the guard helper the inserted checks call (and of the global the preview runtime installs). */
export const LOOP_GUARD_NAME = '__lwLoop';
/** How long a loop may keep the page busy before the guard throws. */
export const LOOP_GUARD_LIMIT_MS = 1200;

// A single hoisted function declaration (no top-level statements), so it is already usable
// while the learner's code runs above it.
const GUARD_HELPER =
    `function ${LOOP_GUARD_NAME}(l){var g=${LOOP_GUARD_NAME};` +
    'if(!g.on){g.on=1;g.n=0;g.t=performance.now();' +
    'if(!g.ch){g.ch=new MessageChannel();g.ch.port1.onmessage=function(){g.on=0;};}' +
    'g.ch.port2.postMessage(0);return false;}' +
    `if((++g.n&63)!==0||performance.now()-g.t<=${LOOP_GUARD_LIMIT_MS})return false;` +
    "g.on=0;g.msg='Possible infinite loop at line '+l+': " +
    `it kept running for more than ${LOOP_GUARD_LIMIT_MS / 1000}s without letting the page update, so LearnWeb stopped it. ` +
    `(Add "loop_protect: false" to the example frontmatter to disable this guard.)';return true;}`;

/** `addLoopGuards()` options. */
export interface AddLoopGuardsOptions {
    /** Only used by the TypeScript parser (and its messages). */
    fileName?: string;
    /** How to parse the code (`JS` by default, `TS` for TypeScript blocks). */
    scriptKind?: ts.ScriptKind;
    /** Append the guard helper after the code (default). Inline `<script>` tags use the runtime's global helper. */
    appendHelper?: boolean;
    /** Added to the line numbers in the guard messages (lines before an inline script in its HTML document). */
    lineOffset?: number;
}

/** `addLoopGuards()` output. */
export interface LoopGuardResult {
    code: string;
    /** Number of loops that got a guard (`0` means `code` is the input unchanged). */
    guarded: number;
}

/** `getSyntaxDiagnostics()` options. */
export interface SyntaxDiagnosticsOptions {
    fileName?: string;
    scriptKind?: ts.ScriptKind;
}

/**
 * The parser's own syntax errors of a source file. `parseDiagnostics` is internal to TypeScript (absent
 * from its public types) but has been stable for years; `getSyntaxDiagnostics()` still checks it is an array.
 */
type SourceFileWithParseDiagnostics = ts.SourceFile & { parseDiagnostics?: readonly ts.DiagnosticWithLocation[] };

type LoopStatement = ts.WhileStatement | ts.DoStatement | ts.ForStatement | ts.ForInStatement | ts.ForOfStatement;

function isLoop(node: ts.Node): node is LoopStatement {
    return (
        ts.isWhileStatement(node) ||
        ts.isDoStatement(node) ||
        ts.isForStatement(node) ||
        ts.isForInStatement(node) ||
        ts.isForOfStatement(node)
    );
}

function buildGuardStatement(line: number): string {
    return `if(${LOOP_GUARD_NAME}(${line}))throw new RangeError(${LOOP_GUARD_NAME}.msg);`;
}

/**
 * Inserts `if(__lwLoop(line))throw new RangeError(…)` at the start of every loop body (wrapping
 * single-statement bodies in braces), without adding or removing lines. The code must parse: callers
 * check for syntax errors first, since guards inserted into broken code could move the real error.
 */
export function addLoopGuards(
    source: string = '',
    {
        fileName = 'script.js',
        scriptKind = ts.ScriptKind.JS,
        appendHelper = true,
        lineOffset = 0,
    }: AddLoopGuardsOptions = {},
): LoopGuardResult {
    const text = String(source ?? '');
    if (!/\b(for|while|do)\b/.test(text)) {
        return { code: text, guarded: 0 };
    }

    const sourceFile = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, scriptKind);
    const insertions: { position: number; text: string }[] = [];
    let guarded = 0;

    const visit = (node: ts.Node): void => {
        if (isLoop(node) && node.statement) {
            guarded += 1;
            const body = node.statement;
            const loopLine = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1 + lineOffset;
            const guard = buildGuardStatement(loopLine);

            if (ts.isBlock(body)) {
                insertions.push({ position: body.getStart(sourceFile) + 1, text: guard });
            } else {
                insertions.push({ position: body.getStart(sourceFile), text: `{${guard}` });
                insertions.push({ position: body.getEnd(), text: '}' });
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);

    if (insertions.length === 0) {
        return { code: text, guarded: 0 };
    }

    insertions.sort((left, right) => right.position - left.position);
    let code = text;
    for (const { position, text: insertion } of insertions) {
        code = `${code.slice(0, position)}${insertion}${code.slice(position)}`;
    }

    return {
        // Inline <script> tags use the global helper installed by the preview runtime instead, so the
        // HTML keeps its exact line count.
        code: appendHelper ? `${code}\n${GUARD_HELPER}` : code,
        guarded,
    };
}

/** Syntax errors of a script according to the TypeScript parser (never type errors), in source order. */
export function getSyntaxDiagnostics(
    source: string = '',
    { fileName = 'script.js', scriptKind = ts.ScriptKind.JS }: SyntaxDiagnosticsOptions = {},
): SyntaxDiagnostic[] {
    const sourceFile = ts.createSourceFile(
        fileName,
        String(source ?? ''),
        ts.ScriptTarget.Latest,
        true,
        scriptKind,
    ) as SourceFileWithParseDiagnostics;
    const diagnostics = Array.isArray(sourceFile.parseDiagnostics) ? sourceFile.parseDiagnostics : [];

    return diagnostics.map((diagnostic) => {
        const position =
            typeof diagnostic.start === 'number' ? sourceFile.getLineAndCharacterOfPosition(diagnostic.start) : null;
        return {
            column: position ? position.character + 1 : null,
            line: position ? position.line + 1 : null,
            message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        };
    });
}

const INLINE_SCRIPT_PATTERN = /(<script\b([^>]*)>)([\s\S]*?)(<\/script\s*>)/gi;
const JS_SCRIPT_TYPES = new Set(['', 'text/javascript', 'application/javascript', 'module', 'text/ecmascript']);

/**
 * Adds loop guards to the inline scripts of an HTML string (HTML block, HTML-FULL, Pug output).
 * Scripts with `src`, non-JS types or syntax errors are left untouched; no line is added or removed, and
 * the messages name the line in the HTML document. The guards call the preview runtime's global helper.
 */
export function addLoopGuardsToHtml(html: string = ''): string {
    const source = String(html ?? '');
    if (!/<script\b/i.test(source) || !/\b(for|while|do)\b/.test(source)) return source;

    return source.replace(
        INLINE_SCRIPT_PATTERN,
        (match: string, open: string, attributes: string, content: string, close: string, offset: number) => {
            if (/\bsrc\s*=/i.test(attributes)) return match;
            const typeMatch = /\btype\s*=\s*["']?([^"'\s>]*)/i.exec(attributes);
            if (typeMatch && !JS_SCRIPT_TYPES.has(typeMatch[1].trim().toLowerCase())) return match;
            if (!/\b(for|while|do)\b/.test(content)) return match;

            try {
                if (getSyntaxDiagnostics(content, { fileName: 'inline.js' }).length > 0) return match;
                // Messages name the line in the HTML document, not inside the script.
                const lineOffset = (source.slice(0, offset + open.length).match(/\n/g) || []).length;
                const { code } = addLoopGuards(content, { appendHelper: false, fileName: 'inline.js', lineOffset });
                return `${open}${code}${close}`;
            } catch {
                return match;
            }
        },
    );
}

import ts from 'typescript';

// Inserts a time-based guard into every loop of a learner's script so an accidental infinite
// loop (very easy to create while typing, since the preview re-renders on every pause) stops
// after a short while instead of freezing the app and heating the machine.
//
// Every insertion stays on the line of the loop it belongs to, and the guard helper is appended
// as one extra line after the learner's code, so error line numbers and source maps keep pointing
// at the learner's own lines.

export const LOOP_GUARD_NAME = '__lwLoop';
export const LOOP_GUARD_LIMIT_MS = 1200;

// A single hoisted function declaration (no top-level statements), so it is already usable
// while the learner's code runs above it.
const GUARD_HELPER = `function ${LOOP_GUARD_NAME}(l){var g=${LOOP_GUARD_NAME};`
    + 'if(!g.on){g.on=1;g.n=0;g.t=performance.now();'
    + 'if(!g.ch){g.ch=new MessageChannel();g.ch.port1.onmessage=function(){g.on=0;};}'
    + 'g.ch.port2.postMessage(0);return false;}'
    + `if((++g.n&63)!==0||performance.now()-g.t<=${LOOP_GUARD_LIMIT_MS})return false;`
    + "g.on=0;g.msg='Possible infinite loop at line '+l+': "
    + `it kept running for more than ${LOOP_GUARD_LIMIT_MS / 1000}s without letting the page update, so LearnWeb stopped it. `
    + `(Add "loop_protect: false" to the example frontmatter to disable this guard.)';return true;}`;

function isLoop(node) {
    return ts.isWhileStatement(node)
        || ts.isDoStatement(node)
        || ts.isForStatement(node)
        || ts.isForInStatement(node)
        || ts.isForOfStatement(node);
}

function buildGuardStatement(line) {
    return `if(${LOOP_GUARD_NAME}(${line}))throw new RangeError(${LOOP_GUARD_NAME}.msg);`;
}

export function addLoopGuards(source = '', { fileName = 'script.js', scriptKind = ts.ScriptKind.JS, appendHelper = true, lineOffset = 0 } = {}) {
    const text = String(source ?? '');
    if (!/\b(for|while|do)\b/.test(text)) {
        return { code: text, guarded: 0 };
    }

    const sourceFile = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, scriptKind);
    const insertions = [];
    let guarded = 0;

    const visit = (node) => {
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

export function getSyntaxDiagnostics(source = '', { fileName = 'script.js', scriptKind = ts.ScriptKind.JS } = {}) {
    const sourceFile = ts.createSourceFile(fileName, String(source ?? ''), ts.ScriptTarget.Latest, true, scriptKind);
    const diagnostics = Array.isArray(sourceFile.parseDiagnostics) ? sourceFile.parseDiagnostics : [];

    return diagnostics.map((diagnostic) => {
        const position = typeof diagnostic.start === 'number'
            ? sourceFile.getLineAndCharacterOfPosition(diagnostic.start)
            : null;
        return {
            column: position ? position.character + 1 : null,
            line: position ? position.line + 1 : null,
            message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        };
    });
}

const INLINE_SCRIPT_PATTERN = /(<script\b([^>]*)>)([\s\S]*?)(<\/script\s*>)/gi;
const JS_SCRIPT_TYPES = new Set(['', 'text/javascript', 'application/javascript', 'module', 'text/ecmascript']);

// Adds loop guards to the inline scripts of an HTML string (HTML block, HTML-FULL, Pug output).
// Scripts with `src`, non-JS types or syntax errors are left untouched; no line is added or removed.
export function addLoopGuardsToHtml(html = '') {
    const source = String(html ?? '');
    if (!/<script\b/i.test(source) || !/\b(for|while|do)\b/.test(source)) return source;

    return source.replace(INLINE_SCRIPT_PATTERN, (match, open, attributes, content, close, offset) => {
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
    });
}

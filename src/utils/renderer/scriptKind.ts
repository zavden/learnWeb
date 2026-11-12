// Decide whether learner JavaScript must run as `<script type="module">`.
//
// Classic scripts stay the default so beginner patterns keep working (top-level `const`/`function`
// visible to inline `onclick="fn()"` handlers and the console REPL). We switch to a module only when the
// code cannot run as a classic script:
// 1. a static `import …` / `export …` statement at the start of a line (comments stripped first;
//    `import(` dynamic imports do not count), or `import.meta`;
// 2. top-level `await`: the code fails to parse as a plain function body but parses as an async
//    function body.

// `import x`, `import {…}`, `import * as`, `import 'x'`, `export const`, `export {…}`, `export *`, but
// not identifiers that merely start with the keyword (`importReceipts(csv) {`, `exportCsv()`).
const LINE_IMPORT_EXPORT_PATTERN = /^[ \t]*(?:import(?:\s+[\w$]|\s*[*{"'`])|export(?:\s+[\w$]|\s*[*{]))/m;
const IMPORT_META_PATTERN = /\bimport\s*\.\s*meta\b/;

function stripComments(code = '') {
    // Good enough for detection: removes block comments and line comments that start a line or follow
    // whitespace/semicolons (avoids touching `//` inside URLs in strings in most practical cases).
    return String(code || '')
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/(^|[\s;])\/\/.*$/gm, '$1');
}

function parsesAs(constructorFactory, code) {
    try {
        const Constructor = constructorFactory();
        if (typeof Constructor !== 'function') return null;
        // Parsing only; the function is never called.
        Constructor(code);
        return true;
    } catch (error) {
        if (error instanceof SyntaxError) return false;
        return null;
    }
}

export function isModuleScript(code = '') {
    const source = String(code || '');
    if (!source.trim()) return false;

    const stripped = stripComments(source);
    if (LINE_IMPORT_EXPORT_PATTERN.test(stripped) || IMPORT_META_PATTERN.test(stripped)) {
        return true;
    }

    if (!/\bawait\b/.test(stripped)) return false;

    const classic = parsesAs(() => Function, source);
    if (classic !== false) return false;

    const asyncBody = parsesAs(() => Object.getPrototypeOf(async function () {}).constructor, source);
    return asyncBody === true;
}

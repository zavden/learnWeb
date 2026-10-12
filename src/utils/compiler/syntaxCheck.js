import vm from 'node:vm';
import ts from 'typescript';
import { isModuleScript } from '../renderer/scriptKind.js';
import { getSyntaxDiagnostics } from './loopGuard.js';

// Syntax errors of a learner's JavaScript, exactly as Chrome reports them: classic scripts are
// compiled (never run) by V8 itself, so early errors like `const x;`, a repeated `let` or a
// sloppy-mode octal literal behave as in the browser. Module scripts would need V8's experimental
// module API, so they use the TypeScript parser instead (modules are strict, as TS assumes).

function parseV8SyntaxError(error, fileName) {
    const stack = String(error?.stack || '');
    const lines = stack.split('\n');
    const location = new RegExp(`^${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:(\\d+)`).exec(lines[0] || '');
    const caretLine = lines.find((line, index) => index > 0 && /^\s*\^+\s*$/.test(line));
    return {
        column: caretLine ? caretLine.indexOf('^') + 1 : null,
        line: location ? Number(location[1]) : null,
        message: String(error?.message || 'Invalid or unexpected token'),
    };
}

export function checkJavaScriptSyntax(source = '', { fileName = 'script.js' } = {}) {
    const code = String(source ?? '');
    if (!code.trim()) return [];

    if (isModuleScript(code)) {
        return getSyntaxDiagnostics(code, { fileName, scriptKind: ts.ScriptKind.JS });
    }

    try {
        // Compiling only: the code is never executed.
        new vm.Script(code, { filename: fileName });
        return [];
    } catch (error) {
        if (!(error instanceof SyntaxError) && error?.name !== 'SyntaxError') return [];
        return [parseV8SyntaxError(error, fileName)];
    }
}

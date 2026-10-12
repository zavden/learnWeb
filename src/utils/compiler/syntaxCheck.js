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

// Browser-only early error: a classic script's top-level `let`/`const`/`class` cannot reuse the name
// of a non-configurable property of `window`. Node has no such globals, so V8 accepts it here while
// Chrome refuses to run the whole script ("Identifier 'top' has already been declared").
const BROWSER_RESERVED_GLOBALS = new Set(['top', 'window', 'document', 'location']);

function collectBindingNames(nameNode, found) {
    if (!nameNode) return;
    if (ts.isIdentifier(nameNode)) {
        found.push(nameNode);
        return;
    }
    if (ts.isObjectBindingPattern(nameNode) || ts.isArrayBindingPattern(nameNode)) {
        for (const element of nameNode.elements) {
            if (ts.isBindingElement(element)) collectBindingNames(element.name, found);
        }
    }
}

function findReservedGlobalDeclaration(code, fileName) {
    const sourceFile = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    for (const statement of sourceFile.statements) {
        const names = [];
        if (ts.isVariableStatement(statement) && (statement.declarationList.flags & ts.NodeFlags.BlockScoped)) {
            for (const declaration of statement.declarationList.declarations) collectBindingNames(declaration.name, names);
        } else if (ts.isClassDeclaration(statement) && statement.name) {
            names.push(statement.name);
        }
        const reserved = names.find((identifier) => BROWSER_RESERVED_GLOBALS.has(identifier.text));
        if (reserved) {
            const position = sourceFile.getLineAndCharacterOfPosition(reserved.getStart(sourceFile));
            return {
                column: position.character + 1,
                line: position.line + 1,
                message: `Identifier '${reserved.text}' has already been declared`,
            };
        }
    }
    return null;
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
    } catch (error) {
        if (!(error instanceof SyntaxError) && error?.name !== 'SyntaxError') return [];
        return [parseV8SyntaxError(error, fileName)];
    }
    const reservedGlobal = findReservedGlobalDeclaration(code, fileName);
    return reservedGlobal ? [reservedGlobal] : [];
}

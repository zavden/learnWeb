import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

import { compileScript } from '../src/utils/compiler/scriptCompiler.js';
import { compileStyle } from '../src/utils/compiler/styleCompiler.js';
import { compileMarkup } from '../src/utils/compiler/markupCompiler.js';
import { addLoopGuards, LOOP_GUARD_NAME } from '../src/utils/compiler/loopGuard.js';

// MessageChannel keeps Node alive while a port has a listener, so the vm gets an inert stand-in.
// Without the reset message, the guard measures the whole synchronous run, which is what we test.
class InertMessageChannel {
    constructor() {
        this.port1 = { onmessage: null };
        this.port2 = { postMessage() {} };
    }
}

function runGuarded(code) {
    const logs = [];
    const context = vm.createContext({
        MessageChannel: InertMessageChannel,
        console: { log: (...args) => logs.push(args.join(' ')) },
        performance,
    });
    vm.runInContext(code, context, { filename: 'script.js' });
    return logs;
}

test('typescript blocks report type errors as non-blocking diagnostics', () => {
    const result = compileScript({
        type: 'typescript',
        content: "const n: number = 'hola';\nconst status = document.getElementById('status');\nstatus.textContent = 'x';\n",
    }, { sourcePath: 'script.ts' });

    const typeErrors = result.diagnostics.filter((diagnostic) => diagnostic.code === 'typescript-type');
    assert.equal(typeErrors.length, 2);
    assert.deepEqual(typeErrors.map((diagnostic) => diagnostic.line), [1, 3]);
    assert.ok(typeErrors.every((diagnostic) => diagnostic.blocking === false && diagnostic.slot === 'script'));
    assert.match(typeErrors[0].message, /^TS2322: Type 'string' is not assignable to type 'number'/);
    // `status` must not clash with the DOM global of the same name: files are checked as modules.
    assert.ok(!result.diagnostics.some((diagnostic) => /redeclare/i.test(diagnostic.message)));
    // The JavaScript is still emitted.
    assert.match(result.js, /const n = 'hola'/);
});

test('typescript type checking can be disabled and accepts URL imports', () => {
    const disabled = compileScript({ type: 'typescript', content: "const n: number = 'x';" }, { typeCheck: false });
    assert.equal(disabled.diagnostics.length, 0);

    const urlImport = compileScript({
        type: 'typescript',
        content: "import confetti from 'https://esm.sh/canvas-confetti';\nconfetti();\nexport {};\n",
    });
    assert.equal(urlImport.diagnostics.length, 0);
});

test('typescript emits modern class fields', () => {
    const result = compileScript({
        type: 'typescript',
        content: 'class Counter { #count = 0; label?: string; inc() { return ++this.#count; } }\nconsole.log(new Counter().inc());\n',
    });
    assert.equal(result.diagnostics.length, 0);
    assert.match(result.js, /#count = 0/);
    assert.doesNotMatch(result.js, /WeakMap/);
});

test('javascript syntax errors are reported with their line and column', () => {
    const result = compileScript({ type: 'javascript', content: "console.log('ok');\nlet x = ;\n" }, { sourcePath: 'script.js' });
    assert.equal(result.diagnostics.length, 1);
    assert.equal(result.diagnostics[0].code, 'javascript-syntax');
    assert.equal(result.diagnostics[0].line, 2);
    assert.equal(result.diagnostics[0].column, 9);
    assert.equal(result.diagnostics[0].file, 'script.js');
});

test('loop guards keep every user line in place', () => {
    const source = [
        'let i = 0;',
        'while (i < 3) i++;',
        'for (const x of [1, 2]) {',
        '  console.log(x);',
        '}',
        'do i--; while (i > 0)',
        'outer: for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) { if (b) continue outer; }',
    ].join('\n');

    const { code, guarded } = addLoopGuards(source);
    assert.equal(guarded, 5);
    const lines = code.split('\n');
    // One extra line: the hoisted guard helper.
    assert.equal(lines.length, source.split('\n').length + 1);
    assert.match(lines.at(-1), new RegExp(`^function ${LOOP_GUARD_NAME}\\(`));
    assert.match(lines[1], new RegExp(`^while \\(i < 3\\) \\{if\\(${LOOP_GUARD_NAME}\\(2\\)\\)`));
    assert.deepEqual(runGuarded(code), ['1', '2']);
});

test('loop guards stop an infinite loop with an error pointing at the loop line', () => {
    const result = compileScript({ type: 'javascript', content: "let i = 0;\nwhile (i < 5) {\n}\nconsole.log('never');" }, { sourcePath: 'script.js' });
    const started = performance.now();
    assert.throws(() => runGuarded(result.js), (error) => {
        assert.equal(error.name, 'RangeError');
        assert.match(error.message, /Possible infinite loop at line 2/);
        assert.match(String(error.stack), /script\.js:2:/);
        return true;
    });
    assert.ok(performance.now() - started < 4000);
});

test('loop guards can be disabled and are skipped for code with syntax errors', () => {
    const disabled = compileScript({ type: 'javascript', content: 'while (true) {}' }, { loopProtect: false });
    assert.doesNotMatch(disabled.js, new RegExp(LOOP_GUARD_NAME));

    const broken = compileScript({ type: 'javascript', content: 'while (true) {' });
    assert.doesNotMatch(broken.js, new RegExp(LOOP_GUARD_NAME));
    assert.equal(broken.diagnostics[0].code, 'javascript-syntax');
});

test('sass errors carry a location and a one-line message; warnings are surfaced', () => {
    const failed = compileStyle({ type: 'scss', content: '$a: 1px;\n.x { color: $nope; }' });
    assert.equal(failed.diagnostics.length, 1);
    assert.equal(failed.diagnostics[0].line, 2);
    assert.equal(failed.diagnostics[0].column, 13);
    assert.doesNotMatch(failed.diagnostics[0].message, /\n/);

    const warned = compileStyle({ type: 'scss', content: '@warn "careful";\n.a { color: red; }' });
    assert.match(warned.css, /color: red/);
    assert.equal(warned.diagnostics[0].code, 'sass-warning');
    assert.equal(warned.diagnostics[0].blocking, false);
    assert.equal(warned.diagnostics[0].line, 1);
});

test('pug errors carry a location', () => {
    const result = compileMarkup({ type: 'pug', content: 'div\n  p ok\n    = foo(\n' });
    assert.equal(result.diagnostics[0].code, 'pug-compile-error');
    assert.equal(result.diagnostics[0].line, 3);
});

test('inline <script> loops in HTML get guards without changing the line count', async () => {
    const { addLoopGuardsToHtml } = await import('../src/utils/compiler/loopGuard.js');
    const html = [
        '<p>hola</p>',
        '<script>',
        'let i = 0;',
        'while (i < 3) { i++; }',
        '</script>',
        '<script src="x.js">while(true){}</script>',
        '<script type="text/template">for (;;) {}</script>',
        '<script type="module">for (const x of [1]) console.log(x)</script>',
    ].join('\n');
    const guarded = addLoopGuardsToHtml(html);
    assert.equal(guarded.split('\n').length, html.split('\n').length);
    assert.match(guarded.split('\n')[3], /^while \(i < 3\) \{if\(__lwLoop\(4\)\)/);
    assert.match(guarded, /<script src="x\.js">while\(true\)\{\}<\/script>/);
    assert.match(guarded, /<script type="text\/template">for \(;;\) \{\}<\/script>/);
    assert.match(guarded, /<script type="module">for \(const x of \[1\]\) \{if\(__lwLoop\(8\)\)/);
    assert.doesNotMatch(guarded, /function __lwLoop/);
});

test('javascript syntax errors come from V8 and match the browser', () => {
    const constNoInit = compileScript({ type: 'javascript', content: 'console.log(1);\nconst x;\n' });
    assert.deepEqual(constNoInit.diagnostics.map((d) => [d.line, d.column, d.message]), [[2, 7, 'SyntaxError: Missing initializer in const declaration']]);
    const duplicateLet = compileScript({ type: 'javascript', content: 'let a = 1;\nlet a = 2;\n' });
    assert.equal(duplicateLet.diagnostics[0].line, 2);
    // Legacy octal literals are legal in classic (sloppy) scripts.
    assert.equal(compileScript({ type: 'javascript', content: 'console.log(017);' }).diagnostics.length, 0);
    // Top-level await makes the script a module, which is valid.
    assert.equal(compileScript({ type: 'javascript', content: "const r = await fetch('x');" }).diagnostics.length, 0);
});

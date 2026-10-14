// Runs the preview runtime bridge inside a Node vm context. Each inline <script> of a rendered
// document is executed with the same line/column offsets Blink uses for inline scripts, so error
// positions can be checked end to end.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { renderCompiledExampleDocument } from '../src/utils/exampleRenderer.js';
import { compileScript } from '../src/utils/compiler/scriptCompiler.js';

function createFrame({ beforeScripts = '' } = {}) {
    const posted = [];
    const listeners = {};
    const noop = () => {};
    const sandbox = {
        console: Object.fromEntries(['log', 'info', 'warn', 'error', 'debug', 'table', 'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd', 'count', 'countReset', 'time', 'timeLog', 'timeEnd', 'assert', 'trace', 'clear'].map((name) => [name, noop])),
        location: { href: 'about:srcdoc', hash: '' },
        setTimeout,
        clearTimeout,
        performance: { now: () => performance.now(), getEntriesByType: () => resourceEntries },
        URL,
        URLSearchParams,
    };
    const resourceEntries = [];
    const documentListeners = {};
    sandbox.window = sandbox;
    // Like window.postMessage: messages are structured-cloned (also normalises vm realms).
    const frameState = { ready: 0 };
    sandbox.parent = {
        postMessage: (message) => {
            if (message.kind === 'runtime-ready') {
                frameState.ready += 1;
                return;
            }
            posted.push(structuredClone(message));
        },
    };
    sandbox.addEventListener = (type, listener) => {
        (listeners[type] ||= []).push(listener);
    };
    sandbox.document = {
        addEventListener: (type, listener) => (documentListeners[type] ||= []).push(listener),
        baseURI: 'http://localhost:3001/preview/ch/sec/top/id/index.html',
        querySelector: () => null,
    };
    vm.createContext(sandbox);
    if (beforeScripts) vm.runInContext(beforeScripts, sandbox);

    const parentWindow = sandbox.parent;
    return {
        state: frameState,
        posted,
        listeners,
        resourceEntries,
        sandbox,
        dispatchOnDocument(type, event) {
            (documentListeners[type] || []).forEach((listener) => listener(event));
        },
        dispatch(type, event) {
            (listeners[type] || []).forEach((listener) => listener(event));
        },
        command(data) {
            this.dispatch('message', { source: parentWindow, data: { source: 'learncode-console-command', ...data } });
        },
    };
}

function runDocument(frame, html) {
    const pattern = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = pattern.exec(html))) {
        const start = match.index + match[0].indexOf('>') + 1;
        const before = html.slice(0, start);
        const lineOffset = before.split('\n').length - 1;
        const columnOffset = start - (before.lastIndexOf('\n') + 1);
        try {
            new vm.Script(match[2], { filename: 'about:srcdoc', lineOffset, columnOffset }).runInContext(frame.sandbox);
        } catch (error) {
            // Like a browser ErrorEvent: syntax errors only carry the document position.
            const header = String(error.stack || '').split('\n')[0].match(/^(.*):(\d+)$/);
            frame.dispatch('error', {
                message: `Uncaught ${error}`,
                error,
                filename: error instanceof SyntaxError && header ? header[1] : 'about:srcdoc',
                lineno: error instanceof SyntaxError && header ? Number(header[2]) : 0,
                colno: 0,
            });
        }
    }
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 5));

async function runExample(js, { html = '<p>x</p>', options = {}, beforeScripts = '' } = {}) {
    const document = renderCompiledExampleDocument({
        html,
        js: `${js}\n//# sourceURL=script.js`,
        markupType: 'html',
        runtimeScriptPath: 'script.js',
    }, '', [], { consoleEnabled: true, renderId: 9, ...options });
    const frame = createFrame({ beforeScripts });
    runDocument(frame, document);
    await settle();
    return frame;
}

const texts = (frame, kind = 'console') => frame.posted.filter((message) => message.kind === kind).map((message) => message.text);

test('console values are formatted like Chrome DevTools', async () => {
    const frame = await runExample([
        "class Person { constructor(n) { this.name = n; } greet() {} }",
        "console.log(new Person('Ann'), ['a', '1', 1], new Map([['k', { x: 1 }]]), new Set([1, 2]));",
        'const shared = { x: 1 }; console.log([shared, shared], -0, 10n, Symbol("s"), { [Symbol("k")]: 1 });',
        'console.log(Object.create(null), [ , 1, , , 4], new Uint8Array(2), /re/g, Promise.resolve(1), new Promise(() => {}));',
        'console.log({ get boom() { throw new Error("never invoked"); } }, Person.prototype, function foo(a) { return a; });',
        "console.log('%s is %d years, %i%%, %f %o', 'Ann', 30.7, '42px', '1.5', [1]);",
        "console.log({ café: 12, 'two words': 1 }, function* ids(start) { yield start; });",
    ].join('\n'));

    assert.deepEqual(texts(frame), [
        "Person {name: 'Ann'} (3) ['a', '1', 1] Map(1) {'k' => {…}} Set(2) {1, 2}",
        '(2) [{…}, {…}] -0 10n Symbol(s) {[Symbol(k)]: 1}',
        '[Object: null prototype] {} (5) [empty, 1, empty × 2, 4] Uint8Array(2) [0, 0] /re/g Promise {<fulfilled>: 1} Promise {<pending>}',
        '{boom: (...)} {constructor: class Person, greet: ƒ} ƒ foo(a) { return a; }',
        'Ann is 30 years, 42%, 1.5 (1) [1]',
        "{café: 12, 'two words': 1} ƒ* ids(start) { yield start; }",
    ]);
    assert.ok(frame.posted.every((message) => message.location?.path === 'script.js'));
    assert.deepEqual(frame.posted.map((message) => message.location.line), [2, 3, 4, 5, 6, 7]);
});

test('console helpers: table, count, time, group, assert, trace, clear', async () => {
    const frame = await runExample([
        "console.table([{ a: 1, b: 'x' }, { a: 2, c: true }]);",
        "console.count(); console.count(); console.count('x'); console.countReset('nope');",
        "console.time('t'); console.timeEnd('t'); console.timeEnd('t');",
        "console.group('G'); console.log('inside'); console.groupEnd(); console.log('outside');",
        "console.assert(1 === 2, 'math is broken'); console.assert(true, 'hidden');",
        'console.trace(); console.debug("dbg"); console.clear();',
    ].join('\n'));

    const table = frame.posted.find((message) => message.method === 'table').table;
    assert.deepEqual(table.header, ['(index)', 'a', 'b', 'c']);
    assert.deepEqual(table.rows, [['0', '1', "'x'", ''], ['1', '2', '', 'true']]);

    const all = texts(frame);
    assert.ok(all.includes('default: 1') && all.includes('default: 2') && all.includes('x: 1'));
    assert.ok(all.includes("Count for 'nope' does not exist"));
    assert.ok(all.some((text) => /^t: [\d.]+ ms$/.test(text)));
    assert.ok(all.includes("Timer 't' does not exist"));

    const group = frame.posted.find((message) => message.method === 'group');
    const inside = frame.posted.find((message) => message.text === 'inside');
    const outside = frame.posted.find((message) => message.text === 'outside');
    assert.deepEqual(inside.groups, [group.groupId]);
    assert.deepEqual(outside.groups, []);

    const assertion = frame.posted.find((message) => message.method === 'assert');
    assert.equal(assertion.level, 'error');
    assert.equal(assertion.text, 'Assertion failed: math is broken');
    assert.equal(assertion.stackFrames[0].path, 'script.js');
    assert.equal(assertion.stackFrames[0].line, 5);
    assert.ok(!all.includes('hidden'));

    const trace = frame.posted.find((message) => message.method === 'trace');
    assert.equal(trace.stackFrames[0].line, 6);
    assert.equal(frame.posted.find((message) => message.method === 'debug').level, 'debug');
    assert.ok(frame.posted.some((message) => message.kind === 'console-clear'));
});

test('runtime errors map to the learner line (no wrapper offset)', async () => {
    const frame = await runExample('const a = 1;\nconsole.log(a);\nnull.boom;');
    assert.equal(frame.state.ready, 1, 'runtime announces itself once');
    const error = frame.posted.find((message) => message.kind === 'runtime-error');
    assert.equal(error.text, "Uncaught TypeError: Cannot read properties of null (reading 'boom')");
    assert.deepEqual([error.location.path, error.location.line], ['script.js', 3]);
});

test('syntax errors use the document position mapped back to the editor line', async () => {
    const frame = await runExample('const a = 1;\nconsole.log(a);\nconst b = ;');
    const error = frame.posted.find((message) => message.kind === 'runtime-error');
    assert.equal(error.errorName, 'SyntaxError');
    assert.deepEqual([error.location.path, error.location.line], ['script.js', 3]);
});

test('non-Error throws and rejections are shown faithfully', async () => {
    const frame = await runExample('console.log(1);');
    frame.dispatch('error', { message: 'Uncaught oops', error: 'oops', filename: 'about:srcdoc', lineno: 0, colno: 0 });
    frame.dispatch('unhandledrejection', { reason: 42 });
    frame.dispatch('unhandledrejection', { reason: { code: 7 } });
    await settle();
    assert.deepEqual(texts(frame, 'runtime-error'), ['Uncaught "oops"']);
    assert.deepEqual(texts(frame, 'unhandled-rejection'), ['Uncaught (in promise) 42', 'Uncaught (in promise) {code: 7}']);
});

test('TypeScript errors resolve through the inline source map', async () => {
    const { js } = compileScript({ type: 'typescript', content: 'class C {\n  #n: number = 0;\n  run(): void {\n    (null as any).x();\n  }\n}\nnew C().run();' }, { sourcePath: 'script.ts' });
    const document = renderCompiledExampleDocument({ html: '', js, runtimeScriptPath: 'script.ts' }, '', [], { consoleEnabled: true, renderId: 1 });
    const frame = createFrame();
    runDocument(frame, document);
    await settle();
    const error = frame.posted.find((message) => message.kind === 'runtime-error');
    assert.deepEqual([error.location.path, error.location.line], ['script.ts', 4]);
});

test('inspector expands objects lazily, follows the prototype chain and invokes getters on the receiver', async () => {
    const frame = await runExample([
        'class Animal { constructor(n) { this.name = n; } speak() {} }',
        'class Dog extends Animal { get loud() { return this.name.toUpperCase(); } }',
        "console.log(new Dog('rex'), new Map([['k', 1]]), Promise.resolve(42));",
    ].join('\n'));
    const [dog, map, promise] = frame.posted[0].parts.filter((part) => part.kind === 'value').map((part) => part.value);
    const ask = async (data) => {
        const before = frame.posted.length;
        frame.command({ renderId: 9, requestId: before, ...data });
        await settle();
        return frame.posted.slice(before).find((message) => message.kind === 'inspect-result');
    };

    let result = await ask({ action: 'inspect', handle: dog.handle });
    assert.deepEqual(result.properties.map((property) => [property.name, property.value.preview]), [['name', "'rex'"], ['[[Prototype]]', 'Dog.prototype']]);

    const proto = result.properties[1];
    result = await ask({ action: 'inspect', handle: proto.value.handle, receiver: proto.receiver });
    assert.deepEqual(result.properties.map((property) => property.name), ['constructor', 'loud', '[[Prototype]]']);
    assert.equal(result.properties[2].value.preview, 'Animal.prototype');

    const getter = result.properties.find((property) => property.name === 'loud');
    assert.equal(getter.accessor, true);
    result = await ask({ action: 'get-property', owner: getter.owner, key: getter.key, receiver: getter.receiver });
    assert.equal(result.value.preview, "'REX'");

    result = await ask({ action: 'inspect', handle: map.handle });
    const entries = result.properties.find((property) => property.name === '[[Entries]]');
    result = await ask({ action: 'inspect', handle: entries.value.handle });
    assert.equal(result.properties[0].value.preview, "{'k' => 1}");

    result = await ask({ action: 'inspect', handle: promise.handle });
    assert.deepEqual(result.properties.filter((property) => property.internal).map((property) => `${property.name}=${property.value.preview}`), [
        "[[PromiseState]]='fulfilled'",
        '[[PromiseResult]]=42',
        '[[Prototype]]=Promise.prototype',
    ]);

    result = await ask({ action: 'inspect', handle: 99999 });
    assert.equal(result.ok, false);
});

test('REPL evaluates in the page global scope', async () => {
    const frame = await runExample('const greeting = "hi";');
    frame.command({ renderId: 9, action: 'eval', command: '{a: 1}', commandId: 'c1' });
    frame.command({ renderId: 9, action: 'eval', command: 'greeting.toUpperCase()', commandId: 'c2' });
    frame.command({ renderId: 9, action: 'eval', command: 'throw 5', commandId: 'c3' });
    frame.command({ renderId: 8, action: 'eval', command: '"stale render"', commandId: 'c4' });
    await settle();
    assert.deepEqual(texts(frame, 'command-result'), ['{a: 1}', "'HI'"]);
    assert.deepEqual(texts(frame, 'command-error'), ['Uncaught 5']);
});

test('forms: unhandled submits are blocked and logged; method=dialog passes through', async () => {
    const frame = await runExample('', { beforeScripts: 'globalThis.FormData = class { constructor() {} entries() { return [["email", "a@b.c"], ["tag", "x"], ["tag", "y"]][Symbol.iterator](); } };' });
    const makeForm = (method, action = '/save', enctype = null) => ({
        tagName: 'FORM',
        getAttribute: (name) => ({ method, action, enctype })[name] ?? null,
    });
    const submit = (form, defaultPrevented = false) => {
        let prevented = false;
        frame.dispatch('submit', { target: form, submitter: null, defaultPrevented, preventDefault() { prevented = true; } });
        return prevented;
    };

    assert.equal(submit(makeForm('post')), true);
    await settle();
    assert.equal(frame.posted.at(-1).text, "Form submitted (navigation blocked in preview): POST /save (application/x-www-form-urlencoded) {email: 'a@b.c', tag: Array(2)}");

    submit(makeForm('POST', '/upload', 'multipart/form-data'));
    await settle();
    assert.match(frame.posted.at(-1).text, /: POST \/upload \(multipart\/form-data\) \{/);

    // GET replaces the query of the action and keeps its fragment; an invalid method means GET.
    submit(makeForm('put', '/search?old=1#results'));
    await settle();
    assert.match(frame.posted.at(-1).text, /: GET \/search\?email=a%40b\.c&tag=x&tag=y#results \{/);
    submit(makeForm('get', null));
    await settle();
    assert.match(frame.posted.at(-1).text, /: GET \(this page\)\?email=a%40b\.c&tag=x&tag=y \{/);

    assert.equal(submit(makeForm('dialog')), false);

    const before = frame.posted.length;
    submit(makeForm('get'), true);
    assert.equal(frame.posted.length, before, 'handled submits are left alone');
});

test('forms: files are logged with their name, size and type', async () => {
    const frame = await runExample('', {
        beforeScripts: [
            'globalThis.File = class File { constructor(name, size, type) { this.name = name; this.size = size; this.type = type; } };',
            'globalThis.FormData = class { constructor() {} entries() { return [["cv", new File("cv.pdf", 24576, "application/pdf")], ["photo", new File("", 0, "application/octet-stream")]][Symbol.iterator](); } };',
        ].join('\n'),
    });
    frame.dispatch('submit', {
        target: { tagName: 'FORM', getAttribute: (name) => ({ method: 'post', action: '/apply', enctype: 'multipart/form-data' })[name] ?? null },
        submitter: null,
        defaultPrevented: false,
        preventDefault() {},
    });
    await settle();
    assert.equal(frame.posted.at(-1).text, "Form submitted (navigation blocked in preview): POST /apply (multipart/form-data) {cv: 'File \"cv.pdf\" (24 KB, application/pdf)', photo: 'File (no file chosen)'}");
});

test('dialogs are replaced by notices during live edits, in order', async () => {
    const frame = await runExample("console.log('a');\nalert('hi');\nconst name = prompt('Name?');\nconsole.log(name);", { options: { suppressDialogs: true } });
    assert.deepEqual(frame.posted.map((message) => message.kind), ['console', 'dialog-suppressed', 'dialog-suppressed', 'console']);
    assert.match(frame.posted[2].text, /prompt\("Name\?"\) skipped while editing \(returned null\)/);
    assert.equal(frame.posted[3].text, 'null');
});

test('opaque-origin previews get an in-memory Storage shim', async () => {
    const frame = await runExample(
        "localStorage.setItem('a', '1'); localStorage.b = '2';\nconsole.log(localStorage.getItem('b'), localStorage.length, Object.keys(localStorage), localStorage.getItem('zzz'));",
        { beforeScripts: "Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('SecurityError'); } });" },
    );
    assert.deepEqual(texts(frame), ["2 2 (2) ['a', 'b'] null"]);
});

test('console disabled: only errors are reported, and floods are throttled', async () => {
    const quiet = await runExample("console.log('hidden'); console.error('shown');", { options: { consoleEnabled: false } });
    assert.deepEqual(texts(quiet), ['shown']);

    const flood = await runExample('for (let i = 0; i < 2500; i += 1) console.log(i);');
    assert.equal(texts(flood).length, 2000);
});

test('module namespaces print as Module, and scripts that fail to load show the failed request', async () => {
    const frame = await runExample("console.log(Object.create(null, { [Symbol.toStringTag]: { value: 'Module' }, total: { value: 3, enumerable: true } }));");
    assert.deepEqual(texts(frame), ['Module {total: 3}']);

    frame.resourceEntries.push(
        { name: 'http://localhost:3001/preview/ch/sec/top/id/tienda/precios.js', initiatorType: 'script', responseStatus: 200 },
        { name: 'http://localhost:3001/preview/ch/sec/top/id/tienda/precio.js', initiatorType: 'script', responseStatus: 404 },
    );
    frame.dispatchOnDocument('error', { target: { tagName: 'IMG', src: 'foto.webp' } });
    frame.dispatchOnDocument('error', { target: { tagName: 'SCRIPT', src: '' } });
    frame.dispatchOnDocument('error', { target: { tagName: 'SCRIPT', src: 'http://localhost:3001/preview/ch/sec/top/id/extra.js' } });
    await settle();
    assert.deepEqual(texts(frame, 'runtime-error'), [
        'GET tienda/precio.js net::ERR_ABORTED 404 (Not Found)',
        'Failed to load script: extra.js',
    ]);
});

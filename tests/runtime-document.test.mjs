import test from 'node:test';
import assert from 'node:assert/strict';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../src/utils/exampleRenderer.js';
import { compileScript } from '../src/utils/compiler/scriptCompiler.js';
import { escapeInlineScript, escapeInlineStyle, serializeForInlineScript } from '../src/utils/renderer/runtimeBridge.js';
import { isModuleScript } from '../src/utils/renderer/scriptKind.js';
import { extractInlineSourceMapLines } from '../src/utils/renderer/sourceMap.js';
import { createCompileCacheKey } from '../src/utils/compileCache.js';
import { parseExampleDocument } from '../src/utils/markdown.js';

function extractBridgeConfig(html) {
    const match = html.match(/\(0,eval\)\(".*?"\)\((\{.*?\})\);<\/script>/s);
    assert.ok(match, 'bridge config present');
    return JSON.parse(match[1]);
}

function lineOf(html, needle) {
    const index = html.indexOf(needle);
    assert.ok(index >= 0, `missing ${needle}`);
    return html.slice(0, index).split('\n').length;
}

test('vanilla documents inject the runtime in <head> on a single line and never wrap user code', () => {
    const html = renderCompiledExampleDocument({
        html: '<button onclick="greet()">Hi</button>',
        css: 'p { color: red; }',
        js: 'const greet = () => 1;\n//# sourceURL=script.js',
        markupType: 'html',
        runtimeScriptPath: 'script.js',
    }, 'ch01/sec01/top01', [], { consoleEnabled: false, renderId: 4 });

    const headEnd = html.indexOf('</head>');
    const bridgeIndex = html.indexOf('(0,eval)(');
    assert.ok(bridgeIndex > 0 && bridgeIndex < headEnd, 'bridge lives in <head>');
    assert.ok(!html.slice(bridgeIndex, html.indexOf('</script>', bridgeIndex)).includes('\n'), 'bridge is one line');
    assert.match(html, /<script>const greet = \(\) => 1;/, 'user code starts on the <script> line, no wrapper');
    assert.doesNotMatch(html, /innerHTML \+=/);
    assert.doesNotMatch(html, /<script>\s*try \{/);
    assert.equal(extractBridgeConfig(html).renderId, 4);
    assert.match(html, /<base href="\/api\/topic\/ch01\/sec01\/top01\/assets\/">/);
});

test('plain HTML examples keep browser default styles; frameworks keep their base styles', () => {
    const plain = renderCompiledExampleDocument({ html: '<p>x</p>', markupType: 'html' }, '', [], {});
    assert.doesNotMatch(plain, /padding: 16px/);
    assert.doesNotMatch(plain, /font-family: -apple-system/);

    const react = renderCompiledExampleDocument({ html: '<div id="root"></div>', framework: 'react', js: '' }, '', [], {});
    assert.match(react, /padding: 16px/);
});

test('SVG preview defaults have zero specificity so learner CSS wins', () => {
    const html = renderCompiledExampleDocument({ html: '<svg></svg>', css: 'svg { background: navy; }', markupType: 'svg' }, '', [], {});
    assert.doesNotMatch(html, /!important/);
    assert.match(html, /:where\(\.learncode-svg-preview\) > :where\(svg\)/);
    assert.ok(html.indexOf('svg { background: navy; }') > html.indexOf(':where(.learncode-svg-preview)'));
});

test('source ranges map document lines back to the editor files', () => {
    const js = 'console.log(1);\nnull.boom;\n//# sourceURL=script.js';
    const html = renderCompiledExampleDocument({
        html: '<main>\n  <p>hi</p>\n</main>',
        css: 'a{}\nb{}',
        js,
        markupType: 'html',
        runtimeScriptPath: 'script.js',
    }, '', [], { consoleEnabled: true, renderId: 1, markupPath: 'index.html' });
    const config = extractBridgeConfig(html);
    const script = config.ranges.find((range) => range.kind === 'script');
    const markup = config.ranges.find((range) => range.kind === 'markup');

    assert.equal(script.startLine, lineOf(html, 'console.log(1);'));
    assert.equal(script.sourceName, 'script.js');
    assert.equal(script.path, 'script.js');
    assert.equal(markup.startLine, lineOf(html, '<main>'));
    assert.equal(markup.endLine, markup.startLine + 2);
    assert.equal(markup.path, 'index.html');
});

test('HTML-FULL injection keeps every learner line number unchanged', () => {
    const source = '<!DOCTYPE html>\n<html>\n<head>\n<title>t</title>\n</head>\n<body>\n<script>\nnull.boom;\n</script>\n</body>\n</html>';
    const html = renderCompiledExampleDocument({ fullDocumentHtml: source }, 'a/b/c', [{ level: 'error', message: 'x' }], { renderId: 2, markupPath: 'page.html' });
    assert.equal(html.split('\n').length, source.split('\n').length);
    assert.equal(lineOf(html, 'null.boom;'), 8);
    const config = extractBridgeConfig(html);
    assert.equal(config.ranges[0].path, 'page.html');
    assert.equal(config.ranges[0].startLine, 1);

    const noHead = renderCompiledExampleDocument({ fullDocumentHtml: '<!DOCTYPE html>\n<html>\n<body>\n<p>x</p>\n</body>\n</html>' }, '', [], {});
    assert.match(noHead, /<html><head><script>/);
});

test('hosted documents skip <base> so #anchors and relative URLs behave like a real page', () => {
    const html = renderCompiledExampleDocument({ html: '<a href="#s2">x</a>', markupType: 'html' }, 'a/b/c', [], { hosted: true });
    assert.doesNotMatch(html, /<base /);
    assert.equal(extractBridgeConfig(html).mode, 'hosted');
});

test('inline user code cannot break out of its element', () => {
    assert.equal(escapeInlineScript("'</script><b>'"), "'<\\/script><b>'");
    assert.equal(escapeInlineScript("'<!-- <script>'"), "'\\x3C!-- <script>'");
    assert.equal(escapeInlineStyle("a::after{content:'</style>'}"), "a::after{content:'<\\/style>'}");
    assert.equal(serializeForInlineScript({ a: '</script><!--' }), '{"a":"\\u003c/script>\\u003c!--"}');

    const html = renderCompiledExampleDocument({
        html: '<p>x</p>',
        css: "p::after{content:'</style><h1>leak</h1>'}",
        js: "const s = '</script><b>x</b>';",
        markupType: 'html',
    }, '', [], {});
    assert.equal((html.match(/<\/script>/g) || []).length, 2, 'only the bridge and the user script close');
    assert.doesNotMatch(html, /<\/style><h1>/);

    // The escaped code still evaluates to the original string.
    assert.equal(eval(escapeInlineScript("'</script>' + '<!--'")), '</script><!--');
});

test('module detection: classic by default, module for import/export/top-level await', () => {
    assert.equal(isModuleScript('const a = 1;\nfunction f() {}'), false);
    assert.equal(isModuleScript("import x from './a.js';"), true);
    assert.equal(isModuleScript('let f;\nexport {};'), true);
    assert.equal(isModuleScript("const r = await fetch('a.json');"), true);
    assert.equal(isModuleScript('async function f() { await 1; }\nconst o = { await: 1 };'), false);
    assert.equal(isModuleScript("import('./lazy.js').then(console.log);"), false);
    assert.equal(isModuleScript('// import x from "y"\nconsole.log(1);'), false);
    assert.equal(isModuleScript('console.log(import.meta.url);'), true);

    const moduleHtml = renderCompiledExampleDocument({ html: '', js: "import x from './a.js';\nconsole.log(x);" }, '', [], {});
    assert.match(moduleHtml, /<script type="module">import x/);
    const classicHtml = renderCompiledExampleDocument({ html: '', js: 'console.log(1);' }, '', [], {});
    assert.match(classicHtml, /<script>console\.log\(1\);/);
});

test('TypeScript inline source maps are shipped as a compact line map', () => {
    const { js } = compileScript({ type: 'typescript', content: 'class C {\n  #n: number = 0;\n  run(): void {\n    (null as any).x();\n  }\n}' }, { sourcePath: 'script.ts' });
    const map = extractInlineSourceMapLines(js);
    assert.deepEqual(map.sources, ['script.ts']);
    const generatedLine = js.split('\n').findIndex((line) => line.includes('.x()')) + 1;
    assert.deepEqual(map.lineMap[generatedLine], [0, 4]);

    const html = renderCompiledExampleDocument({ html: '', js, runtimeScriptPath: 'script.ts' }, '', [], {});
    const script = extractBridgeConfig(html).ranges.find((range) => range.kind === 'script');
    assert.equal(script.sourceName, 'learncode-compiled.js');
    assert.equal(script.path, 'script.ts');
    assert.ok(Array.isArray(script.lineMap));
});

test('script-only and style-only documents render a sane page', () => {
    const scriptOnly = renderCompiledExampleDocument({ html: '', css: '', js: 'console.log(1);' }, '', [], { consoleEnabled: true });
    assert.match(scriptOnly, /<body>\n<script>console\.log\(1\);/);
    const styleOnly = renderCompiledExampleDocument({ html: '', css: 'body { background: red; }', js: '' }, '', [], {});
    assert.match(styleOnly, /<style>body \{ background: red; \}/);
    assert.doesNotMatch(styleOnly, /<script>(?!\(0,eval\))/);
});

test('non-blocking diagnostics (type errors, sass warnings) never reach the page', () => {
    const html = renderCompiledExampleDocument({ html: '<p>x</p>', markupType: 'html' }, '', [
        { level: 'error', code: 'typescript-type', message: "TS2322: Type 'string' is not assignable", blocking: false },
        { level: 'warning', code: 'sass-warning', message: 'deprecated', blocking: false },
    ], { consoleEnabled: false });
    assert.doesNotMatch(html, /TS2322/);
    assert.doesNotMatch(html, /deprecated/);

    const blocking = renderCompiledExampleDocument({ html: '<p>x</p>', markupType: 'html' }, '', [
        { level: 'error', code: 'sass-compile-error', message: 'Expected expression.\n  ╷\n3 │ x' },
    ], { consoleEnabled: true });
    assert.match(blocking, /Compile diagnostics/);
    assert.match(blocking, /white-space:pre-wrap/);
});

test('topic paths and shader payloads are encoded safely', () => {
    const html = renderCompiledExampleDocument({ html: '<p>x</p>', markupType: 'html' }, 'ch 1/sec#2/top?3', [], {});
    assert.match(html, /<base href="\/api\/topic\/ch%201\/sec%232\/top%3F3\/assets\/">/);

    const shaderDoc = parseExampleDocument('---\nrenderer: shader\nresolution: 64x64\n---\n\n# Vertex\n\n```vertex\nattribute vec2 a_position;\nvoid main() { gl_Position = vec4(a_position, 0.0, 1.0); }\n```\n\n# Fragment\n\n```fragment\nprecision mediump float;\n// </script><!-- <script>\nvoid main() { gl_FragColor = vec4(1.0); }\n```\n');
    const shaderHtml = renderShaderExampleDocument(shaderDoc, { topicPath: 'a b/c/d', renderId: 1 });
    assert.doesNotMatch(shaderHtml, /\/\/ <\/script>/);
    assert.match(shaderHtml, /\\u003c\/script>/);
    assert.match(shaderHtml, /webglcontextlost/);
    assert.match(shaderHtml, /"assetBase":"\/api\/topic\/a%20b\/c\/d\/assets\/"/);
});

test('compile cache keys do not collide for different documents', () => {
    const keys = new Set();
    for (let index = 0; index < 2000; index += 1) {
        keys.add(createCompileCacheKey({ content: `example ${index}` }));
    }
    assert.equal(keys.size, 2000);
    assert.equal(createCompileCacheKey({ content: 'same' }), createCompileCacheKey({ content: 'same' }));
    assert.match(createCompileCacheKey({ content: 'x' }), /^compile:[0-9a-z]+\.[0-9a-z]+\.[0-9a-z]+$/);
});

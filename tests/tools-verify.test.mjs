import test from 'node:test';
import assert from 'node:assert/strict';
import {
    buildResult,
    classifyResult,
    collectTopicPaths,
    filterExampleFiles,
    formatProblem,
    parseVerifyParams,
    problemsFromCompileDiagnostics,
    problemsFromRuntimeMessages,
    problemsFromStructuralDiagnostics,
    summarizeResults,
} from '../tools/verify-core.js';

const tree = [
    {
        id: 'ch02-html',
        sections: [
            { id: 'sec01-web', topics: [{ id: 'top01-a', path: 'ch02-html/sec01-web/top01-a' }, { id: 'top02-b', path: 'ch02-html/sec01-web/top02-b' }] },
            { id: 'sec02-forms', topics: [{ id: 'top01-c', path: 'ch02-html/sec02-forms/top01-c' }] },
        ],
    },
    { id: 'ch03-css', sections: [{ id: 'sec01-box', topics: [{ id: 'top01-d', path: 'ch03-css/sec01-box/top01-d' }] }] },
];

test('parses URL parameters with sane defaults and bounds', () => {
    assert.deepEqual(parseVerifyParams('?path=/ch02-html/sec01-web/&ms=900&only=03-'), { path: 'ch02-html/sec01-web', ms: 900, only: '03-' });
    assert.deepEqual(parseVerifyParams(''), { path: '', ms: 1500, only: '' });
    assert.equal(parseVerifyParams('?path=x&ms=5').ms, 200);
    assert.equal(parseVerifyParams('?path=x&ms=abc').ms, 1500);
});

test('collects topics for chapter, section and topic paths', () => {
    assert.deepEqual(collectTopicPaths(tree, 'ch02-html'), ['ch02-html/sec01-web/top01-a', 'ch02-html/sec01-web/top02-b', 'ch02-html/sec02-forms/top01-c']);
    assert.deepEqual(collectTopicPaths(tree, 'ch02-html/sec02-forms'), ['ch02-html/sec02-forms/top01-c']);
    assert.deepEqual(collectTopicPaths(tree, 'ch02-html/sec01-web/top02-b'), ['ch02-html/sec01-web/top02-b']);
    assert.deepEqual(collectTopicPaths(tree, 'ch09-missing'), []);
});

test('filters and naturally sorts example files', () => {
    assert.deepEqual(filterExampleFiles(['10-z.md', '02-b.md', 'notes.txt', '01-a.md'], ''), ['01-a.md', '02-b.md', '10-z.md']);
    assert.deepEqual(filterExampleFiles(['03-x.md', '03-y.md', '04-z.md'], '03-'), ['03-x.md', '03-y.md']);
});

test('compile diagnostics: errors only, non-blocking ignored except TypeScript type errors', () => {
    const problems = problemsFromCompileDiagnostics([
        { level: 'error', code: 'sass-compile-error', message: 'Expected expression.\n  ╷\n3 │ x', file: 'styles.scss', line: 3 },
        { level: 'error', code: 'typescript-type', message: "TS2322: Type 'string' is not assignable", file: 'script.ts', line: 2, blocking: false },
        { level: 'error', code: 'other-nonblocking', message: 'ignored', blocking: false },
        { level: 'warning', code: 'sass-warning', message: 'deprecated', blocking: false },
    ]);
    assert.deepEqual(problems.map((problem) => [problem.kind, problem.message, problem.file, problem.line]), [
        ['compile', 'Expected expression.', 'styles.scss', 3],
        ['type-error', "TS2322: Type 'string' is not assignable", 'script.ts', 2],
    ]);
    assert.equal(problemsFromStructuralDiagnostics([{ level: 'error', code: 'missing-markup', message: 'x' }, { level: 'warning', message: 'y' }]).length, 1);
});

test('runtime messages become problems (uncaught, rejection, console.error, assert, loop guard, textures)', () => {
    const problems = problemsFromRuntimeMessages([
        { kind: 'console', level: 'log', text: 'fine' },
        { kind: 'runtime-error', level: 'error', text: "Uncaught TypeError: Cannot read properties of null (reading 'x')", location: { path: 'script.js', line: 3 } },
        { kind: 'runtime-error', level: 'error', text: 'Uncaught RangeError: Possible infinite loop at line 7: while (x) {', location: { path: 'script.js', line: 7 } },
        { kind: 'unhandled-rejection', level: 'error', text: 'Uncaught (in promise) 42' },
        { kind: 'console', level: 'error', method: 'error', text: 'bad', location: { path: 'script.js', line: 9 } },
        { kind: 'console', level: 'error', method: 'assert', text: 'Assertion failed: x', location: { path: 'script.js', line: 10 } },
        { kind: 'dialog-suppressed', level: 'info', text: 'alert("hi") skipped' },
        { kind: 'shader-stats', textures: [{ name: 'u_tex', assetPath: 'noise.png', status: 'error' }, { name: 'u_ok', assetPath: 'ok.png', status: 'ready' }] },
    ]);
    assert.deepEqual(problems.map((problem) => `${problem.kind}@${problem.line}`), [
        'uncaught@3', 'loop-guard@7', 'rejection@null', 'console-error@9', 'assert@10', 'texture@null',
    ]);
});

test('classification: errors, expected stages, not-ready warnings', () => {
    const problem = { kind: 'uncaught', message: 'x', file: 'script.js', line: 1 };
    assert.equal(classifyResult({ stage: '', problems: [problem] }), 'error');
    assert.equal(classifyResult({ stage: 'common-error', problems: [problem] }), 'expected');
    assert.equal(classifyResult({ stage: 'exercise', problems: [problem] }), 'expected');
    assert.equal(classifyResult({ stage: 'final-solution', problems: [] }), 'ok');
    assert.equal(classifyResult({ problems: [], ready: false }), 'warn');

    const notReady = buildResult({ topicPath: 'a/b/c', file: '01.md', problems: [], ready: false });
    assert.equal(notReady.status, 'warn');
    assert.equal(notReady.path, 'a/b/c/examples/01.md');
    assert.equal(notReady.problems[0].kind, 'not-ready');

    const deduped = buildResult({ topicPath: 'a/b/c', file: '02.md', problems: [problem, { ...problem }] });
    assert.equal(deduped.problems.length, 1);
    assert.equal(formatProblem(problem), '[uncaught] script.js:1 x');
});

test('summary counts every status', () => {
    assert.deepEqual(summarizeResults([{ status: 'ok' }, { status: 'error' }, { status: 'expected' }, { status: 'warn' }, { status: 'ok' }]), {
        total: 5, ok: 2, warn: 1, error: 1, expected: 1,
    });
});

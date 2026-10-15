// Pure helpers for tools/verify-examples.js (no DOM access, unit-tested in tests/tools-verify.test.mjs).

export const DEFAULT_OBSERVE_MS = 1500;
export const EXPECTED_PROBLEM_STAGES = new Set(['common-error', 'exercise']);
const LOOP_GUARD_PATTERN = /Possible infinite loop/i;
const MESSAGE_LIMIT = 300;
// Console lines (&logs=1) are compared with expected output, so they keep much more text.
const LOG_LINE_LIMIT = 4000;

export function parseVerifyParams(search = '') {
    const params = new URLSearchParams(search);
    const path = String(params.get('path') || '').trim().replace(/^\/+|\/+$/g, '');
    const rawMs = Number.parseInt(params.get('ms') || '', 10);
    const ms = Number.isFinite(rawMs) ? Math.min(Math.max(rawMs, 200), 20000) : DEFAULT_OBSERVE_MS;
    const only = String(params.get('only') || '').trim();
    const isOn = (name) => ['1', 'true', 'yes'].includes(String(params.get(name) || '').trim().toLowerCase());
    // show=1 keeps the last example on screen (for visual checks) in a frame of w×h CSS pixels.
    const size = (name, fallback) => {
        const value = Number.parseInt(params.get(name) || '', 10);
        return Number.isFinite(value) ? Math.min(Math.max(value, 200), 2400) : fallback;
    };
    // card=1 runs each example like a gallery/theory card: a srcdoc copy with sandbox="allow-scripts" only.
    return { path, ms, only, logs: isOn('logs'), show: isOn('show'), card: isOn('card'), width: size('w', 480), height: size('h', 270) };
}

// Topic paths ("ch/sec/top") under a chapter, section or topic path, in tree order.
export function collectTopicPaths(tree = [], path = '') {
    const [chapterId, sectionId, topicId] = String(path || '').split('/').filter(Boolean);
    const topics = [];

    (Array.isArray(tree) ? tree : []).forEach((chapter) => {
        if (chapterId && chapter.id !== chapterId) return;
        (chapter.sections || []).forEach((section) => {
            if (sectionId && section.id !== sectionId) return;
            (section.topics || []).forEach((topic) => {
                if (topicId && topic.id !== topicId) return;
                topics.push(topic.path || `${chapter.id}/${section.id}/${topic.id}`);
            });
        });
    });

    return topics;
}

export function filterExampleFiles(files = [], only = '') {
    return (Array.isArray(files) ? files : [])
        .map((file) => (typeof file === 'string' ? file : file?.filename || file?.name || ''))
        .filter((file) => file.toLowerCase().endsWith('.md'))
        .filter((file) => !only || file.startsWith(only))
        .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

function firstLine(message = '') {
    const line = String(message ?? '').split('\n').find((entry) => entry.trim()) || '';
    return line.length > MESSAGE_LIMIT ? `${line.slice(0, MESSAGE_LIMIT)}…` : line;
}

function toLine(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.trunc(number) : null;
}

export function problemsFromStructuralDiagnostics(diagnostics = []) {
    return (Array.isArray(diagnostics) ? diagnostics : [])
        .filter((diagnostic) => diagnostic?.level === 'error')
        .map((diagnostic) => ({
            kind: 'structure',
            code: diagnostic.code || '',
            message: firstLine(diagnostic.message),
            file: diagnostic.path || diagnostic.file || '',
            line: toLine(diagnostic.line),
        }));
}

// Compile errors; non-blocking diagnostics are ignored except TypeScript type errors.
export function problemsFromCompileDiagnostics(diagnostics = []) {
    return (Array.isArray(diagnostics) ? diagnostics : [])
        .filter((diagnostic) => diagnostic?.level === 'error')
        .filter((diagnostic) => diagnostic.blocking !== false || diagnostic.code === 'typescript-type')
        .map((diagnostic) => ({
            kind: diagnostic.code === 'typescript-type' ? 'type-error' : 'compile',
            code: diagnostic.code || '',
            message: firstLine(diagnostic.message),
            file: diagnostic.file || '',
            line: toLine(diagnostic.line),
        }));
}

// Problems reported by the preview runtime (postMessage payloads from the iframe).
export function problemsFromRuntimeMessages(messages = []) {
    const problems = [];

    (Array.isArray(messages) ? messages : []).forEach((message) => {
        if (!message || typeof message !== 'object') return;
        const text = typeof message.text === 'string'
            ? message.text
            : Array.isArray(message.values) ? message.values.join(' ') : '';
        const location = message.location && typeof message.location === 'object' ? message.location : null;
        const base = {
            message: firstLine(text),
            file: location?.path || message.path || '',
            line: toLine(location?.line ?? message.line),
        };

        if (message.kind === 'runtime-error') {
            problems.push({ ...base, kind: LOOP_GUARD_PATTERN.test(text) ? 'loop-guard' : 'uncaught' });
            return;
        }
        if (message.kind === 'unhandled-rejection') {
            problems.push({ ...base, kind: LOOP_GUARD_PATTERN.test(text) ? 'loop-guard' : 'rejection' });
            return;
        }
        if (message.kind === 'console' && message.level === 'error') {
            problems.push({ ...base, kind: message.method === 'assert' ? 'assert' : 'console-error' });
        }
        if (message.kind === 'shader-stats' && Array.isArray(message.textures)) {
            message.textures
                .filter((texture) => texture?.status === 'error' || texture?.status === 'upload-error')
                .forEach((texture) => problems.push({
                    kind: 'texture',
                    message: `Texture "${texture.name}" (${texture.assetPath}) failed to load`,
                    file: texture.assetPath || '',
                    line: null,
                }));
        }
    });

    return problems;
}

export function dedupeProblems(problems = []) {
    const seen = new Set();
    return problems.filter((problem) => {
        const key = `${problem.kind}|${problem.file}|${problem.line}|${problem.message}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * status:
 * - error: unexpected problems
 * - expected: problems in a `common-error` / `exercise` example (probably intentional)
 * - warn: no problems but the page never reported that its runtime booted
 * - ok
 */
// Console output of a run as plain text lines ("log: ✓ total"), for checking what an example prints
// (exercise self-checks, audits). Only used when the harness runs with &logs=1.
export function consoleLinesFromMessages(messages = [], limit = 200) {
    const lines = [];
    (Array.isArray(messages) ? messages : []).forEach((message) => {
        if (!message || typeof message !== 'object' || message.kind !== 'console') return;
        if (message.method === 'clear') return;
        const text = typeof message.text === 'string'
            ? message.text
            : Array.isArray(message.values) ? message.values.join(' ') : '';
        lines.push(`${message.method || message.level || 'log'}: ${text}`.slice(0, LOG_LINE_LIMIT));
    });
    return lines.slice(0, limit);
}

export function classifyResult({ stage = '', problems = [], ready = true } = {}) {
    const unique = dedupeProblems(problems);
    if (unique.length > 0) {
        return EXPECTED_PROBLEM_STAGES.has(String(stage || '').toLowerCase()) ? 'expected' : 'error';
    }
    return ready ? 'ok' : 'warn';
}

export function buildResult({ topicPath = '', file = '', stage = '', problems = [], ready = true, mode = '', durationMs = 0, note = '', logs = null } = {}) {
    const unique = dedupeProblems(problems);
    const result = {
        path: `${topicPath}/examples/${file}`,
        topicPath,
        file,
        stage,
        status: classifyResult({ stage, problems: unique, ready }),
        ready: Boolean(ready),
        mode,
        durationMs: Math.round(durationMs),
        problems: unique,
    };
    if (!ready && unique.length === 0) {
        result.problems = [{ kind: 'not-ready', message: 'The preview runtime never reported ready (page did not boot?)', file: '', line: null }];
    }
    if (note) result.note = note;
    if (Array.isArray(logs)) result.logs = logs;
    return result;
}

export function summarizeResults(results = []) {
    const summary = { total: 0, ok: 0, warn: 0, error: 0, expected: 0 };
    (Array.isArray(results) ? results : []).forEach((result) => {
        summary.total += 1;
        if (Object.prototype.hasOwnProperty.call(summary, result.status)) summary[result.status] += 1;
    });
    return summary;
}

export function formatProblem(problem = {}) {
    const where = problem.line ? `${problem.file || '?'}:${problem.line}` : problem.file || '';
    return `[${problem.kind}]${where ? ` ${where}` : ''} ${problem.message}`.trim();
}

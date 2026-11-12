// Pure helpers for tools/verify-examples.ts (no DOM access, unit-tested in tests/tools-verify.test.ts).
//
// The harness turns three streams of untrusted data into one list of "problems" per example: parse
// diagnostics, compile diagnostics and the postMessage payloads of the preview runtime (those come
// from learner code running in an iframe). Every helper therefore reads loosely typed input and
// guards each field, which is why the input types below (`Partial<Diagnostic>`, `RuntimeMessageLike`)
// have only optional properties.

import type { Diagnostic } from '../src/types/diagnostics.ts';

/** Default time (ms) the harness lets an example run before collecting what it reported. */
export const DEFAULT_OBSERVE_MS = 1500;
/** Stages whose problems are probably intentional: a common-error demo or an unsolved exercise. */
export const EXPECTED_PROBLEM_STAGES = new Set(['common-error', 'exercise']);
const LOOP_GUARD_PATTERN = /Possible infinite loop/i;
const MESSAGE_LIMIT = 300;
// Console lines (&logs=1) are compared with expected output, so they keep much more text.
const LOG_LINE_LIMIT = 4000;

/** Where a problem came from: `structure` (parse), `compile`/`type-error`, a runtime report, or the harness itself. */
export type ProblemKind =
    | 'structure'
    | 'compile'
    | 'type-error'
    | 'uncaught'
    | 'rejection'
    | 'loop-guard'
    | 'console-error'
    | 'assert'
    | 'texture'
    | 'not-ready'
    | 'harness';

/** One thing that went wrong while running an example. */
export interface VerifyProblem {
    kind: ProblemKind;
    /** First line of the message, cut to 300 characters. */
    message: string;
    /** Empty when the source did not name a file. */
    file: string;
    /** 1-based line, or null when unknown. */
    line: number | null;
    /** Diagnostic code; only present on problems that come from parse or compile diagnostics. */
    code?: string;
}

/** `ok`: nothing reported. `warn`: nothing reported but the runtime never booted. `error`: unexpected problems. `expected`: problems in a common-error/exercise example. */
export type VerifyStatus = 'ok' | 'warn' | 'error' | 'expected';

/** The outcome of running one example, as published in `window.__verifyResults`. */
export interface VerifyResult {
    /** `<topicPath>/examples/<file>`. */
    path: string;
    topicPath: string;
    file: string;
    stage: string;
    status: VerifyStatus;
    /** Whether the preview runtime reported that it booted. */
    ready: boolean;
    /** How the example was rendered: 'hosted', 'srcdoc', 'card' or 'shader-srcdoc' ('' when it never got that far). */
    mode: string;
    durationMs: number;
    problems: VerifyProblem[];
    note?: string;
    /** Console lines of the run; only present when the harness ran with `&logs=1`. */
    logs?: string[];
}

/** Counts of results by status. */
export interface VerifySummary {
    total: number;
    ok: number;
    warn: number;
    error: number;
    expected: number;
}

/** The texture entry of a `shader-stats` runtime message. */
export interface TextureStatusLike {
    name?: string;
    assetPath?: string;
    status?: string;
}

/**
 * A `postMessage` payload from the preview runtime as the helpers read it. Every `PreviewFrameMessage`
 * of src/types/runtime.ts fits; the fields are all optional because the helpers also take partial
 * messages and check each field before using it.
 */
export interface RuntimeMessageLike {
    kind?: string;
    level?: string;
    method?: string;
    text?: unknown;
    values?: unknown[];
    path?: string | null;
    line?: number | string | null;
    location?: { path?: string; line?: number | string | null } | null;
    textures?: TextureStatusLike[];
}

/** Query parameters of the harness page, validated and clamped. */
export interface VerifyParams {
    /** `chapter[/section[/topic]]` without leading or trailing slashes. */
    path: string;
    /** Observation time per example in ms (200..20000). */
    ms: number;
    /** Only examples whose filename starts with this prefix. */
    only: string;
    logs: boolean;
    show: boolean;
    card: boolean;
    /** Frame size in CSS pixels for `show=1` (200..2400). */
    width: number;
    height: number;
}

/** The part of the material tree that `collectTopicPaths` walks. */
export interface TopicTreeLike {
    id: string;
    sections?: Array<{
        id: string;
        topics?: Array<{ id: string; path?: string }>;
    }>;
}

/** Options of `buildResult`. */
export interface BuildResultOptions {
    topicPath?: string;
    file?: string;
    stage?: string;
    problems?: VerifyProblem[];
    ready?: boolean;
    mode?: string;
    durationMs?: number;
    note?: string;
    /** Console lines; any array (even empty) makes the result carry `logs`. */
    logs?: string[] | null;
}

/** Reads and validates the harness query string (`path`, `ms`, `only`, `logs`, `show`, `card`, `w`, `h`). */
export function parseVerifyParams(search = ''): VerifyParams {
    const params = new URLSearchParams(search);
    const path = String(params.get('path') || '').trim().replace(/^\/+|\/+$/g, '');
    const rawMs = Number.parseInt(params.get('ms') || '', 10);
    const ms = Number.isFinite(rawMs) ? Math.min(Math.max(rawMs, 200), 20000) : DEFAULT_OBSERVE_MS;
    const only = String(params.get('only') || '').trim();
    const isOn = (name: string): boolean => ['1', 'true', 'yes'].includes(String(params.get(name) || '').trim().toLowerCase());
    // show=1 keeps the last example on screen (for visual checks) in a frame of w×h CSS pixels.
    const size = (name: string, fallback: number): number => {
        const value = Number.parseInt(params.get(name) || '', 10);
        return Number.isFinite(value) ? Math.min(Math.max(value, 200), 2400) : fallback;
    };
    // card=1 runs each example like a gallery/theory card: a srcdoc copy with sandbox="allow-scripts" only.
    return { path, ms, only, logs: isOn('logs'), show: isOn('show'), card: isOn('card'), width: size('w', 480), height: size('h', 270) };
}

/** Topic paths ("ch/sec/top") under a chapter, section or topic path, in tree order. */
export function collectTopicPaths(tree: TopicTreeLike[] = [], path = ''): string[] {
    const [chapterId, sectionId, topicId] = String(path || '').split('/').filter(Boolean);
    const topics: string[] = [];

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

/** Example filenames (.md) from an `/examples` listing, optionally limited to a prefix, in natural order. */
export function filterExampleFiles(files: Array<string | { filename?: string; name?: string } | null> = [], only = ''): string[] {
    return (Array.isArray(files) ? files : [])
        .map((file) => (typeof file === 'string' ? file : file?.filename || file?.name || ''))
        .filter((file) => file.toLowerCase().endsWith('.md'))
        .filter((file) => !only || file.startsWith(only))
        .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

function firstLine(message: unknown = ''): string {
    const line = String(message ?? '').split('\n').find((entry) => entry.trim()) || '';
    return line.length > MESSAGE_LIMIT ? `${line.slice(0, MESSAGE_LIMIT)}…` : line;
}

function toLine(value: unknown): number | null {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.trunc(number) : null;
}

/** Parse (structural) diagnostics of the example document: errors only. */
export function problemsFromStructuralDiagnostics(diagnostics: Array<Partial<Diagnostic>> = []): VerifyProblem[] {
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

/** Compile errors; non-blocking diagnostics are ignored except TypeScript type errors. */
export function problemsFromCompileDiagnostics(diagnostics: Array<Partial<Diagnostic>> = []): VerifyProblem[] {
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

/** Problems reported by the preview runtime (postMessage payloads from the iframe). */
export function problemsFromRuntimeMessages(messages: Array<RuntimeMessageLike | null | undefined> = []): VerifyProblem[] {
    const problems: VerifyProblem[] = [];

    (Array.isArray(messages) ? messages : []).forEach((message) => {
        if (!message || typeof message !== 'object') return;
        const text = typeof message.text === 'string'
            ? message.text
            : Array.isArray(message.values) ? message.values.join(' ') : '';
        const location = message.location && typeof message.location === 'object' ? message.location : null;
        const base: Pick<VerifyProblem, 'message' | 'file' | 'line'> = {
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

/** Drops repeated problems (same kind, file, line and message), keeping the first. */
export function dedupeProblems(problems: VerifyProblem[] = []): VerifyProblem[] {
    const seen = new Set();
    return problems.filter((problem) => {
        const key = `${problem.kind}|${problem.file}|${problem.line}|${problem.message}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * Console output of a run as plain text lines ("log: ✓ total"), for checking what an example prints
 * (exercise self-checks, audits). Only used when the harness runs with &logs=1.
 */
export function consoleLinesFromMessages(messages: Array<RuntimeMessageLike | null | undefined> = [], limit = 200): string[] {
    const lines: string[] = [];
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

/**
 * Status of a run:
 * - error: unexpected problems
 * - expected: problems in a `common-error` / `exercise` example (probably intentional)
 * - warn: no problems but the page never reported that its runtime booted
 * - ok
 */
export function classifyResult({ stage = '', problems = [], ready = true }: { stage?: string; problems?: VerifyProblem[]; ready?: boolean } = {}): VerifyStatus {
    const unique = dedupeProblems(problems);
    if (unique.length > 0) {
        return EXPECTED_PROBLEM_STAGES.has(String(stage || '').toLowerCase()) ? 'expected' : 'error';
    }
    return ready ? 'ok' : 'warn';
}

/** Assembles the result of one example: classifies it and adds a "not-ready" problem when the runtime never booted. */
export function buildResult({ topicPath = '', file = '', stage = '', problems = [], ready = true, mode = '', durationMs = 0, note = '', logs = null }: BuildResultOptions = {}): VerifyResult {
    const unique = dedupeProblems(problems);
    const result: VerifyResult = {
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

/** Counts results by status (only `status` is read). */
export function summarizeResults(results: Array<Pick<VerifyResult, 'status'>> = []): VerifySummary {
    const summary: VerifySummary = { total: 0, ok: 0, warn: 0, error: 0, expected: 0 };
    (Array.isArray(results) ? results : []).forEach((result) => {
        summary.total += 1;
        if (Object.prototype.hasOwnProperty.call(summary, result.status)) summary[result.status] += 1;
    });
    return summary;
}

/** One-line description of a problem: `[kind] file:line message`. */
export function formatProblem(problem: Partial<VerifyProblem> = {}): string {
    const where = problem.line ? `${problem.file || '?'}:${problem.line}` : problem.file || '';
    return `[${problem.kind}]${where ? ` ${where}` : ''} ${problem.message}`.trim();
}

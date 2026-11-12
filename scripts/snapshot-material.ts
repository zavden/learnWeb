#!/usr/bin/env node
// Regression snapshot of everything the app derives from material/.
//
// For every example it records a hash of each pipeline stage (parse → metadata → serialize →
// compile → rendered preview documents) and for every main.md the theory pipeline (exercise
// references → embeds → rendered HTML and documents). Two snapshots taken before and after a
// change to the app must be identical unless the change was meant to alter that stage.
//
// Usage:
//   node scripts/snapshot-material.ts --out before.json            write a snapshot
//   node scripts/snapshot-material.ts --compare before.json        compare with a snapshot
//   node scripts/snapshot-material.ts [path ...]                   limit to chapters/sections/topics
//   ... --filter 05-grid --dump out/                               also write the raw outputs
//   npm run snapshot:material -- --compare before.json             the same through npm
//
// The preview runtime (src/utils/renderer/runtimeBridgeRuntime) is replaced by a placeholder in
// rendered documents and hashed once under "runtime#source", so editing the runtime shows up as a
// single difference instead of one per example.
//
// Compiles every example once in the isolated worker (one CPU core, about a minute for a course of
// 3000 examples). Exit code 1 when --compare finds differences.
//
// The client modules call `fetch('/api/…')`, so this script replaces `globalThis.fetch` with a local
// stand-in that answers only `POST /api/compile` and `GET /api/topic/.../examples/<file>` from disk
// and the compiler; it never talks to server.ts. A snapshot entry is `<sha256 prefix>:<length>` of
// the stage output, keyed `<topic path>/<file>#<stage>`.

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
    buildExampleDocument,
    getExampleEditorialMetadata,
    getExampleStage,
    getExerciseConfig,
    getShaderConfig,
    hasBlockingDiagnostics,
    isShaderDocument,
    parseExampleDocument,
} from '../src/utils/markdown.ts';
import { createCompileCacheKey } from '../src/utils/compileCache.ts';
import { buildCompiledScriptFiles, buildCompiledStyleFiles } from '../src/utils/compiledStyleView.ts';
import { compileExampleDocumentIsolated, shutdownIsolatedCompiler } from '../src/utils/compiler/isolatedCompiler.ts';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../src/utils/exampleRenderer.ts';
import { buildMaterialTree } from '../src/utils/materialTree.ts';
import { errorMessage } from '../src/utils/errors.ts';
import type { CompileRequest, CompileResponse } from '../src/types/compile.ts';
import type { ExampleDocument } from '../src/types/document.ts';
import type { TheoryExerciseEmbeds } from '../src/types/theory.ts';
import { buildRuntimeBridgeScriptBody } from '../src/utils/renderer/runtimeBridge.ts';
import { validateShaderPreviewDocument } from '../src/utils/shaderPreviewDiagnostics.ts';
import { extractTheoryExerciseReferences, loadTheoryExerciseEmbeds } from '../src/utils/theoryExerciseEmbeds.ts';
import {
    renderTheoryExportDocument,
    renderTheoryHtml,
    renderTheoryPreviewDocument,
} from '../src/utils/theoryRenderer.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MATERIAL_DIR = path.join(ROOT, 'material');

/** Removes `name <value>` from `args` and returns the value ('' when the option is absent). */
function readOption(args: string[], name: string): string {
    const index = args.indexOf(name);
    if (index === -1) return '';
    const value = args[index + 1] || '';
    args.splice(index, 2);
    return value;
}

const args = process.argv.slice(2);
const outFile = readOption(args, '--out');
const compareFile = readOption(args, '--compare');
const filter = readOption(args, '--filter');
const dumpDir = readOption(args, '--dump');
const targets = args.filter((arg) => !arg.startsWith('--')).map((target) => path.resolve(target));

// ── Runtime placeholder ──────────────────────────────────────────────────────────────────────────

const RUNTIME_MARKER = '@@CONFIG@@';
const runtimeBody = buildRuntimeBridgeScriptBody(RUNTIME_MARKER);
const RUNTIME_SOURCE_JSON = runtimeBody.slice('(0,eval)('.length, runtimeBody.length - `)(${RUNTIME_MARKER});`.length);
if (!RUNTIME_SOURCE_JSON.startsWith('"') || !RUNTIME_SOURCE_JSON.endsWith('"')) {
    throw new Error('snapshot-material: the runtime bridge script no longer has the expected shape.');
}

function withoutRuntime(text: string): string {
    return typeof text === 'string' ? text.split(RUNTIME_SOURCE_JSON).join('"<learnweb-runtime>"') : text;
}

// ── Snapshot store ───────────────────────────────────────────────────────────────────────────────

/** `<topic path>/<file>#<stage>` → `<hash>:<length>`. */
const snapshot: Record<string, string> = {};

/** Stores the hash of `value` (its JSON text unless it is a string) and, with `--dump`, the raw text. */
function record(key: string, value: unknown): void {
    const text = typeof value === 'string' ? value : JSON.stringify(value ?? null);
    snapshot[key] = `${crypto.createHash('sha256').update(text).digest('hex').slice(0, 20)}:${text.length}`;
    if (dumpDir && (!filter || key.includes(filter))) {
        const file = path.join(dumpDir, key.replace(/[^a-zA-Z0-9._#-]+/g, '_'));
        fs.mkdirSync(dumpDir, { recursive: true });
        fs.writeFileSync(file, text);
    }
}

/** The result of `produce()`, or the text `ERROR: <message>` when it throws, so a failing stage is recorded instead of aborting the run. */
function attempt<T>(produce: () => T): T | string {
    try {
        return produce();
    } catch (error) {
        return `ERROR: ${errorMessage(error)}`;
    }
}

// ── A local stand-in for the API (the client modules call fetch('/api/…')) ───────────────────────

const compileCache = new Map<string, Promise<CompileResponse>>();

/** What `POST /api/compile` would answer, compiled once per distinct document. */
function compileDocument(documentModel: ExampleDocument): Promise<CompileResponse> {
    const cacheKey = createCompileCacheKey({ document: documentModel });
    if (!compileCache.has(cacheKey)) {
        const compiled = compileExampleDocumentIsolated(documentModel);
        compileCache.set(
            cacheKey,
            compiled.then((result) => ({
                document: documentModel,
                compiledDocument: result.compiledDocument,
                compileDiagnostics: result.compileDiagnostics,
                compileMeta: { cacheKey, cacheStatus: 'miss' },
            })),
        );
    }
    return compileCache.get(cacheKey)!; // set just above when it was missing
}

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

globalThis.fetch = async (input: string | URL | Request, init: RequestInit = {}): Promise<Response> => {
    const url = new URL(String(input), 'http://snapshot.invalid');
    const segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);

    if (url.pathname === '/api/compile' && init.method === 'POST') {
        const payload: CompileRequest = JSON.parse(String(init.body || '{}')); // the API client always sends JSON text
        return jsonResponse(await compileDocument(payload.document || parseExampleDocument(payload.content || '')));
    }

    if (segments.length === 7 && segments[0] === 'api' && segments[1] === 'topic' && segments[5] === 'examples') {
        const file = path.join(MATERIAL_DIR, segments[2], segments[3], segments[4], 'examples', segments[6]);
        if (!file.startsWith(MATERIAL_DIR) || !fs.existsSync(file))
            return jsonResponse({ error: 'File not found' }, 404);
        return jsonResponse({ content: fs.readFileSync(file, 'utf-8') });
    }

    return jsonResponse({ error: `snapshot-material: no stand-in for ${url.pathname}` }, 404);
};

// ── Walk material/ ───────────────────────────────────────────────────────────────────────────────

function listDirs(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];
    return fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

/** A topic folder selected by the command-line paths. */
interface TopicRef {
    dir: string;
    /** `chapter/section/topic`. */
    topicPath: string;
}

function listTopics(): TopicRef[] {
    const topics: TopicRef[] = [];
    for (const chapter of listDirs(MATERIAL_DIR)) {
        for (const section of listDirs(path.join(MATERIAL_DIR, chapter))) {
            for (const topic of listDirs(path.join(MATERIAL_DIR, chapter, section))) {
                const dir = path.join(MATERIAL_DIR, chapter, section, topic);
                const selected =
                    targets.length === 0 ||
                    targets.some((target) => dir === target || dir.startsWith(`${target}${path.sep}`));
                if (selected) topics.push({ dir, topicPath: `${chapter}/${section}/${topic}` });
            }
        }
    }
    return topics;
}

function listExamples(topicDir: string): string[] {
    const dir = path.join(topicDir, 'examples');
    if (!fs.existsSync(dir)) return [];
    return fs
        .readdirSync(dir)
        .filter((name) => name.toLowerCase().endsWith('.md') && name.toLowerCase() !== 'readme.md')
        .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

// ── Stages ───────────────────────────────────────────────────────────────────────────────────────

async function snapshotExample(topicPath: string, topicDir: string, filename: string): Promise<void> {
    const key = `${topicPath}/examples/${filename}`;
    const content = fs.readFileSync(path.join(topicDir, 'examples', filename), 'utf-8');
    const documentModel: ExampleDocument = parseExampleDocument(content);

    record(`${key}#parse`, documentModel);
    record(
        `${key}#meta`,
        attempt(() => ({
            blocking: hasBlockingDiagnostics(documentModel),
            editorial: getExampleEditorialMetadata(documentModel),
            exercise: getExerciseConfig(documentModel),
            shader: isShaderDocument(documentModel) ? getShaderConfig(documentModel) : null,
            stage: getExampleStage(documentModel),
        })),
    );
    record(
        `${key}#serialize`,
        attempt(() => buildExampleDocument(documentModel)),
    );

    if (isShaderDocument(documentModel)) {
        const structural = documentModel.diagnostics || [];
        const diagnostics = attempt(() =>
            structural.some((diagnostic) => diagnostic.level === 'error')
                ? []
                : validateShaderPreviewDocument(documentModel),
        );
        record(`${key}#shader-diagnostics`, diagnostics);
        record(
            `${key}#render-preview`,
            attempt(() =>
                withoutRuntime(
                    renderShaderExampleDocument(documentModel, {
                        consoleEnabled: false,
                        diagnostics: [...structural, ...(Array.isArray(diagnostics) ? diagnostics : [])],
                        renderId: 1,
                        topicPath,
                    }),
                ),
            ),
        );
        record(
            `${key}#render-card`,
            attempt(() =>
                withoutRuntime(
                    renderShaderExampleDocument(documentModel, {
                        diagnostics: structural,
                        renderId: 0,
                        shaderControls: { paused: true, stillFrame: true },
                        topicPath,
                    }),
                ),
            ),
        );
        return;
    }

    let result: CompileResponse;
    try {
        result = await compileDocument(documentModel);
    } catch (error) {
        record(`${key}#compile`, `ERROR: ${errorMessage(error)}`);
        return;
    }

    const diagnostics = result.compileDiagnostics || [];
    const renderOptions = { consoleEnabled: true, renderId: 1, suppressDialogs: false };
    record(`${key}#compile`, { compiledDocument: result.compiledDocument, compileDiagnostics: diagnostics });
    record(
        `${key}#compiled-views`,
        attempt(() => ({
            scripts: buildCompiledScriptFiles(documentModel, result),
            styles: buildCompiledStyleFiles(documentModel, result),
        })),
    );
    record(
        `${key}#render-hosted`,
        attempt(() =>
            withoutRuntime(
                renderCompiledExampleDocument(result.compiledDocument, topicPath, diagnostics, {
                    ...renderOptions,
                    hosted: true,
                }),
            ),
        ),
    );
    record(
        `${key}#render-srcdoc`,
        attempt(() =>
            withoutRuntime(
                renderCompiledExampleDocument(result.compiledDocument, topicPath, diagnostics, renderOptions),
            ),
        ),
    );
    record(
        `${key}#render-card`,
        attempt(() => withoutRuntime(renderCompiledExampleDocument(result.compiledDocument, topicPath, diagnostics))),
    );
}

async function snapshotTheory(topicPath: string, topicDir: string): Promise<void> {
    const file = path.join(topicDir, 'main.md');
    if (!fs.existsSync(file)) return;

    const key = `${topicPath}/main.md`;
    const content = fs.readFileSync(file, 'utf-8');
    record(
        `${key}#references`,
        attempt(() => extractTheoryExerciseReferences(content)),
    );

    let exerciseEmbeds: TheoryExerciseEmbeds = {};
    try {
        exerciseEmbeds = await loadTheoryExerciseEmbeds(topicPath, content);
        for (const embed of Object.values(exerciseEmbeds)) embed.previewSrcdoc = withoutRuntime(embed.previewSrcdoc);
        record(`${key}#embeds`, exerciseEmbeds);
    } catch (error) {
        record(`${key}#embeds`, `ERROR: ${errorMessage(error)}`);
    }

    record(
        `${key}#html`,
        attempt(() => renderTheoryHtml(content, { exerciseEmbeds, topicPath })),
    );
    record(
        `${key}#preview-document`,
        attempt(() => withoutRuntime(renderTheoryPreviewDocument(content, { exerciseEmbeds, renderId: 1, topicPath }))),
    );
    // The export starts with a comment that carries the export time.
    record(
        `${key}#export-document`,
        attempt(() =>
            withoutRuntime(renderTheoryExportDocument(content, { exerciseEmbeds, topicPath })).replace(
                /^<!-- Exported from LearnWeb — .*? -->/,
                '<!-- Exported from LearnWeb -->',
            ),
        ),
    );
}

// ── Main ─────────────────────────────────────────────────────────────────────────────────────────

const startedAt = Date.now();
const topics = listTopics();
let examples = 0;

record('runtime#source', RUNTIME_SOURCE_JSON);
if (targets.length === 0) {
    record(
        'material#tree',
        attempt(() =>
            buildMaterialTree(MATERIAL_DIR, {
                hiddenStateFile: path.join(MATERIAL_DIR, '.no-hidden-state'),
                includeHidden: true,
            }),
        ),
    );
}

for (const [index, topic] of topics.entries()) {
    for (const filename of listExamples(topic.dir)) {
        await snapshotExample(topic.topicPath, topic.dir, filename);
        examples += 1;
    }
    await snapshotTheory(topic.topicPath, topic.dir);
    if ((index + 1) % 25 === 0) console.error(`… ${index + 1}/${topics.length} topics, ${examples} examples`);
}

await shutdownIsolatedCompiler();

const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
console.log(
    `Snapshot: ${topics.length} topics, ${examples} examples, ${Object.keys(snapshot).length} entries in ${seconds}s`,
);

if (outFile) {
    fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
    fs.writeFileSync(outFile, `${JSON.stringify(snapshot, null, 1)}\n`);
    console.log(`Written to ${outFile}`);
}

if (compareFile) {
    const expected: Record<string, string> = JSON.parse(fs.readFileSync(compareFile, 'utf-8'));
    const scoped = targets.length > 0;
    const differences: string[] = [];
    for (const [key, value] of Object.entries(snapshot)) {
        if (!(key in expected)) differences.push(`+ ${key} (new entry)`);
        else if (expected[key] !== value) differences.push(`≠ ${key}  ${expected[key]} → ${value}`);
    }
    if (!scoped) {
        for (const key of Object.keys(expected)) {
            if (!(key in snapshot)) differences.push(`- ${key} (missing entry)`);
        }
    }

    if (differences.length === 0) {
        console.log(`Identical to ${compareFile} (${Object.keys(snapshot).length} entries compared)`);
    } else {
        const stages: Record<string, number> = {};
        for (const line of differences) {
            const stage = line.split(' ')[1].split('#')[1] || '?';
            stages[stage] = (stages[stage] || 0) + 1;
        }
        console.log(differences.slice(0, 60).join('\n'));
        if (differences.length > 60) console.log(`… and ${differences.length - 60} more`);
        console.log(`\n${differences.length} differences by stage: ${JSON.stringify(stages)}`);
        process.exitCode = 1;
    }
}

// Runtime verification harness for course examples (dev tool, not linked from the app).
// Usage: http://localhost:5174/tools/verify-examples.html?path=ch02-html/sec01-...&ms=1500&only=03-
// (&logs=1 console lines, &show=1&w=&h= keep the last frame on screen, &card=1 run like a gallery card)
//
// Runs every example of a chapter/section/topic through the real preview pipeline, one at a time in a
// single iframe, and collects compile diagnostics plus runtime problems reported by the preview bridge.
//
// Page: tools/verify-examples.html (Vite serves it; it needs the API server on :3001 like the app).
// The pure parts (query parameters, diagnostics → problems, classification) live in verify-core.ts.
// A browser driver (the course workflow) starts the page with the query parameters above and reads
// what the page publishes on `window`:
//   __verifyDone     true when the run ended (also when it stopped or failed before starting)
//   __verifyResults  one VerifyResult per example, in run order
//   __verifyUrls     "ch/sec/top/file.md" → hosted preview URL, to open an example at full size
import { fetchExample, fetchExamples, fetchTree } from '../src/utils/api.ts';
import { compileExample } from '../src/utils/compileClient.ts';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../src/utils/exampleRenderer.ts';
import { getExampleStage, getShaderConfig, isShaderDocument, parseExampleDocument } from '../src/utils/markdown.ts';
import {
    HOSTED_PREVIEW_SANDBOX,
    SRCDOC_PREVIEW_SANDBOX,
    publishPreviewDocument,
} from '../src/utils/renderer/previewHost.ts';
import type { Diagnostic } from '../src/types/diagnostics.ts';
import type { ExampleDocument } from '../src/types/document.ts';
import type { PreviewFrameMessage } from '../src/types/runtime.ts';
import { validateShaderPreviewDocument } from '../src/utils/shaderPreviewDiagnostics.ts';
import { byId } from '../src/utils/dom.ts';
import { errorMessage } from '../src/utils/errors.ts';
import {
    type RuntimeMessageLike,
    type VerifyProblem,
    type VerifyResult,
    buildResult,
    collectTopicPaths,
    consoleLinesFromMessages,
    filterExampleFiles,
    formatProblem,
    parseVerifyParams,
    problemsFromCompileDiagnostics,
    problemsFromRuntimeMessages,
    problemsFromStructuralDiagnostics,
    summarizeResults,
} from './verify-core.ts';

const FRAME_ALLOW =
    'fullscreen *; clipboard-read *; clipboard-write *; autoplay *; geolocation *; camera *; microphone *; display-capture *; screen-wake-lock *; web-share *; gamepad *; picture-in-picture *';
const READY_GRACE_MS = 3000;
// Gallery and inline theory cards: srcdoc copies without allow-forms/popups/downloads (origin "null").
const CARD_SANDBOX = 'allow-scripts';

/** The parsed document plus the key under which `__verifyUrls` stores its hosted URL (see `verifyExample`). */
type VerifiedDocument = ExampleDocument & { __verifyFile?: string };

/** What the harness publishes on `window` for the browser driver (described here instead of with `declare global`). */
interface VerifyGlobals {
    __verifyDone: boolean;
    __verifyUrls: Record<string, string>;
    __verifyResults: VerifyResult[];
}

/** Any message that reaches this window, read only as far as `source` and `renderId`, which tell whose it is. */
interface PreviewEnvelope extends RuntimeMessageLike {
    source?: string;
    renderId?: number;
}

/** What is known about the example that is running now. */
interface RunState {
    iframe: HTMLIFrameElement;
    /** Run like a gallery card (srcdoc, `allow-scripts` only). */
    card: boolean;
    /** Runtime messages received from this run's iframe. */
    messages: PreviewFrameMessage[];
    /** How the example was rendered (see `VerifyResult.mode`). */
    mode: string;
    /** The runtime reported that it booted. */
    ready: boolean;
    /** Identifies this render in the runtime messages, so late messages of an earlier example are ignored. */
    renderId: number;
}

// The one assertion: the properties are assigned right below, before anything reads them.
const verifyWindow = window as unknown as Window & VerifyGlobals;

const elements = {
    status: byId('verify-status'),
    summary: byId('verify-summary'),
    rows: byId<HTMLTableSectionElement>('verify-rows'),
    frameHost: byId('verify-frame-host'),
    copy: byId<HTMLButtonElement>('verify-copy'),
    stop: byId<HTMLButtonElement>('verify-stop'),
};

verifyWindow.__verifyDone = false;
// Hosted preview URL of each example ("ch/sec/top/file.md" → URL), to open one at full size.
verifyWindow.__verifyUrls = {};
verifyWindow.__verifyResults = [];

let current: RunState | null = null;
let renderSequence = Math.floor(Date.now() / 1000) % 100000;
let stopRequested = false;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function setStatus(text: string): void {
    elements.status.textContent = text;
}

function renderSummary(): void {
    const summary = summarizeResults(verifyWindow.__verifyResults);
    elements.summary.textContent = `${summary.total} examples · ${summary.ok} ok · ${summary.warn} warn · ${summary.error} error · ${summary.expected} expected?`;
}

function appendRow(result: VerifyResult): void {
    const row = document.createElement('tr');
    row.className = `status-${result.status}`;

    const file = document.createElement('td');
    file.textContent = result.path.replace(/\/examples\//, '/');
    file.title = result.mode ? `rendered via ${result.mode}` : '';

    const stage = document.createElement('td');
    stage.textContent = result.stage || '';

    const status = document.createElement('td');
    status.textContent = result.status === 'expected' ? 'expected?' : result.status;
    status.className = 'status-cell';

    const messages = document.createElement('td');
    messages.textContent =
        result.problems.slice(0, 3).map(formatProblem).join('\n') +
        (result.problems.length > 3 ? `\n… ${result.problems.length - 3} more` : '') +
        (result.note ? `${result.problems.length ? '\n' : ''}(${result.note})` : '');

    row.append(file, stage, status, messages);
    elements.rows.appendChild(row);
}

function createFrame(): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.className = 'verify-frame';
    // Restrictive until a document is chosen: srcdoc content must never get allow-same-origin.
    iframe.setAttribute('sandbox', SRCDOC_PREVIEW_SANDBOX);
    iframe.setAttribute('allow', FRAME_ALLOW);
    iframe.setAttribute('allowfullscreen', '');
    elements.frameHost.replaceChildren(iframe);
    return iframe;
}

// Tear down the previous example completely (stops timers, rAF loops, WebGL contexts) before the next.
function teardownFrame(): void {
    const iframe = elements.frameHost.querySelector('iframe');
    if (!iframe) return;
    try {
        iframe.setAttribute('sandbox', SRCDOC_PREVIEW_SANDBOX);
        iframe.src = 'about:blank';
    } catch {
        // Ignore.
    }
    iframe.remove();
}

window.addEventListener('message', (event) => {
    if (!current || event.source !== current.iframe?.contentWindow) return;
    const data: PreviewEnvelope | null = event.data;
    if (!data || data.source !== 'learncode-preview' || data.renderId !== current.renderId) return;
    if (data.kind === 'runtime-ready' || data.kind === 'shader-stats') current.ready = true;
    if (data.kind === 'inspect-result' || data.kind === 'runtime-ready') return;
    current.messages.push(data as PreviewFrameMessage); // `source` and `renderId` match, so it is one of ours
});

/** Lets the example run for `ms`, then waits a little longer (up to READY_GRACE_MS) for a slow page to boot. */
async function waitForObservation(state: RunState, ms: number): Promise<void> {
    const startedAt = performance.now();
    await sleep(ms);
    // Give a slow page a little extra time to boot before calling it "not ready".
    while (!state.ready && performance.now() - startedAt < ms + READY_GRACE_MS && !stopRequested) {
        await sleep(100);
    }
}

async function verifyShader(
    documentModel: VerifiedDocument,
    topicPath: string,
    state: RunState,
): Promise<VerifyProblem[]> {
    const problems: VerifyProblem[] = [];
    const shaderDiagnostics = validateShaderPreviewDocument(documentModel);
    problems.push(
        ...problemsFromCompileDiagnostics(
            shaderDiagnostics.map((diagnostic: Partial<Diagnostic>) => ({
                ...diagnostic,
                file: diagnostic.file || diagnostic.slot || '',
            })),
        ),
    );

    const shaderConfig = getShaderConfig(documentModel);
    state.iframe.setAttribute('sandbox', SRCDOC_PREVIEW_SANDBOX);
    state.iframe.srcdoc = renderShaderExampleDocument(documentModel, {
        diagnostics: [...(documentModel.diagnostics || []), ...shaderDiagnostics],
        renderId: state.renderId,
        // One still frame: enough to load textures and surface runtime problems without animating.
        shaderControls: { paused: true, stillFrame: true, currentResolution: shaderConfig.resolution || undefined },
        topicPath,
    });
    state.mode = 'shader-srcdoc';
    return problems;
}

async function verifyCompiled(
    documentModel: VerifiedDocument,
    topicPath: string,
    state: RunState,
): Promise<VerifyProblem[]> {
    const result = await compileExample({ document: documentModel });
    const diagnostics = result.compileDiagnostics || [];
    const markupPath = (documentModel.files || []).find((file) => file.slot === 'markup')?.path || 'index.html';
    const renderOptions = {
        consoleEnabled: true,
        markupPath,
        renderId: state.renderId,
        // "Typing" mode: alert/confirm/prompt are replaced by notices so nothing blocks the run.
        suppressDialogs: true,
    };

    if (state.card) {
        state.iframe.removeAttribute('allow');
        state.iframe.removeAttribute('allowfullscreen');
        state.iframe.setAttribute('sandbox', CARD_SANDBOX);
        state.iframe.srcdoc = renderCompiledExampleDocument(
            result.compiledDocument,
            topicPath,
            diagnostics,
            renderOptions,
        );
        state.mode = 'card';
        return problemsFromCompileDiagnostics(diagnostics);
    }

    const hostedHtml = renderCompiledExampleDocument(result.compiledDocument, topicPath, diagnostics, {
        ...renderOptions,
        hosted: true,
    });
    const hostedUrl = await publishPreviewDocument({ html: hostedHtml, renderId: state.renderId, topicPath });

    if (hostedUrl) {
        verifyWindow.__verifyUrls[documentModel.__verifyFile || ''] = hostedUrl;
        state.iframe.setAttribute('sandbox', HOSTED_PREVIEW_SANDBOX);
        state.iframe.src = hostedUrl;
        state.mode = 'hosted';
    } else {
        state.iframe.setAttribute('sandbox', SRCDOC_PREVIEW_SANDBOX);
        state.iframe.srcdoc = renderCompiledExampleDocument(
            result.compiledDocument,
            topicPath,
            diagnostics,
            renderOptions,
        );
        state.mode = 'srcdoc';
    }

    return problemsFromCompileDiagnostics(diagnostics);
}

/** Runs one example for `ms` and reports what it did. Never throws: a harness failure becomes a `harness` problem. */
async function verifyExample(
    topicPath: string,
    file: string,
    ms: number,
    { logs = false, show = false, card = false }: { logs?: boolean; show?: boolean; card?: boolean } = {},
): Promise<VerifyResult> {
    const startedAt = performance.now();
    teardownFrame();
    renderSequence += 1;
    const state: RunState = {
        iframe: createFrame(),
        card,
        messages: [],
        mode: '',
        ready: false,
        renderId: renderSequence,
    };
    current = state;

    let stage = '';
    const problems: VerifyProblem[] = [];
    let note = '';

    try {
        const data = await fetchExample(topicPath, file);
        const documentModel: VerifiedDocument = parseExampleDocument(data?.content || '');
        documentModel.__verifyFile = `${topicPath}/${file}`;
        stage = getExampleStage(documentModel);
        problems.push(...problemsFromStructuralDiagnostics(documentModel.diagnostics));

        if (isShaderDocument(documentModel)) {
            problems.push(...(await verifyShader(documentModel, topicPath, state)));
            note = 'shader: compile/link + one still frame';
        } else {
            problems.push(...(await verifyCompiled(documentModel, topicPath, state)));
        }

        await waitForObservation(state, ms);
        problems.push(...problemsFromRuntimeMessages(state.messages));
    } catch (error) {
        problems.push({ kind: 'harness', message: errorMessage(error), file: '', line: null });
        state.ready = true;
    } finally {
        current = null;
        // In show mode the frame stays until the next example starts, so the last one remains visible.
        if (!show) teardownFrame();
    }

    return buildResult({
        durationMs: performance.now() - startedAt,
        file,
        logs: logs ? consoleLinesFromMessages(state.messages) : null,
        mode: state.mode,
        note,
        problems,
        ready: state.ready,
        stage,
        topicPath,
    });
}

/** Reads the query string, runs every selected example in order and publishes the results. */
async function run(): Promise<void> {
    const { path, ms, only, logs, show, card, width, height } = parseVerifyParams(window.location.search);
    if (show) {
        elements.frameHost.style.width = `${width}px`;
        elements.frameHost.style.height = `${height}px`;
    }
    if (!path) {
        setStatus('Add ?path=<chapter>[/<section>[/<topic>]] to the URL (optional &ms=1500&only=03-&logs=1).');
        verifyWindow.__verifyDone = true;
        return;
    }

    setStatus(`Loading ${path}…`);
    const tree = await fetchTree({ includeHidden: true });
    const topicPaths = collectTopicPaths(tree, path);
    if (topicPaths.length === 0) {
        setStatus(`No topics found under "${path}".`);
        verifyWindow.__verifyDone = true;
        return;
    }

    const queue: Array<{ topicPath: string; file: string }> = [];
    for (const topicPath of topicPaths) {
        try {
            const files = filterExampleFiles(await fetchExamples(topicPath), only);
            files.forEach((file) => queue.push({ topicPath, file }));
        } catch (error) {
            const result = buildResult({
                topicPath,
                file: '(listing)',
                problems: [{ kind: 'harness', message: errorMessage(error), file: '', line: null }],
            });
            verifyWindow.__verifyResults.push(result);
            appendRow(result);
        }
    }

    for (let index = 0; index < queue.length; index += 1) {
        if (stopRequested) break;
        const { topicPath, file } = queue[index];
        setStatus(`Running ${index + 1}/${queue.length}: ${topicPath}/${file}`);
        const result = await verifyExample(topicPath, file, ms, { logs, show, card });
        verifyWindow.__verifyResults.push(result);
        appendRow(result);
        renderSummary();
    }

    renderSummary();
    setStatus(stopRequested ? 'Stopped.' : `Done: ${queue.length} examples (${ms} ms each).`);
    verifyWindow.__verifyDone = true;
}

elements.copy.addEventListener('click', async () => {
    const json = JSON.stringify(verifyWindow.__verifyResults, null, 2);
    try {
        await navigator.clipboard.writeText(json);
        elements.copy.textContent = 'Copied!';
    } catch {
        const area = document.createElement('textarea');
        area.value = json;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
        elements.copy.textContent = 'Copied (fallback)';
    }
    setTimeout(() => {
        elements.copy.textContent = 'Copy JSON';
    }, 1500);
});

elements.stop.addEventListener('click', () => {
    stopRequested = true;
    elements.stop.disabled = true;
});

run().catch((error) => {
    setStatus(`Harness failed: ${errorMessage(error)}`);
    verifyWindow.__verifyDone = true;
});

// Runtime verification harness for course examples (dev tool, not linked from the app).
// Usage: http://localhost:5174/tools/verify-examples.html?path=ch02-html/sec01-...&ms=1500&only=03-
//
// Runs every example of a chapter/section/topic through the real preview pipeline, one at a time in a
// single iframe, and collects compile diagnostics plus runtime problems reported by the preview bridge.
import { fetchExample, fetchExamples, fetchTree } from '../src/utils/api.js';
import { compileExample } from '../src/utils/compileClient.js';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from '../src/utils/exampleRenderer.js';
import { getExampleStage, getShaderConfig, isShaderDocument, parseExampleDocument } from '../src/utils/markdown.js';
import { HOSTED_PREVIEW_SANDBOX, SRCDOC_PREVIEW_SANDBOX, publishPreviewDocument } from '../src/utils/renderer/previewHost.js';
import { validateShaderPreviewDocument } from '../src/utils/shaderPreviewDiagnostics.js';
import {
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
} from './verify-core.js';

const FRAME_ALLOW = 'fullscreen *; clipboard-read *; clipboard-write *; autoplay *; geolocation *; camera *; microphone *; display-capture *; screen-wake-lock *; web-share *; gamepad *; picture-in-picture *';
const READY_GRACE_MS = 3000;

const elements = {
    status: document.getElementById('verify-status'),
    summary: document.getElementById('verify-summary'),
    rows: document.getElementById('verify-rows'),
    frameHost: document.getElementById('verify-frame-host'),
    copy: document.getElementById('verify-copy'),
    stop: document.getElementById('verify-stop'),
};

window.__verifyDone = false;
// Hosted preview URL of each example ("ch/sec/top/file.md" → URL), to open one at full size.
window.__verifyUrls = {};
window.__verifyResults = [];

let current = null;
let renderSequence = Math.floor(Date.now() / 1000) % 100000;
let stopRequested = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function setStatus(text) {
    elements.status.textContent = text;
}

function renderSummary() {
    const summary = summarizeResults(window.__verifyResults);
    elements.summary.textContent = `${summary.total} examples · ${summary.ok} ok · ${summary.warn} warn · ${summary.error} error · ${summary.expected} expected?`;
}

function appendRow(result) {
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
    messages.textContent = result.problems.slice(0, 3).map(formatProblem).join('\n')
        + (result.problems.length > 3 ? `\n… ${result.problems.length - 3} more` : '')
        + (result.note ? `${result.problems.length ? '\n' : ''}(${result.note})` : '');

    row.append(file, stage, status, messages);
    elements.rows.appendChild(row);
}

function createFrame() {
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
function teardownFrame() {
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
    const data = event.data;
    if (!data || data.source !== 'learncode-preview' || data.renderId !== current.renderId) return;
    if (data.kind === 'runtime-ready' || data.kind === 'shader-stats') current.ready = true;
    if (data.kind === 'inspect-result' || data.kind === 'runtime-ready') return;
    current.messages.push(data);
});

async function waitForObservation(state, ms) {
    const startedAt = performance.now();
    await sleep(ms);
    // Give a slow page a little extra time to boot before calling it "not ready".
    while (!state.ready && performance.now() - startedAt < ms + READY_GRACE_MS && !stopRequested) {
        await sleep(100);
    }
}

async function verifyShader(documentModel, topicPath, state) {
    const problems = [];
    const shaderDiagnostics = validateShaderPreviewDocument(documentModel);
    problems.push(...problemsFromCompileDiagnostics(shaderDiagnostics.map((diagnostic) => ({ ...diagnostic, file: diagnostic.file || diagnostic.slot || '' }))));

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

async function verifyCompiled(documentModel, topicPath, state) {
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

    const hostedHtml = renderCompiledExampleDocument(result.compiledDocument, topicPath, diagnostics, { ...renderOptions, hosted: true });
    const hostedUrl = await publishPreviewDocument({ html: hostedHtml, renderId: state.renderId, topicPath });

    if (hostedUrl) {
        window.__verifyUrls[documentModel.__verifyFile || ''] = hostedUrl;
        state.iframe.setAttribute('sandbox', HOSTED_PREVIEW_SANDBOX);
        state.iframe.src = hostedUrl;
        state.mode = 'hosted';
    } else {
        state.iframe.setAttribute('sandbox', SRCDOC_PREVIEW_SANDBOX);
        state.iframe.srcdoc = renderCompiledExampleDocument(result.compiledDocument, topicPath, diagnostics, renderOptions);
        state.mode = 'srcdoc';
    }

    return problemsFromCompileDiagnostics(diagnostics);
}

async function verifyExample(topicPath, file, ms, { logs = false, show = false } = {}) {
    const startedAt = performance.now();
    teardownFrame();
    renderSequence += 1;
    const state = {
        iframe: createFrame(),
        messages: [],
        mode: '',
        ready: false,
        renderId: renderSequence,
    };
    current = state;

    let stage = '';
    let problems = [];
    let note = '';

    try {
        const data = await fetchExample(topicPath, file);
        const documentModel = parseExampleDocument(data?.content || '');
        documentModel.__verifyFile = `${topicPath}/${file}`;
        stage = getExampleStage(documentModel);
        problems.push(...problemsFromStructuralDiagnostics(documentModel.diagnostics));

        if (isShaderDocument(documentModel)) {
            problems.push(...await verifyShader(documentModel, topicPath, state));
            note = 'shader: compile/link + one still frame';
        } else {
            problems.push(...await verifyCompiled(documentModel, topicPath, state));
        }

        await waitForObservation(state, ms);
        problems.push(...problemsFromRuntimeMessages(state.messages));
    } catch (error) {
        problems.push({ kind: 'harness', message: error?.message || String(error), file: '', line: null });
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

async function run() {
    const { path, ms, only, logs, show, width, height } = parseVerifyParams(window.location.search);
    if (show) {
        elements.frameHost.style.width = `${width}px`;
        elements.frameHost.style.height = `${height}px`;
    }
    if (!path) {
        setStatus('Add ?path=<chapter>[/<section>[/<topic>]] to the URL (optional &ms=1500&only=03-&logs=1).');
        window.__verifyDone = true;
        return;
    }

    setStatus(`Loading ${path}…`);
    const tree = await fetchTree({ includeHidden: true });
    const topicPaths = collectTopicPaths(tree, path);
    if (topicPaths.length === 0) {
        setStatus(`No topics found under "${path}".`);
        window.__verifyDone = true;
        return;
    }

    const queue = [];
    for (const topicPath of topicPaths) {
        try {
            const files = filterExampleFiles(await fetchExamples(topicPath), only);
            files.forEach((file) => queue.push({ topicPath, file }));
        } catch (error) {
            const result = buildResult({ topicPath, file: '(listing)', problems: [{ kind: 'harness', message: error.message, file: '', line: null }] });
            window.__verifyResults.push(result);
            appendRow(result);
        }
    }

    for (let index = 0; index < queue.length; index += 1) {
        if (stopRequested) break;
        const { topicPath, file } = queue[index];
        setStatus(`Running ${index + 1}/${queue.length}: ${topicPath}/${file}`);
        const result = await verifyExample(topicPath, file, ms, { logs, show });
        window.__verifyResults.push(result);
        appendRow(result);
        renderSummary();
    }

    renderSummary();
    setStatus(stopRequested ? 'Stopped.' : `Done: ${queue.length} examples (${ms} ms each).`);
    window.__verifyDone = true;
}

elements.copy.addEventListener('click', async () => {
    const json = JSON.stringify(window.__verifyResults, null, 2);
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
    setStatus(`Harness failed: ${error?.message || error}`);
    window.__verifyDone = true;
});

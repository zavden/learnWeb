import { Worker } from 'worker_threads';

// Compiles example documents in a single long-lived worker thread with a memory cap and a
// per-job timeout. Jobs run one at a time (one CPU core at most). When a job hangs or runs out
// of memory the worker is terminated, the job gets a diagnostic, and a fresh worker is started
// lazily for the next job.

const WORKER_URL = new URL('./compileWorkerThread.js', import.meta.url);
const JOB_TIMEOUT_MS = 5000;
const WORKER_BOOT_TIMEOUT_MS = 20000;
const RESOURCE_LIMITS = {
    maxOldGenerationSizeMb: 384,
    maxYoungGenerationSizeMb: 48,
};

let worker = null;
let workerReady = null;
let nextJobId = 0;
let activeJob = null;
const queue = [];

function getSlotForFailure(sourceDocument) {
    const blocks = sourceDocument?.blocks || [];
    if (blocks.some((block) => block.type === 'scss' || block.type === 'sass')) return 'style';
    if (blocks.some((block) => block.type === 'pug')) return 'markup';
    return 'script';
}

function buildFailureResult(code, message, sourceDocument) {
    return {
        compiledDocument: { css: '', html: '', js: '' },
        compileDiagnostics: [
            { code, level: 'error', message, slot: getSlotForFailure(sourceDocument) },
        ],
    };
}

function startWorker() {
    const instance = new Worker(WORKER_URL, { resourceLimits: RESOURCE_LIMITS });
    worker = instance;

    workerReady = new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Compile worker did not start in time.')), WORKER_BOOT_TIMEOUT_MS);
        instance.once('message', (message) => {
            if (message?.type === 'ready') {
                clearTimeout(timer);
                resolve();
            }
        });
        instance.once('error', (error) => {
            clearTimeout(timer);
            reject(error);
        });
    });
    // Rejections are handled where the promise is awaited; avoid unhandled-rejection noise.
    workerReady.catch(() => {});

    instance.on('message', (message) => {
        if (!activeJob || message?.id !== activeJob.id) return;
        const job = activeJob;
        finishActiveJob();
        if (message.ok) {
            job.resolve(message.result);
        } else {
            job.reject(new Error(message.error || 'Compilation failed.'));
        }
    });

    instance.on('error', (error) => {
        if (worker !== instance) return;
        const outOfMemory = error?.code === 'ERR_WORKER_OUT_OF_MEMORY';
        failActiveJob(
            outOfMemory ? 'compile-out-of-memory' : 'compile-worker-crashed',
            outOfMemory
                ? 'Compilation ran out of memory (an endless Sass @while/@for or Pug loop?). The compiler was restarted.'
                : `The compiler crashed: ${error?.message || error}. It was restarted.`,
        );
    });

    instance.on('exit', () => {
        if (worker !== instance) return;
        worker = null;
        workerReady = null;
        failActiveJob('compile-worker-crashed', 'The compiler stopped unexpectedly. It was restarted.');
    });

    return instance;
}

function finishActiveJob() {
    if (activeJob?.timer) clearTimeout(activeJob.timer);
    activeJob = null;
    setImmediate(runNextJob);
}

function discardWorker() {
    const instance = worker;
    worker = null;
    workerReady = null;
    if (instance) instance.terminate().catch(() => {});
}

function failActiveJob(code, message) {
    if (!activeJob) return;
    const job = activeJob;
    discardWorker();
    finishActiveJob();
    job.resolve(buildFailureResult(code, message, job.document));
}

async function runNextJob() {
    if (activeJob || queue.length === 0) return;

    const job = queue.shift();
    activeJob = job;

    try {
        if (!worker) startWorker();
        await workerReady;
    } catch (error) {
        if (activeJob !== job) return;
        discardWorker();
        finishActiveJob();
        job.reject(error);
        return;
    }

    if (activeJob !== job || !worker) return;

    job.timer = setTimeout(() => {
        if (activeJob !== job) return;
        failActiveJob(
            'compile-timeout',
            `Compilation took longer than ${JOB_TIMEOUT_MS / 1000}s and was stopped (an endless Sass @while or Pug loop?).`,
        );
    }, JOB_TIMEOUT_MS);

    worker.postMessage({ document: job.document, id: job.id, type: 'compile' });
}

export function compileExampleDocumentIsolated(sourceDocument) {
    return new Promise((resolve, reject) => {
        queue.push({ document: sourceDocument, id: ++nextJobId, reject, resolve });
        runNextJob();
    });
}

export function warmUpIsolatedCompiler() {
    if (!worker) startWorker();
    return workerReady;
}

export async function shutdownIsolatedCompiler() {
    const instance = worker;
    worker = null;
    workerReady = null;
    if (instance) await instance.terminate();
}

import { Worker, type ResourceLimits } from 'worker_threads';
import type { CompileResult, CompileSourceDocument } from '../../types/compile.ts';
import type { BlockSlot } from '../../types/document.ts';
import type { CompileThreadMessage, CompileThreadRequest } from './types.ts';

// Compiles example documents in a single long-lived worker thread with a memory cap and a
// per-job timeout. Jobs run one at a time (one CPU core at most). When a job hangs or runs out
// of memory the worker is terminated, the job gets a diagnostic, and a fresh worker is started
// lazily for the next job.
//
// Used by server.ts (`POST /api/compile`, warmed up at start) and scripts/check-material.ts and
// scripts/snapshot-material.ts (which call `shutdownIsolatedCompiler()` so the process can exit). The
// worker runs compileWorkerThread.ts; messages follow `CompileThreadRequest`/`CompileThreadMessage`.
// Invariant: `worker` and `workerReady` are set and cleared together.

const WORKER_URL = new URL('./compileWorkerThread.ts', import.meta.url);
const JOB_TIMEOUT_MS = 5000;
const WORKER_BOOT_TIMEOUT_MS = 20000;
const RESOURCE_LIMITS: ResourceLimits = {
    maxOldGenerationSizeMb: 384,
    maxYoungGenerationSizeMb: 48,
};

/** A queued compilation and the callbacks of the promise `compileExampleDocumentIsolated()` returned. */
interface CompileJob {
    document: CompileSourceDocument;
    id: number;
    /** Only for failures of the worker itself (it did not start); compile problems resolve with diagnostics. */
    reject: (reason?: unknown) => void;
    resolve: (result: CompileResult) => void;
    /** The job's timeout, set once it is sent to the worker. */
    timer?: ReturnType<typeof setTimeout>;
}

let worker: Worker | null = null;
let workerReady: Promise<void> | null = null;
let nextJobId = 0;
let activeJob: CompileJob | null = null;
const queue: CompileJob[] = [];

// The diagnostic of a stopped job points at the block most likely to blame (Sass, then Pug, else the script).
function getSlotForFailure(sourceDocument: CompileSourceDocument | null | undefined): BlockSlot {
    const blocks = sourceDocument?.blocks || [];
    if (blocks.some((block) => block.type === 'scss' || block.type === 'sass')) return 'style';
    if (blocks.some((block) => block.type === 'pug')) return 'markup';
    return 'script';
}

function buildFailureResult(code: string, message: string, sourceDocument: CompileSourceDocument): CompileResult {
    return {
        compiledDocument: { css: '', html: '', js: '' },
        compileDiagnostics: [{ code, level: 'error', message, slot: getSlotForFailure(sourceDocument) }],
    };
}

function startWorker(): Worker {
    const instance = new Worker(WORKER_URL, { resourceLimits: RESOURCE_LIMITS });
    worker = instance;

    workerReady = new Promise<void>((resolve, reject) => {
        const timer = setTimeout(
            () => reject(new Error('Compile worker did not start in time.')),
            WORKER_BOOT_TIMEOUT_MS,
        );
        instance.once('message', (message: CompileThreadMessage) => {
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

    instance.on('message', (message: CompileThreadMessage) => {
        if (!activeJob || message?.id !== activeJob.id) return;
        const job = activeJob;
        finishActiveJob();
        if (message.ok) {
            job.resolve(message.result);
        } else {
            job.reject(new Error(message.error || 'Compilation failed.'));
        }
    });

    instance.on('error', (error: NodeJS.ErrnoException) => {
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

function finishActiveJob(): void {
    if (activeJob?.timer) clearTimeout(activeJob.timer);
    activeJob = null;
    setImmediate(runNextJob);
}

function discardWorker(): void {
    const instance = worker;
    worker = null;
    workerReady = null;
    if (instance) instance.terminate().catch(() => {});
}

/** Ends the running job with a failure result (the diagnostic `code`/`message`) and throws its worker away. */
function failActiveJob(code: string, message: string): void {
    if (!activeJob) return;
    const job = activeJob;
    discardWorker();
    finishActiveJob();
    job.resolve(buildFailureResult(code, message, job.document));
}

async function runNextJob(): Promise<void> {
    if (activeJob || queue.length === 0) return;

    const job = queue.shift()!; // not empty: checked above
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

    worker.postMessage({ document: job.document, id: job.id, type: 'compile' } satisfies CompileThreadRequest);
}

/**
 * Compiles a document in the worker thread (queued behind earlier calls). A timeout, an out-of-memory
 * stop or a crash resolves with an empty compiled document and one error diagnostic
 * (`compile-timeout`, `compile-out-of-memory`, `compile-worker-crashed`). It rejects only when the
 * worker cannot start or the compiler threw.
 */
export function compileExampleDocumentIsolated(sourceDocument: CompileSourceDocument): Promise<CompileResult> {
    return new Promise<CompileResult>((resolve, reject) => {
        queue.push({ document: sourceDocument, id: ++nextJobId, reject, resolve });
        runNextJob();
    });
}

/** Starts the worker ahead of the first job (it takes a moment to load the compilers); resolves when it is ready. */
export function warmUpIsolatedCompiler(): Promise<void> {
    if (!worker) startWorker();
    return workerReady!; // set together with `worker`
}

/**
 * Terminates the worker so a script's process can exit. Call it once no compilation is pending: a job
 * still running when the worker goes away is never settled.
 */
export async function shutdownIsolatedCompiler(): Promise<void> {
    const instance = worker;
    worker = null;
    workerReady = null;
    if (instance) await instance.terminate();
}

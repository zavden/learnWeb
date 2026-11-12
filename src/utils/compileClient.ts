// Browser entry point for compiling examples (the preview, the gallery, the favorites/pending dialogs,
// the theory embeds and tools/verify-examples.ts call `compileExample`). Requests go through a dedicated
// Web Worker (src/workers/compileWorker.ts) that caches results and de-duplicates identical requests
// before calling `POST /api/compile`; without Worker support, or once the worker has failed, requests go
// straight to the API (src/utils/api.ts). Either way the result is the server's `CompileResponse`.

import type { CompileRequest, CompileResponse } from '../types/compile.ts';
import { requestCompileExample } from './api.ts';
import type { CompileWorkerRequest, CompileWorkerResponse } from './compiler/types.ts';

/** The settle callbacks of a request sent to the worker. */
interface PendingCompileRequest {
    reject: (reason?: unknown) => void;
    resolve: (result: CompileResponse) => void;
}

let compileClientSingleton: CompileClient | null = null;

/** Owns the compile worker and the requests waiting for it. One per page (`getCompileClient()`). */
class CompileClient {
    worker: Worker | null;
    nextRequestId: number;
    /** Requests sent to the worker, by request id. */
    pendingRequests: Map<number, PendingCompileRequest>;
    /** Set when the worker could not be created or failed: requests go straight to the API from then on. */
    workerDisabled: boolean;

    constructor() {
        this.worker = null;
        this.nextRequestId = 0;
        this.pendingRequests = new Map();
        this.workerDisabled = false;

        if (typeof Worker !== 'undefined') {
            try {
                this.worker = new Worker(new URL('../workers/compileWorker.ts', import.meta.url), { type: 'module' });
                this.worker.addEventListener('message', (event) => this._handleWorkerMessage(event));
                this.worker.addEventListener('error', (event) => this._handleWorkerFailure(event?.message || 'Worker error'));
            } catch (error) {
                this.worker = null;
                this.workerDisabled = true;
                console.warn('Compile worker unavailable. Falling back to direct compile requests.', error);
            }
        } else {
            this.workerDisabled = true;
        }
    }

    async compileExample(payload: CompileRequest = {}): Promise<CompileResponse> {
        if (!this.worker || this.workerDisabled) {
            return requestCompileExample(payload);
        }

        return new Promise<CompileResponse>((resolve, reject) => {
            const requestId = ++this.nextRequestId;

            this.pendingRequests.set(requestId, { reject, resolve });
            // Checked at the top of the method; the executor runs synchronously.
            this.worker!.postMessage({
                payload,
                requestId,
                type: 'compile',
            } satisfies CompileWorkerRequest);
        });
    }

    clearCache(): void {
        if (!this.worker || this.workerDisabled) return;

        this.worker.postMessage({ type: 'clear-cache' } satisfies CompileWorkerRequest);
    }

    _handleWorkerMessage(event: MessageEvent<CompileWorkerResponse>): void {
        // A message without data becomes `{}`, which has no `type` and is ignored like any foreign message.
        const data = (event?.data || {}) as CompileWorkerResponse;
        if (data.type !== 'compile-result') return;

        const request = this.pendingRequests.get(data.requestId);
        if (!request) return;

        this.pendingRequests.delete(data.requestId);

        if (data.ok) {
            request.resolve(data.result);
            return;
        }

        request.reject(new Error(data.error || 'Worker compile failed.'));
    }

    /** Rejects every pending request and switches to direct API requests for the rest of the session. */
    _handleWorkerFailure(message: string): void {
        if (this.workerDisabled) return;

        this.workerDisabled = true;

        for (const request of this.pendingRequests.values()) {
            request.reject(new Error(message || 'Compile worker failed.'));
        }
        this.pendingRequests.clear();

        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}

function getCompileClient(): CompileClient {
    if (!compileClientSingleton) {
        compileClientSingleton = new CompileClient();
    }

    return compileClientSingleton;
}

/**
 * Compiles an example (`{ document }`, or `{ content }` Markdown parsed by the server) and resolves with
 * the server's response. Rejects when the request fails (network, HTTP 500, worker failure).
 */
export async function compileExample(payload: CompileRequest = {}): Promise<CompileResponse> {
    return getCompileClient().compileExample(payload);
}

/** Empties the compile worker's cache (no-op without a worker). The server's own cache is not affected. */
export function clearCompileCache(): void {
    getCompileClient().clearCache();
}

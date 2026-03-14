import { requestCompileExample } from './api.js';

let compileClientSingleton = null;

class CompileClient {
    constructor() {
        this.worker = null;
        this.nextRequestId = 0;
        this.pendingRequests = new Map();
        this.workerDisabled = false;

        if (typeof Worker !== 'undefined') {
            try {
                this.worker = new Worker(new URL('../workers/compileWorker.js', import.meta.url), { type: 'module' });
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

    async compileExample(payload = {}) {
        if (!this.worker || this.workerDisabled) {
            return requestCompileExample(payload);
        }

        return new Promise((resolve, reject) => {
            const requestId = ++this.nextRequestId;

            this.pendingRequests.set(requestId, { reject, resolve });
            this.worker.postMessage({
                payload,
                requestId,
                type: 'compile',
            });
        });
    }

    clearCache() {
        if (!this.worker || this.workerDisabled) return;

        this.worker.postMessage({ type: 'clear-cache' });
    }

    _handleWorkerMessage(event) {
        const data = event?.data || {};
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

    _handleWorkerFailure(message) {
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

function getCompileClient() {
    if (!compileClientSingleton) {
        compileClientSingleton = new CompileClient();
    }

    return compileClientSingleton;
}

export async function compileExample(payload = {}) {
    return getCompileClient().compileExample(payload);
}

export function clearCompileCache() {
    getCompileClient().clearCache();
}

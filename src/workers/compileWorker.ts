// The compile Web Worker started by src/utils/compileClient.ts. It forwards compile requests to
// `POST /api/compile` (src/utils/api.ts) and keeps the last 80 results in an LRU cache keyed like the
// server's (`createCompileCacheKey`, src/utils/compileCache.ts), so re-rendering an unchanged example
// costs no request. Identical requests in flight share one fetch. Results are deep-copied on the way in
// and out of the cache, so callers can never mutate a cached result.
// Messages follow `CompileWorkerRequest`/`CompileWorkerResponse` (src/utils/compiler/types.ts).

import type { CompileResponse } from '../types/compile.ts';
import { requestCompileExample } from '../utils/api.ts';
import { cloneSerializable, createCompileCacheKey } from '../utils/compileCache.ts';
import type { CompileWorkerRequest, CompileWorkerResponse } from '../utils/compiler/types.ts';

/**
 * The part of the dedicated worker global scope this module uses. The project is type-checked with the
 * DOM lib only (the WebWorker lib conflicts with it), where `self` is a `Window`; here it is really a
 * `DedicatedWorkerGlobalScope`, so it is asserted to this shape once.
 */
interface CompileWorkerScope {
    addEventListener(type: 'message', listener: (event: MessageEvent<CompileWorkerRequest>) => void): void;
    postMessage(message: CompileWorkerResponse): void;
}

const workerScope = self as unknown as CompileWorkerScope;

const MAX_CACHE_ENTRIES = 80;
/** Cache key → result, oldest first (a hit moves the entry to the end). */
const compileCache = new Map<string, CompileResponse>();
/** Cache key → ids of the requests waiting for the fetch already in flight for that key. */
const inFlightByKey = new Map<string, number[]>();

function getCachedCompileResult(key: string): CompileResponse | null {
    if (!compileCache.has(key)) return null;

    const cached = compileCache.get(key)!; // has() checked above
    compileCache.delete(key);
    compileCache.set(key, cached);
    return cloneSerializable(cached);
}

function setCachedCompileResult(key: string, result: CompileResponse): void {
    if (compileCache.has(key)) {
        compileCache.delete(key);
    }

    compileCache.set(key, cloneSerializable(result));

    while (compileCache.size > MAX_CACHE_ENTRIES) {
        const oldestKey = compileCache.keys().next().value!; // the cache is not empty inside the loop
        compileCache.delete(oldestKey);
    }
}

function flushPendingRequests(key: string, callback: (requestId: number) => void): void {
    const requestIds = inFlightByKey.get(key) || [];
    inFlightByKey.delete(key);
    requestIds.forEach((requestId) => callback(requestId));
}

workerScope.addEventListener('message', async (event) => {
    // A message without data becomes `{}`, which matches neither type and is ignored.
    const data = (event?.data || {}) as CompileWorkerRequest;

    if (data.type === 'clear-cache') {
        compileCache.clear();
        return;
    }

    if (data.type !== 'compile') return;

    const payload = data.payload || {};
    const cacheKey = createCompileCacheKey(payload);
    const cached = getCachedCompileResult(cacheKey);

    if (cached) {
        workerScope.postMessage({
            cacheStatus: 'hit',
            ok: true,
            requestId: data.requestId,
            result: cached,
            type: 'compile-result',
        });
        return;
    }

    if (inFlightByKey.has(cacheKey)) {
        inFlightByKey.get(cacheKey)!.push(data.requestId); // has() checked above
        return;
    }

    inFlightByKey.set(cacheKey, [data.requestId]);

    try {
        const result = await requestCompileExample(payload);
        setCachedCompileResult(cacheKey, result);

        flushPendingRequests(cacheKey, (requestId) => {
            workerScope.postMessage({
                cacheStatus: result?.compileMeta?.cacheStatus || 'miss',
                ok: true,
                requestId,
                result: cloneSerializable(result),
                type: 'compile-result',
            });
        });
    } catch (error) {
        flushPendingRequests(cacheKey, (requestId) => {
            workerScope.postMessage({
                error: (error as Error)?.message || 'Compile request failed.',
                ok: false,
                requestId,
                type: 'compile-result',
            });
        });
    }
});

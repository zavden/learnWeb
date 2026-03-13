import { requestCompileExample } from '../utils/api.js';
import { cloneSerializable, createCompileCacheKey } from '../utils/compileCache.js';

const MAX_CACHE_ENTRIES = 80;
const compileCache = new Map();
const inFlightByKey = new Map();

function getCachedCompileResult(key) {
    if (!compileCache.has(key)) return null;

    const cached = compileCache.get(key);
    compileCache.delete(key);
    compileCache.set(key, cached);
    return cloneSerializable(cached);
}

function setCachedCompileResult(key, result) {
    if (compileCache.has(key)) {
        compileCache.delete(key);
    }

    compileCache.set(key, cloneSerializable(result));

    while (compileCache.size > MAX_CACHE_ENTRIES) {
        const oldestKey = compileCache.keys().next().value;
        compileCache.delete(oldestKey);
    }
}

function flushPendingRequests(key, callback) {
    const requestIds = inFlightByKey.get(key) || [];
    inFlightByKey.delete(key);
    requestIds.forEach((requestId) => callback(requestId));
}

self.addEventListener('message', async (event) => {
    const data = event?.data || {};

    if (data.type === 'clear-cache') {
        compileCache.clear();
        return;
    }

    if (data.type !== 'compile') return;

    const payload = data.payload || {};
    const cacheKey = createCompileCacheKey(payload);
    const cached = getCachedCompileResult(cacheKey);

    if (cached) {
        self.postMessage({
            cacheStatus: 'hit',
            ok: true,
            requestId: data.requestId,
            result: cached,
            type: 'compile-result',
        });
        return;
    }

    if (inFlightByKey.has(cacheKey)) {
        inFlightByKey.get(cacheKey).push(data.requestId);
        return;
    }

    inFlightByKey.set(cacheKey, [data.requestId]);

    try {
        const result = await requestCompileExample(payload);
        setCachedCompileResult(cacheKey, result);

        flushPendingRequests(cacheKey, (requestId) => {
            self.postMessage({
                cacheStatus: result?.compileMeta?.cacheStatus || 'miss',
                ok: true,
                requestId,
                result: cloneSerializable(result),
                type: 'compile-result',
            });
        });
    } catch (error) {
        flushPendingRequests(cacheKey, (requestId) => {
            self.postMessage({
                error: error?.message || 'Compile request failed.',
                ok: false,
                requestId,
                type: 'compile-result',
            });
        });
    }
});

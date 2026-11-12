import express from 'express';

// A small demo API for the course's network lessons (fetch, CORS, streams), served by the local API
// server under /api/demo. It reads nothing from disk and only echoes back what the request itself
// sent, so any origin may call it: preview pages (http://localhost:3001), sandboxed srcdoc copies
// (origin "null", through the Vite proxy) and the "other origin" http://127.0.0.1:3001 used to
// demonstrate CORS. The `cors` query parameter controls the CORS headers of each response:
//   (default)      Access-Control-Allow-Origin: *
//   cors=no        no CORS headers (cross-origin reads fail)
//   cors=origin    the request's Origin + Access-Control-Allow-Credentials: true
// and `expose=1` makes the X-Demo-Server header readable cross-origin.
//
//   ALL /api/demo/echo     JSON echo of method, path, query, selected headers and the parsed body;
//                          `status` (200-599) and `delay` (ms, ≤ 10000) shape the answer.
//   GET /api/demo/stream   a body sent slowly: `chunks` pieces every `interval` ms, each `size`
//                          bytes of text (or one NDJSON line with `format=ndjson`); Content-Length
//                          unless `length=no`.
//   anything else          404 with an HTML page, like a typical server.

const ECHO_BODY_LIMIT = '1mb';
const MAX_DELAY_MS = 10000;
const MAX_STREAM_CHUNKS = 50;
const MAX_STREAM_INTERVAL_MS = 2000;
const MIN_STREAM_CHUNK_SIZE = 32;
const MAX_STREAM_CHUNK_SIZE = 65536;
const ALLOWED_METHODS = 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS';
const ECHOED_HEADERS = new Set(['accept', 'authorization', 'content-type']);

const NOT_FOUND_PAGE = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head><meta charset="utf-8"><title>404 Not Found</title></head>',
    '<body><h1>Not Found</h1><p>The requested URL was not found on this server.</p></body>',
    '</html>',
    '',
].join('\n');

function clampInteger(value, min, max, fallback) {
    const number = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
}

// Query parameters the way URLSearchParams reads them (Express's parser would build nested objects
// from `a[b]=1`); repeated names become arrays.
function readQuery(req) {
    const search = String(req.originalUrl || '').split('?')[1] || '';
    return groupEntries(new URLSearchParams(search));
}

function groupEntries(entries) {
    const result = {};
    for (const [key, value] of entries) {
        if (Object.hasOwn(result, key)) {
            result[key] = [].concat(result[key], value);
        } else {
            result[key] = value;
        }
    }
    return result;
}

function isAllowedRequestHeader(name) {
    return ECHOED_HEADERS.has(name) || name.startsWith('x-');
}

function applyCorsHeaders(req, res, query) {
    res.set('Cache-Control', 'no-store');
    res.set('X-Demo-Server', 'LearnWeb');

    const mode = String(query.cors || '').toLowerCase();
    if (mode === 'no') return false;

    if (mode === 'origin') {
        res.vary('Origin');
        if (!req.headers.origin) return false;
        res.set('Access-Control-Allow-Origin', req.headers.origin);
        res.set('Access-Control-Allow-Credentials', 'true');
    } else {
        res.set('Access-Control-Allow-Origin', '*');
    }

    if (query.expose === '1') res.set('Access-Control-Expose-Headers', 'X-Demo-Server');
    return true;
}

function answerPreflight(req, res, corsAllowed) {
    if (corsAllowed) {
        res.set('Access-Control-Allow-Methods', ALLOWED_METHODS);
        const requested = String(req.headers['access-control-request-headers'] || '')
            .split(',')
            .map((name) => name.trim().toLowerCase())
            .filter((name) => name && isAllowedRequestHeader(name));
        if (requested.length > 0) res.set('Access-Control-Allow-Headers', requested.join(', '));
        // No preflight cache, so every lesson run shows its preflight in DevTools.
        res.set('Access-Control-Max-Age', '0');
    }
    res.status(204).end();
}

function echoHeaders(req) {
    const headers = {};
    for (const [name, value] of Object.entries(req.headers)) {
        if (isAllowedRequestHeader(name)) headers[name] = value;
    }
    return headers;
}

async function parseBody(req) {
    const raw = Buffer.isBuffer(req.body) ? req.body : null;
    if (!raw || raw.length === 0) return { body: null };

    const contentType = String(req.headers['content-type'] || '');
    const mediaType = contentType.split(';')[0].trim().toLowerCase();
    const text = raw.toString('utf8');

    if (mediaType === 'application/json' || mediaType.endsWith('+json')) {
        try {
            return { body: JSON.parse(text) };
        } catch {
            return { error: 'Invalid JSON body', body: text };
        }
    }
    if (mediaType === 'application/x-www-form-urlencoded') {
        return { body: groupEntries(new URLSearchParams(text)) };
    }
    if (mediaType === 'multipart/form-data') {
        try {
            const formData = await new Request('http://demo.invalid/', {
                body: raw,
                headers: { 'content-type': contentType },
                method: 'POST',
            }).formData();
            const fields = [];
            for (const [name, value] of formData) {
                fields.push([name, typeof value === 'string'
                    ? value
                    : { name: value.name, size: value.size, type: value.type }]);
            }
            return { body: groupEntries(fields) };
        } catch {
            return { error: 'Invalid multipart body', body: null };
        }
    }
    if (mediaType === '' || mediaType.startsWith('text/')) return { body: text };
    return { body: { bytes: raw.length } };
}

function streamChunk(index, total, size, format) {
    const label = `Bloque ${index} de ${total}`;
    if (format === 'ndjson') return `${JSON.stringify({ n: index, of: total, text: label })}\n`;
    const line = `${label} `;
    return `${line}${'.'.repeat(Math.max(0, size - line.length - 1))}\n`;
}

export function createDemoApiRouter() {
    const router = express.Router();

    router.use((req, res, next) => {
        const query = readQuery(req);
        req.demoQuery = query;
        const corsAllowed = applyCorsHeaders(req, res, query);
        if (req.method === 'OPTIONS') return answerPreflight(req, res, corsAllowed);
        return next();
    });

    router.all('/echo', express.raw({ type: () => true, limit: ECHO_BODY_LIMIT }), async (req, res) => {
        const query = req.demoQuery;
        const parsed = await parseBody(req);
        const status = parsed.error ? 400 : clampInteger(query.status, 200, 599, 200);
        const delay = clampInteger(query.delay, 0, MAX_DELAY_MS, 0);
        const payload = {
            method: req.method,
            path: `${req.baseUrl}${req.path}`,
            query,
            headers: echoHeaders(req),
            body: parsed.body,
        };
        if (parsed.error) payload.error = parsed.error;

        const send = () => {
            if (res.writableEnded || res.destroyed) return;
            if (status === 204 || status === 205 || status === 304 || req.method === 'HEAD') {
                res.status(status).end();
                return;
            }
            res.status(status).type('application/json; charset=utf-8').send(JSON.stringify(payload));
        };
        if (delay === 0) {
            send();
            return;
        }
        // An aborted request (AbortController in the page) cancels the pending answer.
        const timer = setTimeout(send, delay);
        res.on('close', () => clearTimeout(timer));
    });

    router.get('/stream', (req, res) => {
        const query = req.demoQuery;
        const total = clampInteger(query.chunks, 1, MAX_STREAM_CHUNKS, 10);
        const interval = clampInteger(query.interval, 0, MAX_STREAM_INTERVAL_MS, 200);
        const size = clampInteger(query.size, MIN_STREAM_CHUNK_SIZE, MAX_STREAM_CHUNK_SIZE, 1024);
        const format = query.format === 'ndjson' ? 'ndjson' : 'text';
        const chunks = Array.from({ length: total }, (_, index) => streamChunk(index + 1, total, size, format));

        res.status(200);
        res.type(format === 'ndjson' ? 'application/x-ndjson; charset=utf-8' : 'text/plain; charset=utf-8');
        if (query.length !== 'no') {
            res.set('Content-Length', String(chunks.reduce((sum, chunk) => sum + Buffer.byteLength(chunk), 0)));
        }
        res.flushHeaders();

        let next = 0;
        let timer = null;
        const writeNext = () => {
            if (res.writableEnded || res.destroyed) return;
            res.write(chunks[next]);
            next += 1;
            if (next >= chunks.length) {
                res.end();
                return;
            }
            timer = setTimeout(writeNext, interval);
        };
        res.on('close', () => clearTimeout(timer));
        writeNext();
    });

    router.use((req, res) => {
        res.status(404).type('html').send(NOT_FOUND_PAGE);
    });

    return router;
}

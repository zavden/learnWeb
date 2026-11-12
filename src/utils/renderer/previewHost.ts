// Hosted previews: the rendered document is uploaded to the API server and loaded from its origin
// (http://127.0.0.1:3001), which is cross-origin to the Vite app. That lets the preview iframe use
// `allow-same-origin` safely, so learner code gets real localStorage/sessionStorage/IndexedDB/cookies,
// #fragment navigation, history.pushState, Workers and relative URLs into the topic's assets/ folder.
//
// If the endpoint is unavailable (old server process, network error), callers fall back to srcdoc.

const PREVIEW_DOCUMENTS_ENDPOINT = '/api/preview-documents';
const RETRY_AFTER_FAILURE_MS = 15000;

let unavailableUntil = 0;

export const HOSTED_PREVIEW_SANDBOX = 'allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads allow-pointer-lock allow-presentation';
// srcdoc documents inherit the app's origin when `allow-same-origin` is present, so it must never be
// granted to them.
export const SRCDOC_PREVIEW_SANDBOX = 'allow-scripts allow-forms allow-modals allow-popups allow-downloads allow-pointer-lock';

// Sandboxed srcdoc cards run in their own renderer process. A copy that starts loading before its frame has a
// size in this page can run its scripts with a 0×0 viewport (measured in Chrome 155: `canvas.clientWidth` was 0,
// so a WebGL card drew into a 1×1 buffer). Attach the frame first and load the copy two frames later.
export function loadSrcdocWhenLaidOut(iframe, html, shouldLoad = () => true) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
        if (iframe.isConnected && shouldLoad()) iframe.srcdoc = html;
    }));
}

export function isHostedPreviewAvailable() {
    return Date.now() >= unavailableUntil;
}

export function markHostedPreviewUnavailable() {
    unavailableUntil = Date.now() + RETRY_AFTER_FAILURE_MS;
}

const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1']);

// Use the same hostname as the app (different port): the preview is then cross-origin (no access to
// the app) but same-site, so Chrome treats it as first-party for cookies and storage. Mixing
// `localhost` and `127.0.0.1` would make it cross-site (blocked SameSite=Lax cookies, partitioned
// storage).
function resolvePreviewOrigin(data = {}) {
    const port = Number(data.port) || Number(new URL(data.origin || 'http://127.0.0.1:3001').port) || 3001;
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    if (LOOPBACK_HOSTNAMES.has(hostname)) return `http://${hostname}:${port}`;
    if (data.origin) return data.origin;
    return `http://127.0.0.1:${port}`;
}

export function canUseHostedPreview() {
    if (typeof window === 'undefined') return false;
    // The API server only listens on loopback; previews opened from another host fall back to srcdoc.
    return LOOPBACK_HOSTNAMES.has(window.location.hostname) || window.location.hostname === '[::1]';
}

export async function publishPreviewDocument({ html = '', topicPath = '', renderId = 0 } = {}) {
    if (!isHostedPreviewAvailable() || !canUseHostedPreview() || typeof fetch !== 'function') return null;

    try {
        const response = await fetch(PREVIEW_DOCUMENTS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html, topicPath, renderId }),
        });

        if (!response.ok) throw new Error(`Preview host responded with ${response.status}`);

        const data = await response.json();
        if (!data?.url) throw new Error('Preview host returned an invalid response');

        const url = new URL(data.url, resolvePreviewOrigin(data));
        if (typeof window !== 'undefined' && url.origin === window.location.origin) {
            // Never load learner code same-origin with the app while granting allow-same-origin.
            throw new Error('Preview host must be a different origin than the app');
        }

        return url.href;
    } catch (error) {
        markHostedPreviewUnavailable();
        console.warn('Hosted preview unavailable, falling back to srcdoc previews.', error);
        return null;
    }
}

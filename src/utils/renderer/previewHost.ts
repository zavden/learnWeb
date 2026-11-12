// Hosted previews: the rendered document is uploaded to the API server and loaded from its origin
// (http://127.0.0.1:3001), which is cross-origin to the Vite app. That lets the preview iframe use
// `allow-same-origin` safely, so learner code gets real localStorage/sessionStorage/IndexedDB/cookies,
// #fragment navigation, history.pushState, Workers and relative URLs into the topic's assets/ folder.
//
// If the endpoint is unavailable (old server process, network error), callers fall back to srcdoc.
//
// Used by src/components/Preview.ts, src/components/TheoryExerciseDialog.ts and tools/verify-examples.ts
// (hosted documents, with an srcdoc fallback), and by the gallery-style cards (Gallery, FavoritesDialog,
// PendingDialog, the theory editor), which only use `loadSrcdocWhenLaidOut`. The upload goes to
// `POST /api/preview-documents` in server.ts (payloads in src/types/api.ts).
//
// It must stay importable where there is no `window` (Node): the `typeof window === 'undefined'`
// checks are there for that, keep them.

import type { PreviewDocumentRequest, PreviewDocumentResponse } from '../../types/api.ts';

const PREVIEW_DOCUMENTS_ENDPOINT = '/api/preview-documents';
const RETRY_AFTER_FAILURE_MS = 15000;

/** `Date.now()` before which publishing is not attempted (set after a failure). */
let unavailableUntil = 0;

/** `sandbox` of an iframe that loads a hosted (cross-origin) preview document. */
export const HOSTED_PREVIEW_SANDBOX =
    'allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads allow-pointer-lock allow-presentation';
/**
 * `sandbox` of an iframe that loads a preview through `srcdoc`. srcdoc documents inherit the app's origin
 * when `allow-same-origin` is present, so it must never be granted to them.
 */
export const SRCDOC_PREVIEW_SANDBOX =
    'allow-scripts allow-forms allow-modals allow-popups allow-downloads allow-pointer-lock';

/**
 * Set `iframe.srcdoc = html` two animation frames from now, if the iframe is still in the document and
 * `shouldLoad()` still agrees (lets a card that was re-rendered in the meantime skip a stale load).
 *
 * Why: sandboxed srcdoc cards run in their own renderer process. A copy that starts loading before its frame
 * has a size in this page can run its scripts with a 0×0 viewport (measured in Chrome 155: `canvas.clientWidth`
 * was 0, so a WebGL card drew into a 1×1 buffer). Attach the frame first, then call this.
 */
export function loadSrcdocWhenLaidOut(
    iframe: HTMLIFrameElement,
    html: string,
    shouldLoad: () => boolean = () => true,
): void {
    requestAnimationFrame(() =>
        requestAnimationFrame(() => {
            if (iframe.isConnected && shouldLoad()) iframe.srcdoc = html;
        }),
    );
}

/** False for 15 s after a failure (`markHostedPreviewUnavailable()`); meanwhile previews go straight to srcdoc. */
export function isHostedPreviewAvailable(): boolean {
    return Date.now() >= unavailableUntil;
}

/**
 * Stop trying hosted previews for 15 s. Called here when publishing fails, and by the callers' watchdogs
 * when a hosted document did not boot in time.
 */
export function markHostedPreviewUnavailable(): void {
    unavailableUntil = Date.now() + RETRY_AFTER_FAILURE_MS;
}

const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1']);

// Use the same hostname as the app (different port): the preview is then cross-origin (no access to
// the app) but same-site, so Chrome treats it as first-party for cookies and storage. Mixing
// `localhost` and `127.0.0.1` would make it cross-site (blocked SameSite=Lax cookies, partitioned
// storage).
function resolvePreviewOrigin(data: Partial<PreviewDocumentResponse> = {}): string {
    const port = Number(data.port) || Number(new URL(data.origin || 'http://127.0.0.1:3001').port) || 3001;
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    if (LOOPBACK_HOSTNAMES.has(hostname)) return `http://${hostname}:${port}`;
    if (data.origin) return data.origin;
    return `http://127.0.0.1:${port}`;
}

/** Whether this page can use hosted previews at all: in a browser, opened from a loopback hostname. */
export function canUseHostedPreview(): boolean {
    if (typeof window === 'undefined') return false;
    // The API server only listens on loopback; previews opened from another host fall back to srcdoc.
    return LOOPBACK_HOSTNAMES.has(window.location.hostname) || window.location.hostname === '[::1]';
}

/**
 * Options of `publishPreviewDocument()`: the request body, every field optional (`html` defaults to `''`,
 * `topicPath` to `''`, `renderId` to 0). Render the document with `hosted: true` (no `<base>`).
 */
export type PublishPreviewDocumentOptions = Partial<PreviewDocumentRequest>;

/**
 * Upload a rendered document to the preview host and return the absolute URL to load in the iframe
 * (with `HOSTED_PREVIEW_SANDBOX`), or `null` when hosted previews are unavailable: then load the srcdoc
 * variant instead. Never rejects; a failure is logged and disables hosted previews for 15 s.
 */
export async function publishPreviewDocument({
    html = '',
    topicPath = '',
    renderId = 0,
}: PublishPreviewDocumentOptions = {}): Promise<string | null> {
    if (!isHostedPreviewAvailable() || !canUseHostedPreview() || typeof fetch !== 'function') return null;

    try {
        const response = await fetch(PREVIEW_DOCUMENTS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html, topicPath, renderId } satisfies PreviewDocumentRequest),
        });

        if (!response.ok) throw new Error(`Preview host responded with ${response.status}`);

        // Checked below: an old server process may answer with something else.
        const data: Partial<PreviewDocumentResponse> | null = await response.json();
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

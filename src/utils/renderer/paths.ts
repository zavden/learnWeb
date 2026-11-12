// URL helpers for the topic assets a preview loads (`<base href>` of srcdoc documents, shader textures).
//
// Used by documentRenderer.ts, shaderRenderer.ts and the shader panel (src/components/preview/ShaderControls.ts).
// The URLs point at the API server's `GET /api/topic/<ch>/<sec>/<top>/assets/<file>` route (server.ts).
// src/utils/api.ts has its own `encodeTopicPath` with the same behaviour for its endpoints.

/** Percent-encode each segment of a `chapter/section/topic` path; empty segments are dropped. */
export function encodeTopicPath(topicPath: string | null = ''): string {
    return String(topicPath || '')
        .split('/')
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join('/');
}

/** Percent-encode each segment of a path inside a topic's `assets/` folder; empty segments are dropped. */
export function encodeAssetPath(assetPath: string | null = ''): string {
    return String(assetPath || '')
        .split('/')
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join('/');
}

/**
 * Root-relative URL of a topic's assets folder, with a trailing slash (`/api/topic/ch01/sec01/top01/assets/`),
 * or `''` when there is no topic path.
 */
export function getTopicAssetBase(topicPath: string | null = ''): string {
    const encoded = encodeTopicPath(topicPath);
    return encoded ? `/api/topic/${encoded}/assets/` : '';
}

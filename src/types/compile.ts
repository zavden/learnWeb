// The compile contract: what a compiler receives, what it returns, and the `POST /api/compile` payloads.
//
// Produced by src/utils/exampleCompiler.ts (`compileExampleDocument`, which dispatches to
// src/utils/compiler/{markup,style,script,react,vue}Compiler.ts), run in a worker thread by
// src/utils/compiler/isolatedCompiler.ts (`compileExampleDocumentIsolated`, which also builds failure results
// when a job times out or crashes) and served by server.ts (`POST /api/compile`, with an in-memory cache).
// Consumed by the browser through src/utils/api.ts (`requestCompileExample`) and src/workers/compileWorker.ts,
// then by src/components/Preview.ts, src/utils/renderer/documentRenderer.ts (`renderCompiledExampleDocument`),
// src/utils/compiledStyleView.ts, the gallery/favorites/pending previews, the theory embeds and
// scripts/check-material.ts.
//
// Shader examples are never compiled: they render from the document itself (src/utils/renderer/shaderRenderer.ts).

import type { BlockType, ExampleDocument, Framework } from './document.ts';
import type { Diagnostic } from './diagnostics.ts';

/**
 * The part of a document the compilers read: `metadata` (`framework`, `entry`, `lang`, `loop_protect`,
 * `typecheck`), `sourceFormat`, `blocks` (single-file examples) and `files` (paths for source names; the
 * whole project for multi-file examples). A full `ExampleDocument` is what callers pass.
 */
export type CompileSourceDocument = Pick<ExampleDocument, 'blocks' | 'files' | 'metadata' | 'sourceFormat'>;

/**
 * The compiled example, ready for `renderCompiledExampleDocument()`. `html`, `css` and `js` are always
 * present (possibly `''`); the other fields depend on the kind of example:
 * - plain HTML/SVG/Pug + CSS/Sass + JS/TS: `lang`, `markupType`, `runtimeScriptPath`, and `jsView` for
 *   TypeScript that transpiled without syntax errors;
 * - HTML-FULL: only `fullDocumentHtml` carries content (`html`, `css` and `js` are `''`);
 * - React/Vue (single- or multi-file): `framework`, with `html` set to the mount point
 *   (`<div id="root"></div>` / `<div id="app"></div>`) and `js` an IIFE bundle;
 * - a failed compile job or request: just `{ html: '', css: '', js: '' }`.
 * There are no separate source-map fields: TypeScript, React and Vue output carries an inline
 * `//# sourceMappingURL=data:…` comment in `js`, plain JavaScript a `//# sourceURL=` comment, and the
 * renderer reads them from there.
 */
export interface CompiledDocument {
    /** Body markup: the HTML/SVG block as written, the rendered Pug, or the framework mount point. */
    html: string;
    /** Compiled styles (Sass already turned into CSS; for frameworks, plus the bundle's and SFCs' CSS). */
    css: string;
    /** Script to run in the page. In plain examples it has infinite-loop guards unless `loop_protect: false`. */
    js: string;
    /**
     * The JavaScript a TypeScript block compiles to as a learner would see it from `tsc` (no loop guards,
     * no source map); shown as the read-only `compiled.js` tab. Only for TypeScript without syntax errors.
     */
    jsView?: string;
    /** The complete HTML-FULL document (loop guards added to its inline scripts). */
    fullDocumentHtml?: string;
    /** Set by the React and Vue compilers. */
    framework?: Framework;
    /** `lang` metadata (trimmed, `''` when absent); the renderer validates it and falls back to `es`. */
    lang?: string;
    /** Type of the markup block (`html`, `svg` or `pug`), `''` when the example has none. */
    markupType?: BlockType | '';
    /** Document path of the script file (`script.js`, `script.ts`), `''` without a script: the name used in stack traces. */
    runtimeScriptPath?: string;
}

/** What `compileExampleDocument()` and `compileExampleDocumentIsolated()` resolve to. */
export interface CompileResult {
    compiledDocument: CompiledDocument;
    /** Compile diagnostics, in the order the compilers produced them. */
    compileDiagnostics: Diagnostic[];
}

/** Body of `POST /api/compile` (and the browser compile worker's `payload`): a document, or Markdown to parse. */
export interface CompileRequest {
    /** Compiled as is when present. */
    document?: ExampleDocument;
    /** Example Markdown, parsed on the server when `document` is absent. */
    content?: string;
}

/** Whether the server answered from its compile cache. */
export type CompileCacheStatus = 'hit' | 'miss';

/** Cache information attached by the server. */
export interface CompileMeta {
    /** Hash of the request's document (`createCompileCacheKey()`), `compile:…`. */
    cacheKey: string;
    cacheStatus: CompileCacheStatus;
}

/** Successful `POST /api/compile` response (HTTP 200). */
export interface CompileResponse extends CompileResult {
    /**
     * The document that was compiled: the request's `document`, or the one parsed from `content`. On a
     * cache hit it is the document of the request that filled the cache (same cache key).
     */
    document: ExampleDocument;
    compileMeta: CompileMeta;
}

/**
 * `POST /api/compile` response when the request itself failed (HTTP 500): an empty compiled document and
 * one `compile-request-failed` error. The browser client (`handleResponse` in src/utils/api.ts) throws
 * `Error(error)` on non-2xx responses, so callers only ever see `error` as the message of that exception.
 */
export interface CompileErrorResponse {
    error: string;
    compiledDocument: CompiledDocument;
    compileDiagnostics: Diagnostic[];
}

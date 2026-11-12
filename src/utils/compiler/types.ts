// Package-internal types of the compilers: what the compile steps share, the modules handed to esbuild,
// and the two message protocols around compilation:
// - main thread ↔ compile worker thread (Node): src/utils/compiler/isolatedCompiler.ts ↔ compileWorkerThread.ts;
// - page ↔ compile Web Worker (browser): src/utils/compileClient.ts ↔ src/workers/compileWorker.ts.
// The public contract (a document in, a `CompileResult` out, the `/api/compile` payloads) is
// src/types/compile.ts. This file only holds types, so importing it from browser code loads nothing.

import type { Loader } from 'esbuild';
import type {
    CompileCacheStatus,
    CompileRequest,
    CompileResponse,
    CompileResult,
    CompileSourceDocument,
} from '../../types/compile.ts';
import type { ExampleBlock, VirtualFile } from '../../types/document.ts';

/**
 * The part of a legacy block a compile step reads (`compileMarkup`, `compileStyle`, `compileScript`, the
 * React/Vue single-file compilers). A whole `ExampleBlock` is what the document compilers pass; tests pass
 * bare `{ type, content }` objects.
 */
export type CompilerBlock = Pick<ExampleBlock, 'type' | 'content'>;

/** A syntax error found in a script: the message and its 1-based position (`null` when unknown). */
export interface SyntaxDiagnostic {
    column: number | null;
    line: number | null;
    message: string;
}

// ─── Modules for esbuild ──────────────────────────────────────────────────────

/**
 * A module of the in-memory projects the React/Vue single-file compilers bundle with
 * `createInlineModulesPlugin()` (the generated entry, the app/component code, the compiled template).
 */
export interface InlineModule {
    contents: string;
    loader: Loader;
    /** Directory bare imports (`react`, `vue`) are resolved from; `process.cwd()` when empty. */
    resolveDir?: string;
}

/**
 * What `createVirtualFilesPlugin()` loads for a file of a multi-file project: its code after the
 * compiler's own preprocessing (Sass → CSS, Vue SFC/template → JavaScript).
 */
export interface VirtualModule {
    contents: string;
    /** Language after preprocessing; picks the loader when `loader` is not set. */
    language: string;
    loader?: Loader;
}

/** A file of a React/Vue multi-file project prepared for esbuild: the document file plus its module fields. */
export type ProjectModule = VirtualFile & VirtualModule;

// ─── Worker thread protocol (Node) ────────────────────────────────────────────

/** Main thread → compile worker thread: compile one document. */
export interface CompileThreadRequest {
    type: 'compile';
    /** Job id, echoed in the answer. */
    id: number;
    document: CompileSourceDocument;
}

/**
 * Compile worker thread → main thread: `ready` once after start-up, then one answer per job (`ok` with the
 * result, or the message of the exception the compiler threw). The `?: undefined` fields are absent at
 * runtime; they let the handlers read `type`, `id` and `ok` on any message.
 */
export type CompileThreadMessage =
    | { type: 'ready'; id?: undefined; ok?: undefined }
    | { type?: undefined; id: number; ok: true; result: CompileResult }
    | { type?: undefined; id: number; ok: false; error: string };

// ─── Web Worker protocol (browser) ────────────────────────────────────────────

/** Page → compile Web Worker. */
export type CompileWorkerRequest =
    | {
        type: 'compile';
        /** Echoed in the answer so the page can settle the right promise. */
        requestId: number;
        payload: CompileRequest;
    }
    /** Empties the worker's result cache (the server keeps its own). */
    | { type: 'clear-cache' };

/** Compile Web Worker → page: one answer per `compile` request. */
export type CompileWorkerResponse =
    | {
        type: 'compile-result';
        requestId: number;
        ok: true;
        /** `hit` when the worker answered from its own cache, else what the server reported. */
        cacheStatus: CompileCacheStatus;
        result: CompileResponse;
    }
    | {
        type: 'compile-result';
        requestId: number;
        ok: false;
        error: string;
    };

// Diagnostics: the problems reported about an example, from three sources that share one shape:
// - structural (parse and validation): src/utils/markdown/ (`createDiagnostic` in core.ts, the parsers,
//   validation*.ts, shader.ts) → `ExampleDocument.diagnostics`;
// - compile: src/utils/compiler/* (`createCompileDiagnostic` in helpers.ts) and the isolated compiler's
//   failure results → `CompileResult.compileDiagnostics` (see src/types/compile.ts); the shader preview's
//   WebGL validation (src/utils/shaderPreviewDiagnostics.ts) produces the same shape;
// - runtime: errors reported by the preview iframe (src/components/preview/RuntimeDiagnostics.ts).
// Consumed by the editor (src/components/editor/diagnostics.ts: status list, gutter marks, jump to file),
// the renderers (src/utils/renderer/: in-preview overlay, blocking decision), src/utils/compiledStyleView.ts
// (Sass output tab) and scripts/check-material.ts.
//
// Every field besides `level`, `code` and `message` is optional: each diagnostic attaches only the
// details that apply to it. The "location" fields are the ones consumers read to point at a file and a
// line; the "context" fields are informational (nothing branches on them).

import type { BlockSlot, BlockType, MetadataValue, SourceFormat } from './document.ts';

/** Severity. `info` is used for hints only (e.g. an HTML-FULL document without `<body>`). */
export type DiagnosticLevel = 'error' | 'warning' | 'info';

/** One frame of a Dart Sass call stack (1-based line and column in the style file). */
export interface SassStackFrame {
    line: number;
    column: number;
    /** `mixin-name()`, `function-name()` or `root stylesheet`. */
    member: string;
}

/** A problem reported about an example (see the header of this file for the three sources). */
export interface Diagnostic {
    level: DiagnosticLevel;
    /**
     * Stable kebab-case identifier (`unclosed-fence`, `sass-compile-error`, `typescript-type`,
     * `runtime-error`…). Consumers match on it; the message is for people and may change.
     */
    code: string;
    /** User-facing text; compiler messages can span several lines (code frames). */
    message: string;
    /**
     * Only `false` is meaningful: the diagnostic must not stop the preview. The renderer leaves it out of
     * the in-preview overlay and treats the run as clean, while the editor still lists it. Set on
     * TypeScript type errors (`typescript-type`) and Sass `@warn`/`@debug`/deprecation messages.
     * Absent: an `error` blocks the preview. (`hasBlockingDiagnostics()` on a parsed document ignores
     * this field; structural diagnostics never set it.)
     */
    blocking?: boolean;

    // ── Location ──
    /**
     * File the problem is in, as the compiler names it: a document path (`src/App.vue`, `script.ts`), an
     * esbuild namespaced path (`learncode-virtual:src/main.jsx`, `learncode-inline:App.jsx`), `''` or `null`
     * when unknown. Runtime diagnostics use the script path of the stack frame.
     */
    file?: string | null;
    /** Document path of the file a structural diagnostic is about (`null` when the path was empty). */
    path?: string | null;
    /** 1-based line: in the file for compile/runtime diagnostics, in the whole Markdown for structural ones. */
    line?: number | null;
    /** 1-based column (`null` when unknown). */
    column?: number | null;
    /**
     * Slot of the block the problem belongs to; lets the editor find the file of single-file examples.
     * `'program'` is not a block slot: the shader preview uses it for a link error, which belongs to the
     * vertex and fragment shaders together.
     */
    slot?: BlockSlot | 'program';
    /** Block type or file language involved (`pug`, `scss`, `typescript`, `html-full`, `vertex`…). */
    type?: string;
    /** Entry path involved (`entry` metadata); `null` when there was none. */
    entry?: string | null;
    /** Path of the file marked `@role entry` when it disagrees with `entry`. */
    rolePath?: string;
    /** Paths involved when there are several (`multiple-entry-roles`). */
    files?: string[];
    /** Formatted `file:line:column` of a runtime error, as shown in the preview. */
    location?: string;
    /** Sass call stack, only when the message comes from inside a mixin or function. */
    stack?: SassStackFrame[];

    // ── Context (informational) ──
    /** Language involved (fence/`@lang` language, Vue SFC block `lang`). */
    language?: string;
    /** Author's heading (`heading-mismatch`). */
    heading?: string;
    /** Metadata key involved (`duplicate-frontmatter-key`, `exercise-file-not-found`). */
    key?: string;
    /** Normalized tag (`duplicate-example-tag`). */
    tag?: string;
    /** `@role` text involved. */
    role?: string;
    /** `framework` metadata involved (may be `''`). */
    framework?: string;
    /** `renderer` metadata involved. */
    renderer?: string;
    /** `mode` metadata involved. */
    mode?: string;
    sourceFormat?: SourceFormat;
    /** The offending metadata value (raw), hidden-file entry, or uniform default. */
    value?: MetadataValue;
    /** `exercise` metadata value (`null` when absent) for `exercise-metadata-without-flag`. */
    exercise?: MetadataValue | null;
    /** Extensions expected for the file's language (`file-extension-language-mismatch`). */
    expectedExtensions?: string[];
    /** Block types that are not allowed (`shader-extra-blocks-not-allowed`). */
    blockTypes?: BlockType[];
    /** The `shader_uniforms` / `shader_textures` declaration involved, as written. */
    declaration?: string;
    /** Uniform or texture name. */
    name?: string;
    /** Uniform type involved. */
    uniformType?: string;
    /** Range bounds of a uniform control (`shader-uniform-default-out-of-range`). */
    min?: number;
    max?: number;
    /** Texture asset path involved. */
    assetPath?: string;
}

/** The optional details of a diagnostic: the last argument of `createDiagnostic()` / `createCompileDiagnostic()`. */
export type DiagnosticDetails = Omit<Diagnostic, 'level' | 'code' | 'message'>;

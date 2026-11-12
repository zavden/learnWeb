// Types of the theory pages: the editor's theory pseudo-document, the example/exercise embeds that a page's
// `[[exercise:file.md]]` shortcodes turn into, and the options of the three render functions.
//
// Built by src/utils/theoryDocument.ts (pseudo-document), src/utils/theoryExerciseEmbeds.ts (embeds) and
// src/utils/theoryRenderer.ts (HTML, preview and export documents). Consumed by the editor and the preview
// (src/components/Preview.ts, editor/theoryEditor.ts), the theory viewer (src/components/TheoryViewer.ts)
// and scripts/snapshot-material.ts.
//
// The pseudo-document is what the editor holds in `currentDocument` while the user edits a topic's
// `main.md` (src/utils/theoryDocument.ts builds it). It deliberately looks like an `ExampleDocument` so the
// editor's document plumbing (files, tabs, dirty tracking, session snapshots) works on it unchanged, but it
// is not one: its single file has language `markdown` and `sourceKind: 'theory'`, it has no block fields
// and no `unsupportedBlocks`. The editor types `currentDocument` as `ExampleDocument | TheoryDocument`.

import type {
    ExampleDocumentInput,
    ExampleImportance,
    ExampleMetadata,
    ExampleStage,
    LineHighlight,
    RendererMode,
    SourceFormat,
} from './document.ts';
import type { Diagnostic } from './diagnostics.ts';

// ─── The theory pseudo-document ───────────────────────────────────────────────

/**
 * The only file of a theory document: the topic's `main.md`, as `createTheoryDocument()` builds it.
 *
 * Unlike a `VirtualFile` it has no `blockId`, `blockType`, `slot`, `heading` or `order` properties at all.
 * They are declared here as optional `undefined` so that code reading them from a
 * `VirtualFile | TheoryDocumentFile` gets `undefined` (the true runtime answer) instead of a type error.
 */
export interface TheoryDocumentFile {
    /** The text of `main.md`. */
    content: string;
    /** Always `'theory-main'`. */
    id: 'theory-main';
    language: 'markdown';
    name: 'main.md';
    path: 'main.md';
    role: 'theory';
    /** Not a `FileSourceKind`: this is what tells a theory file apart from a legacy or virtual one. */
    sourceKind: 'theory';
    blockId?: undefined;
    blockType?: undefined;
    slot?: undefined;
    heading?: undefined;
    order?: undefined;
}

/**
 * The frontmatter-like metadata of a theory document: only `editorTarget: 'theory'`, which is what
 * `isTheoryDocument()` looks at. It extends `ExampleMetadata` so that reading an example key from a
 * `ExampleDocument | TheoryDocument` union type-checks; at runtime those keys are simply absent.
 */
export interface TheoryDocumentMetadata extends ExampleMetadata {
    editorTarget: 'theory';
}

/**
 * The pseudo-document `createTheoryDocument()` returns: one `main.md` file in a virtual-files shell.
 * Not an `ExampleDocument` (see the header of this file); it is never parsed from Markdown and never
 * compiled, the editor and the preview special-case it through `isTheoryDocument()`.
 */
export interface TheoryDocument {
    /** Always empty: there are no legacy blocks. */
    blocks: never[];
    /** Empty when created. The editor reads it like an example's structural diagnostics. */
    diagnostics: Diagnostic[];
    /** Exactly one entry, the topic's `main.md`. */
    files: TheoryDocumentFile[];
    metadata: TheoryDocumentMetadata;
    rendererMode: Extract<RendererMode, 'web'>;
    sessionId: 'theory-main';
    sourceFormat: Extract<SourceFormat, 'virtual-files'>;
    /** Does not exist on theory documents; declared so reading it from the editor's union type-checks. */
    unsupportedBlocks?: undefined;
}

/**
 * What `isTheoryDocument()` and `getTheoryDocumentContent()` accept: any editor document (an
 * `ExampleDocument`, a `TheoryDocument`), possibly partial, because they only look at `metadata` and `files`.
 */
export type TheoryDocumentInput = ExampleDocumentInput | Partial<TheoryDocument>;

// ─── Exercise embeds ──────────────────────────────────────────────────────────

/**
 * One file shown by a code embed (`[[exercise:file.md-styles.css]]`): a file of the referenced example, or a
 * file the app generated from it (`generated`, e.g. the CSS a SCSS file compiles to).
 */
export interface TheoryCodeFile {
    content: string;
    /** Document language (`html`, `scss`, `typescript`, `vue`…) or, for generated files, `css`, `javascript` or `text`. */
    language: string;
    name: string;
    path: string;
    /** Highlighted lines (1-based). Missing or empty: none. */
    highlights?: LineHighlight[];
    /** An extra read-only tab added by the app (compiled CSS/JS, Sass messages), not part of the example file. */
    generated?: boolean;
}

/**
 * Everything a theory page needs about one example it references, as `loadTheoryExerciseEmbeds()` returns
 * it. Used for the exercise cards (description, badges, preview) and the code embeds (`codeFiles`).
 * For an example that cannot be loaded, `exists` is `false` and the rest is empty.
 */
export interface TheoryExerciseEmbed {
    codeFiles: TheoryCodeFile[];
    /** `example_description`, `''` when absent. */
    description: string;
    /** `false` when the example could not be fetched or parsed (the card shows "Missing Exercise"). */
    exists: boolean;
    /** The example's file name inside the topic (`03-colapso.md`), as written in the shortcode. */
    filename: string;
    /** `''` when absent or invalid. */
    importance: ExampleImportance | '';
    /**
     * Complete HTML document (iframe `srcdoc`) of the example's preview; `''` when it does not exist or
     * did not compile. Can contain `</script>`: it is never inlined in a script without escaping.
     */
    previewSrcdoc: string;
    /** Integer 1-5, or `null` when absent. */
    rating: number | null;
    /** `''` when absent or invalid. */
    stage: ExampleStage | '';
    tags: string[];
}

/** Embeds of one theory page, keyed by example file name (what `loadTheoryExerciseEmbeds()` resolves to). */
export type TheoryExerciseEmbeds = Record<string, TheoryExerciseEmbed>;

/**
 * An embed as the render functions tolerate it: every field optional (callers and tests pass partial
 * embeds; a missing `exists` means `true`, a missing list means empty).
 */
export type TheoryExerciseEmbedInput = Partial<TheoryExerciseEmbed>;

/** `[[exercise:...]]` split into the example file and, for a code embed, which files to show. */
export interface TheoryExerciseShortcode {
    filename: string;
    /** `true` for `file.md-<filter>` (show code), `false` for a plain `file.md` (show the exercise card). */
    codeEmbed: boolean;
    /** File names or paths to show, in order; `null` shows every file. */
    codeFilter: string[] | null;
}

// ─── Render options ───────────────────────────────────────────────────────────

/** Options of `renderTheoryHtml()`; also the base of the two document renderers. */
export interface TheoryHtmlOptions {
    /** Embeds to substitute for the page's `[[exercise:...]]` shortcodes; shortcodes without an entry render as missing. */
    exerciseEmbeds?: Readonly<Record<string, TheoryExerciseEmbedInput>> | null;
    /** `chapter/section/topic`: relative image and link URLs resolve against this topic's `assets/` folder. */
    topicPath?: string | null;
}

/** Options of `renderTheoryPreviewDocument()`: the standalone page shown in the editor's preview iframe. */
export interface TheoryPreviewDocumentOptions extends TheoryHtmlOptions {
    /**
     * Echoed in every message the page posts to its parent (`TheoryPreviewMessage.renderId`) so the parent
     * can ignore messages of an older render. Non-finite values become 0.
     */
    renderId?: number;
}

/** Options of `renderTheoryExportDocument()`: the self-contained HTML file the theory viewer downloads. */
export interface TheoryExportDocumentOptions extends TheoryHtmlOptions {
    /** `<title>` of the file; defaults to the topic path, then `Theory`. */
    title?: string | null;
}

// The example document model: what `parseExampleDocument()` returns for a `material/**/examples/*.md`
// file, everything inside it, and the derived views and option bags of the document API.
//
// Built by src/utils/markdown/ (re-exported by src/utils/markdown.ts): `parseExampleDocument()` in
// documentApi.ts reads the frontmatter with core.ts (`parseFrontmatter` → `normalizeMetadata`), the body
// with parsers.ts (legacy blocks or `## @file` virtual files) and validates with validation*.ts;
// `synchronizeDocument()` recomputes the derived fields; documentMeta.ts builds the views
// (`getExerciseConfig`, `getShaderConfig`, `getExampleEditorialMetadata`…); mutations.ts returns edited
// copies, most of them by rebuilding the Markdown and parsing it again.
// Consumed by the editor (src/components/Editor.ts, editor/*), the preview and its renderers
// (src/components/Preview.ts, src/utils/renderer/*), the compilers (through src/types/compile.ts), the
// gallery and dialogs, the theory embeds, server.ts (`POST /api/compile`) and scripts/check-material.ts.
//
// Two formats share one model (`sourceFormat`):
// - 'legacy-blocks': `# Heading` + one fenced block per language. `blocks` is the source of truth and
//   `files` is derived from it (one legacy file per block).
// - 'virtual-files': `## @file path` / `## @lang` / `## @role` sections (React/Vue multi-file projects).
//   `files` is the source of truth and `blocks` is empty.
// The editor's theory pseudo-document (src/utils/theoryDocument.ts) is not an `ExampleDocument`: its one
// file has language `markdown`, `sourceKind: 'theory'` and no block fields.
//
// The closed sets below are derived from the runtime tables in src/config/exampleBlocks.ts,
// src/utils/markdown/constants.ts and src/config/highlightColors.ts (single source of truth): add a value
// there, not here. Values read straight from author text and validated later are plain `string`; only
// values the code itself constructs or normalizes into a closed set get a literal union.

import type { HIGHLIGHT_COLORS } from '../config/highlightColors.ts';
import type { BLOCK_ALIASES, BLOCK_REGISTRY, SLOT_ORDER } from '../config/exampleBlocks.ts';
import type {
    ALLOWED_VIRTUAL_FILE_ROLES,
    EXAMPLE_IMPORTANCE_VALUES,
    EXAMPLE_STAGE_VALUES,
    EXERCISE_METADATA_KEYS,
    KNOWN_METADATA_KEYS,
    LANGUAGE_FILE_EXTENSIONS,
    LEGACY_FILE_TEMPLATES,
    SHADER_BLOCK_TYPES,
    SHADER_BUILTIN_UNIFORMS,
    SHADER_CUSTOM_UNIFORM_TYPES,
    SUPPORTED_FRAMEWORK_MODES,
    SUPPORTED_FRAMEWORKS,
    SUPPORTED_RENDERERS,
} from '../utils/markdown/constants.ts';
import type { Diagnostic } from './diagnostics.ts';
import type { TheoryDocumentFile } from './theory.ts';

/** Element type of a runtime list or set (`LiteralSet`, `LiteralList`, readonly tuple). */
type ElementOf<T> = T extends Iterable<infer E> ? E : never;

// ─── Closed sets ──────────────────────────────────────────────────────────────

/** Canonical block types: the keys of `BLOCK_REGISTRY`. Fence languages are normalized to one of these. */
export type BlockType = keyof typeof BLOCK_REGISTRY;

/** Alternative fence languages accepted for a block type (`js`, `ts`, `frag`, `html-b`…): keys of `BLOCK_ALIASES`. */
export type BlockAlias = keyof typeof BLOCK_ALIASES;

/** Where a block plugs into the page; each block type has exactly one slot (see `BLOCK_REGISTRY`). */
export type BlockSlot = (typeof SLOT_ORDER)[number];

/**
 * Every language a document file can have: the block types plus `json` and `vue` (virtual files only).
 * Keys of `LANGUAGE_FILE_EXTENSIONS`; it is also exactly the set the virtual-file parser accepts.
 */
export type FileLanguage = keyof typeof LANGUAGE_FILE_EXTENSIONS;

/** Shader stages, which are also the two shader block types and slots. */
export type ShaderBlockType = ElementOf<typeof SHADER_BLOCK_TYPES>;

/** Frameworks an example can declare with `framework:`. */
export type Framework = ElementOf<typeof SUPPORTED_FRAMEWORKS>;

/** Values of `mode:` once normalized (`single`/`multi` and friends map to these). */
export type FrameworkMode = ElementOf<typeof SUPPORTED_FRAMEWORK_MODES>;

/** Which preview renders a document: the WebGL shader runtime or a regular web page. Also the valid `renderer:` values. */
export type RendererMode = ElementOf<typeof SUPPORTED_RENDERERS>;

/** The two Markdown formats of an example (see the header of this file). */
export type SourceFormat = 'legacy-blocks' | 'virtual-files';

/** Where a file comes from: a legacy block (`blockId` set) or a `## @file` section. */
export type FileSourceKind = 'legacy' | 'virtual';

/** Roles accepted by `## @role` without a warning. Authors can write other roles: `VirtualFile.role` stays `string`. */
export type VirtualFileRole = ElementOf<typeof ALLOWED_VIRTUAL_FILE_ROLES>;

/** Roles given to the files derived from legacy blocks (`LEGACY_FILE_TEMPLATES`); `shader` is not a virtual-file role. */
export type LegacyFileRole = (typeof LEGACY_FILE_TEMPLATES)[BlockType]['role'];

/** Valid `example_stage:` values (the pedagogical role of an example). */
export type ExampleStage = ElementOf<typeof EXAMPLE_STAGE_VALUES>;

/** Valid `example_importance:` values. */
export type ExampleImportance = ElementOf<typeof EXAMPLE_IMPORTANCE_VALUES>;

/** The `exercise` flag and the `exercise_*` frontmatter keys. */
export type ExerciseMetadataKey = ElementOf<typeof EXERCISE_METADATA_KEYS>;

/** Frontmatter keys the parser knows: matched case-insensitively and stored lower-case. */
export type KnownMetadataKey = ElementOf<typeof KNOWN_METADATA_KEYS>;

/** Custom uniform types accepted in `shader_uniforms`. */
export type ShaderUniformType = ElementOf<typeof SHADER_CUSTOM_UNIFORM_TYPES>;

/** Uniforms the shader runtime always provides (`u_time`, `u_resolution`…); custom uniforms cannot reuse them. */
export type ShaderBuiltinUniform = ElementOf<typeof SHADER_BUILTIN_UNIFORMS>;

/** Ids of the editor's line-highlight colors (`HIGHLIGHT_COLORS`). */
export type HighlightColorId = (typeof HIGHLIGHT_COLORS)[number]['id'];

// ─── Metadata (frontmatter) ───────────────────────────────────────────────────

/**
 * A scalar frontmatter value. `parseMetadataValue()` turns `true`/`false` into booleans and canonical
 * numbers (`12`, `1.5`, not `007`) into numbers; everything else stays a string.
 */
export type MetadataValue = string | number | boolean;

/**
 * The frontmatter after `normalizeMetadata()`: the known keys are normalized (trimmed, lower-cased where
 * noted) and every other key is kept verbatim. Empty values (`''`, `null`, `undefined`) are dropped, so a
 * present key always has a value. Normalized does not mean valid: unsupported values are kept and reported
 * as diagnostics, which is why most known keys are `string` rather than a literal union.
 *
 * Keys in `KNOWN_METADATA_KEYS` are matched case-insensitively and stored lower-case; any other key keeps
 * its spelling (`LANG:` is not `lang:`). A virtual-files document always has `mode` (the parser adds
 * `multi-file` when it is missing).
 */
export interface ExampleMetadata {
    [key: string]: MetadataValue | undefined;
    /** Lower-cased; valid values are `Framework` (anything else gets an `unsupported-framework` error). */
    framework?: string;
    /** Lower-cased; valid values are `RendererMode`. `shader` turns a legacy document into a shader example. */
    renderer?: string;
    /** `single`/`singlefile`… are mapped to `FrameworkMode`; other text is kept lower-cased. */
    mode?: string;
    /** Virtual path of the entry file of a React/Vue multi-file project (normalized: no `./`, `/` or `\`). */
    entry?: string;
    /** Opens the preview console. A boolean when the text was a boolean word (`yes`, `on`, `1`…), else the raw value. */
    console?: MetadataValue;
    /** `|`-separated visibility keys of files hidden in the editor (`file:src/a.js|block:css:1`, see `FileVisibilityKey`). */
    editor_hidden_files?: string;
    /** Editor line highlights: `path:line:colorId,line:colorId||path2:…` (parsed by src/utils/highlights.ts). */
    highlights?: string;
    /** Shader canvas size `WIDTHxHEIGHT`, canonicalized when valid (`800 X 600` → `800x600`). */
    resolution?: string;
    /** `|`-separated `name:type=value[min,max,step]` declarations (see `ShaderUniform`). */
    shader_uniforms?: string;
    /** `|`-separated `uniformName=asset-file` declarations (see `ShaderTexture`). */
    shader_textures?: string;
    example_description?: string;
    /** Normalized tag list: lower-cased, de-duplicated, joined with `|`. */
    example_tags?: string;
    /** An integer 1–5 when valid, otherwise the raw text (reported as `invalid-example-rating`). */
    example_rating?: number | string;
    /** Lower-cased; valid values are `ExampleImportance`. */
    example_importance?: string;
    /** Lower-cased; valid values are `ExampleStage`. */
    example_stage?: string;
    /** Exercise mode switch: only an explicit boolean `true` enables it. Normalized like `console`. */
    exercise?: MetadataValue;
    exercise_title?: MetadataValue;
    /** Steps separated by `||` (a single `|` or a comma may appear inside a step). */
    exercise_instructions?: MetadataValue;
    /** Hints separated by `||`. */
    exercise_hints?: MetadataValue;
    /** Paths separated by `||`, `|` or `,` (the first separator found wins). */
    exercise_locked_files?: MetadataValue;
    /** `attempt=>solution` path pairs, separated like `exercise_locked_files`. */
    exercise_compare_pairs?: MetadataValue;
    exercise_reference_files?: MetadataValue;
    /** File name of the solution example in the same topic (`03-solucion.md`). */
    exercise_solution_example?: MetadataValue;
    exercise_solution_files?: MetadataValue;
    /** Page language of the preview (`<html lang>`); defaults to `es`. Not a known key: case-sensitive, raw. */
    lang?: MetadataValue;
    /** `false` (or `'false'`) disables the infinite-loop guards the compiler inserts. Raw, case-sensitive. */
    loop_protect?: MetadataValue;
    /** `false` (or `'false'`) skips TypeScript type checking. Raw, case-sensitive. */
    typecheck?: MetadataValue;
    /** Only on the theory pseudo-document built by src/utils/theoryDocument.ts (`'theory'`). */
    editorTarget?: MetadataValue;
}

/**
 * Metadata as callers supply it before `normalizeMetadata()` (presets, mutations, raw frontmatter):
 * any key, scalar values; `null`, `undefined` and `''` mean "absent". An `ExampleMetadata` is also valid input.
 */
export interface ExampleMetadataInput {
    readonly [key: string]: MetadataValue | null | undefined;
}

// ─── Blocks and files ─────────────────────────────────────────────────────────

/** Static description of a block type (`BLOCK_REGISTRY` entry, returned by `getBlockDefinition()`). */
export interface BlockDefinition {
    slot: BlockSlot;
    /** Canonical `# Heading` written above the fence when the document is serialized. */
    heading: string;
    /** Short badge text in the editor (`JS`, `TS`, `FRAG`). */
    badgeLabel: string;
    /** CSS modifier class of the editor badge. */
    badgeClass: string;
    /** Every registered type is enabled; a disabled one would parse with a `disabled-language` error. */
    enabled: boolean;
}

/** One fenced block of a legacy-blocks document. Built by `buildBlock()`, which only accepts registered types. */
export interface ExampleBlock {
    /** `${type}-${n}` with n the block's position in the Markdown (`css-1`); unique inside a parsed document. */
    id: string;
    slot: BlockSlot;
    type: BlockType;
    /** Always equal to `type`. */
    language: BlockType;
    /** The author's heading text, or the canonical one (`BlockDefinition.heading`). Not validated. */
    heading: string;
    /** Block body with surrounding blank lines and the shared indentation removed. */
    content: string;
    /**
     * Fence language as written, only when it differs from `type` (in practice `html` under a
     * `# HTML-FULL` heading); kept so serialization writes the same fence back.
     */
    fenceLanguage?: string;
}

/** A fenced block the parser could not use (unsupported language); kept so it is not silently lost. */
export interface UnsupportedBlock {
    /** Normalized fence language. */
    language: string;
    heading: string | null;
    content: string;
}

/**
 * One editable file of a document. In legacy-blocks documents there is one per block (`sourceKind:
 * 'legacy'`, path and role from `LEGACY_FILE_TEMPLATES`); in virtual-files documents one per `## @file`
 * section (`sourceKind: 'virtual'`). Built by `buildVirtualFile()`.
 */
export interface VirtualFile {
    /**
     * `${path}:${order}`; unique inside one document, used by the editor and the mutation API to address
     * files. Mutations reparse the document, so ids of later files can change after a file is added or removed.
     */
    id: string;
    /**
     * Normalized virtual path (`src/App.jsx`, `styles.css`); never empty (an empty `@file` path becomes
     * `invalid-file-${n}` and is reported).
     */
    path: string;
    /** Last path segment. */
    name: string;
    /**
     * Normalized language (aliases resolved). In a parsed document it is always a `FileLanguage`
     * (files with other languages are dropped with a diagnostic); a document built by hand or in the
     * middle of a mutation can hold anything until it is reparsed.
     */
    language: string;
    /**
     * `LegacyFileRole` for legacy files; the lower-cased `@role` text (often a `VirtualFileRole`, `''` when
     * absent, anything else with an `unsupported-file-role` warning) for virtual files.
     */
    role: string;
    content: string;
    sourceKind: FileSourceKind;
    /** Id of the source block (legacy files only, else `null`). Legacy file edits are written back through it. */
    blockId: string | null;
    /** Type of the source block (legacy files only, else `null`). */
    blockType: BlockType | null;
    /** Slot of the source block (legacy files only, else `null`). */
    slot: BlockSlot | null;
    /** Heading of the source block (legacy files only, else `null`). */
    heading: string | null;
    /** Position in `files`, from 0. */
    order: number;
}

// ─── The document ─────────────────────────────────────────────────────────────

/**
 * A parsed example (`parseExampleDocument()`), and the value every document API function returns.
 * Treat it as immutable: the mutation API (`updateDocumentFileContent`, `createDocumentFile`…) returns a
 * new document. `rendererMode`, `files` (legacy) and `sessionId` are derived: `synchronizeDocument()`
 * recomputes them from `blocks`/`files` and `metadata`.
 */
export interface ExampleDocument {
    rendererMode: RendererMode;
    /**
     * Describes the document's shape: the block types in slot order (`html-css-javascript`),
     * `react-multi-file`/`vue-multi-file`, or the file languages joined by `-`; `''` when empty. Used as a
     * fallback key for preview session state of unsaved documents.
     */
    sessionId: string;
    metadata: ExampleMetadata;
    /** Legacy blocks; sorted by `SLOT_ORDER` in a parsed document. Empty for virtual files. */
    blocks: ExampleBlock[];
    files: VirtualFile[];
    /** Structural diagnostics of the parse and validation, in the order they were found. */
    diagnostics: Diagnostic[];
    unsupportedBlocks: UnsupportedBlock[];
    sourceFormat: SourceFormat;
}

/**
 * A file as the tolerant document API may receive it: a file of an example, or the single `main.md` file
 * of the editor's theory pseudo-document (src/types/theory.ts), which has no block fields.
 */
export type DocumentFileInput = VirtualFile | TheoryDocumentFile;

/**
 * A document-like object as the document API tolerates it: every field optional. Presets, tests and the
 * validators pass partial documents (`getExerciseConfig({ metadata })`), and missing arrays default to `[]`.
 * The editor also sends its theory pseudo-document through these functions while theory is being edited
 * (toolbar state, typing, cloning, dirty tracking), which is why `files` admits the theory file.
 * Functions that return a document always return a complete `ExampleDocument`, with two caveats:
 * `synchronizeDocument()` copies `diagnostics`, `unsupportedBlocks` and `sourceFormat` from its input as they
 * are, and the functions that copy `files` (`cloneExampleDocument()`, `synchronizeDocument()`,
 * `updateDocumentFileContent()`) hand a theory file back unchanged, so a theory document in gives a
 * theory-shaped document out.
 */
export type ExampleDocumentInput = Partial<Omit<ExampleDocument, 'files'>> & { files?: DocumentFileInput[] };

// ─── Derived views (documentMeta.ts, documentApi.ts) ──────────────────────────

/** One `attempt=>solution` pair of `exercise_compare_pairs` (both paths normalized and non-empty). */
export interface ExerciseComparePair {
    attemptPath: string;
    solutionPath: string;
}

/** `getExerciseConfig()`: the `exercise*` metadata parsed into lists (all paths normalized). */
export interface ExerciseConfig {
    comparePairs: ExerciseComparePair[];
    /** True only for an explicit `exercise: true`. Leftover `exercise_*` keys alone only produce a warning. */
    enabled: boolean;
    /** `exercise_title`, or `'Exercise'` when empty. */
    title: string;
    instructions: string[];
    hints: string[];
    /** Files the learner cannot edit or change type. */
    lockedFiles: string[];
    referenceFiles: string[];
    /** `exercise_solution_example` trimmed, `''` when absent. */
    solutionExample: string;
    solutionFiles: string[];
    /** `referenceFiles` + `solutionFiles` without duplicates: concealed in the editor until revealed. */
    hiddenFiles: string[];
}

/** `getExampleEditorialMetadata()`: the editorial frontmatter (gallery cards, metadata dialog, checker). */
export interface ExampleEditorialMetadata {
    description: string;
    /** Normalized tags (lower-case, single spaces, no duplicates). */
    tags: string[];
    /** Tags joined with `|`, or the raw `example_tags` text when it held no usable tag. */
    tagsText: string;
    /** Integer 1–5, or `null` when absent or invalid. */
    rating: number | null;
    /** `''` when absent or invalid. */
    importance: ExampleImportance | '';
}

/** Canvas size of a shader example, in CSS pixels (positive integers). */
export interface ShaderResolution {
    width: number;
    height: number;
}

/** Slider hint of a numeric uniform: `[min,max,step]` in the declaration. Always `max > min` and `step > 0`. */
export interface ShaderUniformControl {
    kind: 'range';
    min: number;
    max: number;
    step: number;
}

/** Value of a custom uniform: `boolean` for `bool`, `number` for `float`/`int`, `number[]` of length N for `vecN`. */
export type ShaderUniformValue = number | boolean | number[];

/** One valid declaration of `shader_uniforms` (invalid ones are dropped with a warning). */
export interface ShaderUniform {
    /** GLSL identifier; never a built-in uniform name. */
    name: string;
    type: ShaderUniformType;
    /** Only `float`/`int` uniforms can have one; `null` without (or with an invalid) hint. */
    control: ShaderUniformControl | null;
    defaultValue: ShaderUniformValue;
    /** Current value; equals `defaultValue` in the parsed config (the preview's controls change their own copy). */
    value: ShaderUniformValue;
}

/** One valid declaration of `shader_textures`: a `sampler2D` uniform fed from a topic asset. */
export interface ShaderTexture {
    /** Sampler uniform name. */
    name: string;
    /** File name inside the topic's `assets/` folder (top level only, image extension). */
    assetPath: string;
}

/** `getShaderConfig()`: the shader metadata parsed for the shader renderer, the preview and the editor dialogs. */
export interface ShaderConfig {
    /** The document renders with the shader runtime (`rendererMode === 'shader'`). */
    enabled: boolean;
    /** The frontmatter says `renderer: shader` (shader blocks alone also enable the shader mode). */
    explicit: boolean;
    builtInUniforms: ShaderBuiltinUniform[];
    customUniforms: ShaderUniform[];
    textures: ShaderTexture[];
    rendererMode: RendererMode;
    /** `null` when `resolution` is missing or invalid (renderers fall back to 800×600). */
    resolution: ShaderResolution | null;
    /** `resolution` metadata as written (trimmed). */
    resolutionText: string;
    /** Canonical `shader_uniforms` text (valid declarations only), or the raw text when none was valid. */
    shaderUniformsText: string;
    /** Canonical `shader_textures` text, or the raw text when none was valid. */
    shaderTexturesText: string;
}

/**
 * Stable key of a file for `editor_hidden_files`: `file:<path>` for virtual files, `block:<type>:<n>` for
 * the n-th (from 1) legacy block of a type, `''` when the file has neither.
 */
export type FileVisibilityKey = `file:${string}` | `block:${string}:${number}` | '';

/** `getDocumentFileVisibilityEntries()`: one per file, in file order. */
export interface FileVisibilityEntry {
    file: VirtualFile;
    /** The key is listed in `editor_hidden_files`. */
    hidden: boolean;
    key: FileVisibilityKey;
}

/** Where a file-type (badge) change is evaluated; selects the candidate languages and the rules. */
export type FileTypeChangeContext =
    'shader' | 'react-virtual' | 'vue-virtual' | 'virtual-generic' | 'react-legacy' | 'vue-legacy' | 'legacy';

/** `evaluateDocumentFileTypeChange()`: whether a file can switch to another language, and what would change. */
export interface FileTypeChangeEvaluation {
    allowed: boolean;
    /** `''` when allowed; otherwise why not (`incompatible-target-type`, `file-not-found`…). */
    code: string;
    context: FileTypeChangeContext;
    /** Normalized current type of the file (`''` when the file was not found). */
    currentType: string;
    /** Extensions expected for `nextType` (`[]` for languages without one). */
    expectedExtensions: string[];
    /** Path the file would get (virtual files only; `''` for legacy files). */
    expectedPath: string;
    file: VirtualFile | null;
    /** Normalized target language. */
    nextType: string;
    /** User-facing explanation when not allowed, `''` otherwise. */
    reason: string;
    /** The change renames the file (its extension changes). */
    wouldChangePath: boolean;
}

/** `getDocumentFileTypeChangeOptions()`: one entry of the editor's "change badge" menu. */
export interface FileTypeChangeOption {
    allowed: boolean;
    code: string;
    expectedExtensions: string[];
    expectedPath: string;
    /** Display label of the language (`TypeScript`, `Vue SFC`). */
    label: string;
    reason: string;
    /** Normalized target language. */
    value: string;
    wouldChangePath: boolean;
}

// ─── Mutation inputs (mutations.ts) ───────────────────────────────────────────

/** `createDocumentFile()` options. Legacy documents add a block of `language` and ignore `path`/`role`. */
export interface NewDocumentFile {
    /** Required in practice: nothing is created without it. Aliases are accepted. */
    language?: string;
    /** Virtual files only; nothing is created without a path. */
    path?: string;
    /** Virtual files only. `entry` also moves `metadata.entry` to this file. */
    role?: string;
    content?: string;
}

/** `updateDocumentFileDetails()` changes (virtual files only). Omitted or empty fields keep the current value, except `role`. */
export interface DocumentFileDetailsUpdate {
    path?: string;
    language?: string;
    /** `''` clears the role; `null`/omitted keeps it. `entry` also updates `metadata.entry`. */
    role?: string | null;
}

/**
 * `updateExampleEditorialMetadata()` changes. Only the keys present are applied; a present key with an
 * empty or invalid value removes the metadata.
 */
export interface ExampleEditorialUpdate {
    description?: string;
    /** `|`- or `,`-separated text, or a list. */
    tags?: string | readonly string[];
    /** Integer 1–5 (number or text). */
    rating?: number | string | null;
    importance?: string;
}

/** A uniform as the shader dialog edits it (`updateShaderUniformDefinitions()`); entries with an invalid name or type are skipped. */
export interface ShaderUniformDraft {
    name?: string;
    type?: string;
    defaultValue?: ShaderUniformValue | null;
    control?: ShaderUniformControl | null;
    value?: ShaderUniformValue | null;
}

/** A texture as the shader dialog edits it (`updateShaderTextureDefinitions()`); invalid entries are skipped. */
export interface ShaderTextureDraft {
    name?: string;
    assetPath?: string;
}

/** `updateShaderResolution()` input: numbers or numeric text (rounded; non-positive values are ignored). */
export interface ShaderResolutionInput {
    width?: number | string;
    height?: number | string;
}

// ─── Session presets (exampleBlocks.ts) ───────────────────────────────────────

/** A block of a session preset. `type` may be an alias (`html-b`). */
export interface SessionPresetBlock {
    type: BlockType | BlockAlias;
    content: string;
}

/** A file of a multi-file session preset. */
export interface SessionPresetFile {
    path: string;
    language: FileLanguage;
    role?: VirtualFileRole;
    content: string;
}

/**
 * A starting document offered when creating an example (`SESSION_PRESETS`): either `blocks` (legacy) or
 * `files` (virtual). `__EXAMPLE_NAME__` in the content is replaced with the example name by the server.
 */
export interface SessionPreset {
    id: string;
    label: string;
    metadata?: ExampleMetadataInput;
    blocks?: readonly SessionPresetBlock[];
    files?: readonly SessionPresetFile[];
}

// ─── Line highlights ──────────────────────────────────────────────────────────

/** One entry of `HIGHLIGHT_COLORS`. */
export interface HighlightColor {
    id: string;
    label: string;
    /** CSS background of a highlighted line. */
    bg: string;
    /** CSS color of the highlight's left border. */
    border: string;
}

/**
 * One highlighted line, as theory embeds list them. `colorId` comes from the metadata text and is not
 * validated: it is normally a `HighlightColorId` (unknown ids fall back to the first color).
 */
export interface LineHighlight {
    /** 1-based line number. */
    line: number;
    colorId: string;
}

/** Highlights of one file: 1-based line number → color id. */
export type FileLineHighlights = Map<number, string>;

/** Highlights of a document (`parseHighlights()`): `VirtualFile.id` → that file's highlights. */
export type DocumentHighlights = Map<string, FileLineHighlights>;

// Compile-time guard: every key of KNOWN_METADATA_KEYS must have its own typed field in ExampleMetadata
// (a key missing there makes this line fail to type-check).
type DeclaredKeys<T> = keyof { [K in keyof T as string extends K ? never : K]: T[K] };
type AssertNever<T extends never> = T;
type _EveryKnownMetadataKeyIsTyped = AssertNever<Exclude<KnownMetadataKey, DeclaredKeys<ExampleMetadata>>>;

// Runtime tables of the example document model: the closed sets the parser, the validators, the
// file-type rules and the editor's option menus are built from. Used by every module in
// src/utils/markdown/ (some lists are re-exported by src/utils/markdown.ts for the editor).
//
// The literal unions of src/types/document.ts (`Framework`, `ExampleStage`, `FileLanguage`…) are derived
// from these tables: add a value here and the type follows. Sets and lists are typed as `LiteralSet` /
// `LiteralList`, so iterating them yields the literal union while `has()` / `includes()` still accept any
// string (what they test is raw author input). Nothing here is mutated at runtime.

import type { BlockAlias, BlockType, FileLanguage, ShaderBlockType, VirtualFileRole } from '../../types/document.ts';

/**
 * A read-only Set of known string literals: its elements are `T`, but `has()` accepts any string because
 * the values tested are raw author input (frontmatter, fence info strings, `@role` directives).
 */
export interface LiteralSet<T extends string> extends ReadonlySet<T> {
    has(value: string): boolean;
}

/** A read-only list of known string literals: elements are `T`, `includes()` / `indexOf()` accept any string. */
export interface LiteralList<T extends string> extends ReadonlyArray<T> {
    includes(searchElement: string, fromIndex?: number): boolean;
    indexOf(searchElement: string, fromIndex?: number): number;
}

const FRAMEWORK_NAMES = ['react', 'vue'] as const;
const RENDERER_NAMES = ['shader', 'web'] as const;
const FRAMEWORK_MODE_NAMES = ['single-file', 'multi-file'] as const;
const SHADER_STAGE_NAMES = ['vertex', 'fragment'] as const;
const SHADER_BUILTIN_UNIFORM_NAMES = [
    'u_time',
    'u_delta',
    'u_resolution',
    'u_mouse',
    'u_mouse_pressed',
    'u_frame',
] as const;
const SHADER_UNIFORM_TYPE_NAMES = ['float', 'int', 'bool', 'vec2', 'vec3', 'vec4'] as const;

/** Values accepted by `framework:`. */
export const SUPPORTED_FRAMEWORKS: LiteralSet<(typeof FRAMEWORK_NAMES)[number]> = new Set(FRAMEWORK_NAMES);
/** Values accepted by `renderer:`; also the possible `rendererMode` of a document. */
export const SUPPORTED_RENDERERS: LiteralSet<(typeof RENDERER_NAMES)[number]> = new Set(RENDERER_NAMES);
/** Values accepted by `mode:` (after `normalizeModeValue()`). */
export const SUPPORTED_FRAMEWORK_MODES: LiteralSet<(typeof FRAMEWORK_MODE_NAMES)[number]> = new Set(
    FRAMEWORK_MODE_NAMES,
);
/** Block types that make a legacy document a shader example. */
export const SHADER_BLOCK_TYPES: LiteralSet<(typeof SHADER_STAGE_NAMES)[number]> = new Set(SHADER_STAGE_NAMES);
/** Uniforms the shader runtime always sets; custom uniforms with these names are ignored with a warning. */
export const SHADER_BUILTIN_UNIFORMS: LiteralList<(typeof SHADER_BUILTIN_UNIFORM_NAMES)[number]> =
    Object.freeze(SHADER_BUILTIN_UNIFORM_NAMES);
/** Types allowed in `shader_uniforms` declarations. */
export const SHADER_CUSTOM_UNIFORM_TYPES: LiteralSet<(typeof SHADER_UNIFORM_TYPE_NAMES)[number]> = new Set(
    SHADER_UNIFORM_TYPE_NAMES,
);
/** Image extensions a shader texture asset may have. */
export const SHADER_TEXTURE_EXTENSIONS: LiteralSet<string> = new Set([
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.webp',
    '.avif',
    '.bmp',
    '.svg',
]);

const EXERCISE_METADATA_KEY_NAMES = [
    'exercise',
    'exercise_title',
    'exercise_instructions',
    'exercise_hints',
    'exercise_locked_files',
    'exercise_compare_pairs',
    'exercise_reference_files',
    'exercise_solution_example',
    'exercise_solution_files',
] as const;
const EXAMPLE_STAGE_NAMES = [
    'minimal',
    'intermediate',
    'common-error',
    'final-solution',
    'exercise',
    'professional',
] as const;
const EXAMPLE_IMPORTANCE_NAMES = ['trivial', 'useful', 'important', 'critical'] as const;

/** The `exercise` flag and every `exercise_*` key (exercise mode; leftovers without the flag are reported). */
export const EXERCISE_METADATA_KEYS: LiteralSet<(typeof EXERCISE_METADATA_KEY_NAMES)[number]> = new Set(
    EXERCISE_METADATA_KEY_NAMES,
);
/** Valid `example_stage:` values. */
export const EXAMPLE_STAGE_VALUES: LiteralSet<(typeof EXAMPLE_STAGE_NAMES)[number]> = new Set(EXAMPLE_STAGE_NAMES);
/** Valid `example_importance:` values, from least to most important. */
export const EXAMPLE_IMPORTANCE_VALUES: LiteralSet<(typeof EXAMPLE_IMPORTANCE_NAMES)[number]> = new Set(
    EXAMPLE_IMPORTANCE_NAMES,
);
/** Block types that can be the app block of a React single-file example. */
export const REACT_APP_BLOCK_TYPES: LiteralSet<BlockType> = new Set<BlockType>(['jsx', 'tsx']);
/** Languages a React multi-file project accepts. */
export const REACT_MULTI_FILE_LANGUAGES: LiteralSet<FileLanguage> = new Set<FileLanguage>([
    'jsx',
    'tsx',
    'javascript',
    'typescript',
    'css',
    'scss',
    'sass',
    'json',
]);
/** Languages a React entry file may use. */
export const REACT_MULTI_FILE_ENTRY_LANGUAGES: LiteralSet<FileLanguage> = new Set<FileLanguage>([
    'jsx',
    'tsx',
    'javascript',
    'typescript',
]);
/** Languages a Vue multi-file project accepts (`html` files are render templates). */
export const VUE_MULTI_FILE_LANGUAGES: LiteralSet<FileLanguage> = new Set<FileLanguage>([
    'html',
    'javascript',
    'typescript',
    'css',
    'scss',
    'sass',
    'json',
    'vue',
]);
/** Languages a Vue entry file may use. */
export const VUE_MULTI_FILE_ENTRY_LANGUAGES: LiteralSet<FileLanguage> = new Set<FileLanguage>([
    'javascript',
    'typescript',
]);
/** Extensions of binary assets: a `## @file` with one of them is reported as an unsupported virtual asset. */
export const LIKELY_VIRTUAL_ASSET_EXTENSIONS: LiteralSet<string> = new Set([
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.webp',
    '.avif',
    '.ico',
    '.bmp',
    '.svg',
    '.woff',
    '.woff2',
    '.ttf',
    '.otf',
    '.eot',
    '.mp3',
    '.wav',
    '.ogg',
    '.mp4',
    '.webm',
]);

const KNOWN_METADATA_KEY_NAMES = [
    'framework',
    'renderer',
    'mode',
    'entry',
    'console',
    'editor_hidden_files',
    'highlights',
    'resolution',
    'shader_uniforms',
    'shader_textures',
    'example_description',
    'example_tags',
    'example_rating',
    'example_importance',
    'example_stage',
    ...EXERCISE_METADATA_KEYS,
] as const;
const VIRTUAL_FILE_ROLE_NAMES = [
    'app',
    'asset',
    'component',
    'config',
    'context',
    'entry',
    'hook',
    'markup',
    'page',
    'reducer',
    'script',
    'style',
    'util',
] as const;

/**
 * Frontmatter keys the parser knows: matched case-insensitively, stored lower-case and normalized by
 * `normalizeMetadata()`. Other keys are kept verbatim.
 */
export const KNOWN_METADATA_KEYS: LiteralSet<(typeof KNOWN_METADATA_KEY_NAMES)[number]> = new Set(
    KNOWN_METADATA_KEY_NAMES,
);
/** `@role` values accepted without an `unsupported-file-role` warning. */
export const ALLOWED_VIRTUAL_FILE_ROLES: LiteralSet<(typeof VIRTUAL_FILE_ROLE_NAMES)[number]> = new Set(
    VIRTUAL_FILE_ROLE_NAMES,
);

// Option lists of the editor's "add file" / "change badge" menus (re-exported by src/utils/markdown.ts).

/** Block languages offered for plain legacy examples (`html-b` is an alias of `html`). */
export const LEGACY_DEFAULT_BLOCK_LANGUAGE_OPTIONS: LiteralList<BlockType | BlockAlias> = [
    'html',
    'html-b',
    'html-full',
    'svg',
    'pug',
    'css',
    'scss',
    'sass',
    'javascript',
    'typescript',
    'jsx',
    'tsx',
];
/** Block languages of a shader example. */
export const SHADER_BLOCK_LANGUAGE_OPTIONS: LiteralList<ShaderBlockType> = ['vertex', 'fragment'];
/** Block languages offered for React single-file examples. */
export const LEGACY_REACT_BLOCK_LANGUAGE_OPTIONS: LiteralList<BlockType> = ['jsx', 'tsx', 'css', 'scss', 'sass'];
/** Block languages offered for Vue single-file examples. */
export const LEGACY_VUE_BLOCK_LANGUAGE_OPTIONS: LiteralList<BlockType> = [
    'html',
    'css',
    'scss',
    'sass',
    'javascript',
    'typescript',
];
/** File languages offered for React multi-file projects. */
export const REACT_MULTI_FILE_LANGUAGE_OPTIONS: LiteralList<FileLanguage> = [
    'jsx',
    'tsx',
    'javascript',
    'typescript',
    'css',
    'scss',
    'sass',
    'json',
];
/** Languages a React entry file can be switched to. */
export const REACT_MULTI_FILE_ENTRY_LANGUAGE_OPTIONS: LiteralList<FileLanguage> = [
    'jsx',
    'tsx',
    'javascript',
    'typescript',
];
/** File languages offered for Vue multi-file projects. */
export const VUE_MULTI_FILE_LANGUAGE_OPTIONS: LiteralList<FileLanguage> = [
    'html',
    'javascript',
    'typescript',
    'css',
    'scss',
    'sass',
    'json',
    'vue',
];
/** Languages a Vue entry file can be switched to. */
export const VUE_MULTI_FILE_ENTRY_LANGUAGE_OPTIONS: LiteralList<FileLanguage> = ['javascript', 'typescript'];
/** Role menu of a virtual file (`''` = no role). */
export const VIRTUAL_FILE_ROLE_OPTIONS: LiteralList<VirtualFileRole | ''> = [
    '',
    'app',
    'asset',
    'component',
    'config',
    'context',
    'entry',
    'hook',
    'markup',
    'page',
    'reducer',
    'script',
    'style',
    'util',
];

/**
 * Extensions expected for each file language, preferred one first (a mismatch is only a warning). Its keys
 * define `FileLanguage`: every language a document file can have.
 */
export const LANGUAGE_FILE_EXTENSIONS = {
    css: ['.css'],
    fragment: ['.frag', '.glsl'],
    html: ['.html', '.htm'],
    'html-full': ['.html', '.htm'],
    javascript: ['.js', '.mjs'],
    json: ['.json'],
    jsx: ['.jsx'],
    pug: ['.pug'],
    sass: ['.sass'],
    scss: ['.scss'],
    svg: ['.svg'],
    typescript: ['.ts', '.mts'],
    tsx: ['.tsx'],
    vertex: ['.vert', '.glsl'],
    vue: ['.vue'],
} satisfies Record<string, readonly string[]>;
/** Markup languages of a legacy example (one of them at most). */
export const LEGACY_MARKUP_LANGUAGE_OPTIONS: LiteralList<BlockType> = ['html', 'html-full', 'svg', 'pug'];
/** Style languages (legacy blocks and virtual files alike). */
export const LEGACY_STYLE_LANGUAGE_OPTIONS: LiteralList<BlockType> = ['css', 'scss', 'sass'];
/** Script languages of a legacy example. */
export const LEGACY_SCRIPT_LANGUAGE_OPTIONS: LiteralList<BlockType> = ['javascript', 'typescript'];
/** App-block languages of a React single-file example. */
export const LEGACY_APP_LANGUAGE_OPTIONS: LiteralList<BlockType> = ['jsx', 'tsx'];
/** Languages a React source (non-style, non-JSON) file can switch between. */
export const REACT_MULTI_FILE_CODE_LANGUAGE_OPTIONS: LiteralList<FileLanguage> = [
    'jsx',
    'tsx',
    'javascript',
    'typescript',
];
/** Languages a Vue source module can switch between. */
export const VUE_MULTI_FILE_CODE_LANGUAGE_OPTIONS: LiteralList<FileLanguage> = ['javascript', 'typescript'];
/** Roles of React files that hold source code (`''` = no role). */
export const REACT_MULTI_FILE_CODE_ROLES: LiteralSet<VirtualFileRole | ''> = new Set<VirtualFileRole | ''>([
    '',
    'app',
    'component',
    'context',
    'hook',
    'page',
    'reducer',
    'script',
    'util',
]);
/** Roles of Vue files that hold source code modules (`''` = no role). */
export const VUE_MULTI_FILE_CODE_ROLES: LiteralSet<VirtualFileRole | ''> = new Set<VirtualFileRole | ''>([
    '',
    'context',
    'hook',
    'page',
    'reducer',
    'script',
    'util',
]);
/** Roles a Vue SFC (`.vue`) file may have. */
export const VUE_MULTI_FILE_SFC_ROLES: LiteralSet<VirtualFileRole> = new Set<VirtualFileRole>([
    'app',
    'component',
    'page',
]);
/** Display names of the languages, for those without a block definition (block types use `BlockDefinition.heading`). */
export const LANGUAGE_LABELS = {
    css: 'CSS',
    fragment: 'Fragment',
    html: 'HTML',
    'html-full': 'HTML-FULL',
    javascript: 'JavaScript',
    json: 'JSON',
    jsx: 'JSX',
    pug: 'Pug',
    sass: 'SASS',
    scss: 'SCSS',
    svg: 'SVG',
    typescript: 'TypeScript',
    tsx: 'TSX',
    vertex: 'Vertex',
    vue: 'Vue SFC',
} satisfies Record<FileLanguage, string>;

/**
 * Path and role of the file derived from each legacy block type (`deriveFilesFromBlocks()`), e.g. the CSS
 * block is shown as `styles.css`. Every block type has one.
 */
export const LEGACY_FILE_TEMPLATES = {
    jsx: { path: 'App.jsx', role: 'app' },
    tsx: { path: 'App.tsx', role: 'app' },
    html: { path: 'index.html', role: 'markup' },
    'html-full': { path: 'document.html', role: 'markup' },
    svg: { path: 'graphic.svg', role: 'markup' },
    pug: { path: 'template.pug', role: 'markup' },
    vertex: { path: 'shader.vert', role: 'shader' },
    fragment: { path: 'shader.frag', role: 'shader' },
    css: { path: 'styles.css', role: 'style' },
    scss: { path: 'styles.scss', role: 'style' },
    sass: { path: 'styles.sass', role: 'style' },
    javascript: { path: 'script.js', role: 'script' },
    typescript: { path: 'script.ts', role: 'script' },
} as const satisfies Record<BlockType, { path: string; role: string }>;

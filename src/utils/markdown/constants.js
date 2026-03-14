export const SUPPORTED_FRAMEWORKS = new Set(['react', 'vue']);
export const SUPPORTED_RENDERERS = new Set(['shader', 'web']);
export const SUPPORTED_FRAMEWORK_MODES = new Set(['single-file', 'multi-file']);
export const SHADER_BLOCK_TYPES = new Set(['vertex', 'fragment']);
export const SHADER_BUILTIN_UNIFORMS = Object.freeze([
    'u_time',
    'u_delta',
    'u_resolution',
    'u_mouse',
    'u_mouse_pressed',
    'u_frame',
]);
export const SHADER_CUSTOM_UNIFORM_TYPES = new Set(['float', 'int', 'bool', 'vec2', 'vec3', 'vec4']);
export const SHADER_TEXTURE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.bmp', '.svg']);
export const EXERCISE_METADATA_KEYS = new Set([
    'exercise',
    'exercise_title',
    'exercise_instructions',
    'exercise_hints',
    'exercise_locked_files',
    'exercise_compare_pairs',
    'exercise_reference_files',
    'exercise_solution_example',
    'exercise_solution_files',
]);
export const EXAMPLE_STAGE_VALUES = new Set([
    'minimal',
    'intermediate',
    'common-error',
    'final-solution',
    'exercise',
]);
export const EXAMPLE_IMPORTANCE_VALUES = new Set([
    'trivial',
    'useful',
    'important',
    'critical',
]);
export const REACT_APP_BLOCK_TYPES = new Set(['jsx', 'tsx']);
export const REACT_MULTI_FILE_LANGUAGES = new Set(['jsx', 'tsx', 'javascript', 'typescript', 'css', 'scss', 'sass', 'json']);
export const REACT_MULTI_FILE_ENTRY_LANGUAGES = new Set(['jsx', 'tsx', 'javascript', 'typescript']);
export const VUE_MULTI_FILE_LANGUAGES = new Set(['html', 'javascript', 'typescript', 'css', 'scss', 'sass', 'json', 'vue']);
export const VUE_MULTI_FILE_ENTRY_LANGUAGES = new Set(['javascript', 'typescript']);
export const LIKELY_VIRTUAL_ASSET_EXTENSIONS = new Set([
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
export const KNOWN_METADATA_KEYS = new Set([
    'framework',
    'renderer',
    'mode',
    'entry',
    'console',
    'editor_hidden_files',
    'resolution',
    'shader_uniforms',
    'shader_textures',
    'example_description',
    'example_tags',
    'example_rating',
    'example_importance',
    'example_stage',
    ...EXERCISE_METADATA_KEYS,
]);
export const ALLOWED_VIRTUAL_FILE_ROLES = new Set([
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
]);

export const LEGACY_DEFAULT_BLOCK_LANGUAGE_OPTIONS = [
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
export const SHADER_BLOCK_LANGUAGE_OPTIONS = ['vertex', 'fragment'];
export const LEGACY_REACT_BLOCK_LANGUAGE_OPTIONS = ['jsx', 'tsx', 'css', 'scss', 'sass'];
export const LEGACY_VUE_BLOCK_LANGUAGE_OPTIONS = ['html', 'css', 'scss', 'sass', 'javascript', 'typescript'];
export const REACT_MULTI_FILE_LANGUAGE_OPTIONS = ['jsx', 'tsx', 'javascript', 'typescript', 'css', 'scss', 'sass', 'json'];
export const REACT_MULTI_FILE_ENTRY_LANGUAGE_OPTIONS = ['jsx', 'tsx', 'javascript', 'typescript'];
export const VUE_MULTI_FILE_LANGUAGE_OPTIONS = ['html', 'javascript', 'typescript', 'css', 'scss', 'sass', 'json', 'vue'];
export const VUE_MULTI_FILE_ENTRY_LANGUAGE_OPTIONS = ['javascript', 'typescript'];
export const VIRTUAL_FILE_ROLE_OPTIONS = [
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
};
export const LEGACY_MARKUP_LANGUAGE_OPTIONS = ['html', 'html-full', 'svg', 'pug'];
export const LEGACY_STYLE_LANGUAGE_OPTIONS = ['css', 'scss', 'sass'];
export const LEGACY_SCRIPT_LANGUAGE_OPTIONS = ['javascript', 'typescript'];
export const LEGACY_APP_LANGUAGE_OPTIONS = ['jsx', 'tsx'];
export const REACT_MULTI_FILE_CODE_LANGUAGE_OPTIONS = ['jsx', 'tsx', 'javascript', 'typescript'];
export const VUE_MULTI_FILE_CODE_LANGUAGE_OPTIONS = ['javascript', 'typescript'];
export const REACT_MULTI_FILE_CODE_ROLES = new Set(['', 'app', 'component', 'context', 'hook', 'page', 'reducer', 'script', 'util']);
export const VUE_MULTI_FILE_CODE_ROLES = new Set(['', 'context', 'hook', 'page', 'reducer', 'script', 'util']);
export const VUE_MULTI_FILE_SFC_ROLES = new Set(['app', 'component', 'page']);
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
};

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
};

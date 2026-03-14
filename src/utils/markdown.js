import {
    deriveSessionId,
    getBlockDefinition,
    getSessionPreset,
    normalizeBlockType,
    sortBlocks,
} from '../config/exampleBlocks.js';

const SUPPORTED_FRAMEWORKS = new Set(['react', 'vue']);
const SUPPORTED_RENDERERS = new Set(['shader', 'web']);
const SUPPORTED_FRAMEWORK_MODES = new Set(['single-file', 'multi-file']);
const SHADER_BLOCK_TYPES = new Set(['vertex', 'fragment']);
const SHADER_BUILTIN_UNIFORMS = Object.freeze([
    'u_time',
    'u_delta',
    'u_resolution',
    'u_mouse',
    'u_mouse_pressed',
    'u_frame',
]);
const SHADER_CUSTOM_UNIFORM_TYPES = new Set(['float', 'int', 'bool', 'vec2', 'vec3', 'vec4']);
const SHADER_TEXTURE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.bmp', '.svg']);
const EXERCISE_METADATA_KEYS = new Set([
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
const EXAMPLE_STAGE_VALUES = new Set([
    'minimal',
    'intermediate',
    'common-error',
    'final-solution',
    'exercise',
]);
const REACT_APP_BLOCK_TYPES = new Set(['jsx', 'tsx']);
const REACT_MULTI_FILE_LANGUAGES = new Set(['jsx', 'tsx', 'javascript', 'typescript', 'css', 'scss', 'sass', 'json']);
const REACT_MULTI_FILE_ENTRY_LANGUAGES = new Set(['jsx', 'tsx', 'javascript', 'typescript']);
const VUE_MULTI_FILE_LANGUAGES = new Set(['html', 'javascript', 'typescript', 'css', 'scss', 'sass', 'json', 'vue']);
const VUE_MULTI_FILE_ENTRY_LANGUAGES = new Set(['javascript', 'typescript']);
const LIKELY_VIRTUAL_ASSET_EXTENSIONS = new Set([
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
const KNOWN_METADATA_KEYS = new Set([
    'framework',
    'renderer',
    'mode',
    'entry',
    'console',
    'editor_hidden_files',
    'resolution',
    'shader_uniforms',
    'shader_textures',
    'example_stage',
    ...EXERCISE_METADATA_KEYS,
]);
const ALLOWED_VIRTUAL_FILE_ROLES = new Set([
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
const LANGUAGE_FILE_EXTENSIONS = {
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

const LEGACY_FILE_TEMPLATES = {
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

function createDiagnostic(level, code, message, details = {}) {
    return { level, code, message, ...details };
}

function isHeadingLine(line) {
    return /^#{1,6}\s+.+$/.test(line);
}

function isFenceLine(line) {
    return /^```([\w+-]+)\s*$/.test(line);
}

function parseFenceLanguage(line) {
    const match = line.match(/^```([\w+-]+)\s*$/);
    return match ? normalizeBlockType(match[1]) : '';
}

function headingsMatch(actualHeading, expectedHeading) {
    if (!actualHeading) return true;
    return actualHeading.trim().toLowerCase() === expectedHeading.trim().toLowerCase();
}

function normalizeMetadataKey(key = '') {
    const value = String(key).trim();
    const lowered = value.toLowerCase();

    if (KNOWN_METADATA_KEYS.has(lowered)) {
        return lowered;
    }

    return value;
}

function normalizeModeValue(value = '') {
    const normalized = String(value).trim().toLowerCase();

    if (['single', 'single-file', 'singlefile'].includes(normalized)) {
        return 'single-file';
    }

    if (['multi', 'multi-file', 'multifile'].includes(normalized)) {
        return 'multi-file';
    }

    return normalized;
}

function normalizeRendererValue(value = '') {
    return String(value).trim().toLowerCase();
}

function parseShaderResolutionValue(value = '') {
    const text = String(value ?? '').trim();
    if (!text) return null;

    const match = text.match(/^(\d+)\s*x\s*(\d+)$/i);
    if (!match) return null;

    const width = Number.parseInt(match[1], 10);
    const height = Number.parseInt(match[2], 10);

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        return null;
    }

    return {
        width,
        height,
        value: `${width}x${height}`,
    };
}

function normalizeResolutionMetadataValue(value = '') {
    const parsed = parseShaderResolutionValue(value);
    return parsed ? parsed.value : String(value ?? '').trim();
}

function normalizeBooleanMetadataValue(value) {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();

        if (['true', '1', 'yes', 'on'].includes(normalized)) {
            return true;
        }

        if (['false', '0', 'no', 'off'].includes(normalized)) {
            return false;
        }
    }

    return value;
}

function normalizeMetadata(metadata = {}) {
    const normalized = {};

    Object.entries(metadata).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;

        const normalizedKey = normalizeMetadataKey(key);

        if (normalizedKey === 'framework') {
            normalized.framework = String(value).trim().toLowerCase();
            return;
        }

        if (normalizedKey === 'renderer') {
            normalized.renderer = normalizeRendererValue(value);
            return;
        }

        if (normalizedKey === 'mode') {
            normalized.mode = normalizeModeValue(value);
            return;
        }

        if (normalizedKey === 'entry') {
            normalized.entry = normalizeVirtualPath(String(value));
            return;
        }

        if (normalizedKey === 'console') {
            normalized.console = normalizeBooleanMetadataValue(value);
            return;
        }

        if (normalizedKey === 'editor_hidden_files') {
            normalized.editor_hidden_files = String(value).trim();
            return;
        }

        if (normalizedKey === 'resolution') {
            normalized.resolution = normalizeResolutionMetadataValue(value);
            return;
        }

        if (normalizedKey === 'shader_uniforms') {
            normalized.shader_uniforms = String(value).trim();
            return;
        }

        if (normalizedKey === 'shader_textures') {
            normalized.shader_textures = String(value).trim();
            return;
        }

        if (normalizedKey === 'exercise') {
            normalized.exercise = normalizeBooleanMetadataValue(value);
            return;
        }

        if (normalizedKey === 'example_stage') {
            normalized.example_stage = String(value).trim().toLowerCase();
            return;
        }

        normalized[normalizedKey] = value;
    });

    return normalized;
}

function cloneMetadata(metadata = {}) {
    return JSON.parse(JSON.stringify(metadata || {}));
}

function normalizeVirtualPath(value = '') {
    return String(value)
        .trim()
        .replaceAll('\\', '/')
        .replace(/^\.\/+/, '')
        .replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/');
}

function getVirtualPathSegments(path = '') {
    const normalized = normalizeVirtualPath(path);
    return normalized ? normalized.split('/') : [];
}

function getVirtualPathIssue(path = '') {
    const normalized = normalizeVirtualPath(path);

    if (!normalized) {
        return 'empty';
    }

    const segments = getVirtualPathSegments(normalized);

    if (segments.some((segment) => segment === '.' || segment === '..' || segment === '')) {
        return 'traversal';
    }

    return '';
}

function getFileName(path = '') {
    return normalizeVirtualPath(path).split('/').pop() || path;
}

function getFileExtension(path = '') {
    const fileName = getFileName(path);
    const index = fileName.lastIndexOf('.');

    if (index <= 0) return '';
    return fileName.slice(index).toLowerCase();
}

function getExpectedExtensions(language = '') {
    return LANGUAGE_FILE_EXTENSIONS[normalizeBlockType(language)] || [];
}

function isLikelyVirtualAssetPath(path = '') {
    return LIKELY_VIRTUAL_ASSET_EXTENSIONS.has(getFileExtension(path));
}

function buildBlock(type, content, headingOverride = null, id = '') {
    const normalizedType = normalizeBlockType(type);
    const definition = getBlockDefinition(normalizedType);
    return {
        id,
        slot: definition.slot,
        type: normalizedType,
        language: normalizedType,
        heading: headingOverride || definition.heading,
        content,
    };
}

function buildVirtualFile({
    path,
    language,
    content = '',
    role = '',
    sourceKind = 'virtual',
    blockId = null,
    blockType = null,
    slot = null,
    heading = null,
    index = 0,
}) {
    const normalizedLanguage = normalizeBlockType(language);
    const normalizedPath = normalizeVirtualPath(path);

    return {
        id: `${normalizedPath || `file-${index}`}:${index}`,
        path: normalizedPath || `file-${index}`,
        name: getFileName(normalizedPath || `file-${index}`),
        language: normalizedLanguage,
        role,
        content,
        sourceKind,
        blockId,
        blockType,
        slot,
        heading,
        order: index,
    };
}

function getDirectoryName(path = '') {
    const normalized = normalizeVirtualPath(path);
    const slashIndex = normalized.lastIndexOf('/');
    return slashIndex === -1 ? '' : normalized.slice(0, slashIndex);
}

function getFileStem(path = '') {
    const fileName = getFileName(path);
    const extension = getFileExtension(path);

    if (!extension) return fileName;
    return fileName.slice(0, -extension.length);
}

function createDuplicatePath(path = '', existingPaths = new Set()) {
    const normalizedPath = normalizeVirtualPath(path);
    if (!normalizedPath) return normalizedPath;

    const extension = getFileExtension(normalizedPath);
    const stem = getFileStem(normalizedPath);
    const directory = getDirectoryName(normalizedPath);
    const buildPath = (suffix) => {
        const fileName = `${stem}${suffix}${extension}`;
        return directory ? `${directory}/${fileName}` : fileName;
    };

    let candidate = buildPath('-copy');
    let index = 2;

    while (existingPaths.has(candidate)) {
        candidate = buildPath(`-copy-${index}`);
        index += 1;
    }

    return candidate;
}

function reparseDocument(documentModel) {
    return parseExampleDocument(buildExampleDocument(synchronizeDocument(documentModel)));
}

function parseMetadataValue(rawValue = '') {
    const value = String(rawValue).trim();

    if (value === '') return '';
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);

    if (
        (value.startsWith('"') && value.endsWith('"'))
        || (value.startsWith("'") && value.endsWith("'"))
    ) {
        return value.slice(1, -1);
    }

    return value;
}

function parseFrontmatter(lines = []) {
    if (lines[0]?.trim() !== '---') {
        return {
            metadata: {},
            startIndex: 0,
            diagnostics: [],
        };
    }

    const diagnostics = [];
    let endIndex = -1;

    for (let index = 1; index < lines.length; index += 1) {
        if (lines[index].trim() === '---') {
            endIndex = index;
            break;
        }
    }

    if (endIndex === -1) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'unclosed-frontmatter',
                'Frontmatter starts with "---" but is never closed.'
            )
        );

        return {
            metadata: {},
            startIndex: 0,
            diagnostics,
        };
    }

    const metadata = {};

    for (let index = 1; index < endIndex; index += 1) {
        const line = lines[index];
        if (!line.trim()) continue;

        const match = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
        if (!match) {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'invalid-frontmatter-line',
                    `Ignoring unsupported frontmatter line at ${index + 1}.`,
                    { line: index + 1 }
                )
            );
            continue;
        }

        const key = normalizeMetadataKey(match[1]);

        if (Object.prototype.hasOwnProperty.call(metadata, key)) {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'duplicate-frontmatter-key',
                    `Frontmatter key "${key}" is declared more than once. The last value wins.`,
                    { key, line: index + 1 }
                )
            );
        }

        metadata[key] = parseMetadataValue(match[2]);
    }

    return {
        metadata: normalizeMetadata(metadata),
        startIndex: endIndex + 1,
        diagnostics,
    };
}

function serializeMetadataValue(value) {
    if (typeof value === 'boolean' || typeof value === 'number') {
        return String(value);
    }

    if (typeof value === 'string' && /^[A-Za-z0-9_./-]+$/.test(value)) {
        return value;
    }

    return JSON.stringify(value);
}

function buildFrontmatter(metadata = {}) {
    const normalized = normalizeMetadata(metadata);
    const entries = Object.entries(normalized);

    if (entries.length === 0) return '';

    const lines = entries
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => `${key}: ${serializeMetadataValue(value)}`);

    return ['---', ...lines, '---'].join('\n');
}

function parseExerciseListValue(value) {
    if (Array.isArray(value)) {
        return value
            .map((entry) => String(entry || '').trim())
            .filter(Boolean);
    }

    const text = String(value || '').trim();
    if (!text) return [];

    const separator = text.includes('||')
        ? '||'
        : text.includes('|')
            ? '|'
            : ',';

    return text
        .split(separator)
        .map((entry) => entry.replace(/\\n/g, '\n').trim())
        .filter(Boolean);
}

function parseExercisePathList(value) {
    return parseExerciseListValue(value)
        .map((entry) => normalizeVirtualPath(entry))
        .filter(Boolean);
}

function cloneShaderUniformValue(value) {
    if (Array.isArray(value)) {
        return value.map((entry) => Number(entry));
    }

    if (typeof value === 'boolean') {
        return value;
    }

    return Number(value);
}

function cloneShaderUniformControl(control = null) {
    return control && typeof control === 'object'
        ? { ...control }
        : null;
}

function serializeShaderUniformValue(type, value) {
    if (type === 'bool') {
        return value ? 'true' : 'false';
    }

    if (type.startsWith('vec')) {
        const size = Number.parseInt(type.slice(3), 10) || 2;
        const vector = Array.isArray(value) ? value : Array.from({ length: size }, () => 0);
        return vector.slice(0, size).map((entry) => String(Number(entry))).join(',');
    }

    return String(Number(value));
}

function serializeShaderUniformControl(control = null) {
    if (!control || control.kind !== 'range') return '';
    return `[${control.min},${control.max},${control.step}]`;
}

function parseShaderUniformDefaultValue(type, rawValue) {
    const value = String(rawValue || '').trim();

    if (type === 'bool') {
        const normalized = normalizeBooleanMetadataValue(value);
        return typeof normalized === 'boolean' ? normalized : null;
    }

    if (type.startsWith('vec')) {
        const size = Number.parseInt(type.slice(3), 10);
        const parts = value.split(',').map((entry) => entry.trim()).filter(Boolean);
        if (!Number.isFinite(size) || size <= 1 || parts.length !== size) return null;

        const vector = parts.map((entry) => Number.parseFloat(entry));
        return vector.every((entry) => Number.isFinite(entry)) ? vector : null;
    }

    const numericValue = type === 'int'
        ? Number.parseInt(value, 10)
        : Number.parseFloat(value);

    if (!Number.isFinite(numericValue)) {
        return null;
    }

    if (type === 'int' && !Number.isInteger(numericValue)) {
        return null;
    }

    return numericValue;
}

function parseShaderUniformControlValue(type, rawValue, defaultValue, declaration, name) {
    const text = String(rawValue || '').trim();
    if (!text) {
        return {
            control: null,
            diagnostics: [],
        };
    }

    const diagnostics = [];
    if (!['float', 'int'].includes(type)) {
        diagnostics.push(createDiagnostic(
            'warning',
            'unsupported-shader-uniform-control',
            `Shader uniform "${name}" only supports range controls for float or int types.`,
            { declaration, name, uniformType: type }
        ));
        return {
            control: null,
            diagnostics,
        };
    }

    const parts = text.split(',').map((entry) => entry.trim()).filter(Boolean);
    if (parts.length !== 3) {
        diagnostics.push(createDiagnostic(
            'warning',
            'invalid-shader-uniform-control',
            `Shader uniform "${name}" has an invalid control hint. Use "[min,max,step]".`,
            { declaration, name }
        ));
        return {
            control: null,
            diagnostics,
        };
    }

    const numericParts = parts.map((entry) => type === 'int'
        ? Number.parseInt(entry, 10)
        : Number.parseFloat(entry));

    if (!numericParts.every((entry) => Number.isFinite(entry))) {
        diagnostics.push(createDiagnostic(
            'warning',
            'invalid-shader-uniform-control',
            `Shader uniform "${name}" has an invalid control hint. Use numeric "[min,max,step]".`,
            { declaration, name }
        ));
        return {
            control: null,
            diagnostics,
        };
    }

    const [min, max, step] = numericParts;
    if (max <= min || step <= 0) {
        diagnostics.push(createDiagnostic(
            'warning',
            'invalid-shader-uniform-control',
            `Shader uniform "${name}" must use control values where max > min and step > 0.`,
            { declaration, name }
        ));
        return {
            control: null,
            diagnostics,
        };
    }

    if (type === 'int' && !numericParts.every((entry) => Number.isInteger(entry))) {
        diagnostics.push(createDiagnostic(
            'warning',
            'invalid-shader-uniform-control',
            `Shader uniform "${name}" must use integer control values for int uniforms.`,
            { declaration, name }
        ));
        return {
            control: null,
            diagnostics,
        };
    }

    if (typeof defaultValue === 'number' && (defaultValue < min || defaultValue > max)) {
        diagnostics.push(createDiagnostic(
            'warning',
            'shader-uniform-default-out-of-range',
            `Shader uniform "${name}" default value is outside its declared control range.`,
            { declaration, name, max, min, value: defaultValue }
        ));
        return {
            control: null,
            diagnostics,
        };
    }

    return {
        control: {
            kind: 'range',
            max,
            min,
            step,
        },
        diagnostics,
    };
}

function parseShaderUniformMetadataValue(value = '') {
    const text = String(value || '').trim();
    if (!text) {
        return {
            normalizedValue: '',
            uniforms: [],
            diagnostics: [],
        };
    }

    const uniforms = [];
    const diagnostics = [];
    const entries = text.split('|').map((entry) => entry.trim()).filter(Boolean);
    const seenNames = new Set();

    entries.forEach((entry) => {
        const match = entry.match(/^([A-Za-z_][\w]*)\s*:\s*(float|int|bool|vec2|vec3|vec4)\s*=\s*(.+?)(?:\[([^\]]+)\])?$/i);
        if (!match) {
            diagnostics.push(createDiagnostic(
                'warning',
                'invalid-shader-uniform-declaration',
                `Shader uniform declaration "${entry}" is invalid. Use "name:type=value".`,
                { declaration: entry }
            ));
            return;
        }

        const name = match[1];
        const type = match[2].trim().toLowerCase();
        const defaultValue = parseShaderUniformDefaultValue(type, match[3]);
        const parsedControl = parseShaderUniformControlValue(type, match[4], defaultValue, entry, name);
        diagnostics.push(...parsedControl.diagnostics);

        if (!SHADER_CUSTOM_UNIFORM_TYPES.has(type)) {
            diagnostics.push(createDiagnostic(
                'warning',
                'unsupported-shader-uniform-type',
                `Shader uniform "${name}" uses unsupported type "${type}".`,
                { declaration: entry, name, uniformType: type }
            ));
            return;
        }

        if (SHADER_BUILTIN_UNIFORMS.includes(name)) {
            diagnostics.push(createDiagnostic(
                'warning',
                'shader-uniform-conflicts-built-in',
                `Shader uniform "${name}" conflicts with a built-in uniform and will be ignored.`,
                { declaration: entry, name }
            ));
            return;
        }

        if (seenNames.has(name)) {
            diagnostics.push(createDiagnostic(
                'warning',
                'duplicate-shader-uniform',
                `Shader uniform "${name}" is declared more than once. Only the first declaration is used.`,
                { declaration: entry, name }
            ));
            return;
        }

        if (defaultValue == null) {
            diagnostics.push(createDiagnostic(
                'warning',
                'invalid-shader-uniform-default',
                `Shader uniform "${name}" has an invalid default for type "${type}".`,
                { declaration: entry, name, uniformType: type }
            ));
            return;
        }

        seenNames.add(name);
        uniforms.push({
            name,
            type,
            control: cloneShaderUniformControl(parsedControl.control),
            defaultValue: cloneShaderUniformValue(defaultValue),
            value: cloneShaderUniformValue(defaultValue),
        });
    });

    return {
        normalizedValue: uniforms.map((uniform) => (
            `${uniform.name}:${uniform.type}=${serializeShaderUniformValue(uniform.type, uniform.defaultValue)}${serializeShaderUniformControl(uniform.control)}`
        )).join('|'),
        uniforms,
        diagnostics,
    };
}

function serializeShaderUniformDeclaration(uniform = {}) {
    const name = String(uniform?.name || '').trim();
    const type = String(uniform?.type || '').trim().toLowerCase();

    if (!name || !SHADER_CUSTOM_UNIFORM_TYPES.has(type)) {
        return '';
    }

    return `${name}:${type}=${serializeShaderUniformValue(type, uniform.defaultValue)}${serializeShaderUniformControl(uniform.control)}`;
}

function parseShaderTextureMetadataValue(value = '') {
    const text = String(value || '').trim();
    if (!text) {
        return {
            normalizedValue: '',
            textures: [],
            diagnostics: [],
        };
    }

    const textures = [];
    const diagnostics = [];
    const entries = text.split('|').map((entry) => entry.trim()).filter(Boolean);
    const seenNames = new Set();

    entries.forEach((entry) => {
        const match = entry.match(/^([A-Za-z_][\w]*)\s*=\s*(.+)$/);
        if (!match) {
            diagnostics.push(createDiagnostic(
                'warning',
                'invalid-shader-texture-declaration',
                `Shader texture declaration "${entry}" is invalid. Use "uniformName=asset-file".`,
                { declaration: entry }
            ));
            return;
        }

        const name = match[1];
        const assetPath = normalizeVirtualPath(match[2]);
        const assetIssue = getVirtualPathIssue(assetPath);
        const assetExtension = getFileExtension(assetPath);

        if (seenNames.has(name)) {
            diagnostics.push(createDiagnostic(
                'warning',
                'duplicate-shader-texture',
                `Shader texture "${name}" is declared more than once. Only the first declaration is used.`,
                { declaration: entry, name }
            ));
            return;
        }

        if (!assetPath || assetIssue) {
            diagnostics.push(createDiagnostic(
                'warning',
                'invalid-shader-texture-path',
                `Shader texture "${name}" points to an invalid asset path.`,
                { declaration: entry, name, assetPath }
            ));
            return;
        }

        if (assetPath.includes('/')) {
            diagnostics.push(createDiagnostic(
                'warning',
                'nested-shader-texture-path-not-supported',
                `Shader texture "${name}" must reference a top-level file in the topic assets folder.`,
                { declaration: entry, name, assetPath }
            ));
            return;
        }

        if (!SHADER_TEXTURE_EXTENSIONS.has(assetExtension)) {
            diagnostics.push(createDiagnostic(
                'warning',
                'unsupported-shader-texture-extension',
                `Shader texture "${name}" uses unsupported asset extension "${assetExtension || '(none)'}".`,
                { declaration: entry, name, assetPath }
            ));
            return;
        }

        seenNames.add(name);
        textures.push({
            assetPath,
            name,
        });
    });

    return {
        normalizedValue: textures.map((texture) => `${texture.name}=${texture.assetPath}`).join('|'),
        textures,
        diagnostics,
    };
}

function serializeShaderTextureDeclaration(texture = {}) {
    const name = String(texture?.name || '').trim();
    const assetPath = normalizeVirtualPath(texture?.assetPath || '');

    if (!name || !/^[A-Za-z_]\w*$/.test(name) || !assetPath) {
        return '';
    }

    return `${name}=${assetPath}`;
}

function normalizeEditorHiddenFileKey(value = '') {
    const text = String(value || '').trim();
    if (!text) return '';

    if (text.startsWith('file:')) {
        const path = normalizeVirtualPath(text.slice(5));
        return path ? `file:${path}` : '';
    }

    const blockMatch = text.match(/^block:([A-Za-z0-9_-]+):(\d+)$/);
    if (!blockMatch) return '';

    const type = normalizeBlockType(blockMatch[1]);
    const occurrence = Number.parseInt(blockMatch[2], 10);

    if (!type || !Number.isFinite(occurrence) || occurrence <= 0) {
        return '';
    }

    return `block:${type}:${occurrence}`;
}

function parseEditorHiddenFilesMetadataValue(value = '') {
    const text = String(value || '').trim();
    if (!text) {
        return {
            diagnostics: [],
            keys: [],
            normalizedValue: '',
        };
    }

    const diagnostics = [];
    const seenKeys = new Set();
    const keys = [];
    const entries = text
        .split('|')
        .map((entry) => entry.trim())
        .filter(Boolean);

    entries.forEach((entry) => {
        const normalizedKey = normalizeEditorHiddenFileKey(entry);

        if (!normalizedKey) {
            diagnostics.push(createDiagnostic(
                'warning',
                'invalid-editor-hidden-file-entry',
                `Hidden file entry "${entry}" is invalid. Use "file:path/to/file" or "block:type:index".`,
                { value: entry }
            ));
            return;
        }

        if (seenKeys.has(normalizedKey)) {
            diagnostics.push(createDiagnostic(
                'warning',
                'duplicate-editor-hidden-file-entry',
                `Hidden file entry "${normalizedKey}" is declared more than once. Only the first value is used.`,
                { value: normalizedKey }
            ));
            return;
        }

        seenKeys.add(normalizedKey);
        keys.push(normalizedKey);
    });

    return {
        diagnostics,
        keys,
        normalizedValue: keys.join('|'),
    };
}

function hasExerciseMetadata(metadata = {}) {
    return Array.from(EXERCISE_METADATA_KEYS).some((key) => {
        const value = metadata[key];
        if (value === undefined || value === null) return false;
        if (typeof value === 'string') return value.trim() !== '';
        return true;
    });
}

export function getExerciseConfig(documentModel) {
    const metadata = documentModel?.metadata || {};
    const instructions = parseExerciseListValue(metadata.exercise_instructions);
    const hints = parseExerciseListValue(metadata.exercise_hints);
    const comparePairs = parseExerciseListValue(metadata.exercise_compare_pairs)
        .map((entry) => {
            const [attemptPath, solutionPath] = entry.split('=>').map((part) => normalizeVirtualPath(part || ''));
            return {
                attemptPath,
                solutionPath,
            };
        })
        .filter((entry) => entry.attemptPath && entry.solutionPath);
    const lockedFiles = parseExercisePathList(metadata.exercise_locked_files);
    const referenceFiles = parseExercisePathList(metadata.exercise_reference_files);
    const solutionExample = String(metadata.exercise_solution_example || '').trim();
    const solutionFiles = parseExercisePathList(metadata.exercise_solution_files);
    const enabled = normalizeBooleanMetadataValue(metadata.exercise) === true
        || hasExerciseMetadata(metadata);

    return {
        comparePairs,
        enabled,
        title: String(metadata.exercise_title || '').trim() || 'Exercise',
        instructions,
        hints,
        lockedFiles,
        referenceFiles,
        solutionExample,
        solutionFiles,
        hiddenFiles: Array.from(new Set([...referenceFiles, ...solutionFiles])),
    };
}

export function getExampleStage(documentModel) {
    const stage = String(documentModel?.metadata?.example_stage || '').trim().toLowerCase();
    return EXAMPLE_STAGE_VALUES.has(stage) ? stage : '';
}

function hasShaderBlocks(blocks = []) {
    return (blocks || []).some((block) => SHADER_BLOCK_TYPES.has(block.type));
}

function inferRendererMode({ blocks = [], metadata = {}, sourceFormat = 'legacy-blocks' } = {}) {
    if (sourceFormat === 'legacy-blocks' && (metadata.renderer === 'shader' || hasShaderBlocks(blocks))) {
        return 'shader';
    }

    return 'web';
}

export function getShaderConfig(documentModel) {
    const metadata = documentModel?.metadata || {};
    const blocks = documentModel?.blocks || [];
    const rendererMode = inferRendererMode({
        blocks,
        metadata,
        sourceFormat: documentModel?.sourceFormat || 'legacy-blocks',
    });
    const parsedResolution = parseShaderResolutionValue(metadata.resolution);
    const parsedCustomUniforms = parseShaderUniformMetadataValue(metadata.shader_uniforms);
    const parsedTextures = parseShaderTextureMetadataValue(metadata.shader_textures);

    return {
        enabled: rendererMode === 'shader',
        explicit: metadata.renderer === 'shader',
        builtInUniforms: [...SHADER_BUILTIN_UNIFORMS],
        customUniforms: parsedCustomUniforms.uniforms.map((uniform) => ({
            ...uniform,
            control: cloneShaderUniformControl(uniform.control),
            defaultValue: cloneShaderUniformValue(uniform.defaultValue),
            value: cloneShaderUniformValue(uniform.value),
        })),
        textures: parsedTextures.textures.map((texture) => ({
            assetPath: texture.assetPath,
            name: texture.name,
        })),
        rendererMode,
        resolution: parsedResolution
            ? {
                width: parsedResolution.width,
                height: parsedResolution.height,
            }
            : null,
        resolutionText: String(metadata.resolution || '').trim(),
        shaderUniformsText: parsedCustomUniforms.normalizedValue || String(metadata.shader_uniforms || '').trim(),
        shaderTexturesText: parsedTextures.normalizedValue || String(metadata.shader_textures || '').trim(),
    };
}

export function isShaderDocument(documentModel) {
    return getShaderConfig(documentModel).enabled;
}

export function getDocumentFileVisibilityKey(file, files = []) {
    if (!file) return '';

    if (file.sourceKind === 'virtual') {
        const path = normalizeVirtualPath(file.path);
        return path ? `file:${path}` : '';
    }

    const blockType = normalizeBlockType(file.blockType || file.language);
    if (!blockType) return '';

    let occurrence = 0;

    for (const entry of files) {
        const isLegacy = entry?.sourceKind !== 'virtual';
        const entryType = normalizeBlockType(entry?.blockType || entry?.language);

        if (isLegacy && entryType === blockType) {
            occurrence += 1;
        }

        if (entry?.id === file.id) {
            return `block:${blockType}:${Math.max(1, occurrence)}`;
        }
    }

    const fallbackOrder = Number.isFinite(file?.order)
        ? Number.parseInt(file.order, 10) + 1
        : 1;

    return `block:${blockType}:${Math.max(1, fallbackOrder)}`;
}

export function getDocumentFileVisibilityEntries(documentModel) {
    const document = synchronizeDocument(documentModel);
    const files = document.files || [];
    const parsedHiddenFiles = parseEditorHiddenFilesMetadataValue(document.metadata?.editor_hidden_files);
    const hiddenKeySet = new Set(parsedHiddenFiles.keys);

    return files.map((file) => {
        const key = getDocumentFileVisibilityKey(file, files);

        return {
            file,
            hidden: Boolean(key) && hiddenKeySet.has(key),
            key,
        };
    });
}

export function getHiddenFileVisibilityKeys(documentModel) {
    return getDocumentFileVisibilityEntries(documentModel)
        .filter((entry) => entry.hidden)
        .map((entry) => entry.key);
}

function deriveFilesFromBlocks(blocks = []) {
    return sortBlocks(blocks).map((block, index) => {
        const template = LEGACY_FILE_TEMPLATES[block.type] || {
            path: `file-${index}.${block.language || block.type}`,
            role: block.slot,
        };

        return buildVirtualFile({
            blockId: block.id,
            blockType: block.type,
            content: block.content,
            heading: block.heading,
            index,
            language: block.language || block.type,
            path: template.path,
            role: template.role,
            slot: block.slot,
            sourceKind: 'legacy',
        });
    });
}

function inferSessionIdFromDocument({ blocks = [], files = [], metadata = {} }) {
    if (blocks.length > 0) {
        return deriveSessionId(blocks);
    }

    if (metadata.framework === 'react' && metadata.mode === 'multi-file') {
        return 'react-multi-file';
    }

    if (metadata.framework === 'vue' && metadata.mode === 'multi-file') {
        return 'vue-multi-file';
    }

    if (files.length > 0) {
        return files.map((file) => file.language).join('-');
    }

    return '';
}

function parseLegacyBlocks(lines, startIndex, diagnostics, unsupportedBlocks) {
    const blocks = [];
    let blockIndex = 0;
    let index = startIndex;

    const skipBlankLines = () => {
        while (index < lines.length && lines[index].trim() === '') {
            index += 1;
        }
    };

    while (index < lines.length) {
        skipBlankLines();
        if (index >= lines.length) break;

        let heading = null;
        if (isHeadingLine(lines[index])) {
            heading = lines[index].replace(/^#{1,6}\s+/, '').trim();
            index += 1;
            skipBlankLines();
        }

        if (index >= lines.length) break;

        const fenceLine = lines[index];
        if (!isFenceLine(fenceLine)) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'unexpected-text',
                    `Unexpected content at line ${index + 1}. Examples must be composed of fenced code blocks.`,
                    { line: index + 1 }
                )
            );
            index += 1;
            continue;
        }

        const language = parseFenceLanguage(fenceLine);
        index += 1;

        const contentLines = [];
        let closed = false;

        while (index < lines.length) {
            if (/^```\s*$/.test(lines[index])) {
                closed = true;
                index += 1;
                break;
            }
            contentLines.push(lines[index]);
            index += 1;
        }

        const content = contentLines.join('\n').trim();
        const definition = getBlockDefinition(language);

        if (!closed) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'unclosed-fence',
                    `Unclosed code fence for "${language || 'unknown'}".`,
                    { language }
                )
            );
            break;
        }

        if (!definition) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'unsupported-language',
                    `Unsupported block language "${language}".`,
                    { language }
                )
            );
            unsupportedBlocks.push({ language, heading, content });
            continue;
        }

        if (!definition.enabled) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'disabled-language',
                    `Block language "${language}" is recognized but not enabled yet.`,
                    { language }
                )
            );
            unsupportedBlocks.push({ language, heading, content });
            continue;
        }

        if (heading && !headingsMatch(heading, definition.heading)) {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'heading-mismatch',
                    `Heading "${heading}" does not match the canonical label "${definition.heading}".`,
                    { heading, language }
                )
            );
        }

        blocks.push(buildBlock(language, content, heading || definition.heading, `${language}-${blockIndex}`));
        blockIndex += 1;
    }

    return sortBlocks(blocks);
}

function parseVirtualFiles(lines, startIndex, diagnostics, metadata = {}) {
    const files = [];
    let index = startIndex;

    const skipBlankLines = () => {
        while (index < lines.length && lines[index].trim() === '') {
            index += 1;
        }
    };

    while (index < lines.length) {
        skipBlankLines();
        if (index >= lines.length) break;

        const fileMatch = lines[index].match(/^##\s+@file\s+(.+)$/);
        if (!fileMatch) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'invalid-file-section',
                    `Expected "## @file ..." at line ${index + 1}.`,
                    { line: index + 1 }
                )
            );
            index += 1;
            continue;
        }

        const filePath = normalizeVirtualPath(fileMatch[1]);
        index += 1;

        let explicitLanguage = '';
        let role = '';
        let languageDirectiveCount = 0;
        let roleDirectiveCount = 0;

        while (index < lines.length) {
            const line = lines[index].trim();
            if (!line) {
                index += 1;
                continue;
            }

            const langMatch = lines[index].match(/^##\s+@lang\s+(.+)$/);
            if (langMatch) {
                languageDirectiveCount += 1;
                if (languageDirectiveCount > 1) {
                    diagnostics.push(
                        createDiagnostic(
                            'warning',
                            'duplicate-file-lang-directive',
                            `File "${filePath || '(unknown)'}" declares @lang more than once. The last value wins.`,
                            { line: index + 1, path: filePath || null }
                        )
                    );
                }
                explicitLanguage = normalizeBlockType(langMatch[1]);
                index += 1;
                continue;
            }

            const roleMatch = lines[index].match(/^##\s+@role\s+(.+)$/);
            if (roleMatch) {
                roleDirectiveCount += 1;
                if (roleDirectiveCount > 1) {
                    diagnostics.push(
                        createDiagnostic(
                            'warning',
                            'duplicate-file-role-directive',
                            `File "${filePath || '(unknown)'}" declares @role more than once. The last value wins.`,
                            { line: index + 1, path: filePath || null }
                        )
                    );
                }
                role = roleMatch[1].trim().toLowerCase();
                index += 1;
                continue;
            }

            if (isFenceLine(lines[index])) {
                break;
            }

            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'unknown-file-directive',
                    `Ignoring unsupported file directive at line ${index + 1}.`,
                    { line: index + 1 }
                )
            );
            index += 1;
        }

        if (index >= lines.length || !isFenceLine(lines[index])) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'missing-file-fence',
                    `File "${filePath}" is missing its fenced code block.`,
                    { path: filePath }
                )
            );
            break;
        }

        const fenceLanguage = parseFenceLanguage(lines[index]);
        const language = explicitLanguage || fenceLanguage;
        index += 1;

        const contentLines = [];
        let closed = false;

        while (index < lines.length) {
            if (/^```\s*$/.test(lines[index])) {
                closed = true;
                index += 1;
                break;
            }

            contentLines.push(lines[index]);
            index += 1;
        }

        if (!closed) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'unclosed-fence',
                    `Unclosed code fence for file "${filePath}".`,
                    { path: filePath }
                )
            );
            break;
        }

        if (!language) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'missing-file-language',
                    `File "${filePath}" must declare a language using @lang or the fenced block language.`,
                    { path: filePath }
                )
            );
            continue;
        }

        const normalizedLanguage = normalizeBlockType(language);
        const definition = getBlockDefinition(normalizedLanguage);

        if (
            !definition
            && !REACT_MULTI_FILE_LANGUAGES.has(normalizedLanguage)
            && !VUE_MULTI_FILE_LANGUAGES.has(normalizedLanguage)
        ) {
            const looksLikeVirtualAsset = role === 'asset' || isLikelyVirtualAssetPath(filePath);

            diagnostics.push(
                createDiagnostic(
                    looksLikeVirtualAsset ? 'warning' : 'error',
                    looksLikeVirtualAsset ? 'virtual-asset-files-not-supported' : 'unsupported-file-language',
                    looksLikeVirtualAsset
                        ? `Virtual asset files like "${filePath}" are not supported inside Markdown projects yet. Use the topic-level assets/ folder and reference the file by relative URL instead.`
                        : `Unsupported language "${normalizedLanguage}" for file "${filePath}".`,
                    { language: normalizedLanguage, path: filePath }
                )
            );
            continue;
        }

        if (explicitLanguage && fenceLanguage && explicitLanguage !== fenceLanguage) {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'file-language-mismatch',
                    `File "${filePath}" declares @lang "${explicitLanguage}" but the fenced block uses "${fenceLanguage}".`,
                    { language: explicitLanguage, path: filePath }
                )
            );
        }

        files.push(buildVirtualFile({
            path: filePath || `invalid-file-${files.length}`,
            language: normalizedLanguage,
            content: contentLines.join('\n').trim(),
            role,
            sourceKind: 'virtual',
            index: files.length,
        }));
    }

    if (!metadata.mode) {
        metadata.mode = 'multi-file';
    }

    return files;
}

function validateMetadata(metadata, diagnostics, sourceFormat) {
    const framework = metadata.framework || '';
    const renderer = metadata.renderer || '';
    const mode = metadata.mode || '';
    const hasConsole = Object.prototype.hasOwnProperty.call(metadata, 'console');
    const hasEntry = Object.prototype.hasOwnProperty.call(metadata, 'entry');
    const hasResolution = Object.prototype.hasOwnProperty.call(metadata, 'resolution');

    if (framework && !SUPPORTED_FRAMEWORKS.has(framework)) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'unsupported-framework',
                `Framework "${framework}" is not supported.`,
                { framework }
            )
        );
    }

    if (renderer && !SUPPORTED_RENDERERS.has(renderer)) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'unsupported-renderer',
                `Renderer "${renderer}" is not supported.`,
                { renderer }
            )
        );
    }

    if (mode && !SUPPORTED_FRAMEWORK_MODES.has(mode)) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'unsupported-mode',
                `Mode "${mode}" is not supported. Use "single-file" or "multi-file".`,
                { mode }
            )
        );
    }

    if (hasResolution) {
        const parsedResolution = parseShaderResolutionValue(metadata.resolution);
        if (!parsedResolution) {
            diagnostics.push(
                createDiagnostic(
                    renderer === 'shader' ? 'error' : 'warning',
                    renderer === 'shader' ? 'invalid-shader-resolution' : 'invalid-resolution-metadata',
                    'Metadata "resolution" must use the format WIDTHxHEIGHT with positive integers.',
                    { value: metadata.resolution }
                )
            );
        }
    }

    if (Object.prototype.hasOwnProperty.call(metadata, 'shader_uniforms')) {
        const parsedShaderUniforms = parseShaderUniformMetadataValue(metadata.shader_uniforms);
        diagnostics.push(...parsedShaderUniforms.diagnostics);

        if (renderer !== 'shader' && parsedShaderUniforms.uniforms.length > 0) {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'shader-uniforms-without-shader-renderer',
                    'Metadata "shader_uniforms" only applies to shader documents.',
                    { value: metadata.shader_uniforms }
                )
            );
        }
    }

    if (Object.prototype.hasOwnProperty.call(metadata, 'shader_textures')) {
        const parsedShaderTextures = parseShaderTextureMetadataValue(metadata.shader_textures);
        diagnostics.push(...parsedShaderTextures.diagnostics);

        if (renderer !== 'shader' && parsedShaderTextures.textures.length > 0) {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'shader-textures-without-shader-renderer',
                    'Metadata "shader_textures" only applies to shader documents.',
                    { value: metadata.shader_textures }
                )
            );
        }

        const parsedShaderUniforms = parseShaderUniformMetadataValue(metadata.shader_uniforms);
        const uniformNames = new Set(parsedShaderUniforms.uniforms.map((uniform) => uniform.name));
        parsedShaderTextures.textures.forEach((texture) => {
            if (uniformNames.has(texture.name)) {
                diagnostics.push(
                    createDiagnostic(
                        'warning',
                        'shader-texture-conflicts-uniform',
                        `Shader texture "${texture.name}" conflicts with a custom uniform of the same name.`,
                        { name: texture.name, assetPath: texture.assetPath }
                    )
                );
            }
        });
    }

    if (hasConsole && typeof metadata.console !== 'boolean') {
        diagnostics.push(
            createDiagnostic(
                'warning',
                'invalid-console-metadata',
                `Metadata "console" must be boolean, but received ${typeof metadata.console}.`,
                { value: metadata.console }
            )
        );
    }

    if (Object.prototype.hasOwnProperty.call(metadata, 'editor_hidden_files')) {
        const parsedHiddenFiles = parseEditorHiddenFilesMetadataValue(metadata.editor_hidden_files);
        diagnostics.push(...parsedHiddenFiles.diagnostics);
    }

    if (hasEntry && getVirtualPathIssue(metadata.entry)) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'invalid-entry-path',
                `Entry path "${metadata.entry}" is not valid.`,
                { entry: metadata.entry }
            )
        );
    }

    if (sourceFormat === 'legacy-blocks' && mode === 'multi-file') {
        diagnostics.push(
            createDiagnostic(
                'error',
                'mode-format-mismatch',
                'Block-based documents cannot declare `mode: multi-file`. Use `## @file` sections instead.',
                { mode, sourceFormat }
            )
        );
    }

    if (sourceFormat === 'virtual-files' && mode === 'single-file') {
        diagnostics.push(
            createDiagnostic(
                'error',
                'mode-format-mismatch',
                'Virtual-file documents cannot declare `mode: single-file`.',
                { mode, sourceFormat }
            )
        );
    }

    if (mode && !framework) {
        diagnostics.push(
            createDiagnostic(
                'warning',
                'mode-without-framework',
                'Metadata "mode" is currently meaningful only together with `framework: react` or `framework: vue`.',
                { mode }
            )
        );
    }

    if (renderer === 'shader' && framework) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'shader-framework-not-supported',
                'Shader documents cannot declare `framework`. Use `renderer: shader` with block-based Vertex/Fragment shaders.',
                { framework }
            )
        );
    }

    if (renderer === 'shader' && mode) {
        diagnostics.push(
            createDiagnostic(
                'warning',
                'shader-mode-ignored',
                'Metadata "mode" is ignored for shader documents.',
                { mode }
            )
        );
    }

    if (renderer === 'shader' && sourceFormat === 'virtual-files') {
        diagnostics.push(
            createDiagnostic(
                'error',
                'shader-virtual-files-not-supported',
                'Shader documents currently use block-based Vertex/Fragment format, not `## @file` sections.',
                { sourceFormat }
            )
        );
    }

    if (hasEntry && sourceFormat !== 'virtual-files') {
        diagnostics.push(
            createDiagnostic(
                'warning',
                'entry-ignored-for-legacy-document',
                'Metadata "entry" is ignored for block-based documents.',
                { entry: metadata.entry }
            )
        );
    }

    if (hasEntry && !['react', 'vue'].includes(framework)) {
        diagnostics.push(
            createDiagnostic(
                'warning',
                'entry-requires-supported-multi-file-framework',
                'Metadata "entry" is currently used only for React or Vue multi-file documents.',
                { entry: metadata.entry, framework }
            )
        );
    }

    if (Object.prototype.hasOwnProperty.call(metadata, 'exercise')) {
        const normalizedExercise = normalizeBooleanMetadataValue(metadata.exercise);
        if (typeof normalizedExercise !== 'boolean') {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'invalid-exercise-metadata',
                    'Metadata "exercise" must be boolean when present.',
                    { value: metadata.exercise }
                )
            );
        }
    }

    if (metadata.example_stage && !EXAMPLE_STAGE_VALUES.has(String(metadata.example_stage).trim().toLowerCase())) {
        diagnostics.push(
            createDiagnostic(
                'warning',
                'invalid-example-stage',
                `Metadata "example_stage" must be one of: ${Array.from(EXAMPLE_STAGE_VALUES).join(', ')}.`,
                { value: metadata.example_stage }
            )
        );
    }
}

function validateVirtualFileShape(file, diagnostics) {
    const pathIssue = getVirtualPathIssue(file.path);
    const expectedExtensions = getExpectedExtensions(file.language);
    const extension = getFileExtension(file.path);

    if (pathIssue) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'invalid-file-path',
                pathIssue === 'empty'
                    ? 'Each virtual file must declare a non-empty path.'
                    : `File path "${file.path}" cannot contain "." or ".." segments.`,
                { path: file.path || null }
            )
        );
    }

    if (file.role && !ALLOWED_VIRTUAL_FILE_ROLES.has(file.role)) {
        diagnostics.push(
            createDiagnostic(
                'warning',
                'unsupported-file-role',
                `Role "${file.role}" on "${file.path}" is not recognized.`,
                { path: file.path, role: file.role }
            )
        );
    }

    if (expectedExtensions.length > 0 && !expectedExtensions.includes(extension)) {
        diagnostics.push(
            createDiagnostic(
                'warning',
                'file-extension-language-mismatch',
                `File "${file.path}" uses language "${file.language}" but its extension should usually be ${expectedExtensions.join(' or ')}.`,
                {
                    expectedExtensions,
                    language: file.language,
                    path: file.path,
                }
            )
        );
    }
}

function validateShaderLegacyDocument(blocks, metadata, diagnostics) {
    const vertexBlocks = blocks.filter((block) => block.type === 'vertex');
    const fragmentBlocks = blocks.filter((block) => block.type === 'fragment');
    const extraBlocks = blocks.filter((block) => !SHADER_BLOCK_TYPES.has(block.type));
    const parsedResolution = parseShaderResolutionValue(metadata.resolution);

    if (metadata.renderer === 'web') {
        diagnostics.push(
            createDiagnostic(
                'error',
                'renderer-metadata-conflicts-with-shader-blocks',
                'Renderer "web" conflicts with shader blocks. Remove `renderer: web` or remove the shader blocks.',
                { renderer: metadata.renderer }
            )
        );
    }

    if (vertexBlocks.length === 0) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'missing-shader-vertex',
                'Shader examples must contain exactly one Vertex block.'
            )
        );
    }

    if (vertexBlocks.length > 1) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'multiple-shader-vertex-blocks',
                'Shader examples cannot contain more than one Vertex block.'
            )
        );
    }

    if (fragmentBlocks.length === 0) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'missing-shader-fragment',
                'Shader examples must contain exactly one Fragment block.'
            )
        );
    }

    if (fragmentBlocks.length > 1) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'multiple-shader-fragment-blocks',
                'Shader examples cannot contain more than one Fragment block.'
            )
        );
    }

    if (extraBlocks.length > 0) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'shader-extra-blocks-not-allowed',
                `Shader examples only support Vertex and Fragment blocks for now. Found extra block types: ${extraBlocks.map((block) => block.type).join(', ')}.`,
                { blockTypes: extraBlocks.map((block) => block.type) }
            )
        );
    }

    if (!Object.prototype.hasOwnProperty.call(metadata, 'resolution') || !String(metadata.resolution || '').trim()) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'missing-shader-resolution',
                'Shader examples must declare `resolution: WIDTHxHEIGHT` in frontmatter.'
            )
        );
    } else if (!parsedResolution) {
        const hasExistingDiagnostic = diagnostics.some((diagnostic) => diagnostic.code === 'invalid-shader-resolution');
        if (!hasExistingDiagnostic) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'invalid-shader-resolution',
                    'Shader examples must use `resolution: WIDTHxHEIGHT` with positive integers.',
                    { value: metadata.resolution }
                )
            );
        }
    }
}

function validateLegacyDocument(blocks, metadata, diagnostics) {
    if (inferRendererMode({ blocks, metadata, sourceFormat: 'legacy-blocks' }) === 'shader') {
        validateShaderLegacyDocument(blocks, metadata, diagnostics);
        return;
    }

    const appBlocks = blocks.filter((block) => block.slot === 'app');
    const markupBlocks = blocks.filter((block) => block.slot === 'markup');
    const styleBlocks = blocks.filter((block) => block.slot === 'style');
    const scriptBlocks = blocks.filter((block) => block.slot === 'script');
    const framework = metadata.framework || '';
    const htmlFullBlock = markupBlocks.find((block) => block.type === 'html-full') || null;

    if (framework === 'react') {
        if (appBlocks.length === 0) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'missing-react-app',
                    'React examples must contain exactly one JSX or TSX block.'
                )
            );
        }

        if (appBlocks.length > 1) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'multiple-react-app-blocks',
                    'React examples cannot contain more than one JSX or TSX block.'
                )
            );
        }

        if (appBlocks.length === 1 && !REACT_APP_BLOCK_TYPES.has(appBlocks[0].type)) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'invalid-react-app-block',
                    `React examples require a JSX or TSX block, not "${appBlocks[0].type}".`,
                    { type: appBlocks[0].type }
                )
            );
        }

        if (markupBlocks.length > 0) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'react-does-not-use-markup-slot',
                    'React single-file examples cannot contain HTML, SVG or Pug blocks.'
                )
            );
        }

        if (scriptBlocks.length > 0) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'react-does-not-use-script-slot',
                    'React single-file examples cannot contain standalone JavaScript or TypeScript blocks.'
                )
            );
        }
    } else if (appBlocks.length > 0) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'unexpected-app-block',
                'JSX and TSX blocks require `framework: react` in frontmatter.'
            )
        );
    }

    if (framework !== 'react') {
        if (markupBlocks.length === 0) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'missing-markup',
                    'Example must contain exactly one HTML, HTML-FULL, SVG or Pug block.'
                )
            );
        }

        if (markupBlocks.length > 1) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'multiple-markup',
                    'Example cannot contain more than one markup block.'
                )
            );
        }
    }

    if (framework === 'vue') {
        if (markupBlocks.length === 1 && markupBlocks[0].type !== 'html') {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'invalid-vue-template-block',
                    `Vue single-file examples require an HTML block for the template, not "${markupBlocks[0].type}".`,
                    { type: markupBlocks[0].type }
                )
            );
        }
    }

    if (htmlFullBlock) {
        if (styleBlocks.length > 0 || scriptBlocks.length > 0 || appBlocks.length > 0) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'html-full-must-stand-alone',
                    'HTML-FULL must be the only code block in the example. Put styles and scripts inside the document itself.',
                    { type: 'html-full' }
                )
            );
        }

        if (!/(<!doctype\s+html|<html\b)/i.test(htmlFullBlock.content || '')) {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'html-full-missing-document-root',
                    'HTML-FULL should include <!DOCTYPE html> and an <html> root element.',
                    { type: 'html-full' }
                )
            );
        }

        if (!/<body\b/i.test(htmlFullBlock.content || '')) {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'html-full-missing-body',
                    'HTML-FULL should include an explicit <body> element.',
                    { type: 'html-full' }
                )
            );
        }
    }

    markupBlocks
        .filter((block) => block.type === 'html')
        .forEach((block) => {
            if (!/(<!doctype|<html\b|<head\b|<body\b)/i.test(block.content || '')) return;

            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'html-body-fragment-expected',
                    'HTML blocks are treated as body fragments. Do not include <!DOCTYPE>, <html>, <head> or <body>.',
                    { type: block.type }
                )
            );
        });

    if (styleBlocks.length > 1) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'multiple-style',
                'Example cannot contain more than one style block.'
            )
        );
    }

    if (scriptBlocks.length > 1) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'multiple-script',
                'Example cannot contain more than one script block.'
            )
        );
    }
}

function validateVirtualDocument(files, metadata, diagnostics) {
    const framework = metadata.framework || '';
    const mode = metadata.mode || '';

    if (!['react', 'vue'].includes(framework)) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'virtual-files-framework-required',
                'Virtual files are currently supported only for `framework: react` or `framework: vue`.',
                { framework }
            )
        );
    }

    if (framework === 'react' && mode && mode !== 'multi-file') {
        diagnostics.push(
            createDiagnostic(
                'error',
                'react-virtual-mode-mismatch',
                'React virtual-file examples must declare `mode: multi-file`.',
                { mode }
            )
        );
    }

    if (framework === 'vue' && mode && mode !== 'multi-file') {
        diagnostics.push(
            createDiagnostic(
                'error',
                'vue-virtual-mode-mismatch',
                'Vue virtual-file examples must declare `mode: multi-file`.',
                { mode }
            )
        );
    }

    const seenPaths = new Set();
    const entryRoleFiles = [];

    files.forEach((file) => {
        validateVirtualFileShape(file, diagnostics);

        if (seenPaths.has(file.path)) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'duplicate-file-path',
                    `Duplicate file path "${file.path}" in multi-file document.`,
                    { path: file.path }
                )
            );
        }
        seenPaths.add(file.path);

        if (framework === 'react' && !REACT_MULTI_FILE_LANGUAGES.has(file.language)) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'unsupported-react-file-language',
                    `React multi-file examples do not support "${file.language}" in "${file.path}".`,
                    { language: file.language, path: file.path }
                )
            );
        }

        if (framework === 'vue' && !VUE_MULTI_FILE_LANGUAGES.has(file.language)) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'unsupported-vue-file-language',
                    `Vue multi-file examples do not support "${file.language}" in "${file.path}".`,
                    { language: file.language, path: file.path }
                )
            );
        }

        if (file.role === 'asset') {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'virtual-asset-role-not-supported',
                    `Virtual file "${file.path}" is marked as \`@role asset\`, but binary asset bundling is not supported yet. Keep local resources in the topic-level assets/ folder or use JSON virtual files for structured data.`,
                    { path: file.path, role: file.role }
                )
            );
        }

        if (file.role === 'entry') {
            entryRoleFiles.push(file);
        }
    });

    if (entryRoleFiles.length > 1) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'multiple-entry-roles',
                'Only one virtual file may declare `@role entry`.',
                { files: entryRoleFiles.map((file) => file.path) }
            )
        );
    }

    if (framework === 'react') {
        const entry = normalizeVirtualPath(metadata.entry || '');
        const entryFile = files.find((file) => file.path === entry) || null;

        if (!entry) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'missing-react-entry',
                    'React multi-file examples must declare `entry` in frontmatter.'
                )
            );
        } else if (!entryFile) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'missing-react-entry-file',
                    `Entry file "${entry}" does not exist in this document.`,
                    { entry }
                )
            );
        } else {
            if (!REACT_MULTI_FILE_ENTRY_LANGUAGES.has(entryFile.language)) {
                diagnostics.push(
                    createDiagnostic(
                        'error',
                        'invalid-react-entry-language',
                        `React entry file "${entry}" must use JSX, TSX, JavaScript or TypeScript.`,
                        { entry, language: entryFile.language }
                    )
                );
            }

            if (entryRoleFiles.length === 1 && entryRoleFiles[0].path !== entry) {
                diagnostics.push(
                    createDiagnostic(
                        'warning',
                        'entry-role-mismatch',
                        `Metadata entry "${entry}" does not match the file marked with \`@role entry\` ("${entryRoleFiles[0].path}").`,
                        { entry, rolePath: entryRoleFiles[0].path }
                    )
                );
            }
        }
    }

    if (framework === 'vue') {
        const entry = normalizeVirtualPath(metadata.entry || '');
        const entryFile = files.find((file) => file.path === entry) || null;

        if (!entry) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'missing-vue-entry',
                    'Vue multi-file examples must declare `entry` in frontmatter.'
                )
            );
        } else if (!entryFile) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'missing-vue-entry-file',
                    `Entry file "${entry}" does not exist in this document.`,
                    { entry }
                )
            );
        } else {
            if (!VUE_MULTI_FILE_ENTRY_LANGUAGES.has(entryFile.language)) {
                diagnostics.push(
                    createDiagnostic(
                        'error',
                        'invalid-vue-entry-language',
                        `Vue entry file "${entry}" must use JavaScript or TypeScript.`,
                        { entry, language: entryFile.language }
                    )
                );
            }

            if (entryRoleFiles.length === 1 && entryRoleFiles[0].path !== entry) {
                diagnostics.push(
                    createDiagnostic(
                        'warning',
                        'entry-role-mismatch',
                        `Metadata entry "${entry}" does not match the file marked with \`@role entry\` ("${entryRoleFiles[0].path}").`,
                        { entry, rolePath: entryRoleFiles[0].path }
                    )
                );
            }
        }
    }

    validateEditorHiddenFiles(files, metadata, diagnostics);
    validateExerciseDocument(files, metadata, diagnostics);
}

function validateExerciseDocument(files, metadata, diagnostics) {
    const exercise = getExerciseConfig({ metadata });
    if (!exercise.enabled) return;

    const knownPaths = new Set((files || []).map((file) => file.path));
    const trackedLists = [
        ['exercise_locked_files', exercise.lockedFiles],
        ['exercise_reference_files', exercise.referenceFiles],
        ['exercise_solution_files', exercise.solutionFiles],
    ];

    exercise.comparePairs.forEach((pair) => {
        if (!knownPaths.has(pair.attemptPath)) {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'exercise-compare-file-not-found',
                    `Exercise comparison references attempt file "${pair.attemptPath}", but that file does not exist in the document.`,
                    { path: pair.attemptPath }
                )
            );
        }

        if (!knownPaths.has(pair.solutionPath) && !exercise.solutionExample) {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'exercise-compare-file-not-found',
                    `Exercise comparison references solution file "${pair.solutionPath}", but that file does not exist in the document.`,
                    { path: pair.solutionPath }
                )
            );
        }
    });

    trackedLists.forEach(([key, paths]) => {
        paths.forEach((path) => {
            if (knownPaths.has(path)) return;
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'exercise-file-not-found',
                    `Exercise metadata "${key}" references "${path}", but that file does not exist in the document.`,
                    { key, path }
                )
            );
        });
    });

    const entryPath = normalizeVirtualPath(metadata.entry || '');
    if (entryPath && exercise.hiddenFiles.includes(entryPath)) {
        diagnostics.push(
            createDiagnostic(
                'warning',
                'exercise-hidden-entry-file',
                `Exercise metadata hides the entry file "${entryPath}". The project will still compile, but the editor will conceal the entry source until it is revealed.`,
                { entry: entryPath }
            )
        );
    }
}

function validateEditorHiddenFiles(files, metadata, diagnostics) {
    const parsedHiddenFiles = parseEditorHiddenFilesMetadataValue(metadata.editor_hidden_files);
    if (parsedHiddenFiles.keys.length === 0) return;

    const validKeys = new Set(files.map((file) => getDocumentFileVisibilityKey(file, files)).filter(Boolean));

    parsedHiddenFiles.keys.forEach((key) => {
        if (validKeys.has(key)) return;

        diagnostics.push(
            createDiagnostic(
                'warning',
                'editor-hidden-file-not-found',
                `Hidden file entry "${key}" does not match any file in this document.`,
                { value: key }
            )
        );
    });
}

function buildLegacyMarkdown(blocks = [], metadata = {}) {
    const frontmatter = buildFrontmatter(metadata);
    const content = sortBlocks(blocks)
        .map((block) => {
            const definition = getBlockDefinition(block.type);
            const heading = definition?.heading || block.heading || block.type.toUpperCase();
            const language = block.language || block.type;
            const fileContent = block.content || '';

            return `# ${heading}

\`\`\`${language}
${fileContent}
\`\`\``;
        })
        .join('\n\n');

    return [frontmatter, content].filter(Boolean).join('\n\n');
}

function buildVirtualMarkdown(files = [], metadata = {}) {
    const frontmatter = buildFrontmatter(metadata);
    const body = files
        .map((file) => {
            const directives = [
                `## @file ${file.path}`,
                `## @lang ${file.language}`,
            ];

            if (file.role) {
                directives.push(`## @role ${file.role}`);
            }

            return `${directives.join('\n')}

\`\`\`${file.language}
${file.content || ''}
\`\`\``;
        })
        .join('\n\n');

    return [frontmatter, body].filter(Boolean).join('\n\n');
}

function cloneFiles(files = []) {
    return files.map((file) => ({ ...file }));
}

export function createEmptyExampleDocument() {
    return {
        rendererMode: 'web',
        sessionId: '',
        metadata: {},
        blocks: [],
        files: [],
        diagnostics: [],
        unsupportedBlocks: [],
        sourceFormat: 'legacy-blocks',
    };
}

export function synchronizeDocument(documentModel) {
    const document = documentModel || createEmptyExampleDocument();
    const metadata = normalizeMetadata(document.metadata || {});
    const blocks = (document.blocks || []).map((block) => ({ ...block }));
    const files = cloneFiles(document.files || []);
    const sourceFormat = document.sourceFormat || 'legacy-blocks';

    if (document.sourceFormat === 'legacy-blocks') {
        files.forEach((file) => {
            if (!file.blockId) return;
            const block = blocks.find((entry) => entry.id === file.blockId);
            if (block) {
                block.content = file.content;
            }
        });
    }

    return {
        ...document,
        rendererMode: inferRendererMode({ blocks, metadata, sourceFormat }),
        metadata,
        blocks,
        files: sourceFormat === 'legacy-blocks' ? deriveFilesFromBlocks(blocks) : files,
        sessionId: inferSessionIdFromDocument({
            blocks,
            files: sourceFormat === 'legacy-blocks' ? deriveFilesFromBlocks(blocks) : files,
            metadata,
        }),
    };
}

export function getDocumentLanguageOptions(documentModel) {
    const framework = String(documentModel?.metadata?.framework || '').trim().toLowerCase();
    const rendererMode = String(documentModel?.rendererMode || '').trim().toLowerCase();

    if (documentModel?.sourceFormat === 'virtual-files') {
        if (framework === 'react') {
            return [...REACT_MULTI_FILE_LANGUAGE_OPTIONS];
        }

        if (framework === 'vue') {
            return [...VUE_MULTI_FILE_LANGUAGE_OPTIONS];
        }

        return [];
    }

    if (rendererMode === 'shader') {
        const existingTypes = new Set((documentModel?.blocks || []).map((block) => block.type));
        return SHADER_BLOCK_LANGUAGE_OPTIONS.filter((language) => !existingTypes.has(language));
    }

    if (framework === 'react') {
        return [...LEGACY_REACT_BLOCK_LANGUAGE_OPTIONS];
    }

    if (framework === 'vue') {
        return [...LEGACY_VUE_BLOCK_LANGUAGE_OPTIONS];
    }

    return [...LEGACY_DEFAULT_BLOCK_LANGUAGE_OPTIONS];
}

export function getDocumentEntryCandidates(documentModel) {
    if (documentModel?.sourceFormat !== 'virtual-files') return [];

    const framework = String(documentModel?.metadata?.framework || '').trim().toLowerCase();
    const entryLanguages = framework === 'react'
        ? REACT_MULTI_FILE_ENTRY_LANGUAGES
        : framework === 'vue'
            ? VUE_MULTI_FILE_ENTRY_LANGUAGES
            : null;

    if (!entryLanguages) return [];

    return (documentModel.files || []).filter((file) => entryLanguages.has(file.language));
}

export function updateDocumentFileContent(documentModel, fileId, content) {
    const nextDocument = cloneExampleDocument(documentModel);
    const file = nextDocument.files.find((entry) => entry.id === fileId);
    if (!file) return nextDocument;

    file.content = content;
    return synchronizeDocument(nextDocument);
}

export function createDocumentFile(documentModel, options = {}) {
    const nextDocument = cloneExampleDocument(documentModel);
    const language = normalizeBlockType(options.language || '');

    if (!language) return nextDocument;

    if (nextDocument.sourceFormat === 'virtual-files') {
        const path = normalizeVirtualPath(options.path || '');
        if (!path) return nextDocument;

        const role = String(options.role || '').trim().toLowerCase();
        const nextFiles = (nextDocument.files || []).map((entry) => (
            role === 'entry' && entry.role === 'entry'
                ? { ...entry, role: '' }
                : entry
        ));
        nextDocument.files = [
            ...nextFiles,
            buildVirtualFile({
                path,
                language,
                content: options.content || '',
                role,
                sourceKind: 'virtual',
                index: nextDocument.files?.length || 0,
            }),
        ];

        if (role === 'entry') {
            nextDocument.metadata = {
                ...(nextDocument.metadata || {}),
                entry: path,
            };
        }

        return reparseDocument(nextDocument);
    }

    const definition = getBlockDefinition(language);
    nextDocument.blocks = [
        ...(nextDocument.blocks || []),
        buildBlock(
            language,
            options.content || '',
            definition?.heading || null,
            `${language}-${nextDocument.blocks?.length || 0}`
        ),
    ];

    if (SHADER_BLOCK_TYPES.has(language)) {
        nextDocument.metadata = {
            ...(nextDocument.metadata || {}),
            renderer: 'shader',
            resolution: String(nextDocument.metadata?.resolution || '').trim() || '800x600',
        };
    }

    if (!nextDocument.metadata?.framework && ['jsx', 'tsx'].includes(language)) {
        nextDocument.metadata = {
            ...(nextDocument.metadata || {}),
            framework: 'react',
        };
    }

    return reparseDocument(nextDocument);
}

export function updateDocumentFileDetails(documentModel, fileId, updates = {}) {
    const nextDocument = cloneExampleDocument(documentModel);
    if (nextDocument.sourceFormat !== 'virtual-files') return nextDocument;

    const file = nextDocument.files.find((entry) => entry.id === fileId);
    if (!file) return nextDocument;

    const oldPath = file.path;
    const nextPath = normalizeVirtualPath(updates.path || file.path);
    const nextLanguage = normalizeBlockType(updates.language || file.language);
    const nextRole = String(updates.role ?? file.role ?? '').trim().toLowerCase();

    file.path = nextPath || file.path;
    file.name = getFileName(file.path);
    file.language = nextLanguage || file.language;
    file.role = nextRole;

    if (nextRole === 'entry') {
        nextDocument.files = nextDocument.files.map((entry) => {
            if (entry.id === fileId) return entry;
            if (entry.role !== 'entry') return entry;
            return { ...entry, role: '' };
        });
    }

    if (String(nextDocument.metadata?.entry || '') === oldPath) {
        nextDocument.metadata = {
            ...(nextDocument.metadata || {}),
            entry: file.path,
        };
    }

    if (nextRole === 'entry') {
        nextDocument.metadata = {
            ...(nextDocument.metadata || {}),
            entry: file.path,
        };
    }

    return reparseDocument(nextDocument);
}

export function duplicateDocumentFile(documentModel, fileId) {
    const nextDocument = cloneExampleDocument(documentModel);

    if (nextDocument.sourceFormat === 'virtual-files') {
        const sourceIndex = (nextDocument.files || []).findIndex((entry) => entry.id === fileId);
        if (sourceIndex === -1) return nextDocument;

        const sourceFile = nextDocument.files[sourceIndex];
        const existingPaths = new Set(nextDocument.files.map((entry) => entry.path));
        const duplicate = {
            ...sourceFile,
            path: createDuplicatePath(sourceFile.path, existingPaths),
            name: '',
            role: sourceFile.role === 'entry' ? '' : sourceFile.role,
        };
        duplicate.name = getFileName(duplicate.path);

        nextDocument.files.splice(sourceIndex + 1, 0, duplicate);
        return reparseDocument(nextDocument);
    }

    const sourceFile = (nextDocument.files || []).find((entry) => entry.id === fileId);
    if (!sourceFile?.blockId) return nextDocument;

    const blockIndex = (nextDocument.blocks || []).findIndex((entry) => entry.id === sourceFile.blockId);
    if (blockIndex === -1) return nextDocument;

    const sourceBlock = nextDocument.blocks[blockIndex];
    nextDocument.blocks.splice(
        blockIndex + 1,
        0,
        buildBlock(
            sourceBlock.type,
            sourceBlock.content,
            sourceBlock.heading,
            `${sourceBlock.type}-${nextDocument.blocks.length}`
        )
    );

    return reparseDocument(nextDocument);
}

export function removeDocumentFile(documentModel, fileId) {
    const nextDocument = cloneExampleDocument(documentModel);

    if (nextDocument.sourceFormat === 'virtual-files') {
        const sourceIndex = (nextDocument.files || []).findIndex((entry) => entry.id === fileId);
        if (sourceIndex === -1) return nextDocument;

        const [removedFile] = nextDocument.files.splice(sourceIndex, 1);

        if (String(nextDocument.metadata?.entry || '') === removedFile.path) {
            const nextEntry = getDocumentEntryCandidates(nextDocument)[0]?.path || '';
            const metadata = {
                ...(nextDocument.metadata || {}),
            };

            if (nextEntry) {
                metadata.entry = nextEntry;
            } else {
                delete metadata.entry;
            }

            nextDocument.metadata = metadata;
        }

        return reparseDocument(nextDocument);
    }

    const sourceFile = (nextDocument.files || []).find((entry) => entry.id === fileId);
    if (!sourceFile?.blockId) return nextDocument;

    nextDocument.blocks = (nextDocument.blocks || []).filter((entry) => entry.id !== sourceFile.blockId);
    return reparseDocument(nextDocument);
}

export function setDocumentEntryPath(documentModel, entryPath = '') {
    const nextDocument = cloneExampleDocument(documentModel);
    if (nextDocument.sourceFormat !== 'virtual-files') return nextDocument;

    const normalizedEntry = normalizeVirtualPath(entryPath);
    nextDocument.metadata = {
        ...(nextDocument.metadata || {}),
    };

    if (normalizedEntry) {
        nextDocument.metadata.entry = normalizedEntry;
    } else {
        delete nextDocument.metadata.entry;
    }

    return reparseDocument(nextDocument);
}

export function updateShaderUniformDefinitions(documentModel, uniforms = []) {
    const nextDocument = cloneExampleDocument(documentModel);
    const declarations = Array.isArray(uniforms)
        ? uniforms.map((uniform) => serializeShaderUniformDeclaration(uniform)).filter(Boolean)
        : [];
    const metadata = {
        ...(nextDocument.metadata || {}),
    };

    if (declarations.length > 0) {
        metadata.shader_uniforms = declarations.join('|');
    } else {
        delete metadata.shader_uniforms;
    }

    nextDocument.metadata = metadata;
    return reparseDocument(nextDocument);
}

export function updateShaderTextureDefinitions(documentModel, textures = []) {
    const nextDocument = cloneExampleDocument(documentModel);
    const declarations = Array.isArray(textures)
        ? textures.map((texture) => serializeShaderTextureDeclaration(texture)).filter(Boolean)
        : [];
    const metadata = {
        ...(nextDocument.metadata || {}),
    };

    if (declarations.length > 0) {
        metadata.shader_textures = declarations.join('|');
    } else {
        delete metadata.shader_textures;
    }

    nextDocument.metadata = metadata;
    return reparseDocument(nextDocument);
}

export function updateShaderResolution(documentModel, resolution = null) {
    const nextDocument = cloneExampleDocument(documentModel);
    if (!isShaderDocument(nextDocument)) return nextDocument;

    const width = Number.isFinite(resolution?.width)
        ? resolution.width
        : Number.parseInt(resolution?.width, 10);
    const height = Number.isFinite(resolution?.height)
        ? resolution.height
        : Number.parseInt(resolution?.height, 10);

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        return nextDocument;
    }

    nextDocument.metadata = {
        ...(nextDocument.metadata || {}),
        resolution: normalizeResolutionMetadataValue(`${Math.round(width)}x${Math.round(height)}`),
    };

    return reparseDocument(nextDocument);
}

export function updateDocumentHiddenFiles(documentModel, hiddenKeys = []) {
    const nextDocument = cloneExampleDocument(documentModel);
    const visibilityEntries = getDocumentFileVisibilityEntries(nextDocument);
    const validKeys = new Set(visibilityEntries.map((entry) => entry.key).filter(Boolean));
    const requestedKeys = Array.isArray(hiddenKeys) ? hiddenKeys : [];
    const normalizedKeys = Array.from(new Set(
        requestedKeys
            .map((entry) => normalizeEditorHiddenFileKey(entry))
            .filter((entry) => entry && validKeys.has(entry))
    ));
    const metadata = {
        ...(nextDocument.metadata || {}),
    };

    if (normalizedKeys.length > 0) {
        metadata.editor_hidden_files = normalizedKeys.join('|');
    } else {
        delete metadata.editor_hidden_files;
    }

    nextDocument.metadata = metadata;
    return reparseDocument(nextDocument);
}

export function createExampleDocumentFromPreset(presetId = 'html-css-javascript') {
    const preset = getSessionPreset(presetId);
    const metadata = normalizeMetadata(preset.metadata || {});
    const blocks = (preset.blocks || []).map((block, index) => buildBlock(block.type, block.content, null, `${block.type}-${index}`));
    const files = (preset.files || []).map((file, index) => buildVirtualFile({
        path: file.path,
        language: file.language,
        content: file.content,
        role: file.role || '',
        sourceKind: 'virtual',
        index,
    }));

    const sourceFormat = files.length > 0 ? 'virtual-files' : 'legacy-blocks';
    const documentModel = {
        sessionId: '',
        metadata,
        blocks,
        files: sourceFormat === 'legacy-blocks' ? deriveFilesFromBlocks(blocks) : files,
        diagnostics: [],
        unsupportedBlocks: [],
        sourceFormat,
    };

    return synchronizeDocument(documentModel);
}

export function cloneExampleDocument(documentModel) {
    if (!documentModel) {
        return createEmptyExampleDocument();
    }

    return {
        rendererMode: documentModel.rendererMode || 'web',
        sessionId: documentModel.sessionId || '',
        metadata: cloneMetadata(documentModel.metadata || {}),
        blocks: (documentModel.blocks || []).map((block) => ({ ...block })),
        files: cloneFiles(documentModel.files || []),
        diagnostics: (documentModel.diagnostics || []).map((diagnostic) => ({ ...diagnostic })),
        unsupportedBlocks: (documentModel.unsupportedBlocks || []).map((block) => ({ ...block })),
        sourceFormat: documentModel.sourceFormat || 'legacy-blocks',
    };
}

export function parseExampleDocument(text = '') {
    const source = String(text).replace(/\r\n/g, '\n');
    const lines = source.split('\n');
    const { metadata, startIndex, diagnostics: frontmatterDiagnostics } = parseFrontmatter(lines);
    const diagnostics = [...frontmatterDiagnostics];
    const unsupportedBlocks = [];

    let format = 'legacy-blocks';
    for (let index = startIndex; index < lines.length; index += 1) {
        if (/^##\s+@file\s+/.test(lines[index])) {
            format = 'virtual-files';
            break;
        }

        if (lines[index].trim()) {
            break;
        }
    }

    if (format === 'virtual-files') {
        const virtualMetadata = cloneMetadata(metadata);
        const files = parseVirtualFiles(lines, startIndex, diagnostics, virtualMetadata);
        validateMetadata(virtualMetadata, diagnostics, 'virtual-files');
        validateVirtualDocument(files, virtualMetadata, diagnostics);

        return synchronizeDocument({
            sessionId: '',
            metadata: virtualMetadata,
            blocks: [],
            files,
            diagnostics,
            unsupportedBlocks,
            sourceFormat: 'virtual-files',
        });
    }

    const blocks = parseLegacyBlocks(lines, startIndex, diagnostics, unsupportedBlocks);
    validateMetadata(metadata, diagnostics, 'legacy-blocks');
    validateLegacyDocument(blocks, metadata, diagnostics);

    const legacyFiles = deriveFilesFromBlocks(blocks);
    validateEditorHiddenFiles(legacyFiles, metadata, diagnostics);
    validateExerciseDocument(legacyFiles, metadata, diagnostics);

    return synchronizeDocument({
        sessionId: '',
        metadata,
        blocks,
        files: legacyFiles,
        diagnostics,
        unsupportedBlocks,
        sourceFormat: 'legacy-blocks',
    });
}

export function buildExampleDocument(documentModel) {
    const document = synchronizeDocument(documentModel);

    if (document.sourceFormat === 'virtual-files') {
        return buildVirtualMarkdown(document.files, document.metadata);
    }

    return buildLegacyMarkdown(document.blocks, document.metadata);
}

export function hasBlockingDiagnostics(documentModel) {
    return (documentModel?.diagnostics || []).some((diagnostic) => diagnostic.level === 'error');
}

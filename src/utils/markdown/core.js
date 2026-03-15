import {
    getBlockDefinition,
    normalizeBlockType,
} from '../../config/exampleBlocks.js';
import {
    EXAMPLE_IMPORTANCE_VALUES,
    KNOWN_METADATA_KEYS,
    LANGUAGE_FILE_EXTENSIONS,
    LANGUAGE_LABELS,
    LEGACY_APP_LANGUAGE_OPTIONS,
    LEGACY_FILE_TEMPLATES,
    LEGACY_MARKUP_LANGUAGE_OPTIONS,
    LEGACY_SCRIPT_LANGUAGE_OPTIONS,
    LEGACY_STYLE_LANGUAGE_OPTIONS,
    LIKELY_VIRTUAL_ASSET_EXTENSIONS,
} from './constants.js';

function normalizeResolutionMetadataLiteral(value = '') {
    const text = String(value ?? '').trim();
    if (!text) return '';

    const match = text.match(/^(\d+)\s*x\s*(\d+)$/i);
    if (!match) return text;

    const width = Number.parseInt(match[1], 10);
    const height = Number.parseInt(match[2], 10);

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        return text;
    }

    return `${width}x${height}`;
}

export function createDiagnostic(level, code, message, details = {}) {
    return { level, code, message, ...details };
}

export function isHeadingLine(line) {
    return /^#{1,6}\s+.+$/.test(line);
}

export function isFenceLine(line) {
    return /^```([\w+-]+)\s*$/.test(line);
}

export function parseFenceLanguage(line) {
    const match = line.match(/^```([\w+-]+)\s*$/);
    return match ? normalizeBlockType(match[1]) : '';
}

export function headingsMatch(actualHeading, expectedHeading) {
    if (!actualHeading) return true;
    return actualHeading.trim().toLowerCase() === expectedHeading.trim().toLowerCase();
}

export function normalizeMetadataKey(key = '') {
    const value = String(key).trim();
    const lowered = value.toLowerCase();

    if (KNOWN_METADATA_KEYS.has(lowered)) {
        return lowered;
    }

    return value;
}

export function normalizeModeValue(value = '') {
    const normalized = String(value).trim().toLowerCase();

    if (['single', 'single-file', 'singlefile'].includes(normalized)) {
        return 'single-file';
    }

    if (['multi', 'multi-file', 'multifile'].includes(normalized)) {
        return 'multi-file';
    }

    return normalized;
}

export function normalizeRendererValue(value = '') {
    return String(value).trim().toLowerCase();
}

export function normalizeBooleanMetadataValue(value) {
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

export function normalizeExampleDescriptionMetadataValue(value = '') {
    return String(value ?? '').trim();
}

export function parseExampleTagsMetadataValue(value = '') {
    const diagnostics = [];

    const rawEntries = Array.isArray(value)
        ? value
        : String(value ?? '').trim()
            ? String(value ?? '').split(String(value).includes('|') ? '|' : ',')
            : [];

    const tags = [];
    const seen = new Set();

    rawEntries.forEach((entry) => {
        const normalizedTag = String(entry ?? '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ');

        if (!normalizedTag) return;

        if (seen.has(normalizedTag)) {
            diagnostics.push(createDiagnostic(
                'warning',
                'duplicate-example-tag',
                `Example tag "${normalizedTag}" is declared more than once. Only the first value is used.`,
                { tag: normalizedTag }
            ));
            return;
        }

        seen.add(normalizedTag);
        tags.push(normalizedTag);
    });

    return {
        diagnostics,
        normalizedValue: tags.join('|'),
        tags,
    };
}

export function parseExampleRatingValue(value) {
    if (value === undefined || value === null || value === '') return null;

    const numericValue = typeof value === 'number'
        ? value
        : Number.parseInt(String(value).trim(), 10);

    if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 5) {
        return null;
    }

    return numericValue;
}

export function normalizeExampleRatingMetadataValue(value) {
    const parsed = parseExampleRatingValue(value);
    return parsed ?? String(value ?? '').trim();
}

export function parseExampleImportanceValue(value = '') {
    const normalizedValue = String(value ?? '').trim().toLowerCase();
    return EXAMPLE_IMPORTANCE_VALUES.has(normalizedValue) ? normalizedValue : '';
}

export function normalizeExampleImportanceMetadataValue(value) {
    const parsed = parseExampleImportanceValue(value);
    return parsed || String(value ?? '').trim().toLowerCase();
}

export function normalizeMetadata(metadata = {}) {
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
            normalized.resolution = normalizeResolutionMetadataLiteral(value);
            return;
        }

        if (normalizedKey === 'shader_uniforms') {
            normalized.shader_uniforms = String(value ?? '').trim();
            return;
        }

        if (normalizedKey === 'shader_textures') {
            normalized.shader_textures = String(value ?? '').trim();
            return;
        }

        if (normalizedKey === 'example_description') {
            normalized.example_description = normalizeExampleDescriptionMetadataValue(value);
            return;
        }

        if (normalizedKey === 'example_tags') {
            normalized.example_tags = parseExampleTagsMetadataValue(value).normalizedValue;
            return;
        }

        if (normalizedKey === 'example_rating') {
            normalized.example_rating = normalizeExampleRatingMetadataValue(value);
            return;
        }

        if (normalizedKey === 'example_importance') {
            normalized.example_importance = normalizeExampleImportanceMetadataValue(value);
            return;
        }

        if (normalizedKey === 'exercise' || normalizedKey === 'console') {
            normalized[normalizedKey] = normalizeBooleanMetadataValue(value);
            return;
        }

        if (normalizedKey === 'example_stage') {
            normalized.example_stage = String(value).trim().toLowerCase();
            return;
        }

        if (normalizedKey === 'highlights') {
            normalized.highlights = String(value).trim();
            return;
        }

        normalized[normalizedKey] = value;
    });

    return normalized;
}

export function cloneMetadata(metadata = {}) {
    return JSON.parse(JSON.stringify(metadata || {}));
}

export function normalizeVirtualPath(value = '') {
    return String(value)
        .trim()
        .replaceAll('\\', '/')
        .replace(/^\.\/+/, '')
        .replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/');
}

export function getVirtualPathSegments(path = '') {
    const normalized = normalizeVirtualPath(path);
    return normalized ? normalized.split('/') : [];
}

export function getVirtualPathIssue(path = '') {
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

export function getFileName(path = '') {
    return normalizeVirtualPath(path).split('/').pop() || path;
}

export function getFileExtension(path = '') {
    const fileName = getFileName(path);
    const index = fileName.lastIndexOf('.');

    if (index <= 0) return '';
    return fileName.slice(index).toLowerCase();
}

export function getExpectedExtensions(language = '') {
    return LANGUAGE_FILE_EXTENSIONS[normalizeBlockType(language)] || [];
}

export function isLikelyVirtualAssetPath(path = '') {
    return LIKELY_VIRTUAL_ASSET_EXTENSIONS.has(getFileExtension(path));
}

export function buildBlock(type, content, headingOverride = null, id = '') {
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

export function buildVirtualFile({
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

export function getDirectoryName(path = '') {
    const normalized = normalizeVirtualPath(path);
    const slashIndex = normalized.lastIndexOf('/');
    return slashIndex === -1 ? '' : normalized.slice(0, slashIndex);
}

export function getFileStem(path = '') {
    const fileName = getFileName(path);
    const extension = getFileExtension(path);

    if (!extension) return fileName;
    return fileName.slice(0, -extension.length);
}

export function createDuplicatePath(path = '', existingPaths = new Set()) {
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

export function parseMetadataValue(rawValue = '') {
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

export function parseFrontmatter(lines = []) {
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

export function serializeMetadataValue(value) {
    if (typeof value === 'boolean' || typeof value === 'number') {
        return String(value);
    }

    if (typeof value === 'string' && /^[A-Za-z0-9_./-]+$/.test(value)) {
        return value;
    }

    return JSON.stringify(value);
}

export function buildFrontmatter(metadata = {}) {
    const normalized = normalizeMetadata(metadata);
    const entries = Object.entries(normalized);

    if (entries.length === 0) return '';

    const lines = entries
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => `${key}: ${serializeMetadataValue(value)}`);

    return ['---', ...lines, '---'].join('\n');
}

export function parseExerciseListValue(value) {
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

export function parseExercisePathList(value) {
    return parseExerciseListValue(value)
        .map((entry) => normalizeVirtualPath(entry))
        .filter(Boolean);
}

export function dedupeNormalizedLanguageOptions(options = []) {
    const seen = new Set();
    const normalizedOptions = [];

    options.forEach((option) => {
        const normalized = normalizeBlockType(option);
        if (!normalized || seen.has(normalized)) return;
        seen.add(normalized);
        normalizedOptions.push(normalized);
    });

    return normalizedOptions;
}

export function getLanguageLabel(language = '') {
    const normalized = normalizeBlockType(language);
    const definition = getBlockDefinition(normalized);
    if (definition?.heading) return definition.heading;
    return LANGUAGE_LABELS[normalized] || normalized.toUpperCase();
}

export function getLegacyLanguageFamily(language = '') {
    const normalized = normalizeBlockType(language);

    if (LEGACY_MARKUP_LANGUAGE_OPTIONS.includes(normalized)) return 'markup';
    if (LEGACY_STYLE_LANGUAGE_OPTIONS.includes(normalized)) return 'style';
    if (LEGACY_SCRIPT_LANGUAGE_OPTIONS.includes(normalized)) return 'script';
    if (LEGACY_APP_LANGUAGE_OPTIONS.includes(normalized)) return 'app';
    if (LEGACY_FILE_TEMPLATES[normalized]?.role === 'shader') return 'shader';

    return 'unknown';
}

export function getVirtualLanguageFamily(language = '') {
    const normalized = normalizeBlockType(language);

    if (LEGACY_STYLE_LANGUAGE_OPTIONS.includes(normalized)) return 'style';
    if (normalized === 'json') return 'json';
    if (normalized === 'vue') return 'sfc';
    if (normalized === 'html') return 'markup';
    if (['jsx', 'tsx', 'javascript', 'typescript'].includes(normalized)) return 'code';

    return 'unknown';
}

export function isDocumentEntryFile(documentModel, file) {
    if (!file) return false;

    return file.role === 'entry'
        || normalizeVirtualPath(documentModel?.metadata?.entry || '') === normalizeVirtualPath(file.path || '');
}

export function getPreferredExpectedExtension(path = '', language = '') {
    const expectedExtensions = getExpectedExtensions(language);
    const currentExtension = getFileExtension(path);

    if (!expectedExtensions.length) return '';
    if (expectedExtensions.includes(currentExtension)) return currentExtension;

    if (currentExtension === '.mjs' && expectedExtensions.includes('.mts')) {
        return '.mts';
    }

    if (currentExtension === '.mts' && expectedExtensions.includes('.mjs')) {
        return '.mjs';
    }

    if (currentExtension === '.htm' && expectedExtensions.includes('.htm')) {
        return '.htm';
    }

    return expectedExtensions[0];
}

export function getExpectedPathForLanguage(path = '', language = '') {
    const normalizedPath = normalizeVirtualPath(path);
    const preferredExtension = getPreferredExpectedExtension(normalizedPath, language);

    if (!normalizedPath || !preferredExtension) {
        return normalizedPath;
    }

    const directory = getDirectoryName(normalizedPath);
    const stem = getFileStem(normalizedPath);
    const fileName = `${stem}${preferredExtension}`;

    return directory ? `${directory}/${fileName}` : fileName;
}

export { normalizeBlockType };

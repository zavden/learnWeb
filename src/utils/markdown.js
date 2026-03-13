import {
    deriveSessionId,
    getBlockDefinition,
    getSessionPreset,
    normalizeBlockType,
    sortBlocks,
} from '../config/exampleBlocks.js';

const SUPPORTED_FRAMEWORKS = new Set(['react', 'vue']);
const SUPPORTED_FRAMEWORK_MODES = new Set(['single-file', 'multi-file']);
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
    'mode',
    'entry',
    'console',
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
    vue: ['.vue'],
};

const LEGACY_FILE_TEMPLATES = {
    jsx: { path: 'App.jsx', role: 'app' },
    tsx: { path: 'App.tsx', role: 'app' },
    html: { path: 'index.html', role: 'markup' },
    'html-full': { path: 'document.html', role: 'markup' },
    svg: { path: 'graphic.svg', role: 'markup' },
    pug: { path: 'template.pug', role: 'markup' },
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
    const mode = metadata.mode || '';
    const hasConsole = Object.prototype.hasOwnProperty.call(metadata, 'console');
    const hasEntry = Object.prototype.hasOwnProperty.call(metadata, 'entry');

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

function validateLegacyDocument(blocks, metadata, diagnostics) {
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
        metadata,
        blocks,
        files: document.sourceFormat === 'legacy-blocks' ? deriveFilesFromBlocks(blocks) : files,
        sessionId: inferSessionIdFromDocument({
            blocks,
            files: document.sourceFormat === 'legacy-blocks' ? deriveFilesFromBlocks(blocks) : files,
            metadata,
        }),
    };
}

export function getDocumentLanguageOptions(documentModel) {
    const framework = String(documentModel?.metadata?.framework || '').trim().toLowerCase();

    if (documentModel?.sourceFormat === 'virtual-files') {
        if (framework === 'react') {
            return [...REACT_MULTI_FILE_LANGUAGE_OPTIONS];
        }

        if (framework === 'vue') {
            return [...VUE_MULTI_FILE_LANGUAGE_OPTIONS];
        }

        return [];
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

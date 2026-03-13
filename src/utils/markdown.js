import {
    deriveSessionId,
    getBlockDefinition,
    getSessionPreset,
    normalizeBlockType,
    sortBlocks,
} from '../config/exampleBlocks.js';

const SUPPORTED_FRAMEWORKS = new Set(['react']);
const REACT_APP_BLOCK_TYPES = new Set(['jsx', 'tsx']);
const REACT_MULTI_FILE_LANGUAGES = new Set(['jsx', 'tsx', 'javascript', 'typescript', 'css', 'scss', 'sass']);

const LEGACY_FILE_TEMPLATES = {
    jsx: { path: 'App.jsx', role: 'app' },
    tsx: { path: 'App.tsx', role: 'app' },
    html: { path: 'index.html', role: 'markup' },
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

function normalizeMetadata(metadata = {}) {
    const normalized = {};

    Object.entries(metadata).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;

        if (key === 'framework' || key === 'mode' || key === 'entry') {
            normalized[key] = String(value).trim();
            if (key !== 'entry') {
                normalized[key] = normalized[key].toLowerCase();
            }
            return;
        }

        normalized[key] = value;
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

function getFileName(path = '') {
    return normalizeVirtualPath(path).split('/').pop() || path;
}

function buildBlock(type, content, headingOverride = null, id = '') {
    const definition = getBlockDefinition(type);
    return {
        id,
        slot: definition.slot,
        type,
        language: type,
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

        metadata[match[1]] = parseMetadataValue(match[2]);
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

        while (index < lines.length) {
            const line = lines[index].trim();
            if (!line) {
                index += 1;
                continue;
            }

            const langMatch = lines[index].match(/^##\s+@lang\s+(.+)$/);
            if (langMatch) {
                explicitLanguage = normalizeBlockType(langMatch[1]);
                index += 1;
                continue;
            }

            const roleMatch = lines[index].match(/^##\s+@role\s+(.+)$/);
            if (roleMatch) {
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

        if (!definition && !REACT_MULTI_FILE_LANGUAGES.has(normalizedLanguage)) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'unsupported-file-language',
                    `Unsupported language "${normalizedLanguage}" for file "${filePath}".`,
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
            path: filePath,
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

function validateLegacyDocument(blocks, metadata, diagnostics) {
    const appBlocks = blocks.filter((block) => block.slot === 'app');
    const markupBlocks = blocks.filter((block) => block.slot === 'markup');
    const styleBlocks = blocks.filter((block) => block.slot === 'style');
    const scriptBlocks = blocks.filter((block) => block.slot === 'script');
    const framework = metadata.framework || '';

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
                    'Example must contain exactly one HTML or SVG block.'
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

    if (framework !== 'react') {
        diagnostics.push(
            createDiagnostic(
                'error',
                'virtual-files-framework-required',
                'Virtual files are currently supported only for `framework: react`.',
                { framework }
            )
        );
    }

    if (framework === 'react' && mode !== 'multi-file') {
        diagnostics.push(
            createDiagnostic(
                'warning',
                'react-mode-normalized',
                'React virtual-file examples should declare `mode: multi-file`.',
                { mode }
            )
        );
    }

    const seenPaths = new Set();

    files.forEach((file) => {
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
    });

    if (framework === 'react') {
        const entry = normalizeVirtualPath(metadata.entry || '');

        if (!entry) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'missing-react-entry',
                    'React multi-file examples must declare `entry` in frontmatter.'
                )
            );
        } else if (!files.some((file) => file.path === entry)) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'missing-react-entry-file',
                    `Entry file "${entry}" does not exist in this document.`,
                    { entry }
                )
            );
        }
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

export function updateDocumentFileContent(documentModel, fileId, content) {
    const nextDocument = cloneExampleDocument(documentModel);
    const file = nextDocument.files.find((entry) => entry.id === fileId);
    if (!file) return nextDocument;

    file.content = content;
    return synchronizeDocument(nextDocument);
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
    validateLegacyDocument(blocks, metadata, diagnostics);

    return synchronizeDocument({
        sessionId: '',
        metadata,
        blocks,
        files: deriveFilesFromBlocks(blocks),
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

import {
    deriveSessionId,
    getBlockDefinition,
    getSessionPreset,
    normalizeBlockType,
    sortBlocks,
} from '../config/exampleBlocks.js';

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

export function createEmptyExampleDocument() {
    return {
        sessionId: '',
        blocks: [],
        diagnostics: [],
        unsupportedBlocks: [],
    };
}

export function createExampleDocumentFromPreset(presetId = 'html-css-javascript') {
    const preset = getSessionPreset(presetId);
    const blocks = preset.blocks.map((block, index) => buildBlock(block.type, block.content, null, `${block.type}-${index}`));

    return {
        sessionId: deriveSessionId(blocks),
        blocks,
        diagnostics: [],
        unsupportedBlocks: [],
    };
}

export function cloneExampleDocument(documentModel) {
    if (!documentModel) {
        return createEmptyExampleDocument();
    }

    return {
        sessionId: documentModel.sessionId || '',
        blocks: (documentModel.blocks || []).map((block) => ({ ...block })),
        diagnostics: (documentModel.diagnostics || []).map((diagnostic) => ({ ...diagnostic })),
        unsupportedBlocks: (documentModel.unsupportedBlocks || []).map((block) => ({ ...block })),
    };
}

export function parseExampleDocument(text = '') {
    const source = String(text).replace(/\r\n/g, '\n');
    const lines = source.split('\n');
    const blocks = [];
    const diagnostics = [];
    const unsupportedBlocks = [];
    let blockIndex = 0;

    let index = 0;

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

    const sortedBlocks = sortBlocks(blocks);
    const markupBlocks = sortedBlocks.filter((block) => block.slot === 'markup');
    const styleBlocks = sortedBlocks.filter((block) => block.slot === 'style');
    const scriptBlocks = sortedBlocks.filter((block) => block.slot === 'script');

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

    return {
        sessionId: deriveSessionId(sortedBlocks),
        blocks: sortedBlocks,
        diagnostics,
        unsupportedBlocks,
    };
}

export function buildExampleDocument(documentModel) {
    const blocks = sortBlocks(documentModel?.blocks || []);

    return blocks
        .map((block) => {
            const definition = getBlockDefinition(block.type);
            const heading = definition?.heading || block.heading || block.type.toUpperCase();
            const language = block.language || block.type;
            const content = block.content || '';

            return `# ${heading}

\`\`\`${language}
${content}
\`\`\``;
        })
        .join('\n\n');
}

export function hasBlockingDiagnostics(documentModel) {
    return (documentModel?.diagnostics || []).some((diagnostic) => diagnostic.level === 'error');
}

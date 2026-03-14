import {
    deriveSessionId,
    getBlockDefinition,
    sortBlocks,
} from '../../config/exampleBlocks.js';
import {
    REACT_MULTI_FILE_LANGUAGES,
    SUPPORTED_FRAMEWORKS,
    VUE_MULTI_FILE_LANGUAGES,
} from './constants.js';
import {
    buildBlock,
    buildFrontmatter,
    buildVirtualFile,
    createDiagnostic,
    headingsMatch,
    isFenceLine,
    isHeadingLine,
    isLikelyVirtualAssetPath,
    normalizeBlockType,
    normalizeVirtualPath,
    parseFenceLanguage,
} from './core.js';
import { deriveFilesFromBlocks } from './documentMeta.js';

export function inferSessionIdFromDocument({ blocks = [], files = [], metadata = {} }) {
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

export function parseLegacyBlocks(lines, startIndex, diagnostics, unsupportedBlocks) {
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

export function parseVirtualFiles(lines, startIndex, diagnostics, metadata = {}) {
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

export function buildLegacyMarkdown(blocks = [], metadata = {}) {
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

export function buildVirtualMarkdown(files = [], metadata = {}) {
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

export function cloneFiles(files = []) {
    return files.map((file) => ({ ...file }));
}

export function deriveLegacyFiles(blocks = []) {
    return deriveFilesFromBlocks(sortBlocks(blocks));
}

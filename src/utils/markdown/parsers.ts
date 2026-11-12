// The two body formats of an example: legacy blocks (`# Heading` + fenced block) and virtual files
// (`## @file` / `## @lang` / `## @role` + fenced block). Reads them into blocks/files while collecting
// diagnostics, and writes documents back to Markdown. Called by documentApi.ts (parse/build) and
// documentMeta.ts; the serializers' output is what the editor saves, so it must parse back to the same
// document (tests/document-roundtrip.test.ts).
//
// Unclosed fences are recovered when the next opening fence of the same kind appears at column 0: the
// block is closed there with a `recovered-unclosed-fence` warning instead of swallowing the next block.

import { deriveSessionId, getBlockDefinition, sortBlocks } from '../../config/exampleBlocks.ts';
import type { Diagnostic } from '../../types/diagnostics.ts';
import type {
    DocumentFileInput,
    ExampleBlock,
    ExampleDocumentInput,
    ExampleMetadata,
    ExampleMetadataInput,
    UnsupportedBlock,
    VirtualFile,
} from '../../types/document.ts';
import { REACT_MULTI_FILE_LANGUAGES, VUE_MULTI_FILE_LANGUAGES } from './constants.ts';
import {
    buildBlock,
    buildFrontmatter,
    buildVirtualFile,
    createDiagnostic,
    getFenceForContent,
    headingsMatch,
    isFenceClosingLine,
    isFenceLine,
    isHeadingLine,
    isIndentedFenceClosingLine,
    isLikelyVirtualAssetPath,
    normalizeBlockType,
    normalizeVirtualPath,
    parseFenceOpening,
    stripSurroundingBlankLines,
    type FenceOpening,
} from './core.ts';

const VIRTUAL_DIRECTIVE_PATTERN = /^##\s+@(file|lang|role)\s+/;

/** Result of reading one fenced block. */
interface FencedContent {
    /** False when the file ended without any closing fence. */
    closed: boolean;
    content: string;
    /** Index of the line to continue from. */
    nextIndex: number;
    /** The block was closed by recovery (next opening fence, or an over-indented closing fence). */
    recovered: boolean;
}

function isVirtualDirectiveLine(line: string = ''): boolean {
    return VIRTUAL_DIRECTIVE_PATTERN.test(line);
}

function isHtmlFullHeading(heading: string | null = ''): boolean {
    return /^html[\s_-]*full$/i.test(String(heading || '').trim());
}

// Reads the content of a fenced block that starts at lines[startIndex] (the line after the
// opening fence). The block ends at a closing fence with the same character and at least the
// same length. If a new opening fence of the same kind shows up at column 0 before that, the
// previous block was left unclosed: the block is closed there and the trailing heading /
// directive lines are handed back to the caller so the next block is never swallowed.
function readFencedContent(
    lines: readonly string[],
    startIndex: number,
    fence: FenceOpening,
    isStructureLine: (line: string) => boolean,
): FencedContent {
    let index = startIndex;

    while (index < lines.length) {
        const line = lines[index];

        if (isFenceClosingLine(line, fence)) {
            return {
                closed: true,
                content: stripSurroundingBlankLines(lines.slice(startIndex, index)),
                nextIndex: index + 1,
                recovered: false,
            };
        }

        const nestedOpening = parseFenceOpening(line);
        if (nestedOpening && nestedOpening.char === fence.char && nestedOpening.length >= fence.length) {
            let end = index;
            let resumeIndex = index;

            while (end > startIndex && (lines[end - 1].trim() === '' || isStructureLine(lines[end - 1]))) {
                end -= 1;
                if (lines[end].trim() !== '') resumeIndex = end;
            }

            if (end > startIndex && isIndentedFenceClosingLine(lines[end - 1], fence)) {
                end -= 1;
            }

            return {
                closed: true,
                content: stripSurroundingBlankLines(lines.slice(startIndex, end)),
                nextIndex: resumeIndex,
                recovered: true,
            };
        }

        index += 1;
    }

    // End of file without a closing fence: accept a deeper-indented fence as the closer.
    let end = lines.length;
    while (end > startIndex && lines[end - 1].trim() === '') end -= 1;

    if (end > startIndex && isIndentedFenceClosingLine(lines[end - 1], fence)) {
        return {
            closed: true,
            content: stripSurroundingBlankLines(lines.slice(startIndex, end - 1)),
            nextIndex: lines.length,
            recovered: true,
        };
    }

    return {
        closed: false,
        content: stripSurroundingBlankLines(lines.slice(startIndex)),
        nextIndex: lines.length,
        recovered: false,
    };
}

function buildFencedCode(language: string | undefined, content: string = ''): string {
    const fence = getFenceForContent(content);
    return `${fence}${language}
${content}
${fence}`;
}
import { deriveFilesFromBlocks } from './documentMeta.ts';

/** The document's `sessionId` (see `ExampleDocument.sessionId`). */
export function inferSessionIdFromDocument({ blocks = [], files = [], metadata = {} }: ExampleDocumentInput): string {
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

/**
 * Reads legacy blocks from `startIndex` on: optional `# Heading`, then a fenced block, repeated. Problems are
 * pushed to `diagnostics`; blocks in unknown languages go to `unsupportedBlocks`. Returns the blocks sorted
 * by slot. A `# HTML-FULL` heading over an ```html fence makes an `html-full` block.
 */
export function parseLegacyBlocks(
    lines: readonly string[],
    startIndex: number,
    diagnostics: Diagnostic[],
    unsupportedBlocks: UnsupportedBlock[],
): ExampleBlock[] {
    const blocks: ExampleBlock[] = [];
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

        let heading: string | null = null;
        if (isHeadingLine(lines[index])) {
            heading = lines[index].replace(/^#{1,6}\s+/, '').trim();
            index += 1;
            skipBlankLines();
        }

        if (index >= lines.length) break;

        const fenceLine = lines[index];
        const fence = parseFenceOpening(fenceLine);
        if (!fence) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'unexpected-text',
                    `Unexpected content at line ${index + 1}. Examples must be composed of fenced code blocks.`,
                    { line: index + 1 },
                ),
            );
            index += 1;
            continue;
        }

        const fenceLanguage = fence.language;
        // "# HTML-FULL" + ```html is the documented HTML-FULL format.
        const language = fenceLanguage === 'html' && isHtmlFullHeading(heading) ? 'html-full' : fenceLanguage;
        const fenceLineNumber = index + 1;
        const fenced = readFencedContent(lines, index + 1, fence, isHeadingLine);
        const { closed, content } = fenced;
        index = fenced.nextIndex;

        if (fenced.recovered) {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'recovered-unclosed-fence',
                    `The "${language || 'unknown'}" block opened at line ${fenceLineNumber} has no proper closing fence. It was closed before the next block.`,
                    { language, line: fenceLineNumber },
                ),
            );
        }

        const definition = getBlockDefinition(language);

        if (!closed) {
            diagnostics.push(
                createDiagnostic('error', 'unclosed-fence', `Unclosed code fence for "${language || 'unknown'}".`, {
                    language,
                }),
            );
            break;
        }

        if (!definition) {
            diagnostics.push(
                createDiagnostic('error', 'unsupported-language', `Unsupported block language "${language}".`, {
                    language,
                }),
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
                    { language },
                ),
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
                    { heading, language },
                ),
            );
        }

        const block = buildBlock(language, content, heading || definition.heading, `${language}-${blockIndex}`);
        if (fenceLanguage && fenceLanguage !== language) {
            block.fenceLanguage = fenceLanguage;
        }
        blocks.push(block);
        blockIndex += 1;
    }

    return sortBlocks(blocks);
}

/**
 * Reads `## @file path` sections from `startIndex` on, each with optional `## @lang` / `## @role` lines and
 * a fenced block. Files in unsupported languages are skipped with a diagnostic. Side effect: sets
 * `metadata.mode` to `multi-file` when it is missing.
 */
export function parseVirtualFiles(
    lines: readonly string[],
    startIndex: number,
    diagnostics: Diagnostic[],
    metadata: ExampleMetadata = {},
): VirtualFile[] {
    const files: VirtualFile[] = [];
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
                createDiagnostic('error', 'invalid-file-section', `Expected "## @file ..." at line ${index + 1}.`, {
                    line: index + 1,
                }),
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
                            { line: index + 1, path: filePath || null },
                        ),
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
                            { line: index + 1, path: filePath || null },
                        ),
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
                    { line: index + 1 },
                ),
            );
            index += 1;
        }

        if (index >= lines.length || !isFenceLine(lines[index])) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'missing-file-fence',
                    `File "${filePath}" is missing its fenced code block.`,
                    { path: filePath },
                ),
            );
            break;
        }

        // `!`: the loop above only stops on a fence line (checked by isFenceLine() just before).
        const fence = parseFenceOpening(lines[index])!;
        const fenceLanguage = fence.language;
        const language = explicitLanguage || fenceLanguage;
        const fenceLineNumber = index + 1;
        const fenced = readFencedContent(lines, index + 1, fence, isVirtualDirectiveLine);
        const { closed, content } = fenced;
        index = fenced.nextIndex;

        if (fenced.recovered) {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'recovered-unclosed-fence',
                    `File "${filePath}" opened its code block at line ${fenceLineNumber} without a proper closing fence. It was closed before the next file.`,
                    { line: fenceLineNumber, path: filePath },
                ),
            );
        }

        if (!closed) {
            diagnostics.push(
                createDiagnostic('error', 'unclosed-fence', `Unclosed code fence for file "${filePath}".`, {
                    path: filePath,
                }),
            );
            break;
        }

        if (!language) {
            diagnostics.push(
                createDiagnostic(
                    'error',
                    'missing-file-language',
                    `File "${filePath}" must declare a language using @lang or the fenced block language.`,
                    { path: filePath },
                ),
            );
            continue;
        }

        const normalizedLanguage = normalizeBlockType(language);
        const definition = getBlockDefinition(normalizedLanguage);

        if (
            !definition &&
            !REACT_MULTI_FILE_LANGUAGES.has(normalizedLanguage) &&
            !VUE_MULTI_FILE_LANGUAGES.has(normalizedLanguage)
        ) {
            const looksLikeVirtualAsset = role === 'asset' || isLikelyVirtualAssetPath(filePath);

            diagnostics.push(
                createDiagnostic(
                    looksLikeVirtualAsset ? 'warning' : 'error',
                    looksLikeVirtualAsset ? 'virtual-asset-files-not-supported' : 'unsupported-file-language',
                    looksLikeVirtualAsset
                        ? `Virtual asset files like "${filePath}" are not supported inside Markdown projects yet. Use the topic-level assets/ folder and reference the file by relative URL instead.`
                        : `Unsupported language "${normalizedLanguage}" for file "${filePath}".`,
                    { language: normalizedLanguage, path: filePath },
                ),
            );
            continue;
        }

        if (explicitLanguage && fenceLanguage && explicitLanguage !== fenceLanguage) {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'file-language-mismatch',
                    `File "${filePath}" declares @lang "${explicitLanguage}" but the fenced block uses "${fenceLanguage}".`,
                    { language: explicitLanguage, path: filePath },
                ),
            );
        }

        files.push(
            buildVirtualFile({
                path: filePath || `invalid-file-${files.length}`,
                language: normalizedLanguage,
                content,
                role,
                sourceKind: 'virtual',
                index: files.length,
            }),
        );
    }

    if (!metadata.mode) {
        metadata.mode = 'multi-file';
    }

    return files;
}

// Keeps the fence language the author used when it still parses back to the same block
// type (e.g. ```html under "# HTML-FULL"); otherwise uses the canonical block type.
function getBlockFenceLanguage(block: Partial<ExampleBlock> = {}): string | undefined {
    const type = normalizeBlockType(block.type);
    const fenceLanguage = normalizeBlockType(block.fenceLanguage || '');

    if (type === 'html-full' && fenceLanguage === 'html') {
        return 'html';
    }

    return block.language || block.type;
}

/** Serializes a legacy document: frontmatter, then `# Heading` + fenced block per block in slot order. */
export function buildLegacyMarkdown(blocks: readonly ExampleBlock[] = [], metadata: ExampleMetadataInput = {}): string {
    const frontmatter = buildFrontmatter(metadata);
    const content = sortBlocks(blocks)
        .map((block) => {
            const definition = getBlockDefinition(block.type);
            const heading = definition?.heading || block.heading || block.type.toUpperCase();
            const language = getBlockFenceLanguage(block);
            const fileContent = block.content || '';

            return `# ${heading}

${buildFencedCode(language, fileContent)}`;
        })
        .join('\n\n');

    return [frontmatter, content].filter(Boolean).join('\n\n');
}

/** Serializes a virtual-files document: frontmatter, then `## @file` / `## @lang` (/ `## @role`) + fenced block per file. */
export function buildVirtualMarkdown(files: readonly VirtualFile[] = [], metadata: ExampleMetadataInput = {}): string {
    const frontmatter = buildFrontmatter(metadata);
    const body = files
        .map((file) => {
            const directives = [`## @file ${file.path}`, `## @lang ${file.language}`];

            if (file.role) {
                directives.push(`## @role ${file.role}`);
            }

            return `${directives.join('\n')}

${buildFencedCode(file.language, file.content || '')}`;
        })
        .join('\n\n');

    return [frontmatter, body].filter(Boolean).join('\n\n');
}

/**
 * Shallow copies of the files. The theory pseudo-document's file is copied like any other and comes back
 * unchanged (see `ExampleDocumentInput`): the result is typed as example files because that is what every
 * other caller holds.
 */
export function cloneFiles(files: readonly DocumentFileInput[] = []): VirtualFile[] {
    return files.map((file) => ({ ...file })) as VirtualFile[];
}

/** The legacy files of the blocks (sorted by slot first). */
export function deriveLegacyFiles(blocks: readonly ExampleBlock[] = []): VirtualFile[] {
    return deriveFilesFromBlocks(sortBlocks(blocks));
}

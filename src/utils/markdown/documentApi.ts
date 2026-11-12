// The public entry points of the example document model (re-exported by src/utils/markdown.ts):
// parse Markdown into an `ExampleDocument`, serialize it back, keep its derived fields in sync, clone it,
// create one from a preset, and answer the editor's questions about it (language options, entry
// candidates, file visibility). Parsing never throws: problems become `diagnostics`.
//
// Documents returned here are synchronized (`synchronizeDocument()` has run, so `rendererMode`, `sessionId`
// and, for legacy blocks, `files` match `blocks`/`files` and `metadata`), except `cloneExampleDocument()`,
// which copies its input as it is.

import { getSessionPreset } from '../../config/exampleBlocks.ts';
import type { Diagnostic } from '../../types/diagnostics.ts';
import type {
    BlockAlias,
    ExampleDocument,
    ExampleDocumentInput,
    FileLanguage,
    FileVisibilityEntry,
    FileVisibilityKey,
    SourceFormat,
    UnsupportedBlock,
    VirtualFile,
} from '../../types/document.ts';
import {
    LEGACY_DEFAULT_BLOCK_LANGUAGE_OPTIONS,
    LEGACY_REACT_BLOCK_LANGUAGE_OPTIONS,
    LEGACY_VUE_BLOCK_LANGUAGE_OPTIONS,
    REACT_MULTI_FILE_ENTRY_LANGUAGE_OPTIONS,
    REACT_MULTI_FILE_LANGUAGE_OPTIONS,
    SHADER_BLOCK_LANGUAGE_OPTIONS,
    VUE_MULTI_FILE_ENTRY_LANGUAGE_OPTIONS,
    VUE_MULTI_FILE_LANGUAGE_OPTIONS,
} from './constants.ts';
import {
    buildBlock,
    buildVirtualFile,
    cloneMetadata,
    normalizeMetadata,
    parseFrontmatter,
} from './core.ts';
import {
    deriveFilesFromBlocks,
    getDocumentFileVisibilityKey,
    inferRendererMode,
} from './documentMeta.ts';
import { parseEditorHiddenFilesMetadataValue } from './shader.ts';
import {
    buildLegacyMarkdown,
    buildVirtualMarkdown,
    cloneFiles,
    deriveLegacyFiles,
    inferSessionIdFromDocument,
    parseLegacyBlocks,
    parseVirtualFiles,
} from './parsers.ts';
import { validateMetadata } from './validationMetadata.ts';
import {
    validateEditorHiddenFiles,
    validateExerciseDocument,
    validateLegacyDocument,
    validateVirtualDocument,
} from './validationDocuments.ts';

/** A new empty legacy document (no blocks, no metadata). */
export function createEmptyExampleDocument(): ExampleDocument {
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

/**
 * A copy of the document with its derived fields recomputed: metadata normalized, legacy file edits
 * written back into their blocks and the legacy files re-derived, then `rendererMode` and `sessionId`.
 * Accepts partial documents (missing parts count as empty); `diagnostics`, `unsupportedBlocks` and
 * `sourceFormat` are copied from the input as they are (absent stays absent).
 */
export function synchronizeDocument(documentModel: ExampleDocumentInput | null | undefined): ExampleDocument {
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

    const synchronizedFiles = sourceFormat === 'legacy-blocks' ? deriveFilesFromBlocks(blocks) : files;

    // `as`: diagnostics, unsupportedBlocks and sourceFormat come from the input (complete in practice).
    return {
        ...document,
        rendererMode: inferRendererMode({ blocks, metadata, sourceFormat }),
        metadata,
        blocks,
        files: synchronizedFiles,
        sessionId: inferSessionIdFromDocument({
            blocks,
            files: synchronizedFiles,
            metadata,
        }),
    } as ExampleDocument;
}

/** Every file of the (synchronized) document with its visibility key and whether `editor_hidden_files` hides it. */
export function getDocumentFileVisibilityEntries(documentModel: ExampleDocumentInput | null | undefined): FileVisibilityEntry[] {
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

/** Keys of the files `editor_hidden_files` hides, in file order. */
export function getHiddenFileVisibilityKeys(documentModel: ExampleDocumentInput | null | undefined): FileVisibilityKey[] {
    return getDocumentFileVisibilityEntries(documentModel)
        .filter((entry) => entry.hidden)
        .map((entry) => entry.key);
}

/**
 * Languages the "add file" menu offers for this document: by framework for virtual files (`[]` without
 * one), the missing shader stage for shader documents, by framework for legacy blocks.
 */
export function getDocumentLanguageOptions(documentModel: ExampleDocumentInput | null | undefined): (FileLanguage | BlockAlias)[] {
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

/** Files that can be the entry of a React/Vue multi-file project (by language); `[]` for other documents. */
export function getDocumentEntryCandidates(documentModel: ExampleDocumentInput | null | undefined): VirtualFile[] {
    if (documentModel?.sourceFormat !== 'virtual-files') return [];

    const framework = String(documentModel?.metadata?.framework || '').trim().toLowerCase();
    const entryLanguages = framework === 'react'
        ? REACT_MULTI_FILE_ENTRY_LANGUAGE_OPTIONS
        : framework === 'vue'
            ? VUE_MULTI_FILE_ENTRY_LANGUAGE_OPTIONS
            : null;

    if (!entryLanguages) return [];

    return (documentModel.files || []).filter((file) => entryLanguages.includes(file.language));
}

/** A new document from a session preset (`SESSION_PRESETS`); unknown ids fall back to `html-css-javascript`. */
export function createExampleDocumentFromPreset(presetId: string = 'html-css-javascript'): ExampleDocument {
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

    const sourceFormat: SourceFormat = files.length > 0 ? 'virtual-files' : 'legacy-blocks';
    const documentModel = {
        sessionId: '',
        metadata,
        blocks,
        files: sourceFormat === 'legacy-blocks' ? deriveLegacyFiles(blocks) : files,
        diagnostics: [],
        unsupportedBlocks: [],
        sourceFormat,
    };

    return synchronizeDocument(documentModel);
}

/** A copy that can be mutated freely (blocks, files, diagnostics shallow-copied; metadata deep-copied). Not re-synchronized. */
export function cloneExampleDocument(documentModel: ExampleDocumentInput | null | undefined): ExampleDocument {
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

/**
 * Parses an example's Markdown (a BOM and CRLF line endings are accepted). The format is virtual files when
 * the first body line is a `## @file` section, legacy blocks otherwise. Never throws: every problem is a
 * diagnostic, and the result is synchronized.
 */
export function parseExampleDocument(text: string | null = ''): ExampleDocument {
    const source = String(text ?? '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    const lines = source.split('\n');
    const { metadata, startIndex, diagnostics: frontmatterDiagnostics } = parseFrontmatter(lines);
    const diagnostics: Diagnostic[] = [...frontmatterDiagnostics];
    const unsupportedBlocks: UnsupportedBlock[] = [];

    let format: SourceFormat = 'legacy-blocks';
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

/** Serializes the (synchronized) document to Markdown in its own format. */
export function buildExampleDocument(documentModel: ExampleDocumentInput | null | undefined): string {
    const document = synchronizeDocument(documentModel);

    if (document.sourceFormat === 'virtual-files') {
        return buildVirtualMarkdown(document.files, document.metadata);
    }

    return buildLegacyMarkdown(document.blocks, document.metadata);
}

/** Whether any structural diagnostic is an error (`blocking` is not consulted). */
export function hasBlockingDiagnostics(documentModel: ExampleDocumentInput | null | undefined): boolean {
    return (documentModel?.diagnostics || []).some((diagnostic) => diagnostic.level === 'error');
}

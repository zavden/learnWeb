import { getSessionPreset } from '../../config/exampleBlocks.js';
import {
    LEGACY_DEFAULT_BLOCK_LANGUAGE_OPTIONS,
    LEGACY_REACT_BLOCK_LANGUAGE_OPTIONS,
    LEGACY_VUE_BLOCK_LANGUAGE_OPTIONS,
    REACT_MULTI_FILE_ENTRY_LANGUAGE_OPTIONS,
    REACT_MULTI_FILE_LANGUAGE_OPTIONS,
    SHADER_BLOCK_LANGUAGE_OPTIONS,
    VUE_MULTI_FILE_ENTRY_LANGUAGE_OPTIONS,
    VUE_MULTI_FILE_LANGUAGE_OPTIONS,
} from './constants.js';
import {
    buildBlock,
    buildVirtualFile,
    cloneMetadata,
    normalizeMetadata,
    parseFrontmatter,
} from './core.js';
import {
    deriveFilesFromBlocks,
    getDocumentFileVisibilityKey,
    inferRendererMode,
} from './documentMeta.js';
import { parseEditorHiddenFilesMetadataValue } from './shader.js';
import {
    buildLegacyMarkdown,
    buildVirtualMarkdown,
    cloneFiles,
    deriveLegacyFiles,
    inferSessionIdFromDocument,
    parseLegacyBlocks,
    parseVirtualFiles,
} from './parsers.js';
import { validateMetadata } from './validationMetadata.js';
import {
    validateEditorHiddenFiles,
    validateExerciseDocument,
    validateLegacyDocument,
    validateVirtualDocument,
} from './validationDocuments.js';

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

    const synchronizedFiles = sourceFormat === 'legacy-blocks' ? deriveFilesFromBlocks(blocks) : files;

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
    };
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
        ? REACT_MULTI_FILE_ENTRY_LANGUAGE_OPTIONS
        : framework === 'vue'
            ? VUE_MULTI_FILE_ENTRY_LANGUAGE_OPTIONS
            : null;

    if (!entryLanguages) return [];

    return (documentModel.files || []).filter((file) => entryLanguages.includes(file.language));
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
        files: sourceFormat === 'legacy-blocks' ? deriveLegacyFiles(blocks) : files,
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

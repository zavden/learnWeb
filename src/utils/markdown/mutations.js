import { getBlockDefinition } from '../../config/exampleBlocks.js';
import { SHADER_BLOCK_TYPES } from './constants.js';
import {
    buildBlock,
    createDuplicatePath,
    getFileName,
    normalizeBlockType,
    normalizeExampleDescriptionMetadataValue,
    normalizeVirtualPath,
    parseExampleImportanceValue,
    parseExampleRatingValue,
    parseExampleTagsMetadataValue,
} from './core.js';
import {
    cloneExampleDocument,
    createEmptyExampleDocument,
    parseExampleDocument,
    synchronizeDocument,
    buildExampleDocument,
    getDocumentEntryCandidates,
    getDocumentFileVisibilityEntries,
} from './documentApi.js';
import { isShaderDocument } from './documentMeta.js';
import {
    normalizeResolutionMetadataValue,
    normalizeEditorHiddenFileKey,
    parseEditorHiddenFilesMetadataValue,
    serializeShaderTextureDeclaration,
    serializeShaderUniformDeclaration,
} from './shader.js';
import { evaluateDocumentFileTypeChange } from './fileTypeChange.js';

function reparseDocument(documentModel) {
    return parseExampleDocument(buildExampleDocument(synchronizeDocument(documentModel)));
}

export function updateDocumentFileContent(documentModel, fileId, content) {
    const nextDocument = cloneExampleDocument(documentModel);
    const file = nextDocument.files.find((entry) => entry.id === fileId);
    if (!file) return nextDocument;

    file.content = content;
    return synchronizeDocument(nextDocument);
}

export function updateDocumentFileType(documentModel, fileId, nextType) {
    const evaluation = evaluateDocumentFileTypeChange(documentModel, fileId, nextType);
    if (!evaluation.allowed) {
        return synchronizeDocument(documentModel);
    }

    const nextDocument = cloneExampleDocument(documentModel);

    if (nextDocument.sourceFormat === 'virtual-files') {
        const sourceFile = (nextDocument.files || []).find((entry) => entry.id === fileId);
        if (!sourceFile) {
            return synchronizeDocument(nextDocument);
        }

        return updateDocumentFileDetails(nextDocument, fileId, {
            language: evaluation.nextType,
            path: evaluation.expectedPath || sourceFile.path,
        });
    }

    if (nextDocument.sourceFormat !== 'legacy-blocks') {
        return synchronizeDocument(nextDocument);
    }

    const sourceFile = (nextDocument.files || []).find((entry) => entry.id === fileId);
    if (!sourceFile?.blockId) {
        return synchronizeDocument(nextDocument);
    }

    const blockIndex = (nextDocument.blocks || []).findIndex((entry) => entry.id === sourceFile.blockId);
    if (blockIndex === -1) {
        return synchronizeDocument(nextDocument);
    }

    const sourceBlock = nextDocument.blocks[blockIndex];
    const updatedBlock = buildBlock(
        evaluation.nextType,
        sourceBlock.content,
        getBlockDefinition(evaluation.nextType)?.heading || sourceBlock.heading,
        sourceBlock.id,
    );

    nextDocument.blocks.splice(blockIndex, 1, updatedBlock);
    return reparseDocument(nextDocument);
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
            {
                id: `${path}:${nextDocument.files?.length || 0}`,
                path,
                name: getFileName(path),
                language,
                role,
                content: options.content || '',
                sourceKind: 'virtual',
                blockId: null,
                blockType: null,
                slot: null,
                heading: null,
                order: nextDocument.files?.length || 0,
            },
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

    if (oldPath !== file.path) {
        const previousHiddenKeys = parseEditorHiddenFilesMetadataValue(nextDocument.metadata?.editor_hidden_files).keys;
        const oldHiddenKey = normalizeEditorHiddenFileKey(`file:${oldPath}`);
        const nextHiddenKey = normalizeEditorHiddenFileKey(`file:${file.path}`);

        if (oldHiddenKey && nextHiddenKey && previousHiddenKeys.includes(oldHiddenKey)) {
            const remappedHiddenKeys = previousHiddenKeys.map((key) => key === oldHiddenKey ? nextHiddenKey : key);
            return updateDocumentHiddenFiles(nextDocument, remappedHiddenKeys);
        }
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

export function updateExampleEditorialMetadata(documentModel, updates = {}) {
    const nextDocument = cloneExampleDocument(documentModel);
    const metadata = {
        ...(nextDocument.metadata || {}),
    };

    if (Object.prototype.hasOwnProperty.call(updates, 'description')) {
        const normalizedDescription = normalizeExampleDescriptionMetadataValue(updates.description);
        if (normalizedDescription) metadata.example_description = normalizedDescription;
        else delete metadata.example_description;
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'tags')) {
        const normalizedTags = parseExampleTagsMetadataValue(updates.tags).normalizedValue;
        if (normalizedTags) metadata.example_tags = normalizedTags;
        else delete metadata.example_tags;
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'rating')) {
        const normalizedRating = parseExampleRatingValue(updates.rating);
        if (normalizedRating) metadata.example_rating = normalizedRating;
        else delete metadata.example_rating;
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'importance')) {
        const normalizedImportance = parseExampleImportanceValue(updates.importance);
        if (normalizedImportance) metadata.example_importance = normalizedImportance;
        else delete metadata.example_importance;
    }

    nextDocument.metadata = metadata;
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

export { createEmptyExampleDocument };

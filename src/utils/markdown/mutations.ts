// The edits the editor makes to an example document: file content, type (badge), path/language/role,
// add/duplicate/remove a file, the entry file, the shader uniforms/textures/resolution, the editorial
// metadata and the hidden files. Called by src/components/Editor.ts and its mixins
// (editor/fileOperations.ts, metadataDialogs.ts, shaderDialogs.ts, theoryEditor.ts); re-exported by
// src/utils/markdown.ts.
//
// Every function takes a document and returns a new one; the input is never modified (each starts from
// `cloneExampleDocument()`). Apart from `updateDocumentFileContent()`, which only resynchronizes, an
// applied edit rebuilds the Markdown and parses it again (`reparseDocument()`), so the result has fresh
// diagnostics, canonical metadata and file ids, and ids of other files may change (find files by path
// afterwards). An edit that cannot apply (unknown file id, wrong document format, empty path or
// language) returns the clone unchanged, without reparsing.

import { getBlockDefinition } from '../../config/exampleBlocks.ts';
import type {
    DocumentFileDetailsUpdate,
    ExampleDocument,
    ExampleDocumentInput,
    ExampleEditorialUpdate,
    NewDocumentFile,
    ShaderResolutionInput,
    ShaderTextureDraft,
    ShaderUniformDraft,
} from '../../types/document.ts';
import { SHADER_BLOCK_TYPES } from './constants.ts';
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
} from './core.ts';
import {
    cloneExampleDocument,
    createEmptyExampleDocument,
    parseExampleDocument,
    synchronizeDocument,
    buildExampleDocument,
    getDocumentEntryCandidates,
    getDocumentFileVisibilityEntries,
} from './documentApi.ts';
import { isShaderDocument } from './documentMeta.ts';
import {
    normalizeResolutionMetadataValue,
    normalizeEditorHiddenFileKey,
    parseEditorHiddenFilesMetadataValue,
    serializeShaderTextureDeclaration,
    serializeShaderUniformDeclaration,
} from './shader.ts';
import { evaluateDocumentFileTypeChange } from './fileTypeChange.ts';

/** Serializes the document to Markdown and parses it back: normalizes it and recomputes its diagnostics. */
function reparseDocument(documentModel: ExampleDocument): ExampleDocument {
    return parseExampleDocument(buildExampleDocument(synchronizeDocument(documentModel)));
}

/**
 * Replaces the content of one file (legacy files write through to their block). The cheap path used on
 * every keystroke: it resynchronizes but does not reparse, so `diagnostics` are the previous ones.
 */
export function updateDocumentFileContent(
    documentModel: ExampleDocumentInput | null | undefined,
    fileId: string,
    content: string,
): ExampleDocument {
    const nextDocument = cloneExampleDocument(documentModel);
    const file = nextDocument.files.find((entry) => entry.id === fileId);
    if (!file) return nextDocument;

    file.content = content;
    return synchronizeDocument(nextDocument);
}

/**
 * Switches a file to another language when `evaluateDocumentFileTypeChange()` allows it: a virtual file
 * gets the new language and the path with the matching extension (entry metadata and hidden-file keys
 * follow it); a legacy block is rebuilt with the new type and its canonical heading, keeping its content.
 * A blocked change returns the document resynchronized but otherwise unchanged.
 */
export function updateDocumentFileType(
    documentModel: ExampleDocumentInput | null | undefined,
    fileId: string,
    nextType: string,
): ExampleDocument {
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

/**
 * Adds a file. Virtual files are appended with `options.path` (role `entry` takes over `metadata.entry`
 * and removes the role from the previous entry file). Legacy documents get a new block of
 * `options.language`; a shader block also sets `renderer: shader` (and `resolution: 800x600` when
 * missing), a JSX/TSX block sets `framework: react` when no framework is declared. Paths are not checked
 * for duplicates here: callers check first, and the reparse reports what slips through.
 */
export function createDocumentFile(
    documentModel: ExampleDocumentInput | null | undefined,
    options: NewDocumentFile = {},
): ExampleDocument {
    const nextDocument = cloneExampleDocument(documentModel);
    const language = normalizeBlockType(options.language || '');

    if (!language) return nextDocument;

    if (nextDocument.sourceFormat === 'virtual-files') {
        const path = normalizeVirtualPath(options.path || '');
        if (!path) return nextDocument;

        const role = String(options.role || '')
            .trim()
            .toLowerCase();
        const nextFiles = (nextDocument.files || []).map((entry) =>
            role === 'entry' && entry.role === 'entry' ? { ...entry, role: '' } : entry,
        );
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
            `${language}-${nextDocument.blocks?.length || 0}`,
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

/**
 * Changes the path, language and/or role of a virtual file (no-op for legacy documents). `metadata.entry`
 * follows a renamed entry file, role `entry` moves the entry to this file, and the file's
 * `editor_hidden_files` key is renamed with it. The language is not checked against the path: use
 * `updateDocumentFileType()` for a validated badge change.
 */
export function updateDocumentFileDetails(
    documentModel: ExampleDocumentInput | null | undefined,
    fileId: string,
    updates: DocumentFileDetailsUpdate = {},
): ExampleDocument {
    const nextDocument = cloneExampleDocument(documentModel);
    if (nextDocument.sourceFormat !== 'virtual-files') return nextDocument;

    const file = nextDocument.files.find((entry) => entry.id === fileId);
    if (!file) return nextDocument;

    const oldPath = file.path;
    const nextPath = normalizeVirtualPath(updates.path || file.path);
    const nextLanguage = normalizeBlockType(updates.language || file.language);
    const nextRole = String(updates.role ?? file.role ?? '')
        .trim()
        .toLowerCase();

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
            const remappedHiddenKeys = previousHiddenKeys.map((key) => (key === oldHiddenKey ? nextHiddenKey : key));
            return updateDocumentHiddenFiles(nextDocument, remappedHiddenKeys);
        }
    }

    return reparseDocument(nextDocument);
}

/**
 * Inserts a copy right after the file: a virtual file gets a free `-copy` path (and loses role `entry`),
 * a legacy block is copied with its heading. Duplicate blocks of one slot are then reported by validation.
 */
export function duplicateDocumentFile(
    documentModel: ExampleDocumentInput | null | undefined,
    fileId: string,
): ExampleDocument {
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
            `${sourceBlock.type}-${nextDocument.blocks.length}`,
        ),
    );

    return reparseDocument(nextDocument);
}

/**
 * Removes a file (a legacy file removes its block). Removing the entry file of a virtual project moves
 * `metadata.entry` to the first remaining entry candidate, or deletes it when there is none.
 */
export function removeDocumentFile(
    documentModel: ExampleDocumentInput | null | undefined,
    fileId: string,
): ExampleDocument {
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

/** Sets `metadata.entry` of a virtual-files document (an empty path deletes it); no-op for legacy documents. The path need not exist. */
export function setDocumentEntryPath(
    documentModel: ExampleDocumentInput | null | undefined,
    entryPath: string = '',
): ExampleDocument {
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

/**
 * Replaces `shader_uniforms` with the dialog's list (drafts without a name or a known type are skipped;
 * an empty list deletes the key). Does not check that the document is a shader document.
 */
export function updateShaderUniformDefinitions(
    documentModel: ExampleDocumentInput | null | undefined,
    uniforms: ShaderUniformDraft[] = [],
): ExampleDocument {
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

/**
 * Replaces `shader_textures` with the dialog's list (invalid drafts are skipped; an empty list deletes the
 * key). Does not check that the document is a shader document.
 */
export function updateShaderTextureDefinitions(
    documentModel: ExampleDocumentInput | null | undefined,
    textures: ShaderTextureDraft[] = [],
): ExampleDocument {
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

/**
 * Sets the `resolution` of a shader document from the preview's size controls (values rounded). Returns
 * the clone unchanged for a non-shader document or a missing, non-numeric or non-positive size.
 */
export function updateShaderResolution(
    documentModel: ExampleDocumentInput | null | undefined,
    resolution: ShaderResolutionInput | null = null,
): ExampleDocument {
    const nextDocument = cloneExampleDocument(documentModel);
    if (!isShaderDocument(nextDocument)) return nextDocument;

    // `Number.isFinite()` is only true for a number, so `resolution` is set in the first branch; in the
    // second, `parseInt` stringifies whatever it gets (`undefined` and other non-text give NaN).
    const width = Number.isFinite(resolution?.width)
        ? (resolution!.width as number)
        : Number.parseInt(resolution?.width as string, 10);
    const height = Number.isFinite(resolution?.height)
        ? (resolution!.height as number)
        : Number.parseInt(resolution?.height as string, 10);

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        return nextDocument;
    }

    nextDocument.metadata = {
        ...(nextDocument.metadata || {}),
        resolution: normalizeResolutionMetadataValue(`${Math.round(width)}x${Math.round(height)}`),
    };

    return reparseDocument(nextDocument);
}

/**
 * Applies the example metadata dialog: only the keys present in `updates` change; each value is
 * normalized like the parser does, and an empty or invalid value deletes its key.
 */
export function updateExampleEditorialMetadata(
    documentModel: ExampleDocumentInput | null | undefined,
    updates: ExampleEditorialUpdate = {},
): ExampleDocument {
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

/**
 * Replaces `editor_hidden_files` with the given visibility keys, normalized and de-duplicated; keys that
 * match no file of the document are dropped, and an empty result deletes the key.
 */
export function updateDocumentHiddenFiles(
    documentModel: ExampleDocumentInput | null | undefined,
    hiddenKeys: string[] = [],
): ExampleDocument {
    const nextDocument = cloneExampleDocument(documentModel);
    const visibilityEntries = getDocumentFileVisibilityEntries(nextDocument);
    const validKeys = new Set(visibilityEntries.map((entry) => entry.key).filter(Boolean));
    const requestedKeys = Array.isArray(hiddenKeys) ? hiddenKeys : [];
    const normalizedKeys = Array.from(
        new Set(
            requestedKeys
                .map((entry) => normalizeEditorHiddenFileKey(entry))
                .filter((entry) => entry && validKeys.has(entry)),
        ),
    );
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

// Duplicate of documentApi.ts's export (src/utils/markdown.ts re-exports that one); nothing imports it from here.
export { createEmptyExampleDocument };

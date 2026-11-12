export {
    LEGACY_DEFAULT_BLOCK_LANGUAGE_OPTIONS,
    SHADER_BLOCK_LANGUAGE_OPTIONS,
    LEGACY_REACT_BLOCK_LANGUAGE_OPTIONS,
    LEGACY_VUE_BLOCK_LANGUAGE_OPTIONS,
    REACT_MULTI_FILE_LANGUAGE_OPTIONS,
    REACT_MULTI_FILE_ENTRY_LANGUAGE_OPTIONS,
    VUE_MULTI_FILE_LANGUAGE_OPTIONS,
    VUE_MULTI_FILE_ENTRY_LANGUAGE_OPTIONS,
    VIRTUAL_FILE_ROLE_OPTIONS,
} from './markdown/constants.ts';

export { getExpectedPathForLanguage } from './markdown/core.ts';

export {
    getExerciseConfig,
    getExampleStage,
    getExampleEditorialMetadata,
    getShaderConfig,
    isShaderDocument,
    getDocumentFileVisibilityKey,
} from './markdown/documentMeta.ts';

export {
    createEmptyExampleDocument,
    synchronizeDocument,
    getDocumentFileVisibilityEntries,
    getHiddenFileVisibilityKeys,
    getDocumentLanguageOptions,
    getDocumentEntryCandidates,
    createExampleDocumentFromPreset,
    cloneExampleDocument,
    parseExampleDocument,
    buildExampleDocument,
    hasBlockingDiagnostics,
} from './markdown/documentApi.ts';

export {
    evaluateDocumentFileTypeChange,
    getDocumentFileTypeChangeOptions,
} from './markdown/fileTypeChange.ts';

export {
    updateDocumentFileContent,
    updateDocumentFileType,
    createDocumentFile,
    updateDocumentFileDetails,
    duplicateDocumentFile,
    removeDocumentFile,
    setDocumentEntryPath,
    updateShaderUniformDefinitions,
    updateShaderTextureDefinitions,
    updateShaderResolution,
    updateExampleEditorialMetadata,
    updateDocumentHiddenFiles,
} from './markdown/mutations.ts';

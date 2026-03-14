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
} from './markdown/constants.js';

export { getExpectedPathForLanguage } from './markdown/core.js';

export {
    getExerciseConfig,
    getExampleStage,
    getExampleEditorialMetadata,
    getShaderConfig,
    isShaderDocument,
    getDocumentFileVisibilityKey,
} from './markdown/documentMeta.js';

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
} from './markdown/documentApi.js';

export {
    evaluateDocumentFileTypeChange,
    getDocumentFileTypeChangeOptions,
} from './markdown/fileTypeChange.js';

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
} from './markdown/mutations.js';

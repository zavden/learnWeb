// File-type ("badge") changes: which languages a file of a document may switch to, and whether a given
// switch is allowed, with the reason shown to the user when it is not. Used by the editor's "change
// badge" dialog (src/components/editor/metadataDialogs.ts) and by `updateDocumentFileType()`
// (mutations.ts), which applies an allowed change. Reads the language tables of constants.ts and the
// language/path helpers of core.ts.
//
// The rules depend on the context (`FileTypeChangeContext`): a file only moves inside its family (markup,
// style, script, app, JSON, Vue SFC) and inside the languages its framework, role and entry status allow.
// Shader blocks never change, a locked exercise file never changes, and a virtual file whose new
// extension would collide with another file's path is blocked. Every check is pure: nothing here edits
// the document.

import type {
    ExampleDocument,
    ExampleDocumentInput,
    FileTypeChangeContext,
    FileTypeChangeEvaluation,
    FileTypeChangeOption,
    VirtualFile,
} from '../../types/document.ts';
import {
    LEGACY_APP_LANGUAGE_OPTIONS,
    LEGACY_MARKUP_LANGUAGE_OPTIONS,
    LEGACY_SCRIPT_LANGUAGE_OPTIONS,
    LEGACY_STYLE_LANGUAGE_OPTIONS,
    REACT_MULTI_FILE_CODE_LANGUAGE_OPTIONS,
    REACT_MULTI_FILE_CODE_ROLES,
    REACT_MULTI_FILE_ENTRY_LANGUAGES,
    REACT_MULTI_FILE_LANGUAGES,
    SHADER_BLOCK_TYPES,
    SHADER_BLOCK_LANGUAGE_OPTIONS,
    VUE_MULTI_FILE_CODE_LANGUAGE_OPTIONS,
    VUE_MULTI_FILE_CODE_ROLES,
    VUE_MULTI_FILE_ENTRY_LANGUAGES,
    VUE_MULTI_FILE_LANGUAGES,
    VUE_MULTI_FILE_SFC_ROLES,
} from './constants.ts';
import {
    dedupeNormalizedLanguageOptions,
    getExpectedExtensions,
    getExpectedPathForLanguage,
    getLanguageLabel,
    getLegacyLanguageFamily,
    getVirtualLanguageFamily,
    isDocumentEntryFile,
    normalizeBlockType,
    normalizeVirtualPath,
} from './core.ts';
import { synchronizeDocument } from './documentApi.ts';
import { getExerciseConfig } from './documentMeta.ts';

/** Options of `getDocumentFileTypeChangeOptions()`. */
export interface FileTypeChangeOptionsQuery {
    /** List the file's current language too (default `true`). */
    includeCurrent?: boolean;
}

/** Which rule set applies to the document: shader, React/Vue/plain virtual files, or React/Vue/plain legacy blocks. */
function getDocumentFileTypeChangeContext(documentModel: ExampleDocumentInput | null | undefined, file: VirtualFile | null | undefined): FileTypeChangeContext {
    const document = synchronizeDocument(documentModel);
    const framework = String(document.metadata?.framework || '').trim().toLowerCase();
    const rendererMode = String(document.rendererMode || '').trim().toLowerCase();

    if (rendererMode === 'shader') {
        return 'shader';
    }

    if (document.sourceFormat === 'virtual-files') {
        if (framework === 'react') return 'react-virtual';
        if (framework === 'vue') return 'vue-virtual';
        return 'virtual-generic';
    }

    if (framework === 'react') return 'react-legacy';
    if (framework === 'vue') return 'vue-legacy';
    return 'legacy';
}

/**
 * Candidate languages of a virtual file: decided by the framework and the file's role and entry status
 * first, then by its language family. `[]` when the file cannot change at all (React markup or asset roles,
 * Vue assets, a `.vue` file without an SFC role).
 */
function getVirtualRoleConstrainedCandidateLanguages(documentModel: ExampleDocumentInput | null | undefined, file: VirtualFile | null | undefined): string[] {
    const document = synchronizeDocument(documentModel);
    const framework = String(document.metadata?.framework || '').trim().toLowerCase();
    const role = String(file?.role || '').trim().toLowerCase();
    const currentType = normalizeBlockType(file?.blockType || file?.language || '');
    const virtualFamily = getVirtualLanguageFamily(currentType);
    const isEntry = isDocumentEntryFile(document, file);

    if (framework === 'react') {
        if (role === 'asset' || role === 'markup') return [];
        if (isEntry) return [...REACT_MULTI_FILE_ENTRY_LANGUAGES];
        if (role === 'style') return [...LEGACY_STYLE_LANGUAGE_OPTIONS];
        if (role === 'config') return ['json'];
        if (REACT_MULTI_FILE_CODE_ROLES.has(role)) return [...REACT_MULTI_FILE_CODE_LANGUAGE_OPTIONS];
    }

    if (framework === 'vue') {
        if (role === 'asset') return [];
        if (isEntry) return [...VUE_MULTI_FILE_ENTRY_LANGUAGES];
        if (role === 'style') return [...LEGACY_STYLE_LANGUAGE_OPTIONS];
        if (role === 'config') return ['json'];
        if (role === 'markup') return ['html'];
        if (currentType === 'vue') {
            return VUE_MULTI_FILE_SFC_ROLES.has(role) ? ['vue'] : [];
        }
        if (VUE_MULTI_FILE_SFC_ROLES.has(role) || VUE_MULTI_FILE_CODE_ROLES.has(role)) {
            return [...VUE_MULTI_FILE_CODE_LANGUAGE_OPTIONS];
        }
    }

    if (virtualFamily === 'style') return [...LEGACY_STYLE_LANGUAGE_OPTIONS];
    if (virtualFamily === 'json') return ['json'];
    if (virtualFamily === 'markup') return ['html'];
    if (currentType === 'vue') return ['vue'];

    return [...REACT_MULTI_FILE_CODE_LANGUAGE_OPTIONS];
}

/** The languages a file may switch to in its context, its current language included. */
function getDocumentFileTypeChangeCandidates(documentModel: ExampleDocumentInput | null | undefined, file: VirtualFile | null | undefined): string[] {
    const document = synchronizeDocument(documentModel);
    const context = getDocumentFileTypeChangeContext(document, file);
    const currentType = normalizeBlockType(file?.blockType || file?.language || '');
    const legacyFamily = getLegacyLanguageFamily(currentType);

    if (context === 'shader') {
        return [...SHADER_BLOCK_LANGUAGE_OPTIONS];
    }

    if (context === 'react-legacy') {
        return legacyFamily === 'style'
            ? [...LEGACY_STYLE_LANGUAGE_OPTIONS]
            : [...LEGACY_APP_LANGUAGE_OPTIONS];
    }

    if (context === 'vue-legacy') {
        if (legacyFamily === 'style') return [...LEGACY_STYLE_LANGUAGE_OPTIONS];
        if (legacyFamily === 'script') return [...LEGACY_SCRIPT_LANGUAGE_OPTIONS];
        return ['html'];
    }

    if (context === 'legacy') {
        if (legacyFamily === 'style') return [...LEGACY_STYLE_LANGUAGE_OPTIONS];
        if (legacyFamily === 'script') return [...LEGACY_SCRIPT_LANGUAGE_OPTIONS];
        if (legacyFamily === 'app') return [...LEGACY_APP_LANGUAGE_OPTIONS];
        return [...LEGACY_MARKUP_LANGUAGE_OPTIONS];
    }

    return getVirtualRoleConstrainedCandidateLanguages(document, file);
}

function buildBlockedFileTypeChangeResult(baseResult: FileTypeChangeEvaluation, code: string, reason: string): FileTypeChangeEvaluation {
    return {
        ...baseResult,
        allowed: false,
        code,
        reason,
    };
}

/** Blocked with `incompatible-target-type`; the reason lists the labels of the languages that are possible. */
function buildIncompatibleFileTypeChangeResult(document: ExampleDocument, file: VirtualFile, baseResult: FileTypeChangeEvaluation): FileTypeChangeEvaluation {
    const candidateLanguages = getDocumentFileTypeChangeCandidates(document, file);
    const candidateLabels = candidateLanguages.map((language) => getLanguageLabel(language)).join(', ');

    return buildBlockedFileTypeChangeResult(
        baseResult,
        'incompatible-target-type',
        candidateLabels
            ? `This file can only switch between: ${candidateLabels}.`
            : 'This file cannot change to that badge in the current document.'
    );
}

/** The checks every context ends with: the target must be a candidate, and a renamed virtual file must not take another file's path. */
function finalizeDocumentFileTypeChangeResult(document: ExampleDocument, file: VirtualFile, baseResult: FileTypeChangeEvaluation): FileTypeChangeEvaluation {
    const candidateLanguages = getDocumentFileTypeChangeCandidates(document, file);

    if (!candidateLanguages.includes(baseResult.nextType)) {
        return buildIncompatibleFileTypeChangeResult(document, file, baseResult);
    }

    if (file?.sourceKind === 'virtual' && baseResult.expectedPath) {
        const collidingFile = (document.files || []).find((entry) => (
            entry.id !== file.id && normalizeVirtualPath(entry.path) === baseResult.expectedPath
        ));

        if (collidingFile) {
            return buildBlockedFileTypeChangeResult(
                baseResult,
                'file-type-change-path-collision',
                `Changing this file to ${getLanguageLabel(baseResult.nextType)} would rename it to "${baseResult.expectedPath}", but that path already exists.`
            );
        }
    }

    return {
        ...baseResult,
        allowed: true,
    };
}

/**
 * Whether the file `fileId` may switch to `nextType` (any alias), and what would change: the normalized
 * types, the expected extensions and, for virtual files, the new path. A blocked change carries a stable
 * `code` and a user-facing `reason`. The exercise lock and the shader rule are checked before the
 * family rules.
 */
export function evaluateDocumentFileTypeChange(documentModel: ExampleDocumentInput | null | undefined, fileId: string, nextType: string = ''): FileTypeChangeEvaluation {
    const document = synchronizeDocument(documentModel);
    const file = (document.files || []).find((entry) => entry.id === fileId);
    const normalizedNextType = normalizeBlockType(nextType);
    const currentType = normalizeBlockType(file?.blockType || file?.language || '');
    const context = getDocumentFileTypeChangeContext(document, file);
    const expectedExtensions = getExpectedExtensions(normalizedNextType);
    const expectedPath = file?.sourceKind === 'virtual'
        ? getExpectedPathForLanguage(file.path, normalizedNextType)
        : '';
    const baseResult: FileTypeChangeEvaluation = {
        allowed: false,
        code: '',
        context,
        currentType,
        expectedExtensions: [...expectedExtensions],
        expectedPath,
        file: file || null,
        nextType: normalizedNextType,
        reason: '',
        wouldChangePath: Boolean(expectedPath) && expectedPath !== file?.path,
    };

    if (!file) {
        return buildBlockedFileTypeChangeResult(
            baseResult,
            'file-not-found',
            'The selected file no longer exists in the current document.'
        );
    }

    if (!normalizedNextType) {
        return buildBlockedFileTypeChangeResult(
            baseResult,
            'invalid-target-type',
            'Choose a valid target badge before applying the change.'
        );
    }

    const exercise = getExerciseConfig(document);
    const normalizedFilePath = normalizeVirtualPath(file.path || '');
    if (exercise.enabled && normalizedFilePath && exercise.lockedFiles.includes(normalizedFilePath)) {
        return buildBlockedFileTypeChangeResult(
            baseResult,
            'exercise-file-type-change-locked',
            `The file "${normalizedFilePath}" is locked by the current exercise and its badge cannot be changed.`
        );
    }

    if (context === 'shader') {
        if (normalizedNextType === currentType) {
            return {
                ...baseResult,
                allowed: true,
            };
        }

        return buildBlockedFileTypeChangeResult(
            baseResult,
            'shader-block-change-not-supported',
            'Shader blocks must keep exactly one Vertex and one Fragment block, so this badge cannot be changed here.'
        );
    }

    if (document.sourceFormat === 'legacy-blocks') {
        const candidateLanguages = getDocumentFileTypeChangeCandidates(document, file);

        if (normalizedNextType === 'html-full' && (document.blocks || []).length > 1) {
            return buildBlockedFileTypeChangeResult(
                baseResult,
                'html-full-must-stand-alone',
                'HTML-FULL must be the only block in the document. Remove the other blocks first.'
            );
        }

        if (!candidateLanguages.includes(normalizedNextType)) {
            return buildIncompatibleFileTypeChangeResult(document, file, baseResult);
        }

        return finalizeDocumentFileTypeChangeResult(document, file, baseResult);
    }

    const framework = String(document.metadata?.framework || '').trim().toLowerCase();
    const isEntry = isDocumentEntryFile(document, file);
    const virtualFamily = getVirtualLanguageFamily(currentType);
    const role = String(file?.role || '').trim().toLowerCase();

    if (framework === 'react') {
        if (role === 'markup') {
            return buildBlockedFileTypeChangeResult(baseResult, 'react-markup-role-not-supported', 'React multi-file examples do not support files with role `markup`. Change the role first or remove this file.');
        }

        if (role === 'asset') {
            return buildBlockedFileTypeChangeResult(baseResult, 'react-asset-role-not-supported', 'Virtual asset files are not supported for React multi-file examples. Keep binary assets in the topic-level assets/ folder.');
        }

        if (!REACT_MULTI_FILE_LANGUAGES.has(normalizedNextType)) {
            return buildBlockedFileTypeChangeResult(baseResult, 'unsupported-react-target-language', `React multi-file examples do not support "${getLanguageLabel(normalizedNextType)}" files.`);
        }

        if (isEntry && !REACT_MULTI_FILE_ENTRY_LANGUAGES.has(normalizedNextType)) {
            return buildBlockedFileTypeChangeResult(baseResult, 'invalid-react-entry-target-language', 'React entry files can only use JSX, TSX, JavaScript or TypeScript.');
        }

        if (virtualFamily === 'style' && !LEGACY_STYLE_LANGUAGE_OPTIONS.includes(normalizedNextType)) {
            return buildBlockedFileTypeChangeResult(baseResult, 'react-style-family-only', 'Style files can only switch between CSS, SCSS and SASS.');
        }

        if (role === 'config' && normalizedNextType !== 'json') {
            return buildBlockedFileTypeChangeResult(baseResult, 'react-config-role-json-only', 'Files with role `config` can only use JSON in React multi-file examples.');
        }

        if (virtualFamily === 'json' && normalizedNextType !== 'json') {
            return buildBlockedFileTypeChangeResult(baseResult, 'react-json-family-only', 'JSON virtual files can only stay JSON.');
        }

        if (
            role !== 'config'
            && virtualFamily !== 'style'
            && virtualFamily !== 'json'
            && !REACT_MULTI_FILE_CODE_LANGUAGE_OPTIONS.includes(normalizedNextType)
        ) {
            return buildBlockedFileTypeChangeResult(baseResult, 'react-code-family-only', 'React source files can only switch between JSX, TSX, JavaScript and TypeScript.');
        }

        return finalizeDocumentFileTypeChangeResult(document, file, baseResult);
    }

    if (framework === 'vue') {
        if (role === 'asset') {
            return buildBlockedFileTypeChangeResult(baseResult, 'vue-asset-role-not-supported', 'Virtual asset files are not supported for Vue multi-file examples. Keep binary assets in the topic-level assets/ folder.');
        }

        if (!VUE_MULTI_FILE_LANGUAGES.has(normalizedNextType)) {
            return buildBlockedFileTypeChangeResult(baseResult, 'unsupported-vue-target-language', `Vue multi-file examples do not support "${getLanguageLabel(normalizedNextType)}" files.`);
        }

        if (isEntry && !VUE_MULTI_FILE_ENTRY_LANGUAGES.has(normalizedNextType)) {
            return buildBlockedFileTypeChangeResult(baseResult, 'invalid-vue-entry-target-language', 'Vue entry files can only use JavaScript or TypeScript.');
        }

        if (currentType === 'vue' && normalizedNextType !== 'vue') {
            return buildBlockedFileTypeChangeResult(baseResult, 'vue-sfc-conversion-not-supported', 'Vue SFC files can only stay .vue from this editor.');
        }

        if (VUE_MULTI_FILE_SFC_ROLES.has(role) && currentType !== 'vue' && normalizedNextType === 'vue') {
            return buildBlockedFileTypeChangeResult(baseResult, 'vue-sfc-upgrade-not-supported', 'Converting a JavaScript or TypeScript module directly into a Vue SFC is not supported yet. Create a new .vue file instead.');
        }

        if (role === 'markup' && normalizedNextType !== 'html') {
            return buildBlockedFileTypeChangeResult(baseResult, 'vue-markup-family-only', 'Vue render-template files must stay HTML.');
        }

        if (role === 'style' && !LEGACY_STYLE_LANGUAGE_OPTIONS.includes(normalizedNextType)) {
            return buildBlockedFileTypeChangeResult(baseResult, 'vue-style-family-only', 'Style files can only switch between CSS, SCSS and SASS.');
        }

        if (role === 'config' && normalizedNextType !== 'json') {
            return buildBlockedFileTypeChangeResult(baseResult, 'vue-config-role-json-only', 'Files with role `config` can only use JSON in Vue multi-file examples.');
        }

        if (virtualFamily === 'json' && normalizedNextType !== 'json') {
            return buildBlockedFileTypeChangeResult(baseResult, 'vue-json-family-only', 'JSON virtual files can only stay JSON.');
        }

        if (currentType === 'vue' && !VUE_MULTI_FILE_SFC_ROLES.has(role)) {
            return buildBlockedFileTypeChangeResult(baseResult, 'vue-sfc-role-not-supported', 'Only app, component or page files can stay as Vue SFCs in this editor.');
        }

        if (
            role !== 'config'
            && role !== 'style'
            && role !== 'markup'
            && virtualFamily !== 'style'
            && virtualFamily !== 'json'
            && virtualFamily !== 'markup'
            && currentType !== 'vue'
            && !VUE_MULTI_FILE_CODE_LANGUAGE_OPTIONS.includes(normalizedNextType)
        ) {
            return buildBlockedFileTypeChangeResult(baseResult, 'vue-code-family-only', 'Vue source files can only switch between JavaScript and TypeScript.');
        }

        return finalizeDocumentFileTypeChangeResult(document, file, baseResult);
    }

    return finalizeDocumentFileTypeChangeResult(document, file, baseResult);
}

/**
 * The entries of the "change badge" menu of a file: every candidate language with its evaluation, so
 * blocked entries can be shown disabled with their reason. `[]` when the file does not exist or has no
 * candidate language.
 */
export function getDocumentFileTypeChangeOptions(documentModel: ExampleDocumentInput | null | undefined, fileId: string, options: FileTypeChangeOptionsQuery = {}): FileTypeChangeOption[] {
    const document = synchronizeDocument(documentModel);
    const file = (document.files || []).find((entry) => entry.id === fileId);
    if (!file) return [];

    const includeCurrent = options.includeCurrent !== false;
    const candidateLanguages = dedupeNormalizedLanguageOptions(
        getDocumentFileTypeChangeCandidates(document, file)
    );
    const currentType = normalizeBlockType(file.blockType || file.language || '');

    return candidateLanguages
        .filter((language) => includeCurrent || language !== currentType)
        .map((language) => {
            const result = evaluateDocumentFileTypeChange(document, fileId, language);

            return {
                allowed: result.allowed,
                code: result.code,
                expectedExtensions: [...result.expectedExtensions],
                expectedPath: result.expectedPath,
                label: getLanguageLabel(language),
                reason: result.reason,
                value: language,
                wouldChangePath: result.wouldChangePath,
            };
        });
}

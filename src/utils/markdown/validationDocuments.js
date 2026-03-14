import {
    REACT_APP_BLOCK_TYPES,
    REACT_MULTI_FILE_ENTRY_LANGUAGES,
    REACT_MULTI_FILE_LANGUAGES,
    SHADER_BLOCK_TYPES,
    VUE_MULTI_FILE_ENTRY_LANGUAGES,
    VUE_MULTI_FILE_LANGUAGES,
} from './constants.js';
import { createDiagnostic, normalizeVirtualPath } from './core.js';
import { getDocumentFileVisibilityKey, getExerciseConfig, inferRendererMode } from './documentMeta.js';
import { parseEditorHiddenFilesMetadataValue, parseShaderResolutionValue } from './shader.js';
import { validateVirtualFileShape } from './validationMetadata.js';

export function validateShaderLegacyDocument(blocks, metadata, diagnostics) {
    const vertexBlocks = blocks.filter((block) => block.type === 'vertex');
    const fragmentBlocks = blocks.filter((block) => block.type === 'fragment');
    const extraBlocks = blocks.filter((block) => !SHADER_BLOCK_TYPES.has(block.type));
    const parsedResolution = parseShaderResolutionValue(metadata.resolution);

    if (metadata.renderer === 'web') {
        diagnostics.push(createDiagnostic('error', 'renderer-metadata-conflicts-with-shader-blocks', 'Renderer "web" conflicts with shader blocks. Remove `renderer: web` or remove the shader blocks.', { renderer: metadata.renderer }));
    }

    if (vertexBlocks.length === 0) diagnostics.push(createDiagnostic('error', 'missing-shader-vertex', 'Shader examples must contain exactly one Vertex block.'));
    if (vertexBlocks.length > 1) diagnostics.push(createDiagnostic('error', 'multiple-shader-vertex-blocks', 'Shader examples cannot contain more than one Vertex block.'));
    if (fragmentBlocks.length === 0) diagnostics.push(createDiagnostic('error', 'missing-shader-fragment', 'Shader examples must contain exactly one Fragment block.'));
    if (fragmentBlocks.length > 1) diagnostics.push(createDiagnostic('error', 'multiple-shader-fragment-blocks', 'Shader examples cannot contain more than one Fragment block.'));

    if (extraBlocks.length > 0) {
        diagnostics.push(createDiagnostic('error', 'shader-extra-blocks-not-allowed', `Shader examples only support Vertex and Fragment blocks for now. Found extra block types: ${extraBlocks.map((block) => block.type).join(', ')}.`, { blockTypes: extraBlocks.map((block) => block.type) }));
    }

    if (!Object.prototype.hasOwnProperty.call(metadata, 'resolution') || !String(metadata.resolution || '').trim()) {
        diagnostics.push(createDiagnostic('error', 'missing-shader-resolution', 'Shader examples must declare `resolution: WIDTHxHEIGHT` in frontmatter.'));
    } else if (!parsedResolution) {
        const hasExistingDiagnostic = diagnostics.some((diagnostic) => diagnostic.code === 'invalid-shader-resolution');
        if (!hasExistingDiagnostic) {
            diagnostics.push(createDiagnostic('error', 'invalid-shader-resolution', 'Shader examples must use `resolution: WIDTHxHEIGHT` with positive integers.', { value: metadata.resolution }));
        }
    }
}

export function validateLegacyDocument(blocks, metadata, diagnostics) {
    if (inferRendererMode({ blocks, metadata, sourceFormat: 'legacy-blocks' }) === 'shader') {
        validateShaderLegacyDocument(blocks, metadata, diagnostics);
        return;
    }

    const appBlocks = blocks.filter((block) => block.slot === 'app');
    const markupBlocks = blocks.filter((block) => block.slot === 'markup');
    const styleBlocks = blocks.filter((block) => block.slot === 'style');
    const scriptBlocks = blocks.filter((block) => block.slot === 'script');
    const framework = metadata.framework || '';
    const htmlFullBlock = markupBlocks.find((block) => block.type === 'html-full') || null;

    if (framework === 'react') {
        if (appBlocks.length === 0) diagnostics.push(createDiagnostic('error', 'missing-react-app', 'React examples must contain exactly one JSX or TSX block.'));
        if (appBlocks.length > 1) diagnostics.push(createDiagnostic('error', 'multiple-react-app-blocks', 'React examples cannot contain more than one JSX or TSX block.'));
        if (appBlocks.length === 1 && !REACT_APP_BLOCK_TYPES.has(appBlocks[0].type)) diagnostics.push(createDiagnostic('error', 'invalid-react-app-block', `React examples require a JSX or TSX block, not "${appBlocks[0].type}".`, { type: appBlocks[0].type }));
        if (markupBlocks.length > 0) diagnostics.push(createDiagnostic('error', 'react-does-not-use-markup-slot', 'React single-file examples cannot contain HTML, SVG or Pug blocks.'));
        if (scriptBlocks.length > 0) diagnostics.push(createDiagnostic('error', 'react-does-not-use-script-slot', 'React single-file examples cannot contain standalone JavaScript or TypeScript blocks.'));
    } else if (appBlocks.length > 0) {
        diagnostics.push(createDiagnostic('error', 'unexpected-app-block', 'JSX and TSX blocks require `framework: react` in frontmatter.'));
    }

    if (framework !== 'react') {
        if (markupBlocks.length === 0) diagnostics.push(createDiagnostic('error', 'missing-markup', 'Example must contain exactly one HTML, HTML-FULL, SVG or Pug block.'));
        if (markupBlocks.length > 1) diagnostics.push(createDiagnostic('error', 'multiple-markup', 'Example cannot contain more than one markup block.'));
    }

    if (framework === 'vue' && markupBlocks.length === 1 && markupBlocks[0].type !== 'html') {
        diagnostics.push(createDiagnostic('error', 'invalid-vue-template-block', `Vue single-file examples require an HTML block for the template, not "${markupBlocks[0].type}".`, { type: markupBlocks[0].type }));
    }

    if (htmlFullBlock) {
        if (styleBlocks.length > 0 || scriptBlocks.length > 0 || appBlocks.length > 0) diagnostics.push(createDiagnostic('error', 'html-full-must-stand-alone', 'HTML-FULL must be the only code block in the example. Put styles and scripts inside the document itself.', { type: 'html-full' }));
        if (!/(<!doctype\s+html|<html\b)/i.test(htmlFullBlock.content || '')) diagnostics.push(createDiagnostic('warning', 'html-full-missing-document-root', 'HTML-FULL should include <!DOCTYPE html> and an <html> root element.', { type: 'html-full' }));
        if (!/<body\b/i.test(htmlFullBlock.content || '')) diagnostics.push(createDiagnostic('warning', 'html-full-missing-body', 'HTML-FULL should include an explicit <body> element.', { type: 'html-full' }));
    }

    markupBlocks.filter((block) => block.type === 'html').forEach((block) => {
        if (!/(<!doctype|<html\b|<head\b|<body\b)/i.test(block.content || '')) return;
        diagnostics.push(createDiagnostic('warning', 'html-body-fragment-expected', 'HTML blocks are treated as body fragments. Do not include <!DOCTYPE>, <html>, <head> or <body>.', { type: block.type }));
    });

    if (styleBlocks.length > 1) diagnostics.push(createDiagnostic('error', 'multiple-style', 'Example cannot contain more than one style block.'));
    if (scriptBlocks.length > 1) diagnostics.push(createDiagnostic('error', 'multiple-script', 'Example cannot contain more than one script block.'));
}

export function validateVirtualDocument(files, metadata, diagnostics) {
    const framework = metadata.framework || '';
    const mode = metadata.mode || '';

    if (!['react', 'vue'].includes(framework)) diagnostics.push(createDiagnostic('error', 'virtual-files-framework-required', 'Virtual files are currently supported only for `framework: react` or `framework: vue`.', { framework }));
    if (framework === 'react' && mode && mode !== 'multi-file') diagnostics.push(createDiagnostic('error', 'react-virtual-mode-mismatch', 'React virtual-file examples must declare `mode: multi-file`.', { mode }));
    if (framework === 'vue' && mode && mode !== 'multi-file') diagnostics.push(createDiagnostic('error', 'vue-virtual-mode-mismatch', 'Vue virtual-file examples must declare `mode: multi-file`.', { mode }));

    const seenPaths = new Set();
    const entryRoleFiles = [];

    files.forEach((file) => {
        validateVirtualFileShape(file, diagnostics);

        if (seenPaths.has(file.path)) diagnostics.push(createDiagnostic('error', 'duplicate-file-path', `Duplicate file path "${file.path}" in multi-file document.`, { path: file.path }));
        seenPaths.add(file.path);

        if (framework === 'react' && !REACT_MULTI_FILE_LANGUAGES.has(file.language)) diagnostics.push(createDiagnostic('error', 'unsupported-react-file-language', `React multi-file examples do not support "${file.language}" in "${file.path}".`, { language: file.language, path: file.path }));
        if (framework === 'vue' && !VUE_MULTI_FILE_LANGUAGES.has(file.language)) diagnostics.push(createDiagnostic('error', 'unsupported-vue-file-language', `Vue multi-file examples do not support "${file.language}" in "${file.path}".`, { language: file.language, path: file.path }));
        if (file.role === 'asset') diagnostics.push(createDiagnostic('warning', 'virtual-asset-role-not-supported', `Virtual file "${file.path}" is marked as \`@role asset\`, but binary asset bundling is not supported yet. Keep local resources in the topic-level assets/ folder or use JSON virtual files for structured data.`, { path: file.path, role: file.role }));
        if (file.role === 'entry') entryRoleFiles.push(file);
    });

    if (entryRoleFiles.length > 1) diagnostics.push(createDiagnostic('error', 'multiple-entry-roles', 'Only one virtual file may declare `@role entry`.', { files: entryRoleFiles.map((file) => file.path) }));

    if (framework === 'react') {
        const entry = normalizeVirtualPath(metadata.entry || '');
        const entryFile = files.find((file) => file.path === entry) || null;

        if (!entry) diagnostics.push(createDiagnostic('error', 'missing-react-entry', 'React multi-file examples must declare `entry` in frontmatter.'));
        else if (!entryFile) diagnostics.push(createDiagnostic('error', 'missing-react-entry-file', `Entry file "${entry}" does not exist in this document.`, { entry }));
        else {
            if (!REACT_MULTI_FILE_ENTRY_LANGUAGES.has(entryFile.language)) diagnostics.push(createDiagnostic('error', 'invalid-react-entry-language', `React entry file "${entry}" must use JSX, TSX, JavaScript or TypeScript.`, { entry, language: entryFile.language }));
            if (entryRoleFiles.length === 1 && entryRoleFiles[0].path !== entry) diagnostics.push(createDiagnostic('warning', 'entry-role-mismatch', `Metadata entry "${entry}" does not match the file marked with \`@role entry\` ("${entryRoleFiles[0].path}").`, { entry, rolePath: entryRoleFiles[0].path }));
        }
    }

    if (framework === 'vue') {
        const entry = normalizeVirtualPath(metadata.entry || '');
        const entryFile = files.find((file) => file.path === entry) || null;

        if (!entry) diagnostics.push(createDiagnostic('error', 'missing-vue-entry', 'Vue multi-file examples must declare `entry` in frontmatter.'));
        else if (!entryFile) diagnostics.push(createDiagnostic('error', 'missing-vue-entry-file', `Entry file "${entry}" does not exist in this document.`, { entry }));
        else {
            if (!VUE_MULTI_FILE_ENTRY_LANGUAGES.has(entryFile.language)) diagnostics.push(createDiagnostic('error', 'invalid-vue-entry-language', `Vue entry file "${entry}" must use JavaScript or TypeScript.`, { entry, language: entryFile.language }));
            if (entryRoleFiles.length === 1 && entryRoleFiles[0].path !== entry) diagnostics.push(createDiagnostic('warning', 'entry-role-mismatch', `Metadata entry "${entry}" does not match the file marked with \`@role entry\` ("${entryRoleFiles[0].path}").`, { entry, rolePath: entryRoleFiles[0].path }));
        }
    }

    validateEditorHiddenFiles(files, metadata, diagnostics);
    validateExerciseDocument(files, metadata, diagnostics);
}

export function validateExerciseDocument(files, metadata, diagnostics) {
    const exercise = getExerciseConfig({ metadata });
    if (!exercise.enabled) return;

    const knownPaths = new Set((files || []).map((file) => file.path));
    const trackedLists = [
        ['exercise_locked_files', exercise.lockedFiles],
        ['exercise_reference_files', exercise.referenceFiles],
        ['exercise_solution_files', exercise.solutionFiles],
    ];

    exercise.comparePairs.forEach((pair) => {
        if (!knownPaths.has(pair.attemptPath)) diagnostics.push(createDiagnostic('warning', 'exercise-compare-file-not-found', `Exercise comparison references attempt file "${pair.attemptPath}", but that file does not exist in the document.`, { path: pair.attemptPath }));
        if (!knownPaths.has(pair.solutionPath) && !exercise.solutionExample) diagnostics.push(createDiagnostic('warning', 'exercise-compare-file-not-found', `Exercise comparison references solution file "${pair.solutionPath}", but that file does not exist in the document.`, { path: pair.solutionPath }));
    });

    trackedLists.forEach(([key, paths]) => {
        paths.forEach((path) => {
            if (knownPaths.has(path)) return;
            diagnostics.push(createDiagnostic('warning', 'exercise-file-not-found', `Exercise metadata "${key}" references "${path}", but that file does not exist in the document.`, { key, path }));
        });
    });

    const entryPath = normalizeVirtualPath(metadata.entry || '');
    if (entryPath && exercise.hiddenFiles.includes(entryPath)) {
        diagnostics.push(createDiagnostic('warning', 'exercise-hidden-entry-file', `Exercise metadata hides the entry file "${entryPath}". The project will still compile, but the editor will conceal the entry source until it is revealed.`, { entry: entryPath }));
    }
}

export function validateEditorHiddenFiles(files, metadata, diagnostics) {
    const parsedHiddenFiles = parseEditorHiddenFilesMetadataValue(metadata.editor_hidden_files);
    if (parsedHiddenFiles.keys.length === 0) return;

    const validKeys = new Set(files.map((file) => getDocumentFileVisibilityKey(file, files)).filter(Boolean));

    parsedHiddenFiles.keys.forEach((key) => {
        if (validKeys.has(key)) return;
        diagnostics.push(createDiagnostic('warning', 'editor-hidden-file-not-found', `Hidden file entry "${key}" does not match any file in this document.`, { value: key }));
    });
}

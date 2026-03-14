import {
    ALLOWED_VIRTUAL_FILE_ROLES,
    EXAMPLE_IMPORTANCE_VALUES,
    EXAMPLE_STAGE_VALUES,
    SUPPORTED_FRAMEWORKS,
    SUPPORTED_FRAMEWORK_MODES,
    SUPPORTED_RENDERERS,
} from './constants.js';
import {
    createDiagnostic,
    getExpectedExtensions,
    getFileExtension,
    getVirtualPathIssue,
    normalizeBooleanMetadataValue,
    parseExampleImportanceValue,
    parseExampleRatingValue,
    parseExampleTagsMetadataValue,
} from './core.js';
import {
    parseEditorHiddenFilesMetadataValue,
    parseShaderResolutionValue,
    parseShaderTextureMetadataValue,
    parseShaderUniformMetadataValue,
} from './shader.js';

export function validateMetadata(metadata, diagnostics, sourceFormat) {
    const framework = metadata.framework || '';
    const renderer = metadata.renderer || '';
    const mode = metadata.mode || '';
    const hasConsole = Object.prototype.hasOwnProperty.call(metadata, 'console');
    const hasEntry = Object.prototype.hasOwnProperty.call(metadata, 'entry');
    const hasResolution = Object.prototype.hasOwnProperty.call(metadata, 'resolution');

    if (framework && !SUPPORTED_FRAMEWORKS.has(framework)) {
        diagnostics.push(createDiagnostic('error', 'unsupported-framework', `Framework "${framework}" is not supported.`, { framework }));
    }

    if (renderer && !SUPPORTED_RENDERERS.has(renderer)) {
        diagnostics.push(createDiagnostic('error', 'unsupported-renderer', `Renderer "${renderer}" is not supported.`, { renderer }));
    }

    if (mode && !SUPPORTED_FRAMEWORK_MODES.has(mode)) {
        diagnostics.push(createDiagnostic('error', 'unsupported-mode', `Mode "${mode}" is not supported. Use "single-file" or "multi-file".`, { mode }));
    }

    if (hasResolution) {
        const parsedResolution = parseShaderResolutionValue(metadata.resolution);
        if (!parsedResolution) {
            diagnostics.push(
                createDiagnostic(
                    renderer === 'shader' ? 'error' : 'warning',
                    renderer === 'shader' ? 'invalid-shader-resolution' : 'invalid-resolution-metadata',
                    'Metadata "resolution" must use the format WIDTHxHEIGHT with positive integers.',
                    { value: metadata.resolution }
                )
            );
        }
    }

    if (Object.prototype.hasOwnProperty.call(metadata, 'shader_uniforms')) {
        const parsedShaderUniforms = parseShaderUniformMetadataValue(metadata.shader_uniforms);
        diagnostics.push(...parsedShaderUniforms.diagnostics);

        if (renderer !== 'shader' && parsedShaderUniforms.uniforms.length > 0) {
            diagnostics.push(createDiagnostic('warning', 'shader-uniforms-without-shader-renderer', 'Metadata "shader_uniforms" only applies to shader documents.', { value: metadata.shader_uniforms }));
        }
    }

    if (Object.prototype.hasOwnProperty.call(metadata, 'shader_textures')) {
        const parsedShaderTextures = parseShaderTextureMetadataValue(metadata.shader_textures);
        diagnostics.push(...parsedShaderTextures.diagnostics);

        if (renderer !== 'shader' && parsedShaderTextures.textures.length > 0) {
            diagnostics.push(createDiagnostic('warning', 'shader-textures-without-shader-renderer', 'Metadata "shader_textures" only applies to shader documents.', { value: metadata.shader_textures }));
        }

        const parsedShaderUniforms = parseShaderUniformMetadataValue(metadata.shader_uniforms);
        const uniformNames = new Set(parsedShaderUniforms.uniforms.map((uniform) => uniform.name));
        parsedShaderTextures.textures.forEach((texture) => {
            if (!uniformNames.has(texture.name)) return;
            diagnostics.push(createDiagnostic('warning', 'shader-texture-conflicts-uniform', `Shader texture "${texture.name}" conflicts with a custom uniform of the same name.`, { name: texture.name, assetPath: texture.assetPath }));
        });
    }

    if (hasConsole && typeof metadata.console !== 'boolean') {
        diagnostics.push(createDiagnostic('warning', 'invalid-console-metadata', `Metadata "console" must be boolean, but received ${typeof metadata.console}.`, { value: metadata.console }));
    }

    if (Object.prototype.hasOwnProperty.call(metadata, 'editor_hidden_files')) {
        const parsedHiddenFiles = parseEditorHiddenFilesMetadataValue(metadata.editor_hidden_files);
        diagnostics.push(...parsedHiddenFiles.diagnostics);
    }

    if (hasEntry && getVirtualPathIssue(metadata.entry)) {
        diagnostics.push(createDiagnostic('error', 'invalid-entry-path', `Entry path "${metadata.entry}" is not valid.`, { entry: metadata.entry }));
    }

    if (sourceFormat === 'legacy-blocks' && mode === 'multi-file') {
        diagnostics.push(createDiagnostic('error', 'mode-format-mismatch', 'Block-based documents cannot declare `mode: multi-file`. Use `## @file` sections instead.', { mode, sourceFormat }));
    }

    if (sourceFormat === 'virtual-files' && mode === 'single-file') {
        diagnostics.push(createDiagnostic('error', 'mode-format-mismatch', 'Virtual-file documents cannot declare `mode: single-file`.', { mode, sourceFormat }));
    }

    if (mode && !framework) {
        diagnostics.push(createDiagnostic('warning', 'mode-without-framework', 'Metadata "mode" is currently meaningful only together with `framework: react` or `framework: vue`.', { mode }));
    }

    if (renderer === 'shader' && framework) {
        diagnostics.push(createDiagnostic('error', 'shader-framework-not-supported', 'Shader documents cannot declare `framework`. Use `renderer: shader` with block-based Vertex/Fragment shaders.', { framework }));
    }

    if (renderer === 'shader' && mode) {
        diagnostics.push(createDiagnostic('warning', 'shader-mode-ignored', 'Metadata "mode" is ignored for shader documents.', { mode }));
    }

    if (renderer === 'shader' && sourceFormat === 'virtual-files') {
        diagnostics.push(createDiagnostic('error', 'shader-virtual-files-not-supported', 'Shader documents currently use block-based Vertex/Fragment format, not `## @file` sections.', { sourceFormat }));
    }

    if (hasEntry && sourceFormat !== 'virtual-files') {
        diagnostics.push(createDiagnostic('warning', 'entry-ignored-for-legacy-document', 'Metadata "entry" is ignored for block-based documents.', { entry: metadata.entry }));
    }

    if (hasEntry && !['react', 'vue'].includes(framework)) {
        diagnostics.push(createDiagnostic('warning', 'entry-requires-supported-multi-file-framework', 'Metadata "entry" is currently used only for React or Vue multi-file documents.', { entry: metadata.entry, framework }));
    }

    if (Object.prototype.hasOwnProperty.call(metadata, 'exercise')) {
        const normalizedExercise = normalizeBooleanMetadataValue(metadata.exercise);
        if (typeof normalizedExercise !== 'boolean') {
            diagnostics.push(createDiagnostic('warning', 'invalid-exercise-metadata', 'Metadata "exercise" must be boolean when present.', { value: metadata.exercise }));
        }
    }

    if (metadata.example_stage && !EXAMPLE_STAGE_VALUES.has(String(metadata.example_stage).trim().toLowerCase())) {
        diagnostics.push(createDiagnostic('warning', 'invalid-example-stage', `Metadata "example_stage" must be one of: ${Array.from(EXAMPLE_STAGE_VALUES).join(', ')}.`, { value: metadata.example_stage }));
    }

    if (Object.prototype.hasOwnProperty.call(metadata, 'example_tags')) {
        const parsedTags = parseExampleTagsMetadataValue(metadata.example_tags);
        diagnostics.push(...parsedTags.diagnostics);
    }

    if (Object.prototype.hasOwnProperty.call(metadata, 'example_rating') && parseExampleRatingValue(metadata.example_rating) == null) {
        diagnostics.push(createDiagnostic('warning', 'invalid-example-rating', 'Metadata "example_rating" must be an integer from 1 to 5.', { value: metadata.example_rating }));
    }

    if (Object.prototype.hasOwnProperty.call(metadata, 'example_importance') && !parseExampleImportanceValue(metadata.example_importance)) {
        diagnostics.push(createDiagnostic('warning', 'invalid-example-importance', `Metadata "example_importance" must be one of: ${Array.from(EXAMPLE_IMPORTANCE_VALUES).join(', ')}.`, { value: metadata.example_importance }));
    }
}

export function validateVirtualFileShape(file, diagnostics) {
    const pathIssue = getVirtualPathIssue(file.path);
    const expectedExtensions = getExpectedExtensions(file.language);
    const extension = getFileExtension(file.path);

    if (pathIssue) {
        diagnostics.push(
            createDiagnostic(
                'error',
                'invalid-file-path',
                pathIssue === 'empty'
                    ? 'Each virtual file must declare a non-empty path.'
                    : `File path "${file.path}" cannot contain "." or ".." segments.`,
                { path: file.path || null }
            )
        );
    }

    if (file.role && !ALLOWED_VIRTUAL_FILE_ROLES.has(file.role)) {
        diagnostics.push(createDiagnostic('warning', 'unsupported-file-role', `Role "${file.role}" on "${file.path}" is not recognized.`, { path: file.path, role: file.role }));
    }

    if (expectedExtensions.length > 0 && !expectedExtensions.includes(extension)) {
        diagnostics.push(
            createDiagnostic(
                'warning',
                'file-extension-language-mismatch',
                `File "${file.path}" uses language "${file.language}" but its extension should usually be ${expectedExtensions.join(' or ')}.`,
                { expectedExtensions, language: file.language, path: file.path }
            )
        );
    }
}

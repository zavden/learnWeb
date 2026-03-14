import { sortBlocks } from '../../config/exampleBlocks.js';
import {
    EXAMPLE_STAGE_VALUES,
    EXERCISE_METADATA_KEYS,
    LEGACY_FILE_TEMPLATES,
    SHADER_BLOCK_TYPES,
    SHADER_BUILTIN_UNIFORMS,
} from './constants.js';
import {
    buildVirtualFile,
    normalizeBooleanMetadataValue,
    normalizeExampleDescriptionMetadataValue,
    normalizeVirtualPath,
    parseExampleImportanceValue,
    parseExampleRatingValue,
    parseExampleTagsMetadataValue,
    parseExerciseListValue,
    parseExercisePathList,
} from './core.js';
import {
    cloneShaderUniformControl,
    cloneShaderUniformValue,
    parseEditorHiddenFilesMetadataValue,
    parseShaderResolutionValue,
    parseShaderTextureMetadataValue,
    parseShaderUniformMetadataValue,
} from './shader.js';

export function hasExerciseMetadata(metadata = {}) {
    return Array.from(EXERCISE_METADATA_KEYS).some((key) => {
        const value = metadata[key];
        if (value === undefined || value === null) return false;
        if (typeof value === 'string') return value.trim() !== '';
        return true;
    });
}

export function getExerciseConfig(documentModel) {
    const metadata = documentModel?.metadata || {};
    const instructions = parseExerciseListValue(metadata.exercise_instructions);
    const hints = parseExerciseListValue(metadata.exercise_hints);
    const comparePairs = parseExerciseListValue(metadata.exercise_compare_pairs)
        .map((entry) => {
            const [attemptPath, solutionPath] = entry.split('=>').map((part) => normalizeVirtualPath(part || ''));
            return {
                attemptPath,
                solutionPath,
            };
        })
        .filter((entry) => entry.attemptPath && entry.solutionPath);
    const lockedFiles = parseExercisePathList(metadata.exercise_locked_files);
    const referenceFiles = parseExercisePathList(metadata.exercise_reference_files);
    const solutionExample = String(metadata.exercise_solution_example || '').trim();
    const solutionFiles = parseExercisePathList(metadata.exercise_solution_files);
    const enabled = normalizeBooleanMetadataValue(metadata.exercise) === true
        || hasExerciseMetadata(metadata);

    return {
        comparePairs,
        enabled,
        title: String(metadata.exercise_title || '').trim() || 'Exercise',
        instructions,
        hints,
        lockedFiles,
        referenceFiles,
        solutionExample,
        solutionFiles,
        hiddenFiles: Array.from(new Set([...referenceFiles, ...solutionFiles])),
    };
}

export function getExampleStage(documentModel) {
    const stage = String(documentModel?.metadata?.example_stage || '').trim().toLowerCase();
    return EXAMPLE_STAGE_VALUES.has(stage) ? stage : '';
}

export function getExampleEditorialMetadata(documentModel) {
    const metadata = documentModel?.metadata || {};
    const parsedTags = parseExampleTagsMetadataValue(metadata.example_tags);

    return {
        description: normalizeExampleDescriptionMetadataValue(metadata.example_description),
        tags: parsedTags.tags,
        tagsText: parsedTags.normalizedValue || String(metadata.example_tags || '').trim(),
        rating: parseExampleRatingValue(metadata.example_rating),
        importance: parseExampleImportanceValue(metadata.example_importance),
    };
}

export function hasShaderBlocks(blocks = []) {
    return (blocks || []).some((block) => SHADER_BLOCK_TYPES.has(block.type));
}

export function inferRendererMode({ blocks = [], metadata = {}, sourceFormat = 'legacy-blocks' } = {}) {
    if (sourceFormat === 'legacy-blocks' && (metadata.renderer === 'shader' || hasShaderBlocks(blocks))) {
        return 'shader';
    }

    return 'web';
}

export function getShaderConfig(documentModel) {
    const metadata = documentModel?.metadata || {};
    const blocks = documentModel?.blocks || [];
    const rendererMode = inferRendererMode({
        blocks,
        metadata,
        sourceFormat: documentModel?.sourceFormat || 'legacy-blocks',
    });
    const parsedResolution = parseShaderResolutionValue(metadata.resolution);
    const parsedCustomUniforms = parseShaderUniformMetadataValue(metadata.shader_uniforms);
    const parsedTextures = parseShaderTextureMetadataValue(metadata.shader_textures);

    return {
        enabled: rendererMode === 'shader',
        explicit: metadata.renderer === 'shader',
        builtInUniforms: [...SHADER_BUILTIN_UNIFORMS],
        customUniforms: parsedCustomUniforms.uniforms.map((uniform) => ({
            ...uniform,
            control: cloneShaderUniformControl(uniform.control),
            defaultValue: cloneShaderUniformValue(uniform.defaultValue),
            value: cloneShaderUniformValue(uniform.value),
        })),
        textures: parsedTextures.textures.map((texture) => ({
            assetPath: texture.assetPath,
            name: texture.name,
        })),
        rendererMode,
        resolution: parsedResolution
            ? {
                width: parsedResolution.width,
                height: parsedResolution.height,
            }
            : null,
        resolutionText: String(metadata.resolution || '').trim(),
        shaderUniformsText: parsedCustomUniforms.normalizedValue || String(metadata.shader_uniforms || '').trim(),
        shaderTexturesText: parsedTextures.normalizedValue || String(metadata.shader_textures || '').trim(),
    };
}

export function isShaderDocument(documentModel) {
    return getShaderConfig(documentModel).enabled;
}

export function getDocumentFileVisibilityKey(file, files = []) {
    if (!file) return '';

    if (file.sourceKind === 'virtual') {
        const path = normalizeVirtualPath(file.path);
        return path ? `file:${path}` : '';
    }

    const blockType = file.blockType || file.language;
    if (!blockType) return '';

    let occurrence = 0;

    for (const entry of files) {
        const isLegacy = entry?.sourceKind !== 'virtual';
        const entryType = entry?.blockType || entry?.language;

        if (isLegacy && entryType === blockType) {
            occurrence += 1;
        }

        if (entry?.id === file.id) {
            return `block:${blockType}:${Math.max(1, occurrence)}`;
        }
    }

    const fallbackOrder = Number.isFinite(file?.order)
        ? Number.parseInt(file.order, 10) + 1
        : 1;

    return `block:${blockType}:${Math.max(1, fallbackOrder)}`;
}

export function deriveFilesFromBlocks(blocks = []) {
    return sortBlocks(blocks).map((block, index) => {
        const template = LEGACY_FILE_TEMPLATES[block.type] || {
            path: `file-${index}.${block.language || block.type}`,
            role: block.slot,
        };

        return buildVirtualFile({
            blockId: block.id,
            blockType: block.type,
            content: block.content,
            heading: block.heading,
            index,
            language: block.language || block.type,
            path: template.path,
            role: template.role,
            slot: block.slot,
            sourceKind: 'legacy',
        });
    });
}

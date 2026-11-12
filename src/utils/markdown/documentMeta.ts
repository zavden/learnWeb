// Derived views of a document: the exercise config, the editorial metadata and stage, the shader config
// and renderer mode, file visibility keys, and the legacy files derived from blocks. Each view re-reads
// `metadata` on every call (nothing is cached), so they always match the document passed in. Public
// through src/utils/markdown.ts; also used by documentApi.ts, parsers.ts and the validators.

import { sortBlocks } from '../../config/exampleBlocks.ts';
import type {
    ExampleBlock,
    ExampleDocumentInput,
    ExampleEditorialMetadata,
    ExampleMetadataInput,
    ExampleStage,
    ExerciseConfig,
    FileVisibilityKey,
    RendererMode,
    ShaderConfig,
    VirtualFile,
} from '../../types/document.ts';
import {
    EXAMPLE_STAGE_VALUES,
    EXERCISE_METADATA_KEYS,
    LEGACY_FILE_TEMPLATES,
    SHADER_BLOCK_TYPES,
    SHADER_BUILTIN_UNIFORMS,
} from './constants.ts';
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
    parseExerciseTextListValue,
} from './core.ts';
import {
    cloneShaderUniformControl,
    cloneShaderUniformValue,
    parseShaderResolutionValue,
    parseShaderTextureMetadataValue,
    parseShaderUniformMetadataValue,
} from './shader.ts';

/** Whether any `exercise_*` key (not the `exercise` flag itself) has a value. */
export function hasExerciseMetadata(metadata: ExampleMetadataInput = {}): boolean {
    return Array.from(EXERCISE_METADATA_KEYS).filter((key) => key !== 'exercise').some((key) => {
        const value = metadata[key];
        if (value === undefined || value === null) return false;
        if (typeof value === 'string') return value.trim() !== '';
        return true;
    });
}

/** The exercise metadata parsed into lists (see `ExerciseConfig`); usable on any document. */
export function getExerciseConfig(documentModel: ExampleDocumentInput | null | undefined): ExerciseConfig {
    const metadata = documentModel?.metadata || {};
    const instructions = parseExerciseTextListValue(metadata.exercise_instructions);
    const hints = parseExerciseTextListValue(metadata.exercise_hints);
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
    // Only an explicit `exercise: true` turns exercise mode on. Leftover exercise_* keys
    // (e.g. in a solution copied from the exercise) are reported by validation instead.
    const enabled = normalizeBooleanMetadataValue(metadata.exercise) === true;

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

/** `example_stage` when it is a valid stage, `''` otherwise. */
export function getExampleStage(documentModel: ExampleDocumentInput | null | undefined): ExampleStage | '' {
    const stage = String(documentModel?.metadata?.example_stage || '').trim().toLowerCase();
    return EXAMPLE_STAGE_VALUES.has(stage) ? stage as ExampleStage : '';
}

/** Description, tags, rating and importance, normalized (invalid values read as empty). */
export function getExampleEditorialMetadata(documentModel: ExampleDocumentInput | null | undefined): ExampleEditorialMetadata {
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

/** Whether any block is a vertex or fragment shader. */
export function hasShaderBlocks(blocks: readonly ExampleBlock[] | null = []): boolean {
    return (blocks || []).some((block) => SHADER_BLOCK_TYPES.has(block.type));
}

/** `shader` for legacy documents with `renderer: shader` or shader blocks; `web` otherwise (virtual files are always web). */
export function inferRendererMode({ blocks = [], metadata = {}, sourceFormat = 'legacy-blocks' }: ExampleDocumentInput = {}): RendererMode {
    if (sourceFormat === 'legacy-blocks' && (metadata.renderer === 'shader' || hasShaderBlocks(blocks))) {
        return 'shader';
    }

    return 'web';
}

/** The shader metadata parsed for the shader runtime and dialogs (see `ShaderConfig`); usable on any document. */
export function getShaderConfig(documentModel: ExampleDocumentInput | null | undefined): ShaderConfig {
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

/** Whether the document renders with the shader runtime. */
export function isShaderDocument(documentModel: ExampleDocumentInput | null | undefined): boolean {
    return getShaderConfig(documentModel).enabled;
}

/**
 * The file's key for `editor_hidden_files`: `file:<path>` for virtual files, `block:<type>:<n>` for the
 * n-th legacy file of that block type among `files` (by `order` when the file is not in `files`).
 */
export function getDocumentFileVisibilityKey(file: VirtualFile | null | undefined, files: readonly VirtualFile[] = []): FileVisibilityKey {
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
        ? Number.parseInt(String(file.order), 10) + 1
        : 1;

    return `block:${blockType}:${Math.max(1, fallbackOrder)}`;
}

/** One legacy file per block, in slot order, with the path and role of `LEGACY_FILE_TEMPLATES`. */
export function deriveFilesFromBlocks(blocks: readonly ExampleBlock[] = []): VirtualFile[] {
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

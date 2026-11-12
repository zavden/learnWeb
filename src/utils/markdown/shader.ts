// Shader metadata of an example — the frontmatter keys `resolution`, `shader_uniforms` and
// `shader_textures` — and the `editor_hidden_files` list (not shader-specific, but parsed the same way):
// parsing into structured values, canonical serialization, and the warnings for invalid declarations.
// Called by documentMeta.ts (`getShaderConfig()`), documentApi.ts (file visibility), the validators
// (validationMetadata.ts, validationDocuments.ts) and mutations.ts (the editor's shader and visibility
// dialogs write back through the `serialize*` helpers). Calls core.ts for paths and diagnostics.
//
// The parsers never throw: an invalid declaration is dropped with a `warning` diagnostic and the valid
// ones are kept in order. Only `validateMetadata()` adds these diagnostics to a document; the other
// callers parse again and use the values alone. Uniform and control types are read from author text, so
// the `type` parameters below are plain strings (anything outside the uniform types falls through to the
// numeric case).

import {
    normalizeBlockType,
} from '../../config/exampleBlocks.ts';
import type { Diagnostic } from '../../types/diagnostics.ts';
import type {
    FileVisibilityKey,
    MetadataValue,
    ShaderResolution,
    ShaderTexture,
    ShaderTextureDraft,
    ShaderUniform,
    ShaderUniformControl,
    ShaderUniformDraft,
    ShaderUniformType,
    ShaderUniformValue,
} from '../../types/document.ts';
import {
    SHADER_BUILTIN_UNIFORMS,
    SHADER_CUSTOM_UNIFORM_TYPES,
    SHADER_TEXTURE_EXTENSIONS,
} from './constants.ts';
import {
    createDiagnostic,
    getFileExtension,
    getVirtualPathIssue,
    normalizeBooleanMetadataValue,
    normalizeVirtualPath,
} from './core.ts';

/** A valid `resolution` value (`parseShaderResolutionValue()`). */
export interface ParsedShaderResolution extends ShaderResolution {
    /** Canonical text, `${width}x${height}`. */
    value: string;
}

/** `parseShaderUniformControlValue()`: the range hint of one uniform and the warnings it produced. */
export interface ParsedShaderUniformControl {
    /** `null` when there was no hint or it was invalid (the uniform itself is still kept). */
    control: ShaderUniformControl | null;
    diagnostics: Diagnostic[];
}

/** `parseShaderUniformMetadataValue()`: the valid uniforms of `shader_uniforms` and the warnings. */
export interface ParsedShaderUniforms {
    /** The valid declarations re-serialized canonically and joined with `|`; `''` when none is valid. */
    normalizedValue: string;
    uniforms: ShaderUniform[];
    diagnostics: Diagnostic[];
}

/** `parseShaderTextureMetadataValue()`: the valid textures of `shader_textures` and the warnings. */
export interface ParsedShaderTextures {
    /** The valid declarations (`name=asset`) joined with `|`; `''` when none is valid. */
    normalizedValue: string;
    textures: ShaderTexture[];
    diagnostics: Diagnostic[];
}

/** `parseEditorHiddenFilesMetadataValue()`: the normalized keys of `editor_hidden_files` and the warnings. */
export interface ParsedEditorHiddenFiles {
    diagnostics: Diagnostic[];
    /** Normalized, without duplicates, in the order written; never `''`. Not checked against the document's files. */
    keys: FileVisibilityKey[];
    normalizedValue: string;
}

/**
 * Parses `WIDTHxHEIGHT` (case-insensitive `x`, spaces around it allowed) into positive integers;
 * `null` for anything else.
 */
export function parseShaderResolutionValue(value: MetadataValue | null = ''): ParsedShaderResolution | null {
    const text = String(value ?? '').trim();
    if (!text) return null;

    const match = text.match(/^(\d+)\s*x\s*(\d+)$/i);
    if (!match) return null;

    const width = Number.parseInt(match[1], 10);
    const height = Number.parseInt(match[2], 10);

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        return null;
    }

    return {
        width,
        height,
        value: `${width}x${height}`,
    };
}

/** The canonical `resolution` text (`800 X 600` → `800x600`), or the trimmed input when it is not valid. */
export function normalizeResolutionMetadataValue(value: MetadataValue | null = ''): string {
    const parsed = parseShaderResolutionValue(value);
    return parsed ? parsed.value : String(value ?? '').trim();
}

/** A copy of a uniform value (vector components are coerced to numbers). */
export function cloneShaderUniformValue(value: ShaderUniformValue): ShaderUniformValue {
    if (Array.isArray(value)) {
        return value.map((entry) => Number(entry));
    }

    if (typeof value === 'boolean') {
        return value;
    }

    return Number(value);
}

/** A copy of a range control, or `null` when there is none. */
export function cloneShaderUniformControl(control: ShaderUniformControl | null = null): ShaderUniformControl | null {
    return control && typeof control === 'object'
        ? { ...control }
        : null;
}

/**
 * The value part of a declaration: `true`/`false` for `bool`, comma-separated components for `vecN`
 * (a missing vector becomes N zeros; extra components are cut), `String(Number(value))` otherwise.
 */
export function serializeShaderUniformValue(type: string, value: ShaderUniformValue | null | undefined): string {
    if (type === 'bool') {
        return value ? 'true' : 'false';
    }

    if (type.startsWith('vec')) {
        const size = Number.parseInt(type.slice(3), 10) || 2;
        const vector = Array.isArray(value) ? value : Array.from({ length: size }, () => 0);
        return vector.slice(0, size).map((entry) => String(Number(entry))).join(',');
    }

    return String(Number(value));
}

/** The `[min,max,step]` suffix of a declaration; `''` without a range control. */
export function serializeShaderUniformControl(control: ShaderUniformControl | null = null): string {
    if (!control || control.kind !== 'range') return '';
    return `[${control.min},${control.max},${control.step}]`;
}

/**
 * Parses the default value of a declaration for its type: a boolean word (`true`, `off`, `1`…) for
 * `bool`, exactly N numbers for `vecN`, a number for `float`/`int`. `null` when it does not fit.
 * `int` values are read with `parseInt`, so a fraction is truncated (`1.5` → `1`) rather than rejected.
 */
export function parseShaderUniformDefaultValue(type: string, rawValue: string | undefined): ShaderUniformValue | null {
    const value = String(rawValue || '').trim();

    if (type === 'bool') {
        const normalized = normalizeBooleanMetadataValue(value);
        return typeof normalized === 'boolean' ? normalized : null;
    }

    if (type.startsWith('vec')) {
        const size = Number.parseInt(type.slice(3), 10);
        const parts = value.split(',').map((entry) => entry.trim()).filter(Boolean);
        if (!Number.isFinite(size) || size <= 1 || parts.length !== size) return null;

        const vector = parts.map((entry) => Number.parseFloat(entry));
        return vector.every((entry) => Number.isFinite(entry)) ? vector : null;
    }

    const numericValue = type === 'int'
        ? Number.parseInt(value, 10)
        : Number.parseFloat(value);

    if (!Number.isFinite(numericValue)) {
        return null;
    }

    if (type === 'int' && !Number.isInteger(numericValue)) {
        return null;
    }

    return numericValue;
}

/**
 * Parses the `[min,max,step]` hint of a declaration (`rawValue` is the text between the brackets,
 * `undefined` when there are none). Only `float`/`int` uniforms accept one; it needs three numbers with
 * `max > min`, `step > 0` and a numeric default inside the range. Any problem gives a warning and a
 * `null` control (the uniform is kept). `int` hints are read with `parseInt` (fractions are truncated).
 */
export function parseShaderUniformControlValue(
    type: string,
    rawValue: string | undefined,
    defaultValue: ShaderUniformValue | null,
    declaration: string,
    name: string,
): ParsedShaderUniformControl {
    const text = String(rawValue || '').trim();
    if (!text) {
        return {
            control: null,
            diagnostics: [],
        };
    }

    const diagnostics: Diagnostic[] = [];
    if (!['float', 'int'].includes(type)) {
        diagnostics.push(createDiagnostic(
            'warning',
            'unsupported-shader-uniform-control',
            `Shader uniform "${name}" only supports range controls for float or int types.`,
            { declaration, name, uniformType: type }
        ));
        return {
            control: null,
            diagnostics,
        };
    }

    const parts = text.split(',').map((entry) => entry.trim()).filter(Boolean);
    if (parts.length !== 3) {
        diagnostics.push(createDiagnostic(
            'warning',
            'invalid-shader-uniform-control',
            `Shader uniform "${name}" has an invalid control hint. Use "[min,max,step]".`,
            { declaration, name }
        ));
        return {
            control: null,
            diagnostics,
        };
    }

    const numericParts = parts.map((entry) => type === 'int'
        ? Number.parseInt(entry, 10)
        : Number.parseFloat(entry));

    if (!numericParts.every((entry) => Number.isFinite(entry))) {
        diagnostics.push(createDiagnostic(
            'warning',
            'invalid-shader-uniform-control',
            `Shader uniform "${name}" has an invalid control hint. Use numeric "[min,max,step]".`,
            { declaration, name }
        ));
        return {
            control: null,
            diagnostics,
        };
    }

    const [min, max, step] = numericParts;
    if (max <= min || step <= 0) {
        diagnostics.push(createDiagnostic(
            'warning',
            'invalid-shader-uniform-control',
            `Shader uniform "${name}" must use control values where max > min and step > 0.`,
            { declaration, name }
        ));
        return {
            control: null,
            diagnostics,
        };
    }

    if (type === 'int' && !numericParts.every((entry) => Number.isInteger(entry))) {
        diagnostics.push(createDiagnostic(
            'warning',
            'invalid-shader-uniform-control',
            `Shader uniform "${name}" must use integer control values for int uniforms.`,
            { declaration, name }
        ));
        return {
            control: null,
            diagnostics,
        };
    }

    if (typeof defaultValue === 'number' && (defaultValue < min || defaultValue > max)) {
        diagnostics.push(createDiagnostic(
            'warning',
            'shader-uniform-default-out-of-range',
            `Shader uniform "${name}" default value is outside its declared control range.`,
            { declaration, name, max, min, value: defaultValue }
        ));
        return {
            control: null,
            diagnostics,
        };
    }

    return {
        control: {
            kind: 'range',
            max,
            min,
            step,
        },
        diagnostics,
    };
}

/**
 * Parses `shader_uniforms`: `|`-separated `name:type=value[min,max,step]` declarations (the hint is
 * optional). A declaration is dropped, with a warning, when it does not match that shape, its name is a
 * built-in uniform (`u_time`…), the name was already declared, or the default does not fit the type.
 * Warnings about the control hint are emitted first, even for a declaration that is then dropped.
 */
export function parseShaderUniformMetadataValue(value: MetadataValue | null = ''): ParsedShaderUniforms {
    const text = String(value || '').trim();
    if (!text) {
        return {
            normalizedValue: '',
            uniforms: [],
            diagnostics: [],
        };
    }

    const uniforms: ShaderUniform[] = [];
    const diagnostics: Diagnostic[] = [];
    const entries = text.split('|').map((entry) => entry.trim()).filter(Boolean);
    const seenNames = new Set<string>();

    entries.forEach((entry) => {
        const match = entry.match(/^([A-Za-z_][\w]*)\s*:\s*(float|int|bool|vec2|vec3|vec4)\s*=\s*(.+?)(?:\[([^\]]+)\])?$/i);
        if (!match) {
            diagnostics.push(createDiagnostic(
                'warning',
                'invalid-shader-uniform-declaration',
                `Shader uniform declaration "${entry}" is invalid. Use "name:type=value".`,
                { declaration: entry }
            ));
            return;
        }

        const name = match[1];
        const type = match[2].trim().toLowerCase();
        const defaultValue = parseShaderUniformDefaultValue(type, match[3]);
        const parsedControl = parseShaderUniformControlValue(type, match[4], defaultValue, entry, name);
        diagnostics.push(...parsedControl.diagnostics);

        // Unreachable in practice (the pattern above only accepts these types), kept as a safety net.
        if (!SHADER_CUSTOM_UNIFORM_TYPES.has(type)) {
            diagnostics.push(createDiagnostic(
                'warning',
                'unsupported-shader-uniform-type',
                `Shader uniform "${name}" uses unsupported type "${type}".`,
                { declaration: entry, name, uniformType: type }
            ));
            return;
        }

        if (SHADER_BUILTIN_UNIFORMS.includes(name)) {
            diagnostics.push(createDiagnostic(
                'warning',
                'shader-uniform-conflicts-built-in',
                `Shader uniform "${name}" conflicts with a built-in uniform and will be ignored.`,
                { declaration: entry, name }
            ));
            return;
        }

        if (seenNames.has(name)) {
            diagnostics.push(createDiagnostic(
                'warning',
                'duplicate-shader-uniform',
                `Shader uniform "${name}" is declared more than once. Only the first declaration is used.`,
                { declaration: entry, name }
            ));
            return;
        }

        if (defaultValue == null) {
            diagnostics.push(createDiagnostic(
                'warning',
                'invalid-shader-uniform-default',
                `Shader uniform "${name}" has an invalid default for type "${type}".`,
                { declaration: entry, name, uniformType: type }
            ));
            return;
        }

        seenNames.add(name);
        uniforms.push({
            name,
            type: type as ShaderUniformType,
            control: cloneShaderUniformControl(parsedControl.control),
            defaultValue: cloneShaderUniformValue(defaultValue),
            value: cloneShaderUniformValue(defaultValue),
        });
    });

    return {
        normalizedValue: uniforms.map((uniform) => (
            `${uniform.name}:${uniform.type}=${serializeShaderUniformValue(uniform.type, uniform.defaultValue)}${serializeShaderUniformControl(uniform.control)}`
        )).join('|'),
        uniforms,
        diagnostics,
    };
}

/**
 * One `shader_uniforms` declaration from a dialog draft (`name:type=value[min,max,step]`); `''` when the
 * draft has no name or an unknown type. The value is not validated here: the document is reparsed after
 * the update, which reports and drops what is invalid.
 */
export function serializeShaderUniformDeclaration(uniform: ShaderUniformDraft | null = {}): string {
    const name = String(uniform?.name || '').trim();
    const type = String(uniform?.type || '').trim().toLowerCase();

    if (!name || !SHADER_CUSTOM_UNIFORM_TYPES.has(type)) {
        return '';
    }

    // `uniform` is set here: without one, `name` is empty and the function returned above.
    return `${name}:${type}=${serializeShaderUniformValue(type, uniform!.defaultValue)}${serializeShaderUniformControl(uniform!.control)}`;
}

/**
 * Parses `shader_textures`: `|`-separated `uniformName=asset-file` declarations. The asset must be a
 * top-level file of the topic's `assets/` folder with an image extension (`SHADER_TEXTURE_EXTENSIONS`);
 * invalid, nested or duplicate declarations are dropped with a warning. Whether the asset exists is not
 * checked here.
 */
export function parseShaderTextureMetadataValue(value: MetadataValue | null = ''): ParsedShaderTextures {
    const text = String(value || '').trim();
    if (!text) {
        return {
            normalizedValue: '',
            textures: [],
            diagnostics: [],
        };
    }

    const textures: ShaderTexture[] = [];
    const diagnostics: Diagnostic[] = [];
    const entries = text.split('|').map((entry) => entry.trim()).filter(Boolean);
    const seenNames = new Set<string>();

    entries.forEach((entry) => {
        const match = entry.match(/^([A-Za-z_][\w]*)\s*=\s*(.+)$/);
        if (!match) {
            diagnostics.push(createDiagnostic(
                'warning',
                'invalid-shader-texture-declaration',
                `Shader texture declaration "${entry}" is invalid. Use "uniformName=asset-file".`,
                { declaration: entry }
            ));
            return;
        }

        const name = match[1];
        const assetPath = normalizeVirtualPath(match[2]);
        const assetIssue = getVirtualPathIssue(assetPath);
        const assetExtension = getFileExtension(assetPath);

        if (seenNames.has(name)) {
            diagnostics.push(createDiagnostic(
                'warning',
                'duplicate-shader-texture',
                `Shader texture "${name}" is declared more than once. Only the first declaration is used.`,
                { declaration: entry, name }
            ));
            return;
        }

        if (!assetPath || assetIssue) {
            diagnostics.push(createDiagnostic(
                'warning',
                'invalid-shader-texture-path',
                `Shader texture "${name}" points to an invalid asset path.`,
                { declaration: entry, name, assetPath }
            ));
            return;
        }

        if (assetPath.includes('/')) {
            diagnostics.push(createDiagnostic(
                'warning',
                'nested-shader-texture-path-not-supported',
                `Shader texture "${name}" must reference a top-level file in the topic assets folder.`,
                { declaration: entry, name, assetPath }
            ));
            return;
        }

        if (!SHADER_TEXTURE_EXTENSIONS.has(assetExtension)) {
            diagnostics.push(createDiagnostic(
                'warning',
                'unsupported-shader-texture-extension',
                `Shader texture "${name}" uses unsupported asset extension "${assetExtension || '(none)'}".`,
                { declaration: entry, name, assetPath }
            ));
            return;
        }

        seenNames.add(name);
        textures.push({
            assetPath,
            name,
        });
    });

    return {
        normalizedValue: textures.map((texture) => `${texture.name}=${texture.assetPath}`).join('|'),
        textures,
        diagnostics,
    };
}

/**
 * One `shader_textures` declaration from a dialog draft (`name=assetPath`); `''` when the name is not
 * a GLSL identifier or the path is empty. Other path rules are checked when the document is reparsed.
 */
export function serializeShaderTextureDeclaration(texture: ShaderTextureDraft | null = {}): string {
    const name = String(texture?.name || '').trim();
    const assetPath = normalizeVirtualPath(texture?.assetPath || '');

    if (!name || !/^[A-Za-z_]\w*$/.test(name) || !assetPath) {
        return '';
    }

    return `${name}=${assetPath}`;
}

/**
 * Normalizes one `editor_hidden_files` entry: `file:<path>` (path normalized) or `block:<type>:<n>`
 * (type lower-cased with aliases resolved, n ≥ 1). `''` when the entry has neither shape.
 */
export function normalizeEditorHiddenFileKey(value: string = ''): FileVisibilityKey {
    const text = String(value || '').trim();
    if (!text) return '';

    if (text.startsWith('file:')) {
        const path = normalizeVirtualPath(text.slice(5));
        return path ? `file:${path}` : '';
    }

    const blockMatch = text.match(/^block:([A-Za-z0-9_-]+):(\d+)$/);
    if (!blockMatch) return '';

    const type = normalizeBlockType(blockMatch[1]);
    const occurrence = Number.parseInt(blockMatch[2], 10);

    if (!type || !Number.isFinite(occurrence) || occurrence <= 0) {
        return '';
    }

    return `block:${type}:${occurrence}`;
}

/**
 * Parses `editor_hidden_files` (`|`-separated keys, see `FileVisibilityKey`). Invalid and repeated
 * entries are dropped with a warning; keys that match no file are reported by `validateEditorHiddenFiles()`.
 */
export function parseEditorHiddenFilesMetadataValue(value: MetadataValue | null = ''): ParsedEditorHiddenFiles {
    const text = String(value || '').trim();
    if (!text) {
        return {
            diagnostics: [],
            keys: [],
            normalizedValue: '',
        };
    }

    const diagnostics: Diagnostic[] = [];
    const seenKeys = new Set<string>();
    const keys: FileVisibilityKey[] = [];
    const entries = text
        .split('|')
        .map((entry) => entry.trim())
        .filter(Boolean);

    entries.forEach((entry) => {
        const normalizedKey = normalizeEditorHiddenFileKey(entry);

        if (!normalizedKey) {
            diagnostics.push(createDiagnostic(
                'warning',
                'invalid-editor-hidden-file-entry',
                `Hidden file entry "${entry}" is invalid. Use "file:path/to/file" or "block:type:index".`,
                { value: entry }
            ));
            return;
        }

        if (seenKeys.has(normalizedKey)) {
            diagnostics.push(createDiagnostic(
                'warning',
                'duplicate-editor-hidden-file-entry',
                `Hidden file entry "${normalizedKey}" is declared more than once. Only the first value is used.`,
                { value: normalizedKey }
            ));
            return;
        }

        seenKeys.add(normalizedKey);
        keys.push(normalizedKey);
    });

    return {
        diagnostics,
        keys,
        normalizedValue: keys.join('|'),
    };
}

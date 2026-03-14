import {
    normalizeBlockType,
} from '../../config/exampleBlocks.js';
import {
    SHADER_BUILTIN_UNIFORMS,
    SHADER_CUSTOM_UNIFORM_TYPES,
    SHADER_TEXTURE_EXTENSIONS,
} from './constants.js';
import {
    createDiagnostic,
    getFileExtension,
    getVirtualPathIssue,
    normalizeBooleanMetadataValue,
    normalizeVirtualPath,
} from './core.js';

export function parseShaderResolutionValue(value = '') {
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

export function normalizeResolutionMetadataValue(value = '') {
    const parsed = parseShaderResolutionValue(value);
    return parsed ? parsed.value : String(value ?? '').trim();
}

export function cloneShaderUniformValue(value) {
    if (Array.isArray(value)) {
        return value.map((entry) => Number(entry));
    }

    if (typeof value === 'boolean') {
        return value;
    }

    return Number(value);
}

export function cloneShaderUniformControl(control = null) {
    return control && typeof control === 'object'
        ? { ...control }
        : null;
}

export function serializeShaderUniformValue(type, value) {
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

export function serializeShaderUniformControl(control = null) {
    if (!control || control.kind !== 'range') return '';
    return `[${control.min},${control.max},${control.step}]`;
}

export function parseShaderUniformDefaultValue(type, rawValue) {
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

export function parseShaderUniformControlValue(type, rawValue, defaultValue, declaration, name) {
    const text = String(rawValue || '').trim();
    if (!text) {
        return {
            control: null,
            diagnostics: [],
        };
    }

    const diagnostics = [];
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

export function parseShaderUniformMetadataValue(value = '') {
    const text = String(value || '').trim();
    if (!text) {
        return {
            normalizedValue: '',
            uniforms: [],
            diagnostics: [],
        };
    }

    const uniforms = [];
    const diagnostics = [];
    const entries = text.split('|').map((entry) => entry.trim()).filter(Boolean);
    const seenNames = new Set();

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
            type,
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

export function serializeShaderUniformDeclaration(uniform = {}) {
    const name = String(uniform?.name || '').trim();
    const type = String(uniform?.type || '').trim().toLowerCase();

    if (!name || !SHADER_CUSTOM_UNIFORM_TYPES.has(type)) {
        return '';
    }

    return `${name}:${type}=${serializeShaderUniformValue(type, uniform.defaultValue)}${serializeShaderUniformControl(uniform.control)}`;
}

export function parseShaderTextureMetadataValue(value = '') {
    const text = String(value || '').trim();
    if (!text) {
        return {
            normalizedValue: '',
            textures: [],
            diagnostics: [],
        };
    }

    const textures = [];
    const diagnostics = [];
    const entries = text.split('|').map((entry) => entry.trim()).filter(Boolean);
    const seenNames = new Set();

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

export function serializeShaderTextureDeclaration(texture = {}) {
    const name = String(texture?.name || '').trim();
    const assetPath = normalizeVirtualPath(texture?.assetPath || '');

    if (!name || !/^[A-Za-z_]\w*$/.test(name) || !assetPath) {
        return '';
    }

    return `${name}=${assetPath}`;
}

export function normalizeEditorHiddenFileKey(value = '') {
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

export function parseEditorHiddenFilesMetadataValue(value = '') {
    const text = String(value || '').trim();
    if (!text) {
        return {
            diagnostics: [],
            keys: [],
            normalizedValue: '',
        };
    }

    const diagnostics = [];
    const seenKeys = new Set();
    const keys = [];
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

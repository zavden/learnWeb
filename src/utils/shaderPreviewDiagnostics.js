import { getShaderConfig } from './markdown.js';

function createShaderDiagnostic(level, code, message, details = {}) {
    return {
        level,
        code,
        message,
        ...details,
    };
}

function getShaderFilePath(documentModel, type) {
    const files = Array.isArray(documentModel?.files) ? documentModel.files : [];
    const match = files.find((file) => (
        file?.language === type
        || file?.blockType === type
        || file?.slot === type
    ));

    if (match?.path) {
        return match.path;
    }

    return type === 'vertex' ? 'shader.vert' : 'shader.frag';
}

export function parseShaderCompilerLog(log = '', { file = '', stage = 'fragment' } = {}) {
    const source = String(log || '').replace(/\r\n/g, '\n');
    const lines = source
        .split('\n')
        .map((entry) => entry.trim())
        .filter(Boolean);

    const code = stage === 'vertex'
        ? 'shader-vertex-compile-error'
        : stage === 'fragment'
            ? 'shader-fragment-compile-error'
            : 'shader-compile-error';

    const diagnostics = lines.map((line) => {
        const webglMatch = line.match(/^(ERROR|WARNING):\s*\d+\s*:\s*(\d+)\s*:\s*(.+)$/i);
        if (webglMatch) {
            return createShaderDiagnostic(
                webglMatch[1].toUpperCase() === 'WARNING' ? 'warning' : 'error',
                code,
                webglMatch[3].trim(),
                {
                    file: file || null,
                    line: Number.parseInt(webglMatch[2], 10) || null,
                    slot: stage,
                    type: stage,
                }
            );
        }

        const angleMatch = line.match(/^\d+\s*:\s*(\d+)\s*:\s*(.+)$/);
        if (angleMatch) {
            return createShaderDiagnostic(
                'error',
                code,
                angleMatch[2].trim(),
                {
                    file: file || null,
                    line: Number.parseInt(angleMatch[1], 10) || null,
                    slot: stage,
                    type: stage,
                }
            );
        }

        return createShaderDiagnostic(
            'error',
            code,
            line,
            {
                file: file || null,
                slot: stage,
                type: stage,
            }
        );
    });

    return diagnostics.length > 0
        ? diagnostics
        : [
            createShaderDiagnostic(
                'error',
                code,
                `${stage === 'vertex' ? 'Vertex' : 'Fragment'} shader compilation failed.`,
                {
                    file: file || null,
                    slot: stage,
                    type: stage,
                }
            ),
        ];
}

function compileShaderStage(gl, type, source, { file = '', stage = 'fragment' } = {}) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return {
            diagnostics: [],
            shader,
        };
    }

    const log = gl.getShaderInfoLog(shader) || '';
    const diagnostics = parseShaderCompilerLog(log, { file, stage });
    gl.deleteShader(shader);

    return {
        diagnostics,
        shader: null,
    };
}

export function validateShaderPreviewDocument(documentModel) {
    const shaderConfig = getShaderConfig(documentModel);
    if (!shaderConfig.enabled) return [];

    const structuralErrors = (documentModel?.diagnostics || []).filter((diagnostic) => diagnostic.level === 'error');
    if (structuralErrors.length > 0) return [];

    if (typeof document === 'undefined') {
        return [];
    }

    const blocks = Array.isArray(documentModel?.blocks) ? documentModel.blocks : [];
    const vertexBlock = blocks.find((block) => block.type === 'vertex') || null;
    const fragmentBlock = blocks.find((block) => block.type === 'fragment') || null;

    if (!vertexBlock || !fragmentBlock) return [];

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        preserveDrawingBuffer: false,
        stencil: false,
    }) || canvas.getContext('experimental-webgl');

    if (!gl) {
        return [
            createShaderDiagnostic(
                'error',
                'shader-webgl-context-unavailable',
                'This browser could not create a WebGL context for shader preview.'
            ),
        ];
    }

    const vertexFile = getShaderFilePath(documentModel, 'vertex');
    const fragmentFile = getShaderFilePath(documentModel, 'fragment');
    let vertexShader = null;
    let fragmentShader = null;
    let program = null;
    const diagnostics = [];

    try {
        const vertexResult = compileShaderStage(gl, gl.VERTEX_SHADER, vertexBlock.content || '', {
            file: vertexFile,
            stage: 'vertex',
        });
        diagnostics.push(...vertexResult.diagnostics);
        vertexShader = vertexResult.shader;

        const fragmentResult = compileShaderStage(gl, gl.FRAGMENT_SHADER, fragmentBlock.content || '', {
            file: fragmentFile,
            stage: 'fragment',
        });
        diagnostics.push(...fragmentResult.diagnostics);
        fragmentShader = fragmentResult.shader;

        if (!vertexShader || !fragmentShader) {
            return diagnostics;
        }

        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            diagnostics.push(
                createShaderDiagnostic(
                    'error',
                    'shader-program-link-error',
                    gl.getProgramInfoLog(program) || 'Shader program linking failed.',
                    {
                        slot: 'program',
                        type: 'shader-program',
                    }
                )
            );
            return diagnostics;
        }

        const positionLocation = gl.getAttribLocation(program, 'a_position');
        if (positionLocation < 0) {
            diagnostics.push(
                createShaderDiagnostic(
                    'error',
                    'shader-position-attribute-missing',
                    'Vertex shader must declare attribute vec2 a_position for the fullscreen quad.',
                    {
                        file: vertexFile,
                        slot: 'vertex',
                        type: 'vertex',
                    }
                )
            );
        }

        return diagnostics;
    } finally {
        if (program) {
            gl.deleteProgram(program);
        }

        if (vertexShader) {
            gl.deleteShader(vertexShader);
        }

        if (fragmentShader) {
            gl.deleteShader(fragmentShader);
        }
    }
}

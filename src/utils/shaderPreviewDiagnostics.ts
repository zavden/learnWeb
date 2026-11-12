// Shader compile diagnostics for the preview: compiles the example's vertex and fragment shaders in a
// hidden WebGL context and turns the driver's info logs into `Diagnostic`s (src/types/diagnostics.ts), so
// the editor can list them and mark the lines before the shader page even runs.
//
// Called by src/components/Preview.ts (shader renders), tools/verify-examples.ts and
// scripts/snapshot-material.ts; the diagnostics are passed on to renderShaderExampleDocument()
// (src/utils/renderer/shaderRenderer.ts), whose page compiles the same sources again to draw.
//
// Without a DOM (Node: tests, scripts) validation is skipped and returns `[]`. One WebGL context is shared
// by every validation (see `getValidationContext`).

import type { ExampleDocumentInput, ShaderBlockType } from '../types/document.ts';
import type { Diagnostic, DiagnosticDetails, DiagnosticLevel } from '../types/diagnostics.ts';
import { getShaderConfig } from './markdown.ts';

/** Options of `parseShaderCompilerLog()`. */
export interface ShaderCompilerLogOptions {
    /** Document path of the shader file, reported as the diagnostics' `file` (`null` when empty). */
    file?: string;
    /** Stage that produced the log; picks the diagnostic code and becomes `slot` and `type`. Default 'fragment'. */
    stage?: ShaderBlockType;
}

/** A compiled stage: the shader, or `null` and the diagnostics of its compile log. */
interface ShaderStageResult {
    diagnostics: Diagnostic[];
    shader: WebGLShader | null;
}

function createShaderDiagnostic(level: DiagnosticLevel, code: string, message: string, details: DiagnosticDetails = {}): Diagnostic {
    return {
        level,
        code,
        message,
        ...details,
    };
}

/** Path of the document file of a stage (`shader.vert` / `shader.frag` when none matches). */
function getShaderFilePath(documentModel: ExampleDocumentInput, type: ShaderBlockType): string {
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

/**
 * Turn a WebGL shader info log into diagnostics, one per non-empty line: `ERROR: 0:7: msg`,
 * `WARNING: 0:7: msg` (level 'warning') and the bare `0:7: msg` form give a `line`; any other line becomes
 * an error without one.
 * An empty log gives one generic "<Stage> shader compilation failed." error.
 */
export function parseShaderCompilerLog(log: string | null = '', { file = '', stage = 'fragment' }: ShaderCompilerLogOptions = {}): Diagnostic[] {
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

/** Compile one stage; on failure the shader is deleted and its log parsed. `type` is `gl.VERTEX_SHADER` or `gl.FRAGMENT_SHADER`. */
function compileShaderStage(gl: WebGLRenderingContext, type: number, source: string, { file = '', stage = 'fragment' }: ShaderCompilerLogOptions = {}): ShaderStageResult {
    // `!`: createShader() only returns null when the context is lost.
    const shader = gl.createShader(type)!;
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

// One shared, never-displayed WebGL context is reused for every validation. Creating a fresh context
// per render leaked GPU contexts until GC (Chrome caps them at ~16 and then kills the oldest one).
let validationCanvas: HTMLCanvasElement | null = null;
let validationContext: WebGLRenderingContext | null = null;

/** The shared validation context, created (again) when there is none or it was lost; `null` without WebGL. */
function getValidationContext(): WebGLRenderingContext | null {
    if (validationContext && !validationContext.isContextLost()) {
        return validationContext;
    }

    if (validationContext) {
        validationContext = null;
        validationCanvas = null;
    }

    validationCanvas = document.createElement('canvas');
    validationCanvas.width = 1;
    validationCanvas.height = 1;
    validationCanvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        validationContext = null;
        validationCanvas = null;
    });
    validationContext = validationCanvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        preserveDrawingBuffer: false,
        stencil: false,
    }) || validationCanvas.getContext('experimental-webgl') as WebGLRenderingContext | null;

    return validationContext;
}

/**
 * Compile and link the document's shaders and report what fails (`[]` when they are fine). Returns `[]`
 * without checking when the document is not a shader example, already has structural errors, lacks a
 * vertex or fragment block, or there is no DOM; one error when WebGL is unavailable. Also reports a
 * vertex shader without the `a_position` attribute the preview's fullscreen quad needs.
 */
export function validateShaderPreviewDocument(documentModel: ExampleDocumentInput): Diagnostic[] {
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

    const gl = getValidationContext();

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
    let vertexShader: WebGLShader | null = null;
    let fragmentShader: WebGLShader | null = null;
    let program: WebGLProgram | null = null;
    const diagnostics: Diagnostic[] = [];

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

        // `!`: createProgram() only returns null when the context is lost.
        program = gl.createProgram()!;
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

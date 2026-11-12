import { completeFromList, snippetCompletion } from '@codemirror/autocomplete';
import { StreamLanguage } from '@codemirror/language';

const GLSL_KEYWORDS = new Set([
    'attribute',
    'break',
    'case',
    'const',
    'continue',
    'default',
    'discard',
    'do',
    'else',
    'for',
    'if',
    'in',
    'inout',
    'layout',
    'out',
    'precision',
    'return',
    'struct',
    'switch',
    'uniform',
    'varying',
    'while',
]);

const GLSL_QUALIFIERS = new Set([
    'flat',
    'highp',
    'invariant',
    'lowp',
    'mediump',
    'noperspective',
    'readonly',
    'smooth',
    'volatile',
    'writeonly',
]);

const GLSL_TYPES = new Set([
    'bool',
    'bvec2',
    'bvec3',
    'bvec4',
    'float',
    'int',
    'ivec2',
    'ivec3',
    'ivec4',
    'mat2',
    'mat2x2',
    'mat2x3',
    'mat2x4',
    'mat3',
    'mat3x2',
    'mat3x3',
    'mat3x4',
    'mat4',
    'mat4x2',
    'mat4x3',
    'mat4x4',
    'sampler2D',
    'sampler2DShadow',
    'samplerCube',
    'samplerCubeShadow',
    'samplerExternalOES',
    'uint',
    'uvec2',
    'uvec3',
    'uvec4',
    'vec2',
    'vec3',
    'vec4',
    'void',
]);

const GLSL_BUILTINS = new Set([
    'abs',
    'acos',
    'all',
    'any',
    'asin',
    'atan',
    'ceil',
    'clamp',
    'cos',
    'cross',
    'degrees',
    'distance',
    'dot',
    'dFdx',
    'dFdy',
    'exp',
    'exp2',
    'faceforward',
    'floor',
    'fract',
    'gl_FragColor',
    'gl_FragCoord',
    'gl_FrontFacing',
    'gl_PointCoord',
    'gl_PointSize',
    'gl_Position',
    'glsl',
    'inversesqrt',
    'length',
    'log',
    'log2',
    'max',
    'min',
    'mix',
    'mod',
    'normalize',
    'pow',
    'radians',
    'reflect',
    'refract',
    'sign',
    'sin',
    'smoothstep',
    'sqrt',
    'step',
    'tan',
    'texture',
    'texture2D',
    'textureCube',
]);

const GLSL_BOOLEAN_LITERALS = new Set(['true', 'false']);
const GLSL_SHADER_RUNTIME_UNIFORMS = [
    'u_time',
    'u_delta',
    'u_resolution',
    'u_mouse',
    'u_mouse_pressed',
    'u_frame',
];

export function classifyGlslIdentifier(identifier = '') {
    const value = String(identifier || '');

    if (GLSL_KEYWORDS.has(value)) return 'keyword';
    if (GLSL_QUALIFIERS.has(value)) return 'modifier';
    if (GLSL_TYPES.has(value)) return 'typeName';
    if (GLSL_BOOLEAN_LITERALS.has(value)) return 'bool';
    if (GLSL_BUILTINS.has(value)) return 'variableName.standard';
    return 'variableName';
}

function buildKeywordCompletion(label) {
    return {
        label,
        type: 'keyword',
        info: 'GLSL keyword',
    };
}

function buildTypeCompletion(label) {
    return {
        label,
        type: 'type',
        info: 'GLSL type',
    };
}

function buildBuiltinCompletion(label, detail = 'GLSL builtin') {
    return {
        label,
        type: 'function',
        info: detail,
    };
}

function buildVariableCompletion(label, detail) {
    return {
        label,
        type: 'variable',
        info: detail,
    };
}

const GLSL_SNIPPET_COMPLETIONS = [
    snippetCompletion(
        [
            'void main() {',
            '\t${}',
            '}',
        ].join('\n'),
        {
            label: 'main()',
            type: 'snippet',
            detail: 'Entry point',
            info: 'Insert a `main()` function scaffold.',
        },
    ),
    snippetCompletion(
        'precision ${mediump} float;',
        {
            label: 'precision mediump float',
            type: 'snippet',
            detail: 'Precision qualifier',
            info: 'Insert a precision declaration for fragment shaders.',
        },
    ),
    snippetCompletion(
        'uniform ${float} ${name};',
        {
            label: 'uniform ...',
            type: 'snippet',
            detail: 'Uniform declaration',
            info: 'Insert a basic uniform declaration.',
        },
    ),
    snippetCompletion(
        'varying ${vec2} ${name};',
        {
            label: 'varying ...',
            type: 'snippet',
            detail: 'Varying declaration',
            info: 'Insert a varying declaration shared between vertex and fragment shaders.',
        },
    ),
    snippetCompletion(
        'attribute vec2 a_position;',
        {
            label: 'attribute a_position',
            type: 'snippet',
            detail: 'Fullscreen quad input',
            info: 'Insert the common `a_position` attribute used by this app shader runtime.',
        },
    ),
    snippetCompletion(
        'vec2(${x}, ${y})',
        {
            label: 'vec2()',
            type: 'snippet',
            detail: 'vec2 constructor',
            info: 'Insert a `vec2` constructor snippet.',
        },
    ),
    snippetCompletion(
        'vec3(${x}, ${y}, ${z})',
        {
            label: 'vec3()',
            type: 'snippet',
            detail: 'vec3 constructor',
            info: 'Insert a `vec3` constructor snippet.',
        },
    ),
    snippetCompletion(
        'vec4(${x}, ${y}, ${z}, ${w})',
        {
            label: 'vec4()',
            type: 'snippet',
            detail: 'vec4 constructor',
            info: 'Insert a `vec4` constructor snippet.',
        },
    ),
];

export function getGlslCompletionEntries() {
    return [
        ...GLSL_SNIPPET_COMPLETIONS,
        ...Array.from(GLSL_KEYWORDS, buildKeywordCompletion),
        ...Array.from(GLSL_QUALIFIERS, buildKeywordCompletion),
        ...Array.from(GLSL_TYPES, buildTypeCompletion),
        ...Array.from(GLSL_BUILTINS, (label) => buildBuiltinCompletion(label)),
        ...Array.from(GLSL_BOOLEAN_LITERALS, (label) => buildVariableCompletion(label, 'Boolean literal')),
        ...GLSL_SHADER_RUNTIME_UNIFORMS.map((label) => buildVariableCompletion(label, 'Runtime uniform exposed by the shader preview')),
        buildVariableCompletion('a_position', 'Common vertex attribute used by the fullscreen quad runtime'),
    ];
}

function readBlockComment(stream, state) {
    while (!stream.eol()) {
        const ch = stream.next();
        if (ch === '*' && stream.eat('/')) {
            state.inBlockComment = false;
            break;
        }
    }

    return 'blockComment';
}

function readQuotedLiteral(stream, quote) {
    let escaped = false;

    while (!stream.eol()) {
        const ch = stream.next();
        if (escaped) {
            escaped = false;
            continue;
        }

        if (ch === '\\') {
            escaped = true;
            continue;
        }

        if (ch === quote) {
            break;
        }
    }

    return quote === '"' ? 'string' : 'character';
}

const glslStreamParser = {
    startState() {
        return {
            inBlockComment: false,
        };
    },

    token(stream, state) {
        if (state.inBlockComment) {
            return readBlockComment(stream, state);
        }

        if (stream.eatSpace()) {
            return null;
        }

        if (stream.sol() && stream.peek() === '#') {
            stream.skipToEnd();
            return 'meta';
        }

        if (stream.match('//')) {
            stream.skipToEnd();
            return 'lineComment';
        }

        if (stream.match('/*')) {
            state.inBlockComment = true;
            return readBlockComment(stream, state);
        }

        const next = stream.peek();
        if (next === '"' || next === '\'') {
            stream.next();
            return readQuotedLiteral(stream, next);
        }

        if (stream.match(/^0x[0-9a-fA-F]+u?/)) {
            return 'integer';
        }

        if (stream.match(/^(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?f?/)) {
            const token = stream.current();
            return /[.eEfF]/.test(token) ? 'float' : 'integer';
        }

        if (stream.match(/^[A-Za-z_][A-Za-z0-9_]*/)) {
            return classifyGlslIdentifier(stream.current());
        }

        if (stream.match(/^(?:&&|\|\||==|!=|<=|>=|\+\+|--|<<|>>)/)) {
            return 'operator';
        }

        const ch = stream.next();

        if ('+-*/%=!<>?:&|^~'.includes(ch)) {
            return 'operator';
        }

        if (ch === '(' || ch === ')') {
            return 'paren';
        }

        if (ch === '[' || ch === ']') {
            return 'squareBracket';
        }

        if (ch === '{' || ch === '}') {
            return 'brace';
        }

        if (ch === ',' || ch === ';' || ch === '.') {
            return 'separator';
        }

        return null;
    },

    languageData: {
        closeBrackets: { brackets: ['(', '[', '{', '"', '\''] },
        commentTokens: { block: { close: '*/', open: '/*' }, line: '//' },
        indentOnInput: /^\s*[}\]]$/,
    },
};

const glslLanguageSupport = StreamLanguage.define(glslStreamParser);
const glslCompletionSource = completeFromList(getGlslCompletionEntries());

export function glslLanguage() {
    return [
        glslLanguageSupport,
        glslLanguageSupport.data.of({
            autocomplete: glslCompletionSource,
        }),
    ];
}

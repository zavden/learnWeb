import test from 'node:test';
import assert from 'node:assert/strict';

import { classifyGlslIdentifier, getGlslCompletionEntries } from '../src/editor/glslLanguage.js';

test('GLSL identifier classifier tags core shader tokens', () => {
    assert.equal(classifyGlslIdentifier('uniform'), 'keyword');
    assert.equal(classifyGlslIdentifier('mediump'), 'modifier');
    assert.equal(classifyGlslIdentifier('vec3'), 'typeName');
    assert.equal(classifyGlslIdentifier('true'), 'bool');
    assert.equal(classifyGlslIdentifier('gl_FragCoord'), 'variableName.standard');
    assert.equal(classifyGlslIdentifier('tintColor'), 'variableName');
});

test('GLSL completion catalog exposes snippets, runtime uniforms and builtins', () => {
    const entries = getGlslCompletionEntries();
    const labels = new Set(entries.map((entry) => entry.label));

    assert.ok(labels.has('main()'));
    assert.ok(labels.has('uniform ...'));
    assert.ok(labels.has('varying ...'));
    assert.ok(labels.has('vec2()'));
    assert.ok(labels.has('vec3()'));
    assert.ok(labels.has('vec4()'));
    assert.ok(labels.has('u_time'));
    assert.ok(labels.has('u_resolution'));
    assert.ok(labels.has('a_position'));
    assert.ok(labels.has('gl_FragColor'));
    assert.ok(labels.has('texture2D'));
    assert.ok(labels.has('sampler2D'));

    const mainSnippet = entries.find((entry) => entry.label === 'main()');
    const runtimeUniform = entries.find((entry) => entry.label === 'u_time');
    const builtin = entries.find((entry) => entry.label === 'texture2D');

    assert.equal(mainSnippet?.type, 'snippet');
    assert.equal(runtimeUniform?.type, 'variable');
    assert.equal(builtin?.type, 'function');
});

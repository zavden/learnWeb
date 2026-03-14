import test from 'node:test';
import assert from 'node:assert/strict';

import { classifyGlslIdentifier } from '../src/editor/glslLanguage.js';

test('GLSL identifier classifier tags core shader tokens', () => {
    assert.equal(classifyGlslIdentifier('uniform'), 'keyword');
    assert.equal(classifyGlslIdentifier('mediump'), 'modifier');
    assert.equal(classifyGlslIdentifier('vec3'), 'typeName');
    assert.equal(classifyGlslIdentifier('true'), 'bool');
    assert.equal(classifyGlslIdentifier('gl_FragCoord'), 'variableName.standard');
    assert.equal(classifyGlslIdentifier('tintColor'), 'variableName');
});

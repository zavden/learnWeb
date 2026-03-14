import test from 'node:test';
import assert from 'node:assert/strict';

import { shaderAlphaToUnit, shaderHexToVec, shaderVecToHex } from '../src/utils/shaderColor.js';

test('shaderVecToHex converts normalized vec3 values to hex', () => {
    assert.equal(shaderVecToHex([1, 0.5, 0]), '#ff8000');
});

test('shaderHexToVec converts hex colors to normalized vec3 values', () => {
    const vector = shaderHexToVec('#4080ff');
    assert.deepEqual(vector.map((value) => Number(value.toFixed(4))), [0.251, 0.502, 1]);
});

test('shaderAlphaToUnit clamps invalid alpha values to 0..1', () => {
    assert.equal(shaderAlphaToUnit(1.4), 1);
    assert.equal(shaderAlphaToUnit(-2), 0);
    assert.equal(shaderAlphaToUnit('bad', 1), 1);
});

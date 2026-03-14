import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildExampleDocument,
    getShaderConfig,
    parseExampleDocument,
    updateShaderTextureDefinitions,
} from '../src/utils/markdown.js';

test('updateShaderTextureDefinitions serializes and reparses shader_textures metadata', () => {
    const documentModel = parseExampleDocument(`---
renderer: shader
resolution: 800x600
---

# Vertex

\`\`\`vertex
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
\`\`\`

# Fragment

\`\`\`fragment
precision mediump float;
uniform sampler2D u_checker;
uniform sampler2D u_spot;

void main() {
  gl_FragColor = texture2D(u_checker, vec2(0.5)) * 0.75 + texture2D(u_spot, vec2(0.5)) * 0.25;
}
\`\`\``);

    const updated = updateShaderTextureDefinitions(documentModel, [
        { name: 'u_checker', assetPath: 'checker.svg' },
        { name: 'u_spot', assetPath: 'spotlight.svg' },
    ]);

    assert.equal(updated.metadata.shader_textures, 'u_checker=checker.svg|u_spot=spotlight.svg');
    assert.deepEqual(
        getShaderConfig(updated).textures.map((texture) => ({ name: texture.name, assetPath: texture.assetPath })),
        [
            { name: 'u_checker', assetPath: 'checker.svg' },
            { name: 'u_spot', assetPath: 'spotlight.svg' },
        ]
    );

    const rebuilt = parseExampleDocument(buildExampleDocument(updated));
    assert.equal(rebuilt.metadata.shader_textures, 'u_checker=checker.svg|u_spot=spotlight.svg');
    assert.deepEqual(
        getShaderConfig(rebuilt).textures.map((texture) => ({ name: texture.name, assetPath: texture.assetPath })),
        [
            { name: 'u_checker', assetPath: 'checker.svg' },
            { name: 'u_spot', assetPath: 'spotlight.svg' },
        ]
    );
});

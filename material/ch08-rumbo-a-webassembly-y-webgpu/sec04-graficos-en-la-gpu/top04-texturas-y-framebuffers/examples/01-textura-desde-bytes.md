---
example_description: "Una textura hecha byte a byte: un corazón de 8 × 8 píxeles en un Uint8Array (4 bytes por píxel, como un ImageData) que texImage2D sube a la GPU. El fragment shader lo lee con texture() en coordenadas uv de 0 a 1, y con el filtro NEAREST cada píxel de la textura se ve como un cuadrado nítido. OJO: la primera fila de bytes es la de ABAJO"
example_tags: "javascript|webgl2|texturas|teximage2d|uint8array|sampler2d|uv|pixel-art"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Una textura de 8 × 8 bytes</h1>
  <canvas id="stage" role="img" aria-label="Un corazón rojo de 8 por 8 píxeles, ampliado"></canvas>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5; // (0, 0) abajo a la izquierda, (1, 1) arriba a la derecha
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
uniform sampler2D u_texture; // una textura: se lee con texture(textura, uv)
in vec2 v_uv;
out vec4 outColor;
void main() {
  outColor = texture(u_texture, v_uv);
}
</script>
```

# CSS

```css
:root {
  color-scheme: dark;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #e2e8f0;
  background: #0f172a;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
canvas {
  display: block;
  width: 160px;
  height: 160px;
  outline: 1px solid #334155;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Usa assets/webgl/utils.js (léelo con «Assets»).
import { createProgram, shaderFromScript, readPixel, fullScreenQuad, releaseOnPageHide } from './webgl/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// El dibujo, fila a fila de ARRIBA abajo: R = rojo #e11d48, . = fondo #0f172a
const SPRITE = [
  '........',
  '.RR..RR.',
  'RRRRRRRR',
  'RRRRRRRR',
  '.RRRRRR.',
  '..RRRR..',
  '...RR...',
  '........',
];
const COLORS = { R: [225, 29, 72, 255], '.': [15, 23, 42, 255] };
// texImage2D pone la PRIMERA fila de bytes en v = 0, ABAJO: subimos las filas de abajo arriba
const bytes = new Uint8Array(8 * 8 * 4);
[...SPRITE].reverse().forEach((row, y) => {
  [...row].forEach((cell, x) => bytes.set(COLORS[cell], (y * 8 + x) * 4));
});
log(`textura → 8 × 8 píxeles × 4 bytes = ${bytes.length} bytes`);

const canvas = document.querySelector('#stage');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
canvas.width = Math.round(canvas.clientWidth * devicePixelRatio);
canvas.height = Math.round(canvas.clientHeight * devicePixelRatio);
gl.viewport(0, 0, canvas.width, canvas.height);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
fullScreenQuad(gl, program);

// La textura: crear, enlazar, subir los bytes y elegir cómo se leen
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 8, 8, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // al reducir: el más cercano
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // al ampliar: el más cercano
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

gl.useProgram(program);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // u_texture vale 0: lee la textura de la unidad 0
log(`centro → ${readPixel(gl, Math.floor(canvas.width / 2), Math.floor(canvas.height / 2))} (rojo: el corazón)`);
log(`esquina de abajo a la izquierda → ${readPixel(gl, 0, 0)} (el fondo)`);
```

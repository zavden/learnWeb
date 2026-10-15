---
example_description: "Solución: UNPACK_FLIP_Y_WEBGL a true justo antes de texImage2D (y de vuelta a false después), así la primera fila de la imagen queda arriba; las seis comprobaciones salen ✅"
example_tags: "javascript|webgl2|texturas|unpack-flip-y|imagen|readpixels|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Postal del pueblo</h1>
  <canvas id="postcard" role="img" aria-label="Un paisaje pixelado: cielo, sol, una casa con tejado rojo y hierba"></canvas>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
layout(location = 0) in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5; // v = 0 abajo, v = 1 arriba
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
uniform sampler2D u_texture;
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
  width: 192px;
  height: 144px;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Usa assets/webgl/utils.js y assets/scene.png (léelos con «Assets»).
import { createProgram, shaderFromScript, fullScreenQuad, fitCanvas, readPixel, errorName, loadImage, releaseOnPageHide } from './webgl/utils.js';

const image = await loadImage('scene.png'); // 16 × 12 píxeles
const canvas = document.querySelector('#postcard');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
const [width, height] = fitCanvas(canvas);
gl.viewport(0, 0, width, height);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
fullScreenQuad(gl, program);
gl.useProgram(program);

gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
// La imagen guarda primero su fila de ARRIBA y la textura la pondría en v = 0: se voltea al subirla
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
const uploadError = errorName(gl, gl.getError());
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); // es un ajuste global: no afecta a otras subidas
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

// ── Comprobaciones (no hace falta tocarlas) ───────────────────────────────────────────
const logList = document.querySelector('#log');
function check(description, actual, expected) {
  const ok = actual === expected;
  if (ok) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', expected, 'y obtuve', actual);
  logList.append(Object.assign(document.createElement('li'), { textContent: `${ok ? '✅' : '❌'} ${description}` }));
}
// El color en pantalla del píxel (columna, fila) de la imagen, contando las filas desde ARRIBA
const at = (column, row) => readPixel(gl, Math.floor(((column + 0.5) / 16) * width), Math.floor(((12 - row - 0.5) / 12) * height));
check('la imagen se sube sin errores', uploadError, 'NO_ERROR');
check('arriba en el centro, cielo', at(8, 1), '125, 211, 252, 255');
check('abajo en el centro, hierba', at(8, 10), '22, 163, 74, 255');
check('el sol, arriba a la derecha', at(12, 2), '250, 204, 21, 255');
check('el tejado, a la izquierda', at(4, 4), '220, 38, 38, 255');
check('la puerta, abajo', at(4, 8), '120, 53, 15, 255');
```

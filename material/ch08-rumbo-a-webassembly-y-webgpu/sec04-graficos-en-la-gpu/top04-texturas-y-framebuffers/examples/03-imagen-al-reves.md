---
example_description: "Una imagen subida con texImage2D sale cabeza abajo: la imagen guarda su fila de ARRIBA la primera, y la textura pone la primera fila en v = 0, ABAJO. pixelStorei(UNPACK_FLIP_Y_WEBGL, true) le da la vuelta al subirla (o se invierte v en el shader). Un paisaje de 16 × 12 píxeles: a la izquierda con el cielo abajo, a la derecha bien"
example_tags: "javascript|webgl2|texturas|imagen|unpack-flip-y|coordenadas|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>¿Por qué sale al revés?</h1>
  <canvas id="stage" role="img" aria-label="Dos veces el mismo paisaje con casa y sol: a la izquierda cabeza abajo, a la derecha al derecho"></canvas>
  <p class="labels"><span>🐛 sin FLIP_Y</span><span>✅ con FLIP_Y</span></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
in vec2 a_position;
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
  width: 320px;
  height: 120px;
}
.labels {
  display: flex;
  width: 320px;
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
}
.labels span {
  flex: 1;
  text-align: center;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Usa assets/webgl/utils.js y la imagen assets/scene.png (16 × 12 píxeles: cielo arriba, hierba abajo).
import { createProgram, shaderFromScript, readPixel, fullScreenQuad, loadImage, releaseOnPageHide } from './webgl/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const image = await loadImage('scene.png'); // crossOrigin = 'anonymous' incluido (ejemplo 10)
const canvas = document.querySelector('#stage');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
canvas.width = Math.round(canvas.clientWidth * devicePixelRatio);
canvas.height = Math.round(canvas.clientHeight * devicePixelRatio);
const half = canvas.width / 2;
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
fullScreenQuad(gl, program);
gl.useProgram(program);

function upload(flipY) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY); // ajuste GLOBAL: vale para las subidas siguientes
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); // tamaño: el de la imagen
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return texture;
}
const asIs = upload(false);   // 🐛 la fila 0 de la imagen (cielo) acaba en v = 0 (abajo)
const flipped = upload(true); // ✅ volteada al subirla
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

gl.viewport(0, 0, half, canvas.height);
gl.bindTexture(gl.TEXTURE_2D, asIs);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
gl.viewport(half, 0, half, canvas.height);
gl.bindTexture(gl.TEXTURE_2D, flipped);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

// Arriba en el centro de cada mitad (v = 0.875): ¿cielo #7dd3fc o hierba #16a34a?
const topRow = Math.floor(canvas.height * 0.875);
log(`imagen → ${image.naturalWidth} × ${image.naturalHeight} píxeles`);
log(`🐛 sin FLIP_Y, arriba → ${readPixel(gl, Math.floor(half / 2), topRow)} (hierba)`);
log(`✅ con FLIP_Y, arriba → ${readPixel(gl, Math.floor(half * 1.5), topRow)} (cielo)`);
// Otra solución, en el shader: texture(u_texture, vec2(v_uv.x, 1.0 - v_uv.y)).
// Los shaders de LearnWeb (renderer: shader) ya suben sus texturas con FLIP_Y.
```

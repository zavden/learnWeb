---
example_description: "La convolución 3 × 3 de la lección «Píxeles», ahora en un fragment shader: cada píxel lee a sus 8 vecinos con desplazamientos de un píxel de la textura (1 / tamaño) y los multiplica por los 9 pesos de un uniform float[9]. La fila de prueba de aquella lección da exactamente los mismos números que el bucle de la CPU, y los botones aplican cada núcleo al cuadro de Velasco en un solo dibujo"
example_tags: "javascript|webgl2|texturas|convolucion|kernel|filtros|desenfoque|bordes"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Convolución en la GPU</h1>
  <canvas id="stage" role="img" aria-label="José María Velasco, Valle de México, con el filtro elegido"></canvas>
  <div class="buttons" role="group" aria-label="Núcleos">
    <button type="button" data-kernel="identity">Original</button>
    <button type="button" data-kernel="blur">Desenfocar</button>
    <button type="button" data-kernel="sharpen">Enfocar</button>
    <button type="button" data-kernel="edges">Bordes</button>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
  <p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform float u_kernel[9]; // los 9 pesos, fila a fila, de ARRIBA abajo
in vec2 v_uv;
out vec4 outColor;
void main() {
  // Un píxel de la textura, en unidades uv (en un shader de LearnWeb, 1.0 / u_resolution
  // si el lienzo mide lo mismo que la imagen)
  vec2 onePixel = 1.0 / vec2(textureSize(u_image, 0));
  vec3 sum = vec3(0.0);
  for (int row = 0; row < 3; row++) {
    for (int col = 0; col < 3; col++) {
      vec2 offset = vec2(col - 1, 1 - row) * onePixel; // la fila 0 es la de arriba: v + 1
      sum += texture(u_image, v_uv + offset).rgb * u_kernel[row * 3 + col];
    }
  }
  outColor = vec4(sum, 1.0); // al escribirlo, lo que pase de 0..1 se recorta (como Uint8ClampedArray)
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
  width: 240px;
  height: 165px;
}
.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.75rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.6rem;
}
button:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
.credit {
  font-size: 0.8rem;
  color: #94a3b8;
}
```

# JavaScript

```javascript
// Usa assets/webgl/utils.js y assets/valley-of-mexico.jpg (léelos con «Assets»).
import { createProgram, shaderFromScript, fullScreenQuad, textureFromBytes, loadImage, releaseOnPageHide } from './webgl/utils.js';

// Los núcleos de la lección «Píxeles»
const KERNELS = {
  identity: [0, 0, 0, 0, 1, 0, 0, 0, 0],
  blur: Array(9).fill(1 / 9),
  sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
  edges: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
};
const LABELS = { identity: 'Original', blur: 'Desenfocar', sharpen: 'Enfocar', edges: 'Bordes' };
const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const image = await loadImage('valley-of-mexico.jpg');
const canvas = document.querySelector('#stage');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
fullScreenQuad(gl, program);
gl.useProgram(program);
const kernelLocation = gl.getUniformLocation(program, 'u_kernel');

// 1. La fila de prueba de la lección «Píxeles»: 5 × 1 píxeles grises, filtrada en la GPU
const row = [40, 40, 40, 200, 200];
const testTexture = textureFromBytes(gl, 5, 1, new Uint8Array(row.flatMap((v) => [v, v, v, 255])));
log(`fila de prueba → ${row.join(', ')}`);
const out = new Uint8Array(5 * 4);
gl.viewport(0, 0, 5, 1); // dibujar en un trozo de 5 × 1 píxeles del lienzo
for (const name of ['blur', 'sharpen', 'edges']) {
  gl.uniform1fv(kernelLocation, KERNELS[name]);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.readPixels(0, 0, 5, 1, gl.RGBA, gl.UNSIGNED_BYTE, out);
  log(`${LABELS[name]} → ${out.filter((_, i) => i % 4 === 0).join(', ')}`);
}
gl.deleteTexture(testTexture);

// 2. El cuadro: un píxel del lienzo = un píxel de la imagen, para que «un vecino» sea un píxel
canvas.width = image.naturalWidth;
canvas.height = image.naturalHeight;
gl.viewport(0, 0, canvas.width, canvas.height);
gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // ejemplo 03
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // cada vecino, tal cual
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // fuera: el píxel del borde
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

function apply(name) {
  gl.uniform1fv(kernelLocation, KERNELS[name]);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // 158 400 píxeles, cada uno con sus 9 lecturas, a la vez
}
apply('identity');
log('Listo: elige un núcleo');
document.querySelector('.buttons').addEventListener('click', (event) => {
  const name = event.target.closest('button')?.dataset.kernel;
  if (!name) return;
  apply(name);
  log(`${LABELS[name]}: ${canvas.width * canvas.height} píxeles × 9 lecturas, en un solo dibujo`);
});
```

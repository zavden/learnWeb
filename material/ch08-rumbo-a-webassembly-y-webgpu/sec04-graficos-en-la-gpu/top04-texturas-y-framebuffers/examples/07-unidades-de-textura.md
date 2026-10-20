---
example_description: "Dos texturas en un mismo shader: el cuadro en la unidad 0 y una paleta de 256 colores en la unidad 1 (activeTexture + bindTexture + uniform1i con el número de unidad). La luminancia de cada píxel elige un color de la paleta: un «mapa de degradado» como el de los editores de fotos. El botón cambia solo la paleta, con texSubImage2D"
example_tags: "javascript|webgl2|texturas|unidades-de-textura|activetexture|sampler2d|texsubimage2d|paleta"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Un mapa de degradado</h1>
  <canvas id="stage" role="img" aria-label="Valle de México: la mitad izquierda en color, la derecha recoloreada con una paleta"></canvas>
  <button id="next" type="button">Cambiar paleta</button>
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
uniform sampler2D u_image;   // unidad 0: el cuadro
uniform sampler2D u_palette; // unidad 1: una tira de 256 × 1 colores
in vec2 v_uv;
out vec4 outColor;
void main() {
  vec3 color = texture(u_image, v_uv).rgb;
  if (v_uv.x > 0.5) {
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = texture(u_palette, vec2(luma, 0.5)).rgb; // oscuro → izquierda de la paleta; claro → derecha
  }
  outColor = vec4(color, 1.0);
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
button {
  font: inherit;
  margin-top: 0.75rem;
  padding: 0.3rem 0.8rem;
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

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Una paleta de 256 colores interpolando tres colores de parada (oscuro, medio, claro)
const PALETTES = {
  'noche y cempasúchil': [[30, 27, 75], [228, 0, 124], [255, 159, 28]],
  'océano': [[8, 47, 73], [14, 165, 233], [236, 254, 255]],
  'sepia': [[41, 24, 12], [146, 102, 61], [253, 246, 227]],
};
function paletteBytes([dark, middle, light]) {
  const bytes = new Uint8Array(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    const [from, to, local] = t < 0.5 ? [dark, middle, t * 2] : [middle, light, (t - 0.5) * 2];
    bytes.set([...from.map((c, k) => c + (to[k] - c) * local), 255], i * 4); // Uint8Array trunca los decimales
  }
  return bytes;
}

const image = await loadImage('valley-of-mexico.jpg');
const canvas = document.querySelector('#stage');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
canvas.width = image.naturalWidth; // 480 × 330: en el Mac, lo mismo que 240 × 165 CSS × 2
canvas.height = image.naturalHeight;
gl.viewport(0, 0, canvas.width, canvas.height);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
fullScreenQuad(gl, program);
gl.useProgram(program);

// Unidad 0: el cuadro (volteado al subirlo, ejemplo 03)
gl.activeTexture(gl.TEXTURE0);
const imageTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, imageTexture);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
// Unidad 1: la paleta (textureFromBytes enlaza la textura en la unidad ACTIVA)
gl.activeTexture(gl.TEXTURE1);
const names = Object.keys(PALETTES);
textureFromBytes(gl, 256, 1, paletteBytes(PALETTES[names[0]]), gl.LINEAR);
// Cada sampler dice de qué UNIDAD lee (no qué textura): sin esto, los dos valdrían 0
gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);
gl.uniform1i(gl.getUniformLocation(program, 'u_palette'), 1);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

log(`unidades de textura en un fragment shader → ${gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)}`);
log(`u_image → unidad 0 · u_palette → unidad 1 · paleta: 256 × 1 = 1024 bytes`);
log(`Listo: paleta «${names[0]}»; pulsa «Cambiar paleta»`);

let current = 0;
document.querySelector('#next').addEventListener('click', () => {
  current = (current + 1) % names.length;
  gl.activeTexture(gl.TEXTURE1); // la unidad 1 sigue teniendo la paleta enlazada
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 256, 1, gl.RGBA, gl.UNSIGNED_BYTE, paletteBytes(PALETTES[names[current]]));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // el cuadro no se vuelve a subir: solo 1024 bytes
  log(`paleta «${names[current]}»`);
});
```

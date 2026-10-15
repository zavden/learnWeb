---
example_description: "Qué lee una textura fuera de 0..1 lo decide el modo de repetición (wrap): REPEAT la repite, MIRRORED_REPEAT la repite en espejo y CLAMP_TO_EDGE estira el píxel del borde. Una tira de 8 colores dibujada con u de 0 a 3 en las tres franjas, y la columna que la GPU lee justo al empezar la segunda y la tercera copia"
example_tags: "javascript|webgl2|texturas|wrap|repeat|mirrored-repeat|clamp-to-edge|uv"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Repetir, en espejo o estirar</h1>
  <canvas id="stage" role="img" aria-label="Tres franjas con la misma tira de ocho colores: repetida tres veces, repetida en espejo y estirada por el borde"></canvas>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = (a_position * 0.5 + 0.5) * vec2(3.0, 1.0); // u de 0 a 3: tres veces el ancho de la textura
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
  width: 288px;
  height: 120px;
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
import { createProgram, shaderFromScript, fullScreenQuad, textureFromBytes, releaseOnPageHide } from './webgl/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Una tira de 8 × 1 píxeles, un color por columna (de la 0 a la 7)
const PALETTE = [
  [220, 38, 38], [234, 88, 12], [217, 119, 6], [22, 163, 74],
  [13, 148, 136], [37, 99, 235], [124, 58, 237], [219, 39, 119],
];
const bytes = new Uint8Array(PALETTE.flatMap((rgb) => [...rgb, 255]));

const canvas = document.querySelector('#stage');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
canvas.width = Math.round(canvas.clientWidth * devicePixelRatio);
canvas.height = Math.round(canvas.clientHeight * devicePixelRatio);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
fullScreenQuad(gl, program);
gl.useProgram(program);
textureFromBytes(gl, 8, 1, bytes); // NEAREST: cada columna, un color nítido

// La columna de la textura que hay en el píxel de la franja donde u vale «u»
const band = canvas.height / 3;
function columnAt(u, bandIndex) {
  const pixel = new Uint8Array(4);
  const x = Math.floor((u / 3) * canvas.width);
  gl.readPixels(x, Math.floor(bandIndex * band + band / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  return PALETTE.findIndex(([r, g, b]) => r === pixel[0] && g === pixel[1] && b === pixel[2]);
}

const modes = ['REPEAT', 'MIRRORED_REPEAT', 'CLAMP_TO_EDGE'];
modes.forEach((mode, index) => {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[mode]); // S: la dirección horizontal (u)
  const bandIndex = modes.length - 1 - index; // la primera franja, arriba
  gl.viewport(0, bandIndex * band + 2, canvas.width, band - 4);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  log(`${mode.padEnd(15)} → en u = 1.06: columna ${columnAt(1.06, bandIndex)} · en u = 2.06: columna ${columnAt(2.06, bandIndex)}`);
});
// REPEAT vuelve a empezar (columna 0); MIRRORED_REPEAT va y viene (7, luego 0);
// CLAMP_TO_EDGE se queda en la última columna (7) para siempre.
```

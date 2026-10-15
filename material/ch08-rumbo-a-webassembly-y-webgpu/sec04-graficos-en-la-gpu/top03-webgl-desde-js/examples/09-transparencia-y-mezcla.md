---
example_description: "Transparencia con gl.enable(gl.BLEND) y blendFunc. La receta de los tutoriales, blendFunc(SRC_ALPHA, ONE_MINUS_SRC_ALPHA), mezcla bien el color pero también el alfa del lienzo, que baja a 194: la página se transparenta a través del canvas y el disco se ve desvaído (izquierda). Con alfa premultiplicado, blendFunc(ONE, ONE_MINUS_SRC_ALPHA), el lienzo sigue opaco (derecha). Mismo RGB, distinto alfa"
example_tags: "javascript|webgl2|blending|transparencia|alfa-premultiplicado|blendfunc|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Un disco al 60 % de opacidad</h1>
  <div class="backdrop">
    <canvas id="stage" role="img" aria-label="Dos discos ámbar semitransparentes sobre fondo azul noche; el de la izquierda deja ver un damero"></canvas>
  </div>
  <p class="labels"><span>🐛 SRC_ALPHA</span><span>✅ premultiplicado</span></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
in vec2 a_position;
out vec2 v_local;
void main() {
  v_local = a_position; // de -1 a 1 dentro del viewport
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
in vec2 v_local;
uniform bool u_premultiplied;
out vec4 outColor;
void main() {
  if (length(v_local) > 0.8) discard; // fuera del disco: no se escribe nada
  vec3 amber = vec3(245.0, 158.0, 11.0) / 255.0;
  float alpha = 0.6;
  // Premultiplicado: el color ya va multiplicado por su opacidad
  outColor = u_premultiplied ? vec4(amber * alpha, alpha) : vec4(amber, alpha);
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
/* Un damero claro DETRÁS del lienzo: solo se ve donde el lienzo no es opaco */
.backdrop {
  width: 240px;
  background: repeating-conic-gradient(#cbd5e1 0 25%, #f8fafc 0 50%) 0 0 / 16px 16px;
}
canvas {
  display: block;
  width: 240px;
  height: 120px;
}
.labels {
  display: flex;
  width: 240px;
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
// Usa assets/webgl/utils.js (léelo con «Assets»).
import { createProgram, shaderFromScript, fitCanvas, readPixel, releaseOnPageHide } from './webgl/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const canvas = document.querySelector('#stage');
const gl = canvas.getContext('webgl2'); // por defecto: alpha true y premultipliedAlpha true
releaseOnPageHide(gl);
const [width, height] = fitCanvas(canvas);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
gl.bindVertexArray(gl.createVertexArray());
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
const positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
gl.useProgram(program);
const premultipliedLocation = gl.getUniformLocation(program, 'u_premultiplied');

// Fondo opaco azul noche (#0f172a = 15, 23, 42) en todo el lienzo
gl.clearColor(15 / 255, 23 / 255, 42 / 255, 1);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.enable(gl.BLEND); // a partir de aquí, cada píxel nuevo se MEZCLA con el que ya había

// 🐛 Izquierda: color normal y SRC_ALPHA. Para el alfa del lienzo también calcula
//    0.6 × 0.6 + 1 × 0.4 = 0.76: el lienzo deja de ser opaco donde está el disco.
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.uniform1i(premultipliedLocation, 0);
gl.viewport(0, 0, height, height);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

// ✅ Derecha: color premultiplicado y ONE. Alfa: 0.6 + 1 × 0.4 = 1, opaco.
gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
gl.uniform1i(premultipliedLocation, 1);
gl.viewport(width - height, 0, height, height);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

// El centro de cada disco: 60 % ámbar + 40 % fondo = 153, 104, 23
log(`🐛 SRC_ALPHA → ${readPixel(gl, Math.floor(height / 2), Math.floor(height / 2))}`);
log(`✅ premultiplicado → ${readPixel(gl, width - Math.floor(height / 2), Math.floor(height / 2))}`);
// El navegador compone el lienzo con la página como color PREMULTIPLICADO (lección «Píxeles»):
// con alfa 194, el 24 % del damero se SUMA al color, y el disco de la izquierda se ve lavado.
```

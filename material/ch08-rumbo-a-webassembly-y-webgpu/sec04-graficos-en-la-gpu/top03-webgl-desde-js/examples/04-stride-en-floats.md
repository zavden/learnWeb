---
example_description: "vertexAttribPointer mide stride y offset en BYTES, no en floats: con stride 5 y offset 2 (contando floats) WebGL rechaza la llamada con INVALID_OPERATION, el atributo se queda sin búfer y drawArrays no dibuja nada (izquierda). Con 5 × 4 = 20 y 2 × 4 = 8 bytes, el triángulo aparece (derecha). getError() lo cuenta; la consola, no"
example_tags: "javascript|webgl2|vertexattribpointer|stride|offset|bytes|geterror|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>stride y offset: ¿floats o bytes?</h1>
  <canvas id="stage" role="img" aria-label="A la izquierda, nada; a la derecha, un triángulo turquesa"></canvas>
  <p class="labels"><span>🐛 en floats</span><span>✅ en bytes</span></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
in vec2 a_position;
in vec3 a_color;
out vec3 v_color;
void main() {
  v_color = a_color;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
in vec3 v_color;
out vec4 outColor;
void main() {
  outColor = vec4(v_color, 1.0);
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
  height: 120px;
  outline: 1px solid #334155;
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
import { createProgram, shaderFromScript, fitCanvas, readPixel, errorName, releaseOnPageHide } from './webgl/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const canvas = document.querySelector('#stage');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
const [width, height] = fitCanvas(canvas);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
const positionLocation = gl.getAttribLocation(program, 'a_position');
const colorLocation = gl.getAttribLocation(program, 'a_color');

// x, y, r, g, b por vértice: un triángulo turquesa (#0d9488 = 13, 148, 136)
const [r, g, b] = [13 / 255, 148 / 255, 136 / 255];
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  0, 0.75, r, g, b,
  -0.75, -0.5, r, g, b,
  0.75, -0.5, r, g, b,
]), gl.STATIC_DRAW);

// Un VAO por cada forma de describir el MISMO búfer
function describe(strideValue, colorOffset) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, strideValue, 0);
  const positionError = errorName(gl, gl.getError());
  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, strideValue, colorOffset);
  return { vao, errors: `${positionError}, ${errorName(gl, gl.getError())}` };
}
const wrong = describe(5, 2);   // 🐛 «5 floats por vértice, el color en el float 2»
const right = describe(5 * 4, 2 * 4); // ✅ 20 y 8 BYTES

gl.clearColor(15 / 255, 23 / 255, 42 / 255, 1);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program);
// Mitad izquierda del lienzo con la descripción mala; mitad derecha con la buena
gl.viewport(0, 0, width / 2, height);
gl.bindVertexArray(wrong.vao);
gl.drawArrays(gl.TRIANGLES, 0, 3);
const wrongDraw = errorName(gl, gl.getError());
gl.viewport(width / 2, 0, width / 2, height);
gl.bindVertexArray(right.vao);
gl.drawArrays(gl.TRIANGLES, 0, 3);
const rightDraw = errorName(gl, gl.getError());

log(`🐛 vertexAttribPointer(…, 5, 0) y (…, 5, 2) → ${wrong.errors}`);
log(`🐛 drawArrays → ${wrongDraw} · centro de la izquierda: ${readPixel(gl, Math.floor(width / 4), Math.floor(height / 2))}`);
log(`✅ vertexAttribPointer(…, 20, 0) y (…, 20, 8) → ${right.errors}`);
log(`✅ drawArrays → ${rightDraw} · centro de la derecha: ${readPixel(gl, Math.floor(width * 3 / 4), Math.floor(height / 2))}`);
// Un float ocupa 4 bytes: stride y offset de un FLOAT deben ser múltiplos de 4, y 5 y 2 no lo
// son. Con valores que sí lo son, pero en floats (stride 4 en lugar de 16), no hay error:
// los vértices salen de bytes equivocados y el dibujo es un amasijo.
```

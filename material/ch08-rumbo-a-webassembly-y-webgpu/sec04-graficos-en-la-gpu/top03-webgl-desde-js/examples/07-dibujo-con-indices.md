---
example_description: "Dibujo con índices: un hexágono son 6 triángulos que comparten vértices. Con drawArrays harían falta 18 vértices; con un búfer de índices (ELEMENT_ARRAY_BUFFER, un Uint16Array) bastan 7 vértices y 18 índices de 2 bytes, y drawElements los recorre. Se cuentan los bytes de las dos formas"
example_tags: "javascript|webgl2|indices|drawelements|element-array-buffer|uint16array|bufferdata"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Un hexágono con índices</h1>
  <canvas id="stage" role="img" aria-label="Un hexágono ámbar, como una celda de panal"></canvas>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
out vec4 outColor;
void main() {
  outColor = vec4(245.0, 158.0, 11.0, 255.0) / 255.0; // #f59e0b
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
  height: 160px; /* cuadrado: así el hexágono no sale estirado */
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
gl.viewport(0, 0, width, height);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));

// 7 vértices: el centro (0) y las 6 esquinas (1-6), cada una con su (x, y)
const points = [0, 0];
for (let i = 0; i < 6; i++) {
  const angle = (i * Math.PI) / 3;
  points.push(0.8 * Math.cos(angle), 0.8 * Math.sin(angle));
}
const vertices = new Float32Array(points);
// 6 triángulos (centro, esquina, la siguiente): cada número es el ÍNDICE de un vértice
const indices = new Uint16Array([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6, 0, 6, 1]);

gl.bindVertexArray(gl.createVertexArray()); // el VAO recuerda también el búfer de índices
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
const positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

gl.clearColor(15 / 255, 23 / 255, 42 / 255, 1);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program);
gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0); // 18 índices de 16 bits

const withoutIndices = indices.length * 2 * Float32Array.BYTES_PER_ELEMENT;
log(`sin índices → ${indices.length} vértices × 8 bytes = ${withoutIndices} bytes`);
log(`con índices → ${vertices.length / 2} vértices × 8 bytes + ${indices.length} índices × 2 bytes = ${vertices.byteLength + indices.byteLength} bytes`);
log(`drawElements → ${errorName(gl, gl.getError())}`);
log(`centro → ${readPixel(gl, Math.floor(width / 2), Math.floor(height / 2))}`);
log(`esquina → ${readPixel(gl, 0, 0)}`);
// En una malla 3D, cada vértice lo comparten unos 6 triángulos: ahí el ahorro es enorme.
// Un Uint16Array llega hasta el vértice 65535; para más, Uint32Array y gl.UNSIGNED_INT.
```

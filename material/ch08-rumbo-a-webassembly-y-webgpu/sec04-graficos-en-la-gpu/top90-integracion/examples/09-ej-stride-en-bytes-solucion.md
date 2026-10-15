---
example_description: "Solución: stride y offset en bytes (5 × 4 = 20 y 2 × 4 = 8, con Float32Array.BYTES_PER_ELEMENT); WebGL acepta las llamadas, los dos banderines se dibujan y las seis comprobaciones salen ✅"
example_tags: "javascript|webgl2|vertexattribpointer|stride|offset|bytes|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Banderines de la feria</h1>
  <canvas id="flags" role="img" aria-label="Dos banderines triangulares: turquesa a la izquierda y ámbar a la derecha"></canvas>
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

const canvas = document.querySelector('#flags');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
const [width, height] = fitCanvas(canvas);
gl.viewport(0, 0, width, height);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));

// Dos banderines triangulares, apuntando hacia abajo. Por vértice: x, y, r, g, b
const TEAL = [13 / 255, 148 / 255, 136 / 255];
const AMBER = [245 / 255, 158 / 255, 11 / 255];
const vertices = new Float32Array([
  -0.9, 0.8, ...TEAL, -0.1, 0.8, ...TEAL, -0.5, -0.6, ...TEAL,
  0.1, 0.8, ...AMBER, 0.9, 0.8, ...AMBER, 0.5, -0.6, ...AMBER,
]);

// vertexAttribPointer mide stride y offset en BYTES: un float ocupa 4
const STRIDE = 5 * Float32Array.BYTES_PER_ELEMENT;       // 20 bytes de un vértice al siguiente
const COLOR_OFFSET = 2 * Float32Array.BYTES_PER_ELEMENT; // el color empieza en el byte 8

gl.bindVertexArray(gl.createVertexArray());
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
const positionLocation = gl.getAttribLocation(program, 'a_position');
const colorLocation = gl.getAttribLocation(program, 'a_color');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, STRIDE, 0);
const positionError = errorName(gl, gl.getError());
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, STRIDE, COLOR_OFFSET);
const colorError = errorName(gl, gl.getError());

gl.clearColor(15 / 255, 23 / 255, 42 / 255, 1);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 6);
const drawError = errorName(gl, gl.getError());

// ── Comprobaciones (no hace falta tocarlas) ───────────────────────────────────────────
const logList = document.querySelector('#log');
function check(description, actual, expected) {
  const ok = actual === expected;
  if (ok) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', expected, 'y obtuve', actual);
  logList.append(Object.assign(document.createElement('li'), { textContent: `${ok ? '✅' : '❌'} ${description}` }));
}
// El centro de cada banderín, en coordenadas de recorte (-0.5, 0.33) y (0.5, 0.33)
const at = (x, y) => readPixel(gl, Math.floor(((x + 1) / 2) * width), Math.floor(((y + 1) / 2) * height));
check('vertexAttribPointer de la posición', positionError, 'NO_ERROR');
check('vertexAttribPointer del color', colorError, 'NO_ERROR');
check('drawArrays', drawError, 'NO_ERROR');
check('el banderín de la izquierda es turquesa', at(-0.5, 0.33), '13, 148, 136, 255');
check('el banderín de la derecha es ámbar', at(0.5, 0.33), '245, 158, 11, 255');
check('el fondo sigue azul noche', at(0, -0.9), '15, 23, 42, 255');
```

---
example_description: "Posición y color de cada vértice intercalados en un solo Float32Array (x, y, r, g, b): vertexAttribPointer los separa con stride (20 bytes de un vértice al siguiente) y offset (el color empieza en el byte 8), medidos en BYTES. El color viaja al fragment shader como varying y llega interpolado: en el centro, a mitad de camino entre el azul y el rojo"
example_tags: "javascript|webgl2|atributos|vertexattribpointer|stride|offset|varying|interpolacion|vao"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Posición y color en un búfer</h1>
  <canvas id="stage" role="img" aria-label="Un degradado de azul a rojo de izquierda a derecha"></canvas>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
in vec2 a_position;
in vec3 a_color;  // el segundo atributo, del mismo búfer
out vec3 v_color; // hacia el fragment shader (un «varying»)
void main() {
  v_color = a_color;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
in vec3 v_color; // llega INTERPOLADO entre los vértices del triángulo
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
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Usa assets/webgl/utils.js (léelo con «Assets»): los pasos del ejemplo 01, en funciones.
import { createProgram, shaderFromScript, fitCanvas, readPixel, releaseOnPageHide } from './webgl/utils.js';

const logList = document.querySelector('#log');
function log(label, value) {
  console.log(label, value);
  logList.append(Object.assign(document.createElement('li'), { textContent: `${label} ${value}` }));
}

const canvas = document.querySelector('#stage');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
const [width, height] = fitCanvas(canvas);
gl.viewport(0, 0, width, height);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));

// Intercalado: cada vértice lleva su posición y su color, uno detrás de otro
const vertices = new Float32Array([
  //  x   y    r  g  b
  -1, -1,     0, 0, 1, // abajo a la izquierda: azul
   1, -1,     1, 0, 0, // abajo a la derecha: rojo
  -1,  1,     0, 0, 1, // arriba a la izquierda: azul
   1,  1,     1, 0, 0, // arriba a la derecha: rojo
]);
const STRIDE = 5 * Float32Array.BYTES_PER_ELEMENT;       // de un vértice al siguiente: 20 bytes
const COLOR_OFFSET = 2 * Float32Array.BYTES_PER_ELEMENT; // el color empieza 8 bytes después
log('un vértice →', `${STRIDE} bytes (stride) · el color empieza en el byte ${COLOR_OFFSET} (offset)`);
log('segundo vértice, desde el byte 20 →', Array.from(new Float32Array(vertices.buffer, STRIDE, 5)).join(', '));

const vao = gl.createVertexArray(); // el VAO guarda los dos atributos y su búfer
gl.bindVertexArray(vao);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
const positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, STRIDE, 0);
const colorLocation = gl.getAttribLocation(program, 'a_color');
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, STRIDE, COLOR_OFFSET);

gl.useProgram(program);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // 4 vértices en tira: 2 triángulos, todo el lienzo
log('centro →', readPixel(gl, Math.floor(width / 2), Math.floor(height / 2)));
// 128 de rojo y 127 de azul: el píxel central está medio píxel a la derecha de la mitad exacta
```

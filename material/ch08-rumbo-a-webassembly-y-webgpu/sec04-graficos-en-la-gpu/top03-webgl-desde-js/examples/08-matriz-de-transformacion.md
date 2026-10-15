---
example_description: "Mover, girar y escalar en 2D con una matriz de 3 × 3 en un uniform mat3: las mismas matrices que matrix(a, b, c, d, e, f) de CSS, guardadas por columnas, que es el orden que espera uniformMatrix3fv. Componer es multiplicar (traslación × giro) y el resultado coincide con DOMMatrix. Pasar la matriz por filas la traspone: el cuadrado no se mueve y gira al revés"
example_tags: "javascript|webgl2|matrices|mat3|uniformmatrix3fv|transformaciones|dommatrix|bug"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Una matriz para mover y girar</h1>
  <canvas id="stage" role="img" aria-label="Un cuadrado ámbar movido a la derecha y girado; otro turquesa en el centro, girado al revés"></canvas>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
in vec2 a_position;
uniform mat3 u_matrix;
void main() {
  // (x, y, 1): el 1 hace que la tercera columna (el desplazamiento) cuente
  vec3 moved = u_matrix * vec3(a_position, 1.0);
  gl_Position = vec4(moved.xy, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
uniform vec4 u_color;
out vec4 outColor;
void main() {
  outColor = u_color;
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
  width: 200px;
  height: 200px; /* cuadrado: en coordenadas de recorte, x e y miden lo mismo */
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
import { createProgram, shaderFromScript, fitCanvas, readPixel, releaseOnPageHide } from './webgl/utils.js';

// Matrices de 3 × 3 en un array de 9 números, POR COLUMNAS (el orden de WebGL):
//   [a, b, 0, c, d, 0, e, f, 1]  es   | a c e |   x' = a·x + c·y + e
//                                     | b d f |   y' = b·x + d·y + f
//                                     | 0 0 1 |
// El mismo orden que matrix(a, b, c, d, e, f) de CSS (lección «Transformaciones»).
const translation = (tx, ty) => [1, 0, 0, 0, 1, 0, tx, ty, 1];
const rotation = (radians) => {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  return [c, s, 0, -s, c, 0, 0, 0, 1];
};
// a × b: aplica primero b y después a (como en CSS, la función de la derecha va primero)
function multiply(a, b) {
  const out = new Array(9);
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 3; row++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) sum += a[k * 3 + row] * b[col * 3 + k];
      out[col * 3 + row] = sum;
    }
  }
  return out;
}
const transpose = (m) => [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];
const short = (values) => values.map((v) => Number(v.toPrecision(6))).join(', '); // como CSS

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const matrix = multiply(translation(0.5, 0), rotation(Math.PI / 6)); // girar 30° y llevar a x = 0.5
log(`traslación × giro → ${short(matrix)}`);
const css = new DOMMatrix('translate(0.5px) rotate(30deg)');
log(`DOMMatrix de CSS → matrix(${short([css.a, css.b, css.c, css.d, css.e, css.f])})`);

const canvas = document.querySelector('#stage');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
const [width, height] = fitCanvas(canvas);
gl.viewport(0, 0, width, height);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
gl.bindVertexArray(gl.createVertexArray());
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
// Un cuadrado de lado 0.5 centrado en el origen (4 vértices en tira)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.25, -0.25, 0.25, -0.25, -0.25, 0.25, 0.25, 0.25]), gl.STATIC_DRAW);
const positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
gl.useProgram(program);
const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
const colorLocation = gl.getUniformLocation(program, 'u_color');
gl.clearColor(15 / 255, 23 / 255, 42 / 255, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

// 🐛 La matriz escrita por FILAS (como se lee en papel): el shader recibe su traspuesta
gl.uniformMatrix3fv(matrixLocation, false, transpose(matrix));
gl.uniform4f(colorLocation, 13 / 255, 148 / 255, 136 / 255, 1);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
// ✅ Por columnas. El false significa «no la traspongas» (en WebGL 1 es obligatorio)
gl.uniformMatrix3fv(matrixLocation, false, matrix);
gl.uniform4f(colorLocation, 245 / 255, 158 / 255, 11 / 255, 1);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

log(`✅ por columnas: en (0.5, 0) → ${readPixel(gl, Math.floor(width * 0.75), Math.floor(height / 2))}`);
log(`🐛 por filas: en (0, 0) → ${readPixel(gl, Math.floor(width / 2), Math.floor(height / 2))}`);
// Traspuesta, el desplazamiento acaba en la fila de abajo (que el shader descarta) y el
// giro se invierte: el cuadrado turquesa se queda en el centro, girado -30°.
// El ámbar gira en sentido antihorario: aquí la y crece hacia arriba; en CSS, el mismo
// rotate(30deg) gira en sentido horario, porque allí la y crece hacia abajo.
```

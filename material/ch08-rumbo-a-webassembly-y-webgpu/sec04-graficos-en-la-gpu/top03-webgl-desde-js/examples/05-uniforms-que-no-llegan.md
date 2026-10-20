---
example_description: "Dos formas de que un uniform no llegue sin que nadie avise: darle valor antes de useProgram (gl.uniform4f actúa sobre el programa EN USO: INVALID_OPERATION y el triángulo sale con el valor por defecto, negro transparente) y uno que el shader declara pero no usa (el compilador lo elimina, getUniformLocation devuelve null y gl.uniform1f(null, …) no hace nada)"
example_tags: "javascript|webgl2|uniforms|useprogram|getuniformlocation|geterror|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Uniforms que no llegan</h1>
  <canvas id="stage" role="img" aria-label="A la izquierda, un triángulo transparente; a la derecha, uno rojo frambuesa"></canvas>
  <p class="labels"><span>🐛 antes de useProgram</span><span>✅ después</span></p>
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
uniform vec4 u_color;    // el color, desde JavaScript
uniform float u_opacity; // declarado… pero main() no lo usa
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
/* Un damero DETRÁS del lienzo: donde el lienzo es transparente, se ve */
canvas {
  display: block;
  width: 240px;
  height: 120px;
  background: repeating-conic-gradient(#475569 0 25%, #1e293b 0 50%) 0 0 / 16px 16px;
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
gl.bindVertexArray(gl.createVertexArray());
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0.75, -0.75, -0.5, 0.75, -0.5]), gl.STATIC_DRAW);
const positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
const colorLocation = gl.getUniformLocation(program, 'u_color');
gl.clearColor(15 / 255, 23 / 255, 42 / 255, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

// 🐛 1. Dar valor al uniform ANTES de useProgram: uniform4f actúa sobre el programa en uso,
//       y todavía no hay ninguno. La llamada se ignora y getError() lo registra.
gl.uniform4f(colorLocation, 225 / 255, 29 / 255, 72 / 255, 1);
log(`🐛 uniform4f antes de useProgram → ${errorName(gl, gl.getError())}`);
gl.useProgram(program);
gl.viewport(0, 0, width / 2, height);
gl.drawArrays(gl.TRIANGLES, 0, 3);
log(`   dibujado con el valor por defecto → ${readPixel(gl, Math.floor(width / 4), Math.floor(height / 2))}`);

// ✅ Con el programa en uso, el valor se queda guardado en ESE programa
gl.uniform4f(colorLocation, 225 / 255, 29 / 255, 72 / 255, 1);
log(`✅ uniform4f después de useProgram → ${errorName(gl, gl.getError())}`);
gl.viewport(width / 2, 0, width / 2, height);
gl.drawArrays(gl.TRIANGLES, 0, 3);
log(`   dibujado → ${readPixel(gl, Math.floor(width * 3 / 4), Math.floor(height / 2))}`);

// 🐛 2. Un uniform declarado pero sin usar: el compilador lo elimina, no tiene «location»
const opacityLocation = gl.getUniformLocation(program, 'u_opacity');
log(`🐛 getUniformLocation('u_opacity') → ${opacityLocation}`);
gl.uniform1f(opacityLocation, 0.5); // con null, WebGL no hace nada… y no es un error
log(`   uniform1f(null, 0.5) → ${errorName(gl, gl.getError())}`);
// Chrome escribe avisos de WebGL en la consola de DevTools, pero no en la de LearnWeb:
// pregunta tú con gl.getError() (y comprueba que las locations no sean null).
```

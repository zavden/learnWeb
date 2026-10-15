---
example_description: "Solución: useProgram antes de los uniform* (que se guardan en el programa en uso) y el vertex shader amplía el cuadrado con u_scale antes de desplazarlo, así su location existe; las seis comprobaciones salen ✅"
example_tags: "javascript|webgl2|uniforms|useprogram|getuniformlocation|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>La medalla del torneo</h1>
  <canvas id="medal" role="img" aria-label="Una medalla cuadrada violeta, a la derecha del lienzo"></canvas>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
in vec2 a_position; // un cuadrado de -0.2 a 0.2
uniform vec2 u_offset;
uniform float u_scale;
void main() {
  vec2 p = a_position * u_scale; // ampliar primero, desplazar después
  gl_Position = vec4(p + u_offset, 0.0, 1.0);
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
/* Un damero detrás del lienzo: donde el lienzo queda transparente, se ve */
canvas {
  display: block;
  width: 200px;
  height: 200px;
  background: repeating-conic-gradient(#475569 0 25%, #1e293b 0 50%) 0 0 / 16px 16px;
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

const canvas = document.querySelector('#medal');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
const [width, height] = fitCanvas(canvas);
gl.viewport(0, 0, width, height);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
gl.bindVertexArray(gl.createVertexArray());
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.2, -0.2, 0.2, -0.2, -0.2, 0.2, 0.2, 0.2]), gl.STATIC_DRAW);
const positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
gl.clearColor(15 / 255, 23 / 255, 42 / 255, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

// Los uniform* actúan sobre el programa EN USO: primero useProgram
gl.useProgram(program);
gl.uniform2f(gl.getUniformLocation(program, 'u_offset'), 0.45, 0);   // a la derecha
gl.uniform4f(gl.getUniformLocation(program, 'u_color'), 124 / 255, 58 / 255, 237 / 255, 1); // #7c3aed
const uniformsError = errorName(gl, gl.getError());
const scaleLocation = gl.getUniformLocation(program, 'u_scale');
gl.uniform1f(scaleLocation, 1.5); // × 1.5: ahora el shader lo usa y su location existe
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

// ── Comprobaciones (no hace falta tocarlas) ───────────────────────────────────────────
const logList = document.querySelector('#log');
function check(description, actual, expected) {
  const ok = actual === expected;
  if (ok) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', expected, 'y obtuve', actual);
  logList.append(Object.assign(document.createElement('li'), { textContent: `${ok ? '✅' : '❌'} ${description}` }));
}
const at = (x, y) => readPixel(gl, Math.floor(((x + 1) / 2) * width), Math.floor(((y + 1) / 2) * height));
const VIOLET = '124, 58, 237, 255';
const NIGHT = '15, 23, 42, 255';
check('los uniforms se guardan sin errores', uniformsError, 'NO_ERROR');
check('el vertex shader usa u_scale (su location no es null)', scaleLocation !== null, true);
check('en (0.45, 0), el cuadrado violeta', at(0.45, 0), VIOLET);
check('en (0.72, 0), dentro del cuadrado ampliado × 1.5', at(0.72, 0), VIOLET);
check('el centro del lienzo, libre', at(0, 0), NIGHT);
check('la esquina, azul noche', at(-0.9, -0.9), NIGHT);
```

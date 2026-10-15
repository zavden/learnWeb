---
example_description: "Ejercicio: el logotipo de una cafetería debería ser un círculo, pero el fragment shader lo mide en uv y, en un lienzo el doble de ancho que de alto, sale una elipse. Corrige el shader para que mida en unidades cuadradas; las comprobaciones leen píxeles con readPixels y miden los dos radios"
example_tags: "javascript|webgl2|glsl|uv|proporcion|readpixels|ejercicio"
exercise: true
exercise_title: "Un círculo que sea redondo"
exercise_instructions: "Abre el HTML: el fragment shader está en el <script id=\"fragment-shader\"> || Sustituye el cálculo de uv por coordenadas con el origen en el centro del lienzo y la altura como unidad || Cambia la condición para que sea un círculo de radio 0.3 alturas centrado en el origen || Ejecuta hasta que las seis comprobaciones salgan ✅"
exercise_hints: "Lección «Tu primer fragment shader», sección «La proporción del lienzo» || vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y; || Con el origen en el centro, la distancia al centro es length(p)"
exercise_solution_example: 08-ej-circulo-redondo-solucion.md
exercise_locked_files: script.js,styles.css
example_stage: exercise
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Café del Jardín</h1>
  <canvas id="logo" role="img" aria-label="El logotipo: un círculo ámbar sobre fondo azul noche"></canvas>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
layout(location = 0) in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
uniform vec2 u_resolution; // el lienzo mide el doble de ancho que de alto
out vec4 outColor;
void main() {
  // TODO: uv va de 0 a 1 en los DOS ejes, así que una unidad de x es el doble de larga
  //       que una de y. Mide en unidades cuadradas, con el origen en el centro.
  vec2 uv = gl_FragCoord.xy / u_resolution;
  bool inside = distance(uv, vec2(0.5)) < 0.3; // TODO: un círculo de radio 0.3 ALTURAS
  outColor = inside ? vec4(245.0, 158.0, 11.0, 255.0) / 255.0 : vec4(15.0, 23.0, 42.0, 255.0) / 255.0;
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
  width: 320px;
  height: 160px;
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
// Usa assets/webgl/utils.js. Este archivo está bloqueado: el trabajo está en el shader del HTML.
import { createProgram, shaderFromScript, fullScreenQuad, fitCanvas, readPixel, releaseOnPageHide } from './webgl/utils.js';

const logList = document.querySelector('#log');
function report(ok, text) {
  if (ok) console.log('✅', text);
  else console.error('❌', text);
  logList.append(Object.assign(document.createElement('li'), { textContent: `${ok ? '✅' : '❌'} ${text}` }));
}

const canvas = document.querySelector('#logo');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
const [width, height] = fitCanvas(canvas);
gl.viewport(0, 0, width, height);
let compiled = true;
try {
  const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
  fullScreenQuad(gl, program);
  gl.useProgram(program);
  gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), width, height);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
} catch (error) {
  compiled = false;
  console.warn(error.message); // el registro del compilador, con el número de línea
}

// ── Comprobaciones (no hace falta tocarlas) ───────────────────────────────────────────
const AMBER = '245, 158, 11, 255';
const cx = Math.floor(width / 2);
const cy = Math.floor(height / 2);
const isAmber = (x, y) => readPixel(gl, Math.floor(x), Math.floor(y)) === AMBER;
function radius(dx, dy) { // píxeles ámbar seguidos desde el centro, en una dirección
  let steps = 0;
  while (steps < width && isAmber(cx + dx * steps, cy + dy * steps)) steps += 1;
  return steps;
}
report(compiled, 'el shader compila');
report(isAmber(cx, cy), 'el centro es ámbar');
report(isAmber(cx + 0.25 * height, cy), 'a 0.25 alturas a la derecha del centro, dentro');
report(!isAmber(cx + 0.35 * height, cy), 'a 0.35 alturas a la derecha del centro, fuera');
report(isAmber(cx, cy + 0.25 * height), 'a 0.25 alturas por encima del centro, dentro');
report(compiled && Math.abs(radius(1, 0) - radius(0, 1)) <= 1, 'el radio horizontal mide lo mismo que el vertical');
```

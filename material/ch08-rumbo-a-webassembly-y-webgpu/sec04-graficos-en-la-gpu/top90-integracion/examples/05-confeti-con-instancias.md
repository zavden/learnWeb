---
example_description: "Confeti con instancias: un solo rectángulo de 4 vértices y, por cada uno de los 3000 papelitos, sus datos de instancia (posición de salida, velocidad, giro y color) en un búfer intercalado que avanza una vez por instancia (vertexAttribDivisor). Un drawArraysInstanced por fotograma; el vertex shader gira, mueve y deja caer cada papelito con u_time. Empieza con un botón, dura 4 s y respeta «reducir movimiento»"
example_tags: "javascript|webgl2|instancias|drawarraysinstanced|vertexattribdivisor|particulas|animacion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Reserva confirmada</h1>
  <p>Mesa para 4 en Casa Talavera, sábado a las 20:30.</p>
  <canvas id="party" role="img" aria-label="Confeti de colores que cae"></canvas>
  <button id="celebrate" type="button">🎉 Celebrar</button>
  <p id="status" class="status" role="status"></p>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
in vec2 a_corner;    // POR VÉRTICE: las 4 esquinas del papelito (-1 a 1)
in vec2 a_start;     // POR INSTANCIA: de aquí sale
in vec2 a_velocity;  // POR INSTANCIA
in float a_spin;     // POR INSTANCIA: vueltas por segundo
in vec3 a_color;     // POR INSTANCIA
uniform float u_time;
uniform float u_aspect; // ancho / alto del lienzo
out vec3 v_color;
void main() {
  float angle = a_spin * u_time * 6.2831853;
  mat2 rotation = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
  vec2 shape = rotation * (a_corner * vec2(0.018, 0.009)); // un rectángulo de papel que gira
  vec2 position = a_start + a_velocity * u_time + vec2(0.0, -0.9) * u_time * u_time;
  gl_Position = vec4(position + shape * vec2(1.0, u_aspect), 0.0, 1.0);
  v_color = a_color * (0.75 + 0.25 * cos(angle)); // al girar, la cara se oscurece un poco
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
  margin: 0;
}
canvas {
  display: block;
  width: 100%;
  max-width: 400px;
  height: 220px;
  background: #1e293b;
}
button {
  font: inherit;
  margin-top: 0.75rem;
  padding: 0.3rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.status {
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Usa assets/webgl/utils.js (léelo con «Assets»).
import { createProgram, shaderFromScript, fitCanvas, releaseOnPageHide } from './webgl/utils.js';

const COUNT = 3000;
const DURATION = 4; // segundos
const COLORS = [[228, 0, 124], [255, 159, 28], [22, 163, 74], [37, 99, 235], [250, 204, 21]];
const statusLine = document.querySelector('#status');
function say(text) {
  statusLine.textContent = text;
  console.log(text);
}
function mulberry32(seed) { // números aleatorios con semilla (lección «El bucle de animación»)
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const canvas = document.querySelector('#party');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
const [width, height] = fitCanvas(canvas);
gl.viewport(0, 0, width, height);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
gl.useProgram(program);
gl.uniform1f(gl.getUniformLocation(program, 'u_aspect'), width / height);
gl.bindVertexArray(gl.createVertexArray());

// Búfer 1, por vértice: las 4 esquinas del papelito (lo comparten todas las instancias)
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
const cornerLocation = gl.getAttribLocation(program, 'a_corner');
gl.enableVertexAttribArray(cornerLocation);
gl.vertexAttribPointer(cornerLocation, 2, gl.FLOAT, false, 0, 0);

// Búfer 2, por instancia: x, y, vx, vy, giro, r, g, b = 8 floats = 32 bytes por papelito
const FLOATS = 8;
const random = mulberry32(2026);
const instances = new Float32Array(COUNT * FLOATS);
for (let i = 0; i < COUNT; i++) {
  const [r, g, b] = COLORS[i % COLORS.length].map((c) => c / 255);
  instances.set([
    (random() - 0.5) * 0.3, -0.9,                          // salen de abajo, en el centro
    (random() - 0.5) * 1.6, 1.4 + random() * 1.2,          // hacia arriba y a los lados
    (random() - 0.5) * 4,                                  // de -2 a 2 vueltas por segundo
    r, g, b,
  ], i * FLOATS);
}
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, instances, gl.STATIC_DRAW);
const STRIDE = FLOATS * 4;
for (const [name, size, offset] of [['a_start', 2, 0], ['a_velocity', 2, 8], ['a_spin', 1, 16], ['a_color', 3, 20]]) {
  const location = gl.getAttribLocation(program, name);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, STRIDE, offset);
  gl.vertexAttribDivisor(location, 1); // 1: avanza UNA vez por instancia, no por vértice
}
const timeLocation = gl.getUniformLocation(program, 'u_time');

function draw(seconds) {
  gl.clearColor(30 / 255, 41 / 255, 59 / 255, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (seconds === null) return; // en reposo: solo el fondo
  gl.uniform1f(timeLocation, seconds);
  gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, COUNT); // 4 vértices × 3000 instancias
}

// --- El bucle: botón, 4 s, y se para al ocultar la página ---------------------------------
const button = document.querySelector('#celebrate');
let frameId = null;
let start = 0;
function frame(now) {
  const seconds = (now - start) / 1000;
  if (seconds > DURATION) return stop('🏁 confeti terminado');
  draw(seconds);
  frameId = requestAnimationFrame(frame);
}
function stop(reason) {
  if (frameId === null) return;
  cancelAnimationFrame(frameId);
  frameId = null;
  draw(null); // el lienzo, limpio otra vez
  say(reason);
}
button.addEventListener('click', () => {
  if (frameId !== null) return; // no lanzar dos bucles
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    draw(0.6); // un fotograma quieto, con el confeti en el aire
    return say('movimiento reducido: el confeti se queda quieto');
  }
  start = performance.now();
  frameId = requestAnimationFrame(frame);
  say(`🎉 ${COUNT} papelitos · 1 drawArraysInstanced por fotograma`);
});
document.addEventListener('visibilitychange', () => { if (document.hidden) stop('⏸ página oculta'); });

draw(null);
say(`Listo: ${COUNT} instancias × ${STRIDE} bytes = ${instances.byteLength} bytes, más 4 vértices de 8 bytes; pulsa «Celebrar»`);
```

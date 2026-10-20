---
example_description: "Diez mil partículas en un solo encargo: sus datos (velocidad de salida y desfase) se suben UNA vez a la GPU y un drawArrays(gl.POINTS) por fotograma las dibuja todas; el vertex shader calcula dónde está cada una a partir de u_time, así que JavaScript solo envía un número por fotograma. Una fuente que se pone en marcha con un botón, se para sola a los 10 s, con «Parar» o al ocultar la página, y respeta «reducir movimiento»"
example_tags: "javascript|webgl2|particulas|gl-points|gl-pointsize|requestanimationframe|blending|rendimiento"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Una fuente de 10 000 partículas</h1>
  <canvas id="stage" role="img" aria-label="Una fuente de chispas de colores que suben y caen"></canvas>
  <button id="toggle" type="button">▶ Lanzar</button>
  <p id="status" class="status" aria-live="polite"></p>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
in vec2 a_velocity;   // velocidad de salida (unidades por segundo)
in float a_phase;     // desfase: en qué momento de su vida empieza (segundos)
uniform float u_time; // lo ÚNICO que cambia en cada fotograma
uniform float u_pointSize;
out float v_heat;
const float LIFETIME = 2.0;
const vec2 GRAVITY = vec2(0.0, -2.4);
void main() {
  float age = mod(u_time + a_phase, LIFETIME); // cada partícula renace cada 2 s
  vec2 start = vec2(0.0, -0.9);                // la boca de la fuente
  vec2 position = start + a_velocity * age + 0.5 * GRAVITY * age * age;
  v_heat = 1.0 - age / LIFETIME;               // recién salida = caliente
  gl_Position = vec4(position, 0.0, 1.0);
  gl_PointSize = u_pointSize;                  // con gl.POINTS, cada vértice es un cuadrado
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
in float v_heat;
out vec4 outColor;
void main() {
  // gl_PointCoord: de (0, 0) a (1, 1) dentro del cuadrado del punto. Fuera del círculo, nada.
  if (length(gl_PointCoord - 0.5) > 0.5) discard;
  vec3 color = mix(vec3(0.86, 0.15, 0.15), vec3(0.98, 0.80, 0.08), v_heat);
  outColor = vec4(color * 0.6, 0.6); // premultiplicado: las chispas se suman
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
  height: 240px;
  background: #020617;
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

const COUNT = 10_000;
const statusLine = document.querySelector('#status');
function say(text) {
  statusLine.textContent = text;
  console.log(text);
}

// Números aleatorios con semilla (mulberry32, lección «El bucle de animación»): siempre la misma fuente
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(2026);
const data = new Float32Array(COUNT * 3); // por partícula: vx, vy, desfase
for (let i = 0; i < COUNT; i++) {
  const angle = Math.PI / 2 + (random() - 0.5) * 0.6; // hacia arriba, abierta ±17°
  const speed = 1.8 + random() * 0.6;
  data.set([Math.cos(angle) * speed, Math.sin(angle) * speed, random() * 2], i * 3);
}

const canvas = document.querySelector('#stage');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
const [width, height] = fitCanvas(canvas);
gl.viewport(0, 0, width, height);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
gl.bindVertexArray(gl.createVertexArray());
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); // UNA vez: no cambia nunca
const velocityLocation = gl.getAttribLocation(program, 'a_velocity');
gl.enableVertexAttribArray(velocityLocation);
gl.vertexAttribPointer(velocityLocation, 2, gl.FLOAT, false, 12, 0);
const phaseLocation = gl.getAttribLocation(program, 'a_phase');
gl.enableVertexAttribArray(phaseLocation);
gl.vertexAttribPointer(phaseLocation, 1, gl.FLOAT, false, 12, 8);
gl.useProgram(program);
const timeLocation = gl.getUniformLocation(program, 'u_time');
gl.uniform1f(gl.getUniformLocation(program, 'u_pointSize'), 3 * devicePixelRatio);
gl.enable(gl.BLEND);
gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

function draw(seconds) {
  gl.clearColor(2 / 255, 6 / 255, 23 / 255, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform1f(timeLocation, seconds); // 4 bytes por fotograma: todo lo demás ya está en la GPU
  gl.drawArrays(gl.POINTS, 0, COUNT);  // las 10 000 en un solo encargo
}

// El bucle: arranca con el botón, termina solo a los 10 s, con «Parar» o al ocultar la página
const DURATION = 10;
const toggle = document.querySelector('#toggle');
let frameId = null;
let startTime = 0;
function frame(now) {
  const seconds = (now - startTime) / 1000;
  if (seconds > DURATION) return stop('terminado: 10 s');
  draw(seconds);
  frameId = requestAnimationFrame(frame);
}
function start() {
  if (frameId !== null) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    draw(0);
    return say('movimiento reducido: la fuente se queda quieta');
  }
  startTime = performance.now();
  frameId = requestAnimationFrame(frame);
  toggle.textContent = '⏹ Parar';
  say('▶ en marcha: 1 drawArrays por fotograma');
}
function stop(reason) {
  if (frameId === null) return;
  cancelAnimationFrame(frameId);
  frameId = null;
  toggle.textContent = '▶ Lanzar';
  say(`⏹ ${reason}`);
}
toggle.addEventListener('click', () => (frameId === null ? start() : stop('parado')));
document.addEventListener('visibilitychange', () => { if (document.hidden) stop('página oculta'); });

draw(0); // un fotograma quieto al cargar (los desfases hacen que la fuente ya esté llena)
say(`Listo: ${COUNT} partículas en un búfer de ${data.byteLength} bytes; pulsa «Lanzar»`);
```

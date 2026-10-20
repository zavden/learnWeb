---
example_description: "Un gráfico de dispersión de 10 000 trayectos de bicicleta compartida (datos sintéticos) dibujado en la GPU: los datos se suben una vez a un búfer (120 000 bytes) y mover o acercar la vista solo cambia un uniform de 4 números. Puntos redondos con gl_PointSize y gl_PointCoord, transparencia premultiplicada sobre una rejilla de canvas 2D, franjas horarias filtradas en el vertex shader con una máscara de bits, arrastrar, Ctrl + rueda o pellizcar, teclado, y el trayecto elegido comprobado con readPixels"
example_tags: "javascript|webgl2|puntos|gl-pointsize|dispersion|pan-zoom|uniforms|premultiplicado|accesibilidad|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="report">
  <h1>Trayectos en bici: distancia y duración</h1>
  <fieldset class="bands">
    <legend>Franjas horarias</legend>
    <label class="band band--0"><input type="checkbox" name="band" value="0" checked> Mañana</label>
    <label class="band band--1"><input type="checkbox" name="band" value="1" checked> Tarde</label>
    <label class="band band--2"><input type="checkbox" name="band" value="2" checked> Noche</label>
  </fieldset>
  <figure class="chart">
    <div class="plot" id="plot">
      <canvas id="axes" aria-hidden="true"></canvas>
      <canvas id="points" tabindex="0" role="img" aria-label="Gráfico de dispersión: un punto por trayecto, distancia en horizontal y duración en vertical" aria-describedby="summary"></canvas>
      <p id="tooltip" class="tooltip" aria-hidden="true" hidden></p>
    </div>
    <figcaption id="summary" aria-live="polite"></figcaption>
  </figure>
  <div class="tools">
    <button id="zoom-in" type="button" aria-label="Acercar">＋</button>
    <button id="zoom-out" type="button" aria-label="Alejar">－</button>
    <button id="reset" type="button">Restablecer</button>
  </div>
  <p class="help">Arrastra para mover; <kbd>Ctrl</kbd> + rueda o pellizca para acercar. Con el teclado: flechas, <kbd>+</kbd> y <kbd>−</kbd>, <kbd>0</kbd> para volver y <kbd>Enter</kbd> para elegir el trayecto del centro.</p>
  <p id="status" class="status" role="status"></p>
  <p class="credit">Datos sintéticos generados en el navegador (10 000 trayectos, semilla 2026).</p>
</main>
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
.report {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.15rem;
  margin-top: 0;
}
.bands {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  border: 1px solid #475569;
}
.band::before {
  content: "";
  display: inline-block;
  width: 0.7em;
  height: 0.7em;
  margin-inline-end: 0.3em;
  border-radius: 50%;
  background: var(--band);
}
.band--0 {
  --band: #f59e0b;
}
.band--1 {
  --band: #22d3ee;
}
.band--2 {
  --band: #c084fc;
}
.chart {
  margin: 0.75rem 0 0;
}
.plot {
  position: relative;
  aspect-ratio: 4 / 3;
  background: #020617;
}
#axes {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
#points {
  position: absolute;
  top: 10px;
  left: 46px;
  width: calc(100% - 56px);
  height: calc(100% - 50px);
  touch-action: none; /* arrastrar y pellizcar mueven el gráfico, no la página */
  cursor: grab;
}
.tooltip {
  position: absolute;
  margin: 0;
  padding: 0.2rem 0.45rem;
  font-size: 0.75rem;
  color: #0f172a;
  background: #f8fafc;
  border-radius: 0.25rem;
  pointer-events: none;
  white-space: nowrap;
}
.tooltip[hidden] {
  display: none;
}
figcaption {
  margin-top: 0.4rem;
  font-size: 0.8rem;
}
.tools {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.5rem;
}
button {
  font: inherit;
  padding: 0.2rem 0.7rem;
}
input:focus-visible,
button:focus-visible,
#points:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.help {
  font-size: 0.8rem;
  color: #94a3b8;
}
.status {
  min-height: 1.4em;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.75rem;
}
.credit {
  font-size: 0.75rem;
  color: #94a3b8;
}
```

# JavaScript

```javascript
// Un gráfico de dispersión de 10 000 puntos en la GPU.
//
// Decisiones de diseño:
// - Los datos (x, y, franja: 3 floats = 12 bytes por trayecto) se suben UNA vez con
//   STATIC_DRAW. Mover o acercar solo cambia u_view (4 números); filtrar franjas, una máscara
//   de bits (u_visibleBands). Nunca se vuelve a subir el búfer.
// - Un punto oculto se manda fuera del espacio de recorte: la GPU lo descarta antes de
//   rasterizarlo. Así el filtro no necesita otro búfer ni otro dibujo.
// - Puntos redondos: gl_POINTS con gl_PointSize, y en el fragment shader gl_PointCoord con un
//   borde suave. Color premultiplicado y blendFunc(ONE, ONE_MINUS_SRC_ALPHA) sobre un lienzo
//   transparente: debajo se ve la rejilla, dibujada en un canvas 2D (lección «Transparencia y mezcla»).
// - Lo que no es dibujo va en la CPU: buscar el punto más cercano y contar los visibles son
//   10 000 cuentas, menos de un milisegundo. Las funciones de la vista son puras (se pueden probar).
// - Ctrl + rueda (el pellizco de un trackpad llega así) acerca; la rueda sola sigue desplazando
//   la página, como en los mapas incrustados. Arrastrar con dos dedos en una pantalla táctil, también.
// - Se dibuja al cargar, al cambiar de tamaño y al interactuar, como mucho una vez por fotograma.
//
// Usa assets/gl/kit.js (léelo con «Assets»).
// Alcance: HTML, CSS, JavaScript, DOM, eventos de puntero, rueda y teclado, canvas 2D y este módulo.
import { createView, createProgram, readPixel } from './gl/kit.js';

// --- Los datos: sintéticos y siempre los mismos (generador con semilla) -----------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const BANDS = [
  { name: 'mañana', share: 0.35, speed: 13, color: [245, 158, 11] },
  { name: 'tarde', share: 0.45, speed: 11, color: [34, 211, 238] },
  { name: 'noche', share: 0.2, speed: 15.5, color: [192, 132, 252] },
];
const TRIPS = 10000;
function generateTrips(count, seed) {
  const random = mulberry32(seed);
  const data = new Float32Array(count * 3); // x (km), y (min), franja: 12 bytes por trayecto
  for (let i = 0; i < count; i++) {
    const pick = random();
    const band = pick < BANDS[0].share ? 0 : pick < BANDS[0].share + BANDS[1].share ? 1 : 2;
    const long = random() < 0.03;
    const km = long ? 8 + random() * 3.5 : 0.4 + 7.5 * random() ** 1.7;
    const speed = BANDS[band].speed + (random() + random() - 1) * 4; // km/h
    const minutes = (km / speed) * 60 + random() * 6; // + semáforos y paradas
    data.set([km, minutes, band], i * 3);
  }
  return data;
}
const trips = generateTrips(TRIPS, 2026);

// --- La vista: un rectángulo en km y minutos; funciones puras --------------------------------
const FULL = { x0: 0, x1: 12, y0: 0, y1: 60 };
function clampView(view) {
  const w = Math.min(FULL.x1 - FULL.x0, Math.max((FULL.x1 - FULL.x0) / 32, view.x1 - view.x0));
  const h = Math.min(FULL.y1 - FULL.y0, Math.max((FULL.y1 - FULL.y0) / 32, view.y1 - view.y0));
  const cx = Math.min(FULL.x1, Math.max(FULL.x0, (view.x0 + view.x1) / 2)); // el centro, dentro de los datos
  const cy = Math.min(FULL.y1, Math.max(FULL.y0, (view.y0 + view.y1) / 2));
  return { x0: cx - w / 2, x1: cx + w / 2, y0: cy - h / 2, y1: cy + h / 2 };
}
// Acercar «factor» veces dejando quieto el punto (fx, fy), en fracciones de la vista (0..1, y hacia arriba)
function zoomView(view, factor, fx = 0.5, fy = 0.5) {
  const w = (view.x1 - view.x0) / factor;
  const h = (view.y1 - view.y0) / factor;
  const ax = view.x0 + (view.x1 - view.x0) * fx;
  const ay = view.y0 + (view.y1 - view.y0) * fy;
  return clampView({ x0: ax - w * fx, x1: ax + w * (1 - fx), y0: ay - h * fy, y1: ay + h * (1 - fy) });
}
function panView(view, dx, dy) { // en fracciones de la vista
  const w = view.x1 - view.x0;
  const h = view.y1 - view.y0;
  return clampView({ x0: view.x0 + dx * w, x1: view.x1 + dx * w, y0: view.y0 + dy * h, y1: view.y1 + dy * h });
}
function visibleCounts(data, view, bandsOn) {
  const counts = [0, 0, 0];
  for (let i = 0; i < data.length; i += 3) {
    const [x, y, band] = [data[i], data[i + 1], data[i + 2]];
    if (bandsOn[band] && x >= view.x0 && x <= view.x1 && y >= view.y0 && y <= view.y1) counts[band] += 1;
  }
  return counts;
}
// El trayecto más cercano a (fx, fy); la distancia se mide en fracciones de la vista
function nearestTo(data, view, bandsOn, fx, fy, maxDistance = Infinity) {
  const w = view.x1 - view.x0;
  const h = view.y1 - view.y0;
  let best = -1;
  let bestDistance = maxDistance ** 2;
  for (let i = 0; i < data.length / 3; i++) {
    if (!bandsOn[data[i * 3 + 2]]) continue;
    const dx = (data[i * 3] - view.x0) / w - fx;
    const dy = (data[i * 3 + 1] - view.y0) / h - fy;
    if (dx * dx + dy * dy < bestDistance) {
      best = i;
      bestDistance = dx * dx + dy * dy;
    }
  }
  return best;
}
const fmt = (v) => String(Math.round(v * 10) / 10);
function niceStep(range, ticks = 6) { // 1, 2 o 5 × una potencia de 10
  const rough = range / ticks;
  const power = 10 ** Math.floor(Math.log10(rough));
  return [1, 2, 5, 10].map((m) => m * power).find((step) => step >= rough);
}

// --- La GPU -----------------------------------------------------------------------------------
const VERTEX = `#version 300 es
layout(location = 0) in vec2 a_position; // km, minutos
layout(location = 1) in float a_band;    // 0 mañana, 1 tarde, 2 noche
uniform vec4 u_view;          // x0, y0, ancho, alto de la vista (km y minutos)
uniform int u_visibleBands;   // máscara de bits: 1 mañana, 2 tarde, 4 noche
uniform float u_pointSize;    // en píxeles físicos
uniform vec3 u_colors[3];
uniform vec4 u_tint;          // (0, 0, 0, 0): el color de su franja; si no, este (premultiplicado)
out vec4 v_color;
void main() {
  int band = int(a_band);
  bool visible = ((u_visibleBands >> band) & 1) == 1;
  vec2 clip = (a_position - u_view.xy) / u_view.zw * 2.0 - 1.0;
  gl_Position = visible ? vec4(clip, 0.0, 1.0) : vec4(2.0, 2.0, 0.0, 1.0); // fuera: descartado
  gl_PointSize = u_pointSize;
  v_color = u_tint.a > 0.0 ? u_tint : vec4(u_colors[band], 1.0) * 0.6; // premultiplicado: alfa 0.6
}`;
const FRAGMENT = `#version 300 es
precision highp float;
in vec4 v_color;
out vec4 outColor;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0; // 0 en el centro del punto, 1 en su borde
  float coverage = 1.0 - smoothstep(0.7, 1.0, d);
  if (coverage <= 0.0) discard;
  outColor = v_color * coverage;
}`;

const pointsCanvas = document.querySelector('#points');
const axesCanvas = document.querySelector('#axes');
const axes = axesCanvas.getContext('2d');
const summary = document.querySelector('#summary');
const statusLine = document.querySelector('#status');
const tooltip = document.querySelector('#tooltip');
const bandBoxes = [...document.querySelectorAll('input[name="band"]')];
const state = { view: FULL, bandsOn: [true, true, true], selected: -1, hovered: -1 };
function say(text) {
  statusLine.textContent = text;
  console.log(text);
}

const view = createView(pointsCanvas, {
  attributes: { premultipliedAlpha: true }, // (el valor por defecto, escrito para que se vea)
  setup(gl) {
    const program = createProgram(gl, { name: 'dispersión', vertex: VERTEX, fragment: FRAGMENT });
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, trips, gl.STATIC_DRAW); // una vez: 120 000 bytes
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 12, 0); // stride y offset, en bytes
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 12, 8);
    program.set({ u_colors: BANDS.flatMap(({ color }) => color.map((c) => c / 255)) });
    return { program, vao };
  },
  render(gl, { program, vao }) {
    const { x0, x1, y0, y1 } = state.view;
    gl.clearColor(0, 0, 0, 0); // transparente: debajo está la rejilla
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // colores premultiplicados
    gl.bindVertexArray(vao);
    const mask = state.bandsOn.reduce((bits, on, band) => bits | (on ? 1 << band : 0), 0);
    program.set({ u_view: [x0, y0, x1 - x0, y1 - y0], u_visibleBands: mask, u_pointSize: 5 * devicePixelRatio, u_tint: [0, 0, 0, 0] });
    gl.drawArrays(gl.POINTS, 0, TRIPS); // los 10 000, en un solo encargo
    for (const [index, size] of [[state.hovered, 9], [state.selected, 11]]) {
      if (index < 0) continue;
      program.set({ u_pointSize: size * devicePixelRatio, u_tint: [1, 1, 1, 1] });
      gl.drawArrays(gl.POINTS, index, 1); // otra vez, encima de todos
    }
    drawAxes();
  },
  onStatus(status) {
    say(status === 'lost' ? '⚠️ contexto WebGL perdido: el gráfico vuelve en cuanto se recupere' : '✅ contexto recuperado: búfer de 120000 bytes subido de nuevo');
  },
});

// --- Ejes y rejilla en canvas 2D, detrás de los puntos ------------------------------------------
function drawAxes() {
  const box = axesCanvas.getBoundingClientRect();
  const plot = pointsCanvas.getBoundingClientRect();
  if (axesCanvas.width !== Math.round(box.width * devicePixelRatio)) axesCanvas.width = Math.round(box.width * devicePixelRatio);
  if (axesCanvas.height !== Math.round(box.height * devicePixelRatio)) axesCanvas.height = Math.round(box.height * devicePixelRatio);
  axes.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  axes.clearRect(0, 0, box.width, box.height);
  const left = plot.left - box.left;
  const top = plot.top - box.top;
  const { x0, x1, y0, y1 } = state.view;
  const toX = (x) => left + ((x - x0) / (x1 - x0)) * plot.width;
  const toY = (y) => top + plot.height - ((y - y0) / (y1 - y0)) * plot.height;
  axes.font = '11px system-ui, sans-serif';
  axes.lineWidth = 1;
  const stepX = niceStep(x1 - x0);
  const stepY = niceStep(y1 - y0);
  axes.textAlign = 'center';
  axes.textBaseline = 'top';
  for (let x = Math.ceil(x0 / stepX) * stepX; x <= x1 + 1e-9; x += stepX) {
    axes.strokeStyle = '#1e293b';
    axes.beginPath();
    axes.moveTo(Math.round(toX(x)) + 0.5, top);
    axes.lineTo(Math.round(toX(x)) + 0.5, top + plot.height);
    axes.stroke();
    axes.fillStyle = '#94a3b8';
    axes.fillText(fmt(x), toX(x), top + plot.height + 4);
  }
  axes.textAlign = 'right';
  axes.textBaseline = 'middle';
  for (let y = Math.ceil(y0 / stepY) * stepY; y <= y1 + 1e-9; y += stepY) {
    axes.strokeStyle = '#1e293b';
    axes.beginPath();
    axes.moveTo(left, Math.round(toY(y)) + 0.5);
    axes.lineTo(left + plot.width, Math.round(toY(y)) + 0.5);
    axes.stroke();
    axes.fillStyle = '#94a3b8';
    axes.fillText(fmt(y), left - 5, toY(y));
  }
  axes.fillStyle = '#cbd5e1';
  axes.textAlign = 'center';
  axes.fillText('distancia (km)', left + plot.width / 2, top + plot.height + 20);
  axes.save();
  axes.translate(10, top + plot.height / 2);
  axes.rotate(-Math.PI / 2);
  axes.fillText('duración (min)', 0, 0);
  axes.restore();
}

// --- Texto: la vista y el trayecto elegido --------------------------------------------------------
function viewLine() {
  const { x0, x1, y0, y1 } = state.view;
  const counts = visibleCounts(trips, state.view, state.bandsOn);
  const total = counts.reduce((sum, count) => sum + count, 0);
  const parts = BANDS.map(({ name }, band) => (state.bandsOn[band] ? `${name} ${counts[band]}` : `${name}: oculta`));
  return `vista: distancia ${fmt(x0)}–${fmt(x1)} km · duración ${fmt(y0)}–${fmt(y1)} min · visibles ${total} (${parts.join(', ')})`;
}
const describeTrip = (i) => `trayecto ${i + 1} · ${trips[i * 3].toFixed(2)} km · ${trips[i * 3 + 1].toFixed(1)} min · ${BANDS[trips[i * 3 + 2]].name}`;
// El texto (región aria-live) y la consola cambian al terminar un gesto, no en cada fotograma
function announce() {
  summary.textContent = viewLine();
  console.log(summary.textContent);
}
function changeView(next, announceNow = true) {
  state.view = next;
  view.invalidate();
  if (announceNow) announce();
}
// Elige un trayecto y comprueba en la GPU que se ha dibujado encima: su centro, blanco opaco
function select(index) {
  state.selected = index;
  if (index < 0) return say('ningún trayecto visible cerca');
  view.renderNow();
  const { x0, x1, y0, y1 } = state.view;
  const px = ((trips[index * 3] - x0) / (x1 - x0)) * pointsCanvas.width;
  const py = ((trips[index * 3 + 1] - y0) / (y1 - y0)) * pointsCanvas.height; // y hacia arriba, como en GL
  const inside = px >= 0 && py >= 0 && px < pointsCanvas.width && py < pointsCanvas.height;
  const pixel = inside ? readPixel(view.gl, px, py).join(', ') : 'fuera de la vista';
  say(`📍 ${describeTrip(index)} · en pantalla: ${pixel} ${pixel === '255, 255, 255, 255' ? '✅' : '❌'}`);
}

// --- Puntero: arrastrar, Ctrl + rueda, pellizcar, pasar por encima ---------------------------------
const fractionAt = (event) => {
  const box = pointsCanvas.getBoundingClientRect();
  return [(event.clientX - box.left) / box.width, 1 - (event.clientY - box.top) / box.height];
};
const pointers = new Map();
let gesture = null;
pointsCanvas.addEventListener('pointerdown', (event) => {
  pointsCanvas.setPointerCapture(event.pointerId);
  pointers.set(event.pointerId, fractionAt(event));
  gesture = { view: state.view, start: new Map(pointers), moved: false };
});
pointsCanvas.addEventListener('pointermove', (event) => {
  const [fx, fy] = fractionAt(event);
  if (!pointers.has(event.pointerId)) { // solo pasar por encima: el trayecto más cercano (≤ 3 %)
    const near = nearestTo(trips, state.view, state.bandsOn, fx, fy, 0.03);
    if (near !== state.hovered) {
      state.hovered = near;
      view.invalidate();
    }
    tooltip.hidden = near < 0;
    if (near >= 0) {
      tooltip.textContent = describeTrip(near);
      tooltip.style.left = `${Math.min(event.offsetX + 52, pointsCanvas.clientWidth - 120)}px`;
      tooltip.style.top = `${event.offsetY - 18}px`;
    }
    return;
  }
  pointers.set(event.pointerId, [fx, fy]);
  const [a, b] = [...gesture.start.values()];
  if (gesture.start.size === 1) { // un dedo o el ratón: desplazar
    const [current] = pointers.values();
    gesture.moved ||= Math.hypot(current[0] - a[0], current[1] - a[1]) > 0.01;
    changeView(panView(gesture.view, a[0] - current[0], a[1] - current[1]), false);
  } else if (pointers.size === 2) { // dos dedos: acercar alrededor de su punto medio
    const [p, q] = [...pointers.values()];
    const factor = Math.hypot(p[0] - q[0], p[1] - q[1]) / Math.max(0.01, Math.hypot(a[0] - b[0], a[1] - b[1]));
    gesture.moved = true;
    changeView(zoomView(gesture.view, factor, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2), false);
  }
});
function endPointer(event) {
  if (!pointers.delete(event.pointerId)) return;
  if (pointers.size > 0) return;
  if (gesture.moved) announce();
  else select(nearestTo(trips, state.view, state.bandsOn, ...fractionAt(event), 0.03)); // un clic
  gesture = null;
}
pointsCanvas.addEventListener('pointerup', endPointer);
pointsCanvas.addEventListener('pointercancel', endPointer);
pointsCanvas.addEventListener('pointerleave', () => {
  if (state.hovered < 0) return;
  state.hovered = -1;
  tooltip.hidden = true;
  view.invalidate();
});
let wheelTimer = 0;
pointsCanvas.addEventListener('wheel', (event) => {
  if (!event.ctrlKey && !event.metaKey) { // la rueda sola desplaza la página: solo una pista, sin consola
    statusLine.textContent = 'Para acercar, usa Ctrl + rueda (o pellizca en el trackpad)';
    return;
  }
  event.preventDefault(); // sin esto, Ctrl + rueda ampliaría la página entera
  changeView(zoomView(state.view, Math.exp(-event.deltaY * 0.01), ...fractionAt(event)), false);
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(announce, 300); // anota al terminar
}, { passive: false });

// --- Teclado, botones y franjas ----------------------------------------------------------------------
pointsCanvas.addEventListener('keydown', (event) => {
  const pans = { ArrowLeft: [-0.1, 0], ArrowRight: [0.1, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] };
  if (pans[event.key]) changeView(panView(state.view, ...pans[event.key]));
  else if (event.key === '+' || event.key === '=') changeView(zoomView(state.view, 2));
  else if (event.key === '-') changeView(zoomView(state.view, 0.5));
  else if (event.key === '0') changeView(FULL);
  else if (event.key === 'Enter') select(nearestTo(trips, state.view, state.bandsOn, 0.5, 0.5));
  else return;
  event.preventDefault();
});
document.querySelector('#zoom-in').addEventListener('click', () => changeView(zoomView(state.view, 2)));
document.querySelector('#zoom-out').addEventListener('click', () => changeView(zoomView(state.view, 0.5)));
document.querySelector('#reset').addEventListener('click', () => changeView(FULL));
for (const box of bandBoxes) {
  box.addEventListener('change', () => {
    state.bandsOn[Number(box.value)] = box.checked;
    const shown = (index) => index >= 0 && state.bandsOn[trips[index * 3 + 2]];
    if (!shown(state.selected)) state.selected = -1;
    if (!shown(state.hovered)) state.hovered = -1;
    changeView(state.view); // el mismo búfer: solo cambia la máscara
  });
}

say(`${TRIPS} trayectos × 12 bytes = ${trips.byteLength} bytes en un búfer (STATIC_DRAW) · 1 drawArrays(POINTS) por dibujo`);
changeView(FULL);
view.renderNow(); // el primer dibujo, ya (sin esperar a un fotograma)
console.log('Listo: arrastra, usa Ctrl + rueda o pellizca; con el teclado: flechas, + y −, 0 y Enter');
```

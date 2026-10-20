---
example_description: "Un mapa de calor del puntero sin basura y a ritmo de pantalla: una rejilla de 32 × 20 en un Float32Array y los píxeles en un ImageData creados una sola vez, cada pointermove (con sus eventos agrupados, getCoalescedEvents) solo suma calor, y un único bucle de requestAnimationFrame pinta y enfría hasta que todo se apaga y se detiene solo. También con el teclado"
example_tags: "javascript|rendimiento|canvas|float32array|pointermove|requestanimationframe|memoria|integracion"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>¿Dónde mira la gente?</h1>
  <p>Mueve el puntero por el escaparate, o entra con Tab y usa las flechas.</p>
  <canvas id="heat" class="heat" width="32" height="20" tabindex="0" role="img" aria-label="Mapa de calor del escaparate: zonas por las que pasa el puntero"></canvas>
  <p id="stats" class="stats" role="status">eventos: 0 · renders: 0</p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
.heat { display: block; inline-size: 320px; block-size: 200px; image-rendering: pixelated; background: #0f172a; border-radius: 0.5rem; touch-action: none; }
.heat:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 3px; }
.stats { color: #475569; font-variant-numeric: tabular-nums; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const COLS = 32;
const ROWS = 20;
const canvas = document.querySelector('#heat');
const ctx = canvas.getContext('2d');
const statsLine = document.querySelector('#stats');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Todo lo que cambia en cada evento o frame vive en estructuras creadas UNA vez.
const heat = new Float32Array(COLS * ROWS);           // calor de cada celda, de 0 a 1
const image = ctx.createImageData(COLS, ROWS);         // sus píxeles (un Uint8ClampedArray)
const stats = { events: 0, points: 0, renders: 0 };

function addHeat(col, row) {
  if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return;
  const cell = row * COLS + col;
  heat[cell] = Math.min(1, heat[cell] + 0.25);
}
// Un evento solo suma calor y pide un frame: nada de pintar aquí.
let cooling = false; // el enfriamiento (una animación) solo empieza cuando alguien mueve el puntero
function onPoint(clientX, clientY) {
  cooling = true;
  const box = canvas.getBoundingClientRect();
  addHeat(Math.floor(((clientX - box.left) / box.width) * COLS), Math.floor(((clientY - box.top) / box.height) * ROWS));
  stats.points += 1;
  requestFrame();
}
canvas.addEventListener('pointermove', (event) => {
  stats.events += 1;
  // Chrome entrega como mucho un pointermove por frame, pero guarda los intermedios: así un
  // movimiento rápido no deja huecos en el mapa.
  const points = event.getCoalescedEvents?.() ?? [event];
  for (const point of (points.length ? points : [event])) onPoint(point.clientX, point.clientY);
});
// El teclado mueve un cursor propio: el mapa también se puede usar sin ratón.
const cursor = { col: COLS / 2, row: ROWS / 2 };
const STEPS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
canvas.addEventListener('keydown', (event) => {
  const step = STEPS[event.key];
  if (!step) return;
  event.preventDefault();
  cooling = true;
  stats.events += 1;
  cursor.col = Math.min(COLS - 1, Math.max(0, cursor.col + step[0]));
  cursor.row = Math.min(ROWS - 1, Math.max(0, cursor.row + step[1]));
  addHeat(cursor.col, cursor.row);
  requestFrame();
});

// Un único bucle de rAF: pinta, enfría y se detiene solo cuando no queda calor.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let frameId = null;
function requestFrame() {
  if (frameId === null) frameId = requestAnimationFrame(frame);
}
function frame() {
  frameId = null;
  stats.renders += 1;
  let remaining = 0;
  for (let cell = 0; cell < heat.length; cell++) {
    const value = heat[cell];
    const p = cell * 4;
    image.data[p] = 255 * Math.min(1, value * 2);         // rojo
    image.data[p + 1] = 200 * Math.max(0, value * 2 - 1); // amarillo cuando está muy caliente
    image.data[p + 2] = 40;
    image.data[p + 3] = 255 * value;
    if (cooling && !reduceMotion) heat[cell] = value * 0.96; // se enfría poco a poco
    remaining += heat[cell] > 0.01 ? 1 : 0;
  }
  ctx.putImageData(image, 0, 0);
  statsLine.textContent = `eventos: ${stats.events} · puntos: ${stats.points} · renders: ${stats.renders}`;
  if (remaining > 0 && cooling && !reduceMotion) requestFrame(); // con «reducir movimiento», sin desvanecido
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden && frameId !== null) { cancelAnimationFrame(frameId); frameId = null; }
});

// Al cargar: un recorrido simulado de 100 puntos en la misma tarea, sin tocar la pantalla.
for (let i = 0; i < 100; i++) addHeat(Math.floor(i / 4) + 3, Math.floor(i / 10) + 4);
let hottest = 0;
let hot = 0;
for (let cell = 0; cell < heat.length; cell++) {
  if (heat[cell] > heat[hottest]) hottest = cell;
  if (heat[cell] > 0) hot += 1;
}
logLine(`100 puntos simulados → celdas con calor: ${hot} · la más caliente: columna ${hottest % COLS}, fila ${Math.floor(hottest / COLS)} (${heat[hottest]})`);
logLine(`estructuras creadas: 2 (un Float32Array de ${heat.length} casillas y un ImageData de ${image.data.length} bytes); por evento: 0`);
requestFrame(); // un solo frame: el recorrido simulado se pinta quieto
console.log('Listo: mueve el puntero por el escaparate (o entra con Tab y usa las flechas)');
```

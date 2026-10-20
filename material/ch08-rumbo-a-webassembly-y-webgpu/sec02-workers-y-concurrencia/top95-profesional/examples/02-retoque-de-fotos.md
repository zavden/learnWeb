---
example_description: "Un editor de fotos con un pool de workers: la imagen se parte en 8 franjas con filas de «halo» para los filtros que miran a los vecinos, cada franja viaja transferida a un worker libre y vuelve para pintarse en cuanto llega; con progreso, cancelación, deshacer y una comprobación de que el resultado por franjas es idéntico al de la imagen entera"
example_tags: "javascript|workers|pool|transferibles|canvas|pixeles|imagebitmap|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Retoque de fotos</h1>
  <div class="source">
    <label>Foto
      <select id="photo">
        <option value="valley-of-mexico.jpg">Valle de México</option>
        <option value="great-wave.jpg">La gran ola</option>
      </select>
    </label>
    <label>o una tuya <input id="file" type="file" accept="image/*"></label>
  </div>
  <canvas id="canvas" role="img" aria-label="Foto en edición"></canvas>
  <div class="controls">
    <label>Filtro
      <select id="filter">
        <option value="gray">Blanco y negro</option>
        <option value="sepia">Sepia</option>
        <option value="contrast">Contraste</option>
        <option value="blur" selected>Desenfocar</option>
        <option value="sharpen">Enfocar</option>
      </select>
    </label>
    <label>Intensidad <input id="amount" type="range" min="1" max="10" value="3"> <output id="amount-value" for="amount">3</output></label>
  </div>
  <div class="buttons">
    <button id="apply" type="button">Aplicar</button>
    <button id="cancel" type="button" disabled>Cancelar</button>
    <button id="undo" type="button" disabled>Deshacer</button>
    <button id="original" type="button">Original</button>
  </div>
  <progress id="progress" max="8" value="0" aria-label="Franjas terminadas"></progress>
  <p id="status" class="status" role="status"></p>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.app { max-width: 40rem; margin: 0 auto; padding: 1rem; display: grid; gap: 0.75rem; }
h1 { margin: 0; font-size: 1.25rem; }
.source, .controls, .buttons { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; align-items: end; }
label { display: grid; gap: 0.2rem; font-size: 0.9rem; }
.controls label:last-child { grid-template-columns: auto 1fr auto; align-items: center; }
input, select, button { font: inherit; color: var(--ink); }
select, button { padding: 0.3rem 0.6rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.6; }
:is(input, select, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
canvas { display: block; inline-size: 100%; block-size: auto; border-radius: 0.5rem; background: #e2e8f0; }
progress { inline-size: 100%; }
.status { margin: 0; font-weight: 600; }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-size: 0.8rem; }
```

# JavaScript

```javascript
// RETOQUE DE FOTOS CON UN POOL DE WORKERS
//
// Decisiones de diseño:
// - La imagen se parte en 8 franjas horizontales. Los filtros que miran a los vecinos
//   (desenfocar, enfocar) necesitan filas de más por arriba y por abajo, el «halo»:
//   una por pasada. El worker filtra franja + halo y devuelve solo las filas de dentro.
//   Al cargar se comprueba que el resultado por franjas es idéntico al de la imagen entera.
// - Cada franja es una COPIA de sus filas (slice) que se transfiere al worker y vuelve
//   transferida: la imagen de la página nunca sale de la página.
// - Un pool fijo de min(4, núcleos) workers; cada worker libre toma la siguiente franja
//   de la cola. Cada franja se pinta en cuanto llega (putImageData con un rectángulo).
// - Cancelar vacía la cola: las franjas que ya estaban en un worker terminan (son cortas)
//   y sus resultados se ignoran porque llevan el id de un trabajo anterior.
// - Deshacer guarda hasta 10 estados (ImageData) en la página.
// - Los filtros (02-photo/filters.js) los importan la página y los workers: el mismo código.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, canvas y píxeles del capítulo 6
// (con File y createImageBitmap) y este módulo.
import { FILTERS, sliceRows } from './02-photo/filters.js';

const STRIPS = 8;
const MAX_WIDTH = 1600; // las fotos más anchas se reducen al cargarlas
const $ = (selector) => document.querySelector(selector);
const fmt = (n) => n.toLocaleString('es-MX');
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}
const setStatus = (text) => { $('#status').textContent = text; };

const canvas = $('#canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
let original = null; // ImageData de la foto cargada
const undoStack = []; // estados anteriores, para deshacer
const describe = { 'valley-of-mexico.jpg': '«Valle de México» (José María Velasco, 1877)', 'great-wave.jpg': '«La gran ola de Kanagawa» (Hokusai, hacia 1831)' };

// ── El pool ─────────────────────────────────────────────────────────────────
const poolSize = Math.min(4, navigator.hardwareConcurrency || 2);
const idle = Array.from({ length: poolSize }, () => new Worker('02-photo/photo-worker.js', { type: 'module' }));
const all = [...idle];
addEventListener('pagehide', () => all.forEach((worker) => worker.terminate()));
let queue = [];
let current = null; // { job, output, done, resolve, start }
let nextJob = 1;

function dispatch() {
  while (idle.length > 0 && queue.length > 0) {
    const worker = idle.pop();
    const task = queue.shift();
    worker.postMessage(task, [task.pixels.buffer]);
  }
}
for (const worker of all) {
  worker.onmessage = (event) => {
    idle.push(worker);
    const { job, y, innerRows, pixels } = event.data;
    if (current?.job === job) {
      current.output.data.set(pixels, y * current.output.width * 4);
      if (current.paint) ctx.putImageData(current.output, 0, 0, 0, y, current.output.width, innerRows); // solo esa franja
      current.done += 1;
      $('#progress').value = current.done;
      if (current.done === current.total) {
        const finished = current;
        current = null;
        finished.resolve(finished.output);
      }
    }
    dispatch();
  };
}

// Reparte una imagen en franjas (con su halo) y devuelve una promesa con el resultado.
function runFilter(image, filter, amount, { paint = true } = {}) {
  const { width, height } = image;
  const halo = FILTERS[filter].halo(amount);
  const stripRows = Math.ceil(height / STRIPS);
  const job = nextJob++;
  const { promise, resolve } = Promise.withResolvers();
  queue = [];
  for (let y = 0; y < height; y += stripRows) {
    const innerRows = Math.min(stripRows, height - y);
    const from = Math.max(0, y - halo);
    const to = Math.min(height, y + innerRows + halo);
    queue.push({ job, filter, amount, width, rows: to - from, offset: y - from, innerRows, y, pixels: sliceRows(image, from, to) });
  }
  current = { job, input: image, output: new ImageData(width, height), done: 0, total: queue.length, paint, resolve };
  $('#progress').max = queue.length;
  $('#progress').value = 0;
  dispatch();
  return promise;
}

// ── La interfaz ─────────────────────────────────────────────────────────────
function setBusy(busy) {
  for (const id of ['#apply', '#photo', '#file', '#original']) $(id).disabled = busy;
  $('#cancel').disabled = !busy;
  $('#undo').disabled = busy || undoStack.length === 0;
}
function show(image) {
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.putImageData(image, 0, 0);
}
async function load(source, label) {
  const bitmap = await createImageBitmap(source);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  original = ctx.getImageData(0, 0, width, height);
  undoStack.length = 0;
  canvas.setAttribute('aria-label', `Foto: ${label}`);
  setBusy(false);
  report(`🖼️ ${label}: ${fmt(width)} × ${fmt(height)} px en ${STRIPS} franjas`);
}

$('#amount').addEventListener('input', () => { $('#amount-value').textContent = $('#amount').value; });
$('#apply').addEventListener('click', async () => {
  const filter = $('#filter').value;
  const amount = $('#amount').valueAsNumber;
  const before = ctx.getImageData(0, 0, canvas.width, canvas.height);
  setBusy(true);
  setStatus(`${FILTERS[filter].label} (${amount})…`);
  const start = performance.now();
  const result = await runFilter(before, filter, amount);
  if (!result) return; // cancelado: el botón ya lo contó
  undoStack.push(before);
  if (undoStack.length > 10) undoStack.shift();
  const text = `✅ ${FILTERS[filter].label} (${amount}): ${STRIPS} franjas en ${(performance.now() - start).toFixed(0)} ms`;
  setStatus(text);
  report(text);
  setBusy(false);
});
$('#cancel').addEventListener('click', () => {
  if (!current) return;
  const { done, total, resolve, input } = current;
  queue = [];       // las franjas pendientes no salen
  current = null;   // las que estaban en un worker volverán y se ignorarán
  ctx.putImageData(input, 0, 0); // se descarta lo pintado a medias
  resolve(null);
  setStatus('Cancelado');
  report(`⏹ cancelado con ${done} de ${total} franjas hechas`);
  setBusy(false);
});
$('#undo').addEventListener('click', () => {
  const previous = undoStack.pop();
  if (previous) show(previous);
  setBusy(false);
  report('↩️ deshecho');
});
$('#original').addEventListener('click', () => {
  undoStack.length = 0;
  show(original);
  setBusy(false);
  report('🔄 original');
});
$('#photo').addEventListener('change', async () => {
  const name = $('#photo').value;
  await load(await (await fetch(name)).blob(), describe[name]);
});
$('#file').addEventListener('change', async () => {
  const [file] = $('#file').files;
  if (!file) return;
  try {
    await load(file, file.name);
  } catch {
    report(`⚠️ ${file.name}: no es una imagen que el navegador sepa leer`);
  }
});

// Al cargar: la foto y la prueba de que las franjas cosen bien (sin pintar nada).
await load(await (await fetch('valley-of-mexico.jpg')).blob(), describe['valley-of-mexico.jpg']);
const byStrips = await runFilter(original, 'blur', 2, { paint: false });
const whole = FILTERS.blur.apply(original, 2).data;
report(`✅ desenfoque ×2 por franjas = desenfoque ×2 de la imagen entera: ${byStrips.data.every((value, i) => value === whole[i])}`);
report('Listo: elige un filtro y pulsa «Aplicar»; luego «Deshacer». Con una foto tuya grande y «Desenfocar» al 10, prueba «Cancelar»');
```

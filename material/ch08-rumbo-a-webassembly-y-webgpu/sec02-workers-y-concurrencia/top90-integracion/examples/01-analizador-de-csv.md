---
example_description: "Un analizador de CSV de ventas en un worker: la página le pasa un File o un Blob (sin copiar sus bytes), el worker lo lee por trozos con TextDecoder, informa del progreso, se puede cancelar entre trozo y trozo, y cada análisis lleva un id para ignorar los mensajes de uno ya sustituido"
example_tags: "javascript|workers|csv|file|blob|streams|progreso|cancelacion|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Analizador de ventas</h1>
  <p>El archivo se lee y se resume en un worker; la página solo recibe el progreso y el resumen.</p>
  <div class="controls">
    <label>Tu CSV (date,city,product,units,amount) <input id="file" type="file" accept=".csv,text/csv"></label>
    <div class="buttons">
      <button id="generate" type="button">Generar 300 000 ventas</button>
      <button id="cancel" type="button" disabled>Cancelar</button>
    </div>
  </div>
  <progress id="progress" max="1" value="0" aria-label="Progreso de la lectura"></progress>
  <h2>Ventas por ciudad</h2>
  <ol id="cities" class="cities"></ol>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
h2 { font-size: 1rem; margin: 0.75rem 0 0.25rem; }
.controls { display: grid; gap: 0.5rem; }
label { display: grid; gap: 0.25rem; font-size: 0.9rem; }
.buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button, input { font: inherit; }
button { padding: 0.35rem 0.8rem; }
:is(button, input):focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
progress { inline-size: 100%; margin-block-start: 0.75rem; }
.cities { margin: 0; font-variant-numeric: tabular-nums; }
.log { padding-inline-start: 1.25rem; font-size: 0.85rem; }
```

# JavaScript

```javascript
// Usa 01-csv/csv-worker.js (el worker) y sales.csv, en «Assets».
const $ = (selector) => document.querySelector(selector);
const fmt = (n) => n.toLocaleString('es-MX');
const formatMXN = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

const worker = new Worker('01-csv/csv-worker.js', { type: 'module' });
addEventListener('pagehide', () => worker.terminate());
let nextId = 0;
let current = null; // el análisis vigente: { id, label, timed, start, resolve }

worker.onmessage = (event) => {
  const message = event.data;
  if (message.id !== current?.id) return; // de un análisis cancelado o sustituido: se ignora
  if (message.type === 'progress') {
    $('#progress').value = message.loaded / message.total;
    return;
  }
  const { label, timed, start, resolve } = current;
  current = null;
  $('#cancel').disabled = true;
  if (message.type === 'result') {
    $('#progress').value = 1;
    const [product, units] = message.products[0];
    report(`📄 ${label} → ${fmt(message.rows)} ventas, ${message.skipped} filas descartadas · más vendido: ${product} (${fmt(units)} u.)`);
    report(`🏙️ ${message.cities.map(([city, total]) => `${city} ${formatMXN(total)}`).join(' · ')}`);
    if (timed) report(`⏱️ leído y resumido en ${(performance.now() - start).toFixed(0)} ms, sin bloquear la página`);
    $('#cities').replaceChildren(...message.cities.map(([city, total]) => Object.assign(document.createElement('li'), { textContent: `${city}: ${formatMXN(total)}` })));
  } else if (message.type === 'cancelled') {
    report(`⏹ ${label}: cancelado a mitad de lectura`);
  } else {
    report(`⚠️ ${label}: ${message.message}`);
  }
  resolve();
};

// Un análisis nuevo sustituye al que esté en marcha: se cancela y sus mensajes se ignoran.
function analyze(file, label, { timed = false } = {}) {
  if (current) {
    worker.postMessage({ type: 'cancel', id: current.id });
    current.resolve();
  }
  const { promise, resolve } = Promise.withResolvers();
  current = { id: ++nextId, label, timed, start: performance.now(), resolve };
  $('#progress').value = 0;
  $('#cancel').disabled = false;
  worker.postMessage({ type: 'analyze', id: current.id, file }); // el File viaja como referencia
  return promise;
}

$('#file').addEventListener('change', () => {
  const [file] = $('#file').files;
  if (file) analyze(file, file.name, { timed: true });
});
$('#cancel').addEventListener('click', () => {
  if (current) worker.postMessage({ type: 'cancel', id: current.id });
});
// Ventas inventadas, pero siempre las mismas: números «aleatorios» con semilla (capítulo 6).
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const CITIES = ['CDMX', 'Guadalajara', 'Monterrey', 'Puebla', 'Mérida'];
const PRODUCTS = ['Café de Chiapas', 'Mole poblano', 'Vainilla de Papantla', 'Cajeta de Celaya', 'Chocolate de Oaxaca', 'Miel de Yucatán'];
$('#generate').addEventListener('click', () => {
  // Generar el texto SÍ ocupa la página (unas décimas de segundo); leerlo y resumirlo, no.
  const random = mulberry32(300);
  const lines = ['date,city,product,units,amount'];
  for (let i = 0; i < 300_000; i++) {
    const city = CITIES[Math.floor(random() * CITIES.length)];
    const product = PRODUCTS[Math.floor(random() * PRODUCTS.length)];
    const units = 1 + Math.floor(random() * 5);
    lines.push(`2026-10-${String(1 + (i % 31)).padStart(2, '0')},${city},${product},${units},${(units * (85 + Math.floor(random() * 400))).toFixed(2)}`);
  }
  const blob = new Blob([lines.join('\n'), '\n'], { type: 'text/csv' });
  report(`🧪 300,000 ventas generadas: ${fmt(blob.size)} bytes en un Blob`);
  analyze(blob, 'ventas-generadas.csv', { timed: true });
});

// Al cargar, el CSV pequeño de «Assets» (1200 ventas).
await analyze(await (await fetch('sales.csv')).blob(), 'sales.csv');
report('Listo: pulsa «Generar 300 000 ventas» y, mientras lee, «Cancelar»; o elige un CSV tuyo');
```

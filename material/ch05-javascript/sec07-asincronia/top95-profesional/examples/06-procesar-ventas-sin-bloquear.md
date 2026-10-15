---
example_description: "Procesar 300 000 ventas sin congelar la página: un generador con semilla produce las filas, un bucle las agrega por estado y cede el turno cada 8 ms, casi siempre con scheduler.yield() y cada ~16 ms hasta el próximo frame, para que la barra y un indicador animado con rAF sigan fluidos; el proceso se puede cancelar a mitad"
example_tags: "javascript|profesional|async|scheduler-yield|generadores|rendimiento|interfaz"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="report">
  <header>
    <h1>Ventas por estado</h1>
    <p class="intro">300 000 ventas del año, agregadas en el navegador sin bloquear la página.</p>
  </header>
  <div class="toolbar">
    <button id="run" type="button">Procesar ventas</button>
    <button id="cancel" type="button" disabled>Cancelar</button>
    <span class="pulse" aria-hidden="true"></span>
  </div>
  <progress id="progress" max="100" value="0" aria-label="Progreso del cálculo"></progress>
  <p id="status" class="status" role="status">Listo para procesar.</p>
  <table>
    <caption>Los 5 estados con más ingresos</caption>
    <thead>
      <tr><th scope="col">Estado</th><th scope="col">Ventas</th><th scope="col">Ingresos</th></tr>
    </thead>
    <tbody id="rows"></tbody>
  </table>
</main>
```

# CSS

```css
:root {
  --text: #1f2933;
  --muted: #52606d;
  --page: #f5f7fa;
  --surface: #ffffff;
  --border: #c3cad3;
  --accent: #1d4ed8;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--page);
}
.report {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1.25rem 1rem 2rem;
}
h1 {
  font-size: 1.3rem;
  margin: 0;
}
.intro,
.status {
  color: var(--muted);
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.35rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  background: var(--surface);
  color: var(--text);
}
button:disabled {
  opacity: 0.55;
}
button:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.pulse {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--accent);
}
progress {
  width: 100%;
  height: 0.75rem;
  margin-top: 0.75rem;
}
table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
}
caption {
  text-align: start;
  font-weight: 600;
  padding-bottom: 0.25rem;
}
th,
td {
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid var(--border);
  text-align: start;
}
td:nth-child(n + 2),
th:nth-child(n + 2) {
  text-align: end;
  font-variant-numeric: tabular-nums;
}
```

# JavaScript

```javascript
// AGREGAR 300 000 VENTAS SIN CONGELAR LA PÁGINA.
//
// Decisiones:
// - Las filas salen de un GENERADOR con semilla (módulo 6): no se guardan
//   300 000 objetos en memoria, y los datos son los mismos en cada ejecución.
// - El bucle es normal (for…of), pero cada 8 ms cede el turno. Casi siempre
//   con await scheduler.yield() (Chrome 129+; si no existe, setTimeout): su
//   continuación tiene prioridad, el trabajo avanza rápido y los clics se
//   atienden. Pero esa prioridad también adelanta al PINTADO: con solo
//   scheduler.yield(), Chrome pinta unas 10 veces por segundo y el indicador
//   va a saltos. Por eso, si han pasado ~16 ms desde el último frame, la
//   rebanada cede HASTA EL PRÓXIMO FRAME (rAF y, tras el pintado, setTimeout).
// - Rebanadas medidas por TIEMPO, no por número de filas: funcionan igual en
//   un ordenador rápido y en un móvil lento.
// - Cancelar es una señal (AbortController) que el bucle mira tras cada
//   rebanada; la tabla conserva el último resultado completo.
// - El indicador azul lo anima JavaScript con rAF: solo se mueve en los
//   frames que se pintan. Contamos sus frames para demostrar que fluye.
// - Interfaz con querySelector, createElement y textContent (capítulo 6).
//
// Alcance: módulos 1-7 (+ un mínimo de DOM, capítulo 6).

const STATES = ['Jalisco', 'Nuevo León', 'Ciudad de México', 'Puebla', 'Yucatán', 'Oaxaca', 'Querétaro', 'Veracruz', 'Chiapas', 'Sonora'];
const WEIGHTS = [14, 13, 22, 8, 6, 5, 7, 10, 4, 11]; // reparto aproximado de las ventas
const PRODUCTS_CENTS = [21000, 9500, 18000, 6500, 32000];
const ROW_COUNT = 300_000;
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const count = new Intl.NumberFormat('es-MX');

function* generateSales(total, seed) {
  let state = seed % 2147483647;
  const random = () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
  const weightSum = WEIGHTS.reduce((sum, weight) => sum + weight, 0);
  for (let i = 0; i < total; i++) {
    let pick = random() * weightSum;
    let index = 0;
    while (pick >= WEIGHTS[index]) pick -= WEIGHTS[index++];
    const units = 1 + Math.floor(random() * 4);
    yield { state: STATES[index], cents: units * PRODUCTS_CENTS[Math.floor(random() * PRODUCTS_CENTS.length)] };
  }
}

const hasYield = typeof globalThis.scheduler?.yield === 'function';
const FRAME_MS = 16;
let lastFrameYield = performance.now();
function yieldToMain() {
  if (performance.now() - lastFrameYield >= FRAME_MS) {
    // Toca un frame: espera al rAF y continúa justo después del pintado.
    return new Promise((resolve) => requestAnimationFrame(() => setTimeout(() => {
      lastFrameYield = performance.now();
      resolve();
    }, 0)));
  }
  return hasYield ? scheduler.yield() : new Promise((resolve) => setTimeout(resolve, 0));
}

async function aggregate(rows, { total, signal, onProgress, sliceMs = 8 }) {
  const byState = new Map();
  let processed = 0;
  let slices = 1;
  let sliceStart = performance.now();
  for (const row of rows) {
    const entry = byState.get(row.state) ?? { sales: 0, cents: 0 };
    entry.sales += 1;
    entry.cents += row.cents;
    byState.set(row.state, entry);
    processed += 1;
    if (performance.now() - sliceStart >= sliceMs) {
      onProgress(processed / total);
      await yieldToMain(); // ← el navegador pinta y atiende clics
      signal?.throwIfAborted();
      slices += 1;
      sliceStart = performance.now();
    }
  }
  onProgress(1);
  return { byState, processed, slices };
}

// ── Interfaz ─────────────────────────────────────────────────────────────
const runButton = document.querySelector('#run');
const cancelButton = document.querySelector('#cancel');
const progress = document.querySelector('#progress');
const statusLine = document.querySelector('#status');
const tbody = document.querySelector('#rows');
const pulse = document.querySelector('.pulse');
let currentRun = null;

function renderTable(byState) {
  const top = [...byState].sort(([, a], [, b]) => b.cents - a.cents).slice(0, 5);
  tbody.replaceChildren(...top.map(([name, { sales, cents }]) => {
    const row = document.createElement('tr');
    for (const text of [name, count.format(sales), pesos.format(cents / 100)]) {
      const cell = document.createElement('td');
      cell.textContent = text;
      row.append(cell);
    }
    return row;
  }));
  return top;
}

async function run({ cancelAt } = {}) {
  const controller = new AbortController();
  currentRun = controller;
  runButton.disabled = true;
  cancelButton.disabled = false;
  statusLine.textContent = 'Procesando…';
  let frames = 0;
  let animating = true;
  requestAnimationFrame(function animate(now) {
    frames += 1;
    pulse.style.scale = `${1 + 0.35 * Math.sin(now / 120)}`;
    if (animating) requestAnimationFrame(animate);
  });
  try {
    const result = await aggregate(generateSales(ROW_COUNT, 2026), {
      total: ROW_COUNT,
      signal: controller.signal,
      onProgress: (fraction) => {
        progress.value = Math.round(fraction * 100);
        if (cancelAt !== undefined && fraction >= cancelAt) controller.abort(); // la demo «pulsa» Cancelar
      },
    });
    const top = renderTable(result.byState);
    const totalCents = [...result.byState.values()].reduce((sum, entry) => sum + entry.cents, 0);
    statusLine.textContent = `${count.format(result.processed)} ventas procesadas.`;
    return { ok: true, ...result, top, totalCents, frames };
  } catch (error) {
    if (error.name !== 'AbortError') throw error;
    statusLine.textContent = `Cancelado al ${progress.value} %. La tabla muestra el último resultado completo.`;
    return { ok: false, percent: progress.value };
  } finally {
    animating = false;
    runButton.disabled = false;
    cancelButton.disabled = true;
    currentRun = null;
  }
}

runButton.addEventListener('click', () => run());
cancelButton.addEventListener('click', () => currentRun?.abort());

async function demo() {
  console.log('scheduler.yield disponible (Chrome 129+) →', hasYield);
  console.log('▶ procesar las 300 000 ventas');
  const full = await run();
  console.log('  ventas procesadas →', full.processed);
  console.log('  rebanadas (tareas cortas) > 1 →', full.slices > 1);
  console.log('  el indicador se animó durante el cálculo (≥ 5 frames) →', full.frames >= 5);
  console.log('  top 3 →', full.top.slice(0, 3).map(([name]) => name).join(', '));
  console.log('  ingresos totales →', pesos.format(full.totalCents / 100));

  console.log('▶ otra vez, cancelando al pasar del 30 %');
  const cancelled = await run({ cancelAt: 0.3 });
  console.log('  cancelado →', !cancelled.ok, '| al 30 % o más →', cancelled.percent >= 30);
  console.log('  la tabla conserva el resultado anterior →', tbody.children.length === 5);
}
demo();
```

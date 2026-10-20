---
example_description: "Importar 50 000 movimientos bancarios desde un CSV sin bloquear la página: se generan y se leen en rebanadas de 8 ms que ceden el turno, con barra de progreso, botón de cancelar (AbortController) y validación línea a línea; los datos van a columnas de typed arrays (céntimos en Int32Array) y el resumen por categoría se calcula sin crear un objeto por fila. La API Long Tasks confirma que no hubo tareas largas"
example_tags: "javascript|rendimiento|csv|trocear|requestanimationframe|typed-arrays|abortcontroller|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="import">
  <h1>Importar movimientos</h1>
  <p class="actions">
    <button id="generate" type="button">Generar e importar 50 000 movimientos</button>
    <button id="cancel" type="button" disabled>Cancelar</button>
  </p>
  <p class="file">
    <label for="file">O elige tu propio CSV (fecha,categoria,importe,descripcion)</label>
    <input id="file" type="file" accept=".csv,text/csv">
  </p>
  <progress id="progress" max="1" value="0" aria-label="Progreso de la importación"></progress>
  <p id="state" class="state" role="status">Nada importado todavía</p>
  <table id="summary" class="summary" hidden>
    <caption>Resumen por categoría</caption>
    <thead><tr><th scope="col">Categoría</th><th scope="col">Movimientos</th><th scope="col">Total</th></tr></thead>
    <tbody id="summary-rows"></tbody>
  </table>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --accent: #1d4ed8; --paper: #ffffff; --page: #f8fafc; }
body { margin: 0; font-family: system-ui, sans-serif; color: var(--ink); background: var(--page); }
.import { max-width: 34rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.file { display: grid; gap: 0.25rem; font-size: 0.9rem; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--paper); color: var(--ink); cursor: pointer; }
button:disabled { cursor: not-allowed; color: #64748b; }
button:focus-visible, input:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
progress { inline-size: 100%; block-size: 1rem; }
.state { color: var(--muted); font-variant-numeric: tabular-nums; }
.summary { inline-size: 100%; border-collapse: collapse; background: var(--paper); font-variant-numeric: tabular-nums; }
.summary[hidden] { display: none; }
.summary caption { text-align: start; font-weight: 600; padding-block: 0.3rem; }
.summary th, .summary td { padding: 0.25rem 0.5rem; border-block-end: 1px solid var(--line); text-align: start; }
.summary td:nth-child(n + 2), .summary th:nth-child(n + 2) { text-align: end; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--paper); font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// IMPORTAR UN CSV POR TROZOS
// - Todo el trabajo largo va en rebanadas de 8 ms medidas por TIEMPO que ceden el turno hasta el
//   siguiente frame: la barra de progreso se pinta, los clics se atienden y «Cancelar» funciona en
//   el acto (lección «Render y frames»). Se comprueba con la API Long Tasks.
// - Las filas no se convierten en objetos: van a columnas de typed arrays creadas con el tamaño
//   justo (céntimos enteros en Int32Array: el dinero, nunca en float). Resumir es recorrer columnas.
// - Cada línea se valida; las inválidas se cuentan con su número de línea, no rompen la importación.
// - Marcas de User Timing para «generar» e «importar»: se ven en la pista Timings de DevTools.

const CATEGORIES = ['comida', 'transporte', 'vivienda', 'salud', 'ocio', 'nómina'];
const HEADER = 'fecha,categoria,importe,descripcion';
const SLICE_MS = 8;
// scheduler.yield() no sirve aquí: su continuación pasa delante del pintado y la barra no se movería.
// Con la pestaña oculta no hay frames: la importación espera a que vuelvas.
const yieldToFrame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

const generateButton = document.querySelector('#generate');
const cancelButton = document.querySelector('#cancel');
const fileInput = document.querySelector('#file');
const progress = document.querySelector('#progress');
const state = document.querySelector('#state');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const longTasks = [];
if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
  new PerformanceObserver((list) => longTasks.push(...list.getEntries())).observe({ type: 'longtask' });
}

// Un bucle «troceado»: llama a step(i) hasta `total`, cediendo el turno cada SLICE_MS.
async function sliced(total, step, signal, onProgress) {
  let sliceStart = performance.now();
  for (let i = 0; i < total; i++) {
    step(i);
    if (performance.now() - sliceStart > SLICE_MS) {
      onProgress(i / total);
      await yieldToFrame();
      signal.throwIfAborted(); // «Cancelar» se nota entre una rebanada y la siguiente
      sliceStart = performance.now();
    }
  }
  onProgress(1);
}

// 50 000 movimientos de muestra, sin azar: el resultado es siempre el mismo. Tres líneas vienen
// mal a propósito (sin importe), para ver la validación.
async function generateCsv(rows, signal) {
  const day = (i) => new Date(Date.UTC(2026, 0, 1 + (i % 365))).toISOString().slice(0, 10);
  let csv = `${HEADER}\n`; // += con texto es rápido en V8 (lección «Memoria y recolector de basura»)
  await sliced(rows, (i) => {
    const cents = ((i * 7919) % 200_000) - 100_000;
    const amount = i % 16_667 === 5 ? '' : (cents / 100).toFixed(2);
    csv += `${day(i)},${CATEGORIES[(i * 7) % CATEGORIES.length]},${amount},Movimiento ${i + 1}\n`;
  }, signal, (fraction) => { progress.value = fraction * 0.3; });
  return csv;
}

// Leer: línea a línea con indexOf (sin split del archivo entero) hacia columnas.
async function importCsv(text, signal) {
  if (!text.startsWith(HEADER)) throw new Error(`la primera línea debe ser «${HEADER}»`);
  const lineCount = text.split('\n', 1_000_001).length - 2; // como mucho un millón de líneas
  const category = new Uint8Array(lineCount);
  const cents = new Int32Array(lineCount);
  const invalidLines = [];
  let rows = 0;
  let position = text.indexOf('\n') + 1;
  await sliced(lineCount, (lineIndex) => {
    const end = text.indexOf('\n', position);
    const line = text.slice(position, end === -1 ? text.length : end);
    position = end === -1 ? text.length : end + 1;
    const first = line.indexOf(',');
    const second = line.indexOf(',', first + 1);
    const third = line.indexOf(',', second + 1);
    const categoryIndex = CATEGORIES.indexOf(line.slice(first + 1, second));
    const amount = line.slice(second + 1, third);
    if (first !== 10 || third === -1 || categoryIndex === -1 || amount === '' || !Number.isFinite(Number(amount))) {
      if (line !== '') invalidLines.push(lineIndex + 2); // +2: la cabecera y empezar en 1
      return;
    }
    category[rows] = categoryIndex;
    cents[rows] = Math.round(Number(amount) * 100);
    rows += 1;
  }, signal, (fraction) => { progress.value = 0.3 + fraction * 0.7; });
  return { rows, category, cents, invalidLines };
}

function showSummary({ rows, category, cents, invalidLines }) {
  const counts = new Uint32Array(CATEGORIES.length);
  const totals = new Float64Array(CATEGORIES.length); // sumas de céntimos: enteros exactos hasta 2^53
  for (let i = 0; i < rows; i++) {
    counts[category[i]] += 1;
    totals[category[i]] += cents[i];
  }
  document.querySelector('#summary-rows').replaceChildren(...CATEGORIES.map((name, c) => {
    const row = document.createElement('tr');
    row.append(Object.assign(document.createElement('th'), { scope: 'row', textContent: name }),
      ...[String(counts[c]), pesos.format(totals[c] / 100)].map((text) => Object.assign(document.createElement('td'), { textContent: text })));
    return row;
  }));
  document.querySelector('#summary').hidden = false;
  logLine(`filas válidas: ${rows} · inválidas: ${invalidLines.length}${invalidLines.length ? ` (líneas ${invalidLines.slice(0, 5).join(', ')})` : ''}`);
  logLine(CATEGORIES.map((name, c) => `${name} ${pesos.format(totals[c] / 100)}`).join(' · '));
}

let controller = null;
async function run(load) {
  controller = new AbortController();
  generateButton.disabled = true;
  fileInput.disabled = true;
  cancelButton.disabled = false;
  progress.value = 0;
  const start = performance.now();
  try {
    performance.mark('csv:inicio');
    const text = await load(controller.signal);
    performance.mark('csv:leido');
    state.textContent = 'importando…';
    const result = await importCsv(text, controller.signal);
    performance.mark('csv:importado');
    const readMs = performance.measure('csv: generar o leer', 'csv:inicio', 'csv:leido').duration;
    const importMs = performance.measure('csv: importar', 'csv:leido', 'csv:importado').duration;
    await new Promise((resolve) => setTimeout(resolve, 300)); // da tiempo a que lleguen las entradas longtask
    const blocking = longTasks.filter((task) => task.startTime > start).length;
    state.textContent = `Importados ${result.rows} movimientos`;
    showSummary(result);
    logLine(`tareas largas durante la importación: ${blocking}`);
    logLine(`generar o leer ≈ ${readMs.toFixed(0)} ms · importar ≈ ${importMs.toFixed(0)} ms (en rebanadas de ${SLICE_MS} ms)`);
  } catch (error) {
    state.textContent = error.name === 'AbortError' ? 'Importación cancelada' : `No se pudo importar: ${error.message}`;
    logLine(error.name === 'AbortError' ? '⏹ importación cancelada: no se guardó nada a medias' : `⚠️ ${error.message}`);
  } finally {
    for (const name of ['csv:inicio', 'csv:leido', 'csv:importado']) performance.clearMarks(name);
    performance.clearMeasures('csv: generar o leer');
    performance.clearMeasures('csv: importar');
    generateButton.disabled = false;
    fileInput.disabled = false;
    cancelButton.disabled = true;
  }
}

generateButton.addEventListener('click', () => {
  state.textContent = 'generando el CSV…';
  run((signal) => generateCsv(50_000, signal));
});
cancelButton.addEventListener('click', () => controller?.abort());
fileInput.addEventListener('change', () => {
  const [file] = fileInput.files;
  if (!file) return;
  if (file.size > 20 * 1024 * 1024) {
    logLine('⚠️ el archivo pasa de 20 MB: este ejemplo no lo importa');
    return;
  }
  state.textContent = `leyendo ${file.name}…`;
  run(() => file.text()); // el archivo nunca sale de tu navegador
});
console.log('Listo: pulsa «Generar e importar 50 000 movimientos» (y prueba «Cancelar» a mitad)');
```

---
example_description: "Una hoja de cálculo cuyo motor vive en un worker: las fórmulas se analizan una vez, un grafo de dependencias dice qué celdas lee cada una y, al cambiar una celda, solo se recalculan sus dependientes, en orden topológico; la página recibe parches con esas celdas, resalta las recalculadas, marca los ciclos y busca un objetivo sin congelarse"
example_tags: "javascript|workers|hoja-de-calculo|grafo|orden-topologico|analizador|accesibilidad|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Hoja de cálculo: un crédito hipotecario</h1>
  <p class="intro">Las fórmulas se calculan en un worker. Cuando cambias una celda, solo se recalculan las que dependen de ella, y se resaltan en amarillo.</p>
  <div class="formula-bar">
    <label for="editor">Celda <span id="cell-name" class="cell-name">B8</span></label>
    <input id="editor" autocomplete="off" spellcheck="false" aria-describedby="editor-help">
    <button id="accept" type="button">Aceptar</button>
  </div>
  <p id="editor-help" class="note">Un número, un texto o una fórmula que empiece por «=»: + − * / ^, paréntesis, celdas (B5), SUMA, PROMEDIO, MIN y MAX con rangos (C12:C251), REDONDEAR y PAGO. En la hoja: flechas para moverte, Intro o F2 para editar, escribe para reemplazar, Supr para borrar, Esc para cancelar.</p>
  <div class="buttons">
    <button id="goal" type="button">¿Cuánto extra al mes para liquidar en 15 años?</button>
    <button id="recalculate" type="button">Recalcular todo</button>
    <button id="reset" type="button">Restaurar la hoja</button>
  </div>
  <p id="status" class="status" role="status"></p>
  <div class="sheet-wrap">
    <table id="sheet" class="sheet" role="grid" aria-label="Hoja del crédito hipotecario"></table>
  </div>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --head: #e2e8f0; --subhead: #f1f5f9; --recalculated: #fef9c3; --bad: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.app { max-width: 46rem; margin: 0 auto; padding: 1rem; display: grid; gap: 0.6rem; }
h1 { margin: 0; font-size: 1.25rem; }
.intro, .note { margin: 0; color: var(--muted); font-size: 0.85rem; }
input, button { font: inherit; color: var(--ink); }
.formula-bar { display: flex; flex-wrap: wrap; gap: 0.4rem 0.6rem; align-items: center; }
.formula-bar label { font-size: 0.9rem; }
.cell-name { display: inline-block; min-inline-size: 4ch; font-family: Menlo, Consolas, monospace; font-weight: 700; }
#editor { flex: 1 1 14rem; padding: 0.3rem 0.45rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.85rem; }
button { padding: 0.3rem 0.65rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.6; }
:is(input, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.buttons { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.status { margin: 0; font-weight: 600; font-variant-numeric: tabular-nums; }
.sheet-wrap { block-size: 20rem; overflow: auto; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); scroll-padding: 1.75rem 0 0 2.75rem; }
.sheet { inline-size: 49.5rem; table-layout: fixed; border-collapse: separate; border-spacing: 0; font-size: 0.8rem; font-variant-numeric: tabular-nums; }
.sheet :is(th, td) { block-size: 1.75rem; padding: 0 0.4rem; border-inline-end: 1px solid var(--line); border-block-end: 1px solid var(--line); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sheet thead th { position: sticky; inset-block-start: 0; z-index: 2; background: var(--head); font-weight: 600; }
.sheet thead th:first-child { inset-inline-start: 0; z-index: 3; inline-size: 2.75rem; }
.sheet thead th:nth-child(2) { inline-size: 10.5rem; }
.sheet thead th:nth-child(n + 3) { inline-size: 7.25rem; }
.sheet tbody th { position: sticky; inset-inline-start: 0; z-index: 1; background: var(--head); color: var(--muted); font-weight: 400; text-align: end; }
.sheet td { cursor: cell; }
.sheet td.number { text-align: end; }
.sheet td[data-format='title'] { font-weight: 700; }
.sheet td[data-format='header'] { background: var(--subhead); font-weight: 700; }
.sheet td.recalculated { background: var(--recalculated); }
.sheet td.error { color: var(--bad); font-weight: 600; }
.sheet td.pending { color: var(--muted); font-style: italic; }
.sheet td.active { box-shadow: inset 0 0 0 2px var(--accent); }
.sheet td:focus-visible { outline: 3px solid var(--accent); outline-offset: -3px; }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-size: 0.8rem; }
```

# JavaScript

```javascript
// HOJA DE CÁLCULO CON EL MOTOR EN UN WORKER
//
// Decisiones de diseño:
// - El worker (12-sheet/sheet-worker.js) tiene la hoja entera: lo escrito en cada celda,
//   las fórmulas ya analizadas (12-sheet/formula.js) y el grafo de dependencias
//   (12-sheet/sheet.js). La página no evalúa ni una fórmula: envía lo que escribes y
//   pinta los valores que vuelven.
// - Al cambiar una celda, el worker recalcula esa celda y las que dependen de ella, en
//   orden topológico (cada una después de las que lee), y responde con un parche que
//   lleva solo esas celdas. La página las resalta: se ve qué parte de la hoja se movió.
// - Ningún parche se descarta: cada uno trae celdas distintas y todos hacen falta.
//   Llegan en orden (un solo worker, peticiones con id); mientras tanto, la celda
//   editada se ve pendiente (cursiva) y puedes seguir escribiendo en otras.
// - Los errores son valores (#¡DIV/0!, #¡REF!, #¿NOMBRE?…), como en Excel, y una
//   referencia circular no cuelga nada: las celdas que no se pueden ordenar dan #¡CICLO!.
// - Teclado como en una hoja de cálculo: una sola celda en el orden de Tab (tabindex
//   itinerante), flechas, Inicio/Fin, AvPág/RePág, Intro o F2 para editar, escribir
//   directamente reemplaza, Supr borra y Esc cancela.
// - Los tiempos solo se ven en la página: en la consola, el número de fórmulas
//   recalculadas, que no cambia de una ejecución a otra.
//
// Alcance: HTML, CSS, el capítulo de JavaScript (clases, Map y Set, recursión,
// expresiones regulares, módulos, promesas), el DOM y los eventos del capítulo 6, y
// este módulo.
const $ = (selector) => document.querySelector(selector);
const fmt = (n) => n.toLocaleString('es-MX');
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

// ── Hablar con el worker: peticiones con id ────────────────────────────────
const worker = new Worker('12-sheet/sheet-worker.js', { type: 'module' });
addEventListener('pagehide', () => worker.terminate());
const waiting = new Map(); // id → resolve
let nextId = 1;
worker.onmessage = (event) => {
  waiting.get(event.data.id)?.(event.data);
  waiting.delete(event.data.id);
};
worker.onerror = (event) => {
  event.preventDefault();
  report(`⚠️ el worker de la hoja falló: ${event.message ?? 'no se pudo cargar'}`);
};
function request(type, data = {}) {
  const id = nextId++;
  const { promise, resolve } = Promise.withResolvers();
  waiting.set(id, resolve);
  worker.postMessage({ id, type, ...data });
  return promise;
}

// ── Lo que la página sabe de la hoja: valores, lo escrito y el formato ─────
const values = new Map();  // 'B7' → 19967.6 | 'texto' | null | { error, message }
const inputs = new Map();  // 'B7' → '=REDONDEAR(-PAGO(B5/1200, B6, B4), 2)'
const formats = new Map(); // 'B7' → 'money'
const cells = new Map();   // 'B7' → su <td>
let columnCount = 0;
let rowCount = 0;
let active = 'B8';
let highlighted = [];

const isError = (value) => typeof value === 'object' && value !== null && 'error' in value;
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const integer = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 });
const general = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 4 });
function display(value, format) {
  if (value === null || value === undefined) return '';
  if (isError(value)) return value.error;
  if (typeof value === 'string') return value;
  return format === 'money' ? money.format(value) : format === 'integer' ? integer.format(value) : general.format(value);
}
const show = (ref) => display(values.get(ref), formats.get(ref));

const letter = (column) => String.fromCharCode(64 + column);
function moveFrom(ref, columns, rows) {
  const [, letters, digits] = /^([A-Z])(\d+)$/.exec(ref);
  const column = Math.min(columnCount, Math.max(1, letters.charCodeAt(0) - 64 + columns));
  const row = Math.min(rowCount, Math.max(1, Number(digits) + rows));
  return letter(column) + row;
}

function buildGrid(columns, rows) {
  columnCount = columns;
  rowCount = rows;
  const header = document.createElement('tr');
  header.append(Object.assign(document.createElement('th'), { scope: 'col', ariaLabel: 'Fila' }));
  for (let column = 1; column <= columns; column++) {
    header.append(Object.assign(document.createElement('th'), { scope: 'col', textContent: letter(column) }));
  }
  const body = document.createElement('tbody');
  for (let row = 1; row <= rows; row++) {
    const line = document.createElement('tr');
    line.append(Object.assign(document.createElement('th'), { scope: 'row', textContent: row }));
    for (let column = 1; column <= columns; column++) {
      const cell = Object.assign(document.createElement('td'), { tabIndex: -1 });
      cell.dataset.ref = letter(column) + row;
      cells.set(cell.dataset.ref, cell);
      line.append(cell);
    }
    body.append(line);
  }
  const head = document.createElement('thead');
  head.append(header);
  $('#sheet').replaceChildren(head, body);
}

function paint(ref) {
  const cell = cells.get(ref);
  const value = values.get(ref) ?? null;
  cell.textContent = display(value, formats.get(ref));
  cell.classList.toggle('number', typeof value === 'number');
  cell.classList.toggle('error', isError(value));
  cell.title = isError(value) ? value.message : '';
}
function render({ cells: entries }) {
  values.clear();
  inputs.clear();
  formats.clear();
  for (const [ref, input, value, format] of entries) {
    inputs.set(ref, input);
    values.set(ref, value);
    formats.set(ref, format);
  }
  for (const [ref, cell] of cells) {
    cell.dataset.format = formats.get(ref) ?? 'general';
    paint(ref);
  }
  highlighted.forEach((cell) => cell.classList.remove('recalculated'));
  highlighted = [];
  $('#editor').value = inputs.get(active) ?? '';
}
function applyPatch(patch) {
  highlighted.forEach((cell) => cell.classList.remove('recalculated'));
  highlighted = [];
  for (const [ref, input] of patch.inputs) {
    if (input === '') inputs.delete(ref);
    else inputs.set(ref, input);
  }
  for (const [ref, value] of patch.values) {
    values.set(ref, value);
    paint(ref);
    cells.get(ref).classList.add('recalculated');
    highlighted.push(cells.get(ref));
  }
  if (document.activeElement !== $('#editor')) $('#editor').value = inputs.get(active) ?? '';
}

// Una petición que devuelve un parche: se aplica y se dice en la página cuánto costó.
async function run(type, data) {
  const reply = await request(type, data);
  if (reply.type === 'error') {
    report(`⚠️ ${reply.message}`);
    return null;
  }
  applyPatch(reply);
  $('#status').textContent = `${fmt(reply.recalculated)} fórmulas recalculadas en ${reply.ms.toFixed(1)} ms, en el worker`;
  return reply;
}

// ── Editar ──────────────────────────────────────────────────────────────────
function select(ref, { focus = true } = {}) {
  const previous = cells.get(active);
  previous.tabIndex = -1;
  previous.classList.remove('active');
  active = ref;
  const cell = cells.get(ref);
  cell.tabIndex = 0;
  cell.classList.add('active');
  $('#cell-name').textContent = ref;
  $('#editor').value = inputs.get(ref) ?? '';
  const value = values.get(ref);
  if (isError(value)) $('#status').textContent = `${ref}: ${value.error} · ${value.message}`;
  if (focus) cell.focus();
}
function startEditing(text) {
  const editor = $('#editor');
  if (text !== undefined) editor.value = text;
  editor.focus();
  editor.setSelectionRange(editor.value.length, editor.value.length);
}
async function commit(ref, input) {
  if (input.trim() === (inputs.get(ref) ?? '')) return;
  const cell = cells.get(ref);
  cell.classList.add('pending');
  cell.ariaBusy = 'true';
  const patch = await run('set', { ref, input });
  cell.classList.remove('pending');
  cell.ariaBusy = null;
  if (!patch) return;
  const value = values.get(ref) ?? null;
  const written = inputs.get(ref) ?? '(vacía)';
  if (patch.cyclic > 0) {
    report(`⛔ ${ref} = ${written} → referencia circular: ${fmt(patch.cyclic)} fórmula(s) en #¡CICLO!`);
  } else if (isError(value)) {
    report(`⚠️ ${ref} = ${written} → ${value.error}: ${value.message}`);
  } else {
    report(`✏️ ${ref} = ${written} → ${fmt(patch.recalculated)} de ${fmt(patch.formulas)} fórmulas recalculadas · intereses totales ${show('B9')}`);
  }
}

$('#sheet').addEventListener('click', (event) => {
  const cell = event.target.closest('td[data-ref]');
  if (cell) select(cell.dataset.ref);
});
$('#sheet').addEventListener('dblclick', (event) => {
  if (event.target.closest('td[data-ref]')) startEditing();
});
const STEPS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], PageUp: [0, -10], PageDown: [0, 10], Home: [-26, 0], End: [26, 0] };
$('#sheet').addEventListener('keydown', (event) => {
  if (!event.target.matches('td[data-ref]')) return;
  if (STEPS[event.key]) select(moveFrom(active, ...STEPS[event.key]));
  else if (event.key === 'Enter' || event.key === 'F2') startEditing();
  else if (event.key === 'Delete' || event.key === 'Backspace') commit(active, '');
  else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) startEditing(event.key);
  else return;
  event.preventDefault(); // que las flechas no desplacen la página y la tecla no se escriba dos veces
});
$('#editor').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    const ref = active;
    commit(ref, $('#editor').value);
    select(moveFrom(ref, 0, 1)); // como en una hoja de cálculo: a la celda de abajo
  } else if (event.key === 'Escape') {
    $('#editor').value = inputs.get(active) ?? '';
    cells.get(active).focus();
  }
});
$('#accept').addEventListener('click', () => commit(active, $('#editor').value));

// ── Los botones ─────────────────────────────────────────────────────────────
function setBusy(busy) {
  for (const id of ['#goal', '#recalculate', '#reset']) $(id).disabled = busy;
}
$('#goal').addEventListener('click', async () => {
  setBusy(true);
  const patch = await run('goal-seek', { months: 180 });
  setBusy(false);
  if (patch) {
    report(`🎯 liquidar en ${patch.goal.months} meses: pago extra de ${show('B8')} al mes · ${patch.goal.iterations} pruebas con B8 (${fmt(patch.recalculated)} fórmulas recalculadas) · intereses totales ${show('B9')}`);
  }
});
$('#recalculate').addEventListener('click', async () => {
  const patch = await run('recalculate-all');
  if (patch) report(`🔁 recalcular todo: ${fmt(patch.recalculated)} de ${fmt(patch.formulas)} fórmulas (lo que costaría cada cambio sin el grafo)`);
});
$('#reset').addEventListener('click', async () => {
  const snapshot = await request('open');
  render(snapshot);
  $('#status').textContent = 'Hoja restaurada';
  report(`🔄 hoja restaurada: ${fmt(snapshot.cells.length)} celdas, ${fmt(snapshot.formulas)} con fórmula`);
});

// ── Al cargar: abrir la hoja y preguntar al grafo, sin cambiar nada ────────
const snapshot = await request('open');
buildGrid(snapshot.columns, snapshot.rows);
render(snapshot);
select(active, { focus: false });
report(`📗 hoja abierta en el worker: ${fmt(snapshot.cells.length)} celdas, ${fmt(snapshot.formulas)} con fórmula`);
report(`💰 pago mensual ${show('B7')} · intereses totales ${show('B9')} · saldo tras 240 meses ${show('B10')}`);
const { counts } = await request('dependents', { refs: ['B5', 'B8', 'D24', 'A1'] });
report(`🕸️ fórmulas que dependen de B5 (la tasa): ${fmt(counts.B5)} · de B8 (el pago extra): ${fmt(counts.B8)} · de D24 (el pago del mes 13): ${fmt(counts.D24)} · de A1 (el título): ${fmt(counts.A1)}`);
report('Listo: Tab hasta la hoja (empieza en B8), escribe 2000 e Intro; luego pon 50000 en D24, =B9/100000 en B5 (un ciclo) y 10.5 en B5');
```

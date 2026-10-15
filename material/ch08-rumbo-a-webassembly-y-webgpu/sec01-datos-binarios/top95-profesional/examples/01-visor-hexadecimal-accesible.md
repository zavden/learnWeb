---
example_description: "Un visor hexadecimal accesible: rejilla ARIA con un solo elemento enfocable que se mueve con las flechas, Inicio/Fin, AvPág/RePág y Ctrl+Inicio/Fin, páginas de 256 bytes, y un inspector que interpreta los bytes de la posición elegida como u8, i8, u16, i16, u32, i32 y f32 en los dos órdenes de bytes"
example_tags: "javascript|hexdump|dataview|endianness|accesibilidad|teclado|aria-grid|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="hex-app">
  <h1>Visor hexadecimal</h1>
  <div class="toolbar">
    <label>Archivo de ejemplo
      <select id="sample">
        <option value="tile.png">tile.png (155 bytes)</option>
        <option value="landscape.bmp">landscape.bmp (174 bytes)</option>
        <option value="chime.wav">chime.wav (9644 bytes)</option>
      </select>
    </label>
    <label>…o uno tuyo
      <input id="own-file" type="file">
    </label>
  </div>
  <p id="file-info" class="file-info" role="status">Cargando…</p>
  <div class="layout">
    <div>
      <div id="grid" class="grid" role="grid" aria-label="Bytes del archivo en hexadecimal" aria-describedby="grid-help"></div>
      <div class="pager">
        <button id="previous" type="button">← Anteriores</button>
        <span id="page-label"></span>
        <button id="next" type="button">Siguientes →</button>
      </div>
      <p id="grid-help" class="help">Flechas: moverse · Inicio/Fin: principio o final de la fila · AvPág/RePág: 256 bytes · Ctrl (⌘) + Inicio/Fin: primer o último byte.</p>
    </div>
    <section class="inspector" aria-labelledby="inspector-title">
      <h2 id="inspector-title">En la posición <span id="position">0x0000</span></h2>
      <table>
        <thead><tr><th scope="col">Tipo</th><th scope="col">Little-endian</th><th scope="col">Big-endian</th></tr></thead>
        <tbody id="values"></tbody>
      </table>
    </section>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --cell-active: #dbeafe; --zero: #64748b; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.hex-app { max-width: 52rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0 0 0.5rem; font-size: 1.25rem; }
h2 { margin: 0 0 0.5rem; font-size: 1rem; }
.toolbar { display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem; }
.toolbar label { display: grid; gap: 0.2rem; font-size: 0.9rem; }
select, button, input[type="file"] { font: inherit; }
select, button { padding: 0.25rem 0.5rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); color: var(--ink); }
button { cursor: pointer; }
button:disabled { cursor: default; opacity: 0.55; }
:is(select, button, input):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.file-info { color: var(--muted); }
.layout { display: flex; flex-wrap: wrap; gap: 1rem 1.5rem; align-items: flex-start; }
.grid { font-family: Menlo, Consolas, monospace; font-size: 0.72rem; }
.grid [role="row"] { display: grid; grid-template-columns: 3rem repeat(16, 1.5rem); }
.grid [role="columnheader"], .grid [role="rowheader"] { color: var(--muted); padding: 0.1rem 0; }
.grid [role="gridcell"] { padding: 0.1rem 0; text-align: center; border-radius: 0.2rem; cursor: pointer; }
.grid [role="gridcell"][data-zero] { color: var(--zero); }
.grid [role="gridcell"][aria-selected="true"] { background: var(--cell-active); color: var(--ink); font-weight: 700; }
.grid [role="gridcell"]:focus-visible { outline: 2px solid var(--accent); outline-offset: 0; }
.pager { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.5rem; font-size: 0.85rem; }
.help { font-size: 0.8rem; color: var(--muted); max-inline-size: 28rem; }
.inspector { flex: 1 1 15rem; padding: 0.75rem; border: 1px solid var(--line); border-radius: 0.6rem; background: var(--surface); }
.inspector table { border-collapse: collapse; inline-size: 100%; font-size: 0.8rem; font-variant-numeric: tabular-nums; }
.inspector th, .inspector td { padding: 0.2rem 0.4rem; border-bottom: 1px solid var(--line); text-align: start; }
.inspector td { font-family: Menlo, Consolas, monospace; overflow-wrap: anywhere; }
.log { margin: 1rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Visor hexadecimal con inspector de valores.
//
// Decisiones de diseño:
// - Rejilla ARIA (role="grid") con «tabindex itinerante»: solo la celda activa es
//   enfocable (tabindex="0"); Tab entra y sale de la rejilla de una vez y las
//   flechas se mueven dentro. Cada celda dice su posición en aria-label.
// - Se pintan páginas de 256 bytes (16 filas): un archivo de 50 MB no crea 50
//   millones de elementos. Los bytes viven en un Uint8Array y la página es un
//   subarray (una vista, sin copias).
// - El inspector usa un DataView sobre los mismos bytes y lee cada tipo en los
//   dos órdenes; si no quedan bytes suficientes, muestra «—» en lugar de fallar.
// - De un archivo propio se leen como mucho los primeros 4 MB con file.slice()
//   (el Blob no se carga entero en memoria).
// - La región aria-live es el resumen de la posición (corto); la rejilla no lo es.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, los
// formularios, la red (fetch) y este módulo.

const PAGE = 256;
const MAX_BYTES = 4 * 1024 * 1024;
const grid = document.querySelector('#grid');
const valuesBody = document.querySelector('#values');
const logList = document.querySelector('#log');
let bytes = new Uint8Array(0);
let view = new DataView(bytes.buffer);
let fileName = '';
let active = 0;

function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const hex = (value, digits) => value.toString(16).padStart(digits, '0');
const pageStart = (offset) => Math.floor(offset / PAGE) * PAGE;

function renderPage() {
  const start = pageStart(active);
  const rows = [];
  const header = document.createElement('div');
  header.setAttribute('role', 'row');
  for (let column = -1; column < 16; column += 1) { // -1: la esquina vacía sobre las posiciones
    const cell = Object.assign(document.createElement('span'), { textContent: column < 0 ? '' : hex(column, 2) });
    cell.setAttribute('role', 'columnheader');
    header.append(cell);
  }
  rows.push(header);
  for (let rowStart = start; rowStart < Math.min(start + PAGE, bytes.length); rowStart += 16) {
    const row = document.createElement('div');
    row.setAttribute('role', 'row');
    const label = Object.assign(document.createElement('span'), { textContent: hex(rowStart, 4) });
    label.setAttribute('role', 'rowheader');
    row.append(label);
    bytes.subarray(rowStart, rowStart + 16).forEach((byte, column) => {
      const offset = rowStart + column;
      const cell = Object.assign(document.createElement('span'), { textContent: hex(byte, 2), tabIndex: -1 });
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `posición ${offset}: ${hex(byte, 2)}`);
      cell.dataset.offset = offset;
      if (byte === 0) cell.dataset.zero = '';
      row.append(cell);
    });
    rows.push(row);
  }
  grid.replaceChildren(...rows);
  const last = bytes.length - 1;
  document.querySelector('#page-label').textContent = `bytes ${start}-${Math.min(start + PAGE, bytes.length) - 1} de ${bytes.length}`;
  document.querySelector('#previous').disabled = start === 0;
  document.querySelector('#next').disabled = start + PAGE > last;
}

const READERS = [
  ['u16', 2, (at, le) => view.getUint16(at, le)],
  ['i16', 2, (at, le) => view.getInt16(at, le)],
  ['u32', 4, (at, le) => view.getUint32(at, le)],
  ['i32', 4, (at, le) => view.getInt32(at, le)],
  ['f32', 4, (at, le) => view.getFloat32(at, le)],
];

function renderInspector() {
  const rows = [['u8 / i8', String(view.getUint8(active)), String(view.getInt8(active))]];
  for (const [type, size, read] of READERS) {
    const fits = active + size <= bytes.length;
    rows.push([type, fits ? String(read(active, true)) : '—', fits ? String(read(active, false)) : '—']);
  }
  valuesBody.replaceChildren(...rows.map((cells) => {
    const row = document.createElement('tr');
    cells.forEach((text, index) => row.append(Object.assign(document.createElement(index === 0 ? 'th' : 'td'), { textContent: text })));
    row.firstChild.scope = 'row';
    return row;
  }));
  document.querySelector('#position').textContent = `0x${hex(active, 4)} (${active})`;
  return rows;
}

function select(offset, { focus = true } = {}) {
  const target = Math.min(Math.max(0, offset), bytes.length - 1);
  const pageChanged = pageStart(target) !== pageStart(active) || !grid.querySelector('[role="gridcell"]');
  active = target;
  if (pageChanged) renderPage();
  for (const cell of grid.querySelectorAll('[aria-selected="true"]')) {
    cell.setAttribute('aria-selected', 'false');
    cell.tabIndex = -1;
  }
  const cell = grid.querySelector(`[data-offset="${active}"]`);
  cell.setAttribute('aria-selected', 'true');
  cell.tabIndex = 0;
  if (focus) cell.focus();
  const rows = renderInspector();
  const [, u16le, u16be] = rows[1];
  const [, u32le, u32be] = rows[3];
  logLine(`📍 0x${hex(active, 4)} → u8 ${rows[0][1]} · u16 LE ${u16le} / BE ${u16be} · u32 LE ${u32le} / BE ${u32be}`);
}

grid.addEventListener('click', (event) => {
  const cell = event.target.closest('[role="gridcell"]');
  if (cell) select(Number(cell.dataset.offset));
});
grid.addEventListener('keydown', (event) => {
  const rowStart = active - (active % 16);
  const toEdge = event.ctrlKey || event.metaKey; // Ctrl en Windows/Linux, ⌘ en macOS
  const moves = {
    ArrowRight: active + 1,
    ArrowLeft: active - 1,
    ArrowDown: active + 16,
    ArrowUp: active - 16,
    Home: toEdge ? 0 : rowStart,
    End: toEdge ? bytes.length - 1 : rowStart + 15,
    PageDown: active + PAGE,
    PageUp: active - PAGE,
  };
  if (!(event.key in moves)) return;
  event.preventDefault(); // que las flechas no desplacen la página
  select(moves[event.key]);
});
document.querySelector('#previous').addEventListener('click', () => select(pageStart(active) - PAGE, { focus: false }));
document.querySelector('#next').addEventListener('click', () => select(pageStart(active) + PAGE, { focus: false }));

function show(name, buffer, { startAt = 0, totalSize = buffer.byteLength } = {}) {
  bytes = new Uint8Array(buffer);
  view = new DataView(buffer);
  fileName = name;
  active = -1; // obliga a pintar la página
  const note = totalSize > bytes.length ? ` (se muestran los primeros ${bytes.length} bytes)` : '';
  document.querySelector('#file-info').textContent = `${fileName} · ${totalSize} bytes${note}`;
  if (bytes.length === 0) {
    grid.replaceChildren();
    valuesBody.replaceChildren();
    logLine(`📄 ${fileName}: el archivo está vacío`);
    return;
  }
  logLine(`📄 ${fileName} · ${totalSize} bytes`);
  select(startAt, { focus: false });
}

async function loadSample(name, startAt) {
  const response = await fetch(name);
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  show(name, await response.arrayBuffer(), { startAt });
}
document.querySelector('#sample').addEventListener('change', (event) => {
  loadSample(event.target.value, 0).catch((error) => logLine(`⚠️ ${error.message}`));
});
document.querySelector('#own-file').addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  try {
    show(file.name, await file.slice(0, MAX_BYTES).arrayBuffer(), { totalSize: file.size });
  } catch (error) {
    logLine(`⚠️ No se pudo leer ${file.name}: ${error.message}`);
  }
});

try {
  await loadSample('tile.png', 16); // el ancho de la imagen empieza en el byte 16
  logLine('Listo: entra en la rejilla con Tab y muévete con las flechas, o elige otro archivo');
} catch (error) {
  logLine(`⚠️ ${error.message}`);
}
```

---
example_description: "Una tabla de 200 000 productos que no pesa: el catálogo vive en un worker guardado por columnas en typed arrays; la página pide una vista (filtro y orden) y solo los tramos de filas que se ven al desplazarse (tabla virtual con aria-rowcount y aria-rowindex), con ids para descartar respuestas viejas"
example_tags: "javascript|workers|tabla-virtual|typed-arrays|ordenar|filtrar|accesibilidad|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Catálogo del mercado</h1>
  <div class="filters">
    <label>Buscar <input id="text" type="search" autocomplete="off" placeholder="mole, cafe regalo…"></label>
    <label>Categoría
      <select id="category">
        <option value="-1">Todas</option>
        <option value="0">Despensa</option>
        <option value="1">Bebidas</option>
        <option value="2">Artesanía</option>
        <option value="3">Cocina</option>
        <option value="4">Ropa</option>
      </select>
    </label>
    <label class="check"><input id="in-stock" type="checkbox"> Solo con existencias</label>
  </div>
  <p id="status" class="status" role="status"></p>
  <div id="viewport" class="viewport" tabindex="0" role="region" aria-label="Productos (desplázate para ver más)">
    <table id="table" aria-rowcount="1">
      <thead>
        <tr aria-rowindex="1">
          <th scope="col" data-key="id"><button type="button">N.º</button></th>
          <th scope="col" data-key="name"><button type="button">Producto</button></th>
          <th scope="col">Categoría</th>
          <th scope="col" data-key="price" aria-sort="descending"><button type="button">Precio</button></th>
          <th scope="col" data-key="stock"><button type="button">Existencias</button></th>
        </tr>
      </thead>
      <tbody id="body"></tbody>
    </table>
  </div>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --head: #e2e8f0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.app { max-width: 46rem; margin: 0 auto; padding: 1rem; display: grid; gap: 0.6rem; }
h1 { margin: 0; font-size: 1.25rem; }
.filters { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; align-items: end; }
label { display: grid; gap: 0.2rem; font-size: 0.9rem; }
label.check { display: flex; gap: 0.35rem; align-items: center; }
input, select, button { font: inherit; color: var(--ink); }
input[type='search'], select { padding: 0.3rem 0.45rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); }
:is(input, select, button, .viewport):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.status { margin: 0; font-weight: 600; font-variant-numeric: tabular-nums; }
.viewport { block-size: 22rem; overflow: auto; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); }
table { inline-size: 100%; border-collapse: collapse; font-size: 0.85rem; table-layout: fixed; }
thead th { position: sticky; inset-block-start: 0; z-index: 1; block-size: 2.25rem; padding: 0 0.5rem; background: var(--head); text-align: start; }
th button { padding: 0; border: 0; background: none; font-weight: 700; cursor: pointer; }
th[aria-sort='ascending'] button::after { content: ' ↑'; }
th[aria-sort='descending'] button::after { content: ' ↓'; }
th:nth-child(1) { inline-size: 5rem; }
th:nth-child(3) { inline-size: 6.5rem; }
th:nth-child(4), th:nth-child(5) { inline-size: 6.5rem; }
tbody tr { block-size: 32px; }
td { padding: 0 0.5rem; border-block-start: 1px solid var(--line); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-variant-numeric: tabular-nums; }
td:nth-child(4), td:nth-child(5), th:nth-child(4), th:nth-child(5) { text-align: end; }
tr.spacer td { padding: 0; border: 0; }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-size: 0.8rem; }
@media (max-width: 30rem) { th:nth-child(3), td:nth-child(3) { display: none; } }
```

# JavaScript

```javascript
// UNA TABLA DE 200 000 FILAS
//
// Decisiones de diseño:
// - El catálogo vive en el worker (09-table/table-worker.js), por columnas: un typed
//   array por campo (09-table/catalog.js). Filtrar y ordenar produce una permutación de
//   índices (un Uint32Array); la página nunca recibe más de unas decenas de filas.
// - Tabla virtual: solo existen las filas que se ven (más unas pocas de margen) y dos
//   filas vacías arriba y abajo que ocupan el alto del resto. Las filas miden 32 px fijos.
// - Accesible: aria-rowcount en la tabla y aria-rowindex en cada fila dicen a un lector
//   de pantalla cuántas hay y cuál es cada una; las cabeceras ordenan con un botón y
//   llevan aria-sort; la zona desplazable es enfocable (flechas, AvPág).
// - Cada petición lleva un id; si llega la respuesta de una vista o de un tramo viejos
//   (porque el usuario siguió escribiendo o desplazándose), se descarta.
// - El desplazamiento pide filas como mucho una vez por fotograma (requestAnimationFrame).
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM y los eventos del capítulo 6,
// typed arrays del módulo «Datos binarios» y este módulo.
const ROW = 32;
const OVERSCAN = 6;
const $ = (selector) => document.querySelector(selector);
const fmt = (n) => n.toLocaleString('es-MX');
const formatMXN = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

const worker = new Worker('09-table/table-worker.js', { type: 'module' });
addEventListener('pagehide', () => worker.terminate());
let latestView = 0;
let latestRows = 0;
let total = 0;
const view = { sortKey: 'price', direction: -1, category: -1, text: '', inStock: false };
const waiters = new Map(); // 'view:3', 'rows:5'… → resolve, para esperar una respuesta concreta al cargar

worker.onmessage = (event) => {
  const message = event.data;
  const key = message.type === 'ready' ? 'ready' : `${message.type}:${message.id}`;
  const waiter = waiters.get(key); // quien espera esta respuesta (al cargar)
  waiters.delete(key);
  waiter?.(message); // su código sigue después de este manejador (es una promesa)
  if (message.type === 'view') {
    if (message.id !== latestView) return; // una vista vieja
    total = message.total;
    $('#table').setAttribute('aria-rowcount', String(total + 1)); // + la fila de cabecera
    $('#status').textContent = `${fmt(total)} productos · ${describeSort()} · vista calculada en ${message.ms.toFixed(0)} ms en el worker`;
    $('#viewport').scrollTop = 0;
    requestRows();
  } else if (message.type === 'rows') {
    if (message.id !== latestRows) return; // un tramo viejo: ya se desplazó a otro sitio
    renderRows(message.start, message.rows);
  }
};
const waitFor = (key) => new Promise((resolve) => waiters.set(key, resolve));

function describeSort() {
  const labels = { id: 'por número', name: 'por nombre', price: 'por precio', stock: 'por existencias' };
  return `${labels[view.sortKey]} ${view.direction === 1 ? '↑' : '↓'}`;
}
function sendView() {
  latestView += 1;
  worker.postMessage({ id: latestView, type: 'view', view: { ...view } });
  return latestView;
}
function requestRows() {
  const viewport = $('#viewport');
  const first = Math.max(0, Math.floor(viewport.scrollTop / ROW) - OVERSCAN);
  const count = Math.ceil(viewport.clientHeight / ROW) + 2 * OVERSCAN;
  latestRows += 1;
  worker.postMessage({ id: latestRows, type: 'rows', start: first, count });
  return latestRows;
}

function spacer(height) {
  const row = document.createElement('tr');
  row.className = 'spacer';
  row.setAttribute('aria-hidden', 'true');
  const cell = Object.assign(document.createElement('td'), { colSpan: 5 });
  cell.style.height = `${height}px`;
  row.append(cell);
  return row;
}
function renderRows(start, rows) {
  const items = rows.map(({ position, id, name, category, price, stock }) => {
    const row = document.createElement('tr');
    row.setAttribute('aria-rowindex', String(position + 2)); // la cabecera es la fila 1
    for (const text of [`#${id}`, name, category, formatMXN(price), stock === 0 ? 'agotado' : fmt(stock)]) {
      row.append(Object.assign(document.createElement('td'), { textContent: text, title: text }));
    }
    return row;
  });
  const after = Math.max(0, total - start - rows.length);
  $('#body').replaceChildren(spacer(start * ROW), ...items, spacer(after * ROW));
}

let scrollPending = false;
$('#viewport').addEventListener('scroll', () => {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(() => {
    scrollPending = false;
    requestRows();
  });
});
document.querySelectorAll('th[data-key] button').forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.closest('th').dataset.key;
    view.direction = view.sortKey === key ? -view.direction : key === 'name' || key === 'id' ? 1 : -1;
    view.sortKey = key;
    document.querySelectorAll('th[data-key]').forEach((th) => {
      if (th.dataset.key === key) th.setAttribute('aria-sort', view.direction === 1 ? 'ascending' : 'descending');
      else th.removeAttribute('aria-sort');
    });
    sendView();
  });
});
let typingTimer = 0;
$('#text').addEventListener('input', () => {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    view.text = $('#text').value;
    sendView();
  }, 200);
});
$('#category').addEventListener('change', () => {
  view.category = Number($('#category').value);
  sendView();
});
$('#in-stock').addEventListener('change', () => {
  view.inStock = $('#in-stock').checked;
  sendView();
});

// Al cargar: la vista por defecto y una búsqueda, contadas en la consola.
const { total: generated } = await waitFor('ready');
report(`🗂️ ${fmt(generated)} productos generados en el worker, por columnas en typed arrays`);
let viewId = sendView();
await waitFor(`view:${viewId}`);
const firstRows = await waitFor(`rows:${latestRows}`);
const [top] = firstRows.rows;
report(`🔢 por precio, de mayor a menor: 1.º «${top.name}» (#${top.id}) ${formatMXN(top.price)}`);
Object.assign(view, { text: 'mole', category: 0, inStock: true, sortKey: 'price', direction: 1 });
viewId = sendView();
const filtered = await waitFor(`view:${viewId}`);
const cheapest = (await waitFor(`rows:${latestRows}`)).rows[0];
report(`🔎 «mole» en Despensa, con existencias → ${fmt(filtered.total)} productos; el más barato: «${cheapest.name}» ${formatMXN(cheapest.price)}`);
Object.assign(view, { text: '', category: -1, inStock: false, sortKey: 'price', direction: -1 });
sendView();
report('Listo: desplázate por la tabla (con la rueda o con Tab y AvPág), ordena por una columna o escribe «cafe regalo»');
```

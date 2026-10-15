---
example_description: "Una tabla de 100 000 productos que se ordena, se filtra y se recorre con el teclado sin despeinarse: los datos viven en columnas de typed arrays (1,2 MB), el orden y el filtro son índices en un Uint32Array, solo existen las 16 filas que se ven (y se reciclan al desplazarse), y la rejilla ARIA dice a los lectores de pantalla cuántas filas hay y en cuál están"
example_tags: "javascript|rendimiento|virtualizacion|typed-arrays|aria|grid|teclado|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="catalog">
  <h1>Inventario nacional de artesanías</h1>
  <p class="filter">
    <label for="filter">Filtrar por producto</label>
    <input id="filter" type="search" autocomplete="off" placeholder="rebozo, talavera…">
  </p>
  <p id="summary" class="summary" role="status"></p>
  <div id="grid" class="grid" role="grid" aria-label="Inventario" aria-colcount="4" tabindex="0">
    <div class="row head" role="row" aria-rowindex="1">
      <span role="columnheader" aria-sort="ascending"><button type="button" data-sort="id">N.º</button></span>
      <span role="columnheader" aria-sort="none"><button type="button" data-sort="name">Producto</button></span>
      <span role="columnheader" aria-sort="none"><button type="button" data-sort="price">Precio</button></span>
      <span role="columnheader" aria-sort="none"><button type="button" data-sort="stock">Existencias</button></span>
    </div>
    <div id="viewport" class="viewport">
      <div id="spacer" class="spacer"></div>
    </div>
  </div>
  <p class="help">Entra en la tabla con Tab: ↑ ↓, Re Pág / Av Pág, Inicio y Fin.</p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #e2e8f0; --border: #cbd5e1; --accent: #1d4ed8; --paper: #ffffff; --page: #f8fafc; --active: #dbeafe; }
body { margin: 0; font-family: system-ui, sans-serif; color: var(--ink); background: var(--page); }
.catalog { max-width: 40rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
.filter { display: grid; gap: 0.25rem; max-inline-size: 20rem; }
input { font: inherit; padding: 0.35rem 0.5rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--paper); color: var(--ink); }
input:focus-visible, button:focus-visible, .grid:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.summary, .help { color: var(--muted); font-size: 0.85rem; }
.grid { border: 1px solid var(--border); border-radius: 0.5rem; background: var(--paper); overflow: hidden; }
.row { display: grid; grid-template-columns: 4.5rem 1fr 6rem 6rem; align-items: center; block-size: 32px; padding-inline: 0.5rem; box-sizing: border-box; font-size: 0.85rem; font-variant-numeric: tabular-nums; }
.row > :nth-child(3), .row > :nth-child(4) { text-align: end; }
.head { background: #f1f5f9; border-block-end: 1px solid var(--border); font-weight: 600; }
.head button { font: inherit; padding: 0.1rem 0.25rem; border: 0; background: none; color: inherit; cursor: pointer; }
.head [aria-sort="ascending"] button::after { content: " ↑"; }
.head [aria-sort="descending"] button::after { content: " ↓"; }
.viewport { position: relative; block-size: 320px; overflow-y: auto; }
.spacer { position: relative; }
.data { position: absolute; inset-block-start: 0; inset-inline: 0; border-block-end: 1px solid var(--line); }
.data.active { background: var(--active); }
.data[hidden] { display: none; }
.data > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--paper); font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
@media (max-width: 30rem) { .row { grid-template-columns: 3.5rem 1fr 5rem 4.5rem; font-size: 0.8rem; } }
```

# JavaScript

```javascript
// TABLA VIRTUAL DE 100 000 FILAS
// - Datos por COLUMNAS en typed arrays (lección «Memoria y recolector de basura»): 100 000 filas
//   son 1,2 MB y ningún objeto por fila. El nombre se guarda como un índice a una lista de 20.
// - El orden y el filtro son listas de índices (Uint32Array). Cada orden se calcula una vez y se
//   guarda; el filtro reescribe un Uint32Array creado al empezar (nada nuevo al teclear).
// - Solo existen las filas que se ven, más 3 de margen: 16 elementos que se reciclan (lección
//   «Render y frames»). Un render por frame como mucho, por mucho que se desplace.
// - Accesibilidad: role="grid" con aria-rowcount y aria-rowindex (el lector sabe que hay 100 001
//   filas y en cuál está), aria-sort en las cabeceras y aria-activedescendant para el teclado.

const TOTAL = 100_000;
const ROW_HEIGHT = 32;
const VISIBLE = 10;                 // 320 px / 32 px
const POOL = VISIBLE + 2 * 3;       // filas en el DOM: las visibles y 3 de margen por cada lado
const NAMES = ['Alebrije', 'Árbol de la vida', 'Barro negro', 'Canasta de palma', 'Cazuela de barro', 'Cobija de lana', 'Collar de chaquira', 'Huipil bordado', 'Jarrón de Talavera', 'Jícara laqueada', 'Juguete de madera', 'Máscara de Olinalá', 'Metate', 'Molcajete', 'Petate', 'Piñata', 'Plato de Talavera', 'Rebozo de seda', 'Sarape de Saltillo', 'Sombrero de palma'];
const REGIONS = ['Oaxaca', 'Puebla', 'Michoacán', 'Guerrero', 'Jalisco', 'Chiapas', 'Yucatán', 'Coahuila'];

// ── Datos: cuatro columnas ──
const nameIndex = new Uint8Array(TOTAL);
const regionIndex = new Uint8Array(TOTAL);
const price = new Float64Array(TOTAL);
const stock = new Uint16Array(TOTAL);
for (let i = 0; i < TOTAL; i++) {
  nameIndex[i] = (i * 13) % NAMES.length;
  regionIndex[i] = (i * 7) % REGIONS.length;
  price[i] = 199 + ((i * 7919) % 4800);
  stock[i] = (i * 31) % 250;
}
const bytes = nameIndex.byteLength + regionIndex.byteLength + price.byteLength + stock.byteLength;
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

// ── Orden y filtro: índices ──
const identity = Uint32Array.from({ length: TOTAL }, (_, i) => i);
const sortedOrders = new Map([['id', identity]]); // clave → orden ascendente (calculado una vez)
const KEYS = { name: nameIndex, price, stock };
function ascendingOrder(key) {
  if (!sortedOrders.has(key)) {
    const column = KEYS[key];
    sortedOrders.set(key, identity.slice().sort((a, b) => column[a] - column[b] || a - b));
  }
  return sortedOrders.get(key);
}
const view = new Uint32Array(TOTAL); // lo que se muestra, en orden; se reescribe, nunca se recrea
let viewLength = TOTAL;
let sortKey = 'id';
let descending = false;
let filterText = '';
const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function rebuildView() {
  const order = ascendingOrder(sortKey);
  const wanted = new Uint8Array(NAMES.length); // qué nombres pasan el filtro (20 comparaciones, no 100 000)
  NAMES.forEach((name, n) => { wanted[n] = normalize(name).includes(filterText) ? 1 : 0; });
  viewLength = 0;
  for (let k = 0; k < TOTAL; k++) {
    const row = order[descending ? TOTAL - 1 - k : k];
    if (wanted[nameIndex[row]]) view[viewLength++] = row;
  }
}

// ── Las filas del DOM: un pool reciclado ──
const grid = document.querySelector('#grid');
const viewport = document.querySelector('#viewport');
const spacer = document.querySelector('#spacer');
const summary = document.querySelector('#summary');
const rows = Array.from({ length: POOL }, () => {
  const element = Object.assign(document.createElement('div'), { className: 'row data' });
  element.setAttribute('role', 'row');
  const cells = Array.from({ length: 4 }, () => {
    const cell = document.createElement('span');
    cell.setAttribute('role', 'gridcell');
    return cell;
  });
  element.append(...cells);
  spacer.append(element);
  return { element, cells };
});
let activeIndex = 0;
function render() {
  spacer.style.blockSize = `${viewLength * ROW_HEIGHT}px`;
  grid.setAttribute('aria-rowcount', String(viewLength + 1));
  const first = Math.max(0, Math.floor(viewport.scrollTop / ROW_HEIGHT) - 3);
  rows.forEach((slot, s) => {
    const index = first + s;
    slot.element.hidden = index >= viewLength;
    if (index >= viewLength) return;
    const row = view[index];
    slot.element.id = `item-${index}`;
    slot.element.setAttribute('aria-rowindex', String(index + 2));
    slot.element.classList.toggle('active', index === activeIndex);
    slot.element.style.translate = `0 ${index * ROW_HEIGHT}px`;
    slot.cells[0].textContent = String(row + 1);
    slot.cells[1].textContent = `${NAMES[nameIndex[row]]} · ${REGIONS[regionIndex[row]]}`;
    slot.cells[2].textContent = pesos.format(price[row]);
    slot.cells[3].textContent = String(stock[row]);
  });
  if (viewLength > 0) grid.setAttribute('aria-activedescendant', `item-${activeIndex}`);
  else grid.removeAttribute('aria-activedescendant');
  summary.textContent = `${viewLength.toLocaleString('es-MX')} de ${TOTAL.toLocaleString('es-MX')} productos · filas en el DOM: ${POOL}`;
}
let renderPending = false;
function requestRender() {
  if (renderPending) return;
  renderPending = true;
  requestAnimationFrame(() => { renderPending = false; render(); });
}
viewport.addEventListener('scroll', requestRender, { passive: true });
const describeRow = (index) => {
  const row = view[index];
  return `${row + 1} · ${NAMES[nameIndex[row]]} · ${REGIONS[regionIndex[row]]} · ${pesos.format(price[row])} · ${stock[row]}`;
};

// ── Ordenar (cabeceras) y filtrar (con debounce) ──
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function applySort(key) {
  descending = key === sortKey ? !descending : false;
  sortKey = key;
  for (const header of grid.querySelectorAll('[role="columnheader"]')) {
    const isSorted = header.querySelector('button').dataset.sort === key;
    header.setAttribute('aria-sort', isSorted ? (descending ? 'descending' : 'ascending') : 'none');
  }
  rebuildView();
  activeIndex = 0;
  viewport.scrollTop = 0;
  render();
}
for (const button of grid.querySelectorAll('[data-sort]')) {
  button.addEventListener('click', () => {
    const start = performance.now();
    applySort(button.dataset.sort);
    logLine(`orden: ${button.textContent} ${descending ? '↓' : '↑'} · primera fila → ${viewLength ? describeRow(0) : 'ninguna'}`);
    logLine(`ordenar y redibujar ≈ ${(performance.now() - start).toFixed(1)} ms`);
  });
}
let filterTimer = 0;
document.querySelector('#filter').addEventListener('input', (event) => {
  clearTimeout(filterTimer);
  filterTimer = setTimeout(() => {
    filterText = normalize(event.target.value.trim());
    rebuildView();
    activeIndex = 0;
    viewport.scrollTop = 0;
    render();
    logLine(`filtro «${filterText}» → ${viewLength} productos`);
  }, 150);
});

// ── Teclado: la rejilla tiene el foco y aria-activedescendant señala la fila activa ──
const KEY_STEPS = { ArrowDown: 1, ArrowUp: -1, PageDown: VISIBLE, PageUp: -VISIBLE };
grid.addEventListener('keydown', (event) => {
  if (event.target !== grid || viewLength === 0) return;
  let next = activeIndex;
  if (event.key in KEY_STEPS) next += KEY_STEPS[event.key];
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = viewLength - 1;
  else return;
  event.preventDefault();
  activeIndex = Math.min(viewLength - 1, Math.max(0, next));
  const top = activeIndex * ROW_HEIGHT;
  if (top < viewport.scrollTop) viewport.scrollTop = top;
  else if (top + ROW_HEIGHT > viewport.scrollTop + viewport.clientHeight) viewport.scrollTop = top + ROW_HEIGHT - viewport.clientHeight;
  render();
  logLine(`fila activa ${activeIndex + 1} → ${describeRow(activeIndex)}`);
});

render();
logLine(`${TOTAL} filas en ${bytes} bytes de typed arrays · filas en el DOM: ${POOL}`);
console.log('Listo: ordena por «Precio», filtra «rebozo» y recorre la tabla con el teclado (Tab y luego ↓ o Fin)');
```

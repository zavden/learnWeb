---
example_description: "Una tabla de productos que se filtra por texto (sin tildes ni mayúsculas), categoría y existencias, y se ordena por columnas con aria-sort: las filas se crean una sola vez desde un módulo de datos y después solo se ocultan con hidden y se mueven con append"
example_tags: "javascript|dom|profesional|tabla|filtrar|ordenar|aria-sort|modulos|dataset"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="catalog">
  <h1>Inventario de la tienda</h1>
  <form class="filters" aria-label="Filtrar productos">
    <p class="field">
      <label for="query">Buscar</label>
      <input id="query" type="search" placeholder="café, oaxaca, filtros…" autocomplete="off">
    </p>
    <p class="field">
      <label for="category">Categoría</label>
      <select id="category">
        <option value="all">Todas</option>
      </select>
    </p>
    <p class="field field-check">
      <input id="in-stock" type="checkbox">
      <label for="in-stock">Solo con existencias</label>
    </p>
  </form>
  <p id="result-count" role="status"></p>
  <div class="table-scroll">
    <table class="products">
      <caption class="visually-hidden">Productos, con su categoría, origen, precio y existencias</caption>
      <thead>
        <tr>
          <th scope="col"><button type="button" data-sort="name">Producto</button></th>
          <th scope="col"><button type="button" data-sort="category">Categoría</button></th>
          <th scope="col"><button type="button" data-sort="origin">Origen</button></th>
          <th scope="col" class="numeric"><button type="button" data-sort="price">Precio</button></th>
          <th scope="col" class="numeric"><button type="button" data-sort="stock">Existencias</button></th>
        </tr>
      </thead>
      <tbody id="rows">
        <tr id="empty-row" hidden><td colspan="5">Ningún producto coincide con los filtros.</td></tr>
      </tbody>
    </table>
  </div>
</main>
```

# CSS

```css
[hidden] {
  display: none !important;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #f8fafc;
}
.catalog {
  max-width: 60rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  margin-top: 0;
  font-size: 1.4rem;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  align-items: end;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
}
.field-check {
  flex-direction: row;
  align-items: center;
}
input,
select,
button {
  font: inherit;
}
input[type="search"],
select {
  padding: 0.3rem 0.5rem;
  border: 1px solid #64748b;
  border-radius: 0.25rem;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.table-scroll {
  overflow-x: auto; /* en pantallas estrechas, la tabla se desplaza y no rompe la página */
}
.products {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}
th,
td {
  padding: 0.4rem 0.6rem;
  text-align: start;
  white-space: nowrap;
  border-bottom: 1px solid #e2e8f0;
}
.numeric {
  text-align: end;
  font-variant-numeric: tabular-nums;
}
th button {
  padding: 0;
  font-weight: bold;
  color: #1d4ed8;
  background: none;
  border: 0;
  cursor: pointer;
}
th[aria-sort="ascending"] button::after {
  content: ' ▲';
}
th[aria-sort="descending"] button::after {
  content: ' ▼';
}
.out-of-stock td {
  color: #475569;
}
.badge {
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  background: #fee2e2;
  color: #7f1d1d;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

# JavaScript

```javascript
// INVENTARIO FILTRABLE Y ORDENABLE.
//
// Archivo que usa: assets/01-catalogo/products.js (botón «Assets»).
// Decisiones:
// - Las filas se crean UNA vez (createElement + textContent) y se guardan en
//   un Map sku → <tr>. Filtrar es poner hidden; ordenar es mover las filas
//   con append. Nada se destruye: el foco, la selección y las referencias
//   sobreviven (lecciones «Crear y modificar elementos» y «Seleccionar»).
// - El estado de la vista es un objeto; visibleProducts() es una función pura
//   (datos → lista) y render() lleva esa lista al DOM.
// - La búsqueda ignora tildes y mayúsculas: «oaxaca» encuentra «Oaxaca» y
//   «cafe» encuentra «Café» (normalize('NFD'), lección «Strings»).
// - aria-sort en la cabecera activa y un role="status" con el recuento.
// - Los controles avisan con los eventos input y change (módulo siguiente).
//
// Alcance: HTML, CSS (módulos 1-7), el capítulo de JavaScript y el módulo «El DOM».
import { products } from './01-catalogo/products.js';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

function fold(text) {
  let folded = '';
  for (const char of text.normalize('NFD').toLowerCase()) {
    const code = char.codePointAt(0);
    if (code < 0x300 || code > 0x36f) folded += char;
  }
  return folded;
}

// ── Vista: un estado y una función pura ─────────────────────────────────
const defaultView = Object.freeze({ query: '', category: 'all', inStockOnly: false, sortKey: 'name', direction: 'ascending' });
let view = { ...defaultView };

function visibleProducts({ query, category, inStockOnly, sortKey, direction }) {
  const needle = fold(query.trim());
  const sign = direction === 'ascending' ? 1 : -1;
  return products
    .filter((product) => category === 'all' || product.category === category)
    .filter((product) => !inStockOnly || product.stock > 0)
    .filter((product) => needle === '' || fold(`${product.name} ${product.origin}`).includes(needle))
    .toSorted((a, b) => {
      const order = typeof a[sortKey] === 'number'
        ? a[sortKey] - b[sortKey]
        : a[sortKey].localeCompare(b[sortKey], 'es');
      return order * sign || a.name.localeCompare(b.name, 'es'); // empate: por nombre
    });
}

// ── Las filas, creadas una sola vez ─────────────────────────────────────
const tbody = document.querySelector('#rows');
const emptyRow = document.querySelector('#empty-row');
const rowsBySku = new Map();

function createRow(product) {
  const row = document.createElement('tr');
  row.dataset.sku = product.sku;
  row.classList.toggle('out-of-stock', product.stock === 0);
  const cells = [product.name, product.category, product.origin, money.format(product.price)];
  for (const text of cells) {
    const cell = document.createElement('td');
    cell.textContent = text;
    row.append(cell);
  }
  row.cells[3].classList.add('numeric');
  const stockCell = document.createElement('td');
  stockCell.classList.add('numeric');
  if (product.stock === 0) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'Agotado';
    stockCell.append(badge);
  } else {
    stockCell.textContent = product.stock;
  }
  row.append(stockCell);
  return row;
}
for (const product of products) rowsBySku.set(product.sku, createRow(product));
tbody.prepend(...rowsBySku.values());

// Las categorías del <select>, sacadas de los datos.
const categorySelect = document.querySelector('#category');
for (const category of [...new Set(products.map((product) => product.category))].sort((a, b) => a.localeCompare(b, 'es'))) {
  const option = document.createElement('option');
  option.value = category;
  option.textContent = category;
  categorySelect.append(option);
}

// ── Del estado al DOM ───────────────────────────────────────────────────
const sortButtons = [...document.querySelectorAll('[data-sort]')];
const resultCount = document.querySelector('#result-count');

function render() {
  const visible = visibleProducts(view);
  const visibleSkus = new Set(visible.map((product) => product.sku));
  for (const [sku, row] of rowsBySku) row.hidden = !visibleSkus.has(sku);
  // Las visibles, en orden, delante de la fila vacía; las ocultas detrás.
  const hiddenRows = [...rowsBySku.values()].filter((row) => row.hidden);
  tbody.append(...visible.map((product) => rowsBySku.get(product.sku)), emptyRow, ...hiddenRows);
  emptyRow.hidden = visible.length > 0;
  for (const button of sortButtons) {
    const header = button.closest('th');
    if (button.dataset.sort === view.sortKey) header.setAttribute('aria-sort', view.direction);
    else header.removeAttribute('aria-sort');
  }
  resultCount.textContent = `${visible.length} de ${products.length} productos`;
  return visible;
}

function setView(changes) {
  view = { ...view, ...changes };
  return render();
}

// ── Controles (eventos: módulo siguiente) ───────────────────────────────
const queryInput = document.querySelector('#query');
const stockCheckbox = document.querySelector('#in-stock');
queryInput.addEventListener('input', () => setView({ query: queryInput.value }));
categorySelect.addEventListener('change', () => setView({ category: categorySelect.value }));
stockCheckbox.addEventListener('change', () => setView({ inStockOnly: stockCheckbox.checked }));
for (const button of sortButtons) {
  button.addEventListener('click', () => {
    const sameKey = view.sortKey === button.dataset.sort;
    setView({
      sortKey: button.dataset.sort,
      direction: sameKey && view.direction === 'ascending' ? 'descending' : 'ascending',
    });
  });
}

// ── Comprobaciones al cargar ────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const shown = () => [...tbody.querySelectorAll('tr[data-sku]:not([hidden])')].map((row) => row.dataset.sku);
const originalRows = new Set(rowsBySku.values());

setView({});
audit('sin filtros', `${shown().length} filas · primera ${shown()[0]}`, '16 filas · primera CAF-CHI-1K');
setView({ query: 'chiapas' });
audit("buscar 'chiapas'", shown().length, 3);
setView({ query: 'cafe' });
audit("buscar 'cafe' (sin tilde)", shown().length, 8);
setView({ query: '', category: 'Accesorios', inStockOnly: true });
audit('accesorios con existencias', shown().join(' '), 'FIL-100 MOL-MAN MOL-ELE PRE-1L TAZ-TAL');
setView({ category: 'all', inStockOnly: false, sortKey: 'price', direction: 'descending' });
audit('precio de mayor a menor', `${shown()[0]} … ${shown().at(-1)}`, 'MOL-ELE … PIL-500');
audit('aria-sort en Precio', document.querySelector('[data-sort="price"]').closest('th').getAttribute('aria-sort'), 'descending');
setView({ query: 'zzz' });
audit('sin resultados: se ve el aviso', `${shown().length} filas · aviso ${emptyRow.hidden ? 'oculto' : 'visible'}`, '0 filas · aviso visible');
audit('las filas son siempre las mismas', [...tbody.querySelectorAll('tr[data-sku]')].every((row) => originalRows.has(row)) && rowsBySku.size === 16, true);
setView(defaultView);
audit('recuento visible', resultCount.textContent, '16 de 16 productos');
```

---
example_description: "Una tabla de pedidos que cambia de diseño según el ancho de su propia caja (ResizeObserver, no la ventana): ancha, una tabla con cabeceras que ordenan (aria-sort); estrecha, tarjetas con etiquetas y un <select> para ordenar, porque las cabeceras ya no se ven. Las container queries harían el cambio visual; el cambio de controles necesita JavaScript"
example_tags: "javascript|resizeobserver|tabla|responsive|container-queries|aria-sort|ordenar|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Pedidos de la semana</h1>
  <p class="hint">Cambia el ancho de la vista previa: por debajo de 480 px de caja, la tabla pasa a tarjetas.</p>
  <section id="orders" class="orders" aria-labelledby="orders-caption">
    <p class="sorter">
      <label for="sort-select">Ordenar por</label>
      <select id="sort-select">
        <option value="date-descending">Fecha (recientes primero)</option>
        <option value="date-ascending">Fecha (antiguos primero)</option>
        <option value="total-descending">Total (mayor primero)</option>
        <option value="total-ascending">Total (menor primero)</option>
        <option value="customer-ascending">Cliente (A-Z)</option>
        <option value="customer-descending">Cliente (Z-A)</option>
      </select>
    </p>
    <table>
      <caption id="orders-caption">8 pedidos</caption>
      <thead>
        <tr>
          <th scope="col">Pedido</th>
          <th scope="col" data-key="customer"><button type="button">Cliente</button></th>
          <th scope="col" data-key="date" aria-sort="descending"><button type="button">Fecha</button></th>
          <th scope="col" data-key="total"><button type="button">Total</button></th>
          <th scope="col">Estado</th>
        </tr>
      </thead>
      <tbody id="rows"></tbody>
    </table>
  </section>
  <p id="status" class="status" role="status"></p>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 48rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  margin: 0;
  font-size: 1.25rem;
}
.hint {
  margin: 0.25rem 0 0.75rem;
  color: #52606d;
}
.orders table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}
caption {
  padding: 0.4rem;
  text-align: start;
  font-weight: 700;
}
th,
td {
  padding: 0.45rem 0.6rem;
  border-bottom: 1px solid #e4e7eb;
  text-align: start;
}
td.total {
  text-align: end;
  font-variant-numeric: tabular-nums;
}
th button {
  font: inherit;
  font-weight: 700;
  padding: 0;
  border: 0;
  background: none;
  color: #1d4ed8;
  cursor: pointer;
}
th[aria-sort="ascending"] button::after {
  content: " ▲";
}
th[aria-sort="descending"] button::after {
  content: " ▼";
}
.state {
  padding: 0 0.5rem;
  border-radius: 1rem;
  background: #e4e7eb;
}
.state[data-state="entregado"] { background: #dcfce7; }
.state[data-state="en camino"] { background: #fef3c7; }
/* Diseño de tabla (por defecto): el <select> sobra. */
.sorter {
  display: none;
  margin: 0 0 0.5rem;
}
/* Diseño de tarjetas: lo decide JS con data-layout, según el ancho de la caja. */
.orders[data-layout="cards"] .sorter {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.orders[data-layout="cards"] thead {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
.orders[data-layout="cards"] tr {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.15rem 0.75rem;
  margin: 0.5rem 0;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
.orders[data-layout="cards"] :is(td, th[scope="row"]) {
  display: contents;
}
.orders[data-layout="cards"] :is(td, th[scope="row"])::before {
  content: attr(data-label);
  color: #52606d;
}
.orders[data-layout="cards"] table {
  background: none;
}
select,
button {
  font: inherit;
}
select:focus-visible,
th button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.status {
  min-height: 1.4em;
  color: #52606d;
}
```

# JavaScript

```javascript
// TABLA DE PEDIDOS QUE SE ADAPTA A SU CAJA.
//
// Decisiones de diseño:
// - El diseño depende del ancho de la SECCIÓN (ResizeObserver), no de la
//   ventana: la misma tabla puede vivir en una columna lateral estrecha de
//   una página ancha. layoutFor() es una función pura del ancho.
// - Por qué JavaScript y no solo container queries: en tarjetas, las
//   cabeceras dejan de verse y con ellas los botones de ordenar; hace falta
//   OTRO control (un <select>) sincronizado con el orden y con aria-sort.
//   El aspecto lo pone el CSS a partir de data-layout.
// - La caja observada no cambia de ancho al cambiar de diseño (el ancho lo
//   marca su contenedor), así que no hay error de bucle del observer.
// - Ordenar mueve las filas que ya existen (no se repintan), y aria-sort va
//   en la cabecera activa. Los datos, con textContent; dinero y fechas, con
//   Intl en la zona de la tienda.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const ORDERS = [
  { id: 'P-2071', customer: 'Lucía Méndez', date: '2026-10-06', total: 420, state: 'entregado' },
  { id: 'P-2072', customer: 'Café El Portal', date: '2026-10-07', total: 2350, state: 'entregado' },
  { id: 'P-2073', customer: 'Andrés Pérez', date: '2026-10-08', total: 185.5, state: 'entregado' },
  { id: 'P-2074', customer: 'Begoña Ríos', date: '2026-10-09', total: 96, state: 'en camino' },
  { id: 'P-2075', customer: 'Hotel Casa Azul', date: '2026-10-10', total: 1890, state: 'en camino' },
  { id: 'P-2076', customer: 'Diego Sánchez', date: '2026-10-11', total: 310, state: 'preparando' },
  { id: 'P-2077', customer: 'Elena Vargas', date: '2026-10-12', total: 565, state: 'preparando' },
  { id: 'P-2078', customer: 'Mercado Roma', date: '2026-10-12', total: 3120, state: 'recibido' },
];
const CARDS_BELOW = 480; // px de ancho de la caja
const section = document.querySelector('#orders');
const tbody = document.querySelector('#rows');
const select = document.querySelector('#sort-select');
const statusLine = document.querySelector('#status');
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const day = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeZone: 'UTC' });
const LABELS = ['Pedido', 'Cliente', 'Fecha', 'Total', 'Estado'];

// ── Las filas, una vez ───────────────────────────────────────────────────
const rows = new Map(ORDERS.map((order) => {
  const row = document.createElement('tr');
  const values = [order.id, order.customer, day.format(new Date(`${order.date}T12:00:00Z`)), money.format(order.total)];
  values.forEach((value, index) => {
    const cell = document.createElement(index === 0 ? 'th' : 'td');
    if (index === 0) cell.scope = 'row';
    cell.dataset.label = LABELS[index]; // la etiqueta que se ve en tarjetas
    cell.textContent = value;
    if (index === 3) cell.className = 'total';
    row.append(cell);
  });
  const stateCell = document.createElement('td');
  stateCell.dataset.label = LABELS[4];
  const badge = document.createElement('span');
  badge.className = 'state';
  badge.dataset.state = order.state;
  badge.textContent = order.state;
  stateCell.append(badge);
  row.append(stateCell);
  tbody.append(row);
  return [order.id, row];
}));

// ── Ordenar (cabeceras en tabla, <select> en tarjetas) ───────────────────
const compare = {
  customer: (a, b) => a.customer.localeCompare(b.customer, 'es'),
  date: (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  total: (a, b) => a.total - b.total,
};
function sortBy(key, direction) {
  const sign = direction === 'ascending' ? 1 : -1;
  const sorted = ORDERS.toSorted((a, b) => sign * compare[key](a, b));
  tbody.append(...sorted.map((order) => rows.get(order.id))); // mover, no repintar
  for (const th of section.querySelectorAll('th[data-key]')) {
    if (th.dataset.key === key) th.setAttribute('aria-sort', direction);
    else th.removeAttribute('aria-sort');
  }
  select.value = `${key}-${direction}`;
  statusLine.textContent = `Ordenado por ${select.selectedOptions[0].textContent.toLowerCase()}`;
  return sorted.map((order) => order.id);
}
section.querySelector('thead').addEventListener('click', (event) => {
  const th = event.target.closest('th[data-key]');
  if (!th) return;
  const next = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending'; // primero, A-Z / menor
  sortBy(th.dataset.key, next);
});
select.addEventListener('change', () => {
  const [key, direction] = select.value.split('-');
  sortBy(key, direction);
});

// ── Diseño según el ancho de la caja ─────────────────────────────────────
const layoutFor = (width) => (width < CARDS_BELOW ? 'cards' : 'table');
function applyLayout(layout) {
  if (section.dataset.layout === layout) return false;
  const focusWasInHeader = section.querySelector('thead').contains(document.activeElement);
  section.dataset.layout = layout;
  if (layout === 'cards' && focusWasInHeader) select.focus(); // el control que tenías ya no se ve
  return true;
}
let measured = null;
let calls = 0;
const observer = new ResizeObserver((entries) => {
  const width = Math.round(entries[0].contentBoxSize[0].inlineSize);
  measured = layoutFor(width);
  calls += 1;
  if (applyLayout(measured) && calls > 1) {
    console.log(`📐 ${width} px → ${measured === 'cards' ? 'tarjetas' : 'tabla'}`);
  }
});

// ── Comprobaciones al cargar (antes de observar) ─────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const sorterShown = () => getComputedStyle(section.querySelector('.sorter')).display !== 'none';
audit('layoutFor: 479 px y 480 px', `${layoutFor(479)} · ${layoutFor(480)}`, 'cards · table');
applyLayout('cards');
audit('tarjetas: se ve el <select> y la cabecera queda solo para lectores', `${sorterShown()} · ${getComputedStyle(section.querySelector('thead')).position}`, 'true · absolute');
applyLayout('table');
audit('tabla: el <select> se oculta', sorterShown(), false);
audit('ordenar por total (mayor primero)', sortBy('total', 'descending').slice(0, 3).join(' '), 'P-2078 P-2072 P-2075');
audit('aria-sort en «Total» y el <select> sincronizado', `${section.querySelector('[data-key="total"]').getAttribute('aria-sort')} · ${select.value}`, 'descending · total-descending');
section.querySelector('[data-key="customer"] button').click();
audit('clic en «Cliente» → ascendente; la primera fila, «Andrés Pérez»', `${section.querySelector('[data-key="customer"]').getAttribute('aria-sort')} · ${tbody.firstElementChild.cells[1].textContent}`, 'ascending · Andrés Pérez');
section.querySelector('[data-key="customer"] button').click();
audit('otro clic → descendente; la primera, «Mercado Roma»', `${section.querySelector('[data-key="customer"]').getAttribute('aria-sort')} · ${tbody.firstElementChild.cells[1].textContent}`, 'descending · Mercado Roma');
sortBy('date', 'descending');
delete section.dataset.layout; // el observer decidirá con el ancho real
observer.observe(section);
console.log('Listo: cambia el ancho de la vista previa (cruza los 480 px de caja) y ordena con las cabeceras o con el <select>');
```

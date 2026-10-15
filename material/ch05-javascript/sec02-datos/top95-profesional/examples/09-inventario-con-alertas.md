---
example_description: "Panel de inventario: Map de productos y existencias, Set de descatalogados y de alertas, movimientos validados antes de aplicarse, filtros y tiempo relativo con Intl"
example_tags: "javascript|profesional|map|set|intl|interfaz"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <header class="app-header">
    <h1>Inventario · Té y Café en Casa</h1>
    <p class="as-of">Datos del <time id="as-of" datetime="2026-10-12T08:30:00Z">12 de octubre de 2026</time></p>
  </header>

  <section class="card" aria-labelledby="summary-title">
    <h2 id="summary-title">Resumen</h2>
    <dl class="stats">
      <div><dt>Referencias activas</dt><dd id="stat-active">—</dd></div>
      <div><dt>Bajo mínimo</dt><dd id="stat-low">—</dd></div>
      <div><dt>Valor del almacén</dt><dd id="stat-value">—</dd></div>
    </dl>
  </section>

  <section class="card" aria-labelledby="alerts-title">
    <h2 id="alerts-title">Alertas de reposición</h2>
    <ul id="alerts" class="alerts" aria-live="polite"></ul>
  </section>

  <section class="card wide" aria-labelledby="stock-title">
    <div class="table-header">
      <h2 id="stock-title">Existencias</h2>
      <div class="filter">
        <label for="filter">Mostrar</label>
        <select id="filter">
          <option value="all">Todas</option>
          <option value="low">Bajo mínimo</option>
          <option value="discontinued">Descatalogadas</option>
        </select>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">SKU</th>
            <th scope="col">Producto</th>
            <th scope="col" class="num">Stock</th>
            <th scope="col" class="num">Mínimo</th>
            <th scope="col">Estado</th>
            <th scope="col">Último movimiento</th>
          </tr>
        </thead>
        <tbody id="stock-body"></tbody>
      </table>
    </div>
  </section>

  <section class="card wide" aria-labelledby="move-title">
    <h2 id="move-title">Registrar movimiento</h2>
    <form id="move-form" class="move-form" novalidate>
      <div class="field">
        <label for="move-sku">Producto</label>
        <select id="move-sku" name="sku"></select>
      </div>
      <div class="field">
        <label for="move-quantity">Unidades (negativo = salida)</label>
        <input id="move-quantity" name="quantity" type="number" step="1" value="-5" aria-describedby="move-error">
      </div>
      <div class="field">
        <label for="move-reason">Motivo</label>
        <select id="move-reason" name="reason">
          <option>venta</option>
          <option>reposición</option>
          <option>rotura</option>
          <option>ajuste de inventario</option>
        </select>
      </div>
      <button type="submit">Registrar</button>
    </form>
    <p id="move-error" class="error" role="alert" hidden></p>
    <h3>Últimos movimientos</h3>
    <ol id="history" class="history"></ol>
  </section>
</main>
```

# CSS

```css
:root {
  --text: #1b1f24;
  --muted: #545b66;
  --page: #f4f6f8;
  --surface: #ffffff;
  --border: #c4c9d0;
  --field-border: #8a929c;
  --accent: #0b5cad;
  --accent-bg: #e7f0fa;
  --ok: #1a6b3c;
  --ok-bg: #e3f4ea;
  --warn: #7a4b00;
  --warn-bg: #fff4d6;
  --danger: #9b1c1c;
  --danger-bg: #fde8e8;
  --neutral: #3d4450;
  --neutral-bg: #eceff3;
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

.app {
  max-width: 64rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  display: grid;
  gap: 1.25rem;
}

.app-header,
.wide {
  grid-column: 1 / -1;
}

h1 {
  margin: 0;
  font-size: clamp(1.4rem, 1.1rem + 1.4vw, 1.9rem);
}

h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}

h3 {
  margin: 1.25rem 0 0.5rem;
  font-size: 1rem;
}

.as-of {
  margin: 0.25rem 0 0;
  color: var(--muted);
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.25rem;
  min-width: 0; /* deja que la tabla se desplace dentro de la tarjeta */
}

.stats {
  margin: 0;
  display: grid;
  gap: 0.75rem;
}

.stats div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--neutral-bg);
  padding-bottom: 0.4rem;
}

.stats dt {
  color: var(--muted);
}

.stats dd {
  margin: 0;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.alerts {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.5rem;
}

.alerts li {
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  background: var(--warn-bg);
  color: var(--warn);
}

.alerts li[data-state='out'] {
  background: var(--danger-bg);
  color: var(--danger);
}

.alerts li[data-state='none'] {
  background: var(--ok-bg);
  color: var(--ok);
}

.table-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem 1rem;
}

.filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

th,
td {
  padding: 0.5rem 0.6rem;
  text-align: left;
  border-bottom: 1px solid var(--neutral-bg);
  white-space: nowrap;
}

th {
  font-size: 0.85rem;
  color: var(--muted);
}

.num {
  text-align: right;
}

.badge {
  display: inline-block;
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--ok-bg);
  color: var(--ok);
}

.badge[data-state='low'] {
  background: var(--warn-bg);
  color: var(--warn);
}

.badge[data-state='out'] {
  background: var(--danger-bg);
  color: var(--danger);
}

.badge[data-state='discontinued'] {
  background: var(--neutral-bg);
  color: var(--neutral);
}

.move-form {
  display: grid;
  gap: 0.75rem;
  align-items: end;
}

.field label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

select,
input,
button {
  font: inherit;
}

select,
input {
  width: 100%;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--field-border);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text);
}

.filter select {
  width: auto;
}

input[aria-invalid='true'] {
  border: 2px solid var(--danger);
}

button {
  padding: 0.55rem 1.1rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--accent);
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
}

:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.error {
  margin: 0.75rem 0 0;
  color: var(--danger);
  font-weight: 600;
}

.history {
  margin: 0;
  padding-left: 1.5rem;
  color: var(--muted);
}

@media (width >= 48rem) {
  .app {
    grid-template-columns: 1fr 1fr;
  }

  .move-form {
    grid-template-columns: 2fr 1fr 1fr auto;
  }
}
```

# JavaScript

```javascript
// PANEL DE INVENTARIO.
//
// Estructuras de datos (cada una elegida por un motivo):
// - PRODUCTS: Map sku → ficha. El sku llega en tiempo de ejecución (de un formulario):
//   un Map no tiene claves heredadas como 'constructor' que puedan colarse.
// - stock: Map sku → { units, lastMovement }. Recuento inicial + movimientos.
// - DISCONTINUED: Set de skus que ya no se reponen (has() sin recorrer nada).
// - El historial de movimientos es un array: el orden es parte del dato.
//
// Reglas de negocio: un movimiento se valida ENTERO antes de aplicarse (sku conocido,
// entero distinto de 0, sin reponer descatalogados, sin dejar el stock en negativo).
//
// Alcance: function y las flechas, en «Funciones y ámbito»; querySelector, textContent,
// createElement, append y addEventListener, en el capítulo 6 (el DOM y los eventos).

// «Ahora» fijo = fecha de los datos, para que el ejemplo se vea igual cualquier día.
// En una aplicación real sería new Date().
const NOW = new Date('2026-10-12T08:30:00Z');
const ZONE = 'Europe/Madrid';

const PRODUCTS = new Map([
  ['CAF-ETI', { name: 'Café de Etiopía 250 g', priceCents: 1190, minStock: 8 }],
  ['CAF-COL', { name: 'Café de Colombia 250 g', priceCents: 990, minStock: 8 }],
  ['CAF-DES', { name: 'Café descafeinado 250 g', priceCents: 990, minStock: 6 }],
  ['TE-SEN', { name: 'Té verde sencha 100 g', priceCents: 650, minStock: 10 }],
  ['TE-ROO', { name: 'Rooibos con vainilla 100 g', priceCents: 590, minStock: 10 }],
  ['TE-CHA', { name: 'Té chai especiado 100 g', priceCents: 720, minStock: 6 }],
  ['TAZ-CER', { name: 'Taza de cerámica', priceCents: 1250, minStock: 4 }],
  ['MOL-MAN', { name: 'Molinillo manual', priceCents: 3490, minStock: 2 }],
]);
const DISCONTINUED = new Set(['TE-CHA']);

// Recuento físico del 1 de septiembre: el punto de partida del stock.
const OPENING_DATE = new Date('2026-09-01T07:00:00Z');
const OPENING_COUNT = new Map([
  ['CAF-ETI', 40], ['CAF-COL', 40], ['CAF-DES', 20], ['TE-SEN', 30],
  ['TE-ROO', 30], ['TE-CHA', 12], ['TAZ-CER', 12], ['MOL-MAN', 5],
]);

// Movimientos desde entonces (en una app real llegarían de la base de datos).
const INITIAL_MOVEMENTS = [
  { at: '2026-09-18T16:20:00Z', sku: 'CAF-ETI', quantity: -29, reason: 'venta' },
  { at: '2026-09-25T11:05:00Z', sku: 'TE-ROO', quantity: -24, reason: 'venta' },
  { at: '2026-10-02T10:40:00Z', sku: 'TAZ-CER', quantity: -2, reason: 'rotura' },
  { at: '2026-10-05T08:10:00Z', sku: 'CAF-DES', quantity: 6, reason: 'reposición' },
  { at: '2026-10-07T17:15:00Z', sku: 'MOL-MAN', quantity: -5, reason: 'venta' },
  { at: '2026-10-09T12:30:00Z', sku: 'TE-CHA', quantity: -9, reason: 'venta' },
  { at: '2026-10-11T18:45:00Z', sku: 'CAF-COL', quantity: -33, reason: 'venta' },
];

// ── Lógica (no toca el DOM) ─────────────────────────────────────────────

const stock = new Map();
for (const sku of PRODUCTS.keys()) {
  stock.set(sku, { units: OPENING_COUNT.get(sku) ?? 0, lastMovement: OPENING_DATE });
}
const history = [];

function applyMovement(movement) {
  const { sku, quantity, reason } = movement;
  // 1. Validar todo ANTES de modificar nada.
  if (!PRODUCTS.has(sku)) throw new RangeError(`El producto «${sku}» no existe.`);
  if (!Number.isInteger(quantity) || quantity === 0) {
    throw new RangeError('Las unidades deben ser un número entero distinto de 0.');
  }
  if (quantity > 0 && DISCONTINUED.has(sku)) {
    throw new RangeError(`${PRODUCTS.get(sku).name} está descatalogado: no se repone.`);
  }
  const current = stock.get(sku);
  if (current.units + quantity < 0) {
    throw new RangeError(`Solo quedan ${current.units} unidades de ${PRODUCTS.get(sku).name}.`);
  }
  // 2. Aplicar: un objeto nuevo para el sku (no se modifica el anterior).
  const at = new Date(movement.at);
  stock.set(sku, { units: current.units + quantity, lastMovement: at });
  history.push({ at, sku, quantity, reason });
}

function statusOf(sku) {
  if (DISCONTINUED.has(sku)) return 'discontinued';
  const { units } = stock.get(sku);
  if (units === 0) return 'out';
  return units <= PRODUCTS.get(sku).minStock ? 'low' : 'ok';
}

// Set de skus activos que hay que reponer: se recalcula a partir del stock.
function alertSkus() {
  const result = new Set();
  for (const sku of PRODUCTS.keys()) {
    const status = statusOf(sku);
    if (status === 'low' || status === 'out') result.add(sku);
  }
  return result;
}

// Para reponer hasta el triple del mínimo.
function suggestedOrder(sku) {
  return PRODUCTS.get(sku).minStock * 3 - stock.get(sku).units;
}

function warehouseValueCents() {
  let total = 0;
  for (const [sku, { units }] of stock) {
    total += units * PRODUCTS.get(sku).priceCents; // céntimos: enteros exactos
  }
  return total;
}

// Días de calendario en Madrid entre dos instantes (ver «Integración» del módulo).
const partsFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: ZONE });
function calendarDay(date) {
  const parts = {};
  for (const part of partsFormat.formatToParts(date)) parts[part.type] = Number(part.value);
  return Date.UTC(parts.year, parts.month - 1, parts.day) / (24 * 60 * 60 * 1000);
}

for (const movement of INITIAL_MOVEMENTS) {
  applyMovement(movement);
}

// ── Formatos ────────────────────────────────────────────────────────────

const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' });
const relative = new Intl.RelativeTimeFormat('es-ES', { numeric: 'auto' });
const dateTime = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short', timeZone: ZONE });
const STATUS_LABELS = { ok: 'Correcto', low: 'Bajo mínimo', out: 'Agotado', discontinued: 'Descatalogado' };

function relativeDay(date) {
  return relative.format(calendarDay(date) - calendarDay(NOW), 'day');
}

// ── Interfaz ────────────────────────────────────────────────────────────

const filterSelect = document.querySelector('#filter');
const tableBody = document.querySelector('#stock-body');
const alertList = document.querySelector('#alerts');
const historyList = document.querySelector('#history');
const form = document.querySelector('#move-form');
const skuSelect = document.querySelector('#move-sku');
const quantityInput = document.querySelector('#move-quantity');
const reasonSelect = document.querySelector('#move-reason');
const errorMessage = document.querySelector('#move-error');

function cell(text, className) {
  const td = document.createElement('td');
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function renderTable() {
  const filter = filterSelect.value;
  tableBody.textContent = '';
  for (const [sku, product] of PRODUCTS) {
    const status = statusOf(sku);
    const visible = filter === 'all' ||
      (filter === 'low' && (status === 'low' || status === 'out')) ||
      (filter === 'discontinued' && status === 'discontinued');
    if (!visible) continue;

    const { units, lastMovement } = stock.get(sku);
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.setAttribute('data-state', status);
    badge.textContent = STATUS_LABELS[status];
    const statusCell = cell('');
    statusCell.append(badge);

    const row = document.createElement('tr');
    row.append(cell(sku), cell(product.name), cell(String(units), 'num'), cell(String(product.minStock), 'num'),
      statusCell, cell(relativeDay(lastMovement)));
    tableBody.append(row);
  }
}

function renderAlerts() {
  alertList.textContent = '';
  // Los más urgentes primero: menor proporción stock / mínimo.
  const urgent = [...alertSkus()].toSorted((a, b) =>
    stock.get(a).units / PRODUCTS.get(a).minStock - stock.get(b).units / PRODUCTS.get(b).minStock);
  for (const sku of urgent) {
    const item = document.createElement('li');
    item.setAttribute('data-state', statusOf(sku));
    item.textContent = `${PRODUCTS.get(sku).name}: quedan ${stock.get(sku).units}. Pedir ${suggestedOrder(sku)} uds.`;
    alertList.append(item);
  }
  if (urgent.length === 0) {
    const item = document.createElement('li');
    item.setAttribute('data-state', 'none');
    item.textContent = 'Todo en orden: ningún producto bajo mínimo.';
    alertList.append(item);
  }
}

function renderSummary() {
  const active = [...PRODUCTS.keys()].filter((sku) => !DISCONTINUED.has(sku)).length;
  document.querySelector('#stat-active').textContent = String(active);
  document.querySelector('#stat-low').textContent = String(alertSkus().size);
  document.querySelector('#stat-value').textContent = money.format(warehouseValueCents() / 100);
}

function renderHistory() {
  historyList.textContent = '';
  for (const { at, sku, quantity, reason } of history.toReversed().slice(0, 5)) {
    const item = document.createElement('li');
    const sign = quantity > 0 ? '+' : '';
    item.textContent = `${dateTime.format(at)} · ${sku} ${sign}${quantity} (${reason})`;
    historyList.append(item);
  }
}

function renderAll() {
  renderSummary();
  renderAlerts();
  renderTable();
  renderHistory();
}

function handleSubmit(event) {
  event.preventDefault(); // el formulario no recarga la página
  const quantityText = quantityInput.value.trim();
  try {
    if (quantityText === '') throw new TypeError('Escribe cuántas unidades entran o salen.');
    // El nuevo movimiento ocurre «ahora» (el NOW fijo del ejemplo).
    applyMovement({ at: NOW.toISOString(), sku: skuSelect.value, quantity: Number(quantityText), reason: reasonSelect.value });
    errorMessage.hidden = true;
    quantityInput.removeAttribute('aria-invalid');
    renderAll();
  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.hidden = false;
    quantityInput.setAttribute('aria-invalid', 'true');
  }
}

for (const [sku, product] of PRODUCTS) {
  const option = document.createElement('option');
  option.value = sku;
  option.textContent = `${product.name} (${sku})`;
  skuSelect.append(option);
}
filterSelect.addEventListener('change', renderTable);
form.addEventListener('submit', handleSubmit);
renderAll();

console.log('Alertas al cargar →', alertSkus());
console.log('Valor del almacén →', money.format(warehouseValueCents() / 100));
console.log('Prueba a registrar -20 uds. de Té verde sencha, o +5 del té chai descatalogado.');
```

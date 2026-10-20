---
example_description: "Un panel de ventas de tres cafeterías: datos de assets/sales.json, tarjetas con minigráficos en canvas de alta densidad que se redibujan al cambiar el ancho, barras por tienda en SVG con <title>, la tabla de datos, y el rango (7 o 30 días) recordado en localStorage"
example_tags: "javascript|canvas|svg|fetch|localstorage|graficos|intl|accesibilidad|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="dashboard">
  <header class="dashboard__header">
    <h1>Cafés La Parroquia · ventas</h1>
    <div class="range" role="group" aria-label="Periodo">
      <button type="button" data-range="7" aria-pressed="true">7 días</button>
      <button type="button" data-range="30" aria-pressed="false">30 días</button>
    </div>
  </header>
  <p id="status" class="status" role="status">Cargando las ventas…</p>
  <section class="kpis" aria-label="Resumen del periodo">
    <article class="kpi">
      <h2>Ventas</h2>
      <p class="kpi__value" id="kpi-sales">—</p>
      <canvas class="kpi__spark" id="spark-sales" role="img" aria-label="Ventas por día"></canvas>
    </article>
    <article class="kpi">
      <h2>Tickets</h2>
      <p class="kpi__value" id="kpi-tickets">—</p>
      <canvas class="kpi__spark" id="spark-tickets" role="img" aria-label="Tickets por día"></canvas>
    </article>
    <article class="kpi">
      <h2>Ticket promedio</h2>
      <p class="kpi__value" id="kpi-average">—</p>
      <canvas class="kpi__spark" id="spark-average" role="img" aria-label="Ticket promedio por día"></canvas>
    </article>
  </section>
  <section aria-labelledby="stores-title">
    <h2 id="stores-title">Por tienda</h2>
    <svg id="stores-chart" viewBox="0 0 320 100" role="img" aria-labelledby="stores-title"
         font-family="system-ui, sans-serif" font-size="12" fill="#1f2933"></svg>
  </section>
  <details>
    <summary>Ver los datos por día</summary>
    <table>
      <thead><tr id="table-head"><th scope="col">Día</th></tr></thead>
      <tbody id="table-body"></tbody>
    </table>
  </details>
  <p><button id="forget" type="button" class="link">Olvidar el periodo elegido</button></p>
</main>
```

# CSS

```css
:root {
  --ink: #1f2933;
  --muted: #52606d;
  --surface: #ffffff;
  --page: #f5f7fa;
  --accent: #0e7490;
  --line: #cbd2d9;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--ink);
  background: var(--page);
}
.dashboard {
  max-width: 48rem;
  margin: 0 auto;
  padding: 1rem;
}
.dashboard__header {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
}
h1 {
  font-size: 1.2rem;
  margin: 0;
}
h2 {
  font-size: 0.9rem;
  margin: 0 0 0.25rem;
}
.range {
  display: flex;
}
.range button {
  font: inherit;
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--accent);
  background: var(--surface);
  color: var(--accent);
}
.range button:first-child {
  border-radius: 0.4rem 0 0 0.4rem;
}
.range button:last-child {
  border-radius: 0 0.4rem 0.4rem 0;
}
.range button[aria-pressed="true"] {
  background: var(--accent);
  color: #ffffff;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.status {
  color: var(--muted);
  font-size: 0.9rem;
}
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.kpi {
  padding: 0.75rem;
  border-radius: 0.6rem;
  background: var(--surface);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
}
.kpi__value {
  margin: 0 0 0.4rem;
  font-size: 1.4rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.kpi__spark {
  display: block;
  width: 100%;
  height: 40px;
}
#stores-chart {
  display: block;
  width: 100%;
  max-width: 32rem;
  height: auto;
  background: var(--surface);
}
details {
  margin-top: 1rem;
}
table {
  border-collapse: collapse;
  font-size: 0.85rem;
}
th,
td {
  padding: 0.2rem 0.6rem;
  border-bottom: 1px solid var(--line);
  text-align: end;
}
th:first-child,
td:first-child {
  text-align: start;
}
.link {
  font: inherit;
  padding: 0;
  border: 0;
  background: none;
  color: #1d4ed8;
  text-decoration: underline;
  cursor: pointer;
}
```

# JavaScript

```javascript
// Panel de ventas.
//
// Decisiones de diseño:
// - Un solo cálculo (summarize) produce todos los números del periodo; tarjetas, minigráficos,
//   barras y tabla solo los pintan. Así no pueden contradecirse.
// - Minigráficos en canvas (muchos puntos, sin interacción) con alta densidad y redibujados
//   al cambiar el ancho; barras por tienda en SVG (pocos elementos, con <title> y texto real).
// - Cada gráfico tiene su texto: aria-label con mínimo y máximo, valores escritos y la tabla.
// - El periodo se recuerda en «lw-gfx-panel-periodo» (validado al leer; «Olvidar» lo borra).
// - Las fechas son días sin hora: se leen y se formatean en UTC para que no cambien de día.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, red y almacenamiento y este módulo.

const RANGE_KEY = 'lw-gfx-panel-periodo';
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const count = new Intl.NumberFormat('es-MX');
const dayLabel = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const statusLine = document.querySelector('#status');

function loadRange() {
  try {
    const saved = localStorage.getItem(RANGE_KEY);
    return saved === '7' || saved === '30' ? Number(saved) : 7;
  } catch {
    return 7;                                   // almacenamiento bloqueado: el valor por defecto
  }
}
function saveRange(range) {
  try {
    localStorage.setItem(RANGE_KEY, String(range));
  } catch {
    // sin almacenamiento, el panel funciona igual; solo no recuerda la elección
  }
}

// ── Datos ────────────────────────────────────────────────────────────────
async function loadSales() {
  const response = await fetch('sales.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data.days) || !Array.isArray(data.stores)) throw new TypeError('formato de ventas desconocido');
  return data;
}

function summarize(data, range) {
  const days = data.days.slice(-range);
  const perDay = days.map((day) => {
    const sales = data.stores.reduce((sum, store) => sum + day[store.id].sales, 0);
    const tickets = data.stores.reduce((sum, store) => sum + day[store.id].tickets, 0);
    return { date: day.date, sales, tickets, average: sales / tickets };
  });
  const sales = perDay.reduce((sum, day) => sum + day.sales, 0);
  const tickets = perDay.reduce((sum, day) => sum + day.tickets, 0);
  const stores = data.stores.map((store) => ({
    name: store.name,
    sales: days.reduce((sum, day) => sum + day[store.id].sales, 0),
  }));
  return { days, perDay, sales, tickets, average: sales / tickets, stores };
}

// ── Canvas: minigráficos ─────────────────────────────────────────────────
function drawSparkline(canvas, values, describe) {
  const dpr = window.devicePixelRatio;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.round(width * dpr);       // borra y reinicia el contexto…
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);       // …así que la escala va después
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (i) => 3 + (i / (values.length - 1)) * (width - 6);
  const y = (v) => height - 4 - ((v - min) / (max - min || 1)) * (height - 8);
  ctx.strokeStyle = '#0e7490';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  values.forEach((v, i) => (i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))));
  ctx.stroke();
  ctx.fillStyle = '#be123c';                    // el último día, marcado
  ctx.beginPath();
  ctx.arc(x(values.length - 1), y(values.at(-1)), 3, 0, 2 * Math.PI);
  ctx.fill();
  canvas.setAttribute('aria-label', `${describe}: mínimo ${min}, máximo ${max}, último día ${values.at(-1)}`);
}

// ── SVG: barras por tienda ───────────────────────────────────────────────
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attributes, text) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  if (text !== undefined) element.textContent = text;
  return element;
}
function drawStores(stores) {
  const chart = document.querySelector('#stores-chart');
  const max = Math.max(...stores.map((store) => store.sales));
  chart.replaceChildren();
  stores.forEach((store, i) => {
    const y = 8 + i * 30;
    const width = Math.round((store.sales / max) * 170);
    chart.append(svgEl('text', { x: 0, y: y + 15 }, store.name));
    const bar = svgEl('rect', { x: 78, y, width, height: 20, rx: 3, fill: '#0e7490' });
    bar.append(svgEl('title', {}, `${store.name}: ${money.format(store.sales)}`));
    chart.append(bar, svgEl('text', { x: 84 + width, y: y + 15 }, money.format(store.sales)));
  });
}

// ── Tabla ────────────────────────────────────────────────────────────────
function fillTable(data, summary) {
  const head = document.querySelector('#table-head');
  head.replaceChildren(makeCell('th', 'Día'), ...data.stores.map((store) => makeCell('th', store.name)), makeCell('th', 'Total'));
  const body = document.querySelector('#table-body');
  body.replaceChildren(...summary.days.map((day, i) => {
    const row = document.createElement('tr');
    row.append(
      makeCell('th', dayLabel.format(new Date(`${day.date}T00:00:00Z`)), 'row'),
      ...data.stores.map((store) => makeCell('td', money.format(day[store.id].sales))),
      makeCell('td', money.format(summary.perDay[i].sales)),
    );
    return row;
  }));
}
function makeCell(tag, text, scope = 'col') {
  const cell = document.createElement(tag);
  cell.textContent = text;
  if (tag === 'th') cell.scope = scope;
  return cell;
}

// ── Montaje ──────────────────────────────────────────────────────────────
let data = null;
let range = loadRange();
let summary = null;
function drawSparklines() {
  drawSparkline(document.querySelector('#spark-sales'), summary.perDay.map((d) => d.sales), 'Ventas por día');
  drawSparkline(document.querySelector('#spark-tickets'), summary.perDay.map((d) => d.tickets), 'Tickets por día');
  drawSparkline(document.querySelector('#spark-average'), summary.perDay.map((d) => Math.round(d.average)), 'Ticket promedio por día');
}
function render() {
  summary = summarize(data, range);
  document.querySelector('#kpi-sales').textContent = money.format(summary.sales);
  document.querySelector('#kpi-tickets').textContent = count.format(summary.tickets);
  document.querySelector('#kpi-average').textContent = money.format(summary.average);
  document.querySelectorAll('[data-range]').forEach((button) => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.range) === range));
  });
  drawSparklines();
  drawStores(summary.stores);
  fillTable(data, summary);
  statusLine.textContent = `Últimos ${range} días: ${money.format(summary.sales)} en ${count.format(summary.tickets)} tickets`;
  console.log(`📊 ${statusLine.textContent} · mejor tienda: ${summary.stores.toSorted((a, b) => b.sales - a.sales)[0].name}`);
}

document.querySelector('.range').addEventListener('click', (event) => {
  const button = event.target.closest('[data-range]');
  if (!button || !data) return;
  range = Number(button.dataset.range);
  saveRange(range);
  render();
});
document.querySelector('#forget').addEventListener('click', () => {
  try { localStorage.removeItem(RANGE_KEY); } catch { /* nada que borrar */ }
  console.log('🧹 periodo olvidado: la próxima visita empieza en 7 días');
});
let resizePending = null;
window.addEventListener('resize', () => {    // el ancho de las tarjetas cambia: nuevos mapas de bits
  if (!summary) return;
  resizePending ??= requestAnimationFrame(() => {
    resizePending = null;
    drawSparklines();
  });
});

try {
  data = await loadSales();
  console.log(`📦 ${data.days.length} días cargados · ${data.stores.length} tiendas · periodo guardado: ${range} días`);
  render();
  console.log('Listo: cambia a «30 días» y vuelve a «7 días»; recarga con ⟳ para ver que lo recuerda');
} catch (error) {
  statusLine.textContent = `No se pudieron cargar las ventas (${error.message}). Recarga la página para intentarlo de nuevo.`;
  console.warn('⚠️', statusLine.textContent);
}
```

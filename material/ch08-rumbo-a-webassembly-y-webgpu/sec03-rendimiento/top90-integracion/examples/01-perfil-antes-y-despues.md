---
example_description: "Un perfil antes y después: el informe de ventas de 300 filas se pinta dos veces, con marcas y medidas de User Timing alrededor. La versión 🐛 crea un Intl.NumberFormat por fila, busca cada cliente con includes y lee el ancho de la tabla tras cada fila (thrashing); la ✅ reutiliza el formateador, usa un Set y lee una sola vez. Los contadores lo explican y la misma tabla sale en las dos"
example_tags: "javascript|rendimiento|user-timing|layout-thrashing|set|intl|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Informe de ventas por sucursal</h1>
  <p>
    <button id="run" type="button">Pintar el informe 🐛 y ✅</button>
    <output id="state" for="run">Sin pintar todavía</output>
  </p>
  <ol id="log" class="log" aria-live="polite"></ol>
  <div class="report">
    <table>
      <caption>Últimas 300 ventas (versión ✅)</caption>
      <thead><tr><th scope="col">Pedido</th><th scope="col">Cliente</th><th scope="col">Importe</th><th scope="col">Peso</th></tr></thead>
      <tbody id="fixed-rows"></tbody>
    </table>
    <table hidden>
      <tbody id="buggy-rows"></tbody>
    </table>
  </div>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:disabled { cursor: progress; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
output { margin-inline-start: 0.5rem; color: #475569; }
.report { max-block-size: 14rem; overflow: auto; margin-top: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; }
table { inline-size: 100%; border-collapse: collapse; font-size: 0.8rem; font-variant-numeric: tabular-nums; }
table[hidden] { display: none; }
caption { text-align: start; font-weight: 600; padding: 0.3rem 0.5rem; }
th, td { padding: 0.15rem 0.5rem; text-align: start; border-block-end: 1px solid #e2e8f0; }
.vip { font-weight: 700; }
.bar { display: block; block-size: 0.5rem; border-radius: 2px; background: #1d4ed8; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const ROWS = 300;
const buggyBody = document.querySelector('#buggy-rows');
const fixedBody = document.querySelector('#fixed-rows');
const runButton = document.querySelector('#run');
const state = document.querySelector('#state');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const customers = ['Abarrotes Lupita', 'Café La Parroquia', 'Dulcería Celaya', 'Panadería Rosetta', 'Mercado Roma', 'Tienda Don Beto'];
const sales = Array.from({ length: ROWS }, (_, i) => ({
  id: `V-${8100 + i}`, customer: customers[(i * 5) % customers.length], amount: 120 + ((i * 7919) % 4800),
}));
const vipCustomers = ['Café La Parroquia', 'Mercado Roma']; // clientes preferentes
const MAX_AMOUNT = Math.max(...sales.map((sale) => sale.amount));

// Contadores propios: qué cuesta cada versión, contado (no cronometrado).
const counters = { formatters: 0, comparisons: 0, setLookups: 0, forcedReads: 0 };
let layoutPending = false;
function newFormatter() {
  counters.formatters += 1;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
}
function readWidth(table) { // una lectura de layout con una escritura pendiente fuerza un layout
  if (layoutPending) { counters.forcedReads += 1; layoutPending = false; }
  return table.clientWidth;
}
function isVipSlow(customer) { // includes, contando comparaciones
  for (const vip of vipCustomers) {
    counters.comparisons += 1;
    if (vip === customer) return true;
  }
  return false;
}
function makeRow(sale, formatted, vip, barWidth) {
  const row = document.createElement('tr');
  const cells = [sale.id, sale.customer, formatted].map((text) => Object.assign(document.createElement('td'), { textContent: text }));
  if (vip) cells[1].className = 'vip';
  const bar = Object.assign(document.createElement('span'), { className: 'bar' });
  bar.style.inlineSize = `${barWidth}px`;
  const barCell = document.createElement('td');
  barCell.append(bar);
  row.append(...cells, barCell);
  return row;
}

// 🐛 Lo «natural»: fila a fila, todo dentro del bucle.
function renderSlow() {
  buggyBody.replaceChildren();
  layoutPending = true;
  for (const sale of sales) {
    const formatted = newFormatter().format(sale.amount);                   // 🐛 un formateador por fila
    const vip = isVipSlow(sale.customer);                                    // 🐛 recorre la lista
    const width = readWidth(buggyBody.parentElement) * 0.2;                  // 🐛 lee tras escribir
    buggyBody.append(makeRow(sale, formatted, vip, Math.round((sale.amount / MAX_AMOUNT) * width)));
    layoutPending = true;
  }
}
// ✅ Lo mismo con tres cambios: un formateador, un Set y una sola lectura antes de escribir.
function renderFast() {
  const formatter = newFormatter();
  const vipSet = new Set(vipCustomers);
  layoutPending = true;
  const width = readWidth(fixedBody.parentElement) * 0.2;
  const fragment = document.createDocumentFragment();
  for (const sale of sales) {
    counters.setLookups += 1;
    fragment.append(makeRow(sale, formatter.format(sale.amount), vipSet.has(sale.customer), Math.round((sale.amount / MAX_AMOUNT) * width)));
  }
  fixedBody.replaceChildren(fragment);
  layoutPending = true;
}

function profile(label, render) {
  Object.assign(counters, { formatters: 0, comparisons: 0, setLookups: 0, forcedReads: 0 });
  performance.mark(`informe:${label}:inicio`);
  render();
  performance.mark(`informe:${label}:fin`);
  const entry = performance.measure(`informe ${label}`, `informe:${label}:inicio`, `informe:${label}:fin`);
  performance.clearMarks(`informe:${label}:inicio`);
  performance.clearMarks(`informe:${label}:fin`);
  return { ...counters, ms: entry.duration };
}

runButton.addEventListener('click', () => {
  runButton.disabled = true;
  state.textContent = 'pintando…';
  requestAnimationFrame(() => setTimeout(() => { // deja pintar «pintando…» (~150 ms de trabajo)
    const buggyTable = buggyBody.parentElement;
    buggyTable.hidden = false; // la tabla 🐛 tiene que estar en el layout para medirla
    const slow = profile('🐛', renderSlow);
    buggyTable.hidden = true;
    const fast = profile('✅', renderFast);
    logLine(`🐛 formateadores creados: ${slow.formatters} · comparaciones de clientes: ${slow.comparisons} · lecturas que forzaron un layout: ${slow.forcedReads}`);
    logLine(`✅ formateadores creados: ${fast.formatters} · búsquedas en el Set: ${fast.setLookups} · lecturas que forzaron un layout: ${fast.forcedReads}`);
    logLine(`¿las dos tablas dicen lo mismo? ${buggyBody.textContent === fixedBody.textContent} · clientes preferentes: ${fixedBody.querySelectorAll('.vip').length}`);
    logLine(`¿la versión ✅ es ≥ 5 veces más rápida? ${slow.ms >= 5 * fast.ms}`);
    logLine(`medida «informe 🐛» ≈ ${slow.ms.toFixed(1)} ms · «informe ✅» ≈ ${fast.ms.toFixed(1)} ms`);
    performance.clearMeasures('informe 🐛');
    performance.clearMeasures('informe ✅');
    state.textContent = 'Listo: pulsa otra vez para repetir';
    runButton.disabled = false;
  }, 0));
});
console.log(`Listo: ${ROWS} ventas cargadas; pulsa «Pintar el informe 🐛 y ✅» (con ↗ y DevTools › Performance, verás las dos medidas en la pista Timings)`);
```

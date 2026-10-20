---
example_description: "Una tabla de 400 precios que responde a un control deslizante sin trabajo de más: los eventos del descuento se agrupan en un solo render por frame, cada moneda tiene un único Intl.NumberFormat (creado la primera vez que se usa) y los textos ya formateados salen de una caché LRU con tope. Los contadores enseñan renders, formateadores, aciertos y fallos"
example_tags: "javascript|rendimiento|requestanimationframe|intl|cache|lru|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Rebajas de temporada</h1>
  <form class="controls" id="controls">
    <label>Descuento <input id="discount" type="range" min="0" max="50" step="1" value="0"> <output id="discount-value" for="discount">0 %</output></label>
    <label>Moneda
      <select id="currency">
        <option value="MXN">pesos (MXN)</option>
        <option value="USD">dólares (USD)</option>
        <option value="EUR">euros (EUR)</option>
      </select>
    </label>
  </form>
  <p id="stats" class="stats" role="status"></p>
  <div class="table-box" tabindex="0" role="region" aria-label="Precios con descuento">
    <table>
      <thead><tr><th scope="col">Producto</th><th scope="col">Precio</th></tr></thead>
      <tbody id="rows"></tbody>
    </table>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
.controls { display: flex; flex-wrap: wrap; gap: 0.75rem 1.25rem; align-items: center; }
input, select { font: inherit; accent-color: #1d4ed8; }
select { padding: 0.2rem 0.4rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; }
input:focus-visible, select:focus-visible, .table-box:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.stats { color: #475569; font-size: 0.85rem; font-variant-numeric: tabular-nums; }
.table-box { max-block-size: 12rem; overflow: auto; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; }
table { inline-size: 100%; border-collapse: collapse; font-size: 0.85rem; font-variant-numeric: tabular-nums; }
th, td { padding: 0.15rem 0.5rem; text-align: start; border-block-end: 1px solid #e2e8f0; }
td:last-child, th:last-child { text-align: end; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const discountInput = document.querySelector('#discount');
const discountValue = document.querySelector('#discount-value');
const currencySelect = document.querySelector('#currency');
const statsLine = document.querySelector('#stats');
const rowsBody = document.querySelector('#rows');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const crafts = ['Rebozo', 'Jarrón de Talavera', 'Alebrije', 'Huipil', 'Molcajete', 'Sarape', 'Canasta de palma', 'Cazuela de barro'];
const products = Array.from({ length: 400 }, (_, i) => ({ name: `${crafts[i % crafts.length]} ${i + 1}`, cents: 15_000 + ((i * 7919) % 250_000) }));
const RATES = { MXN: 1, USD: 0.055, EUR: 0.05 }; // tipos de cambio de ejemplo, fijos

// 1. Un formateador por moneda, creado la primera vez que se pide (lección «Medir antes de optimizar»).
const formatters = new Map();
let formattersCreated = 0;
function formatterFor(currency) {
  if (!formatters.has(currency)) {
    formattersCreated += 1;
    formatters.set(currency, new Intl.NumberFormat('es-MX', { style: 'currency', currency }));
  }
  return formatters.get(currency);
}
// 2. Una caché LRU de textos ya formateados, con tope (lección «Memoria y recolector de basura»).
const textCache = new Map();
const TEXT_CACHE_MAX = 2000;
const cacheStats = { hits: 0, misses: 0 };
function priceText(cents, currency) {
  const key = `${currency}:${cents}`;
  let text = textCache.get(key);
  if (text !== undefined) {
    cacheStats.hits += 1;
    textCache.delete(key); // al final: el más reciente
  } else {
    cacheStats.misses += 1;
    text = formatterFor(currency).format((cents / 100) * RATES[currency]);
  }
  textCache.set(key, text);
  if (textCache.size > TEXT_CACHE_MAX) textCache.delete(textCache.keys().next().value);
  return text;
}

// La tabla se crea una vez; cada render solo cambia los textos de la segunda columna.
const priceCells = products.map((product) => {
  const row = document.createElement('tr');
  const priceCell = document.createElement('td');
  row.append(Object.assign(document.createElement('td'), { textContent: product.name }), priceCell);
  rowsBody.append(row);
  return priceCell;
});

// 3. Un render por frame, por muchos eventos que lleguen (lección «Render y frames»).
let renders = 0;
let inputEvents = 0;
let renderPending = false;
function requestRender() {
  if (renderPending) return;
  renderPending = true;
  requestAnimationFrame(() => {
    renderPending = false;
    render();
  });
}
function render() {
  renders += 1;
  const discount = Number(discountInput.value);
  const currency = currencySelect.value;
  products.forEach((product, i) => {
    priceCells[i].textContent = priceText(Math.round(product.cents * (1 - discount / 100)), currency);
  });
  discountValue.textContent = `${discount} %`;
  statsLine.textContent = `eventos: ${inputEvents} · renders: ${renders} · formateadores: ${formattersCreated} · caché: ${cacheStats.hits} aciertos, ${cacheStats.misses} fallos, ${textCache.size} entradas`;
}
discountInput.addEventListener('input', () => { inputEvents += 1; requestRender(); });
currencySelect.addEventListener('change', () => { inputEvents += 1; requestRender(); });

// Al cargar: 30 cambios del descuento en la misma tarea (como un arrastre rápido).
for (let percent = 1; percent <= 30; percent++) {
  discountInput.value = String(percent);
  discountInput.dispatchEvent(new Event('input'));
}
logLine(`30 cambios del descuento en la misma tarea → renders hasta ahora: ${renders}`);
requestAnimationFrame(() => requestAnimationFrame(() => {
  logLine(`… y en el siguiente frame: ${renders} render · primer precio con 30 %: ${priceCells[0].textContent}`);
  logLine(`formateadores creados: ${formattersCreated} · caché de textos: ${cacheStats.misses} fallos, ${cacheStats.hits} aciertos`);
  console.log('Listo: mueve el descuento adelante y atrás y cambia de moneda; mira los contadores');
}));
```

---
example_description: "Un cliente HTTP con caché para la API de prueba: LRU con tope de entradas y caducidad (TTL), peticiones simultáneas a la misma URL agrupadas en una sola (deduplicación), los errores nunca se guardan, y contadores de peticiones, red, aciertos, agrupadas y expulsadas. Las marcas de User Timing miden cuánto se ahorra"
example_tags: "javascript|rendimiento|cache|lru|ttl|fetch|user-timing|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="client">
  <h1>Fichas de producto</h1>
  <p class="actions">
    <button type="button" data-sku="TAL-07">Jarrón de Talavera</button>
    <button type="button" data-sku="REB-01">Rebozo</button>
    <button type="button" data-sku="ALE-12">Alebrije</button>
    <button type="button" data-sku="MOL-03">Molcajete</button>
    <button id="invalidate" type="button">Vaciar la caché</button>
  </p>
  <table class="stats">
    <caption>Caché (como mucho 3 fichas, 30 s cada una)</caption>
    <tbody id="stats"></tbody>
  </table>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --accent: #1d4ed8; --paper: #ffffff; --page: #f8fafc; }
body { margin: 0; font-family: system-ui, sans-serif; color: var(--ink); background: var(--page); }
.client { max-width: 34rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--paper); color: var(--ink); cursor: pointer; }
button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.stats { border-collapse: collapse; background: var(--paper); font-variant-numeric: tabular-nums; }
.stats caption { text-align: start; font-weight: 600; padding-block: 0.3rem; }
.stats th, .stats td { padding: 0.2rem 0.75rem; border: 1px solid var(--line); text-align: start; }
.stats td { text-align: end; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--paper); font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// CLIENTE CON CACHÉ
// - Se guarda la PROMESA, no solo el dato: dos peticiones a la misma URL mientras la primera
//   viaja comparten esa promesa (deduplicación), y la red solo ve una.
// - LRU con tope (maxEntries) y caducidad (ttlMs): la caché no crece sin límite y no sirve
//   datos viejos (lecciones «Memoria y recolector de basura» y «Medir antes de optimizar»).
// - Un error nunca se guarda: la siguiente petición vuelve a intentarlo. Y solo una respuesta
//   buena expulsa a otra entrada: una petición que falla no echa de la caché a las que sirven.
// - `now` se puede inyectar para probar la caducidad sin esperar 30 s.

function createCachedClient({ maxEntries = 3, ttlMs = 30_000, now = () => performance.now() } = {}) {
  const entries = new Map(); // url → { promise, expires, settled }
  const stats = { peticiones: 0, red: 0, aciertos: 0, agrupadas: 0, expulsadas: 0, errores: 0 };
  async function load(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
  function get(url) {
    stats.peticiones += 1;
    const cached = entries.get(url);
    if (cached && cached.expires > now()) {
      entries.delete(url); // al final del Map: la más reciente
      entries.set(url, cached);
      if (cached.settled) stats.aciertos += 1;
      else stats.agrupadas += 1;
      return cached.promise;
    }
    stats.red += 1;
    const entry = { promise: null, expires: now() + ttlMs, settled: false };
    entry.promise = load(url).then(
      (data) => {
        entry.settled = true;
        while (entries.size > maxEntries) {
          entries.delete(entries.keys().next().value); // la que lleva más tiempo sin usarse
          stats.expulsadas += 1;
        }
        return data;
      },
      (error) => { if (entries.get(url) === entry) entries.delete(url); stats.errores += 1; throw error; },
    );
    entries.delete(url);
    entries.set(url, entry);
    return entry.promise;
  }
  return { get, stats, clear: () => entries.clear(), keys: () => [...entries.keys()] };
}

// ── La página ──
const client = createCachedClient();
const urlFor = (sku, extra = '') => `/api/demo/echo?producto=${sku}&delay=200${extra}`;
const statsBody = document.querySelector('#stats');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function showStats() {
  statsBody.replaceChildren(...Object.entries(client.stats).map(([key, value]) => {
    const row = document.createElement('tr');
    row.append(Object.assign(document.createElement('th'), { scope: 'row', textContent: key }), Object.assign(document.createElement('td'), { textContent: String(value) }));
    return row;
  }));
}
const statsLine = () => Object.entries(client.stats).map(([key, value]) => `${key} ${value}`).join(' · ');
let requestNumber = 0;
async function timedGet(url) { // cada petición, con su medida de User Timing
  const mark = `ficha-${++requestNumber}`;
  performance.mark(mark);
  try {
    const data = await client.get(url);
    return { sku: data.query.producto, ms: performance.measure(mark, mark).duration };
  } finally {
    performance.clearMarks(mark);
    performance.clearMeasures(mark);
  }
}

async function demo() {
  // 1. Dos peticiones simultáneas a la misma ficha y otra distinta: la red ve dos.
  const first = await Promise.all([timedGet(urlFor('TAL-07')), timedGet(urlFor('TAL-07')), timedGet(urlFor('REB-01'))]);
  logLine(`1. ${first.map((result) => result.sku).join(', ')} → ${statsLine()}`);
  // 2. Repetir dos que ya están: aciertos, sin red.
  const second = await Promise.all([timedGet(urlFor('TAL-07')), timedGet(urlFor('ALE-12')), timedGet(urlFor('REB-01'))]);
  logLine(`2. ${second.map((result) => result.sku).join(', ')} → ${statsLine()}`);
  // 3. Un servidor que falla: el error no se guarda y el segundo intento vuelve a la red.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await client.get(urlFor('PAG-99', '&status=503'));
    } catch (error) {
      logLine(`3. intento ${attempt} → ${error.message} (no se guarda)`);
    }
  }
  logLine(`total → ${statsLine()}`);
  logLine(`fichas en caché (de la más antigua a la más reciente): ${client.keys().map((url) => new URL(url, document.baseURI).searchParams.get('producto')).join(', ')}`);
  logLine(`de la red ≈ ${first[0].ms.toFixed(0)} ms · de la caché ≈ ${second[0].ms.toFixed(1)} ms`);
  showStats();
  console.log('Listo: pide fichas con los botones (la caché guarda 3) y vacíala para volver a la red');
}

for (const button of document.querySelectorAll('[data-sku]')) {
  button.addEventListener('click', async () => {
    const { sku, ms } = await timedGet(urlFor(button.dataset.sku));
    logLine(`${sku} → ${statsLine()} · ≈ ${ms.toFixed(1)} ms`);
    showStats();
  });
}
document.querySelector('#invalidate').addEventListener('click', () => {
  client.clear();
  logLine('🧹 caché vacía: la próxima ficha irá a la red');
});
showStats();
demo();
```

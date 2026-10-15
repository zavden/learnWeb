---
example_description: "Un buscador con tolerancia a erratas sobre 20 000 productos que nunca traba la página: el índice se construye en los ratos libres, cada pulsación espera a que dejes de escribir (debounce), una búsqueda nueva cancela la anterior con AbortController, el filtrado va en rebanadas de 6 ms que ceden el turno y las marcas de User Timing miden cada búsqueda. La API Long Tasks confirma que no hay tareas largas"
example_tags: "javascript|rendimiento|debounce|abortcontroller|scheduler-yield|requestidlecallback|user-timing|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Despensa mexicana</h1>
  <p class="search">
    <label for="query">Buscar producto</label>
    <input id="query" type="search" autocomplete="off" placeholder="mole, café, jamaica…" disabled>
  </p>
  <p id="summary" class="summary" role="status">Preparando el índice…</p>
  <ul id="results" class="results"></ul>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
.search { display: grid; gap: 0.25rem; }
input { font: inherit; padding: 0.35rem 0.5rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; }
input:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.summary { color: #475569; }
.results { margin: 0; padding-inline-start: 1.2rem; font-size: 0.85rem; columns: 2; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const PRODUCTS = 20_000;
const SLICE_MS = 6;
const queryInput = document.querySelector('#query');
const summary = document.querySelector('#summary');
const resultList = document.querySelector('#results');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const yieldToMain = () => (typeof globalThis.scheduler?.yield === 'function'
  ? scheduler.yield()
  : new Promise((resolve) => setTimeout(resolve, 0)));
const whenIdle = globalThis.requestIdleCallback?.bind(globalThis) ?? ((callback) => setTimeout(() => callback({ timeRemaining: () => 8 }), 1));
const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// ── 1. El índice se construye en los ratos libres (lección «Render y frames»), no al cargar. ──
const dishes = ['mole poblano', 'mole negro', 'pozole rojo', 'tamal de rajas', 'salsa verde', 'café de olla', 'pan de muerto', 'chile en nogada', 'agua de jamaica', 'tlayuda oaxaqueña', 'cajeta de celaya', 'chocolate de metate'];
const brands = ['Doña Lupe', 'La Abuela', 'El Molino', 'Sabores de Puebla', 'Tierra Mixteca', 'Don Chencho'];
const sizes = ['250 g', '500 g', '1 kg', 'frasco', 'bolsa', 'caja'];
const products = [];
const indexReady = new Promise((resolve) => {
  function build(deadline) {
    while (products.length < PRODUCTS && deadline.timeRemaining() > 1) {
      const i = products.length;
      const name = `${dishes[i % dishes.length]} · ${brands[(i * 7) % brands.length]} · ${sizes[(i * 11) % sizes.length]} · lote ${i + 1}`;
      products.push({ name, words: normalize(name).split(/[^a-z0-9ñ]+/).filter(Boolean) });
    }
    if (products.length < PRODUCTS) whenIdle(build);
    else resolve();
  }
  whenIdle(build);
});

// ── 2. Coincidencia con una errata como mucho, sin crear objetos: tres filas reutilizadas. ──
const rows = [new Int32Array(33), new Int32Array(33), new Int32Array(33)];
function distance(word, len, query) { // distancia de edición (con transposiciones) entre query y word[0..len)
  let [older, prev, cur] = rows;
  for (let i = 0; i <= len; i++) prev[i] = i;
  for (let j = 1; j <= query.length; j++) {
    cur[0] = j;
    const qj = query.charCodeAt(j - 1);
    for (let i = 1; i <= len; i++) {
      const wi = word.charCodeAt(i - 1);
      let value = Math.min(prev[i] + 1, cur[i - 1] + 1, prev[i - 1] + (wi === qj ? 0 : 1));
      if (i > 1 && j > 1 && wi === query.charCodeAt(j - 2) && word.charCodeAt(i - 2) === qj) value = Math.min(value, older[i - 2] + 1);
      cur[i] = value;
    }
    [older, prev, cur] = [prev, cur, older];
  }
  return prev[len];
}
// Una palabra coincide si empieza por la búsqueda o si su principio está a una errata de ella
// (por eso «mole» también encuentra la marca «El Molino»: así se comporta un buscador tolerante).
function wordMatches(word, query) {
  if (word.startsWith(query)) return true;
  for (let len = Math.max(1, query.length - 1); len <= Math.min(word.length, query.length + 1, 32); len++) {
    if (distance(word, len, query) <= 1) return true;
  }
  return false;
}

// ── 3. La búsqueda: en rebanadas de 6 ms, cancelable, medida con marcas. ──
const longTasks = [];
if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
  new PerformanceObserver((list) => longTasks.push(...list.getEntries())).observe({ type: 'longtask' });
}
async function search(query, signal) {
  await indexReady;
  performance.mark('busqueda:inicio');
  const found = [];
  let slices = 1;
  let sliceStart = performance.now();
  for (const product of products) {
    if (product.words.some((word) => wordMatches(word, query))) found.push(product.name);
    if (performance.now() - sliceStart > SLICE_MS) {
      await yieldToMain();
      if (signal.aborted) throw signal.reason; // llegó otra búsqueda: esta ya no sirve
      slices += 1;
      sliceStart = performance.now();
    }
  }
  const measure = performance.measure(`busqueda «${query}»`, 'busqueda:inicio');
  performance.clearMarks('busqueda:inicio');
  performance.clearMeasures(measure.name);
  return { found, slices, ms: measure.duration, start: measure.startTime };
}

// ── 4. Debounce: buscar solo cuando dejas de escribir 200 ms; la nueva cancela la anterior. ──
const stats = { keystrokes: 0, launched: 0, cancelled: 0 };
let timer = 0;
let controller = null;
queryInput.addEventListener('input', () => {
  stats.keystrokes += 1;
  clearTimeout(timer);
  timer = setTimeout(runSearch, 200);
});
async function runSearch() {
  const query = normalize(queryInput.value.trim());
  if (query.length < 2) return;
  controller?.abort();
  controller = new AbortController();
  stats.launched += 1;
  summary.textContent = `Buscando «${query}»…`;
  try {
    const { found, slices, ms, start } = await search(query, controller.signal);
    resultList.replaceChildren(...found.slice(0, 20).map((name) => Object.assign(document.createElement('li'), { textContent: name })));
    summary.textContent = `${found.length} productos para «${query}»`;
    await new Promise((resolve) => setTimeout(resolve, 300)); // da tiempo a que lleguen las entradas longtask
    const blocking = longTasks.filter((task) => task.startTime + task.duration > start && task.startTime < start + ms).length;
    logLine(`⌨️ pulsaciones: ${stats.keystrokes} · búsquedas lanzadas: ${stats.launched} · canceladas: ${stats.cancelled}`);
    logLine(`🔎 «${query}» → ${found.length} productos (se muestran ${Math.min(20, found.length)}) · tareas largas durante la búsqueda: ${blocking}`);
    logLine(`búsqueda «${query}» ≈ ${ms.toFixed(0)} ms en ≈ ${slices} rebanadas`);
    Object.assign(stats, { keystrokes: 0, launched: 0, cancelled: 0 }); // se cuenta de búsqueda en búsqueda
  } catch (error) {
    if (error.name !== 'AbortError') throw error;
    stats.cancelled += 1;
  }
}

console.log('Listo: espera a que el índice esté preparado y escribe «mole» de corrido; prueba también «moel», con una errata');
indexReady.then(() => {
  queryInput.disabled = false;
  summary.textContent = `Índice listo: ${products.length} productos`;
  logLine(`índice listo: ${products.length} productos, construido en los ratos libres`);
});
```

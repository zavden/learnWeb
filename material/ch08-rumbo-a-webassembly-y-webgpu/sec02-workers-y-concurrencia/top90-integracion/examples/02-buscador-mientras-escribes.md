---
example_description: "Un buscador que nunca frena el teclado: el catálogo y su índice viven en un worker, cada consulta lleva un id creciente, la página solo pinta la respuesta de la última consulta (descarta las viejas) y espera 150 ms sin teclear antes de preguntar"
example_tags: "javascript|workers|busqueda|debounce|protocolo|respuestas-obsoletas|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Buscar en el mercado</h1>
  <label for="query">Producto, origen o presentación</label>
  <input id="query" type="search" autocomplete="off" spellcheck="false" value="mole">
  <p id="count" class="count" aria-live="polite">Cargando el catálogo…</p>
  <ul id="results" class="results"></ul>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
label { display: block; font-size: 0.9rem; margin-block-end: 0.25rem; }
input { box-sizing: border-box; inline-size: 100%; font: inherit; padding: 0.4rem 0.5rem; border: 1px solid #64748b; border-radius: 0.4rem; }
input:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.count { font-weight: 600; }
.results { padding-inline-start: 1.25rem; }
.log { padding-inline-start: 1.25rem; font-size: 0.85rem; }
```

# JavaScript

```javascript
// El worker es 02-search/search-worker.js («Assets»): genera 1200 productos y los busca.
const $ = (selector) => document.querySelector(selector);
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

const worker = new Worker('02-search/search-worker.js', { type: 'module' });
addEventListener('pagehide', () => worker.terminate());
const ready = new Promise((resolve) => worker.addEventListener('message', (event) => {
  if (event.data.type === 'ready') resolve(event.data.size);
}));

let latestId = 0;              // la consulta más reciente: solo su respuesta se pinta
const stats = { received: 0, drawn: 0, discarded: 0 };
let onDrawn = null;            // para esperar a una consulta concreta al cargar

worker.addEventListener('message', (event) => {
  const message = event.data;
  if (message.type !== 'results') return;
  stats.received += 1;
  if (message.id !== latestId) {   // llegó tarde: ya se escribió otra cosa después
    stats.discarded += 1;
    return;
  }
  stats.drawn += 1;
  $('#count').textContent = `${message.total} resultados para «${message.query}»`;
  $('#results').replaceChildren(...message.first.map((name) => Object.assign(document.createElement('li'), { textContent: name })));
  onDrawn?.(message);
});

function search(query) {
  latestId += 1;
  worker.postMessage({ id: latestId, query });
}

// Mientras se teclea: preguntar solo tras 150 ms sin pulsar ninguna tecla (debounce).
let timer = 0;
$('#query').addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(() => search($('#query').value), 150);
});

// Al cargar: cuatro consultas seguidas, sin esperar, como quien teclea muy deprisa.
report(`📚 catálogo listo en el worker: ${await ready} productos`);
const last = new Promise((resolve) => { onDrawn = resolve; });
for (const query of ['m', 'mo', 'mol', 'mole']) search(query);
const drawn = await last;
report(`⌨️ 4 consultas seguidas (m, mo, mol, mole): ${stats.received} respuestas, ${stats.drawn} pintada, ${stats.discarded} descartadas por viejas`);
report(`🔎 «${drawn.query}» → ${drawn.total} resultados`);
onDrawn = (message) => report(`🔎 «${message.query}» → ${message.total} resultados · descartadas hasta ahora: ${stats.discarded}`);
report('Listo: borra y escribe «cafe oax» (sin tildes) o «miel yucatan 1 kg»');
```

---
example_description: "Un catálogo que carga por páginas: un botón «Cargar más» (la vía principal, accesible) y, además, carga automática al acercarse al final con un listener de scroll pasivo y limitado (throttle); una sola petición a la vez con AbortController, aria-busy mientras carga, plantilla + fragmento para pintar y un evento feed:loaded"
example_tags: "javascript|eventos|profesional|scroll|throttle|abortcontroller|template|aria-busy"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="catalog-page">
  <h1>Cafés de especialidad</h1>
  <p id="feed-status" class="status" role="status">Cargando…</p>
  <div id="feed-scroller" class="scroller" tabindex="0" aria-labelledby="feed-title">
    <h2 id="feed-title" class="visually-hidden">Lista de cafés</h2>
    <ul id="feed" class="feed" aria-busy="true"></ul>
    <p class="more"><button type="button" id="load-more">Cargar más</button></p>
  </div>
  <label class="auto"><input type="checkbox" id="auto-load" checked> Cargar más al llegar al final</label>
  <template id="coffee-template">
    <li class="coffee"><strong class="name"></strong> <span class="origin"></span> <span class="price"></span></li>
  </template>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root {
  --ink: #1f2933;
  --muted: #52606d;
  --line: #cbd2d9;
  --surface: #ffffff;
  --page: #f5f7fa;
  --accent: #1d4ed8;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: var(--ink);
  background: var(--page);
}
.catalog-page {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin-top: 0;
}
.status {
  color: var(--muted);
}
.scroller {
  height: 16rem;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
}
.feed {
  display: grid;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.coffee {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.5rem;
  padding: 0.5rem 0.6rem;
  border-radius: 0.5rem;
  background: var(--page);
}
.coffee .origin {
  color: var(--muted);
}
.coffee .price {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}
.more {
  text-align: center;
}
button {
  font: inherit;
  padding: 0.35rem 0.9rem;
  border: 1px solid var(--muted);
  border-radius: 0.4rem;
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
}
button:disabled {
  color: var(--muted);
  cursor: progress;
}
.auto {
  display: block;
  margin-top: 0.5rem;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.log {
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface);
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Catálogo con «Cargar más» y carga automática al final.
//
// Decisiones de diseño:
// - El botón es la vía principal: funciona con teclado, con lector de pantalla
//   y sin desplazarse. La carga automática es un extra que se puede apagar
//   (a quien navega con el teclado, un scroll infinito le aleja del pie).
// - scroll llega muchas veces por segundo: listener pasivo (no cancela nada) y
//   un throttle de 150 ms con llamada final. Para saber si un elemento es
//   visible sin escuchar scroll existe IntersectionObserver (módulo «APIs
//   modernas del navegador»); aquí se mide el contenedor, una lectura.
// - Una sola petición a la vez: cada carga tiene su AbortController, y una
//   nueva carga no empieza si hay otra en curso. aria-busy="true" mientras
//   tanto, para que los lectores de pantalla no lean una lista a medias.
// - Pintar con <template> y un DocumentFragment: una sola inserción por
//   página, y los datos siempre como texto (textContent).
// - Al terminar avisa con feed:loaded (detail: página, añadidos, total).
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM y este módulo.

const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// El «servidor», simulado: 20 cafés en páginas de 6, con 200 ms de espera.
const origins = ['Chiapas', 'Veracruz', 'Oaxaca', 'Nayarit', 'Puebla', 'Guerrero', 'Hidalgo'];
const allCoffees = Array.from({ length: 20 }, (_, i) => ({
  id: `C-${101 + i}`,
  name: `Lote ${101 + i}`,
  origin: origins[i % origins.length],
  price: 160 + ((i * 37) % 120),
}));
function fetchPage(page, { signal }) {
  return new Promise((resolve, reject) => {
    const timerId = setTimeout(() => {
      const start = (page - 1) * 6;
      resolve({ items: allCoffees.slice(start, start + 6), total: allCoffees.length });
    }, 200);
    signal.addEventListener('abort', () => {
      clearTimeout(timerId);
      reject(signal.reason);
    }, { once: true });
  });
}

function throttle(fn, intervalMs) {
  let last = -Infinity;
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    const wait = intervalMs - (performance.now() - last);
    if (wait <= 0) {
      last = performance.now();
      fn(...args);
    } else {
      timerId = setTimeout(() => {
        last = performance.now();
        fn(...args);
      }, wait);
    }
  };
}

function createFeed({ list, scroller, button, statusLine, template, autoToggle }) {
  const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
  let page = 0;
  let total = Infinity;
  let loading = null; // AbortController de la carga en curso

  async function loadNext(source) {
    if (loading || list.children.length >= total) return;
    loading = new AbortController();
    list.setAttribute('aria-busy', 'true');
    button.disabled = true;
    statusLine.textContent = 'Cargando…';
    try {
      const result = await fetchPage(page + 1, { signal: loading.signal });
      page += 1;
      total = result.total;
      const fragment = document.createDocumentFragment();
      for (const coffee of result.items) {
        const item = template.content.firstElementChild.cloneNode(true);
        item.dataset.id = coffee.id;
        item.querySelector('.name').textContent = coffee.name;
        item.querySelector('.origin').textContent = coffee.origin;
        item.querySelector('.price').textContent = money.format(coffee.price);
        fragment.append(item);
      }
      list.append(fragment);
      list.dispatchEvent(new CustomEvent('feed:loaded', {
        bubbles: true,
        detail: { page, added: result.items.length, shown: list.children.length, total, source },
      }));
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    } finally {
      loading = null;
      list.setAttribute('aria-busy', 'false');
      const done = list.children.length >= total;
      button.disabled = done;
      button.textContent = done ? 'No hay más cafés' : 'Cargar más';
      statusLine.textContent = `${list.children.length} de ${total} cafés`;
    }
  }

  button.addEventListener('click', () => loadNext('botón'));
  const checkNearEnd = throttle(() => {
    if (!autoToggle.checked) return;
    const remaining = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    if (remaining < 80) loadNext('scroll');
  }, 150);
  scroller.addEventListener('scroll', checkNearEnd, { passive: true });
  async function reset() {
    list.replaceChildren();
    page = 0;
    total = Infinity;
    await loadNext('inicio');
  }
  return { loadNext, reset, cancel: () => loading?.abort() };
}

const feed = createFeed({
  list: document.querySelector('#feed'),
  scroller: document.querySelector('#feed-scroller'),
  button: document.querySelector('#load-more'),
  statusLine: document.querySelector('#feed-status'),
  template: document.querySelector('#coffee-template'),
  autoToggle: document.querySelector('#auto-load'),
});

let auditing = true;
document.addEventListener('feed:loaded', (event) => {
  if (auditing) return;
  const { page, added, shown, total, source } = event.detail;
  logLine(`📦 página ${page} (${source}): +${added} → ${shown} de ${total}`);
});

// ── Autocomprobación: la primera página, una carga cancelada y una doble
//    petición que no se duplica (simulado; asíncrono, ~0,5 s).
async function audit() {
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  const list = document.querySelector('#feed');
  await feed.loadNext('inicio');
  expect('la primera página trae 6 cafés y aria-busy vuelve a false', list.children.length === 6 && list.getAttribute('aria-busy') === 'false');
  const cancelled = feed.loadNext('prueba');
  feed.cancel();
  await cancelled;
  expect('una carga cancelada no añade nada', list.children.length === 6);
  await Promise.all([feed.loadNext('prueba'), feed.loadNext('prueba')]);
  expect('dos peticiones a la vez cargan UNA página (6 → 12)', list.children.length === 12);
  expect('los precios salen formateados como texto', list.querySelector('.price').textContent === '$160.00');
  // Dejar el catálogo como al empezar: solo la primera página.
  await feed.reset();
  auditing = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
  logLine('Listo: pulsa «Cargar más», o desplázate hasta el final de la lista; desmarca la casilla y prueba otra vez');
}
audit();
```

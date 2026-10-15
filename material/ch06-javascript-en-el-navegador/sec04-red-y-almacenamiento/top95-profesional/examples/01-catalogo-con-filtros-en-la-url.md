---
example_description: "Un catálogo de cafés cuyos filtros (búsqueda, tueste, precio máximo, orden, disponibles) viven en la URL: cada cambio discreto es una entrada del historial, escribir sustituye la actual, ← Atrás y una recarga restauran el formulario, y cada búsqueda cancela la anterior. Datos de assets/coffees.json"
example_tags: "javascript|fetch|urlsearchparams|pushstate|popstate|abortcontroller|filtros|profesional"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<div class="catalog">
  <header class="bar">
    <h1>Cafés de México</h1>
    <button id="back" type="button">← Atrás</button>
  </header>
  <form id="filters" role="search" aria-label="Filtrar cafés">
    <label class="field">Buscar <input name="q" type="search" autocomplete="off"></label>
    <fieldset>
      <legend>Tueste</legend>
      <label><input type="checkbox" name="tueste" value="claro"> Claro</label>
      <label><input type="checkbox" name="tueste" value="medio"> Medio</label>
      <label><input type="checkbox" name="tueste" value="oscuro"> Oscuro</label>
    </fieldset>
    <label class="field">Precio máximo
      <select name="max">
        <option value="">Cualquiera</option>
        <option value="150">$150</option>
        <option value="200">$200</option>
        <option value="250">$250</option>
      </select>
    </label>
    <label class="field">Ordenar
      <select name="orden">
        <option value="relevancia">Relevancia</option>
        <option value="precio-asc">Precio ↑</option>
        <option value="precio-desc">Precio ↓</option>
      </select>
    </label>
    <label><input type="checkbox" name="disponible" value="1"> Solo disponibles</label>
  </form>
  <p id="status" class="status" role="status">Cargando el catálogo…</p>
  <ul id="results" class="results" aria-busy="true"></ul>
  <ol id="log" class="log" aria-live="polite"></ol>
</div>
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
  --error: #b91c1c;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.catalog { max-width: 34rem; margin: 0 auto; padding: 1rem; }
.bar { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
h1 { margin: 0; font-size: 1.25rem; }
form { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; align-items: end; margin: 0.75rem 0; }
fieldset { display: flex; gap: 0.6rem; margin: 0; padding: 0.2rem 0.6rem 0.4rem; border: 1px solid var(--line); border-radius: 0.5rem; }
.field { display: grid; gap: 0.15rem; font-size: 0.9rem; }
input[type="search"], select, button {
  font: inherit; padding: 0.3rem 0.5rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: var(--surface); color: var(--ink);
}
button { cursor: pointer; }
button:disabled { color: #616e7c; cursor: not-allowed; }
:is(input, select, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.status { margin: 0 0 0.5rem; color: var(--muted); }
.status.is-error { color: var(--error); }
.results { display: grid; grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr)); gap: 0.5rem; margin: 0; padding: 0; list-style: none; }
.results[aria-busy="true"] { opacity: 0.55; }
.coffee { padding: 0.5rem 0.6rem; border: 1px solid var(--line); border-radius: 0.6rem; background: var(--surface); }
.coffee h2 { margin: 0; font-size: 0.95rem; }
.coffee p { margin: 0.1rem 0 0; font-size: 0.85rem; color: var(--muted); }
.coffee .price { color: var(--ink); font-weight: 700; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Catálogo con los filtros en la URL.
//
// Decisiones de diseño:
// - La URL es la fuente de verdad: el formulario se rellena desde ella al
//   cargar y con popstate, y se escribe en ella al cambiar. Así un enlace
//   copiado o una recarga muestran lo mismo. Solo se guardan los valores que
//   no son por defecto, y todo lo que llega de la URL se valida.
// - Cambios discretos (casillas, desplegables) = pushState: «← Atrás» los
//   deshace. Escribir = replaceState con debounce: no se apila cada letra.
// - Cada búsqueda cancela la anterior (AbortController): una respuesta lenta
//   nunca pinta encima de una nueva. El servidor de prueba hace de API
//   (latencia, cancelación, errores) y el resultado se calcula aquí con
//   assets/coffees.json, que se descarga una vez.
// - Estados: cargando (aria-busy), vacío, error, resultados.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const form = document.querySelector('#filters');
const statusText = document.querySelector('#status');
const resultsList = document.querySelector('#results');
const backButton = document.querySelector('#back');
const logList = document.querySelector('#log');
const ROASTS = ['claro', 'medio', 'oscuro'];
const MAX_PRICES = ['150', '200', '250'];
const ORDERS = ['relevancia', 'precio-asc', 'precio-desc'];
let catalog = [];
let searching = null;
let historyWorks = true;
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const fold = (text) => [...text.normalize('NFD').toLowerCase()].filter((char) => char < '̀' || char > 'ͯ').join('');

// ── URL ⇄ filtros ⇄ formulario ──
function filtersFromUrl(url) {
  const params = url.searchParams;
  return {
    q: (params.get('q') ?? '').trim(),
    tueste: ROASTS.filter((roast) => params.getAll('tueste').includes(roast)),
    max: MAX_PRICES.includes(params.get('max')) ? params.get('max') : '',
    orden: ORDERS.includes(params.get('orden')) ? params.get('orden') : 'relevancia',
    disponible: params.get('disponible') === '1',
  };
}
function filtersFromForm() {
  const data = new FormData(form);
  return filtersFromUrl(new URL(`?${new URLSearchParams(data)}`, 'https://tienda.example/'));
}
function toSearch(filters) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  for (const roast of filters.tueste) params.append('tueste', roast);
  if (filters.max) params.set('max', filters.max);
  if (filters.orden !== 'relevancia') params.set('orden', filters.orden);
  if (filters.disponible) params.set('disponible', '1');
  const text = params.toString();
  return text ? `?${text}` : '';
}
function fillForm(filters) {
  form.elements.q.value = filters.q;
  for (const box of form.querySelectorAll('[name="tueste"]')) box.checked = filters.tueste.includes(box.value);
  form.elements.max.value = filters.max;
  form.elements.orden.value = filters.orden;
  form.elements.disponible.checked = filters.disponible;
}

function writeUrl(method, filters) {
  const search = toSearch(filters);
  if (!historyWorks || search === location.search) return;
  try {
    const depth = history.state?.depth ?? 0;
    history[method]({ depth: method === 'pushState' ? depth + 1 : depth }, '', search || location.pathname);
    logLine(`${method === 'pushState' ? '🧭' : '🔁'} ${method} → ${search || '(sin filtros)'}`);
  } catch (error) {
    historyWorks = false;
    logLine(`⚠️ ${error.name}: la dirección no se pudo cambiar`);
  }
  backButton.disabled = (history.state?.depth ?? 0) === 0;
}

// ── Búsqueda ──
function matches(coffee, filters) {
  return (!filters.q || fold(`${coffee.name} ${coffee.origin}`).includes(fold(filters.q)))
    && (filters.tueste.length === 0 || filters.tueste.includes(coffee.roast))
    && (!filters.max || coffee.price <= Number(filters.max))
    && (!filters.disponible || coffee.stock > 0);
}
function render(found) {
  resultsList.replaceChildren(...found.map((coffee) => {
    const item = Object.assign(document.createElement('li'), { className: 'coffee' });
    item.append(
      Object.assign(document.createElement('h2'), { textContent: coffee.name }),
      Object.assign(document.createElement('p'), { textContent: `${coffee.origin} · tueste ${coffee.roast} · ${coffee.grams} g` }),
      Object.assign(document.createElement('p'), { className: 'price', textContent: coffee.stock > 0 ? `$${coffee.price}` : `$${coffee.price} · agotado` }),
    );
    return item;
  }));
}
async function search(filters) {
  searching?.abort();
  const controller = new AbortController();
  searching = controller;
  const label = toSearch(filters) || '(sin filtros)';
  resultsList.setAttribute('aria-busy', 'true');
  statusText.className = 'status';
  statusText.textContent = 'Buscando…';
  try {
    const params = new URLSearchParams(toSearch(filters));
    params.set('delay', '250');
    const response = await fetch(`/api/demo/echo?${params}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const found = catalog.filter((coffee) => matches(coffee, filters));
    if (filters.orden === 'precio-asc') found.sort((a, b) => a.price - b.price);
    if (filters.orden === 'precio-desc') found.sort((a, b) => b.price - a.price);
    render(found);
    statusText.textContent = found.length ? `${found.length} café(s).` : 'Ningún café cumple estos filtros. Prueba a quitar alguno.';
    logLine(`🔎 ${label} → ${found.length} café(s)`);
  } catch (error) {
    if (error.name === 'AbortError') {
      logLine(`✖ cancelada: ${label}`);
      return;
    }
    statusText.className = 'status is-error';
    statusText.textContent = `No se pudo buscar (${error.message}). Vuelve a intentarlo.`;
  } finally {
    if (searching === controller) resultsList.setAttribute('aria-busy', 'false');
  }
}

// ── Eventos ──
let typingTimer;
form.addEventListener('input', (event) => {
  if (event.target.name !== 'q') return;
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    const filters = filtersFromForm();
    writeUrl('replaceState', filters);
    search(filters);
  }, 300);
});
form.addEventListener('change', (event) => {
  if (event.target.name === 'q') return; // el texto ya se atiende con input
  const filters = filtersFromForm();
  writeUrl('pushState', filters);
  search(filters);
});
form.addEventListener('submit', (event) => event.preventDefault());
window.addEventListener('popstate', () => {
  const filters = filtersFromUrl(new URL(location.href));
  fillForm(filters);
  backButton.disabled = (history.state?.depth ?? 0) === 0;
  logLine(`↩️ popstate → ${location.search || '(sin filtros)'}`);
  search(filters);
});
backButton.addEventListener('click', () => history.back());

async function start() {
  try {
    const response = await fetch('coffees.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    catalog = await response.json();
    logLine(`📦 catálogo cargado: ${catalog.length} cafés`);
  } catch (error) {
    statusText.className = 'status is-error';
    statusText.textContent = `No se pudo cargar el catálogo (${error.message}).`;
    return;
  }
  try {
    if (history.state === null) history.replaceState({ depth: 0 }, '');
  } catch (error) {
    historyWorks = false; // tarjeta aislada (origen null): se filtra igual, sin historial
    logLine(`⚠️ ${error.name}: en esta tarjeta la dirección no cambia; ábrela con ▶ o en el editor`);
  }
  backButton.disabled = (history.state?.depth ?? 0) === 0;
  const filters = filtersFromUrl(new URL(location.href));
  fillForm(filters);
  search(filters);
  logLine('Listo: marca «Oscuro», ordena por «Precio ↑», escribe «chiapas» y vuelve con «← Atrás»');
}
start();
```

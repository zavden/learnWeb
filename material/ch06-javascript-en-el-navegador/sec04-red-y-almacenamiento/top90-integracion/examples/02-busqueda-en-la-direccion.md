---
example_description: "Un buscador de recetas cuya búsqueda vive en la dirección (?q=mole&tipo=postre): escribir busca en vivo con debounce y cancelación, Enter o cambiar el tipo confirman la búsqueda con pushState, ← Atrás la restaura con popstate y una recarga la recupera de la URL"
example_tags: "javascript|fetch|abortcontroller|urlsearchparams|pushstate|popstate|buscador|integracion"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Recetario</h1>
  <form id="search-form" role="search">
    <label for="query">Receta</label>
    <input id="query" name="q" type="search" autocomplete="off">
    <label for="type">Tipo</label>
    <select id="type" name="tipo">
      <option value="todas">Todas</option>
      <option value="salado">Platos salados</option>
      <option value="postre">Postres</option>
    </select>
    <button type="submit">Buscar</button>
  </form>
  <p class="actions"><button id="back" type="button">← Atrás</button></p>
  <p id="state" role="status">Cargando…</p>
  <ul id="results" aria-busy="false"></ul>
  <ol id="log" class="log" aria-live="polite"></ol>
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
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
form {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.4rem 0.6rem;
  align-items: center;
}
form button {
  grid-column: 2;
  justify-self: start;
}
input,
select,
button {
  font: inherit;
  padding: 0.35rem 0.6rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
}
button {
  cursor: pointer;
}
button:disabled {
  color: #616e7c;
  cursor: not-allowed;
}
input:focus-visible,
select:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
#state {
  padding: 0.4rem 0.6rem;
  border-left: 4px solid #1d4ed8;
  background: #ffffff;
}
#results[aria-busy="true"] {
  opacity: 0.5;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Combina «Peticiones con fetch» (cancelar, estados), «URL e historial»
// (URLSearchParams, pushState, popstate) y el debounce del módulo de funciones.
const RECIPES = [
  ['Mole poblano', 'salado'], ['Mole negro oaxaqueño', 'salado'], ['Tamales de mole', 'salado'],
  ['Pozole rojo', 'salado'], ['Sopa de lima', 'salado'], ['Chiles en nogada', 'salado'],
  ['Flan napolitano', 'postre'], ['Arroz con leche', 'postre'], ['Pan de muerto', 'postre'], ['Camote enmielado', 'postre'],
];
const form = document.querySelector('#search-form');
const queryInput = document.querySelector('#query');
const typeSelect = document.querySelector('#type');
const backButton = document.querySelector('#back');
const stateText = document.querySelector('#state');
const resultsList = document.querySelector('#results');
const logList = document.querySelector('#log');
let current = null;   // AbortController de la búsqueda en curso
let shownKey = null;  // qué búsqueda está pintada («q|tipo»)
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Formulario ⇄ URL: la dirección guarda solo lo que no es por defecto.
function fieldsToSearch() {
  const params = new URLSearchParams();
  if (queryInput.value.trim()) params.set('q', queryInput.value.trim());
  if (typeSelect.value !== 'todas') params.set('tipo', typeSelect.value);
  const text = params.toString();
  return text ? `?${text}` : '';
}
function urlToFields(url) {
  queryInput.value = url.searchParams.get('q') ?? '';
  const type = url.searchParams.get('tipo');
  typeSelect.value = ['salado', 'postre'].includes(type) ? type : 'todas';
}

// La búsqueda: el servidor de prueba hace de API lenta (250 ms) y devuelve la
// consulta; el filtrado se hace con la lista local.
async function search() {
  const q = queryInput.value.trim().toLowerCase();
  const type = typeSelect.value;
  if (`${q}|${type}` === shownKey) return; // ya está pintada
  current?.abort();
  current = new AbortController();
  stateText.textContent = 'Buscando…';
  resultsList.setAttribute('aria-busy', 'true');
  try {
    const params = new URLSearchParams({ q, tipo: type, delay: '250' });
    const response = await fetch(`/api/demo/echo?${params}`, { signal: current.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { query } = await response.json();
    const found = RECIPES.filter(([title, kind]) => title.toLowerCase().includes(query.q) && (query.tipo === 'todas' || kind === query.tipo));
    resultsList.replaceChildren(...found.map(([title]) => Object.assign(document.createElement('li'), { textContent: title })));
    stateText.textContent = found.length ? `${found.length} receta(s).` : 'Ninguna receta con esos filtros.';
    shownKey = `${q}|${type}`;
    logLine(`🔎 «${q}» · ${type} → ${found.length} receta(s)`);
  } catch (error) {
    if (error.name === 'AbortError') return; // la sustituyó otra búsqueda
    stateText.textContent = `No se pudo buscar (${error.message}).`;
  } finally {
    resultsList.setAttribute('aria-busy', 'false');
  }
}

// Confirmar (Enter, «Buscar» o cambiar el tipo) = una entrada en el historial.
function commit() {
  const nextSearch = fieldsToSearch();
  if (nextSearch !== location.search) {
    try {
      history.pushState({ depth: (history.state?.depth ?? 0) + 1 }, '', nextSearch || location.pathname);
      logLine(`🧭 pushState → ${nextSearch || '(sin query)'}`);
    } catch (error) {
      logLine(`⚠️ ${error.name}: en esta tarjeta (iframe aislado) la dirección no cambia; ábrela con ▶ o en el editor`);
    }
  }
  backButton.disabled = (history.state?.depth ?? 0) === 0;
  search();
}

let debounceId;
queryInput.addEventListener('input', () => {
  clearTimeout(debounceId);
  debounceId = setTimeout(search, 300); // en vivo, sin tocar la dirección
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearTimeout(debounceId);
  commit();
});
typeSelect.addEventListener('change', commit);
window.addEventListener('popstate', () => {
  urlToFields(new URL(location.href));
  backButton.disabled = (history.state?.depth ?? 0) === 0;
  logLine(`↩️ popstate → ${location.search || '(sin query)'}`);
  search();
});
backButton.addEventListener('click', () => history.back());

// Al cargar (también tras ⌘R en una pestaña): la búsqueda sale de la URL.
try {
  if (history.state === null) history.replaceState({ depth: 0 }, '');
} catch {
  // tarjeta aislada: sin historial
}
backButton.disabled = (history.state?.depth ?? 0) === 0;
urlToFields(new URL(location.href));
search();
logLine('Listo: escribe «mole» y pulsa Enter; elige «Postres»; escribe «flan» y Enter; vuelve con «← Atrás»');
```

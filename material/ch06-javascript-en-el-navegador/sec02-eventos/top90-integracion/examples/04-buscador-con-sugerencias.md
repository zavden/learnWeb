---
example_description: "Un buscador de recetas: sugerencias mientras se escribe con debounce y cancelación de la petición anterior (AbortController), búsqueda completa con submit + preventDefault (también con Enter), Escape que cierra las sugerencias y un solo listener delegado para elegirlas"
example_tags: "javascript|eventos|integracion|submit|debounce|abortcontroller|delegacion|teclado"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <form id="search-form" class="search" action="/recetas" role="search">
    <label for="query">Buscar recetas</label>
    <div class="row">
      <input id="query" name="q" type="search" autocomplete="off" aria-describedby="suggestions-status">
      <button type="submit">Buscar</button>
    </div>
    <p id="suggestions-status" class="status" aria-live="polite"></p>
    <ul id="suggestions" class="suggestions" hidden></ul>
  </form>
  <section aria-labelledby="results-title">
    <h2 id="results-title">Resultados</h2>
    <ul id="results"></ul>
  </section>
  <ol id="log" class="log"></ol>
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
h2 {
  font-size: 1rem;
}
.row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}
input {
  flex: 1;
  min-width: 0;
  font: inherit;
  padding: 0.35rem 0.5rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid #7b8794;
  border-radius: 0.4rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
input:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.status {
  min-height: 1.2em;
  margin: 0.25rem 0;
  color: #52606d;
  font-size: 0.85rem;
}
.suggestions {
  margin: 0;
  padding: 0.25rem;
  list-style: none;
  border: 1px solid #7b8794;
  border-radius: 0.4rem;
  background: #ffffff;
}
.suggestions button {
  width: 100%;
  border-color: transparent;
  text-align: start;
}
.log {
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
const form = document.querySelector('#search-form');
const input = document.querySelector('#query');
const suggestions = document.querySelector('#suggestions');
const statusLine = document.querySelector('#suggestions-status');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// El «servidor», simulado: las consultas cortas tardan más (hay más resultados).
const recipes = ['Pozole rojo', 'Pozole verde', 'Tamales de rajas', 'Tacos al pastor',
  'Tlayudas', 'Mole poblano', 'Molletes', 'Chiles en nogada', 'Champurrado'];
function searchServer(query, { signal } = {}) {
  return new Promise((resolve, reject) => {
    const timerId = setTimeout(() => {
      const text = query.trim().toLowerCase();
      resolve(recipes.filter((recipe) => recipe.toLowerCase().includes(text)));
    }, 400 - Math.min(query.length, 6) * 50);
    signal?.addEventListener('abort', () => {
      clearTimeout(timerId);
      reject(signal.reason);
    }, { once: true });
  });
}

// El debounce de «Funciones de orden superior», con cancel() para descartar
// la llamada pendiente (si se pulsa Enter antes de que venza).
function debounce(fn, waitMs) {
  let timerId;
  const debounced = (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), waitMs);
  };
  debounced.cancel = () => clearTimeout(timerId);
  return debounced;
}

let pending = null; // el AbortController de la petición de sugerencias en curso
const stats = { input: 0, requests: 0, aborted: 0 };

async function suggest(query) {
  pending?.abort(); // la anterior ya no sirve
  if (!query.trim()) return hideSuggestions();
  pending = new AbortController();
  stats.requests += 1;
  try {
    const found = await searchServer(query, { signal: pending.signal });
    suggestions.replaceChildren(...found.slice(0, 5).map((recipe) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = recipe; // texto, nunca HTML
      item.append(button);
      return item;
    }));
    suggestions.hidden = found.length === 0;
    statusLine.textContent = `${found.length} sugerencias para «${query}»`;
  } catch (error) {
    if (error.name !== 'AbortError') throw error;
    stats.aborted += 1;
  }
}
const debouncedSuggest = debounce(suggest, 250);

function hideSuggestions() {
  suggestions.hidden = true;
  statusLine.textContent = '';
}

async function runSearch(query) {
  debouncedSuggest.cancel(); // ni sugerencias pendientes…
  pending?.abort();          // …ni en camino
  hideSuggestions();
  const found = await searchServer(query);
  document.querySelector('#results').replaceChildren(...found.map((recipe) => {
    const item = document.createElement('li');
    item.textContent = recipe;
    return item;
  }));
  logLine(`🔎 «${query}» → ${found.length} resultado(s) · input: ${stats.input}, peticiones de sugerencias: ${stats.requests}, canceladas: ${stats.aborted}`);
}

input.addEventListener('input', () => {
  stats.input += 1;
  debouncedSuggest(input.value);
});
input.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !suggestions.hidden) {
    event.preventDefault(); // Escape cierra la lista (y no borra el campo)
    hideSuggestions();
    logLine('⎋ sugerencias cerradas');
  }
});
// Una sugerencia elegida: un listener delegado en la lista.
suggestions.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  input.value = button.textContent;
  input.focus();
  runSearch(input.value);
});
// Buscar: el submit llega con el botón y con Enter en el campo.
form.addEventListener('submit', (event) => {
  event.preventDefault(); // antes de cualquier await
  runSearch(input.value);
});
logLine('Listo: escribe «pozole» seguido y pulsa Enter; luego escribe «mo» y elige una sugerencia');
```

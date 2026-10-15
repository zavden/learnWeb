---
example_description: "Un buscador que pide al servidor en cada tecla: las respuestas llegan desordenadas y la última en llegar (una búsqueda vieja) pinta resultados que no corresponden al campo. Cancelar la petición anterior con AbortController lo arregla; la página muestra los estados de carga, vacío y error"
example_tags: "javascript|fetch|abortcontroller|buscador|carrera|estados|aria-busy"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Recetario</h1>
  <form id="search-form" role="search">
    <label for="query">Buscar receta</label>
    <input id="query" type="search" autocomplete="off">
  </form>
  <p class="options">
    <label><input id="cancel-previous" type="checkbox"> Cancelar la petición anterior (el arreglo)</label>
    <label><input id="server-down" type="checkbox"> Simular servidor caído (503)</label>
  </p>
  <p><button id="type-demo" type="button">Simular tecleo</button></p>
  <p id="state" class="state" role="status">Escribe para buscar.</p>
  <ul id="results" class="results" aria-busy="false"></ul>
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
  gap: 0.25rem;
}
input[type="search"],
button {
  font: inherit;
  padding: 0.4rem 0.6rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
}
button {
  cursor: pointer;
}
input:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.options {
  display: grid;
  gap: 0.25rem;
  font-size: 0.9rem;
}
.state {
  padding: 0.4rem 0.6rem;
  border-left: 4px solid #1d4ed8;
  background: #ffffff;
}
.results[aria-busy="true"] {
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
const RECIPES = ['Mole poblano', 'Mole negro oaxaqueño', 'Molletes con pico de gallo', 'Enmoladas de pollo',
  'Pozole rojo', 'Chiles en nogada', 'Cochinita pibil', 'Sopa de lima', 'Tamales de mole',
  'Camote enmielado', 'Mermelada de guayaba', 'Flan napolitano'];
const input = document.querySelector('#query');
const stateText = document.querySelector('#state');
const resultsList = document.querySelector('#results');
const cancelBox = document.querySelector('#cancel-previous');
const downBox = document.querySelector('#server-down');
const logList = document.querySelector('#log');
let current = null; // el AbortController de la última búsqueda

function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
function setState(text, busy) {
  stateText.textContent = text;
  resultsList.setAttribute('aria-busy', String(busy));
}

// El servidor de prueba solo devuelve lo que le mandas; aquí hace de buscador
// LENTO: cuanto más corta la búsqueda, más tarda (1 letra: 1000 ms; 4: 100 ms).
// Filtramos con la q que DEVUELVE: así cada respuesta dice de qué búsqueda es.
async function searchServer(query, signal) {
  const delay = Math.max(100, 1300 - query.length * 300);
  const status = downBox.checked ? 503 : 200;
  const url = `/api/demo/echo?q=${encodeURIComponent(query)}&delay=${delay}&status=${status}`;
  logLine(`→ pido «${query}» (tarda ${delay} ms)`);
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
  const echo = await response.json();
  const names = RECIPES.filter((name) => name.toLowerCase().includes(echo.query.q));
  return { answered: echo.query.q, names };
}

async function search(query) {
  if (cancelBox.checked) current?.abort(); // ✅ la búsqueda anterior ya no interesa
  current = new AbortController();
  if (query === '') {
    resultsList.replaceChildren();
    setState('Escribe para buscar.', false);
    return;
  }
  setState(`Buscando «${query}»…`, true); // estado de carga
  try {
    const { answered, names } = await searchServer(query, current.signal);
    const shown = input.value.trim().toLowerCase();
    const stale = answered !== shown;
    logLine(`${stale ? '🐛' : '←'} llega «${answered}»: ${names.length} receta(s)${stale ? `, pero el campo dice «${shown}»` : ''}`);
    resultsList.replaceChildren(...names.map((name) => Object.assign(document.createElement('li'), { textContent: name })));
    setState(names.length > 0 ? `${names.length} receta(s) con «${answered}».` : `Ninguna receta con «${answered}».`, false);
  } catch (error) {
    if (error.name === 'AbortError') {
      logLine(`✖ «${query}» cancelada`);
      return;
    }
    logLine(`⛔ «${query}»: ${error.message}`);
    resultsList.replaceChildren();
    setState(`No se pudo buscar (${error.message}). Inténtalo de nuevo.`, false); // estado de error
  }
}

input.addEventListener('input', () => search(input.value.trim().toLowerCase()));
document.querySelector('#search-form').addEventListener('submit', (event) => event.preventDefault());

// «Simular tecleo»: escribe «mole», una letra cada 100 ms, con eventos input.
document.querySelector('#type-demo').addEventListener('click', () => {
  logList.replaceChildren();
  input.value = '';
  [...'mole'].forEach((letter, index) => {
    setTimeout(() => {
      input.value += letter;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, index * 100);
  });
});
logLine('Listo: pulsa «Simular tecleo» sin marcar «Cancelar la petición anterior» y después con la casilla marcada');

// Sin cancelar, las cuatro peticiones siguen vivas y cada una pinta al llegar:
// la más lenta («m») llega la última y deja en pantalla una búsqueda vieja.
// Con abort(), solo puede pintar la última. En la integración del módulo de
// eventos se añadía debounce para, además, ahorrar peticiones.
```

---
example_description: "Debounce en un buscador: la búsqueda solo se lanza cuando dejas de escribir 400 ms; contadores de pulsaciones frente a búsquedas"
example_tags: "javascript|orden-superior|debounce|closures|settimeout|rendimiento"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="search">
  <h1>Buscador de recetas</h1>
  <label for="query">Busca una receta</label>
  <input id="query" type="search" autocomplete="off" placeholder="Prueba con «tortilla»">
  <p class="stats">
    Pulsaciones: <strong id="keystrokes">0</strong> ·
    Búsquedas lanzadas: <strong id="searches">0</strong>
  </p>
  <p id="results" role="status">Escribe para buscar.</p>
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
.search {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}
h1 {
  font-size: 1.3rem;
}
label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.35rem;
}
input {
  width: 100%;
  box-sizing: border-box;
  font: inherit;
  padding: 0.5rem 0.75rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
}
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.stats {
  color: #52606d;
}
```

# JavaScript

```javascript
// querySelector, textContent y addEventListener se estudian en el capítulo 6, y
// setTimeout/clearTimeout en el módulo «Asincronía y event loop». Aquí basta con
// saber que el evento 'input' llama a su callback en CADA pulsación.

// debounce: devuelve una versión de fn que espera a que pasen waitMs SIN llamadas.
function debounce(fn, waitMs) {
  let timerId; // closure: el temporizador pendiente, compartido entre llamadas
  return (...args) => {
    clearTimeout(timerId);                           // cancela la llamada programada…
    timerId = setTimeout(() => fn(...args), waitMs); // …y programa una nueva
  };
}

const recipes = ['Tortilla de patatas', 'Gazpacho andaluz', 'Tacos al pastor', 'Ceviche de corvina',
  'Arepas de queso', 'Paella valenciana', 'Tortitas con miel', 'Pozole rojo'];
const input = document.querySelector('#query');
const keystrokesOutput = document.querySelector('#keystrokes');
const searchesOutput = document.querySelector('#searches');
const results = document.querySelector('#results');
let keystrokes = 0;
let searches = 0;

function search(text) {
  searches += 1;
  searchesOutput.textContent = searches;
  const query = text.trim().toLowerCase();
  const found = recipes.filter((recipe) => query !== '' && recipe.toLowerCase().includes(query));
  results.textContent = query === '' ? 'Escribe para buscar.'
    : `${found.length} resultado(s): ${found.join(' · ') || '—'}`;
  console.log(`🔎 búsqueda ${searches}: «${text}»`);
}

const debouncedSearch = debounce(search, 400);
input.addEventListener('input', () => {
  keystrokes += 1;
  keystrokesOutput.textContent = keystrokes;
  debouncedSearch(input.value); // sin debounce, sería una búsqueda por pulsación
});
```

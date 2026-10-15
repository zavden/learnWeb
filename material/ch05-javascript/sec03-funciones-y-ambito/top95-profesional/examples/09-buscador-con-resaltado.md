---
example_description: "Buscador de recetas con debounce, búsqueda sin tildes ni mayúsculas, puntuación por campo, resultados memoizados y coincidencias resaltadas con mark sobre el texto original"
example_tags: "javascript|profesional|debounce|memoizacion|busqueda|interfaz"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <header>
    <h1>Recetario</h1>
    <p class="intro">Busca por nombre, ingrediente, región o etiqueta. Da igual escribir con o sin tildes.</p>
  </header>

  <div class="search">
    <label for="query">Buscar recetas</label>
    <input id="query" type="search" autocomplete="off" spellcheck="false" placeholder="Por ejemplo: arroz picante">
    <p class="suggestions">
      Prueba:
      <button type="button" data-query="limón">limón</button>
      <button type="button" data-query="maiz">maiz</button>
      <button type="button" data-query="arroz rapida">arroz rapida</button>
      <button type="button" data-query="queso mexico">queso mexico</button>
    </p>
  </div>

  <p id="status" class="status" role="status">20 recetas.</p>
  <ul id="results" class="results"></ul>
</main>
```

# CSS

```css
:root {
  --text: #1f2933;
  --muted: #52606d;
  --page: #f5f7fa;
  --surface: #ffffff;
  --border: #c3cad3;
  --accent: #1d4ed8;
  --mark: #fde68a;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--page);
}
.app {
  max-width: 60rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
}
h1 {
  margin: 0;
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
}
.intro,
.status,
.meta {
  color: var(--muted);
}
.search label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.35rem;
}
input[type='search'] {
  width: 100%;
  font: inherit;
  padding: 0.6rem 0.8rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text);
}
input:focus-visible,
button:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.suggestions button {
  font: inherit;
  font-size: 0.9rem;
  margin: 0.15rem;
  padding: 0.15rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--accent);
  cursor: pointer;
}
.results {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
}
.results li {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
}
.results h2 {
  font-size: 1.05rem;
  margin: 0 0 0.25rem;
}
.meta,
.ingredients {
  margin: 0.2rem 0;
  font-size: 0.92rem;
}
mark {
  background: var(--mark);
  color: var(--text);
  border-radius: 0.2rem;
  padding: 0 0.1rem;
}
```

# JavaScript

```javascript
// BUSCADOR DE RECETAS con resaltado de coincidencias.
//
// Decisiones:
// - La lógica es PURA y no toca la página: normalizar, encontrar rangos, puntuar y
//   buscar. La interfaz solo pinta lo que devuelven esas funciones.
// - Se busca sobre el texto «plegado» (minúsculas y sin tildes), pero se resalta sobre
//   el ORIGINAL: fold guarda, para cada carácter plegado, su posición en el original.
// - Todos los términos deben aparecer (Y lógico). Puntúa más una coincidencia en el
//   nombre (3) que en una etiqueta o la región (2) o en un ingrediente (1).
// - search se memoiza por la consulta plegada: «MAÍZ» y «maiz» comparten resultado.
// - debounce (200 ms) evita buscar y repintar en cada pulsación.
// - Se pinta con createElement y textContent, nunca con innerHTML: el texto que escribe
//   la persona jamás se interpreta como HTML.
//
// Alcance: módulos 1-3. querySelector, createElement, append y addEventListener se
// estudian en el capítulo 6; setTimeout/clearTimeout, en «Asincronía y event loop».

const RECIPES = [
  { name: 'Tortilla de patatas', region: 'España', minutes: 40, tags: ['vegetariana', 'clásica'], ingredients: ['patata', 'huevo', 'cebolla', 'aceite de oliva'] },
  { name: 'Gazpacho andaluz', region: 'España', minutes: 15, tags: ['fría', 'vegana', 'rápida'], ingredients: ['tomate', 'pepino', 'pimiento', 'ajo', 'pan'] },
  { name: 'Paella valenciana', region: 'España', minutes: 60, tags: ['arroz', 'domingo'], ingredients: ['arroz', 'pollo', 'conejo', 'judía verde', 'azafrán'] },
  { name: 'Arroz a la cubana', region: 'Cuba', minutes: 25, tags: ['arroz', 'rápida'], ingredients: ['arroz', 'huevo', 'tomate frito', 'plátano'] },
  { name: 'Ceviche de corvina', region: 'Perú', minutes: 30, tags: ['pescado', 'fría'], ingredients: ['corvina', 'limón', 'cebolla morada', 'ají', 'cilantro'] },
  { name: 'Ají de gallina', region: 'Perú', minutes: 50, tags: ['picante', 'guiso'], ingredients: ['gallina', 'ají amarillo', 'pan', 'leche', 'nuez'] },
  { name: 'Arepas de queso', region: 'Venezuela', minutes: 25, tags: ['vegetariana', 'desayuno'], ingredients: ['harina de maíz', 'queso', 'mantequilla'] },
  { name: 'Tacos al pastor', region: 'México', minutes: 45, tags: ['picante', 'calle'], ingredients: ['cerdo', 'piña', 'tortilla de maíz', 'achiote', 'cilantro'] },
  { name: 'Chilaquiles verdes', region: 'México', minutes: 20, tags: ['desayuno', 'picante', 'rápida'], ingredients: ['totopos', 'salsa verde', 'queso fresco', 'crema'] },
  { name: 'Quesadillas de flor de calabaza', region: 'México', minutes: 20, tags: ['vegetariana', 'rápida'], ingredients: ['tortilla de maíz', 'flor de calabaza', 'queso Oaxaca'] },
  { name: 'Pozole rojo', region: 'México', minutes: 120, tags: ['guiso', 'fiesta'], ingredients: ['maíz cacahuazintle', 'cerdo', 'chile guajillo', 'rábano'] },
  { name: 'Empanadas salteñas', region: 'Argentina', minutes: 70, tags: ['horno'], ingredients: ['harina', 'carne', 'papa', 'comino'] },
  { name: 'Limonada de coco', region: 'Colombia', minutes: 5, tags: ['bebida', 'fría', 'rápida'], ingredients: ['limón', 'leche de coco', 'hielo'] },
  { name: 'Sancocho de pollo', region: 'Colombia', minutes: 90, tags: ['guiso', 'domingo'], ingredients: ['pollo', 'yuca', 'mazorca', 'plátano verde'] },
  { name: 'Pisto manchego', region: 'España', minutes: 45, tags: ['vegana', 'verdura'], ingredients: ['calabacín', 'pimiento', 'tomate', 'cebolla'] },
  { name: 'Crema catalana', region: 'España', minutes: 35, tags: ['postre'], ingredients: ['leche', 'yema de huevo', 'azúcar', 'limón', 'canela'] },
  { name: 'Arroz con leche', region: 'España', minutes: 50, tags: ['postre', 'arroz'], ingredients: ['arroz', 'leche', 'canela', 'limón'] },
  { name: 'Pupusas revueltas', region: 'El Salvador', minutes: 40, tags: ['calle'], ingredients: ['masa de maíz', 'chicharrón', 'frijol', 'queso'] },
  { name: 'Mole poblano', region: 'México', minutes: 180, tags: ['fiesta', 'picante'], ingredients: ['chile mulato', 'chocolate', 'almendra', 'pollo'] },
  { name: 'Causa limeña', region: 'Perú', minutes: 40, tags: ['fría'], ingredients: ['papa amarilla', 'ají amarillo', 'limón', 'pollo', 'aguacate'] },
];

// ── Lógica pura ─────────────────────────────────────────────────────────

// Pliega el texto (minúsculas, sin tildes) y recuerda de qué posición del original
// viene cada carácter plegado: map[i] es el índice original del carácter plegado i.
function fold(text) {
  let folded = '';
  const map = [];
  let originalIndex = 0;
  for (const char of text) {
    const base = [...char.normalize('NFD')].filter((c) => c < '̀' || c > 'ͯ').join('').toLowerCase();
    for (let k = 0; k < base.length; k++) {
      folded += base[k];
      map.push(originalIndex);
    }
    originalIndex += char.length;
  }
  map.push(text.length); // centinela: el final del texto
  return { folded, map };
}
const foldText = (text) => fold(text).folded;
const termsOf = (query) => foldText(query).split(' ').filter((term) => term !== '');

// Rangos [inicio, fin) del texto ORIGINAL donde aparece algún término, sin solapes.
function matchRanges(text, terms) {
  const { folded, map } = fold(text);
  const ranges = [];
  for (const term of terms) {
    for (let at = folded.indexOf(term); at !== -1; at = folded.indexOf(term, at + 1)) {
      ranges.push([map[at], map[at + term.length]]);
    }
  }
  const sorted = ranges.toSorted((a, b) => a[0] - b[0]);
  return sorted.reduce((merged, [start, end]) => {
    const last = merged.at(-1);
    if (last && start <= last[1]) return merged.with(-1, [last[0], Math.max(last[1], end)]);
    return [...merged, [start, end]];
  }, []);
}

// Índice de búsqueda: los textos de cada receta, plegados UNA vez.
const INDEX = RECIPES.map((recipe) => ({
  recipe,
  name: foldText(recipe.name),
  labels: foldText([recipe.region, ...recipe.tags].join(' ')),
  ingredients: foldText(recipe.ingredients.join(' ')),
}));

function scoreEntry(entry, terms) {
  let total = 0;
  for (const term of terms) {
    const points = entry.name.includes(term) ? 3 : entry.labels.includes(term) ? 2 : entry.ingredients.includes(term) ? 1 : 0;
    if (points === 0) return 0; // falta un término: no es un resultado
    total += points;
  }
  return total;
}

function memoize(fn) {
  const cache = new Map();
  return (key) => {
    if (!cache.has(key)) cache.set(key, fn(key));
    return cache.get(key);
  };
}
let realSearches = 0;
const searchFolded = memoize((foldedQuery) => {
  realSearches += 1;
  const terms = foldedQuery.split(' ').filter((term) => term !== '');
  if (terms.length === 0) return INDEX.map((entry) => entry.recipe).toSorted((a, b) => a.name.localeCompare(b.name, 'es'));
  return INDEX.map((entry) => ({ recipe: entry.recipe, score: scoreEntry(entry, terms) }))
    .filter((result) => result.score > 0)
    .toSorted((a, b) => b.score - a.score || a.recipe.name.localeCompare(b.recipe.name, 'es'))
    .map((result) => result.recipe);
});
const search = (query) => searchFolded(termsOf(query).join(' '));

function debounce(fn, waitMs) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), waitMs);
  };
}

// ── Interfaz ────────────────────────────────────────────────────────────
const input = document.querySelector('#query');
const statusLine = document.querySelector('#status');
const list = document.querySelector('#results');

// Añade a element el texto con las coincidencias envueltas en <mark>.
function appendHighlighted(element, text, terms) {
  let cursor = 0;
  for (const [start, end] of matchRanges(text, terms)) {
    const mark = document.createElement('mark');
    mark.textContent = text.slice(start, end);
    element.append(text.slice(cursor, start), mark);
    cursor = end;
  }
  element.append(text.slice(cursor));
}

function renderCard(recipe, terms) {
  const item = document.createElement('li');
  const title = document.createElement('h2');
  appendHighlighted(title, recipe.name, terms);
  const meta = document.createElement('p');
  meta.className = 'meta';
  appendHighlighted(meta, `${recipe.region} · ${recipe.minutes} min · ${recipe.tags.join(', ')}`, terms);
  const ingredients = document.createElement('p');
  ingredients.className = 'ingredients';
  appendHighlighted(ingredients, recipe.ingredients.join(', '), terms);
  item.append(title, meta, ingredients);
  return item;
}

function render(query) {
  const terms = termsOf(query);
  const results = search(query);
  list.replaceChildren(...results.map((recipe) => renderCard(recipe, terms)));
  const count = `${results.length} ${results.length === 1 ? 'receta' : 'recetas'}`;
  if (terms.length === 0) statusLine.textContent = `${count}.`;
  else if (results.length === 0) statusLine.textContent = `Ninguna receta para «${query.trim()}». Prueba con menos palabras.`;
  else statusLine.textContent = `${count} para «${query.trim()}».`;
  console.log(`🔎 «${query}» → ${results.length} (búsquedas reales: ${realSearches})`);
}

const renderSoon = debounce(render, 200);
input.addEventListener('input', () => renderSoon(input.value));
for (const button of document.querySelectorAll('[data-query]')) {
  button.addEventListener('click', () => {
    input.value = button.dataset.query;
    render(input.value); // un clic no necesita debounce
    input.focus();
  });
}
render('');
```

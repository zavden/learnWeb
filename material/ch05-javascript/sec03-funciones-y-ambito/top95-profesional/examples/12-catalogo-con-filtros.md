---
example_description: "Catálogo de una librería con filtros componibles: fábricas de filtros y comparadores, una tubería con pipe, criterios inmutables, recuentos por faceta y resultados memoizados"
example_tags: "javascript|profesional|composicion|orden-superior|memoizacion|interfaz"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Librería La Ventana</h1>
  <div class="layout">
    <form id="filters" class="filters" aria-label="Filtros del catálogo">
      <div class="field">
        <label for="text">Título o autor</label>
        <input id="text" name="text" type="search" autocomplete="off">
      </div>
      <fieldset class="field">
        <legend>Género</legend>
        <div id="genres"></div>
      </fieldset>
      <div class="field">
        <label for="language">Idioma</label>
        <select id="language" name="language">
          <option value="">Todos</option>
          <option value="es">Español</option>
          <option value="en">Inglés</option>
          <option value="ca">Catalán</option>
        </select>
      </div>
      <div class="field">
        <label for="max-price">Precio máximo: <output id="max-price-value" for="max-price"></output></label>
        <input id="max-price" name="maxPrice" type="range" min="5" max="40" step="1" value="40">
      </div>
      <div class="field checkbox">
        <input id="in-stock" name="inStock" type="checkbox">
        <label for="in-stock">Solo disponibles</label>
      </div>
      <div class="field">
        <label for="sort">Ordenar por</label>
        <select id="sort" name="sort">
          <option value="title:asc">Título (A-Z)</option>
          <option value="cents:asc">Precio (de menor a mayor)</option>
          <option value="cents:desc">Precio (de mayor a menor)</option>
          <option value="year:desc">Más recientes</option>
          <option value="rating:desc">Mejor valorados</option>
        </select>
      </div>
      <button type="reset">Restablecer filtros</button>
    </form>

    <section aria-labelledby="results-title">
      <h2 id="results-title" class="visually-hidden">Resultados</h2>
      <p id="count" role="status"></p>
      <ul id="books" class="books"></ul>
    </section>
  </div>
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
  --warning: #9a3412;
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
  max-width: 70rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
}
h1 {
  margin: 0 0 1rem;
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
}
.layout {
  display: grid;
  gap: 1.25rem;
}
@media (min-width: 48rem) {
  .layout {
    grid-template-columns: 16rem 1fr;
    align-items: start;
  }
}
.filters {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
}
.field {
  margin: 0 0 1rem;
  border: 0;
  padding: 0;
}
.field > label,
legend {
  display: block;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.field.checkbox,
.genre {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.field.checkbox label {
  font-weight: 600;
  margin: 0;
}
.genre .facet-count {
  color: var(--muted);
}
input[type='search'],
select {
  width: 100%;
  font: inherit;
  padding: 0.4rem 0.6rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text);
}
input[type='range'] {
  width: 100%;
  accent-color: var(--accent);
}
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--accent);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--accent);
  cursor: pointer;
}
input:focus-visible,
select:focus-visible,
button:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.books {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
}
.books li {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
}
.books h3 {
  margin: 0;
  font-size: 1.05rem;
}
.author,
.details {
  margin: 0.2rem 0;
  color: var(--muted);
  font-size: 0.92rem;
}
.price {
  margin: 0.4rem 0 0;
  font-weight: 700;
}
.out-of-stock {
  color: var(--warning);
  font-weight: 600;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

# JavaScript

```javascript
// CATÁLOGO DE UNA LIBRERÍA CON FILTROS COMPONIBLES.
//
// Decisiones:
// - Los CRITERIOS son un objeto inmutable { text, genres (Set), language, maxPriceCents,
//   inStock, sort }. Cada cambio del formulario crea criterios nuevos.
// - Cada filtro sale de una FÁBRICA que recibe su parámetro y devuelve un predicado
//   (libro → booleano). Los filtros inactivos no se crean.
// - La consulta es una tubería (pipe): filtrar con todos los predicados activos y
//   ordenar con un comparador fabricado por sortBy (con desempate por título).
// - Recuento por faceta: cuántos libros habría con cada género, aplicando TODOS los
//   filtros MENOS el de género (si no, los géneros no marcados darían siempre 0).
// - La consulta se memoiza por la clave de los criterios; los datos no se tocan nunca.
// - La interfaz solo traduce eventos en criterios y pinta lo que devuelve la lógica.
//
// Alcance: módulos 1-3. querySelector, createElement, los eventos (input, reset,
// submit) y la lectura de los campos de un formulario se estudian en el capítulo 6;
// setTimeout, en «Asincronía y event loop».

const BOOKS = [
  { title: 'Cien años de soledad', author: 'Gabriel García Márquez', genre: 'novela', language: 'es', year: 1967, cents: 1290, rating: 4.8, stock: 6 },
  { title: 'La sombra del viento', author: 'Carlos Ruiz Zafón', genre: 'novela', language: 'es', year: 2001, cents: 1095, rating: 4.5, stock: 0 },
  { title: 'Rayuela', author: 'Julio Cortázar', genre: 'novela', language: 'es', year: 1963, cents: 1450, rating: 4.3, stock: 3 },
  { title: 'Ficciones', author: 'Jorge Luis Borges', genre: 'cuentos', language: 'es', year: 1944, cents: 990, rating: 4.7, stock: 8 },
  { title: 'El llano en llamas', author: 'Juan Rulfo', genre: 'cuentos', language: 'es', year: 1953, cents: 850, rating: 4.4, stock: 2 },
  { title: 'Veinte poemas de amor', author: 'Pablo Neruda', genre: 'poesía', language: 'es', year: 1924, cents: 690, rating: 4.6, stock: 11 },
  { title: 'Poeta en Nueva York', author: 'Federico García Lorca', genre: 'poesía', language: 'es', year: 1940, cents: 920, rating: 4.2, stock: 0 },
  { title: 'Sapiens', author: 'Yuval Noah Harari', genre: 'ensayo', language: 'es', year: 2014, cents: 2290, rating: 4.4, stock: 5 },
  { title: 'El infinito en un junco', author: 'Irene Vallejo', genre: 'ensayo', language: 'es', year: 2019, cents: 2490, rating: 4.9, stock: 4 },
  { title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', genre: 'informática', language: 'en', year: 2024, cents: 3590, rating: 4.6, stock: 2 },
  { title: 'Refactoring UI', author: 'Adam Wathan y Steve Schoger', genre: 'informática', language: 'en', year: 2018, cents: 3900, rating: 4.5, stock: 0 },
  { title: 'Inclusive Components', author: 'Heydon Pickering', genre: 'informática', language: 'en', year: 2019, cents: 2850, rating: 4.7, stock: 1 },
  { title: 'Mirall trencat', author: 'Mercè Rodoreda', genre: 'novela', language: 'ca', year: 1974, cents: 1350, rating: 4.4, stock: 3 },
  { title: 'Jo confesso', author: 'Jaume Cabré', genre: 'novela', language: 'ca', year: 2011, cents: 2390, rating: 4.6, stock: 2 },
  { title: 'Mortadelo y Filemón: El sulfato atómico', author: 'Francisco Ibáñez', genre: 'cómic', language: 'es', year: 1969, cents: 1195, rating: 4.5, stock: 9 },
  { title: 'Persépolis', author: 'Marjane Satrapi', genre: 'cómic', language: 'es', year: 2000, cents: 2495, rating: 4.7, stock: 0 },
];
const GENRES = [...new Set(BOOKS.map((book) => book.genre))].toSorted((a, b) => a.localeCompare(b, 'es'));
const MAX_PRICE_CENTS = 4000; // el tope del control deslizante: sin filtro de precio

// ── Utilidades funcionales ──────────────────────────────────────────────
const pipe = (...fns) => (input) => fns.reduce((value, fn) => fn(value), input);
const keepIf = (predicate) => (items) => items.filter(predicate);
const sortWith = (comparator) => (items) => items.toSorted(comparator);
const fold = (text) => [...text.normalize('NFD')].filter((char) => char < '̀' || char > 'ͯ').join('').toLowerCase();

// ── Fábricas de filtros: parámetro → predicado ──────────────────────────
const byText = (text) => {
  const words = fold(text).split(' ').filter(Boolean);
  return (book) => words.every((word) => fold(`${book.title} ${book.author}`).includes(word));
};
const byGenres = (genres) => (book) => genres.has(book.genre);
const byLanguage = (language) => (book) => book.language === language;
const byMaxPrice = (maxCents) => (book) => book.cents <= maxCents;
const inStockOnly = () => (book) => book.stock > 0;

// Comparador por campo y dirección, con desempate por título. spec es el value de
// cada <option>: 'campo:dirección', por ejemplo 'cents:desc'.
const sortBy = (spec) => {
  const [field, direction] = spec.split(':');
  const sign = direction === 'desc' ? -1 : 1;
  const compareField = (a, b) =>
    typeof a[field] === 'string' ? a[field].localeCompare(b[field], 'es') : a[field] - b[field];
  return (a, b) => sign * compareField(a, b) || a.title.localeCompare(b.title, 'es');
};

// Predicados activos según los criterios; except permite omitir uno (para las facetas).
function activePredicates(criteria, { except = null } = {}) {
  const predicates = [];
  if (criteria.text.trim() !== '') predicates.push(byText(criteria.text));
  if (except !== 'genres' && criteria.genres.size > 0) predicates.push(byGenres(criteria.genres));
  if (criteria.language !== '') predicates.push(byLanguage(criteria.language));
  if (criteria.maxPriceCents < MAX_PRICE_CENTS) predicates.push(byMaxPrice(criteria.maxPriceCents));
  if (criteria.inStock) predicates.push(inStockOnly());
  return predicates;
}

const criteriaKey = (criteria) => JSON.stringify({ ...criteria, genres: [...criteria.genres].toSorted() });

function memoizeByKey(fn, keyOf) {
  const cache = new Map();
  return (arg) => {
    const key = keyOf(arg);
    if (!cache.has(key)) cache.set(key, fn(arg));
    return cache.get(key);
  };
}
let realQueries = 0;
const query = memoizeByKey((criteria) => {
  realQueries += 1;
  const run = pipe(...activePredicates(criteria).map(keepIf), sortWith(sortBy(criteria.sort)));
  const withoutGenre = pipe(...activePredicates(criteria, { except: 'genres' }).map(keepIf));
  const facetBase = withoutGenre(BOOKS);
  const genreCounts = new Map(GENRES.map((genre) => [genre, facetBase.filter((book) => book.genre === genre).length]));
  return { books: run(BOOKS), genreCounts };
}, criteriaKey);

// ── Interfaz ────────────────────────────────────────────────────────────
const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const oneDecimal = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const LANGUAGE_NAMES = { es: 'español', en: 'inglés', ca: 'catalán' };
const ui = {
  form: document.querySelector('#filters'),
  text: document.querySelector('#text'),
  genres: document.querySelector('#genres'),
  language: document.querySelector('#language'),
  maxPrice: document.querySelector('#max-price'),
  maxPriceValue: document.querySelector('#max-price-value'),
  inStock: document.querySelector('#in-stock'),
  sort: document.querySelector('#sort'),
  count: document.querySelector('#count'),
  books: document.querySelector('#books'),
};

// Las casillas de género se crean una vez; los recuentos se actualizan en cada render.
const genreCountNodes = new Map();
for (const genre of GENRES) {
  const wrapper = document.createElement('div');
  wrapper.className = 'genre';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `genre-${genre}`;
  checkbox.value = genre;
  const label = document.createElement('label');
  label.htmlFor = checkbox.id;
  label.textContent = genre[0].toUpperCase() + genre.slice(1);
  const count = document.createElement('span');
  count.className = 'facet-count';
  wrapper.append(checkbox, label, count);
  ui.genres.append(wrapper);
  genreCountNodes.set(genre, count);
}

// Lee el formulario y crea criterios NUEVOS (nunca se modifican los anteriores).
const readCriteria = () => ({
  text: ui.text.value,
  genres: new Set([...ui.genres.querySelectorAll('input:checked')].map((input) => input.value)),
  language: ui.language.value,
  maxPriceCents: Number(ui.maxPrice.value) * 100,
  inStock: ui.inStock.checked,
  sort: ui.sort.value,
});

function renderBook(book) {
  const item = document.createElement('li');
  const title = document.createElement('h3');
  title.textContent = book.title;
  const author = document.createElement('p');
  author.className = 'author';
  author.textContent = book.author;
  const details = document.createElement('p');
  details.className = 'details';
  details.textContent = `${book.genre} · ${LANGUAGE_NAMES[book.language]} · ${book.year} · valoración ${oneDecimal.format(book.rating)}`;
  const price = document.createElement('p');
  price.className = 'price';
  price.textContent = money.format(book.cents / 100);
  if (book.stock === 0) {
    const out = document.createElement('span');
    out.className = 'out-of-stock';
    out.textContent = ' · agotado';
    price.append(out);
  }
  item.append(title, author, details, price);
  return item;
}

function render() {
  const criteria = readCriteria();
  const { books, genreCounts } = query(criteria);
  ui.maxPriceValue.textContent = money.format(criteria.maxPriceCents / 100);
  for (const [genre, node] of genreCountNodes) node.textContent = `(${genreCounts.get(genre)})`;
  ui.books.replaceChildren(...books.map(renderBook));
  ui.count.textContent = books.length === 0
    ? 'Ningún libro cumple estos filtros. Prueba a quitar alguno.'
    : `${books.length} ${books.length === 1 ? 'libro' : 'libros'} de ${BOOKS.length}.`;
  console.log(`📚 ${books.length} resultados · consultas reales: ${realQueries}`);
}

ui.form.addEventListener('input', render); // texto, casillas, selects y el deslizador
ui.form.addEventListener('reset', () => setTimeout(render, 0)); // tras el reset, el formulario ya tiene los valores por defecto
ui.form.addEventListener('submit', (event) => event.preventDefault());
render();
```

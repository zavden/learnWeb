---
example_description: "Un buscador de catálogo cuyos filtros se reflejan en una URL compartible: el formulario GET se convierte en query con URLSearchParams(FormData) sin los campos vacíos, y una query compartida rellena el formulario (getAll para las casillas). La búsqueda ignora tildes y mayúsculas y escapa lo escrito con RegExp.escape"
example_tags: "javascript|formularios|profesional|busqueda|urlsearchparams|formdata|getall|regex|debounce"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Catálogo · Mercado Artesano</h1>
  <form id="filters" role="search" action="/catalogo" method="get">
    <div class="field">
      <label for="q">Buscar</label>
      <input id="q" name="q" type="search" autocomplete="off">
    </div>
    <fieldset>
      <legend>Categorías</legend>
      <label><input type="checkbox" name="cat" value="barro"> Barro</label>
      <label><input type="checkbox" name="cat" value="textil"> Textil</label>
      <label><input type="checkbox" name="cat" value="madera"> Madera</label>
    </fieldset>
    <div class="row">
      <div class="field">
        <label for="max">Precio máximo</label>
        <input id="max" name="max" type="number" min="0" step="10" inputmode="numeric">
      </div>
      <div class="field">
        <label for="sort">Ordenar</label>
        <select id="sort" name="sort">
          <option value="relevance">Relevancia</option>
          <option value="price-asc">Precio: de menor a mayor</option>
          <option value="price-desc">Precio: de mayor a menor</option>
        </select>
      </div>
    </div>
    <button type="submit">Buscar</button>
  </form>
  <p class="share">URL para compartir: <output id="share-url" for="filters">/catalogo</output></p>
  <p>Enlaces que te han compartido:
    <button type="button" data-query="?q=barro&amp;sort=price-asc">Barro, de menor a mayor</button>
    <button type="button" data-query="?cat=textil&amp;cat=madera&amp;max=1000">Textil y madera hasta $1000</button>
  </p>
  <p id="count" role="status"></p>
  <ul id="results" class="results"></ul>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root {
  --ink: #1f2933;
  --muted: #52606d;
  --line: #cbd2d9;
  --field: #7b8794;
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
main {
  max-width: 36rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin: 0 0 0.75rem;
}
form {
  display: grid;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
}
.field {
  display: grid;
  gap: 0.2rem;
}
.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 0.5rem 1rem;
}
fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 0;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
}
label {
  font-weight: 600;
}
fieldset label {
  font-weight: 400;
}
input,
select,
button {
  font: inherit;
  color: var(--ink);
}
input:not([type="checkbox"]),
select {
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--field);
  border-radius: 0.375rem;
  background: var(--surface);
}
button {
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--field);
  border-radius: 0.5rem;
  background: var(--surface);
  cursor: pointer;
}
form button {
  justify-self: start;
  border-color: var(--accent);
  background: var(--accent);
  color: #ffffff;
}
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.share output {
  font-family: Menlo, Consolas, monospace;
  font-size: 0.85rem;
  overflow-wrap: anywhere;
}
.results {
  display: grid;
  gap: 0.3rem;
  padding: 0;
  list-style: none;
}
.results li {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0.7rem;
  border-radius: 0.5rem;
  background: var(--surface);
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface);
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
// Buscador con filtros que caben en una URL.
//
// Decisiones de diseño:
// - Es un formulario GET de verdad (funcionaría sin JavaScript). Con JavaScript, el
//   submit se cancela y FormData → URLSearchParams da la misma query que enviaría el
//   navegador, sin los campos vacíos, para una URL corta y compartible.
// - Al revés, una query compartida rellena el formulario: get para los campos de un
//   valor, getAll para el grupo de casillas.
// - Casillas y orden filtran al momento (change); el texto, con debounce (input).
// - Buscar ignora tildes y mayúsculas (normalize('NFD') y fuera \p{M}) y escapa lo
//   escrito con RegExp.escape: «2.ª)» o «(» no rompen nada.
// - URLSearchParams y cambiar la URL de la página (history.pushState) son del módulo
//   «Red y almacenamiento»: aquí la URL se muestra, porque la de la vista previa no es tuya.
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.
const form = document.querySelector('#filters');
const logList = document.querySelector('#log');
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
let quiet = false;
function logLine(text) {
  if (quiet) return;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

const PRODUCTS = [
  { name: 'Olla de barro negro', cat: 'barro', price: 480 },
  { name: 'Jarro de barro rojo', cat: 'barro', price: 160 },
  { name: 'Cántaro de barro negro', cat: 'barro', price: 620 },
  { name: 'Rebozo de algodón', cat: 'textil', price: 720 },
  { name: 'Huipil bordado', cat: 'textil', price: 1350 },
  { name: 'Tapete de lana', cat: 'textil', price: 1100 },
  { name: 'Alebrije de jaguar', cat: 'madera', price: 950 },
  { name: 'Cuchara de madera de pino', cat: 'madera', price: 90 },
];
const fold = (text) => text.normalize('NFD').replace(/\p{M}/gv, '').toLowerCase(); // sin tildes

function formToQuery() {
  const params = new URLSearchParams();
  for (const [key, value] of new FormData(form)) {
    if (value !== '' && !(key === 'sort' && value === 'relevance')) params.append(key, value);
  }
  return params;
}
function queryToForm(search) {
  const params = new URLSearchParams(search);
  form.elements.q.value = params.get('q') ?? '';
  form.elements.max.value = params.get('max') ?? '';
  form.elements.sort.value = params.get('sort') ?? 'relevance';
  const categories = params.getAll('cat');
  for (const box of form.querySelectorAll('[name="cat"]')) box.checked = categories.includes(box.value);
}

function search(why) {
  const params = formToQuery();
  const text = fold(params.get('q') ?? '');
  const pattern = new RegExp(RegExp.escape(text), 'v');
  const categories = params.getAll('cat');
  const max = params.has('max') ? Number(params.get('max')) : Infinity;
  const sorters = { 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price };
  const found = PRODUCTS
    .filter((product) => pattern.test(fold(product.name)))
    .filter((product) => categories.length === 0 || categories.includes(product.cat))
    .filter((product) => product.price <= max)
    .toSorted(sorters[params.get('sort')] ?? (() => 0));
  document.querySelector('#results').replaceChildren(...found.map((product) => {
    const item = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = product.name;
    const price = document.createElement('span');
    price.textContent = money.format(product.price);
    item.append(name, price);
    return item;
  }));
  const url = `/catalogo${params.size > 0 ? `?${params}` : ''}`;
  document.querySelector('#share-url').textContent = url;
  document.querySelector('#count').textContent = `${found.length} producto(s)`;
  logLine(`🔎 ${why} → ${url} · ${found.length} producto(s)`);
  return found;
}

let debounceTimer;
form.addEventListener('input', (event) => {
  if (event.target.name !== 'q' && event.target.name !== 'max') return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => search('al escribir'), 300);
});
form.addEventListener('change', (event) => {
  if (event.target.name === 'cat' || event.target.name === 'sort') search('al cambiar un filtro');
});
form.addEventListener('submit', (event) => {
  event.preventDefault(); // sin JavaScript, el navegador iría a /catalogo?q=…
  clearTimeout(debounceTimer);
  search('al enviar');
});
for (const button of document.querySelectorAll('[data-query]')) {
  button.addEventListener('click', () => {
    queryToForm(button.dataset.query);
    search(`enlace «${button.textContent}»`);
  });
}

// ── Autocomprobación (simulada; deja los filtros vacíos).
function audit() {
  quiet = true;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  expect('sin filtros, la query está vacía (los campos vacíos no viajan)', formToQuery().size === 0);
  queryToForm('?cat=textil&cat=madera&max=1000');
  expect('una query compartida marca las dos casillas y el precio', form.querySelectorAll('[name="cat"]:checked').length === 2 && form.elements.max.value === '1000');
  expect('…y vuelve a dar la misma query', String(formToQuery()) === 'cat=textil&cat=madera&max=1000');
  expect('textil y madera hasta $1000: 3 productos', search('prueba').length === 3);
  queryToForm('?q=CANTARO');
  expect('«CANTARO» encuentra «Cántaro de barro negro» (sin tildes ni mayúsculas)', search('prueba')[0]?.name === 'Cántaro de barro negro');
  queryToForm('?q=(2.ª');
  expect('lo escrito se escapa: «(2.ª» no rompe la búsqueda', search('prueba').length === 0);
  form.reset();
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
search('al cargar');
logLine('Listo: marca «Barro» y ordena de menor a mayor; escribe «negro»; luego pulsa el enlace «Textil y madera hasta $1000»');
```

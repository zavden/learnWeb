---
example_description: "Un buscador que filtra un catálogo en cada input: lo escrito se escapa con RegExp.escape (así «2.ª)» no rompe nada), se busca con los flags i y v, «Palabra completa» añade fronteras Unicode con lookbehind y lookahead, y las coincidencias se resaltan con <mark> partiendo el texto con split y un grupo, sin innerHTML"
example_tags: "javascript|formularios|integracion|regex|regexp-escape|input|lookaround|mark"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Librería El Faro · Cocina</h1>
  <form id="search" role="search" action="/buscar" method="get">
    <label for="query">Buscar en el catálogo</label>
    <input id="query" name="q" type="search" autocomplete="off">
    <label class="inline"><input type="checkbox" name="whole"> Palabra completa</label>
  </form>
  <p id="count" role="status"></p>
  <ul id="books" class="books">
    <li>El café y sus orígenes</li>
    <li>Cafés del mundo</li>
    <li>Cafetería en casa: 50 bebidas</li>
    <li>Cacao (edición 2.ª)</li>
    <li>Recetas de Oaxaca</li>
    <li>Pan, café y piloncillo</li>
  </ul>
  <ol id="log" class="log" aria-label="Registro"></ol>
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
  font-size: 1.15rem;
  margin-top: 0;
}
form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
form > label:first-child {
  flex-basis: 100%;
  font-weight: 600;
}
input[type="search"] {
  flex: 1 1 12rem;
  font: inherit;
  color: #1f2933;
  padding: 0.3rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.books {
  display: grid;
  gap: 0.3rem;
  padding: 0;
  list-style: none;
}
.books li {
  padding: 0.35rem 0.6rem;
  border-radius: 0.375rem;
  background: #ffffff;
}
.books li[hidden] {
  display: none;
}
mark {
  background: #fde68a;
  color: #1f2933;
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
// Combina: «Leer y escribir controles» (input, checked) y «Expresiones regulares»
// (RegExp.escape, flags i y v, lookbehind/lookahead, split con un grupo que captura).
const form = document.querySelector('#search');
const items = [...document.querySelectorAll('#books li')];
const titles = items.map((item) => item.textContent); // el texto original de cada libro
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function buildRegex(query, wholeWord) {
  if (query === '') return null;
  const escaped = RegExp.escape(query); // lo escrito es TEXTO, no un patrón
  // Fronteras que conocen las tildes (\b no las conoce): ni letra antes ni después.
  const source = wholeWord ? `(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])` : escaped;
  return new RegExp(`(${source})`, 'iv'); // el grupo hace que split devuelva las coincidencias
}

// Pinta el título con <mark>: split con un grupo alterna «texto, coincidencia, texto…».
function highlight(item, title, regex) {
  const parts = regex ? title.split(regex) : [title];
  item.replaceChildren(...parts.map((part, index) => {
    if (index % 2 === 0) return part; // texto normal (un string se inserta como texto)
    const mark = document.createElement('mark');
    mark.textContent = part;
    return mark;
  }));
}

function search() {
  const query = form.elements.q.value.trim();
  const regex = buildRegex(query, form.elements.whole.checked);
  let visible = 0;
  items.forEach((item, index) => {
    const matches = regex === null || regex.test(titles[index]);
    item.hidden = !matches;
    if (matches) visible += 1;
    highlight(item, titles[index], matches ? regex : null);
  });
  document.querySelector('#count').textContent = `${visible} de ${items.length} libros`;
  logLine(`🔎 '${query}'${form.elements.whole.checked ? ' (palabra completa)' : ''} → ${visible} de ${items.length}`);
}

form.addEventListener('input', search);
form.addEventListener('submit', (event) => event.preventDefault()); // Enter no recarga la página
search();
logLine('Listo: escribe «café» (prueba también «2.ª)»); luego marca «Palabra completa»');
```

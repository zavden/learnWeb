---
example_description: "Un buscador que resalta lo que escribes con <mark> sin tocar innerHTML: recorre los nodos de texto, parte cada uno en un fragmento (texto, mark, texto) y lo reemplaza; para limpiar, cambia cada mark por su texto y normalize() vuelve a unir los textos"
example_tags: "javascript|dom|integracion|mark|nodos-de-texto|documentfragment|normalize|seguridad"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="search">
  <p>
    <label for="query">Buscar en el menú</label>
    <input id="query" type="search" autocomplete="off">
  </p>
  <p id="status" role="status"></p>
  <ul id="menu">
    <li><strong>Chiles en nogada</strong>: chile poblano relleno, con nogada y granada.</li>
    <li><strong>Salsa macha</strong>: chile de árbol, ajo y cacahuate en aceite.</li>
    <li><strong>Enmoladas</strong>: tortillas bañadas en mole de <em>chile ancho</em>.</li>
    <li><strong>Pozole verde</strong>: maíz cacahuazintle, pepita y tomatillo.</li>
  </ul>
</main>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
.search {
  max-width: 36rem;
}
mark {
  padding: 0 0.1em;
  color: inherit;
  background: #fde68a;
}
```

# JavaScript

```javascript
const menu = document.querySelector('#menu');
const statusLine = document.querySelector('#status');

// Todos los nodos de texto de un elemento, en orden (recursión, lección «El
// árbol de nodos»). Se guardan en un ARRAY: una foto, no una colección viva.
function textNodesOf(root, found = []) {
  for (const child of root.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) found.push(child);
    else if (child.nodeType === Node.ELEMENT_NODE) textNodesOf(child, found);
  }
  return found;
}

function clearMarks(root) {
  for (const mark of root.querySelectorAll('mark')) mark.replaceWith(mark.textContent);
  root.normalize(); // une los textos vecinos que dejaron los <mark>
}

function highlight(root, query) {
  clearMarks(root);
  const needle = query.trim().toLowerCase();
  if (needle === '') return 0;
  let count = 0;
  for (const textNode of textNodesOf(root)) {
    const text = textNode.data;
    const lower = text.toLowerCase();
    let index = lower.indexOf(needle);
    if (index === -1) continue;
    const pieces = document.createDocumentFragment();
    let last = 0;
    while (index !== -1) {
      const mark = document.createElement('mark');
      mark.textContent = text.slice(index, index + needle.length); // texto, nunca HTML
      pieces.append(text.slice(last, index), mark);
      count += 1;
      last = index + needle.length;
      index = lower.indexOf(needle, last);
    }
    pieces.append(text.slice(last));
    textNode.replaceWith(pieces);
  }
  return count;
}

function search(query) {
  const count = highlight(menu, query);
  statusLine.textContent = query.trim() === '' ? '' : `${count} coincidencia(s) de «${query.trim()}»`;
  return count;
}

// Comprobaciones al cargar
const originalText = menu.textContent;
const firstItem = menu.querySelector('li');
const nodesBefore = firstItem.childNodes.length;

console.log("'chile' → marcas:", search('chile'));
console.log('¿el texto visible es el mismo? →', menu.textContent === originalText);
console.log('nodos en el primer plato →', nodesBefore, '→', firstItem.childNodes.length);
console.log("'<img src=x onerror=alert(1)>' → marcas:", search('<img src=x onerror=alert(1)>'), '| <img> →', menu.querySelectorAll('img').length);
console.log("'' (vacío) → marcas:", search(''));
console.log('nodos en el primer plato tras limpiar →', firstItem.childNodes.length);

const queryInput = document.querySelector('#query');
queryInput.value = 'chile';
search(queryInput.value); // se queda resaltado para que lo veas

// Escribe en el buscador (los eventos se estudian en el módulo siguiente).
queryInput.addEventListener('input', () => search(queryInput.value));
```

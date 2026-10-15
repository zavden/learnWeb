---
example_description: "Un árbol de categorías construido recursivamente desde datos anidados: <details> para las ramas (con el total de productos sumado desde las hojas), enlaces con rutas legibles para las hojas, botones para abrir o cerrar todo y una función que revela una categoría abriendo sus antepasados"
example_tags: "javascript|dom|profesional|arbol|recursion|details|closest|aria-current"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="shop">
  <h1>Categorías de la tienda</h1>
  <p class="toolbar">
    <button type="button" id="open-all">Abrir todo</button>
    <button type="button" id="close-all">Cerrar todo</button>
    <button type="button" id="reveal">Mostrar «Moka»</button>
  </p>
  <nav aria-label="Categorías">
    <ul class="tree" id="tree"></ul>
  </nav>
  <p id="breadcrumb" role="status"></p>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
.shop {
  max-width: 32rem;
  padding: 1rem;
}
h1 {
  margin-top: 0;
  font-size: 1.3rem;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
}
.tree,
.tree ul {
  margin: 0;
  padding-left: 1.25rem;
  list-style: none;
}
.tree {
  padding-left: 0;
}
.tree li {
  margin: 0.15rem 0;
}
summary {
  cursor: pointer;
  font-weight: 600;
}
.count {
  margin-left: 0.25rem;
  font-weight: normal;
  color: #475569;
}
.tree a {
  color: #1d4ed8;
}
.tree a[aria-current="page"] {
  font-weight: bold;
  color: #1e293b;
  background: #fef3c7;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// ÁRBOL DE CATEGORÍAS.
//
// Decisiones:
// - Los datos son un árbol: cada categoría tiene hijos o un número de
//   productos. Una función recursiva (lección «El árbol de nodos») construye a
//   la vez el DOM y el total de cada rama, sumado desde las hojas.
// - Las ramas son <details>/<summary>: se abren con el teclado y los lectores
//   de pantalla anuncian si están abiertas, sin una línea de JS. Las hojas son
//   enlaces con una ruta legible (slugify, como en el índice de la integración).
// - Revelar una categoría = subir con closest('details') y abrir cada antepasado.
// - Todo con createElement y textContent.
//
// Alcance: HTML, CSS (módulos 1-7), el capítulo de JavaScript y el módulo «El DOM».

const catalog = [
  { name: 'Café', children: [
    { name: 'En grano', children: [{ name: 'Chiapas', count: 3 }, { name: 'Veracruz', count: 2 }, { name: 'Oaxaca', count: 1 }] },
    { name: 'Molido', children: [{ name: 'Fino (espresso)', count: 2 }, { name: 'Medio (filtro)', count: 4 }, { name: 'Grueso (prensa)', count: 1 }] },
    { name: 'Descafeinado', count: 1 },
  ] },
  { name: 'Accesorios', children: [
    { name: 'Molinos', children: [{ name: 'Manuales', count: 2 }, { name: 'Eléctricos', count: 1 }] },
    { name: 'Cafeteras', children: [{ name: 'Prensa francesa', count: 2 }, { name: 'Goteo', count: 3 }, { name: 'Moka', count: 2 }] },
    { name: 'Tazas y jarros', count: 6 },
  ] },
  { name: 'Despensa', children: [{ name: 'Endulzantes', count: 3 }, { name: 'Especias', count: 4 }] },
];

function slugify(text) {
  let slug = '';
  let pendingDash = false;
  for (const char of text.normalize('NFD').toLowerCase()) {
    const code = char.codePointAt(0);
    if (code >= 0x300 && code <= 0x36f) continue;
    if ((char >= 'a' && char <= 'z') || (char >= '0' && char <= '9')) {
      if (pendingDash && slug !== '') slug += '-';
      slug += char;
      pendingDash = false;
    } else {
      pendingDash = true;
    }
  }
  return slug;
}

function countLabel(total) {
  const count = document.createElement('span');
  count.className = 'count';
  count.textContent = `(${total})`;
  return count;
}

// Devuelve { item, total }: el <li> de la categoría y cuántos productos tiene.
function buildCategory(category, parentPath) {
  const path = `${parentPath}/${slugify(category.name)}`;
  const item = document.createElement('li');
  if (!category.children) {
    const link = document.createElement('a');
    link.href = path;
    link.textContent = category.name;
    item.append(link, countLabel(category.count));
    return { item, total: category.count };
  }
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = category.name;
  const list = document.createElement('ul');
  let total = 0;
  for (const child of category.children) {
    const built = buildCategory(child, path); // la recursión
    list.append(built.item);
    total += built.total;
  }
  summary.append(name, countLabel(total));
  details.append(summary, list);
  item.append(details);
  return { item, total };
}

const tree = document.querySelector('#tree');
let grandTotal = 0;
for (const category of catalog) {
  const built = buildCategory(category, '/tienda');
  tree.append(built.item);
  grandTotal += built.total;
}

// ── Acciones ────────────────────────────────────────────────────────────
const allDetails = () => [...tree.querySelectorAll('details')];
const nameOf = (details) => details.querySelector(':scope > summary .name').textContent;
const breadcrumb = document.querySelector('#breadcrumb');

function setAllOpen(open) {
  for (const details of allDetails()) details.open = open;
}

// Abre los antepasados de una categoría y la marca como la actual.
function revealCategory(href) {
  const link = tree.querySelector(`a[href="${href}"]`);
  if (link === null) throw new Error(`No existe la categoría ${href}`);
  const trail = [];
  for (let details = link.closest('details'); details; details = details.parentElement.closest('details')) {
    details.open = true;
    trail.unshift(nameOf(details));
  }
  for (const other of tree.querySelectorAll('a[aria-current]')) other.removeAttribute('aria-current');
  link.setAttribute('aria-current', 'page');
  breadcrumb.textContent = `Categoría: ${[...trail, link.textContent].join(' › ')}`;
  return trail;
}

// Los botones (eventos: módulo siguiente).
document.querySelector('#open-all').addEventListener('click', () => setAllOpen(true));
document.querySelector('#close-all').addEventListener('click', () => setAllOpen(false));
document.querySelector('#reveal').addEventListener('click', () => {
  revealCategory('/tienda/accesorios/cafeteras/moka');
});

// ── Comprobaciones al cargar ────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const links = [...tree.querySelectorAll('a')];
audit('ramas (<details>)', allDetails().length, 7);
audit('categorías finales (enlaces)', links.length, 15);
audit('productos en total', grandTotal, 37);
audit('totales de primer nivel', [...tree.children].map((item) => item.querySelector('.count').textContent).join(' '), '(14) (16) (7)');
audit('niveles', Math.max(...links.map((link) => {
  let depth = 1;
  for (let details = link.closest('details'); details; details = details.parentElement.closest('details')) depth += 1;
  return depth;
})), 3);
audit('ruta de un enlace', tree.querySelector('a').getAttribute('href'), '/tienda/cafe/en-grano/chiapas');
audit("revelar «Moka» abre", revealCategory('/tienda/accesorios/cafeteras/moka').join(' › '), 'Accesorios › Cafeteras');
audit('ramas abiertas', allDetails().filter((details) => details.open).length, 2);
audit('enlace actual', tree.querySelector('[aria-current="page"]').textContent, 'Moka');
setAllOpen(false);
audit('cerrar todo', allDetails().filter((details) => details.open).length, 0);
setAllOpen(true); // para que veas el árbol entero
```

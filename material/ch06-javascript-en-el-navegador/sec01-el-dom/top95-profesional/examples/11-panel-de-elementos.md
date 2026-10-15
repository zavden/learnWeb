---
example_description: "Un panel de elementos en miniatura, como el de DevTools: dibuja recursivamente el árbol de un trozo de página (elementos, textos y comentarios, con o sin los textos en blanco), y al elegir un nodo lo resalta en la página y muestra su tipo, sus atributos, sus hijos y, en un campo, el atributo value frente a la propiedad"
example_tags: "javascript|dom|profesional|arbol|recursion|nodetype|atributos|propiedades|devtools"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="devtools">
  <h1>Panel de elementos</h1>
  <section class="sample" id="sample" aria-label="Trozo de página que se inspecciona">
    <!-- tarjeta de producto -->
    <article class="card" data-sku="CAF-CHI-500">
      <h2>Café de Chiapas</h2>
      <p class="price">$210.00</p>
      <label>Cantidad <input id="qty" type="number" min="1" value="1"></label>
    </article>
  </section>
  <p class="options">
    <input type="checkbox" id="show-blank">
    <label for="show-blank">Mostrar los textos en blanco</label>
  </p>
  <div class="panels">
    <nav class="tree" aria-label="Árbol del DOM" id="tree"></nav>
    <section class="props" aria-labelledby="props-title">
      <h2 id="props-title">Nodo elegido</h2>
      <dl id="props"></dl>
    </section>
  </div>
</main>
<div class="highlight" id="highlight" hidden></div>
```

# CSS

```css
[hidden] {
  display: none !important;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
.devtools {
  max-width: 60rem;
  padding: 1rem;
}
h1 {
  margin-top: 0;
  font-size: 1.3rem;
}
.sample {
  padding: 0.5rem;
  background: #f1f5f9;
}
.card {
  max-width: 16rem;
  padding: 0.5rem 0.75rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
}
.card h2 {
  margin: 0;
  font-size: 1rem;
}
.panels {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.tree {
  flex: 1 1 18rem;
  overflow-x: auto;
  font: 0.85rem/1.5 ui-monospace, Menlo, Consolas, monospace;
}
.tree ul {
  margin: 0;
  padding-left: 1rem;
  list-style: none;
}
.tree > ul {
  padding-left: 0;
}
.node {
  padding: 0 0.25rem;
  font: inherit;
  color: #7e22ce;
  background: none;
  border: 0;
  cursor: pointer;
  white-space: nowrap;
}
.node[aria-current="true"] {
  color: #ffffff;
  background: #1d4ed8;
}
.text {
  color: #1e293b;
}
.comment {
  color: #15803d;
}
.props {
  flex: 1 1 14rem;
}
.props h2 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}
.props dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.15rem 0.75rem;
  margin: 0;
}
.props dt {
  font-weight: bold;
}
.props dd {
  margin: 0;
  overflow-wrap: anywhere;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.highlight {
  position: absolute;
  pointer-events: none;
  background: rgb(59 130 246 / 0.25);
  outline: 2px solid #1d4ed8;
}
```

# JavaScript

```javascript
// UN PANEL DE ELEMENTOS EN MINIATURA.
//
// Decisiones:
// - buildTree() es una recursión sobre childNodes (lección «El árbol de
//   nodos»): cada elemento es un botón con su etiqueta como la escribe la
//   consola (<input id="qty" …>); los textos van entre comillas con
//   JSON.stringify (así se ven los \n); los comentarios, como <!-- … -->.
// - Los textos en blanco se ocultan por defecto, como hace DevTools; la
//   casilla los muestra.
// - Un Map relaciona cada botón con su nodo: el DOM del panel y el DOM
//   inspeccionado nunca se mezclan.
// - El panel de propiedades enseña lo que distingue atributos de propiedades
//   (lección «Atributos y propiedades»): value del atributo frente a value
//   del campo.
// - El resaltado se coloca con getBoundingClientRect + scroll.
//
// Alcance: HTML, CSS (módulos 1-7), el capítulo de JavaScript y el módulo «El DOM».

const sample = document.querySelector('#sample');
const tree = document.querySelector('#tree');
const props = document.querySelector('#props');
const highlight = document.querySelector('#highlight');
const showBlank = document.querySelector('#show-blank');
const nodeByButton = new Map();
let selectedNode = null;

const isBlankText = (node) => node.nodeType === Node.TEXT_NODE && node.data.trim() === '';

function describe(element) {
  const attributes = element.getAttributeNames().map((name) => {
    const value = element.getAttribute(name);
    return value === '' ? name : `${name}="${value}"`;
  });
  return `<${[element.localName, ...attributes].join(' ')}>`;
}

function shorten(text, max = 28) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function buildTree(node, includeBlank) {
  const item = document.createElement('li');
  if (node.nodeType === Node.ELEMENT_NODE) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'node';
    button.textContent = describe(node);
    nodeByButton.set(button, node);
    button.addEventListener('click', () => select(node)); // eventos: módulo siguiente
    item.append(button);
    const children = [...node.childNodes].filter((child) => includeBlank || !isBlankText(child));
    if (children.length > 0) {
      const list = document.createElement('ul');
      list.append(...children.map((child) => buildTree(child, includeBlank)));
      item.append(list);
    }
  } else if (node.nodeType === Node.TEXT_NODE) {
    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = shorten(JSON.stringify(node.data));
    item.append(text);
  } else if (node.nodeType === Node.COMMENT_NODE) {
    const comment = document.createElement('span');
    comment.className = 'comment';
    comment.textContent = `<!--${shorten(node.data)}-->`;
    item.append(comment);
  }
  return item;
}

function renderTree() {
  nodeByButton.clear();
  const root = document.createElement('ul');
  root.append(buildTree(sample, showBlank.checked));
  tree.replaceChildren(root);
  if (selectedNode) markSelected(selectedNode);
}

function markSelected(node) {
  for (const [button, target] of nodeByButton) {
    if (target === node) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  }
}

function property(term, value) {
  const dt = document.createElement('dt');
  dt.textContent = term;
  const dd = document.createElement('dd');
  dd.textContent = value;
  return [dt, dd];
}

function select(element) {
  selectedNode = element;
  // Lecturas
  const rect = element.getBoundingClientRect();
  const rows = [
    property('nodeName', element.nodeName),
    property('nodeType', `${element.nodeType} (elemento)`),
    property('hijos', `${element.children.length} elementos · ${element.childNodes.length} nodos`),
    property('atributos', element.getAttributeNames().join(', ') || '(ninguno)'),
    property('caja', `${Math.round(rect.width)} × ${Math.round(rect.height)} px`),
  ];
  if ('value' in element && element.localName === 'input') {
    rows.push(property('atributo value', JSON.stringify(element.getAttribute('value'))));
    rows.push(property('propiedad value', JSON.stringify(element.value)));
  }
  // Escrituras
  props.replaceChildren(...rows.flat());
  highlight.style.left = `${rect.left + window.scrollX}px`;
  highlight.style.top = `${rect.top + window.scrollY}px`;
  highlight.style.width = `${rect.width}px`;
  highlight.style.height = `${rect.height}px`;
  highlight.hidden = false;
  markSelected(element);
}

showBlank.addEventListener('change', renderTree);

// ── Comprobaciones al cargar ────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const countIn = (selector) => tree.querySelectorAll(selector).length;

renderTree();
audit('elementos · textos · comentarios', `${countIn('.node')} · ${countIn('.text')} · ${countIn('.comment')}`, '6 · 3 · 1');
showBlank.checked = true;
renderTree();
audit('con los textos en blanco', countIn('.text'), 10);
showBlank.checked = false;
renderTree();
audit('cómo se ve el campo en el árbol', [...nodeByButton.keys()].at(-1).textContent, '<input id="qty" type="number" min="1" value="1">');

const qty = document.querySelector('#qty');
qty.value = '3'; // como si alguien hubiera escrito un 3
select(qty);
const shown = Object.fromEntries([...props.querySelectorAll('dt')].map((dt) => [dt.textContent, dt.nextElementSibling.textContent]));
audit('atributo value frente a propiedad', `${shown['atributo value']} / ${shown['propiedad value']}`, '"1" / "3"');
audit('hijos del campo', shown.hijos, '0 elementos · 0 nodos');
const box = highlight.getBoundingClientRect();
const target = qty.getBoundingClientRect();
audit('el resaltado cubre el campo', ['left', 'top', 'width', 'height'].every((key) => Math.abs(box[key] - target[key]) < 0.5), true);
audit('un solo nodo marcado en el árbol', `${countIn('[aria-current]')} · ${tree.querySelector('[aria-current]').textContent.slice(0, 6)}`, '1 · <input');
select(sample.querySelector('.card'));
audit('elegir la tarjeta', props.querySelector('dd').textContent, 'ARTICLE');
```

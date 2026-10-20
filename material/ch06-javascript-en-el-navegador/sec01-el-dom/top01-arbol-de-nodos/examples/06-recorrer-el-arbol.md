---
example_description: "Una función recursiva recorre el árbol de una receta y lo dibuja con ramas ASCII, como el panel Elements: elementos, textos y comentarios. Aparece un <tbody> que no estaba en el HTML: el árbol es el que construyó el parser"
example_tags: "javascript|dom|recursion|arbol|childnodes|nodetype|tbody"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<article id="recipe">
  <h2>Sopa de lima</h2>
  <!-- receta de Yucatán -->
  <p>Para <strong>4</strong> personas.</p>
  <table>
    <tr><td>Lima</td><td>4</td></tr>
  </table>
</article>
```

# JavaScript

```javascript
const isBlankText = (node) => node.nodeType === Node.TEXT_NODE && node.data.trim() === '';

// Cómo se ve cada nodo en una línea del dibujo:
function label(node) {
  if (node.nodeType === Node.ELEMENT_NODE) return node.nodeName;
  if (node.nodeType === Node.TEXT_NODE) return JSON.stringify(node.data);
  if (node.nodeType === Node.COMMENT_NODE) return `<!--${node.data}-->`;
  return node.nodeName;
}

// Recursión: cada nodo dibuja sus hijos, y cada hijo dibuja los suyos.
// prefix lleva las ramas verticales (│) de los niveles de arriba.
function drawTree(node, prefix = '', lines = []) {
  const children = [...node.childNodes].filter((child) => !isBlankText(child));
  children.forEach((child, index) => {
    const isLast = index === children.length - 1;
    lines.push(prefix + (isLast ? '└── ' : '├── ') + label(child));
    drawTree(child, prefix + (isLast ? '    ' : '│   '), lines);
  });
  return lines;
}

const recipe = document.querySelector('#recipe');
console.log([label(recipe), ...drawTree(recipe)].join('\n'));

// Otra recursión: contar los nodos de cada tipo, también los textos en blanco.
function countNodes(node, counts = { elements: 0, texts: 0, blank: 0, comments: 0 }) {
  for (const child of node.childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) counts.elements += 1;
    else if (isBlankText(child)) counts.blank += 1;
    else if (child.nodeType === Node.TEXT_NODE) counts.texts += 1;
    else if (child.nodeType === Node.COMMENT_NODE) counts.comments += 1;
    countNodes(child, counts);
  }
  return counts;
}
console.log('nodos dentro de #recipe →', countNodes(recipe));

// Si solo te interesan los ELEMENTOS, el selector * los da todos, en orden:
console.log('elementos →', [...recipe.querySelectorAll('*')].map((el) => el.nodeName).join(' '));

// TBODY aparece aunque no lo escribiste: toda fila suelta de una tabla va a
// un <tbody> que crea el parser (lección «El parser de HTML»).
```

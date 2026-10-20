---
example_description: "Una lista de 3 platos tiene 7 childNodes: los saltos de línea y la sangría del HTML son nodos de texto. children solo cuenta los elementos"
example_tags: "javascript|dom|childnodes|children|espacios|texto|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<h2>Menú del día</h2>
<ul id="menu">
  <li>Sopa de lima</li>
  <li>Cochinita pibil</li>
  <li>Marquesitas</li>
</ul>
<p id="bug-count"></p>
<p id="fixed-count"></p>
```

# JavaScript

```javascript
const menu = document.querySelector('#menu');

// 🐛 childNodes cuenta TODOS los nodos hijos, también el texto en blanco.
console.log('🐛 childNodes.length →', menu.childNodes.length);
console.log('childNodes →', menu.childNodes);

// Cada salto de línea + sangría entre etiquetas es un nodo de texto:
for (const node of menu.childNodes) {
  const shown = node.nodeType === Node.TEXT_NODE ? JSON.stringify(node.data) : node.textContent;
  console.log(node.nodeName.padEnd(6), shown);
}

// ✅ children solo contiene los hijos que son elementos.
console.log('✅ children.length →', menu.children.length);
console.log('children →', menu.children);

// En la página: el contador con cada propiedad.
document.querySelector('#bug-count').textContent = `🐛 ${menu.childNodes.length} platos (childNodes)`;
document.querySelector('#fixed-count').textContent = `✅ ${menu.children.length} platos (children)`;

// Esos nodos de texto no se ven (el CSS colapsa los espacios al dibujar),
// pero están en el árbol. Y dependen de cómo esté sangrado el HTML: si alguien
// lo escribe en una sola línea, childNodes.length pasa a 3.
```

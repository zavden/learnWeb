---
example_description: "En el árbol no solo hay elementos: el texto y los comentarios también son nodos. nodeType dice de qué tipo es cada uno (1 elemento, 3 texto, 8 comentario, 9 documento) y nodeName cómo se llama"
example_tags: "javascript|dom|nodos|nodetype|nodename|texto|comentario"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<p id="dish">Sopa de lima <!-- receta de Yucatán --><em>(picante)</em></p>
```

# JavaScript

```javascript
const dish = document.querySelector('#dish');

// childNodes: TODOS los hijos del párrafo, sean del tipo que sean.
// (Es una lista que se recorre con for…of; la lección «Seleccionar elementos» la estudia.)
for (const node of dish.childNodes) {
  console.log(node.nodeType, node.nodeName, '→', node);
}

// Las constantes de Node evitan los números mágicos:
console.log('Node.ELEMENT_NODE →', Node.ELEMENT_NODE);
console.log('Node.TEXT_NODE →', Node.TEXT_NODE);
console.log('Node.COMMENT_NODE →', Node.COMMENT_NODE);

const text = dish.firstChild;
console.log('¿el primer hijo es texto? →', text.nodeType === Node.TEXT_NODE);
// El contenido de un nodo de texto está en data (o nodeValue):
console.log('text.data →', JSON.stringify(text.data));

// nodeName de un elemento HTML va en MAYÚSCULAS; localName, en minúsculas.
const em = dish.lastChild;
console.log('em.nodeName →', em.nodeName, '| em.localName →', em.localName);
console.log('em.nodeValue →', em.nodeValue); // los elementos no tienen valor propio

// El documento y la declaración <!DOCTYPE html> también son nodos:
console.log('document.nodeType →', document.nodeType);
console.log('doctype →', document.doctype.nodeType, document.doctype.name);
```

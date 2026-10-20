---
example_description: "Insertar template.content directamente (sin clonar) MUEVE sus nodos fuera del template: el template queda vacío y el segundo uso no dibuja nada"
example_tags: "html|template|content|clonenode|dom|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<h1>El template que se vacía</h1>

<!-- Dos plantillas idénticas, una para cada lista: así la versión ✅ empieza con la suya
     intacta y no hereda el destrozo de la versión ❌ -->
<template id="row-wrong">
  <li>Regar las tomateras</li>
</template>
<template id="row-right">
  <li>Regar las tomateras</li>
</template>

<h2>❌ Insertando <code>template.content</code> dos veces (se mueve)</h2>
<ul id="wrong"></ul>

<h2>✅ Insertando <code>content.cloneNode(true)</code> dos veces (se copia)</h2>
<ul id="right"></ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  padding: 1rem;
}

h1 {
  font-size: 1.3rem;
}

h2 {
  font-size: 1rem;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
const wrongTemplate = document.getElementById('row-wrong');
const rightTemplate = document.getElementById('row-right');
const wrong = document.getElementById('wrong');
const right = document.getElementById('right');

// 🐛 template.content es un DocumentFragment: al insertarlo, sus nodos SE MUEVEN del
// template al documento. La primera vez funciona; la segunda, el template ya está vacío.
wrong.append(wrongTemplate.content);       // 1.ª: mueve la fila; aparece una
console.log('❌ tras el 1.er append, el template tiene →', wrongTemplate.content.childElementCount, 'nodo(s)');
wrong.append(wrongTemplate.content);       // 2.ª: no queda nada que mover; no aparece nada
console.log('❌ filas en la lista →', wrong.children.length, '(esperabas 2)');

// ✅ cloneNode(true) hace una COPIA y deja el original en su sitio: se puede repetir
right.append(rightTemplate.content.cloneNode(true));
right.append(rightTemplate.content.cloneNode(true));
console.log('✅ filas en la lista →', right.children.length);
console.log('✅ el template sigue teniendo →', rightTemplate.content.childElementCount, 'nodo(s)');
```

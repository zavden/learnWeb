---
example_description: "Rellenar template.content e insertarlo directamente funciona una vez: el fragmento se vacía, y en el segundo plato querySelector devuelve null («Cannot set properties of null»). Hay que insertar una copia: template.content.cloneNode(true) o document.importNode"
example_tags: "javascript|dom|template|documentfragment|clonenode|importnode|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<!-- Dos copias de la misma plantilla: la versión con el bug vacía la suya. -->
<template id="dish-template-bug">
  <li class="dish"><span class="name"></span> · <span class="price"></span></li>
</template>
<template id="dish-template">
  <li class="dish"><span class="name"></span> · <span class="price"></span></li>
</template>

<h2>🐛 Menú insertando template.content</h2>
<ul id="bug-menu"></ul>
<h2>✅ Menú insertando una copia</h2>
<ul id="menu"></ul>
```

# JavaScript

```javascript
const dishes = [
  { name: 'Sopa de lima', price: '$95' },
  { name: 'Cochinita pibil', price: '$180' },
  { name: 'Marquesitas', price: '$60' },
];

const bugTemplate = document.querySelector('#dish-template-bug');
console.log('template.content →', bugTemplate.content);
// El contenido de un template no forma parte del documento:
console.log("document.querySelector('.dish') →", document.querySelector('.dish'));

// 🐛 Rellenar el fragmento del template e insertarlo TAL CUAL:
const bugMenu = document.querySelector('#bug-menu');
try {
  for (const dish of dishes) {
    const content = bugTemplate.content; // el fragmento mismo, no una copia
    content.querySelector('.name').textContent = dish.name;
    content.querySelector('.price').textContent = dish.price;
    bugMenu.append(content); // sus nodos se MUEVEN a la lista
    console.log('🐛 insertado →', dish.name, '| nodos que quedan en la plantilla →', bugTemplate.content.childNodes.length);
  }
} catch (error) {
  console.log('⛔', error.name, '|', error.message);
}

// ✅ Inserta siempre una COPIA del contenido; la plantilla queda intacta.
const template = document.querySelector('#dish-template');
const menu = document.querySelector('#menu');
for (const dish of dishes) {
  const copy = template.content.cloneNode(true); // o document.importNode(template.content, true)
  copy.querySelector('.name').textContent = dish.name;
  copy.querySelector('.price').textContent = dish.price;
  menu.append(copy);
}
console.log('✅ platos →', menu.querySelectorAll('.dish').length);
console.log('✅ nodos que quedan en la plantilla →', template.content.childNodes.length);
```

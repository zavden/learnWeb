---
example_description: "createElement crea un elemento suelto (isConnected false) y append, prepend, before y after lo colocan: como último o primer hijo, o como hermano antes o después. append acepta varios nodos y también strings"
example_tags: "javascript|dom|createelement|append|prepend|before|after"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main id="app">
  <h1>Lista de la compra</h1>
  <ul id="list">
    <li>Tortillas de maíz</li>
  </ul>
</main>
```

# JavaScript

```javascript
const list = document.querySelector('#list');

// 1. Crear: el elemento existe en memoria, pero todavía no en la página.
const beans = document.createElement('li');
beans.textContent = 'Frijoles negros';
console.log('creado →', beans);
console.log('¿está en la página? →', beans.isConnected);

// 2. Insertar. append lo pone como ÚLTIMO hijo:
list.append(beans);
console.log('¿y ahora? →', beans.isConnected);

// prepend, como PRIMER hijo:
const avocados = document.createElement('li');
avocados.textContent = 'Aguacates';
list.prepend(avocados);

// before y after, como HERMANOS (fuera de la lista):
const heading = document.createElement('h2');
heading.textContent = 'Para el sábado';
list.before(heading);

const note = document.createElement('p');
note.textContent = 'Recuerda las bolsas de tela.';
list.after(note);

// append acepta varios argumentos, y los strings se convierten en nodos de texto:
const cheese = document.createElement('li');
const brand = document.createElement('strong');
brand.textContent = 'Oaxaca';
cheese.append('Queso ', brand, ' (500 g)');
list.append(cheese);

console.log('lista →', [...list.children].map((item) => item.textContent));
console.log('el queso →', cheese.outerHTML);
console.log('#app →', [...document.querySelector('#app').children].map((el) => el.nodeName));
```

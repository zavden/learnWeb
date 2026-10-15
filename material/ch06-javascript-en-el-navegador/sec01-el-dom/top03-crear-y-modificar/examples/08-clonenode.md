---
example_description: "cloneNode() copia solo el elemento; cloneNode(true), también su contenido. La copia trae todos los atributos, también el id (ahora hay dos), pero no los listeners: su botón no hace nada hasta que lo conectas otra vez"
example_tags: "javascript|dom|clonenode|id|listeners|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<ul id="products">
  <li class="product" id="first-product">
    <h3>Café de Chiapas</h3>
    <button type="button" class="add">Añadir</button>
  </li>
</ul>
<p id="status" role="status">Carrito vacío</p>
```

# JavaScript

```javascript
let added = 0;
function addToCart() {
  added += 1;
  document.querySelector('#status').textContent = `🛒 ${added} producto(s)`;
}

const original = document.querySelector('#first-product');
// (los eventos se estudian en el módulo siguiente; aquí solo escuchamos el clic)
original.querySelector('.add').addEventListener('click', addToCart);

// cloneNode() sin argumento: solo el elemento y sus atributos, SIN hijos.
console.log('cloneNode() →', original.cloneNode());

// cloneNode(true): el elemento con todo lo que tiene dentro.
const copy = original.cloneNode(true);
copy.querySelector('h3').textContent = 'Café de Veracruz';
original.after(copy);

// 🐛 1. Copia TODOS los atributos, también el id: ya hay dos #first-product.
console.log('🐛 elementos con ese id →', document.querySelectorAll('#first-product').length);
console.log('🐛 getElementById da el primero →', document.getElementById('first-product').querySelector('h3').textContent);

// 🐛 2. NO copia los listeners: el botón de la copia no hace nada.
copy.querySelector('.add').click();
console.log('🐛 tras un clic en la copia →', added);
original.querySelector('.add').click();
console.log('tras un clic en el original →', added);

// ✅ Quita el id de la copia (atributos: lección siguiente) y conecta su botón.
copy.removeAttribute('id');
copy.querySelector('.add').addEventListener('click', addToCart);
copy.querySelector('.add').click();
console.log('✅ tras un clic en la copia →', added);
console.log('✅ elementos con ese id →', document.querySelectorAll('#first-product').length);

// Un atributo onclick="…" sí se copiaría (es un atributo); un listener no.
// En el módulo de eventos verás la delegación: un listener en la lista que
// sirve para todos sus botones, también los que añadas después.
```

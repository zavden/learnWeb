---
example_description: "Un singleton (una única instancia global) mezcla el estado de partes que deberían ser independientes, como dos pruebas; crear la instancia una vez y pasarla como parámetro lo evita"
example_tags: "javascript|python|patrones|singleton|estado-global|inyeccion-de-dependencias|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 Singleton: la clase garantiza que solo exista UNA instancia.
class CartStore {
  static #instance = null;
  static get instance() {
    CartStore.#instance ??= new CartStore();
    return CartStore.#instance;
  }
  items = [];
  add(item) {
    this.items.push(item);
  }
}

// Dos funciones de la app que lo usan «por su cuenta»:
function addToCart(item) {
  CartStore.instance.add(item); // dependencia escondida: no aparece en los parámetros
}
function cartSize() {
  return CartStore.instance.items.length;
}

// Dos pruebas que deberían ser independientes:
function testAddOne() {
  addToCart('Taza de talavera');
  return cartSize() === 1;
}
function testStartsEmpty() {
  return cartSize() === 0; // 🐛 depende de lo que hicieron las pruebas anteriores
}
console.log('🐛 testAddOne →', testAddOne() ? '✓' : '✗');
console.log('🐛 testStartsEmpty →', testStartsEmpty() ? '✓' : '✗', '(el carrito de la prueba anterior sigue ahí)');
// Y no hay forma limpia de tener DOS carritos (por ejemplo, el de una lista de
// deseos), ni de reiniciarlo, ni de sustituirlo por uno de prueba.

// ✅ Una clase normal. La app crea UNA instancia al arrancar y la PASA a quien
// la necesita (inyección de dependencias): sigue habiendo un solo carrito en la app.
class Cart {
  items = [];
  add(item) {
    this.items.push(item);
  }
}
function addTo(cart, item) {
  cart.add(item); // la dependencia está a la vista
}
function sizeOf(cart) {
  return cart.items.length;
}

function testAddOneFixed() {
  const cart = new Cart();
  addTo(cart, 'Taza de talavera');
  return sizeOf(cart) === 1;
}
function testStartsEmptyFixed() {
  return sizeOf(new Cart()) === 0;
}
console.log('✅ testAddOne →', testAddOneFixed() ? '✓' : '✗');
console.log('✅ testStartsEmpty →', testStartsEmptyFixed() ? '✓' : '✗');

// En JavaScript, un objeto creado una vez en un módulo YA es único (módulo
// «Módulos y organización»): no hace falta la maquinaria de static instance.
// > Desde Python: el mismo consejo; un módulo de Python ya es un singleton.
```

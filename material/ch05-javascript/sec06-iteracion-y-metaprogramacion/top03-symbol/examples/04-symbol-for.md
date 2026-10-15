---
example_description: "Symbol('x') !== Symbol('x'): dos partes del código que crean «el mismo» símbolo por separado no se encuentran; Symbol.for usa un registro global y Symbol.keyFor devuelve su nombre"
example_tags: "javascript|symbol|symbol-for|registro|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Dos partes independientes de una tienda (piensa en dos scripts o dos
// librerías) acuerdan guardar el precio original de un producto rebajado
// en una clave symbol con la descripción 'tienda.precioOriginal'.

// 🐛 Cada parte crea su símbolo con Symbol(): son dos valores distintos.
function applyDiscount(product, percent) { // parte 1: el módulo de rebajas
  const ORIGINAL = Symbol('tienda.precioOriginal');
  product[ORIGINAL] = product.cents;
  product.cents = Math.round(product.cents * (1 - percent / 100));
}
function originalPrice(product) {          // parte 2: la ficha del producto
  const ORIGINAL = Symbol('tienda.precioOriginal');
  return product[ORIGINAL] ?? product.cents;
}

const mole = { name: 'Mole poblano', cents: 16000 };
applyDiscount(mole, 25);
console.log('🐛 precio original →', originalPrice(mole)); // 12000: no lo encuentra
console.log('🐛 ¿iguales? →', Symbol('tienda.precioOriginal') === Symbol('tienda.precioOriginal'));
console.log('🐛 claves symbol →', Object.getOwnPropertySymbols(mole)); // existe, pero inalcanzable

// ✅ Symbol.for(clave) busca en un REGISTRO GLOBAL: la primera llamada crea el
//    símbolo y las siguientes, desde cualquier parte del código, devuelven el mismo.
function applyDiscountShared(product, percent) {
  const ORIGINAL = Symbol.for('tienda.precioOriginal');
  product[ORIGINAL] = product.cents;
  product.cents = Math.round(product.cents * (1 - percent / 100));
}
function originalPriceShared(product) {
  const ORIGINAL = Symbol.for('tienda.precioOriginal');
  return product[ORIGINAL] ?? product.cents;
}

const tamales = { name: 'Tamales oaxaqueños', cents: 9000 };
applyDiscountShared(tamales, 25);
console.log('✅ precio original →', originalPriceShared(tamales), '| rebajado →', tamales.cents);
console.log('✅ ¿iguales? →', Symbol.for('tienda.precioOriginal') === Symbol.for('tienda.precioOriginal'));

// Symbol.keyFor(símbolo) devuelve la clave del registro… si está registrado.
console.log('keyFor(registrado) →', Symbol.keyFor(Symbol.for('tienda.precioOriginal')));
console.log('keyFor(local) →', Symbol.keyFor(Symbol('tienda.precioOriginal')));
console.log('keyFor(Symbol.iterator) →', Symbol.keyFor(Symbol.iterator)); // los bien conocidos no están

// La desventaja: el registro es UN espacio de nombres compartido por toda la
// página. Usa claves con prefijo ('tienda.…') para no chocar con nadie.
```

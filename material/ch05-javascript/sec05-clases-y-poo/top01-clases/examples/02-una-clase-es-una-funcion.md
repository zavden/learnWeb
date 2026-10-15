---
example_description: "class crea exactamente lo que escribías a mano: una función constructora, un prototype con los métodos y objetos enlazados a él; la diferencia visible es que los métodos no son enumerables"
example_tags: "javascript|clases|prototipos|prototype|azucar-sintactico|enumerable"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// El MISMO tipo escrito de dos formas.
class Product {
  constructor(title, cents) {
    this.title = title;
    this.cents = cents;
  }
  describe() {
    return `${this.title}: ${(this.cents / 100).toFixed(2)} €`;
  }
}

// …y como en el módulo «Objetos y prototipos»:
function OldProduct(title, cents) {
  this.title = title;
  this.cents = cents;
}
OldProduct.prototype.describe = function () {
  return `${this.title}: ${(this.cents / 100).toFixed(2)} €`;
};

// 1. Una clase ES una función: la constructora.
console.log('typeof Product →', typeof Product); // 'function'
// 2. Los métodos viven en Product.prototype, que tiene su constructor.
console.log('¿describe es propia de Product.prototype? →', Object.hasOwn(Product.prototype, 'describe'));
console.log('Product.prototype.constructor === Product →', Product.prototype.constructor === Product);
console.log('Product.prototype →', Product.prototype); // {constructor: class Product, describe: ƒ}

// 3. new enlaza cada objeto con Product.prototype: la cadena de siempre.
const lamp = new Product('Lámpara de mesa', 2400);
const oldLamp = new OldProduct('Lámpara de mesa', 2400);
console.log('¿lamp → Product.prototype? →', Object.getPrototypeOf(lamp) === Product.prototype);
console.log('propias →', Object.keys(lamp), Object.keys(oldLamp)); // las mismas
console.log('¿un solo describe? →', lamp.describe === new Product('Taza', 850).describe);

// La diferencia visible: class define los métodos NO enumerables, como los nativos.
console.log('descriptor de describe →', Object.getOwnPropertyDescriptor(Product.prototype, 'describe'));
const classKeys = [];
for (const key in lamp) classKeys.push(key);
const oldKeys = [];
for (const key in oldLamp) oldKeys.push(key);
console.log('for…in con class →', classKeys);      // solo los datos
console.log('for…in con la función →', oldKeys);   // ¡también describe!
// (En el módulo anterior hacía falta un helper con defineProperty para esto.)
```

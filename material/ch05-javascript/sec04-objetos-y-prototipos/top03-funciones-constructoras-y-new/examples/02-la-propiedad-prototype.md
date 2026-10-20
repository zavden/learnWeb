---
example_description: "Toda función normal nace con una propiedad prototype, un objeto con constructor; ahí se guardan los métodos compartidos. Flechas y métodos abreviados no la tienen"
example_tags: "javascript|prototipos|prototype|constructor|funciones"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
function Product(title, cents) {
  this.title = title;
  this.cents = cents;
}

// Toda función escrita con function nace con una propiedad llamada prototype:
// un objeto casi vacío cuya única propiedad, constructor, apunta a la función.
console.log('Product.prototype →', Product.prototype); // {constructor: ƒ}
console.log('¿constructor es Product? →', Product.prototype.constructor === Product); // true
console.log('descriptor →', Object.getOwnPropertyDescriptor(Product.prototype, 'constructor'));
// enumerable: false → no aparece en for…in ni en Object.keys

// Ese objeto es el sitio donde se guardan los métodos compartidos:
Product.prototype.describe = function () {
  return `${this.title}: ${(this.cents / 100).toFixed(2)} €`;
};
console.log('con describe →', Product.prototype); // {constructor: ƒ, describe: ƒ}

//   Product ── .prototype ──► { constructor, describe }
//      ▲                            │
//      └──────── .constructor ──────┘
//   Dos objetos distintos que se apuntan entre sí.

// Las flechas y los métodos abreviados NO tienen prototype: no pueden usarse con new.
const toLabel = (title) => title.toUpperCase();
const helpers = {
  format(title) {
    return `«${title}»`;
  },
};
console.log('toLabel.prototype →', toLabel.prototype);               // undefined
console.log('helpers.format.prototype →', helpers.format.prototype); // undefined
try {
  new helpers.format('Lámpara');
} catch (error) {
  console.log('new con un método →', error.name, '|', error.message);
}

// ⚠️ prototype es una propiedad normal de la función: el nombre engaña.
// NO es el [[Prototype]] de Product (lo verás en el ejemplo 06).
```

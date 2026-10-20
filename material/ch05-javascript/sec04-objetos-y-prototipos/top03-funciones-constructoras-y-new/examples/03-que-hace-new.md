---
example_description: "new Product(…) crea un objeto enlazado a Product.prototype, ejecuta Product con this apuntando a él y lo devuelve; los datos quedan propios y los métodos compartidos"
example_tags: "javascript|python|prototipos|new|constructor|this"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
function Product(title, cents) {
  // Cuando se llama con new, this YA es un objeto nuevo enlazado a Product.prototype:
  console.log('  dentro de Product: ¿this hereda de Product.prototype? →',
    Object.getPrototypeOf(this) === Product.prototype);
  this.title = title; // datos: propios de cada objeto
  this.cents = cents;
  // sin return: new devuelve this
}

// Métodos: una sola vez, en Product.prototype.
Product.prototype.describe = function () {
  return `${this.title}: ${(this.cents / 100).toFixed(2)} €`;
};
Product.prototype.applyDiscount = function (percent) {
  this.cents = Math.round(this.cents * (1 - percent / 100));
  return this;
};

const lamp = new Product('Lámpara de mesa', 2400);
const mug = new Product('Taza de cerámica', 850);

// La consola usa el nombre de la constructora: Product {title: …, cents: …}
console.log('lamp →', lamp);
// 👉 En la consola, expande lamp:
//    title, cents → propias
//    [[Prototype]]: Product.prototype → describe, applyDiscount, constructor
//      [[Prototype]]: Object.prototype → toString, hasOwnProperty…

console.log('propias de lamp →', Object.keys(lamp)); // ['title', 'cents']
console.log('¿mismo describe? →', lamp.describe === mug.describe); // true
console.log(lamp.applyDiscount(10).describe()); // 'Lámpara de mesa: 21.60 €'
console.log(mug.describe());                     // 'Taza de cerámica: 8.50 €'

// Los cuatro pasos de new Product('Lámpara de mesa', 2400):
//   1. crea un objeto vacío
//   2. le pone como [[Prototype]] el objeto Product.prototype
//   3. llama a Product con this = ese objeto (y los argumentos)
//   4. devuelve el objeto (salvo que Product devuelva otro objeto)

// > Desde Python: Product('Lámpara', 2400) con una clase hace __new__ (pasos 1-2)
//   y __init__(self, …) (paso 3). Los métodos viven en la clase; aquí, en
//   Product.prototype, un objeto aparte de la función.
```

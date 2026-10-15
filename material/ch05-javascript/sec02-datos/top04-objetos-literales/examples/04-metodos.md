---
example_description: "Métodos en objetos literales: funciones como propiedades y this como el self implícito de Python"
example_tags: "javascript|python|objetos|metodos|this"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Un método es una propiedad cuyo valor es una función.
// La sintaxis abreviada es nombre() { … }, sin la palabra function.
const cart = {
  items: [],
  addItem(name, priceCents) {
    // this es el objeto que hay a la IZQUIERDA del punto en la llamada:
    // en cart.addItem(…), this es cart. Es el self de Python, pero implícito
    // (no se declara como parámetro).
    this.items.push({ name, priceCents });
    return this.items.length;
  },
  totalCents() {
    return this.items.reduce((total, item) => total + item.priceCents, 0);
  },
  describe() {
    return `${this.items.length} productos, ${(this.totalCents() / 100).toFixed(2)} €`;
  },
};

console.log('addItem →', cart.addItem('Libro', 1890)); // 1
console.log('addItem →', cart.addItem('Lámpara', 2450)); // 2
console.log('totalCents() →', cart.totalCents());       // 4340
console.log('describe() →', cart.describe());           // '2 productos, 43.40 €'

// Los métodos son propiedades normales: aparecen al recorrer o mostrar el objeto.
console.log('claves →', Object.keys(cart)); // ['items', 'addItem', 'totalCents', 'describe']

// Sin los paréntesis obtienes la función, no su resultado.
console.log('typeof cart.describe →', typeof cart.describe); // 'function'

// En Python escribirías una clase con def describe(self). Un objeto literal es
// más ligero: un único objeto con sus datos y sus métodos, sin clase.
// this tiene trampas (perderlo al pasar el método como callback): las verás en el
// módulo «Funciones y ámbito», y las clases en «Clases y POO».
```

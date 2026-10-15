---
example_description: "Una clase con constructor y métodos: new crea los objetos, this es la instancia y los métodos se comparten; comparación con __init__ y self de Python"
example_tags: "javascript|python|clases|constructor|metodos|new"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Una clase reúne en un solo bloque las dos piezas del módulo anterior:
// la función constructora (los datos) y los métodos de su prototype.
class Product {
  // constructor: el __init__ de Python. Se ejecuta con new, y this es el objeto nuevo.
  constructor(title, cents) {
    this.title = title; // sin self: this no se declara como parámetro
    this.cents = cents;
  }

  // Métodos: sin la palabra function y SIN comas entre ellos (no es un objeto literal).
  describe() {
    return `${this.title}: ${(this.cents / 100).toFixed(2)} €`;
  }

  applyDiscount(percent) {
    this.cents = Math.round(this.cents * (1 - percent / 100));
    return this; // devolver this permite encadenar llamadas
  }

  isCheaperThan(other) {
    return this.cents < other.cents; // otro objeto del mismo tipo: other.cents
  }
}

const lamp = new Product('Lámpara de mesa', 2400);
const mug = new Product('Taza de cerámica', 850);

console.log('lamp →', lamp); // Product {title: 'Lámpara de mesa', cents: 2400}
console.log(lamp.describe());
console.log(lamp.applyDiscount(10).describe()); // encadenado: 21.60 €
console.log(mug.describe());
console.log('¿la taza es más barata? →', mug.isCheaperThan(lamp));
console.log('instanceof →', lamp instanceof Product);
// 👉 Expande lamp en la consola: title y cents son propias; describe,
//    applyDiscount e isCheaperThan están en [[Prototype]], igual que con las
//    funciones constructoras del módulo anterior.

// > Desde Python:
//   class Product:
//       def __init__(self, title, cents):
//           self.title = title
//           self.cents = cents
//       def describe(self):
//           return f"{self.title}: {self.cents / 100:.2f} €"
//   Cambia: constructor en vez de __init__, this implícito en vez de self (no se
//   declara), new obligatorio y métodos sin def ni function.
```

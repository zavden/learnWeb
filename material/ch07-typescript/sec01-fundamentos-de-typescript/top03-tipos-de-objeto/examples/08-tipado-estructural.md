---
example_description: "Tipado estructural: una función que pide { price: number } acepta cualquier valor con esa propiedad (un objeto literal, una instancia de clase, un objeto con más propiedades), sin declarar nada; es el Protocol de Python, no sus clases nominales"
example_tags: "typescript|python|tipado-estructural|protocol|clases|duck-typing"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
// Lo único que necesita totalOf de cada elemento: una propiedad price numérica.
type Priced = { price: number };

function totalOf(items: Priced[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Una clase que NO menciona Priced en ningún sitio…
class Book {
  title: string;
  price: number;
  constructor(title: string, price: number) {
    this.title = title;
    this.price = price;
  }
}

// …un objeto con más propiedades de las necesarias…
const coffee = { name: 'Café de Chiapas', price: 210, origin: 'Chiapas' };

// …y todos encajan, porque TypeScript compara FORMAS, no nombres.
const cart = [new Book('Pedro Páramo', 189), coffee, { price: 35 }];
console.log('total →', totalOf(cart));

// La comprobación es la de siempre: si falta price (o no es number), error.
const souvenir = { name: 'Alebrije', cost: 450 }; // cost, no price
console.log('¿tiene price? →', 'price' in souvenir);

// > Desde Python: en Python las clases son NOMINALES (una función que pide
//   Book solo acepta Book y sus subclases). TypeScript funciona como un
//   Protocol de typing: basta con tener los atributos, «duck typing» comprobado.
```

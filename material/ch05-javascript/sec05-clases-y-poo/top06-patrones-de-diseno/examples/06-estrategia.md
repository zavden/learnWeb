---
example_description: "El patrón estrategia: el cálculo del envío es una pieza intercambiable (una función o un objeto con calculate) que el checkout recibe y puede cambiar, en lugar de un if por cada caso"
example_tags: "javascript|python|patrones|estrategia|funciones|composicion"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Cada estrategia de envío: una función (subtotal, peso) → centavos.
// En JavaScript las funciones son valores, así que una estrategia puede ser solo eso.
const shippingStrategies = new Map([
  ['estándar', (order) => (order.subtotalCents >= 99900 ? 0 : 14900)], // gratis desde $999
  ['exprés', (order) => 24900 + Math.ceil(order.weightKg) * 2000],
  ['recoger en tienda', () => 0],
]);

// Una estrategia más compleja puede ser un objeto con estado y un método calculate.
class ZoneShipping {
  #rates;
  constructor(rates) {
    this.#rates = rates; // tarifa por código postal (dos primeros dígitos)
  }
  calculate(order) {
    return this.#rates[order.postalCode.slice(0, 2)] ?? 29900;
  }
}
const byZone = new ZoneShipping({ '72': 9900, '97': 19900 }); // Puebla, Mérida
shippingStrategies.set('por zona', (order) => byZone.calculate(order));

// El checkout no sabe cómo se calcula: recibe la estrategia.
class Checkout {
  constructor(order, shipping) {
    this.order = order;
    this.shipping = shipping; // intercambiable en cualquier momento
  }
  total() {
    return this.order.subtotalCents + this.shipping(this.order);
  }
}

const order = { subtotalCents: 84500, weightKg: 2.3, postalCode: '72000' };
const money = (cents) => `$${(cents / 100).toFixed(2)}`;

const checkout = new Checkout(order, shippingStrategies.get('estándar'));
for (const [name, strategy] of shippingStrategies) {
  checkout.shipping = strategy; // la usuaria cambia la opción de envío
  console.log(`${name.padEnd(18)} → envío ${money(strategy(order)).padStart(8)} · total ${money(checkout.total())}`);
}

// Añadir una opción = añadir una entrada al Map. Checkout no cambia.
// Sin el patrón, total() tendría un if/else por cada opción de envío.

// > Desde Python: igual; las funciones también son objetos y se pasan como
//   estrategia (key= de sorted es una estrategia de comparación).
```

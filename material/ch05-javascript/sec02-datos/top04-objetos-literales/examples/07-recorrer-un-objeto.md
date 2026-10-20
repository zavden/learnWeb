---
example_description: "Object.keys, values y entries (keys, values, items de Python) y Object.fromEntries para transformar objetos"
example_tags: "javascript|python|objetos|object-entries|fromentries"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Precios de una carta de cafetería (en euros).
const prices = { espresso: 1.4, cortado: 1.6, cappuccino: 2.2, tea: 1.8 };

// Los tres métodos devuelven ARRAYS (en Python, vistas: d.keys(), d.values(), d.items()).
console.log('keys →', Object.keys(prices));     // ['espresso', 'cortado', 'cappuccino', 'tea']
console.log('values →', Object.values(prices)); // [1.4, 1.6, 2.2, 1.8]
console.log('entries →', Object.entries(prices)); // [['espresso', 1.4], …]

// for (const [k, v] of Object.entries(d)) es el «for k, v in d.items()» de Python.
for (const [drink, price] of Object.entries(prices)) {
  console.log(`${drink.padEnd(10, '.')} ${price.toFixed(2)} €`);
}

// Como son arrays, se combinan con los métodos de array:
const total = Object.values(prices).reduce((sum, price) => sum + price, 0);
console.log('precio medio →', (total / Object.keys(prices).length).toFixed(2)); // 1.75

// Object.fromEntries hace lo contrario: de pares [clave, valor] a objeto.
// entries → map → fromEntries es la «comprensión de diccionario» de JavaScript:
// {drink: round(price * 1.1, 2) for drink, price in prices.items()}
const newPrices = Object.fromEntries(
  Object.entries(prices).map(([drink, price]) => [drink, Math.round(price * 110) / 100]),
);
console.log('subida del 10 % →', newPrices);

// Y para filtrar claves: entries → filter → fromEntries.
const cheap = Object.fromEntries(Object.entries(prices).filter(([, price]) => price < 2));
console.log('menos de 2 € →', cheap);

// ¿Objeto vacío? Todos los objetos son truthy: cuenta sus claves.
const emptyOrder = {};
console.log('¿vacío? →', Object.keys(emptyOrder).length === 0); // true (Python: not d)
```

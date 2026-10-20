---
example_description: "Las claves que parecen enteros se ordenan primero y de menor a mayor: los códigos postales y los años no respetan el orden de inserción"
example_tags: "javascript|python|objetos|orden|claves|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Las claves de texto conservan el orden de inserción, como en un dict de Python…
const steps = { cart: 1, shipping: 2, payment: 3 };
console.log('steps →', Object.keys(steps)); // ['cart', 'shipping', 'payment']

// 🐛 …pero las claves que parecen ÍNDICES de array (enteros sin signo y sin ceros
// a la izquierda) van SIEMPRE primero, ordenadas de menor a mayor.
const salesByYear = {};
salesByYear[2026] = 18400;
salesByYear[2024] = 12100;
salesByYear[2025] = 15900;
console.log('años →', Object.keys(salesByYear)); // ['2024', '2025', '2026'] (no el orden de inserción)

// El caso que más despista: códigos postales en el orden en que se eligieron.
const shipping = { '28013': 'Madrid', '08001': 'Barcelona', '41001': 'Sevilla' };
console.log('🐛 códigos →', Object.keys(shipping)); // ['28013', '41001', '08001']
// '28013' y '41001' parecen enteros y se ordenan delante; '08001' empieza por 0,
// no cuenta como índice y se queda detrás, en su orden de inserción.

// Mezcla de los dos tipos de clave: primero los «enteros», luego el resto.
const mixed = { b: 'b', 2: 'dos', a: 'a', 1: 'uno' };
console.log('mixed →', Object.keys(mixed)); // ['1', '2', 'b', 'a']

// En Python 3.7+, un dict conserva el orden de inserción de TODAS las claves.

// ✅ Si el orden importa, usa un Map (respeta siempre la inserción)…
const shippingMap = new Map([['28013', 'Madrid'], ['08001', 'Barcelona'], ['41001', 'Sevilla']]);
console.log('✅ Map →', [...shippingMap.keys()]); // ['28013', '08001', '41001']
// …o un array de objetos, que además deja claro que el orden es parte del dato.
const destinations = [
  { zip: '28013', city: 'Madrid' },
  { zip: '08001', city: 'Barcelona' },
  { zip: '41001', city: 'Sevilla' },
];
console.log('✅ array →', destinations.map((d) => d.zip)); // ['28013', '08001', '41001']
```

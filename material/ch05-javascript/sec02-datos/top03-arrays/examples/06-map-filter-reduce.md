---
example_description: "map, filter y reduce como listas por comprensión y functools.reduce; reduce sin valor inicial y map(parseInt)"
example_tags: "javascript|python|arrays|map|filter|reduce|bug"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Las funciones flecha se estudian en el módulo 3; aquí basta con leer
// (p) => p.name como lambda p: p.name.
const products = [
  { name: 'Teclado', price: 45, stock: 3 },
  { name: 'Ratón', price: 20, stock: 0 },
  { name: 'Monitor', price: 180, stock: 5 },
  { name: 'Webcam', price: 60, stock: 2 },
];

// map: transforma cada elemento → array nuevo del MISMO tamaño.
const names = products.map((p) => p.name);
console.log('map →', names); // [p['name'] for p in products]

// filter: se queda con los que cumplen la condición.
const available = products.filter((p) => p.stock > 0);
console.log('filter →', available.length, 'con stock'); // [p for p in products if p['stock'] > 0]

// reduce: combina todos los elementos en UN valor con un acumulador.
const stockValue = products.reduce((total, p) => total + p.price * p.stock, 0);
console.log('reduce →', stockValue, '€ en almacén'); // sum(p['price'] * p['stock'] for p in products)

// Se encadenan, porque cada uno devuelve un array nuevo:
const cheapNames = products.filter((p) => p.price < 100).map((p) => p.name.toUpperCase());
console.log('encadenado →', cheapNames); // ['TECLADO', 'RATÓN', 'WEBCAM']

// forEach recorre sin devolver nada: es un for…of con el índice incluido.
products.forEach((p, index) => console.log(`${index + 1}. ${p.name}`));

// 🐛 reduce sin valor inicial lanza un error con un array vacío: pon SIEMPRE el inicial.
try {
  [].reduce((total, n) => total + n);
} catch (error) {
  console.log('[].reduce sin inicial →', error.name, '|', error.message);
}
console.log('[].reduce con 0 →', [].reduce((total, n) => total + n, 0)); // 0

// 🐛 map llama a la función con TRES argumentos: (elemento, índice, array).
// parseInt usa el segundo como base: parseInt('2', 1) y parseInt('3', 2) dan NaN.
console.log("['1', '2', '3'].map(parseInt) →", ['1', '2', '3'].map(parseInt)); // [1, NaN, NaN]
console.log('✅ map(Number) →', ['1', '2', '3'].map(Number));                   // [1, 2, 3]
```

---
example_description: "sort() sin comparador ordena como texto: [10, 9, 1, 100] queda [1, 10, 100, 9]. La función (a, b) => a - b lo arregla"
example_tags: "javascript|python|arrays|sort|comparador|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 sort() sin argumentos convierte cada elemento a STRING y compara texto.
const scores = [10, 9, 1, 100, 25];
console.log('toSorted() →', scores.toSorted()); // [1, 10, 100, 25, 9]
// '100' va antes que '25' y que '9' porque se compara carácter a carácter: '1' < '2' < '9'.
// En Python, sorted([10, 9, 1, 100, 25]) da [1, 9, 10, 25, 100]: compara números.

// ✅ Pasa una función de comparación (a, b) que devuelva un número:
//   negativo → a va antes | 0 → empate | positivo → b va antes.
// Las funciones flecha se estudian en el módulo 3; aquí basta con leer
// (a, b) => a - b como lambda a, b: a - b.
console.log('ascendente →', scores.toSorted((a, b) => a - b));  // [1, 9, 10, 25, 100]
console.log('descendente →', scores.toSorted((a, b) => b - a)); // [100, 25, 10, 9, 1]

// Ordenar objetos por una propiedad (el key= de Python):
const products = [
  { name: 'Monitor', price: 180 },
  { name: 'Ratón', price: 20 },
  { name: 'Teclado', price: 45 },
  { name: 'Altavoz', price: 45 },
];
console.table(products.toSorted((a, b) => a.price - b.price));
// El orden es ESTABLE: Teclado y Altavoz empatan y conservan su orden original.

// Para texto, la resta no sirve: usa localeCompare (lección «Strings»).
console.table(products.toSorted((a, b) => a.name.localeCompare(b.name, 'es')));

// Varios criterios: si el primero empata (0), el || pasa al segundo.
const byPriceThenName = products.toSorted((a, b) => a.price - b.price || a.name.localeCompare(b.name, 'es'));
console.table(byPriceThenName); // Altavoz antes que Teclado

// 🐛 Extra: undefined siempre va al final, y null se ordena como el texto 'null'.
console.log('[3, undefined, 1, null].sort() →', [3, undefined, 1, null].sort()); // [1, 3, null, undefined]
```

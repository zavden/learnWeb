---
example_description: "flat aplana arrays anidados; flatMap transforma y aplana a la vez (y puede filtrar devolviendo [])"
example_tags: "javascript|python|arrays|flat|flatmap"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// flat aplana UN nivel de anidamiento, o los que le pidas.
const nested = [['lun', 'mar'], ['mié', ['jue', ['vie']]]];
console.log('flat() →', nested.flat());                 // ['lun', 'mar', 'mié', ['jue', ['vie']]]
console.log('flat(2) →', nested.flat(2));               // ['lun', 'mar', 'mié', 'jue', ['vie']]
console.log('flat(Infinity) →', nested.flat(Infinity)); // todos los niveles
// Python no tiene flat: [x for sub in lista for x in sub] o itertools.chain.

// flatMap = map + flat(1): cada elemento puede producir 0, 1 o varios.
const sentences = ['hola mundo', 'adiós'];
console.log('map →', sentences.map((s) => s.split(' ')));         // [['hola', 'mundo'], ['adiós']]
console.log('flatMap →', sentences.flatMap((s) => s.split(' '))); // ['hola', 'mundo', 'adiós']

// Caso real: todas las líneas de varios pedidos en una sola lista.
const orders = [
  { id: 'A1', items: ['café', 'tostada'] },
  { id: 'A2', items: [] },
  { id: 'A3', items: ['zumo'] },
];
console.log('todos los productos →', orders.flatMap((order) => order.items)); // ['café', 'tostada', 'zumo']

// Devolver [] «borra» el elemento: flatMap filtra y transforma en una pasada.
const summaries = orders.flatMap((order) =>
  order.items.length > 0 ? [`${order.id}: ${order.items.join(', ')}`] : [],
);
console.log('pedidos con productos →', summaries); // ['A1: café, tostada', 'A3: zumo']
```

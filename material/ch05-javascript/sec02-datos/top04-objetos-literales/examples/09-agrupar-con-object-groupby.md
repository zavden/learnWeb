---
example_description: "Agrupar un array de objetos por una propiedad con Object.groupBy y resumir cada grupo con Object.entries"
example_tags: "javascript|python|objetos|groupby|object-entries"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// Gastos de un viaje, como llegarían de una hoja de cálculo.
const expenses = [
  { concept: 'Tren Madrid-Lisboa', category: 'transporte', cents: 6450 },
  { concept: 'Hotel (3 noches)', category: 'alojamiento', cents: 31200 },
  { concept: 'Cena en Alfama', category: 'comida', cents: 4800 },
  { concept: 'Tranvía 28', category: 'transporte', cents: 300 },
  { concept: 'Pastéis de Belém', category: 'comida', cents: 750 },
];

// Object.groupBy(array, función) devuelve un objeto: clave → array de elementos.
// La función decide la clave de cada elemento (aquí, su categoría).
const byCategory = Object.groupBy(expenses, (expense) => expense.category);
console.log('byCategory →', byCategory);
// { transporte: [2 gastos], alojamiento: [1], comida: [2] }

// Python: itertools.groupby solo agrupa elementos CONSECUTIVOS (hay que ordenar
// antes); lo habitual es un defaultdict(list). Object.groupBy no necesita orden.

// Resumir cada grupo: entries → map → fromEntries (lección anterior).
const totals = Object.fromEntries(
  Object.entries(byCategory).map(([category, items]) => [
    category,
    items.reduce((sum, item) => sum + item.cents, 0) / 100,
  ]),
);
console.log('totales (€) →', totals); // { transporte: 67.5, alojamiento: 312, comida: 55.5 }

// El objeto que devuelve no hereda de Object.prototype («null prototype»):
// no tiene toString ni ninguna otra clave heredada que pueda chocar con una categoría.
console.log('prototipo →', Object.getPrototypeOf(byCategory)); // null

// Si la clave no es texto (un objeto, una fecha), Map.groupBy devuelve un Map
// (lección «Map, Set y WeakMap»).
```

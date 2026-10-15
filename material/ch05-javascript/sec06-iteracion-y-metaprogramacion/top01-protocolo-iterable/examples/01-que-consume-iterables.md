---
example_description: "Arrays, strings, Map y Set son iterables, y muchas partes del lenguaje consumen iterables: for…of, el spread, la desestructuración, Array.from y los constructores de Map y Set"
example_tags: "javascript|python|iterables|for-of|spread|desestructuracion"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Cuatro iterables nativos. Lo que los hace iterables es un método con la clave
// Symbol.iterator (también lo tienen arguments, los arrays tipados y las listas
// del DOM del capítulo 6). Un objeto literal no lo tiene.
const cities = ['Oaxaca', 'Puebla', 'Mérida'];
const word = 'olé👍';
const stock = new Map([['café', 12], ['pan', 0]]);
const tags = new Set(['vegano', 'sin gluten', 'vegano']);

const candidates = { cities, word, stock, tags, literal: {} };
for (const [name, value] of Object.entries(candidates)) {
  console.log(`¿${name} es iterable? →`, typeof value[Symbol.iterator] === 'function');
}

// Y todos estos CONSUMIDORES aceptan cualquier iterable:

// 1. for…of (con un Map, cada valor es un par [clave, valor])
for (const [product, units] of stock) console.log('for…of →', product, units);

// 2. El spread en arrays y en llamadas. Un string se recorre por code
//    points, no por unidades UTF-16 (lección «Strings»): 👍 es UNA pieza.
console.log('spread →', [...word], '| length →', word.length, '| piezas →', [...word].length);
console.log('Math.max(...set) →', Math.max(...new Set([3, 9, 4])));

// 3. La desestructuración de arrays
const [first, ...others] = cities;
console.log('desestructuración →', first, others);

// 4. Array.from, con una función de mapeo opcional
console.log('Array.from →', Array.from(tags, (tag) => tag.toUpperCase()));

// 5. Los constructores y funciones que reciben colecciones
console.log('new Set(string) →', new Set('banana'));
console.log('Object.fromEntries(map) →', Object.fromEntries(stock));
console.log('new Map(pares) →', new Map(Object.entries({ lunes: 'tamales', martes: 'pozole' })));

// (Más consumidores: yield* en la lección «Generadores» y Promise.all en el
//  módulo de asincronía.)

// > Desde Python: es la misma idea que «iterable» en Python: for, list(x),
//   set(x), dict(x), el desempaquetado a, *b = x y el * en las llamadas
//   aceptan cualquier objeto con __iter__.
```

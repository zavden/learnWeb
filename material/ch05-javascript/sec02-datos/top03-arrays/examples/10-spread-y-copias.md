---
example_description: "El spread ... une y copia arrays; asignar no copia, la copia es superficial y + convierte los arrays en texto"
example_tags: "javascript|python|arrays|spread|copias|referencias"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// El spread ... «desparrama» un array dentro de otro (el * de Python).
const fruits = ['manzana', 'pera'];
const vegetables = ['tomate', 'lechuga'];
const basket = [...fruits, 'pan', ...vegetables]; // [*fruits, 'pan', *vegetables]
console.log('basket →', basket);

// También en llamadas: cada elemento pasa como un argumento suelto.
const temperatures = [14, 22, 9];
console.log('Math.max(...temperatures) →', Math.max(...temperatures)); // 22

// Asignar NO copia: dos nombres para el mismo array.
const original = ['a', 'b'];
const alias = original;
// [...array] SÍ crea un array nuevo (como lista[:] o list(lista) en Python).
const copy = [...original];
original.push('c');
console.log('alias →', alias); // ['a', 'b', 'c']: es el mismo array
console.log('copy →', copy);   // ['a', 'b']

// 🐛 Pero es una copia SUPERFICIAL: los objetos de dentro se comparten.
const team = [{ name: 'Ada', tasks: 2 }];
const teamCopy = [...team];
teamCopy[0].tasks = 99;
console.log('team[0].tasks →', team[0].tasks); // 99: el objeto interior es el mismo
// (Python hace lo mismo con lista[:]. Copias profundas: lección «JSON y copias».)

// El spread acepta cualquier cosa recorrible: strings, Set, Map…
console.log("[...'hola'] →", [...'hola']);
console.log('sin duplicados →', [...new Set(['rojo', 'azul', 'rojo'])]); // Set: lección «Map, Set y WeakMap»

// 🐛 + no concatena arrays: los convierte en texto (Python: [1, 2] + [3] es [1, 2, 3]).
console.log('[1, 2] + [3] →', [1, 2] + [3]);         // '1,23'
console.log('✅ [...[1, 2], ...[3]] →', [...[1, 2], ...[3]]); // [1, 2, 3]
console.log('✅ [1, 2].concat([3]) →', [1, 2].concat([3]));   // [1, 2, 3]
```

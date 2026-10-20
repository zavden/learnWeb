---
example_description: "Arrays con huecos (sparse): new Array(3), asignar más allá del final y delete; map y forEach se los saltan"
example_tags: "javascript|python|arrays|huecos|sparse|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 new Array(3) NO crea [3]: crea un array de longitud 3 SIN elementos («huecos»).
const slots = new Array(3);
console.log('new Array(3) →', slots);            // [empty × 3]
console.log('length →', slots.length);           // 3
console.log('¿hay algo en 0? →', 0 in slots);    // false: ni siquiera undefined
console.log('new Array(3, 4) →', new Array(3, 4)); // [3, 4]: con dos argumentos sí son elementos

// 🐛 map, forEach y filter SALTAN los huecos: este map no hace nada.
console.log('slots.map(() => 0) →', slots.map(() => 0)); // [empty × 3]

// ✅ Para crear n posiciones con un valor: fill o Array.from (el [0] * 3 de Python).
console.log('new Array(3).fill(0) →', new Array(3).fill(0));                       // [0, 0, 0]
console.log('Array.from({ length: 3 }, () => 0) →', Array.from({ length: 3 }, () => 0)); // [0, 0, 0]

// 🐛 Asignar más allá del final también crea huecos (Python lanzaría IndexError).
const week = ['lunes', 'martes'];
week[6] = 'domingo';
console.log('week →', week);          // ['lunes', 'martes', empty × 4, 'domingo']
console.log('length →', week.length); // 7
let visited = 0;
week.forEach(() => visited++);
console.log('forEach visitó →', visited, 'elementos'); // 3
console.log('join →', week.join(' | ')); // los huecos salen como texto vacío

// 🐛 delete deja un hueco en lugar de quitar el elemento.
const queue = ['Ana', 'Bruno', 'Carmen'];
delete queue[1];
console.log('delete queue[1] →', queue, '| length →', queue.length); // ['Ana', empty, 'Carmen'] 3

// ✅ Para quitar un elemento, splice (o toSpliced para obtener una copia).
const fixedQueue = ['Ana', 'Bruno', 'Carmen'];
fixedQueue.splice(1, 1);
console.log('splice(1, 1) →', fixedQueue, '| length →', fixedQueue.length); // ['Ana', 'Carmen'] 2
```

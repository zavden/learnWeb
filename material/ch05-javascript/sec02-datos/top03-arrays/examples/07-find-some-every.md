---
example_description: "find, findIndex, findLast, some y every (any y all de Python); every con un array vacío es true"
example_tags: "javascript|python|arrays|find|some|every"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
const tasks = [
  { id: 1, title: 'Diseñar portada', done: true, hours: 3 },
  { id: 2, title: 'Maquetar menú', done: false, hours: 5 },
  { id: 3, title: 'Revisar textos', done: false, hours: 2 },
];

// find: el PRIMER elemento que cumple la condición (o undefined).
console.log('find →', tasks.find((t) => !t.done));               // la tarea 2
console.log('find (ninguno) →', tasks.find((t) => t.hours > 10)); // undefined
// En Python: next((t for t in tasks if not t['done']), None)

// findIndex: su posición (o -1). findLast y findLastIndex buscan desde el final.
console.log('findIndex →', tasks.findIndex((t) => t.id === 3));    // 2
console.log('findLast →', tasks.findLast((t) => !t.done).title);  // 'Revisar textos'

// some: ¿alguno cumple? (any). every: ¿todos cumplen? (all).
// Los dos paran en cuanto conocen la respuesta, como any y all.
console.log('some(done) →', tasks.some((t) => t.done));   // true
console.log('every(done) →', tasks.every((t) => t.done)); // false

// Con un array vacío, every es true y some es false (igual que all([]) y any([])).
const noTasks = [];
console.log('[].every(done) →', noTasks.every((t) => t.done)); // true: «todas hechas»
// Si «todo hecho» exige que haya tareas, compruébalo aparte:
console.log('✅ ¿proyecto terminado? →', noTasks.length > 0 && noTasks.every((t) => t.done)); // false

// includes e indexOf buscan un VALOR concreto, no una condición.
const tags = ['urgente', 'diseño'];
console.log("tags.includes('diseño') →", tags.includes('diseño')); // 'diseño' in tags
// Con objetos comparan identidad: un objeto con el mismo contenido no «está».
console.log('includes({ id: 1 }) →', tasks.includes({ id: 1 }));    // false
console.log('✅ some(t => t.id === 1) →', tasks.some((t) => t.id === 1)); // true
```

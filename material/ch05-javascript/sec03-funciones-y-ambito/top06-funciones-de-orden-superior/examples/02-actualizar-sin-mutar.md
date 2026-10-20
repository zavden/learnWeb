---
example_description: "Recetas de actualización inmutable: spread para objetos (también anidados), with/toSpliced/toSorted/map/filter para arrays; lo que no cambia se comparte"
example_tags: "javascript|inmutabilidad|spread|with|tosorted|objetos|arrays"
example_stage: intermediate
example_importance: critical
console: true
---

# JavaScript

```javascript
// Actualizar de forma INMUTABLE: crear una versión nueva con lo que cambia
// y dejar la original intacta. Recetas para cada caso:
const profile = {
  name: 'Lucía',
  address: { city: 'Sevilla', zip: '41003' },
  tags: ['cliente', 'newsletter'],
};

// ── Objetos ─────────────────────────────────────────────
// Cambiar una propiedad: spread + la propiedad nueva (la última gana).
const renamed = { ...profile, name: 'Lucía Ortega' };
// Cambiar algo ANIDADO: copia también ese nivel (el spread es superficial).
const moved = { ...profile, address: { ...profile.address, city: 'Cádiz', zip: '11001' } };
// Quitar una propiedad: desestructuración con resto.
const { tags, ...withoutTags } = profile;

console.log('renamed.name →', renamed.name);
console.log('moved.address →', moved.address);
console.log('withoutTags →', withoutTags);
console.log('profile intacto →', profile.name, profile.address.city, profile.tags.length);

// ── Arrays ──────────────────────────────────────────────
const scores = [7, 9, 4, 8];
console.log('añadir →', [...scores, 10]);
console.log('quitar el 1 →', scores.toSpliced(1, 1));
console.log('cambiar el 2 →', scores.with(2, 5));
console.log('ordenar →', scores.toSorted((a, b) => a - b));
console.log('scores intacto →', scores);

// ── Array de objetos: cambiar UNO por su id ────────────
const tasks = [
  { id: 1, title: 'Revisar factura', done: false },
  { id: 2, title: 'Llamar al proveedor', done: false },
];
const toggled = tasks.map((task) => (task.id === 2 ? { ...task, done: true } : task));
const withoutFirst = tasks.filter((task) => task.id !== 1);
console.log('tasks[1].done →', tasks[1].done, '| toggled[1].done →', toggled[1].done); // false | true
console.log('withoutFirst →', withoutFirst.map((task) => task.title));

// Lo que no cambia NO se copia: se COMPARTE. Por eso es barato.
console.log('¿tarea 1 compartida? →', tasks[0] === toggled[0]); // true
console.log('¿address compartida en renamed? →', renamed.address === profile.address); // true
```

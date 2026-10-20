---
example_description: "Dos objetos iguales son dos elementos distintos en un Set (y dos claves distintas en un Map): se comparan por referencia"
example_tags: "javascript|set|map|referencias|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 Quieres guardar cada coordenada una sola vez…
const points = new Set();
points.add({ x: 1, y: 2 });
points.add({ x: 1, y: 2 });      // mismo contenido, pero OTRO objeto
console.log('size →', points.size);                         // 2
console.log('has({ x: 1, y: 2 }) →', points.has({ x: 1, y: 2 })); // false: otro objeto más

// Lo mismo con los arrays: [1, 2] !== [1, 2].
console.log('new Set([[1, 2], [1, 2]]).size →', new Set([[1, 2], [1, 2]]).size); // 2

// ✅ Usa una clave primitiva que represente el contenido.
const keyOf = (point) => `${point.x},${point.y}`;   // función flecha: módulo 3
const uniquePoints = new Map();
for (const point of [{ x: 1, y: 2 }, { x: 1, y: 2 }, { x: 3, y: 4 }]) {
  uniquePoints.set(keyOf(point), point);
}
console.log('puntos distintos →', uniquePoints.size);       // 2
console.log("¿está (1,2)? →", uniquePoints.has(keyOf({ x: 1, y: 2 }))); // true

// > Desde Python: un set de tuplas compara por contenido: {(1, 2), (1, 2)} tiene un elemento.
//   JavaScript no tiene tuplas inmutables comparables por valor, así que la clave string hace ese papel.
```

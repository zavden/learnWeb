---
example_description: "Symbol() crea un valor único: dos símbolos con la misma descripción son distintos; la descripción solo sirve para depurar; un símbolo como centinela que no se confunde con ningún dato, como object() en Python"
example_tags: "javascript|python|symbol|primitivos|centinela"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Cada llamada a Symbol() crea un valor NUEVO y único. El texto es solo una
// descripción para depurar: no lo identifica.
const orderId = Symbol('id');
const userId = Symbol('id');

console.log('typeof →', typeof orderId);
console.log('orderId === userId →', orderId === userId);
console.log('orderId === orderId →', orderId === orderId);
console.log('description →', orderId.description);
console.log('en la consola →', orderId, userId); // se ven iguales, pero no lo son

// Es un PRIMITIVO, como number o string: no se crea con new.
try {
  new Symbol('id');
} catch (error) {
  console.log('new Symbol →', error.name, '|', error.message);
}

// Un uso clásico: un CENTINELA, un valor que no puede confundirse con ningún
// dato, ni siquiera con undefined o null.
const NOT_CACHED = Symbol('not cached');
const cache = new Map([
  ['/api/precio/cafe', 210],
  ['/api/precio/agotado', undefined], // undefined es un dato válido aquí
]);

function lookup(url) {
  return cache.has(url) ? cache.get(url) : NOT_CACHED;
}

for (const url of ['/api/precio/cafe', '/api/precio/agotado', '/api/precio/pan']) {
  const value = lookup(url);
  console.log(url, '→', value === NOT_CACHED ? 'hay que pedirlo al servidor' : `en caché: ${value}`);
}

// > Desde Python: no hay un tipo symbol, pero el centinela es el mismo truco
//   que _MISSING = object(): un objeto que solo es igual a sí mismo.
```

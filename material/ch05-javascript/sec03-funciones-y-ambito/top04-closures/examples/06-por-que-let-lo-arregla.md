---
example_description: "Sin temporizadores: un array de funciones creado en un bucle. let crea una variable por vuelta; las soluciones antiguas con IIFE y forEach; comparación con Python"
example_tags: "javascript|python|closures|var|let|bucles|iife"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// El problema del ejemplo anterior no tiene nada que ver con los temporizadores:
// basta con crear funciones en un bucle y llamarlas DESPUÉS.

// 🐛 var: una sola variable para todo el bucle; las tres funciones la comparten.
const withVar = [];
for (var i = 0; i < 3; i++) {
  withVar.push(() => i);
}
console.log('var →', withVar.map((fn) => fn())); // [3, 3, 3]

// ✅ let: el for crea una variable NUEVA en cada vuelta y le copia el valor.
const withLet = [];
for (let j = 0; j < 3; j++) {
  withLet.push(() => j);
}
console.log('let →', withLet.map((fn) => fn())); // [0, 1, 2]

//   var:  ( ) => i ─┐                    let:  ( ) => j ──► j = 0
//         ( ) => i ─┼──► i = 3                 ( ) => j ──► j = 1
//         ( ) => i ─┘                          ( ) => j ──► j = 2

// Antes de 2015 (sin let) se arreglaba creando un ámbito por vuelta a mano:
// 1) con una IIFE que recibe el valor como PARÁMETRO (lección «Ámbito y hoisting»)
const withIife = [];
for (var k = 0; k < 3; k++) {
  (function (index) {
    withIife.push(() => index);
  })(k);
}
console.log('IIFE →', withIife.map((fn) => fn())); // [0, 1, 2]

// 2) con forEach: cada vuelta es una LLAMADA al callback, con su propio parámetro
const withForEach = [];
[0, 1, 2].forEach((index) => {
  withForEach.push(() => index);
});
console.log('forEach →', withForEach.map((fn) => fn())); // [0, 1, 2]

// > Desde Python: el for de Python se comporta como el var de JavaScript
//   (una sola variable), así que  [lambda: i for i in range(3)]  da [2, 2, 2].
//   El arreglo de Python es fijar el valor como argumento por defecto:
//   [lambda i=i: i for i in range(3)]  → [0, 1, 2]
```

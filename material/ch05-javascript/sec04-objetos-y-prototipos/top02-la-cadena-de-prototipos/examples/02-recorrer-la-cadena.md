---
example_description: "Una función que sigue los [[Prototype]] con Object.getPrototypeOf hasta null y muestra la cadena de un objeto, un array, una función, una fecha y un Map"
example_tags: "javascript|python|prototipos|cadena|mro"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Los prototipos de los valores nativos son objetos que ya existen al cargar
// la página. Les damos un nombre para poder imprimir la cadena.
// (Por qué se escriben «Array.prototype»: lección «Funciones constructoras y new».)
const knownPrototypes = new Map([
  [Object.prototype, 'Object.prototype'],
  [Array.prototype, 'Array.prototype'],
  [Function.prototype, 'Function.prototype'],
  [Date.prototype, 'Date.prototype'],
  [Map.prototype, 'Map.prototype'],
]);

// Sigue el enlace [[Prototype]] una y otra vez hasta llegar a null,
// exactamente el camino que recorre el motor al buscar una propiedad.
function chainOf(value) {
  const steps = [];
  let current = Object.getPrototypeOf(value);
  while (current !== null) {
    steps.push(knownPrototypes.get(current) ?? '(otro objeto)');
    current = Object.getPrototypeOf(current);
  }
  steps.push('null');
  return steps.join(' → ');
}

console.log('{ a: 1 }     →', chainOf({ a: 1 }));
console.log('[1, 2]       →', chainOf([1, 2]));
console.log('function     →', chainOf(function greet() {}));
console.log('() => {}     →', chainOf(() => {}));
console.log('new Date()   →', chainOf(new Date('2026-10-12T00:00:00Z')));
console.log('new Map()    →', chainOf(new Map()));

// Todas las cadenas acaban en Object.prototype y luego en null: por eso
// cualquier objeto (también un array o una función) tiene toString.
console.log('[1, 2].toString() →', [1, 2].toString()); // '1,2' (Array.prototype tiene el suyo)
console.log('(new Map()).hasOwnProperty →', typeof new Map().hasOwnProperty); // 'function'

// > Desde Python: es lo que ves en type(x).__mro__, por ejemplo
//   bool.__mro__ → (bool, int, object). Allí la cadena es de CLASES;
//   aquí es de OBJETOS, y cada objeto apunta al siguiente.
```

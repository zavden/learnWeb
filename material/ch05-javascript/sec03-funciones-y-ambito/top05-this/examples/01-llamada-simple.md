---
example_description: "En una llamada simple f(), this es window en modo no estricto y undefined en modo estricto; this depende de cómo se llama la función"
example_tags: "javascript|python|this|modo-estricto|window"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// this es una palabra clave que vale algo DISTINTO en cada llamada.
// No depende de dónde está escrita la función, sino de CÓMO se la llama.

// Regla 1: LLAMADA SIMPLE, f(), sin nada delante.
function whoIsThis() {
  return this;
}
// Los ejemplos de LearnWeb son scripts clásicos, en modo NO estricto:
// en una llamada simple, this es el objeto global, window.
console.log('no estricto → this === window:', whoIsThis() === window); // true

// En modo ESTRICTO ('use strict' al principio de la función o del script),
// una llamada simple deja this en undefined.
function whoIsThisStrict() {
  'use strict';
  return this;
}
console.log('estricto → this:', whoIsThisStrict()); // undefined

// El modo estricto está activado siempre en los módulos (type="module")
// y dentro de las clases: en el código moderno, lo normal es undefined.

// En el nivel superior de un script clásico, this también es window.
console.log('nivel superior → this === window:', this === window); // true

// ¿Por qué importa? Porque una función que usa this y se llama sin nada delante
// lee y escribe en window (no estricto) o lanza TypeError (estricto).
function describeLocation() {
  return `${this.city ?? '(sin ciudad)'}`;
}
console.log('describeLocation() →', describeLocation()); // '(sin ciudad)': window.city no existe

// > Desde Python: no hay nada equivalente. self es un parámetro normal y explícito;
//   this es implícito y lo decide la forma de llamar (siguientes ejemplos).
```

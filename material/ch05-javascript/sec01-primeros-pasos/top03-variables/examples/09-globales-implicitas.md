---
example_description: "Asignar a una variable sin declarar crea una global por accidente; el modo estricto lo convierte en error"
example_tags: "javascript|variables|globales|modo-estricto|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 Asignar a un nombre que NO existe (sin let/const/var) no da error:
// en un script clásico crea una variable global nueva, colgada de window.
let counter = 0;
countr = counter + 1; // errata: falta la «e»
console.log('counter →', counter);          // 0: no ha cambiado
console.log('countr →', countr);            // 1: global creada por accidente
console.log('window.countr →', window.countr);

// ✅ El modo estricto convierte ese descuido en un error.
// 'use strict' al principio de una función (o del script entero) lo activa.
function strictUpdate() {
  'use strict';
  let total = 0;
  totl = total + 1; // ❌ en modo estricto: ReferenceError
  return total;
}

try {
  strictUpdate();
} catch (error) {
  console.log('con modo estricto →', error.name, '|', error.message); // totl is not defined
}

// Los módulos y las clases funcionan siempre en modo estricto.
// Los ejemplos de LearnWeb son scripts clásicos: aquí el descuido pasa sin aviso.
```

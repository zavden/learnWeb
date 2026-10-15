---
example_description: "Hoisting de var: la declaración sube al principio y la variable vale undefined antes de su línea"
example_tags: "javascript|variables|var|hoisting|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 Antes de ejecutar, el motor registra TODAS las declaraciones var del ámbito
// y les da el valor undefined. Es como si las «subiera» (hoisting) al principio.
console.log('score antes de su línea →', score); // undefined, ¡sin error!
var score = 100;
console.log('score después →', score);           // 100

// El motor lo ejecuta como si estuviera escrito así:
//   var score;           ← la declaración «sube»
//   console.log(score);  ← undefined
//   score = 100;         ← la asignación se queda en su sitio

// 🐛 Sube aunque esté dentro de un if que nunca se ejecuta.
function checkout() {
  console.log('al entrar, total →', total);  // undefined: ya existe
  if (false) {
    var total = 50;                          // esta línea no se ejecuta jamás…
  }
  console.log('al salir, total →', total);   // …pero la variable existe igual
}
checkout();

// Con let el mismo orden lanza un error (lo verás en el ejemplo de la TDZ).
// Es mejor así: un error te avisa; un undefined silencioso se cuela.
```

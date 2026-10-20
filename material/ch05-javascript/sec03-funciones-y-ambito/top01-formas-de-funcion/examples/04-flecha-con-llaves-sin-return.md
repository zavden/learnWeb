---
example_description: "Una flecha con llaves y sin return devuelve undefined: map da [undefined, …] y filter se queda vacío"
example_tags: "javascript|python|funciones|flecha|return|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const prices = [1200, 450, 3000];

// 🐛 Con LLAVES, la flecha es un bloque: el valor se calcula… y se tira.
const withVatBug = prices.map((cents) => {
  Math.round(cents * 1.21);
});
console.log('🐛 map sin return →', withVatBug); // [undefined, undefined, undefined]

// 🐛 En filter es peor: undefined es falsy, así que se descartan TODOS.
const expensiveBug = prices.filter((cents) => {
  cents > 1000;
});
console.log('🐛 filter sin return →', expensiveBug); // []

// ✅ Opción 1: cuerpo de bloque CON return.
const withVatBlock = prices.map((cents) => {
  return Math.round(cents * 1.21);
});
console.log('✅ con return →', withVatBlock); // [1452, 545, 3630]

// ✅ Opción 2: cuerpo de expresión, SIN llaves: el return es implícito.
const withVat = prices.map((cents) => Math.round(cents * 1.21));
const expensive = prices.filter((cents) => cents > 1000);
console.log('✅ sin llaves →', withVat);    // [1452, 545, 3630]
console.log('✅ filter →', expensive);     // [1200, 3000]

// Regla: llaves ⇒ escribe return. Sin llaves ⇒ se devuelve la expresión.
// > Desde Python: es como un def sin return, que devuelve None. Una lambda no
//   tiene este problema porque no admite bloques.
```

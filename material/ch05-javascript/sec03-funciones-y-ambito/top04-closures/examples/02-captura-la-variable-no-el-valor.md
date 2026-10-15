---
example_description: "Un closure captura la variable, no su valor: ve los cambios posteriores y puede modificarla. Para congelar un valor, pásalo como parámetro"
example_tags: "javascript|python|closures|variables|late-binding"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un closure no guarda una FOTO de los valores: guarda una referencia a la VARIABLE.
let taxRate = 0.21;
const withTax = (cents) => Math.round(cents * (1 + taxRate));

console.log('con 21 % →', withTax(1000)); // 1210
taxRate = 0.1; // cambiamos la VARIABLE después de crear withTax…
console.log('con 10 % →', withTax(1000)); // 1100 ← …y withTax ve el valor ACTUAL

// También puede MODIFICAR la variable, y el cambio lo ve todo el que la comparta.
let pendingCount = 0;
const addTask = () => {
  pendingCount += 1;
};
addTask();
addTask();
console.log('pendingCount →', pendingCount); // 2

// ✅ Si quieres «congelar» el valor del momento, cópialo en un PARÁMETRO
// (o en una const) al crear la función: cada llamada tiene su propia variable.
function makeTaxCalculator(rate) {
  return (cents) => Math.round(cents * (1 + rate));
}
taxRate = 0.21;
const generalRate = makeTaxCalculator(taxRate);  // rate = 0.21 para siempre
taxRate = 0.04;
const reducedRate = makeTaxCalculator(taxRate);  // rate = 0.04 para siempre
console.log('general →', generalRate(1000)); // 1210
console.log('reducido →', reducedRate(1000)); // 1040
console.log('withTax ahora →', withTax(1000)); // 1040: sigue a la variable global

// > Desde Python: Python hace lo mismo («late binding»). Es la causa de este
//   clásico:  fs = [lambda: i for i in range(3)]  →  [f() for f in fs] == [2, 2, 2]
//   En JavaScript, con let en el for, NO pasa (ejemplos 5 y 6).
```

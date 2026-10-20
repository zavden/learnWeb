---
example_description: "Number.EPSILON sirve cerca de 1; para cualquier tamaño, una tolerancia relativa como math.isclose"
example_tags: "javascript|python|numeros|epsilon|comparacion"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Number.EPSILON es la distancia entre 1 y el siguiente number representable.
console.log('Number.EPSILON →', Number.EPSILON);                     // 2.220446049250313e-16
console.log('1 + EPSILON > 1 →', 1 + Number.EPSILON > 1);            // true
console.log('1 + EPSILON / 2 > 1 →', 1 + Number.EPSILON / 2 > 1);    // false: se pierde

// Cerca de 1, una tolerancia absoluta de EPSILON funciona:
console.log('pequeños →', Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON); // true

// 🐛 Pero la distancia entre dos number vecinos crece con su tamaño. Con números
// grandes, el error de redondeo es mucho mayor que EPSILON y la comparación falla:
const sum = 1000.1 + 1000.2;
console.log('1000.1 + 1000.2 →', sum);                                 // 2000.3000000000002
console.log('grandes →', Math.abs(sum - 2000.3) < Number.EPSILON);     // false

// ✅ Tolerancia RELATIVA: el margen crece con el tamaño de los números.
// Es lo que hace math.isclose(a, b) de Python (rel_tol=1e-09 por defecto).
// (function y los parámetros por defecto se estudian en «Funciones y ámbito».)
function isClose(a, b, relTol = 1e-9, absTol = 0) {
  const scale = Math.max(Math.abs(a), Math.abs(b));
  return Math.abs(a - b) <= Math.max(relTol * scale, absTol);
}
console.log('isClose(0.1 + 0.2, 0.3) →', isClose(0.1 + 0.2, 0.3)); // true
console.log('isClose(sum, 2000.3) →', isClose(sum, 2000.3));       // true
console.log('isClose(1, 1.001) →', isClose(1, 1.001));             // false: diferencia real

// Junto a 0, una tolerancia relativa no sirve (cualquier margen relativo a 0 es 0):
// ahí hace falta también una absoluta, igual que en math.isclose(x, 0, abs_tol=…).
const residue = 0.1 * 3 - 0.3;
console.log('0.1 * 3 - 0.3 →', residue);                                 // 5.551115123125783e-17
console.log('isClose(residue, 0) →', isClose(residue, 0));               // false
console.log('isClose(residue, 0, 1e-9, 1e-12) →', isClose(residue, 0, 1e-9, 1e-12)); // true
```

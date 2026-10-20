---
example_description: "Un único tipo number para enteros y decimales: Infinity, NaN y el límite de 2**53"
example_tags: "javascript|python|tipos|number|nan|infinity"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// JavaScript tiene UN tipo numérico para todo: number, un decimal de 64 bits
// (IEEE-754, el mismo formato que el float de Python). No hay int aparte.
console.log('5 === 5.0 →', 5 === 5.0);                         // true: mismo valor
console.log('Number.isInteger(5.0) →', Number.isInteger(5.0)); // true
console.log('7 / 2 →', 7 / 2);                                 // 3.5

// Dividir entre cero no lanza error (en Python: ZeroDivisionError).
console.log('1 / 0 →', 1 / 0);    // Infinity
console.log('-1 / 0 →', -1 / 0);  // -Infinity
console.log('0 / 0 →', 0 / 0);    // NaN («Not a Number»)

// Una operación sin sentido tampoco lanza error: da NaN.
console.log("'hola' * 2 →", 'hola' * 2); // NaN (en Python sería 'holahola')

// Curiosidad: NaN («no es un número») es de tipo number.
console.log('typeof NaN →', typeof NaN); // 'number'

// Los enteros son exactos solo hasta 2**53 (los int de Python no tienen límite).
console.log('Number.MAX_SAFE_INTEGER →', Number.MAX_SAFE_INTEGER); // 2**53 - 1
console.log('2 ** 53 →', 2 ** 53);
console.log('2 ** 53 + 1 →', 2 ** 53 + 1); // ¡el mismo número! el +1 se pierde

// 0.1 + 0.2, NaN !== NaN y -0 tienen su propia lección en «Números, texto y colecciones».
```

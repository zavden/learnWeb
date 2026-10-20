---
example_description: "Expresión de función: function usada como valor, guardada en una const o escrita como argumento; el nombre propio solo existe dentro"
example_tags: "javascript|funciones|expresion|name"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Expresión de función: la palabra function en un sitio donde se espera un VALOR.
// El resultado se guarda en una variable, como cualquier otro valor.
const toCelsius = function (fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}; // ← punto y coma: es una asignación, como const x = 5;

console.log('toCelsius(212) →', toCelsius(212)); // 100
console.log('toCelsius(98.6) →', toCelsius(98.6).toFixed(1)); // '37.0'

// La función no tenía nombre, pero el motor le pone el de la variable.
console.log('toCelsius.name →', toCelsius.name); // 'toCelsius'

// También se escribe directamente como argumento de otra función:
const sorted = [30, 4, 100].toSorted(function (a, b) {
  return a - b;
});
console.log('sorted →', sorted); // [4, 30, 100]

// Expresión de función CON nombre: ese nombre solo existe DENTRO de la función.
// Sirve para que se llame a sí misma (recursión, lección 7) y aparece en las
// trazas de error, lo que ayuda a depurar.
const countDigits = function digits(n) {
  return n < 10 ? 1 : 1 + digits(Math.floor(n / 10));
};
console.log('countDigits(2026) →', countDigits(2026)); // 4
console.log('countDigits.name →', countDigits.name);   // 'digits'
console.log('typeof digits (fuera) →', typeof digits); // 'undefined': aquí no existe

// Diferencia práctica con la declaración: la variable no tiene la función hasta
// que se ejecuta esta línea. Lo verás en la lección «Ámbito y hoisting».
```

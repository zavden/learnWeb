---
example_description: "Operadores aritméticos, ++/-- y el % que con negativos no coincide con el de Python"
example_tags: "javascript|python|operadores|aritmetica|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Los operadores aritméticos son casi los de Python.
console.log('7 + 2 →', 7 + 2);      // 9
console.log('7 - 2 →', 7 - 2);      // 5
console.log('7 * 2 →', 7 * 2);      // 14
console.log('7 / 2 →', 7 / 2);      // 3.5: / siempre da decimales, como en Python 3
console.log('7 % 2 →', 7 % 2);      // 1: resto
console.log('2 ** 10 →', 2 ** 10);  // 1024: potencia, como en Python
// (No hay //: la división entera es Math.floor(a / b), lección 2.)

// 🐛 % con negativos: en JavaScript el resultado lleva el signo del DIVIDENDO
// (es un «resto»); en Python, el del DIVISOR (es un «módulo»).
console.log('-7 % 3 →', -7 % 3);    // -1   (Python: 2)
console.log('7 % -3 →', 7 % -3);    //  1   (Python: -2)

// ✅ El % de Python (útil para índices circulares, días de la semana…):
const n = 3;
console.log('((-7 % n) + n) % n →', ((-7 % n) + n) % n); // 2

// ++ y -- suman o restan 1 (en Python no existen: se escribe += 1).
let lives = 3;
lives++;
console.log('tras lives++ →', lives);   // 4

// Como expresión, la posición importa:
// x++ devuelve el valor de ANTES; ++x, el de DESPUÉS.
let a = 5;
console.log('a++ devuelve', a++, '→ a queda en', a); // 5, 6
let b = 5;
console.log('++b devuelve', ++b, '→ b queda en', b); // 6, 6
```

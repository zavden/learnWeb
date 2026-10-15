---
example_description: "Los operadores bit a bit convierten sus operandos a enteros de 32 bits con signo: 2 ** 32 | 0 da 0, 0xffffffff | 0 da -1, 1 << 31 es negativo y ~~x trunca mal los números grandes"
example_tags: "javascript|python|bits|int32|operadores|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Los operadores bit a bit NO usan el number de 64 bits: convierten cada operando
// en un ENTERO DE 32 BITS CON SIGNO (int32), operan y devuelven un int32.
// Rango de un int32: de -2147483648 (-(2 ** 31)) a 2147483647 (2 ** 31 - 1).

// 🐛 1. Los bits por encima del 32 desaparecen: solo quedan los 32 de abajo.
console.log('2 ** 32 | 0 →', 2 ** 32 | 0);             // 0
console.log('(2 ** 32 + 5) | 0 →', (2 ** 32 + 5) | 0); // 5

// 🐛 2. El bit 31 es el del signo: un número grande «se vuelve» negativo.
console.log('0xffffffff | 0 →', 0xffffffff | 0); // -1
console.log('2 ** 31 | 0 →', 2 ** 31 | 0);       // -2147483648
console.log('1 << 31 →', 1 << 31);                // -2147483648
console.log('1 << 32 →', 1 << 32);                // 1: la distancia se toma módulo 32

// 🐛 3. Los decimales se pierden (se trunca hacia cero).
console.log('3.7 | 0 →', 3.7 | 0, '| -3.7 | 0 →', -3.7 | 0); // 3 | -3

// Por eso el truco «x | 0» (o «~~x») para quitar decimales solo vale con números pequeños:
const backupBytes = 5_000_000_000.5; // el tamaño de una copia de seguridad: 5 GB
console.log('🐛 ~~backupBytes →', ~~backupBytes);               // 705032704
console.log('✅ Math.trunc(backupBytes) →', Math.trunc(backupBytes)); // 5000000000

// ✅ x >>> 0 lee los mismos 32 bits como entero SIN signo (de 0 a 4294967295):
console.log('(0xffffffff | 0) >>> 0 →', (0xffffffff | 0) >>> 0); // 4294967295
console.log('(1 << 31) >>> 0 →', (1 << 31) >>> 0);               // 2147483648
// ✅ Para más de 32 bits, BigInt (ejemplo 10): sus operadores no tienen ese límite.
console.log('2n ** 32n | 0n →', 2n ** 32n | 0n);                   // 4294967296n

// En Python los int no tienen tamaño fijo: 1 << 31 es 2147483648 y (2 ** 32) | 0 es 4294967296.
```

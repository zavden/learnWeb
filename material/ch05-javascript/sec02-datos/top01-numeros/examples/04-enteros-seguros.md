---
example_description: "Por encima de 2**53 los enteros pierden precisión: un identificador de 64 bits cambia sin error"
example_tags: "javascript|python|numeros|enteros|bigint|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Un number tiene 53 bits de precisión: los enteros son exactos hasta 2**53 - 1.
console.log('MAX_SAFE_INTEGER →', Number.MAX_SAFE_INTEGER);                     // 9007199254740991
console.log('isSafeInteger(2**53 - 1) →', Number.isSafeInteger(2 ** 53 - 1));   // true
console.log('isSafeInteger(2**53) →', Number.isSafeInteger(2 ** 53));           // false

// A partir de ahí ya no caben todos: dos enteros distintos se guardan igual.
console.log('2**53 === 2**53 + 1 →', 2 ** 53 === 2 ** 53 + 1);                 // true

// 🐛 El caso real: identificadores de 64 bits que llegan de una API o de una base
// de datos. Al convertirlos a number cambian, y nadie lanza un error.
const orderId = '1234567890123456789';
console.log('Number(orderId) →', Number(orderId));                               // 1234567890123456800
console.log('¿mismo id? →', String(Number(orderId)) === orderId);                // false
// JSON.parse hace lo mismo con los números grandes («JSON y copias»):
console.log('JSON.parse →', JSON.parse('{"id": 1234567890123456789}').id);       // 1234567890123456800

// ✅ 1. Un identificador es una etiqueta, no una cantidad: guárdalo como string.
// ✅ 2. Si de verdad necesitas operar con él: BigInt… creado desde el TEXTO.
console.log("BigInt(orderId) →", BigInt(orderId));                               // 1234567890123456789n
console.log("BigInt('9007199254740993') →", BigInt('9007199254740993'));         // 9007199254740993n
// 🐛 Desde un number llega tarde: el literal ya se redondeó al leer el código.
console.log('BigInt(9007199254740993) →', BigInt(9007199254740993));             // 9007199254740992n

// BigInt tiene sus límites: solo enteros y nada de Math.
try {
  BigInt(1.5);
} catch (error) {
  console.log('BigInt(1.5) →', error.name, '|', error.message);
}
try {
  Math.sqrt(16n);
} catch (error) {
  console.log('Math.sqrt(16n) →', error.name, '|', error.message);
}

// En Python, int('1234567890123456789') es exacto: los int no tienen límite.
// El equivalente en JavaScript es BigInt, no number.
```

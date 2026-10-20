---
example_description: "bigint para enteros sin límite (como el int de Python) y por qué no se mezcla con number"
example_tags: "javascript|python|tipos|bigint|typeerror"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// bigint: enteros de tamaño arbitrario, como los int de Python. Llevan una n al final.
const big = 2n ** 64n;
console.log('2n ** 64n →', big);          // 18446744073709551616n
console.log('typeof 10n →', typeof 10n);  // 'bigint'

// Con number, por encima de 2**53 los enteros se redondean; con bigint no.
console.log('2 ** 53 + 1 →', 2 ** 53 + 1);         // 9007199254740992 (mal)
console.log('2n ** 53n + 1n →', 2n ** 53n + 1n);   // 9007199254740993n (bien)

// 🐛 No se pueden mezclar bigint y number en una operación aritmética.
try {
  console.log(10n + 1);
} catch (error) {
  console.log('10n + 1 →', error.name, '|', error.message);
}

// ✅ Convierte uno de los dos de forma explícita.
console.log('10n + BigInt(1) →', 10n + BigInt(1));   // 11n
console.log('Number(10n) + 1 →', Number(10n) + 1);   // 11

// La división de bigint descarta los decimales (hacia el cero).
console.log('7n / 2n →', 7n / 2n);                   // 3n

// Comparar sí se puede, pero son tipos distintos:
console.log('10n > 5 →', 10n > 5);                   // true
console.log('10n === 10 →', 10n === 10);             // false
```

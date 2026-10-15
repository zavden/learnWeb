---
example_description: "Con BigInt los operadores de bits no tienen límite de 32 bits (1n << 63n), BigInt.asUintN/asIntN recortan a 64 bits, y un identificador de pedido de 64 bits (tiempo | tienda | secuencia) se empaqueta y se lee con desplazamientos y máscaras"
example_tags: "javascript|python|bigint|bits|64-bits|identificadores"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Con BigInt (lección «Números»), los operadores de bits no pasan por int32:
console.log('1n << 63n →', 1n << 63n); // 9223372036854775808n
console.log('1 << 63 →', 1 << 63);     // -2147483648 (number: 63 % 32 = 31)
console.log('~5n →', ~5n);             // -6n, como en Python

// Un BigInt tampoco tiene tamaño fijo. Para imitar un entero de N bits, se recorta:
console.log('asUintN(64, -1n) →', BigInt.asUintN(64, -1n));          // 18446744073709551615n
console.log('asIntN(64, 1n << 63n) →', BigInt.asIntN(64, 1n << 63n)); // -9223372036854775808n
console.log('asUintN(8, 300n) →', BigInt.asUintN(8, 300n));          // 44n: lo que cabe en un byte

// Caso real: identificadores de 64 bits que se ordenan por fecha (estilo «snowflake»):
//   42 bits: milisegundos desde 2026-01-01 | 10 bits: tienda | 12 bits: secuencia
const EPOCH = BigInt(Date.UTC(2026, 0, 1));
function makeOrderId(isoDate, shop, sequence) {
  const elapsed = BigInt(Date.parse(isoDate)) - EPOCH;
  return (elapsed << 22n) | (BigInt(shop) << 12n) | BigInt(sequence);
}
function readOrderId(id) {
  return {
    date: new Date(Number((id >> 22n) + EPOCH)).toISOString(),
    shop: Number((id >> 12n) & 0x3ffn), // 0x3ff = diez bits a 1
    sequence: Number(id & 0xfffn),       // 0xfff = doce bits a 1
  };
}
const orderId = makeOrderId('2026-10-14T16:30:00.250Z', 37, 5);
// Viaja como TEXTO (un number de 64 bits perdería cifras: lección «Números»).
const json = JSON.stringify({ id: orderId.toString() });
console.log('JSON →', json);
console.log('leído →', readOrderId(BigInt(JSON.parse(json).id)));

// 🐛 BigInt y number no se mezclan, tampoco en los operadores de bits:
try {
  console.log(orderId >> 22);
} catch (error) {
  console.log('orderId >> 22 →', error.name, '|', error.message);
}
// Python: (order_id >> 22) & 0x3ff funciona directamente; sus int ya no tienen límite.
```

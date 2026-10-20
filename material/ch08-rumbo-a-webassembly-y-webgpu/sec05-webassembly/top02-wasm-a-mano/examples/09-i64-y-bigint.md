---
example_description: "🐛 Un parámetro i64 no acepta un number: addMinutes(Date.UTC(…), 45) lanza «Cannot convert 1792513800000 to a BigInt»; con BigInt funciona y devuelve BigInt, que no se mezcla con number y da la vuelta a los 64 bits como BigInt.asIntN(64, …)"
example_tags: "javascript|webassembly|wasm|i64|bigint|fechas|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Sumar minutos a un instante en milisegundos (un entero de 64 bits):
//   (func (export "addMinutes") (param $ms i64) (param $minutes i32) (result i64)
//     local.get $ms
//     local.get $minutes  i64.extend_i32_s       ;; i32 → i64 (con signo)
//     i64.const 60000  i64.mul                   ;; minutos → milisegundos
//     i64.add)
const bytes = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  0x01, 0x07, 0x01, 0x60, 0x02, 0x7e, 0x7f, 0x01, 0x7e,      // (i64, i32) → i64 · 7e = i64
  0x03, 0x02, 0x01, 0x00,
  0x07, 0x0e, 0x01, 0x0a, 0x61, 0x64, 0x64, 0x4d, 0x69, 0x6e, 0x75, 0x74, 0x65, 0x73, 0x00, 0x00,
  0x0a, 0x0f, 0x01, 0x0d, 0x00,
  0x20, 0x00, 0x20, 0x01, 0xac,                              // local.get 0, local.get 1, i64.extend_i32_s
  0x42, 0xe0, 0xd4, 0x03,                                    // i64.const 60000 (LEB128 con signo)
  0x7e, 0x7c, 0x0b,                                          // i64.mul, i64.add, end
]);
const { instance } = await WebAssembly.instantiate(bytes);
const { addMinutes } = instance.exports;
const concertStart = Date.UTC(2026, 9, 20, 16, 30); // un number

// 🐛 Un i64 solo acepta BigInt: un number, aunque sea entero, lanza TypeError.
try {
  addMinutes(concertStart, 45);
} catch (error) {
  console.log(`🐛 addMinutes(number, 45) → ${error.name}: ${error.message}`);
}
// ✅ Con BigInt funciona, y lo que devuelve también es BigInt.
const doorsClose = addMinutes(BigInt(concertStart), 45);
console.log('✅ addMinutes(BigInt, 45) →', doorsClose, '| typeof →', typeof doorsClose);
// 🐛 Un BigInt no se mezcla con un number sin convertirlo…
try {
  console.log(doorsClose + 1000);
} catch (error) {
  console.log(`🐛 resultado + 1000 → ${error.name}: ${error.message}`);
}
// ✅ …y Number() es exacto mientras el valor sea menor que 2 ** 53 (Number.MAX_SAFE_INTEGER).
console.log('✅ como fecha →', new Date(Number(doorsClose)).toISOString());

// i64 también da la vuelta: al pasar de 2 ** 63 - 1 salta a los negativos,
// igual que BigInt.asIntN(64, …) (lección «Bits y bytes»).
const limit = 2n ** 63n - 1n;
console.log('addMinutes(2n ** 63n - 1n, 1) →', addMinutes(limit, 1));
console.log('BigInt.asIntN(64, … + 60000n) →', BigInt.asIntN(64, limit + 60000n));
// Los minutos son un i32: ahí se pasa un number. Un BigInt en un i32 también falla.
try {
  addMinutes(BigInt(concertStart), 45n);
} catch (error) {
  console.log(`🐛 minutos como BigInt → ${error.name}: ${error.message}`);
}
```

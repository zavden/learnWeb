---
example_description: "La familia de typed arrays: cuántos bytes ocupa cada elemento (BYTES_PER_ELEMENT), qué rango cabe y su dtype de numpy; los mismos 8 bits a 1 se leen como 255 o como -1 según la vista, y BigInt64Array solo acepta BigInt"
example_tags: "javascript|python|typed-arrays|bigint64array|float16array|numpy"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Once tipos (doce con Float16Array): cambia el tamaño de cada elemento y cómo se leen sus bits.
const FAMILY = [
  [Int8Array, '-128 … 127', 'int8'],
  [Uint8Array, '0 … 255', 'uint8'],
  [Uint8ClampedArray, '0 … 255 (satura)', '—'],
  [Int16Array, '-32768 … 32767', 'int16'],
  [Uint16Array, '0 … 65535', 'uint16'],
  [Int32Array, '-2147483648 … 2147483647', 'int32'],
  [Uint32Array, '0 … 4294967295', 'uint32'],
  [Float16Array, '±65504, ~3 cifras', 'float16'],     // en Chrome desde 2025
  [Float32Array, '±3.4e38, ~7 cifras', 'float32'],
  [Float64Array, '±1.8e308, ~16 cifras (= number)', 'float64'],
  [BigInt64Array, '-(2 ** 63) … 2 ** 63 - 1, BigInt', 'int64'],
  [BigUint64Array, '0 … 2 ** 64 - 1, BigInt', 'uint64'],
];
for (const [Type, range, dtype] of FAMILY) {
  console.log(`${Type.name.padEnd(17)} ${Type.BYTES_PER_ELEMENT} B  ${range.padEnd(34)} numpy: ${dtype}`);
}

// Los mismos bits, leídos por dos vistas distintas: el tipo es solo una forma de leer.
const buffer = new ArrayBuffer(2);
new Uint8Array(buffer).fill(0xff); // los 16 bits a 1
console.log('Uint8Array →', new Uint8Array(buffer));   // [255, 255]
console.log('Int8Array →', new Int8Array(buffer));     // [-1, -1]: complemento a dos
console.log('Uint16Array →', new Uint16Array(buffer)); // [65535]
console.log('Int16Array →', new Int16Array(buffer));   // [-1]

// BigInt64Array: sus elementos son BigInt, no number (lección anterior).
const orderIds = new BigInt64Array(2);
orderIds[0] = 103892072267927557n;
try {
  orderIds[1] = 5; // 🐛 un number no se convierte solo
} catch (error) {
  console.log('orderIds[1] = 5 →', error.name, '|', error.message);
}
orderIds[1] = -1n;
console.log('orderIds →', orderIds);
console.log('como BigUint64Array →', new BigUint64Array(orderIds.buffer)[1]); // -1n sin signo
```

---
example_description: "Math.fround(x) devuelve el float32 más cercano a x, como lo guardaría un Float32Array: 0.5 es exacto, 0.1 y 1/3 cambian, 16777217 baja a 16777216, 1e39 se vuelve Infinity y 1e-46 se vuelve 0; Math.fround(x) === x dice si x cabe exacto"
example_tags: "javascript|python|math-fround|float32|precision|redondeo"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Math.fround(x): redondea x al float32 más cercano y lo devuelve como number.
// Es exactamente lo que hace un Float32Array al guardar.
const SAMPLES = [
  [0.5, 'potencia de 2: exacta'],
  [0.1, 'periódico en binario'],
  [1 / 3, 'periódico en binario'],
  [16777217, '2 ** 24 + 1: no caben sus 25 bits'],
  [3.4e38, 'cerca del máximo de float32'],
  [1e39, 'por encima del máximo'],
  [1e-40, 'subnormal: menos precisión'],
  [1e-46, 'por debajo del mínimo'],
];
for (const [value, note] of SAMPLES) {
  const rounded = Math.fround(value);
  console.log(`${String(value).padEnd(20)} → ${String(rounded).padEnd(24)} ${rounded === value ? '✓ exacto' : '≈ cambia'}  (${note})`);
}

// Math.fround(x) === x: ¿cabe x exactamente en un float32?
const fitsFloat32 = (x) => Math.fround(x) === x;
console.log('¿caben? →', [0.25, 0.75, 0.2, 1024.5, 1024.1].map(fitsFloat32));

// Encadenar cuentas con fround imita una CPU que calcula en float32 (lo que hace la GPU):
const a = Math.fround(0.1);
const b = Math.fround(0.2);
console.log('float32: 0.1 + 0.2 →', Math.fround(a + b)); // 0.30000001192092896
console.log('float64: 0.1 + 0.2 →', 0.1 + 0.2);          // 0.30000000000000004
// Python: numpy.float32(0.1) + numpy.float32(0.2) → 0.3 en pantalla, el mismo float32 por dentro.
```

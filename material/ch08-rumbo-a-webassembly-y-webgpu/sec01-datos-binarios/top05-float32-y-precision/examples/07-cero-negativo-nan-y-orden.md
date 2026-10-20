---
example_description: "En float32, -0 es el bit de signo encendido y NaN es cualquier patrón con el exponente a unos y la mantisa distinta de 0; includes encuentra NaN e indexOf no, y sort() de un Float32Array ordena -0 antes que 0 y NaN al final"
example_tags: "javascript|float32array|nan|cero-negativo|sort|ieee-754"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
const hex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');
const bytesOf = (value) => hex(new Uint8Array(Float32Array.of(value).buffer).reverse()); // de mayor a menor

// -0 y 0 solo se diferencian en el bit de signo (el primero):
console.log('0  →', bytesOf(0));  // 00 00 00 00
console.log('-0 →', bytesOf(-0)); // 80 00 00 00
// Un Float32Array conserva el signo del cero (la lección «Números» explicó dónde asoma):
console.log('Object.is(f32[0], -0) →', Object.is(Float32Array.of(-0)[0], -0)); // true

// NaN no es un valor, es una FAMILIA: exponente 11111111 y cualquier mantisa distinta de 0.
const view = new DataView(new ArrayBuffer(4));
for (const pattern of [0x7fc00000, 0x7f800001, 0xffffffff]) {
  view.setUint32(0, pattern);
  console.log(`bits ${pattern.toString(16)} →`, view.getFloat32(0));
}
console.log('NaN que escribe Float32Array →', bytesOf(NaN)); // 7f c0 00 00

// Buscar NaN en un typed array: igual que en los arrays (lección «Números»).
const readings = Float32Array.of(21.5, NaN, -0, 0, 19.25);
console.log('indexOf(NaN) →', readings.indexOf(NaN), '| includes(NaN) →', readings.includes(NaN)); // -1 | true
console.log('indexOf(0) →', readings.indexOf(0), '(el -0 cuenta como 0)');

// sort() de un typed array ordena por valor y define un orden total:
// -0 antes que 0 y los NaN al final (Array#sort, sin función, los ordenaría como texto).
const sorted = Float32Array.of(19.25, NaN, 0, -0, -3.5).sort();
console.log('sort →', sorted);
console.log('¿el segundo es -0? →', Object.is(sorted[1], -0));
```

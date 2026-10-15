---
example_description: "Una vista de Uint32Array tiene que empezar en un múltiplo de 4 y cubrir un múltiplo de 4 bytes: new Uint32Array(buffer, 1) lanza RangeError; byteOffset y byteLength cuentan bytes, length cuenta elementos; soluciones: copiar a un búfer alineado o DataView"
example_tags: "javascript|typed-arrays|alineacion|byteoffset|rangeerror|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Un archivo pequeño: 1 byte de versión y, detrás, dos enteros de 32 bits
// (10000 y 20000, con sus bytes en orden little-endian: lección siguiente).
const file = Uint8Array.of(2, 0x10, 0x27, 0, 0, 0x20, 0x4e, 0, 0).buffer;
console.log('byteLength →', file.byteLength); // 9

// 🐛 Una vista de 4 bytes por elemento tiene que empezar en un múltiplo de 4…
try {
  new Uint32Array(file, 1, 2); // empieza en el byte 1
} catch (error) {
  console.log('🐛', error.name, '|', error.message);
}
// 🐛 …y, sin longitud, el resto del búfer tiene que medir un múltiplo de 4.
try {
  new Uint32Array(file); // 9 bytes no son un número entero de elementos
} catch (error) {
  console.log('🐛', error.name, '|', error.message);
}

// ✅ 1. Copiar los bytes a un búfer nuevo, que empieza alineado.
//    (ArrayBuffer también tiene slice, y también copia.)
const values = new Uint32Array(file.slice(1));
console.log('✅ copia alineada →', values);
// ✅ 2. DataView lee en cualquier posición, sin alinear (lección siguiente).
const view = new DataView(file);
console.log('✅ DataView →', view.getUint32(1, true), view.getUint32(5, true));

// byteOffset y byteLength se miden en BYTES; length, en ELEMENTOS.
const second = new Uint16Array(file.slice(1), 4, 2); // desde el byte 4, 2 elementos
console.log('byteOffset →', second.byteOffset, '| byteLength →', second.byteLength, '| length →', second.length);
// 🐛 La longitud del constructor también es en elementos: new Uint16Array(buf, 4, 4)
//    pediría 8 bytes desde el byte 4, y el búfer solo tiene 8.
try {
  new Uint16Array(file.slice(1), 4, 4);
} catch (error) {
  console.log('🐛', error.name, '|', error.message);
}
```

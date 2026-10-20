---
example_description: "Comprobar el CRC-32 de cada fragmento de un PNG con una tabla escrita a mano: operadores de bits sobre un Uint32Array, DataView en big-endian para leer longitudes y CRC guardados, y una copia con un bit cambiado (slice, no subarray) que el CRC detecta"
example_tags: "javascript|crc32|png|bits|uint32array|dataview|integridad|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// CRC-32: el código de comprobación de PNG, ZIP y Ethernet. Se calcula byte a byte
// con una tabla de 256 valores de 32 bits, construida con desplazamientos y XOR.
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let bit = 0; bit < 8; bit += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; // >>>: sin signo (lección «Bits y bytes»)
  }
  CRC_TABLE[n] = c; // el Uint32Array guarda los 32 bits sin signo
}
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0; // ✅ >>> 0: si no, la mitad de los CRC saldrían negativos
}
const hex8 = (value) => value.toString(16).padStart(8, '0');

// El valor de control de CRC-32: el texto «123456789» da siempre cbf43926.
console.log('crc32("123456789") →', hex8(crc32(new TextEncoder().encode('123456789'))));

// Recorre los fragmentos y compara el CRC guardado con el calculado sobre «tipo + datos».
function checkChunks(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const results = [];
  for (let offset = 8; offset + 12 <= bytes.length; ) {
    const length = view.getUint32(offset, false);           // PNG: big-endian
    const typeAndData = bytes.subarray(offset + 4, offset + 8 + length); // leer: subarray
    const type = String.fromCharCode(...typeAndData.subarray(0, 4));
    const stored = view.getUint32(offset + 8 + length, false);
    const computed = crc32(typeAndData);
    results.push(`${stored === computed ? '✅' : '❌'} ${type} · guardado ${hex8(stored)} · calculado ${hex8(computed)}`);
    offset += 12 + length;
  }
  return results;
}

const original = new Uint8Array(await (await fetch('tile.png')).arrayBuffer());
console.log('▶ tile.png');
for (const line of checkChunks(original)) console.log('  ' + line);

// Una copia estropeada: un solo bit cambiado en el ancho (byte 19 del archivo).
// slice COPIA: con subarray estropearíamos también el original.
const damaged = original.slice();
damaged[19] ^= 0b0000_0001; // ancho 8 → 9
console.log('▶ copia con un bit cambiado');
for (const line of checkChunks(damaged)) console.log('  ' + line);
console.log('¿el original sigue intacto? →', checkChunks(original).every((line) => line.startsWith('✅')));
```

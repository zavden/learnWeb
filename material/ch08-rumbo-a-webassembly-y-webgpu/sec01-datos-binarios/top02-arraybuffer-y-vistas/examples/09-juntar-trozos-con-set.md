---
example_description: "set(origen, posición) copia bytes dentro de un typed array: así se juntan los trozos de una descarga en un solo bloque; si no caben, RangeError; fill y copyWithin completan las copias dentro del búfer"
example_tags: "javascript|typed-arrays|set|trozos|streams|copywithin"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
const hex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');

// Tres trozos de una descarga, como los que entrega un reader (lección «Streams y
// progreso»): son los primeros bytes de un archivo PNG.
const chunks = [
  Uint8Array.of(0x89, 0x50, 0x4e, 0x47),
  Uint8Array.of(0x0d, 0x0a, 0x1a, 0x0a),
  Uint8Array.of(0x00, 0x00, 0x00, 0x0d, 0x49, 0x48),
];

// 1. Reservar un bloque del tamaño total. 2. Copiar cada trozo en su posición con set.
const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
const file = new Uint8Array(total);
let offset = 0;
for (const chunk of chunks) {
  file.set(chunk, offset); // copia los bytes de chunk a partir de file[offset]
  offset += chunk.byteLength;
}
console.log(`${total} bytes →`, hex(file));
console.log('¿empieza por «PNG»? →', String.fromCharCode(...file.subarray(1, 4))); // 'PNG'

// set también acepta arrays normales:
const header = new Uint8Array(6);
header.set([0x42, 0x4d]); // 'BM': la firma de un BMP (lección siguiente)
console.log('header →', hex(header));

// 🐛 Si lo copiado no cabe a partir de esa posición, RangeError (y no copia nada):
try {
  header.set(chunks[0], 4);
} catch (error) {
  console.log('header.set(4 bytes, 4) →', error.name, '|', error.message);
}

// fill rellena un tramo; copyWithin copia un tramo del propio array a otra posición.
header.fill(0xff, 2, 4);      // bytes 2 y 3
header.copyWithin(4, 0, 2);   // copia los bytes 0-1 en la posición 4
console.log('fill + copyWithin →', hex(header)); // 42 4d ff ff 42 4d

// [...a, ...b] también junta, pero crea un Array normal elemento a elemento:
// con millones de bytes es mucho más lento y ocupa varias veces más memoria.
```

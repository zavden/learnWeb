---
example_description: "Un Blob son bytes inmutables con un tipo MIME: se crea con partes (strings en UTF-8, typed arrays, otros Blobs), size cuenta bytes, slice no copia, y se lee con promesas: text(), arrayBuffer(), bytes() y stream()"
example_tags: "javascript|python|blob|bytes|csv|streams|promesas"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const hex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');

// Un Blob (Binary Large OBject): bytes que no cambian + un tipo MIME.
// Se construye con un array de «partes»: strings, typed arrays, ArrayBuffers u otros Blobs.
const bom = Uint8Array.of(0xef, 0xbb, 0xbf); // la BOM, para que Excel lo abra como UTF-8
const rows = ['producto;unidades\n', 'Café de Chiapas;14\n', 'Cacao de Tabasco;6\n'];
const csv = new Blob([bom, ...rows], { type: 'text/csv;charset=utf-8' });

// size cuenta BYTES: los strings se guardan en UTF-8 (la «é» ocupa 2).
const characters = rows.join('').length;
console.log('size →', csv.size, 'bytes | caracteres →', characters, '| type →', csv.type);

// Sus bytes no se leen directamente: los métodos de lectura devuelven promesas.
console.log('text() →', JSON.stringify(await csv.text())); // decodifica UTF-8 y quita la BOM
const bytes = new Uint8Array(await csv.arrayBuffer());
console.log('arrayBuffer() → empieza por', hex(bytes.subarray(0, 6)));
console.log('bytes() →', (await csv.bytes()).length, 'bytes en un Uint8Array'); // en Chrome desde 2025

// slice(inicio, fin, tipo) crea otro Blob con una parte, sin copiar los bytes.
const headerRow = csv.slice(3, 21, 'text/plain');
console.log('slice →', headerRow.size, 'bytes', headerRow.type, JSON.stringify(await headerRow.text()));

// Un Blob no se modifica: para «añadir» una fila se crea otro, con el anterior como parte.
const withTotal = new Blob([csv, 'Total;20\n'], { type: csv.type });
console.log('csv.size sigue →', csv.size, '| withTotal.size →', withTotal.size);

// stream() lo entrega por trozos, como el cuerpo de una respuesta (lección «Streams y progreso»).
let received = 0;
for await (const chunk of withTotal.stream()) received += chunk.byteLength;
console.log('stream() →', received, 'bytes leídos por trozos');

// Python no tiene un tipo así: lo más parecido son unos bytes con su tipo MIME al lado,
// o un archivo temporal. Un Blob grande puede vivir en disco y no en la memoria de la página.
```

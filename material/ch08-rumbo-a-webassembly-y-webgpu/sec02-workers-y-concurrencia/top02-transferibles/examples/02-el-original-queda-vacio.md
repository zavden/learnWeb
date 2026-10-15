---
example_description: "Después de transferir un búfer, todas sus vistas quedan vacías sin error (length 0, leer da undefined, escribir se ignora), transferirlo otra vez lanza DataCloneError, y transferir el búfer de un subarray se lleva el búfer entero; la solución: transferir una copia del trozo hecha con slice"
example_tags: "javascript|workers|transferibles|detached|subarray|slice|datacloneerror|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un worker que solo responde cuántos bytes tiene el búfer que recibió.
const url = URL.createObjectURL(new Blob(['self.onmessage = (event) => self.postMessage(event.data.buffer.byteLength);'], { type: 'text/javascript' }));
const worker = new Worker(url);
URL.revokeObjectURL(url);
const reply = () => new Promise((resolve) => { worker.onmessage = (event) => resolve(event.data); });

// Los píxeles RGBA de un mosaico de 64 × 64 de una foto, y una vista de su primera fila.
const pixels = new Uint8ClampedArray(64 * 64 * 4).fill(200);
const firstRow = pixels.subarray(0, 64 * 4);
worker.postMessage(pixels, [pixels.buffer]);
console.log('worker: recibió', await reply(), 'bytes');

// 🐛 1. TODAS las vistas del búfer transferido quedan vacías, sin ningún error.
console.log('🐛 pixels.length →', pixels.length, '| pixels[0] →', pixels[0]);
pixels[0] = 255; // escribir tampoco falla: se ignora
console.log('🐛 tras pixels[0] = 255 →', pixels[0]);
console.log('🐛 firstRow.length →', firstRow.length, '| byteLength del búfer →', pixels.buffer.byteLength);

// 🐛 2. Transferir otra vez lo ya transferido lanza DataCloneError.
try {
  worker.postMessage(pixels.buffer, [pixels.buffer]);
} catch (error) {
  console.log(`🐛 ${error.name}: ${error.message}`);
}

// 🐛 3. La lista de transferencia lleva BÚFERES, no vistas: el búfer de un
// subarray es el de la foto entera, y se va entero.
const photo = new Uint8ClampedArray(1024).fill(90);
const header = photo.subarray(0, 16);
worker.postMessage(header, [header.buffer]);
console.log('🐛 worker: recibió', await reply(), 'bytes (querías 16) · photo.length →', photo.length);

// ✅ slice copia el trozo a un búfer propio: se transfiere esa copia y la foto se queda.
const photo2 = new Uint8ClampedArray(1024).fill(90);
const headerCopy = photo2.slice(0, 16);
worker.postMessage(headerCopy, [headerCopy.buffer]);
console.log('✅ worker: recibió', await reply(), 'bytes · photo2.length →', photo2.length);
worker.terminate();
```

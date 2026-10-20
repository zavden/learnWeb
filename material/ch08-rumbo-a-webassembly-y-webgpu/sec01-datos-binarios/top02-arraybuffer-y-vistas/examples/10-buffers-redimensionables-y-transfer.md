---
example_description: "ArrayBuffer redimensionable (maxByteLength y resize) con una vista que sigue su tamaño y otra de longitud fija; transfer() mueve los bytes a un búfer nuevo y deja el viejo desconectado (byteLength 0), como al enviarlo a un worker"
example_tags: "javascript|arraybuffer|resize|transfer|detached|workers"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Un ArrayBuffer normal no cambia de tamaño. Uno redimensionable (en Chrome desde 2023)
// se crea con un máximo y crece o encoge con resize() hasta ese máximo.
const buffer = new ArrayBuffer(4, { maxByteLength: 16 });
console.log('resizable →', buffer.resizable, '| byteLength →', buffer.byteLength, '| máximo →', buffer.maxByteLength);

const tracking = new Uint8Array(buffer);    // sin longitud: SIGUE el tamaño del búfer
const fixed = new Uint8Array(buffer, 0, 2); // con longitud: siempre 2 elementos
tracking.set([1, 2, 3, 4]);

buffer.resize(8); // los bytes que había se conservan; los nuevos empiezan a 0
console.log('tras resize(8) → tracking', tracking, '| fixed', fixed);

try {
  buffer.resize(32); // más allá del máximo
} catch (error) {
  console.log('resize(32) →', error.name, '|', error.message);
}

// transfer() MUEVE los bytes a un búfer nuevo (sin copiarlos, si puede) y deja el
// viejo «desconectado» (detached): vacío y sin uso posible.
const moved = buffer.transfer();
console.log('nuevo →', moved, '| bytes →', new Uint8Array(moved));
console.log('viejo →', buffer, '| detached →', buffer.detached);
// Las vistas del búfer viejo se quedan vacías: leer da undefined y escribir no hace nada.
tracking[0] = 99;
console.log('vista vieja →', tracking.length, tracking[0]); // 0 undefined

// Es lo que pasa al TRANSFERIR un búfer a un worker con postMessage: el original
// queda vacío (módulo «Workers y concurrencia»). Y la memoria de WebAssembly es un
// búfer que crece así (módulo «WebAssembly»).
```

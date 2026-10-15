---
example_description: "Otras formas de mover un búfer sin copiarlo, en el mismo hilo: structuredClone(valor, { transfer }), buffer.transfer() y buffer.transfer(n), que además cambia el tamaño; y un mensaje que transfiere un búfer grande y copia uno pequeño"
example_tags: "javascript|transferibles|structuredclone|arraybuffer|transfer|detached"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// 1. structuredClone acepta la misma lista de transferencia que postMessage:
//    «envía» el valor a… este mismo hilo, moviendo el búfer en lugar de copiarlo.
const frame = new Uint8Array([10, 20, 30, 40]);
const movedFrame = structuredClone(frame, { transfer: [frame.buffer] });
console.log('structuredClone → nuevo', movedFrame, '| viejo', frame, '· detached:', frame.buffer.detached);

// 2. buffer.transfer() (lección «ArrayBuffer y vistas»): mueve los bytes a un
//    búfer nuevo y desconecta el viejo, sin clonar nada más.
const audio = new Float32Array([0.5, -0.25]).buffer;
const audioMoved = audio.transfer();
console.log('transfer() → nuevo', audioMoved.byteLength, 'bytes | viejo', audio.byteLength);

// 3. transfer(n) mueve y cambia el tamaño a la vez: los bytes nuevos valen 0.
const grown = audioMoved.transfer(16);
console.log('transfer(16) →', new Float32Array(grown), '| el anterior', audioMoved.byteLength);

// 4. En un mismo mensaje, lo que está en la lista se mueve y lo demás se copia.
const tile = new Uint8Array(1_000_000);    // un mosaico grande: se transfiere
const palette = new Uint8Array([255, 0, 124]); // tres bytes: no merece la pena
const message = structuredClone({ tile, palette }, { transfer: [tile.buffer] });
console.log('aquí → tile', tile.byteLength, '(transferido) · palette', palette.byteLength, '(copiado)');
console.log('allí → tile', message.tile.byteLength, '· palette', message.palette.byteLength);

// ¿Para qué sirve mover dentro del mismo hilo? Para «entregar» un búfer a otra
// parte del programa y que la vieja referencia ya no pueda tocarlo: el código
// que se quedó con `frame` no puede cambiar por sorpresa los bytes de `movedFrame`.
```

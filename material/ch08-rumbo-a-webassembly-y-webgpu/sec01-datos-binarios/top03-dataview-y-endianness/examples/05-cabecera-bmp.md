---
example_description: "Leer la cabecera de un BMP con DataView en little-endian: la firma 'BM', el tamaño del archivo, dónde empiezan los píxeles, el ancho, el alto y los bits por píxel; y calcular cuántos bytes ocupa cada fila con su relleno"
example_tags: "javascript|python|dataview|bmp|little-endian|formato-binario|fetch"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
const buffer = await (await fetch('landscape.bmp')).arrayBuffer();
const view = new DataView(buffer);
const LE = true; // BMP es un formato de Windows: todo en little-endian

// Cabecera de archivo (14 bytes) + cabecera de imagen BITMAPINFOHEADER (40 bytes):
//   0  'BM'                    2  tamaño del archivo (u32)    10  posición de los píxeles (u32)
//   14 tamaño de esta cabecera 18 ancho (i32)                 22  alto (i32, ¡con signo!)
//   26 planos (u16)            28 bits por píxel (u16)        30  compresión (u32)
const signature = String.fromCharCode(view.getUint8(0), view.getUint8(1));
const header = {
  signature,
  fileSize: view.getUint32(2, LE),
  pixelOffset: view.getUint32(10, LE),
  headerSize: view.getUint32(14, LE),
  width: view.getInt32(18, LE),
  height: view.getInt32(22, LE),
  bitsPerPixel: view.getUint16(28, LE),
  compression: view.getUint32(30, LE),
};
console.log(header);
console.log('¿tamaño correcto? →', header.fileSize === buffer.byteLength); // nunca te fíes de una cabecera

// Cada píxel de 24 bits son 3 bytes (azul, verde y rojo, en ese orden), y cada FILA
// se rellena con ceros hasta un múltiplo de 4 bytes.
const bytesPerPixel = header.bitsPerPixel / 8;
const rowSize = Math.ceil((header.width * bytesPerPixel) / 4) * 4;
console.log('bytes útiles por fila →', header.width * bytesPerPixel, '| con relleno →', rowSize);
console.log('píxeles →', rowSize * Math.abs(header.height), 'bytes desde la posición', header.pixelOffset);

// 🐛 Leer con el orden equivocado no da error, da números absurdos:
console.log('ancho leído en big-endian →', view.getInt32(18)); // 117440512

// Python: struct.unpack_from('<2sI4xIIiiHH', datos) lee los mismos campos de una vez.
```

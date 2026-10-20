---
example_description: "Un lector binario con cursor (readU8, readU16LE, readU32BE, readAscii, skip…) envuelve un DataView y avanza solo: leer la cabecera de un BMP y la de un PNG se escribe como su especificación, campo a campo y sin calcular posiciones"
example_tags: "javascript|python|dataview|parser|cursor|bmp|png|clases"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Un cursor sobre un DataView: cada lectura devuelve el valor y avanza las posiciones.
class BinaryReader {
  #view;
  offset = 0;

  constructor(buffer) {
    this.#view = new DataView(buffer);
  }
  get remaining() {
    return this.#view.byteLength - this.offset;
  }
  #advance(size) {
    if (size > this.remaining) {
      throw new RangeError(`faltan bytes: pides ${size} en la posición ${this.offset} y quedan ${this.remaining}`);
    }
    const at = this.offset;
    this.offset += size;
    return at;
  }
  readU8() { return this.#view.getUint8(this.#advance(1)); }
  readU16LE() { return this.#view.getUint16(this.#advance(2), true); }
  readU32LE() { return this.#view.getUint32(this.#advance(4), true); }
  readI32LE() { return this.#view.getInt32(this.#advance(4), true); }
  readU32BE() { return this.#view.getUint32(this.#advance(4), false); }
  readAscii(length) {
    const at = this.#advance(length);
    return String.fromCharCode(...new Uint8Array(this.#view.buffer, at, length));
  }
  skip(length) { this.#advance(length); }
}

const [bmpBuffer, pngBuffer] = await Promise.all(
  ['landscape.bmp', 'tile.png'].map(async (file) => (await fetch(file)).arrayBuffer()),
);

// BMP: se lee como su especificación, campo a campo, sin calcular posiciones a mano.
const bmp = new BinaryReader(bmpBuffer);
const signature = bmp.readAscii(2);
const fileSize = bmp.readU32LE();
bmp.skip(4); // 4 bytes reservados, que no se usan
const pixelOffset = bmp.readU32LE();
const headerSize = bmp.readU32LE();
const width = bmp.readI32LE();
const height = bmp.readI32LE();
const planes = bmp.readU16LE();
const bitsPerPixel = bmp.readU16LE();
console.log('BMP →', { signature, fileSize, pixelOffset, headerSize, width, height, planes, bitsPerPixel });
console.log('cursor en →', bmp.offset, '| quedan →', bmp.remaining);

// PNG: firma, longitud y tipo del primer fragmento, y el IHDR (big-endian).
const png = new BinaryReader(pngBuffer);
png.skip(8); // la firma
const chunkLength = png.readU32BE();
const chunkType = png.readAscii(4);
console.log('PNG →', chunkType, chunkLength, 'bytes:', png.readU32BE(), '×', png.readU32BE(), '| cursor en', png.offset);

// Un archivo cortado no lee basura: el lector avisa con un mensaje que dice dónde.
try {
  const truncated = new BinaryReader(bmpBuffer.slice(0, 20));
  truncated.skip(18);
  truncated.readU32LE();
} catch (error) {
  console.log('archivo cortado →', error.name, '|', error.message);
}

// Python: es lo que hacen struct.unpack_from(formato, datos, offset) más un offset
// que avanzas tú, o io.BytesIO(datos).read(n) con struct.unpack.
```

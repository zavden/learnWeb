---
example_description: "Solución: el lector binario con cursor completo; readU16LE y readU32BE leen con DataView en el orden de cada formato y readString decodifica UTF-8 con un TextDecoder estricto, todo a través de #take, que avanza el cursor y detecta los archivos cortados"
example_tags: "javascript|dataview|cursor|endianness|textdecoder|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
class BinaryReader {
  #bytes;
  #view;
  #decoder = new TextDecoder('utf-8', { fatal: true }); // ✅ bytes inválidos → TypeError, no �
  offset = 0;

  constructor(bytes) {
    this.#bytes = bytes;
    this.#view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }
  // Reserva `size` bytes: devuelve dónde empiezan y avanza el cursor (ya hecho).
  #take(size) {
    if (this.offset + size > this.#bytes.length) {
      throw new RangeError(`faltan bytes: pides ${size} en la posición ${this.offset}`);
    }
    const start = this.offset;
    this.offset += size;
    return start;
  }
  readU8() {
    return this.#view.getUint8(this.#take(1)); // el modelo: reservar y leer
  }
  readU16LE() {
    return this.#view.getUint16(this.#take(2), true); // ✅ little-endian: tercer argumento true
  }
  readU32BE() {
    return this.#view.getUint32(this.#take(4), false); // ✅ big-endian: false (escrito, aunque sea el defecto)
  }
  readString(length) {
    const start = this.#take(length); // ✅ también avanza y comprueba lo que queda
    return this.#decoder.decode(this.#bytes.subarray(start, start + length)); // subarray: leer sin copiar
  }
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, run, expected) {
  let actual;
  try {
    actual = JSON.stringify(run());
  } catch (error) {
    actual = JSON.stringify(error.name);
  }
  if (actual === JSON.stringify(expected)) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', JSON.stringify(expected), 'y obtuve', actual);
}
const reader = (...bytes) => new BinaryReader(Uint8Array.from(bytes));

check('readU16LE de 34 12 → 0x1234', () => reader(0x34, 0x12).readU16LE(), 0x1234);
check('readU32BE de 00 00 01 00 → 256', () => reader(0x00, 0x00, 0x01, 0x00).readU32BE(), 256);
check('readString(5) de «Café» en UTF-8', () => reader(0x43, 0x61, 0x66, 0xc3, 0xa9).readString(5), 'Café');
check('un registro: año (u16 LE), ciudad (u8 + texto) y gramos (u32 BE)', () => {
  const city = new TextEncoder().encode('Mérida');
  const record = reader(0xea, 0x07, city.length, ...city, 0x00, 0x00, 0x05, 0xdc);
  const parsed = { year: record.readU16LE(), city: record.readString(record.readU8()), grams: record.readU32BE() };
  return { ...parsed, offset: record.offset };
}, { year: 2026, city: 'Mérida', grams: 1500, offset: 14 });
check('un archivo cortado lanza RangeError', () => reader(0x00, 0x00, 0x01).readU32BE(), 'RangeError');
check('bytes que no son UTF-8 lanzan TypeError', () => reader(0x43, 0xf3, 0x6e).readString(3), 'TypeError');
```

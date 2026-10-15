---
example_description: "Ejercicio: completa un lector binario con cursor (readU16LE, readU32BE, readString) sobre un DataView; las comprobaciones leen enteros en los dos órdenes de bytes, texto UTF-8 con tildes, un registro completo y dos casos que deben fallar: un archivo cortado y bytes que no son UTF-8"
example_tags: "javascript|dataview|cursor|endianness|textdecoder|ejercicio"
exercise: true
exercise_title: "Un lector binario con cursor"
exercise_instructions: "BinaryReader envuelve unos bytes y avanza un cursor (offset) con cada lectura; readU8 ya está hecho y sirve de modelo || Completa readU16LE: un entero sin signo de 16 bits en little-endian || Completa readU32BE: un entero sin signo de 32 bits en big-endian || Completa readString(length): length bytes de UTF-8 convertidos en texto, con un TextDecoder que falle ante bytes inválidos || Usa siempre #take(size) para reservar los bytes: avanza el cursor y lanza RangeError si no quedan bastantes || Ejecuta hasta que las seis comprobaciones salgan ✅"
exercise_hints: "#take(2) devuelve la posición donde empiezan los 2 bytes; pásasela a getUint16 junto con el orden de bytes || El tercer argumento de DataView: true para little-endian, false para big-endian || Para el texto: los bytes son this.#bytes.subarray(inicio, inicio + length), y new TextDecoder('utf-8', { fatal: true }) los decodifica"
exercise_solution_example: 07-ej-lector-binario-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
class BinaryReader {
  #bytes;
  #view;
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
    // TODO: entero sin signo de 16 bits, little-endian
    return 0;
  }
  readU32BE() {
    // TODO: entero sin signo de 32 bits, big-endian
    return 0;
  }
  readString(length) {
    // TODO: `length` bytes de UTF-8 → texto (TextDecoder con { fatal: true })
    return '';
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

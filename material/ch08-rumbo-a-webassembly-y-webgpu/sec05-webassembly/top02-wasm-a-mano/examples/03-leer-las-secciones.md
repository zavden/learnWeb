---
example_description: "Un lector con cursor que entiende LEB128 recorre un .wasm sección a sección (id, tamaño, contenido) y escribe un volcado hexadecimal comentado: firma, versión, tipos, funciones, exportaciones y código"
example_tags: "javascript|webassembly|wasm|parser|leb128|cursor|hexdump|secciones"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Los 41 bytes del módulo add del ejemplo anterior.
const bytes = fromHex(`
  00 61 73 6d 01 00 00 00 01 07 01 60 02 7f 7f 01 7f 03 02 01 00 07 07 01
  03 61 64 64 00 00 0a 09 01 07 00 20 00 20 01 6a 0b
`);
const SECTIONS = { 0: 'personalizada', 1: 'tipos', 2: 'importaciones', 3: 'funciones', 5: 'memoria', 6: 'globales', 7: 'exportaciones', 8: 'inicio', 10: 'código', 11: 'datos' };
const TYPES = { 0x7f: 'i32', 0x7e: 'i64', 0x7d: 'f32', 0x7c: 'f64' };
const KINDS = ['función', 'tabla', 'memoria', 'global'];

// Un cursor como el de la lección «DataView y endianness», que además lee LEB128.
let offset = 0;
const u8 = () => bytes[offset++];
function uleb() { // LEB128 sin signo: 7 bits por byte, del menos al más significativo
  let result = 0;
  let shift = 0;
  let byte;
  do {
    byte = u8();
    result |= (byte & 0x7f) << shift;
    shift += 7;
  } while (byte & 0x80); // bit alto encendido: sigue otro byte
  return result >>> 0;
}
const list = (readItem) => Array.from({ length: uleb() }, readItem); // un vector: cuántos + elementos
function readName() { // un nombre: su longitud en bytes (LEB128) y sus bytes UTF-8
  const length = uleb();
  const text = new TextDecoder().decode(bytes.subarray(offset, offset + length));
  offset += length;
  return text;
}

// Cada línea del volcado: la posición, los bytes leídos desde `start` y qué significan.
function row(start, note) {
  const cells = Array.from(bytes.subarray(start, offset), (byte) => byte.toString(16).padStart(2, '0')).join(' ');
  console.log(`${start.toString(16).padStart(4, '0')}  ${cells.padEnd(27)} ${note}`);
}

offset = 4; row(0, 'firma «\\0asm»');
offset = 8; row(4, 'versión 1');
while (offset < bytes.length) {
  let start = offset;
  const id = u8();
  const size = uleb();
  row(start, `sección ${id} (${SECTIONS[id]}): ${size} bytes`);
  start = offset;
  if (id === 1) {
    const signatures = list(() => {
      u8(); // 0x60: «esto es un tipo de función»
      const params = list(() => TYPES[u8()]);
      const results = list(() => TYPES[u8()]);
      return `(${params.join(', ')}) → ${results.join(', ')}`;
    });
    row(start, signatures.map((text, index) => `tipo ${index}: ${text}`).join('; '));
  } else if (id === 3) {
    row(start, list(() => uleb()).map((type, index) => `función ${index}: tipo ${type}`).join('; '));
  } else if (id === 7) {
    row(start, list(() => `«${readName()}» → ${KINDS[u8()]} ${uleb()}`).join('; '));
  } else if (id === 10) {
    const sizes = list(() => { const bodySize = uleb(); offset += bodySize; return bodySize; });
    row(start, sizes.map((bodySize, index) => `cuerpo de la función ${index}: ${bodySize} bytes`).join('; '));
  } else {
    offset = start + size; // una sección que no conoce: se salta leyendo solo su tamaño
    row(start, 'contenido sin descifrar');
  }
}

function fromHex(text) {
  return Uint8Array.from(text.trim().split(/\s+/), (pair) => parseInt(pair, 16));
}
```

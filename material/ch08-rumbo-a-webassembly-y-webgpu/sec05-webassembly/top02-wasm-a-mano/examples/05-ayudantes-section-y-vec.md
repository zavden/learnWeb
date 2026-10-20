---
example_description: "Cuatro ayudantes (uleb, vec, str y section) calculan cada tamaño: reproducen los 41 bytes de add, construyen un módulo con add y sub, y una sección personalizada de más de 127 bytes muestra un tamaño LEB128 de dos bytes, leído después con customSections"
example_tags: "javascript|webassembly|wasm|leb128|secciones|ayudantes|custom-section"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
const encoder = new TextEncoder();
// LEB128 sin signo (ejemplo «Enteros LEB128» del módulo «Datos binarios»): 7 bits por byte.
function uleb(value) {
  const bytes = [];
  do {
    let byte = value & 0x7f;
    value >>>= 7;
    if (value !== 0) byte |= 0x80; // quedan bits: «sigue otro byte»
    bytes.push(byte);
  } while (value !== 0);
  return bytes;
}
const vec = (items) => [...uleb(items.length), ...items.flat()];        // cuántos + elementos
const str = (text) => vec([...encoder.encode(text)]);                    // un nombre en UTF-8
const section = (id, contents) => [id, ...uleb(contents.length), ...contents]; // id + tamaño + contenido
const funcType = (params, results) => [0x60, ...vec(params), ...vec(results)];
const body = (code) => vec([...vec([]), ...code, 0x0b]); // 0 grupos de locales + código + end, con su tamaño
const HEADER = [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00];
const I32 = 0x7f;
const hex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');

// 1. El módulo add del ejemplo 02, sin contar ningún tamaño a mano:
const add = new Uint8Array([
  ...HEADER,
  ...section(1, vec([funcType([I32, I32], [I32])])),
  ...section(3, vec([0])),                                   // función 0 → tipo 0
  ...section(7, vec([[...str('add'), 0x00, 0]])),            // «add» → función 0
  ...section(10, vec([body([0x20, 0, 0x20, 1, 0x6a])])),     // local.get 0, local.get 1, i32.add
]);
const BY_HAND = '00 61 73 6d 01 00 00 00 01 07 01 60 02 7f 7f 01 7f 03 02 01 00 07 07 01 03 61 64 64 00 00 0a 09 01 07 00 20 00 20 01 6a 0b';
console.log('add →', add.length, 'bytes | ¿los mismos que a mano? →', hex(add) === BY_HAND);

// 2. Dos funciones del mismo tipo, add y sub (i32.sub = 0x6b), y una sección
//    PERSONALIZADA (id 0) con un texto: el navegador no la ejecuta, solo la guarda.
const note = 'Módulo de prueba de la lección «WebAssembly a mano». '.repeat(3);
const custom = section(0, [...str('curso'), ...encoder.encode(note)]);
const both = new Uint8Array([
  ...HEADER,
  ...section(1, vec([funcType([I32, I32], [I32])])),
  ...section(3, vec([0, 0])),
  ...section(7, vec([[...str('add'), 0x00, 0], [...str('sub'), 0x00, 1]])),
  ...section(10, vec([body([0x20, 0, 0x20, 1, 0x6a]), body([0x20, 0, 0x20, 1, 0x6b])])),
  ...custom,
]);
const { module, instance } = await WebAssembly.instantiate(both);
console.log('add(7, 5) →', instance.exports.add(7, 5), '| sub(7, 5) →', instance.exports.sub(7, 5));

// Su contenido pasa de 127 bytes, así que su tamaño necesita DOS bytes de LEB128.
console.log('sección personalizada →', custom.length - 3, 'bytes · empieza por', hex(custom.slice(0, 3)));
console.log('uleb(127) →', hex(uleb(127)), '| uleb(128) →', hex(uleb(128)), '| uleb(300) →', hex(uleb(300)));
const [noteBytes] = WebAssembly.Module.customSections(module, 'curso');
console.log('customSections →', new TextDecoder().decode(noteBytes).slice(0, 50) + '…');
```

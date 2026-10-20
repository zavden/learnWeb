---
example_description: "Solución: dos tipos ((i32, i32) → i32 y (i32) → i32), tres funciones (tipos 0, 0 y 1), tres exportaciones y tres cuerpos en el mismo orden; los ayudantes calculan todos los tamaños"
example_tags: "javascript|webassembly|wasm|bytes|secciones|opcodes|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// Los ayudantes de la lección «WebAssembly a mano» (ejemplo 05), tal cual.
const encoder = new TextEncoder();
function uleb(value) {
  const bytes = [];
  do {
    let byte = value & 0x7f;
    value >>>= 7;
    if (value !== 0) byte |= 0x80;
    bytes.push(byte);
  } while (value !== 0);
  return bytes;
}
const vec = (items) => [...uleb(items.length), ...items.flat()];
const str = (text) => vec([...encoder.encode(text)]);
const section = (id, contents) => [id, ...uleb(contents.length), ...contents];
const funcType = (params, results) => [0x60, ...vec(params), ...vec(results)];
const body = (code) => vec([...vec([]), ...code, 0x0b]); // sin locales, el código y end, con su tamaño
const I32 = 0x7f;

const bytes = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  ...section(1, vec([funcType([I32, I32], [I32]), funcType([I32], [I32])])), // ✅ tipo 0 y tipo 1
  ...section(3, vec([0, 0, 1])),                                             // ✅ add: 0 · mul: 0 · square: 1
  ...section(7, vec([
    [...str('add'), 0x00, 0],
    [...str('mul'), 0x00, 1],
    [...str('square'), 0x00, 2],
  ])),
  ...section(10, vec([
    body([0x20, 0, 0x20, 1, 0x6a]), // add: local.get 0 · local.get 1 · i32.add
    body([0x20, 0, 0x20, 1, 0x6c]), // ✅ mul: … · i32.mul
    body([0x20, 0, 0x20, 0, 0x6c]), // ✅ square: local.get 0 · local.get 0 · i32.mul
  ])),
]);

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, run, expected) {
  let actual;
  try {
    actual = run();
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (actual === expected) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', JSON.stringify(expected), 'y obtuve', JSON.stringify(actual));
}
let math = {};
try {
  math = (await WebAssembly.instantiate(bytes)).instance.exports;
} catch (error) {
  console.error('❌ el módulo no compila →', `${error.name}: ${error.message}`);
}
check('exporta add, mul y square', () => Object.keys(math).join(', '), 'add, mul, square');
check('add(2, 3) = 5 (no se ha roto)', () => math.add(2, 3), 5);
check('mul(6, 7) = 42', () => math.mul(6, 7), 42);
check('mul(65536, 65536) = 0 (i32 da la vuelta)', () => math.mul(65536, 65536), 0);
check('square(9) = 81', () => math.square(9), 81);
check('square tiene un solo parámetro', () => math.square.length, 1);
```

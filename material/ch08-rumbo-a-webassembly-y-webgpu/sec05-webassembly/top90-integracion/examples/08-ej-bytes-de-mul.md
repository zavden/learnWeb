---
example_description: "Ejercicio: con los ayudantes section, vec, str y body de la lección «WebAssembly a mano», amplía el módulo de add con dos funciones nuevas, mul (i32.mul) y square (de un solo parámetro, con su propio tipo), exportadas por su nombre"
example_tags: "javascript|webassembly|wasm|bytes|secciones|opcodes|ejercicio"
exercise: true
exercise_title: "Los bytes de mul y square"
exercise_instructions: "El módulo de partida solo tiene add; las comprobaciones esperan también mul(a, b) y square(x) || TODO 1: en la sección de tipos, añade el tipo (i32) → i32 para square (será el tipo 1) || TODO 2: en la sección de funciones, una entrada por función, en orden: add y mul usan el tipo 0, square el tipo 1 || TODO 3: exporta «mul» (función 1) y «square» (función 2) || TODO 4: añade sus cuerpos, en el mismo orden que la sección de funciones: mul es local.get 0, local.get 1 e i32.mul (0x6c); square multiplica el parámetro 0 por sí mismo || Ejecuta hasta que las seis comprobaciones salgan ✅"
exercise_hints: "funcType([I32], [I32]) es el tipo de square || vec([0, 0, 1]) son tres funciones con los tipos 0, 0 y 1 || Una exportación es [...str('nombre'), 0x00, índice]: 0x00 significa «función» || El cuerpo de square es body([0x20, 0, 0x20, 0, 0x6c])"
exercise_solution_example: 08-ej-bytes-de-mul-solucion.md
example_stage: exercise
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
  ...section(1, vec([funcType([I32, I32], [I32])])),     // TODO 1: el tipo 1, (i32) → i32
  ...section(3, vec([0])),                                // TODO 2: add, mul y square
  ...section(7, vec([[...str('add'), 0x00, 0]])),         // TODO 3: «mul» → 1 y «square» → 2
  ...section(10, vec([body([0x20, 0, 0x20, 1, 0x6a])])),  // TODO 4: los cuerpos de mul y square
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

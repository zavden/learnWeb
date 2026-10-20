---
example_description: "Solución: la sección de código mide 19 bytes (0a 13) y 9900 en LEB128 con signo son tres bytes (41 ac cd 00), así que el cuerpo de withShipping pasa de 8 a 9 bytes"
example_tags: "javascript|webassembly|wasm|bytes|secciones|leb128|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// Un módulo de la tienda, escrito byte a byte:
//   (module
//     (func (export "subtotal") (param i32 i32) (result i32)  local.get 0  local.get 1  i32.mul)
//     (func (export "withShipping") (param i32) (result i32)  local.get 0  i32.const 9900  i32.add))
const encoder = new TextEncoder();
const bytes = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  // tipos: 12 bytes · 2 tipos: (i32, i32) → i32 y (i32) → i32
  0x01, 0x0c, 0x02, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f, 0x60, 0x01, 0x7f, 0x01, 0x7f,
  // funciones: 3 bytes · 2 funciones: tipo 0 y tipo 1
  0x03, 0x03, 0x02, 0x00, 0x01,
  // exportaciones: 27 bytes · «subtotal» → función 0 · «withShipping» → función 1
  0x07, 0x1b, 0x02, 0x08, ...encoder.encode('subtotal'), 0x00, 0x00, 0x0c, ...encoder.encode('withShipping'), 0x00, 0x01,
  // código
  0x0a, 0x13,                                                 // ✅ 1 (cuenta) + 1 + 7 + 1 + 9 = 19 bytes
  0x02,                                                       // 2 cuerpos
  0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6c, 0x0b,             // subtotal: 7 bytes · local.get 0 · local.get 1 · i32.mul · end
  0x09, 0x00, 0x20, 0x00, 0x41, 0xac, 0xcd, 0x00, 0x6a, 0x0b, // ✅ withShipping: 9 bytes · i32.const 9900 = 41 ac cd 00
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
let shop = null;
let failure = 'ok';
try {
  shop = (await WebAssembly.instantiate(bytes)).instance.exports;
} catch (error) {
  failure = `${error.name}: ${error.message}`;
}
check('el módulo se compila', () => failure, 'ok');
check('subtotal(3, 2450) = 7350', () => shop.subtotal(3, 2450), 7350);
check('withShipping(7350) = 17250 (el envío son $99.00)', () => shop.withShipping(7350), 17250);
check('la constante 9900 está escrita como ac cd 00', () => Array.from(bytes.slice(bytes.lastIndexOf(0x41), -2), (byte) => byte.toString(16).padStart(2, '0')).join(' '), '41 ac cd 00');
check('el módulo mide 77 bytes', () => bytes.length, 77);
```

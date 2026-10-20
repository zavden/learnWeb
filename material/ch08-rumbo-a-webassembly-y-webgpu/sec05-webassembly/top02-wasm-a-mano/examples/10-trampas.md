---
example_description: "🐛 Las trampas (traps): i32.div_s entre 0 lanza «divide by zero», -2147483648 / -1 lanza «divide result unrepresentable» y unreachable lanza RuntimeError; en JavaScript las mismas cuentas dan Infinity o un número. Son excepciones normales: se capturan y la instancia sigue funcionando"
example_tags: "javascript|webassembly|wasm|trap|runtimeerror|division|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Repartir la cuenta de una cena entre los comensales, en centavos:
//   (module
//     (func (export "split") (param $total i32) (param $people i32) (result i32)
//       local.get $total  local.get $people  i32.div_s)   ;; división entera con signo
//     (func (export "fail") unreachable))                  ;; «aquí no se debería llegar nunca»
const bytes = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  0x01, 0x0a, 0x02, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f, 0x60, 0x00, 0x00,
  0x03, 0x03, 0x02, 0x00, 0x01,
  0x07, 0x10, 0x02, 0x05, 0x73, 0x70, 0x6c, 0x69, 0x74, 0x00, 0x00, 0x04, 0x66, 0x61, 0x69, 0x6c, 0x00, 0x01,
  0x0a, 0x0d, 0x02,
  0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6d, 0x0b,   // local.get 0, local.get 1, i32.div_s, end
  0x03, 0x00, 0x00, 0x0b,                           // unreachable (00), end
]);
const { instance } = await WebAssembly.instantiate(bytes);
const { split, fail } = instance.exports;
console.log('split(120000, 4) →', split(120000, 4));

// 🐛 Una trampa (trap) detiene la función en el acto y llega a JavaScript como un
//    WebAssembly.RuntimeError: una excepción normal, que se captura con try/catch.
const attempts = [
  ['split(120000, 0)', () => split(120000, 0)],
  ['split(-2147483648, -1)', () => split(-(2 ** 31), -1)], // 2147483648 no cabe en un i32
  ['fail()', () => fail()],
];
for (const [label, call] of attempts) {
  try {
    call();
  } catch (error) {
    console.log(`🐛 ${label} → ${error.name}: ${error.message} · ¿RuntimeError? ${error instanceof WebAssembly.RuntimeError}`);
  }
}
// La instancia sigue viva después de una trampa: se puede volver a llamar.
console.log('después: split(9000, 4) →', split(9000, 4));

// En JavaScript, ninguna división lanza: dan Infinity, o el | 0 da la vuelta en silencio.
console.log('JavaScript: 120000 / 0 →', 120000 / 0, '| (-(2 ** 31) / -1) | 0 →', (-(2 ** 31) / -1) | 0);
// ✅ Comprueba el divisor antes de llamar, o captura el RuntimeError donde tenga sentido.
```

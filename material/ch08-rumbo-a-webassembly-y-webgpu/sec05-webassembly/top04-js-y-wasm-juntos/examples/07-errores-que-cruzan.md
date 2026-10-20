---
example_description: "Las excepciones atraviesan la frontera en los dos sentidos: un RangeError lanzado por una importación de JavaScript sale de WebAssembly intacto (el mismo objeto) y corta la función a medias; una trampa dentro de una llamada de JavaScript a WebAssembly llega como RuntimeError hasta el primer llamador; la instancia sigue funcionando"
example_tags: "javascript|webassembly|wasm|excepciones|imports|trap|runtimeerror"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, i32Const, I32, VOID } from './wasm/emit.js';

// Reservas de un teatro:
//   (module
//     (import "env" "reserve" (func $reserve (param i32)))     ;; función 0: JavaScript
//     (global $booked (export "booked") (mut i32) (i32.const 0))
//     (func (export "book") (param $seat i32) (result i32)      ;; función 1
//       local.get $seat  call $reserve                          ;; si JavaScript lanza, se corta AQUÍ
//       global.get $booked  i32.const 1  i32.add  global.set $booked
//       global.get $booked)
//     (func (export "validateSeat") (param $seat i32)           ;; función 2
//       local.get $seat  i32.eqz  if  unreachable  end))        ;; el asiento 0 no existe: trampa
const bytes = encodeModule({
  types: [[[I32], []], [[I32], [I32]]],
  imports: [{ module: 'env', name: 'reserve', func: 0 }],
  globals: [{ type: I32, mutable: true, init: i32Const(0) }],
  funcs: [
    { type: 1, body: [op.local_get, 0, op.call, 0, op.global_get, 0, ...i32Const(1), op.i32_add, op.global_set, 0, op.global_get, 0] },
    { type: 0, body: [op.local_get, 0, op.i32_eqz, op.if, VOID, op.unreachable, op.end] },
  ],
  exports: { booked: { global: 0 }, book: { func: 1 }, validateSeat: { func: 2 } },
});

let instance = null;
const imports = {
  env: {
    reserve(seat) {
      if (seat > 100) throw new RangeError(`el asiento ${seat} no existe`);
      instance.exports.validateSeat(seat); // JavaScript vuelve a llamar a WebAssembly
    },
  },
};
({ instance } = await WebAssembly.instantiate(bytes, imports));
const { book, booked } = instance.exports;
console.log('book(12) →', book(12));

// 1. JavaScript → WebAssembly (book) → JavaScript (reserve) lanza un RangeError.
try {
  book(120);
} catch (error) {
  console.log(`book(120) → ${error.name}: ${error.message}`);
  console.log('¿un RuntimeError? →', error instanceof WebAssembly.RuntimeError, '| ¿la pila pasa por WebAssembly? →', error.stack.includes('wasm-function'));
}
// La excepción cortó book a medias: la reserva no se contó.
console.log('reservas →', booked.value);

// 2. JavaScript → WebAssembly (book) → JavaScript (reserve) → WebAssembly (validateSeat) atrapa.
try {
  book(0);
} catch (error) {
  console.log(`book(0) → ${error.name}: ${error.message} · ¿RuntimeError? ${error instanceof WebAssembly.RuntimeError}`);
}

// La instancia sigue viva después de las dos excepciones.
console.log('book(14) →', book(14), '| reservas →', booked.value);
```

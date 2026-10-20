---
example_description: "🐛 Leer un texto de la memoria sin su longitud: hasta el primer byte 0 (como strlen de C) sale «Leónlajara», con restos del texto anterior; hasta el final de la memoria salen 65519 caracteres llenos de \\u0000. Con el puntero y los bytes escritos sale «León»"
example_tags: "javascript|webassembly|wasm|strings|textdecoder|strlen|longitud|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, memArg, i32Const, I32, VOID } from './wasm/emit.js';

// strlen, como en C: cuenta bytes hasta encontrar un 0 (el fin de los textos de C).
//   (func (export "strlen") (param $ptr i32) (result i32) (local $start i32)
//     local.get $ptr  local.set $start
//     block  loop
//       local.get $ptr  i32.load8_u  i32.eqz  br_if 1     ;; byte 0 → fin
//       local.get $ptr  i32.const 1  i32.add  local.set $ptr
//       br 0
//     end  end
//     local.get $ptr  local.get $start  i32.sub)
// (Si no hubiera ningún 0, la lectura saldría de la memoria y atraparía: el bucle termina.)
const bytes = encodeModule({
  types: [[[I32], [I32]]],
  memory: { min: 1 },
  funcs: [{ type: 0, locals: [I32], body: [
    op.local_get, 0, op.local_set, 1,
    op.block, VOID, op.loop, VOID,
      op.local_get, 0, op.i32_load8_u, ...memArg(0), op.i32_eqz, op.br_if, 1,
      op.local_get, 0, ...i32Const(1), op.i32_add, op.local_set, 0,
      op.br, 0,
    op.end, op.end,
    op.local_get, 0, op.local_get, 1, op.i32_sub,
  ] }],
  exports: { memory: { memory: 0 }, strlen: { func: 0 } },
});
const { instance } = await WebAssembly.instantiate(bytes);
const { memory, strlen } = instance.exports;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const PTR = 16;

// Un búfer reutilizado: primero la ciudad de origen de un envío, después la de destino.
const first = encoder.encodeInto('Guadalajara', new Uint8Array(memory.buffer, PTR));
const second = encoder.encodeInto('León', new Uint8Array(memory.buffer, PTR));
console.log('escritos →', first.written, 'bytes y después', second.written, 'bytes, en el mismo sitio');

// 🐛 Leer hasta el primer 0: los 5 bytes de «León» pisaron los de «Guada», y el resto sigue ahí.
const untilZero = strlen(PTR);
console.log(`🐛 hasta el primer 0 (strlen = ${untilZero}) →`, decoder.decode(new Uint8Array(memory.buffer, PTR, untilZero)));
// 🐛 Leer sin final: la vista llega hasta el último byte de la memoria.
const untilEnd = decoder.decode(new Uint8Array(memory.buffer, PTR));
console.log('🐛 sin longitud →', untilEnd.length, 'caracteres · ¿acaba en \\u0000?', untilEnd.endsWith('\u0000'));
// ✅ El puntero y la longitud viajan siempre juntos: written dice cuántos bytes son.
console.log('✅ con su longitud →', decoder.decode(new Uint8Array(memory.buffer, PTR, second.written)));
```

---
example_description: "Pasar un texto a WebAssembly: encodeInto escribe su UTF-8 directamente en la memoria, en un puntero, y la función recibe dos números (puntero y longitud en bytes); countChars cuenta caracteres saltándose los bytes de continuación y se compara con length y con [...texto]"
example_tags: "javascript|webassembly|wasm|strings|encodeinto|utf-8|puntero|longitud"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, memArg, i32Const, I32, VOID } from './wasm/emit.js';

// Una función de WebAssembly solo recibe NÚMEROS. Un texto viaja así: sus bytes UTF-8
// en la memoria, y a la función, dónde empiezan (puntero) y cuántos son (longitud).
//   (func (export "countChars") (param $ptr i32) (param $len i32) (result i32)
//     (local $end i32) (local $count i32)
//     local.get $ptr  local.get $len  i32.add  local.set $end
//     block  loop
//       local.get $ptr  local.get $end  i32.ge_u  br_if 1
//       ;; ¿empieza un carácter? Sí, salvo los bytes de continuación 10xxxxxx
//       local.get $ptr  i32.load8_u  i32.const 0xc0  i32.and  i32.const 0x80  i32.ne
//       local.get $count  i32.add  local.set $count
//       local.get $ptr  i32.const 1  i32.add  local.set $ptr
//       br 0
//     end  end
//     local.get $count)
const bytes = encodeModule({
  types: [[[I32, I32], [I32]]],
  memory: { min: 1 },
  funcs: [{ type: 0, locals: [I32, I32], body: [
    op.local_get, 0, op.local_get, 1, op.i32_add, op.local_set, 2,
    op.block, VOID, op.loop, VOID,
      op.local_get, 0, op.local_get, 2, op.i32_ge_u, op.br_if, 1,
      op.local_get, 0, op.i32_load8_u, ...memArg(0), ...i32Const(0xc0), op.i32_and, ...i32Const(0x80), op.i32_ne,
      op.local_get, 3, op.i32_add, op.local_set, 3,
      op.local_get, 0, ...i32Const(1), op.i32_add, op.local_set, 0,
      op.br, 0,
    op.end, op.end,
    op.local_get, 3,
  ] }],
  exports: { memory: { memory: 0 }, countChars: { func: 0 } },
});
const { instance } = await WebAssembly.instantiate(bytes);
const { memory, countChars } = instance.exports;

const text = 'Ñandú 🦤 en Mérida';
const PTR = 1024; // un sitio libre de la memoria (el ejemplo 08 explica cómo repartirla)
// encodeInto escribe el UTF-8 DENTRO de la memoria, sin crear un Uint8Array intermedio
// (lección «Texto y binario»). La vista empieza en PTR y llega hasta el final de la memoria.
const { read, written } = new TextEncoder().encodeInto(text, new Uint8Array(memory.buffer, PTR));
console.log('encodeInto →', { read, written });
console.log('bytes →', Array.from(new Uint8Array(memory.buffer, PTR, 6), (byte) => byte.toString(16)).join(' '), '…');

// La función recibe el puntero y la longitud en BYTES: `written`, no text.length.
console.log('countChars(PTR, written) →', countChars(PTR, written));
console.log('text.length →', text.length, '(unidades UTF-16) | [...text].length →', [...text].length);
// El dodo (🦤) son 4 bytes en UTF-8, 2 unidades en UTF-16 y 1 carácter.
```

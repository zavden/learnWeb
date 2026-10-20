---
example_description: "JavaScript crea la memoria y se la da al módulo como importación (env.memory): los dos trabajan sobre el mismo ArrayBuffer, así que invertir los píxeles de un icono en WebAssembly se ve al instante en la vista de JavaScript, sin copiar ni un byte"
example_tags: "javascript|webassembly|wasm|memory|import|sin-copias|pixeles"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, memArg, i32Const, I32, VOID } from './wasm/emit.js';

//   (module
//     (import "env" "memory" (memory 1))                 ;; la memoria la pone JavaScript
//     (func (export "invert") (param $ptr i32) (param $len i32) (local $end i32)
//       local.get $ptr  local.get $len  i32.add  local.set $end
//       block  loop
//         local.get $ptr  local.get $end  i32.ge_u  br_if 1
//         local.get $ptr                               ;; dirección para el store8
//         i32.const 255  local.get $ptr  i32.load8_u  i32.sub
//         i32.store8                                   ;; [ptr] ← 255 − [ptr]
//         local.get $ptr  i32.const 1  i32.add  local.set $ptr
//         br 0
//       end  end))
// El bucle recorre `len` bytes: si se pasara de la memoria, la lectura atraparía.
const bytes = encodeModule({
  types: [[[I32, I32], []]],
  imports: [{ module: 'env', name: 'memory', memory: { min: 1 } }],
  funcs: [{ type: 0, locals: [I32], body: [
    op.local_get, 0, op.local_get, 1, op.i32_add, op.local_set, 2,
    op.block, VOID, op.loop, VOID,
      op.local_get, 0, op.local_get, 2, op.i32_ge_u, op.br_if, 1,
      op.local_get, 0,
      ...i32Const(255), op.local_get, 0, op.i32_load8_u, ...memArg(0), op.i32_sub,
      op.i32_store8, ...memArg(0),
      op.local_get, 0, ...i32Const(1), op.i32_add, op.local_set, 0,
      op.br, 0,
    op.end, op.end,
  ] }],
  exports: { invert: { func: 0 } },
});

// 1. JavaScript crea la memoria y escribe un icono de 4 × 2 píxeles en gris (0 negro, 255 blanco).
const memory = new WebAssembly.Memory({ initial: 1, maximum: 1 });
const ICON = 256;
const pixels = new Uint8Array(memory.buffer, ICON, 8);
pixels.set([0, 64, 128, 255, 255, 128, 64, 0]);
console.log('antes →', pixels.join(' '));

// 2. Se la da al módulo en el objeto de importaciones: no se copia, se comparte.
const { instance } = await WebAssembly.instantiate(bytes, { env: { memory } });
instance.exports.invert(ICON, pixels.length);

// 3. La MISMA vista de antes ya ve el resultado: es el mismo ArrayBuffer.
console.log('después →', pixels.join(' '));
console.log('¿el mismo búfer? →', pixels.buffer === memory.buffer);
```

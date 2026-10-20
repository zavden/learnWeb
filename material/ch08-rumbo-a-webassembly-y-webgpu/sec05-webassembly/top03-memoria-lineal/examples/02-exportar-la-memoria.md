---
example_description: "Un módulo con su propia memoria exportada: i32.store con los inmediatos offset y align escribe un pedido (unidades y centavos) que JavaScript lee con Int32Array y DataView en little-endian, y JavaScript lo cambia y WebAssembly lo vuelve a leer"
example_tags: "javascript|webassembly|wasm|memory|export|i32-store|i32-load|memarg|little-endian"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»): los ayudantes de la lección «WebAssembly a mano».
import { encodeModule, op, memArg, I32 } from './wasm/emit.js';

// Un pedido en memoria: 4 bytes de unidades y, detrás, 4 bytes de precio en centavos.
//   (module
//     (memory (export "memory") 1)                                  ;; 1 página, exportada
//     (func (export "writeOrder") (param $ptr i32) (param $units i32) (param $cents i32)
//       local.get $ptr  local.get $units  i32.store offset=0 align=4    ;; [ptr]     ← unidades
//       local.get $ptr  local.get $cents  i32.store offset=4 align=4)   ;; [ptr + 4] ← centavos
//     (func (export "orderTotal") (param $ptr i32) (result i32)
//       local.get $ptr  i32.load offset=0  local.get $ptr  i32.load offset=4  i32.mul))
const bytes = encodeModule({
  types: [[[I32, I32, I32], []], [[I32], [I32]]],
  memory: { min: 1 },
  funcs: [
    // memArg(2, 4): alineación 2 (2² = 4 bytes) y desplazamiento 4 → dirección ptr + 4.
    { type: 0, body: [op.local_get, 0, op.local_get, 1, op.i32_store, ...memArg(2, 0), op.local_get, 0, op.local_get, 2, op.i32_store, ...memArg(2, 4)] },
    { type: 1, body: [op.local_get, 0, op.i32_load, ...memArg(2, 0), op.local_get, 0, op.i32_load, ...memArg(2, 4), op.i32_mul] },
  ],
  exports: { memory: { memory: 0 }, writeOrder: { func: 0 }, orderTotal: { func: 1 } },
});
const { instance } = await WebAssembly.instantiate(bytes);
const { memory, writeOrder, orderTotal } = instance.exports;
console.log('¿memory es una WebAssembly.Memory? →', memory instanceof WebAssembly.Memory, '|', memory.buffer.byteLength, 'bytes');

// WebAssembly escribe el pedido en la dirección 16…
const ORDER = 16;
writeOrder(ORDER, 3, 2450); // 3 bolsas de café a 24.50
// …y JavaScript lee esos mismos bytes, sin copiarlos.
console.log('bytes 16-23 →', Array.from(new Uint8Array(memory.buffer, ORDER, 8), (byte) => byte.toString(16).padStart(2, '0')).join(' '));
console.log('Int32Array →', Array.from(new Int32Array(memory.buffer, ORDER, 2)).join(', '));
const view = new DataView(memory.buffer);
console.log('DataView →', view.getInt32(ORDER, true), view.getInt32(ORDER + 4, true), '(little-endian: true)');
console.log('orderTotal(16) →', orderTotal(ORDER));

// Al revés: JavaScript cambia el precio y WebAssembly lee el nuevo valor.
view.setInt32(ORDER + 4, 1990, true);
console.log('tras bajar el precio a 19.90 → orderTotal(16) →', orderTotal(ORDER));
```

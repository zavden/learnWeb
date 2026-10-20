---
example_description: "Solución: readings es una función que crea la vista sobre memory.buffer cada vez que se usa, así que después de que append() haga crecer la memoria, latest(), average() y setReading() trabajan con el ArrayBuffer nuevo"
example_tags: "javascript|webassembly|wasm|memory|grow|detached|float32array|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, memArg, i32Const, I32, F32, VOID } from './wasm/emit.js';

// Un registro de lecturas de un sensor del invernadero, en float32:
//   (module
//     (memory (export "memory") 1 4)
//     (global $count (mut i32) (i32.const 0))
//     (func (export "append") (param $value f32) (result i32)
//       ;; ¿cabe una lectura más? Si no, crece una página (y si no puede, atrapa)
//       global.get $count  i32.const 1  i32.add  i32.const 2  i32.shl
//       memory.size  i32.const 16  i32.shl  i32.gt_u
//       if  i32.const 1  memory.grow  i32.const -1  i32.eq  if  unreachable  end  end
//       global.get $count  i32.const 2  i32.shl  local.get $value  f32.store
//       global.get $count  i32.const 1  i32.add  global.set $count
//       global.get $count)
//     (func (export "get") (param $index i32) (result f32)  local.get $index  i32.const 2  i32.shl  f32.load))
const bytes = encodeModule({
  types: [[[F32], [I32]], [[I32], [F32]]],
  memory: { min: 1, max: 4 },
  globals: [{ type: I32, mutable: true, init: i32Const(0) }],
  funcs: [
    { type: 0, body: [
      op.global_get, 0, ...i32Const(1), op.i32_add, ...i32Const(2), op.i32_shl,
      op.memory_size, 0x00, ...i32Const(16), op.i32_shl, op.i32_gt_u,
      op.if, VOID, ...i32Const(1), op.memory_grow, 0x00, ...i32Const(-1), op.i32_eq, op.if, VOID, op.unreachable, op.end, op.end,
      op.global_get, 0, ...i32Const(2), op.i32_shl, op.local_get, 0, op.f32_store, ...memArg(2),
      op.global_get, 0, ...i32Const(1), op.i32_add, op.global_set, 0,
      op.global_get, 0,
    ] },
    { type: 1, body: [op.local_get, 0, ...i32Const(2), op.i32_shl, op.f32_load, ...memArg(2)] },
  ],
  exports: { memory: { memory: 0 }, append: { func: 0 }, get: { func: 1 } },
});
const { instance } = await WebAssembly.instantiate(bytes);
const { memory, append, get } = instance.exports;

let count = 0;
// ✅ Una vista nueva en cada uso: siempre sobre el ArrayBuffer actual (no copia nada).
const readings = () => new Float32Array(memory.buffer);
function latest() {
  return readings()[count - 1];
}
function average() {
  const values = readings().subarray(0, count);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
function setReading(index, value) {
  readings()[index] = value; // una corrección hecha desde JavaScript
}

for (let i = 0; i < 20000; i++) count = append(i * 0.5); // 0, 0.5, 1, … 9999.5

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, run, expected) {
  let actual;
  try {
    actual = run();
  } catch (error) {
    actual = error.name; // solo el nombre: el mensaje cambia de un navegador a otro
  }
  if (actual === expected) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', JSON.stringify(expected), 'y obtuve', JSON.stringify(actual));
}
check('20000 lecturas guardadas', () => count, 20000);
check('la memoria creció a 2 páginas', () => memory.buffer.byteLength, 131072);
check('latest() = 9999.5', () => latest(), 9999.5);
check('average() = 4999.75', () => average(), 4999.75);
setReading(19999, 42);
check('setReading(19999, 42) llega a WebAssembly: get(19999) = 42', () => get(19999), 42);
check('la memoria sigue en 2 páginas', () => memory.buffer.byteLength, 131072);
```

---
example_description: "Pasar un array de decimales: un Float32Array creado sobre la memoria en un puntero alineado, y una función que lee con f32.load en ptr + i × 4 y devuelve la media en float32; JavaScript la recibe como number, redondeada como Math.fround"
example_tags: "javascript|webassembly|wasm|float32array|f32|arrays|puntero|memoria"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, memArg, i32Const, I32, F32, VOID } from './wasm/emit.js';

// La media de `count` floats que empiezan en `ptr`:
//   (func (export "average") (param $ptr i32) (param $count i32) (result f32)
//     (local $i i32) (local $sum f32)
//     block  loop
//       local.get $i  local.get $count  i32.ge_u  br_if 1
//       local.get $sum
//       local.get $ptr  local.get $i  i32.const 2  i32.shl  i32.add   ;; ptr + i × 4
//       f32.load
//       f32.add  local.set $sum
//       local.get $i  i32.const 1  i32.add  local.set $i
//       br 0
//     end  end
//     local.get $sum  local.get $count  f32.convert_i32_u  f32.div)
const bytes = encodeModule({
  types: [[[I32, I32], [F32]]],
  memory: { min: 1 },
  funcs: [{ type: 0, locals: [I32, F32], body: [
    op.block, VOID, op.loop, VOID,
      op.local_get, 2, op.local_get, 1, op.i32_ge_u, op.br_if, 1,
      op.local_get, 3,
      op.local_get, 0, op.local_get, 2, ...i32Const(2), op.i32_shl, op.i32_add,
      op.f32_load, ...memArg(2),
      op.f32_add, op.local_set, 3,
      op.local_get, 2, ...i32Const(1), op.i32_add, op.local_set, 2,
      op.br, 0,
    op.end, op.end,
    op.local_get, 3, op.local_get, 1, op.f32_convert_i32_u, op.f32_div,
  ] }],
  exports: { memory: { memory: 0 }, average: { func: 0 } },
});
const { instance } = await WebAssembly.instantiate(bytes);
const { memory, average } = instance.exports;

// Las máximas de una semana en Mérida, °C. Un Float32Array SOBRE la memoria, en la
// dirección 64 (múltiplo de 4), con 7 elementos: escribir en él es escribir en wasm.
const week = [31.5, 33.2, 34.0, 32.8, 30.1, 29.9, 31.4];
const PTR = 64;
const temperatures = new Float32Array(memory.buffer, PTR, week.length);
temperatures.set(week);
console.log('en memoria →', Array.from(new Uint8Array(memory.buffer, PTR, 4), (byte) => byte.toString(16).padStart(2, '0')).join(' '), '… (31.5 en float32, little-endian)');

const result = average(PTR, week.length);
console.log('average(64, 7) →', result, '→', result.toFixed(2), '°C');
// La misma media en JavaScript, en float64: distinta en las últimas cifras.
const exact = week.reduce((sum, value) => sum + value, 0) / week.length;
console.log('en JavaScript →', exact, '| ¿iguales con 2 decimales? →', result.toFixed(2) === exact.toFixed(2));
// Los float32 de la memoria y las sumas en f32 explican la diferencia (lección «Float32 y precisión»).
```

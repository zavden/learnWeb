---
example_description: "🐛 Un asignador «bump» en JavaScript reparte la memoria con alloc(size, align); sin alineación, un Float32Array en la dirección 1029 lanza «start offset of Float32Array should be a multiple of 4», aunque f32.load sí lee ahí; con align = 4 el puntero salta a 1032. reset() libera todo de golpe"
example_tags: "javascript|webassembly|wasm|malloc|asignador|alineacion|float32array|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, memArg, i32Const, I32, F32, VOID } from './wasm/emit.js';

// La función average del ejemplo 07, igual: (func (export "average") (param $ptr i32) (param $count i32) (result f32) …)
const bytes = encodeModule({
  types: [[[I32, I32], [F32]]],
  memory: { min: 1 },
  funcs: [{ type: 0, locals: [I32, F32], body: [
    op.block, VOID, op.loop, VOID,
      op.local_get, 2, op.local_get, 1, op.i32_ge_u, op.br_if, 1,
      op.local_get, 3, op.local_get, 0, op.local_get, 2, ...i32Const(2), op.i32_shl, op.i32_add,
      op.f32_load, ...memArg(2), op.f32_add, op.local_set, 3,
      op.local_get, 2, ...i32Const(1), op.i32_add, op.local_set, 2,
      op.br, 0,
    op.end, op.end,
    op.local_get, 3, op.local_get, 1, op.f32_convert_i32_u, op.f32_div,
  ] }],
  exports: { memory: { memory: 0 }, average: { func: 0 } },
});
const { instance } = await WebAssembly.instantiate(bytes);
const { memory, average } = instance.exports;

// Un asignador «bump» (de avance): reparte la memoria hacia delante y nunca libera
// un trozo suelto. Los primeros 1024 bytes quedan para los datos fijos del módulo.
const HEAP_START = 1024;
let next = HEAP_START;
function alloc(size, align = 1) {
  const ptr = Math.ceil(next / align) * align; // sube hasta el siguiente múltiplo de align
  if (ptr + size > memory.buffer.byteLength) throw new RangeError('no queda memoria');
  next = ptr + size;
  return ptr;
}
const reset = () => { next = HEAP_START; }; // libera TODO de una vez

const week = [31.5, 33.2, 34.0, 32.8, 30.1, 29.9, 31.4];
const city = new TextEncoder().encode('León');            // 5 bytes
const cityPtr = alloc(city.length);
new Uint8Array(memory.buffer, cityPtr, city.length).set(city);

// 🐛 Pedir el sitio de los 7 float32 sin alineación: el puntero cae en 1029.
const badPtr = alloc(week.length * 4);
console.log('cityPtr →', cityPtr, '| sin alinear →', badPtr);
try {
  new Float32Array(memory.buffer, badPtr, week.length);
} catch (error) {
  console.log(`🐛 Float32Array en ${badPtr} → ${error.name}: ${error.message}`);
}
// Curiosidad: WebAssembly sí lee ahí (en f32.load, «align» es solo una pista), pero
// más despacio en algunas CPU. Escribimos los floats con DataView, que tampoco exige alinear:
const view = new DataView(memory.buffer);
week.forEach((value, i) => view.setFloat32(badPtr + i * 4, value, true));
console.log('average en 1029 →', average(badPtr, week.length).toFixed(2));

// ✅ Las vistas de JavaScript sí lo exigen: pide la memoria alineada a 4.
reset();
alloc(city.length);
const goodPtr = alloc(week.length * 4, 4);
new Float32Array(memory.buffer, goodPtr, week.length).set(week);
console.log('✅ alineado →', goodPtr, '| average →', average(goodPtr, week.length).toFixed(2));
console.log('siguiente libre →', next, '| tras reset() →', (reset(), next));
```

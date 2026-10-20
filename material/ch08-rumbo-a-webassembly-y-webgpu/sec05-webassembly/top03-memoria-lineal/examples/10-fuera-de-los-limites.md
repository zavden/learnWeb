---
example_description: "🐛 Leer fuera de la memoria atrapa (RuntimeError: memory access out of bounds), mientras que un typed array devuelve undefined y DataView lanza RangeError; pero DENTRO de la memoria nadie vigila: escribir el precio 4 de una tabla de 4 pisa la existencia del producto siguiente"
example_tags: "javascript|webassembly|wasm|memory|limites|trap|seguridad|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, memArg, i32Const, I32 } from './wasm/emit.js';

// Una tabla de precios en la memoria: el precio del producto `id` está en id × 4.
//   (module
//     (memory (export "memory") 1)
//     (func (export "priceOf") (param $id i32) (result i32)
//       local.get $id  i32.const 2  i32.shl  i32.load)            ;; [id × 4]
//     (func (export "setPrice") (param $id i32) (param $cents i32)
//       local.get $id  i32.const 2  i32.shl  local.get $cents  i32.store))
const bytes = encodeModule({
  types: [[[I32], [I32]], [[I32, I32], []]],
  memory: { min: 1 },
  funcs: [
    { type: 0, body: [op.local_get, 0, ...i32Const(2), op.i32_shl, op.i32_load, ...memArg(2)] },
    { type: 1, body: [op.local_get, 0, ...i32Const(2), op.i32_shl, op.local_get, 1, op.i32_store, ...memArg(2)] },
  ],
  exports: { memory: { memory: 0 }, priceOf: { func: 0 }, setPrice: { func: 1 } },
});
const { instance } = await WebAssembly.instantiate(bytes);
const { memory, priceOf, setPrice } = instance.exports;

// 4 precios (bytes 0-15) y, justo detrás, las existencias de los 4 productos (bytes 16-31).
const PRODUCTS = 4;
const prices = new Int32Array(memory.buffer, 0, PRODUCTS);
const stock = new Int32Array(memory.buffer, 16, PRODUCTS);
prices.set([2450, 1990, 3200, 1500]);
stock.set([12, 0, 7, 30]);
console.log('priceOf(2) →', priceOf(2));

// 🐛 Un id que viene de la URL o de un formulario: 16384 × 4 = 65536, el primer byte FUERA.
try {
  priceOf(16384);
} catch (error) {
  console.log(`🐛 priceOf(16384) → ${error.name}: ${error.message}`);
}
// Lo mismo en JavaScript no lanza (o lanza otra cosa):
const all = new Int32Array(memory.buffer);
console.log('Int32Array[16384] →', all[16384], '(silencio)');
try {
  new DataView(memory.buffer).getInt32(65536, true);
} catch (error) {
  console.log(`DataView → ${error.name}: ${error.message}`);
}

// 🐛 Pero la memoria es UN bloque, y dentro de él nadie comprueba nada: el «precio 4»
//    de una tabla de 4 es la existencia del producto 0. No atrapa: corrompe.
setPrice(4, 999);
console.log('🐛 tras setPrice(4, 999) → existencias del producto 0:', stock[0]);
// ✅ Comprueba los índices tú (en JavaScript antes de llamar, o dentro del módulo).
const safePrice = (id) => (Number.isInteger(id) && id >= 0 && id < PRODUCTS ? priceOf(id) : null);
console.log('✅ safePrice(16384) →', safePrice(16384), '| safePrice(1) →', safePrice(1));
```

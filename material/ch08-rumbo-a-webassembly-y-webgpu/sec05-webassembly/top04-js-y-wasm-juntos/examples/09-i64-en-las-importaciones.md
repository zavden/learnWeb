---
example_description: "🐛 Una importación con i64 en su firma también habla BigInt: si devuelve un number (Date.UTC), WebAssembly lanza «Cannot convert 1792513800000 to a BigInt»; si recibe un i64, le llega un BigInt que new Date() no acepta. Con BigInt() y Number() en la importación funciona"
example_tags: "javascript|webassembly|wasm|i64|bigint|imports|fechas|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, I64 } from './wasm/emit.js';

// Un registro de entradas con la hora en milisegundos, un i64:
//   (module
//     (import "env" "now" (func $now (result i64)))          ;; función 0
//     (import "env" "audit" (func $audit (param i64)))       ;; función 1
//     (func (export "stamp") (result i64)  call $now)        ;; función 2
//     (func (export "stampAndAudit")  call $now  call $audit))  ;; función 3
const bytes = encodeModule({
  types: [[[], [I64]], [[I64], []], [[], []]],
  imports: [{ module: 'env', name: 'now', func: 0 }, { module: 'env', name: 'audit', func: 1 }],
  funcs: [{ type: 0, body: [op.call, 0] }, { type: 2, body: [op.call, 0, op.call, 1] }],
  exports: { stamp: { func: 2 }, stampAndAudit: { func: 3 } },
});
const module = await WebAssembly.compile(bytes);
const DOORS_OPEN = Date.UTC(2026, 9, 20, 16, 30); // un instante fijo, para que la salida no cambie
async function withImports(now, audit) {
  const instance = await WebAssembly.instantiate(module, { env: { now, audit } });
  return instance.exports;
}
const show = (label, fn) => {
  try {
    console.log(`${label} →`, fn());
  } catch (error) {
    console.log(`${label} → ${error.name}: ${error.message}`);
  }
};

// 🐛 La importación devuelve un number donde el módulo espera un i64.
const wrong = await withImports(() => DOORS_OPEN, (ms) => console.log('audit:', new Date(ms).toISOString()));
show('🐛 now devuelve un number → stamp()', () => wrong.stamp());

// 🐛 El i64 llega a JavaScript como BigInt, y new Date() no acepta BigInt.
const half = await withImports(() => BigInt(DOORS_OPEN), (ms) => console.log('audit:', new Date(ms).toISOString()));
show('✅ now devuelve BigInt → stamp()', () => half.stamp());
show('🐛 audit recibe un BigInt → stampAndAudit()', () => half.stampAndAudit());

// ✅ BigInt() al devolver y Number() al recibir (exacto mientras sea menor que 2 ** 53).
const right = await withImports(() => BigInt(DOORS_OPEN), (ms) => console.log('audit:', typeof ms, new Date(Number(ms)).toISOString()));
show('✅ stampAndAudit()', () => right.stampAndAudit());
```

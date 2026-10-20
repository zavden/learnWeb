---
example_description: "Solución: toCents devuelve Math.round(pesos × 100), un number entero, y now devuelve BigInt(Date.UTC(…)); las conversiones de la frontera ya no inventan nada"
example_tags: "javascript|webassembly|wasm|imports|i64|bigint|conversiones|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, I32, I64, F64 } from './wasm/emit.js';

// La caja de la cafetería. Sus bytes no se tocan: el trabajo está en las importaciones.
//   (module
//     (import "env" "toCents" (func $toCents (param f64) (result i32)))   ;; función 0
//     (import "env" "now" (func $now (result i64)))                        ;; función 1
//     (func (export "charge") (param $pesos f64) (result i32)  local.get $pesos  call $toCents)
//     (func (export "receiptTime") (result i64)  call $now))
const bytes = encodeModule({
  types: [[[F64], [I32]], [[], [I64]]],
  imports: [{ module: 'env', name: 'toCents', func: 0 }, { module: 'env', name: 'now', func: 1 }],
  funcs: [{ type: 0, body: [op.local_get, 0, op.call, 0] }, { type: 1, body: [op.call, 1] }],
  exports: { charge: { func: 2 }, receiptTime: { func: 3 } },
});

const imports = {
  env: {
    // ✅ 1. Un number entero: los pesos en centavos, redondeados (19.99 × 100 = 1998.9999999999998).
    toCents: (pesos) => Math.round(pesos * 100),
    // ✅ 2. Un BigInt: el tipo de un i64 en JavaScript.
    now: () => BigInt(Date.UTC(2026, 9, 20, 18, 45)),
  },
};
const { instance } = await WebAssembly.instantiate(bytes, imports);
const { charge, receiptTime } = instance.exports;

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, run, expected) {
  let actual;
  try {
    actual = run();
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  const text = (value) => (typeof value === 'bigint' ? `${value}n` : JSON.stringify(value));
  if (text(actual) === text(expected)) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', text(expected), 'y obtuve', text(actual));
}
check('un café de 19.50 → charge(19.5) = 1950', () => charge(19.5), 1950);
check('un pan de 19.99 → charge(19.99) = 1999', () => charge(19.99), 1999);
check('0.1 + 0.2 pesos → charge(0.1 + 0.2) = 30', () => charge(0.1 + 0.2), 30);
check('receiptTime() = 1792521900000n', () => receiptTime(), 1792521900000n);
check('receiptTime() es un BigInt', () => typeof receiptTime(), 'bigint');
check('la hora del ticket', () => new Date(Number(receiptTime())).toISOString(), '2026-10-20T18:45:00.000Z');
```

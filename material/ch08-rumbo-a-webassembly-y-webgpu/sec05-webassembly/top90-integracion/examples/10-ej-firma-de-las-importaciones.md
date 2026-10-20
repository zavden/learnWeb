---
example_description: "Ejercicio: la caja registradora de una cafetería importa toCents (f64) → i32 y now () → i64, pero las dos funciones de JavaScript devuelven el tipo equivocado: un texto que WebAssembly convierte en 0 sin avisar y un number donde se espera un BigInt; arréglalas en el objeto de importaciones"
example_tags: "javascript|webassembly|wasm|imports|i64|bigint|conversiones|ejercicio"
exercise: true
exercise_title: "Importaciones con el tipo correcto"
exercise_instructions: "El módulo (bloqueado en su forma: no cambies sus bytes) importa env.toCents, (f64) → i32, y env.now, () → i64 || Ejecuta: charge() cobra 0 centavos y receiptTime() lanza TypeError || TODO 1: toCents debe devolver un number entero: los pesos por 100, redondeados con Math.round (no un texto) || TODO 2: now debe devolver un BigInt con el instante del ticket, Date.UTC(2026, 9, 20, 18, 45) || Ejecuta hasta que las seis comprobaciones salgan ✅"
exercise_hints: "Un texto como «1950 centavos» se convierte en NaN, y NaN en un i32 es 0 || 19.99 × 100 es 1998.9999999999998: por eso hace falta redondear || BigInt(Date.UTC(…)) convierte el number en BigInt, exacto mientras sea menor que 2 ** 53"
exercise_solution_example: 10-ej-firma-de-las-importaciones-solucion.md
example_stage: exercise
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
    // TODO 1: WebAssembly espera un i32 (un number entero), no un texto.
    toCents: (pesos) => `${(pesos * 100).toFixed(0)} centavos`,
    // TODO 2: WebAssembly espera un i64, es decir, un BigInt.
    now: () => Date.UTC(2026, 9, 20, 18, 45),
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

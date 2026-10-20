---
example_description: "🐛 WebAssembly no comprueba los tipos de una función importada de JavaScript: la llama con los argumentos que dice su firma y convierte lo que devuelve; un texto, undefined o un segundo parámetro que nunca llega se vuelven 0 sin error, un decimal se trunca y solo un BigInt lanza. La solución: validar en la propia importación"
example_tags: "javascript|webassembly|wasm|imports|tipos|conversiones|toint32|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, I32 } from './wasm/emit.js';

// El módulo espera una función de JavaScript con la firma (i32) → i32:
//   (module
//     (import "env" "discount" (func $discount (param i32) (result i32)))
//     (func (export "finalPrice") (param $cents i32) (result i32)
//       local.get $cents  call $discount))
const bytes = encodeModule({
  types: [[[I32], [I32]]],
  imports: [{ module: 'env', name: 'discount', func: 0 }],
  funcs: [{ type: 0, body: [op.local_get, 0, op.call, 0] }],
  exports: { finalPrice: { func: 1 } },
});
const module = await WebAssembly.compile(bytes);

// Seis versiones de la importación. WebAssembly no sabe nada de ellas: las llama con UN
// argumento (un number) y convierte lo que devuelven con ToInt32, como | 0.
const candidates = [
  ['✅ (cents) => cents - 500', (cents) => cents - 500],
  ["🐛 devuelve '1950 pesos'", () => '1950 pesos'],
  ['🐛 devuelve 1950.75', () => 1950.75],
  ['🐛 olvida el return', (cents) => { Math.max(cents - 500, 0); }],
  ['🐛 espera (cents, percent)', (cents, percent) => cents - (cents * percent) / 100],
  ['🐛 devuelve 1950n', () => 1950n],
];
for (const [label, discount] of candidates) {
  const instance = await WebAssembly.instantiate(module, { env: { discount } });
  try {
    console.log(`${label} → finalPrice(2500) = ${instance.exports.finalPrice(2500)}`);
  } catch (error) {
    console.log(`${label} → ${error.name}: ${error.message}`);
  }
}

// ✅ La frontera no comprueba nada: comprueba tú, dentro de la importación (o tipa el
//    objeto de importaciones con TypeScript). Un error lanzado aquí sale por finalPrice.
const checked = (fn) => (...args) => {
  const result = fn(...args);
  if (!Number.isInteger(result)) throw new TypeError(`discount debe devolver un entero, no ${JSON.stringify(result)}`);
  return result;
};
const strict = await WebAssembly.instantiate(module, { env: { discount: checked(() => '1950 pesos') } });
try {
  strict.exports.finalPrice(2500);
} catch (error) {
  console.log(`✅ con comprobación → ${error.name}: ${error.message}`);
}
```

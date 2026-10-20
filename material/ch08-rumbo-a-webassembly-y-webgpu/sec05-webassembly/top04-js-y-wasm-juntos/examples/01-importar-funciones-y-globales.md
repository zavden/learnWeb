---
example_description: "Importar de JavaScript una función (env.showLine, a la que WebAssembly llama con dos argumentos) y una variable global mutable (env.taxRate, un WebAssembly.Global): cambiar taxRate.value desde JavaScript cambia el IVA que usa el módulo en la siguiente llamada; pasar un número suelto en lugar del Global da LinkError"
example_tags: "javascript|webassembly|wasm|imports|global|f64|linkerror"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, f64Const, I32, F64 } from './wasm/emit.js';

//   (module
//     (import "env" "showLine" (func $showLine (param i32 f64)))     ;; función 0
//     (import "env" "taxRate" (global $taxRate (mut f64)))            ;; global 0
//     (func (export "checkout") (param $cents i32) (result f64)       ;; función 1
//       (local $total f64)
//       local.get $cents  f64.convert_i32_u
//       global.get $taxRate  f64.const 1  f64.add  f64.mul           ;; cents × (1 + IVA)
//       local.set $total
//       local.get $cents  local.get $total  call $showLine            ;; ← JavaScript
//       local.get $total))
const bytes = encodeModule({
  types: [[[I32, F64], []], [[I32], [F64]]],
  imports: [
    { module: 'env', name: 'showLine', func: 0 },
    { module: 'env', name: 'taxRate', global: { type: F64, mutable: true } },
  ],
  funcs: [{ type: 1, locals: [F64], body: [
    op.local_get, 0, op.f64_convert_i32_u, op.global_get, 0, ...f64Const(1), op.f64_add, op.f64_mul, op.local_set, 1,
    op.local_get, 0, op.local_get, 1, op.call, 0,
    op.local_get, 1,
  ] }],
  exports: { checkout: { func: 1 } }, // función 1: la 0 es la importada
});

// Un Global creado en JavaScript: un valor f64 que los dos lados leen y que se puede cambiar.
const taxRate = new WebAssembly.Global({ value: 'f64', mutable: true }, 0.16); // IVA general
const imports = {
  env: {
    showLine(cents, total) { // WebAssembly la llama con un i32 y un f64: llegan como number
      console.log(`showLine: ${(cents / 100).toFixed(2)} → ${(total / 100).toFixed(2)} MXN (IVA ${Math.round(taxRate.value * 100)} %)`);
    },
    taxRate,
  },
};
const { module, instance } = await WebAssembly.instantiate(bytes, imports);
console.log('importa →', WebAssembly.Module.imports(module).map((entry) => `${entry.module}.${entry.name} (${entry.kind})`).join(', '));

console.log('checkout(10000) →', instance.exports.checkout(10000).toFixed(2));
// El módulo lee la global en cada llamada: cambiarla desde JavaScript basta.
taxRate.value = 0.08; // la tasa de la zona fronteriza norte
console.log('checkout(10000) →', instance.exports.checkout(10000).toFixed(2));

// 🐛 Una global MUTABLE tiene que ser un WebAssembly.Global: un número suelto no vale,
//    porque los dos lados tienen que compartir el mismo valor (una inmutable sí admite un número).
try {
  await WebAssembly.instantiate(bytes, { env: { showLine() {}, taxRate: 0.16 } });
} catch (error) {
  console.log(`🐛 taxRate: 0.16 → ${error.name}: ${error.message}`);
}
// Las importaciones también pueden ser una memoria (lección anterior) o una TABLA
// (WebAssembly.Table): una lista de funciones a las que el módulo llama por su posición.
```

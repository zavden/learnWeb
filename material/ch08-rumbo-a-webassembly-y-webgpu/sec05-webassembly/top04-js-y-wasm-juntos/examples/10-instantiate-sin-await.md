---
example_description: "🐛 Tres formas de quedarse sin instancia: usar el resultado de WebAssembly.instantiate sin await (es una promesa), desestructurar { instance } cuando se le pasa un Module (entonces devuelve la Instance directamente) y usar las exportaciones antes de que la promesa se cumpla"
example_tags: "javascript|webassembly|wasm|instantiate|promesas|await|async|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, I32 } from './wasm/emit.js';

// El módulo add de siempre: (func (export "add") (param i32 i32) (result i32) …)
const bytes = encodeModule({
  types: [[[I32, I32], [I32]]],
  funcs: [{ type: 0, body: [op.local_get, 0, op.local_get, 1, op.i32_add] }],
  exports: { add: { func: 0 } },
});

// 🐛 1. Sin await: instantiate devuelve una PROMESA, que no tiene propiedad instance.
const pending = WebAssembly.instantiate(bytes);
console.log('¿es una promesa? →', pending instanceof Promise);
try {
  pending.instance.exports.add(2, 3);
} catch (error) {
  console.log(`🐛 sin await → ${error.name}: ${error.message}`);
}

// 🐛 2. Con un Module, instantiate devuelve la Instance directamente, no { module, instance }.
const module = await WebAssembly.compile(bytes);
const { instance } = await WebAssembly.instantiate(module);
console.log('🐛 { instance } de instantiate(module) →', instance);

// ✅ Las dos formas, cada una con lo que devuelve:
const fromBytes = await WebAssembly.instantiate(bytes);   // { module, instance }
const fromModule = await WebAssembly.instantiate(module); // Instance
console.log('✅ desde bytes →', fromBytes.instance.exports.add(2, 3), '| ✅ desde un Module →', fromModule.exports.add(2, 3));

// 🐛 3. Usar las exportaciones antes de que llegue la instancia (por ejemplo, en un
//    manejador de eventos registrado al cargar): la variable aún está vacía.
let calculator = null;
WebAssembly.instantiate(bytes).then((result) => {
  calculator = result.instance.exports;
  console.log('… y cuando la promesa se cumple → add(1, 1) =', calculator.add(1, 1));
});
try {
  calculator.add(1, 1);
} catch (error) {
  console.log(`🐛 antes de que termine → ${error.name}: ${error.message}`);
}
// ✅ Espera a la instancia (await) antes de activar lo que la usa: registra los
//    manejadores, o habilita los botones, DESPUÉS del await.
```

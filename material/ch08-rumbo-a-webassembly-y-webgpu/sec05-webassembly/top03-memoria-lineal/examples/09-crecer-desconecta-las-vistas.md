---
example_description: "🐛 memory.grow, también el que ocurre DENTRO de una función de WebAssembly, desconecta el ArrayBuffer anterior: las vistas creadas antes se quedan con length 0, leen undefined y reduce lanza TypeError. Solución: volver a pedir memory.buffer tras cualquier llamada que pueda crecer"
example_tags: "javascript|webassembly|wasm|memory|grow|detached|typed-arrays|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, I32 } from './wasm/emit.js';

// Un módulo que puede crecer él solo, como hace el malloc de un programa de C cuando
// se queda sin sitio:
//   (module
//     (memory (export "memory") 1 4)                  ;; 1 página, hasta 4
//     (func (export "growPages") (param $n i32) (result i32)
//       local.get $n  memory.grow))                   ;; devuelve las páginas de antes, o -1
const bytes = encodeModule({
  types: [[[I32], [I32]]],
  memory: { min: 1, max: 4 },
  funcs: [{ type: 0, body: [op.local_get, 0, op.memory_grow, 0x00] }], // 0x00: la memoria 0
  exports: { memory: { memory: 0 }, growPages: { func: 0 } },
});
const { instance } = await WebAssembly.instantiate(bytes);
const { memory, growPages } = instance.exports;

// 🐛 Una vista guardada al principio, «para no crearla cada vez».
const readings = new Uint8Array(memory.buffer);
readings[0] = 42;
console.log('antes → length', readings.length, '| [0] →', readings[0]);

// La memoria crece dentro de WebAssembly: JavaScript no ha llamado a grow.
console.log('growPages(1) →', growPages(1), '(páginas que había)');
console.log('🐛 la vista vieja → length', readings.length, '| [0] →', readings[0], '| ¿detached? →', readings.buffer.detached);
try {
  readings.reduce((sum, value) => sum + value, 0);
} catch (error) {
  console.log(`🐛 reduce → ${error.name}: ${error.message}`);
}

// ✅ memory.buffer es un ArrayBuffer NUEVO, con los datos de antes. Pídelo otra vez
//    después de cualquier llamada que pueda crecer (y no guardes vistas por si acaso):
const bytesNow = () => new Uint8Array(memory.buffer);
console.log('✅ vista nueva → length', bytesNow().length, '| [0] →', bytesNow()[0]);

// Pasar del máximo: DENTRO de WebAssembly, memory.grow devuelve -1 (no lanza)…
console.log('growPages(10) →', growPages(10), '| tamaño →', memory.buffer.byteLength);
// …y desde JavaScript, memory.grow lanza RangeError.
try {
  memory.grow(10);
} catch (error) {
  console.log(`memory.grow(10) → ${error.name}: ${error.message}`);
}
```

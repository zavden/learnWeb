---
example_description: "Un segmento de datos lleva un texto UTF-8 dentro del propio .wasm y lo copia a la memoria al instanciar; dos globales exportadas dicen dónde empieza y cuánto mide, y TextDecoder lo lee con un subarray. Cada instancia recibe su propia copia"
example_tags: "javascript|webassembly|wasm|data|segmento|textdecoder|utf-8|global"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, i32Const, I32 } from './wasm/emit.js';

const GREETING = '¡Bienvenida al Museo Nacional de Antropología!';
const greetingBytes = new TextEncoder().encode(GREETING);
//   (module
//     (memory (export "memory") 1)
//     (global (export "greetingPtr") i32 (i32.const 16))     ;; dónde empieza
//     (global (export "greetingLen") i32 (i32.const 48))     ;; cuántos BYTES mide
//     (data (i32.const 16) "\c2\a1Bienvenida al Museo…"))     ;; los bytes, en la sección 11
const bytes = encodeModule({
  memory: { min: 1 },
  globals: [
    { type: I32, mutable: false, init: i32Const(16) },
    { type: I32, mutable: false, init: i32Const(greetingBytes.length) },
  ],
  exports: { memory: { memory: 0 }, greetingPtr: { global: 0 }, greetingLen: { global: 1 } },
  data: [{ offset: 16, bytes: greetingBytes }],
});
console.log('el .wasm mide', bytes.length, 'bytes; el texto,', greetingBytes.length, 'bytes en UTF-8 y', GREETING.length, 'caracteres');

const module = await WebAssembly.compile(bytes);
const first = await WebAssembly.instantiate(module);
const { memory, greetingPtr, greetingLen } = first.exports;
const ptr = greetingPtr.value;
const size = greetingLen.value;
// El segmento ya está en la memoria: «¡» son dos bytes, c2 a1.
console.log('memoria desde', ptr, '→', Array.from(new Uint8Array(memory.buffer, ptr, 4), (byte) => byte.toString(16)).join(' '), '…');
// Para leerlo: una vista de EXACTAMENTE esos bytes y TextDecoder (lección «Texto y binario»).
const decoder = new TextDecoder();
console.log('texto →', decoder.decode(new Uint8Array(memory.buffer, ptr, size)));

// Cada instancia copia el segmento en SU memoria: cambiar una no toca la otra.
new Uint8Array(memory.buffer, ptr + 2, 10).set(new TextEncoder().encode('BIENVENIDA'));
const second = await WebAssembly.instantiate(module);
console.log('1.ª instancia →', decoder.decode(new Uint8Array(memory.buffer, ptr, 15)));
console.log('2.ª instancia →', decoder.decode(new Uint8Array(second.exports.memory.buffer, ptr, 15)));
```

---
example_description: "new WebAssembly.Memory({ initial, maximum }): una memoria lineal que se mide en páginas de 64 KiB; memory.buffer es un ArrayBuffer que se lee con vistas, grow(n) devuelve las páginas que había y pasar del máximo lanza RangeError"
example_tags: "javascript|webassembly|wasm|memory|paginas|arraybuffer|grow|python"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// La memoria lineal de WebAssembly: un bloque de bytes que se mide en PÁGINAS de
// 64 KiB (65 536 bytes). Esta empieza con 1 página y puede crecer hasta 3.
const memory = new WebAssembly.Memory({ initial: 1, maximum: 3 });
console.log('buffer →', memory.buffer.byteLength, 'bytes | ¿ArrayBuffer? →', memory.buffer instanceof ArrayBuffer);

// Se lee y se escribe con vistas, como cualquier ArrayBuffer (lección «ArrayBuffer y vistas»).
const encoder = new TextEncoder();
new Uint8Array(memory.buffer).set(encoder.encode('Mole'), 0);
new DataView(memory.buffer).setFloat64(8, 189.5, true); // little-endian, como toda la memoria de wasm
console.log('bytes 0-11 →', Array.from(new Uint8Array(memory.buffer, 0, 12), (byte) => byte.toString(16).padStart(2, '0')).join(' '));

// grow(n) añade n páginas (a cero) y devuelve cuántas había ANTES.
console.log('grow(1) →', memory.grow(1), '| ahora →', memory.buffer.byteLength, 'bytes');
// Lo que había se conserva. (Fíjate en que se pide memory.buffer otra vez: el ejemplo 09
// explica por qué no sirve una vista creada antes de grow.)
console.log('lo escrito antes →', new TextDecoder().decode(new Uint8Array(memory.buffer, 0, 4)), new DataView(memory.buffer).getFloat64(8, true));

// Más allá del máximo no se puede crecer.
try {
  memory.grow(5);
} catch (error) {
  console.log(`grow(5) → ${error.name}: ${error.message}`);
}
console.log('páginas →', memory.buffer.byteLength / 65536);

// Python: es un bytearray(65536) que puede alargarse, y memoryview(bloque).cast('d')
// es la vista de float64. struct.pack_into('<d', bloque, 8, 189.5) escribe como el DataView.
```

---
example_description: "Cargar un .wasm de los assets con WebAssembly.instantiateStreaming(fetch(…)): el servidor lo envía como application/wasm y el navegador compila mientras descarga; el módulo calcula FNV-1a y Adler-32 de un texto escrito con encodeInto, igual que la versión en JavaScript"
example_tags: "javascript|webassembly|wasm|instantiatestreaming|fetch|assets|hash|fnv"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/checksum.wasm y su formato de texto, assets/wasm/checksum.wat.txt
// (léelos con «Assets»): un módulo con su memoria y dos funciones, fnv1a y adler32.
const response = await fetch('wasm/checksum.wasm');
console.log('Content-Type →', response.headers.get('content-type'));

// instantiateStreaming recibe la respuesta (o la promesa de fetch) y compila los bytes
// MIENTRAS llegan por la red: cuando termina la descarga, casi ha terminado de compilar.
const { module, instance } = await WebAssembly.instantiateStreaming(response);
console.log('exporta →', WebAssembly.Module.exports(module).map((entry) => `${entry.name} (${entry.kind})`).join(', '));

// Un texto a la memoria, con encodeInto (lección «La memoria lineal»), y sus dos sumas.
const { memory, fnv1a, adler32 } = instance.exports;
const text = 'Museo Frida Kahlo, Coyoacán';
const { written } = new TextEncoder().encodeInto(text, new Uint8Array(memory.buffer));
const hex32 = (value) => (value >>> 0).toString(16).padStart(8, '0'); // i32 → 8 cifras sin signo
console.log(`fnv1a → ${hex32(fnv1a(0, written))} | adler32 → ${hex32(adler32(0, written))}`);
// Un i32 llega con signo: sin >>> 0, el hash es negativo (lección «Bits y bytes»).
console.log('fnv1a sin >>> 0 →', fnv1a(0, written));

// La misma FNV-1a en JavaScript, para comprobar el módulo:
function fnv1aJs(bytes) {
  let hash = 0x811c9dc5;
  for (const byte of bytes) hash = Math.imul(hash ^ byte, 0x01000193);
  return hash >>> 0;
}
console.log('¿igual que en JavaScript? →', fnv1aJs(new TextEncoder().encode(text)) === fnv1a(0, written) >>> 0);
```

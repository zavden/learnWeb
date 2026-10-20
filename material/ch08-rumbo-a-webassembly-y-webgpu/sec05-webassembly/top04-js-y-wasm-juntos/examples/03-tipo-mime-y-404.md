---
example_description: "🐛 instantiateStreaming exige la cabecera Content-Type: application/wasm: los mismos bytes servidos como .bin (application/octet-stream) dan «Incorrect response MIME type» y un 404, «HTTP status code is not ok»; una función de carga comprueba el estado y cae a arrayBuffer() + instantiate si el tipo no es el correcto"
example_tags: "javascript|webassembly|wasm|instantiatestreaming|mime|404|fetch|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/checksum.wasm y checksum.bin: los MISMOS 196 bytes con dos extensiones.
// El servidor envía el .wasm como application/wasm y el .bin como application/octet-stream.
async function tryStreaming(url) {
  try {
    const { instance } = await WebAssembly.instantiateStreaming(fetch(url));
    return `✅ ${url} → exporta ${Object.keys(instance.exports).join(', ')}`;
  } catch (error) {
    return `🐛 ${url} → ${error.name}: ${error.message}`;
  }
}
console.log(await tryStreaming('wasm/checksum.wasm'));
// 🐛 El tipo MIME no es application/wasm: el navegador no compila, aunque los bytes sean buenos.
console.log(await tryStreaming('wasm/checksum.bin'));
// 🐛 Un 404: la respuesta trae un JSON de error, no un módulo.
console.log(await tryStreaming('wasm/no-existe.wasm'));

// ✅ Una función de carga robusta: comprueba el estado HTTP con su propio mensaje y, si el
//    servidor no anuncia application/wasm, descarga todo y compila después (más lento).
async function loadWasm(url, imports = {}) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  if (response.headers.get('content-type') === 'application/wasm') {
    return WebAssembly.instantiateStreaming(response, imports);
  }
  return WebAssembly.instantiate(await response.arrayBuffer(), imports);
}
const { instance } = await loadWasm('wasm/checksum.bin');
console.log('✅ checksum.bin con arrayBuffer() → exporta', Object.keys(instance.exports).join(', '));
try {
  await loadWasm('wasm/no-existe.wasm');
} catch (error) {
  console.log(`✅ un 404 con un mensaje claro → ${error.name}: ${error.message}`);
}
// La solución de verdad está en el servidor: que envíe los .wasm como application/wasm.
```

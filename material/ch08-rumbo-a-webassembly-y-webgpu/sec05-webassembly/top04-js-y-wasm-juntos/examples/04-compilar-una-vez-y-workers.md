---
example_description: "compileStreaming compila checksum.wasm una sola vez: dos instancias del mismo Module tienen memorias separadas, y el Module se envía con postMessage a un worker, que lo instancia sin volver a descargarlo ni compilarlo; una Instance, en cambio, no se puede enviar (DataCloneError)"
example_tags: "javascript|webassembly|wasm|compilestreaming|module|worker|postmessage"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/wasm/checksum.wasm (léelo con «Assets»).
// 1. Compilar UNA vez. compileStreaming devuelve el Module, sin instanciarlo.
const module = await WebAssembly.compileStreaming(fetch('wasm/checksum.wasm'));
console.log('compileStreaming →', WebAssembly.Module.exports(module).length, 'exportaciones');

// 2. Instanciar las veces que haga falta: cada instancia tiene su propia memoria.
const first = await WebAssembly.instantiate(module);
const second = await WebAssembly.instantiate(module);
console.log('¿las dos instancias comparten memoria? →', first.exports.memory.buffer === second.exports.memory.buffer);

// 3. Un worker (lección «Web workers») que recibe el Module y lo instancia. Su consola no
//    llega a la de LearnWeb: devuelve el resultado con postMessage.
const workerCode = `
  self.onmessage = async ({ data }) => {
    const instance = await WebAssembly.instantiate(data.module);
    const { memory, fnv1a } = instance.exports;
    const { written } = new TextEncoder().encodeInto(data.text, new Uint8Array(memory.buffer));
    self.postMessage({ isModule: data.module instanceof WebAssembly.Module, hash: fnv1a(0, written) >>> 0 });
  };
`;
const worker = new Worker(URL.createObjectURL(new Blob([workerCode], { type: 'text/javascript' })));

// 🐛 Una Instance no viaja: tiene estado (su memoria, sus globales) que no se puede clonar.
try {
  worker.postMessage({ instance: first });
} catch (error) {
  console.log(`🐛 postMessage(instance) → ${error.name}`);
}

// ✅ El Module sí: el worker no lo descarga ni lo compila otra vez.
const text = 'Museo Frida Kahlo, Coyoacán';
const reply = await new Promise((resolve, reject) => {
  worker.onmessage = (event) => resolve(event.data);
  worker.onerror = (event) => reject(new Error(event.message));
  worker.postMessage({ module, text });
});
worker.terminate();

const { written } = new TextEncoder().encodeInto(text, new Uint8Array(first.exports.memory.buffer));
const here = first.exports.fnv1a(0, written) >>> 0;
console.log('worker: ¿recibió un Module? →', reply.isModule);
console.log(`worker: fnv1a → ${reply.hash.toString(16)} · ¿igual que en la página? → ${reply.hash === here}`);
```

---
example_description: "Sin aislamiento cross-origin, un SharedArrayBuffer no se puede enviar a un worker (DataCloneError: SharedArrayBuffer transfer requires self.crossOriginIsolated) y Atomics.wait no se puede usar en el hilo principal (TypeError); lo que sí funciona es enviar una copia o transferir un ArrayBuffer"
example_tags: "javascript|sharedarraybuffer|atomics|workers|datacloneerror|crossoriginisolated|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const shared = new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true }).buffer;
const counters = new Int32Array(shared);
counters.set([120, 4, 0, 7]);

const url = URL.createObjectURL(new Blob(['self.onmessage = (event) => self.postMessage(event.data.join(", "));'], { type: 'text/javascript' }));
const worker = new Worker(url);
URL.revokeObjectURL(url);

// 🐛 1. Compartirlo con un worker: sin aislamiento, el navegador se niega.
try {
  worker.postMessage(shared);
  console.log('enviado');
} catch (error) {
  console.log(`🐛 postMessage → ${error.name}: ${error.message}`);
}

// 🐛 2. Atomics.wait duerme el hilo hasta que otro le avise. En el hilo principal
// nunca se permite, con o sin aislamiento: dormiría la página entera.
try {
  Atomics.wait(counters, 0, 120, 10);
} catch (error) {
  console.log(`🐛 Atomics.wait → ${error.name}: ${error.message}`);
}

// ✅ Lo que sí funciona: una COPIA en un ArrayBuffer normal (o transferirlo, lección anterior).
const snapshot = new Int32Array(counters.subarray(0, 4)); // new Int32Array(vista) copia los valores
worker.onmessage = (event) => {
  console.log('✅ el worker recibió una copia →', event.data);
  worker.terminate();
};
worker.postMessage(snapshot);
```

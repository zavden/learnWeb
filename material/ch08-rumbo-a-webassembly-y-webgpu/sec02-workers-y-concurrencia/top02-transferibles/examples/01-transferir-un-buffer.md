---
example_description: "Transferir un ArrayBuffer a un worker: con postMessage(mensaje, [búfer]) los 192 000 bytes de un segundo de audio se mueven al worker sin copiarse, y el búfer de la página queda desconectado (byteLength 0)"
example_tags: "javascript|workers|transferibles|arraybuffer|postmessage|detached|audio"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un segundo de audio a 48 000 muestras por segundo: el tono de 440 Hz (la nota la).
const samples = new Float32Array(48_000);
for (let i = 0; i < samples.length; i++) samples[i] = 0.8 * Math.sin((2 * Math.PI * 440 * i) / 48_000);

// Un worker diminuto (Blob, lección anterior): busca el pico de volumen.
const code = `
  self.onmessage = (event) => {
    const samples = event.data; // un Float32Array sobre el búfer que llegó
    let peak = 0;
    for (const value of samples) peak = Math.max(peak, Math.abs(value));
    self.postMessage({ bytes: samples.buffer.byteLength, peak });
  };
`;
const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
const worker = new Worker(url);
URL.revokeObjectURL(url);

worker.onmessage = (event) => {
  console.log('worker: recibió', event.data.bytes, 'bytes · pico', event.data.peak.toFixed(2));
  worker.terminate();
};

console.log('antes → la página tiene', samples.buffer.byteLength, 'bytes');
// El 2º argumento es la LISTA DE TRANSFERENCIA: lo que se MUEVE en vez de copiarse.
// (También vale la forma con opciones: postMessage(samples, { transfer: [samples.buffer] }).)
worker.postMessage(samples, [samples.buffer]);
console.log('después → la página tiene', samples.buffer.byteLength, 'bytes · detached:', samples.buffer.detached);

// La vista viaja en el mensaje (se recrea al otro lado) y su búfer, en la lista:
// el worker recibe un Float32Array sobre los MISMOS bytes, sin copia.
```

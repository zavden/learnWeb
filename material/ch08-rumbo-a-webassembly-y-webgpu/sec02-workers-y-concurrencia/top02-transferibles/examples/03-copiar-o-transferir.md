---
example_description: "Copiar o transferir: al cargar, 1 MB copiado (la página conserva sus bytes) frente a 1 MB transferido (la página se queda con 0); el botón mide el viaje de 32 MB: copiar cuesta milisegundos que crecen con el tamaño, transferir cuesta lo mismo que un mensaje vacío"
example_tags: "javascript|workers|transferibles|arraybuffer|rendimiento|copia"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Copiar o transferir</h1>
  <p>Un búfer de 32 MB, lo que ocupa una imagen de 4096 × 2048 píxeles en RGBA, viaja al worker de las dos maneras.</p>
  <button id="measure" type="button">Medir con 32 MB</button>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
button { font: inherit; padding: 0.35rem 0.9rem; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { padding-inline-start: 1.25rem; font-size: 0.85rem; font-variant-numeric: tabular-nums; }
```

# JavaScript

```javascript
const logList = document.querySelector('#log');
function report(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
// El worker solo responde cuántos bytes recibió.
const url = URL.createObjectURL(new Blob(['self.onmessage = (event) => self.postMessage(event.data.byteLength);'], { type: 'text/javascript' }));
const worker = new Worker(url);
URL.revokeObjectURL(url);
addEventListener('pagehide', () => worker.terminate());
const reply = () => new Promise((resolve) => { worker.onmessage = (event) => resolve(event.data); });

// Un viaje de ida y vuelta (la vuelta es un número): cuánto tarda y qué le queda a la página.
async function trip(mode, megabytes) {
  const buffer = new ArrayBuffer(megabytes * 1024 * 1024);
  new Uint8Array(buffer).fill(7); // que los bytes existan de verdad
  const start = performance.now();
  if (mode === 'copy') worker.postMessage(buffer);  // se copian todos los bytes
  else worker.postMessage(buffer, [buffer]);         // se mueve el búfer: cero bytes copiados
  const received = await reply();
  return { ms: performance.now() - start, received, left: buffer.byteLength };
}

const measureButton = document.querySelector('#measure');
measureButton.addEventListener('click', async () => {
  measureButton.disabled = true;
  for (const [mode, label] of [['copy', 'copiados'], ['transfer', 'transferidos']]) {
    const { ms } = await trip(mode, 32);
    report(`32 MB ${label} → ${ms.toFixed(1)} ms`);
  }
  measureButton.disabled = false;
});

// Al cargar, 1 MB de cada forma (sin tiempos: cambian en cada ejecución).
for (const [mode, label] of [['copy', 'copiado'], ['transfer', 'transferido']]) {
  const { received, left } = await trip(mode, 1);
  report(`1 MB ${label} → el worker recibió ${received} bytes · a la página le quedan ${left}`);
}
report('Listo: pulsa «Medir con 32 MB»');
```

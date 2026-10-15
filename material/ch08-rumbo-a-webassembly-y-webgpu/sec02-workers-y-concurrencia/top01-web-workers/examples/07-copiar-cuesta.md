---
example_description: "Enviar un objeto grande a un worker no es gratis: postMessage lo clona entero en el hilo que envía, así que la página se queda ocupada un tiempo que crece con el tamaño; el botón mide 10 000, 100 000 y 300 000 ventas como objetos y las mismas cifras en un Float64Array"
example_tags: "javascript|workers|postmessage|structuredclone|rendimiento|typed-arrays|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>¿Cuánto cuesta un mensaje?</h1>
  <p>El botón envía al worker listas de ventas cada vez más grandes. La página se congela unas décimas de segundo a propósito, mientras copia.</p>
  <button id="measure" type="button">Medir</button>
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
// Un worker diminuto (en un Blob): responde con cuántos elementos recibió.
const blobUrl = URL.createObjectURL(new Blob(['self.onmessage = (event) => self.postMessage(event.data.length);'], { type: 'text/javascript' }));
const worker = new Worker(blobUrl);
URL.revokeObjectURL(blobUrl);
addEventListener('pagehide', () => worker.terminate());
const reply = () => new Promise((resolve) => { worker.onmessage = (event) => resolve(event.data); });

const CITIES = ['CDMX', 'Guadalajara', 'Monterrey', 'Puebla', 'Mérida'];
const makeSales = (count) => Array.from({ length: count }, (_, i) => ({ id: i, city: CITIES[i % 5], amount: (i * 7919) % 5000 / 10, units: 1 + (i % 4) }));

async function send(label, payload) {
  const start = performance.now();
  worker.postMessage(payload);   // 🐛 el clonado ocurre AQUÍ, en el hilo de la página
  const blocked = performance.now() - start;
  const received = await reply(); // el worker recibe su copia y responde
  const total = performance.now() - start;
  report(`${label} → postMessage ocupó la página ${blocked.toFixed(1)} ms · respuesta en ${total.toFixed(1)} ms (${received.toLocaleString('es-MX')} recibidos)`);
}

const measureButton = document.querySelector('#measure');
measureButton.addEventListener('click', async () => {
  measureButton.disabled = true;
  for (const count of [10_000, 100_000, 300_000]) await send(`${count.toLocaleString('es-MX')} objetos`, makeSales(count));
  // Las mismas cifras, sin objetos: id, importe y unidades seguidos en un typed array.
  const numbers = new Float64Array(300_000 * 3).map((_, k) => k);
  await send('300,000 ventas en un Float64Array (7 MB)', numbers);
  measureButton.disabled = false;
});

// Al cargar, solo una lista pequeña (sin tiempos: cambian en cada ejecución).
const sample = makeSales(1_000);
worker.postMessage(sample);
report(`1,000 ventas copiadas → el worker recibió ${await reply()} · el original sigue aquí: ${sample.length}`);
report('Listo: pulsa «Medir»');
```

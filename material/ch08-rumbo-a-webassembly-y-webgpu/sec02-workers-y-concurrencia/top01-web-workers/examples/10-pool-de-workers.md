---
example_description: "Un pool de workers: contar los primos menores que 4 millones en 16 trozos repartidos entre min(4, navigator.hardwareConcurrency) workers, cada uno pide el siguiente trozo al terminar y los resultados se guardan por índice; el reloj de la página sigue andando, y la misma cuenta en el hilo principal lo congela. Con «Detener», terminate() corta el trabajo"
example_tags: "javascript|workers|pool|hardwareconcurrency|paralelismo|terminate|abortcontroller"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Primos en paralelo</h1>
  <p>¿Cuántos primos hay por debajo de 4 000 000? La misma cuenta, en 16 trozos repartidos entre varios workers o de una vez en el hilo principal, que congela la página unas décimas de segundo a propósito.</p>
  <p>Núcleos lógicos: <output id="cores"></output> → pool de <output id="pool-size"></output> workers</p>
  <div class="buttons">
    <button id="pool" type="button">Contar con workers</button>
    <button id="main" type="button">Contar en el hilo principal</button>
    <button id="stop" type="button" disabled>Detener</button>
  </div>
  <p>Reloj de la página: <output id="clock">0.00 s</output></p>
  <progress id="progress" max="16" value="0" aria-label="Trozos terminados"></progress>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
.buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { font: inherit; padding: 0.35rem 0.8rem; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
output { font-variant-numeric: tabular-nums; font-weight: 600; }
progress { inline-size: 100%; }
.log { padding-inline-start: 1.25rem; font-size: 0.85rem; }
```

# JavaScript

```javascript
// Usa 10-pool/primes.js (la cuenta) y 10-pool/primes-worker.js (un worker del pool).
import { countPrimes } from './10-pool/primes.js';

const LIMIT = 4_000_000;
const CHUNKS = 16;
const poolSize = Math.min(4, navigator.hardwareConcurrency || 2); // nunca más de 4
const $ = (selector) => document.querySelector(selector);
const fmt = (n) => n.toLocaleString('es-MX');
const sum = (numbers) => numbers.reduce((a, b) => a + b, 0);
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}
$('#cores').textContent = navigator.hardwareConcurrency;
$('#pool-size').textContent = poolSize;

// EL POOL: una cola de trozos; cada worker pide el siguiente al terminar el suyo
// (los de arriba cuestan más, así nadie se queda parado). Resultado por índice.
function runPool(limit, chunks, size, { signal, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const queue = Array.from({ length: chunks }, (_, index) => ({
      index, from: Math.floor((index * limit) / chunks), to: Math.floor(((index + 1) * limit) / chunks),
    }));
    const counts = new Array(chunks);
    let finished = 0;
    const workers = Array.from({ length: size }, () => new Worker('10-pool/primes-worker.js', { type: 'module' }));
    const stopAll = () => workers.forEach((worker) => worker.terminate());
    signal?.addEventListener('abort', () => { stopAll(); reject(signal.reason); }, { once: true });
    for (const worker of workers) {
      const giveWork = () => { const job = queue.shift(); if (job) worker.postMessage(job); };
      worker.onmessage = (event) => {
        counts[event.data.index] = event.data.count; // cada resultado en SU sitio, llegue cuando llegue
        finished += 1; // fuera de onProgress?.(…): si no hay callback, ?. ni evalúa el argumento
        onProgress?.(finished);
        if (finished === chunks) { stopAll(); resolve(counts); } else giveWork();
      };
      worker.onerror = (event) => { event.preventDefault(); stopAll(); reject(new Error(event.message)); };
      giveWork();
    }
  });
}

// Un reloj de JavaScript: si el hilo principal está ocupado, no avanza.
function startClock() {
  const start = performance.now();
  let ticks = 0;
  const id = setInterval(() => { ticks += 1; $('#clock').textContent = `${((performance.now() - start) / 1000).toFixed(2)} s`; }, 25);
  return { ticks: () => ticks, stop: () => clearInterval(id) };
}
let controller = null;
function setBusy(busy) {
  $('#pool').disabled = busy;
  $('#main').disabled = busy;
  $('#stop').disabled = !busy || controller === null;
}

$('#pool').addEventListener('click', async () => {
  controller = new AbortController();
  setBusy(true);
  $('#progress').value = 0;
  const clock = startClock();
  const start = performance.now();
  try {
    const counts = await runPool(LIMIT, CHUNKS, poolSize, { signal: controller.signal, onProgress: (n) => { $('#progress').value = n; } });
    report(`workers: ${fmt(sum(counts))} primos en ${(performance.now() - start).toFixed(0)} ms · ticks del reloj mientras tanto: ${clock.ticks()}`);
  } catch (error) {
    report(error.name === 'AbortError' ? '⏹ detenido: terminate() cerró los workers a mitad de trabajo' : `⚠️ ${error.message}`);
  } finally {
    clock.stop();
    controller = null;
    setBusy(false);
  }
});
$('#stop').addEventListener('click', () => controller?.abort());
addEventListener('pagehide', () => controller?.abort());

$('#main').addEventListener('click', () => {
  setBusy(true);
  const clock = startClock();
  setTimeout(() => { // deja andar el reloj un momento… y bloquea
    const ticksBefore = clock.ticks();
    const start = performance.now();
    const count = countPrimes(0, LIMIT); // ni reloj, ni pintado, ni clics hasta que termine
    report(`hilo principal: ${fmt(count)} primos en ${(performance.now() - start).toFixed(0)} ms · ticks del reloj mientras tanto: ${clock.ticks() - ticksBefore}`);
    clock.stop();
    setBusy(false);
  }, 100);
});

// Al cargar, una cuenta pequeña con el pool, comprobada contra la de un solo hilo.
const small = await runPool(100_000, CHUNKS, poolSize);
report(`primos menores que 100,000 → ${fmt(sum(small))} (${CHUNKS} trozos) · ¿igual que en un solo hilo? ${sum(small) === countPrimes(0, 100_000)}`);
report('Listo: pulsa «Contar con workers» y luego «Contar en el hilo principal»; mira el reloj');
```

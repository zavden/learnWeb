---
example_description: "Un medidor de fluidez: el mismo cálculo (contar los primos menores que 3 millones) de cuatro formas —de una vez en el hilo principal, troceado con setTimeout, troceado con scheduler.yield() y en un worker— mientras dos sondas miden el bloqueo más largo del bucle de eventos y los fotogramas de más de 50 ms"
example_tags: "javascript|workers|rendimiento|event-loop|requestanimationframe|scheduler-yield|medir|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Medidor de fluidez</h1>
  <p class="intro">Cada prueba hace el mismo cálculo, unas décimas de segundo de CPU. Mientras dura, un punto se mueve con <code>requestAnimationFrame</code> y una sonda mira cada 10 ms si el bucle de eventos responde.</p>
  <div class="track" aria-hidden="true"><span id="dot" class="dot"></span></div>
  <p class="frames">Fotogramas pintados: <output id="frames">0</output></p>
  <div class="buttons" role="group" aria-label="Pruebas">
    <button type="button" data-variant="main">Hilo principal, de una vez</button>
    <button type="button" data-variant="timeout">Troceado con setTimeout</button>
    <button type="button" data-variant="yield">Troceado con scheduler.yield()</button>
    <button type="button" data-variant="worker">En un worker</button>
  </div>
  <div class="table-wrap">
    <table>
      <caption>Resultados (la última ejecución de cada prueba)</caption>
      <thead>
        <tr><th scope="col">Prueba</th><th scope="col">Total</th><th scope="col">Bloqueo más largo</th><th scope="col">Fotogramas &gt; 50 ms</th></tr>
      </thead>
      <tbody id="results"></tbody>
    </table>
  </div>
  <p id="status" class="status" role="status"></p>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.app { max-width: 38rem; margin: 0 auto; padding: 1rem; display: grid; gap: 0.75rem; }
h1 { margin: 0; font-size: 1.25rem; }
.intro { margin: 0; color: var(--muted); font-size: 0.9rem; }
.track { position: relative; block-size: 1.25rem; border: 1px solid var(--line); border-radius: 1rem; background: var(--surface); overflow: hidden; }
.dot { position: absolute; inset-block: 0.15rem; inset-inline-start: 0.15rem; inline-size: 0.9rem; border-radius: 50%; background: var(--accent); }
.frames, .status { margin: 0; font-variant-numeric: tabular-nums; }
.status { font-weight: 600; }
.buttons { display: flex; flex-wrap: wrap; gap: 0.4rem; }
button { font: inherit; color: var(--ink); padding: 0.3rem 0.65rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.6; }
button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.table-wrap { overflow-x: auto; }
table { inline-size: 100%; border-collapse: collapse; font-size: 0.85rem; font-variant-numeric: tabular-nums; background: var(--surface); }
caption { text-align: start; font-weight: 600; padding-block-end: 0.3rem; }
th, td { padding: 0.3rem 0.5rem; border: 1px solid var(--line); text-align: end; }
th:first-child, td:first-child { text-align: start; }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-size: 0.8rem; }
```

# JavaScript

```javascript
// MEDIDOR DE FLUIDEZ
//
// Decisiones de diseño:
// - Dos sondas, encendidas solo durante una prueba: (1) una cadena de setTimeout de 10 ms
//   que anota cuánto tarda de más cada vuelta: el retraso más grande es el bloqueo más
//   largo del bucle de eventos (lo que esperaría un clic); (2) un bucle de rAF que anota
//   el mayor hueco entre fotogramas y cuántos pasan de 50 ms (lo que se ve a tirones).
// - Las cuatro pruebas cuentan los mismos primos con el mismo código (08-meter/primes.js).
//   La del worker (08-meter/primes-worker.js) no toca el hilo principal.
// - scheduler.yield() (lección «Frames de animación y tiempo», en Chrome) devuelve el turno
//   muy pronto: los clics se atienden enseguida, pero el navegador pinta pocas veces.
//   Las cifras lo enseñan. Si no existe, la prueba lo dice.
// - Con «reducir movimiento», el punto no se mueve; las medidas son las mismas.
// - Para medir con más rigor (performance.mark, long tasks): el módulo «Rendimiento».
//
// Alcance: HTML, CSS, el capítulo de JavaScript (event loop, promesas, módulos),
// requestAnimationFrame y matchMedia del capítulo 6, y este módulo.
import { countPrimes, countPrimesInSlices } from './08-meter/primes.js';

const LIMIT = 3_000_000;
const EXPECTED = 216_816; // primos menores que 3 000 000
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (selector) => document.querySelector(selector);
const fmt = (n) => n.toLocaleString('es-MX');
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

const worker = new Worker('08-meter/primes-worker.js', { type: 'module' });
addEventListener('pagehide', () => worker.terminate());
const inWorker = () => new Promise((resolve) => {
  worker.onmessage = (event) => resolve(event.data);
  worker.postMessage({ from: 0, to: LIMIT });
});

const VARIANTS = {
  main: { label: 'hilo principal, de una vez', run: async () => countPrimes(0, LIMIT) },
  timeout: { label: 'troceado con setTimeout', run: () => countPrimesInSlices(0, LIMIT, () => new Promise((resolve) => setTimeout(resolve, 0))) },
  yield: {
    label: 'troceado con scheduler.yield()',
    available: () => typeof globalThis.scheduler?.yield === 'function',
    run: () => countPrimesInSlices(0, LIMIT, () => globalThis.scheduler.yield()),
  },
  worker: { label: 'en un worker', run: inWorker },
};

// Las dos sondas. Devuelven una función que las para y da sus medidas.
function startProbes() {
  let worstLag = 0;
  let expected = performance.now() + 10;
  let timer = 0;
  const tick = () => {
    const now = performance.now();
    worstLag = Math.max(worstLag, now - expected);
    expected = now + 10;
    timer = setTimeout(tick, 10);
  };
  timer = setTimeout(tick, 10);

  let previous = null;
  let worstGap = 0;
  let longFrames = 0;
  let frames = 0;
  let frameId = 0;
  const frame = (now) => {
    if (previous !== null) {
      const gap = now - previous;
      worstGap = Math.max(worstGap, gap);
      if (gap > 50) longFrames += 1;
    }
    previous = now;
    frames += 1;
    $('#frames').textContent = frames;
    if (!reducedMotion) $('#dot').style.translate = `${((now / 4) % 300).toFixed(1)}px 0`;
    frameId = requestAnimationFrame(frame);
  };
  frameId = requestAnimationFrame(frame);

  return () => {
    clearTimeout(timer);
    cancelAnimationFrame(frameId);
    return { worstLag, worstGap, longFrames };
  };
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function measure(key) {
  const variant = VARIANTS[key];
  if (variant.available && !variant.available()) {
    report(`⚠️ ${variant.label}: este navegador no tiene scheduler.yield()`);
    return;
  }
  document.querySelectorAll('.buttons button').forEach((button) => { button.disabled = true; });
  $('#status').textContent = `Midiendo: ${variant.label}…`;
  const stopProbes = startProbes();
  await wait(150); // las sondas toman nota del ritmo normal
  const start = performance.now();
  const count = await new Promise((resolve) => setTimeout(() => resolve(variant.run()), 0));
  const total = performance.now() - start;
  await wait(150);
  const { worstLag, worstGap, longFrames } = stopProbes();
  const check = count === EXPECTED ? '' : ` · ❌ ${fmt(count)} primos`;
  report(`🧪 ${variant.label}: ${total.toFixed(0)} ms · bloqueo más largo ${worstLag.toFixed(0)} ms · fotogramas de más de 50 ms: ${longFrames} (el peor, ${worstGap.toFixed(0)} ms)${check}`);
  const row = document.querySelector(`#results tr[data-variant="${key}"]`) ?? document.createElement('tr');
  row.dataset.variant = key;
  row.replaceChildren(...[variant.label, `${total.toFixed(0)} ms`, `${worstLag.toFixed(0)} ms`, `${longFrames}`].map((text) => Object.assign(document.createElement('td'), { textContent: text })));
  $('#results').append(row);
  $('#status').textContent = 'Listo para otra prueba';
  document.querySelectorAll('.buttons button').forEach((button) => { button.disabled = false; });
}
document.querySelector('.buttons').addEventListener('click', (event) => {
  const key = event.target.closest('button')?.dataset.variant;
  if (key) measure(key);
});

// Al cargar: solo una comprobación pequeña del contador (nada pesado).
report(`📏 cada prueba cuenta los primos menores que ${fmt(LIMIT)} (${fmt(EXPECTED)}); comprobación rápida: ${countPrimes(0, 1000)} primos menores que 1,000`);
report('Listo: pulsa las cuatro pruebas, una tras otra, y compara la tabla; mueve el ratón o pulsa Tab mientras corren');
```

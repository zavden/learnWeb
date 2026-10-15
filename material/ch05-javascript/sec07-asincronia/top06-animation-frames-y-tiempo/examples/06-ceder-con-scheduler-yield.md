---
example_description: "Trocear trabajo dentro de un bucle normal y ceder el turno cada 10 ms: de una vez, una animación hecha con rAF se congela; con await scheduler.yield() (Chrome 129+) el trabajo termina antes pero Chrome pinta pocas veces; cediendo hasta el próximo frame (rAF + setTimeout) se pinta cada frame y el total tarda más"
example_tags: "javascript|async|scheduler-yield|requestanimationframe|trocear|rendimiento"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="report">
  <h1>Informe con animación</h1>
  <div class="spinner" aria-hidden="true"></div>
  <progress id="progress" max="100" value="0" aria-label="Progreso del informe"></progress>
  <p id="status" role="status">Preparando…</p>
  <button id="run" type="button">Repetir</button>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
.report {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 0.35rem solid #cbd2d9;
  border-top-color: #1d4ed8;
  border-radius: 50%;
}
progress {
  width: 100%;
  height: 1rem;
  margin-top: 0.75rem;
}
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// querySelector, style, value, textContent y addEventListener: capítulo 6.
const spinner = document.querySelector('.spinner');
const progress = document.querySelector('#progress');
const statusLine = document.querySelector('#status');
const runButton = document.querySelector('#run');

// Dos formas de ceder el turno entre rebanada y rebanada:
// - scheduler.yield() (Chrome 129+; si no existe, setTimeout): la
//   continuación tiene PRIORIDAD, así que el trabajo avanza rápido y los
//   clics se atienden, pero Chrome apenas encuentra hueco para pintar.
// - «hasta el próximo frame»: esperar al rAF y salir justo después del
//   pintado con un setTimeout. Se pinta cada frame, y el total tarda más.
const hasYield = typeof globalThis.scheduler?.yield === 'function';
const strategies = {
  'de una vez': null,
  'scheduler.yield()': () => (hasYield ? scheduler.yield() : new Promise((resolve) => setTimeout(resolve, 0))),
  'hasta el próximo frame': () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0))),
};

function busyFor(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) {}
}

// El indicador gira con rAF: lo mueve JavaScript, así que solo se mueve en
// los frames que el navegador llega a pintar.
let frames = 0;
let spinning = false;
function spin(now) {
  frames += 1;
  spinner.style.rotate = `${(now / 2) % 360}deg`;
  if (spinning) requestAnimationFrame(spin);
}

// 100 lotes de 3 ms; si hay estrategia, cede el turno cada ~10 ms.
async function buildReport(yieldNow) {
  const framesBefore = frames;
  const start = performance.now();
  let sliceStart = start;
  for (let batch = 1; batch <= 100; batch++) {
    busyFor(3);
    progress.value = batch;
    if (yieldNow && performance.now() - sliceStart >= 10) {
      await yieldNow(); // ← aquí el navegador puede atender clics y, si le toca, pintar
      sliceStart = performance.now();
    }
  }
  return { frames: frames - framesBefore, ms: performance.now() - start };
}

async function demo() {
  runButton.disabled = true;
  spinning = true;
  requestAnimationFrame(spin);
  await new Promise((resolve) => setTimeout(resolve, 200)); // la animación arranca

  const results = {};
  for (const [name, yieldNow] of Object.entries(strategies)) {
    statusLine.textContent = `Informe: ${name}…`;
    results[name] = await buildReport(yieldNow);
  }

  spinning = false; // el bucle de rAF se detiene en el próximo frame
  statusLine.textContent = 'Informe listo';
  runButton.disabled = false;
  const blocked = results['de una vez'];
  const fast = results['scheduler.yield()'];
  const smooth = results['hasta el próximo frame'];
  console.log('scheduler.yield disponible (Chrome 129+) →', hasYield);
  console.log('🐛 de una vez → frames durante el trabajo:', blocked.frames);
  console.log('scheduler.yield() → hubo frames:', fast.frames > 0);
  console.log('hasta el próximo frame → hubo frames:', smooth.frames > 0);
  console.log('hasta el próximo frame pinta más frames que scheduler.yield() →', smooth.frames > fast.frames);
  console.log('scheduler.yield() termina antes →', fast.ms < smooth.ms);
}

runButton.addEventListener('click', demo);
demo();

// Medido en Chrome 155 (varía): con scheduler.yield() el indicador se mueve
// a saltos, unas 10 veces por segundo (Chrome pinta cuando lleva ~100 ms sin
// hacerlo); cediendo hasta el próximo frame gira suave, y el informe tarda
// más. Para lo mejor de los dos, alterna: scheduler.yield() casi siempre y,
// cada ~16 ms, un «hasta el próximo frame» (lo hace el ejemplo profesional
// «Ventas sin bloquear la página»). O anima el indicador con CSS, que no
// depende de JavaScript.
// (No llames «scheduler» a tus variables: en Chrome, window.scheduler existe.)
```

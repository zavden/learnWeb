---
example_description: "Trocear el trabajo: el mismo informe de 300 ms, en rebanadas de unos 12 ms separadas por setTimeout, deja que entre rebanada y rebanada el reloj avance, la barra se pinte y los clics se atiendan; a cambio, tarda un poco más en total"
example_tags: "javascript|event-loop|renderizado|trocear|settimeout|rendimiento"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main class="report">
  <h1>Informe de ventas (troceado)</h1>
  <p>Reloj de la página: <output id="clock">0</output> ticks <small>(uno cada 50 ms)</small></p>
  <progress id="progress" max="100" value="0" aria-label="Progreso del informe"></progress>
  <p id="status" role="status">Esperando…</p>
  <p class="actions">
    <button id="run" type="button">Generar informe</button>
    <button id="add" type="button">Sumar 1</button>
    Clics atendidos: <output id="clicks">0</output>
  </p>
  <p class="hint">Ahora el reloj sigue andando, la barra avanza y cada clic se atiende al momento.</p>
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
  font-size: 1.25rem;
  margin-top: 0;
}
progress {
  width: 100%;
  height: 1rem;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.hint {
  color: #52606d;
  font-size: 0.9rem;
}
```

# JavaScript

```javascript
// querySelector, textContent, value, disabled y addEventListener: capítulo 6.
const clockOutput = document.querySelector('#clock');
const progress = document.querySelector('#progress');
const statusLine = document.querySelector('#status');
const runButton = document.querySelector('#run');
const clicksOutput = document.querySelector('#clicks');
let clicks = 0;

function busyFor(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) {}
}

const TOTAL_BATCHES = 100;
const SLICE_MS = 12; // presupuesto por rebanada: deja hueco para pintar en cada frame

function generateReport() {
  runButton.disabled = true;
  statusLine.textContent = 'Calculando…'; // ✅ ahora sí se ve
  progress.value = 0;

  let ticks = 0;
  let frames = 0;
  const clockId = setInterval(() => {
    ticks += 1;
    clockOutput.textContent = ticks;
  }, 50);
  let frameId = requestAnimationFrame(function countFrame() {
    frames += 1;
    frameId = requestAnimationFrame(countFrame);
  });

  let batch = 0;
  let slices = 0;
  let ticksBefore;
  let framesBefore;
  let start;

  // Una rebanada: procesa lotes hasta gastar su presupuesto y CEDE el turno con
  // setTimeout. Entre rebanada y rebanada, el event loop atiende el reloj, los
  // clics y, cuando toca, pinta.
  function slice() {
    slices += 1;
    const sliceStart = performance.now();
    while (batch < TOTAL_BATCHES && performance.now() - sliceStart < SLICE_MS) {
      busyFor(3); // 3 ms por lote, como en el ejemplo anterior
      batch += 1;
      progress.value = batch;
    }
    if (batch < TOTAL_BATCHES) {
      setTimeout(slice, 0); // ← cede: la siguiente rebanada es una tarea NUEVA
      return;
    }
    const totalMs = performance.now() - start;
    statusLine.textContent = 'Informe listo';
    console.log('▶ informe generado por rebanadas');
    console.log('  lotes procesados →', batch);
    console.log('  ✅ rebanadas (tareas cortas) > 1 →', slices > 1);
    console.log('  ✅ el reloj avanzó mientras tanto →', ticks - ticksBefore > 0);
    console.log('  ✅ se pintaron frames mientras tanto →', frames - framesBefore > 0);
    console.log('  el precio: tardó más de 300 ms en total →', totalMs > 300);
    clearInterval(clockId);
    cancelAnimationFrame(frameId);
    runButton.disabled = false;
    console.log('  ⏸️ reloj detenido');
  }

  setTimeout(() => {
    ticksBefore = ticks;
    framesBefore = frames;
    start = performance.now();
    slice();
  }, 200);
}

document.querySelector('#add').addEventListener('click', () => {
  clicks += 1;
  clicksOutput.textContent = clicks;
});
runButton.addEventListener('click', generateReport);
generateReport();

// Trocear no hace el trabajo más rápido: lo reparte para que la página siga
// viva. Cuanto más corta la rebanada, más fluida la página y más tarda el
// total (cada setTimeout añade su espera; lo verás en la lección siguiente).
// En la lección «Frames de animación y tiempo», el mismo patrón se escribe
// con await dentro de un bucle normal, y verás qué forma de ceder deja pintar
// cada frame (scheduler.yield() atiende antes los clics, pero pinta menos).
```

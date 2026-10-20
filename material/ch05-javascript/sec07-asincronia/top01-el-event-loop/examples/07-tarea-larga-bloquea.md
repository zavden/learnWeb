---
example_description: "Una tarea síncrona larga congela la página: durante 300 ms de cálculo no avanza el reloj (setInterval), no se pinta ningún frame (ni «Calculando…» ni la barra de progreso intermedia) y los clics esperan en la cola hasta el final"
example_tags: "javascript|event-loop|renderizado|bloqueo|tarea-larga|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main class="report">
  <h1>Informe de ventas</h1>
  <p>Reloj de la página: <output id="clock">0</output> ticks <small>(uno cada 50 ms)</small></p>
  <progress id="progress" max="100" value="0" aria-label="Progreso del informe"></progress>
  <p id="status" role="status">Esperando…</p>
  <p class="actions">
    <button id="run" type="button">Generar informe</button>
    <button id="add" type="button">Sumar 1</button>
    Clics atendidos: <output id="clicks">0</output>
  </p>
  <p class="hint">Pulsa «Generar informe» y, enseguida, «Sumar 1» varias veces: el reloj se para y los clics se atienden al final, todos de golpe.</p>
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
// querySelector, textContent, value, disabled y addEventListener se estudian en
// el capítulo 6. Aquí basta con saber que cambian lo que se ve en la página.
const clockOutput = document.querySelector('#clock');
const progress = document.querySelector('#progress');
const statusLine = document.querySelector('#status');
const runButton = document.querySelector('#run');
const clicksOutput = document.querySelector('#clicks');
let clicks = 0;

// Espera activa: simula cálculo puro (el bucle solo mira el reloj).
function busyFor(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) {}
}

function generateReport() {
  runButton.disabled = true;
  statusLine.textContent = 'Calculando…'; // 🐛 este texto nunca llega a pintarse
  progress.value = 0;

  // Dos testigos del event loop: un reloj (tarea cada 50 ms) y un contador de frames.
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

  setTimeout(() => { // dejamos correr el reloj 200 ms antes de bloquear
    const ticksBefore = ticks;
    const framesBefore = frames;
    const start = performance.now();
    for (let batch = 1; batch <= 100; batch++) {
      busyFor(3);            // 3 ms de cálculo por lote de pedidos
      progress.value = batch; // 🐛 la barra no se pinta hasta que termine la tarea
    }
    const blockedMs = performance.now() - start;
    statusLine.textContent = 'Informe listo';

    console.log('▶ informe generado de una vez');
    console.log('  🐛 la tarea duró ≥ 300 ms →', blockedMs >= 300);
    console.log(`  🐛 ticks del reloj durante la tarea → ${ticks - ticksBefore} (esperados ≈ 6)`);
    console.log(`  🐛 frames pintados durante la tarea → ${frames - framesBefore} (esperados ≈ 18 a 60 Hz)`);
    console.log('  🐛 «Calculando…» y la barra a medias nunca llegaron a la pantalla');

    setTimeout(() => { // el reloj vuelve a andar 200 ms, y lo paramos
      clearInterval(clockId);
      cancelAnimationFrame(frameId);
      runButton.disabled = false;
      console.log('  ⏸️ reloj detenido');
    }, 200);
  }, 200);
}

document.querySelector('#add').addEventListener('click', () => {
  clicks += 1;
  clicksOutput.textContent = clicks;
});
runButton.addEventListener('click', generateReport);
generateReport(); // una vez al cargar

// Mientras una tarea ocupa la pila, el event loop no puede hacer NADA más:
// ni temporizadores, ni pintar, ni atender clics (se quedan en la cola).
// Chrome considera «tarea larga» cualquiera de más de 50 ms; a partir de unos
// 100 ms el usuario nota que la página no responde. Solución: el ejemplo siguiente.
```

---
example_description: "Un clic que pinta tarde (INP malo): el botón escribe «Guardando…» y sigue 200 ms trabajando en el mismo manejador, así que el texto nunca llega a la pantalla y el siguiente pintado tarda más de 200 ms. Ceder hasta el próximo pintado antes del trabajo (rAF + setTimeout) enseña la respuesta en el acto"
example_tags: "javascript|rendimiento|inp|event-timing|interaccion|requestanimationframe|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Guardar el pedido P-4120</h1>
  <p class="actions">
    <button id="save-buggy" type="button">Guardar 🐛</button>
    <button id="save-fixed" type="button">Guardar ✅</button>
  </p>
  <p id="save-state" class="save-state" role="status">Sin guardar</p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:disabled { cursor: progress; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.save-state { font-weight: 600; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const saveState = document.querySelector('#save-state');
const buttons = document.querySelectorAll('button');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function busyFor(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) {} // validar, recalcular impuestos, serializar…
}
// Espera al próximo pintado: rAF corre justo antes de pintar y el setTimeout, justo después.
const afterNextPaint = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

// Event Timing: del input al siguiente pintado. durationThreshold: 16 pide también las cortas
// (por debajo de 16 ms el navegador no crea entrada: la respuesta fue inmediata).
const interactions = [];
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) if (entry.interactionId > 0) interactions.push(entry);
}).observe({ type: 'event', durationThreshold: 16 });

// ¿Llegó «Guardando…» a pintarse? Un rAF pedido al escribirlo mira qué texto hay justo
// antes del siguiente pintado.
let sawSaving = false;
function showSaving() {
  saveState.textContent = 'Guardando…';
  requestAnimationFrame(() => { sawSaving = saveState.textContent === 'Guardando…'; });
}

function report(kind, pressedAt) {
  setTimeout(() => {
    const mine = interactions.filter((entry) => entry.startTime + entry.duration >= pressedAt);
    const longest = Math.max(0, ...mine.map((entry) => entry.duration));
    const verdict = kind === '🐛' ? `¿más de 150 ms? ${longest > 150}` : `¿menos de 100 ms? ${longest < 100}`;
    logLine(`${kind} del clic al siguiente pintado: ${verdict} · ¿se vio «Guardando…»? ${sawSaving}`);
    for (const button of buttons) button.disabled = false;
  }, 800);
}

// 🐛 Todo en el manejador: el navegador no puede pintar hasta que termine.
document.querySelector('#save-buggy').addEventListener('click', (event) => {
  for (const button of buttons) button.disabled = true;
  showSaving();
  busyFor(200);
  saveState.textContent = 'Guardado 🐛';
  report('🐛', event.timeStamp);
});

// ✅ Primero la respuesta visible, después el trabajo, en otra tarea tras el pintado.
document.querySelector('#save-fixed').addEventListener('click', async (event) => {
  for (const button of buttons) button.disabled = true;
  showSaving();
  await afterNextPaint();
  busyFor(200); // sigue siendo una tarea larga: trocéala si molesta (ejemplo 06)
  saveState.textContent = 'Guardado ✅';
  report('✅', event.timeStamp);
});
console.log('Listo: pulsa «Guardar 🐛» y, cuando acabe, «Guardar ✅»');
```

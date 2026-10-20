---
example_description: "La opción { signal } de addEventListener: varios listeners (un botón, el teclado del documento y el resize de la ventana) comparten la señal de un AbortController y un solo abort() los quita todos"
example_tags: "javascript|eventos|abortcontroller|signal|removeeventlistener|teclado"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Tour de bienvenida</h1>
  <p id="step" class="step" aria-live="polite">Paso 1 de 3: este es tu panel de pedidos.</p>
  <p class="actions">
    <button id="next" type="button">Siguiente</button>
    <button id="finish" type="button">Terminar el tour</button>
    <button id="restart" type="button">Repetir el tour</button>
  </p>
  <p class="hint">Haz clic en la vista previa y prueba también las teclas <kbd>→</kbd> (siguiente) y <kbd>Esc</kbd> (terminar).</p>
  <ol id="log" class="log" aria-live="polite"></ol>
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
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.step {
  padding: 0.5rem 0.75rem;
  border-left: 4px solid #1d4ed8;
  background: #ffffff;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.hint {
  color: #52606d;
  font-size: 0.9rem;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const stepText = document.querySelector('#step');
const nextButton = document.querySelector('#next');
const logList = document.querySelector('#log');
const steps = ['este es tu panel de pedidos.', 'aquí ves los pedidos pendientes.', 'y aquí, tus ventas del mes.'];
let current = 0;
let tourController = null;
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function showStep() {
  stepText.textContent = `Paso ${current + 1} de 3: ${steps[current]}`;
  logLine(`➡️ paso ${current + 1}`);
}
function nextStep() {
  current = (current + 1) % steps.length;
  showStep();
}
function onKey(event) {
  if (event.key === 'ArrowRight') nextStep();
  if (event.key === 'Escape') finishTour();
}
function onResize() {
  logLine(`↔️ ventana de ${window.innerWidth} px: recoloco el globo del tour`);
}

function startTour() {
  tourController = new AbortController();
  const { signal } = tourController;
  // Tres listeners en tres sitios distintos, todos con la MISMA señal.
  nextButton.addEventListener('click', nextStep, { signal });
  document.addEventListener('keydown', onKey, { signal });
  window.addEventListener('resize', onResize, { signal });
  current = 0;
  showStep();
}

function finishTour() {
  if (!tourController || tourController.signal.aborted) return;
  tourController.abort(); // ← quita los tres de una vez
  stepText.textContent = 'Tour terminado.';
  logLine('⏹️ abort(): fuera los 3 listeners; «Siguiente» y → ya no hacen nada');
}

document.querySelector('#finish').addEventListener('click', finishTour);
document.querySelector('#restart').addEventListener('click', () => {
  finishTour();
  startTour(); // una señal abortada no se reutiliza: controlador nuevo
});
startTour();
logLine('Listo: pulsa «Siguiente», luego «Terminar el tour» y vuelve a probar «Siguiente»');

// Sin signal habría que guardar las tres funciones y llamar a
// removeEventListener tres veces, con la misma fase. Con signal, quien
// termina no necesita saber qué se registró. Es el AbortController del módulo
// «Asincronía y event loop»: la misma señal puede cancelar un fetch a la vez.
```

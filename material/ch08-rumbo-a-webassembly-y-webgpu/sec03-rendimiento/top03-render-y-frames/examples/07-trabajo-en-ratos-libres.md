---
example_description: "requestIdleCallback para el trabajo que puede esperar: 300 vistas de producto se preparan para la analítica solo cuando el navegador está libre, mirando deadline.timeRemaining() (nunca más de 50 ms) antes de cada una y pidiendo otro rato libre si quedan; { timeout } pone una fecha límite (didTimeout)"
example_tags: "javascript|rendimiento|requestidlecallback|idle|analitica|event-loop"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Analítica sin estorbar</h1>
  <p>Cada vista de producto se resume y se guarda para enviarla después. Nada de esto es urgente.</p>
  <p>
    <button id="run" type="button">Registrar 300 vistas</button>
    <output id="state" for="run">Cola vacía</output>
  </p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:disabled { cursor: progress; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
output { margin-inline-start: 0.5rem; color: #475569; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const runButton = document.querySelector('#run');
const state = document.querySelector('#state');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function busyFor(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) {}
}

// Por si un navegador no lo tiene, el recambio habitual: un setTimeout con un plazo fingido.
const whenIdle = globalThis.requestIdleCallback?.bind(globalThis)
  ?? ((callback) => setTimeout(() => { const start = performance.now(); callback({ didTimeout: false, timeRemaining: () => Math.max(0, 50 - (performance.now() - start)) }); }, 1));

const queue = [];
const sent = [];
let rounds = 0;
let timeouts = 0;
let maxRemaining = 0;

// Resumir una vista: ~0,15 ms de trabajo (comprimir, quitar datos personales…).
function prepareView(view) {
  busyFor(0.15);
  return `${view.sku}@${view.second}`;
}

function processQueue(deadline) {
  rounds += 1;
  if (deadline.didTimeout) timeouts += 1;
  maxRemaining = Math.max(maxRemaining, deadline.timeRemaining());
  // Una a una, mientras quede rato libre (con 1 ms de margen) y quede trabajo.
  while (queue.length > 0 && deadline.timeRemaining() > 1) {
    sent.push(prepareView(queue.shift()));
  }
  state.textContent = `procesadas ${sent.length} · en cola ${queue.length}`;
  if (queue.length > 0) {
    whenIdle(processQueue, { timeout: 2000 }); // si en 2 s no hay rato libre, que llame igual
  } else {
    logLine(`procesadas: ${sent.length} de 300 · ¿timeRemaining() pasó alguna vez de 50 ms? ${maxRemaining > 50}`);
    logLine(`ratos libres usados: ≈ ${rounds} · llamadas por timeout: ${timeouts}`);
    runButton.disabled = false;
  }
}

runButton.addEventListener('click', () => {
  runButton.disabled = true;
  sent.length = 0;
  rounds = 0;
  timeouts = 0;
  maxRemaining = 0;
  for (let i = 0; i < 300; i++) queue.push({ sku: `TAZ-${100 + (i % 12)}`, second: i });
  state.textContent = 'en cola 300';
  whenIdle(processQueue, { timeout: 2000 });
});
console.log('Listo: pulsa «Registrar 300 vistas» (unos 45 ms de trabajo, repartidos)');

// timeRemaining() nunca da más de 50 ms: así, si llega un clic, espera como mucho eso.
// Con frames en marcha (una animación), los ratos libres son los huecos entre frame y frame.
```

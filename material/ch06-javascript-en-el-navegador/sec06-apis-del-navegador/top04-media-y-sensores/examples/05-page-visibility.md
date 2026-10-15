---
example_description: "Page Visibility: document.visibilityState ('visible' o 'hidden') y el evento visibilitychange de document; un sondeo de pedidos cada 2 s se pausa cuando la pestaña se oculta y, al volver, pide en el acto y se reanuda"
example_tags: "javascript|page-visibility|visibilitychange|visibilitystate|sondeo|rendimiento"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Pedidos en vivo</h1>
  <p class="status">Estado: <output id="poll-state">—</output> · consultas: <output id="poll-count">0</output></p>
  <ul id="orders" class="orders" aria-live="polite"></ul>
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
  margin: 0 0 0.5rem;
}
.status {
  margin: 0 0 0.5rem;
}
.orders {
  min-height: 4.5rem;
  margin: 0;
  padding: 0.5rem 0.5rem 0.5rem 1.5rem;
  border-radius: 0.5rem;
  background: #ffffff;
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
const INCOMING = ['Mesa 3 · 2 cafés de olla', 'Para llevar · concha de vainilla', 'Mesa 5 · chocolate de Oaxaca', 'Mesa 1 · pan de elote'];
const MAX_POLLS = 60; // la demo se apaga sola a los 2 minutos
const stateOutput = document.querySelector('#poll-state');
const countOutput = document.querySelector('#poll-count');
const orderList = document.querySelector('#orders');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

let polls = 0;
let timer = null;
let hiddenAt = 0;

// En una app real, un fetch a la API («Red y almacenamiento»).
function poll() {
  polls += 1;
  countOutput.textContent = polls;
  const order = document.createElement('li');
  order.textContent = INCOMING[(polls - 1) % INCOMING.length];
  orderList.prepend(order);
  orderList.querySelectorAll('li:nth-child(n + 4)').forEach((old) => old.remove());
  if (polls >= MAX_POLLS) {
    stopPolling('fin de la demo');
    document.removeEventListener('visibilitychange', onVisibilityChange);
  }
}
function startPolling() {
  if (polls >= MAX_POLLS) return;
  timer = setInterval(poll, 2000);
  stateOutput.textContent = 'consultando cada 2 s';
}
function stopPolling(reason) {
  clearInterval(timer);
  timer = null;
  stateOutput.textContent = `en pausa (${reason})`;
}

function onVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    hiddenAt = performance.now();
    stopPolling('pestaña oculta');
    logLine('⏸ hidden → pauso el sondeo');
  } else {
    const seconds = Math.round((performance.now() - hiddenAt) / 1000);
    poll(); // al volver, los datos pueden ser viejos: pide ya
    startPolling();
    logLine(`▶ visible (${seconds} s oculta) → pido ya y reanudo`);
  }
}
document.addEventListener('visibilitychange', onVisibilityChange);

logLine(`visibilityState → ${document.visibilityState} · hidden: ${document.hidden}`);
poll();
startPolling();
logLine('Listo: llega un pedido cada 2 s; cambia de pestaña unos segundos y vuelve');
```

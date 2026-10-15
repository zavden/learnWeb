---
example_description: "Datos que llegan más deprisa que los frames (un teletipo de precios a ~250 mensajes por segundo): repintar con cada mensaje hace trabajo que nunca se ve; guardar el último dato y pintar una vez en requestAnimationFrame hace como mucho un render por frame. Con 20 mensajes en la misma tarea: 20 renders frente a 1"
example_tags: "javascript|rendimiento|requestanimationframe|throttle|eventos|render"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Teletipo de la bolsa</h1>
  <div class="tickers">
    <p class="ticker">🐛 <span id="buggy-price">—</span></p>
    <p class="ticker">✅ <span id="fixed-price">—</span></p>
  </div>
  <p>
    <button id="connect" type="button">Conectar 3 segundos</button>
  </p>
  <p id="counters" class="counters" role="status"></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
.tickers { display: flex; gap: 1rem; }
.ticker { margin: 0; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font: 600 1.1rem/1.2 Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:disabled { cursor: progress; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.counters { font-variant-numeric: tabular-nums; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const buggyPrice = document.querySelector('#buggy-price');
const fixedPrice = document.querySelector('#fixed-price');
const counters = document.querySelector('#counters');
const connectButton = document.querySelector('#connect');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const stats = { messages: 0, buggyRenders: 0, fixedRenders: 0, frames: 0 };
const format = (price) => `CERSUR $${price.toFixed(2)}`; // Cerámica del Sur, una empresa inventada

// 🐛 Pintar con cada mensaje: la mayoría de esos textos se sustituyen antes del siguiente
//    pintado y nadie los ve; en una interfaz más compleja, cada uno cuesta estilo y layout.
function renderBuggy(price) {
  buggyPrice.textContent = format(price);
  stats.buggyRenders += 1;
}

// ✅ Guardar el último dato y pintar UNA vez en el próximo frame.
let latestPrice = null;
let framePending = false;
function renderFixedSoon(price) {
  latestPrice = price;
  if (framePending) return; // ya hay un render pedido: usará el dato más reciente
  framePending = true;
  requestAnimationFrame(() => {
    framePending = false;
    fixedPrice.textContent = format(latestPrice);
    stats.fixedRenders += 1;
  });
}

function onMessage(price) {
  stats.messages += 1;
  renderBuggy(price);
  renderFixedSoon(price);
}

// Al cargar: 20 mensajes en la misma tarea (como un lote que llega de golpe por la red).
for (let i = 0; i < 20; i++) onMessage(17.4 + i / 100);
logLine(`20 mensajes en la misma tarea → 🐛 renders: ${stats.buggyRenders}`);
requestAnimationFrame(() => requestAnimationFrame(() => {
  logLine(`20 mensajes en la misma tarea → ✅ renders: ${stats.fixedRenders} (en el siguiente frame, con el último precio: ${fixedPrice.textContent})`);
  console.log('Listo: pulsa «Conectar 3 segundos»');
}));

// Al pulsar: un mensaje cada ~4 ms durante 3 s, y un contador de frames con rAF.
connectButton.addEventListener('click', () => {
  connectButton.disabled = true;
  Object.assign(stats, { messages: 0, buggyRenders: 0, fixedRenders: 0, frames: 0 });
  let price = 17.4;
  const feed = setInterval(() => {
    price = Math.max(1, price + (Math.sin(stats.messages) * 0.03));
    onMessage(price);
  }, 4);
  const until = performance.now() + 3000;
  function countFrame(now) {
    stats.frames += 1;
    counters.textContent = `mensajes ${stats.messages} · renders 🐛 ${stats.buggyRenders} · ✅ ${stats.fixedRenders} · frames ${stats.frames}`;
    if (now < until && !document.hidden) return requestAnimationFrame(countFrame);
    clearInterval(feed);
    logLine(`¿✅ pintó como mucho una vez por frame? ${stats.fixedRenders <= stats.frames} · ¿🐛 pintó más veces que frames hubo? ${stats.buggyRenders > stats.frames}`);
    logLine(`mensajes: ≈ ${stats.messages} · renders 🐛: ≈ ${stats.buggyRenders} · ✅: ≈ ${stats.fixedRenders} · frames: ≈ ${stats.frames}`);
    connectButton.disabled = false;
  }
  requestAnimationFrame(countFrame);
});

// Chrome ya entrega una vez por frame los eventos continuos del usuario (pointermove, scroll,
// resize…); lo que llega por la red, de un worker o de un temporizador, no: eso se agrupa a mano.
```

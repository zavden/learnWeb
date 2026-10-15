---
example_description: "Una cola de analítica que no estorba ni se pierde: las vistas se apuntan en una cola con tope (las más viejas se descartan si se llena), se preparan en los ratos libres con requestIdleCallback, se envían por lotes de 50 a la API de prueba y, cuando la pestaña se oculta, lo pendiente sale en el acto con fetch y keepalive"
example_tags: "javascript|rendimiento|requestidlecallback|visibilitychange|keepalive|fetch|memoria|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Catálogo con analítica</h1>
  <ul class="products">
    <li><span>Rebozo de Santa María</span> <button type="button" data-sku="REB-01">Ver</button></li>
    <li><span>Jarrón de Talavera</span> <button type="button" data-sku="TAL-07">Ver</button></li>
    <li><span>Alebrije de Oaxaca</span> <button type="button" data-sku="ALE-12">Ver</button></li>
  </ul>
  <p><button id="flush" type="button">Enviar lo pendiente ahora</button></p>
  <p id="queue-state" class="queue-state" role="status"></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
.products { display: grid; gap: 0.4rem; margin: 0; padding: 0; list-style: none; }
.products li { display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; }
button { font: inherit; padding: 0.3rem 0.7rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.queue-state { color: #475569; font-variant-numeric: tabular-nums; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const MAX_QUEUE = 500;  // tope: si nadie envía, la cola no crece sin límite (lección «Memoria y recolector de basura»)
const BATCH = 50;
const queueState = document.querySelector('#queue-state');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const whenIdle = globalThis.requestIdleCallback?.bind(globalThis)
  ?? ((callback) => setTimeout(() => { const start = performance.now(); callback({ timeRemaining: () => Math.max(0, 20 - (performance.now() - start)) }); }, 1));

const raw = [];       // eventos tal como llegan
const ready = [];     // eventos ya preparados (compactos), esperando lote
let dropped = 0;
let lots = 0;
let idlePending = false;
let sending = Promise.resolve(); // los lotes salen en orden, uno detrás de otro

function track(type, sku) {
  raw.push({ type, sku, second: Math.round(performance.now() / 1000) });
  if (raw.length > MAX_QUEUE) { raw.shift(); dropped += 1; }
  scheduleIdle();
  showQueue();
}
function showQueue() {
  queueState.textContent = `en cola: ${raw.length} · preparados: ${ready.length} · descartados: ${dropped} · lotes enviados: ${lots}`;
}
// Preparar un evento: trabajo puro y nada urgente (aquí, compactarlo en un texto corto).
const prepare = (event) => `${event.type}|${event.sku}|${event.second}`;

function scheduleIdle() {
  if (idlePending) return;
  idlePending = true;
  whenIdle((deadline) => {
    idlePending = false;
    while (raw.length > 0 && deadline.timeRemaining() > 1) {
      ready.push(prepare(raw.shift()));
      if (ready.length === BATCH) send(ready.splice(0), 'lote completo');
    }
    if (raw.length > 0) scheduleIdle();
    showQueue();
  });
}

// Enviar con texto plano (petición simple: sin preflight) y keepalive: la petición sigue
// aunque la página se oculte o se cierre (como navigator.sendBeacon, pero con respuesta).
function send(events, reason) {
  lots += 1;
  const lot = lots;
  const request = fetch('/api/demo/echo', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(events),
    keepalive: true,
  });
  sending = sending.then(async () => {
    try {
      const response = await request;
      const echo = await response.json();
      logLine(`${reason} → lote ${lot}: ${events.length} eventos · el servidor recibió ${JSON.parse(echo.body).length} (estado ${response.status})`);
    } catch (error) {
      logLine(`lote ${lot} sin enviar (${error.name}): se reintentaría en la próxima visita`);
    }
  });
  showQueue();
  return sending;
}
// Al ocultarse la pestaña puede que no haya «después»: lo pendiente se prepara y se envía YA.
function flushNow(reason) {
  const pending = [...ready.splice(0), ...raw.splice(0).map(prepare)];
  if (pending.length === 0) return;
  send(pending, reason);
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushNow('🙈 pestaña oculta, con keepalive');
});

for (const button of document.querySelectorAll('[data-sku]')) {
  button.addEventListener('click', () => track('vista', button.dataset.sku));
}
document.querySelector('#flush').addEventListener('click', () => flushNow('📤 envío manual'));

// Al cargar: 120 vistas de golpe (como las de una visita larga).
for (let i = 0; i < 120; i++) track('vista', ['REB-01', 'TAL-07', 'ALE-12'][i % 3]);
logLine(`120 vistas registradas al cargar · en cola: ${raw.length}`);
console.log('Listo: pulsa «Ver» en algún producto y cambia de pestaña (o pulsa «Enviar lo pendiente ahora»)');
sending.then(() => new Promise((resolve) => setTimeout(resolve, 1500))).then(() => sending).then(() => {
  logLine(`tras los lotes completos, preparados esperando: ${ready.length} · descartados: ${dropped}`);
});
```

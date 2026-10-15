---
example_description: "Un monitor de rendimiento flotante (HUD) que se abre con un botón: frames por segundo, tareas largas, frames largos (LoAF), la interacción más lenta (Event Timing) y el CLS acumulado, todo con PerformanceObserver. Tres botones provocan cada problema y un resumen por acción dice qué cambió. Al cerrarlo desconecta los observadores y para su bucle"
example_tags: "javascript|rendimiento|performanceobserver|long-tasks|loaf|inp|cls|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="shop">
  <div id="banner-slot"></div>
  <header class="shop-header">
    <h1>Mercado de artesanías</h1>
    <button id="hud-toggle" type="button" aria-expanded="false" aria-controls="hud">Abrir el monitor</button>
  </header>
  <p>Provoca cada problema y mira qué detecta el monitor:</p>
  <p class="actions">
    <button id="long-task" type="button">Tarea de 120 ms</button>
    <button id="late-banner" type="button">Aviso que llega tarde</button>
    <button id="slow-click" type="button">Clic lento (250 ms)</button>
  </p>
  <p id="cart" class="cart" role="status">Carrito: 0 productos</p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
<aside id="hud" class="hud" hidden aria-labelledby="hud-title">
  <h2 id="hud-title">Monitor</h2>
  <dl>
    <dt>Frames/s</dt><dd id="hud-fps">—</dd>
    <dt>Tareas largas</dt><dd id="hud-tasks">0</dd>
    <dt>Frames largos</dt><dd id="hud-frames">0</dd>
    <dt>Peor interacción</dt><dd id="hud-inp">—</dd>
    <dt>CLS</dt><dd id="hud-cls">0</dd>
  </dl>
  <button id="hud-close" type="button">Cerrar (Esc)</button>
</aside>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --accent: #1d4ed8; --paper: #ffffff; --page: #f8fafc; }
body { margin: 0; font-family: system-ui, sans-serif; color: var(--ink); background: var(--page); }
.shop { max-width: 34rem; margin: 0 auto; padding: 1rem; }
.shop-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem; }
h1 { font-size: 1.2rem; margin: 0; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--paper); color: var(--ink); cursor: pointer; }
button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.banner { margin: 0 0 0.75rem; padding: 0.75rem 1rem; border-radius: 0.5rem; background: #fef3c7; color: #78350f; }
.cart { font-weight: 600; }
.hud { position: fixed; inset-block-start: 0.5rem; inset-inline-end: 0.5rem; z-index: 10; inline-size: 12rem; padding: 0.6rem 0.75rem; border-radius: 0.5rem; background: #0f172a; color: #e2e8f0; font: 0.8rem/1.4 Menlo, Consolas, monospace; box-shadow: 0 6px 20px rgb(15 23 42 / 0.35); }
.hud[hidden] { display: none; }
.hud h2 { margin: 0 0 0.3rem; font-size: 0.85rem; }
.hud dl { display: grid; grid-template-columns: 1fr auto; gap: 0.1rem 0.5rem; margin: 0 0 0.5rem; }
.hud dt { color: #94a3b8; }
.hud dd { margin: 0; text-align: end; font-variant-numeric: tabular-nums; }
.hud button { padding: 0.2rem 0.5rem; font-size: 0.75rem; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--paper); font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// MONITOR DE RENDIMIENTO
// - Nada se observa hasta que se abre el monitor: los observadores y el bucle de rAF cuestan
//   poco, pero no son gratis. Al cerrarlo (botón o Esc) se desconecta todo; al ocultar la
//   pestaña se para el bucle; y se cierra solo tras 2 minutos, para no quedar olvidado.
// - Un solo PerformanceObserver para cinco tipos (una llamada a observe por tipo).
// - El monitor se actualiza 2 veces por segundo, no en cada frame: así no se mide a sí mismo.
// - Cada botón deja un resumen de lo que cambió: es lo que se puede comprobar (los valores, no).

const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function busyFor(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) {} // simula un trabajo que no cede el turno
}
const hud = document.querySelector('#hud');
const toggle = document.querySelector('#hud-toggle');
const fields = Object.fromEntries(['fps', 'tasks', 'frames', 'inp', 'cls'].map((key) => [key, document.querySelector(`#hud-${key}`)]));

const metrics = { longTasks: 0, longFrames: 0, worstInteraction: 0, cls: 0, shifts: 0 };
const interactions = []; // las últimas entradas de interacción, para el resumen de cada botón
let observer = null;
let frameId = null;
let autoClose = 0;
let framesThisSecond = 0;
let secondStart = 0;

function onEntries(list) {
  for (const entry of list.getEntries()) {
    switch (entry.entryType) {
      case 'longtask': metrics.longTasks += 1; break;
      case 'long-animation-frame': metrics.longFrames += 1; break;
      case 'event':
        if (entry.interactionId > 0) {
          metrics.worstInteraction = Math.max(metrics.worstInteraction, entry.duration);
          interactions.push(entry);
          if (interactions.length > 50) interactions.shift(); // con tope: un monitor no debe ser una fuga
        }
        break;
      case 'layout-shift': if (!entry.hadRecentInput) { metrics.cls += entry.value; metrics.shifts += 1; } break;
      default: break;
    }
  }
}
function paintHud() {
  fields.tasks.textContent = String(metrics.longTasks);
  fields.frames.textContent = String(metrics.longFrames);
  fields.inp.textContent = metrics.worstInteraction ? `${metrics.worstInteraction} ms` : '—';
  fields.cls.textContent = metrics.cls.toFixed(3);
}
function tick(now) { // cuenta frames; pinta el monitor cada 500 ms
  framesThisSecond += 1;
  if (now - secondStart >= 500) {
    fields.fps.textContent = String(Math.round((framesThisSecond * 1000) / (now - secondStart)));
    framesThisSecond = 0;
    secondStart = now;
    paintHud();
  }
  frameId = requestAnimationFrame(tick);
}
function openHud() {
  observer = new PerformanceObserver(onEntries);
  for (const type of ['longtask', 'long-animation-frame', 'event', 'layout-shift']) {
    if (!PerformanceObserver.supportedEntryTypes.includes(type)) continue;
    observer.observe(type === 'event' ? { type, durationThreshold: 16 } : { type });
  }
  hud.hidden = false;
  toggle.setAttribute('aria-expanded', 'true');
  toggle.textContent = 'Cerrar el monitor';
  secondStart = performance.now();
  frameId = requestAnimationFrame(tick);
  autoClose = setTimeout(() => closeHud('cerrado solo tras 2 minutos'), 120_000);
  logLine('📈 monitor abierto');
}
function closeHud(reason = 'cerrado') {
  observer?.disconnect();
  observer = null;
  cancelAnimationFrame(frameId);
  frameId = null;
  clearTimeout(autoClose);
  hud.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = 'Abrir el monitor';
  logLine(`📉 monitor ${reason}`);
}
toggle.addEventListener('click', () => (observer ? closeHud() : openHud()));
document.querySelector('#hud-close').addEventListener('click', () => { closeHud(); toggle.focus(); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && observer) { closeHud(); toggle.focus(); }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && frameId !== null) { cancelAnimationFrame(frameId); frameId = null; }
  else if (!document.hidden && observer && frameId === null) frameId = requestAnimationFrame(tick);
});

// Cada provocación compara las métricas antes y un rato después (cuando ya llegaron las entradas).
function summarizeAfter(label, waitMs, pressedAt) {
  if (!observer) {
    logLine(`${label} → abre el monitor para medirlo`);
    return;
  }
  const before = { ...metrics };
  setTimeout(() => {
    paintHud();
    const slowest = Math.max(0, ...interactions.filter((entry) => entry.startTime + entry.duration >= pressedAt).map((entry) => entry.duration));
    logLine(`${label} → tareas largas: +${metrics.longTasks - before.longTasks} · frames largos: +${metrics.longFrames - before.longFrames}`
      + ` · interacción de 100 ms o más: ${slowest >= 100} · desplazamientos: +${metrics.shifts - before.shifts}`);
  }, waitMs);
}
document.querySelector('#long-task').addEventListener('click', (event) => {
  busyFor(120);
  summarizeAfter('Tarea de 120 ms', 800, event.timeStamp);
});
document.querySelector('#late-banner').addEventListener('click', (event) => {
  setTimeout(() => { // llega a los 600 ms: más de 500 ms después del clic, ya no cuenta como «esperado»
    const banner = Object.assign(document.createElement('p'), { className: 'banner', textContent: '🎁 Envío gratis este fin de semana' });
    document.querySelector('#banner-slot').replaceChildren(banner);
  }, 600);
  summarizeAfter('Aviso que llega tarde', 1400, event.timeStamp);
});
let cartItems = 0;
document.querySelector('#slow-click').addEventListener('click', (event) => {
  busyFor(250); // 🐛 el trabajo va antes que la respuesta visible (lección «Render y frames»)
  cartItems += 1;
  document.querySelector('#cart').textContent = `Carrito: ${cartItems} producto${cartItems === 1 ? '' : 's'}`;
  summarizeAfter('Clic lento', 800, event.timeStamp);
});
console.log('Listo: pulsa «Abrir el monitor» y después cada uno de los tres botones, de uno en uno');
```

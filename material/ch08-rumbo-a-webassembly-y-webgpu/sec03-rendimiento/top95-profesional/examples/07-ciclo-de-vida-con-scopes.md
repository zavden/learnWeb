---
example_description: "Un panel de tres vistas en el que cada vista recibe un scope: sus listeners (con { signal }), intervalos, frames, observadores, peticiones y sub-componentes se paran con un solo close(). Un contador de modo desarrollo (window, document y setInterval instrumentados) y una auditoría que abre y cierra cada vista 5 veces comparan los recursos vivos antes y después: el chat antiguo, escrito sin scope, queda en evidencia"
example_tags: "javascript|rendimiento|memoria|fugas|abortcontroller|ciclo-de-vida|auditoria|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <header class="app-header">
    <h1>Panel de la taquería</h1>
    <nav class="tabs" aria-label="Vistas del panel">
      <button type="button" data-view="orders" aria-pressed="true">Pedidos</button>
      <button type="button" data-view="delivery" aria-pressed="false">Reparto</button>
      <button type="button" data-view="chat" aria-pressed="false">Chat</button>
    </nav>
  </header>
  <section id="view" class="view" aria-labelledby="view-title"></section>
  <section class="audit" aria-labelledby="audit-title">
    <h2 id="audit-title">Recursos vivos</h2>
    <table class="live">
      <tbody id="live-rows"></tbody>
    </table>
    <p><label><input id="legacy" type="checkbox" autocomplete="off"> Usar el chat antiguo 🐛 (escrito sin scope)</label></p>
    <p class="actions">
      <button id="audit" type="button">Auditar: abrir y cerrar cada vista 5 veces</button>
      <button id="clean" type="button">Limpiar lo que dejó el chat antiguo</button>
    </p>
  </section>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --accent: #1d4ed8; --paper: #ffffff; --page: #f8fafc; }
body { margin: 0; font-family: system-ui, sans-serif; color: var(--ink); background: var(--page); }
.app { max-width: 36rem; margin: 0 auto; padding: 1rem; }
.app-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem; }
h1 { font-size: 1.2rem; margin: 0; }
h2 { font-size: 1rem; margin: 0 0 0.4rem; }
.tabs { display: flex; gap: 0.25rem; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--paper); color: var(--ink); cursor: pointer; }
button:focus-visible, input:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.tabs [aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: #ffffff; }
.view, .audit { margin-top: 0.75rem; padding: 0.75rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--paper); }
.view { min-block-size: 9rem; }
.muted { color: var(--muted); margin: 0 0 0.4rem; font-size: 0.9rem; }
.cards { display: grid; gap: 0.3rem; margin: 0; padding: 0; list-style: none; font-size: 0.9rem; }
.cards li { padding: 0.3rem 0.5rem; border-inline-start: 3px solid var(--accent); background: var(--page); }
.map { display: block; inline-size: 100%; block-size: 120px; border-radius: 0.4rem; background: #eff6ff; }
.stops { margin: 0.4rem 0 0; padding-inline-start: 1.5rem; font-size: 0.85rem; }
.chat { display: grid; gap: 0.25rem; margin: 0; padding: 0; list-style: none; font-size: 0.9rem; }
.live { border-collapse: collapse; font-variant-numeric: tabular-nums; font-size: 0.9rem; }
.live th, .live td { padding: 0.15rem 0.6rem; border-block-end: 1px solid var(--line); text-align: start; font-weight: normal; }
.live td { text-align: end; font-weight: 600; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-block-end: 0; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--paper); font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// CICLO DE VIDA CON SCOPES
// - Cada vista recibe un «scope» al montarse. Todo lo que pone en marcha (listeners, intervalos,
//   temporizadores, frames, observadores, peticiones y sub-componentes) pasa por él, y
//   scope.close() lo para todo de una vez. La vista no escribe su propio «desmontar»: no puede
//   olvidarse de nada (lección «Memoria y recolector de basura»).
// - Por dentro: un AbortController para los listeners ({ signal }) y las peticiones, y conjuntos
//   con los ids pendientes. close() es idempotente, cierra primero a los hijos y ejecuta las
//   limpiezas propias en orden inverso (como contextlib.ExitStack en Python).
// - En desarrollo, un contador instrumenta window, document y setInterval: así ve también lo que
//   NO pasa por un scope (el chat antiguo). En producción no se instala.
// - La auditoría abre y cierra cada vista 5 veces en un contenedor fuera de la página y compara
//   los recursos vivos antes y después: es la prueba que encuentra las fugas antes que tus usuarios.
// - Las fugas de la demostración tienen tope (20 aperturas del chat antiguo) y un botón «Limpiar».

const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// ── 1. El contador de recursos vivos ──
const live = { listeners: new Set(), intervals: new Set(), observers: 0, frames: 0, requests: 0, scopes: 0 };
const LABELS = {
  listeners: 'listeners de window y document', intervals: 'intervalos', observers: 'observadores',
  frames: 'frames pedidos', requests: 'peticiones en vuelo', scopes: 'scopes abiertos',
};
const snapshot = () => ({
  listeners: live.listeners.size, intervals: live.intervals.size, observers: live.observers,
  frames: live.frames, requests: live.requests, scopes: live.scopes,
});
const describe = (counts) => `listeners ${counts.listeners} · intervalos ${counts.intervals} · observadores ${counts.observers}`
  + ` · frames ${counts.frames} · peticiones ${counts.requests} · scopes ${counts.scopes}`;

// Modo desarrollo: window y document (los objetos que viven toda la página, donde se esconden las
// fugas) y setInterval cuentan lo que se registra y lo que se quita, también con { signal }.
// (No sigue los { once: true }; este panel no los usa en window ni en document.)
function installLeakCounters() {
  const captureOf = (options) => (typeof options === 'boolean' ? options : Boolean(options?.capture));
  for (const target of [window, document]) {
    const add = target.addEventListener; // en window, el de LearnWeb; en document, el de EventTarget
    const remove = target.removeEventListener;
    const matches = (entry, type, listener, capture) => entry.target === target && entry.type === type
      && entry.listener === listener && entry.capture === capture;
    target.addEventListener = function addEventListener(type, listener, options) {
      const capture = captureOf(options);
      const signal = typeof options === 'object' ? options?.signal : undefined;
      const repeated = [...live.listeners].some((entry) => matches(entry, type, listener, capture)); // el navegador ignora los repetidos
      if (listener && !repeated && !signal?.aborted) {
        const entry = { target, type, listener, capture };
        live.listeners.add(entry);
        signal?.addEventListener('abort', () => { live.listeners.delete(entry); refreshSoon(); }, { once: true });
      }
      refreshSoon();
      return add.call(target, type, listener, options);
    };
    target.removeEventListener = function removeEventListener(type, listener, options) {
      const capture = captureOf(options);
      for (const entry of live.listeners) if (matches(entry, type, listener, capture)) live.listeners.delete(entry);
      refreshSoon();
      return remove.call(target, type, listener, options);
    };
  }
  const nativeSetInterval = window.setInterval;
  const nativeClearInterval = window.clearInterval;
  window.setInterval = function setInterval(...args) {
    const id = nativeSetInterval.apply(window, args);
    live.intervals.add(id);
    refreshSoon();
    return id;
  };
  window.clearInterval = function clearInterval(id) {
    live.intervals.delete(id);
    refreshSoon();
    return nativeClearInterval.call(window, id);
  };
}

// ── 2. El scope ──
function createScope(label) {
  const controller = new AbortController();
  const intervals = new Set();
  const timeouts = new Set();
  const frames = new Set();
  const observers = new Set();
  const children = new Set();
  const cleanups = [];
  let closed = false;
  live.scopes += 1;
  const scope = {
    label,
    signal: controller.signal,
    get closed() { return closed; },
    listen(target, type, handler, options = {}) { // (si te pasan otra señal, combínalas con AbortSignal.any)
      if (!closed) target.addEventListener(type, handler, { ...options, signal: controller.signal });
    },
    every(ms, callback) {
      if (!closed) intervals.add(setInterval(callback, ms));
    },
    later(ms, callback) {
      if (closed) return;
      const id = setTimeout(() => { timeouts.delete(id); callback(); }, ms);
      timeouts.add(id);
    },
    frame(callback) { // un requestAnimationFrame que no sobrevive al scope
      if (closed) return;
      live.frames += 1;
      const id = requestAnimationFrame((now) => { frames.delete(id); live.frames -= 1; callback(now); });
      frames.add(id);
    },
    observe(observer, ...elements) { // ResizeObserver, IntersectionObserver, MutationObserver…
      if (closed) return observer;
      for (const element of elements) observer.observe(element);
      observers.add(observer);
      live.observers += 1;
      return observer;
    },
    async request(url) { // fetch + json, cancelado al cerrar (AbortError)
      live.requests += 1;
      let inFlight = true;
      const settle = () => { if (inFlight) { inFlight = false; live.requests -= 1; refreshSoon(); } };
      controller.signal.addEventListener('abort', settle);
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } finally {
        controller.signal.removeEventListener('abort', settle);
        settle();
      }
    },
    child(childLabel) { // un sub-componente: se cierra solo, o con su padre
      const child = createScope(`${label} › ${childLabel}`);
      children.add(child);
      child.onClose(() => children.delete(child));
      return child;
    },
    onClose(cleanup) {
      if (closed) cleanup();
      else cleanups.push(cleanup);
    },
    close() {
      if (closed) return;
      closed = true;
      for (const child of [...children].reverse()) child.close();
      controller.abort(); // quita los listeners y cancela las peticiones
      for (const id of intervals) clearInterval(id);
      for (const id of timeouts) clearTimeout(id);
      for (const id of frames) cancelAnimationFrame(id);
      for (const observer of observers) observer.disconnect();
      live.frames -= frames.size;
      live.observers -= observers.size;
      for (const set of [intervals, timeouts, frames, observers]) set.clear();
      for (const cleanup of cleanups.splice(0).reverse()) cleanup();
      live.scopes -= 1;
      refreshSoon();
    },
  };
  if (typeof Symbol.dispose === 'symbol') scope[Symbol.dispose] = scope.close; // `using scope = …` en Chrome
  return scope;
}

// ── 3. Las vistas: reciben su raíz y su scope, y no saben nada de desmontar ──
const ORDERS = [
  'P-218 · Mesa 4 · 3 tacos al pastor y un agua de horchata',
  'P-219 · Para llevar · una orden de gringas y 2 refrescos',
  'P-220 · Mesa 1 · 5 tacos de suadero y una quesadilla',
  'P-221 · Mesa 7 · 2 alambres y un agua de jamaica',
];
const STOPS = ['Taquería (Roma Norte)', 'Calle Durango 112', 'Av. Álvaro Obregón 45', 'Calle Orizaba 210', 'Plaza Río de Janeiro'];
const MESSAGES = ['Cocina: se acabó la piña para el pastor', 'Caja: la mesa 4 pide la cuenta', 'Reparto: voy en camino con P-219'];
const WRITERS = ['Cocina', 'Caja', 'Reparto'];
const listItems = (texts) => texts.map((text) => Object.assign(document.createElement('li'), { textContent: text }));

function mountOrders(root, scope) {
  root.innerHTML = '<h2 id="view-title">Pedidos</h2><p class="muted" data-ref="ago">Cargando pedidos…</p><ul class="cards" data-ref="list"></ul>';
  const ago = root.querySelector('[data-ref="ago"]');
  let loadedAt = 0;
  const load = () => scope.request('/api/demo/echo?vista=pedidos&delay=300').then(() => {
    loadedAt = performance.now();
    root.querySelector('[data-ref="list"]').replaceChildren(...listItems(ORDERS));
    ago.textContent = 'Actualizado hace 0 s';
    logLine(`📦 Pedidos: ${ORDERS.length} pedidos cargados de la API de prueba`);
  }, (error) => {
    if (error.name !== 'AbortError') ago.textContent = `No se pudieron cargar: ${error.message}`; // al cerrar, no es un error
  });
  load();
  scope.every(1000, () => {
    if (loadedAt) ago.textContent = `Actualizado hace ${Math.round((performance.now() - loadedAt) / 1000)} s`;
  });
  scope.listen(document, 'visibilitychange', () => { if (!document.hidden) load(); }); // al volver a la pestaña
  scope.listen(window, 'online', load);                                               // al volver la conexión
}

function mountDelivery(root, scope) {
  root.innerHTML = '<h2 id="view-title">Reparto</h2><p class="muted" data-ref="net"></p>'
    + '<canvas class="map" data-ref="map" role="img" aria-label="Ruta de reparto con 5 paradas, de oeste a este"></canvas><ol class="stops" data-ref="stops"></ol>';
  const net = root.querySelector('[data-ref="net"]');
  const canvas = root.querySelector('[data-ref="map"]');
  root.querySelector('[data-ref="stops"]').replaceChildren(...listItems(STOPS));
  const showNetwork = () => { net.textContent = navigator.onLine ? 'Repartidor en línea' : 'Sin conexión: el mapa enseña la última ruta'; };
  showNetwork();
  scope.listen(window, 'online', showNetwork);
  scope.listen(window, 'offline', showNetwork);
  // El mapa es un sub-componente con su propio scope: un ResizeObserver ajusta el lienzo a su
  // ancho, y como mucho un dibujo por frame aunque lleguen muchos avisos.
  const map = scope.child('mapa');
  let drawPending = false;
  function draw() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.round(width * devicePixelRatio);
    canvas.height = Math.round(height * devicePixelRatio);
    const ctx = canvas.getContext('2d');
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const points = STOPS.map((_, i) => [24 + (i * (width - 48)) / (STOPS.length - 1), height / 2 + (i % 2 ? -26 : 26)]);
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    points.forEach(([x, y], i) => {
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(String(i + 1), x, y);
    });
  }
  map.observe(new ResizeObserver(() => {
    if (drawPending) return;
    drawPending = true;
    map.frame(() => { drawPending = false; draw(); });
  }), canvas);
}

function renderChat(root, mark = '') {
  root.innerHTML = `<h2 id="view-title">Chat ${mark}</h2><p class="muted" data-ref="net"></p><ul class="chat" data-ref="messages"></ul><p class="muted" data-ref="typing">&nbsp;</p>`;
  root.querySelector('[data-ref="messages"]').replaceChildren(...listItems(MESSAGES));
  const net = root.querySelector('[data-ref="net"]');
  const typing = root.querySelector('[data-ref="typing"]');
  const showNetwork = () => { net.textContent = navigator.onLine ? '3 mensajes sin leer' : 'Sin conexión'; };
  const markRead = () => { if (!document.hidden) net.textContent = 'Todo leído'; };
  let turn = 0;
  const showTyping = () => { typing.textContent = `${WRITERS[turn++ % WRITERS.length]} está escribiendo…`; };
  showNetwork();
  return { showNetwork, markRead, showTyping };
}
function mountChat(root, scope) {
  const chat = renderChat(root);
  scope.every(1500, chat.showTyping);
  scope.listen(window, 'online', chat.showNetwork);
  scope.listen(document, 'visibilitychange', chat.markRead);
}
// 🐛 El chat de la versión anterior: registra lo mismo «a mano» y nadie lo quita al salir. Su
//    intervalo sigue escribiendo en nodos que ya no están en la página, y los retiene.
const LEGACY_LIMIT = 20; // tope de la demostración
const leftovers = { listeners: [], intervals: [] }; // solo para que «Limpiar» pueda deshacerlo
function mountLegacyChat(root) {
  const chat = renderChat(root, '🐛');
  window.addEventListener('online', chat.showNetwork);
  document.addEventListener('visibilitychange', chat.markRead);
  leftovers.listeners.push([window, 'online', chat.showNetwork], [document, 'visibilitychange', chat.markRead]);
  leftovers.intervals.push(setInterval(chat.showTyping, 1500));
}

// ── 4. El router: cerrar el scope anterior es todo lo que hace falta para desmontar ──
const legacyBox = document.querySelector('#legacy');
const VIEWS = {
  orders: { title: 'Pedidos', mount: mountOrders },
  delivery: { title: 'Reparto', mount: mountDelivery },
  chat: { title: 'Chat', mount: (root, scope) => (legacyBox.checked ? mountLegacyChat(root) : mountChat(root, scope)) },
};
const viewTitle = (key) => (key === 'chat' && legacyBox.checked ? 'Chat 🐛' : VIEWS[key].title);
const viewRoot = document.querySelector('#view');
const tabs = [...document.querySelectorAll('[data-view]')];
let current = null;
function showView(key) {
  current?.scope.close();
  viewRoot.replaceChildren();
  if (key === 'chat' && legacyBox.checked && leftovers.intervals.length >= LEGACY_LIMIT) {
    logLine('límite de la demostración: 20 chats antiguos sin cerrar; pulsa «Limpiar» primero');
    legacyBox.checked = false;
  }
  const scope = createScope(viewTitle(key));
  VIEWS[key].mount(viewRoot, scope);
  current = { key, scope };
  for (const tab of tabs) tab.setAttribute('aria-pressed', String(tab.dataset.view === key));
  logLine(`🧭 vista «${viewTitle(key)}» · vivos → ${describe(snapshot())}`);
}
for (const tab of tabs) tab.addEventListener('click', () => showView(tab.dataset.view));
legacyBox.addEventListener('change', () => { if (current?.key === 'chat') showView('chat'); });

// ── 5. La auditoría: abrir y cerrar cada vista N veces y comparar los recursos vivos ──
function audit(times = 5) {
  const lab = document.createElement('div'); // fuera de la página: la auditoría no se ve ni mueve nada
  logLine(`🔎 auditoría: abrir y cerrar cada vista ${times} veces`);
  for (const key of Object.keys(VIEWS)) {
    if (key === 'chat' && legacyBox.checked && leftovers.intervals.length + times > LEGACY_LIMIT) {
      logLine('🔎 Chat 🐛 → límite de la demostración: pulsa «Limpiar» antes de auditarlo otra vez');
      continue;
    }
    const before = snapshot();
    for (let i = 0; i < times; i++) {
      const scope = createScope(`auditoría · ${key}`);
      VIEWS[key].mount(lab, scope);
      scope.close();
      lab.replaceChildren();
    }
    const after = snapshot();
    const grown = Object.keys(after).filter((kind) => after[kind] !== before[kind])
      .map((kind) => `${after[kind] > before[kind] ? '+' : ''}${after[kind] - before[kind]} ${LABELS[kind]}`);
    logLine(`🔎 ${viewTitle(key)} → ${grown.length === 0 ? '✅ no queda nada vivo' : `❌ quedan vivos: ${grown.join(' · ')}`}`);
  }
}
document.querySelector('#audit').addEventListener('click', () => audit());
document.querySelector('#clean').addEventListener('click', () => {
  const listeners = leftovers.listeners.splice(0);
  const intervals = leftovers.intervals.splice(0);
  for (const [target, type, handler] of listeners) target.removeEventListener(type, handler);
  for (const id of intervals) clearInterval(id);
  logLine(`🧹 quitados ${listeners.length} listeners y ${intervals.length} intervalos que nadie iba a parar · vivos → ${describe(snapshot())}`);
});

// ── 6. La tabla de recursos vivos: se repinta como mucho una vez por frame ──
const liveRows = document.querySelector('#live-rows');
const cells = Object.fromEntries(Object.entries(LABELS).map(([kind, label]) => {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  row.append(Object.assign(document.createElement('th'), { scope: 'row', textContent: label }), cell);
  liveRows.append(row);
  return [kind, cell];
}));
let refreshPending = false;
function refreshSoon() {
  if (refreshPending) return;
  refreshPending = true;
  requestAnimationFrame(() => {
    refreshPending = false;
    for (const [kind, value] of Object.entries(snapshot())) cells[kind].textContent = String(value);
  });
}

installLeakCounters();
showView('orders');
audit();
console.log('Listo: cambia de vista con las pestañas; después marca «Usar el chat antiguo 🐛», pasa a «Pedidos» y pulsa «Auditar»');

// En DevTools (con ↗): More tools › Performance monitor tiene un contador «JS event listeners»;
// con el chat antiguo sube con cada visita al chat y no vuelve a bajar.
```

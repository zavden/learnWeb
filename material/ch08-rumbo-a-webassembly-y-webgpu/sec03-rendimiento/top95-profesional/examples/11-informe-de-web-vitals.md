---
example_description: "El código de medición de una página real: observa LCP, CLS (con ventanas de sesión) e INP (la peor interacción, agrupando por interactionId) desde el principio con buffered: true y, al ocultarse la pestaña, recoge lo pendiente con takeRecords() y envía un informe pequeño con navigator.sendBeacon (o fetch con keepalive) a la API de prueba. Solo envía lo que cambió desde el último informe; la consola da tipos y conteos de entradas, nunca valores"
example_tags: "javascript|rendimiento|web-vitals|lcp|cls|inp|sendbeacon|visibilitychange|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="recipe">
  <div id="notice-slot"></div>
  <article aria-labelledby="recipe-title">
    <h1 id="recipe-title">Pan de muerto de Oaxaca</h1>
    <p class="lead">La receta de la panadería de la familia Ruiz: masa de huevo con ralladura de naranja y agua de azahar, huesitos de masa encima y azúcar rosada, como en los Valles Centrales. Rinde ocho piezas medianas y se hornea en una mañana, con dos reposos de la masa.</p>
    <p class="actions">
      <button id="save" type="button">Guardar receta</button>
      <button id="simulate" type="button">Simular el cierre de la pestaña</button>
      <span id="saved" class="saved" role="status"></span>
    </p>
    <fieldset class="transport">
      <legend>Envío del informe</legend>
      <label><input type="radio" name="transport" value="beacon" checked autocomplete="off"> navigator.sendBeacon</label>
      <label><input type="radio" name="transport" value="fetch" autocomplete="off"> fetch con keepalive (con respuesta)</label>
    </fieldset>
  </article>
  <section class="vitals" aria-labelledby="vitals-title">
    <h2 id="vitals-title">Lo que mide esta visita</h2>
    <dl id="vitals"></dl>
  </section>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --accent: #1d4ed8; --paper: #ffffff; --page: #f8fafc; }
body { margin: 0; font-family: system-ui, sans-serif; color: var(--ink); background: var(--page); }
.recipe { max-width: 36rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.3rem; margin: 0 0 0.4rem; }
h2 { font-size: 1rem; margin: 0 0 0.4rem; }
.lead { margin: 0; line-height: 1.5; }
.notice { margin: 0 0 0.75rem; padding: 0.6rem 0.9rem; border-radius: 0.5rem; background: #fef3c7; color: #78350f; }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
.transport { display: flex; flex-wrap: wrap; gap: 0.25rem 1rem; margin: 0 0 1rem; padding: 0.4rem 0.75rem; border: 1px solid var(--line); border-radius: 0.5rem; font-size: 0.9rem; }
.transport legend { padding-inline: 0.25rem; font-weight: 600; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--paper); color: var(--ink); cursor: pointer; }
button:focus-visible, input:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.saved { color: #166534; font-weight: 600; }
.vitals { padding: 0.75rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--paper); }
/* Filas de alto fijo y texto que no salta de línea: actualizar los valores no mueve nada (CLS). */
#vitals { display: grid; grid-template-columns: 3rem minmax(0, 1fr); gap: 0.2rem 0.75rem; margin: 0; font-variant-numeric: tabular-nums; }
#vitals dt { font-weight: 700; }
#vitals dd { margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--paper); font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// INFORME DE WEB VITALS AL OCULTAR LA PÁGINA
// - Medir a usuarios reales (RUM) es esto: el navegador entrega las entradas a la página, y la
//   página las resume y las envía a tu servidor, donde calculas el percentil 75 de cada métrica.
// - Se observa desde el principio y con buffered: true: las entradas que llegaron antes de que
//   cargara este script también cuentan.
// - LCP: la última candidata antes de la primera interacción o de la primera vez que se oculta la
//   página. CLS: los desplazamientos sin interacción reciente, agrupados en ventanas de sesión
//   (huecos de menos de 1 s, ventanas de 5 s como mucho); vale la peor ventana. INP: la duración
//   de cada interacción es la de su evento más lento (se agrupan por interactionId); vale la peor
//   (con 50 o más, se descarta una de cada 50: casi el percentil 98). Con durationThreshold: 40
//   solo llegan las interacciones lentas, las únicas que pueden ser el INP.
// - El momento de enviar es visibilitychange → hidden: es el último aviso fiable (en el móvil, una
//   página se cierra desde el selector de apps sin unload). Antes de enviar, takeRecords() recoge
//   las entradas que el observador aún no había entregado.
// - navigator.sendBeacon(url, texto) encola un POST pequeño que sale aunque la página se cierre
//   (como texto plano: petición simple, sin preflight); no devuelve la respuesta. Si devuelve
//   false, fetch con keepalive: true hace lo mismo y sí la devuelve.
// - Solo se envía lo que cambió desde el último informe: volver a la pestaña y salir otra vez no
//   duplica datos en el servidor. Una página restaurada desde la caché de atrás/adelante (bfcache)
//   empieza una visita nueva.
// - En producción se muestrea (por ejemplo, un 10 % de las visitas) y se añade la atribución
//   (qué elemento fue el LCP, qué botón el INP). Para los detalles finos, la biblioteca web-vitals.
// - La consola da tipos y conteos de entradas; los valores cambian en cada visita (la página los enseña).

const ENDPOINT = '/api/demo/echo?informe=web-vitals';
const THRESHOLDS = { LCP: [2500, 4000], CLS: [0.1, 0.25], INP: [200, 500] }; // bueno ≤ primero, mejorable ≤ segundo
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// ── Las métricas de esta visita ──
const metrics = {
  LCP: { name: 'LCP', entryType: 'largest-contentful-paint', value: 0, entries: 0, unit: 'ms' },
  CLS: { name: 'CLS', entryType: 'layout-shift', value: 0, entries: 0, unit: '' },
  INP: { name: 'INP', entryType: 'interacciones lentas', value: 0, entries: 0, unit: 'ms' },
};
const rating = (metric) => {
  const [good, poor] = THRESHOLDS[metric.name];
  return metric.value <= good ? 'bueno' : metric.value <= poor ? 'mejorable' : 'malo';
};
let lcpFinal = document.visibilityState === 'hidden'; // una página que nace oculta (precarga) no tiene un LCP válido
let session = { value: 0, start: 0, last: 0 };
const longest = new Map(); // interactionId → duración: solo las 10 peores (memoria acotada)
let lastInteractionId = 0;

function handleEntries(entries) {
  for (const entry of entries) {
    if (entry.entryType === 'largest-contentful-paint') {
      if (lcpFinal) continue;
      metrics.LCP.value = entry.startTime;
      metrics.LCP.entries += 1;
    } else if (entry.entryType === 'layout-shift') {
      if (entry.hadRecentInput) continue; // lo provocó el usuario: no cuenta
      const sameSession = session.value > 0 && entry.startTime - session.last < 1000 && entry.startTime - session.start < 5000;
      session = sameSession ? { ...session, value: session.value + entry.value, last: entry.startTime } : { value: entry.value, start: entry.startTime, last: entry.startTime };
      metrics.CLS.value = Math.max(metrics.CLS.value, session.value);
      metrics.CLS.entries += 1;
    } else if (entry.entryType === 'event' && entry.interactionId > 0) {
      // Los controles de la demo (simular el cierre, elegir el envío) no cuentan: en una página real no existirían.
      if (entry.target?.closest?.('#simulate, .transport')) continue;
      if (entry.interactionId > lastInteractionId) { // pointerdown, pointerup y click comparten id
        lastInteractionId = entry.interactionId;
        metrics.INP.entries += 1;
      }
      longest.set(entry.interactionId, Math.max(longest.get(entry.interactionId) ?? 0, entry.duration));
      if (longest.size > 10) longest.delete([...longest].sort((a, b) => a[1] - b[1])[0][0]);
      const worst = [...longest.values()].sort((a, b) => b - a);
      metrics.INP.value = worst[Math.min(worst.length - 1, Math.floor(metrics.INP.entries / 50))];
    }
  }
  paintSoon();
}
const observers = [
  ['largest-contentful-paint', {}],
  ['layout-shift', {}],
  ['event', { durationThreshold: 40 }], // como web-vitals: lo que dura menos de 40 ms no puede ser el INP
].filter(([type]) => PerformanceObserver.supportedEntryTypes.includes(type)).map(([type, options]) => {
  const observer = new PerformanceObserver((list) => handleEntries(list.getEntries()));
  observer.observe({ type, buffered: true, ...options });
  return observer;
});

// ── El informe: solo lo que cambió desde el anterior ──
let sent = {};
let reportNumber = 0;
function sendReport(reason, { quiet = false } = {}) {
  for (const observer of observers) handleEntries(observer.takeRecords()); // lo que aún no se había entregado
  lcpFinal = true; // tras ocultarse, el LCP ya no cambia
  const changed = Object.values(metrics).filter((metric) => metric.entries > 0
    && (sent[metric.name]?.entries !== metric.entries || sent[metric.name]?.value !== metric.value));
  if (changed.length === 0) {
    if (!quiet) logLine(`📭 ${reason}: nada nuevo desde el ${reportNumber ? `informe ${reportNumber}` : 'principio'}; no se envía`);
    return;
  }
  reportNumber += 1;
  const number = reportNumber;
  const body = JSON.stringify({
    page: '/recetas/pan-de-muerto', report: number, reason,
    metrics: changed.map((metric) => ({ name: metric.name, value: Number(metric.value.toFixed(metric.name === 'CLS' ? 4 : 0)), rating: rating(metric), entries: metric.entries })),
  });
  for (const metric of changed) sent[metric.name] = { entries: metric.entries, value: metric.value };
  if (!quiet) logLine(`📤 informe ${number} · ${reason} · métricas: ${changed.map((metric) => metric.name).join(', ')} · entradas: ${changed.map((metric) => `${metric.entryType} ${metric.entries}`).join(', ')}`);
  const useBeacon = document.querySelector('input[name="transport"]:checked').value === 'beacon';
  if (useBeacon && typeof navigator.sendBeacon === 'function') {
    let queued = false;
    try {
      queued = navigator.sendBeacon(ENDPOINT, body); // un string viaja como text/plain
    } catch (error) {
      if (!quiet) logLine(`⚠️ sendBeacon lanzó ${error.name}`);
    }
    if (queued) {
      if (!quiet) logLine('📨 sendBeacon → en cola: true (no hay respuesta que leer)');
      return;
    }
    if (!quiet) logLine('⚠️ sendBeacon no lo encoló (cola llena o envío bloqueado): se intenta con fetch + keepalive');
  }
  fetch(ENDPOINT, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } })
    .then(async (response) => {
      const echo = await response.json();
      const received = JSON.parse(echo.body).metrics.length;
      if (!quiet) logLine(`📨 fetch con keepalive → el servidor recibió ${received} métrica${received === 1 ? '' : 's'} del informe ${number} (estado ${response.status})`);
    })
    .catch((error) => { if (!quiet) logLine(`⚠️ el informe ${number} no salió (${error.name}): se perdería, como en una página real`); });
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') sendReport('pestaña oculta');
});
addEventListener('pagehide', () => sendReport('pagehide', { quiet: true })); // por si acaso; casi siempre, nada nuevo
addEventListener('pageshow', (event) => {
  if (!event.persisted) return; // restaurada desde la bfcache: es otra visita
  for (const metric of Object.values(metrics)) Object.assign(metric, { value: 0, entries: 0 });
  sent = {};
  reportNumber = 0;
});

// ── La página: un aviso tardío (CLS), un clic lento (INP) y el panel de valores ──
setTimeout(() => {
  const notice = Object.assign(document.createElement('p'), { className: 'notice', textContent: '🔔 Hoy horneamos a las 17:00: aparta tu pieza' });
  document.querySelector('#notice-slot').append(notice);
  logLine('🔔 llegó el aviso de la panadería (sin hueco reservado: empuja la receta)');
}, 1000);
document.querySelector('#save').addEventListener('click', () => {
  const end = performance.now() + 120;
  while (performance.now() < end) {} // 🐛 a propósito: 120 ms de trabajo antes de pintar (lección «Render y frames»)
  document.querySelector('#saved').textContent = 'Guardada ✓';
  logLine('💾 receta guardada (120 ms de trabajo antes de pintar)');
});
document.querySelector('#simulate').addEventListener('click', () => sendReport('simulación'));

const vitalsList = document.querySelector('#vitals');
const valueCells = Object.fromEntries(Object.keys(metrics).map((key) => {
  const value = Object.assign(document.createElement('dd'), { textContent: '—' });
  vitalsList.append(Object.assign(document.createElement('dt'), { textContent: key }), value);
  return [key, value];
}));
let paintPending = false;
function paintSoon() {
  if (paintPending) return;
  paintPending = true;
  requestAnimationFrame(() => {
    paintPending = false;
    for (const [key, metric] of Object.entries(metrics)) {
      if (metric.entries === 0) continue;
      const shown = metric.name === 'CLS' ? metric.value.toFixed(3) : `${Math.round(metric.value)} ms`;
      const pending = sent[key]?.entries === metric.entries && sent[key]?.value === metric.value ? 'enviado' : 'por enviar';
      valueCells[key].textContent = `${shown} · ${rating(metric)} · ${metric.entries} ${metric.name === 'INP' ? 'interacción(es) lenta(s)' : 'entrada(s)'} · ${pending}`;
    }
  });
}
console.log('Listo: espera el aviso (1 s), pulsa «Guardar receta» y después «Simular el cierre de la pestaña» (o cambia de pestaña)');
```

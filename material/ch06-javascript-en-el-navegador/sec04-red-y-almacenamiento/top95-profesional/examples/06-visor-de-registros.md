---
example_description: "Un visor de registros en vivo para /api/demo/stream?format=ndjson: tubería de flujos (TextDecoderStream + TransformStream de líneas), filtros por nivel que no pierden nada, pausa que acumula lo que llega, desplazamiento automático opcional, contadores y «Detener / Conectar» con AbortController"
example_tags: "javascript|streams|ndjson|pipethrough|transformstream|abortcontroller|registros|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="viewer-app">
  <h1>Registro del servidor de la tienda</h1>
  <div class="toolbar">
    <button id="connection" type="button">Detener</button>
    <button id="pause" type="button" aria-pressed="false">Pausar</button>
    <fieldset>
      <legend>Mostrar</legend>
      <label><input type="checkbox" name="level" value="info" checked> info</label>
      <label><input type="checkbox" name="level" value="warn" checked> warn</label>
      <label><input type="checkbox" name="level" value="error" checked> error</label>
    </fieldset>
    <label><input id="follow" type="checkbox" checked> Seguir el final</label>
  </div>
  <p id="summary" class="summary" role="status">Conectando…</p>
  <ol id="viewer" class="viewer" tabindex="0" aria-label="Líneas del registro"></ol>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --surface: #ffffff; --page: #f5f7fa; --accent: #1d4ed8; --term: #0f172a; --term-ink: #e2e8f0; --warn: #fcd34d; --error: #fca5a5; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.viewer-app { max-width: 34rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0 0 0.5rem; font-size: 1.2rem; }
.toolbar { display: flex; flex-wrap: wrap; gap: 0.5rem 0.75rem; align-items: center; }
fieldset { display: flex; gap: 0.5rem; margin: 0; padding: 0.1rem 0.5rem 0.3rem; border: 1px solid var(--line); border-radius: 0.5rem; }
button { font: inherit; padding: 0.3rem 0.7rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: var(--surface); color: var(--ink); cursor: pointer; }
button[aria-pressed="true"] { background: #e4e7eb; }
:is(button, input, .viewer):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.summary { color: var(--muted); }
.viewer { height: 12rem; overflow-y: auto; margin: 0; padding: 0.5rem 0.75rem 0.5rem 2.5rem; border-radius: 0.6rem; background: var(--term); color: var(--term-ink); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
.viewer [data-level="warn"] { color: var(--warn); }
.viewer [data-level="error"] { color: var(--error); font-weight: 700; }
.viewer [hidden] { display: none; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Visor de registros en vivo.
//
// Decisiones de diseño:
// - Tubería: response.body → TextDecoderStream → splitLines() → objetos. Cada
//   etapa trabaja con lo que le llega; nada espera al final del flujo.
// - Filtrar no borra: todas las líneas se guardan y se pintan, y el filtro
//   solo pone hidden. Cambiar de filtro no necesita volver a pedir nada.
// - Pausar no detiene la conexión (el servidor seguiría enviando): las líneas
//   se acumulan y se pintan juntas al reanudar.
// - «Seguir el final» desplaza al último elemento solo si está activado: a
//   quien lee algo de más arriba no se le mueve el texto.
// - La lista no es una región aria-live (sería un torrente para un lector de
//   pantalla); el resumen sí (role="status") y se actualiza con moderación.
// - El servidor de prueba manda {"n":3,"of":24,"text":"…"}; el número elige
//   un mensaje de ejemplo y un nivel (cada 10.º, error; cada 4.º, warn).
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const MESSAGES = ['GET /api/cafes 200 (38 ms)', 'GET /api/cafes/CAF-OAX-500 200 (12 ms)', 'POST /api/carrito 201 (54 ms)',
  'caché de precios caducada: se renueva', 'GET /api/pedidos/P-2041 200 (21 ms)', 'POST /api/pagos 201 (310 ms)',
  'GET /img/cafes/chiapas.webp 304 (3 ms)', 'consulta lenta: 1,2 s en pedidos por estado'];
const viewer = document.querySelector('#viewer');
const summary = document.querySelector('#summary');
const connectionButton = document.querySelector('#connection');
const pauseButton = document.querySelector('#pause');
const followBox = document.querySelector('#follow');
const logList = document.querySelector('#log');
let connection = null;
let paused = false;
let pending = [];
const counts = { info: 0, warn: 0, error: 0 };
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

function splitLines() {
  let buffer = '';
  return new TransformStream({
    transform(text, controller) {
      buffer += text;
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) if (line.trim() !== '') controller.enqueue(line);
    },
    flush(controller) {
      if (buffer.trim() !== '') controller.enqueue(buffer);
    },
  });
}
const toRecord = ({ n }) => {
  const level = n % 10 === 0 ? 'error' : n % 4 === 0 ? 'warn' : 'info';
  const message = level === 'error' ? `POST /api/pagos 502: la pasarela no responde (#${n})` : MESSAGES[(n - 1) % MESSAGES.length];
  return { n, level, message };
};
const visibleLevels = () => new Set([...document.querySelectorAll('[name="level"]:checked')].map((box) => box.value));

function paint(records) {
  const levels = visibleLevels();
  viewer.append(...records.map((record) => {
    const item = Object.assign(document.createElement('li'), { textContent: `[${record.level}] ${record.message}` });
    item.dataset.level = record.level;
    item.hidden = !levels.has(record.level);
    return item;
  }));
  if (followBox.checked) viewer.scrollTop = viewer.scrollHeight; // solo la lista, nunca la página
}
const describe = () => `info ${counts.info} · warn ${counts.warn} · error ${counts.error}`;

async function connect() {
  connection = new AbortController();
  connectionButton.textContent = 'Detener';
  summary.textContent = 'Conectando…';
  try {
    const response = await fetch('/api/demo/stream?format=ndjson&chunks=24&interval=80', { signal: connection.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    logLine('📡 conectado');
    summary.textContent = 'En vivo.';
    const lines = response.body.pipeThrough(new TextDecoderStream()).pipeThrough(splitLines());
    for await (const line of lines) {
      const record = toRecord(JSON.parse(line));
      counts[record.level] += 1;
      if (paused) pending.push(record);
      else paint([record]);
    }
    summary.textContent = `Fin del flujo: ${describe()}.`;
    logLine(`✅ fin del flujo: ${counts.info + counts.warn + counts.error} líneas · ${describe()}`);
  } catch (error) {
    summary.textContent = error.name === 'AbortError' ? `Detenido: ${describe()}.` : `Conexión perdida (${error.message}).`;
    logLine(error.name === 'AbortError' ? `⏹️ detenido · ${describe()}` : `⛔ ${error.message}`);
  } finally {
    connection = null;
    connectionButton.textContent = 'Conectar';
  }
}

connectionButton.addEventListener('click', () => {
  if (connection) {
    connection.abort();
    return;
  }
  viewer.replaceChildren();
  pending = [];
  Object.keys(counts).forEach((level) => { counts[level] = 0; });
  connect();
});
pauseButton.addEventListener('click', () => {
  paused = !paused;
  pauseButton.setAttribute('aria-pressed', String(paused));
  pauseButton.textContent = paused ? 'Reanudar' : 'Pausar';
  if (!paused) {
    logLine(`▶️ reanudado: ${pending.length} línea(s) acumuladas`);
    paint(pending);
    pending = [];
  } else {
    logLine('⏸️ en pausa: lo que llegue se acumula');
  }
});
document.querySelector('fieldset').addEventListener('change', () => {
  const levels = visibleLevels();
  for (const item of viewer.children) item.hidden = !levels.has(item.dataset.level);
});
connect();
logLine('Listo: mira el registro; desmarca «info», prueba «Pausar» y «Detener»');
```

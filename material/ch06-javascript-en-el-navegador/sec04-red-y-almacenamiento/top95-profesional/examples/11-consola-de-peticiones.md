---
example_description: "Una consola de peticiones como las de las herramientas de APIs: método, ruta, query y cabeceras línea a línea (URLSearchParams y Headers validan), cuerpo JSON comprobado antes de enviar, plazo y cancelación, respuesta con status, tiempo, cabeceras legibles y cuerpo formateado, e historial de las últimas cinco peticiones en localStorage"
example_tags: "javascript|fetch|headers|urlsearchparams|json|localstorage|abortsignal|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="console-app">
  <h1>Consola de peticiones</h1>
  <form id="request-form">
    <div class="line">
      <label class="sr-only" for="method">Método</label>
      <select id="method" name="method"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select>
      <label class="sr-only" for="path">Ruta</label>
      <input id="path" name="path" value="/api/demo/echo" required>
    </div>
    <label for="query">Query (una línea por parámetro: clave=valor)</label>
    <textarea id="query" name="query" rows="2">pedido=P-1001</textarea>
    <label for="headers">Cabeceras (una por línea: Nombre: valor)</label>
    <textarea id="headers" name="headers" rows="2">Accept: application/json</textarea>
    <label for="body">Cuerpo JSON</label>
    <textarea id="body" name="body" rows="3" disabled>{ "sku": "CAF-OAX-500", "quantity": 2 }</textarea>
    <p class="actions">
      <button type="submit">Enviar</button>
      <button id="cancel" type="button" disabled>Cancelar</button>
      <button id="clear-history" type="button">Borrar historial</button>
    </p>
  </form>
  <p id="status" class="status" role="status">Prepara una petición.</p>
  <dl id="response-headers" class="headers"></dl>
  <pre id="response-body" class="body" tabindex="0" aria-label="Cuerpo de la respuesta"></pre>
  <h2>Historial</h2>
  <ul id="history" class="history"></ul>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --surface: #ffffff; --page: #f5f7fa; --accent: #1d4ed8; --ok: #166534; --error: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.console-app { max-width: 34rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0 0 0.5rem; font-size: 1.25rem; }
h2 { margin: 0.75rem 0 0.25rem; font-size: 1rem; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
form { display: grid; gap: 0.25rem; }
.line { display: flex; gap: 0.4rem; }
.line input { flex: 1; }
label { font-size: 0.85rem; font-weight: 600; }
input, select, textarea, button { font: inherit; padding: 0.3rem 0.5rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: var(--surface); color: var(--ink); }
textarea, input { font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
textarea:disabled { background: #e4e7eb; }
button { cursor: pointer; }
button:disabled { color: #616e7c; cursor: not-allowed; }
:is(input, select, textarea, button, pre):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.actions { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.25rem 0 0; }
.status { font-weight: 600; }
.status.is-ok { color: var(--ok); }
.status.is-error { color: var(--error); }
.headers { display: grid; grid-template-columns: auto 1fr; gap: 0 0.75rem; margin: 0; font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
.headers dt { color: var(--muted); }
.headers dd { margin: 0; overflow-wrap: anywhere; }
.body { max-height: 12rem; overflow: auto; padding: 0.5rem; border-radius: 0.5rem; background: #0f172a; color: #e2e8f0; font-size: 0.75rem; }
.history { margin: 0; padding-left: 1.2rem; font-size: 0.85rem; }
.history button { padding: 0.1rem 0.4rem; font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Consola de peticiones para el servidor de prueba.
//
// Decisiones de diseño:
// - Nada se pega a mano: la query se construye con URLSearchParams y las
//   cabeceras con new Headers(), que lanza TypeError si un nombre no es
//   válido. El cuerpo se comprueba con JSON.parse ANTES de enviar: es mejor
//   un error claro aquí que un 400 del servidor.
// - Solo rutas /api/demo/…: el resto de /api/ de LearnWeb modifica el curso.
// - Plazo de 10 s + «Cancelar» (AbortSignal.any). El tiempo se mide con
//   performance.now() y solo se muestra en pantalla (cambia en cada envío).
// - El historial guarda las últimas cinco peticiones (sin respuestas) en
//   «lw-red-consola-historial»; persiste a propósito y se borra con su botón.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const HISTORY_KEY = 'lw-red-consola-historial';
const form = document.querySelector('#request-form');
const statusText = document.querySelector('#status');
const cancelButton = document.querySelector('#cancel');
const logList = document.querySelector('#log');
let inFlight = null;
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function setStatus(text, kind = '') {
  statusText.textContent = text;
  statusText.className = `status ${kind}`;
}
const lines = (text) => text.split('\n').map((line) => line.trim()).filter(Boolean);

function buildRequest(fields) {
  if (!fields.path.startsWith('/api/demo/')) throw new Error('solo se permiten rutas /api/demo/…');
  const url = new URL(fields.path, document.baseURI);
  for (const line of lines(fields.query)) {
    const at = line.indexOf('=');
    url.searchParams.append(at === -1 ? line : line.slice(0, at), at === -1 ? '' : line.slice(at + 1));
  }
  const headers = new Headers();
  for (const line of lines(fields.headers)) {
    const at = line.indexOf(':');
    headers.append(line.slice(0, at === -1 ? line.length : at).trim(), at === -1 ? '' : line.slice(at + 1).trim());
  }
  const init = { method: fields.method, headers };
  if (fields.method !== 'GET' && fields.body.trim()) {
    JSON.parse(fields.body); // lanza SyntaxError si no es JSON
    if (new Blob([fields.body]).size > 64 * 1024) throw new Error('el cuerpo supera 64 KB');
    if (!headers.has('content-type')) headers.set('Content-Type', 'application/json');
    init.body = fields.body;
  }
  return { url, init };
}

const readFields = () => Object.fromEntries(['method', 'path', 'query', 'headers', 'body'].map((name) => [name, form.elements[name].value]));
function writeFields(fields) {
  for (const [name, value] of Object.entries(fields)) form.elements[name].value = value;
  form.elements.body.disabled = fields.method === 'GET';
}
function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return Array.isArray(saved) ? saved.slice(0, 5) : [];
  } catch {
    return [];
  }
}
function renderHistory() {
  document.querySelector('#history').replaceChildren(...loadHistory().map((fields, index) => {
    const item = document.createElement('li');
    const restore = Object.assign(document.createElement('button'), { type: 'button', textContent: `${fields.method} ${fields.path}${lines(fields.query).length ? `?${lines(fields.query).join('&')}` : ''}` });
    restore.dataset.index = index;
    item.append(restore);
    return item;
  }));
}
function remember(fields) {
  const previous = loadHistory().filter((item) => JSON.stringify(item) !== JSON.stringify(fields));
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([fields, ...previous].slice(0, 5)));
  } catch {
    // sin sitio: el historial es un extra
  }
  renderHistory();
}

async function send() {
  const fields = readFields();
  let request;
  try {
    request = buildRequest(fields);
  } catch (error) {
    setStatus(`No se envió: ${error.name === 'SyntaxError' ? `el cuerpo no es JSON válido (${error.message})` : error.message}`, 'is-error');
    logLine(`⛔ ${error.name}: no se envió`);
    return;
  }
  inFlight?.abort();
  inFlight = new AbortController();
  cancelButton.disabled = false;
  remember(fields);
  const shown = `${request.init.method} ${request.url.pathname}${request.url.search}`;
  logLine(`→ ${shown}`);
  setStatus('Enviando…');
  const start = performance.now();
  try {
    const response = await fetch(request.url, { ...request.init, signal: AbortSignal.any([inFlight.signal, AbortSignal.timeout(10_000)]) });
    const text = await response.text();
    const ms = Math.round(performance.now() - start);
    const headerList = document.querySelector('#response-headers');
    headerList.replaceChildren(...[...response.headers].flatMap(([headerName, value]) => [
      Object.assign(document.createElement('dt'), { textContent: headerName }),
      Object.assign(document.createElement('dd'), { textContent: value }),
    ]));
    let pretty = text;
    try {
      pretty = JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      // no es JSON: se muestra tal cual
    }
    document.querySelector('#response-body').textContent = pretty;
    setStatus(`${response.status} ${response.statusText} · ${ms} ms`, response.ok ? 'is-ok' : 'is-error');
    logLine(`← ${response.status} ${response.statusText} · ${response.headers.get('content-type')}`);
  } catch (error) {
    setStatus(error.name === 'AbortError' ? 'Cancelada.' : `Sin respuesta (${error.name}: ${error.message}).`, 'is-error');
    logLine(`⛔ ${error.name}`);
  } finally {
    cancelButton.disabled = true;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  send();
});
form.elements.method.addEventListener('change', () => {
  form.elements.body.disabled = form.elements.method.value === 'GET';
});
cancelButton.addEventListener('click', () => inFlight?.abort());
document.querySelector('#history').addEventListener('click', (event) => {
  const restore = event.target.closest('button[data-index]');
  if (restore) writeFields(loadHistory()[Number(restore.dataset.index)]);
});
document.querySelector('#clear-history').addEventListener('click', () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
  logLine('🗑️ historial borrado');
});

renderHistory();
send(); // la petición de ejemplo, para empezar con una respuesta
logLine('Listo: elige POST, añade la línea status=201 a la query y envía; prueba también un JSON roto y una ruta fuera de /api/demo/');
```

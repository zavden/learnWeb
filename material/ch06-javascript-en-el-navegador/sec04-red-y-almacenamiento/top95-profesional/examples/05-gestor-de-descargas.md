---
example_description: "Un gestor de descargas: una cola con dos descargas a la vez, una barra de progreso accesible por archivo (indeterminada cuando el servidor no envía Content-Length), cancelar cada una con su AbortController y volver a empezarla desde cero, y el resultado como Blob"
example_tags: "javascript|streams|progreso|content-length|abortcontroller|cola|concurrencia|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="downloads">
  <h1>Descargas de la tienda</h1>
  <p><button id="all" type="button">Descargar todo</button></p>
  <ul id="files" class="files"></ul>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --surface: #ffffff; --page: #f5f7fa; --accent: #1d4ed8; --ok: #166534; --error: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.downloads { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0 0 0.5rem; font-size: 1.25rem; }
.files { display: grid; gap: 0.5rem; margin: 0; padding: 0; list-style: none; }
.file { display: grid; grid-template-columns: 1fr auto; gap: 0.25rem 0.75rem; padding: 0.6rem 0.75rem; border: 1px solid var(--line); border-radius: 0.6rem; background: var(--surface); }
.file h2 { margin: 0; font-size: 0.95rem; }
.file progress { grid-column: 1 / -1; width: 100%; accent-color: var(--accent); }
.file .state { grid-column: 1 / -1; margin: 0; font-size: 0.85rem; color: var(--muted); }
.file[data-state="done"] .state { color: var(--ok); }
.file[data-state="error"] .state { color: var(--error); }
button { font: inherit; padding: 0.3rem 0.7rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: var(--surface); color: var(--ink); cursor: pointer; }
button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Gestor de descargas con cola, progreso y cancelación.
//
// Decisiones de diseño:
// - Una cola con un límite de 2 descargas simultáneas: las demás esperan
//   («En cola») y arrancan cuando otra termina, se cancela o falla.
// - El progreso sale de Content-Length; si falta (el informe se genera al
//   vuelo), la barra pasa a indeterminada (sin atributo value) y se cuentan KB.
// - Cancelar aborta el fetch y el flujo. «Reanudar» vuelve a empezar desde
//   cero: continuar donde se quedó exigiría un servidor con Accept-Ranges y
//   una petición con la cabecera Range: bytes=N-, que el de prueba no admite.
// - Los trozos se juntan en un Blob al terminar (Blob y descargar archivos:
//   capítulo 8). El servidor de prueba simula los archivos con su endpoint
//   /api/demo/stream (nunca más de 50 trozos ni de 64 KB por trozo).
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const FILES = [
  { id: 'catalogo', title: 'Catálogo de otoño.pdf', query: 'chunks=20&interval=100&size=8192' },
  { id: 'fotos', title: 'Fotos del tueste.zip', query: 'chunks=30&interval=100&size=16384' },
  { id: 'informe', title: 'Informe de ventas.csv', query: 'chunks=15&interval=150&size=4096&length=no' },
];
const LIMIT = 2;
const listElement = document.querySelector('#files');
const logList = document.querySelector('#log');
const queue = [];
const running = new Map(); // id → AbortController
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

const rows = new Map(FILES.map((file) => {
  const row = Object.assign(document.createElement('li'), { className: 'file' });
  row.dataset.state = 'idle';
  const action = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Descargar' });
  action.dataset.id = file.id;
  action.setAttribute('aria-label', `Descargar ${file.title}`);
  const bar = Object.assign(document.createElement('progress'), { max: 100, value: 0 });
  bar.setAttribute('aria-label', `Progreso de ${file.title}`);
  const state = Object.assign(document.createElement('p'), { className: 'state', textContent: 'Sin descargar' });
  row.append(Object.assign(document.createElement('h2'), { textContent: file.title }), action, bar, state);
  listElement.append(row);
  return [file.id, { file, row, action, bar, state }];
}));

function show(id, stateName, text, buttonText) {
  const { row, action, state, file } = rows.get(id);
  row.dataset.state = stateName;
  state.textContent = text;
  action.textContent = buttonText;
  action.setAttribute('aria-label', `${buttonText} ${file.title}`);
}

function enqueue(id) {
  if (running.has(id) || queue.includes(id)) return;
  queue.push(id);
  show(id, 'queued', 'En cola…', 'Cancelar');
  pump();
}
function pump() {
  while (running.size < LIMIT && queue.length > 0) download(queue.shift());
}

async function download(id) {
  const { file, bar } = rows.get(id);
  const controller = new AbortController();
  running.set(id, controller);
  bar.value = 0;
  show(id, 'running', 'Conectando…', 'Cancelar');
  logLine(`⬇️ empieza ${file.title}`);
  try {
    const response = await fetch(`/api/demo/stream?${file.query}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const total = Number(response.headers.get('content-length')) || null; // null: desconocido
    if (total === null) bar.removeAttribute('value');                    // barra indeterminada
    const chunks = [];
    let received = 0;
    for await (const chunk of response.body) {
      chunks.push(chunk);
      received += chunk.byteLength;
      if (total) {
        bar.value = Math.round((received / total) * 100);
        rows.get(id).state.textContent = `${kb(received)} de ${kb(total)} (${bar.value} %)`;
      } else {
        rows.get(id).state.textContent = `${kb(received)} recibidos (tamaño desconocido)`;
      }
    }
    const blob = new Blob(chunks);
    bar.value = 100;
    show(id, 'done', `Listo: ${kb(blob.size)}.`, 'Descargar otra vez');
    logLine(`✅ ${file.title}: ${kb(blob.size)}${total ? '' : ' (sin Content-Length)'}`);
  } catch (error) {
    if (error.name === 'AbortError') {
      bar.value = 0;
      show(id, 'cancelled', 'Cancelada. «Reanudar» empieza de nuevo desde cero.', 'Reanudar');
      logLine(`⏹️ cancelada ${file.title}`);
    } else {
      show(id, 'error', `Falló (${error.message}).`, 'Reintentar');
      logLine(`⛔ ${file.title}: ${error.message}`);
    }
  } finally {
    running.delete(id);
    pump(); // deja sitio a la siguiente de la cola
  }
}

listElement.addEventListener('click', (event) => {
  const action = event.target.closest('button[data-id]');
  if (!action) return;
  const { id } = action.dataset;
  if (running.has(id)) {
    running.get(id).abort();
  } else if (queue.includes(id)) {
    queue.splice(queue.indexOf(id), 1);
    show(id, 'cancelled', 'Quitada de la cola.', 'Descargar');
  } else {
    enqueue(id);
  }
});
document.querySelector('#all').addEventListener('click', () => {
  for (const file of FILES) enqueue(file.id);
});
logLine('Listo: pulsa «Descargar todo» (dos a la vez; la tercera espera en cola) y prueba «Cancelar» y «Reanudar»');
```

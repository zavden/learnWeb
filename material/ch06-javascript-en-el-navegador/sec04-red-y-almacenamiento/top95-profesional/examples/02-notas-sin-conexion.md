---
example_description: "Notas de cata que funcionan sin conexión: cada nota se guarda primero en IndexedDB junto con una operación en una cola de salida (una sola transacción), y una sincronización las envía en orden con POST al servidor; sin conexión quedan pendientes y salen al volver. Persisten a propósito; «Borrar todo» elimina la base"
example_tags: "javascript|indexeddb|sin-conexion|cola|sincronizacion|fetch|transacciones|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="notes-app">
  <h1>Notas de cata</h1>
  <form id="note-form">
    <label for="coffee">Café</label>
    <input id="coffee" name="coffee" required autocomplete="off">
    <label for="tasting">Notas</label>
    <textarea id="tasting" name="tasting" rows="2" required></textarea>
    <button type="submit">Guardar</button>
  </form>
  <p class="toolbar">
    <label><input id="offline" type="checkbox"> Sin conexión (simulada)</label>
    <button id="sync" type="button">Sincronizar ahora</button>
    <button id="wipe" type="button">Borrar todo</button>
  </p>
  <p id="status" class="status" role="status">Abriendo la base de datos…</p>
  <ul id="notes" class="notes"></ul>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --surface: #ffffff; --page: #f5f7fa; --accent: #1d4ed8; --ok: #166534; --warn: #b45309; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.notes-app { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0 0 0.5rem; font-size: 1.25rem; }
form { display: grid; gap: 0.25rem; }
form button { justify-self: start; margin-top: 0.25rem; }
input:not([type]), textarea, button { font: inherit; padding: 0.35rem 0.6rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: var(--surface); color: var(--ink); }
button { cursor: pointer; }
:is(input, textarea, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.toolbar { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; align-items: center; }
.status { color: var(--muted); }
.notes { display: grid; gap: 0.4rem; margin: 0; padding: 0; list-style: none; }
.notes li { padding: 0.45rem 0.6rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); }
.notes strong { display: block; }
.badge { font-size: 0.8rem; font-weight: 600; }
.badge.is-synced { color: var(--ok); }
.badge.is-pending { color: var(--warn); }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Notas sin conexión con una cola de sincronización.
//
// Decisiones de diseño:
// - Primero local, después la red: guardar nunca espera al servidor. La nota
//   y su operación de envío entran en IndexedDB en UNA transacción (las dos o
//   ninguna), así que no puede quedar una nota sin su envío pendiente.
// - La cola (almacén «outbox») se vacía en orden; si un envío falla, se para
//   y lo intenta la próxima vez: el orden de llegada al servidor se respeta.
// - Un único sincronizador a la vez (la variable syncing).
// - «Sin conexión» envía a una dirección donde nadie contesta (fetch falla
//   con TypeError, como sin red). En una página real se escucharía además el
//   evento online de window para reintentar al volver la conexión.
// - Los datos persisten a propósito en la base «lw-red-notas»; «Borrar todo»
//   la elimina. En una tarjeta de la teoría IndexedDB no existe: se avisa.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const DB_NAME = 'lw-red-notas';
const form = document.querySelector('#note-form');
const offlineBox = document.querySelector('#offline');
const statusText = document.querySelector('#status');
const notesList = document.querySelector('#notes');
const logList = document.querySelector('#log');
let db = null;
let syncing = false;
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// ── IndexedDB con promesas ──
const promisify = (request) => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
const done = (transaction) => new Promise((resolve, reject) => {
  transaction.oncomplete = () => resolve();
  transaction.onerror = transaction.onabort = () => reject(transaction.error);
});
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
      request.result.createObjectStore('outbox', { autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
const readAll = (storeName) => promisify(db.transaction(storeName).objectStore(storeName).getAll());

async function render() {
  const [notes, pending] = await Promise.all([readAll('notes'), readAll('outbox')]);
  notesList.replaceChildren(...notes.reverse().map((note) => {
    const item = document.createElement('li');
    const badge = Object.assign(document.createElement('span'), {
      className: `badge ${note.synced ? 'is-synced' : 'is-pending'}`,
      textContent: note.synced ? '☁️ enviada' : '⏳ pendiente',
    });
    item.append(Object.assign(document.createElement('strong'), { textContent: note.coffee }), note.tasting, ' ', badge);
    return item;
  }));
  statusText.textContent = `${notes.length} nota(s) · ${pending.length} pendiente(s) de enviar.`;
  return { notes: notes.length, pending: pending.length };
}

async function saveNote(coffee, tasting) {
  const transaction = db.transaction(['notes', 'outbox'], 'readwrite');
  const noteId = await promisify(transaction.objectStore('notes').add({ coffee, tasting, synced: false, createdAt: new Date() }));
  transaction.objectStore('outbox').add({ noteId });
  await done(transaction);
  logLine(`💾 «${coffee}» guardada en el navegador (pendiente)`);
}

async function sync() {
  if (syncing) return;
  syncing = true;
  try {
    const outbox = db.transaction('outbox').objectStore('outbox');
    const [keys, ops] = await Promise.all([promisify(outbox.getAllKeys()), promisify(outbox.getAll())]);
    for (const [index, op] of ops.entries()) {
      const note = await promisify(db.transaction('notes').objectStore('notes').get(op.noteId));
      const url = offlineBox.checked ? 'http://localhost:59999/' : '/api/demo/echo?status=201';
      let response;
      try {
        response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(note) });
      } catch {
        logLine(`📡 sin conexión: ${ops.length - index} pendiente(s), se enviarán al volver`);
        return;
      }
      if (!response.ok) {
        logLine(`⛔ el servidor respondió ${response.status}: se reintentará`);
        return;
      }
      const confirmed = db.transaction(['notes', 'outbox'], 'readwrite'); // marcar y sacar de la cola, juntos
      confirmed.objectStore('notes').put({ ...note, synced: true });
      confirmed.objectStore('outbox').delete(keys[index]);
      await done(confirmed);
      logLine(`☁️ «${note.coffee}» enviada: ${response.status} ${response.statusText}`);
    }
  } finally {
    syncing = false;
    await render();
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!db) return;
  await saveNote(form.elements.coffee.value.trim(), form.elements.tasting.value.trim());
  form.reset();
  await render();
  sync();
});
offlineBox.addEventListener('change', () => {
  if (db && !offlineBox.checked) sync(); // «vuelve la conexión»
});
document.querySelector('#sync').addEventListener('click', () => db && sync());
document.querySelector('#wipe').addEventListener('click', async () => {
  if (!db) return;
  db.close();
  await promisify(indexedDB.deleteDatabase(DB_NAME));
  db = await openDatabase();
  await render();
  logLine('🗑️ base borrada');
});

async function start() {
  try {
    db = await openDatabase();
  } catch (error) {
    statusText.textContent = `IndexedDB no está disponible aquí (${error.name}). Esta tarjeta es un iframe aislado (origen null): ábrela con ▶ o en el editor.`;
    form.querySelector('button').disabled = true;
    logLine(`⚠️ ${error.name}: sin IndexedDB en esta tarjeta`);
    return;
  }
  const { notes, pending } = await render();
  logLine(`🗄️ notas guardadas: ${notes} · pendientes: ${pending}`);
  logLine('Listo: guarda una nota; marca «Sin conexión» y guarda otra; después desmárcala');
}
start();
```

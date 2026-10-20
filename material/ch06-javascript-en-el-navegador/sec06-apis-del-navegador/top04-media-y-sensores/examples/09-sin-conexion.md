---
example_description: "navigator.onLine y los eventos online/offline de window: las notas del pedido se envían al servidor de prueba si hay conexión y se guardan en una cola si no; al volver la conexión, se envía la cola. onLine solo dice si hay red, no si el servidor responde"
example_tags: "javascript|online|offline|navigator-online|fetch|cola"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Notas para cocina</h1>
  <p class="network">Conexión: <output id="network">—</output></p>
  <form id="note-form" class="note-form">
    <label for="note">Nota</label>
    <input id="note" name="note" value="Sin cebolla en la mesa 4" required>
    <button type="submit">Guardar</button>
  </form>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí el formulario no se envía: ábrela con «▶ Run» o en el editor.</p>
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
.note-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
input {
  flex: 1 1 12rem;
  font: inherit;
  padding: 0.3rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
input:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.notice {
  color: #92400e;
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
const form = document.querySelector('#note-form');
const networkOutput = document.querySelector('#network');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
const queue = []; // notas que esperan conexión

function showNetwork() {
  networkOutput.textContent = navigator.onLine ? '📶 con red' : '📴 sin red';
}

async function send(note) {
  // El servidor de prueba de LearnWeb devuelve lo que le mandas (módulo «Red y almacenamiento»).
  const response = await fetch('/api/demo/echo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note }),
  });
  logLine(`📨 enviada → ${response.status} · «${note}»`);
}

async function saveNote(note) {
  if (!navigator.onLine) {
    queue.push(note);
    logLine(`🗂 en cola (${queue.length}): «${note}»`);
    return;
  }
  try {
    await send(note);
  } catch (error) {
    // onLine = true solo significa «hay una red», no «el servidor contesta».
    queue.push(note);
    logLine(`🗂 ${error.name}: la guardo en la cola (${queue.length})`);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  saveNote(form.elements.note.value);
  form.elements.note.value = '';
});

window.addEventListener('offline', () => {
  showNetwork();
  logLine(`📴 offline → navigator.onLine: ${navigator.onLine}`);
});
window.addEventListener('online', async () => {
  showNetwork();
  const pending = queue.splice(0); // las que esperaban (si alguna falla, vuelve a la cola)
  logLine(`📶 online → envío la cola (${pending.length})`);
  for (const note of pending) await saveNote(note);
});

showNetwork();
if (window.origin === 'null') document.querySelector('#card-notice').hidden = false;
logLine(`navigator.onLine → ${navigator.onLine}`);
logLine('Listo: guarda una nota; después quita la red, guarda otra y vuelve a conectarte');
```

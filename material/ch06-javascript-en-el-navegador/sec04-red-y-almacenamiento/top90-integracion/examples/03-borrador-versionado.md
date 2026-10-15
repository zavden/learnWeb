---
example_description: "Un formulario de encargo que guarda su borrador en localStorage mientras escribes: JSON con número de versión y migración desde el formato antiguo, aviso con el evento storage si otra pestaña cambia el mismo borrador, y envío con POST JSON que lo borra solo si el servidor responde bien"
example_tags: "javascript|localstorage|json|versiones|evento-storage|fetch|post|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Encarga tu pastel</h1>
  <p id="other-tab" class="notice" hidden>
    Este borrador cambió en otra pestaña.
    <button id="load-other" type="button">Cargar esa versión</button>
  </p>
  <form id="order-form">
    <label for="customer">Nombre</label>
    <input id="customer" name="customer" required>
    <label for="flavor">Sabor</label>
    <select id="flavor" name="flavor">
      <option value="chocolate">Chocolate</option>
      <option value="tres-leches">Tres leches</option>
      <option value="zanahoria">Zanahoria</option>
    </select>
    <label for="message">Mensaje sobre el pastel</label>
    <textarea id="message" name="message" rows="2"></textarea>
    <p class="actions">
      <button type="submit">Enviar encargo</button>
      <button id="discard" type="button">Descartar borrador</button>
      <button id="legacy" type="button">Simular borrador antiguo (v1)</button>
    </p>
  </form>
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
  margin-top: 0;
}
form {
  display: grid;
  gap: 0.3rem;
}
input,
select,
textarea,
button {
  font: inherit;
  padding: 0.35rem 0.6rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
}
button {
  cursor: pointer;
}
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.4rem 0 0;
}
.notice {
  padding: 0.5rem 0.75rem;
  border-left: 4px solid #b45309;
  background: #fffbeb;
}
.notice[hidden] {
  display: none;
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
// Combina «Almacenamiento en el navegador» (JSON, el evento storage) y
// «Peticiones con fetch» (POST JSON, comprobar ok).
const DRAFT_KEY = 'lw-red-borrador-pastel';
const VERSION = 2;
const form = document.querySelector('#order-form');
const otherTabNotice = document.querySelector('#other-tab');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// v1 (la versión anterior de la página) guardaba { nombre, mensaje }.
// v2 guarda { version, fields: { customer, flavor, message } }.
function migrate(raw) {
  if (raw === null || typeof raw !== 'object') return null;
  if (raw.version === undefined) {
    logLine('🔁 borrador v1 migrado a v2');
    return { version: 2, fields: { customer: raw.nombre ?? '', flavor: 'chocolate', message: raw.mensaje ?? '' } };
  }
  if (raw.version === VERSION) return raw;
  logLine(`⚠️ borrador v${raw.version}, de una versión más nueva: se ignora`);
  return null;
}
function readDraft(text = localStorage.getItem(DRAFT_KEY)) {
  try {
    return migrate(JSON.parse(text));
  } catch {
    return null; // JSON roto
  }
}
function fillForm(draft) {
  for (const [field, value] of Object.entries(draft.fields)) {
    if (form.elements[field]) form.elements[field].value = value;
  }
}
function saveDraft() {
  const fields = Object.fromEntries(['customer', 'flavor', 'message'].map((field) => [field, form.elements[field].value]));
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: VERSION, fields }));
    logLine('💾 borrador guardado (v2)');
  } catch (error) {
    logLine(`⚠️ no se pudo guardar el borrador (${error.name})`);
  }
}

let saveTimer;
form.addEventListener('input', () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveDraft, 600); // una escritura por pausa, no por tecla
});

// Otra pestaña guardó el MISMO borrador: avisar, sin pisar lo que escribes aquí.
let otherVersion = null;
window.addEventListener('storage', (event) => {
  if (event.key !== DRAFT_KEY || event.newValue === null) return;
  otherVersion = readDraft(event.newValue);
  otherTabNotice.hidden = otherVersion === null;
  logLine('📨 el borrador cambió en otra pestaña');
});
document.querySelector('#load-other').addEventListener('click', () => {
  fillForm(otherVersion);
  otherTabNotice.hidden = true;
  logLine('📥 cargada la versión de la otra pestaña');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearTimeout(saveTimer);
  const order = Object.fromEntries(new FormData(form)); // módulo «Formularios con JavaScript»
  try {
    const response = await fetch('/api/demo/echo?status=201', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const echo = await response.json();
    localStorage.removeItem(DRAFT_KEY); // enviado: el borrador ya no hace falta
    form.reset();
    logLine(`📨 ${response.status} ${response.statusText}: pastel de ${echo.body.flavor} para ${echo.body.customer}; borrador borrado`);
  } catch (error) {
    logLine(`⛔ no se envió (${error.message}): el borrador sigue guardado`);
  }
});
document.querySelector('#discard').addEventListener('click', () => {
  clearTimeout(saveTimer);
  localStorage.removeItem(DRAFT_KEY);
  form.reset();
  logLine('🗑️ borrador descartado');
});
document.querySelector('#legacy').addEventListener('click', () => {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ nombre: 'Lucía', mensaje: '¡Feliz cumpleaños, abuela!' }));
  const draft = readDraft();
  fillForm(draft);
  saveDraft(); // a partir de ahora, en el formato nuevo
});

const saved = readDraft();
if (saved) {
  fillForm(saved);
  logLine('📂 borrador recuperado');
} else {
  logLine('📂 sin borrador guardado');
}
logLine('Listo: escribe y pulsa ⟳ (el borrador vuelve); prueba «Simular borrador antiguo (v1)» y «Enviar encargo»');
```

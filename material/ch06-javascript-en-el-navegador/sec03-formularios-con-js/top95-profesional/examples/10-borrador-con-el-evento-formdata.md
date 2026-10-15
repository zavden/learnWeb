---
example_description: "Una reseña con borrador automático: al dejar de escribir, requestSubmit(«Guardar borrador») envía sin validar (formnovalidate) y el evento formdata añade a cualquier envío el número de palabras (contadas con \\p{L}) y la versión del borrador; «Publicar» sí valida. Los envíos van al servidor de pruebas con fetch (adelanto)"
example_tags: "javascript|formularios|profesional|evento-formdata|requestsubmit|formnovalidate|debounce|fetch|regex"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Escribe una reseña · Librería El Faro</h1>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí los formularios no se envían (tampoco el borrador): ábrelo con «▶ Run» o en el editor.</p>
  <form id="review" action="/resenas" method="post">
    <label for="book">Libro</label>
    <input id="book" name="book" required value="La tejedora de Teotitlán">
    <label for="headline">Titular de tu reseña</label>
    <input id="headline" name="headline" required maxlength="80">
    <fieldset>
      <legend>Puntuación</legend>
      <label><input type="radio" name="rating" value="3" required> 3</label>
      <label><input type="radio" name="rating" value="4"> 4</label>
      <label><input type="radio" name="rating" value="5" checked> 5</label>
    </fieldset>
    <label for="body">Reseña (40 caracteres o más)</label>
    <textarea id="body" name="body" rows="4" required minlength="40">Una novela breve sobre una familia de tejedores de Oaxaca.</textarea>
    <p class="actions">
      <button type="submit" id="save-draft" name="intent" value="draft" formnovalidate>Guardar borrador</button>
      <button type="submit" name="intent" value="publish" class="primary">Publicar</button>
    </p>
    <p id="save-state" role="status"></p>
  </form>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root {
  --ink: #1f2933;
  --muted: #52606d;
  --line: #cbd2d9;
  --field: #7b8794;
  --surface: #ffffff;
  --page: #f5f7fa;
  --accent: #1d4ed8;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: var(--ink);
  background: var(--page);
}
main {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin: 0 0 0.75rem;
}
.notice {
  padding: 0.5rem 0.75rem;
  border-left: 4px solid var(--accent);
  background: var(--surface);
}
form {
  display: grid;
  gap: 0.3rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
}
form > label {
  margin-top: 0.4rem;
  font-weight: 600;
}
fieldset {
  display: flex;
  gap: 1rem;
  margin: 0.4rem 0 0;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
}
input,
textarea,
button {
  font: inherit;
  color: var(--ink);
}
input:not([type="radio"]),
textarea {
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--field);
  border-radius: 0.375rem;
  background: var(--surface);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.6rem 0 0;
}
button {
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--field);
  border-radius: 0.5rem;
  background: var(--surface);
  cursor: pointer;
}
.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: #ffffff;
}
#save-state {
  margin: 0;
  color: var(--muted);
}
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface);
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Reseña con borrador automático.
//
// Decisiones de diseño:
// - «Guardar borrador» es un botón de envío con formnovalidate: un borrador puede
//   estar a medias. El autoguardado no inventa otro camino: llama a
//   requestSubmit(ese botón), así pasa por el mismo submit, con submitter incluido.
// - El evento formdata añade a TODO envío (borrador, publicar o un FormData
//   cualquiera) el número de palabras y la versión del borrador: datos que no están
//   en ningún control.
// - Autoguardado con debounce: 1,5 s después de la última tecla, y solo si hay
//   cambios desde el último borrador.
// - Los envíos van al servidor de pruebas con fetch (adelanto de «Red y almacenamiento»).
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.
const form = document.querySelector('#review');
const draftButton = document.querySelector('#save-draft');
const saveState = document.querySelector('#save-state');
const logList = document.querySelector('#log');
let quiet = false;
let draftVersion = 0;
let lastSaved = '';
function logLine(text) {
  if (quiet) return;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
if (window.origin === 'null') document.querySelector('#card-notice').hidden = false;

const countWords = (text) => (text.match(/[\p{L}\p{N}]+/gv) ?? []).length;

// Cada vez que alguien construye los datos de este formulario.
form.addEventListener('formdata', (event) => {
  event.formData.set('word_count', String(countWords(form.elements.body.value)));
  event.formData.set('draft_version', String(draftVersion));
});

async function sendToServer(formData) {
  // Adelanto: fetch, al servidor de pruebas de LearnWeb (responde con lo que recibe).
  const response = await fetch('/api/demo/echo?delay=300', { method: 'POST', body: formData });
  return (await response.json()).body;
}
let send = sendToServer; // la autocomprobación lo sustituye para no usar la red

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const intent = event.submitter?.value ?? 'publish';
  if (intent === 'draft') draftVersion += 1;
  const formData = new FormData(form, event.submitter); // dispara formdata
  saveState.textContent = intent === 'draft' ? 'Guardando borrador…' : 'Publicando…';
  try {
    const received = await send(formData);
    lastSaved = form.elements.body.value + form.elements.headline.value;
    saveState.textContent = intent === 'draft'
      ? `Borrador guardado (versión ${received.draft_version}).`
      : '¡Reseña publicada! Gracias.';
    logLine(`${intent === 'draft' ? '💾' : '📣'} ${intent} → el servidor recibió versión ${received.draft_version}, ${received.word_count} palabras`);
  } catch (error) {
    saveState.textContent = 'No se pudo guardar: revisa tu conexión.';
    logLine(`⚠️ ${error.name}: ${error.message}`);
  }
});

let autosaveTimer;
form.addEventListener('input', () => {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    if (form.elements.body.value + form.elements.headline.value === lastSaved) return;
    logLine('⏱️ 1,5 s sin escribir: autoguardado');
    form.requestSubmit(draftButton); // el mismo camino que pulsar «Guardar borrador»
  }, 1500);
});

// ── Autocomprobación (simulada, sin red; deja el formulario como estaba).
async function audit() {
  quiet = true;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  expect('cualquier FormData lleva word_count (10 palabras) y draft_version', new FormData(form).get('word_count') === '10'
    && new FormData(form).get('draft_version') === '0');
  expect('«Guardar borrador» no valida (formnovalidate), y con el titular vacío el formulario no es válido', draftButton.formNoValidate && !form.checkValidity());
  let captured = null;
  send = async (formData) => { captured = formData; return Object.fromEntries(formData); };
  form.dispatchEvent(new SubmitEvent('submit', { cancelable: true, submitter: draftButton })); // sin burbuja
  await new Promise((resolve) => setTimeout(resolve)); // deja terminar el listener asíncrono
  expect('un borrador envía intent=draft y la versión 1', captured?.get('intent') === 'draft' && captured?.get('draft_version') === '1');
  expect('«Ñandú, café y té» son 4 palabras (la ñ y las tildes cuentan)', countWords('Ñandú, café y té') === 4);
  send = sendToServer;
  draftVersion = 0;
  lastSaved = '';
  saveState.textContent = '';
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
  logLine('Listo: escribe un titular y espera 1,5 s (autoguardado); escribe más y pulsa «Publicar»');
}
audit();
```

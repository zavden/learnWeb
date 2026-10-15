---
example_description: "Una solicitud de soporte con archivos adjuntos: input.files se valida al cambiar (como mucho 3, 2 MB cada uno, solo PNG, JPG o PDF; accept es solo una pista) con setCustomValidity, la lista de archivos se pinta con su tamaño (Intl), un número de pedido opcional con pattern, y el envío multipart con FormData al servidor de pruebas, que devuelve nombre, tamaño y tipo de cada archivo"
example_tags: "javascript|formularios|profesional|archivos|input-file|formdata|multipart|setcustomvalidity|fetch|intl"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Soporte · Tostaduría La Ceiba</h1>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí los formularios no se envían: ábrelo con «▶ Run» o en el editor.</p>
  <form id="ticket" action="/soporte" method="post" enctype="multipart/form-data">
    <label for="topic">¿Sobre qué es?</label>
    <select id="topic" name="topic">
      <option value="order">Un pedido</option>
      <option value="grinder">Mi molino</option>
      <option value="other">Otra cosa</option>
    </select>
    <label for="order-id">Número de pedido (opcional)</label>
    <input id="order-id" name="order_id" pattern="PED-\d{6}" placeholder="PED-000000" aria-describedby="order-id-hint">
    <p id="order-id-hint" class="hint">Está en el correo de confirmación: PED y seis cifras.</p>
    <label for="details">Cuéntanos qué pasa</label>
    <textarea id="details" name="details" rows="3" required>El molino hace un ruido raro al moler fino.</textarea>
    <label for="attachments">Fotos o documentos (opcional)</label>
    <input id="attachments" name="attachments" type="file" multiple accept="image/png,image/jpeg,application/pdf" aria-describedby="attachments-hint attachments-error">
    <p id="attachments-hint" class="hint">Hasta 3 archivos PNG, JPG o PDF de 2 MB como máximo cada uno.</p>
    <p id="attachments-error" class="error"></p>
    <ul id="file-list" class="files" aria-label="Archivos elegidos"></ul>
    <button type="submit" class="primary">Enviar solicitud</button>
  </form>
  <p id="status" role="status"></p>
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
  --danger: #b91c1c;
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
label {
  margin-top: 0.4rem;
  font-weight: 600;
}
.hint,
.error {
  margin: 0;
  font-size: 0.9rem;
}
.hint {
  color: var(--muted);
}
.error {
  color: var(--danger);
}
.files {
  margin: 0;
  padding-left: 1.2rem;
}
input,
select,
textarea,
button {
  font: inherit;
  color: var(--ink);
}
input:not([type="file"]),
select,
textarea {
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--field);
  border-radius: 0.375rem;
  background: var(--surface);
}
[aria-invalid="true"] {
  outline: 2px solid var(--danger);
}
.primary {
  justify-self: start;
  margin-top: 0.6rem;
  padding: 0.45rem 1rem;
  border: 1px solid var(--accent);
  border-radius: 0.5rem;
  background: var(--accent);
  color: #ffffff;
  cursor: pointer;
}
.primary:disabled {
  cursor: progress;
  opacity: 0.75;
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
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
// Solicitud de soporte con adjuntos.
//
// Decisiones de diseño:
// - accept solo filtra el diálogo de archivos (se puede elegir «Todos los archivos»):
//   el tipo, el tamaño y el número se comprueban en change y se convierten en un
//   error propio con setCustomValidity; la validación nativa hace el resto.
// - De cada archivo solo se usan name, size y type (leer su contenido es la File API
//   del módulo «APIs modernas del navegador»), y se pintan con textContent.
// - El envío es multipart (los archivos viajan en FormData); fetch es un adelanto
//   del módulo «Red y almacenamiento». Mientras tanto, el botón queda desactivado.
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.
const form = document.querySelector('#ticket');
const fileInput = form.elements.attachments;
const statusLine = document.querySelector('#status');
const logList = document.querySelector('#log');
const MAX_FILES = 3;
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = /^(?:image\/(?:png|jpeg)|application\/pdf)$/v;
const kilobytes = new Intl.NumberFormat('es-MX', { style: 'unit', unit: 'kilobyte', maximumFractionDigits: 1 });
let quiet = false;
function logLine(text) {
  if (quiet) return;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
if (window.origin === 'null') document.querySelector('#card-notice').hidden = false;

function fileProblems(files) {
  const problems = [];
  if (files.length > MAX_FILES) problems.push(`Elegiste ${files.length} archivos; el máximo es ${MAX_FILES}.`);
  for (const file of files) {
    if (!ALLOWED.test(file.type)) problems.push(`${file.name}: tipo no admitido (usa PNG, JPG o PDF).`);
    if (file.size > MAX_BYTES) problems.push(`${file.name}: pesa ${kilobytes.format(file.size / 1024)}; el máximo es 2 MB.`);
  }
  return problems;
}
function checkFiles() {
  const files = [...fileInput.files];
  const problems = fileProblems(files);
  fileInput.setCustomValidity(problems.join(' '));
  fileInput.setAttribute('aria-invalid', String(problems.length > 0));
  document.querySelector('#attachments-error').textContent = problems.length ? `⚠ ${problems.join(' ')}` : '';
  document.querySelector('#file-list').replaceChildren(...files.map((file) => {
    const item = document.createElement('li');
    item.textContent = `${file.name} · ${kilobytes.format(file.size / 1024)}`;
    return item;
  }));
  return problems;
}

fileInput.addEventListener('change', () => {
  const problems = checkFiles();
  logLine(`📎 ${fileInput.files.length} archivo(s)${problems.length ? ` · ⚠ ${problems.length} problema(s)` : ' · correctos'}`);
});
form.addEventListener('submit', async (event) => {
  event.preventDefault(); // la validación nativa (incluido el error propio de los archivos) ya pasó
  const button = event.submitter;
  button.disabled = true;
  statusLine.textContent = 'Enviando tu solicitud…';
  try {
    // multipart: fetch pone el Content-Type con su boundary. Sin archivos elegidos,
    // FormData lleva uno vacío (sin nombre): se quita.
    const formData = new FormData(form);
    if (fileInput.files.length === 0) formData.delete('attachments');
    const response = await fetch('/api/demo/echo?delay=500', { method: 'POST', body: formData });
    const echo = await response.json();
    statusLine.textContent = '¡Recibido! Te respondemos en un día hábil.';
    logLine(`📨 ${response.status} · ${echo.headers['content-type'].split(';')[0]} · adjuntos → ${JSON.stringify(echo.body.attachments ?? [])}`);
  } catch (error) {
    statusLine.textContent = 'No se pudo enviar: revisa tu conexión.';
    logLine(`⚠️ ${error.name}: ${error.message}`);
  } finally {
    button.disabled = false;
    button.focus();
  }
});

// ── Autocomprobación (simulada con archivos creados en memoria; deja el campo vacío).
function audit() {
  quiet = true;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  const choose = (...files) => {
    const transfer = new DataTransfer(); // así se puede rellenar input.files desde JavaScript
    files.forEach((file) => transfer.items.add(file));
    fileInput.files = transfer.files;
    return checkFiles();
  };
  const photo = new File([new Uint8Array(1536)], 'molino.jpg', { type: 'image/jpeg' });
  const receipt = new File([new Uint8Array(2048)], 'ticket.pdf', { type: 'application/pdf' });
  expect('una foto y un PDF pequeños son válidos', choose(photo, receipt).length === 0 && fileInput.validity.valid);
  expect('la lista muestra nombre y tamaño: «molino.jpg · 1.5 kB»', document.querySelector('#file-list li').textContent.replace(/\s/gv, ' ') === 'molino.jpg · 1.5 kB');
  const video = new File([new Uint8Array(3 * 1024 * 1024)], 'ruido.mov', { type: 'video/quicktime' });
  expect('un vídeo de 3 MB: tipo y tamaño, dos problemas y customError', choose(video).length === 2 && fileInput.validity.customError);
  expect('4 archivos son demasiados', choose(photo, receipt, photo, receipt)[0] === 'Elegiste 4 archivos; el máximo es 3.');
  choose(photo);
  expect('FormData lleva el archivo con su nombre', new FormData(form).getAll('attachments')[0].name === 'molino.jpg');
  expect('«PED-12345» no cumple el pattern del pedido', (() => {
    form.elements.order_id.value = 'PED-12345';
    return form.elements.order_id.validity.patternMismatch;
  })());
  form.reset();
  checkFiles();
  fileInput.removeAttribute('aria-invalid');
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: adjunta una o dos fotos y pulsa «Enviar solicitud»; prueba también con un vídeo o con 4 archivos');
```

---
example_description: "Importar contactos pegados en un <textarea>: cada línea se parte con split y una regex, cada dato se valida con su propia regex (\\p{L}, el correo, las cifras del teléfono tras quitar \\D), los errores salen con su número de línea, el textarea queda inválido con setCustomValidity mientras haya errores y se revisa en vivo solo después del primer aviso"
example_tags: "javascript|formularios|integracion|regex|split|setcustomvalidity|textarea|validacion"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Importar socios · Huerta Urbana</h1>
  <form id="import" action="/socios/importar" method="post">
    <label for="contacts">Un socio por línea: nombre; correo; teléfono</label>
    <textarea id="contacts" name="contacts" rows="5" spellcheck="false" aria-describedby="contacts-errors">Lucía Méndez; lucia@huerta.mx; 55 1234 5678
Bruno Díaz; bruno@huerta; 5512345678
José Ñúñez;jose@correo.mx;  33 8765 4321
Ana; ana@huerta.mx; 12345</textarea>
    <ul id="contacts-errors" class="errors"></ul>
    <p class="actions">
      <button type="button" id="check">Comprobar</button>
      <button type="submit">Importar</button>
    </p>
  </form>
  <ol id="log" class="log" aria-label="Registro"></ol>
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
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.15rem;
  margin-top: 0;
}
form {
  display: grid;
  gap: 0.4rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
label {
  font-weight: 600;
}
textarea,
button {
  font: inherit;
  color: #1f2933;
  padding: 0.3rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
textarea {
  font-family: Menlo, Consolas, monospace;
  font-size: 0.85rem;
}
textarea[aria-invalid="true"] {
  border: 2px solid #b91c1c;
}
.errors {
  margin: 0;
  padding-left: 1.2rem;
  color: #b91c1c;
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin: 0;
}
button {
  cursor: pointer;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
// Combina: «Expresiones regulares» (split, \p{L}, anclas, \D) y «Validación con
// JavaScript» (setCustomValidity, aria-invalid, aria-describedby, premiar pronto).
const form = document.querySelector('#import');
const textarea = document.querySelector('#contacts');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// Una regex por regla: así cada error dice QUÉ falla (lección de lookahead).
const NAME = /^\p{L}[\p{L}' \-]{1,59}$/v;
const EMAIL = /^[^\s@;]+@[^\s@;]+\.[^\s@;]+$/v;

function parseLine(line, number) {
  const parts = line.split(/\s*;\s*/); // el separador admite espacios alrededor
  if (parts.length !== 3) return { error: `línea ${number}: necesita 3 datos separados por «;»` };
  const [name, email, rawPhone] = parts;
  const phone = rawPhone.replace(/\D/g, ''); // «55 1234 5678» → «5512345678»
  if (!NAME.test(name)) return { error: `línea ${number}: el nombre solo admite letras, espacios, guiones o apóstrofo` };
  if (!EMAIL.test(email)) return { error: `línea ${number}: el correo está incompleto (falta la @, el dominio o su punto)` };
  if (phone.length !== 10) return { error: `línea ${number}: el teléfono no tiene 10 cifras` };
  return { contact: { name, email, phone } };
}

let lastReport = '';
function validate() {
  const lines = textarea.value.split(/\r?\n/).map((line) => line.trim());
  const results = lines.map((line, index) => (line === '' ? null : parseLine(line, index + 1))).filter(Boolean);
  const errors = results.filter((result) => result.error).map((result) => result.error);
  const contacts = results.filter((result) => result.contact).map((result) => result.contact);
  textarea.setCustomValidity(errors.length > 0 ? `Hay ${errors.length} línea(s) con errores.` : '');
  textarea.setAttribute('aria-invalid', String(errors.length > 0));
  document.querySelector('#contacts-errors').replaceChildren(...errors.map((error) => {
    const item = document.createElement('li');
    item.textContent = error;
    return item;
  }));
  const report = [`📋 ${results.length} líneas → ${contacts.length} correctas, ${errors.length} con errores`, ...errors.map((error) => `❌ ${error}`)].join('\n');
  if (report !== lastReport) report.split('\n').forEach(logLine); // solo si algo cambió
  lastReport = report;
  return contacts;
}

validate();
document.querySelector('#check').addEventListener('click', () => {
  validate();
  if (!textarea.checkValidity()) textarea.focus();
});
// Premiar pronto: con errores a la vista, se revisa en cada cambio.
textarea.addEventListener('input', () => {
  if (textarea.getAttribute('aria-invalid') === 'true') validate();
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const contacts = validate();
  if (!textarea.checkValidity()) {
    textarea.focus();
    return;
  }
  logLine(`📨 importados ${contacts.length} socios: ${contacts.map((contact) => contact.name).join(', ')}`);
});
logLine('Listo: corrige la línea 2 (bruno@huerta.mx) y la 4 (33 1111 2222); luego pulsa «Importar»');
```

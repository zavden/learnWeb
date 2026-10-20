---
example_description: "Un formulario de contacto con un resumen de errores arriba, al estilo de los servicios públicos: al enviar con errores aparece una lista de enlaces a cada campo, recibe el foco y el título de la pestaña empieza por «Error:»; cada enlace lleva al campo (también a un grupo de radios), los mensajes se repiten junto a cada campo y el resumen se actualiza al corregir"
example_tags: "javascript|formularios|profesional|resumen-de-errores|accesibilidad|validacion|novalidate|foco"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí los formularios no se envían: ábrelo con «▶ Run» o en el editor.</p>
  <section id="error-summary" class="error-summary" tabindex="-1" aria-labelledby="error-summary-title" hidden>
    <h2 id="error-summary-title">Hay un problema</h2>
    <ul id="error-list"></ul>
  </section>
  <h1>Escríbenos · Museo Textil de Oaxaca</h1>
  <form id="contact" action="/contacto" method="post" novalidate>
    <div class="field">
      <label for="visitor">Nombre</label>
      <p id="visitor-error" class="error"></p>
      <input id="visitor" name="visitor" required autocomplete="name" aria-describedby="visitor-error">
    </div>
    <div class="field">
      <label for="email">Correo</label>
      <p id="email-error" class="error"></p>
      <input id="email" name="email" type="email" required autocomplete="email" aria-describedby="email-error">
    </div>
    <fieldset class="field" role="radiogroup" aria-describedby="topic-error">
      <legend>Tema</legend>
      <p id="topic-error" class="error"></p>
      <label class="choice"><input id="topic-visit" type="radio" name="topic" value="visit" required> Visitas guiadas</label>
      <label class="choice"><input id="topic-school" type="radio" name="topic" value="school"> Grupos escolares</label>
      <label class="choice"><input id="topic-donation" type="radio" name="topic" value="donation"> Donaciones de piezas</label>
    </fieldset>
    <div class="field">
      <label for="message">Mensaje</label>
      <p id="message-hint" class="hint">Al menos 20 caracteres.</p>
      <p id="message-error" class="error"></p>
      <textarea id="message" name="message" rows="3" required aria-describedby="message-hint message-error"></textarea>
    </div>
    <div class="field">
      <p id="consent-error" class="error"></p>
      <label class="choice"><input id="consent" type="checkbox" name="consent" required aria-describedby="consent-error"> Acepto que el museo guarde mis datos para responderme</label>
    </div>
    <button type="submit" class="primary">Enviar mensaje</button>
  </form>
  <p id="sent" role="status"></p>
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
.error-summary {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border: 4px solid var(--danger);
  background: var(--surface);
}
.error-summary h2 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
}
.error-summary ul {
  margin: 0;
  padding-left: 1.2rem;
}
.error-summary a {
  color: var(--danger);
  font-weight: 600;
}
form {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
}
.field {
  display: grid;
  gap: 0.2rem;
  margin: 0;
  padding: 0;
  border: 0;
}
legend,
.field > label {
  font-weight: 600;
}
.choice {
  display: flex;
  gap: 0.4rem;
  align-items: center;
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
  font-weight: 600;
}
.error:empty {
  display: none;
}
input,
textarea,
button {
  font: inherit;
  color: var(--ink);
}
input:not([type="radio"], [type="checkbox"]),
textarea {
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--field);
  border-radius: 0.375rem;
  background: var(--surface);
}
[aria-invalid="true"] {
  border: 2px solid var(--danger);
}
.primary {
  justify-self: start;
  padding: 0.45rem 1rem;
  border: 1px solid var(--accent);
  border-radius: 0.5rem;
  background: var(--accent);
  color: #ffffff;
  cursor: pointer;
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
// Contacto con resumen de errores.
//
// Decisiones de diseño (el patrón de los servicios públicos, como GOV.UK):
// - Al enviar con errores aparece arriba un resumen con un enlace por error, recibe el
//   foco (tabindex="-1") y el título de la pestaña empieza por «Error:»: quien usa un
//   lector de pantalla oye el problema nada más pulsar «Enviar».
// - Cada enlace lleva a su campo con el foco puesto (un enlace a un #id solo desplaza);
//   el de un grupo de radios lleva al primer radio.
// - El mismo mensaje se repite junto al campo, entre la etiqueta y el control
//   (aria-describedby), y el campo se marca con aria-invalid.
// - Al corregir, el campo y el resumen se actualizan (premiar pronto), sin anunciar nada.
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.
const form = document.querySelector('#contact');
const summary = document.querySelector('#error-summary');
const errorList = document.querySelector('#error-list');
// La vista previa no tiene <title>: le damos uno, porque sin título «Error: » se quedaría
// en «Error:» (el navegador recorta los espacios del título al leerlo).
if (!document.title) document.title = 'Escríbenos · Museo Textil de Oaxaca';
const originalTitle = document.title;
const logList = document.querySelector('#log');
let quiet = false;
let moveFocus = true;
function logLine(text) {
  if (quiet) return;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
if (window.origin === 'null') document.querySelector('#card-notice').hidden = false;

// Un «campo» puede ser un control o un grupo de radios (todos con el mismo name).
const FIELDS = [
  { name: 'visitor', target: 'visitor', missing: 'Escribe tu nombre.' },
  { name: 'email', target: 'email', missing: 'Escribe tu correo.', mismatch: 'Escribe un correo completo, como ana@ejemplo.mx.' },
  { name: 'topic', target: 'topic-visit', missing: 'Elige un tema.' },
  { name: 'message', target: 'message', missing: 'Escribe tu mensaje.', mismatch: 'Escribe al menos 20 caracteres.' },
  { name: 'consent', target: 'consent', missing: 'Acepta que guardemos tus datos para poder responderte.' },
];
const controlsOf = (field) => [...form.querySelectorAll(`[name="${field.name}"]`)];

function messageFor(field) {
  const message = form.elements.message;
  message.setCustomValidity(message.value !== '' && message.value.trim().length < 20 ? 'corto' : '');
  const validity = controlsOf(field)[0].validity; // en un grupo de radios, todos comparten estado
  if (validity.valueMissing) return field.missing;
  if (validity.typeMismatch || validity.customError) return field.mismatch;
  return '';
}
function renderField(field) {
  const message = messageFor(field);
  document.querySelector(`#${field.name}-error`).textContent = message ? `⚠ ${message}` : '';
  for (const control of controlsOf(field)) {
    if (control.type === 'radio') control.closest('fieldset').setAttribute('aria-invalid', String(message !== ''));
    else control.setAttribute('aria-invalid', String(message !== ''));
  }
  return message;
}
function renderSummary(errors) {
  errorList.replaceChildren(...errors.map(({ field, message }) => {
    const link = document.createElement('a');
    link.href = `#${field.target}`;
    link.textContent = message;
    const item = document.createElement('li');
    item.append(link);
    return item;
  }));
  summary.hidden = errors.length === 0;
  document.title = errors.length > 0 ? `Error: ${originalTitle}` : originalTitle;
}
const collectErrors = () => FIELDS.map((field) => ({ field, message: renderField(field) })).filter((error) => error.message);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const errors = collectErrors();
  renderSummary(errors);
  if (errors.length > 0) {
    if (moveFocus) summary.focus();
    logLine(`📨 submit → resumen con ${errors.length} error(es): ${errors.map((error) => error.field.name).join(', ')}`);
    return;
  }
  document.querySelector('#sent').textContent = 'Gracias: te responderemos en dos días hábiles.';
  logLine(`📨 enviado → ${JSON.stringify(Object.fromEntries(new FormData(form)))}`);
});
// Cada enlace del resumen pone el foco en su campo (y lo muestra con su etiqueta).
errorList.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  event.preventDefault();
  const control = document.getElementById(link.hash.slice(1));
  control.closest('.field').scrollIntoView({ block: 'start' });
  control.focus({ preventScroll: true });
  logLine(`🔗 del resumen al campo ${control.name}`);
});
// Premiar pronto: con el resumen a la vista, cada cambio lo actualiza.
form.addEventListener('input', () => {
  if (summary.hidden) return;
  const before = errorList.children.length;
  const errors = collectErrors();
  if (errors.length < before) logLine(`✅ corregido: quedan ${errors.length} error(es)`);
  renderSummary(errors);
});

// ── Autocomprobación (simulada; deja el formulario vacío y sin errores).
function audit() {
  quiet = true;
  moveFocus = false;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  form.dispatchEvent(new SubmitEvent('submit', { cancelable: true })); // sin burbuja
  const links = [...errorList.querySelectorAll('a')];
  expect('enviar vacío muestra el resumen con 5 enlaces', !summary.hidden && links.length === 5);
  expect('cada enlace apunta a un control que existe (el tema, al primer radio)', links.every((link) => document.getElementById(link.hash.slice(1)) !== null)
    && links[2].hash === '#topic-visit');
  expect('el título de la pestaña empieza por «Error:»', document.title.startsWith('Error: '));
  form.elements.message.value = 'Hola';
  expect('un mensaje de 4 caracteres pide al menos 20', messageFor(FIELDS[3]) === 'Escribe al menos 20 caracteres.');
  form.elements.visitor.value = 'Bruno Díaz';
  form.elements.email.value = 'bruno@ejemplo.mx';
  form.elements.topic.value = 'school';
  form.elements.message.value = '¿Pueden venir 30 alumnos de 5.º el jueves?';
  form.elements.consent.checked = true;
  form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
  expect('todo correcto: sin resumen y con el título original', summary.hidden && document.title === originalTitle);
  form.reset();
  for (const element of form.querySelectorAll('[aria-invalid]')) element.removeAttribute('aria-invalid');
  for (const error of form.querySelectorAll('.error')) error.textContent = '';
  document.querySelector('#sent').textContent = '';
  quiet = false;
  moveFocus = true;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: pulsa «Enviar mensaje» con todo vacío; usa el enlace «Elige un tema.»; completa (Ana López, ana@ejemplo.mx, un mensaje de 20 o más caracteres, la casilla) y vuelve a enviar');
```

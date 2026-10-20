---
example_description: "Un alta de cuenta con reglas de contraseña: una regex por regla para la lista visible y el medidor de fuerza (<meter>), la misma política en un pattern con lookaheads (flag v), botón para mostrar la contraseña con aria-pressed, confirmación con setCustomValidity y validación en vivo accesible"
example_tags: "javascript|formularios|profesional|contrasena|lookahead|regex|meter|validacion|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Crea tu cuenta · Mercado Artesano</h1>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí los formularios no se envían: ábrelo con «▶ Run» o en el editor.</p>
  <form id="signup" action="/cuenta" method="post" novalidate>
    <div class="field">
      <label for="display-name">Nombre</label>
      <input id="display-name" name="display_name" required autocomplete="name" aria-describedby="display-name-error">
      <p id="display-name-error" class="error"></p>
    </div>
    <div class="field">
      <label for="email">Correo</label>
      <input id="email" name="email" type="email" required autocomplete="email" aria-describedby="email-error">
      <p id="email-error" class="error"></p>
    </div>
    <div class="field">
      <label for="password">Contraseña</label>
      <div class="inline">
        <input id="password" name="password" type="password" required autocomplete="new-password" aria-describedby="password-rules password-error">
        <button type="button" id="toggle-password" aria-pressed="false" aria-controls="password">Mostrar contraseña</button>
      </div>
      <ul id="password-rules" class="rules" aria-label="Requisitos de la contraseña">
        <li data-rule="length">12 caracteres o más</li>
        <li data-rule="digit">Una cifra</li>
        <li data-rule="upper">Una mayúscula</li>
        <li data-rule="symbol">Un signo o un espacio</li>
      </ul>
      <p class="strength"><label for="strength">Fuerza</label> <meter id="strength" min="0" max="4" low="2" high="3" optimum="4" value="0"></meter> <span id="strength-text">—</span></p>
      <p id="password-error" class="error"></p>
    </div>
    <div class="field">
      <label for="password-confirm">Repite la contraseña</label>
      <input id="password-confirm" name="password_confirm" type="password" required autocomplete="new-password" aria-describedby="password-confirm-error">
      <p id="password-confirm-error" class="error"></p>
    </div>
    <button type="submit" class="primary">Crear cuenta</button>
  </form>
  <p id="summary" role="status"></p>
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
  --ok: #166534;
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
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
}
.field {
  display: grid;
  gap: 0.2rem;
}
label {
  font-weight: 600;
}
.inline {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.inline input {
  flex: 1 1 12rem;
}
.rules {
  margin: 0.25rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.9rem;
}
.rules li::before {
  content: "○ ";
}
.rules li.met {
  color: var(--ok);
}
.rules li.met::before {
  content: "✓ ";
}
.strength {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}
.error {
  margin: 0;
  font-size: 0.9rem;
  color: var(--danger);
}
input,
button {
  font: inherit;
  color: var(--ink);
}
input {
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--field);
  border-radius: 0.375rem;
  background: var(--surface);
}
input[aria-invalid="true"] {
  border: 2px solid var(--danger);
}
button {
  padding: 0.35rem 0.9rem;
  border: 1px solid var(--field);
  border-radius: 0.5rem;
  background: var(--surface);
  cursor: pointer;
}
button[aria-pressed="true"] {
  background: #e0e7ff;
}
.primary {
  justify-self: start;
  border-color: var(--accent);
  background: var(--accent);
  color: #ffffff;
}
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
#summary {
  font-weight: 600;
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
// Alta de cuenta con política de contraseñas.
//
// Decisiones de diseño:
// - Una regex por regla: la lista visible dice QUÉ falta (una sola regex solo diría
//   «no»). La misma política, en un pattern con lookaheads, alimenta validity: así
//   el formulario es inválido aunque el script de la lista fallara.
// - La lista de reglas y el medidor están en aria-describedby: se leen al llegar al
//   campo, sin anunciar cada tecla. Las marcas no dependen solo del color (○ / ✓).
// - Validación «castigar tarde, premiar pronto» con mensajes propios (novalidate).
// - «Mostrar contraseña» es un botón conmutador (aria-pressed); su texto no cambia.
// - La contraseña nunca se imprime: solo su longitud.
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.
const form = document.querySelector('#signup');
const password = form.elements.password;
const confirmation = form.elements.password_confirm;
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

const RULES = {
  length: /^.{12,}$/v,
  digit: /\d/v,
  upper: /\p{Lu}/v,
  symbol: /[^\p{L}\d]/v,
};
// La misma política en un solo patrón: cada (?=…) mira desde el principio sin avanzar.
password.pattern = String.raw`(?=.*\d)(?=.*\p{Lu})(?=.*[^\p{L}\d]).{12,}`;
const STRENGTH = ['muy débil', 'débil', 'regular', 'buena', 'fuerte'];
const NAME = /^\p{L}[\p{L}' \-]{1,59}$/v;
const MESSAGES = {
  display_name: { valueMissing: 'Escribe tu nombre.', customError: 'Usa letras, espacios, guiones o apóstrofo.' },
  email: { valueMissing: 'Escribe tu correo.', typeMismatch: 'Escribe un correo completo, como ana@ejemplo.mx.' },
  password: { valueMissing: 'Elige una contraseña.', patternMismatch: 'Aún no cumple todos los requisitos de la lista.' },
  password_confirm: { valueMissing: 'Repite la contraseña.', customError: 'Las dos contraseñas no coinciden.' },
};

function passwordReport(value) {
  const met = Object.keys(RULES).filter((rule) => RULES[rule].test(value));
  return { met, score: met.length, label: STRENGTH[met.length] };
}
function updatePasswordUi() {
  const { met, score, label } = passwordReport(password.value);
  for (const item of document.querySelectorAll('#password-rules li')) {
    item.classList.toggle('met', met.includes(item.dataset.rule));
  }
  document.querySelector('#strength').value = score;
  document.querySelector('#strength-text').textContent = password.value ? label : '—';
}
function applyCustomRules() {
  const nameField = form.elements.display_name;
  nameField.setCustomValidity(nameField.value === '' || NAME.test(nameField.value.trim()) ? '' : 'nombre');
  const mismatch = confirmation.value !== '' && confirmation.value !== password.value;
  confirmation.setCustomValidity(mismatch ? 'distintas' : '');
}
function messageFor(field) {
  const texts = MESSAGES[field.name];
  const reason = ['valueMissing', 'customError', 'typeMismatch', 'patternMismatch'].find((flag) => field.validity[flag]);
  return reason ? texts[reason] : '';
}
function render(field, why) {
  applyCustomRules();
  const message = messageFor(field);
  const wasInvalid = field.getAttribute('aria-invalid') === 'true';
  field.setAttribute('aria-invalid', String(message !== ''));
  document.querySelector(`#${field.id}-error`).textContent = message ? `⚠ ${message}` : '';
  if (message && !wasInvalid) logLine(`❌ ${field.name} · ${why} → «${message}»`);
  if (!message && wasInvalid) logLine(`✅ ${field.name} · ${why} → corregido`);
  return message;
}

form.addEventListener('input', (event) => {
  if (event.target === password) {
    updatePasswordUi();
    if (confirmation.getAttribute('aria-invalid') === 'true') render(confirmation, 'en vivo');
  }
  if (event.target.getAttribute('aria-invalid') === 'true') render(event.target, 'en vivo');
});
form.addEventListener('focusout', (event) => {
  if (event.target.matches('input') && event.target.value !== '') render(event.target, 'al salir');
});
document.querySelector('#toggle-password').addEventListener('click', (event) => {
  const show = password.type === 'password';
  password.type = show ? 'text' : 'password';
  event.currentTarget.setAttribute('aria-pressed', String(show));
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const invalid = [...form.querySelectorAll('input')].filter((field) => render(field, 'al enviar'));
  const summary = document.querySelector('#summary');
  if (invalid.length > 0) {
    summary.textContent = `Revisa ${invalid.length} campo(s).`;
    if (moveFocus) invalid[0].focus();
    logLine(`📨 submit → 📢 «${summary.textContent}»`);
    return;
  }
  summary.textContent = `¡Listo, ${form.elements.display_name.value}! Revisa tu correo para activar la cuenta.`;
  logLine(`📨 cuenta para ${form.elements.email.value} · contraseña de ${password.value.length} caracteres (no se imprime)`);
});

// ── Autocomprobación (simulada; deja el formulario vacío).
function audit() {
  quiet = true;
  moveFocus = false;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  const samples = ['corta1A!', 'tomates-en-octubre', 'Tomates-en-octubre1', 'TOMATES EN OCTUBRE 7', 'Ñandú del sur 2026', 'abcdefghijkl'];
  expect('«tomates-en-octubre» cumple 2 de 4 reglas (regular)', passwordReport('tomates-en-octubre').label === 'regular');
  expect('«Tomates-en-octubre1» cumple las 4 (fuerte)', passwordReport('Tomates-en-octubre1').score === 4);
  expect('el pattern con lookaheads coincide con las 4 reglas en 6 ejemplos', samples.every((value) => {
    password.value = value;
    return password.validity.patternMismatch === (passwordReport(value).score < 4);
  }));
  password.value = 'Tomates-en-octubre1';
  confirmation.value = 'Tomates-en-octubre';
  applyCustomRules();
  const mismatch = confirmation.validity.customError;
  confirmation.value = 'Tomates-en-octubre1';
  applyCustomRules();
  expect('la confirmación distinta es un customError y deja de serlo al coincidir', mismatch && confirmation.validity.valid);
  const toggle = document.querySelector('#toggle-password');
  toggle.click();
  const shown = password.type === 'text' && toggle.getAttribute('aria-pressed') === 'true';
  toggle.click();
  expect('«Mostrar contraseña» alterna el tipo y aria-pressed', shown && password.type === 'password');
  form.reset();
  form.dispatchEvent(new SubmitEvent('submit', { cancelable: true })); // sin burbuja
  expect('enviar vacío marca 4 campos', form.querySelectorAll('[aria-invalid="true"]').length === 4);
  form.reset();
  for (const field of form.querySelectorAll('input')) {
    field.removeAttribute('aria-invalid');
    document.querySelector(`#${field.id}-error`).textContent = '';
  }
  applyCustomRules();
  updatePasswordUi();
  document.querySelector('#summary').textContent = '';
  quiet = false;
  moveFocus = true;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: escribe tu nombre y correo; teclea una contraseña y mira la lista y el medidor; repítela y pulsa «Crear cuenta»');
```

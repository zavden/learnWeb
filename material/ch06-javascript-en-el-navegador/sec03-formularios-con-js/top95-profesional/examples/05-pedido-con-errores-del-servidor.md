---
example_description: "Un pedido que se envía con fetch (adelanto) como FormData al servidor de pruebas: validación propia antes de enviar, estado pendiente (fieldset disabled, aria-busy, role=status), y una respuesta 422 cuyos errores por campo se convierten en setCustomValidity + mensaje + aria-invalid, con el foco en el primero; cada error del servidor se quita en cuanto se edita su campo"
example_tags: "javascript|formularios|profesional|fetch|formdata|422|errores-del-servidor|accesibilidad|setcustomvalidity"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Tu pedido · Tostaduría La Ceiba</h1>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí los formularios no se envían: ábrelo con «▶ Run» o en el editor.</p>
  <form id="order" action="/pedidos" method="post" novalidate>
    <fieldset id="fields">
      <legend>Pedido y entrega</legend>
      <div class="field">
        <label for="product">Producto</label>
        <select id="product" name="product">
          <option value="CAF-500" selected>Café de Chiapas 500 g ($210)</option>
          <option value="CAC-250">Cacao de Tabasco 250 g ($145)</option>
        </select>
      </div>
      <div class="field">
        <label for="quantity">Cantidad</label>
        <input id="quantity" name="quantity" type="number" required min="1" max="20" value="5" aria-describedby="quantity-error">
        <p id="quantity-error" class="error"></p>
      </div>
      <div class="field">
        <label for="email">Correo</label>
        <input id="email" name="email" type="email" required value="lucia@ejemplo.mx" autocomplete="email" aria-describedby="email-error">
        <p id="email-error" class="error"></p>
      </div>
      <div class="field">
        <label for="postal-code">Código postal</label>
        <input id="postal-code" name="postal_code" required pattern="\d{5}" inputmode="numeric" value="97000" autocomplete="postal-code" aria-describedby="postal-code-error">
        <p id="postal-code-error" class="error"></p>
      </div>
      <button type="submit" class="primary">Hacer pedido</button>
    </fieldset>
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
  max-width: 32rem;
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
fieldset {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
}
legend {
  font-weight: 700;
}
.field {
  display: grid;
  gap: 0.2rem;
}
label {
  font-weight: 600;
}
.error {
  margin: 0;
  font-size: 0.9rem;
  color: var(--danger);
}
input,
select,
button {
  font: inherit;
  color: var(--ink);
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--field);
  border-radius: 0.375rem;
  background: var(--surface);
}
input[aria-invalid="true"] {
  border: 2px solid var(--danger);
}
.primary {
  justify-self: start;
  padding: 0.45rem 1rem;
  border-color: var(--accent);
  background: var(--accent);
  color: #ffffff;
  cursor: pointer;
}
fieldset:disabled .primary {
  cursor: progress;
  opacity: 0.75;
}
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
#status {
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
// Pedido con errores del servidor.
//
// Decisiones de diseño:
// - Antes de enviar, la validación propia (novalidate + validity): no se molesta al
//   servidor con lo que el navegador ya sabe que está mal.
// - Hay reglas que solo conoce el servidor (existencias, zona de reparto). Su
//   respuesta 422 trae un error por campo: { quantity: '…' }. Cada uno se convierte en
//   setCustomValidity + mensaje junto al campo + aria-invalid, y el foco va al primero.
// - Un error del servidor se quita en cuanto se edita su campo (premiar pronto):
//   el servidor volverá a opinar en el próximo envío.
// - Mientras la petición está en camino: <fieldset disabled> (nada de dobles envíos),
//   aria-busy y un estado en role="status"; al terminar, se devuelve el foco.
// - El servidor de pruebas de LearnWeb solo devuelve lo que recibe: las reglas «del
//   servidor» se simulan en serverRules con los datos que devolvió.
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo;
// fetch es un adelanto del módulo «Red y almacenamiento».
const form = document.querySelector('#order');
const fields = document.querySelector('#fields');
const statusLine = document.querySelector('#status');
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

const STOCK = { 'CAF-500': 3, 'CAC-250': 10 };
// Simula la validación del servidor de verdad (aquí, con lo que devolvió el de pruebas).
function serverRules(data) {
  const errors = {};
  if (Number(data.quantity) > STOCK[data.product]) errors.quantity = `Solo quedan ${STOCK[data.product]} unidades de ese producto.`;
  const zip = Number(data.postal_code);
  if (!(zip >= 1000 && zip <= 16999)) errors.postal_code = 'Por ahora solo repartimos en la Ciudad de México (01000 a 16999).';
  return errors;
}

const CLIENT = {
  quantity: { valueMissing: 'Indica cuántas unidades.', rangeUnderflow: 'Al menos 1.', rangeOverflow: 'Como máximo 20 por pedido.', badInput: 'Escribe un número.' },
  email: { valueMissing: 'Escribe tu correo.', typeMismatch: 'Escribe un correo completo, como ana@ejemplo.mx.' },
  postal_code: { valueMissing: 'Escribe el código postal.', patternMismatch: 'Escribe 5 cifras.' },
};
function messageFor(field) {
  if (field.validity.customError) return field.validationMessage; // el texto del servidor
  const reason = Object.keys(CLIENT[field.name]).find((flag) => field.validity[flag]);
  return reason ? CLIENT[field.name][reason] : '';
}
function render(field, why) {
  const message = messageFor(field);
  const wasInvalid = field.getAttribute('aria-invalid') === 'true';
  field.setAttribute('aria-invalid', String(message !== ''));
  document.querySelector(`#${field.id}-error`).textContent = message ? `⚠ ${message}` : '';
  if (message && !wasInvalid) logLine(`❌ ${field.name} · ${why} → «${message}»`);
  if (!message && wasInvalid) logLine(`✅ ${field.name} · ${why} → corregido`);
  return message;
}
const checkedFields = () => [...form.querySelectorAll('input')];
function applyServerErrors(errors) {
  const invalid = Object.entries(errors).map(([name, message]) => {
    const field = form.elements[name];
    field.setCustomValidity(message);
    render(field, 'servidor');
    return field;
  });
  if (invalid.length > 0 && moveFocus) invalid[0].focus();
  return invalid;
}
function setPending(pending) {
  fields.disabled = pending;
  if (pending) form.setAttribute('aria-busy', 'true');
  else form.removeAttribute('aria-busy');
  if (pending) statusLine.textContent = 'Enviando tu pedido…';
}

form.addEventListener('input', (event) => {
  const field = event.target;
  if (field.validity.customError) field.setCustomValidity(''); // el error del servidor caduca al editar
  if (field.getAttribute('aria-invalid') === 'true') render(field, 'en vivo');
});
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const invalid = checkedFields().filter((field) => render(field, 'al enviar'));
  if (invalid.length > 0) {
    statusLine.textContent = `Revisa ${invalid.length} campo(s).`;
    if (moveFocus) invalid[0].focus();
    return;
  }
  const formData = new FormData(form);
  const status = Object.keys(serverRules(Object.fromEntries(formData))).length > 0 ? 422 : 200;
  setPending(true);
  logLine('📤 enviando… (formulario desactivado)');
  try {
    const response = await fetch(`/api/demo/echo?status=${status}&delay=700`, { method: 'POST', body: formData });
    const echo = await response.json();
    if (response.status === 422) {
      const errors = serverRules(echo.body);
      logLine(`📥 422 → ${Object.keys(errors).length} error(es) del servidor`);
      setPending(false);
      const fieldsWithErrors = applyServerErrors(errors);
      statusLine.textContent = `El pedido no se pudo hacer: revisa ${fieldsWithErrors.length} campo(s).`;
      logLine(`🎯 foco en ${document.activeElement.name}`);
      return;
    }
    setPending(false);
    statusLine.textContent = '¡Pedido recibido! Te escribiremos al confirmarlo.';
    logLine(`📥 ${response.status} → ✅ pedido recibido: ${echo.body.quantity} × ${echo.body.product} para ${echo.body.postal_code}`);
    event.submitter?.focus();
  } catch (error) {
    setPending(false);
    statusLine.textContent = 'No hay conexión. Tu pedido no se envió; inténtalo de nuevo.';
    logLine(`⚠️ ${error.name}: ${error.message}`);
  }
});

// ── Autocomprobación (simulada, sin red; deja el formulario como estaba).
function audit() {
  quiet = true;
  moveFocus = false;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  const errors = serverRules(Object.fromEntries(new FormData(form)));
  expect('5 cafés y el CP 97000: el «servidor» rechaza la cantidad y el código postal', JSON.stringify(Object.keys(errors)) === '["quantity","postal_code"]');
  applyServerErrors(errors);
  const quantity = form.elements.quantity;
  expect('cada error del servidor queda en su campo (customError, aria-invalid, mensaje)', quantity.validity.customError
    && quantity.getAttribute('aria-invalid') === 'true' && document.querySelector('#quantity-error').textContent.includes('Solo quedan 3'));
  quantity.value = '3';
  quantity.dispatchEvent(new Event('input', { bubbles: true }));
  expect('al editar el campo, su error del servidor desaparece', quantity.validity.valid && quantity.getAttribute('aria-invalid') === 'false');
  setPending(true);
  const pending = fields.disabled && form.hasAttribute('aria-busy');
  setPending(false);
  expect('mientras se envía: fieldset desactivado y aria-busy', pending && !fields.disabled && !form.hasAttribute('aria-busy'));
  form.elements.email.value = '';
  expect('un correo vacío se detiene antes de enviar', render(form.elements.email, 'al enviar') === 'Escribe tu correo.');
  form.reset();
  for (const field of checkedFields()) {
    field.setCustomValidity('');
    field.removeAttribute('aria-invalid');
    document.querySelector(`#${field.id}-error`).textContent = '';
  }
  statusLine.textContent = '';
  quiet = false;
  moveFocus = true;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: pulsa «Hacer pedido» (5 cafés al CP 97000); corrige la cantidad (3) y el código postal (06700) y vuelve a pulsar');
```

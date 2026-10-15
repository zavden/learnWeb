---
example_description: "Un asistente de suscripción en cuatro pasos dentro de un solo formulario: Enter o «Siguiente» envían (submit + preventDefault), cada paso se valida por separado (novalidate + checkValidity), un evento cancelable wizard:beforenext permite vetar el avance (zona de reparto), wizard:step y wizard:complete avisan del progreso y el foco va al título de cada paso"
example_tags: "javascript|eventos|profesional|asistente|formularios|submit|customevent|validacion|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="wizard-page">
  <h1>Suscripción de café</h1>
  <ol class="progress" id="progress" aria-label="Pasos">
    <li aria-current="step">Café</li>
    <li>Envío</li>
    <li>Pago</li>
    <li>Confirmar</li>
  </ol>
  <form id="wizard" class="wizard" action="/suscripcion" novalidate>
    <fieldset data-step="1">
      <h2 tabindex="-1">1. Tu café</h2>
      <p class="choice" role="radiogroup" aria-label="Molienda">
        <label><input type="radio" name="grind" value="grano" required> En grano</label>
        <label><input type="radio" name="grind" value="molido" required> Molido para cafetera</label>
      </p>
      <label>Cada cuánto
        <select name="frequency" required>
          <option value="">Elige…</option>
          <option value="semanal">Cada semana</option>
          <option value="quincenal">Cada 15 días</option>
          <option value="mensual">Cada mes</option>
        </select>
      </label>
    </fieldset>
    <fieldset data-step="2" hidden>
      <h2 tabindex="-1">2. Envío</h2>
      <label>Nombre <input name="name" required autocomplete="name"></label>
      <label>Calle y número <input name="street" required autocomplete="street-address"></label>
      <label>Código postal <input name="zip" required inputmode="numeric" pattern="[0-9]{5}" autocomplete="postal-code" aria-describedby="zip-help"></label>
      <p id="zip-help" class="help">5 dígitos. Repartimos en la Ciudad de México y alrededores.</p>
    </fieldset>
    <fieldset data-step="3" hidden>
      <h2 tabindex="-1">3. Pago</h2>
      <label>Titular de la tarjeta <input name="holder" required autocomplete="cc-name"></label>
      <label class="inline"><input type="checkbox" name="terms" value="sí" required> Acepto las condiciones de la suscripción</label>
    </fieldset>
    <fieldset data-step="4" hidden>
      <h2 tabindex="-1">4. Revisa y confirma</h2>
      <dl id="summary" class="summary"></dl>
    </fieldset>
    <p id="wizard-message" class="message" role="alert"></p>
    <p class="nav">
      <button type="button" id="back" hidden>Atrás</button>
      <button type="submit" id="next" class="primary">Siguiente</button>
    </p>
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
  --surface: #ffffff;
  --page: #f5f7fa;
  --accent: #1d4ed8;
  --accent-soft: #dbeafe;
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
.wizard-page {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin-top: 0;
}
h2 {
  font-size: 1.05rem;
  margin: 0 0 0.5rem;
}
.progress {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.5rem;
  padding-left: 1.25rem;
  color: var(--muted);
}
.progress [aria-current="step"] {
  color: var(--accent);
  font-weight: 700;
}
.wizard {
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
}
fieldset {
  display: grid;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  border: 0;
}
fieldset[hidden] {
  display: none;
}
label {
  display: grid;
  gap: 0.2rem;
}
.choice label,
label.inline {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
input:not([type="radio"], [type="checkbox"]),
select {
  font: inherit;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--muted);
  border-radius: 0.375rem;
}
.help {
  margin: 0;
  color: var(--muted);
  font-size: 0.85rem;
}
.summary {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1rem;
  margin: 0;
}
.summary dd {
  margin: 0;
}
.message {
  min-height: 1.5em;
  color: var(--danger);
  font-weight: 600;
}
.nav {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin: 0;
}
button {
  font: inherit;
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--muted);
  border-radius: 0.4rem;
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
}
button.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: #ffffff;
}
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.log {
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
// Asistente por pasos en un solo formulario.
//
// Decisiones de diseño:
// - Un único <form> con un <fieldset> por paso. «Siguiente» es un botón de
//   envío: así Enter en cualquier campo también avanza, y el código escucha
//   UN evento, submit, que cancela en su primera línea.
// - novalidate: la validación nativa del envío comprobaría también los pasos
//   ocultos (y no podría señalar un campo que no se ve). Cada paso se valida
//   solo con checkValidity(), y reportValidity() muestra el primer error.
// - Antes de avanzar, el asistente pregunta con un evento cancelable,
//   wizard:beforenext; aquí, la comprobación de la zona de reparto lo usa para
//   vetar códigos postales fuera de la ciudad. Después avisa con wizard:step,
//   y al confirmar, con wizard:complete y los datos (FormData).
// - Al cambiar de paso, el foco va a su título (h2 con tabindex="-1"), para que
//   el lector de pantalla lo anuncie; el progreso usa aria-current="step".
// - La autocomprobación recorre el asistente con envíos simulados sin mover el
//   foco ni mostrar burbujas de error (moveFocus = false).
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM y este módulo.

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

const labels = { grind: 'Molienda', frequency: 'Frecuencia', name: 'Nombre', street: 'Calle', zip: 'Código postal', holder: 'Titular', terms: 'Condiciones' };

function createWizard(form) {
  const steps = [...form.querySelectorAll('[data-step]')];
  const progress = [...document.querySelectorAll('#progress li')];
  const message = form.querySelector('#wizard-message');
  const backButton = form.querySelector('#back');
  const nextButton = form.querySelector('#next');
  let current = 0;

  function show(index, source) {
    current = index;
    steps.forEach((step, i) => { step.hidden = i !== current; });
    progress.forEach((item, i) => {
      if (i === current) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    backButton.hidden = current === 0;
    nextButton.textContent = current === steps.length - 1 ? 'Confirmar suscripción' : 'Siguiente';
    message.textContent = '';
    if (current === steps.length - 1) renderSummary();
    if (moveFocus) steps[current].querySelector('h2').focus();
    form.dispatchEvent(new CustomEvent('wizard:step', { bubbles: true, detail: { step: current + 1, source } }));
  }
  function renderSummary() {
    const rows = [...new FormData(form)].filter(([name]) => name in labels).flatMap(([name, value]) => {
      const term = document.createElement('dt');
      term.textContent = labels[name];
      const definition = document.createElement('dd');
      definition.textContent = value; // lo que escribió el usuario, como texto
      return [term, definition];
    });
    form.querySelector('#summary').replaceChildren(...rows);
  }
  function validStep() {
    const fields = [...steps[current].querySelectorAll('input, select')];
    const firstInvalid = fields.find((field) => !field.checkValidity());
    if (!firstInvalid) return true;
    message.textContent = 'Revisa los campos marcados de este paso.';
    if (moveFocus) firstInvalid.reportValidity(); // la burbuja nativa y el foco en el campo
    return false;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // nunca se envía de verdad: lo gestiona el asistente
    if (!validStep()) return;
    const data = Object.fromEntries(new FormData(form));
    if (current === steps.length - 1) {
      form.dispatchEvent(new CustomEvent('wizard:complete', { bubbles: true, detail: data }));
      return;
    }
    const allowed = form.dispatchEvent(new CustomEvent('wizard:beforenext', {
      bubbles: true,
      cancelable: true,
      detail: { step: current + 1, data },
    }));
    if (allowed) show(current + 1, 'siguiente');
  });
  backButton.addEventListener('click', () => show(current - 1, 'atrás'));
  return { get step() { return current + 1; }, show, message };
}

const wizard = createWizard(document.querySelector('#wizard'));

// La zona de reparto: veta el paso 2 si el código postal está fuera.
document.addEventListener('wizard:beforenext', (event) => {
  const { step, data } = event.detail;
  if (step !== 2) return;
  const zip = Number(data.zip);
  if (zip >= 1000 && zip <= 16999) return; // la Ciudad de México
  event.preventDefault();
  wizard.message.textContent = `Todavía no repartimos en el código postal ${data.zip}.`;
  logLine(`⛔ paso 2 vetado: código postal ${data.zip} fuera de la zona`);
  if (moveFocus) document.querySelector('[name="zip"]').focus();
});
document.addEventListener('wizard:step', (event) => logLine(`➡️ paso ${event.detail.step} (${event.detail.source})`));
document.addEventListener('wizard:complete', (event) => {
  const { grind, frequency, zip } = event.detail;
  wizard.message.textContent = '';
  logLine(`✅ suscripción confirmada: café ${grind}, ${frequency}, envío a ${zip}`);
});

// ── Autocomprobación (envíos simulados; deja el asistente vacío en el paso 1).
function audit() {
  quiet = true;
  moveFocus = false;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  const form = document.querySelector('#wizard');
  const submit = () => form.dispatchEvent(new SubmitEvent('submit', { cancelable: true })); // sin burbuja: no llega a window
  submit();
  expect('el paso 1 vacío no avanza', wizard.step === 1 && wizard.message.textContent !== '');
  form.elements.grind[1].checked = true;
  form.elements.frequency.value = 'quincenal';
  submit();
  expect('con molienda y frecuencia, pasa al 2 y marca el progreso', wizard.step === 2
    && document.querySelector('#progress [aria-current="step"]').textContent === 'Envío');
  form.elements.name.value = 'Lucía Méndez';
  form.elements.street.value = 'Av. Juárez 120';
  form.elements.zip.value = '97000';
  submit();
  expect('un código postal fuera de la zona veta el avance (wizard:beforenext)', wizard.step === 2
    && wizard.message.textContent.includes('97000'));
  form.elements.zip.value = '06000';
  submit();
  expect('con 06000, pasa al paso 3', wizard.step === 3);
  document.querySelector('#back').click();
  expect('«Atrás» vuelve al 2 conservando lo escrito', wizard.step === 2 && form.elements.zip.value === '06000');
  submit();
  form.elements.holder.value = 'Lucía Méndez';
  form.elements.terms.checked = true;
  submit();
  expect('el resumen muestra los datos como texto', wizard.step === 4
    && document.querySelector('#summary').textContent.includes('quincenal'));
  let completed = null;
  document.addEventListener('wizard:complete', (event) => { completed = event.detail; }, { once: true });
  submit();
  expect('confirmar avisa con wizard:complete y los datos', completed?.zip === '06000' && completed?.grind === 'molido');
  form.reset();
  wizard.show(0, 'inicio');
  moveFocus = true;
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: elige café y frecuencia y pulsa Enter o «Siguiente»; prueba el código postal 97000 y luego 06000');
```

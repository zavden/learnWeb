---
example_description: "Una reserva con validación en vivo accesible: novalidate y mensajes propios por indicador de validity, una regla con regex Unicode (\\p{L}) vía setCustomValidity, el teléfono limpiado en input, castigar tarde y premiar pronto, foco al primer error y el envío con tipos (valueAsNumber)"
example_tags: "javascript|formularios|integracion|validacion|regex|accesibilidad|setcustomvalidity"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Reserva en la Fonda Doña Lupe</h1>
  <p class="intro">Reservas para noviembre, de 13:00 a 22:00, cada media hora.</p>
  <form id="booking" action="/reservas" method="post" novalidate>
    <div class="field">
      <label for="customer">Nombre</label>
      <input id="customer" name="customer" required value="Lucía Méndez" autocomplete="name" aria-describedby="customer-error">
      <p id="customer-error" class="error"></p>
    </div>
    <div class="field">
      <label for="phone">Teléfono (10 cifras)</label>
      <input id="phone" name="phone" inputmode="numeric" required pattern="\d{10}" autocomplete="tel-national" aria-describedby="phone-error">
      <p id="phone-error" class="error"></p>
    </div>
    <div class="row">
      <div class="field">
        <label for="date">Día</label>
        <input id="date" name="date" type="date" required min="2026-11-01" max="2026-11-30" value="2026-11-20" aria-describedby="date-error">
        <p id="date-error" class="error"></p>
      </div>
      <div class="field">
        <label for="time">Hora</label>
        <input id="time" name="time" type="time" required min="13:00" max="22:00" step="1800" value="13:15" aria-describedby="time-error">
        <p id="time-error" class="error"></p>
      </div>
      <div class="field">
        <label for="guests">Personas</label>
        <input id="guests" name="guests" type="number" required min="1" max="12" value="4" aria-describedby="guests-error">
        <p id="guests-error" class="error"></p>
      </div>
    </div>
    <button type="submit">Reservar</button>
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
  --page: #f5f7fa;
  --danger: #b91c1c;
  --focus: #1d4ed8;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--ink);
  background: var(--page);
}
main {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0;
}
.intro {
  color: var(--muted);
}
form {
  padding: 0.75rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: #ffffff;
}
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 0 1rem;
}
.field {
  display: grid;
  align-content: start;
  gap: 0.2rem;
  margin-bottom: 0.5rem;
}
label {
  font-weight: 600;
}
.error {
  min-height: 1.2em;
  margin: 0;
  font-size: 0.9rem;
  color: var(--danger);
}
input,
button {
  font: inherit;
  color: var(--ink);
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--field);
  border-radius: 0.375rem;
  background: #ffffff;
}
input[aria-invalid="true"] {
  border: 2px solid var(--danger);
}
button {
  cursor: pointer;
}
:focus-visible {
  outline: 3px solid var(--focus);
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
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
// Combina: «Leer y escribir controles» (valueAsNumber, limpiar en input), «Validación
// con JavaScript» (validity, setCustomValidity, novalidate, castigar tarde y premiar
// pronto) y «Expresiones regulares» (\p{L} con el flag v, \D).
const form = document.querySelector('#booking');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

const HOURS = 'Abrimos de 13:00 a 22:00.';
const NOVEMBER = 'Solo aceptamos reservas de noviembre.';
const MESSAGES = {
  customer: { valueMissing: 'Escribe tu nombre.', customError: 'Usa solo letras, espacios, guiones o apóstrofo.' },
  phone: { valueMissing: 'Escribe un teléfono para confirmarte la mesa.', patternMismatch: 'Escribe las 10 cifras del teléfono.' },
  date: { valueMissing: 'Elige el día.', rangeUnderflow: NOVEMBER, rangeOverflow: NOVEMBER },
  time: { valueMissing: 'Elige la hora.', rangeUnderflow: HOURS, rangeOverflow: HOURS, stepMismatch: 'Reservamos cada media hora (13:00, 13:30…).' },
  guests: { valueMissing: 'Indica cuántas personas.', rangeUnderflow: 'De 1 a 12 personas.', rangeOverflow: 'De 1 a 12 personas.', badInput: 'Escribe un número.' },
};
const REASONS = ['valueMissing', 'customError', 'badInput', 'typeMismatch', 'patternMismatch', 'rangeUnderflow', 'rangeOverflow', 'stepMismatch'];

// Regla propia: un nombre de personas reales, con tildes y ñ (\w no serviría).
const NAME = /^\p{L}[\p{L}' \-]{1,59}$/v;
function applyCustomRules(field) {
  if (field.name === 'customer') {
    field.setCustomValidity(field.value === '' || NAME.test(field.value.trim()) ? '' : 'nombre');
  }
}
function messageFor(field) {
  const reason = REASONS.find((flag) => field.validity[flag]);
  return reason ? MESSAGES[field.name][reason] : '';
}
function render(field, why) {
  applyCustomRules(field);
  const message = messageFor(field);
  const wasInvalid = field.getAttribute('aria-invalid') === 'true';
  field.setAttribute('aria-invalid', String(message !== ''));
  document.querySelector(`#${field.id}-error`).textContent = message ? `⚠ ${message}` : '';
  if (message && !wasInvalid) logLine(`❌ ${field.name} · ${why} → «${message}»`);
  if (!message && wasInvalid) logLine(`✅ ${field.name} · ${why} → corregido`);
  return message;
}

form.addEventListener('input', (event) => {
  const field = event.target;
  // El teléfono admite cualquier formato humano: se limpia aquí (pegar, autocompletar…).
  if (field.name === 'phone' && /\D/.test(field.value)) field.value = field.value.replace(/\D/g, '');
  if (field.getAttribute('aria-invalid') === 'true') render(field, 'en vivo'); // premiar pronto
});
form.addEventListener('focusout', (event) => {
  const field = event.target;
  if (field.matches('input') && field.value !== '') render(field, 'al salir'); // castigar tarde
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = [...form.querySelectorAll('input')];
  const invalid = fields.filter((field) => render(field, 'al enviar'));
  const summary = document.querySelector('#summary');
  if (invalid.length > 0) {
    summary.textContent = `Revisa ${invalid.length} campo(s).`;
    invalid[0].focus();
    logLine(`📨 submit → 📢 «${summary.textContent}» · foco en ${document.activeElement.name}`);
    return;
  }
  // Con tipos: el número como número; el día y la hora, como los strings del campo.
  const formData = new FormData(form);
  const booking = { ...Object.fromEntries(formData), guests: form.elements.guests.valueAsNumber };
  summary.textContent = `Mesa para ${booking.guests} el ${booking.date} a las ${booking.time}. ¡Te esperamos!`;
  logLine(`📨 submit → ✅ ${JSON.stringify(booking)}`);
});
logLine('Listo: pulsa «Reservar»; luego pega 55 1234 5678 en el teléfono, cambia la hora a 13:30 y vuelve a reservar');
```

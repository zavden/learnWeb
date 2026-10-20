---
example_description: "Una dirección que se adapta al país: al cambiar el <select>, cambian la etiqueta y la pista del código postal, su pattern (comprobado antes con new RegExp(…, 'v')), su inputmode y el nombre de la región; el código se normaliza en input (mayúsculas en Argentina) y, si ya tenía valor, se revalida al momento"
example_tags: "javascript|formularios|profesional|direccion|pattern|regex|flag-v|validacion|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Dirección de envío</h1>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí los formularios no se envían: ábrelo con «▶ Run» o en el editor.</p>
  <form id="address" action="/envio" method="post" novalidate>
    <div class="field">
      <label for="country">País</label>
      <select id="country" name="country" autocomplete="country">
        <option value="MX" selected>México</option>
        <option value="ES">España</option>
        <option value="AR">Argentina</option>
        <option value="CO">Colombia</option>
        <option value="US">Estados Unidos</option>
      </select>
    </div>
    <div class="field">
      <label for="street">Calle y número</label>
      <input id="street" name="street" required autocomplete="address-line1" aria-describedby="street-error">
      <p id="street-error" class="error"></p>
    </div>
    <div class="row">
      <div class="field">
        <label for="city">Ciudad</label>
        <input id="city" name="city" required autocomplete="address-level2" aria-describedby="city-error">
        <p id="city-error" class="error"></p>
      </div>
      <div class="field">
        <label for="region" id="region-label">Estado</label>
        <input id="region" name="region" required autocomplete="address-level1" aria-describedby="region-error">
        <p id="region-error" class="error"></p>
      </div>
    </div>
    <div class="field">
      <label for="postal-code" id="postal-label">Código postal</label>
      <input id="postal-code" name="postal_code" required autocomplete="postal-code" aria-describedby="postal-code-hint postal-code-error">
      <p id="postal-code-hint" class="hint"></p>
      <p id="postal-code-error" class="error"></p>
    </div>
    <button type="submit" class="primary">Usar esta dirección</button>
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
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
}
.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0 1rem;
}
.field {
  display: grid;
  align-content: start;
  gap: 0.2rem;
}
label {
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
  min-height: 1.2em;
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
  padding: 0.4rem 0.9rem;
  border-color: var(--accent);
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
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
// Dirección de envío que depende del país.
//
// Decisiones de diseño:
// - Las reglas de cada país son datos (COUNTRIES). Al cambiar de país, el script
//   reescribe la etiqueta, la pista, el pattern, el inputmode y el nombre de la
//   región; la pista visible dice el formato con un ejemplo, no solo «inválido».
// - Antes de asignar un pattern se compila como lo hará el navegador
//   (^(?:…)$ con el flag v): un patrón inválido se ignoraría en silencio.
// - El código se normaliza en input (sin espacios; mayúsculas en Argentina) y, si
//   ya tenía valor, se revalida al cambiar de país: la regla cambió, el aviso también.
// - Mensajes propios (novalidate), aria-invalid, aria-describedby y foco al primer error.
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.
const form = document.querySelector('#address');
const postal = form.elements.postal_code;
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

const COUNTRIES = {
  MX: { postalLabel: 'Código postal', pattern: String.raw`\d{5}`, example: '06700', format: '5 cifras', region: 'Estado', mode: 'numeric' },
  ES: { postalLabel: 'Código postal', pattern: String.raw`(?:0[1-9]|[1-4]\d|5[0-2])\d{3}`, example: '28013', format: '5 cifras, de 01000 a 52999', region: 'Provincia', mode: 'numeric' },
  AR: { postalLabel: 'Código postal (CPA)', pattern: String.raw`[A-Z]\d{4}[A-Z]{3}`, example: 'C1043AAZ', format: 'una letra, 4 cifras y 3 letras', region: 'Provincia', mode: 'text' },
  CO: { postalLabel: 'Código postal', pattern: String.raw`\d{6}`, example: '110111', format: '6 cifras', region: 'Departamento', mode: 'numeric' },
  US: { postalLabel: 'Código ZIP', pattern: String.raw`\d{5}(?:-\d{4})?`, example: '94103 o 94103-1234', format: '5 cifras, o 5 + guion + 4', region: 'Estado', mode: 'numeric' },
};
const REQUIRED = { street: 'Escribe la calle y el número.', city: 'Escribe la ciudad.', region: 'Escribe el estado, la provincia o el departamento.', postal_code: 'Escribe el código postal.' };

const currentRules = () => COUNTRIES[form.elements.country.value];
function applyCountry() {
  const rules = currentRules();
  try {
    new RegExp(`^(?:${rules.pattern})$`, 'v'); // como lo compila el navegador
    postal.pattern = rules.pattern;
  } catch (error) {
    postal.removeAttribute('pattern');
    console.warn(`⚠️ patrón descartado: ${error.message}`);
  }
  postal.inputMode = rules.mode;
  document.querySelector('#postal-label').textContent = rules.postalLabel;
  document.querySelector('#region-label').textContent = rules.region;
  document.querySelector('#postal-code-hint').textContent = `Formato: ${rules.format}. Por ejemplo, ${rules.example}.`;
}
function normalizePostal() {
  const clean = postal.value.replace(/\s+/g, '');
  const value = form.elements.country.value === 'AR' ? clean.toUpperCase() : clean;
  if (value !== postal.value) postal.value = value;
}
function messageFor(field) {
  if (field.validity.valueMissing) return REQUIRED[field.name];
  if (field.validity.patternMismatch) return `Revisa el formato: ${currentRules().format} (por ejemplo, ${currentRules().example}).`;
  return '';
}
function render(field, why) {
  const message = messageFor(field);
  const errorLine = document.querySelector(`#${field.id}-error`);
  const previous = errorLine.textContent;
  const text = message ? `⚠ ${message}` : '';
  field.setAttribute('aria-invalid', String(message !== ''));
  errorLine.textContent = text;
  // Se registra cuando aparece o cambia un error (otro país, otra regla) y cuando se va.
  if (message && text !== previous) logLine(`❌ ${field.name} · ${why} → «${message}»`);
  if (!message && previous) logLine(`✅ ${field.name} · ${why} → corregido`);
  return message;
}

form.elements.country.addEventListener('change', () => {
  applyCountry();
  normalizePostal();
  logLine(`🌎 ${form.elements.country.selectedOptions[0].text}: ${currentRules().postalLabel} → ${currentRules().format}`);
  if (postal.value !== '') render(postal, 'al cambiar de país');
});
form.addEventListener('input', (event) => {
  if (event.target === postal) normalizePostal();
  if (event.target.getAttribute('aria-invalid') === 'true') render(event.target, 'en vivo');
});
form.addEventListener('focusout', (event) => {
  if (event.target.matches('input') && event.target.value !== '') render(event.target, 'al salir');
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const invalid = [...form.querySelectorAll('input')].filter((field) => render(field, 'al enviar'));
  if (invalid.length > 0) {
    if (moveFocus) invalid[0].focus();
    logLine(`📨 submit → ${invalid.length} campo(s) por corregir`);
    return;
  }
  logLine(`📨 dirección → ${JSON.stringify(Object.fromEntries(new FormData(form)))}`);
});

// ── Autocomprobación (simulada; deja México y el formulario vacío).
function audit() {
  quiet = true;
  moveFocus = false;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  const accepts = (country, value) => {
    form.elements.country.value = country;
    applyCountry();
    postal.value = value;
    normalizePostal();
    return !postal.validity.patternMismatch;
  };
  expect('los 5 patrones compilan con el flag v', Object.values(COUNTRIES).every((rules) => {
    try { new RegExp(`^(?:${rules.pattern})$`, 'v'); return true; } catch { return false; }
  }));
  expect('México: 06700 sí, 6700 no', accepts('MX', '06700') && !accepts('MX', '6700'));
  expect('España: 28013 sí, 53001 no', accepts('ES', '28013') && !accepts('ES', '53001'));
  expect('Argentina: «c1043 aaz» se normaliza a C1043AAZ y vale', accepts('AR', 'c1043 aaz') && postal.value === 'C1043AAZ');
  expect('Estados Unidos: 94103-1234 sí; Colombia: 06700 no', accepts('US', '94103-1234') && !accepts('CO', '06700'));
  expect('Colombia cambia la región a «Departamento»', document.querySelector('#region-label').textContent === 'Departamento');
  form.reset();
  applyCountry();
  quiet = false;
  moveFocus = true;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
applyCountry();
audit();
logLine('Listo: escribe 6700 en el código postal y sal del campo; cambia el país a Argentina y escribe c1043aaz');
```

---
example_description: "Validación en vivo accesible («reward early, punish late»): el error aparece al salir del campo o al enviar, nunca mientras se escribe por primera vez; una vez marcado, el campo se revisa en cada tecla para quitar el error en cuanto se corrige. Mensajes en aria-describedby, aria-invalid y un único resumen polite al enviar"
example_tags: "javascript|formularios|validacion|accesibilidad|aria-invalid|aria-describedby|blur|input"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Boletín de la Huerta Urbana</h1>
  <form id="newsletter" action="/boletin" method="post" novalidate>
    <div class="field">
      <label for="email">Correo</label>
      <input id="email" name="email" type="email" required autocomplete="email" aria-describedby="email-error">
      <p id="email-error" class="error"></p>
    </div>
    <div class="field">
      <label for="postal-code">Código postal</label>
      <input id="postal-code" name="postal_code" inputmode="numeric" required pattern="\d{5}" autocomplete="postal-code"
        aria-describedby="postal-code-hint postal-code-error">
      <p id="postal-code-hint" class="hint">5 cifras: así te avisamos de los talleres cerca de ti.</p>
      <p id="postal-code-error" class="error"></p>
    </div>
    <button type="submit">Suscribirme</button>
  </form>
  <p id="summary" role="status"></p>
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
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
.field {
  display: grid;
  gap: 0.2rem;
  margin-bottom: 0.6rem;
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
  color: #52606d;
}
.error {
  color: #b91c1c;
}
input,
button {
  font: inherit;
  color: #1f2933;
  padding: 0.3rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
input[aria-invalid="true"] {
  border: 2px solid #b91c1c;
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
}
```

# JavaScript

```javascript
const form = document.querySelector('#newsletter');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

const MESSAGES = {
  email: { valueMissing: 'Escribe tu correo.', typeMismatch: 'Escribe un correo completo, como lucia@ejemplo.mx.' },
  postal_code: { valueMissing: 'Escribe tu código postal.', patternMismatch: 'Escribe 5 cifras, sin espacios.' },
};
function messageFor(field) {
  const texts = MESSAGES[field.name];
  if (field.validity.valueMissing) return texts.valueMissing;
  if (field.validity.typeMismatch) return texts.typeMismatch;
  if (field.validity.patternMismatch) return texts.patternMismatch;
  return '';
}

// Pinta el estado de un campo. El párrafo de error NO es una región viva: el lector
// de pantalla lo lee al llegar al campo (aria-describedby), sin interrumpir.
function render(field, why) {
  const message = messageFor(field);
  const wasInvalid = field.getAttribute('aria-invalid') === 'true';
  field.setAttribute('aria-invalid', String(message !== ''));
  document.querySelector(`#${field.id}-error`).textContent = message ? `⚠ ${message}` : '';
  if (message && !wasInvalid) logLine(`❌ ${field.name} · ${why} → «${message}»`);
  if (!message && wasInvalid) logLine(`✅ ${field.name} · ${why} → corregido`);
  return message;
}

// Castigar tarde: el primer error aparece al SALIR del campo (si se escribió algo).
form.addEventListener('focusout', (event) => {
  const field = event.target;
  if (field.matches('input') && field.value !== '') render(field, 'al salir');
});

// Premiar pronto: un campo ya marcado se revisa en cada tecla, para quitar el error
// en cuanto esté bien. Uno que no tiene error no se toca mientras se escribe.
form.addEventListener('input', (event) => {
  const field = event.target;
  if (field.getAttribute('aria-invalid') === 'true') render(field, 'en vivo');
});

// Al enviar, todos; un único anuncio (polite) y el foco al primero con error.
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const invalid = [...form.querySelectorAll('input')].filter((field) => render(field, 'al enviar'));
  const summary = document.querySelector('#summary');
  if (invalid.length > 0) {
    summary.textContent = `Revisa ${invalid.length} campo(s) del formulario.`;
    invalid[0].focus();
  } else {
    summary.textContent = '¡Listo! Revisa tu correo para confirmar.';
  }
  logLine(`📨 submit → 📢 «${summary.textContent}»`);
});
logLine('Listo: escribe «lu» en el correo, pulsa Tab, vuelve y completa «lu@mx»; luego pulsa «Suscribirme»');
```

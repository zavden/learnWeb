---
example_description: "novalidate apaga los avisos del navegador, no las restricciones: al enviar, el script lee validity de cada campo, escribe mensajes propios en español junto a él (aria-describedby), marca aria-invalid, resume los errores y lleva el foco al primero"
example_tags: "javascript|formularios|validacion|novalidate|mensajes|aria-invalid|aria-describedby|accesibilidad"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Reserva en la Fonda Doña Lupe</h1>
  <!-- novalidate: el navegador no valida al enviar ni muestra avisos; lo hace el script. -->
  <form id="booking" action="/reservas" method="post" novalidate>
    <div class="field">
      <label for="email">Correo</label>
      <input id="email" name="email" type="email" required autocomplete="email"
        aria-describedby="email-error"
        data-missing="Escribe tu correo para enviarte la confirmación."
        data-mismatch="Escribe un correo completo, como lucia@ejemplo.mx.">
      <p id="email-error" class="error"></p>
    </div>
    <div class="field">
      <label for="phone">Teléfono</label>
      <input id="phone" name="phone" inputmode="numeric" required pattern="\d{10}" value="55 1234" autocomplete="tel-national"
        aria-describedby="phone-hint phone-error"
        data-missing="Escribe tu teléfono por si hay cambios."
        data-mismatch="Escribe las 10 cifras seguidas, sin espacios.">
      <p id="phone-hint" class="hint">10 cifras, por ejemplo 5512345678.</p>
      <p id="phone-error" class="error"></p>
    </div>
    <div class="field">
      <label for="guests">Personas</label>
      <input id="guests" name="guests" type="number" min="1" max="12" required value="15"
        aria-describedby="guests-error"
        data-missing="Indica cuántas personas vienen."
        data-mismatch="Reservamos mesas de 1 a 12 personas.">
      <p id="guests-error" class="error"></p>
    </div>
    <button type="submit">Reservar</button>
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
/* El estado lo decide el script (aria-invalid), no :invalid. */
input[aria-invalid="true"] {
  border: 2px solid #b91c1c;
}
button {
  justify-self: start;
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
const form = document.querySelector('#booking');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// Del indicador de validity a un mensaje propio (los textos viven en el HTML).
function messageFor(field) {
  const { validity } = field;
  if (validity.valid) return '';
  if (validity.valueMissing) return field.dataset.missing;
  return field.dataset.mismatch; // typeMismatch, patternMismatch, rangeOverflow…
}

// Muestra (o borra) el error de un campo. El párrafo de error existe siempre y está
// en aria-describedby: un lector de pantalla lo lee al llegar al campo.
function showError(field) {
  const message = messageFor(field);
  document.querySelector(`#${field.id}-error`).textContent = message ? `⚠ ${message}` : '';
  field.setAttribute('aria-invalid', String(message !== ''));
  return message;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  logLine('📨 submit (con novalidate, el navegador no ha comprobado nada)');
  const invalid = [];
  for (const field of form.querySelectorAll('input')) {
    const message = showError(field);
    if (message) {
      invalid.push(field);
      logLine(`❌ ${field.name} → ${message} (navegador: «${field.validationMessage}»)`);
    }
  }
  if (invalid.length > 0) {
    document.querySelector('#summary').textContent = `Revisa ${invalid.length} campo(s) marcados.`;
    invalid[0].focus(); // el primero con error recibe el foco
    logLine(`🎯 foco en ${document.activeElement.name}`);
    return;
  }
  document.querySelector('#summary').textContent = '¡Reserva enviada!';
  logLine(`✅ todo correcto → ${JSON.stringify(Object.fromEntries(new FormData(form)))}`);
});
logLine('Listo: pulsa «Reservar»; luego corrige los tres campos y vuelve a pulsar');
```

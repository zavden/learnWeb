---
example_description: "Ejercicio: completa la validación propia de un alta (novalidate): limpiar setCustomValidity, escapar con RegExp.escape el prefijo con el que se construye una regex, marcar aria-invalid y escribir el mensaje en el párrafo de aria-describedby, y resumir los errores al enviar llevando el foco al primero"
example_tags: "javascript|formularios|ejercicio|validacion|setcustomvalidity|regexp-escape|aria-invalid|accesibilidad"
exercise: true
exercise_title: "Mensajes de error accesibles"
exercise_instructions: "TODO 1: el correo repetido se marca como erróneo pero nunca se limpia; haz que vuelva a ser válido cuando coincida || TODO 2: el SKU se comprueba con una regex construida con el prefijo elegido, pero «B.N.» tiene puntos: escápalo para que BXNX-123 no pase || TODO 3: en validateField, pon aria-invalid (\"true\" o \"false\") y escribe el mensaje, con «⚠ » delante, en el párrafo #<id>-error (vacío si no hay error) || TODO 4: al enviar con errores, escribe «Revisa N campos.» en #summary y lleva el foco al primer campo con error || Ejecuta hasta que las cinco comprobaciones salgan ✓"
exercise_hints: "setCustomValidity(hayError ? mensaje : '') || RegExp.escape(prefix) || field.setAttribute('aria-invalid', String(message !== '')) || document.querySelector(`#${field.id}-error`) || invalid[0].focus()"
exercise_solution_example: 10-ej-mensajes-de-error-accesibles-solucion.md
exercise_locked_files: index.html
example_stage: exercise
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Vende en el Mercado Artesano</h1>
  <form id="seller" action="/vendedoras/alta" method="post" novalidate>
    <label for="shop">Nombre de la tienda</label>
    <input id="shop" name="shop" required aria-describedby="shop-error">
    <p id="shop-error" class="error"></p>
    <label for="email">Correo</label>
    <input id="email" name="email" type="email" required autocomplete="email" aria-describedby="email-error">
    <p id="email-error" class="error"></p>
    <label for="email-confirm">Repite el correo</label>
    <input id="email-confirm" name="email_confirm" type="email" required autocomplete="email" aria-describedby="email-confirm-error">
    <p id="email-confirm-error" class="error"></p>
    <label for="prefix">Taller</label>
    <select id="prefix" name="prefix">
      <option value="B.N.">B.N. · Barro negro</option>
      <option value="A.T.">A.T. · Alebrijes tallados</option>
    </select>
    <label for="sku">Código de tu primer producto</label>
    <input id="sku" name="sku" required aria-describedby="sku-hint sku-error">
    <p id="sku-hint" class="hint">El prefijo del taller, un guion y tres cifras: B.N.-104.</p>
    <p id="sku-error" class="error"></p>
    <button type="submit">Darme de alta</button>
  </form>
  <p id="summary" role="status"></p>
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
  max-width: 28rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.15rem;
  margin-top: 0;
}
form {
  display: grid;
  gap: 0.2rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
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
  color: #52606d;
}
.error {
  color: #b91c1c;
}
input,
select,
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
  justify-self: start;
  margin-top: 0.6rem;
  cursor: pointer;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// EJERCICIO: completa los cuatro TODO.
const form = document.querySelector('#seller');
const summary = document.querySelector('#summary');

const REQUIRED = {
  shop: 'Escribe el nombre de tu tienda.',
  email: 'Escribe tu correo.',
  email_confirm: 'Repite tu correo.',
  sku: 'Escribe el código de tu primer producto.',
};
function messageFor(field) {
  if (field.validity.valueMissing) return REQUIRED[field.name];
  if (field.validity.typeMismatch) return 'Escribe un correo completo, como ana@ejemplo.mx.';
  if (field.validity.customError) return field.validationMessage; // el texto de setCustomValidity
  return '';
}

function validateField(field) {
  if (field.name === 'email_confirm') {
    // TODO 1: el mensaje se pone, pero nunca se quita.
    if (field.value !== form.elements.email.value) field.setCustomValidity('Los dos correos no coinciden.');
  }
  if (field.name === 'sku') {
    const prefix = form.elements.prefix.value;
    // TODO 2: el prefijo es TEXTO, pero aquí entra en la regex tal cual.
    const valid = new RegExp(`^${prefix}-\\d{3}$`, 'v').test(field.value);
    field.setCustomValidity(valid || field.value === '' ? '' : `Empieza por ${prefix}- y tres cifras.`);
  }
  const message = messageFor(field);
  // TODO 3: aria-invalid y el mensaje en el párrafo de error del campo.
  return message;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const invalid = [...form.querySelectorAll('input')].filter((field) => validateField(field) !== '');
  if (invalid.length === 0) {
    summary.textContent = '¡Alta enviada!';
    return;
  }
  // TODO 4: «Revisa N campos.» en el resumen y el foco en el primer campo con error.
});

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, compute, expected) {
  let actual;
  try {
    actual = compute();
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
const { shop, email, email_confirm: confirmation, sku } = form.elements;
const state = (field) => `${field.getAttribute('aria-invalid')}|${document.querySelector(`#${field.id}-error`).textContent}`;

check('tras corregirlo, el correo repetido vuelve a ser válido', () => {
  email.value = 'ana@barro.mx';
  confirmation.value = 'ana@barro.com';
  validateField(confirmation);
  confirmation.value = 'ana@barro.mx';
  validateField(confirmation);
  return confirmation.validity.valid;
}, true);
check('con el prefijo B.N., «BXNX-123» no vale', () => {
  sku.value = 'BXNX-123';
  return validateField(sku);
}, 'Empieza por B.N.- y tres cifras.');
check('un campo con error tiene aria-invalid="true" y su mensaje', () => {
  shop.value = '';
  validateField(shop);
  return state(shop);
}, 'true|⚠ Escribe el nombre de tu tienda.');
check('un campo correcto tiene aria-invalid="false" y el párrafo vacío', () => {
  shop.value = 'Barro Negro de Coyotepec';
  validateField(shop);
  return state(shop);
}, 'false|');
check('al enviar con 2 errores, el resumen lo dice', () => {
  shop.value = '';
  sku.value = 'B.N.-12';
  form.dispatchEvent(new SubmitEvent('submit', { cancelable: true })); // sin burbuja: no llega a window
  return summary.textContent;
}, 'Revisa 2 campos.');

// Deja el formulario limpio para que lo pruebes tú.
form.reset();
for (const field of form.querySelectorAll('input')) {
  field.setCustomValidity('');
  field.removeAttribute('aria-invalid');
  document.querySelector(`#${field.id}-error`).textContent = '';
}
summary.textContent = '';
```

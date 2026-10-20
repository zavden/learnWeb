---
example_description: "Un formulario de soporte con la validación del navegador y los mensajes propios: un mensaje por motivo, error junto a cada campo, aria-invalid, resumen enlazado y foco"
example_tags: "integracion|formularios|validacion|validity|errores|aria-invalid|resumen"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<!-- Envía vacío. Después escribe un pedido como «sr-2045» y un mensaje corto y vuelve a enviar:
     cada motivo tiene su mensaje. Corrige y envía de nuevo.
     (onsubmit, oninput y onclick: los eventos llegan en el capítulo de JavaScript.) -->
<h1>Centro de ayuda</h1>
<p>Todos los campos son obligatorios salvo el número de pedido.</p>

<!-- novalidate: las restricciones siguen ahí, pero los mensajes los ponemos nosotros -->
<form action="https://semillasribera.example/ayuda/consultas" method="post" novalidate
      onsubmit="validateForm(event, this)" oninput="if (event.target.hasAttribute('aria-invalid')) showError(event.target)">
  <div id="error-summary" class="summary" tabindex="-1" hidden>
    <h2 id="summary-title">Hay errores en el formulario</h2>
    <ul id="error-list" onclick="goToField(event)"></ul>
  </div>

  <p>
    <label for="topic">¿Sobre qué es tu consulta?</label>
    <select id="topic" name="topic" required aria-describedby="topic-error" data-missing="Elige el tema de tu consulta.">
      <option value="">Elige un tema</option>
      <optgroup label="Pedidos">
        <option value="shipping">Envío y entrega</option>
        <option value="returns">Devoluciones</option>
      </optgroup>
      <optgroup label="Cuenta">
        <option value="login">No puedo entrar</option>
        <option value="data">Mis datos</option>
      </optgroup>
    </select>
    <span id="topic-error" class="error"></span>
  </p>
  <p>
    <label for="email">Correo electrónico</label>
    <input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-error"
           data-missing="Escribe tu correo electrónico." data-format="Escribe el correo completo, con @ y dominio: ana@correo.es.">
    <span id="email-error" class="error"></span>
  </p>
  <p>
    <label for="order">Número de pedido (opcional)</label>
    <input id="order" name="order" pattern="[A-Z]{2}-[0-9]{6}" maxlength="9" aria-describedby="order-hint order-error"
           data-format="El número de pedido son dos letras mayúsculas, un guion y seis cifras: SR-204518.">
    <span id="order-hint" class="hint">Está en el correo de confirmación, por ejemplo SR-204518.</span>
    <span id="order-error" class="error"></span>
  </p>
  <p>
    <label for="message">¿Qué ha pasado?</label>
    <textarea id="message" name="message" rows="4" cols="40" minlength="20" required aria-describedby="message-hint message-error"
              data-missing="Cuéntanos qué ha pasado." data-short="Escribe al menos 20 caracteres para que podamos ayudarte."></textarea>
    <span id="message-hint" class="hint">Al menos 20 caracteres.</span>
    <span id="message-error" class="error"></span>
  </p>
  <button type="submit">Enviar consulta</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 36rem;
}

label,
.hint,
.error {
  display: block;
}

.hint { color: #475569; }
.error { color: #b91c1c; font-weight: 600; }

/* Nunca solo color: un icono delante de cada error */
.error:not(:empty)::before {
  content: "⚠ ";
}

[aria-invalid="true"] {
  outline: 2px solid #b91c1c;
}

.summary {
  padding: 0 1rem 0.5rem;
  border: 3px solid #b91c1c;
}

.summary h2 {
  font-size: 1.1rem;
  color: #b91c1c;
}

:focus-visible,
.summary:focus {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. El navegador sigue validando (validity);
// nosotros elegimos el mensaje según el motivo y lo colocamos donde se ve y se anuncia.
function messageFor(field) {
  if (field.validity.valueMissing) return field.dataset.missing;
  if (field.validity.typeMismatch || field.validity.patternMismatch) return field.dataset.format;
  if (field.validity.tooShort) return field.dataset.short;
  return '';
}

function showError(field) {
  const message = messageFor(field);
  document.getElementById(`${field.id}-error`).textContent = message;
  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
  return message === '';
}

function validateForm(event, form) {
  const fields = [...form.querySelectorAll('input, select, textarea')];
  const invalid = fields.filter((field) => !showError(field));
  const summary = document.getElementById('error-summary');
  summary.hidden = invalid.length === 0;
  if (invalid.length === 0) return; // todo bien: el formulario se envía

  event.preventDefault();
  document.getElementById('summary-title').textContent = invalid.length === 1 ? 'Hay 1 error en el formulario' : `Hay ${invalid.length} errores en el formulario`;
  document.getElementById('error-list').innerHTML = invalid.map((field) => `<li><a href="#${field.id}">${messageFor(field)}</a></li>`).join('');
  summary.focus();
  console.log('Errores:', invalid.map((field) => `${field.name} (${messageFor(field)})`).join(' · '));
}

// Un enlace a #id solo desplaza la página: además, damos el foco al campo
function goToField(event) {
  const link = event.target.closest('a');
  if (!link) return;
  event.preventDefault();
  document.querySelector(link.getAttribute('href')).focus();
}
```

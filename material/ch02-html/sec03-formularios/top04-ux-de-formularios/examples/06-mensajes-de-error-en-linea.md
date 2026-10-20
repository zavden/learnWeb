---
example_description: "Mensajes de error propios junto a cada campo: novalidate, aria-invalid, aria-describedby y el foco en el primer error"
example_tags: "html|formularios|ux|errores|aria-invalid|aria-describedby|novalidate"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<!-- Envía vacío, después con «ana@» como correo, y corrige: cada error desaparece al arreglarlo.
     (onsubmit/oninput: los eventos llegan en el capítulo de JavaScript.) -->
<form action="https://huerta.example/boletin" method="post" novalidate
      onsubmit="validateForm(event, this)" oninput="if (event.target.hasAttribute('aria-invalid')) showError(event.target)">
  <p>
    <label for="full-name">Nombre</label>
    <!-- data-error: nuestro mensaje para este campo (atributos data-*: módulo 1) -->
    <input id="full-name" name="full_name" autocomplete="name" required
           aria-describedby="full-name-error" data-error="Escribe tu nombre.">
    <span id="full-name-error" class="error"></span>
  </p>
  <p>
    <label for="email">Correo electrónico</label>
    <!-- aria-describedby admite varios ids: la pista y el error se leen tras el nombre -->
    <input id="email" name="email" type="email" autocomplete="email" required
           aria-describedby="email-hint email-error" data-error="Escribe tu correo completo, con @ y dominio: por ejemplo, ana@correo.es.">
    <span id="email-hint" class="hint">Te escribiremos una vez al mes.</span>
    <span id="email-error" class="error"></span>
  </p>
  <button type="submit">Suscribirme</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* display: block pone cada texto en su línea (display: capítulo de CSS) */
label,
.hint,
.error {
  display: block;
}

.hint { color: #475569; }
.error { color: #b91c1c; font-weight: 600; }

/* Nunca solo el color: un icono delante del mensaje (::before y :empty: capítulo de CSS) */
.error:not(:empty)::before {
  content: "⚠ ";
}

/* El CSS lee el MISMO estado que el lector de pantalla */
[aria-invalid="true"] {
  border: 2px solid #b91c1c;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
// Muestra u oculta el error de un campo y devuelve si es válido.
function showError(field) {
  const valid = field.checkValidity();
  document.getElementById(`${field.id}-error`).textContent = valid ? '' : field.dataset.error;
  // aria-invalid: el lector anuncia «no válido» junto al nombre del campo
  if (valid) field.removeAttribute('aria-invalid');
  else field.setAttribute('aria-invalid', 'true');
  return valid;
}

function validateForm(event, form) {
  const invalid = [...form.querySelectorAll('input')].filter((field) => !showError(field));
  if (invalid.length > 0) {
    event.preventDefault(); // no se envía (preventDefault: módulo de eventos)
    invalid[0].focus(); // el foco va al primer error: se lee su nombre, «no válido» y el mensaje
    console.log('Campos con error:', invalid.map((field) => field.name).join(', '));
  }
}
```

---
example_description: "Un resumen de errores al principio del formulario: recibe el foco, dice cuántos errores hay y cada enlace lleva a su campo"
example_tags: "html|formularios|ux|errores|resumen|foco|accesibilidad"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<!-- Envía el formulario vacío: arriba aparece un resumen que recibe el foco. Pulsa un enlace
     del resumen. (onsubmit/onclick: los eventos llegan en el capítulo de JavaScript.) -->
<form action="https://huerta.example/parcelas/solicitud" method="post" novalidate onsubmit="validateForm(event, this)">
  <!-- Oculto hasta que haya errores. tabindex="-1": enfocable solo por código (lección de
       accesibilidad); al recibir el foco, el lector de pantalla lee el título y la lista. -->
  <div id="error-summary" class="summary" tabindex="-1" hidden>
    <h2 id="summary-title">Hay errores en el formulario</h2>
    <ul id="error-list" onclick="goToField(event)"></ul>
  </div>

  <p><label for="full-name">Nombre y apellidos</label><br><input id="full-name" name="full_name" autocomplete="name" required data-error="Escribe tu nombre y apellidos."></p>
  <p><label for="email">Correo electrónico</label><br><input id="email" name="email" type="email" autocomplete="email" required data-error="Escribe tu correo completo, por ejemplo ana@correo.es."></p>
  <p><label for="plot">Número de la parcela que solicitas</label><br><input id="plot" name="plot" inputmode="numeric" pattern="[0-9]{1,3}" required data-error="Escribe el número de la parcela, de 1 a 3 cifras."></p>
  <button type="submit">Enviar solicitud</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.summary {
  max-width: 32rem;
  padding: 0 1rem 0.5rem;
  border: 3px solid #b91c1c;
}

.summary h2 {
  font-size: 1.1rem;
  color: #b91c1c;
}

.summary:focus {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
function validateForm(event, form) {
  // willValidate: el campo participa en la validación (los botones, no)
  const invalid = [...form.elements].filter((field) => field.willValidate && !field.checkValidity());
  const summary = document.getElementById('error-summary');
  summary.hidden = invalid.length === 0;
  if (invalid.length === 0) return; // todo bien: el formulario se envía

  event.preventDefault(); // no se envía (preventDefault: módulo de eventos)
  document.getElementById('summary-title').textContent = invalid.length === 1 ? 'Hay 1 error en el formulario' : `Hay ${invalid.length} errores en el formulario`;
  // Un enlace por error (los mensajes son nuestros: innerHTML se estudia en el módulo del DOM)
  document.getElementById('error-list').innerHTML = invalid.map((field) => `<li><a href="#${field.id}">${field.dataset.error}</a></li>`).join('');
  summary.focus();
  console.log('Errores:', invalid.map((field) => field.name).join(', '), '→ foco en el resumen');
}

// Un enlace a #id solo desplaza la página: además, damos el foco al campo
function goToField(event) {
  const link = event.target.closest('a');
  if (!link) return;
  event.preventDefault();
  document.querySelector(link.getAttribute('href')).focus();
}
```

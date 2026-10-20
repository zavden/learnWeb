---
example_description: "Solución: el formulario de contacto envía por POST, cada campo tiene name y etiqueta, la pregunta es un fieldset y cada botón dice su type"
example_tags: "solucion|formularios|name|label|fieldset|button|post"
example_stage: final-solution
example_importance: critical
console: true
---

# HTML

```html
<h1>Escríbenos</h1>
<p>Te contestaremos en dos días laborables. Todos los campos son obligatorios.</p>

<!-- 1. POST: los datos personales van en el cuerpo, no en la URL -->
<form action="https://huerta.example/contacto" method="post">
  <p>
    <!-- 2. for = id del campo; name = la clave con la que viaja -->
    <label for="full-name">Nombre</label>
    <input id="full-name" name="full_name" autocomplete="name" required>
  </p>
  <p>
    <!-- 3. Etiqueta visible, type="email" (valida y da el teclado con @) y su autocomplete -->
    <label for="email">Correo electrónico</label>
    <input id="email" name="email" type="email" autocomplete="email" required>
  </p>

  <!-- 4. La pregunta es la legend del grupo -->
  <fieldset>
    <legend>¿Cómo prefieres que te contestemos?</legend>
    <label><input type="radio" name="reply" value="email" checked> Por correo</label>
    <label><input type="radio" name="reply" value="phone"> Por teléfono</label>
  </fieldset>

  <p>
    <label for="message">Mensaje</label>
    <!-- 5. Con name, el mensaje viaja -->
    <textarea id="message" name="message" rows="4" cols="40" required></textarea>
  </p>

  <!-- 6. type="button": no envía. type="submit": el botón de envío, escrito a propósito. -->
  <button type="button" onclick="previewMessage(this.form)">Vista previa</button>
  <button type="submit">Enviar</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 36rem;
}

p > label {
  display: block;
}

legend {
  font-weight: 700;
}

:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Comprobaciones automáticas (bloqueadas: no hace falta tocarlas). Adelanto: JavaScript se
// explica en su capítulo.
function previewMessage(form) {
  console.log('Vista previa del mensaje:', form.querySelector('textarea').value || '(vacío)');
}

const form = document.querySelector('form');
const fields = [...form.querySelectorAll('input, textarea, select')];
const buttons = [...form.querySelectorAll('button')];
const radios = fields.filter((field) => field.type === 'radio');
const email = form.querySelector('input[autocomplete="email"], input[name="email"]');
const previewButton = buttons.find((button) => button.textContent.includes('Vista previa'));

console.group('Lo que llegaría al servidor ahora mismo');
for (const field of fields) {
  if (field.type === 'radio' && !field.checked) continue;
  console.log(field.name ? `${field.name} = «${field.value}»` : `(sin name: «${field.labels[0]?.textContent.trim() ?? field.id}» no se enviaría)`);
}
console.groupEnd();

const checks = [
  ['el formulario envía por POST', form.method === 'post'],
  ['todos los campos tienen name', fields.every((field) => field.name !== '')],
  ['todos los campos tienen una etiqueta asociada', fields.every((field) => field.labels.length > 0)],
  ['el correo es type="email" con autocomplete="email"', email?.type === 'email' && email.autocomplete === 'email'],
  ['las respuestas están en un fieldset con su legend', radios.every((radio) => radio.closest('fieldset')?.querySelector('legend')?.textContent.trim())],
  ['cada botón tiene su type escrito', buttons.every((button) => button.hasAttribute('type'))],
  ['«Vista previa» no envía el formulario', previewButton?.type === 'button'],
];
for (const [label, ok] of checks) console.log(ok ? '✅' : '❌', label);
```

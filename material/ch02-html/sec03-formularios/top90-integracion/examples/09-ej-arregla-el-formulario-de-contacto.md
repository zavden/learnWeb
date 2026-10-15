---
example_description: "Ejercicio: un formulario de contacto que envía por GET, con campos sin name, etiquetas que no se asocian, un placeholder como etiqueta, radio sin grupo y botones sin type"
example_tags: "ejercicio|formularios|name|label|fieldset|button|post"
example_stage: exercise
example_importance: critical
exercise: true
exercise_title: "Arregla el formulario de contacto"
exercise_instructions: "Haz que el formulario envíe por POST || Asocia la etiqueta «Nombre» a su campo y dale un name || Pon una etiqueta visible al correo, conviértelo en type=\"email\" y añade su autocomplete || Agrupa las dos formas de respuesta en un fieldset con su legend (la pregunta) || Dale un name al mensaje || Haz que «Vista previa» no envíe el formulario y escribe el type del botón «Enviar» || Comprueba que la consola sale toda ✅ y envía el formulario"
exercise_hints: "La consola lista los pares que llegarían al servidor: los campos sin name no aparecen || for apunta al id, no al name || La pregunta «¿Cómo prefieres que te contestemos?» puede ser la legend: sustituye al <p> || <button type=\"button\"> no envía nada; <button type=\"submit\"> sí"
exercise_solution_example: 09-ej-arregla-el-formulario-de-contacto-solucion.md
exercise_locked_files: styles.css,script.js
console: true
---

# HTML

```html
<h1>Escríbenos</h1>
<p>Te contestaremos en dos días laborables. Todos los campos son obligatorios.</p>

<!-- TODO 1: envía datos personales: que no viajen en la URL -->
<form action="https://huerta.example/contacto">
  <p>
    <!-- TODO 2: la etiqueta no está asociada al campo, y el campo no se enviaría -->
    <label for="name">Nombre</label>
    <input id="full-name" autocomplete="name" required>
  </p>
  <p>
    <!-- TODO 3: un placeholder no es una etiqueta. Y esto es un correo. -->
    <input type="text" name="email" placeholder="Correo electrónico" required>
  </p>

  <!-- TODO 4: una pregunta con varias respuestas necesita un grupo con nombre -->
  <p>¿Cómo prefieres que te contestemos?</p>
  <label><input type="radio" name="reply" value="email" checked> Por correo</label>
  <label><input type="radio" name="reply" value="phone"> Por teléfono</label>

  <p>
    <label for="message">Mensaje</label>
    <!-- TODO 5: este campo no se enviaría -->
    <textarea id="message" rows="4" cols="40" required></textarea>
  </p>

  <!-- TODO 6: «Vista previa» solo debe escribir el mensaje en la consola, sin enviar.
       Y escribe el type de «Enviar». -->
  <button onclick="previewMessage(this.form)">Vista previa</button>
  <button>Enviar</button>
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

---
example_description: "Ejercicio: un diálogo de baja que no es modal, no tiene nombre, navega al pulsar sus botones y no dice qué se eligió, y unas preguntas frecuentes que no se pliegan"
example_tags: "ejercicio|formularios|dialog|showmodal|method-dialog|returnvalue|details"
example_stage: exercise
example_importance: important
exercise: true
exercise_title: "Completa el diálogo de baja"
exercise_instructions: "Haz que «Darme de baja» abra el diálogo como modal (con openLeaveDialog() o con command=\"show-modal\") || Da nombre al diálogo con su título || Haz que enviar su formulario cierre el diálogo en vez de navegar || Escribe el type de los dos botones y dales los values stay y leave || Haz que el foco empiece en «Seguir suscrito» || Convierte cada pregunta frecuente en un details con su summary || Comprueba que la consola sale toda ✅ y prueba las dos respuestas y Escape"
exercise_hints: "openLeaveDialog() ya está en el script: vacía returnValue y llama a showModal() || aria-labelledby necesita un id en el h2 || <form method=\"dialog\"> || El atributo autofocus decide dónde empieza el foco || <details><summary>La pregunta</summary><p>La respuesta</p></details>"
exercise_solution_example: 11-ej-completa-el-dialogo-solucion.md
exercise_locked_files: styles.css,script.js
console: true
---

# HTML

```html
<h1>Tu suscripción al boletín</h1>
<p>Recibes el boletín del huerto el primer lunes de cada mes.</p>

<!-- TODO 1: así el diálogo se abre, pero no es modal -->
<button id="leave-opener" type="button" onclick="document.getElementById('leave-dialog').setAttribute('open', '')">Darme de baja</button>

<!-- TODO 2: el diálogo necesita un nombre accesible: su título -->
<dialog id="leave-dialog" onclose="handleClose(this)">
  <h2>¿Quieres darte de baja?</h2>
  <p>Dejarás de recibir el boletín y los avisos de los talleres.</p>
  <!-- TODO 3: enviar este formulario debe cerrar el diálogo, no navegar -->
  <form>
    <!-- TODO 4: type y value (stay, leave) en cada botón. TODO 5: el foco, en la opción segura. -->
    <button>Seguir suscrito</button>
    <button>Sí, darme de baja</button>
  </form>
</dialog>

<h2>Preguntas frecuentes</h2>
<!-- TODO 6: cada pregunta, un desplegable nativo -->
<h3>¿Puedo volver a suscribirme?</h3>
<p>Sí, cuando quieras, desde la página principal del huerto.</p>
<h3>¿Borráis mis datos?</h3>
<p>Guardamos solo tu correo para no volver a escribirte, y lo borramos al cabo de un año.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 36rem;
}

dialog::backdrop {
  background: rgb(15 23 42 / 0.6);
}

summary {
  cursor: pointer;
  font-weight: 600;
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
function openLeaveDialog() {
  const leaveDialog = document.getElementById('leave-dialog');
  leaveDialog.returnValue = ''; // que un cierre sin valor no repita la respuesta anterior
  leaveDialog.showModal();
}

function handleClose(leaveDialog) {
  console.log(leaveDialog.returnValue === 'leave' ? '👋 Baja confirmada' : `Sigues suscrito (returnValue: '${leaveDialog.returnValue}')`);
}

const openerButton = document.getElementById('leave-opener');
const leaveDialog = document.getElementById('leave-dialog');
const dialogForm = leaveDialog.querySelector('form');
const dialogButtons = [...leaveDialog.querySelectorAll('form button')];
const titleId = leaveDialog.getAttribute('aria-labelledby');
const title = titleId ? document.getElementById(titleId) : null;
const faqs = [...document.querySelectorAll('details')];

const checks = [
  ['el botón abre el diálogo como modal', /openLeaveDialog\(|showModal\(/.test(openerButton.getAttribute('onclick') ?? '')
    || (openerButton.getAttribute('command') === 'show-modal' && openerButton.getAttribute('commandfor') === 'leave-dialog')],
  ['el diálogo toma su nombre de su título', title !== null && leaveDialog.contains(title) && title.textContent.trim() !== ''],
  ['su formulario usa method="dialog"', dialogForm?.getAttribute('method') === 'dialog'],
  ['los dos botones son type="submit" con values stay y leave', dialogButtons.every((button) => button.getAttribute('type') === 'submit')
    && dialogButtons.map((button) => button.value).sort().join() === 'leave,stay'],
  ['el foco empieza en «Seguir suscrito»', leaveDialog.querySelector('[autofocus]')?.value === 'stay'],
  ['las dos preguntas son details con su summary', faqs.length === 2 && faqs.every((faq) => faq.firstElementChild?.localName === 'summary')],
];
for (const [label, ok] of checks) console.log(ok ? '✅' : '❌', label);
```

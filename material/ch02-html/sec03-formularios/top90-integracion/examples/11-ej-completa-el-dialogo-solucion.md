---
example_description: "Solución: el diálogo de baja es modal, tiene nombre, se cierra con method=\"dialog\", sus botones dicen qué se eligió, el foco empieza en la opción segura y las preguntas se pliegan"
example_tags: "solucion|formularios|dialog|showmodal|method-dialog|returnvalue|details"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<h1>Tu suscripción al boletín</h1>
<p>Recibes el boletín del huerto el primer lunes de cada mes.</p>

<!-- 1. showModal() (dentro de openLeaveDialog, que además vacía returnValue).
     Sin JavaScript: commandfor="leave-dialog" command="show-modal" -->
<button id="leave-opener" type="button" onclick="openLeaveDialog()">Darme de baja</button>

<!-- 2. El nombre del diálogo es su título -->
<dialog id="leave-dialog" aria-labelledby="leave-title" onclose="handleClose(this)">
  <h2 id="leave-title">¿Quieres darte de baja?</h2>
  <p>Dejarás de recibir el boletín y los avisos de los talleres.</p>
  <!-- 3. method="dialog": cierra el diálogo y deja el value del botón en returnValue -->
  <form method="dialog">
    <!-- 4. Un value por respuesta. 5. autofocus en la opción que no hace nada irreversible. -->
    <button type="submit" value="stay" autofocus>Seguir suscrito</button>
    <button type="submit" value="leave">Sí, darme de baja</button>
  </form>
</dialog>

<h2>Preguntas frecuentes</h2>
<!-- 6. Desplegables nativos (name: solo uno abierto a la vez) -->
<details name="faq">
  <summary>¿Puedo volver a suscribirme?</summary>
  <p>Sí, cuando quieras, desde la página principal del huerto.</p>
</details>
<details name="faq">
  <summary>¿Borráis mis datos?</summary>
  <p>Guardamos solo tu correo para no volver a escribirte, y lo borramos al cabo de un año.</p>
</details>
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

---
example_description: "Un diálogo modal para editar la dirección de envío que protege los cambios sin guardar: el evento cancel (Escape) y el botón «Cancelar» se interceptan para pedir confirmación dentro del propio diálogo, close con returnValue decide qué hacer, y el resultado sale en un evento address:save; el foco vuelve solo al botón que lo abrió"
example_tags: "javascript|eventos|profesional|dialog|cancel|close|formularios|customevent|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="account">
  <h1>Mi cuenta</h1>
  <section class="card" aria-labelledby="shipping-title">
    <h2 id="shipping-title">Dirección de envío</h2>
    <address id="address-view">Lucía Méndez<br>Av. Juárez 120, int. 4<br>06000 Ciudad de México</address>
    <button type="button" id="edit-address">Editar dirección</button>
  </section>
  <dialog id="address-dialog" aria-labelledby="dialog-title">
    <form id="address-form" method="dialog" class="address-form">
      <h2 id="dialog-title">Editar dirección de envío</h2>
      <label>Nombre <input name="name" required autocomplete="name" autofocus></label>
      <label>Calle y número <input name="street" required autocomplete="street-address"></label>
      <label>Código postal <input name="zip" required inputmode="numeric" minlength="5" maxlength="5" autocomplete="postal-code"></label>
      <div id="confirm-discard" class="confirm" role="alert" hidden>
        <p>Tienes cambios sin guardar.</p>
        <button type="button" data-confirm="keep">Seguir editando</button>
        <button type="button" data-confirm="discard">Descartar cambios</button>
      </div>
      <p class="actions">
        <button type="submit" value="cancel" formnovalidate>Cancelar</button>
        <button type="submit" value="save" class="primary">Guardar</button>
      </p>
    </form>
  </dialog>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root {
  --ink: #1f2933;
  --muted: #52606d;
  --line: #cbd2d9;
  --surface: #ffffff;
  --page: #f5f7fa;
  --accent: #1d4ed8;
  --warning: #b45309;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: var(--ink);
  background: var(--page);
}
.account {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin-top: 0;
}
h2 {
  font-size: 1.05rem;
  margin-top: 0;
}
.card {
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
}
address {
  margin-bottom: 0.75rem;
  font-style: normal;
}
dialog {
  width: calc(100% - 2rem);
  max-width: 26rem;
  padding: 1rem;
  border: 1px solid var(--muted);
  border-radius: 0.75rem;
}
dialog::backdrop {
  background: rgb(31 41 51 / 0.5);
}
.address-form {
  display: grid;
  gap: 0.6rem;
}
.address-form label {
  display: grid;
  gap: 0.2rem;
}
input {
  font: inherit;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--muted);
  border-radius: 0.375rem;
}
.confirm {
  padding: 0.5rem 0.75rem;
  border-left: 4px solid var(--warning);
  background: #fffbeb;
}
.confirm p {
  margin: 0 0 0.4rem;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin: 0;
}
button {
  font: inherit;
  padding: 0.35rem 0.8rem;
  border: 1px solid var(--muted);
  border-radius: 0.4rem;
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
}
button.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: #ffffff;
}
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.log {
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface);
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Diálogo de edición que protege los cambios sin guardar.
//
// Decisiones de diseño:
// - <dialog> con showModal(): la página de detrás queda inerte, Escape dispara
//   el evento cancel y, al cerrarse, el navegador devuelve el foco al botón que
//   lo abrió. autofocus pone el foco en el primer campo.
// - <form method="dialog">: sus botones de envío cierran el diálogo y dejan su
//   value en dialog.returnValue («save», «cancel»). Toda la lógica de «qué
//   pasó» está en UN listener de close.
// - Con cambios sin guardar, Escape (cancel) y «Cancelar» (submit) se cancelan
//   con preventDefault() y aparece una confirmación DENTRO del diálogo; nada de
//   window.confirm. Chrome solo deja cancelar el Escape si ha habido
//   interacción desde el último: un segundo Escape seguido cierra igual, y el
//   listener de close descarta los cambios en ese caso.
// - Guardar avisa con address:save; quien muestre la dirección se suscribe.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM y este módulo.

const logList = document.querySelector('#log');
let quiet = false;
function logLine(text) {
  if (quiet) return;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

function createAddressEditor({ dialog, form, confirmBox, openButton }) {
  let saved = { name: 'Lucía Méndez', street: 'Av. Juárez 120, int. 4', zip: '06000' };
  let dirty = false;

  const fill = (data) => {
    for (const [field, value] of Object.entries(data)) form.elements[field].value = value;
    dirty = false;
    confirmBox.hidden = true;
  };
  const read = () => ({ name: form.elements.name.value.trim(), street: form.elements.street.value.trim(), zip: form.elements.zip.value.trim() });
  const askToDiscard = (why) => {
    confirmBox.hidden = false;
    logLine(`⚠️ ${why} con cambios sin guardar → confirmación`);
  };

  function open() {
    fill(saved);
    dialog.showModal();
    logLine('▾ diálogo abierto');
  }
  function settle(returnValue) {
    if (returnValue === 'save') {
      saved = read();
      dialog.dispatchEvent(new CustomEvent('address:save', { bubbles: true, detail: { ...saved } }));
      logLine(`💾 guardada: ${saved.street}, ${saved.zip}`);
    } else {
      logLine(dirty ? `↩️ cerrado (${returnValue || 'Escape'}): cambios descartados` : `▴ cerrado (${returnValue || 'Escape'}) sin cambios`);
    }
    fill(saved);
  }

  openButton.addEventListener('click', open);
  form.addEventListener('input', () => { dirty = true; });
  // Escape: el navegador dispara cancel antes de cerrar.
  dialog.addEventListener('cancel', (event) => {
    if (!dirty || !event.cancelable) return; // sin cambios (o sin permiso para impedirlo): que cierre
    event.preventDefault();
    askToDiscard('Escape');
  });
  // «Cancelar» es un submit con value="cancel": se puede frenar igual.
  form.addEventListener('submit', (event) => {
    if (event.submitter?.value === 'cancel' && dirty) {
      event.preventDefault();
      askToDiscard('Cancelar');
    }
  });
  confirmBox.addEventListener('click', (event) => {
    const choice = event.target.closest('[data-confirm]')?.dataset.confirm;
    if (choice === 'keep') {
      confirmBox.hidden = true;
      form.elements.name.focus(); // seguimos editando: el foco vuelve al formulario
    } else if (choice === 'discard') {
      dialog.close('discard');
    }
  });
  dialog.addEventListener('close', () => settle(dialog.returnValue));
  return { settle, isDirty: () => dirty, read };
}

const editor = createAddressEditor({
  dialog: document.querySelector('#address-dialog'),
  form: document.querySelector('#address-form'),
  confirmBox: document.querySelector('#confirm-discard'),
  openButton: document.querySelector('#edit-address'),
});

// Quien muestra la dirección se entera por el evento.
document.addEventListener('address:save', (event) => {
  const { name, street, zip } = event.detail;
  document.querySelector('#address-view').replaceChildren(name, document.createElement('br'), street,
    document.createElement('br'), `${zip} Ciudad de México`);
});

// ── Autocomprobación (simulada sin abrir el diálogo, para no mover el foco).
function audit() {
  quiet = true;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  const form = document.querySelector('#address-form');
  const dialog = document.querySelector('#address-dialog');
  const confirmBox = document.querySelector('#confirm-discard');
  form.elements.street.value = 'Calle Durango 45';
  form.elements.street.dispatchEvent(new Event('input', { bubbles: true }));
  expect('escribir en un campo marca cambios sin guardar', editor.isDirty());
  const cancel = new Event('cancel', { cancelable: true });
  dialog.dispatchEvent(cancel);
  expect('Escape (cancel) con cambios: se impide y aparece la confirmación', cancel.defaultPrevented && !confirmBox.hidden);
  confirmBox.hidden = true;
  const submit = new SubmitEvent('submit', { cancelable: true, submitter: form.querySelector('[value="cancel"]') });
  form.dispatchEvent(submit);
  expect('«Cancelar» con cambios: también se impide', submit.defaultPrevented && !confirmBox.hidden);
  let savedDetail = null;
  document.addEventListener('address:save', (event) => { savedDetail = event.detail; }, { once: true });
  editor.settle('save');
  expect('guardar avisa con address:save y actualiza la vista', savedDetail?.street === 'Calle Durango 45'
    && document.querySelector('#address-view').textContent.includes('Calle Durango 45'));
  expect('tras guardar ya no hay cambios pendientes', !editor.isDirty() && confirmBox.hidden);
  // Dejar la dirección como estaba.
  form.elements.street.value = 'Av. Juárez 120, int. 4';
  editor.settle('save');
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: pulsa «Editar dirección», cambia la calle y pulsa Escape; elige «Seguir editando», luego «Guardar»');
```

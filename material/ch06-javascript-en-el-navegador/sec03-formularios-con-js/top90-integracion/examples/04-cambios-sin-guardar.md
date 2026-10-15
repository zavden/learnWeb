---
example_description: "Un aviso de cambios sin guardar: cada control se compara con su valor inicial (value/defaultValue, checked/defaultChecked, selected/defaultSelected); un enlace para salir pregunta en un <dialog> si hay cambios; guardar copia lo actual en los default* y beforeunload solo se escucha mientras hay cambios"
example_tags: "javascript|formularios|integracion|defaultvalue|reset|dialog|beforeunload|formdata"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <nav><a id="leave" href="#catalogo">← Volver al catálogo</a></nav>
  <h1>Tu perfil de vendedora · Mercado Artesano</h1>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí «Guardar» no envía el formulario: ábrelo con «▶ Run» o en el editor.</p>
  <form id="profile" action="/perfil" method="post">
    <label>Nombre de la tienda <input name="shop" value="Barro Negro de Coyotepec"></label>
    <label>Descripción <textarea name="bio" rows="2">Piezas de barro negro hechas a mano en Oaxaca.</textarea></label>
    <label>Envíos desde
      <select name="city">
        <option value="oaxaca" selected>Oaxaca</option>
        <option value="cdmx">Ciudad de México</option>
      </select>
    </label>
    <fieldset>
      <legend>Avísame por correo</legend>
      <label class="inline"><input type="checkbox" name="notify" value="orders" checked> Pedidos</label>
      <label class="inline"><input type="checkbox" name="notify" value="reviews"> Reseñas</label>
    </fieldset>
    <p id="dirty-state" role="status">Sin cambios</p>
    <p class="actions">
      <button type="submit" id="save" disabled>Guardar</button>
      <button type="reset" id="discard" disabled>Descartar cambios</button>
    </p>
  </form>
  <dialog id="confirm-leave" aria-labelledby="confirm-title">
    <form method="dialog">
      <h2 id="confirm-title">Tienes cambios sin guardar</h2>
      <p>¿Qué quieres hacer con ellos?</p>
      <button type="submit" value="stay" autofocus>Seguir editando</button>
      <button type="submit" value="discard">Descartar y salir</button>
    </form>
  </dialog>
  <section id="catalogo"><h2>Catálogo</h2><p>Aquí estaría el catálogo de la tienda.</p></section>
  <ol id="log" class="log" aria-label="Registro"></ol>
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
  font-size: 1.15rem;
}
h2 {
  font-size: 1rem;
}
a {
  color: #1d4ed8;
}
.notice {
  padding: 0.5rem 0.75rem;
  border-left: 4px solid #1d4ed8;
  background: #ffffff;
}
form#profile {
  display: grid;
  gap: 0.6rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
label {
  display: grid;
  gap: 0.2rem;
}
label.inline {
  display: inline-flex;
  margin-right: 1rem;
}
fieldset {
  border: 1px solid #cbd2d9;
  border-radius: 0.375rem;
}
input:not([type="checkbox"]),
textarea,
select,
button {
  font: inherit;
  color: #1f2933;
  padding: 0.3rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
button {
  cursor: pointer;
}
button:disabled {
  cursor: not-allowed;
  color: #52606d;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
#dirty-state {
  margin: 0;
  font-weight: 600;
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin: 0;
}
dialog {
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
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
// Combina: «Leer y escribir controles» (default*, reset, input/change), «FormData y
// envío» (submit, FormData + getAll) y el módulo de eventos (acciones por defecto).
const form = document.querySelector('#profile');
const logList = document.querySelector('#log');
// En una tarjeta (iframe aislado, origen null) el navegador no envía formularios.
if (window.origin === 'null') document.querySelector('#card-notice').hidden = false;
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// ¿Qué controles ya no tienen su valor inicial? Cada tipo guarda el suyo.
function changedFields() {
  const changed = new Set();
  for (const field of form.elements) {
    if (!field.name) continue;
    if (field.type === 'checkbox' || field.type === 'radio') {
      if (field.checked !== field.defaultChecked) changed.add(field.name);
    } else if (field.tagName === 'SELECT') {
      if ([...field.options].some((option) => option.selected !== option.defaultSelected)) changed.add(field.name);
    } else if (field.value !== field.defaultValue) {
      changed.add(field.name);
    }
  }
  return [...changed];
}

// beforeunload solo mientras hay cambios: pedirlo siempre empeora la caché de páginas
// (en la vista previa no verás su aviso; en una pestaña normal, sí).
const warnBeforeUnload = (event) => event.preventDefault();
let lastState = '';
function updateState() {
  const changed = changedFields();
  const dirty = changed.length > 0;
  document.querySelector('#dirty-state').textContent = dirty ? `● Cambios sin guardar: ${changed.join(', ')}` : 'Sin cambios';
  document.querySelector('#save').disabled = !dirty;
  document.querySelector('#discard').disabled = !dirty;
  if (dirty) window.addEventListener('beforeunload', warnBeforeUnload);
  else window.removeEventListener('beforeunload', warnBeforeUnload);
  const state = dirty ? `✏️ cambios en: ${changed.join(', ')}` : '✔️ sin cambios';
  if (state !== lastState) logLine(state);
  lastState = state;
  return dirty;
}

form.addEventListener('input', updateState);
form.addEventListener('change', updateState);
// reset llega ANTES de restaurar los valores: se comprueba en la siguiente tarea.
form.addEventListener('reset', () => setTimeout(updateState));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  // «Guardar»: lo actual pasa a ser lo inicial (así reset y el aviso parten de aquí).
  for (const field of form.elements) {
    if (field.type === 'checkbox' || field.type === 'radio') field.defaultChecked = field.checked;
    else if (field.tagName === 'SELECT') for (const option of field.options) option.defaultSelected = option.selected;
    else if (field.name) field.defaultValue = field.value;
  }
  logLine(`💾 guardado → ${JSON.stringify({ ...Object.fromEntries(formData), notify: formData.getAll('notify') })}`);
  updateState();
});

// Salir con cambios: el enlace pregunta antes (preventDefault y un <dialog>).
const dialog = document.querySelector('#confirm-leave');
document.querySelector('#leave').addEventListener('click', (event) => {
  if (changedFields().length === 0) return; // sin cambios, el enlace funciona normal
  event.preventDefault();
  dialog.returnValue = '';
  dialog.showModal();
});
dialog.addEventListener('close', () => {
  logLine(`🚪 diálogo → ${dialog.returnValue || 'cerrado con Escape'}`);
  if (dialog.returnValue !== 'discard') return;
  form.reset();
  document.querySelector('#catalogo').scrollIntoView();
});
updateState();
logLine('Listo: añade « Envíos a todo México.» a la descripción y marca «Reseñas»; pulsa «← Volver al catálogo»; luego «Guardar»');
```

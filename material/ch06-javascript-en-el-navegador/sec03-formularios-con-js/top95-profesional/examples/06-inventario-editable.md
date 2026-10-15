---
example_description: "Un inventario editable en una tabla: cada fila es su propio formulario gracias al atributo form (un <form> no puede ir dentro de un <tr>), con validación por fila (precio, existencias enteras, SKU con regex y único entre filas con setCustomValidity), aviso de cambios sin guardar (value frente a defaultValue), guardado que copia los valores en defaultValue y filas nuevas desde un <template>"
example_tags: "javascript|formularios|profesional|tabla|atributo-form|validacion|setcustomvalidity|defaultvalue|template"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Inventario · Mercado Artesano</h1>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí los formularios no se envían: ábrelo con «▶ Run» o en el editor.</p>
  <div class="table-wrap">
    <table>
      <caption>Edita una fila y pulsa su «Guardar»</caption>
      <thead>
        <tr><th scope="col">Producto</th><th scope="col">SKU</th><th scope="col">Precio</th><th scope="col">Existencias</th><th scope="col">Estado</th></tr>
      </thead>
      <tbody id="rows"></tbody>
    </table>
  </div>
  <div id="row-forms"></div>
  <button type="button" id="add-row">Añadir producto</button>
  <p id="announcer" role="status"></p>
  <template id="row-template">
    <tr>
      <td><input name="name" required aria-label="Producto"></td>
      <td><input name="sku" required pattern="[A-Z]{3}-\d{3}" maxlength="7" class="sku" aria-label="SKU"></td>
      <td><input name="price" type="number" required min="0.01" step="0.01" class="number" aria-label="Precio en pesos"></td>
      <td><input name="stock" type="number" required min="0" step="1" class="number" aria-label="Existencias"></td>
      <td class="status-cell"><output class="row-status"></output> <button type="submit">Guardar</button></td>
    </tr>
  </template>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root {
  --ink: #1f2933;
  --muted: #52606d;
  --line: #cbd2d9;
  --field: #7b8794;
  --surface: #ffffff;
  --page: #f5f7fa;
  --accent: #1d4ed8;
  --danger: #b91c1c;
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
main {
  max-width: 48rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin: 0 0 0.75rem;
}
.notice {
  padding: 0.5rem 0.75rem;
  border-left: 4px solid var(--accent);
  background: var(--surface);
}
.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
}
table {
  width: 100%;
  border-collapse: collapse;
}
caption {
  padding: 0.5rem;
  text-align: start;
  color: var(--muted);
}
th,
td {
  padding: 0.35rem 0.5rem;
  border-top: 1px solid var(--line);
  text-align: start;
  vertical-align: top;
}
input,
button {
  font: inherit;
  color: var(--ink);
  padding: 0.25rem 0.4rem;
  border: 1px solid var(--field);
  border-radius: 0.375rem;
  background: var(--surface);
}
input {
  width: 100%;
  min-width: 6rem;
}
input.number {
  min-width: 5rem;
  text-align: end;
}
input[aria-invalid="true"] {
  border: 2px solid var(--danger);
}
button {
  cursor: pointer;
}
#add-row {
  margin-top: 0.75rem;
}
.status-cell {
  min-width: 11rem;
}
.row-status {
  display: block;
  font-size: 0.85rem;
}
.row-status.error {
  color: var(--danger);
}
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface);
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
// Inventario editable con un formulario por fila.
//
// Decisiones de diseño:
// - Un <form> no puede ir dentro de un <tr>: los formularios están vacíos fuera de la
//   tabla y cada control se asocia al suyo con el atributo form="row-N". FormData,
//   la validación y el botón de envío respetan esa asociación.
// - Validación por fila con mensajes propios (novalidate): el estado de la fila los
//   resume y el foco va al primer campo con error. «SKU único» es una regla entre
//   filas: se recalcula para todas con setCustomValidity.
// - «Cambios sin guardar» compara value con defaultValue; guardar copia los valores
//   en defaultValue (lo guardado pasa a ser lo inicial).
// - Cada guardado se anuncia en una única región role="status".
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.
const tbody = document.querySelector('#rows');
const template = document.querySelector('#row-template');
const announcer = document.querySelector('#announcer');
const logList = document.querySelector('#log');
let quiet = false;
let moveFocus = true;
let rowCount = 0;
function logLine(text) {
  if (quiet) return;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
if (window.origin === 'null') document.querySelector('#card-notice').hidden = false;

const MESSAGES = {
  name: { valueMissing: 'Producto: obligatorio.' },
  sku: { valueMissing: 'SKU: obligatorio.', customError: 'SKU: ya existe en otra fila.', patternMismatch: 'SKU: 3 letras, guion y 3 cifras (BAR-101).' },
  price: { valueMissing: 'Precio: obligatorio.', badInput: 'Precio: escribe un número.', rangeUnderflow: 'Precio: mayor que 0.', stepMismatch: 'Precio: como mucho 2 decimales.' },
  stock: { valueMissing: 'Existencias: obligatorio.', badInput: 'Existencias: escribe un número.', rangeUnderflow: 'Existencias: 0 o más.', stepMismatch: 'Existencias: un número entero.' },
};
const rowFields = (rowForm) => [...rowForm.elements].filter((field) => field.name);
const messageFor = (field) => {
  const reason = Object.keys(MESSAGES[field.name]).find((flag) => field.validity[flag]);
  return reason ? MESSAGES[field.name][reason] : '';
};
const statusOf = (rowForm) => tbody.querySelector(`[data-form="${rowForm.id}"] .row-status`);

function setStatus(rowForm, text, isError = false) {
  const output = statusOf(rowForm);
  output.textContent = text;
  output.classList.toggle('error', isError);
}
function checkUniqueSkus() {
  const skus = [...tbody.querySelectorAll('input[name="sku"]')];
  for (const field of skus) {
    const duplicated = field.value !== '' && skus.some((other) => other !== field && other.value === field.value);
    field.setCustomValidity(duplicated ? 'duplicado' : '');
  }
}
const isDirty = (rowForm) => rowFields(rowForm).some((field) => field.value !== field.defaultValue);

function addRow(product = { name: '', sku: '', price: '', stock: '' }) {
  rowCount += 1;
  const formId = `row-${rowCount}`;
  const rowForm = Object.assign(document.createElement('form'), { id: formId, noValidate: true });
  rowForm.action = '/inventario';
  rowForm.method = 'post';
  document.querySelector('#row-forms').append(rowForm);
  const row = template.content.firstElementChild.cloneNode(true);
  row.dataset.form = formId;
  for (const control of row.querySelectorAll('input, button')) control.setAttribute('form', formId);
  for (const input of row.querySelectorAll('input')) {
    input.defaultValue = String(product[input.name]); // lo que viene «guardado» es lo inicial
    input.setAttribute('aria-label', `${input.getAttribute('aria-label')}, fila ${rowCount}`);
  }
  tbody.append(row);
  rowForm.addEventListener('submit', (event) => saveRow(event, rowForm));
  setStatus(rowForm, product.name ? '' : '● Nuevo, sin guardar');
  return rowForm;
}

function saveRow(event, rowForm) {
  event.preventDefault();
  checkUniqueSkus();
  const invalid = rowFields(rowForm).filter((field) => {
    const message = messageFor(field);
    field.setAttribute('aria-invalid', String(message !== ''));
    return message !== '';
  });
  if (invalid.length > 0) {
    const text = `⚠ ${invalid.map(messageFor).join(' ')}`;
    setStatus(rowForm, text, true);
    if (moveFocus) invalid[0].focus();
    logLine(`❌ ${rowForm.id} → ${text}`);
    return;
  }
  const data = Object.fromEntries(new FormData(rowForm)); // incluye los controles con form="row-N"
  for (const field of rowFields(rowForm)) field.defaultValue = field.value;
  setStatus(rowForm, '✓ Guardado');
  announcer.textContent = `Fila ${rowForm.id.slice(4)} guardada.`;
  logLine(`💾 ${rowForm.id} → ${JSON.stringify(data)}`);
}

tbody.addEventListener('input', (event) => {
  const rowForm = event.target.form;
  if (event.target.name === 'sku') {
    const upper = event.target.value.toUpperCase();
    if (upper !== event.target.value) event.target.value = upper;
    checkUniqueSkus();
  }
  // Premiar pronto: un campo marcado deja de estarlo en cuanto es válido.
  if (event.target.getAttribute('aria-invalid') === 'true' && messageFor(event.target) === '') {
    event.target.setAttribute('aria-invalid', 'false');
  }
  const pendingErrors = rowFields(rowForm).filter((field) => field.getAttribute('aria-invalid') === 'true');
  if (pendingErrors.length > 0) setStatus(rowForm, `⚠ ${pendingErrors.map(messageFor).join(' ')}`, true);
  else setStatus(rowForm, isDirty(rowForm) ? '● Cambios sin guardar' : '');
});
document.querySelector('#add-row').addEventListener('click', () => {
  const rowForm = addRow();
  rowFields(rowForm)[0].focus();
  logLine(`➕ ${rowForm.id}`);
});

const PRODUCTS = [
  { name: 'Olla de barro negro', sku: 'BAR-101', price: 480, stock: 6 },
  { name: 'Alebrije de jaguar', sku: 'ALE-204', price: 950, stock: 2 },
  { name: 'Rebozo de algodón', sku: 'TEX-310', price: 720, stock: 0 },
];

// ── Autocomprobación (simulada; deja las 3 filas como al cargar).
function audit() {
  quiet = true;
  moveFocus = false;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  const forms = PRODUCTS.map((product) => addRow(product));
  const [first, second] = forms;
  expect('3 filas; cada control pertenece al formulario de su fila', tbody.rows.length === 3
    && rowFields(first).length === 4 && rowFields(first).every((field) => field.form === first));
  expect('FormData de la fila 1 tiene sus 4 datos', [...new FormData(first).keys()].join() === 'name,sku,price,stock');
  second.elements.sku.value = 'BAR-101';
  checkUniqueSkus();
  expect('un SKU repetido marca las dos filas', first.elements.sku.validity.customError && second.elements.sku.validity.customError);
  second.elements.sku.value = second.elements.sku.defaultValue;
  checkUniqueSkus();
  first.elements.price.value = '0';
  first.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
  expect('precio 0: la fila no se guarda y su estado lo dice', statusOf(first).textContent === '⚠ Precio: mayor que 0.');
  first.elements.price.value = '520';
  first.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
  expect('al guardar, value pasa a defaultValue (sin cambios pendientes)', first.elements.price.defaultValue === '520' && !isDirty(first));
  first.elements.price.defaultValue = '480';
  first.elements.price.value = '480';
  first.elements.price.removeAttribute('aria-invalid');
  setStatus(first, '');
  announcer.textContent = '';
  quiet = false;
  moveFocus = true;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: cambia el precio de la olla a 0 y pulsa su «Guardar»; luego pon 520 y guarda; escribe ALE-204 como SKU del rebozo');
```

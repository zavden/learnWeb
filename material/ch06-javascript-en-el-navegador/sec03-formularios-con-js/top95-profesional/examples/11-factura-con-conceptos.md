---
example_description: "Una factura con conceptos dinámicos: filas añadidas desde un <template> con nombres repetidos (item_desc, item_qty, item_price) que FormData devuelve con getAll y se juntan en un array de objetos con números; totales en centavos con valueAsNumber (IVA 16 %), RFC normalizado y validado con una regex, y el foco que nunca se pierde al quitar una fila"
example_tags: "javascript|formularios|profesional|factura|formdata|getall|template|valueasnumber|regex|intl"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Nueva factura · Imprenta La Golondrina</h1>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí los formularios no se envían: ábrelo con «▶ Run» o en el editor.</p>
  <form id="invoice" action="/facturas" method="post">
    <div class="row">
      <div class="field">
        <label for="client">Razón social</label>
        <input id="client" name="client" required value="Mezcalería El Agave">
      </div>
      <div class="field">
        <label for="rfc">RFC</label>
        <input id="rfc" name="rfc" required pattern="[A-ZÑ&amp;]{3,4}\d{6}[A-Z\d]{3}" maxlength="13" value="MEA190312AB3" aria-describedby="rfc-hint">
        <p id="rfc-hint" class="hint">12 o 13 caracteres, como XAXX010101000.</p>
      </div>
    </div>
    <table>
      <caption>Conceptos</caption>
      <thead>
        <tr><th scope="col">Descripción</th><th scope="col">Cantidad</th><th scope="col">Precio unitario</th><th scope="col"><span class="visually-hidden">Quitar</span></th></tr>
      </thead>
      <tbody id="items"></tbody>
    </table>
    <button type="button" id="add-item">Añadir concepto</button>
    <dl class="totals">
      <dt>Subtotal</dt><dd><output id="subtotal">—</output></dd>
      <dt>IVA (16 %)</dt><dd><output id="tax">—</output></dd>
      <dt>Total</dt><dd><output id="total">—</output></dd>
    </dl>
    <button type="submit" class="primary">Emitir factura</button>
  </form>
  <template id="item-template">
    <tr>
      <td><input name="item_desc" required aria-label="Descripción"></td>
      <td><input name="item_qty" type="number" required min="1" step="1" value="1" class="number" aria-label="Cantidad"></td>
      <td><input name="item_price" type="number" required min="0.01" step="0.01" class="number" aria-label="Precio unitario"></td>
      <td><button type="button" class="remove" aria-label="Quitar concepto">✕</button></td>
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
  max-width: 40rem;
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
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
form {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
  overflow-x: auto;
}
.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.75rem;
}
.field {
  display: grid;
  gap: 0.2rem;
}
label,
caption {
  font-weight: 600;
  text-align: start;
}
.hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted);
}
table {
  border-collapse: collapse;
}
th,
td {
  padding: 0.25rem 0.4rem 0.25rem 0;
  text-align: start;
}
input,
button {
  font: inherit;
  color: var(--ink);
  padding: 0.3rem 0.45rem;
  border: 1px solid var(--field);
  border-radius: 0.375rem;
  background: var(--surface);
}
input.number {
  width: 7rem;
  text-align: end;
}
button {
  justify-self: start;
  cursor: pointer;
}
.totals {
  display: grid;
  grid-template-columns: max-content 8rem;
  gap: 0.2rem 1rem;
  justify-self: end;
  margin: 0;
}
.totals dd {
  margin: 0;
  text-align: end;
  font-variant-numeric: tabular-nums;
}
.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: #ffffff;
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
// Factura con conceptos dinámicos.
//
// Decisiones de diseño:
// - Cada concepto es una fila con los MISMOS nombres (item_desc, item_qty,
//   item_price): el formulario envía los pares repetidos en orden, y FormData los
//   devuelve con getAll; se juntan por posición en un array de objetos con números.
// - El dinero se suma en centavos (enteros) para no arrastrar decimales binarios.
// - Una cantidad o un precio vacío deja los totales en «—», no en un cero inventado.
// - El RFC se normaliza en input (mayúsculas, sin espacios) y lo valida su pattern.
// - Al quitar una fila, el foco pasa a la fila vecina (o a «Añadir concepto»).
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.
const form = document.querySelector('#invoice');
const tbody = document.querySelector('#items');
const template = document.querySelector('#item-template');
const logList = document.querySelector('#log');
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
let quiet = false;
let rowNumber = 0;
function logLine(text) {
  if (quiet) return;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
if (window.origin === 'null') document.querySelector('#card-notice').hidden = false;

function addItem(item = {}) {
  rowNumber += 1;
  const row = template.content.firstElementChild.cloneNode(true);
  const [desc, qty, price] = row.querySelectorAll('input');
  desc.defaultValue = item.desc ?? '';
  if (item.qty) qty.defaultValue = String(item.qty);
  if (item.price) price.defaultValue = String(item.price);
  for (const control of row.querySelectorAll('input, button')) {
    control.setAttribute('aria-label', `${control.getAttribute('aria-label')} ${rowNumber}`);
  }
  tbody.append(row);
  updateTotals();
  return row;
}

function readItems() {
  const formData = new FormData(form);
  const descs = formData.getAll('item_desc');
  const rows = [...tbody.rows];
  return descs.map((desc, i) => ({
    desc,
    qty: rows[i].querySelector('[name="item_qty"]').valueAsNumber,
    price: rows[i].querySelector('[name="item_price"]').valueAsNumber,
  }));
}
function updateTotals() {
  const items = readItems();
  const incomplete = items.some((item) => Number.isNaN(item.qty) || Number.isNaN(item.price));
  const subtotalCents = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.qty, 0);
  const taxCents = Math.round(subtotalCents * 16 / 100);
  const show = (cents) => (incomplete ? '—' : money.format(cents / 100));
  document.querySelector('#subtotal').textContent = show(subtotalCents);
  document.querySelector('#tax').textContent = show(taxCents);
  document.querySelector('#total').textContent = show(subtotalCents + taxCents);
  return incomplete ? null : { subtotal: subtotalCents / 100, tax: taxCents / 100, total: (subtotalCents + taxCents) / 100 };
}

form.addEventListener('input', (event) => {
  if (event.target.name === 'rfc') {
    const clean = event.target.value.toUpperCase().replace(/\s+/g, '');
    if (clean !== event.target.value) event.target.value = clean;
  }
  updateTotals();
});
document.querySelector('#add-item').addEventListener('click', () => {
  addItem().querySelector('input').focus();
  logLine(`➕ concepto ${tbody.rows.length}`);
});
tbody.addEventListener('click', (event) => {
  const button = event.target.closest('.remove');
  if (!button) return;
  const row = button.closest('tr');
  const neighbour = row.nextElementSibling ?? row.previousElementSibling;
  row.remove();
  (neighbour?.querySelector('.remove') ?? document.querySelector('#add-item')).focus();
  updateTotals();
  logLine(`➖ concepto quitado; quedan ${tbody.rows.length}`);
});
form.addEventListener('submit', (event) => {
  event.preventDefault(); // la validación nativa ya pasó
  if (tbody.rows.length === 0) {
    logLine('⚠️ añade al menos un concepto');
    document.querySelector('#add-item').focus();
    return;
  }
  const invoice = { client: form.elements.client.value, rfc: form.elements.rfc.value, items: readItems(), ...updateTotals() };
  logLine(`📨 factura → ${JSON.stringify(invoice)}`);
});

// ── Autocomprobación (simulada; deja los dos conceptos iniciales).
function audit() {
  quiet = true;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  addItem({ desc: 'Diseño de etiqueta', qty: 1, price: 3500 });
  addItem({ desc: 'Impresión de etiquetas', qty: 500, price: 4.2 });
  const totals = updateTotals();
  expect('3500 + 500 × 4.20: subtotal 5600, IVA 896, total 6496', totals.subtotal === 5600 && totals.tax === 896 && totals.total === 6496);
  expect('getAll junta las filas en objetos con números', JSON.stringify(readItems()[1]) === '{"desc":"Impresión de etiquetas","qty":500,"price":4.2}');
  const rfc = form.elements.rfc;
  rfc.value = 'mea 190312 ab3';
  rfc.dispatchEvent(new InputEvent('input', { bubbles: true }));
  expect('«mea 190312 ab3» se normaliza a MEA190312AB3 y cumple el pattern', rfc.value === 'MEA190312AB3' && !rfc.validity.patternMismatch);
  rfc.value = 'MEA-190312';
  expect('«MEA-190312» no es un RFC', rfc.validity.patternMismatch);
  rfc.value = rfc.defaultValue;
  const extra = addItem();
  extra.querySelector('[name="item_qty"]').value = '';
  expect('una cantidad vacía deja el total en «—»', updateTotals() === null && document.querySelector('#total').textContent === '—');
  extra.remove();
  updateTotals();
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: cambia la cantidad de etiquetas a 1000; añade un concepto «Envío» de $150; quita el diseño y pulsa «Emitir factura»');
```

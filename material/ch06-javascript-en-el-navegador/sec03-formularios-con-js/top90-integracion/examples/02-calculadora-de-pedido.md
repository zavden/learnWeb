---
example_description: "Una calculadora de pedido: valueAsNumber en cada input (NaN = cantidad pendiente), un cupón reconocido con una regex con grupo, el pedido habitual cargado en defaultValue/defaultSelected para que «Descartar cambios» (reset) vuelva a él, y «Guardar como habitual» que copia lo actual en los valores iniciales"
example_tags: "javascript|formularios|integracion|valueasnumber|reset|defaultvalue|regex|intl"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Pan para la cafetería · Panadería La Espiga</h1>
  <form id="order" action="/pedidos" method="post">
    <table>
      <caption>Tu pedido de mañana</caption>
      <thead><tr><th scope="col">Pieza</th><th scope="col">Precio</th><th scope="col">Cantidad</th></tr></thead>
      <tbody>
        <tr><th scope="row">Conchas</th><td>$18</td><td><input name="conchas" type="number" min="0" max="200" data-price="18" value="10" aria-label="Conchas"></td></tr>
        <tr><th scope="row">Bolillos</th><td>$4</td><td><input name="bolillos" type="number" min="0" max="200" data-price="4" value="25" aria-label="Bolillos"></td></tr>
        <tr><th scope="row">Orejas</th><td>$22</td><td><input name="orejas" type="number" min="0" max="200" data-price="22" value="5" aria-label="Orejas"></td></tr>
      </tbody>
    </table>
    <p>
      <label>Entrega
        <select name="delivery">
          <option value="pickup">Paso a recogerlo ($0)</option>
          <option value="delivery" selected>A domicilio ($60)</option>
        </select>
      </label>
    </p>
    <p><label>Cupón <input name="coupon" autocomplete="off" aria-describedby="coupon-hint"></label>
      <small id="coupon-hint">Como PAN10: PAN y el porcentaje de descuento.</small></p>
    <p class="total">Total: <output id="total" for="order">—</output></p>
    <p class="actions">
      <button type="button" id="discard">Descartar cambios</button>
      <button type="button" id="save">Guardar como habitual</button>
    </p>
  </form>
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
  margin-top: 0;
}
form {
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
table {
  border-collapse: collapse;
}
caption {
  text-align: start;
  font-weight: 600;
}
th,
td {
  padding: 0.25rem 0.75rem 0.25rem 0;
  text-align: start;
}
small {
  display: block;
  color: #52606d;
}
input,
select,
button {
  font: inherit;
  color: #1f2933;
  padding: 0.25rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
}
input[type="number"] {
  width: 5rem;
}
button {
  cursor: pointer;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.total {
  font-size: 1.1rem;
  font-weight: 700;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Combina: «Leer y escribir controles» (valueAsNumber, input, default*, reset),
// «FormData y envío» (FormData para guardar) y «Expresiones regulares» (grupos).
const form = document.querySelector('#order');
const logList = document.querySelector('#log');
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const SHIPPING = { pickup: 0, delivery: 60 };
const COUPON = /^PAN(\d{2})$/; // el grupo captura el porcentaje
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

let lastLine = '';
function recalculate() {
  const quantities = [...form.querySelectorAll('input[type="number"]')];
  const missing = quantities.find((input) => Number.isNaN(input.valueAsNumber));
  let line;
  if (missing) {
    form.querySelector('#total').textContent = '—';
    line = `⚠️ cantidad vacía en ${missing.name}: total pendiente`;
  } else {
    const subtotal = quantities.reduce((sum, input) => sum + input.valueAsNumber * Number(input.dataset.price), 0);
    const shipping = SHIPPING[form.elements.delivery.value];
    const match = form.elements.coupon.value.trim().toUpperCase().match(COUPON);
    const discount = match ? subtotal * Number(match[1]) / 100 : 0;
    const total = subtotal + shipping - discount;
    form.querySelector('#total').textContent = money.format(total);
    line = `💰 subtotal ${money.format(subtotal)} · envío ${money.format(shipping)} · descuento ${money.format(discount)} · total ${money.format(total)}`;
  }
  if (line !== lastLine) logLine(line); // solo cuando cambia algo (no en cada letra del cupón)
  lastLine = line;
}

// El pedido habitual, guardado (en un caso real llegaría del servidor):
// se carga en los valores INICIALES, para que reset() vuelva a él.
const usual = { conchas: 12, bolillos: 30, orejas: 6, delivery: 'pickup' };
function loadAsDefaults(data) {
  for (const name of ['conchas', 'bolillos', 'orejas']) form.elements[name].defaultValue = String(data[name]);
  for (const option of form.elements.delivery.options) option.defaultSelected = option.value === data.delivery;
}
loadAsDefaults(usual);
logLine('📦 cargado tu pedido habitual');
recalculate();

form.addEventListener('input', recalculate);
document.querySelector('#discard').addEventListener('click', () => {
  form.reset(); // vuelve a los valores iniciales… y no dispara input: recalculamos a mano
  logLine('↩️ cambios descartados');
  recalculate();
});
document.querySelector('#save').addEventListener('click', () => {
  if (!form.reportValidity()) return;
  const formData = new FormData(form);
  loadAsDefaults({ ...Object.fromEntries(formData) }); // lo actual pasa a ser lo inicial
  logLine(`💾 guardado como habitual → ${JSON.stringify(Object.fromEntries(formData))}`);
});
logLine('Listo: sube las conchas a 13 con la flecha, escribe el cupón PAN10, pulsa «Descartar cambios»; luego cambia algo y «Guardar como habitual»');
```

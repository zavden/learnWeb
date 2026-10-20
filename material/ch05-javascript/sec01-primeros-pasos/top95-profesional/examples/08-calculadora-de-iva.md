---
example_description: "Calculadora de IVA accesible: importe con coma o punto, con o sin IVA incluido, validación en vivo y desglose en céntimos"
example_tags: "javascript|profesional|formulario|iva|dinero|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <header class="app__header">
    <h1>Calculadora de IVA</h1>
    <p>Calcula la base imponible, el IVA y el total de una compra en España.</p>
  </header>

  <form id="vat-form" class="card" novalidate>
    <div class="field">
      <label for="amount">Importe por unidad (€)</label>
      <input id="amount" name="amount" type="text" inputmode="decimal" autocomplete="off"
             value="49,90" aria-describedby="amount-hint amount-error">
      <p id="amount-hint" class="hint">Admite coma o punto decimal: 19,99 o 19.99</p>
      <p id="amount-error" class="error" hidden></p>
    </div>

    <fieldset class="field">
      <legend>El importe…</legend>
      <label class="choice"><input type="radio" name="mode" value="net" checked> no incluye el IVA</label>
      <label class="choice"><input type="radio" name="mode" value="gross"> ya incluye el IVA</label>
    </fieldset>

    <div class="field">
      <label for="rate">Tipo de IVA</label>
      <select id="rate" name="rate">
        <option value="21" selected>General · 21 %</option>
        <option value="10">Reducido · 10 %</option>
        <option value="4">Superreducido · 4 %</option>
        <option value="0">Exento · 0 %</option>
      </select>
    </div>

    <div class="field">
      <label for="quantity">Unidades</label>
      <input id="quantity" name="quantity" type="number" inputmode="numeric" min="1" max="9999" step="1"
             value="2" aria-describedby="quantity-error">
      <p id="quantity-error" class="error" hidden></p>
    </div>
  </form>

  <section class="card result" aria-labelledby="result-title">
    <h2 id="result-title">Desglose</h2>
    <dl>
      <div class="row"><dt>Base imponible</dt><dd><output id="net-output">—</output></dd></div>
      <div class="row"><dt>IVA (<span id="rate-label">21</span> %)</dt><dd><output id="vat-output">—</output></dd></div>
      <div class="row row--total"><dt>Total</dt><dd><output id="gross-output">—</output></dd></div>
    </dl>
    <p class="hint">Los importes se calculan en céntimos y se redondean al céntimo más cercano.</p>
  </section>
</main>
```

# CSS

```css
:root {
  --text: #1b1f24;
  --muted: #545b66;
  --surface: #ffffff;
  --page: #f4f6f8;
  --border: #c4c9d0;
  --accent: #0b5cad;
  --error: #b3261e;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--page);
}

.app {
  max-width: 56rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  display: grid;
  gap: 1.25rem;
}

.app__header h1 {
  margin: 0;
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
}

.app__header p {
  margin: 0.25rem 0 0;
  color: var(--muted);
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.field {
  margin: 0 0 1rem;
  border: 0;
  padding: 0;
}

.field > label,
legend {
  display: block;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

input[type='text'],
input[type='number'],
select {
  width: 100%;
  font: inherit;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text);
}

input:focus-visible,
select:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

input[aria-invalid='true'] {
  border-color: var(--error);
  border-width: 2px;
}

.choice {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.2rem 0;
}

.hint,
.error {
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
}

.hint {
  color: var(--muted);
}

.error {
  color: var(--error);
  font-weight: 600;
}

.result h2 {
  margin-top: 0;
  font-size: 1.2rem;
}

.result dl {
  margin: 0;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);
}

.row dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.row--total {
  font-size: 1.25rem;
  font-weight: 700;
  border-bottom: 0;
}

@media (width >= 44rem) {
  .app {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }

  .app__header {
    grid-column: 1 / -1;
  }
}
```

# JavaScript

```javascript
// CALCULADORA DE IVA.
// Decisiones de diseño:
// - El importe se pide en un campo de TEXTO (no type="number"): así aceptamos la coma
//   decimal española y controlamos nosotros la conversión y los mensajes de error.
// - Todo el cálculo se hace en CÉNTIMOS enteros; solo se convierte a euros al mostrar.
// - La lógica (convertir, validar, calcular) no toca el DOM: se puede probar sola.
// Alcance: function se estudia en «Funciones y ámbito»; métodos de string en
// «Números, texto y colecciones»; el DOM y los eventos, en el capítulo 6.

// ── Lógica ──────────────────────────────────────────────────────────────

function parseAmountCents(text) {
  const clean = text.trim().replace(',', '.');
  if (clean === '') {
    throw new TypeError('Escribe un importe.'); // Number('') sería 0
  }
  const amount = Number(clean);
  if (Number.isNaN(amount)) {
    throw new TypeError(`«${text.trim()}» no es un importe válido.`);
  }
  if (amount < 0) {
    throw new RangeError('El importe no puede ser negativo.');
  }
  if (amount > 1000000) {
    throw new RangeError('El importe máximo es 1.000.000 €.');
  }
  return Math.round(amount * 100);
}

function parseQuantity(text) {
  if (text.trim() === '') {
    throw new TypeError('Indica cuántas unidades.');
  }
  const quantity = Number(text);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9999) {
    throw new RangeError('Las unidades deben ser un número entero entre 1 y 9999.');
  }
  return quantity;
}

// mode: 'net' (el importe NO incluye IVA) o 'gross' (el importe YA lo incluye).
function computeVat(unitCents, ratePercent, mode, quantity) {
  let netCents;
  let grossCents;
  switch (mode) {
    case 'net':
      netCents = unitCents * quantity;
      grossCents = netCents + Math.round(netCents * ratePercent / 100);
      break;
    case 'gross':
      // El total es exactamente lo que pagó el cliente; la base se deduce de él.
      grossCents = unitCents * quantity;
      netCents = Math.round(grossCents / (1 + ratePercent / 100));
      break;
    default:
      throw new RangeError(`Modo desconocido: «${mode}»`);
  }
  return { netCents: netCents, vatCents: grossCents - netCents, grossCents: grossCents };
}

// 123456 → '1.234,56 €'. (En producción: Intl.NumberFormat, módulo «Fechas e Intl».)
function formatEuros(cents) {
  const euros = String(Math.floor(cents / 100));
  const decimals = String(cents % 100).padStart(2, '0');
  let grouped = '';
  let digitsInGroup = 0;
  for (let i = euros.length - 1; i >= 0; i--) {
    if (digitsInGroup === 3) {
      grouped = '.' + grouped;
      digitsInGroup = 0;
    }
    grouped = euros[i] + grouped;
    digitsInGroup++;
  }
  return `${grouped},${decimals} €`;
}

// ── Interfaz ────────────────────────────────────────────────────────────
// querySelector busca un elemento; .value lee un campo; textContent cambia un texto;
// hidden lo muestra u oculta; addEventListener ejecuta una función cuando ocurre
// un evento. Todo esto se estudia en el capítulo 6.

const form = document.querySelector('#vat-form');
const amountInput = document.querySelector('#amount');
const amountError = document.querySelector('#amount-error');
const quantityInput = document.querySelector('#quantity');
const quantityError = document.querySelector('#quantity-error');
const rateSelect = document.querySelector('#rate');
const rateLabel = document.querySelector('#rate-label');
const netOutput = document.querySelector('#net-output');
const vatOutput = document.querySelector('#vat-output');
const grossOutput = document.querySelector('#gross-output');

function showFieldError(input, errorElement, message) {
  errorElement.textContent = message;
  errorElement.hidden = message === '';
  if (message === '') {
    input.removeAttribute('aria-invalid');
  } else {
    input.setAttribute('aria-invalid', 'true');
  }
}

function update() {
  let unitCents = null;
  let quantity = null;

  try {
    unitCents = parseAmountCents(amountInput.value);
    showFieldError(amountInput, amountError, '');
  } catch (error) {
    showFieldError(amountInput, amountError, error.message);
  }

  try {
    quantity = parseQuantity(quantityInput.value);
    showFieldError(quantityInput, quantityError, '');
  } catch (error) {
    showFieldError(quantityInput, quantityError, error.message);
  }

  const ratePercent = Number(rateSelect.value);
  const mode = document.querySelector('input[name="mode"]:checked').value;
  rateLabel.textContent = String(ratePercent);

  if (unitCents === null || quantity === null) {
    netOutput.textContent = '—';
    vatOutput.textContent = '—';
    grossOutput.textContent = '—';
    return;
  }

  const result = computeVat(unitCents, ratePercent, mode, quantity);
  netOutput.textContent = formatEuros(result.netCents);
  vatOutput.textContent = formatEuros(result.vatCents);
  grossOutput.textContent = formatEuros(result.grossCents);
}

function handleSubmit(event) {
  event.preventDefault(); // Enter en un campo no debe recargar la página
  update();
}

form.addEventListener('input', update); // se dispara al cambiar cualquier campo
form.addEventListener('submit', handleSubmit);
update();
console.log('Calculadora lista. Prueba importes como «19,99», «-5» o «abc».');
```

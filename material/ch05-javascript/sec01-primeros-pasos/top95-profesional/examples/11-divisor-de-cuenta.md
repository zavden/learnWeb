---
example_description: "Divisor de cuenta con propina: radios con opción personalizada, validación por campo y reparto justo de los céntimos sobrantes"
example_tags: "javascript|profesional|formulario|dinero|redondeo|accesibilidad"
example_stage: professional
example_importance: useful
console: true
---

# HTML

```html
<main class="app">
  <h1>Dividir la cuenta</h1>

  <form id="bill-form" class="card" novalidate>
    <div class="field">
      <label for="total">Total de la cuenta (€)</label>
      <input id="total" name="total" type="text" inputmode="decimal" autocomplete="off" value="86,40"
             aria-describedby="total-error">
      <p id="total-error" class="error" hidden></p>
    </div>

    <fieldset class="field">
      <legend>Propina</legend>
      <div class="tips">
        <label class="pill"><input type="radio" name="tip" value="0"> Sin propina</label>
        <label class="pill"><input type="radio" name="tip" value="5"> 5 %</label>
        <label class="pill"><input type="radio" name="tip" value="10" checked> 10 %</label>
        <label class="pill"><input type="radio" name="tip" value="15"> 15 %</label>
        <label class="pill"><input type="radio" name="tip" value="custom"> Otra</label>
      </div>
      <label class="inline" for="custom-tip">Propina personalizada (%)</label>
      <input id="custom-tip" name="customTip" type="number" inputmode="decimal" min="0" max="100" step="0.5"
             value="12" disabled aria-describedby="tip-error">
      <p id="tip-error" class="error" hidden></p>
    </fieldset>

    <div class="field">
      <label for="people">Personas</label>
      <input id="people" name="people" type="number" inputmode="numeric" min="1" max="50" step="1" value="3"
             aria-describedby="people-error">
      <p id="people-error" class="error" hidden></p>
    </div>
  </form>

  <section class="card result" aria-labelledby="result-title" aria-live="polite">
    <h2 id="result-title">Reparto</h2>
    <p id="summary" class="summary">—</p>
    <ul id="shares" class="shares"></ul>
  </section>
</main>
```

# CSS

```css
:root {
  --text: #1b1f24;
  --muted: #545b66;
  --page: #f4f6f8;
  --surface: #ffffff;
  --border: #c4c9d0;
  --accent: #0b5cad;
  --accent-bg: #e7f0fa;
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
  max-width: 52rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  display: grid;
  gap: 1.25rem;
}

h1 {
  margin: 0;
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
}

h2 {
  margin-top: 0;
  font-size: 1.15rem;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.field {
  margin: 0 0 1.1rem;
  border: 0;
  padding: 0;
}

.field > label,
legend,
.inline {
  display: block;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.inline {
  margin-top: 0.75rem;
  font-weight: 500;
}

input[type='text'],
input[type='number'] {
  width: 100%;
  font: inherit;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
}

input:disabled {
  background: var(--page);
  color: var(--muted);
}

input:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

input[aria-invalid='true'] {
  border: 2px solid var(--error);
}

.tips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  cursor: pointer;
}

.pill:has(input:checked) {
  border-color: var(--accent);
  background: var(--accent-bg);
  font-weight: 600;
}

.error {
  margin: 0.3rem 0 0;
  color: var(--error);
  font-weight: 600;
  font-size: 0.9rem;
}

.summary {
  margin: 0 0 0.75rem;
  color: var(--muted);
}

.shares {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.5rem;
}

.shares li {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: var(--accent-bg);
  font-size: 1.15rem;
  font-variant-numeric: tabular-nums;
}

@media (width >= 44rem) {
  .app {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }

  h1 {
    grid-column: 1 / -1;
  }
}
```

# JavaScript

```javascript
// DIVIDIR LA CUENTA CON PROPINA.
//
// El problema interesante es el redondeo: 95,04 € entre 3 personas son 31,68 € cada
// una, pero 100,00 € entre 3 son 33,333… Nadie puede pagar fracciones de céntimo.
// Solución profesional: trabajar en céntimos, dar a todos la parte entera
// (Math.floor) y repartir los céntimos SOBRANTES (el resto, %) de uno en uno.
// Así la suma de lo que paga cada persona coincide EXACTAMENTE con el total.
//
// Alcance: function se estudia en «Funciones y ámbito»; métodos de string en
// «Números, texto y colecciones»; el DOM y los eventos, en el capítulo 6.

// ── Lógica ──────────────────────────────────────────────────────────────

function parseTotalCents(text) {
  const clean = text.trim().replace(',', '.');
  if (clean === '') {
    throw new TypeError('Escribe el total de la cuenta.');
  }
  const amount = Number(clean);
  if (Number.isNaN(amount) || amount <= 0) {
    throw new RangeError('El total debe ser un importe mayor que 0.');
  }
  return Math.round(amount * 100);
}

function parseTipPercent(choice, customText) {
  if (choice !== 'custom') {
    return Number(choice); // los valores de los radios los controlamos nosotros
  }
  if (customText.trim() === '') {
    throw new TypeError('Escribe el porcentaje de propina.');
  }
  const percent = Number(customText.replace(',', '.'));
  if (Number.isNaN(percent) || percent < 0 || percent > 100) {
    throw new RangeError('La propina debe estar entre 0 y 100 %.');
  }
  return percent;
}

function parsePeople(text) {
  const people = Number(text);
  if (text.trim() === '' || !Number.isInteger(people) || people < 1 || people > 50) {
    throw new RangeError('Indica un número entero de personas entre 1 y 50.');
  }
  return people;
}

function splitBill(totalCents, tipPercent, people) {
  const tipCents = Math.round(totalCents * tipPercent / 100);
  const grandTotalCents = totalCents + tipCents;
  return {
    tipCents: tipCents,
    grandTotalCents: grandTotalCents,
    baseShareCents: Math.floor(grandTotalCents / people),
    extraCents: grandTotalCents % people, // tantas personas pagan 1 céntimo más
    people: people,
  };
}

function formatEuros(cents) {
  return `${(cents / 100).toFixed(2).replace('.', ',')} €`;
}

function pluralPeople(count) {
  return count === 1 ? '1 persona paga' : `${count} personas pagan`;
}

// ── Interfaz ────────────────────────────────────────────────────────────
// querySelector busca un elemento; .value y .disabled leen y cambian un campo;
// textContent cambia un texto; createElement y append crean elementos nuevos;
// addEventListener reacciona a eventos. Todo esto se estudia en el capítulo 6.

const form = document.querySelector('#bill-form');
const totalInput = document.querySelector('#total');
const customTipInput = document.querySelector('#custom-tip');
const peopleInput = document.querySelector('#people');
const summary = document.querySelector('#summary');
const sharesList = document.querySelector('#shares');

function setError(input, errorId, message) {
  const errorElement = document.querySelector(errorId);
  errorElement.textContent = message;
  errorElement.hidden = message === '';
  if (message === '') {
    input.removeAttribute('aria-invalid');
  } else {
    input.setAttribute('aria-invalid', 'true');
  }
}

function addShare(text) {
  const item = document.createElement('li');
  item.textContent = text;
  sharesList.append(item);
}

function update() {
  const tipChoice = document.querySelector('input[name="tip"]:checked').value;
  customTipInput.disabled = tipChoice !== 'custom';

  let totalCents = null;
  let tipPercent = null;
  let people = null;

  try {
    totalCents = parseTotalCents(totalInput.value);
    setError(totalInput, '#total-error', '');
  } catch (error) {
    setError(totalInput, '#total-error', error.message);
  }
  try {
    tipPercent = parseTipPercent(tipChoice, customTipInput.value);
    setError(customTipInput, '#tip-error', '');
  } catch (error) {
    setError(customTipInput, '#tip-error', error.message);
  }
  try {
    people = parsePeople(peopleInput.value);
    setError(peopleInput, '#people-error', '');
  } catch (error) {
    setError(peopleInput, '#people-error', error.message);
  }

  sharesList.textContent = ''; // vacía la lista anterior
  if (totalCents === null || tipPercent === null || people === null) {
    summary.textContent = 'Corrige los datos marcados para ver el reparto.';
    return;
  }

  const split = splitBill(totalCents, tipPercent, people);
  summary.textContent = `Cuenta ${formatEuros(totalCents)} + propina ${formatEuros(split.tipCents)} = ${formatEuros(split.grandTotalCents)}`;

  const regularPayers = split.people - split.extraCents;
  if (regularPayers > 0) {
    addShare(`${pluralPeople(regularPayers)} ${formatEuros(split.baseShareCents)}`);
  }
  if (split.extraCents > 0) {
    addShare(`${pluralPeople(split.extraCents)} ${formatEuros(split.baseShareCents + 1)}`);
  }
}

function handleSubmit(event) {
  event.preventDefault(); // Enter no debe recargar la página
  update();
}

form.addEventListener('input', update);
form.addEventListener('submit', handleSubmit);
update();
console.log('Prueba 100 € sin propina entre 3 personas: verás cómo se reparte el céntimo sobrante.');
```

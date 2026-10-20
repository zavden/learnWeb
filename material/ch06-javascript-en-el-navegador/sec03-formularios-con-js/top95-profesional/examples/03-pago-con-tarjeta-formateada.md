---
example_description: "Un pago con tarjeta: el número se agrupa mientras se escribe (4-4-4-4, o 4-6-5 en American Express) conservando la posición del cursor, aguanta pegados con guiones y la escritura con IME (espera a compositionend), borra cifra y espacio de una vez, detecta la marca con regex, comprueba el dígito de control (Luhn) con setCustomValidity y formatea la caducidad MM/AA"
example_tags: "javascript|formularios|profesional|tarjeta|formateo|cursor|beforeinput|ime|regex|luhn|setcustomvalidity"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Pago del pedido · $565.00</h1>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí los formularios no se envían: ábrelo con «▶ Run» o en el editor.</p>
  <form id="payment" action="/pago" method="post">
    <label for="cc-name">Titular</label>
    <input id="cc-name" name="cc_name" required autocomplete="cc-name">
    <label for="cc-number">Número de tarjeta <output id="brand" for="cc-number"></output></label>
    <input id="cc-number" name="cc_number" required inputmode="numeric" autocomplete="cc-number" aria-describedby="cc-number-hint">
    <p id="cc-number-hint" class="hint">Puedes pegarlo con espacios o guiones.</p>
    <div class="row">
      <div class="field">
        <label for="cc-exp">Caducidad (MM/AA)</label>
        <input id="cc-exp" name="cc_exp" required inputmode="numeric" autocomplete="cc-exp" maxlength="5" pattern="(?:0[1-9]|1[0-2])/\d{2}">
      </div>
      <div class="field">
        <label for="cc-csc">Código de seguridad</label>
        <input id="cc-csc" name="cc_csc" required inputmode="numeric" autocomplete="cc-csc" pattern="\d{3}" maxlength="4">
      </div>
    </div>
    <button type="submit" class="primary">Pagar $565.00</button>
  </form>
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
  max-width: 30rem;
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
form {
  display: grid;
  gap: 0.3rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
}
label {
  margin-top: 0.4rem;
  font-weight: 600;
}
#brand {
  margin-left: 0.5rem;
  font-weight: 400;
  color: var(--muted);
}
.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0 1rem;
}
.field {
  display: grid;
}
.hint {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted);
}
input,
button {
  font: inherit;
  color: var(--ink);
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--field);
  border-radius: 0.375rem;
  background: var(--surface);
}
#cc-number {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}
.primary {
  justify-self: start;
  margin-top: 0.75rem;
  padding: 0.45rem 1rem;
  border-color: var(--accent);
  background: var(--accent);
  color: #ffffff;
  cursor: pointer;
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
}
```

# JavaScript

```javascript
// Pago con tarjeta: formatear sin estorbar.
//
// Decisiones de diseño:
// - El formato se aplica en input, sobre las CIFRAS (todo lo demás se quita con \D):
//   da igual si llegan tecleadas, pegadas con guiones o de un autocompletado.
// - Reescribir value mueve el cursor al final; se recoloca contando cifras: el
//   cursor vuelve a quedar detrás de la misma cifra que antes.
// - Con un IME, value está a medias (isComposing): se espera a compositionend.
// - Retroceso justo detrás de un espacio borraría el espacio, que el formato vuelve
//   a poner: beforeinput lo cancela y borra la cifra anterior.
// - Marca por regex (4 Visa, 51-55/22-27 Mastercard, 34/37 Amex), Luhn como regla
//   propia (setCustomValidity) y la validación nativa para lo demás (aquí basta).
// - Los datos de la tarjeta nunca se imprimen enteros.
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.
const form = document.querySelector('#payment');
const cardInput = form.elements.cc_number;
const expiryInput = form.elements.cc_exp;
const logList = document.querySelector('#log');
let quiet = false;
function logLine(text) {
  if (quiet) return;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
if (window.origin === 'null') document.querySelector('#card-notice').hidden = false;

const BRANDS = [
  { name: 'Visa', test: /^4/, groups: [4, 4, 4, 4, 3], cvc: 3 },
  { name: 'Mastercard', test: /^(?:5[1-5]|2[2-7])/, groups: [4, 4, 4, 4], cvc: 3 },
  { name: 'American Express', test: /^3[47]/, groups: [4, 6, 5], cvc: 4 },
];
const DEFAULT_BRAND = { name: '', groups: [4, 4, 4, 4, 3], cvc: 3 };
const brandOf = (digits) => BRANDS.find((brand) => brand.test.test(digits)) ?? DEFAULT_BRAND;

function formatCard(digits) {
  const parts = [];
  let index = 0;
  for (const size of brandOf(digits).groups) {
    if (index >= digits.length) break;
    parts.push(digits.slice(index, index + size));
    index += size;
  }
  return parts.join(' ');
}
// Posición justo detrás de la cifra número `count` dentro del texto formateado.
function caretAfterDigits(formatted, count) {
  let seen = 0;
  for (let i = 0; i < formatted.length && seen < count; i += 1) {
    if (/\d/.test(formatted[i])) seen += 1;
    if (seen === count) return i + 1;
  }
  return count === 0 ? 0 : formatted.length;
}
function luhnValid(digits) {
  let sum = 0;
  [...digits].reverse().forEach((char, i) => {
    let value = Number(char);
    if (i % 2 === 1) value = value * 2 > 9 ? value * 2 - 9 : value * 2;
    sum += value;
  });
  return digits.length >= 13 && sum % 10 === 0;
}

function applyCard(raw, digitsBeforeCaret) {
  const brand = brandOf(raw.replace(/\D/g, ''));
  const maxDigits = brand.groups.reduce((sum, size) => sum + size, 0);
  const digits = raw.replace(/\D/g, '').slice(0, maxDigits);
  const formatted = formatCard(digits);
  if (formatted !== cardInput.value) {
    cardInput.value = formatted;
    const caret = caretAfterDigits(formatted, Math.min(digitsBeforeCaret, digits.length));
    cardInput.setSelectionRange(caret, caret);
  }
  document.querySelector('#brand').textContent = brand.name ? `· ${brand.name}` : '';
  form.elements.cc_csc.pattern = String.raw`\d{${brand.cvc}}`;
  cardInput.setCustomValidity(digits.length > 0 && !luhnValid(digits) ? 'Revisa el número: no es un número de tarjeta válido.' : '');
}
function reformat() {
  const caret = cardInput.selectionStart ?? cardInput.value.length;
  applyCard(cardInput.value, cardInput.value.slice(0, caret).replace(/\D/g, '').length);
}

cardInput.addEventListener('beforeinput', (event) => {
  const { selectionStart: start, selectionEnd: end, value } = cardInput;
  if (event.inputType !== 'deleteContentBackward' || start !== end || value[start - 1] !== ' ') return;
  event.preventDefault(); // borrar solo el espacio no haría nada: se borra la cifra de antes
  const digitsBefore = value.slice(0, start).replace(/\D/g, '').length;
  applyCard(value.slice(0, start - 2) + value.slice(start), digitsBefore - 1);
});
cardInput.addEventListener('input', (event) => {
  if (event.isComposing) return; // texto de un IME a medias: espera a compositionend
  reformat();
});
cardInput.addEventListener('compositionend', reformat);

// Caducidad: «1228» → «12/28»; la barra se pone sola.
expiryInput.addEventListener('input', (event) => {
  if (event.isComposing || event.inputType?.startsWith('delete')) return; // al borrar, no se reinserta
  const digits = expiryInput.value.replace(/\D/g, '').slice(0, 4);
  const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  if (formatted !== expiryInput.value) expiryInput.value = formatted;
});
const isExpired = (mmyy, now) => {
  const [month, year] = mmyy.split('/').map(Number);
  return 2000 + year < now.getFullYear() || (2000 + year === now.getFullYear() && month < now.getMonth() + 1);
};
expiryInput.addEventListener('change', () => {
  const expired = !expiryInput.validity.patternMismatch && isExpired(expiryInput.value, new Date());
  expiryInput.setCustomValidity(expired ? 'Esta tarjeta ya caducó.' : '');
});

form.addEventListener('submit', (event) => {
  event.preventDefault(); // la validación nativa ya pasó (sin novalidate)
  const digits = cardInput.value.replace(/\D/g, '');
  logLine(`💳 ${brandOf(digits).name || 'Tarjeta'} •••• ${digits.slice(-4)} · caduca ${expiryInput.value} · pago enviado`);
});

// ── Autocomprobación (simulada; deja el formulario vacío).
function audit() {
  quiet = true;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  expect('Visa en grupos de 4: 4242 4242 4242 4242', formatCard('4242424242424242') === '4242 4242 4242 4242');
  expect('American Express en 4-6-5: 3782 822463 10005', formatCard('378282246310005') === '3782 822463 10005');
  expect('el cursor tras la 5.ª cifra va en la posición 6', caretAfterDigits('4242 4242', 5) === 6);
  expect('Luhn: 4242 4242 4242 4242 sí, …4241 no', luhnValid('4242424242424242') && !luhnValid('4242424242424241'));
  cardInput.value = '4242-4242 4242.4242';
  cardInput.setSelectionRange(cardInput.value.length, cardInput.value.length);
  reformat();
  expect('lo pegado con guiones se reformatea y es válido', cardInput.value === '4242 4242 4242 4242' && cardInput.validity.valid);
  cardInput.value = '4242 4';
  cardInput.setSelectionRange(5, 5); // justo detrás del espacio
  cardInput.dispatchEvent(new InputEvent('beforeinput', { inputType: 'deleteContentBackward', cancelable: true }));
  expect('Retroceso tras un espacio borra la cifra anterior: «4244»', cardInput.value === '4244');
  const reference = new Date(2026, 9, 14); // 14 de octubre de 2026, hora local
  expect('caducidad: 09/26 caducada y 10/26 vigente (en octubre de 2026)', isExpired('09/26', reference) && !isExpired('10/26', reference));
  form.reset();
  reformat();
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: escribe 4242424242424242 (mira el cursor), borra con Retroceso tras un espacio; pega 3782-822463-10005; caducidad 1228');
```

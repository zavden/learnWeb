---
example_description: "Comprobador de IBAN en vivo: normalización, longitud por país y dígitos de control módulo 97 con BigInt (number no es exacto con 30 dígitos)"
example_tags: "javascript|profesional|validacion|iban|bigint|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Comprobador de IBAN</h1>
  <p class="intro">Escribe o pega un número de cuenta. La comprobación se hace en tu navegador: el número no se envía a ningún sitio.</p>

  <form id="iban-form" class="card" novalidate>
    <label for="iban">IBAN</label>
    <input id="iban" name="iban" type="text" list="iban-samples" autocomplete="off" spellcheck="false"
           autocapitalize="characters" aria-describedby="iban-status" value="ES91 2100 0418 4502 0005 1332">
    <datalist id="iban-samples">
      <option value="ES91 2100 0418 4502 0005 1332">España (válido)</option>
      <option value="DE89 3704 0044 0532 0130 00">Alemania (válido)</option>
      <option value="FR14 2004 1010 0505 0001 3M02 606">Francia (válido)</option>
      <option value="GB29 NWBK 6016 1331 9268 19">Reino Unido (válido)</option>
      <option value="ES91 2100 0418 4502 0005 1333">España (un dígito cambiado)</option>
    </datalist>
    <p class="hint">Haz doble clic en el campo (o pulsa ↓) para ver ejemplos.</p>

    <p id="iban-status" class="status" role="status" data-state="empty"></p>
    <p class="formatted">Formato de impresión: <output id="iban-formatted">—</output></p>

    <h2>Comprobaciones</h2>
    <ul class="checks">
      <li id="check-chars" data-state="pending">Solo letras y números</li>
      <li id="check-country" data-state="pending">Empieza por un código de país y dos dígitos de control</li>
      <li id="check-length" data-state="pending">Longitud correcta para el país</li>
      <li id="check-mod97" data-state="pending">Dígitos de control correctos (módulo 97)</li>
    </ul>
  </form>
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
  --ok-text: #1a6b3c;
  --ok-bg: #e8f5ec;
  --bad-text: #9b1c1c;
  --bad-bg: #fdecec;
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
  max-width: 40rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
}

h1 {
  margin: 0 0 0.25rem;
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
}

h2 {
  font-size: 1.05rem;
  margin: 1.25rem 0 0.5rem;
}

.intro,
.hint {
  color: var(--muted);
}

.hint {
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.25rem;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

input {
  width: 100%;
  font: 1.1rem ui-monospace, 'SF Mono', Menlo, monospace;
  letter-spacing: 0.04em;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  text-transform: uppercase;
}

input:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.status {
  margin: 1rem 0 0;
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

.status[data-state='empty'] {
  padding: 0;
}

.status[data-state='valid'] {
  color: var(--ok-text);
  background: var(--ok-bg);
}

.status[data-state='invalid'] {
  color: var(--bad-text);
  background: var(--bad-bg);
}

.formatted output {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  overflow-wrap: anywhere;
}

.checks {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.35rem;
}

.checks li::before {
  display: inline-block;
  width: 1.5rem;
  font-weight: 700;
}

.checks li[data-state='ok']::before {
  content: '✓';
  color: var(--ok-text);
}

.checks li[data-state='fail']::before {
  content: '✗';
  color: var(--bad-text);
}

.checks li[data-state='pending'] {
  color: var(--muted);
}

.checks li[data-state='pending']::before {
  content: '·';
}
```

# JavaScript

```javascript
// COMPROBADOR DE IBAN (número de cuenta bancaria internacional).
//
// Algoritmo de los dígitos de control (ISO 13616):
//   1. Se mueven los 4 primeros caracteres al final: ES91 2100… → 2100…ES91
//   2. Cada letra se cambia por un número: A = 10, B = 11 … Z = 35.
//   3. El número resultante % 97 debe dar 1.
// Ese número tiene entre 20 y 40 dígitos: number solo es exacto hasta 2 ** 53
// (16 dígitos), así que el resto saldría MAL. Por eso usamos BigInt (lección 4).
//
// Alcance: function se estudia en «Funciones y ámbito»; objetos y métodos de string
// (toUpperCase, slice, charCodeAt) en «Números, texto y colecciones»; el DOM y los
// eventos, en el capítulo 6.

// ── Lógica ──────────────────────────────────────────────────────────────

// Longitud oficial del IBAN en algunos países (la lista completa tiene ~90).
const IBAN_LENGTHS = {
  AT: 20, BE: 16, CH: 21, DE: 22, ES: 24, FR: 27, GB: 22, IE: 22, IT: 27, NL: 18, PT: 25,
};

function isDigit(ch) {
  return ch >= '0' && ch <= '9';
}

function isLetter(ch) {
  return ch >= 'A' && ch <= 'Z';
}

// ' es91-2100 0418 ' → 'ES9121000418'
function normalizeIban(text) {
  let clean = '';
  for (const ch of text.toUpperCase()) {
    if (ch !== ' ' && ch !== '-') {
      clean += ch;
    }
  }
  return clean;
}

// 'ES9121000418…' → 'ES91 2100 0418 …' (grupos de 4, como se imprime en papel)
function formatIban(iban) {
  let formatted = '';
  for (let i = 0; i < iban.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formatted += ' ';
    }
    formatted += iban[i];
  }
  return formatted;
}

// Convierte el IBAN reordenado en la cadena de dígitos que se divide entre 97.
function toNumericString(iban) {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let numeric = '';
  for (const ch of rearranged) {
    // 'A'.charCodeAt(0) es 65; 65 - 55 = 10. Así A → 10 … Z → 35.
    numeric += isLetter(ch) ? String(ch.charCodeAt(0) - 55) : ch;
  }
  return numeric;
}

// Devuelve el estado de cada comprobación: 'ok', 'fail' o 'pending' (no evaluada
// porque falló una anterior), más un mensaje para la persona usuaria.
function validateIban(text) {
  const iban = normalizeIban(text);
  const result = {
    iban: iban,
    chars: 'pending',
    country: 'pending',
    length: 'pending',
    mod97: 'pending',
    valid: false,
    message: '',
  };

  if (iban === '') {
    return result;
  }

  for (const ch of iban) {
    if (!isDigit(ch) && !isLetter(ch)) {
      result.chars = 'fail';
      result.message = `El carácter «${ch}» no puede aparecer en un IBAN.`;
      return result;
    }
  }
  result.chars = 'ok';

  if (iban.length < 4 || !isLetter(iban[0]) || !isLetter(iban[1]) || !isDigit(iban[2]) || !isDigit(iban[3])) {
    result.country = 'fail';
    result.message = 'Un IBAN empieza por dos letras de país y dos dígitos (por ejemplo, ES91).';
    return result;
  }
  result.country = 'ok';

  const country = iban.slice(0, 2);
  const expectedLength = IBAN_LENGTHS[country];
  // typeof y no «=== undefined»: IBAN_LENGTHS hereda propiedades como toString.
  const knownCountry = typeof expectedLength === 'number';
  let lengthOk;
  if (knownCountry) {
    lengthOk = iban.length === expectedLength;
  } else {
    lengthOk = iban.length >= 15 && iban.length <= 34; // límites generales del estándar
  }
  if (!lengthOk) {
    result.length = 'fail';
    result.message = knownCountry
      ? `Un IBAN de ${country} tiene ${expectedLength} caracteres; este tiene ${iban.length}.`
      : `Un IBAN tiene entre 15 y 34 caracteres; este tiene ${iban.length}.`;
    return result;
  }
  result.length = 'ok';

  if (BigInt(toNumericString(iban)) % 97n !== 1n) {
    result.mod97 = 'fail';
    result.message = 'Los dígitos de control no cuadran: probablemente hay una errata.';
    return result;
  }
  result.mod97 = 'ok';
  result.valid = true;
  result.message = knownCountry
    ? `IBAN válido (${country}).`
    : `IBAN con formato válido (${country}: país no comprobado en esta lista).`;
  return result;
}

// ── Interfaz ────────────────────────────────────────────────────────────
// querySelector busca un elemento; .value lee el campo; textContent y dataset
// cambian su texto y sus atributos data-*; addEventListener reacciona a eventos.
// Todo esto se estudia en el capítulo 6.

const input = document.querySelector('#iban');
const statusMessage = document.querySelector('#iban-status');
const formatted = document.querySelector('#iban-formatted');
const checkItems = {
  chars: document.querySelector('#check-chars'),
  country: document.querySelector('#check-country'),
  length: document.querySelector('#check-length'),
  mod97: document.querySelector('#check-mod97'),
};

function render() {
  const result = validateIban(input.value);
  for (const key in checkItems) {
    checkItems[key].dataset.state = result[key];
  }
  formatted.textContent = result.iban === '' ? '—' : formatIban(result.iban);
  statusMessage.textContent = result.message;
  if (result.iban === '') {
    statusMessage.dataset.state = 'empty';
  } else {
    statusMessage.dataset.state = result.valid ? 'valid' : 'invalid';
  }
  if (result.iban === '') {
    input.removeAttribute('aria-invalid');
  } else {
    input.setAttribute('aria-invalid', String(!result.valid));
  }
}

function handleSubmit(event) {
  event.preventDefault(); // Enter no debe recargar la página
}

input.addEventListener('input', render);
document.querySelector('#iban-form').addEventListener('submit', handleSubmit);
render();

// Por qué hace falta BigInt, con el IBAN de ejemplo:
const sampleDigits = toNumericString('ES9121000418450200051332');
console.log(`Número a dividir: ${sampleDigits} (${sampleDigits.length} dígitos)`);
console.log('Con BigInt, resto =', BigInt(sampleDigits) % 97n, '✅ (debe ser 1n)');
console.log('Con number, resto =', Number(sampleDigits) % 97, '❌ (number ya perdió los últimos dígitos)');
```

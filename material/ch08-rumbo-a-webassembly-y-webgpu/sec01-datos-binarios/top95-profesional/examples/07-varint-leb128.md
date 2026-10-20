---
example_description: "Enteros de tamaño variable LEB128 (los de WebAssembly, Protocol Buffers y DWARF): codificar y decodificar con y sin signo usando BigInt, grupos de 7 bits y el bit de continuación; validar secuencias cortadas o demasiado largas, y comprimir 1000 identificadores con deltas frente a un Uint32Array"
example_tags: "javascript|leb128|varint|bigint|bits|webassembly|compresion|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="leb-app">
  <h1>Enteros LEB128</h1>
  <div class="controls">
    <label>Número <input id="number" type="text" value="624485" inputmode="numeric" autocomplete="off" spellcheck="false"></label>
    <fieldset>
      <legend>Tipo</legend>
      <label><input type="radio" name="kind" value="unsigned" checked> sin signo</label>
      <label><input type="radio" name="kind" value="signed"> con signo</label>
    </fieldset>
  </div>
  <p id="result" class="result" role="status"></p>
  <ol id="groups" class="groups" aria-label="Bytes y sus grupos de 7 bits"></ol>
  <h2>Ejemplos</h2>
  <table>
    <thead><tr><th scope="col">Valor</th><th scope="col">Tipo</th><th scope="col">Bytes</th></tr></thead>
    <tbody id="examples"></tbody>
  </table>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --cont: #6d28d9; --bad-ink: #7f1d1d; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.leb-app { max-width: 38rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0 0 0.75rem; font-size: 1.25rem; }
h2 { margin: 1rem 0 0.5rem; font-size: 1rem; }
.controls { display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem; align-items: end; }
.controls > label { display: grid; gap: 0.2rem; }
input[type="text"] { inline-size: 16rem; font: inherit; font-family: Menlo, Consolas, monospace; padding: 0.3rem 0.5rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); color: var(--ink); }
fieldset { display: flex; gap: 0.75rem; margin: 0; border: 1px solid var(--line); border-radius: 0.5rem; }
input:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.result { font-weight: 600; overflow-wrap: anywhere; }
.result[data-error] { color: var(--bad-ink); }
.groups { display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0; list-style: none; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
.groups li { padding: 0.25rem 0.5rem; border: 1px solid var(--line); border-radius: 0.4rem; background: var(--surface); text-align: center; }
.groups .cont { color: var(--cont); font-weight: 700; }
table { border-collapse: collapse; font-size: 0.85rem; }
th, td { padding: 0.15rem 0.75rem 0.15rem 0; border-bottom: 1px solid var(--line); text-align: start; }
td:nth-child(odd) { font-family: Menlo, Consolas, monospace; }
.log { margin: 1rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// LEB128 («Little Endian Base 128»): un entero en grupos de 7 bits, del menos al más
// significativo. Cada byte lleva 7 bits del número y, arriba, un bit de
// continuación: 1 = «sigue otro byte», 0 = «este es el último».
//
// Decisiones de diseño:
// - BigInt para todo: los enteros de 64 bits de WebAssembly no caben en un number
//   (y los operadores de bits de number se quedan en 32, lección «Bits y bytes»).
// - Con signo, el número se desplaza con >> (que en BigInt conserva el signo) y se
//   termina cuando lo que queda es todo ceros o todo unos y el bit 6 del último
//   byte ya lo dice.
// - Decodificar valida: una secuencia que acaba con el bit de continuación es un
//   archivo cortado, y más de 10 bytes no es un entero de 64 bits.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const hexBytes = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');

function encodeUnsigned(value) {
  if (value < 0n) throw new RangeError('un LEB128 sin signo no admite negativos');
  const bytes = [];
  do {
    let byte = Number(value & 0x7fn);
    value >>= 7n;
    if (value !== 0n) byte |= 0x80; // quedan bits: enciende la continuación
    bytes.push(byte);
  } while (value !== 0n);
  return Uint8Array.from(bytes);
}

function encodeSigned(value) {
  const bytes = [];
  for (;;) {
    const byte = Number(value & 0x7fn);
    value >>= 7n; // en BigInt, >> conserva el signo
    const signBitClear = (byte & 0x40) === 0;
    const done = (value === 0n && signBitClear) || (value === -1n && !signBitClear);
    bytes.push(done ? byte : byte | 0x80);
    if (done) return Uint8Array.from(bytes);
  }
}

function decode(bytes, signed, offset = 0) {
  let result = 0n;
  let shift = 0n;
  for (let index = offset; index < bytes.length; index += 1) {
    if (index - offset >= 10) throw new RangeError('más de 10 bytes: no es un entero de 64 bits');
    const byte = bytes[index];
    result |= BigInt(byte & 0x7f) << shift;
    shift += 7n;
    if ((byte & 0x80) === 0) {
      if (signed && (byte & 0x40) !== 0) result -= 1n << shift; // extender el signo
      return { value: result, length: index - offset + 1 };
    }
  }
  throw new RangeError('secuencia cortada: el último byte pide continuación');
}

function groupsOf(bytes) {
  return Array.from(bytes, (byte) => {
    const item = document.createElement('li');
    const bits = byte.toString(2).padStart(8, '0');
    item.append(`${byte.toString(16).padStart(2, '0')} = `, Object.assign(document.createElement('span'), { className: 'cont', textContent: bits[0] }), `|${bits.slice(1)}`);
    return item;
  });
}

function update() {
  const text = document.querySelector('#number').value.trim();
  const signed = document.querySelector('[name="kind"]:checked').value === 'signed';
  const result = document.querySelector('#result');
  try {
    if (!/^-?\d+$/.test(text)) throw new SyntaxError('escribe un entero, sin decimales ni separadores');
    const value = BigInt(text);
    if (signed ? value < -(2n ** 63n) || value >= 2n ** 63n : value >= 2n ** 64n) throw new RangeError('no cabe en 64 bits');
    const bytes = signed ? encodeSigned(value) : encodeUnsigned(value);
    const back = decode(bytes, signed).value;
    result.textContent = `${value} → ${hexBytes(bytes)} (${bytes.length} byte${bytes.length === 1 ? '' : 's'}) · decodificado: ${back} ${back === value ? '✅' : '❌'}`;
    result.removeAttribute('data-error');
    document.querySelector('#groups').replaceChildren(...groupsOf(bytes));
  } catch (error) {
    result.textContent = `⚠️ ${error.message}`;
    result.dataset.error = '';
    document.querySelector('#groups').replaceChildren();
  }
  return result.textContent;
}

// Tabla de ejemplos (los de 624485 y -123456 son los de la especificación de DWARF).
const EXAMPLES = [[0n, false], [127n, false], [128n, false], [300n, false], [624485n, false], [2n ** 32n - 1n, false], [-1n, true], [63n, true], [64n, true], [-123456n, true], [2n ** 63n - 1n, true]];
document.querySelector('#examples').replaceChildren(...EXAMPLES.map(([value, signed]) => {
  const row = document.createElement('tr');
  const bytes = signed ? encodeSigned(value) : encodeUnsigned(value);
  for (const text of [String(value), signed ? 'con signo' : 'sin signo', hexBytes(bytes)]) row.append(Object.assign(document.createElement('td'), { textContent: text }));
  return row;
}));
for (const [value, signed] of EXAMPLES.slice(3, 10)) logLine(`${signed ? 'i' : 'u'} ${value} → ${hexBytes(signed ? encodeSigned(value) : encodeUnsigned(value))}`);

// Errores de decodificación que hay que detectar:
for (const [label, bytes] of [['cortada', [0xe5, 0x8e]], ['demasiado larga', Array(11).fill(0x80)]]) {
  try {
    decode(Uint8Array.from(bytes), false);
  } catch (error) {
    logLine(`⛔ ${label} → ${error.name}: ${error.message}`);
  }
}

// ¿Cuánto ahorra? 1000 identificadores de producto ordenados, guardados como diferencias.
let seed = 42;
const ids = Array.from({ length: 1000 }, () => (seed = (seed * 1103515245 + 12345) % 2147483648) % 50000).sort((a, b) => a - b);
const deltas = ids.map((id, index) => BigInt(index === 0 ? id : id - ids[index - 1]));
const plainSize = ids.length * Uint32Array.BYTES_PER_ELEMENT;
const varintSize = ids.reduce((sum, id) => sum + encodeUnsigned(BigInt(id)).length, 0);
const deltaSize = deltas.reduce((sum, delta) => sum + encodeUnsigned(delta).length, 0);
logLine(`📦 1000 ids: Uint32Array ${plainSize} B · LEB128 ${varintSize} B · LEB128 de las diferencias ${deltaSize} B`);

for (const input of document.querySelectorAll('#number, [name="kind"]')) {
  input.addEventListener('input', update);
  input.addEventListener('change', () => logLine(`🔢 ${update()}`));
}
logLine(`🔢 ${update()}`);
logLine('Listo: escribe -123456 y marca «con signo»; prueba también 128 y 18446744073709551615');
```

---
example_description: "Un inspector de UTF-8 en los dos sentidos: de texto a grafemas, code points, unidades UTF-16 y bytes (con el papel de cada byte en bits), y de bytes a texto con un validador que sigue el algoritmo del estándar Encoding: explica cada secuencia inválida y comprueba que da los mismos U+FFFD que TextDecoder"
example_tags: "javascript|utf-8|unicode|textencoder|textdecoder|bytes|validacion|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="utf8-app">
  <h1>Inspector de UTF-8</h1>
  <section aria-labelledby="text-title">
    <h2 id="text-title">De texto a bytes</h2>
    <p><label for="text">Texto</label> <input id="text" type="text" value="Año 2026 · ¡olé! 🎸👍🏽" autocomplete="off" spellcheck="false"></p>
    <p id="counts" class="counts" role="status"></p>
    <div class="scroll">
      <table>
        <thead><tr><th scope="col">Carácter</th><th scope="col">Code point</th><th scope="col">UTF-16</th><th scope="col">UTF-8</th><th scope="col">Bits (marca | datos)</th></tr></thead>
        <tbody id="characters"></tbody>
      </table>
    </div>
  </section>
  <section aria-labelledby="bytes-title">
    <h2 id="bytes-title">De bytes a texto</h2>
    <p><label for="bytes">Bytes en hexadecimal</label> <input id="bytes" type="text" value="c3 b1 61 ff 80 e2 82 ac ed a0 80 f0 9f 8e b8 e2 82" autocomplete="off" spellcheck="false"></p>
    <ol id="units" class="units"></ol>
    <p id="decoded" class="decoded" role="status"></p>
  </section>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --bad-bg: #fee2e2; --bad-ink: #7f1d1d; --mark: #6d28d9; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.utf8-app { max-width: 44rem; margin: 0 auto; padding: 1rem; display: grid; gap: 1rem; }
h1 { margin: 0; font-size: 1.25rem; }
h2 { margin: 0 0 0.5rem; font-size: 1rem; }
section { padding: 0.75rem 1rem; border: 1px solid var(--line); border-radius: 0.6rem; background: var(--surface); }
input { inline-size: 100%; max-inline-size: 26rem; font: inherit; padding: 0.3rem 0.5rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); color: var(--ink); }
#bytes { font-family: Menlo, Consolas, monospace; }
input:focus-visible, .scroll:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.counts { font-weight: 600; }
.scroll { overflow-x: auto; }
table { border-collapse: collapse; font-size: 0.85rem; }
th, td { padding: 0.2rem 0.6rem 0.2rem 0; border-bottom: 1px solid var(--line); text-align: start; white-space: nowrap; }
td:nth-child(n + 2) { font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
.mark { color: var(--mark); font-weight: 700; }
.units { display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0; list-style: none; }
.units li { padding: 0.2rem 0.45rem; border: 1px solid var(--line); border-radius: 0.4rem; font-size: 0.8rem; }
.units code { font-family: Menlo, Consolas, monospace; }
.units li[data-bad] { border-color: var(--bad-ink); background: var(--bad-bg); color: var(--bad-ink); }
.decoded { font-weight: 600; overflow-wrap: anywhere; }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Inspector de UTF-8.
//
// Decisiones de diseño:
// - Un texto tiene cuatro tamaños: grafemas (lo que ve una persona, Intl.Segmenter),
//   code points ([...texto]), unidades UTF-16 (length) y bytes UTF-8 (TextEncoder).
// - El validador implementa el decodificador UTF-8 del estándar Encoding (WHATWG)
//   paso a paso, para poder decir POR QUÉ falla cada secuencia. Al final comprueba
//   que produce tantos U+FFFD como el TextDecoder del navegador: si no, el
//   validador tendría un fallo, y lo dice.
// - Las marcas de cada byte (110, 10…) se separan con «|» y se resaltan; el color
//   no es la única pista. Las secuencias inválidas dicen su motivo en texto.
//
// Alcance: HTML, CSS, el capítulo de JavaScript (strings y Unicode incluidos), el
// DOM, los eventos y este módulo.

const encoder = new TextEncoder();
const lenientDecoder = new TextDecoder();
const graphemes = new Intl.Segmenter('es', { granularity: 'grapheme' });
const logList = document.querySelector('#log');

function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const hex2 = (byte) => byte.toString(16).padStart(2, '0');
const codeLabel = (codePoint) => `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;

// El papel de un byte por sus bits altos: 0 (ASCII), 10 (continuación), 110/1110/11110 (inicio).
function markOf(byte) {
  if (byte < 0x80) return 1;
  if (byte < 0xc0) return 2;
  if (byte < 0xe0) return 3;
  if (byte < 0xf0) return 4;
  return 5;
}
function bitsCell(bytes) {
  const cell = document.createElement('td');
  bytes.forEach((byte, index) => {
    const bits = byte.toString(2).padStart(8, '0');
    const size = markOf(byte);
    cell.append(index ? ' ' : '', Object.assign(document.createElement('span'), { className: 'mark', textContent: bits.slice(0, size) }), `|${bits.slice(size)}`);
  });
  return cell;
}

function inspectText(text) {
  const rows = [...text].map((char) => {
    const bytes = encoder.encode(char);
    const row = document.createElement('tr');
    row.append(
      Object.assign(document.createElement('td'), { textContent: char }),
      Object.assign(document.createElement('td'), { textContent: codeLabel(char.codePointAt(0)) }),
      Object.assign(document.createElement('td'), { textContent: char.length }),
      Object.assign(document.createElement('td'), { textContent: Array.from(bytes, hex2).join(' ') }),
      bitsCell(bytes),
    );
    return row;
  });
  document.querySelector('#characters').replaceChildren(...rows);
  const counts = `${[...graphemes.segment(text)].length} grafemas · ${[...text].length} code points · ${text.length} unidades UTF-16 · ${encoder.encode(text).length} bytes UTF-8`;
  document.querySelector('#counts').textContent = counts;
  return counts;
}

// Decodificador UTF-8 del estándar Encoding, con el motivo de cada error.
function analyze(bytes) {
  const units = [];
  let needed = 0;
  let codePoint = 0;
  let lower = 0x80;
  let upper = 0xbf;
  let pending = [];
  const reset = () => { needed = 0; codePoint = 0; lower = 0x80; upper = 0xbf; pending = []; };
  for (let index = 0; index < bytes.length; index += 1) {
    const byte = bytes[index];
    if (needed === 0) {
      if (byte <= 0x7f) units.push({ bytes: [byte], codePoint: byte });
      else if (byte >= 0xc2 && byte <= 0xdf) { needed = 1; codePoint = byte & 0x1f; pending = [byte]; }
      else if (byte >= 0xe0 && byte <= 0xef) { needed = 2; codePoint = byte & 0x0f; pending = [byte]; if (byte === 0xe0) lower = 0xa0; if (byte === 0xed) upper = 0x9f; }
      else if (byte >= 0xf0 && byte <= 0xf4) { needed = 3; codePoint = byte & 0x07; pending = [byte]; if (byte === 0xf0) lower = 0x90; if (byte === 0xf4) upper = 0x8f; }
      else units.push({ bytes: [byte], error: byte >= 0x80 && byte <= 0xbf ? 'continuación suelta' : 'byte que nunca aparece en UTF-8' });
      continue;
    }
    if (byte < lower || byte > upper) {
      const lead = pending[0];
      const isContinuation = byte >= 0x80 && byte <= 0xbf;
      const reason = !isContinuation ? 'secuencia incompleta'
        : lead === 0xe0 || lead === 0xf0 ? 'forma demasiado larga (overlong)'
        : lead === 0xed ? 'sustituto UTF-16 (U+D800-U+DFFF)'
        : 'por encima de U+10FFFF';
      units.push({ bytes: pending, error: reason });
      reset();
      index -= 1; // el estándar vuelve a procesar este byte desde cero
      continue;
    }
    lower = 0x80;
    upper = 0xbf;
    codePoint = (codePoint << 6) | (byte & 0x3f);
    pending.push(byte);
    if (pending.length === needed + 1) {
      units.push({ bytes: pending, codePoint });
      reset();
    }
  }
  if (needed !== 0) units.push({ bytes: pending, error: 'secuencia incompleta al final' });
  return units;
}

function inspectBytes(textValue) {
  const tokens = textValue.trim().split(/[\s,]+/).filter(Boolean);
  const invalid = tokens.find((token) => !/^[0-9a-f]{2}$/i.test(token));
  if (invalid) {
    document.querySelector('#units').replaceChildren();
    document.querySelector('#decoded').textContent = `«${invalid}» no es un byte en hexadecimal (dos cifras, 00-ff).`;
    return `entrada no válida: «${invalid}»`;
  }
  const bytes = Uint8Array.from(tokens, (token) => parseInt(token, 16));
  const units = analyze(bytes);
  document.querySelector('#units').replaceChildren(...units.map((unit) => {
    const item = document.createElement('li');
    item.append(Object.assign(document.createElement('code'), { textContent: unit.bytes.map(hex2).join(' ') }), ' → ');
    if (unit.error) {
      item.dataset.bad = '';
      item.append(`✗ ${unit.error}`);
    } else {
      item.append(`${String.fromCodePoint(unit.codePoint)} ${codeLabel(unit.codePoint)}`);
    }
    return item;
  }));
  const decoded = lenientDecoder.decode(bytes);
  const replacements = [...decoded].filter((char) => char === '�').length;
  const errors = units.filter((unit) => unit.error).length;
  const agree = replacements === errors ? '✅ igual que TextDecoder' : `⚠️ TextDecoder da ${replacements}`;
  document.querySelector('#decoded').textContent = `TextDecoder: «${decoded}» · ${errors} secuencia(s) inválida(s) · ${agree}`;
  return `${bytes.length} bytes → ${units.length - errors} carácter(es) y ${errors} error(es): ${units.filter((unit) => unit.error).map((unit) => unit.error).join(', ') || 'ninguno'} · ${agree}`;
}

const textInput = document.querySelector('#text');
const bytesInput = document.querySelector('#bytes');
textInput.addEventListener('input', () => inspectText(textInput.value));
textInput.addEventListener('change', () => logLine(`📝 «${textInput.value}» → ${inspectText(textInput.value)}`));
bytesInput.addEventListener('input', () => inspectBytes(bytesInput.value));
bytesInput.addEventListener('change', () => logLine(`🔢 ${inspectBytes(bytesInput.value)}`));

logLine(`📝 «${textInput.value}» → ${inspectText(textInput.value)}`);
logLine(`🔢 ${inspectBytes(bytesInput.value)}`);
logLine('Listo: escribe otro texto o cambia los bytes (por ejemplo, e0 80 80 o f4 90 80 80) y pulsa Tab');
```

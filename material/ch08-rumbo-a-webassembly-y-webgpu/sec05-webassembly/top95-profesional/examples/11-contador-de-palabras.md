---
example_description: "Un contador de texto como wc en WebAssembly: bytes, caracteres (sin contar los bytes de continuación de UTF-8), palabras y líneas de un poema, de lo que escribas o de un archivo de texto; la memoria crece lo que pida el texto (el peor caso de encodeInto son 3 bytes por unidad UTF-16) y las vistas se crean después; todo se compara con JavaScript"
example_tags: "javascript|webassembly|wasm|texto|utf-8|encodeinto|grow|wc|file|profesional"
example_stage: professional
example_importance: useful
console: true
---

# HTML

```html
<main class="counter">
  <header>
    <h1>Contador de texto</h1>
    <p>Bytes, caracteres, palabras y líneas, contados en WebAssembly.</p>
  </header>
  <label for="text">Texto</label>
  <textarea id="text" rows="9" spellcheck="false" aria-describedby="credit">Dichoso el árbol, que es apenas sensitivo,
y más la piedra dura porque esa ya no siente,
pues no hay dolor más grande que el dolor de ser vivo,
ni mayor pesadumbre que la vida consciente.

Ser y no saber nada, y ser sin rumbo cierto,
y el temor de haber sido y un futuro terror...
Y el espanto seguro de estar mañana muerto,
y sufrir por la vida y por la sombra y por

lo que no conocemos y apenas sospechamos,
y la carne que tienta con sus frescos racimos,
y la tumba que aguarda con sus fúnebres ramos,
¡y no saber adónde vamos,
ni de dónde venimos!...
</textarea>
  <p id="credit" class="credit">Rubén Darío, «Lo fatal», <cite>Cantos de vida y esperanza</cite>, 1905. Dominio público.</p>
  <div class="tools">
    <label>O un archivo de texto <input id="file" type="file" accept="text/*,.txt,.md,.csv,.json"></label>
    <button id="big" type="button">Probar con 2 MB</button>
  </div>
  <dl class="stats" aria-live="polite">
    <div><dt>Bytes (UTF-8)</dt><dd id="bytes">—</dd></div>
    <div><dt>Caracteres</dt><dd id="chars">—</dd></div>
    <div><dt>Palabras</dt><dd id="words">—</dd></div>
    <div><dt>Líneas</dt><dd id="lines">—</dd></div>
  </dl>
  <p id="memory" class="memory"></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.counter { max-width: 36rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0; font-size: 1.3rem; }
header p { margin: 0.2rem 0 0.75rem; color: var(--muted); }
label { display: grid; gap: 0.2rem; font-size: 0.9rem; }
textarea { inline-size: 100%; padding: 0.5rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--surface); color: var(--ink); font: 0.95rem/1.5 Georgia, 'Times New Roman', serif; resize: vertical; }
.credit { margin: 0.2rem 0 0.6rem; font-size: 0.8rem; color: var(--muted); }
.tools { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; align-items: end; }
input, button { font: inherit; padding: 0.3rem 0.55rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--surface); color: var(--ink); }
button { cursor: pointer; }
button:disabled { cursor: progress; }
:is(textarea, input, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr)); gap: 0.5rem; margin: 0.75rem 0 0; }
.stats div { padding: 0.5rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); }
dt { font-size: 0.8rem; color: var(--muted); }
dd { margin: 0; font: 700 1.2rem Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; }
.memory { font-size: 0.85rem; color: var(--muted); }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; overflow-wrap: anywhere; }
```

# JavaScript

```javascript
// Un contador de texto como wc.
//
// Decisiones de diseño:
// - Un solo recorrido de los bytes UTF-8 cuenta todo: un carácter empieza en cada byte que no
//   es de continuación (10xxxxxx), una palabra empieza donde un byte que no es espacio sigue a
//   uno que sí (espacio, tabulador, \n, \v, \f, \r), y cada \n es una línea, como en wc.
// - Los resultados salen en tres globales exportadas: el módulo no necesita devolver un struct.
// - Memoria: encodeInto necesita como mucho 3 bytes por unidad UTF-16 del texto; si no caben,
//   memory.grow, y la vista se crea DESPUÉS de crecer (lección «La memoria lineal»). La memoria
//   no encoge nunca: el contador informa de cuántas páginas usa.
// - Hasta 16 MiB (256 páginas). Cada cambio en el texto se cuenta como mucho una vez por fotograma.
// - La referencia en JavaScript: TextEncoder para los bytes, for…of para los caracteres
//   (recorre puntos de código), split para las palabras y las líneas.
//
// Usa assets/wasm/wat.js y assets/wasm/emit.js.
// Alcance: HTML, CSS, JavaScript, DOM, eventos, File API, TextEncoder, Intl y este módulo.
import { assemble } from './wasm/wat.js';

const WAT = `(module
  (memory (export "memory") 1 256)
  (global $chars (export "chars") (mut i32) (i32.const 0))
  (global $words (export "words") (mut i32) (i32.const 0))
  (global $lines (export "lines") (mut i32) (i32.const 0))
  (func (export "count") (param $ptr i32) (param $len i32)
    (local $end i32) (local $byte i32) (local $inWord i32) (local $space i32)
    (global.set $chars (i32.const 0))
    (global.set $words (i32.const 0))
    (global.set $lines (i32.const 0))
    (local.set $end (i32.add (local.get $ptr) (local.get $len)))
    block $done
      loop $more
        (br_if $done (i32.ge_u (local.get $ptr) (local.get $end)))
        (local.set $byte (i32.load8_u (local.get $ptr)))
        (if (i32.ne (i32.and (local.get $byte) (i32.const 0xc0)) (i32.const 0x80))   ;; empieza un carácter
          (then (global.set $chars (i32.add (global.get $chars) (i32.const 1)))))
        (if (i32.eq (local.get $byte) (i32.const 10))                                ;; un \\n
          (then (global.set $lines (i32.add (global.get $lines) (i32.const 1)))))
        ;; ¿espacio? 32, o de 9 a 13 (\\t \\n \\v \\f \\r): (byte − 9) <= 4 sin signo
        (local.set $space (i32.or (i32.eq (local.get $byte) (i32.const 32))
                                  (i32.le_u (i32.sub (local.get $byte) (i32.const 9)) (i32.const 4))))
        (if (i32.and (i32.eqz (local.get $space)) (i32.eqz (local.get $inWord)))     ;; empieza una palabra
          (then (global.set $words (i32.add (global.get $words) (i32.const 1)))))
        (local.set $inWord (i32.eqz (local.get $space)))
        (local.set $ptr (i32.add (local.get $ptr) (i32.const 1)))
        br $more
      end
    end))`;
const { instance } = await WebAssembly.instantiate(assemble(WAT));
const { memory, count, chars, words, lines } = instance.exports;
const MAX_BYTES = 256 * 65536;
const encoder = new TextEncoder();

function countWasm(text) {
  const reserve = text.length * 3; // el peor caso de UTF-8
  if (reserve > MAX_BYTES) throw new RangeError(`el texto necesita hasta ${reserve} bytes y el contador admite ${MAX_BYTES}`);
  const missing = Math.ceil((reserve - memory.buffer.byteLength) / 65536);
  if (missing > 0) memory.grow(missing);
  const { read, written } = encoder.encodeInto(text, new Uint8Array(memory.buffer, 0, reserve)); // vista DESPUÉS
  if (read !== text.length) throw new Error('no cupo el texto'); // con 3 bytes por unidad, nunca pasa
  count(0, written);
  return { bytes: written, chars: chars.value, words: words.value, lines: lines.value };
}
function countJs(text) {
  let characters = 0;
  for (const _ of text) characters += 1; // for…of recorre puntos de código: 🌮 es uno
  return {
    bytes: encoder.encode(text).length,
    chars: characters,
    words: text.split(/[ \t\n\v\f\r]+/).filter(Boolean).length,
    lines: text.split('\n').length - 1,
  };
}

const textArea = document.querySelector('#text');
const memoryText = document.querySelector('#memory');
const logList = document.querySelector('#log');
const grouped = new Intl.NumberFormat('es-MX');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function show(text, { log, label }) {
  let result;
  try {
    result = countWasm(text);
  } catch (error) {
    memoryText.textContent = `❗ ${error.message}`;
    if (log) logLine(`❗ ${error.message}`);
    return;
  }
  for (const key of ['bytes', 'chars', 'words', 'lines']) document.querySelector(`#${key}`).textContent = grouped.format(result[key]);
  const pages = memory.buffer.byteLength / 65536;
  const pagesText = `${pages} ${pages === 1 ? 'página' : 'páginas'}`;
  memoryText.textContent = `Memoria: ${pagesText} (${grouped.format(memory.buffer.byteLength)} bytes)`;
  if (log) {
    const reference = countJs(text);
    const same = Object.keys(result).every((key) => result[key] === reference[key]);
    logLine(`${label} → ${result.bytes} bytes · ${result.chars} caracteres · ${result.words} palabras · ${result.lines} líneas · ¿igual que en JavaScript? ${same}`);
    logLine(`memoria → ${pagesText}`);
  }
}

let pending = false;
textArea.addEventListener('input', () => {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => { pending = false; show(textArea.value, { log: false }); });
});
textArea.addEventListener('change', () => show(textArea.value, { log: true, label: 'tu texto' }));
document.querySelector('#file').addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  if (file.size > MAX_BYTES / 3) {
    memoryText.textContent = `❗ ${file.name} pasa de ${grouped.format(MAX_BYTES / 3)} bytes`;
    return;
  }
  show(await file.text(), { log: true, label: file.name });
});
const bigButton = document.querySelector('#big');
bigButton.addEventListener('click', () => {
  bigButton.disabled = true;
  requestAnimationFrame(() => setTimeout(() => {
    const poem = textArea.defaultValue;
    show(poem.repeat(Math.ceil(2e6 / poem.length)), { log: true, label: 'el poema, repetido hasta pasar de 2 MB' });
    bigButton.disabled = false;
  }, 0));
});
show(textArea.value, { log: true, label: '«Lo fatal»' });
logLine('Listo: edita el texto (sal del campo para anotarlo), elige un archivo o pulsa «Probar con 2 MB»');
```

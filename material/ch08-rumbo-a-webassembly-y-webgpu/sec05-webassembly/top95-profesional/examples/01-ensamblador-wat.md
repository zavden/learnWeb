---
example_description: "Un ensamblador de WAT en la página: un editor con ejemplos, wat.js convierte el texto en bytes (con errores de línea y columna que llevan el cursor al sitio), el navegador valida y compila, se muestran las secciones y un volcado hexadecimal, y las funciones exportadas se llaman en un worker con un plazo de 1 s, así que ni un bucle infinito escrito por error congela la página"
example_tags: "javascript|webassembly|wasm|wat|ensamblador|worker|editor|accesibilidad|profesional"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="assembler">
  <header>
    <h1>Ensamblador de WAT</h1>
    <p>Escribe WebAssembly en su formato de texto, ensámblalo en la página y llama a sus funciones.</p>
  </header>
  <div class="toolbar">
    <label for="sample">Ejemplo</label>
    <select id="sample"></select>
    <button id="assemble" type="button" aria-describedby="shortcut">Ensamblar</button>
    <span id="shortcut" class="hint">o <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Intro</kbd> en el editor</span>
  </div>
  <label for="source" class="visually-hidden">Código WAT</label>
  <textarea id="source" rows="14" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="diagnostic"></textarea>
  <p id="diagnostic" class="diagnostic" role="status"></p>
  <section class="output" aria-labelledby="output-title">
    <h2 id="output-title">El módulo</h2>
    <dl class="summary">
      <div><dt>Tamaño</dt><dd id="size">—</dd></div>
      <div><dt>Secciones</dt><dd id="sections">—</dd></div>
      <div><dt>Exporta</dt><dd id="exports">—</dd></div>
    </dl>
    <details>
      <summary>Volcado hexadecimal</summary>
      <pre id="dump" tabindex="0" aria-label="Volcado hexadecimal del módulo"></pre>
    </details>
  </section>
  <section class="call" aria-labelledby="call-title">
    <h2 id="call-title">Llamar a una función</h2>
    <div class="call-row">
      <label>Función <select id="function"></select></label>
      <label>Argumentos <input id="args" autocomplete="off" spellcheck="false" placeholder="1, 2 (con n para i64: 20n)"></label>
      <button id="call" type="button">Llamar</button>
    </div>
    <p>Resultado: <output id="result" aria-live="polite">—</output></p>
  </section>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --code-bg: #0f172a; --code-ink: #e2e8f0; --bad: #9f1239; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.assembler { max-width: 46rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0; font-size: 1.3rem; }
h2 { margin: 0 0 0.5rem; font-size: 1rem; }
header p { margin: 0.2rem 0 0.75rem; color: var(--muted); }
.toolbar, .call-row { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; }
.hint { font-size: 0.8rem; color: var(--muted); }
kbd { font: 0.75rem Menlo, Consolas, monospace; padding: 0 0.25rem; border: 1px solid var(--line); border-radius: 0.25rem; background: var(--surface); }
select, input, button { font: inherit; padding: 0.3rem 0.6rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--surface); color: var(--ink); }
button { cursor: pointer; }
textarea { display: block; inline-size: 100%; margin-block-start: 0.6rem; padding: 0.6rem; border: 1px solid #64748b; border-radius: 0.5rem; background: var(--code-bg); color: var(--code-ink); font: 0.85rem/1.5 Menlo, Consolas, monospace; tab-size: 2; resize: vertical; }
:is(select, input, button, textarea, pre):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
textarea:focus-visible { outline-color: #93c5fd; }
.diagnostic { min-block-size: 1.4em; margin: 0.4rem 0; font-size: 0.9rem; }
.diagnostic[data-error] { color: var(--bad); font-weight: 600; }
.output, .call { margin-block-start: 0.75rem; padding: 0.75rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); }
.summary { display: grid; gap: 0.3rem; margin: 0; }
.summary div { display: grid; grid-template-columns: 7rem 1fr; gap: 0.5rem; }
dt { color: var(--muted); }
dd { margin: 0; font-family: Menlo, Consolas, monospace; font-size: 0.85rem; overflow-wrap: anywhere; }
pre { margin: 0.5rem 0 0; padding: 0.5rem; max-block-size: 14rem; overflow: auto; border-radius: 0.4rem; background: var(--code-bg); color: var(--code-ink); font-size: 0.75rem; }
output { font-family: Menlo, Consolas, monospace; font-weight: 700; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; overflow-wrap: anywhere; }
.visually-hidden { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
```

# JavaScript

```javascript
// Un ensamblador de WAT en la página.
//
// Decisiones de diseño:
// - wat.js (en assets/wasm, léelo con «Assets») convierte el texto en bytes y señala los errores
//   de sintaxis con su línea y su columna; los de tipos los encuentra el navegador al compilar
//   (CompileError con la posición del byte). Las dos clases de error se muestran igual.
// - Las llamadas se ejecutan en un WORKER con un plazo de 1 s. WebAssembly no tiene guarda de
//   bucles: un loop sin salida escrito por error congelaría la pestaña si se llamara aquí. En el
//   worker, al vencer el plazo, se termina el worker y se crea otro (módulo «Workers»).
// - Los argumentos se escriben como en JavaScript: 42, -3.5, y con n para los i64 (20n).
// - Elegir un ejemplo lo ensambla y llama a su función con sus argumentos de muestra.
// - El editor es un <textarea>: Tab inserta dos espacios (Escape y después Tab salen del editor).
//
// Usa assets/wasm/wat.js y assets/wasm/emit.js.
// Alcance: HTML, CSS, JavaScript, DOM, eventos, workers y este módulo.
import { assemble, WatError } from './wasm/wat.js';

const SAMPLES = [
  {
    title: 'Dígito de control', call: 'digitSum', args: '20261020',
    wat: `;; La suma de las cifras de un número (lección «WebAssembly a mano»).
(module
  (func $digitSum (export "digitSum") (param $n i32) (result i32) (local $sum i32)
    block $done
      loop $next
        local.get $n  i32.eqz  br_if $done          ;; n == 0 → fin
        local.get $sum  local.get $n  i32.const 10  i32.rem_u  i32.add  local.set $sum
        local.get $n  i32.const 10  i32.div_u  local.set $n
        br $next
      end
    end
    local.get $sum))`,
  },
  {
    title: 'Factorial en i64', call: 'factorial', args: '20n',
    wat: `;; n! con enteros de 64 bits: exacto hasta 20! (21! ya no cabe y da la vuelta).
(module
  (func $factorial (export "factorial") (param $n i64) (result i64) (local $acc i64)
    (if (i64.gt_s (local.get $n) (i64.const 25))      ;; límite fijo: como mucho 25 vueltas
      (then (local.set $n (i64.const 25))))
    (local.set $acc (i64.const 1))
    block $done
      loop $next
        (br_if $done (i64.le_s (local.get $n) (i64.const 1)))
        (local.set $acc (i64.mul (local.get $acc) (local.get $n)))
        (local.set $n (i64.sub (local.get $n) (i64.const 1)))
        br $next
      end
    end
    local.get $acc))`,
  },
  {
    title: 'Máximo común divisor', call: 'gcd', args: '1071, 462',
    wat: `;; Euclides: mcd(a, b) = mcd(b, a mod b). Cada vuelta reduce b: termina siempre.
(module
  (func $gcd (export "gcd") (param $a i32) (param $b i32) (result i32) (local $t i32)
    block $done
      loop $next
        (br_if $done (i32.eqz (local.get $b)))
        (local.set $t (i32.rem_u (local.get $a) (local.get $b)))
        (local.set $a (local.get $b))
        (local.set $b (local.get $t))
        br $next
      end
    end
    local.get $a))`,
  },
  {
    title: 'Con un error de sintaxis', call: 'total', args: '2, 3',
    wat: `(module
  (func $total (export "total") (param $units i32) (param $cents i32) (result i32)
    local.get $units
    local.get $cents
    i32.mull))`,
  },
  {
    title: 'Con un error de tipos', call: 'total', args: '2, 3',
    wat: `;; La sintaxis es correcta, pero promete un f64 y deja un i32: lo detecta el navegador.
(module
  (func $total (export "total") (param $units i32) (param $cents i32) (result f64)
    local.get $units  local.get $cents  i32.mul))`,
  },
];
const SECTION_NAMES = { 0: 'personalizada', 1: 'tipos', 2: 'importaciones', 3: 'funciones', 5: 'memoria', 6: 'globales', 7: 'exportaciones', 8: 'inicio', 10: 'código', 11: 'datos' };

const sampleSelect = document.querySelector('#sample');
const source = document.querySelector('#source');
const diagnostic = document.querySelector('#diagnostic');
const functionSelect = document.querySelector('#function');
const argsInput = document.querySelector('#args');
const resultOutput = document.querySelector('#result');
const logList = document.querySelector('#log');
let current = null; // { bytes, functions }

function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// --- Las secciones y el volcado: un lector mínimo de LEB128 (lección «WebAssembly a mano») ---
function readSections(bytes) {
  const sections = [];
  let offset = 8;
  const uleb = () => {
    let result = 0;
    let shift = 0;
    let byte;
    do {
      byte = bytes[offset++];
      result |= (byte & 0x7f) << shift;
      shift += 7;
    } while (byte & 0x80 && offset < bytes.length);
    return result >>> 0;
  };
  while (offset < bytes.length) {
    const id = bytes[offset++];
    const size = uleb();
    const start = offset;
    let label = SECTION_NAMES[id] ?? `id ${id}`;
    if (id === 0) {
      const nameLength = uleb();
      label += ` «${new TextDecoder().decode(bytes.subarray(offset, offset + nameLength))}»`;
    }
    sections.push(`${label} (${size} B)`);
    offset = start + size;
  }
  return sections;
}
function hexdump(bytes) {
  const rows = [];
  for (let offset = 0; offset < bytes.length; offset += 16) {
    const row = bytes.subarray(offset, offset + 16);
    const cells = Array.from(row, (byte) => byte.toString(16).padStart(2, '0')).join(' ');
    const text = Array.from(row, (byte) => (byte >= 0x20 && byte < 0x7f ? String.fromCharCode(byte) : '.')).join('');
    rows.push(`${offset.toString(16).padStart(4, '0')}  ${cells.padEnd(47)}  |${text}|`);
  }
  return rows.join('\n');
}

// --- Ensamblar: texto → bytes → validación del navegador ---
async function build({ log }) {
  try {
    const bytes = assemble(source.value);
    const module = await WebAssembly.compile(bytes); // aquí aparecen los errores de TIPOS
    const exported = WebAssembly.Module.exports(module);
    current = { bytes, functions: exported.filter((entry) => entry.kind === 'function').map((entry) => entry.name) };
    diagnostic.removeAttribute('data-error');
    source.removeAttribute('aria-invalid');
    diagnostic.textContent = `✓ ${bytes.length} bytes, válido`;
    document.querySelector('#size').textContent = `${bytes.length} bytes`;
    document.querySelector('#sections').textContent = readSections(bytes).join(' · ');
    document.querySelector('#exports').textContent = exported.map((entry) => `${entry.name} (${entry.kind})`).join(', ') || '(nada)';
    document.querySelector('#dump').textContent = hexdump(bytes);
    functionSelect.replaceChildren(...current.functions.map((name) => new Option(name, name)));
    if (log) {
      logLine(`${bytes.length} bytes · ¿válido? true · exporta ${exported.map((entry) => `${entry.name} (${entry.kind})`).join(', ')}`);
      logLine(`secciones → ${readSections(bytes).join(' · ')}`);
    }
    return true;
  } catch (error) {
    current = null;
    functionSelect.replaceChildren();
    diagnostic.setAttribute('data-error', '');
    source.setAttribute('aria-invalid', 'true');
    diagnostic.textContent = `❗ ${error.name}: ${error.message}`;
    if (error instanceof WatError && error.pos) moveCaret(error.pos);
    if (log) logLine(`❗ ${error.name}: ${error.message}`);
    return false;
  }
}
function moveCaret({ line, col }) { // lleva el cursor al sitio del error, sin robar el foco si no lo tenía
  const lines = source.value.split('\n');
  const index = lines.slice(0, line - 1).reduce((sum, text) => sum + text.length + 1, 0) + col - 1;
  source.setSelectionRange(index, index);
}

// --- Llamar: en un worker, con plazo ---
const WORKER_CODE = `
  self.onmessage = async ({ data }) => {
    try {
      const { instance } = await WebAssembly.instantiate(data.bytes);
      const value = instance.exports[data.name](...data.args);
      self.postMessage({ ok: true, value });
    } catch (error) {
      self.postMessage({ ok: false, error: error.name + ': ' + error.message });
    }
  };
`;
const workerUrl = URL.createObjectURL(new Blob([WORKER_CODE], { type: 'text/javascript' }));
let worker = new Worker(workerUrl);
addEventListener('pagehide', () => worker.terminate());
function callInWorker(bytes, name, args, timeoutMs = 1000) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      worker.terminate(); // un bucle sin fin no se puede interrumpir: se termina el hilo entero
      worker = new Worker(workerUrl);
      resolve({ ok: false, error: `la función no terminó en ${timeoutMs / 1000} s: el worker se ha terminado` });
    }, timeoutMs);
    worker.onmessage = ({ data }) => {
      clearTimeout(timer);
      resolve(data);
    };
    worker.postMessage({ bytes, name, args });
  });
}
function parseArgs(text) {
  if (!text.trim()) return [];
  return text.split(',').map((part) => {
    const value = part.trim();
    if (/^-?\d+n$/.test(value)) return BigInt(value.slice(0, -1)); // un i64
    const number = Number(value);
    if (value === '' || Number.isNaN(number)) throw new SyntaxError(`«${value}» no es un número`);
    return number;
  });
}
const show = (value) => (typeof value === 'bigint' ? `${value}n` : String(value));
let busy = false; // una llamada cada vez: el plazo y el worker son de esa llamada
async function callSelected() {
  if (busy || !current || !functionSelect.value) return;
  let args;
  try {
    args = parseArgs(argsInput.value);
  } catch (error) {
    resultOutput.textContent = `❗ ${error.message}`;
    return;
  }
  resultOutput.textContent = 'calculando…';
  busy = true;
  const reply = await callInWorker(current.bytes, functionSelect.value, args);
  busy = false;
  const text = reply.ok ? show(reply.value) : `❗ ${reply.error}`;
  resultOutput.textContent = text;
  logLine(`${functionSelect.value}(${args.map(show).join(', ')}) → ${text}`);
}

// --- Eventos ---
sampleSelect.append(...SAMPLES.map((sample, index) => new Option(sample.title, String(index))));
async function loadSample(index) {
  const sample = SAMPLES[index];
  source.value = sample.wat;
  argsInput.value = sample.args;
  logLine(`«${sample.title}»`);
  if (await build({ log: true })) {
    functionSelect.value = sample.call;
    await callSelected();
  }
}
sampleSelect.addEventListener('change', () => loadSample(Number(sampleSelect.value)));
document.querySelector('#assemble').addEventListener('click', () => build({ log: true }));
document.querySelector('#call').addEventListener('click', callSelected);
argsInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') callSelected();
});
let escapedTab = false;
source.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    build({ log: true });
  } else if (event.key === 'Escape') {
    escapedTab = true; // el siguiente Tab sale del editor
  } else if (event.key === 'Tab' && !escapedTab && !event.shiftKey) {
    event.preventDefault();
    source.setRangeText('  ', source.selectionStart, source.selectionEnd, 'end');
  } else {
    escapedTab = false;
  }
});
await loadSample(0);
logLine('Listo: elige otro ejemplo, edita el WAT y pulsa «Ensamblar», o llama a otra función');
```

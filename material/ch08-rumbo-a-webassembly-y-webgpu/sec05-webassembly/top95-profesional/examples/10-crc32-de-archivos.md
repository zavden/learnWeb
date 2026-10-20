---
example_description: "Un verificador de archivos con CRC-32 (el de ZIP y PNG) en WebAssembly: la tabla se calcula en una función de inicio, los archivos (de los assets con fetch o tuyos con file.stream()) pasan por una ventana de 64 KiB con barra de progreso y botón de cancelar, y el resultado se compara con un manifiesto de sumas publicado, que detecta un archivo cambiado"
example_tags: "javascript|webassembly|wasm|crc32|streams|file|progreso|start|integridad|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="verifier">
  <header>
    <h1>Verificador de archivos</h1>
    <p>Comprueba que un archivo es el que dice ser, con la suma CRC-32 de ZIP y PNG.</p>
  </header>
  <section aria-labelledby="manifest-title">
    <h2 id="manifest-title">El manifiesto de la lección</h2>
    <table>
      <thead><tr><th scope="col">Archivo</th><th scope="col">Publicado</th><th scope="col">Calculado</th><th scope="col">Estado</th></tr></thead>
      <tbody id="manifest"></tbody>
    </table>
  </section>
  <section aria-labelledby="own-title">
    <h2 id="own-title">Un archivo tuyo</h2>
    <div class="own">
      <label>Archivo <input id="file" type="file"></label>
      <label>CRC-32 esperado (opcional) <input id="expected" placeholder="9abf28e7" maxlength="8" autocomplete="off" spellcheck="false"></label>
    </div>
    <progress id="progress" max="1" value="0" aria-label="Progreso de la lectura"></progress>
    <button id="cancel" type="button" disabled>Cancelar</button>
    <p id="result" class="result" role="status"></p>
  </section>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --good: #166534; --bad: #9f1239; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.verifier { max-width: 40rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0; font-size: 1.3rem; }
h2 { margin: 1rem 0 0.4rem; font-size: 1rem; }
header p { margin: 0.2rem 0 0; color: var(--muted); }
table { inline-size: 100%; border-collapse: collapse; background: var(--surface); font-size: 0.85rem; }
th, td { padding: 0.3rem 0.5rem; border-bottom: 1px solid var(--line); text-align: start; }
td:nth-child(2), td:nth-child(3) { font-family: Menlo, Consolas, monospace; }
td[data-ok="true"] { color: var(--good); font-weight: 600; }
td[data-ok="false"] { color: var(--bad); font-weight: 600; }
.own { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; align-items: end; }
label { display: grid; gap: 0.15rem; font-size: 0.85rem; }
input, button { font: inherit; padding: 0.3rem 0.55rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--surface); color: var(--ink); }
#expected { inline-size: 9rem; font-family: Menlo, Consolas, monospace; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; color: var(--muted); }
:is(input, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
progress { display: block; inline-size: 100%; margin-block: 0.6rem 0.3rem; accent-color: var(--accent); }
.result { font-weight: 600; overflow-wrap: anywhere; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; overflow-wrap: anywhere; }
```

# JavaScript

```javascript
// Un verificador de archivos con CRC-32.
//
// Decisiones de diseño:
// - CRC-32 con tabla (el polinomio 0xEDB88320 de ZIP, PNG y zlib): la tabla de 256 entradas
//   (1 KiB) la calcula la FUNCIÓN DE INICIO del módulo al instanciarlo (lección «WebAssembly a
//   mano»); después, un byte cuesta una carga de la tabla, un XOR y un desplazamiento.
// - Memoria constante: los trozos del stream pasan por una ventana de 64 KiB, como en la
//   integración del módulo; un archivo de 2 GB usa la misma memoria que uno de 2 KB.
// - Entre trozo y trozo se espera al stream (await reader.read()), así que la página responde:
//   la barra avanza y «Cancelar» funciona (cancela el lector y para el bucle).
// - El manifiesto es una lista publicada de sumas: el ejemplo trae una equivocada a propósito,
//   la de una versión anterior de un plugin, para ver cómo se detecta un archivo distinto.
// - CRC-32 detecta errores de transmisión, no ataques: quien cambia un archivo a propósito
//   puede ajustar su CRC. Para eso existe SHA-256 (crypto.subtle, módulo «Datos binarios»).
//
// Usa assets/wasm/wat.js, assets/wasm/emit.js y los archivos del manifiesto.
// Alcance: HTML, CSS, JavaScript, DOM, eventos, streams, File API, fetch y este módulo.
import { assemble } from './wasm/wat.js';

const WAT = `(module
  (memory (export "memory") 2)                    ;; la tabla (bytes 0-1023) y la ventana desde 1024
  ;; La tabla: para cada byte n, 8 pasos de «desplazar y, si sale un 1, XOR con el polinomio».
  (func $init (local $n i32) (local $c i32) (local $k i32)
    block $done
      loop $entry
        (br_if $done (i32.ge_u (local.get $n) (i32.const 256)))
        (local.set $c (local.get $n))
        (local.set $k (i32.const 0))
        block $bitsDone
          loop $bit
            (br_if $bitsDone (i32.ge_u (local.get $k) (i32.const 8)))
            (local.set $c (select
              (i32.xor (i32.const 0xEDB88320) (i32.shr_u (local.get $c) (i32.const 1)))
              (i32.shr_u (local.get $c) (i32.const 1))
              (i32.and (local.get $c) (i32.const 1))))
            (local.set $k (i32.add (local.get $k) (i32.const 1)))
            br $bit
          end
        end
        (i32.store (i32.shl (local.get $n) (i32.const 2)) (local.get $c))
        (local.set $n (i32.add (local.get $n) (i32.const 1)))
        br $entry
      end
    end)
  (start $init)
  ;; Continúa un CRC con $len bytes: crc = tabla[(crc ^ byte) & 255] ^ (crc >>> 8).
  (func (export "update") (param $crc i32) (param $ptr i32) (param $len i32) (result i32) (local $end i32)
    (local.set $end (i32.add (local.get $ptr) (local.get $len)))
    block $done
      loop $more
        (br_if $done (i32.ge_u (local.get $ptr) (local.get $end)))
        (local.set $crc (i32.xor
          (i32.load (i32.shl (i32.and (i32.xor (local.get $crc) (i32.load8_u (local.get $ptr))) (i32.const 255)) (i32.const 2)))
          (i32.shr_u (local.get $crc) (i32.const 8))))
        (local.set $ptr (i32.add (local.get $ptr) (i32.const 1)))
        br $more
      end
    end
    local.get $crc))`;
const { instance } = await WebAssembly.instantiate(assemble(WAT));
const { memory, update } = instance.exports;
const WINDOW_PTR = 1024;
const WINDOW_SIZE = 65536;
const windowView = new Uint8Array(memory.buffer, WINDOW_PTR, WINDOW_SIZE); // la memoria no crece: vale siempre

// Recorre un stream de bytes; onProgress(bytes) tras cada trozo; signal.cancelled para parar.
async function crcOfStream(stream, { onProgress = () => {}, signal = { cancelled: false } } = {}) {
  const reader = stream.getReader();
  let crc = -1; // 0xFFFFFFFF
  let total = 0;
  for (;;) {
    if (signal.cancelled) {
      await reader.cancel();
      return null;
    }
    const { done, value } = await reader.read();
    if (done) break;
    for (let offset = 0; offset < value.length; offset += WINDOW_SIZE) {
      const piece = value.subarray(offset, offset + WINDOW_SIZE);
      windowView.set(piece);
      crc = update(crc, WINDOW_PTR, piece.length);
    }
    total += value.length;
    onProgress(total);
  }
  return { total, crc: ((crc ^ -1) >>> 0).toString(16).padStart(8, '0') };
}

const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
// El mismo cálculo, sobre un texto conocido: el «valor de prueba» de CRC-32 es cbf43926.
{
  const check = new TextEncoder().encode('123456789');
  windowView.set(check);
  const value = ((update(-1, WINDOW_PTR, check.length) ^ -1) >>> 0).toString(16);
  logLine(`crc32('123456789') → ${value} · ¿el valor de prueba del estándar? ${value === 'cbf43926'}`);
}

// --- El manifiesto ---
const MANIFEST = [
  ['valley-of-mexico.jpg', '9abf28e7'],
  ['wasm/checksum.wasm', '1b89e349'],
  ['plugins/buen-fin.wasm', '1ca8cc78'],
  ['plugins/envio-gratis.wasm', '6d0f9a28'], // la suma de una versión anterior: el archivo ya no es ese
];
const manifestBody = document.querySelector('#manifest');
for (const [path, published] of MANIFEST) {
  const response = await fetch(path);
  const { total, crc } = await crcOfStream(response.body);
  const ok = crc === published;
  const row = document.createElement('tr');
  const cells = [path, published, crc, ok ? '✅ coincide' : '❌ distinto'].map((text) => Object.assign(document.createElement('td'), { textContent: text }));
  cells[3].dataset.ok = String(ok);
  row.append(...cells);
  manifestBody.append(row);
  logLine(`${path} → ${total} bytes · crc32 ${crc} · ${ok ? '✅ coincide con el manifiesto' : `❌ el manifiesto dice ${published}`}`);
}

// --- Un archivo propio, con progreso y cancelación ---
const fileInput = document.querySelector('#file');
const expectedInput = document.querySelector('#expected');
const progress = document.querySelector('#progress');
const cancelButton = document.querySelector('#cancel');
const resultText = document.querySelector('#result');
let job = null;
cancelButton.addEventListener('click', () => { if (job) job.cancelled = true; });
fileInput.addEventListener('change', async () => {
  const [file] = fileInput.files;
  if (!file) return;
  if (job) job.cancelled = true; // un archivo nuevo cancela el anterior
  const signal = { cancelled: false };
  job = signal;
  cancelButton.disabled = false;
  progress.max = Math.max(file.size, 1);
  progress.value = 0;
  resultText.textContent = `Leyendo ${file.name}…`;
  const start = performance.now();
  const result = await crcOfStream(file.stream(), { onProgress: (bytes) => { progress.value = bytes; }, signal });
  if (job === signal) { job = null; cancelButton.disabled = true; }
  if (!result) {
    resultText.textContent = `${file.name}: cancelado`;
    logLine(`${file.name} → cancelado`);
    return;
  }
  const seconds = (performance.now() - start) / 1000;
  const expected = expectedInput.value.trim().toLowerCase();
  const verdict = !expected ? '' : expected === result.crc ? ' · ✅ coincide' : ` · ❌ esperaba ${expected}`;
  resultText.textContent = `${file.name}: ${result.total} bytes · crc32 ${result.crc}${verdict} · ≈ ${(result.total / 1e6 / Math.max(seconds, 0.001)).toFixed(0)} MB/s`;
  logLine(`${file.name} → ${result.total} bytes · crc32 ${result.crc}${verdict}`);
});
logLine('Listo: elige un archivo tuyo (y, si quieres, su CRC-32 esperado)');
```

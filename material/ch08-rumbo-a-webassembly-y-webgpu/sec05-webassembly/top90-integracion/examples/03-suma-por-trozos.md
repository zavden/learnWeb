---
example_description: "Adler-32 de un archivo que no se copia entero: los trozos de fetch (o de file.stream()) pasan por una ventana fija de 64 KiB en la memoria y el módulo acumula la suma en dos globales; el resultado coincide con calcularla de una vez en JavaScript"
example_tags: "javascript|webassembly|wasm|streams|fetch|file|adler32|memoria|globales"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="checker">
  <h1>Suma de comprobación por trozos</h1>
  <p>El inventario de la librería (<code>data/inventario.csv</code>) pasa por una ventana de 64 KiB de la memoria de WebAssembly, trozo a trozo.</p>
  <label for="file">O elige un archivo tuyo</label>
  <input id="file" type="file">
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
.checker { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
label { display: block; font-size: 0.9rem; margin-block-end: 0.25rem; }
input:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; overflow-wrap: anywhere; }
```

# JavaScript

```javascript
// Usa assets/wasm/emit.js y assets/data/inventario.csv (léelos con «Assets»).
import { encodeModule, op, memArg, i32Const, I32, VOID } from './wasm/emit.js';

// Adler-32 incremental: el estado (a, b) vive en dos globales y sobrevive entre llamadas.
//   (module
//     (memory (export "memory") 1)                         ;; la ventana: 64 KiB
//     (global $a (mut i32) (i32.const 1))
//     (global $b (mut i32) (i32.const 0))
//     (func (export "reset")  i32.const 1  global.set $a  i32.const 0  global.set $b)
//     (func (export "update") (param $ptr i32) (param $len i32) (local $end i32)
//       … para cada byte: $a = ($a + byte) % 65521; $b = ($b + $a) % 65521 …)
//     (func (export "digest") (result i32)  global.get $b  i32.const 16  i32.shl  global.get $a  i32.or))
const bytes = encodeModule({
  types: [[[], []], [[I32, I32], []], [[], [I32]]],
  memory: { min: 1, max: 1 },
  globals: [{ type: I32, mutable: true, init: i32Const(1) }, { type: I32, mutable: true, init: i32Const(0) }],
  funcs: [
    { type: 0, body: [...i32Const(1), op.global_set, 0, ...i32Const(0), op.global_set, 1] },
    { type: 1, locals: [I32], body: [
      op.local_get, 0, op.local_get, 1, op.i32_add, op.local_set, 2,
      op.block, VOID, op.loop, VOID,
        op.local_get, 0, op.local_get, 2, op.i32_ge_u, op.br_if, 1,
        op.global_get, 0, op.local_get, 0, op.i32_load8_u, ...memArg(0), op.i32_add, ...i32Const(65521), op.i32_rem_u, op.global_set, 0,
        op.global_get, 1, op.global_get, 0, op.i32_add, ...i32Const(65521), op.i32_rem_u, op.global_set, 1,
        op.local_get, 0, ...i32Const(1), op.i32_add, op.local_set, 0,
        op.br, 0,
      op.end, op.end,
    ] },
    { type: 2, body: [op.global_get, 1, ...i32Const(16), op.i32_shl, op.global_get, 0, op.i32_or] },
  ],
  exports: { memory: { memory: 0 }, reset: { func: 0 }, update: { func: 1 }, digest: { func: 2 } },
});
const { instance } = await WebAssembly.instantiate(bytes);
const { memory, reset, update, digest } = instance.exports;
const WINDOW = memory.buffer.byteLength; // 65536: la memoria no crece nunca, la vista vale siempre
const windowView = new Uint8Array(memory.buffer, 0, WINDOW);

// Recorre cualquier ReadableStream de bytes: la respuesta de fetch o file.stream().
async function adlerOfStream(stream) {
  reset();
  const reader = stream.getReader();
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    // Un trozo puede ser mayor que la ventana: se pasa por partes de como mucho 64 KiB.
    for (let offset = 0; offset < value.length; offset += WINDOW) {
      const piece = value.subarray(offset, offset + WINDOW);
      windowView.set(piece);
      update(0, piece.length);
    }
    total += value.length;
  }
  return { total, checksum: digest() >>> 0 };
}
// La referencia: Adler-32 de una vez, en JavaScript, sobre el archivo entero.
function adlerOfBytes(data) {
  let a = 1;
  let b = 0;
  for (const byte of data) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}
const hex32 = (value) => value.toString(16).padStart(8, '0');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const response = await fetch('data/inventario.csv');
const copy = response.clone(); // una copia de la respuesta, para la comprobación
const { total, checksum } = await adlerOfStream(response.body);
const reference = adlerOfBytes(new Uint8Array(await copy.arrayBuffer()));
logLine(`inventario.csv → ${total} bytes · adler32 → ${hex32(checksum)} · ¿igual que de una vez en JavaScript? ${checksum === reference}`);
logLine(`memoria usada → una ventana de ${WINDOW} bytes, para un archivo ${(total / WINDOW).toFixed(1)} veces mayor`);

document.querySelector('#file').addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  const result = await adlerOfStream(file.stream());
  logLine(`${file.name} → ${result.total} bytes · adler32 → ${hex32(result.checksum)}`);
});
logLine('Listo: elige un archivo para calcular su suma');

// Python: zlib.adler32(open('inventario.csv', 'rb').read()) da el mismo número, y también
// acepta trozos: adler32(trozo2, adler32(trozo1)).
```

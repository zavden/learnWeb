---
example_description: "Un texto de ida y vuelta: encodeInto escribe el nombre de un producto en la memoria, una función de WebAssembly lo convierte en un slug para la URL (minúsculas, sin tildes gracias a una tabla de 64 bytes en un segmento de datos, guiones entre palabras) y TextDecoder lee el resultado con su longitud; se compara con la versión de JavaScript con normalize()"
example_tags: "javascript|webassembly|wasm|strings|utf-8|encodeinto|textdecoder|data|slug"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="slugger">
  <h1>Del nombre a la URL</h1>
  <label for="name">Nombre del producto</label>
  <input id="name" maxlength="200" value="Café de Olla con Piloncillo (500 g)" autocomplete="off">
  <p>Dirección: <output id="url" for="name" aria-live="polite"></output></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
.slugger { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.75rem; }
label { display: block; font-size: 0.9rem; margin-block-end: 0.25rem; }
input { box-sizing: border-box; inline-size: 100%; font: inherit; padding: 0.35rem 0.5rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; }
input:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
output { font-family: Menlo, Consolas, monospace; font-weight: 600; overflow-wrap: anywhere; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; overflow-wrap: anywhere; }
```

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, memArg, i32Const, I32, VOID } from './wasm/emit.js';

// Las letras con tilde de UTF-8 son dos bytes: c3 y un segundo byte de 80 a bf. La tabla dice,
// para cada segundo byte, su letra sin tilde, o 0 si no tiene (Æ, Ø, ß… cuentan como separador).
//   c3 80 À → a … c3 87 Ç → c … c3 91 Ñ → n … c3 a9 é → e … c3 b1 ñ → n … c3 bc ü → u
const ACCENTS = 'aaaaaa\0ceeeeiiii\0nooooo\0\0uuuuy\0\0aaaaaa\0ceeeeiiii\0nooooo\0\0uuuuy\0y';
const TABLE = 8192; // la tabla vive en la memoria, en un segmento de datos
const IN = 0;       // 4 KiB para el texto de entrada
const OUT = 4096;   // 4 KiB para el slug
//   (func (export "slugify") (param $in i32) (param $len i32) (param $out i32) (result i32)
//     (local $end i32) (local $start i32) (local $byte i32) (local $char i32) (local $dash i32)
//     … para cada byte: A-Z → minúscula; a-z y 0-9 → igual; c3 xx → TABLA[xx − 0x80];
//       lo demás → separador. Un guion entre palabras, ninguno al principio ni al final …
//     local.get $out  local.get $start  i32.sub)            ;; la LONGITUD del slug, en bytes
const between = (low, high) => [ // ¿low <= $byte <= high? (local 4 = $byte)
  op.local_get, 4, ...i32Const(low), op.i32_sub, ...i32Const(high - low), op.i32_le_u,
];
const bytes = encodeModule({
  types: [[[I32, I32, I32], [I32]]],
  memory: { min: 1, max: 1 },
  funcs: [{ type: 0, locals: [I32, I32, I32, I32, I32], body: [
    // locales: 3 = $end, 4 = $byte, 5 = $char, 6 = $dash, 7 = $start
    op.local_get, 0, op.local_get, 1, op.i32_add, op.local_set, 3,
    op.local_get, 2, op.local_set, 7,
    op.block, VOID, op.loop, VOID,
      op.local_get, 0, op.local_get, 3, op.i32_ge_u, op.br_if, 1,
      op.local_get, 0, op.i32_load8_u, ...memArg(0), op.local_set, 4,
      ...i32Const(0), op.local_set, 5,
      ...between(0x41, 0x5a), op.if, VOID, op.local_get, 4, ...i32Const(32), op.i32_add, op.local_set, 5, op.end, // A-Z
      ...between(0x61, 0x7a), ...between(0x30, 0x39), op.i32_or, op.if, VOID, op.local_get, 4, op.local_set, 5, op.end, // a-z, 0-9
      // c3 seguido de otro byte: la tabla, y se salta el segundo byte
      op.local_get, 4, ...i32Const(0xc3), op.i32_eq, op.local_get, 0, ...i32Const(1), op.i32_add, op.local_get, 3, op.i32_lt_u, op.i32_and,
      op.if, VOID,
        op.local_get, 0, op.i32_load8_u, ...memArg(0, 1), ...i32Const(0x80), op.i32_sub, ...i32Const(63), op.i32_and,
        op.i32_load8_u, ...memArg(0, TABLE), op.local_set, 5,
        op.local_get, 0, ...i32Const(1), op.i32_add, op.local_set, 0,
      op.end,
      op.local_get, 5, op.if, VOID,
        // una letra: antes, el guion pendiente (si ya hay algo escrito)
        op.local_get, 6, op.local_get, 2, op.local_get, 7, op.i32_ne, op.i32_and, op.if, VOID,
          op.local_get, 2, ...i32Const(0x2d), op.i32_store8, ...memArg(0),
          op.local_get, 2, ...i32Const(1), op.i32_add, op.local_set, 2,
        op.end,
        ...i32Const(0), op.local_set, 6,
        op.local_get, 2, op.local_get, 5, op.i32_store8, ...memArg(0),
        op.local_get, 2, ...i32Const(1), op.i32_add, op.local_set, 2,
      op.else,
        ...i32Const(1), op.local_set, 6, // un separador: deja un guion pendiente
      op.end,
      op.local_get, 0, ...i32Const(1), op.i32_add, op.local_set, 0,
      op.br, 0,
    op.end, op.end,
    op.local_get, 2, op.local_get, 7, op.i32_sub,
  ] }],
  exports: { memory: { memory: 0 }, slugify: { func: 0 } },
  data: [{ offset: TABLE, bytes: ACCENTS }],
});
const { instance } = await WebAssembly.instantiate(bytes);
const { memory, slugify } = instance.exports; // la memoria no crece: las vistas valen siempre
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const input = new Uint8Array(memory.buffer, IN, 4096);
const output = new Uint8Array(memory.buffer, OUT, 4096);

// Ida: encodeInto escribe el UTF-8 en la memoria (como mucho 4096 bytes, sin partir letras).
// Vuelta: la función devuelve cuántos bytes escribió, y TextDecoder lee justo esos.
function slugWasm(text) {
  const { written } = encoder.encodeInto(text, input);
  const length = slugify(IN, written, OUT);
  return decoder.decode(output.subarray(0, length));
}
// La versión de JavaScript: separar las tildes (NFD), quitarlas y cambiar lo demás por guiones.
function slugJs(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const nameInput = document.querySelector('#name');
const urlOutput = document.querySelector('#url');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const show = () => { urlOutput.textContent = `/tienda/${slugWasm(nameInput.value)}`; };
for (const name of ['Café de Olla con Piloncillo (500 g)', 'Ñandú & Pingüino: ¡edición de lujo!', '  Mole poblano — receta de la abuela  ', 'ÁRBOL DE LA VIDA, Metepec']) {
  const slug = slugWasm(name);
  logLine(`${slug} · ¿igual que con normalize()? ${slug === slugJs(name)}`);
}
// El límite de la tabla: solo conoce las letras de dos bytes que empiezan por c3.
logLine(`límite: «Plzeň» → ${slugWasm('Plzeň')} (con normalize(): ${slugJs('Plzeň')})`);
nameInput.addEventListener('input', show);
nameInput.addEventListener('change', () => logLine(`/tienda/${slugWasm(nameInput.value)}`));
show();
logLine('Listo: escribe el nombre de otro producto (pulsa Intro para anotarlo)');
```

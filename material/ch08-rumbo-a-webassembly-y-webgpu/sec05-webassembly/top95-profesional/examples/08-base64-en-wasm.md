---
example_description: "Un códec base64 en WebAssembly: el alfabeto y la tabla inversa viven en segmentos de datos, encode convierte cada 3 bytes en 4 letras con su relleno y decode valida (longitud, letras y relleno) y devuelve -1 si algo falla; el texto va y viene con encodeInto y TextDecoder, se compara con toBase64/fromBase64 del navegador y se mide contra ellos, código nativo difícil de batir"
example_tags: "javascript|webassembly|wasm|base64|data|encodeinto|textdecoder|benchmark|profesional"
example_stage: professional
example_importance: useful
console: true
loop_protect: false
---

# HTML

```html
<main class="codec">
  <header>
    <h1>Base64 en WebAssembly</h1>
    <p>Texto → bytes UTF-8 → base64, y vuelta, con un módulo de menos de 1 KB.</p>
  </header>
  <label for="text">Texto</label>
  <textarea id="text" rows="3" spellcheck="false">¡Hola, Oaxaca! Mole negro y tlayudas 🌮</textarea>
  <p>Base64: <output id="encoded" for="text" aria-live="polite"></output></p>
  <label for="base64">Base64 para decodificar</label>
  <input id="base64" autocomplete="off" spellcheck="false" value="Q2Fmw6kgZGUgb2xsYQ==">
  <p>Texto: <output id="decoded" for="base64" aria-live="polite"></output></p>
  <button id="bench" type="button">Medir (1 MiB)</button>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --bad: #9f1239; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.codec { max-width: 36rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0; font-size: 1.3rem; }
header p { margin: 0.2rem 0 0.75rem; color: var(--muted); }
label { display: block; font-size: 0.9rem; margin-block-end: 0.2rem; }
textarea, input { inline-size: 100%; font: 0.9rem Menlo, Consolas, monospace; padding: 0.4rem 0.5rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--surface); color: var(--ink); }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--surface); color: var(--ink); cursor: pointer; }
button:disabled { cursor: progress; }
:is(textarea, input, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
output { font-family: Menlo, Consolas, monospace; overflow-wrap: anywhere; }
output[data-error] { color: var(--bad); font-family: inherit; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; overflow-wrap: anywhere; }
```

# JavaScript

```javascript
// loop_protect: false (en la cabecera): hay medidas; todos los bucles terminan.
//
// Decisiones de diseño:
// - El alfabeto (64 bytes) y la tabla inversa (256 bytes: el valor de cada letra, 254 para «=»
//   y 255 para lo que no es base64) son segmentos de datos: el módulo no calcula nada al empezar.
// - decode es estricto: longitud múltiplo de 4, solo letras del alfabeto y como mucho dos «=»
//   al final; si no, devuelve -1. (Uint8Array.fromBase64 del navegador, además, salta espacios.)
// - La memoria crece según lo que haga falta (entrada + salida) y las vistas se crean después.
// - La comparación honesta: Chrome tiene Uint8Array.prototype.toBase64, escrito en C++ dentro
//   del navegador. Si existe, el módulo se compara con él y se mide contra él.
//
// Usa assets/wasm/wat.js y assets/wasm/emit.js.
// Alcance: HTML, CSS, JavaScript, DOM, eventos, TextEncoder/TextDecoder, base64 y este módulo.
import { assemble } from './wasm/wat.js';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const inverse = Array.from({ length: 256 }, (_, code) => {
  if (code === 61) return 254; // «=»
  const index = ALPHABET.indexOf(String.fromCharCode(code));
  return index < 0 ? 255 : index;
});
const asWatString = (bytes) => bytes.map((byte) => `\\${byte.toString(16).padStart(2, '0')}`).join('');
const letter = (shift) => `(i32.load8_u (i32.and (i32.shr_u (local.get $n) (i32.const ${shift})) (i32.const 63)))`;
const valueAt = (offset) => `(i32.load8_u offset=64 (i32.load8_u offset=${offset} (local.get $in)))`;
const WAT = `(module
  (memory (export "memory") 1 64)
  (data (i32.const 0) "${ALPHABET}")
  (data (i32.const 64) "${asWatString(inverse)}")
  ;; 3 bytes → 4 letras; los 1 o 2 bytes que sobran, con «=» de relleno. Devuelve la longitud.
  (func (export "encode") (param $in i32) (param $len i32) (param $out i32) (result i32)
    (local $end i32) (local $start i32) (local $n i32) (local $rest i32)
    (local.set $start (local.get $out))
    (local.set $rest (i32.rem_u (local.get $len) (i32.const 3)))
    (local.set $end (i32.add (local.get $in) (i32.sub (local.get $len) (local.get $rest))))
    block $done
      loop $more
        (br_if $done (i32.ge_u (local.get $in) (local.get $end)))
        (local.set $n (i32.or (i32.or
          (i32.shl (i32.load8_u (local.get $in)) (i32.const 16))
          (i32.shl (i32.load8_u offset=1 (local.get $in)) (i32.const 8)))
          (i32.load8_u offset=2 (local.get $in))))
        (i32.store8 (local.get $out) ${letter(18)})
        (i32.store8 offset=1 (local.get $out) ${letter(12)})
        (i32.store8 offset=2 (local.get $out) ${letter(6)})
        (i32.store8 offset=3 (local.get $out) ${letter(0)})
        (local.set $in (i32.add (local.get $in) (i32.const 3)))
        (local.set $out (i32.add (local.get $out) (i32.const 4)))
        br $more
      end
    end
    (if (local.get $rest)
      (then
        (local.set $n (i32.shl (i32.load8_u (local.get $in)) (i32.const 16)))
        (if (i32.eq (local.get $rest) (i32.const 2))
          (then (local.set $n (i32.or (local.get $n) (i32.shl (i32.load8_u offset=1 (local.get $in)) (i32.const 8))))))
        (i32.store8 (local.get $out) ${letter(18)})
        (i32.store8 offset=1 (local.get $out) ${letter(12)})
        (i32.store8 offset=2 (local.get $out) (select ${letter(6)} (i32.const 61) (i32.eq (local.get $rest) (i32.const 2))))
        (i32.store8 offset=3 (local.get $out) (i32.const 61))
        (local.set $out (i32.add (local.get $out) (i32.const 4)))))
    (i32.sub (local.get $out) (local.get $start)))
  ;; 4 letras → 3 bytes, validando. Devuelve la longitud, o -1 si no es base64 válido.
  (func (export "decode") (param $in i32) (param $len i32) (param $out i32) (result i32)
    (local $end i32) (local $start i32) (local $a i32) (local $b i32) (local $c i32) (local $d i32) (local $n i32)
    (if (i32.rem_u (local.get $len) (i32.const 4)) (then (return (i32.const -1))))
    (local.set $start (local.get $out))
    (local.set $end (i32.add (local.get $in) (local.get $len)))
    block $done
      loop $more
        (br_if $done (i32.ge_u (local.get $in) (local.get $end)))
        (local.set $a ${valueAt(0)})
        (local.set $b ${valueAt(1)})
        (local.set $c ${valueAt(2)})
        (local.set $d ${valueAt(3)})
        (if (i32.or (i32.ge_u (local.get $a) (i32.const 64)) (i32.ge_u (local.get $b) (i32.const 64))) (then (return (i32.const -1))))
        (if (i32.lt_u (i32.add (local.get $in) (i32.const 4)) (local.get $end))
          (then ;; un grupo del medio: nada de relleno
            (if (i32.or (i32.ge_u (local.get $c) (i32.const 64)) (i32.ge_u (local.get $d) (i32.const 64))) (then (return (i32.const -1))))))
        ;; el último grupo: «xx==», «xxx=» o «xxxx»; «xx=x» y letras inválidas no
        (if (i32.or (i32.eq (local.get $c) (i32.const 255)) (i32.eq (local.get $d) (i32.const 255))) (then (return (i32.const -1))))
        (if (i32.and (i32.eq (local.get $c) (i32.const 254)) (i32.ne (local.get $d) (i32.const 254))) (then (return (i32.const -1))))
        (local.set $n (i32.or (i32.or (i32.or
          (i32.shl (local.get $a) (i32.const 18))
          (i32.shl (local.get $b) (i32.const 12)))
          (i32.shl (i32.and (local.get $c) (i32.const 63)) (i32.const 6)))
          (i32.and (local.get $d) (i32.const 63))))
        (i32.store8 (local.get $out) (i32.shr_u (local.get $n) (i32.const 16)))
        (local.set $out (i32.add (local.get $out) (i32.const 1)))
        (if (i32.ne (local.get $c) (i32.const 254))
          (then
            (i32.store8 (local.get $out) (i32.shr_u (local.get $n) (i32.const 8)))
            (local.set $out (i32.add (local.get $out) (i32.const 1)))))
        (if (i32.ne (local.get $d) (i32.const 254))
          (then
            (i32.store8 (local.get $out) (local.get $n))
            (local.set $out (i32.add (local.get $out) (i32.const 1)))))
        (local.set $in (i32.add (local.get $in) (i32.const 4)))
        br $more
      end
    end
    (i32.sub (local.get $out) (local.get $start))))`;
const bytes = assemble(WAT);
const { instance } = await WebAssembly.instantiate(bytes);
const { memory, encode, decode } = instance.exports;
const IN = 1024; // los primeros 320 bytes son las tablas

// La memoria justa para entrada + salida, creciendo si hace falta; las vistas, siempre nuevas.
function room(inputLength, outputLength) {
  const out = IN + Math.ceil(inputLength / 16) * 16;
  const needed = out + outputLength;
  const pages = Math.ceil(needed / 65536) - memory.buffer.byteLength / 65536;
  if (pages > 0) memory.grow(pages);
  return out;
}
function encodeBytes(data) {
  const out = room(data.length, Math.ceil(data.length / 3) * 4);
  new Uint8Array(memory.buffer).set(data, IN);
  const length = encode(IN, data.length, out);
  return new TextDecoder().decode(new Uint8Array(memory.buffer, out, length)); // base64 es ASCII
}
function decodeText(text) {
  const out = room(text.length * 3, text.length); // encodeInto de ASCII: 1 byte por letra
  const { written } = new TextEncoder().encodeInto(text, new Uint8Array(memory.buffer, IN, text.length * 3));
  const length = decode(IN, written, out);
  return length < 0 ? null : new Uint8Array(memory.buffer, out, length).slice();
}

// La referencia del navegador, si la hay (Chrome); si no, btoa/atob sobre un texto binario.
const native = {
  encode: (data) => (data.toBase64 ? data.toBase64() : btoa(Array.from(data, (byte) => String.fromCharCode(byte)).join(''))),
  decode: (text) => (Uint8Array.fromBase64 ? Uint8Array.fromBase64(text) : Uint8Array.from(atob(text), (char) => char.charCodeAt(0))),
};

const textInput = document.querySelector('#text');
const encodedOutput = document.querySelector('#encoded');
const base64Input = document.querySelector('#base64');
const decodedOutput = document.querySelector('#decoded');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function showEncoded() {
  encodedOutput.textContent = encodeBytes(new TextEncoder().encode(textInput.value));
}
function showDecoded() {
  const result = decodeText(base64Input.value.trim());
  if (result) {
    decodedOutput.removeAttribute('data-error');
    decodedOutput.textContent = new TextDecoder().decode(result);
  } else {
    decodedOutput.setAttribute('data-error', '');
    decodedOutput.textContent = 'no es base64 válido (longitud múltiplo de 4, letras A-Z a-z 0-9 + / y como mucho dos = al final)';
  }
  return result;
}
textInput.addEventListener('input', showEncoded);
base64Input.addEventListener('input', showDecoded);
textInput.addEventListener('change', () => logLine(`base64 → ${encodedOutput.textContent}`));
base64Input.addEventListener('change', () => logLine(showDecoded() ? `texto → ${decodedOutput.textContent}` : `❗ «${base64Input.value.trim()}» no es base64 válido`));

logLine(`módulo → ${bytes.length} bytes · toBase64 del navegador: ${typeof Uint8Array.prototype.toBase64 === 'function' ? 'sí' : 'no (se usa btoa)'}`);
showEncoded();
showDecoded();
logLine(`«${textInput.value}» → ${encodedOutput.textContent}`);
logLine(`«${base64Input.value}» → «${decodedOutput.textContent}»`);
// Todas las longitudes de 0 a 40 bytes (los tres casos de relleno) y vuelta.
const samples = Array.from({ length: 41 }, (_, length) => Uint8Array.from({ length }, (_, i) => (i * 37 + length) & 255));
const agree = samples.every((data) => encodeBytes(data) === native.encode(data) && decodeText(native.encode(data)).every((byte, i) => byte === data[i]));
logLine(`¿igual que el navegador en las 41 longitudes de 0 a 40 bytes, de ida y de vuelta? ${agree}`);
const verdict = (text) => `«${text}» ${decodeText(text) ? 'válido' : 'no válido'}`;
logLine(`decode estricto → ${['Zm9v', 'Zm9', 'Zm=v', 'Zm9v!!!!'].map(verdict).join(' · ')}`);

// La medida: 1 MiB, el módulo frente a lo que trae el navegador.
function wakeCpu(ms) {
  const end = performance.now() + ms;
  let x = 0;
  while (performance.now() < end) x += Math.sqrt(x + 1);
  return x;
}
const benchButton = document.querySelector('#bench');
benchButton.addEventListener('click', () => {
  benchButton.disabled = true;
  requestAnimationFrame(() => setTimeout(() => {
    const data = Uint8Array.from({ length: 1 << 20 }, (_, i) => (i * 2654435761) >>> 24);
    wakeCpu(100);
    const variants = [['WebAssembly', () => encodeBytes(data)], [data.toBase64 ? 'toBase64 del navegador' : 'btoa', () => native.encode(data)]];
    const times = variants.map(() => []);
    let last = [];
    for (let round = -2; round < 7; round++) {
      variants.forEach(([, run], index) => {
        const start = performance.now();
        last[index] = run();
        if (round >= 0) times[index].push(performance.now() - start);
      });
    }
    logLine(`1 MiB → ${last[0].length} letras · ¿el mismo base64? ${last[0] === last[1]}`);
    variants.forEach(([label], index) => logLine(`${label}: mediana ≈ ${times[index].sort((a, b) => a - b)[3].toFixed(1)} ms`));
    benchButton.disabled = false;
  }, 0));
});
logLine('Listo: escribe un texto, pega un base64 o pulsa «Medir»');
```

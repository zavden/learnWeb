---
example_description: "El caso en el que WebAssembly sí gana: el brillo de una imagen con instrucciones SIMD (v128), 16 bytes por instrucción con suma y resta saturadas (i8x16.add_sat_u y sub_sat_u), frente al mismo filtro en WebAssembly byte a byte y en JavaScript con Uint8ClampedArray; los tres dan los mismos píxeles, un deslizador lo aplica en vivo y un botón mide de forma honesta"
example_tags: "javascript|webassembly|wasm|simd|v128|imagen|canvas|benchmark|profesional"
example_stage: professional
example_importance: critical
console: true
loop_protect: false
---

# HTML

```html
<main class="simd">
  <header>
    <h1>Brillo con SIMD</h1>
    <p>Una instrucción, dieciséis bytes: la ventaja que JavaScript no tiene.</p>
  </header>
  <figure>
    <canvas id="canvas" width="480" height="330" role="img" aria-label="Valle de México, de José María Velasco, con el brillo ajustado"></canvas>
    <figcaption>José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</figcaption>
  </figure>
  <label for="amount">Brillo: <output id="amount-value" for="amount">0</output></label>
  <input id="amount" type="range" min="-100" max="100" step="5" value="0">
  <button id="bench" type="button">Medir (8 copias de la imagen, 5 MB)</button>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.simd { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0; font-size: 1.3rem; }
header p { margin: 0.2rem 0 0.75rem; color: var(--muted); }
figure { margin: 0 0 0.75rem; }
canvas { display: block; inline-size: 100%; block-size: auto; border-radius: 0.4rem; background: var(--line); }
figcaption { margin-block-start: 0.3rem; font-size: 0.8rem; color: var(--muted); }
label { display: block; font-size: 0.9rem; }
input[type="range"] { inline-size: 100%; accent-color: var(--accent); }
button { margin-block-start: 0.5rem; font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--surface); color: var(--ink); cursor: pointer; }
button:disabled { cursor: progress; }
:is(input, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
output { font-family: Menlo, Consolas, monospace; font-weight: 700; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; overflow-wrap: anywhere; }
```

# JavaScript

```javascript
// loop_protect: false (en la cabecera): hay medidas; todos los bucles terminan.
//
// Decisiones de diseño:
// - Brillo = sumar (o restar) k a R, G y B, recortando a 0-255. Uint8ClampedArray recorta solo
//   (lección «ArrayBuffer y vistas»); en WebAssembly, byte a byte, con dos select; y con SIMD,
//   una sola instrucción, i8x16.add_sat_u («saturada»: 250 + 10 = 255), para 16 bytes.
// - El alfa no cambia: el vector que se suma es [k, k, k, 0] repetido en los 4 píxeles
//   (i32x4.splat de k × 0x010101, en little-endian: R, G, B y un 0 en el alfa).
// - Las tres versiones trabajan sobre los mismos bytes de la memoria y se comparan byte a byte.
//   La imagen mide 633 600 bytes, múltiplo de 16; si no lo fuera, el resto iría byte a byte.
// - La medida, desde un botón: copia la imagen 8 veces (5 MB), despierta la CPU, calienta,
//   intercala y da la mediana; solo se cronometra el filtro, no la copia previa.
//
// Usa assets/wasm/wat.js, assets/wasm/emit.js y assets/valley-of-mexico.jpg.
// Alcance: HTML, CSS, JavaScript, DOM, eventos, canvas 2D e ImageData y este módulo.
import { assemble } from './wasm/wat.js';

// Un canal, con offset: (i32.store8 offset=1 (local.get $ptr) (recortar (+ byte k)))
const channel = (offset) => `
      (local.set $v (i32.add (i32.load8_u offset=${offset} (local.get $ptr)) (local.get $k)))
      (local.set $v (select (i32.const 0) (local.get $v) (i32.lt_s (local.get $v) (i32.const 0))))
      (local.set $v (select (i32.const 255) (local.get $v) (i32.gt_s (local.get $v) (i32.const 255))))
      (i32.store8 offset=${offset} (local.get $ptr) (local.get $v))`;
const WAT = `(module
  (memory (export "memory") 1 160)
  ;; Byte a byte: los canales R, G y B de cada píxel; el alfa se salta.
  (func (export "brightenScalar") (param $ptr i32) (param $len i32) (param $k i32) (local $end i32) (local $v i32)
    (local.set $end (i32.add (local.get $ptr) (local.get $len)))
    block $done
      loop $more
        (br_if $done (i32.ge_u (local.get $ptr) (local.get $end)))${channel(0)}${channel(1)}${channel(2)}
        (local.set $ptr (i32.add (local.get $ptr) (i32.const 4)))
        br $more
      end
    end)
  ;; Con SIMD: 16 bytes (4 píxeles) por instrucción.
  (func (export "brightenSimd") (param $ptr i32) (param $len i32) (param $k i32) (local $end i32) (local $delta v128)
    (local.set $end (i32.add (local.get $ptr) (local.get $len)))
    ;; [|k|, |k|, |k|, 0] en cada uno de los 4 píxeles
    (local.set $delta (i32x4.splat (i32.mul
      (select (local.get $k) (i32.sub (i32.const 0) (local.get $k)) (i32.ge_s (local.get $k) (i32.const 0)))
      (i32.const 0x010101))))
    block $done
      loop $more
        (br_if $done (i32.ge_u (local.get $ptr) (local.get $end)))
        (if (i32.ge_s (local.get $k) (i32.const 0))
          (then (v128.store (local.get $ptr) (i8x16.add_sat_u (v128.load (local.get $ptr)) (local.get $delta))))
          (else (v128.store (local.get $ptr) (i8x16.sub_sat_u (v128.load (local.get $ptr)) (local.get $delta)))))
        (local.set $ptr (i32.add (local.get $ptr) (i32.const 16)))
        br $more
      end
    end))`;
const bytes = assemble(WAT);
const simdAvailable = WebAssembly.validate(bytes); // un navegador sin SIMD no validaría el módulo
const { instance } = await WebAssembly.instantiate(bytes);
const { memory, brightenScalar, brightenSimd } = instance.exports;

function brightenJs(data, k) { // data: un Uint8ClampedArray, que recorta solo
  for (let i = 0; i < data.length; i += 4) {
    data[i] += k;
    data[i + 1] += k;
    data[i + 2] += k;
  }
}

const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d', { willReadFrequently: true });
const image = new Image();
image.crossOrigin = 'anonymous';
image.src = 'valley-of-mexico.jpg';
await image.decode();
context.drawImage(image, 0, 0);
const original = context.getImageData(0, 0, canvas.width, canvas.height).data; // 633 600 bytes
const SIZE = original.length;
const COPIES = 8;
memory.grow(Math.ceil((SIZE * COPIES) / 65536) - memory.buffer.byteLength / 65536); // vistas DESPUÉS
const work = (copies = 1) => new Uint8Array(memory.buffer, 0, SIZE * copies);
const clamped = (copies = 1) => new Uint8ClampedArray(memory.buffer, 0, SIZE * copies);

const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Las tres versiones, sobre la imagen original, deben dar los mismos bytes.
function resultOf(apply, k) {
  work().set(original);
  apply(k);
  return work().slice();
}
const versions = {
  JavaScript: (k) => brightenJs(clamped(), k),
  'WebAssembly byte a byte': (k) => brightenScalar(0, SIZE, k),
  'WebAssembly SIMD': (k) => brightenSimd(0, SIZE, k),
};
logLine(`SIMD disponible → ${simdAvailable} · imagen de ${SIZE} bytes · ${memory.buffer.byteLength / 65536} páginas`);
for (const k of [40, -40]) {
  const [first, ...rest] = Object.values(versions).map((apply) => resultOf(apply, k));
  const same = rest.every((other) => other.every((value, index) => value === first[index]));
  logLine(`brillo ${k > 0 ? '+' : ''}${k} → ¿los mismos ${SIZE} bytes en las tres versiones? ${same} · alfa del primer píxel: ${first[3]}`);
}

// El deslizador: la versión SIMD, en vivo, como mucho una vez por fotograma.
const slider = document.querySelector('#amount');
const sliderValue = document.querySelector('#amount-value');
let pending = false;
function paint() {
  pending = false;
  const k = slider.valueAsNumber;
  sliderValue.textContent = k > 0 ? `+${k}` : String(k);
  work().set(original);
  brightenSimd(0, SIZE, k);
  context.putImageData(new ImageData(new Uint8ClampedArray(work()), canvas.width, canvas.height), 0, 0);
}
slider.addEventListener('input', () => {
  if (!pending) { pending = true; requestAnimationFrame(paint); }
});
slider.addEventListener('change', () => logLine(`brillo ${slider.value} → aplicado con SIMD`));

// La medida: solo el filtro, sobre 8 copias; la copia previa no se cronometra.
function wakeCpu(ms) {
  const end = performance.now() + ms;
  let x = 0;
  while (performance.now() < end) x += Math.sqrt(x + 1);
  return x;
}
const benchButton = document.querySelector('#bench');
let source = null;
let lastSink = 0; // el resultado de cada medida se consume: nada es «código muerto»
benchButton.addEventListener('click', () => {
  benchButton.disabled = true;
  requestAnimationFrame(() => setTimeout(() => {
    if (!source) {
      source = new Uint8Array(SIZE * COPIES);
      for (let copy = 0; copy < COPIES; copy++) source.set(original, copy * SIZE);
    }
    const total = SIZE * COPIES;
    const variants = [
      ['JavaScript', () => brightenJs(clamped(COPIES), 30)],
      ['WebAssembly byte a byte', () => brightenScalar(0, total, 30)],
      ['WebAssembly SIMD', () => brightenSimd(0, total, 30)],
    ];
    wakeCpu(100);
    const times = variants.map(() => []);
    let sink = 0;
    for (let round = -2; round < 7; round++) {
      variants.forEach(([, run], index) => {
        work(COPIES).set(source); // sin cronometrar
        const start = performance.now();
        run();
        if (round >= 0) times[index].push(performance.now() - start);
        sink += work(COPIES)[total - 2]; // consumir el resultado
      });
    }
    const medians = times.map((list) => list.sort((a, b) => a - b)[3]);
    lastSink = sink;
    logLine(`${total} bytes por medida · 9 rondas intercaladas (2 de calentamiento)`);
    variants.forEach(([label], index) => logLine(`${label}: mediana ≈ ${medians[index].toFixed(2)} ms`));
    logLine(`SIMD frente a byte a byte: ≈ ${(medians[1] / Math.max(medians[2], 0.05)).toFixed(0)} veces más rápido`);
    benchButton.disabled = false;
  }, 0));
});
logLine('Listo: mueve el deslizador o pulsa «Medir»');
```

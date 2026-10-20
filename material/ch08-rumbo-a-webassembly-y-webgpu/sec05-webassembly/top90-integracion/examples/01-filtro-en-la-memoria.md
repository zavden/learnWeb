---
example_description: "Un filtro de imagen en WebAssembly: los 633 600 bytes del cuadro de Velasco (getImageData) se copian a la memoria, que crece lo necesario, y dos funciones del módulo los pasan a gris o a negativo; el mismo bucle en JavaScript da los mismos píxeles y putImageData pinta el resultado"
example_tags: "javascript|webassembly|wasm|canvas|imagedata|memoria|grow|filtros"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="studio">
  <h1>Filtros en WebAssembly</h1>
  <figure>
    <canvas id="canvas" width="480" height="330" role="img" aria-label="Valle de México, de José María Velasco, con el filtro elegido"></canvas>
    <figcaption>José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</figcaption>
  </figure>
  <fieldset>
    <legend>Filtro</legend>
    <label><input type="radio" name="filter" value="original"> Original</label>
    <label><input type="radio" name="filter" value="grayscale" checked> Escala de grises</label>
    <label><input type="radio" name="filter" value="invert"> Negativo</label>
  </fieldset>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
.studio { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.75rem; }
figure { margin: 0; }
canvas { display: block; inline-size: 100%; block-size: auto; border-radius: 0.4rem; background: #cbd5e1; }
figcaption { margin-block-start: 0.3rem; font-size: 0.8rem; color: #475569; }
fieldset { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; margin: 0.75rem 0 0; border: 1px solid #cbd5e1; border-radius: 0.5rem; }
input:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// Usa assets/wasm/emit.js y assets/valley-of-mexico.jpg (léelos con «Assets»).
import { encodeModule, op, memArg, i32Const, I32, VOID } from './wasm/emit.js';

// Dos filtros que recorren los píxeles (4 bytes: R, G, B, A) desde $ptr hasta $ptr + $len:
//   (func (export "grayscale") (param $ptr i32) (param $len i32) (local $end i32) (local $y i32)
//     … $y = (77 × R + 150 × G + 29 × B) >> 8, y R = G = B = $y …)
//   (func (export "invert") (param $ptr i32) (param $len i32) (local $end i32)
//     … R = 255 − R, G = 255 − G, B = 255 − B; el alfa no se toca …)
// Los dos bucles terminan: recorren $len bytes de una memoria de tamaño conocido.
const pixelLoop = (step) => [
  op.local_get, 0, op.local_get, 1, op.i32_add, op.local_set, 2,
  op.block, VOID, op.loop, VOID,
    op.local_get, 0, op.local_get, 2, op.i32_ge_u, op.br_if, 1,
    ...step,
    op.local_get, 0, ...i32Const(4), op.i32_add, op.local_set, 0, // siguiente píxel
    op.br, 0,
  op.end, op.end,
];
const load = (channel) => [op.local_get, 0, op.i32_load8_u, ...memArg(0, channel)];
const store = (channel, value) => [op.local_get, 0, ...value, op.i32_store8, ...memArg(0, channel)];
const bytes = encodeModule({
  types: [[[I32, I32], []]],
  memory: { min: 1, max: 64 },
  funcs: [
    { type: 0, locals: [I32, I32], body: pixelLoop([
      ...load(0), ...i32Const(77), op.i32_mul,
      ...load(1), ...i32Const(150), op.i32_mul, op.i32_add,
      ...load(2), ...i32Const(29), op.i32_mul, op.i32_add,
      ...i32Const(8), op.i32_shr_u, op.local_set, 3, // 77 + 150 + 29 = 256: el resultado cabe en un byte
      ...store(0, [op.local_get, 3]), ...store(1, [op.local_get, 3]), ...store(2, [op.local_get, 3]),
    ]) },
    { type: 0, locals: [I32], body: pixelLoop([0, 1, 2].flatMap((channel) => store(channel, [...i32Const(255), ...load(channel), op.i32_sub]))) },
  ],
  exports: { memory: { memory: 0 }, grayscale: { func: 0 }, invert: { func: 1 } },
});

// Las mismas fórmulas en JavaScript, para comparar.
const jsFilters = {
  grayscale(data) {
    for (let i = 0; i < data.length; i += 4) {
      const y = (77 * data[i] + 150 * data[i + 1] + 29 * data[i + 2]) >> 8;
      data[i] = data[i + 1] = data[i + 2] = y;
    }
  },
  invert(data) {
    for (let i = 0; i < data.length; i += 4) for (let c = 0; c < 3; c++) data[i + c] = 255 - data[i + c];
  },
};
const NAMES = { original: 'Original', grayscale: 'Escala de grises', invert: 'Negativo' };

const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d', { willReadFrequently: true });
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const image = new Image();
image.crossOrigin = 'anonymous'; // en las tarjetas (origen null) toda imagen es de otro origen
image.src = 'valley-of-mexico.jpg';
await image.decode();
context.drawImage(image, 0, 0);
const original = context.getImageData(0, 0, canvas.width, canvas.height);

const { instance } = await WebAssembly.instantiate(bytes);
const { memory, grayscale, invert } = instance.exports;
const PTR = 0;
const size = original.data.length;
const pagesNeeded = Math.ceil((PTR + size) / 65536);
memory.grow(pagesNeeded - memory.buffer.byteLength / 65536); // ¡las vistas, después de crecer!
logLine(`${size / 4} píxeles · ${size} bytes · ${memory.buffer.byteLength / 65536} páginas de memoria`);

function apply(filter) {
  const result = new ImageData(new Uint8ClampedArray(original.data), canvas.width, canvas.height);
  if (filter !== 'original') {
    const pixels = new Uint8Array(memory.buffer, PTR, size); // los píxeles, en la memoria del módulo
    pixels.set(original.data);
    instance.exports[filter](PTR, size);
    result.data.set(pixels);
    const reference = new Uint8ClampedArray(original.data); // el mismo filtro, en JavaScript
    jsFilters[filter](reference);
    const same = reference.every((value, index) => value === result.data[index]);
    logLine(`${NAMES[filter]} · ¿los mismos píxeles que el bucle de JavaScript? ${same}`);
  }
  context.putImageData(result, 0, 0);
}
document.querySelectorAll('[name="filter"]').forEach((radio) => radio.addEventListener('change', () => apply(radio.value)));
apply('grayscale'); // el filtro marcado al cargar
logLine('Listo: elige otro filtro');
```

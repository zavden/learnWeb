---
example_description: "El conjunto de Mandelbrot calculado en WebAssembly dentro de un worker: el módulo se ensambla y se compila una vez en la página, el Module viaja al worker, que pinta los 480 × 320 píxeles en su memoria con una paleta y devuelve los bytes transferidos; clic, teclado y botones para acercar y moverse, peticiones viejas descartadas, y las iteraciones comprobadas contra JavaScript"
example_tags: "javascript|webassembly|wasm|worker|mandelbrot|f64|transferibles|canvas|accesibilidad|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="fractal">
  <header>
    <h1>Mandelbrot en un worker</h1>
    <p>El cálculo, en WebAssembly y fuera del hilo principal; la página solo dibuja.</p>
  </header>
  <canvas id="canvas" width="480" height="320" tabindex="0" role="img" aria-label="El conjunto de Mandelbrot" aria-describedby="help"></canvas>
  <p id="help" class="hint">Haz clic para acercar en ese punto. Con el foco en la imagen: flechas para moverte, <kbd>+</kbd> y <kbd>−</kbd> para acercar y alejar.</p>
  <div class="controls">
    <button id="zoom-in" type="button">Acercar</button>
    <button id="zoom-out" type="button">Alejar</button>
    <button id="home" type="button">Vista inicial</button>
  </div>
  <p id="view" class="view" role="status"></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.fractal { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0; font-size: 1.3rem; }
header p { margin: 0.2rem 0 0.75rem; color: var(--muted); }
canvas { display: block; inline-size: 100%; block-size: auto; border-radius: 0.4rem; background: #000000; cursor: zoom-in; }
canvas:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
.hint { font-size: 0.8rem; color: var(--muted); }
kbd { font: 0.75rem Menlo, Consolas, monospace; padding: 0 0.25rem; border: 1px solid var(--line); border-radius: 0.25rem; background: var(--surface); }
.controls { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--surface); color: var(--ink); cursor: pointer; }
button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.view { font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; overflow-wrap: anywhere; }
```

# JavaScript

```javascript
// Mandelbrot en un worker.
//
// Decisiones de diseño:
// - El módulo se ensambla (wat.js) y se compila UNA vez, en la página. El Module se envía al
//   worker con postMessage, que lo instancia sin volver a compilarlo (lección «JavaScript y
//   WebAssembly juntos»); la página guarda otra instancia para comprobar las cuentas.
// - El worker escribe los píxeles en su memoria (una paleta de 256 colores en los bytes 0-1023
//   y la imagen detrás) y devuelve una COPIA transferida: su memoria no viaja ni se desconecta.
// - Cada petición lleva un número; si llega la respuesta de una vista que ya no se pide, se
//   descarta. El worker no se puede interrumpir a mitad, pero cada imagen tarda poco.
// - Bucles acotados: como mucho 1000 iteraciones por píxel (aquí 200) y 480 × 320 píxeles.
// - Accesible: el lienzo tiene foco y teclado; la vista (centro y escala) se anuncia en texto.
//
// Usa assets/wasm/wat.js y assets/wasm/emit.js.
// Alcance: HTML, CSS, JavaScript, DOM, eventos de puntero y teclado, workers, transferibles,
// canvas 2D e ImageData y este módulo.
import { assemble } from './wasm/wat.js';

const WAT = `(module
  (memory (export "memory") 10)                     ;; 640 KiB: paleta (1 KiB) + 480 × 320 × 4 bytes
  ;; Cuántas vueltas aguanta el punto c = (x0, y0) antes de escapar del círculo de radio 2.
  (func $escape (export "escape") (param $x0 f64) (param $y0 f64) (param $max i32) (result i32)
    (local $x f64) (local $y f64) (local $x2 f64) (local $y2 f64) (local $i i32)
    (if (i32.gt_u (local.get $max) (i32.const 1000)) (then (local.set $max (i32.const 1000))))
    block $done
      loop $more
        (local.set $x2 (f64.mul (local.get $x) (local.get $x)))
        (local.set $y2 (f64.mul (local.get $y) (local.get $y)))
        (br_if $done (f64.gt (f64.add (local.get $x2) (local.get $y2)) (f64.const 4)))
        (br_if $done (i32.ge_u (local.get $i) (local.get $max)))
        (local.set $y (f64.add (f64.mul (f64.const 2) (f64.mul (local.get $x) (local.get $y))) (local.get $y0)))
        (local.set $x (f64.add (f64.sub (local.get $x2) (local.get $y2)) (local.get $x0)))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        br $more
      end
    end
    local.get $i)
  ;; Una imagen: cada píxel, su punto del plano, su color de la paleta (o negro si no escapa).
  (func (export "render") (param $width i32) (param $height i32) (param $cx f64) (param $cy f64) (param $scale f64) (param $max i32)
    (local $px i32) (local $py i32) (local $i i32) (local $out i32)
    (local.set $out (i32.const 1024))
    block $rowsDone
      loop $row
        (br_if $rowsDone (i32.ge_u (local.get $py) (local.get $height)))
        (local.set $px (i32.const 0))
        block $colsDone
          loop $col
            (br_if $colsDone (i32.ge_u (local.get $px) (local.get $width)))
            (local.set $i (call $escape
              (f64.add (local.get $cx) (f64.mul (f64.convert_i32_s (i32.sub (local.get $px) (i32.shr_u (local.get $width) (i32.const 1)))) (local.get $scale)))
              (f64.sub (local.get $cy) (f64.mul (f64.convert_i32_s (i32.sub (local.get $py) (i32.shr_u (local.get $height) (i32.const 1)))) (local.get $scale)))
              (local.get $max)))
            (i32.store (local.get $out)
              (select
                (i32.const 0xff000000)                                                         ;; dentro: negro opaco
                (i32.load (i32.shl (i32.and (local.get $i) (i32.const 255)) (i32.const 2)))  ;; fuera: la paleta
                (i32.ge_u (local.get $i) (local.get $max))))
            (local.set $out (i32.add (local.get $out) (i32.const 4)))
            (local.set $px (i32.add (local.get $px) (i32.const 1)))
            br $col
          end
        end
        (local.set $py (i32.add (local.get $py) (i32.const 1)))
        br $row
      end
    end))`;
const WIDTH = 480;
const HEIGHT = 320;
const MAX_ITERATIONS = 200;
const HOME = { cx: -0.6, cy: 0, scale: 3 / WIDTH }; // 3 unidades del plano a lo ancho

const WORKER_CODE = `
  let instance = null;
  self.onmessage = async ({ data }) => {
    if (data.type === 'init') {
      instance = await WebAssembly.instantiate(data.module); // el Module ya viene compilado
      const palette = new Uint8Array(instance.exports.memory.buffer, 0, 1024);
      for (let i = 0; i < 256; i++) { // azul noche → turquesa → oro → blanco
        const t = i / 255;
        palette[i * 4] = Math.round(255 * Math.min(1, Math.max(0, 3 * t - 1.2)));
        palette[i * 4 + 1] = Math.round(255 * Math.min(1, Math.max(0, 2.2 * t - 0.2)));
        palette[i * 4 + 2] = Math.round(255 * Math.min(1, 0.35 + 1.4 * t));
        palette[i * 4 + 3] = 255;
      }
      self.postMessage({ type: 'ready' });
      return;
    }
    const start = performance.now();
    instance.exports.render(data.width, data.height, data.cx, data.cy, data.scale, data.max);
    const size = data.width * data.height * 4;
    const pixels = instance.exports.memory.buffer.slice(1024, 1024 + size); // una copia, que se transfiere
    self.postMessage({ type: 'image', id: data.id, pixels, ms: performance.now() - start }, [pixels]);
  };
`;

const bytes = assemble(WAT);
const module = await WebAssembly.compile(bytes);
const local = await WebAssembly.instantiate(module); // en la página, para comprobar las cuentas
const worker = new Worker(URL.createObjectURL(new Blob([WORKER_CODE], { type: 'text/javascript' })));
addEventListener('pagehide', () => worker.terminate());

const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');
const viewText = document.querySelector('#view');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// La referencia: la misma cuenta en JavaScript (mismas operaciones de f64 → mismos enteros).
function escapeJs(x0, y0, max) {
  let x = 0;
  let y = 0;
  let i = 0;
  for (; i < max; i++) {
    const x2 = x * x;
    const y2 = y * y;
    if (x2 + y2 > 4) break;
    y = 2 * (x * y) + y0;
    x = x2 - y2 + x0;
  }
  return i;
}
const probes = [[-0.5, 0], [0.4, 0.4], [-0.75, 0.1], [-1.25, 0], [1, 1], [-0.1, 0.65]];
const counts = probes.map(([x, y]) => local.exports.escape(x, y, MAX_ITERATIONS));
const agree = probes.every(([x, y], index) => counts[index] === escapeJs(x, y, MAX_ITERATIONS));
logLine(`módulo → ${bytes.length} bytes, compilado una vez: una instancia en la página y otra en el worker`);
logLine(`¿mismas iteraciones que en JavaScript en ${probes.length} puntos? ${agree} · ${probes.map(([x, y], i) => `(${x}, ${y}) → ${counts[i]}`).join(' · ')}`);

let view = { ...HOME };
let latest = 0;
const describe = () => `centro (${view.cx.toFixed(6)}, ${view.cy.toFixed(6)}) · ${(1 / view.scale).toFixed(0)} píxeles por unidad`;
function request() {
  latest += 1;
  viewText.textContent = `Calculando… ${describe()}`;
  worker.postMessage({ type: 'render', id: latest, width: WIDTH, height: HEIGHT, max: MAX_ITERATIONS, ...view });
}
worker.onmessage = ({ data }) => {
  if (data.type === 'ready') { request(); return; }
  if (data.id !== latest) return; // una vista que ya no se pide
  context.putImageData(new ImageData(new Uint8ClampedArray(data.pixels), WIDTH, HEIGHT), 0, 0);
  viewText.textContent = `${describe()} · ${data.ms.toFixed(0)} ms en el worker`;
  canvas.setAttribute('aria-label', `El conjunto de Mandelbrot: ${describe()}`);
  logLine(`imagen ${WIDTH} × ${HEIGHT} → ${describe()}`);
};
worker.postMessage({ type: 'init', module }); // el Module se clona, el código compilado se comparte

function zoom(factor, cx = view.cx, cy = view.cy) {
  view = { cx, cy, scale: Math.min(HOME.scale, Math.max(1e-13, view.scale / factor)) };
  request();
}
function pan(dx, dy) { // un cuarto de la imagen por pulsación
  view = { ...view, cx: view.cx + dx * WIDTH * view.scale / 4, cy: view.cy + dy * HEIGHT * view.scale / 4 };
  request();
}
canvas.addEventListener('click', (event) => {
  const box = canvas.getBoundingClientRect();
  const px = ((event.clientX - box.left) / box.width) * WIDTH;
  const py = ((event.clientY - box.top) / box.height) * HEIGHT;
  zoom(2, view.cx + (px - WIDTH / 2) * view.scale, view.cy - (py - HEIGHT / 2) * view.scale);
});
canvas.addEventListener('keydown', (event) => {
  const actions = {
    ArrowLeft: () => pan(-1, 0), ArrowRight: () => pan(1, 0), ArrowUp: () => pan(0, 1), ArrowDown: () => pan(0, -1),
    '+': () => zoom(2), '=': () => zoom(2), '-': () => zoom(0.5),
  };
  if (!actions[event.key]) return;
  event.preventDefault();
  actions[event.key]();
});
document.querySelector('#zoom-in').addEventListener('click', () => zoom(2));
document.querySelector('#zoom-out').addEventListener('click', () => zoom(0.5));
document.querySelector('#home').addEventListener('click', () => { view = { ...HOME }; request(); });
logLine('Listo: haz clic en la imagen para acercar, o usa los botones y el teclado');
```

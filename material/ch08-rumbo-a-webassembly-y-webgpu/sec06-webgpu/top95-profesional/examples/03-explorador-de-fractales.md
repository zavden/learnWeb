---
example_description: "Un explorador del conjunto de Mandelbrot: un fragment shader itera z² + c en cada píxel (128 vueltas como mucho, un límite fijo), con una paleta por bandas de colores exactos. Se arrastra con el puntero, se acerca con los botones, con las teclas + y - o con Ctrl + rueda, y solo se redibuja cuando cambia la vista. Al llegar al límite de float32 deja de acercar y lo explica. Una autocomprobación repite en JavaScript el cálculo de dos píxeles"
example_tags: "javascript|webgpu|fragment-shader|fractal|mandelbrot|float32|puntero|teclado|accesibilidad|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="explorer">
  <h1>Explorador de Mandelbrot</h1>
  <canvas id="stage" tabindex="0" role="img" aria-label="El conjunto de Mandelbrot. Con el foco: flechas para moverte, + y - para acercar o alejar, 0 para volver al principio" aria-describedby="where"></canvas>
  <p id="where" class="where" aria-live="polite"></p>
  <div class="actions">
    <button id="zoom-in" type="button">Acercar ×2</button>
    <button id="zoom-out" type="button">Alejar ×2</button>
    <button id="reset" type="button">Volver al principio</button>
    <label>Iteraciones
      <select id="iterations">
        <option value="32">32</option>
        <option value="64">64</option>
        <option value="128" selected>128</option>
      </select>
    </label>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root {
  color-scheme: dark;
  --text: #e2e8f0;
  --muted: #94a3b8;
  --surface: #0f172a;
  --focus: #60a5fa;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--text);
  background: var(--surface);
}
.explorer {
  max-width: 36rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin-top: 0;
}
canvas {
  display: block;
  width: 100%;
  height: 300px;
  border-radius: 6px;
  cursor: grab;
  touch-action: none;
}
canvas:active {
  cursor: grabbing;
}
canvas:focus-visible,
button:focus-visible,
select:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}
.where {
  font-size: 0.85rem;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
button,
select {
  font: inherit;
  padding: 0.3rem 0.7rem;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.78rem;
}
```

# JavaScript

```javascript
// Usa assets/gpu/kit.js (léelo con «Assets»).
//
// Decisiones de diseño:
//   · Todo el cálculo está en el fragment shader: un píxel = un valor de c en el plano complejo.
//     El bucle tiene un límite FIJO (128) y un break: un shader que no acaba congela la GPU.
//   · La paleta va por bandas de 8 iteraciones con colores exactos, así la autocomprobación puede
//     comparar bytes; el interior del conjunto es el color del fondo.
//   · Se dibuja solo al cambiar la vista (invalidate: como mucho uno por fotograma).
//   · La escala se guarda por píxel CSS; el shader la recibe por píxel físico (÷ devicePixelRatio).
//   · float32 da unas 7 cifras (lección «Float32 y precisión»): hacia 1e-6 unidades por píxel, los
//     errores de redondeo de cada vuelta ya separan mal píxeles vecinos y aparecen bloques. Ahí se para.
import { createView, structLayout, writeStruct } from './gpu/kit.js';

const START = { center: [-0.5, 0], scale: 0.01 }; // 0.01 unidades por píxel CSS: 3 de alto en 300 px
const MIN_SCALE = 1e-6;
const VIEW = structLayout({ center: 'vec2f', size: 'vec2f', scale: 'f32', iterations: 'u32' });
const PALETTE = [[56, 189, 248], [167, 139, 250], [251, 191, 36], [244, 114, 182]];
const INSIDE = [15, 23, 42];
let center = [...START.center];
let scale = START.scale;
let limitShown = false;

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const iterationsSelect = document.querySelector('#iterations');
const where = document.querySelector('#where');
const format4 = (value) => Number(value.toPrecision(4));

const view = createView(document.querySelector('#stage'), {
  label: 'mandelbrot',
  setup({ device, format }) {
    const toWgsl = (rgb) => `vec3f(${rgb.map((c) => `${c}.0`).join(', ')}) / 255.0`;
    const module = device.createShaderModule({
      label: 'mandelbrot',
      code: /* wgsl */ `
        struct View { center: vec2f, size: vec2f, scale: f32, iterations: u32 }
        @group(0) @binding(0) var<uniform> view: View;
        @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
          var corners = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
          return vec4f(corners[index], 0.0, 1.0);
        }
        @fragment fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
          // El píxel, en el plano complejo (la y de la pantalla baja; la imaginaria sube)
          let c = view.center + (position.xy - view.size / 2.0) * vec2f(view.scale, -view.scale);
          var z = vec2f(0.0);
          var escapedAt = view.iterations;
          for (var i = 0u; i < 128u; i++) { // límite fijo; view.iterations lo acorta
            if (i >= view.iterations) { break; }
            if (dot(z, z) > 4.0) { escapedAt = i; break; }
            z = vec2f(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
          }
          if (escapedAt >= view.iterations) { return vec4f(${toWgsl(INSIDE)}, 1.0); }
          var palette = array<vec3f, 4>(${PALETTE.map(toWgsl).join(', ')});
          return vec4f(palette[(escapedAt / 8u) % 4u], 1.0); // bandas de 8 iteraciones
        }`,
    });
    const pipeline = device.createRenderPipeline({
      label: 'mandelbrot', layout: 'auto', vertex: { module }, fragment: { module, targets: [{ format }] },
    });
    const viewBuffer = device.createBuffer({ label: 'vista', size: VIEW.size, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    const bindGroup = device.createBindGroup({
      label: 'vista', layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: viewBuffer } }],
    });
    return { pipeline, viewBuffer, bindGroup };
  },
  render({ device, resources, view: current, pass }) {
    const { canvas } = current;
    device.queue.writeBuffer(resources.viewBuffer, 0, writeStruct(VIEW, {
      center, size: [canvas.width, canvas.height], scale: scale / devicePixelRatio, iterations: Number(iterationsSelect.value),
    }));
    const renderPass = pass({ label: 'mandelbrot' });
    renderPass.setPipeline(resources.pipeline);
    renderPass.setBindGroup(0, resources.bindGroup);
    renderPass.draw(3);
    renderPass.end();
    where.textContent = `Centro (${format4(center[0])}, ${format4(center[1])}) · ${format4(scale)} unidades por píxel · ${iterationsSelect.value} iteraciones`;
  },
});
const canvas = document.querySelector('#stage');

// La referencia: el mismo cálculo en JavaScript (float64) para el píxel físico (x, y)
function expectedAt(x, y) {
  const deviceScale = scale / devicePixelRatio;
  const c = [center[0] + (x + 0.5 - canvas.width / 2) * deviceScale, center[1] - (y + 0.5 - canvas.height / 2) * deviceScale];
  const limit = Number(iterationsSelect.value);
  let [zx, zy] = [0, 0];
  for (let i = 0; i < limit; i++) {
    if (zx * zx + zy * zy > 4) return { escapedAt: i, rgb: PALETTE[Math.floor(i / 8) % 4] };
    [zx, zy] = [zx * zx - zy * zy + c[0], 2 * zx * zy + c[1]];
  }
  return { escapedAt: null, rgb: INSIDE };
}
async function selfCheck() {
  const deviceScale = scale / devicePixelRatio;
  const middle = [Math.floor(canvas.width / 2), Math.floor(canvas.height / 2)];
  const outside = [Math.floor(canvas.width / 2 + (-2.2 - center[0]) / deviceScale), middle[1]]; // c ≈ (-2.2, 0)
  const points = [['centro del lienzo', middle], ['c = (-2.2, 0)', outside]].filter(([, [x]]) => x >= 0 && x < canvas.width);
  const colors = await view.renderNow({ readPixels: points.map(([, point]) => point) });
  for (const [[label, point], got] of points.map((entry, i) => [entry, colors[i]])) {
    const { escapedAt, rgb } = expectedAt(...point);
    const ok = rgb.every((value, k) => value === got[k]);
    const what = escapedAt === null ? 'dentro del conjunto' : `escapa en la iteración ${escapedAt}`;
    log(`${label} → ${what} · ${got.slice(0, 3).join(', ')} ${ok ? '✅' : `❌ (JavaScript: ${rgb.join(', ')})`}`);
  }
}

function zoom(factor) {
  const next = scale / factor;
  if (next < MIN_SCALE) {
    if (!limitShown) log('límite de float32: con más zoom, float32 ya no distingue bien los píxeles vecinos y el dibujo se volvería de bloques (lección «Float32 y precisión»)');
    limitShown = true;
    return false;
  }
  scale = Math.min(START.scale * 4, next); // alejar, como mucho hasta 4 veces la vista de partida
  view.invalidate();
  return true;
}
function pan(dxCss, dyCss) {
  center = [center[0] - dxCss * scale, center[1] + dyCss * scale];
  view.invalidate();
}

document.querySelector('#zoom-in').addEventListener('click', () => {
  if (zoom(2)) log(`zoom → ${format4(scale)} unidades por píxel`);
});
document.querySelector('#zoom-out').addEventListener('click', () => {
  if (zoom(0.5)) log(`zoom → ${format4(scale)} unidades por píxel`);
});
document.querySelector('#reset').addEventListener('click', () => {
  center = [...START.center];
  scale = START.scale;
  view.invalidate();
  log('vista → la de partida');
});
iterationsSelect.addEventListener('change', () => view.invalidate());

// Arrastrar con el puntero (con captura, para no perderlo al salir del lienzo)
let dragging = null;
canvas.addEventListener('pointerdown', (event) => {
  dragging = [event.clientX, event.clientY];
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  pan(event.clientX - dragging[0], event.clientY - dragging[1]);
  dragging = [event.clientX, event.clientY];
});
canvas.addEventListener('pointerup', () => { dragging = null; });
canvas.addEventListener('pointercancel', () => { dragging = null; });
// Ctrl + rueda (o el pellizco del trackpad) acerca; la rueda sola sigue desplazando la página
canvas.addEventListener('wheel', (event) => {
  if (!event.ctrlKey) return;
  event.preventDefault();
  zoom(event.deltaY < 0 ? 1.25 : 0.8);
}, { passive: false });
canvas.addEventListener('keydown', (event) => {
  const step = 40; // píxeles CSS
  const actions = {
    ArrowLeft: () => pan(step, 0), ArrowRight: () => pan(-step, 0), ArrowUp: () => pan(0, step), ArrowDown: () => pan(0, -step),
    '+': () => zoom(2), '=': () => zoom(2), '-': () => zoom(0.5), 0: () => document.querySelector('#reset').click(),
  };
  if (!actions[event.key]) return;
  event.preventDefault();
  actions[event.key]();
});

await view.ready;
log(`vista → centro (${START.center.join(', ')}) · ${START.scale} unidades por píxel · 128 iteraciones como mucho`);
await selfCheck();
log('Listo: arrastra, usa los botones o, con el foco en el fractal, las flechas y + / -');
```

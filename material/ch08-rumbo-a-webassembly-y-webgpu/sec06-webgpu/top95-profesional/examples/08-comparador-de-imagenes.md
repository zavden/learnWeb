---
example_description: "Un comparador de imágenes para pruebas de regresión visual: un compute shader compara dos versiones de una foto píxel a píxel, marca los distintos en una máscara y, con atómicos, los cuenta (atomicAdd) y calcula la caja que los contiene (atomicMin y atomicMax). Un fragment shader enseña el original, la retocada o las diferencias con su caja, leyendo esos búferes sin pasar por JavaScript. El recuento y la caja se comprueban contra JavaScript"
example_tags: "javascript|webgpu|compute-shader|atomicos|atomicmin|atomicmax|regresion-visual|imagenes|accesibilidad|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="diff">
  <h1>Comparador de imágenes</h1>
  <canvas id="stage" role="img" aria-label="La foto elegida abajo: original, retocada, o las diferencias en rosa con su caja en ámbar"></canvas>
  <fieldset id="mode" class="mode">
    <legend>Ver</legend>
    <label><input type="radio" name="mode" value="0"> Original</label>
    <label><input type="radio" name="mode" value="1"> Retocada</label>
    <label><input type="radio" name="mode" value="2" checked> Diferencias</label>
  </fieldset>
  <p id="report" class="report" role="status"></p>
  <ol id="log" class="log" aria-live="polite"></ol>
  <p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público. La «retocada» se genera en el navegador.</p>
</main>
```

# CSS

```css
:root {
  color-scheme: dark;
  --text: #e2e8f0;
  --muted: #94a3b8;
  --surface: #0f172a;
  --line: #334155;
  --focus: #60a5fa;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--text);
  background: var(--surface);
}
.diff {
  max-width: 34rem;
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
  aspect-ratio: 480 / 330;
  border-radius: 6px;
}
.mode {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin-top: 0.75rem;
  border: 1px solid var(--line);
  border-radius: 6px;
}
input:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}
.report {
  font-size: 0.9rem;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.78rem;
}
.credit {
  font-size: 0.8rem;
  color: var(--muted);
}
```

# JavaScript

```javascript
// Usa assets/gpu/kit.js (léelo con «Assets») y assets/valley-of-mexico.jpg.
//
// Decisiones de diseño:
//   · Comparación EXACTA (cualquier byte distinto cuenta): la que usan las pruebas de regresión
//     visual cuando las capturas salen del mismo navegador.
//   · Un hilo por píxel; los resultados globales (cuántos, y la caja) con atómicos sobre una
//     estructura de 5 contadores, que se reinicia con writeBuffer antes de cada comparación.
//   · Las tres vistas son el mismo fragment shader con un uniform «mode»: cambiar de vista no
//     recalcula nada. La caja se dibuja leyendo los contadores del búfer, sin traerlos a JavaScript.
import { createView, loadPixels, readBuffer, structLayout, writeStruct } from './gpu/kit.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const { width, height, pixels: original } = await loadPixels('valley-of-mexico.jpg');
// La «retocada»: una pegatina de 60 × 40 (frambuesa) y 12 píxeles sueltos (magenta)
const edited = original.slice();
const STICKER = { x: 300, y: 40, width: 60, height: 40 };
const toU32 = ([r, g, b]) => (r | (g << 8) | (b << 16) | (255 << 24)) >>> 0;
for (let y = STICKER.y; y < STICKER.y + STICKER.height; y++) {
  edited.fill(toU32([225, 29, 72]), y * width + STICKER.x, y * width + STICKER.x + STICKER.width);
}
const LOOSE = [[15, 300], [465, 310], [120, 200], [240, 165], [60, 100], [420, 250], [180, 290], [330, 140], [90, 30], [400, 60], [275, 230], [35, 180]];
for (const [x, y] of LOOSE) edited[y * width + x] = toU32([255, 0, 255]);

const DISPLAY = structLayout({ imageSize: 'vec2f', viewSize: 'vec2f', mode: 'u32' });
const NO_MIN = 0xffffffff; // el «mínimo» de partida: cualquier coordenada es menor
const MODES = ['original', 'retocada', 'diferencias'];

const view = createView(document.querySelector('#stage'), {
  label: 'comparador',
  setup({ device, format }) {
    const { STORAGE, COPY_SRC, COPY_DST, UNIFORM } = GPUBufferUsage;
    const image = (label, data) => {
      const buffer = device.createBuffer({ label, size: data.byteLength, usage: STORAGE | COPY_DST });
      device.queue.writeBuffer(buffer, 0, data);
      return buffer;
    };
    const originalBuffer = image('original', original);
    const editedBuffer = image('retocada', edited);
    const mask = device.createBuffer({ label: 'máscara', size: original.byteLength, usage: STORAGE });
    const stats = device.createBuffer({ label: 'recuento y caja', size: 5 * 4, usage: STORAGE | COPY_DST | COPY_SRC });
    const display = device.createBuffer({ label: 'vista', size: DISPLAY.size, usage: UNIFORM | COPY_DST });
    const compare = device.createComputePipeline({
      label: 'comparar', layout: 'auto',
      compute: {
        module: device.createShaderModule({
          label: 'comparar',
          code: /* wgsl */ `
            struct Stats { count: atomic<u32>, minX: atomic<u32>, minY: atomic<u32>, maxX: atomic<u32>, maxY: atomic<u32> }
            @group(0) @binding(0) var<storage, read> original: array<u32>;
            @group(0) @binding(1) var<storage, read> edited: array<u32>;
            @group(0) @binding(2) var<storage, read_write> mask: array<u32>;
            @group(0) @binding(3) var<storage, read_write> stats: Stats;
            @compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {
              let i = id.x;
              if (i >= arrayLength(&original)) { return; }
              let differs = original[i] != edited[i];
              mask[i] = select(0u, 1u, differs);
              if (differs) {
                let x = i % ${width}u;
                let y = i / ${width}u;
                atomicAdd(&stats.count, 1u);
                atomicMin(&stats.minX, x);
                atomicMin(&stats.minY, y);
                atomicMax(&stats.maxX, x);
                atomicMax(&stats.maxY, y);
              }
            }`,
        }),
      },
    });
    const drawModule = device.createShaderModule({
      label: 'vista',
      code: /* wgsl */ `
        struct Display { imageSize: vec2f, viewSize: vec2f, mode: u32 }
        @group(0) @binding(0) var<storage, read> original: array<u32>;
        @group(0) @binding(1) var<storage, read> edited: array<u32>;
        @group(0) @binding(2) var<storage, read> mask: array<u32>;
        @group(0) @binding(3) var<storage, read> stats: array<u32, 5>; // los mismos 5 contadores, ya quietos
        @group(0) @binding(4) var<uniform> display: Display;
        @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
          var corners = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
          return vec4f(corners[index], 0.0, 1.0);
        }
        @fragment fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
          let texel = min(vec2u(position.xy / display.viewSize * display.imageSize), vec2u(display.imageSize) - 1u);
          let i = texel.y * u32(display.imageSize.x) + texel.x;
          if (display.mode == 0u) { return vec4f(unpack4x8unorm(original[i]).rgb, 1.0); }
          if (display.mode == 1u) { return vec4f(unpack4x8unorm(edited[i]).rgb, 1.0); }
          // Diferencias: el borde de la caja en ámbar, los distintos en rosa, el resto en gris oscuro
          let onX = texel.x == stats[1] || texel.x == stats[3];
          let onY = texel.y == stats[2] || texel.y == stats[4];
          let withinX = texel.x >= stats[1] && texel.x <= stats[3];
          let withinY = texel.y >= stats[2] && texel.y <= stats[4];
          if ((onX && withinY) || (onY && withinX)) { return vec4f(0.984, 0.749, 0.141, 1.0); }
          if (mask[i] == 1u) { return vec4f(0.957, 0.447, 0.714, 1.0); }
          let rgb = unpack4x8unorm(original[i]).rgb;
          return vec4f(vec3f(dot(rgb, vec3f(0.2126, 0.7152, 0.0722)) * 0.4), 1.0);
        }`,
    });
    const draw = device.createRenderPipeline({
      label: 'vista', layout: 'auto', vertex: { module: drawModule }, fragment: { module: drawModule, targets: [{ format }] },
    });
    const group = (pipeline, buffers) => device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0), entries: buffers.map((buffer, binding) => ({ binding, resource: { buffer } })),
    });
    return {
      stats, display, compare, draw, dirty: true,
      compareGroup: group(compare, [originalBuffer, editedBuffer, mask, stats]),
      drawGroup: group(draw, [originalBuffer, editedBuffer, mask, stats, display]),
    };
  },
  render({ encoder, device, resources: gpu, view: current, pass }) {
    if (gpu.dirty) {
      gpu.dirty = false;
      device.queue.writeBuffer(gpu.stats, 0, new Uint32Array([0, NO_MIN, NO_MIN, 0, 0])); // contadores de partida
      const computePass = encoder.beginComputePass({ label: 'comparar' });
      computePass.setPipeline(gpu.compare);
      computePass.setBindGroup(0, gpu.compareGroup);
      computePass.dispatchWorkgroups(Math.ceil(original.length / 64));
      computePass.end();
    }
    const mode = Number(document.querySelector('#mode input:checked').value);
    device.queue.writeBuffer(gpu.display, 0, writeStruct(DISPLAY, { imageSize: [width, height], viewSize: [current.canvas.width, current.canvas.height], mode }));
    const renderPass = pass({ label: MODES[mode] });
    renderPass.setPipeline(gpu.draw);
    renderPass.setBindGroup(0, gpu.drawGroup);
    renderPass.draw(3);
    renderPass.end();
  },
});

// La misma comparación en JavaScript
function compareCpu() {
  const box = { count: 0, minX: Infinity, minY: Infinity, maxX: -1, maxY: -1 };
  for (let i = 0; i < original.length; i++) {
    if (original[i] === edited[i]) continue;
    const x = i % width;
    const y = Math.floor(i / width);
    box.count += 1;
    box.minX = Math.min(box.minX, x);
    box.minY = Math.min(box.minY, y);
    box.maxX = Math.max(box.maxX, x);
    box.maxY = Math.max(box.maxY, y);
  }
  return box;
}

await view.ready;
const [count, minX, minY, maxX, maxY] = await readBuffer(view.device, view.resources.stats, Uint32Array);
const cpu = compareCpu();
const same = count === cpu.count && minX === cpu.minX && minY === cpu.minY && maxX === cpu.maxX && maxY === cpu.maxY;
document.querySelector('#report').textContent = `${count} píxeles distintos, todos dentro de la caja de x ${minX} a ${maxX} e y ${minY} a ${maxY}.`;
log(`fotos → ${width} × ${height} · la retocada lleva una pegatina de ${STICKER.width} × ${STICKER.height} y ${LOOSE.length} píxeles sueltos`);
log(`distintos → ${count} píxeles · caja: x ${minX}-${maxX}, y ${minY}-${maxY} · ¿igual que en JavaScript? ${same ? '✅' : '❌'}`);
log('Listo: elige qué ver (original, retocada o diferencias)');
document.querySelector('#mode').addEventListener('change', (event) => {
  view.invalidate();
  log(`vista → ${MODES[Number(event.target.value)]}`);
});
```

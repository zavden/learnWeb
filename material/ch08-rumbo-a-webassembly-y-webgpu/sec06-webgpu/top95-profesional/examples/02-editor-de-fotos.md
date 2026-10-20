---
example_description: "Un editor de fotos con la GPU como motor: brillo, contraste, saturación y desenfoque como compute shaders encadenados con dos búferes que se turnan, un histograma con atómicos y dibujado con instancias, y una comparación «antes | después» que pinta un fragment shader leyendo los dos búferes. Cada cambio es UN submit y los datos no pasan por JavaScript; «Comprobar con JavaScript» repite la cadena en la CPU, en enteros, y compara los 158 400 píxeles"
example_tags: "javascript|webgpu|compute-shader|filtros|ping-pong|histograma|atomicos|instancias|formularios|accesibilidad|profesional"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="editor">
  <h1>Editor de fotos</h1>
  <canvas id="stage" role="img" aria-label="Valle de México: a la izquierda de la línea, la foto original; a la derecha, la editada. Debajo, su histograma"></canvas>
  <p id="summary" class="summary" aria-live="polite"></p>
  <form id="controls" class="controls">
    <label>Brillo <input type="range" name="brightness" min="-60" max="60" step="5" value="10"><output name="brightnessOut"></output></label>
    <label>Contraste <input type="range" name="contrast" min="50" max="150" step="5" value="115"><output name="contrastOut"></output></label>
    <label>Saturación <input type="range" name="saturation" min="0" max="200" step="5" value="120"><output name="saturationOut"></output></label>
    <fieldset>
      <legend>Desenfoque</legend>
      <label><input type="radio" name="radius" value="0" checked> No</label>
      <label><input type="radio" name="radius" value="1"> 3 × 3</label>
      <label><input type="radio" name="radius" value="2"> 5 × 5</label>
    </fieldset>
    <label>Antes | después <input type="range" name="split" min="0" max="100" step="1" value="50"><output name="splitOut"></output></label>
  </form>
  <button id="verify" type="button">Comprobar con JavaScript</button>
  <ol id="log" class="log" aria-live="polite"></ol>
  <p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
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
.editor {
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
  aspect-ratio: 480 / 430;
  border-radius: 6px;
}
.summary {
  font-size: 0.85rem;
  color: var(--muted);
}
.controls {
  display: grid;
  gap: 0.4rem;
  font-size: 0.9rem;
}
.controls > label {
  display: grid;
  grid-template-columns: 8rem 1fr 3.5rem;
  align-items: center;
  gap: 0.5rem;
}
fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  border: 1px solid var(--line);
  border-radius: 6px;
}
output {
  font-variant-numeric: tabular-nums;
  text-align: end;
}
button {
  font: inherit;
  margin-top: 0.75rem;
  padding: 0.35rem 0.8rem;
}
button:focus-visible,
input:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
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
//   · Los filtros son compute shaders sobre un u32 por píxel, en ENTEROS (como los de la lección
//     «Píxeles»): así la versión de JavaScript da exactamente los mismos bytes y la
//     autocomprobación puede usar === en los 158 400 píxeles.
//   · Cadena con ping-pong: el original no se toca; cada filtro activo lee un búfer y escribe en
//     el otro. Un molde de bind group EXPLÍCITO vale para los cuatro pipelines de filtro.
//   · Un cambio = un submit: los filtros, el histograma (atomicAdd + atomicMax) y el dibujo de la
//     foto y de las barras van en el mismo encargo. JavaScript solo lee el histograma para el
//     resumen en texto, y la foto entera solo al pulsar «Comprobar».
//   · «Antes | después» no recalcula nada: solo cambia un uniform y redibuja.
import { createView, loadPixels, readBuffer, structLayout, writeStruct } from './gpu/kit.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const { width, height, pixels: original } = await loadPixels('valley-of-mexico.jpg');
const PARAMS = structLayout({ width: 'u32', height: 'u32', brightness: 'i32', contrast: 'i32', saturation: 'i32', radius: 'i32' });
const DISPLAY = structLayout({ imageSize: 'vec2f', viewSize: 'vec2f', split: 'f32' });
const FILTERS = ['brighten', 'contrast', 'saturation', 'blur']; // nombres de los puntos de entrada

const form = document.querySelector('#controls');
function settings() {
  return {
    brightness: Number(form.brightness.value),
    contrast: Number(form.contrast.value),
    saturation: Number(form.saturation.value),
    radius: Number(form.radius.value),
    split: Number(form.split.value) / 100,
  };
}
// Qué filtros hacen algo con estos ajustes, en orden
function chainOf({ brightness, contrast, saturation, radius }) {
  return [brightness !== 0 && 'brighten', contrast !== 100 && 'contrast', saturation !== 100 && 'saturation', radius > 0 && 'blur'].filter(Boolean);
}
function describe(chain, s) {
  const names = { brighten: `brillo ${s.brightness > 0 ? '+' : ''}${s.brightness}`, contrast: `contraste ${s.contrast} %`, saturation: `saturación ${s.saturation} %`, blur: `desenfoque ${2 * s.radius + 1} × ${2 * s.radius + 1}` };
  return chain.map((step) => names[step]).join(' → ') || 'ninguno (el original)';
}

const FILTER_CODE = /* wgsl */ `
  struct Params { width: u32, height: u32, brightness: i32, contrast: i32, saturation: i32, radius: i32 }
  @group(0) @binding(0) var<storage, read> src: array<u32>;
  @group(0) @binding(1) var<storage, read_write> dst: array<u32>;
  @group(0) @binding(2) var<uniform> params: Params;

  fn rgbOf(p: u32) -> vec3i { return vec3i(i32(p & 0xffu), i32((p >> 8u) & 0xffu), i32((p >> 16u) & 0xffu)); }
  fn pack(rgb: vec3i, alpha: u32) -> u32 {
    let c = clamp(rgb, vec3i(0), vec3i(255));
    return u32(c.x) | (u32(c.y) << 8u) | (u32(c.z) << 16u) | (alpha << 24u);
  }
  fn inside(id: vec3u) -> bool { return id.x < params.width && id.y < params.height; }
  fn at(x: i32, y: i32) -> u32 { // fuera de la foto, el píxel del borde
    return src[u32(clamp(y, 0, i32(params.height) - 1)) * params.width + u32(clamp(x, 0, i32(params.width) - 1))];
  }

  @compute @workgroup_size(8, 8) fn brighten(@builtin(global_invocation_id) id: vec3u) {
    if (!inside(id)) { return; }
    let i = id.y * params.width + id.x;
    dst[i] = pack(rgbOf(src[i]) + vec3i(params.brightness), src[i] >> 24u);
  }
  @compute @workgroup_size(8, 8) fn contrast(@builtin(global_invocation_id) id: vec3u) {
    if (!inside(id)) { return; }
    let i = id.y * params.width + id.x;
    dst[i] = pack((rgbOf(src[i]) - vec3i(128)) * params.contrast / 100 + vec3i(128), src[i] >> 24u); // ÷ entera: trunca
  }
  @compute @workgroup_size(8, 8) fn saturation(@builtin(global_invocation_id) id: vec3u) {
    if (!inside(id)) { return; }
    let i = id.y * params.width + id.x;
    let rgb = rgbOf(src[i]);
    let luma = (54 * rgb.x + 183 * rgb.y + 19 * rgb.z + 128) >> 8u; // la luminancia de la lección 2
    dst[i] = pack(vec3i(luma) + (rgb - vec3i(luma)) * params.saturation / 100, src[i] >> 24u);
  }
  @compute @workgroup_size(8, 8) fn blur(@builtin(global_invocation_id) id: vec3u) {
    if (!inside(id)) { return; }
    var sum = vec3i(0);
    for (var dy = -2; dy <= 2; dy++) {
      for (var dx = -2; dx <= 2; dx++) { // 25 vueltas como mucho: un límite fijo
        if (abs(dx) <= params.radius && abs(dy) <= params.radius) {
          sum += rgbOf(at(i32(id.x) + dx, i32(id.y) + dy));
        }
      }
    }
    let count = (2 * params.radius + 1) * (2 * params.radius + 1);
    let i = id.y * params.width + id.x;
    dst[i] = pack((sum + vec3i(count / 2)) / vec3i(count), src[i] >> 24u);
  }`;

const HISTOGRAM_CODE = /* wgsl */ `
  @group(0) @binding(0) var<storage, read> image: array<u32>;
  @group(0) @binding(1) var<storage, read_write> bins: array<atomic<u32>, 256>;
  @compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {
    if (id.x >= arrayLength(&image)) { return; }
    let p = image[id.x];
    atomicAdd(&bins[(54u * (p & 0xffu) + 183u * ((p >> 8u) & 0xffu) + 19u * ((p >> 16u) & 0xffu) + 128u) >> 8u], 1u);
  }`;
const MAXIMUM_CODE = /* wgsl */ `
  @group(0) @binding(0) var<storage, read> bins: array<u32, 256>;
  @group(0) @binding(1) var<storage, read_write> tallest: atomic<u32>;
  @compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {
    if (id.x < 256u) { atomicMax(&tallest, bins[id.x]); }
  }`;
const DRAW_CODE = /* wgsl */ `
  struct Display { imageSize: vec2f, viewSize: vec2f, split: f32 }
  @group(0) @binding(0) var<storage, read> original: array<u32>;
  @group(0) @binding(1) var<storage, read> edited: array<u32>;
  @group(0) @binding(2) var<uniform> display: Display;
  @group(0) @binding(3) var<storage, read> bins: array<u32, 256>;
  @group(0) @binding(4) var<storage, read> tallest: u32;

  @vertex fn photoVertex(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
    var corners = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
    return vec4f(corners[index], 0.0, 1.0);
  }
  @fragment fn photoFragment(@builtin(position) position: vec4f) -> @location(0) vec4f {
    let splitX = display.split * display.viewSize.x;
    if (abs(position.x - splitX) < 1.5) { return vec4f(0.973, 0.980, 0.988, 1.0); } // la línea
    let texel = min(vec2u(position.xy / display.viewSize * display.imageSize), vec2u(display.imageSize) - 1u);
    let i = texel.y * u32(display.imageSize.x) + texel.x;
    let p = select(edited[i], original[i], position.x < splitX); // antes a la izquierda, después a la derecha
    return vec4f(unpack4x8unorm(p).rgb, 1.0);
  }

  struct BarOutput { @builtin(position) position: vec4f, @location(0) shade: f32 }
  @vertex fn barVertex(@builtin(vertex_index) corner: u32, @builtin(instance_index) level: u32) -> BarOutput {
    var quad = array<vec2f, 6>(vec2f(0, 0), vec2f(1, 0), vec2f(0, 1), vec2f(0, 1), vec2f(1, 0), vec2f(1, 1));
    let q = quad[corner];
    let barHeight = f32(bins[level]) / f32(max(tallest, 1u));
    var output: BarOutput;
    output.position = vec4f(-1.0 + (f32(level) + q.x) * (2.0 / 256.0), -0.92 + q.y * barHeight * 1.84, 0.0, 1.0);
    output.shade = 0.35 + 0.65 * f32(level) / 255.0;
    return output;
  }
  @fragment fn barFragment(bar: BarOutput) -> @location(0) vec4f {
    return vec4f(vec3f(bar.shade), 1.0);
  }`;

const view = createView(document.querySelector('#stage'), {
  label: 'editor',
  setup({ device, format }) {
    const { STORAGE, COPY_SRC, COPY_DST, UNIFORM } = GPUBufferUsage;
    const bytes = original.byteLength;
    const source = device.createBuffer({ label: 'original', size: bytes, usage: STORAGE | COPY_DST | COPY_SRC });
    device.queue.writeBuffer(source, 0, original);
    const images = [source, ...['A', 'B'].map((name) => device.createBuffer({ label: `trabajo ${name}`, size: bytes, usage: STORAGE | COPY_SRC }))];
    const params = device.createBuffer({ label: 'parámetros', size: PARAMS.size, usage: UNIFORM | COPY_DST });
    const display = device.createBuffer({ label: 'vista', size: DISPLAY.size, usage: UNIFORM | COPY_DST });
    const bins = device.createBuffer({ label: 'histograma', size: 1024, usage: STORAGE | COPY_DST | COPY_SRC });
    const tallest = device.createBuffer({ label: 'el más alto', size: 4, usage: STORAGE | COPY_DST });

    const filterLayout = device.createBindGroupLayout({
      label: 'filtro',
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
      ],
    });
    const filterModule = device.createShaderModule({ label: 'filtros', code: FILTER_CODE });
    const layout = device.createPipelineLayout({ label: 'filtros', bindGroupLayouts: [filterLayout] });
    const filters = Object.fromEntries(FILTERS.map((entryPoint) => [entryPoint, device.createComputePipeline({ label: entryPoint, layout, compute: { module: filterModule, entryPoint } })]));
    const filterGroup = (from, to) => device.createBindGroup({
      label: `${images[from].label} → ${images[to].label}`,
      layout: filterLayout,
      entries: [{ binding: 0, resource: { buffer: images[from] } }, { binding: 1, resource: { buffer: images[to] } }, { binding: 2, resource: { buffer: params } }],
    });
    // Los caminos posibles: original → A, A → B, B → A
    const filterGroups = { '0-1': filterGroup(0, 1), '1-2': filterGroup(1, 2), '2-1': filterGroup(2, 1) };

    const count = device.createComputePipeline({ label: 'histograma', layout: 'auto', compute: { module: device.createShaderModule({ label: 'histograma', code: HISTOGRAM_CODE }) } });
    const maximum = device.createComputePipeline({ label: 'máximo', layout: 'auto', compute: { module: device.createShaderModule({ label: 'máximo', code: MAXIMUM_CODE }) } });
    const drawModule = device.createShaderModule({ label: 'dibujo', code: DRAW_CODE });
    const drawLayout = device.createBindGroupLayout({
      label: 'dibujo',
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
        { binding: 3, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
        { binding: 4, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
      ],
    });
    const drawPipelineLayout = device.createPipelineLayout({ label: 'dibujo', bindGroupLayouts: [drawLayout] });
    const renderPipeline = (vertex, fragment) => device.createRenderPipeline({
      label: vertex, layout: drawPipelineLayout,
      vertex: { module: drawModule, entryPoint: vertex }, fragment: { module: drawModule, entryPoint: fragment, targets: [{ format }] },
    });
    const photo = renderPipeline('photoVertex', 'photoFragment');
    const bars = renderPipeline('barVertex', 'barFragment');
    const pick = (index, list) => device.createBindGroup({
      label: `con ${images[index].label}`, layout: list.layout,
      entries: list.buffers(images[index]).map((buffer, binding) => ({ binding, resource: { buffer } })),
    });
    // Un bind group por cada búfer que puede quedar con el resultado
    const countGroups = images.map((_, i) => pick(i, { layout: count.getBindGroupLayout(0), buffers: (image) => [image, bins] }));
    const drawGroups = images.map((_, i) => pick(i, { layout: drawLayout, buffers: (image) => [source, image, display, bins, tallest] }));
    const maximumGroup = device.createBindGroup({
      label: 'máximo', layout: maximum.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: bins } }, { binding: 1, resource: { buffer: tallest } }],
    });
    return { images, params, display, bins, tallest, filters, filterGroups, count, countGroups, maximum, maximumGroup, photo, bars, drawGroups, dirty: true, result: 0 };
  },
  render({ encoder, device, resources: gpu, view: currentView, pass }) {
    const s = settings();
    const canvas = currentView.canvas;
    const photoHeight = Math.round((canvas.height * 330) / 430);
    if (gpu.dirty) { // los filtros y el histograma, solo si cambió un ajuste
      gpu.dirty = false;
      device.queue.writeBuffer(gpu.params, 0, writeStruct(PARAMS, { width, height, brightness: s.brightness, contrast: s.contrast, saturation: s.saturation, radius: s.radius }));
      let from = 0;
      chainOf(s).forEach((step) => {
        const to = from === 1 ? 2 : 1; // original → A, A → B, B → A…
        const computePass = encoder.beginComputePass({ label: step });
        computePass.setPipeline(gpu.filters[step]);
        computePass.setBindGroup(0, gpu.filterGroups[`${from}-${to}`]);
        computePass.dispatchWorkgroups(Math.ceil(width / 8), Math.ceil(height / 8));
        computePass.end();
        from = to;
      });
      gpu.result = from;
      encoder.clearBuffer(gpu.bins);
      encoder.clearBuffer(gpu.tallest);
      for (const [pipeline, group, groups] of [[gpu.count, gpu.countGroups[from], Math.ceil(original.length / 64)], [gpu.maximum, gpu.maximumGroup, 4]]) {
        const computePass = encoder.beginComputePass();
        computePass.setPipeline(pipeline);
        computePass.setBindGroup(0, group);
        computePass.dispatchWorkgroups(groups);
        computePass.end();
      }
    }
    device.queue.writeBuffer(gpu.display, 0, writeStruct(DISPLAY, { imageSize: [width, height], viewSize: [canvas.width, photoHeight], split: s.split }));
    const renderPass = pass({ label: 'foto e histograma', clearValue: [30 / 255, 41 / 255, 59 / 255, 1] });
    renderPass.setBindGroup(0, gpu.drawGroups[gpu.result]);
    renderPass.setViewport(0, 0, canvas.width, photoHeight, 0, 1);
    renderPass.setPipeline(gpu.photo);
    renderPass.draw(3);
    renderPass.setViewport(0, photoHeight, canvas.width, canvas.height - photoHeight, 0, 1);
    renderPass.setPipeline(gpu.bars);
    renderPass.draw(6, 256); // las 256 barras, cada una lee su contador
    renderPass.end();
  },
  onStatus(status) {
    if (status === 'lost') log('dispositivo perdido → recreando…');
  },
});

// La misma cadena en JavaScript (enteros: Math.trunc imita la división entera de WGSL)
const clampByte = (value) => Math.min(255, Math.max(0, value));
const unpack = (p) => [p & 0xff, (p >>> 8) & 0xff, (p >>> 16) & 0xff];
const pack = ([r, g, b], p) => (clampByte(r) | (clampByte(g) << 8) | (clampByte(b) << 16) | (p & 0xff000000)) >>> 0;
const CPU_FILTERS = {
  brighten: (pixels, s) => pixels.map((p) => pack(unpack(p).map((c) => c + s.brightness), p)),
  contrast: (pixels, s) => pixels.map((p) => pack(unpack(p).map((c) => Math.trunc(((c - 128) * s.contrast) / 100) + 128), p)),
  saturation: (pixels, s) => pixels.map((p) => {
    const rgb = unpack(p);
    const luma = (54 * rgb[0] + 183 * rgb[1] + 19 * rgb[2] + 128) >> 8;
    return pack(rgb.map((c) => luma + Math.trunc(((c - luma) * s.saturation) / 100)), p);
  }),
  blur: (pixels, s) => {
    const out = new Uint32Array(pixels.length);
    const r = s.radius;
    const count = (2 * r + 1) ** 2;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const sum = [0, 0, 0];
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const q = pixels[Math.min(height - 1, Math.max(0, y + dy)) * width + Math.min(width - 1, Math.max(0, x + dx))];
            sum[0] += q & 0xff;
            sum[1] += (q >>> 8) & 0xff;
            sum[2] += (q >>> 16) & 0xff;
          }
        }
        out[y * width + x] = pack(sum.map((total) => Math.floor((total + Math.floor(count / 2)) / count)), pixels[y * width + x]);
      }
    }
    return out;
  },
};

async function verify() {
  if (view.resources.dirty) await view.renderNow(); // si hay un cambio sin dibujar, primero la GPU
  const s = settings();
  const chain = chainOf(s);
  const gpu = view.resources;
  const [edited, bins] = await Promise.all([readBuffer(view.device, gpu.images[gpu.result], Uint32Array), readBuffer(view.device, gpu.bins, Uint32Array)]);
  const expected = chain.reduce((pixels, step) => CPU_FILTERS[step](pixels, s), original);
  const same = edited.every((value, i) => value === expected[i]);
  const share = (from, to) => Math.round((bins.slice(from, to + 1).reduce((a, b) => a + b, 0) / original.length) * 100);
  document.querySelector('#summary').textContent = `Histograma de la foto editada: sombras (0-63) ${share(0, 63)} %, medios (64-191) ${share(64, 191)} %, luces (192-255) ${share(192, 255)} %.`;
  log(`cadena → ${describe(chain, s)} · ¿los mismos ${edited.length} píxeles que en JavaScript? ${same ? '✅' : '❌'}`);
}

function showValues() {
  const s = settings();
  form.brightnessOut.value = `${s.brightness > 0 ? '+' : ''}${s.brightness}`;
  form.contrastOut.value = `${s.contrast} %`;
  form.saturationOut.value = `${s.saturation} %`;
  form.splitOut.value = `${Math.round(s.split * 100)} %`;
}
form.addEventListener('input', (event) => {
  showValues();
  if (event.target.name !== 'split' && view.resources) view.resources.dirty = true; // la línea no recalcula
  view.invalidate(); // un dibujo por fotograma, como mucho
});
document.querySelector('#verify').addEventListener('click', verify);

showValues();
await view.ready;
log(`foto → ${width} × ${height} · 4 filtros en compute shaders + histograma con atómicos · 1 submit por cambio`);
await verify();
log('Listo: ajusta los filtros, mueve «Antes | después» o pulsa «Comprobar con JavaScript»');
```

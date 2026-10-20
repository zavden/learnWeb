---
example_description: "Una cadena de filtros en compute shaders sobre el cuadro de Velasco: brillo, desenfoque de 3 × 3 y enfoque, cada uno una pasada que lee un búfer y escribe en otro (dos búferes de trabajo que se turnan, ping-pong), con un bind group layout EXPLÍCITO compartido por los tres pipelines y grupos de 8 × 8 hilos. Todo en enteros: la misma cadena en JavaScript da los mismos 158 400 píxeles. Se recalcula al cambiar los controles, en un solo submit"
example_tags: "javascript|webgpu|compute-shader|filtros|ping-pong|bind-group-layout|pixeles|formularios|integracion"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Una cadena de filtros en la GPU</h1>
  <div class="pair">
    <figure>
      <canvas id="before" role="img" aria-label="Valle de México, original"></canvas>
      <figcaption>Original</figcaption>
    </figure>
    <figure>
      <canvas id="after" role="img" aria-label="Valle de México, con la cadena de filtros aplicada en la GPU"></canvas>
      <figcaption>Con los filtros (GPU)</figcaption>
    </figure>
  </div>
  <form id="filters" class="controls">
    <label>Brillo <input type="range" name="brightness" min="-60" max="60" step="10" value="20"> <output name="brightnessValue">+20</output></label>
    <label><input type="checkbox" name="useBlur" checked> Desenfocar (3 × 3)</label>
    <label><input type="checkbox" name="useSharpen" checked> Enfocar</label>
  </form>
  <ol id="log" class="log" aria-live="polite"></ol>
  <p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
</main>
```

# CSS

```css
:root {
  color-scheme: dark;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #e2e8f0;
  background: #0f172a;
}
main {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
figure {
  margin: 0;
  font-size: 0.8rem;
}
canvas {
  display: block;
  width: 100%;
  height: auto;
  margin-bottom: 0.25rem;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  align-items: center;
  margin-top: 0.75rem;
  font-size: 0.9rem;
}
input:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
.credit {
  font-size: 0.8rem;
  color: #94a3b8;
}
```

# JavaScript

```javascript
// Usa assets/webgpu/utils.js (léelo con «Assets») y assets/valley-of-mexico.jpg.
// Lecciones: «Búferes y compute» (pasadas, grupos, alineación), «Píxeles» (los filtros) y
// «Bits y bytes» (un píxel RGBA en un u32). Todo en enteros, para comparar con === y no «casi».
import { getDevice } from './webgpu/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const img = new Image();
img.crossOrigin = 'anonymous'; // en las tarjetas, la imagen es de otro origen
img.src = 'valley-of-mexico.jpg';
await img.decode();
const { naturalWidth: width, naturalHeight: height } = img;
const before = document.querySelector('#before');
const after = document.querySelector('#after');
for (const canvas of [before, after]) Object.assign(canvas, { width, height });
before.getContext('2d').drawImage(img, 0, 0);
const original = new Uint32Array(before.getContext('2d').getImageData(0, 0, width, height).data.buffer);

const { device } = await getDevice({ label: 'cadena de filtros' });
const { STORAGE, COPY_SRC, COPY_DST, UNIFORM, MAP_READ } = GPUBufferUsage;
const bytes = original.byteLength;
const source = device.createBuffer({ label: 'original', size: bytes, usage: STORAGE | COPY_DST | COPY_SRC });
device.queue.writeBuffer(source, 0, original);
const work = ['A', 'B'].map((name) => device.createBuffer({ label: `trabajo ${name}`, size: bytes, usage: STORAGE | COPY_SRC }));
const readBuffer = device.createBuffer({ label: 'lectura', size: bytes, usage: MAP_READ | COPY_DST });
const paramsBuffer = device.createBuffer({ label: 'parámetros', size: 16, usage: UNIFORM | COPY_DST });

// UN molde de bind group para los tres pipelines. Con layout: 'auto', cada pipeline tendría el
// suyo, y un bind group creado con uno no valdría para los otros.
const bindGroupLayout = device.createBindGroupLayout({
  label: 'origen, destino y parámetros',
  entries: [
    { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
    { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
    { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
  ],
});
const layout = device.createPipelineLayout({ label: 'filtros', bindGroupLayouts: [bindGroupLayout] });
const module = device.createShaderModule({
  label: 'filtros',
  code: /* wgsl */ `
    struct Params { width: u32, height: u32, brightness: i32 } // 12 bytes, sin huecos
    @group(0) @binding(0) var<storage, read> src: array<u32>;
    @group(0) @binding(1) var<storage, read_write> dst: array<u32>;
    @group(0) @binding(2) var<uniform> params: Params;

    fn channel(p: u32, c: u32) -> i32 { return i32((p >> (8u * c)) & 0xffu); }
    fn pack(r: i32, g: i32, b: i32, alpha: u32) -> u32 {
      return u32(clamp(r, 0, 255)) | (u32(clamp(g, 0, 255)) << 8u) | (u32(clamp(b, 0, 255)) << 16u) | (alpha << 24u);
    }
    fn at(x: i32, y: i32) -> u32 { // el píxel (x, y); fuera de la imagen, el del borde
      let cx = clamp(x, 0, i32(params.width) - 1);
      let cy = clamp(y, 0, i32(params.height) - 1);
      return src[u32(cy) * params.width + u32(cx)];
    }

    @compute @workgroup_size(8, 8)
    fn brighten(@builtin(global_invocation_id) id: vec3u) {
      if (id.x >= params.width || id.y >= params.height) { return; }
      let i = id.y * params.width + id.x;
      let p = src[i];
      let amount = params.brightness;
      dst[i] = pack(channel(p, 0u) + amount, channel(p, 1u) + amount, channel(p, 2u) + amount, p >> 24u);
    }

    @compute @workgroup_size(8, 8)
    fn blur(@builtin(global_invocation_id) id: vec3u) {
      if (id.x >= params.width || id.y >= params.height) { return; }
      var sum = vec3i(0);
      for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) { // 9 vecinos: un límite fijo
          let q = at(i32(id.x) + dx, i32(id.y) + dy);
          sum += vec3i(channel(q, 0u), channel(q, 1u), channel(q, 2u));
        }
      }
      let mean = (sum + vec3i(4)) / vec3i(9); // la media redondeada, en enteros
      let i = id.y * params.width + id.x;
      dst[i] = pack(mean.x, mean.y, mean.z, src[i] >> 24u);
    }

    @compute @workgroup_size(8, 8)
    fn sharpen(@builtin(global_invocation_id) id: vec3u) {
      if (id.x >= params.width || id.y >= params.height) { return; }
      let x = i32(id.x);
      let y = i32(id.y);
      let c = at(x, y);
      let n = at(x, y - 1);
      let s = at(x, y + 1);
      let e = at(x + 1, y);
      let w = at(x - 1, y);
      var rgb = array<i32, 3>();
      for (var k = 0u; k < 3u; k++) { // 5 × centro − los 4 vecinos
        rgb[k] = 5 * channel(c, k) - channel(n, k) - channel(s, k) - channel(e, k) - channel(w, k);
      }
      dst[id.y * params.width + id.x] = pack(rgb[0], rgb[1], rgb[2], c >> 24u);
    }`,
});
const FILTERS = {
  brighten: { name: 'brillo', cpu: brightenCpu },
  blur: { name: 'desenfoque', cpu: blurCpu },
  sharpen: { name: 'enfoque', cpu: sharpenCpu },
};
const pipelines = Object.fromEntries(Object.keys(FILTERS).map((entryPoint) => [
  entryPoint, device.createComputePipeline({ label: FILTERS[entryPoint].name, layout, compute: { module, entryPoint } }),
]));
const bindGroups = new Map(); // uno por pareja origen → destino, creado la primera vez
function bindGroupFor(input, output) {
  const key = `${input.label} → ${output.label}`;
  if (!bindGroups.has(key)) {
    bindGroups.set(key, device.createBindGroup({
      label: key,
      layout: bindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: input } }, { binding: 1, resource: { buffer: output } }, { binding: 2, resource: { buffer: paramsBuffer } }],
    }));
  }
  return bindGroups.get(key);
}

// La misma cadena en JavaScript, para comprobar
const clampByte = (value) => Math.min(255, Math.max(0, value));
const pack = (r, g, b, alpha) => (clampByte(r) | (clampByte(g) << 8) | (clampByte(b) << 16) | (alpha << 24)) >>> 0;
const channel = (p, c) => (p >>> (8 * c)) & 0xff;
const at = (pixels, x, y) => pixels[Math.min(height - 1, Math.max(0, y)) * width + Math.min(width - 1, Math.max(0, x))];
function brightenCpu(pixels, amount) {
  return pixels.map((p) => pack(channel(p, 0) + amount, channel(p, 1) + amount, channel(p, 2) + amount, p >>> 24));
}
function blurCpu(pixels) {
  const out = new Uint32Array(pixels.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const q = at(pixels, x + dx, y + dy);
          r += channel(q, 0); g += channel(q, 1); b += channel(q, 2);
        }
      }
      out[y * width + x] = pack(Math.floor((r + 4) / 9), Math.floor((g + 4) / 9), Math.floor((b + 4) / 9), pixels[y * width + x] >>> 24);
    }
  }
  return out;
}
function sharpenCpu(pixels) {
  const out = new Uint32Array(pixels.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [c, n, s, e, w] = [at(pixels, x, y), at(pixels, x, y - 1), at(pixels, x, y + 1), at(pixels, x + 1, y), at(pixels, x - 1, y)];
      const [r, g, b] = [0, 1, 2].map((k) => 5 * channel(c, k) - channel(n, k) - channel(s, k) - channel(e, k) - channel(w, k));
      out[y * width + x] = pack(r, g, b, c >>> 24);
    }
  }
  return out;
}

const form = document.querySelector('#filters');
async function run() {
  const amount = Number(form.brightness.value);
  const steps = [amount !== 0 && 'brighten', form.useBlur.checked && 'blur', form.useSharpen.checked && 'sharpen'].filter(Boolean);
  device.queue.writeBuffer(paramsBuffer, 0, new Int32Array([width, height, amount, 0]));
  const encoder = device.createCommandEncoder({ label: 'cadena' });
  let input = source;
  steps.forEach((step, i) => {
    const output = work[i % 2]; // A, B, A…: nunca se lee y se escribe el mismo búfer en una pasada
    const pass = encoder.beginComputePass({ label: FILTERS[step].name });
    pass.setPipeline(pipelines[step]);
    pass.setBindGroup(0, bindGroupFor(input, output));
    pass.dispatchWorkgroups(Math.ceil(width / 8), Math.ceil(height / 8));
    pass.end();
    input = output;
  });
  encoder.copyBufferToBuffer(input, 0, readBuffer, 0, bytes);
  device.queue.submit([encoder.finish()]); // toda la cadena, un solo envío
  await readBuffer.mapAsync(GPUMapMode.READ);
  const gpu = new Uint32Array(readBuffer.getMappedRange().slice(0));
  readBuffer.unmap();
  after.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(gpu.buffer), width, height), 0, 0);

  const cpu = steps.reduce((pixels, step) => FILTERS[step].cpu(pixels, amount), original);
  const names = steps.map((step) => (step === 'brighten' ? `brillo ${amount > 0 ? '+' : ''}${amount}` : FILTERS[step].name));
  log(`cadena → ${names.join(' → ') || 'ninguna (el original)'} · ${steps.length} ${steps.length === 1 ? 'pasada' : 'pasadas'}, 1 submit · ¿los mismos ${gpu.length} píxeles que en JavaScript? ${gpu.every((value, i) => value === cpu[i])}`);
}

let running = null;
let again = false;
async function schedule() { // como mucho una cadena en marcha; los cambios de mientras, en la siguiente
  if (running) {
    again = true;
    return;
  }
  running = run();
  await running;
  running = null;
  if (again) {
    again = false;
    schedule();
  }
}
form.addEventListener('input', () => {
  const amount = Number(form.brightness.value);
  form.brightnessValue.value = `${amount > 0 ? '+' : ''}${amount}`;
});
form.addEventListener('change', schedule); // el deslizador avisa al soltarlo

log(`foto → ${width} × ${height} · 1 búfer original + 2 de trabajo que se turnan · grupos de 8 × 8`);
await schedule();
log('Listo: mueve el brillo o activa y desactiva los filtros');
```

---
example_description: "Una foto y su histograma, sin que los datos pasen por JavaScript para dibujarse: un compute shader ajusta el brillo, otro cuenta los niveles con atomicAdd, un tercero busca el más alto con atomicMax, y dos render pipelines pintan la foto (un fragment shader que lee el búfer de píxeles) y las 256 barras (draw(6, 256), cada instancia lee su contador). Todo en un submit. Después, una copia comprueba el histograma contra JavaScript"
example_tags: "javascript|webgpu|compute-shader|histograma|atomicadd|atomicmax|instancias|storage-buffer|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Brillo e histograma, todo en la GPU</h1>
  <canvas id="photo" role="img" aria-label="Valle de México, con el brillo ajustado"></canvas>
  <canvas id="histogram" role="img" aria-label="Histograma de luminancias de la foto, de 0 (izquierda) a 255 (derecha)"></canvas>
  <p id="summary" class="summary" aria-live="polite"></p>
  <label class="control">Brillo <input id="brightness" type="range" min="-60" max="60" step="20" value="0"> <output id="brightness-value" for="brightness">0</output></label>
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
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
canvas {
  display: block;
  width: 100%;
}
#photo {
  aspect-ratio: 480 / 330;
}
#histogram {
  height: 96px;
  margin-top: 0.5rem;
}
.summary,
.control {
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
// Lecciones: «Búferes y compute» (atómicos, grupos) y «El pipeline de render» (instancias,
// un fragment shader que lee un búfer de almacenamiento).
import { getDevice, setupCanvas, readBuffer, clearColor } from './webgpu/utils.js';

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
const scratch = Object.assign(document.createElement('canvas'), { width, height }).getContext('2d');
scratch.drawImage(img, 0, 0);
const original = new Uint32Array(scratch.getImageData(0, 0, width, height).data.buffer);

const { device } = await getDevice({ label: 'histograma' });
const photoCanvas = document.querySelector('#photo');
Object.assign(photoCanvas, { width, height }); // un píxel del lienzo por píxel de la foto
const photo = photoCanvas.getContext('webgpu');
const format = navigator.gpu.getPreferredCanvasFormat();
photo.configure({ device, format, alphaMode: 'opaque' });
const chart = setupCanvas(document.querySelector('#histogram'), device);

const { STORAGE, COPY_SRC, COPY_DST, UNIFORM } = GPUBufferUsage;
const source = device.createBuffer({ label: 'foto', size: original.byteLength, usage: STORAGE | COPY_DST });
device.queue.writeBuffer(source, 0, original);
const adjusted = device.createBuffer({ label: 'foto ajustada', size: original.byteLength, usage: STORAGE });
const bins = device.createBuffer({ label: 'histograma', size: 256 * 4, usage: STORAGE | COPY_DST | COPY_SRC });
const tallest = device.createBuffer({ label: 'el nivel más alto', size: 4, usage: STORAGE | COPY_DST });
const amountBuffer = device.createBuffer({ label: 'brillo', size: 4, usage: UNIFORM | COPY_DST });

const LUMA = /* wgsl */ `(54u * (p & 0xffu) + 183u * ((p >> 8u) & 0xffu) + 19u * ((p >> 16u) & 0xffu) + 128u) >> 8u`;
const QUAD = /* wgsl */ `array<vec2f, 6>(vec2f(0, 0), vec2f(1, 0), vec2f(0, 1), vec2f(0, 1), vec2f(1, 0), vec2f(1, 1))`;
const shaders = {
  brighten: /* wgsl */ `
    @group(0) @binding(0) var<storage, read> source: array<u32>;
    @group(0) @binding(1) var<storage, read_write> adjusted: array<u32>;
    @group(0) @binding(2) var<uniform> amount: i32;
    fn shifted(p: u32, c: u32) -> u32 { // un canal, más el brillo, sin salirse de 0-255
      return u32(clamp(i32((p >> (8u * c)) & 0xffu) + amount, 0, 255)) << (8u * c);
    }
    @compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {
      if (id.x >= arrayLength(&source)) { return; }
      let p = source[id.x];
      adjusted[id.x] = shifted(p, 0u) | shifted(p, 1u) | shifted(p, 2u) | (p & 0xff000000u);
    }`,
  count: /* wgsl */ `
    @group(0) @binding(0) var<storage, read> adjusted: array<u32>;
    @group(0) @binding(1) var<storage, read_write> bins: array<atomic<u32>, 256>;
    @compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {
      if (id.x >= arrayLength(&adjusted)) { return; }
      let p = adjusted[id.x];
      atomicAdd(&bins[${LUMA}], 1u);
    }`,
  maximum: /* wgsl */ `
    @group(0) @binding(0) var<storage, read> bins: array<u32, 256>;
    @group(0) @binding(1) var<storage, read_write> tallest: atomic<u32>;
    @compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {
      if (id.x < 256u) { atomicMax(&tallest, bins[id.x]); } // 256 hilos, uno por nivel
    }`,
  photo: /* wgsl */ `
    @group(0) @binding(0) var<storage, read> adjusted: array<u32>;
    @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
      var corners = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
      return vec4f(corners[index], 0.0, 1.0);
    }
    @fragment fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
      let p = adjusted[u32(position.y) * ${width}u + u32(position.x)]; // un píxel de la foto por píxel del lienzo
      return vec4f(unpack4x8unorm(p).rgb, 1.0); // los 4 bytes del u32, de 0 a 1 (el rojo, el byte bajo)
    }`,
  bars: /* wgsl */ `
    @group(0) @binding(0) var<storage, read> bins: array<u32, 256>;
    @group(0) @binding(1) var<storage, read> tallest: u32;
    struct VertexOutput { @builtin(position) position: vec4f, @location(0) shade: f32 }
    @vertex fn vertexMain(@builtin(vertex_index) corner: u32, @builtin(instance_index) level: u32) -> VertexOutput {
      var quad = ${QUAD};
      let q = quad[corner];
      let barHeight = f32(bins[level]) / f32(max(tallest, 1u));
      var output: VertexOutput;
      output.position = vec4f(-1.0 + (f32(level) + q.x) * (2.0 / 256.0), -1.0 + q.y * barHeight * 2.0, 0.0, 1.0);
      output.shade = 0.35 + 0.65 * f32(level) / 255.0; // cada barra, de su propio gris (aclarado)
      return output;
    }
    @fragment fn fragmentMain(vertexOut: VertexOutput) -> @location(0) vec4f {
      return vec4f(vec3f(vertexOut.shade), 1.0);
    }`,
};
const modules = Object.fromEntries(Object.entries(shaders).map(([label, code]) => [label, device.createShaderModule({ label, code })]));
const computePipeline = (label) => device.createComputePipeline({ label, layout: 'auto', compute: { module: modules[label] } });
const renderPipeline = (label) => device.createRenderPipeline({
  label, layout: 'auto', vertex: { module: modules[label] }, fragment: { module: modules[label], targets: [{ format }] },
});
const pipelines = {
  brighten: computePipeline('brighten'), count: computePipeline('count'), maximum: computePipeline('maximum'),
  photo: renderPipeline('photo'), bars: renderPipeline('bars'),
};
const groupFor = (label, buffers) => device.createBindGroup({
  label, layout: pipelines[label].getBindGroupLayout(0), entries: buffers.map((buffer, binding) => ({ binding, resource: { buffer } })),
});
const groups = {
  brighten: groupFor('brighten', [source, adjusted, amountBuffer]), count: groupFor('count', [adjusted, bins]),
  maximum: groupFor('maximum', [bins, tallest]), photo: groupFor('photo', [adjusted]), bars: groupFor('bars', [bins, tallest]),
};

function computePass(encoder, label, workgroups) {
  const pass = encoder.beginComputePass({ label });
  pass.setPipeline(pipelines[label]);
  pass.setBindGroup(0, groups[label]);
  pass.dispatchWorkgroups(workgroups);
  pass.end();
}
function renderPass(encoder, label, context, vertexCount, instanceCount) {
  const pass = encoder.beginRenderPass({
    label,
    colorAttachments: [{ view: context.getCurrentTexture().createView(), clearValue: clearColor(30, 41, 59), loadOp: 'clear', storeOp: 'store' }],
  });
  pass.setPipeline(pipelines[label]);
  pass.setBindGroup(0, groups[label]);
  pass.draw(vertexCount, instanceCount);
  pass.end();
}

// El mismo histograma en JavaScript, para comprobar
function histogramCpu(amount) {
  const counts = new Uint32Array(256);
  const shift = (value) => Math.min(255, Math.max(0, value + amount));
  for (const p of original) {
    counts[(54 * shift(p & 0xff) + 183 * shift((p >>> 8) & 0xff) + 19 * shift((p >>> 16) & 0xff) + 128) >>> 8] += 1;
  }
  return counts;
}
const share = (counts, from, to) => Math.round((counts.slice(from, to + 1).reduce((a, b) => a + b, 0) / original.length) * 100);

const slider = document.querySelector('#brightness');
async function run() {
  const amount = Number(slider.value);
  device.queue.writeBuffer(amountBuffer, 0, new Int32Array([amount]));
  const encoder = device.createCommandEncoder({ label: 'brillo e histograma' });
  encoder.clearBuffer(bins); // los contadores, a cero en cada vuelta
  encoder.clearBuffer(tallest);
  computePass(encoder, 'brighten', Math.ceil(original.length / 64));
  computePass(encoder, 'count', Math.ceil(original.length / 64));
  computePass(encoder, 'maximum', 4);
  renderPass(encoder, 'photo', photo, 3, 1);
  renderPass(encoder, 'bars', chart.context, 6, 256); // 256 barras, una instancia cada una
  device.queue.submit([encoder.finish()]);

  const gpuCounts = await readBuffer(device, bins, Uint32Array); // solo para comprobar: el dibujo no lo necesita
  const cpuCounts = histogramCpu(amount);
  document.querySelector('#summary').textContent = `Sombras (0-63): ${share(gpuCounts, 0, 63)} % · medios (64-191): ${share(gpuCounts, 64, 191)} % · luces (192-255): ${share(gpuCounts, 192, 255)} %`;
  const label = amount > 0 ? `+${amount}` : String(amount);
  log(`brillo ${label} · 3 pasadas de cómputo + 2 de render en 1 submit · ¿el mismo histograma que en JavaScript? ${gpuCounts.every((count, i) => count === cpuCounts[i])}`);
}
slider.addEventListener('input', () => {
  document.querySelector('#brightness-value').value = slider.value > 0 ? `+${slider.value}` : slider.value;
});
slider.addEventListener('change', run);

log(`foto → ${width} × ${height} · 256 barras con draw(6, 256), sin pasar los datos por JavaScript`);
await run();
log('Listo: mueve «Brillo» (al soltarlo se recalcula todo)');
```

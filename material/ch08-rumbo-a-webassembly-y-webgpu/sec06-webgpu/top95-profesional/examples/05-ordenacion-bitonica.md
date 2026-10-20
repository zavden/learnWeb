---
example_description: "Ordenar 65 536 números en la GPU con la ordenación bitónica: 136 pasadas de cómputo en un solo submit, todas con el mismo bind group y un desplazamiento DINÁMICO distinto en el búfer de uniforms (múltiplos de 256 bytes, minUniformBufferOffsetAlignment). Se compara con Uint32Array.prototype.sort: el mismo orden y los tiempos de los dos. Se ejecuta al pulsar un botón"
example_tags: "javascript|webgpu|compute-shader|ordenacion|bitonica|offsets-dinamicos|alineacion|rendimiento|profesional"
example_stage: professional
example_importance: important
console: true
loop_protect: false
---

# HTML

```html
<main>
  <h1>Ordenar 65 536 números en la GPU</h1>
  <p>La ordenación bitónica compara y cambia parejas de números, todas a la vez, en 136 pasadas. Es la ordenación de las GPU: cada pasada es igual de cara, sin decisiones que dependan de los datos.</p>
  <button id="sort" type="button">Ordenar</button>
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
main {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin-top: 0;
}
p {
  color: var(--muted);
  font-size: 0.9rem;
}
button {
  font: inherit;
  padding: 0.35rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
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
//   · Cada pasada necesita dos números distintos (j y k). En lugar de 136 búferes o 136 submits,
//     un solo búfer de uniforms con los 136 pares, uno cada 256 bytes, y un bind group con
//     hasDynamicOffset: setBindGroup(0, grupo, [i × 256]) elige el par de cada pasada.
//   · Las 136 pasadas van en UN encargo: entre dos dispatch, WebGPU garantiza que la segunda ve
//     lo que escribió la primera.
//   · El pipeline se crea al cargar (createComputePipelineAsync), fuera del cronómetro.
//   · loop_protect: false en la cabecera, porque se mide; todos los bucles terminan.
import { requestDevice, createBuffer, readBuffer, seededRandom } from './gpu/kit.js';

const COUNT = 65536; // una potencia de 2: la ordenación bitónica la necesita
const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const random = seededRandom(2026);
const numbers = Uint32Array.from({ length: COUNT }, () => Math.floor(random() * 4294967296));
const { device } = await requestDevice({ label: 'ordenar' });
addEventListener('pagehide', () => device.destroy());

// Las pasadas: para cada tamaño de bloque k (2, 4… 65536), j = k/2, k/4… 1. 16 × 17 / 2 = 136.
const steps = [];
for (let k = 2; k <= COUNT; k *= 2) {
  for (let j = k / 2; j >= 1; j /= 2) steps.push([j, k]);
}
const ALIGN = device.limits.minUniformBufferOffsetAlignment; // 256 bytes
const stepData = new Uint32Array((steps.length * ALIGN) / 4);
steps.forEach(([j, k], i) => stepData.set([j, k], (i * ALIGN) / 4)); // cada par, al principio de su bloque de 256
const stepBuffer = createBuffer(device, { label: 'pasadas', data: stepData, usage: GPUBufferUsage.UNIFORM });
const dataBuffer = device.createBuffer({
  label: 'números', size: numbers.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
});

const layout = device.createBindGroupLayout({
  label: 'bitónica',
  entries: [
    { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
    { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform', hasDynamicOffset: true } },
  ],
});
const module = device.createShaderModule({
  label: 'bitónica',
  code: /* wgsl */ `
    struct Pass { j: u32, k: u32 }
    @group(0) @binding(0) var<storage, read_write> data: array<u32>;
    @group(0) @binding(1) var<uniform> current: Pass;
    @compute @workgroup_size(256)
    fn main(@builtin(global_invocation_id) id: vec3u) {
      let i = id.x;
      let partner = i ^ current.j; // la pareja de i en esta pasada
      if (partner <= i || partner >= arrayLength(&data)) { return; } // cada pareja, una sola vez
      let ascending = (i & current.k) == 0u; // bloques alternos, hacia arriba y hacia abajo
      let a = data[i];
      let b = data[partner];
      if ((a > b) == ascending) {
        data[i] = b;
        data[partner] = a;
      }
    }`,
});
const pipeline = await device.createComputePipelineAsync({
  label: 'bitónica', layout: device.createPipelineLayout({ label: 'bitónica', bindGroupLayouts: [layout] }), compute: { module },
});
const bindGroup = device.createBindGroup({
  label: 'bitónica',
  layout,
  entries: [{ binding: 0, resource: { buffer: dataBuffer } }, { binding: 1, resource: { buffer: stepBuffer, size: 8 } }],
});

async function sortOnGpu() {
  device.queue.writeBuffer(dataBuffer, 0, numbers);
  const encoder = device.createCommandEncoder({ label: 'ordenar' });
  const pass = encoder.beginComputePass({ label: '136 pasadas' });
  pass.setPipeline(pipeline);
  steps.forEach((_, i) => {
    pass.setBindGroup(0, bindGroup, [i * ALIGN]); // el mismo grupo, otro trozo del búfer de uniforms
    pass.dispatchWorkgroups(COUNT / 256);
  });
  pass.end();
  device.queue.submit([encoder.finish()]); // un solo envío
  return readBuffer(device, dataBuffer, Uint32Array);
}

const button = document.querySelector('#sort');
button.addEventListener('click', async () => {
  button.disabled = true;
  let start = performance.now();
  const gpuSorted = await sortOnGpu();
  const gpuMs = performance.now() - start;
  start = performance.now();
  const cpuSorted = numbers.slice().sort(); // la de los typed arrays ordena por valor, no como texto
  const cpuMs = performance.now() - start;
  log(`GPU, ${steps.length} pasadas en 1 submit (con subir y bajar los datos) → ${gpuMs.toFixed(1)} ms`);
  log(`CPU, Uint32Array.prototype.sort → ${cpuMs.toFixed(1)} ms`);
  const same = gpuSorted.every((value, i) => value === cpuSorted[i]);
  log(`¿el mismo orden? ${same ? '✅' : '❌'} · el menor: ${gpuSorted[0]} · el mayor: ${gpuSorted[COUNT - 1]}`);
  button.disabled = false;
});

log(`${COUNT} números de 32 bits (semilla 2026) · ${steps.length} pasadas, cada una con su desplazamiento dinámico de ${ALIGN} bytes`);
log('Listo: pulsa «Ordenar»');
```

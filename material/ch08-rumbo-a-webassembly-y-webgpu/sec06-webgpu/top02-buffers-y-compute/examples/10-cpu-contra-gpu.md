---
example_description: "El mismo cálculo en la CPU y en un compute shader: 64 meses de intereses y aportaciones para 524 288 cuentas de ahorro (33,5 millones de vueltas). La GPU gana con mucho, pero la PRIMERA vez su tiempo incluye crear el pipeline (compilar el shader) y los búferes: hay que prepararlos antes de medir. Se ejecuta al pulsar un botón"
example_tags: "javascript|webgpu|compute-shader|rendimiento|cpu|gpu|performance-now|pipeline|bug"
example_stage: common-error
example_importance: important
console: true
loop_protect: false
---

# HTML

```html
<main>
  <h1>Medio millón de cuentas de ahorro: CPU contra GPU</h1>
  <p>Cada cuenta: 64 meses de intereses (del 0,1 % al 0,4 % mensual) y aportaciones (de 50 a 170 al mes).</p>
  <button id="compare" type="button">Comparar</button>
  <ol id="log" class="log" aria-live="polite"></ol>
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
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Usa assets/webgpu/utils.js (léelo con «Assets»).
// loop_protect: false en la cabecera: la guarda de bucles de LearnWeb haría más lento el bucle medido.
import { getDevice } from './webgpu/utils.js';

const ACCOUNTS = 1 << 19; // 524 288 cuentas
const MONTHS = 64;
const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const { device } = await getDevice({ label: 'ahorros' });
const code = /* wgsl */ `
  @group(0) @binding(0) var<storage, read_write> balances: array<f32>;
  @compute @workgroup_size(64)
  fn main(@builtin(global_invocation_id) id: vec3u) {
    let i = id.x;
    if (i >= arrayLength(&balances)) { return; }
    let rate = 0.001 + f32(i % 7u) * 0.0005;  // interés mensual
    let deposit = 50.0 + f32(i % 13u) * 10.0; // aportación mensual
    var balance = balances[i];
    for (var month = 0u; month < ${MONTHS}u; month++) { // un límite fijo y pequeño
      balance = balance * (1.0 + rate) + deposit;
    }
    balances[i] = balance;
  }`;

// La CPU: lo mismo, cuenta a cuenta (en float64; al final se guarda en float32)
function simulateOnCpu(start) {
  const result = new Float32Array(ACCOUNTS);
  for (let i = 0; i < ACCOUNTS; i++) {
    const rate = 0.001 + (i % 7) * 0.0005;
    const deposit = 50 + (i % 13) * 10;
    let balance = start[i];
    for (let month = 0; month < MONTHS; month++) balance = balance * (1 + rate) + deposit;
    result[i] = balance;
  }
  return result;
}

// La GPU. 🐛 El pipeline y los búferes se crean en la PRIMERA llamada, dentro del cronómetro.
// ✅ En una aplicación, se crean al cargar (createComputePipelineAsync) y se lanza una vez en vacío.
let gpu = null;
async function simulateOnGpu(start) {
  if (!gpu) {
    const module = device.createShaderModule({ label: 'ahorros', code });
    const pipeline = await device.createComputePipelineAsync({ label: 'ahorros', layout: 'auto', compute: { module } });
    const work = device.createBuffer({ label: 'saldos', size: start.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC });
    const read = device.createBuffer({ label: 'lectura', size: start.byteLength, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    const bindGroup = device.createBindGroup({ label: 'saldos', layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: work } }] });
    gpu = { pipeline, work, read, bindGroup };
  }
  device.queue.writeBuffer(gpu.work, 0, start);
  const encoder = device.createCommandEncoder({ label: 'ahorros' });
  const pass = encoder.beginComputePass({ label: 'ahorros' });
  pass.setPipeline(gpu.pipeline);
  pass.setBindGroup(0, gpu.bindGroup);
  pass.dispatchWorkgroups(Math.ceil(ACCOUNTS / 64));
  pass.end();
  encoder.copyBufferToBuffer(gpu.work, 0, gpu.read, 0, start.byteLength);
  device.queue.submit([encoder.finish()]); // un solo envío por clic
  await gpu.read.mapAsync(GPUMapMode.READ); // espera a la GPU: subir, calcular y bajar
  const result = new Float32Array(gpu.read.getMappedRange().slice(0));
  gpu.read.unmap();
  return result;
}

let initial = null;
const button = document.querySelector('#compare');
button.addEventListener('click', async () => {
  button.disabled = true;
  initial ??= Float32Array.from({ length: ACCOUNTS }, (_, i) => 1000 + (i % 1000)); // saldos iniciales
  const first = gpu === null;
  let start = performance.now();
  const cpu = simulateOnCpu(initial);
  const cpuMs = performance.now() - start;
  start = performance.now();
  const gpuResult = await simulateOnGpu(initial);
  const gpuMs = performance.now() - start;
  let worst = 0; // la mayor diferencia relativa: float32 en la GPU, float64 en la CPU
  for (let i = 0; i < ACCOUNTS; i++) worst = Math.max(worst, Math.abs(gpuResult[i] - cpu[i]) / cpu[i]);
  log(`CPU, un bucle → ${cpuMs.toFixed(0)} ms`);
  log(`GPU${first ? ', 1.ª vez (crear el pipeline y los búferes)' : ''} → ${gpuMs.toFixed(1)} ms`);
  log(`¿el mismo resultado? (diferencia < 0,01 %) → ${worst < 1e-4}`);
  button.disabled = false;
});
log(`Listo: ${ACCOUNTS} cuentas × ${MONTHS} meses; pulsa «Comparar»`);
```

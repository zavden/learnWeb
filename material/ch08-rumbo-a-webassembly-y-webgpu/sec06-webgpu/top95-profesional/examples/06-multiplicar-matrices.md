---
example_description: "Multiplicar dos matrices de 256 × 256 en la GPU con teselas: cada grupo de 16 × 16 hilos copia dos trozos de las matrices a la memoria compartida del grupo (var<workgroup>), espera a todos sus hilos con workgroupBarrier() y suma desde ahí. Las matrices son de enteros pequeños, exactos en float32, así que el resultado coincide número a número con los tres bucles de JavaScript. Se ejecuta al pulsar un botón"
example_tags: "javascript|webgpu|compute-shader|matrices|var-workgroup|workgroupbarrier|rendimiento|profesional"
example_stage: professional
example_importance: important
console: true
loop_protect: false
---

# HTML

```html
<main>
  <h1>Multiplicar matrices en la GPU</h1>
  <p>Multiplicar matrices es casi todo el trabajo de una red neuronal (y de las transformaciones 3D). Aquí, dos matrices de 256 × 256: 16,7 millones de multiplicaciones y sumas.</p>
  <button id="multiply" type="button">Multiplicar</button>
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
//   · Teselas (tiling): un hilo por elemento de C. Los 256 hilos de un grupo (16 × 16) necesitan
//     las mismas 16 filas de A y las mismas 16 columnas de B, así que las copian UNA vez a la
//     memoria del grupo (var<workgroup>, rápida y compartida) en trozos de 16 × 16.
//   · workgroupBarrier(): nadie lee la tesela hasta que todos la han escrito, y nadie la pisa con
//     la siguiente hasta que todos la han usado. Tiene que estar en un flujo uniforme: el bucle
//     tiene un límite fijo (16 teselas) y no hay ningún return antes.
//   · Datos de enteros pequeños: sumas y productos exactos en float32, comparación con ===.
//   · El pipeline se crea al cargar; loop_protect: false porque se mide (los bucles terminan).
import { requestDevice, createBuffer, readBuffer } from './gpu/kit.js';

const SIZE = 256;
const TILE = 16;
const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const a = new Float32Array(SIZE * SIZE);
const b = new Float32Array(SIZE * SIZE);
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    a[row * SIZE + col] = ((row * 7 + col * 3) % 11) - 5; // de -5 a 5
    b[row * SIZE + col] = ((row * 5 + col * 2) % 13) - 6; // de -6 a 6
  }
}

const { device } = await requestDevice({ label: 'matrices' });
addEventListener('pagehide', () => device.destroy());
const { STORAGE, COPY_SRC } = GPUBufferUsage;
const aBuffer = createBuffer(device, { label: 'A', data: a, usage: STORAGE });
const bBuffer = createBuffer(device, { label: 'B', data: b, usage: STORAGE });
const cBuffer = device.createBuffer({ label: 'C', size: a.byteLength, usage: STORAGE | COPY_SRC });
const module = device.createShaderModule({
  label: 'producto',
  code: /* wgsl */ `
    const SIZE = ${SIZE}u;
    const TILE = ${TILE}u;
    @group(0) @binding(0) var<storage, read> a: array<f32>;
    @group(0) @binding(1) var<storage, read> b: array<f32>;
    @group(0) @binding(2) var<storage, read_write> c: array<f32>;
    var<workgroup> tileA: array<f32, TILE * TILE>; // compartidas por los hilos del grupo
    var<workgroup> tileB: array<f32, TILE * TILE>;

    @compute @workgroup_size(TILE, TILE)
    fn main(@builtin(global_invocation_id) globalId: vec3u, @builtin(local_invocation_id) localId: vec3u) {
      let row = globalId.y;
      let col = globalId.x;
      let slot = localId.y * TILE + localId.x;
      var sum = 0.0;
      for (var t = 0u; t < SIZE / TILE; t++) { // 16 teselas
        tileA[slot] = a[row * SIZE + t * TILE + localId.x];   // cada hilo copia UN número de cada tesela
        tileB[slot] = b[(t * TILE + localId.y) * SIZE + col];
        workgroupBarrier();
        for (var k = 0u; k < TILE; k++) { // 16 vueltas
          sum += tileA[localId.y * TILE + k] * tileB[k * TILE + localId.x];
        }
        workgroupBarrier();
      }
      c[row * SIZE + col] = sum;
    }`,
});
const pipeline = await device.createComputePipelineAsync({ label: 'producto', layout: 'auto', compute: { module } });
const bindGroup = device.createBindGroup({
  label: 'A, B y C',
  layout: pipeline.getBindGroupLayout(0),
  entries: [aBuffer, bBuffer, cBuffer].map((buffer, binding) => ({ binding, resource: { buffer } })),
});

function multiplyOnCpu() {
  const out = new Float32Array(SIZE * SIZE);
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      let sum = 0;
      for (let k = 0; k < SIZE; k++) sum += a[row * SIZE + k] * b[k * SIZE + col];
      out[row * SIZE + col] = sum;
    }
  }
  return out;
}
async function multiplyOnGpu() {
  const encoder = device.createCommandEncoder({ label: 'producto' });
  const pass = encoder.beginComputePass({ label: 'producto' });
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.dispatchWorkgroups(SIZE / TILE, SIZE / TILE); // 16 × 16 grupos de 16 × 16 hilos
  pass.end();
  device.queue.submit([encoder.finish()]);
  return readBuffer(device, cBuffer);
}

const button = document.querySelector('#multiply');
button.addEventListener('click', async () => {
  button.disabled = true;
  let start = performance.now();
  const cpu = multiplyOnCpu();
  const cpuMs = performance.now() - start;
  start = performance.now();
  const gpu = await multiplyOnGpu();
  const gpuMs = performance.now() - start;
  log(`CPU, tres bucles → ${cpuMs.toFixed(0)} ms`);
  log(`GPU, ${(SIZE / TILE) ** 2} grupos de ${TILE} × ${TILE} hilos (con bajar el resultado) → ${gpuMs.toFixed(1)} ms`);
  const same = gpu.every((value, i) => value === cpu[i]);
  log(`¿C es igual en los dos? ${same ? '✅' : '❌'} · C[0][0] = ${gpu[0]} · C[255][255] = ${gpu[SIZE * SIZE - 1]}`);
  button.disabled = false;
});

log(`A × B: ${SIZE} × ${SIZE} (enteros pequeños: exactos en float32) · teselas de ${TILE} × ${TILE} en memoria de grupo`);
log('Listo: pulsa «Multiplicar»');
```

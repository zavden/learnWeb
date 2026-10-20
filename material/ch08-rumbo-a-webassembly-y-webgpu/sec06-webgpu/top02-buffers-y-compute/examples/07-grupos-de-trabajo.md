---
example_description: "dispatchWorkgroups(n) lanza n grupos de @workgroup_size hilos cada uno. Para 100 precios con grupos de 64, dividir sin redondear (Math.floor(100 / 64) = 1) lanza 64 hilos y deja sin tocar los 36 últimos; Math.ceil da 2 grupos, 128 hilos, y la guarda if (id.x < arrayLength(&data)) frena a los 28 que sobran"
example_tags: "javascript|webgpu|compute-shader|dispatchworkgroups|workgroup-size|global-invocation-id|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Usa assets/webgpu/utils.js (léelo con «Assets»).
import { getDevice, createStorageBuffer, createComputeJob, dispatch, readBuffer } from './webgpu/utils.js';

const { device } = await getDevice({ label: 'grupos' });
const WORKGROUP_SIZE = 64;
const prices = Float32Array.from({ length: 100 }, (_, i) => i + 1); // 100 precios: 1, 2… 100

const code = /* wgsl */ `
  @group(0) @binding(0) var<storage, read_write> data: array<f32>;

  @compute @workgroup_size(${WORKGROUP_SIZE})
  fn main(@builtin(global_invocation_id) id: vec3u) {
    // id.x = número de grupo × ${WORKGROUP_SIZE} + número del hilo dentro de su grupo
    if (id.x < arrayLength(&data)) { // la guarda: el último grupo puede traer hilos de más
      data[id.x] = data[id.x] * 2.0;
    }
  }`;

async function run(workgroups) {
  const buffer = createStorageBuffer(device, 'precios', prices);
  dispatch(device, createComputeJob(device, { label: 'duplicar', code, buffers: [buffer] }), workgroups);
  const result = await readBuffer(device, buffer);
  const doubled = result.filter((value, i) => value === prices[i] * 2).length;
  return `${workgroups * WORKGROUP_SIZE} hilos · duplicados ${doubled} de ${prices.length} · el último vale ${result.at(-1)}`;
}

// 🐛 Dividir sin redondear: 100 / 64 = 1,56 → 1 grupo
const tooFew = Math.floor(prices.length / WORKGROUP_SIZE);
console.log(`🐛 dispatchWorkgroups(${tooFew}) →`, await run(tooFew));

// ✅ Redondear hacia ARRIBA: siempre un grupo más si sobra algo
const enough = Math.ceil(prices.length / WORKGROUP_SIZE);
console.log(`✅ dispatchWorkgroups(${enough}) →`, await run(enough));
```

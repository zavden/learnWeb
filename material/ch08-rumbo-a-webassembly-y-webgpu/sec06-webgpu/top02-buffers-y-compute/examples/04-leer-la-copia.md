---
example_description: "Tres formas de no leer el resultado de un compute shader: mapear el búfer de trabajo (no tiene MAP_READ y mapAsync se rechaza), mapear el búfer de lectura sin haber copiado nada en él (ceros) y usar la vista del rango mapeado después de unmap() (se queda vacía, como un búfer transferido). La buena: copyBufferToBuffer, mapAsync y una copia con slice() antes de unmap()"
example_tags: "javascript|webgpu|mapasync|getmappedrange|unmap|staging-buffer|detached|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Usa assets/webgpu/utils.js (léelo con «Assets»).
import { getDevice, createStorageBuffer, createComputeJob, dispatch } from './webgpu/utils.js';

const { device } = await getDevice({ label: 'leer' });
const input = new Float32Array([1, 2, 3, 4.5, -1]);
const work = createStorageBuffer(device, 'datos', input);
const job = createComputeJob(device, {
  label: 'duplicar',
  buffers: [work],
  code: /* wgsl */ `
    @group(0) @binding(0) var<storage, read_write> data: array<f32>;
    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) id: vec3u) {
      if (id.x < arrayLength(&data)) { data[id.x] = data[id.x] * 2.0; }
    }`,
});
dispatch(device, job, 1); // ya duplicado en la GPU: falta traerlo
const newReadBuffer = () => device.createBuffer({
  label: 'lectura', size: input.byteLength, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
});

// 🐛 1. Mapear el búfer de trabajo: no tiene MAP_READ (no puede tenerlo con STORAGE)
device.pushErrorScope('validation');
const mapped = await work.mapAsync(GPUMapMode.READ).then(() => 'mapeado', (error) => `rechazado: ${error.name}`);
const mapError = await device.popErrorScope();
console.log('🐛 mapAsync del búfer de trabajo →', mapped, '· ¿error de validación?', mapError !== null);

// 🐛 2. Mapear el búfer de lectura sin copiar nada en él: nace lleno de ceros
const empty = newReadBuffer();
await empty.mapAsync(GPUMapMode.READ);
console.log('🐛 sin copyBufferToBuffer →', new Float32Array(empty.getMappedRange()).join(','));
empty.unmap();

// La copia: GPU → búfer de lectura, grabada y enviada
const readBuffer = newReadBuffer();
const encoder = device.createCommandEncoder({ label: 'copiar' });
encoder.copyBufferToBuffer(work, 0, readBuffer, 0, input.byteLength);
device.queue.submit([encoder.finish()]);
await readBuffer.mapAsync(GPUMapMode.READ);

// 🐛 3. Una vista del rango mapeado SIN copiar: unmap() se lleva la memoria
const view = new Float32Array(readBuffer.getMappedRange());
const copy = view.slice(); // ✅ una copia propia, ANTES de unmap()
readBuffer.unmap();
console.log('🐛 la vista tras unmap() → length', view.length, '· view[0]', view[0]);
console.log('✅ la copia →', copy.join(','));
```

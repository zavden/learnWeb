---
example_description: "Calcular en media precisión en la GPU: un dispositivo con requiredFeatures ['shader-f16'], un shader con «enable f16;» y array<f16>, y los datos en un Float16Array de JavaScript (lección «Float32 y precisión»): la mitad de bytes que en float32, y los mismos redondeos en la GPU que en JavaScript (2049 se guarda como 2048)"
example_tags: "javascript|webgpu|f16|shader-f16|float16array|media-precision|requiredfeatures"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/webgpu/utils.js (léelo con «Assets»).
import { firstLine, createStorageBuffer, createComputeJob, dispatch, readBuffer } from './webgpu/utils.js';

// shader-f16 es opcional: se pregunta al adaptador y se pide al crear el dispositivo
const adapter = await navigator.gpu?.requestAdapter();
if (!adapter?.features.has('shader-f16') || typeof Float16Array !== 'function') {
  console.log('Sin shader-f16 (o sin Float16Array): el mismo cálculo se haría en f32');
} else {
  const device = await adapter.requestDevice({ label: 'media precisión', requiredFeatures: ['shader-f16'] });
  device.addEventListener('uncapturederror', (event) => console.warn('GPU →', firstLine(event.error.message)));
  addEventListener('pagehide', () => device.destroy());

  // Cuatro números en float16: 2 bytes cada uno. Ya al guardarlos se redondean.
  const halves = Float16Array.from([0.1, 1.5, 2049, 30000]);
  console.log('Float16Array →', halves.join(', '), `· ${halves.byteLength} bytes (en float32, ${halves.length * 4})`);

  const buffer = createStorageBuffer(device, 'medias', halves); // los bytes, tal cual
  const job = createComputeJob(device, {
    label: 'duplicar en f16',
    buffers: [buffer],
    code: /* wgsl */ `
      enable f16;
      @group(0) @binding(0) var<storage, read_write> data: array<f16>;
      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) id: vec3u) {
        if (id.x < arrayLength(&data)) {
          data[id.x] = data[id.x] * 2.0h; // 2.0h: un literal f16
        }
      }`,
  });
  dispatch(device, job, 1);
  console.log('×2 en la GPU →', (await readBuffer(device, buffer, Float16Array)).join(', '));
  console.log('×2 en JavaScript →', halves.map((x) => x * 2).join(', '));
}
```

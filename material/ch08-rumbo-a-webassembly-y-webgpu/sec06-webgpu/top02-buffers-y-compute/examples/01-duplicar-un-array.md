---
example_description: "El primer compute shader, todo a mano y en orden: los datos en un Float32Array, un búfer de almacenamiento que se llena con writeBuffer, el shader en WGSL, el pipeline y el bind group, una pasada de cómputo con dispatchWorkgroups, la copia a un búfer de lectura y mapAsync para traer el resultado. [1, 2, 3, 4.5, -1] vuelve como [2, 4, 6, 9, -2]"
example_tags: "javascript|webgpu|compute-shader|wgsl|storage-buffer|writebuffer|mapasync|dispatchworkgroups"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// 1. Adaptador y dispositivo, comprobados (lección «¿Qué es WebGPU?»)
const adapter = await navigator.gpu?.requestAdapter();
if (!adapter) throw new Error('WebGPU no está disponible en este equipo');
const device = await adapter.requestDevice({ label: 'duplicar' });
addEventListener('pagehide', () => device.destroy());
device.addEventListener('uncapturederror', (event) => console.warn('GPU →', event.error.message));

// 2. Los datos, en un Float32Array (lección «Float32 y precisión»): 5 números, 20 bytes
const input = new Float32Array([1, 2, 3, 4.5, -1]);

// 3. El compute shader: cada hilo duplica UN elemento; id.x dice cuál
const module = device.createShaderModule({
  label: 'duplicar',
  code: /* wgsl */ `
    @group(0) @binding(0) var<storage, read_write> data: array<f32>;

    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) id: vec3u) {
      if (id.x < arrayLength(&data)) { // hay 64 hilos y 5 números: los demás no hacen nada
        data[id.x] = data[id.x] * 2.0;
      }
    }`,
});

// 4. Dos búferes: el de trabajo, que usa el shader, y el de lectura, que JavaScript puede mapear
const workBuffer = device.createBuffer({
  label: 'datos',
  size: input.byteLength,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
});
device.queue.writeBuffer(workBuffer, 0, input); // CPU → GPU
const readBuffer = device.createBuffer({
  label: 'lectura',
  size: input.byteLength,
  usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
});

// 5. El pipeline (el shader ya validado) y el bind group (qué búfer va en @binding(0))
const pipeline = device.createComputePipeline({ label: 'duplicar', layout: 'auto', compute: { module } });
const bindGroup = device.createBindGroup({
  label: 'datos',
  layout: pipeline.getBindGroupLayout(0),
  entries: [{ binding: 0, resource: { buffer: workBuffer } }],
});

// 6. Grabar: una pasada de cómputo y una copia; enviar
const encoder = device.createCommandEncoder({ label: 'duplicar' });
const pass = encoder.beginComputePass({ label: 'duplicar' });
pass.setPipeline(pipeline);
pass.setBindGroup(0, bindGroup);
pass.dispatchWorkgroups(1); // 1 grupo de 64 hilos
pass.end();
encoder.copyBufferToBuffer(workBuffer, 0, readBuffer, 0, input.byteLength);
device.queue.submit([encoder.finish()]);

// 7. Leer: mapAsync espera a la GPU; slice() copia los bytes antes de unmap()
await readBuffer.mapAsync(GPUMapMode.READ);
const result = new Float32Array(readBuffer.getMappedRange().slice(0));
readBuffer.unmap();
console.log('entrada →', input.join(','));
console.log('búfer «datos» →', workBuffer.size, 'bytes en la GPU');
console.log('resultado →', result.join(','));
```

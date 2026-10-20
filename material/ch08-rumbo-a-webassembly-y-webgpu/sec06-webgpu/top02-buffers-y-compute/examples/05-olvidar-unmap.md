---
example_description: "Un búfer mapeado es de JavaScript, no de la GPU: si se olvida unmap() después de leer, el siguiente submit que lo usa falla entero («used in submit while mapped») y no ejecuta NADA, ni siquiera el cálculo. Con unmap() el mismo búfer de lectura se reutiliza, y los datos siguen en la GPU entre envíos: duplicar dos veces da ×4"
example_tags: "javascript|webgpu|unmap|mapasync|submit|staging-buffer|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/webgpu/utils.js (léelo con «Assets»).
import { getDevice, firstLine, createStorageBuffer, createComputeJob } from './webgpu/utils.js';

const { device } = await getDevice({ label: 'reutilizar' });
const input = new Float32Array([1, 2, 3, 4.5, -1]);
const work = createStorageBuffer(device, 'datos', input);
const readBuffer = device.createBuffer({
  label: 'lectura', size: input.byteLength, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
});
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

// Un encargo completo: duplicar en la GPU y copiar al búfer de lectura. Devuelve el error del submit.
async function doubleAndCopy() {
  const encoder = device.createCommandEncoder({ label: 'duplicar y copiar' });
  const pass = encoder.beginComputePass({ label: 'duplicar' });
  pass.setPipeline(job.pipeline);
  pass.setBindGroup(0, job.bindGroup);
  pass.dispatchWorkgroups(1);
  pass.end();
  encoder.copyBufferToBuffer(work, 0, readBuffer, 0, input.byteLength);
  device.pushErrorScope('validation');
  device.queue.submit([encoder.finish()]);
  const error = await device.popErrorScope();
  return error ? firstLine(error.message) : null;
}
async function readValues() {
  await readBuffer.mapAsync(GPUMapMode.READ);
  return new Float32Array(readBuffer.getMappedRange().slice(0)).join(',');
}

await doubleAndCopy();
console.log('1.ª vuelta →', await readValues()); // 🐛 y aquí falta readBuffer.unmap()

// 🐛 2.ª vuelta: el búfer de lectura sigue mapeado (es de JavaScript): el submit entero se rechaza
console.log('🐛 2.ª vuelta, sin unmap() →', await doubleAndCopy());
console.log('   estado del búfer de lectura →', readBuffer.mapState);

// ✅ unmap() devuelve el búfer a la GPU. El submit rechazado no ejecutó nada: los datos
// de la GPU siguen en ×2, y esta vuelta los deja en ×4.
readBuffer.unmap();
console.log('✅ con unmap(), error →', (await doubleAndCopy()) ?? 'ninguno');
console.log('✅ 2.ª vuelta →', await readValues());
readBuffer.unmap();
```

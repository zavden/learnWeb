// Ayudantes de WebGPU para los ejemplos de la lección «Búferes y compute».
// El ejemplo 01 hace todo esto a mano, paso a paso; los demás importan estas funciones
// para quedarse con su idea:  import { getDevice, readBuffer } from './webgpu/utils.js';

// La primera línea de un mensaje de error de la GPU (las siguientes dicen en qué llamada fue)
export function firstLine(message) {
  return String(message).trim().split('\n')[0];
}

// Adaptador y dispositivo, comprobando cada paso (lección «¿Qué es WebGPU?»).
// Los errores que no recoja ningún ámbito se escriben con console.warn: sin oyente, no se verían.
// El dispositivo se destruye al cerrar la página, y con él toda su memoria de la GPU.
export async function getDevice(descriptor = {}) {
  if (!navigator.gpu) throw new Error('Este navegador no tiene WebGPU (o la página no es un contexto seguro)');
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error('WebGPU existe, pero no hay ningún adaptador disponible');
  const device = await adapter.requestDevice(descriptor);
  device.addEventListener('uncapturederror', (event) => {
    console.warn('⚠️ error de la GPU sin recoger →', firstLine(event.error.message));
  });
  addEventListener('pagehide', () => device.destroy());
  return { adapter, device };
}

// Ejecuta fn() dentro de un ámbito de errores de validación. Devuelve la primera línea del
// error, o null si no lo hubo. Es asíncrono: la GPU valida en su propio proceso.
export async function validationError(device, fn) {
  device.pushErrorScope('validation');
  let thrown = null;
  try {
    fn();
  } catch (exception) {
    thrown = exception; // un error de JavaScript (RangeError, TypeError…): se relanza abajo
  }
  const error = await device.popErrorScope(); // el ámbito se cierra siempre
  if (thrown) throw thrown;
  return error ? firstLine(error.message) : null;
}

// Un búfer de almacenamiento con los bytes de un typed array.
// STORAGE: lo usa un shader; COPY_DST: writeBuffer puede escribirlo; COPY_SRC: se puede copiar para leerlo.
export function createStorageBuffer(device, label, data) {
  const buffer = device.createBuffer({
    label,
    size: data.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
  });
  device.queue.writeBuffer(buffer, 0, data);
  return buffer;
}

// Lee un búfer de la GPU: lo copia a un búfer de lectura (MAP_READ | COPY_DST), lo mapea,
// copia sus bytes con slice() y lo desmapea. Devuelve un typed array del tipo pedido.
export async function readBuffer(device, buffer, ArrayType = Float32Array) {
  const staging = device.createBuffer({
    label: `lectura de ${buffer.label}`,
    size: buffer.size,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });
  const encoder = device.createCommandEncoder({ label: `leer ${buffer.label}` });
  encoder.copyBufferToBuffer(buffer, 0, staging, 0, buffer.size);
  device.queue.submit([encoder.finish()]);
  await staging.mapAsync(GPUMapMode.READ);
  const bytes = staging.getMappedRange().slice(0); // una copia: el rango mapeado muere con unmap()
  staging.unmap();
  staging.destroy();
  return new ArrayType(bytes);
}

// Un compute shader listo para lanzar: módulo, pipeline con layout 'auto' y bind group.
// Los búferes se conectan en orden: el primero en @binding(0), el segundo en @binding(1)…
export function createComputeJob(device, { label, code, buffers }) {
  const module = device.createShaderModule({ label, code });
  const pipeline = device.createComputePipeline({ label, layout: 'auto', compute: { module } });
  const bindGroup = device.createBindGroup({
    label,
    layout: pipeline.getBindGroupLayout(0),
    entries: buffers.map((buffer, binding) => ({ binding, resource: { buffer } })),
  });
  return { label, pipeline, bindGroup };
}

// Graba una pasada de cómputo con dispatchWorkgroups(workgroups) y la envía a la cola
export function dispatch(device, job, workgroups) {
  const encoder = device.createCommandEncoder({ label: job.label });
  const pass = encoder.beginComputePass({ label: job.label });
  pass.setPipeline(job.pipeline);
  pass.setBindGroup(0, job.bindGroup);
  pass.dispatchWorkgroups(workgroups);
  pass.end();
  device.queue.submit([encoder.finish()]);
}

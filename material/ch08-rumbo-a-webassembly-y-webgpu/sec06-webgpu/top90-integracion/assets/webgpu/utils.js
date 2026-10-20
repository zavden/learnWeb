// Ayudantes de WebGPU para la integración del módulo: los de las lecciones «Búferes y compute»
// y «El pipeline de render», juntos. No esconden WebGPU: le quitan la ceremonia repetida.
//   import { getDevice, createStorageBuffer, readBuffer, setupCanvas, readPixels } from './webgpu/utils.js';

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

// Prepara un lienzo para WebGPU: mapa de bits = tamaño CSS × devicePixelRatio, contexto
// 'webgpu' con el formato que prefiere la pantalla. COPY_SRC permite leer sus píxeles.
export function setupCanvas(canvas, device) {
  const context = canvas.getContext('webgpu');
  if (!context) throw new Error("Este lienzo no da un contexto 'webgpu' (¿ya tiene otro, como '2d'?)");
  canvas.width = Math.max(1, Math.round(canvas.clientWidth * devicePixelRatio));
  canvas.height = Math.max(1, Math.round(canvas.clientHeight * devicePixelRatio));
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format,
    alphaMode: 'opaque',
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
  });
  return { context, format };
}

// Un color de 0-255 como el clearValue de una pasada (de 0 a 1): rgb(15, 23, 42) → [0.06, 0.09, 0.16, 1]
export function clearColor(red, green, blue) {
  return [red / 255, green / 255, blue / 255, 1];
}

// Lee píxeles de una textura (x desde la izquierda, y desde ARRIBA) como [r, g, b, a].
// Graba y envía las copias AL MOMENTO: llámala justo después de dibujar, sin un await entre
// medias, porque la textura del lienzo caduca en cuanto el navegador la muestra.
// Las texturas BGRA (la del lienzo en muchos equipos) se devuelven ya en orden RGBA.
export async function readPixels(device, texture, points) {
  const buffer = device.createBuffer({
    label: 'píxeles leídos',
    size: 256 * points.length, // una fila de 256 bytes por píxel: bytesPerRow es múltiplo de 256
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });
  const encoder = device.createCommandEncoder({ label: 'leer píxeles' });
  points.forEach(([x, y], i) => {
    encoder.copyTextureToBuffer(
      { texture, origin: { x, y } },
      { buffer, offset: i * 256, bytesPerRow: 256 },
      { width: 1, height: 1 },
    );
  });
  device.queue.submit([encoder.finish()]);
  await buffer.mapAsync(GPUMapMode.READ);
  const bytes = new Uint8Array(buffer.getMappedRange().slice(0));
  buffer.unmap();
  buffer.destroy();
  return points.map((_, i) => {
    const [b0, b1, b2, b3] = bytes.subarray(i * 256, i * 256 + 4);
    return texture.format.startsWith('bgra') ? [b2, b1, b0, b3] : [b0, b1, b2, b3];
  });
}

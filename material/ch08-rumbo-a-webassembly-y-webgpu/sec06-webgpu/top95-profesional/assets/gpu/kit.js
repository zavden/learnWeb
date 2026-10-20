// GPUKit: una biblioteca mínima de WebGPU para los ejemplos profesionales del módulo «WebGPU».
// No esconde WebGPU: le quita la ceremonia repetida, convierte sus errores silenciosos en
// excepciones con nombre y se recupera cuando se pierde el dispositivo. Cada pieza sale de una lección:
//
//   requestDevice   soporte, adaptador (uno por dispositivo), características pedidas y un
//                   oyente de errores sin recoger                     → «¿Qué es WebGPU?»
//   checked         ámbitos de errores: un fallo de validación o de memoria es un GPUKitError
//                   con el nombre del paso                            → «¿Qué es WebGPU?»
//   createBuffer    tamaño redondeado a 4 bytes y COPY_DST si lleva datos
//   readBuffer      copiar a un búfer de lectura, mapAsync, slice, unmap → «Búferes y compute»
//   structLayout    offsets y tamaño de un struct de WGSL; writeStruct lo llena
//   createView      lienzo nítido (devicePixelRatio + ResizeObserver), textura de profundidad,
//                   dibujar bajo demanda, leer píxeles en el mismo encargo y recuperar el
//                   dispositivo perdido                               → «El pipeline de render»
//   createAnimation un bucle con botón: finito, que se para al ocultar la página y respeta
//                   «reducir movimiento»                              → «El bucle de animación»
//   loadPixels      una imagen (con crossOrigin) como Uint32Array, un u32 RGBA por píxel

export class GPUKitError extends Error {
  constructor(message, { kind = 'other' } = {}) {
    super(message);
    this.name = 'GPUKitError';
    this.kind = kind; // 'support', 'feature', 'validation', 'out-of-memory'
  }
}

// La primera línea de un mensaje de la GPU (las siguientes dicen en qué llamada fue)
export function firstLine(message) {
  return String(message).trim().split('\n')[0];
}

// Adaptador y dispositivo. Cada llamada pide un adaptador NUEVO: un adaptador da un solo dispositivo.
export async function requestDevice({ label = 'GPUKit', requiredFeatures = [], requiredLimits = {}, onError } = {}) {
  if (!navigator.gpu) {
    throw new GPUKitError('Este navegador no tiene WebGPU (o la página no es un contexto seguro).', { kind: 'support' });
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new GPUKitError('WebGPU existe, pero no hay ningún adaptador disponible.', { kind: 'support' });
  const missing = requiredFeatures.filter((feature) => !adapter.features.has(feature));
  if (missing.length > 0) {
    throw new GPUKitError(`Esta GPU no tiene: ${missing.join(', ')}.`, { kind: 'feature' });
  }
  const device = await adapter.requestDevice({ label, requiredFeatures, requiredLimits });
  device.addEventListener('uncapturederror', (event) => {
    const text = firstLine(event.error.message);
    console.warn(`GPUKit · ${label} → ${text}`); // nunca en silencio
    onError?.(text);
  });
  return { adapter, device };
}

// Ejecuta fn() con dos ámbitos abiertos (validación y memoria). Si la GPU rechaza algo, lanza un
// GPUKitError que empieza por «what»: el nombre del paso, para saber DÓNDE falló.
export async function checked(device, what, fn) {
  device.pushErrorScope('out-of-memory');
  device.pushErrorScope('validation');
  let result;
  let thrown = null;
  try {
    result = fn();
  } catch (exception) {
    thrown = exception;
  }
  const validation = await device.popErrorScope();
  const memory = await device.popErrorScope();
  if (thrown) throw thrown;
  const error = validation ?? memory;
  if (error) throw new GPUKitError(`${what}: ${firstLine(error.message)}`, { kind: validation ? 'validation' : 'out-of-memory' });
  return result;
}

// Un búfer con su etiqueta. El tamaño se redondea a múltiplo de 4 (las copias van de 4 en 4) y,
// si se pasan datos, se añade COPY_DST y se escriben con writeBuffer.
export function createBuffer(device, { label, size, data, usage }) {
  const bytes = Math.ceil((size ?? data.byteLength) / 4) * 4;
  const buffer = device.createBuffer({ label, size: bytes, usage: data ? usage | GPUBufferUsage.COPY_DST : usage });
  if (data) device.queue.writeBuffer(buffer, 0, data);
  return buffer;
}

// Lee un búfer (que tenga COPY_SRC) como un typed array del tipo pedido
export async function readBuffer(device, buffer, ArrayType = Float32Array) {
  const staging = device.createBuffer({
    label: `lectura de ${buffer.label}`, size: buffer.size, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
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

// ── Estructuras de WGSL en un búfer (lección «Búferes y compute») ─────────────────────────
const TYPES = {
  f32: { size: 4, align: 4 }, i32: { size: 4, align: 4 }, u32: { size: 4, align: 4 },
  vec2f: { size: 8, align: 8 }, vec3f: { size: 12, align: 16 }, vec4f: { size: 16, align: 16 },
  mat4x4f: { size: 64, align: 16 },
};
const roundUp = (value, multiple) => Math.ceil(value / multiple) * multiple;

// structLayout({ scale: 'f32', color: 'vec3f' }) → { fields: { scale: { offset: 0, type }, … }, size: 32 }
export function structLayout(fields) {
  let end = 0;
  let structAlign = 4;
  const placed = {};
  for (const [name, type] of Object.entries(fields)) {
    const { size, align } = TYPES[type];
    placed[name] = { offset: roundUp(end, align), type };
    end = placed[name].offset + size;
    structAlign = Math.max(structAlign, align);
  }
  return { fields: placed, size: roundUp(end, structAlign) };
}

// Llena un ArrayBuffer con los valores de una estructura, cada uno en su offset y con su tipo
export function writeStruct(layout, values, target = new ArrayBuffer(layout.size)) {
  const view = new DataView(target);
  for (const [name, value] of Object.entries(values)) {
    const field = layout.fields[name];
    if (!field) throw new GPUKitError(`La estructura no tiene el campo «${name}».`);
    const list = typeof value === 'number' ? [value] : [...value];
    list.forEach((component, i) => {
      const at = field.offset + i * 4;
      if (field.type === 'u32') view.setUint32(at, component, true); // little-endian, como la GPU
      else if (field.type === 'i32') view.setInt32(at, component, true);
      else view.setFloat32(at, component, true);
    });
  }
  return target;
}

// ── La vista: un lienzo con su dispositivo, que dibuja bajo demanda y se recupera ──────────
// setup({ device, format, view }) crea TODOS los recursos de la GPU y los devuelve; se vuelve a
// llamar si se pierde el dispositivo, porque entonces ninguno sirve.
// render({ encoder, device, resources, view, pass }) graba el dibujo; pass(options) abre una
// pasada de render sobre la textura actual del lienzo (con la de profundidad, si se pidió).
export function createView(canvas, { label = 'vista', depth = false, setup, render, onStatus = () => {}, onError }) {
  const context = canvas.getContext('webgpu');
  if (!context) throw new GPUKitError("Este lienzo no da un contexto 'webgpu' (¿ya tiene otro, como '2d'?).", { kind: 'support' });
  const format = navigator.gpu.getPreferredCanvasFormat();
  let device = null;
  let resources = null;
  let depthTexture = null;
  let pendingFrame = 0;
  let destroyed = false;
  let generation = 0;

  const view = {
    canvas,
    format,
    get device() {
      return device;
    },
    get resources() {
      return resources;
    },
    get generation() {
      return generation;
    },
    // Dibuja YA. Si se piden puntos, copia esos píxeles en el MISMO encargo y devuelve sus colores
    // [r, g, b, a] (x desde la izquierda, y desde ARRIBA), ya en orden RGBA aunque el lienzo sea BGRA.
    renderNow({ readPixels: points = [] } = {}) {
      if (!device || !resources) return Promise.resolve([]);
      const texture = context.getCurrentTexture(); // la de ESTE fotograma
      const encoder = device.createCommandEncoder({ label: `${label}: fotograma` });
      const pass = (options = {}) => encoder.beginRenderPass({
        label: options.label ?? label,
        colorAttachments: [{
          view: texture.createView(),
          clearValue: options.clearValue ?? [0, 0, 0, 1],
          loadOp: 'clear',
          storeOp: 'store',
        }],
        ...(depthTexture && {
          depthStencilAttachment: { view: depthTexture.createView(), depthClearValue: 1, depthLoadOp: 'clear', depthStoreOp: 'discard' },
        }),
      });
      render({ encoder, device, resources, view, pass });
      let readback = null;
      if (points.length > 0) {
        readback = device.createBuffer({ label: 'píxeles leídos', size: 256 * points.length, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
        points.forEach(([x, y], i) => {
          encoder.copyTextureToBuffer({ texture, origin: { x, y } }, { buffer: readback, offset: i * 256, bytesPerRow: 256 }, { width: 1, height: 1 });
        });
      }
      device.queue.submit([encoder.finish()]);
      if (!readback) return Promise.resolve([]);
      return readback.mapAsync(GPUMapMode.READ).then(() => {
        const bytes = new Uint8Array(readback.getMappedRange().slice(0));
        readback.destroy();
        return points.map((_, i) => {
          const [b0, b1, b2, b3] = bytes.subarray(i * 256, i * 256 + 4);
          return format.startsWith('bgra') ? [b2, b1, b0, b3] : [b0, b1, b2, b3];
        });
      });
    },
    // Pide un dibujo para el próximo fotograma; varios pedidos seguidos, un solo dibujo
    invalidate() {
      if (pendingFrame || !device) return;
      pendingFrame = requestAnimationFrame(() => {
        pendingFrame = 0;
        view.renderNow();
      });
    },
    // Para probar la recuperación: destroy() es la única forma de perder el dispositivo a propósito
    simulateLoss() {
      device?.destroy();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(pendingFrame);
      observer.disconnect();
      removeEventListener('pagehide', view.destroy);
      device?.destroy();
    },
  };

  function makeDepthTexture() {
    depthTexture?.destroy();
    depthTexture = depth && device
      ? device.createTexture({ label: `${label}: profundidad`, size: [canvas.width, canvas.height], format: 'depth24plus', usage: GPUTextureUsage.RENDER_ATTACHMENT })
      : null;
  }

  async function start() {
    generation += 1;
    const result = await requestDevice({ label: `${label} ${generation}`, onError });
    device = result.device;
    device.lost.then((info) => {
      if (destroyed) return;
      device = null;
      resources = null;
      onStatus('lost', info.reason); // 'destroyed' (simulado) o 'unknown' (la GPU se reinició…)
      start().then(() => onStatus('restored', generation));
    });
    context.configure({ device, format, alphaMode: 'opaque', usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });
    makeDepthTexture();
    resources = await setup({ device, format, view });
    view.renderNow();
  }

  // Lienzo nítido: el mapa de bits sigue al tamaño CSS × devicePixelRatio
  canvas.width = Math.max(1, Math.round(canvas.clientWidth * devicePixelRatio));
  canvas.height = Math.max(1, Math.round(canvas.clientHeight * devicePixelRatio));
  const observer = new ResizeObserver(([entry]) => {
    const exact = entry.devicePixelContentBoxSize?.[0]; // píxeles físicos exactos (Chrome)
    const width = Math.max(1, exact ? exact.inlineSize : Math.round(entry.contentBoxSize[0].inlineSize * devicePixelRatio));
    const height = Math.max(1, exact ? exact.blockSize : Math.round(entry.contentBoxSize[0].blockSize * devicePixelRatio));
    if (width === canvas.width && height === canvas.height) return;
    Object.assign(canvas, { width, height });
    makeDepthTexture();
    view.invalidate();
  });
  try {
    observer.observe(canvas, { box: 'device-pixel-content-box' });
  } catch {
    observer.observe(canvas);
  }
  addEventListener('pagehide', view.destroy);

  // Si no hay WebGPU (o falta una característica), dilo en la página, junto al lienzo
  view.ready = start().then(() => view, (error) => {
    canvas.after(Object.assign(document.createElement('p'), { role: 'alert', textContent: `${error.message} Este ejemplo necesita WebGPU.` }));
    throw error;
  });
  return view;
}

// ── Un bucle de animación con botón (lección «El bucle de animación») ──────────────────────
// frame(seconds) dibuja; el bucle dura como mucho maxSeconds, se para al ocultar la página y no
// arranca con «reducir movimiento» (start() devuelve false).
export function createAnimation({ frame, onStop = () => {}, maxSeconds = 10 }) {
  let frameId = null;
  let startTime = 0;
  const animation = {
    get running() {
      return frameId !== null;
    },
    start() {
      if (frameId !== null) return true;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
      startTime = performance.now();
      const tick = (now) => {
        const seconds = (now - startTime) / 1000;
        if (seconds > maxSeconds) return animation.stop(`terminado: ${maxSeconds} s`);
        frame(seconds);
        frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
      return true;
    },
    stop(reason = 'parado') {
      if (frameId === null) return;
      cancelAnimationFrame(frameId);
      frameId = null;
      onStop(reason);
    },
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) animation.stop('página oculta');
  });
  return animation;
}

// Una imagen de assets/ como píxeles: { width, height, pixels } con un u32 RGBA por píxel (el rojo,
// el byte bajo). crossOrigin SIEMPRE: en las tarjetas, toda imagen es de otro origen.
export async function loadPixels(url) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  await img.decode();
  const { naturalWidth: width, naturalHeight: height } = img;
  const context = Object.assign(document.createElement('canvas'), { width, height }).getContext('2d');
  context.drawImage(img, 0, 0);
  return { width, height, pixels: new Uint32Array(context.getImageData(0, 0, width, height).data.buffer) };
}

// Números pseudoaleatorios con semilla (mulberry32): los mismos datos en cada ejecución
export function seededRandom(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

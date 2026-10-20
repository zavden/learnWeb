---
example_description: "WebGPU fuera del hilo principal: la página transfiere su lienzo a un worker con transferControlToOffscreen(), y el worker pide su propio adaptador y dispositivo (navigator.gpu también existe en los workers), configura el contexto «webgpu» del OffscreenCanvas, dibuja y lee el píxel central. La página solo envía mensajes con el color y escribe lo que el worker le responde"
example_tags: "javascript|webgpu|workers|offscreencanvas|transfercontroltooffscreen|postmessage|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Un worker que dibuja con WebGPU</h1>
  <canvas id="stage" role="img" aria-label="Un triángulo dibujado por un worker; su color cambia con los botones"></canvas>
  <div class="actions" role="group" aria-label="Color del triángulo">
    <button type="button" data-color="225,29,72">Frambuesa</button>
    <button type="button" data-color="245,158,11">Ámbar</button>
    <button type="button" data-color="13,148,136">Verde azulado</button>
  </div>
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
canvas {
  display: block;
  width: 240px;
  height: 160px;
  outline: 1px solid #334155;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
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
// Lecciones: «Transferibles» (OffscreenCanvas y transferir), «Web workers» (mensajes) y
// «El pipeline de render». El worker es un Blob con su propio código: no comparte nada con
// la página, y su consola no llega a la de LearnWeb (por eso responde con mensajes).
const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// El WGSL viaja en el primer mensaje: el worker no tiene acceso a nada de la página
const SHADER = /* wgsl */ `
  @group(0) @binding(0) var<uniform> color: vec4f;
  @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
    var positions = array<vec2f, 3>(vec2f(0.0, 0.75), vec2f(-0.75, -0.5), vec2f(0.75, -0.5));
    return vec4f(positions[index], 0.0, 1.0);
  }
  @fragment fn fragmentMain() -> @location(0) vec4f { return color; }`;

const workerCode = `
  let device = null;
  let gpuContext = null;
  let pipeline = null;
  let colorBuffer = null;
  let bindGroup = null;
  let format = '';
  const firstLine = (message) => String(message).trim().split('\\n')[0];

  async function start(canvas, code, rgb) {
    if (!self.navigator.gpu) return postMessage({ kind: 'error', text: 'este worker no tiene navigator.gpu' });
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return postMessage({ kind: 'error', text: 'no hay adaptador en el worker' });
    device = await adapter.requestDevice({ label: 'worker' });
    device.addEventListener('uncapturederror', (event) => postMessage({ kind: 'warn', text: firstLine(event.error.message) }));
    gpuContext = canvas.getContext('webgpu'); // el contexto de un OffscreenCanvas, igual que el de un <canvas>
    format = navigator.gpu.getPreferredCanvasFormat();
    gpuContext.configure({ device, format, alphaMode: 'opaque', usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });
    const module = device.createShaderModule({ label: 'triángulo', code });
    pipeline = device.createRenderPipeline({ label: 'triángulo', layout: 'auto', vertex: { module }, fragment: { module, targets: [{ format }] } });
    colorBuffer = device.createBuffer({ label: 'color', size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    bindGroup = device.createBindGroup({ label: 'color', layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: colorBuffer } }] });
    draw(rgb);
  }

  async function draw(rgb) {
    device.queue.writeBuffer(colorBuffer, 0, new Float32Array([rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 1]));
    const texture = gpuContext.getCurrentTexture();
    const pixel = device.createBuffer({ label: 'un píxel', size: 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    const encoder = device.createCommandEncoder({ label: 'dibujar en el worker' });
    const pass = encoder.beginRenderPass({
      colorAttachments: [{ view: texture.createView(), clearValue: [15 / 255, 23 / 255, 42 / 255, 1], loadOp: 'clear', storeOp: 'store' }],
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();
    const origin = { x: Math.floor(texture.width / 2), y: Math.floor(texture.height / 2) };
    encoder.copyTextureToBuffer({ texture, origin }, { buffer: pixel, bytesPerRow: 256 }, { width: 1, height: 1 });
    device.queue.submit([encoder.finish()]);
    await pixel.mapAsync(GPUMapMode.READ);
    const [b0, b1, b2, b3] = new Uint8Array(pixel.getMappedRange());
    pixel.unmap();
    pixel.destroy();
    const rgba = format.startsWith('bgra') ? [b2, b1, b0, b3] : [b0, b1, b2, b3];
    postMessage({ kind: 'drawn', rgba, hasDocument: typeof document !== 'undefined' });
  }

  self.onmessage = (event) => {
    const message = event.data;
    if (message.kind === 'start') start(message.canvas, message.code, message.rgb);
    if (message.kind === 'color' && device) draw(message.rgb);
  };
`;

const canvas = document.querySelector('#stage');
canvas.width = Math.round(canvas.clientWidth * devicePixelRatio); // el tamaño, ANTES de transferirlo
canvas.height = Math.round(canvas.clientHeight * devicePixelRatio);
const offscreen = canvas.transferControlToOffscreen();
const url = URL.createObjectURL(new Blob([workerCode], { type: 'text/javascript' }));
const worker = new Worker(url);
URL.revokeObjectURL(url);
addEventListener('pagehide', () => worker.terminate()); // terminar el worker libera también su dispositivo

let ready = false;
worker.onmessage = ({ data }) => {
  if (data.kind === 'drawn') {
    log(`worker → triángulo dibujado · centro: ${data.rgba.join(', ')} · ¿hay document en el worker? ${data.hasDocument}`);
    if (!ready) {
      ready = true;
      log('Listo: elige otro color; lo dibuja el worker');
    }
  } else {
    console.warn(`worker → ${data.text}`);
  }
};
log('el lienzo → transferido al worker con transferControlToOffscreen()');
worker.postMessage({ kind: 'start', canvas: offscreen, code: SHADER, rgb: [225, 29, 72] }, [offscreen]);

document.querySelectorAll('[data-color]').forEach((button) => {
  button.addEventListener('click', () => worker.postMessage({ kind: 'color', rgb: button.dataset.color.split(',').map(Number) }));
});
```

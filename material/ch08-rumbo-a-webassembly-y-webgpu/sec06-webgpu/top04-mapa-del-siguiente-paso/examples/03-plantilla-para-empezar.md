---
example_description: "Una plantilla para tu próximo proyecto con WebGPU, con las reglas del módulo juntas: comprobar el soporte con un plan B, etiquetas y un oyente de errores, lienzo nítido con ResizeObserver, dibujar solo cuando cambia algo, liberar al salir y recuperarse si se pierde el dispositivo (device.lost): todo se vuelve a crear y se redibuja. La pérdida se simula con un botón"
example_tags: "javascript|webgpu|device-lost|plantilla|resizeobserver|render-pipeline|buenas-practicas"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Plantilla: WebGPU que se recupera</h1>
  <canvas id="stage" role="img" aria-label="Un triángulo cuyo color cambia cada vez que se vuelve a crear el dispositivo"></canvas>
  <button id="lose" type="button">Simular la pérdida del dispositivo</button>
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
  width: 100%;
  height: 160px;
  outline: 1px solid #334155;
}
button {
  font: inherit;
  margin-top: 0.75rem;
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
const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const firstLine = (message) => String(message).trim().split('\n')[0];

const canvas = document.querySelector('#stage');
const COLORS = [[0.882, 0.114, 0.282, 1], [0.051, 0.580, 0.533, 1], [0.961, 0.620, 0.043, 1]];
let gpu = null; // los objetos del dispositivo ACTUAL: si se pierde, ninguno sirve
let generation = 0;
let leaving = false; // al cerrar la página, una pérdida no se recupera

// Todo lo que depende del dispositivo se crea aquí, para poder repetirlo
function createResources(device, context, format) {
  const module = device.createShaderModule({
    label: 'escena',
    code: /* wgsl */ `
      @group(0) @binding(0) var<uniform> color: vec4f;
      @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
        var positions = array<vec2f, 3>(vec2f(0.0, 0.75), vec2f(-0.75, -0.5), vec2f(0.75, -0.5));
        return vec4f(positions[index], 0.0, 1.0);
      }
      @fragment fn fragmentMain() -> @location(0) vec4f {
        return color;
      }`,
  });
  const pipeline = device.createRenderPipeline({
    label: 'escena', layout: 'auto', vertex: { module }, fragment: { module, targets: [{ format }] },
  });
  const colorBuffer = device.createBuffer({ label: 'color', size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const bindGroup = device.createBindGroup({
    label: 'color', layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: colorBuffer } }],
  });
  return { device, context, pipeline, colorBuffer, bindGroup };
}

async function start() {
  if (!navigator.gpu) return log('Sin WebGPU: aquí iría el plan B (canvas 2D o WebGL 2)');
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) return log('Sin adaptador: aquí iría el plan B (canvas 2D o WebGL 2)');
  generation += 1;
  const device = await adapter.requestDevice({ label: `escena ${generation}` });
  device.addEventListener('uncapturederror', (event) => console.warn('GPU →', firstLine(event.error.message)));
  device.lost.then((info) => onLost(device, info));
  const context = canvas.getContext('webgpu'); // el mismo contexto: se configura con el dispositivo nuevo
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'opaque' });
  gpu = createResources(device, context, format);
  draw();
  log(`dispositivo ${generation} listo · dibujado`);
}

function onLost(device, info) {
  if (gpu?.device === device) gpu = null;
  if (leaving) return;
  // reason: 'destroyed' si lo destruyó el código; 'unknown' si la GPU se reinició, el driver falló…
  log(`dispositivo ${generation} perdido (${info.reason}) → recreando…`);
  start();
}

// Dibujar SOLO cuando algo cambia: al empezar, al cambiar de tamaño, al recuperar el dispositivo
function draw() {
  if (!gpu) return;
  const { device, context, pipeline, colorBuffer, bindGroup } = gpu;
  device.queue.writeBuffer(colorBuffer, 0, new Float32Array(COLORS[(generation - 1) % COLORS.length]));
  const encoder = device.createCommandEncoder({ label: 'fotograma' });
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      clearValue: [15 / 255, 23 / 255, 42 / 255, 1], loadOp: 'clear', storeOp: 'store',
    }],
  });
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.draw(3);
  pass.end();
  device.queue.submit([encoder.finish()]);
}

// Lienzo nítido: tamaño CSS × devicePixelRatio, siempre al día
canvas.width = Math.round(canvas.clientWidth * devicePixelRatio);
canvas.height = Math.round(canvas.clientHeight * devicePixelRatio);
new ResizeObserver(([entry]) => {
  const width = Math.max(1, Math.round(entry.contentBoxSize[0].inlineSize * devicePixelRatio));
  const height = Math.max(1, Math.round(entry.contentBoxSize[0].blockSize * devicePixelRatio));
  if (width === canvas.width && height === canvas.height) return;
  Object.assign(canvas, { width, height });
  draw();
}).observe(canvas);

// Liberar al salir. Y la pérdida, simulada: destroy() es la única forma de provocarla a propósito.
addEventListener('pagehide', () => {
  leaving = true;
  gpu?.device.destroy();
});
document.querySelector('#lose').addEventListener('click', () => gpu?.device.destroy());

await start();
log('Listo: pulsa «Simular la pérdida del dispositivo»');
```

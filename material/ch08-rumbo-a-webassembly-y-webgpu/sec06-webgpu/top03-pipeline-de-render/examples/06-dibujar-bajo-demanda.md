---
example_description: "Animar con WebGPU sin calentar la máquina: un fotograma quieto al cargar y, al pulsar un botón, un triángulo que gira durante 10 s como mucho. En cada fotograma, writeBuffer del tiempo (4 bytes, reutilizando el mismo Float32Array), getCurrentTexture() y un submit. Se para con «Parar», al ocultar la página, y con «reducir movimiento» no arranca"
example_tags: "javascript|webgpu|animacion|requestanimationframe|uniform|writebuffer|reduced-motion|visibilitychange"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Un triángulo que gira (cuando se lo pides)</h1>
  <canvas id="stage" role="img" aria-label="Un triángulo con los vértices rojo, ámbar y verde azulado"></canvas>
  <button id="toggle" type="button">▶ Animar</button>
  <p id="status" class="status" aria-live="polite"></p>
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
  width: 200px;
  height: 200px;
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
.status {
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Usa assets/webgpu/utils.js (léelo con «Assets»).
import { getDevice, setupCanvas, clearColor } from './webgpu/utils.js';

const statusLine = document.querySelector('#status');
function say(text) {
  statusLine.textContent = text;
  console.log(text);
}

const { device } = await getDevice({ label: 'girar' });
const { context, format } = setupCanvas(document.querySelector('#stage'), device);
const module = device.createShaderModule({
  label: 'triángulo que gira',
  code: /* wgsl */ `
    struct VertexOutput {
      @builtin(position) position: vec4f,
      @location(0) color: vec3f,
    }
    @group(0) @binding(0) var<uniform> seconds: f32; // lo ÚNICO que cambia en cada fotograma

    @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> VertexOutput {
      var positions = array<vec2f, 3>(vec2f(0.0, 0.8), vec2f(-0.7, -0.4), vec2f(0.7, -0.4));
      var colors = array<vec3f, 3>(vec3f(0.882, 0.114, 0.282), vec3f(0.961, 0.620, 0.043), vec3f(0.051, 0.580, 0.533));
      let angle = seconds * 1.2;            // radianes: una vuelta cada 5,2 s
      let p = positions[index];
      var output: VertexOutput;
      output.position = vec4f(p.x * cos(angle) - p.y * sin(angle), p.x * sin(angle) + p.y * cos(angle), 0.0, 1.0);
      output.color = colors[index];
      return output;
    }
    @fragment fn fragmentMain(vertexOut: VertexOutput) -> @location(0) vec4f {
      return vec4f(vertexOut.color, 1.0);
    }`,
});
const pipeline = device.createRenderPipeline({
  label: 'triángulo que gira', layout: 'auto', vertex: { module }, fragment: { module, targets: [{ format }] },
});
const timeBuffer = device.createBuffer({ label: 'tiempo', size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
const bindGroup = device.createBindGroup({
  label: 'tiempo', layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: timeBuffer } }],
});
const timeData = new Float32Array(1); // el mismo array en todos los fotogramas (módulo «Rendimiento»)

function render(secondsElapsed) {
  timeData[0] = secondsElapsed;
  device.queue.writeBuffer(timeBuffer, 0, timeData);
  const encoder = device.createCommandEncoder({ label: 'fotograma' });
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(), // la textura de ESTE fotograma, siempre nueva
      clearValue: clearColor(15, 23, 42), loadOp: 'clear', storeOp: 'store',
    }],
  });
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.draw(3);
  pass.end();
  device.queue.submit([encoder.finish()]);
}

// El bucle: arranca con el botón, termina solo a los 10 s, con «Parar» o al ocultar la página
const DURATION = 10;
const toggle = document.querySelector('#toggle');
let frameId = null;
let startTime = 0;
function frame(now) {
  const secondsElapsed = (now - startTime) / 1000;
  if (secondsElapsed > DURATION) return stop('terminado: 10 s');
  render(secondsElapsed);
  frameId = requestAnimationFrame(frame);
}
function start() {
  if (frameId !== null) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return say('movimiento reducido: el triángulo se queda quieto');
  }
  startTime = performance.now();
  frameId = requestAnimationFrame(frame);
  toggle.textContent = '⏹ Parar';
  say('▶ en marcha: writeBuffer + 1 submit por fotograma');
}
function stop(reason) {
  if (frameId === null) return;
  cancelAnimationFrame(frameId);
  frameId = null;
  toggle.textContent = '▶ Animar';
  say(`⏹ ${reason}`);
}
toggle.addEventListener('click', () => (frameId === null ? start() : stop('parado')));
document.addEventListener('visibilitychange', () => { if (document.hidden) stop('página oculta'); });

render(0); // un fotograma quieto al cargar
say('Listo: un fotograma dibujado; pulsa «Animar»');
```

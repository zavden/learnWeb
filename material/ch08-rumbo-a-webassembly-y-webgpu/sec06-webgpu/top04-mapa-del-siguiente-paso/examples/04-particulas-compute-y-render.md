---
example_description: "Compute y render en el mismo fotograma: 4096 pelotas que caen, rebotan en el suelo y en las paredes y pierden energía. Un compute shader mueve todas las partículas de un búfer de almacenamiento y el render pipeline las dibuja leyendo ESE búfer, con draw(6, 4096): un solo submit por fotograma y nada que copiar a JavaScript. Arranca con un botón, se para sola a los 10 s, con «Parar» o al ocultar la página, y respeta «reducir movimiento»"
example_tags: "javascript|webgpu|compute-shader|render-pipeline|particulas|instancias|storage-buffer|animacion"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>4096 pelotas en la GPU</h1>
  <canvas id="stage" role="img" aria-label="Miles de pelotas pequeñas que caen y rebotan; su color va del verde azulado (lentas) al ámbar (rápidas)"></canvas>
  <button id="toggle" type="button">▶ Lanzar</button>
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
  width: 240px;
  height: 240px;
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
const COUNT = 4096;
const statusLine = document.querySelector('#status');
function say(text) {
  statusLine.textContent = text;
  console.log(text);
}

// Posición y velocidad de cada pelota, con una semilla (mulberry32): siempre la misma lluvia
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(2026);
// struct Particle { pos: vec2f, vel: vec2f }: 16 bytes, sin huecos (todo se alinea a 8)
const particles = new Float32Array(COUNT * 4);
for (let i = 0; i < COUNT; i++) {
  particles.set([random() * 1.8 - 0.9, random() * 0.9, (random() - 0.5) * 0.8, random() * 0.5], i * 4);
}

const adapter = await navigator.gpu?.requestAdapter();
if (!adapter) throw new Error('WebGPU no está disponible en este equipo');
const device = await adapter.requestDevice({ label: 'pelotas' });
addEventListener('pagehide', () => device.destroy());
device.addEventListener('uncapturederror', (event) => console.warn('GPU →', event.error.message));
const canvas = document.querySelector('#stage');
canvas.width = Math.round(canvas.clientWidth * devicePixelRatio);
canvas.height = Math.round(canvas.clientHeight * devicePixelRatio);
const context = canvas.getContext('webgpu');
const format = navigator.gpu.getPreferredCanvasFormat();
context.configure({ device, format, alphaMode: 'opaque' });

const particleBuffer = device.createBuffer({ label: 'pelotas', size: particles.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
device.queue.writeBuffer(particleBuffer, 0, particles);
const stepBuffer = device.createBuffer({ label: 'paso de tiempo', size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });

const PARTICLE = /* wgsl */ `struct Particle { pos: vec2f, vel: vec2f }`;
const physics = device.createShaderModule({
  label: 'física',
  code: /* wgsl */ `${PARTICLE}
    @group(0) @binding(0) var<storage, read_write> balls: array<Particle>;
    @group(0) @binding(1) var<uniform> dt: f32;
    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) id: vec3u) {
      let i = id.x;
      if (i >= arrayLength(&balls)) { return; }
      var ball = balls[i];
      ball.vel.y -= 1.5 * dt;                  // gravedad
      ball.pos += ball.vel * dt;
      if (ball.pos.y < -1.0) {                 // el suelo: rebota y pierde energía
        ball.pos.y = -1.0;
        ball.vel.y = abs(ball.vel.y) * 0.8;
      }
      if (abs(ball.pos.x) > 1.0) {             // las paredes
        ball.pos.x = clamp(ball.pos.x, -1.0, 1.0);
        ball.vel.x = -ball.vel.x;
      }
      balls[i] = ball;
    }`,
});
const drawing = device.createShaderModule({
  label: 'pelotas',
  code: /* wgsl */ `${PARTICLE}
    @group(0) @binding(0) var<storage, read> balls: array<Particle>; // el MISMO búfer, de solo lectura
    struct VertexOutput { @builtin(position) position: vec4f, @location(0) color: vec3f }
    @vertex
    fn vertexMain(@builtin(vertex_index) corner: u32, @builtin(instance_index) index: u32) -> VertexOutput {
      var quad = array<vec2f, 6>(vec2f(-1, -1), vec2f(1, -1), vec2f(-1, 1), vec2f(-1, 1), vec2f(1, -1), vec2f(1, 1));
      let ball = balls[index];
      var output: VertexOutput;
      output.position = vec4f(ball.pos + quad[corner] * 0.012, 0.0, 1.0);
      let speed = clamp(length(ball.vel) / 2.0, 0.0, 1.0);
      output.color = mix(vec3f(0.176, 0.831, 0.749), vec3f(0.984, 0.749, 0.141), speed); // #2dd4bf → #fbbf24
      return output;
    }
    @fragment fn fragmentMain(vertexOut: VertexOutput) -> @location(0) vec4f {
      return vec4f(vertexOut.color, 1.0);
    }`,
});
const computePipeline = device.createComputePipeline({ label: 'física', layout: 'auto', compute: { module: physics } });
const renderPipeline = device.createRenderPipeline({
  label: 'pelotas', layout: 'auto', vertex: { module: drawing }, fragment: { module: drawing, targets: [{ format }] },
});
const computeGroup = device.createBindGroup({
  label: 'física', layout: computePipeline.getBindGroupLayout(0),
  entries: [{ binding: 0, resource: { buffer: particleBuffer } }, { binding: 1, resource: { buffer: stepBuffer } }],
});
const renderGroup = device.createBindGroup({
  label: 'pelotas', layout: renderPipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: particleBuffer } }],
});
const stepData = new Float32Array(1);

// Un fotograma: si dt > 0, primero la física (cómputo) y después el dibujo, en UN encargo
function frameWork(dt) {
  const encoder = device.createCommandEncoder({ label: 'fotograma' });
  if (dt > 0) {
    stepData[0] = dt;
    device.queue.writeBuffer(stepBuffer, 0, stepData);
    const compute = encoder.beginComputePass({ label: 'física' });
    compute.setPipeline(computePipeline);
    compute.setBindGroup(0, computeGroup);
    compute.dispatchWorkgroups(Math.ceil(COUNT / 64));
    compute.end();
  }
  const render = encoder.beginRenderPass({
    label: 'pelotas',
    colorAttachments: [{ view: context.getCurrentTexture().createView(), clearValue: [2 / 255, 6 / 255, 23 / 255, 1], loadOp: 'clear', storeOp: 'store' }],
  });
  render.setPipeline(renderPipeline);
  render.setBindGroup(0, renderGroup);
  render.draw(6, COUNT); // 6 vértices por pelota, 4096 pelotas
  render.end();
  device.queue.submit([encoder.finish()]);
}

// El bucle de siempre: con un botón, finito, y quieto con «reducir movimiento»
const DURATION = 10;
const toggle = document.querySelector('#toggle');
let frameId = null;
let startTime = 0;
let lastTime = 0;
function frame(now) {
  if ((now - startTime) / 1000 > DURATION) return stop('terminado: 10 s');
  frameWork(Math.min((now - lastTime) / 1000, 1 / 30)); // pasos de 1/30 s como mucho
  lastTime = now;
  frameId = requestAnimationFrame(frame);
}
function start() {
  if (frameId !== null) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return say('movimiento reducido: las pelotas se quedan quietas');
  startTime = lastTime = performance.now();
  frameId = requestAnimationFrame(frame);
  toggle.textContent = '⏹ Parar';
  say('▶ en marcha: 1 pasada de cómputo + 1 de render por fotograma, en 1 submit');
}
function stop(reason) {
  if (frameId === null) return;
  cancelAnimationFrame(frameId);
  frameId = null;
  toggle.textContent = '▶ Lanzar';
  say(`⏹ ${reason}`);
}
toggle.addEventListener('click', () => (frameId === null ? start() : stop('parado')));
document.addEventListener('visibilitychange', () => { if (document.hidden) stop('página oculta'); });

frameWork(0); // un fotograma quieto al cargar
say(`Listo: ${COUNT} pelotas en un búfer de ${particles.byteLength} bytes; pulsa «Lanzar»`);
```

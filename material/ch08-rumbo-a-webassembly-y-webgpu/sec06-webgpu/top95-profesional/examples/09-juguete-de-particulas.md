---
example_description: "Un juguete de partículas: 16 384 chispas que el puntero atrae o repele. Un compute shader aplica la fuerza, el rozamiento y los bordes a todas a la vez, y un render pipeline las dibuja con instancias leyendo el mismo búfer, con mezcla aditiva para que brillen. Un submit por fotograma con las dos pasadas; la animación arranca con un botón, dura 10 s como mucho, se para al ocultar la página, no arranca con «reducir movimiento», y el punto de fuerza también se mueve con las flechas"
example_tags: "javascript|webgpu|compute-shader|particulas|instancias|blending|puntero|teclado|animacion|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="toy">
  <h1>Chispas</h1>
  <canvas id="stage" tabindex="0" role="img" aria-label="Miles de chispas de colores que siguen al punto de fuerza. Con el foco: flechas para moverlo, espacio para cambiar entre atraer y repeler"></canvas>
  <div class="actions">
    <button id="toggle" type="button">▶ Soltar las chispas</button>
    <button id="mode" type="button" aria-pressed="false">Repeler</button>
  </div>
  <p id="status" class="status" role="status"></p>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root {
  color-scheme: dark;
  --text: #e2e8f0;
  --muted: #94a3b8;
  --surface: #0f172a;
  --focus: #60a5fa;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--text);
  background: var(--surface);
}
.toy {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin-top: 0;
}
canvas {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  max-height: 360px;
  border-radius: 6px;
  touch-action: none;
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
button {
  font: inherit;
  padding: 0.35rem 0.8rem;
}
button[aria-pressed="true"] {
  background: #fbbf24;
  color: #111827;
}
canvas:focus-visible,
button:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}
.status {
  color: var(--muted);
  font-size: 0.9rem;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.78rem;
}
```

# JavaScript

```javascript
// Usa assets/gpu/kit.js (léelo con «Assets»).
//
// Decisiones de diseño:
//   · El estado (posición y velocidad de cada chispa) vive en un búfer de la GPU desde el principio:
//     JavaScript solo envía 16 bytes por fotograma (el punto de fuerza, el paso de tiempo y la fuerza).
//   · Cada fotograma es UN encargo con dos pasadas: cómputo (mover) y render (dibujar). El vertex
//     shader lee el mismo búfer que acaba de escribir el compute shader.
//   · Mezcla aditiva (one + one): donde se juntan muchas chispas, el color se acerca al blanco.
//   · El bucle sigue las reglas de siempre: botón, 10 s como mucho, página oculta, reducir movimiento.
import { createView, createAnimation, structLayout, writeStruct, seededRandom } from './gpu/kit.js';

const COUNT = 16384;
const PARAMS = structLayout({ pointer: 'vec2f', dt: 'f32', strength: 'f32' });
const logList = document.querySelector('#log');
const statusLine = document.querySelector('#status');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
  statusLine.textContent = text;
}

// Partida: un anillo de chispas quietas, con una semilla
const random = seededRandom(7);
const initial = new Float32Array(COUNT * 4); // struct Spark { pos: vec2f, vel: vec2f }: 16 bytes
for (let i = 0; i < COUNT; i++) {
  const angle = random() * Math.PI * 2;
  const radius = 0.55 + random() * 0.25;
  initial.set([Math.cos(angle) * radius, Math.sin(angle) * radius, 0, 0], i * 4);
}
let pointer = [0, 0]; // en coordenadas de recorte
let repel = false;
let stepSeconds = 0;

const view = createView(document.querySelector('#stage'), {
  label: 'chispas',
  setup({ device, format }) {
    const sparks = device.createBuffer({ label: 'chispas', size: initial.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(sparks, 0, initial);
    const params = device.createBuffer({ label: 'fuerza', size: PARAMS.size, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    const SPARK = /* wgsl */ `struct Spark { pos: vec2f, vel: vec2f }`;
    const move = device.createComputePipeline({
      label: 'mover', layout: 'auto',
      compute: {
        module: device.createShaderModule({
          label: 'mover',
          code: /* wgsl */ `${SPARK}
            struct Params { pointer: vec2f, dt: f32, strength: f32 }
            @group(0) @binding(0) var<storage, read_write> sparks: array<Spark>;
            @group(0) @binding(1) var<uniform> params: Params;
            @compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {
              if (id.x >= arrayLength(&sparks)) { return; }
              var spark = sparks[id.x];
              let toPointer = params.pointer - spark.pos;
              let distanceSquared = dot(toPointer, toPointer) + 0.02; // + 0.02: sin infinitos en el centro
              spark.vel += toPointer / sqrt(distanceSquared) * params.strength / distanceSquared * params.dt; // nunca ÷ 0
              spark.vel *= 0.985; // rozamiento
              spark.pos += spark.vel * params.dt;
              if (abs(spark.pos.x) > 1.0) { spark.pos.x = clamp(spark.pos.x, -1.0, 1.0); spark.vel.x *= -0.5; }
              if (abs(spark.pos.y) > 1.0) { spark.pos.y = clamp(spark.pos.y, -1.0, 1.0); spark.vel.y *= -0.5; }
              sparks[id.x] = spark;
            }`,
        }),
      },
    });
    const drawModule = device.createShaderModule({
      label: 'dibujar',
      code: /* wgsl */ `${SPARK}
        @group(0) @binding(0) var<storage, read> sparks: array<Spark>;
        struct VertexOutput { @builtin(position) position: vec4f, @location(0) color: vec3f }
        @vertex fn vertexMain(@builtin(vertex_index) corner: u32, @builtin(instance_index) index: u32) -> VertexOutput {
          var quad = array<vec2f, 6>(vec2f(-1, -1), vec2f(1, -1), vec2f(-1, 1), vec2f(-1, 1), vec2f(1, -1), vec2f(1, 1));
          let spark = sparks[index];
          let speed = clamp(length(spark.vel) / 1.5, 0.0, 1.0);
          var output: VertexOutput;
          output.position = vec4f(spark.pos + quad[corner] * 0.006, 0.0, 1.0);
          output.color = mix(vec3f(0.05, 0.25, 0.45), vec3f(0.6, 0.35, 0.1), speed) * 0.5; // se suman: colores tenues
          return output;
        }
        @fragment fn fragmentMain(vertexOut: VertexOutput) -> @location(0) vec4f {
          return vec4f(vertexOut.color, 1.0);
        }`,
    });
    const additive = { srcFactor: 'one', dstFactor: 'one', operation: 'add' };
    const draw = device.createRenderPipeline({
      label: 'dibujar', layout: 'auto',
      vertex: { module: drawModule },
      fragment: { module: drawModule, targets: [{ format, blend: { color: additive, alpha: additive } }] },
    });
    const group = (pipeline, buffers) => device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0), entries: buffers.map((buffer, binding) => ({ binding, resource: { buffer } })),
    });
    return { params, move, draw, moveGroup: group(move, [sparks, params]), drawGroup: group(draw, [sparks]) };
  },
  render({ encoder, device, resources: gpu, pass }) {
    if (stepSeconds > 0) {
      device.queue.writeBuffer(gpu.params, 0, writeStruct(PARAMS, { pointer, dt: stepSeconds, strength: repel ? -0.08 : 0.08 }));
      const computePass = encoder.beginComputePass({ label: 'mover' });
      computePass.setPipeline(gpu.move);
      computePass.setBindGroup(0, gpu.moveGroup);
      computePass.dispatchWorkgroups(Math.ceil(COUNT / 64));
      computePass.end();
    }
    const renderPass = pass({ label: 'chispas', clearValue: [2 / 255, 6 / 255, 23 / 255, 1] });
    renderPass.setPipeline(gpu.draw);
    renderPass.setBindGroup(0, gpu.drawGroup);
    renderPass.draw(6, COUNT);
    renderPass.end();
  },
});

const toggle = document.querySelector('#toggle');
let lastTime = 0;
const animation = createAnimation({
  maxSeconds: 10,
  frame(seconds) {
    stepSeconds = Math.min(seconds - lastTime, 1 / 30); // pasos de 1/30 s como mucho
    lastTime = seconds;
    view.renderNow();
  },
  onStop(reason) {
    stepSeconds = 0;
    toggle.textContent = '▶ Soltar las chispas';
    log(`⏹ ${reason}`);
  },
});
toggle.addEventListener('click', () => {
  if (animation.running) return animation.stop('parado');
  lastTime = 0;
  if (!animation.start()) return log('movimiento reducido: las chispas se quedan quietas');
  toggle.textContent = '⏹ Parar';
  log(`▶ en marcha: 1 pasada de cómputo + 1 de render por fotograma · ${repel ? 'repeler' : 'atraer'}`);
});
const modeButton = document.querySelector('#mode');
function toggleMode() {
  repel = !repel;
  modeButton.setAttribute('aria-pressed', String(repel));
  log(`modo → ${repel ? 'repeler' : 'atraer'}`);
}
modeButton.addEventListener('click', toggleMode);

// El punto de fuerza: con el puntero o con las flechas
const canvas = document.querySelector('#stage');
canvas.addEventListener('pointermove', (event) => {
  const box = canvas.getBoundingClientRect();
  pointer = [((event.clientX - box.left) / box.width) * 2 - 1, 1 - ((event.clientY - box.top) / box.height) * 2];
});
canvas.addEventListener('keydown', (event) => {
  const moves = { ArrowLeft: [-0.1, 0], ArrowRight: [0.1, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] };
  if (event.key === ' ') {
    event.preventDefault();
    return toggleMode();
  }
  if (!moves[event.key]) return;
  event.preventDefault();
  pointer = pointer.map((value, k) => Math.min(1, Math.max(-1, value + moves[event.key][k])));
});

await view.ready;
log(`Listo: ${COUNT} chispas en un búfer de ${initial.byteLength} bytes; pulsa «Soltar las chispas»`);
```

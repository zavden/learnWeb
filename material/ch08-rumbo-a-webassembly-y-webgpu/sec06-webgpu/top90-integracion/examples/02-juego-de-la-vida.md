---
example_description: "El juego de la vida de Conway en un compute shader, sin fingir que el tablero es una imagen: 128 × 80 células en dos búferes de almacenamiento que se turnan, una pasada de cómputo por generación y un fragment shader que pinta el tablero leyendo el MISMO búfer. JavaScript lleva su propia copia del tablero y comprueba cada generación. «Paso» avanza una; «100 generaciones» las anima a 12 por segundo (o las calcula de golpe con «reducir movimiento»)"
example_tags: "javascript|webgpu|compute-shader|juego-de-la-vida|ping-pong|storage-buffer|animacion|integracion"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>El juego de la vida, en la GPU</h1>
  <canvas id="board" role="img" aria-label="Un tablero de 128 por 80 células; las vivas, en verde"></canvas>
  <div class="actions">
    <button id="step" type="button">Paso</button>
    <button id="run" type="button">▶ 100 generaciones</button>
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
  width: 384px;
  max-width: 100%;
  aspect-ratio: 128 / 80;
  outline: 1px solid #334155;
}
.actions {
  display: flex;
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
// Usa assets/webgpu/utils.js (léelo con «Assets»). Lecciones: «Búferes y compute» (pasadas,
// grupos de 8 × 8, guardas) y «El pipeline de render» (un fragment shader que lee un búfer).
import { getDevice, setupCanvas, readBuffer } from './webgpu/utils.js';

const WIDTH = 128;
const HEIGHT = 80;
const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// El tablero de partida, con una semilla (mulberry32): una de cada cuatro células, viva
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(2026);
let cpuBoard = Uint32Array.from({ length: WIDTH * HEIGHT }, () => (random() < 0.25 ? 1 : 0));

// La referencia en JavaScript: el mismo paso, célula a célula, con bordes que dan la vuelta
function stepCpu(cells) {
  const out = new Uint32Array(cells.length);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      let neighbours = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx !== 0 || dy !== 0) neighbours += cells[((y + dy + HEIGHT) % HEIGHT) * WIDTH + ((x + dx + WIDTH) % WIDTH)];
        }
      }
      out[y * WIDTH + x] = neighbours === 3 || (cells[y * WIDTH + x] === 1 && neighbours === 2) ? 1 : 0;
    }
  }
  return out;
}
const alive = (cells) => cells.reduce((total, cell) => total + cell, 0);

const { device } = await getDevice({ label: 'vida' });
const { context, format } = setupCanvas(document.querySelector('#board'), device);
const boards = ['A', 'B'].map((name) => device.createBuffer({
  label: `tablero ${name}`, size: cpuBoard.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
}));
device.queue.writeBuffer(boards[0], 0, cpuBoard);
const sizeBuffer = device.createBuffer({ label: 'tamaño del lienzo', size: 8, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
device.queue.writeBuffer(sizeBuffer, 0, new Float32Array([context.canvas.width, context.canvas.height]));

const SIZE = /* wgsl */ `const WIDTH = ${WIDTH}u; const HEIGHT = ${HEIGHT}u;`;
const life = device.createShaderModule({
  label: 'una generación',
  code: /* wgsl */ `${SIZE}
    @group(0) @binding(0) var<storage, read> current: array<u32>;
    @group(0) @binding(1) var<storage, read_write> upcoming: array<u32>;
    fn cellAt(x: i32, y: i32) -> u32 { // el tablero da la vuelta: es un toro
      let wrappedX = u32((x + i32(WIDTH)) % i32(WIDTH));
      let wrappedY = u32((y + i32(HEIGHT)) % i32(HEIGHT));
      return current[wrappedY * WIDTH + wrappedX];
    }
    @compute @workgroup_size(8, 8)
    fn main(@builtin(global_invocation_id) id: vec3u) {
      if (id.x >= WIDTH || id.y >= HEIGHT) { return; }
      var neighbours = 0u;
      for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) { // los 8 vecinos: un límite fijo
          if (dx != 0 || dy != 0) { neighbours += cellAt(i32(id.x) + dx, i32(id.y) + dy); }
        }
      }
      let isAlive = current[id.y * WIDTH + id.x] == 1u;
      upcoming[id.y * WIDTH + id.x] = select(0u, 1u, neighbours == 3u || (isAlive && neighbours == 2u));
    }`,
});
const paint = device.createShaderModule({
  label: 'pintar el tablero',
  code: /* wgsl */ `${SIZE}
    @group(0) @binding(0) var<storage, read> cells: array<u32>;
    @group(0) @binding(1) var<uniform> canvasSize: vec2f;
    @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
      var corners = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3)); // UN triángulo que cubre el lienzo
      return vec4f(corners[index], 0.0, 1.0);
    }
    @fragment fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
      let cell = vec2u(position.xy / canvasSize * vec2f(f32(WIDTH), f32(HEIGHT)));
      let isAlive = cells[min(cell.y, HEIGHT - 1u) * WIDTH + min(cell.x, WIDTH - 1u)] == 1u;
      return select(vec4f(0.059, 0.090, 0.165, 1.0), vec4f(0.204, 0.827, 0.600, 1.0), isAlive); // #0f172a o #34d399
    }`,
});
const computePipeline = device.createComputePipeline({ label: 'una generación', layout: 'auto', compute: { module: life } });
const renderPipeline = device.createRenderPipeline({
  label: 'pintar el tablero', layout: 'auto', vertex: { module: paint }, fragment: { module: paint, targets: [{ format }] },
});
// A → B y B → A para el cómputo; A y B para pintar
const stepGroups = [0, 1].map((from) => device.createBindGroup({
  label: `${boards[from].label} → ${boards[1 - from].label}`,
  layout: computePipeline.getBindGroupLayout(0),
  entries: [{ binding: 0, resource: { buffer: boards[from] } }, { binding: 1, resource: { buffer: boards[1 - from] } }],
}));
const paintGroups = [0, 1].map((index) => device.createBindGroup({
  label: `pintar ${boards[index].label}`,
  layout: renderPipeline.getBindGroupLayout(0),
  entries: [{ binding: 0, resource: { buffer: boards[index] } }, { binding: 1, resource: { buffer: sizeBuffer } }],
}));

let current = 0; // qué búfer tiene la generación actual
let generation = 0;
// Avanza «count» generaciones (en la GPU y en JavaScript) y pinta la última: UN submit
function advance(count) {
  const encoder = device.createCommandEncoder({ label: `${count} generaciones` });
  for (let i = 0; i < count; i++) {
    const pass = encoder.beginComputePass({ label: 'una generación' });
    pass.setPipeline(computePipeline);
    pass.setBindGroup(0, stepGroups[current]);
    pass.dispatchWorkgroups(Math.ceil(WIDTH / 8), Math.ceil(HEIGHT / 8));
    pass.end();
    current = 1 - current;
    cpuBoard = stepCpu(cpuBoard);
  }
  generation += count;
  const pass = encoder.beginRenderPass({
    colorAttachments: [{ view: context.getCurrentTexture().createView(), clearValue: [0, 0, 0, 1], loadOp: 'clear', storeOp: 'store' }],
  });
  pass.setPipeline(renderPipeline);
  pass.setBindGroup(0, paintGroups[current]);
  pass.draw(3);
  pass.end();
  device.queue.submit([encoder.finish()]);
}
async function report() {
  const gpuBoard = await readBuffer(device, boards[current], Uint32Array);
  const same = gpuBoard.every((cell, i) => cell === cpuBoard[i]);
  log(`generación ${generation} · vivas ${alive(gpuBoard)} · ¿igual que en JavaScript? ${same ? '✅' : '❌'}`);
}

// La animación: 12 generaciones por segundo, 100 en total, con un botón y sin bucle al cargar
const runButton = document.querySelector('#run');
let frameId = null;
let startTime = 0;
let done = 0;
function frame(now) {
  const due = Math.min(100, Math.floor(((now - startTime) / 1000) * 12));
  if (due > done) {
    advance(due - done);
    done = due;
  }
  if (done === 100) return stop('terminado: 100 generaciones');
  frameId = requestAnimationFrame(frame);
}
function stop(reason) {
  if (frameId === null) return;
  cancelAnimationFrame(frameId);
  frameId = null;
  runButton.textContent = '▶ 100 generaciones';
  log(`⏹ ${reason}`);
  report();
}
runButton.addEventListener('click', () => {
  if (frameId !== null) return stop('parado');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    advance(100); // sin animación: las 100 de golpe, en un solo envío
    log('movimiento reducido: 100 generaciones de golpe');
    return report();
  }
  startTime = performance.now();
  done = 0;
  runButton.textContent = '⏹ Parar';
  log('▶ 100 generaciones a 12 por segundo');
  frameId = requestAnimationFrame(frame);
});
document.addEventListener('visibilitychange', () => { if (document.hidden) stop('página oculta'); });
document.querySelector('#step').addEventListener('click', () => {
  if (frameId !== null) return;
  advance(1);
  report();
});

advance(0); // pintar la generación 0
log(`tablero → ${WIDTH} × ${HEIGHT} = ${WIDTH * HEIGHT} células · generación 0 · vivas ${alive(cpuBoard)}`);
log('Listo: pulsa «Paso» o «▶ 100 generaciones»');
```

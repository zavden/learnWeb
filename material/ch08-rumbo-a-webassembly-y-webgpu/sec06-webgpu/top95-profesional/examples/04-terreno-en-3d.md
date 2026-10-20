---
example_description: "Un terreno en 3D generado en la GPU: un compute shader calcula 128 × 128 alturas con ruido de valor de 4 octavas (un hash de enteros y bucles de 4 vueltas), y el vertex shader construye la malla leyendo ese búfer: posición, normal por diferencias centrales y color por franjas de altura. Cámara orbital con el puntero o las flechas, profundidad y descarte de caras. Cada «Otra semilla» recalcula el terreno; la autocomprobación repite las 16 384 alturas en JavaScript"
example_tags: "javascript|webgpu|3d|compute-shader|terreno|ruido|mat4x4f|profundidad|camara|teclado|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="terrain">
  <h1>Un terreno en 3D</h1>
  <canvas id="stage" tabindex="0" role="img" aria-label="Un paisaje de montañas con agua, playa, hierba, roca y nieve. Con el foco: flechas para girar la cámara, + y - para acercarla" aria-describedby="camera"></canvas>
  <p id="camera" class="camera" aria-live="polite"></p>
  <div class="actions">
    <button id="seed" type="button">Otra semilla</button>
    <button id="verify" type="button">Comprobar las alturas</button>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
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
.terrain {
  max-width: 36rem;
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
  height: 300px;
  border-radius: 6px;
  cursor: grab;
  touch-action: none;
}
canvas:focus-visible,
button:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}
.camera {
  font-size: 0.85rem;
  color: var(--muted);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.35rem 0.8rem;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.78rem;
}
```

# JavaScript

```javascript
// Usa assets/gpu/kit.js y assets/gpu/mat4.js (léelos con «Assets»).
//
// Decisiones de diseño:
//   · Las alturas se calculan en un compute shader y se quedan en la GPU: el vertex shader las lee
//     del búfer de almacenamiento por vertex_index. No hay búfer de vértices: solo índices.
//   · El ruido es un hash de ENTEROS (u32, que en WGSL dan la vuelta al desbordarse, como Math.imul)
//     interpolado con smoothstep: la versión de JavaScript da lo mismo salvo el redondeo de float32.
//   · Todos los bucles de los shaders tienen un límite fijo: 4 octavas.
//   · La cámara gira alrededor del centro (azimut y elevación) y solo se redibuja al moverla.
//   · El terreno se recalcula solo al cambiar la semilla (o al recuperar un dispositivo perdido).
import { createView, readBuffer, structLayout, writeStruct } from './gpu/kit.js';
import * as mat4 from './gpu/mat4.js';

const N = 128; // vértices por lado
const SCENE = structLayout({ viewProjection: 'mat4x4f', light: 'vec3f', heightScale: 'f32' });
let seed = 1;
let camera = { azimuth: 35, elevation: 32, distance: 3.4 };

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Los índices: dos triángulos por cuadrado de la rejilla (127 × 127 cuadrados)
const indices = new Uint16Array((N - 1) * (N - 1) * 6);
for (let z = 0, k = 0; z < N - 1; z++) {
  for (let x = 0; x < N - 1; x++, k += 6) {
    const i = z * N + x;
    indices.set([i, i + N, i + 1, i + 1, i + N, i + N + 1], k); // antihorario visto desde arriba
  }
}

const NOISE = /* wgsl */ `
  fn hash(x: u32, y: u32, seed: u32) -> f32 {
    var h = x * 374761393u + y * 668265263u + seed * 2246822519u; // los u32 dan la vuelta
    h = (h ^ (h >> 13u)) * 1274126177u;
    h = h ^ (h >> 16u);
    return f32(h) / 4294967295.0;
  }
  fn valueNoise(p: vec2f, seed: u32) -> f32 {
    let cell = vec2u(floor(p));
    let f = fract(p);
    let s = f * f * (3.0 - 2.0 * f); // smoothstep: sin aristas entre celdas
    let lower = mix(hash(cell.x, cell.y, seed), hash(cell.x + 1u, cell.y, seed), s.x);
    let upper = mix(hash(cell.x, cell.y + 1u, seed), hash(cell.x + 1u, cell.y + 1u, seed), s.x);
    return mix(lower, upper, s.y);
  }`;

const view = createView(document.querySelector('#stage'), {
  label: 'terreno',
  depth: true,
  setup({ device, format }) {
    const { STORAGE, COPY_SRC, UNIFORM, INDEX, COPY_DST } = GPUBufferUsage;
    const heights = device.createBuffer({ label: 'alturas', size: N * N * 4, usage: STORAGE | COPY_SRC });
    const seedBuffer = device.createBuffer({ label: 'semilla', size: 4, usage: UNIFORM | COPY_DST });
    const sceneBuffer = device.createBuffer({ label: 'escena', size: SCENE.size, usage: UNIFORM | COPY_DST });
    const indexBuffer = device.createBuffer({ label: 'índices', size: indices.byteLength, usage: INDEX | COPY_DST });
    device.queue.writeBuffer(indexBuffer, 0, indices);

    const generator = device.createComputePipeline({
      label: 'alturas',
      layout: 'auto',
      compute: {
        module: device.createShaderModule({
          label: 'alturas',
          code: /* wgsl */ `${NOISE}
            const N = ${N}u;
            @group(0) @binding(0) var<storage, read_write> heights: array<f32>;
            @group(0) @binding(1) var<uniform> seed: u32;
            @compute @workgroup_size(8, 8) fn main(@builtin(global_invocation_id) id: vec3u) {
              if (id.x >= N || id.y >= N) { return; }
              let p = vec2f(id.xy) / f32(N - 1u) * 4.0; // 4 celdas de ruido de lado a lado
              var height = 0.0;
              var amplitude = 0.5;
              var frequency = 1.0;
              for (var octave = 0u; octave < 4u; octave++) { // 4 octavas: cada una, el doble de detalle
                height += amplitude * valueNoise(p * frequency, seed + octave);
                amplitude *= 0.5;
                frequency *= 2.0;
              }
              heights[id.y * N + id.x] = height;
            }`,
        }),
      },
    });
    const drawModule = device.createShaderModule({
      label: 'malla',
      code: /* wgsl */ `
        const N = ${N}u;
        struct Scene { viewProjection: mat4x4f, light: vec3f, heightScale: f32 }
        @group(0) @binding(0) var<storage, read> heights: array<f32>;
        @group(0) @binding(1) var<uniform> scene: Scene;
        struct VertexOutput { @builtin(position) position: vec4f, @location(0) normal: vec3f, @location(1) height: f32 }

        fn heightAt(x: i32, z: i32) -> f32 {
          let last = i32(N) - 1;
          return heights[u32(clamp(z, 0, last)) * N + u32(clamp(x, 0, last))];
        }
        fn worldAt(x: i32, z: i32) -> vec3f { // de la rejilla al mundo: de -1 a 1 en x y z
          let spacing = 2.0 / f32(N - 1u);
          return vec3f(-1.0 + f32(x) * spacing, max(heightAt(x, z), 0.3) * scene.heightScale, -1.0 + f32(z) * spacing);
        }
        @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> VertexOutput {
          let x = i32(index % N);
          let z = i32(index / N);
          // La normal, con los vecinos (diferencias centrales): cruz de las dos pendientes
          let dx = worldAt(x + 1, z) - worldAt(x - 1, z);
          let dz = worldAt(x, z + 1) - worldAt(x, z - 1);
          var output: VertexOutput;
          output.position = scene.viewProjection * vec4f(worldAt(x, z), 1.0);
          output.normal = normalize(cross(dz, dx));
          output.height = heightAt(x, z);
          return output;
        }
        @fragment fn fragmentMain(vertexOut: VertexOutput) -> @location(0) vec4f {
          let h = vertexOut.height;
          var color = vec3f(0.961, 0.961, 0.973); // nieve
          if (h < 0.30) { color = vec3f(0.145, 0.388, 0.922); }      // agua
          else if (h < 0.34) { color = vec3f(0.894, 0.820, 0.627); } // playa
          else if (h < 0.50) { color = vec3f(0.247, 0.584, 0.267); } // hierba
          else if (h < 0.62) { color = vec3f(0.471, 0.443, 0.424); } // roca
          let diffuse = max(dot(normalize(vertexOut.normal), scene.light), 0.0);
          return vec4f(color * (0.35 + 0.65 * diffuse), 1.0);
        }`,
    });
    const mesh = device.createRenderPipeline({
      label: 'malla',
      layout: 'auto',
      vertex: { module: drawModule },
      fragment: { module: drawModule, targets: [{ format }] },
      primitive: { topology: 'triangle-list', cullMode: 'back' },
      depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less' },
    });
    const generatorGroup = device.createBindGroup({
      label: 'alturas', layout: generator.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: heights } }, { binding: 1, resource: { buffer: seedBuffer } }],
    });
    const meshGroup = device.createBindGroup({
      label: 'malla', layout: mesh.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: heights } }, { binding: 1, resource: { buffer: sceneBuffer } }],
    });
    return { heights, seedBuffer, sceneBuffer, indexBuffer, generator, generatorGroup, mesh, meshGroup, dirty: true };
  },
  render({ encoder, device, resources: gpu, view: current, pass }) {
    if (gpu.dirty) { // el terreno, solo al cambiar la semilla
      gpu.dirty = false;
      device.queue.writeBuffer(gpu.seedBuffer, 0, new Uint32Array([seed]));
      const computePass = encoder.beginComputePass({ label: 'alturas' });
      computePass.setPipeline(gpu.generator);
      computePass.setBindGroup(0, gpu.generatorGroup);
      computePass.dispatchWorkgroups(N / 8, N / 8);
      computePass.end();
    }
    const { canvas } = current;
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const { azimuth, elevation, distance } = camera;
    const eye = [
      distance * Math.cos(toRadians(elevation)) * Math.sin(toRadians(azimuth)),
      distance * Math.sin(toRadians(elevation)),
      distance * Math.cos(toRadians(elevation)) * Math.cos(toRadians(azimuth)),
    ];
    const projection = mat4.perspective(Math.PI / 4, canvas.width / canvas.height, 0.1, 50);
    const viewProjection = mat4.multiply(projection, mat4.lookAt(eye, [0, 0.2, 0]));
    const light = [0.5, 0.8, 0.3].map((value, _, all) => value / Math.hypot(...all));
    device.queue.writeBuffer(gpu.sceneBuffer, 0, writeStruct(SCENE, { viewProjection, light, heightScale: 0.7 }));
    const renderPass = pass({ label: 'terreno', clearValue: [12 / 255, 25 / 255, 46 / 255, 1] });
    renderPass.setPipeline(gpu.mesh);
    renderPass.setBindGroup(0, gpu.meshGroup);
    renderPass.setIndexBuffer(gpu.indexBuffer, 'uint16');
    renderPass.drawIndexed(indices.length);
    renderPass.end();
    document.querySelector('#camera').textContent = `Cámara: azimut ${azimuth}°, elevación ${elevation}°, distancia ${distance.toFixed(1)} · semilla ${seed}`;
  },
});

// La referencia en JavaScript: el mismo hash (Math.imul imita la multiplicación de u32) y el mismo ruido
function hash(x, y, s) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 2246822519 | 0)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967295;
}
function valueNoise(px, py, s) {
  const cx = Math.floor(px);
  const cy = Math.floor(py);
  const sx = (px - cx) ** 2 * (3 - 2 * (px - cx));
  const sy = (py - cy) ** 2 * (3 - 2 * (py - cy));
  const mix = (a, b, t) => a * (1 - t) + b * t;
  return mix(mix(hash(cx, cy, s), hash(cx + 1, cy, s), sx), mix(hash(cx, cy + 1, s), hash(cx + 1, cy + 1, s), sx), sy);
}
function heightsCpu(s) {
  const out = new Float32Array(N * N);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let height = 0;
      for (let octave = 0, amplitude = 0.5, frequency = 1; octave < 4; octave++, amplitude *= 0.5, frequency *= 2) {
        height += amplitude * valueNoise((x / (N - 1)) * 4 * frequency, (y / (N - 1)) * 4 * frequency, s + octave);
      }
      out[y * N + x] = height;
    }
  }
  return out;
}
async function verify() {
  if (view.resources.dirty) await view.renderNow();
  const gpu = await readBuffer(view.device, view.resources.heights);
  const cpu = heightsCpu(seed);
  const worst = gpu.reduce((max, value, i) => Math.max(max, Math.abs(value - cpu[i])), 0);
  const [low, high] = [Math.min(...cpu), Math.max(...cpu)];
  log(`semilla ${seed} · ${cpu.length} alturas · de ${low.toFixed(3)} a ${high.toFixed(3)} · ¿la GPU coincide con JavaScript? (diferencia < 0,0001) ${worst < 1e-4 ? '✅' : '❌'}`);
}

// Cámara: arrastrar, flechas, + y -, Ctrl + rueda
const canvas = document.querySelector('#stage');
function moveCamera({ azimuth = 0, elevation = 0, distance = 1 }) {
  camera = {
    azimuth: (camera.azimuth + azimuth + 360) % 360,
    elevation: Math.min(85, Math.max(10, camera.elevation + elevation)),
    distance: Math.min(6, Math.max(1.8, camera.distance * distance)),
  };
  view.invalidate();
}
let dragging = null;
canvas.addEventListener('pointerdown', (event) => {
  dragging = [event.clientX, event.clientY];
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  moveCamera({ azimuth: Math.round((dragging[0] - event.clientX) / 2), elevation: Math.round((event.clientY - dragging[1]) / 2) });
  dragging = [event.clientX, event.clientY];
});
canvas.addEventListener('pointerup', () => { dragging = null; });
canvas.addEventListener('pointercancel', () => { dragging = null; });
canvas.addEventListener('wheel', (event) => {
  if (!event.ctrlKey) return;
  event.preventDefault();
  moveCamera({ distance: event.deltaY < 0 ? 0.9 : 1.1 });
}, { passive: false });
canvas.addEventListener('keydown', (event) => {
  const actions = {
    ArrowLeft: { azimuth: -10 }, ArrowRight: { azimuth: 10 }, ArrowUp: { elevation: 5 }, ArrowDown: { elevation: -5 },
    '+': { distance: 0.9 }, '=': { distance: 0.9 }, '-': { distance: 1.1 },
  };
  if (!actions[event.key]) return;
  event.preventDefault();
  moveCamera(actions[event.key]);
});
document.querySelector('#seed').addEventListener('click', async () => {
  seed += 1;
  view.resources.dirty = true;
  await view.renderNow();
  await verify();
});
document.querySelector('#verify').addEventListener('click', verify);

await view.ready;
log(`terreno → ${N} × ${N} = ${N * N} vértices leídos de un búfer de almacenamiento · ${indices.length} índices · 4 octavas de ruido`);
await verify();
log('Listo: gira la cámara (arrastra o usa las flechas con el foco), acércala con + y -, o pide otra semilla');
```

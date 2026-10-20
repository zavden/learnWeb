---
example_description: "Un cubo en 3D con WebGPU: 24 vértices con posición, normal y color intercalados (36 bytes) y 36 índices, una estructura de uniforms con dos mat4x4f, la dirección de la luz y la luz ambiente (144 bytes: el f32 llena el hueco del vec3f), luz de Lambert, prueba de profundidad con una textura depth24plus y descarte de caras traseras. Las matrices son las del módulo de WebGL con la perspectiva de WebGPU (profundidad de 0 a 1). El color del centro, leído de la GPU, coincide con el mismo cálculo en JavaScript"
example_tags: "javascript|webgpu|3d|mat4x4f|profundidad|depth24plus|cullmode|indices|uniforms|integracion"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Un cubo en 3D</h1>
  <canvas id="stage" role="img" aria-label="Un cubo de caras de colores, girado e iluminado desde arriba a la izquierda"></canvas>
  <form id="controls" class="controls">
    <label>Giro Y <input type="range" name="turn" min="-90" max="90" step="5" value="-35"> <output name="turnValue">-35°</output></label>
    <label><input type="checkbox" name="depth" checked> Profundidad y descarte de caras</label>
  </form>
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
  height: 240px;
  outline: 1px solid #334155;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin-top: 0.75rem;
  font-size: 0.9rem;
}
input:focus-visible {
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
// Usa assets/webgpu/utils.js y assets/webgpu/mat4.js (léelos con «Assets»). Lecciones: «El pipeline
// de render» (vértices, índices, uniforms), «Búferes y compute» (alineación) y las matrices del
// módulo «Gráficos en la GPU».
import { getDevice, setupCanvas, readPixels, clearColor } from './webgpu/utils.js';
import * as mat4 from './webgpu/mat4.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Cada cara: su normal, dos ejes (u × v = normal: así las esquinas van en sentido antihorario
// vistas desde fuera, que es lo que WebGPU considera «de frente») y un color
const FACES = [
  { name: 'delante', normal: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], color: [225, 29, 72] },
  { name: 'detrás', normal: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0], color: [124, 58, 237] },
  { name: 'derecha', normal: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0], color: [245, 158, 11] },
  { name: 'izquierda', normal: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0], color: [13, 148, 136] },
  { name: 'arriba', normal: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1], color: [56, 189, 248] },
  { name: 'abajo', normal: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1], color: [132, 204, 22] },
];
const vertices = new Float32Array(FACES.length * 4 * 9); // 4 esquinas × (posición, normal, color)
const indices = new Uint16Array(FACES.length * 6);
FACES.forEach(({ normal, u, v, color }, face) => {
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b], corner) => {
    const position = normal.map((n, k) => n + a * u[k] + b * v[k]);
    vertices.set([...position, ...normal, ...color.map((c) => c / 255)], (face * 4 + corner) * 9);
  });
  const base = face * 4;
  indices.set([base, base + 1, base + 2, base, base + 2, base + 3], face * 6);
});
const LIGHT = [-0.4, 0.6, 0.7].map((value, _, all) => value / Math.hypot(...all)); // hacia la luz
const AMBIENT = 0.3;
const TILT = (25 * Math.PI) / 180;

const { device } = await getDevice({ label: 'cubo' });
const canvas = document.querySelector('#stage');
const { context, format } = setupCanvas(canvas, device);
const { VERTEX, INDEX, UNIFORM, COPY_DST } = GPUBufferUsage;
const vertexBuffer = device.createBuffer({ label: 'vértices', size: vertices.byteLength, usage: VERTEX | COPY_DST });
device.queue.writeBuffer(vertexBuffer, 0, vertices);
const indexBuffer = device.createBuffer({ label: 'índices', size: indices.byteLength, usage: INDEX | COPY_DST });
device.queue.writeBuffer(indexBuffer, 0, indices);
const sceneBuffer = device.createBuffer({ label: 'escena', size: 144, usage: UNIFORM | COPY_DST });
const depthTexture = device.createTexture({
  label: 'profundidad', size: [canvas.width, canvas.height], format: 'depth24plus', usage: GPUTextureUsage.RENDER_ATTACHMENT,
});

const module = device.createShaderModule({
  label: 'cubo',
  code: /* wgsl */ `
    struct Scene {
      mvp: mat4x4f,   // byte 0: proyección × cámara × modelo
      model: mat4x4f, // byte 64: solo el giro, para las normales
      light: vec3f,   // byte 128: hacia la luz
      ambient: f32,   // byte 140: llena los 4 bytes que deja el vec3f
    }                 // 144 bytes
    @group(0) @binding(0) var<uniform> scene: Scene;
    struct VertexOutput {
      @builtin(position) position: vec4f,
      @location(0) normal: vec3f,
      @location(1) color: vec3f,
    }
    @vertex
    fn vertexMain(@location(0) position: vec3f, @location(1) normal: vec3f, @location(2) color: vec3f) -> VertexOutput {
      var output: VertexOutput;
      output.position = scene.mvp * vec4f(position, 1.0);
      output.normal = (scene.model * vec4f(normal, 0.0)).xyz; // w = 0: una dirección, sin desplazar
      output.color = color;
      return output;
    }
    @fragment
    fn fragmentMain(vertexOut: VertexOutput) -> @location(0) vec4f {
      let diffuse = max(dot(normalize(vertexOut.normal), scene.light), 0.0); // Lambert
      return vec4f(vertexOut.color * (scene.ambient + (1.0 - scene.ambient) * diffuse), 1.0);
    }`,
});
const vertexLayout = {
  arrayStride: 9 * 4,
  attributes: [
    { shaderLocation: 0, offset: 0, format: 'float32x3' },
    { shaderLocation: 1, offset: 3 * 4, format: 'float32x3' },
    { shaderLocation: 2, offset: 6 * 4, format: 'float32x3' },
  ],
};
const pipelineFor = (withDepth) => device.createRenderPipeline({
  label: withDepth ? 'con profundidad' : 'sin profundidad',
  layout: 'auto',
  vertex: { module, buffers: [vertexLayout] },
  fragment: { module, targets: [{ format }] },
  primitive: { topology: 'triangle-list', cullMode: withDepth ? 'back' : 'none' },
  ...(withDepth && { depthStencil: { format: 'depth24plus', depthWriteEnabled: true, depthCompare: 'less' } }),
});
const pipelines = { depth: pipelineFor(true), flat: pipelineFor(false) };
const bindGroups = Object.fromEntries(Object.entries(pipelines).map(([key, pipeline]) => [key, device.createBindGroup({
  label: 'escena', layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: sceneBuffer } }],
})]));
const projection = mat4.perspective(Math.PI / 4, canvas.width / canvas.height, 0.1, 100);
const camera = mat4.lookAt([0, 0, 5], [0, 0, 0]);

// El color que DEBERÍA tener cada cara, calculado en JavaScript con la misma fórmula
function expectedColors(model) {
  return FACES.map(({ name, normal, color }) => {
    const [x, y, z] = mat4.transformPoint(model, normal); // el modelo solo gira: vale para direcciones
    const diffuse = Math.max(0, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2]);
    return { name, rgb: color.map((c) => Math.round(c * (AMBIENT + (1 - AMBIENT) * diffuse))) };
  });
}

const form = document.querySelector('#controls');
async function render() {
  const turnDegrees = Number(form.turn.value);
  const withDepth = form.depth.checked;
  const key = withDepth ? 'depth' : 'flat';
  const model = mat4.multiply(mat4.rotationX(TILT), mat4.rotationY((turnDegrees * Math.PI) / 180));
  const scene = new Float32Array(36);
  scene.set(mat4.compose(projection, camera, model), 0);
  scene.set(model, 16);
  scene.set(LIGHT, 32);
  scene[35] = AMBIENT;
  device.queue.writeBuffer(sceneBuffer, 0, scene);

  const texture = context.getCurrentTexture();
  const encoder = device.createCommandEncoder({ label: 'cubo' });
  const pass = encoder.beginRenderPass({
    colorAttachments: [{ view: texture.createView(), clearValue: clearColor(15, 23, 42), loadOp: 'clear', storeOp: 'store' }],
    ...(withDepth && {
      depthStencilAttachment: { view: depthTexture.createView(), depthClearValue: 1, depthLoadOp: 'clear', depthStoreOp: 'discard' },
    }),
  });
  pass.setPipeline(pipelines[key]);
  pass.setBindGroup(0, bindGroups[key]);
  pass.setVertexBuffer(0, vertexBuffer);
  pass.setIndexBuffer(indexBuffer, 'uint16');
  pass.drawIndexed(indices.length);
  pass.end();
  device.queue.submit([encoder.finish()]);

  const [pixel] = await readPixels(device, texture, [[canvas.width / 2, canvas.height / 2]]);
  const rgb = pixel.slice(0, 3);
  // ¿Qué cara se ve en el centro? La que tenga el color calculado (±1: float32 contra float64)
  const face = expectedColors(model).find((candidate) => candidate.rgb.every((c, k) => Math.abs(c - rgb[k]) <= 1));
  const mode = withDepth ? '' : ' · sin profundidad ni descarte';
  return `X 25° · Y ${turnDegrees}°${mode} · centro → ${rgb.join(', ')} (${face ? `cara: ${face.name} · calculado: ${face.rgb.join(', ')} ✅` : 'ninguna cara coincide ❌'})`;
}

let pendingFrame = 0;
form.addEventListener('input', () => {
  form.turnValue.value = `${form.turn.value}°`;
  if (!pendingFrame) pendingFrame = requestAnimationFrame(() => { pendingFrame = 0; render(); }); // un dibujo por fotograma, como mucho
});
form.addEventListener('change', async () => log(await render()));

log(`cubo → 24 vértices × 36 bytes + ${indices.length} índices × 2 bytes · Scene: mvp 0, model 64, light 128, ambient 140 · 144 bytes`);
log(await render());
log('Listo: gira el cubo con «Giro Y» (también con las flechas) o quita la profundidad');
```

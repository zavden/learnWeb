---
example_description: "Un uniform con una estructura: struct Params { scale: f32, color: vec3f } mide 32 bytes y el color empieza en el byte 16. Un búfer de 16 bytes ni siquiera se puede conectar (el bind group lo rechaza); uno de 32 con los datos sin hueco dibuja el triángulo en negro, porque el shader lee el color donde no hay nada. Con el hueco de relleno, el color llega"
example_tags: "javascript|webgpu|uniform|bind-group|struct|alineacion|vec3f|padding|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Un uniform con un color</h1>
  <div class="pair">
    <figure>
      <canvas id="packed" role="img" aria-label="Un triángulo negro sobre fondo azul noche"></canvas>
      <figcaption>🐛 sin hueco</figcaption>
    </figure>
    <figure>
      <canvas id="padded" role="img" aria-label="Un triángulo rojo frambuesa sobre fondo azul noche"></canvas>
      <figcaption>✅ con hueco</figcaption>
    </figure>
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
.pair {
  display: flex;
  gap: 1rem;
}
figure {
  margin: 0;
  font-size: 0.8rem;
}
canvas {
  display: block;
  width: 160px;
  height: 120px;
  outline: 1px solid #334155;
  margin-bottom: 0.25rem;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Usa assets/webgpu/utils.js (léelo con «Assets»).
import { getDevice, setupCanvas, readPixels, clearColor, validationError } from './webgpu/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const { device } = await getDevice({ label: 'uniforms' });
const views = [setupCanvas(document.querySelector('#packed'), device), setupCanvas(document.querySelector('#padded'), device)];
const module = device.createShaderModule({
  label: 'triángulo con parámetros',
  code: /* wgsl */ `
    struct Params {
      scale: f32,   // byte 0
      color: vec3f, // byte 16, no 4: un vec3f se alinea a 16 (lección 2)
    }               // 32 bytes en total
    @group(0) @binding(0) var<uniform> params: Params;

    @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
      var positions = array<vec2f, 3>(vec2f(0.0, 0.75), vec2f(-0.75, -0.5), vec2f(0.75, -0.5));
      return vec4f(positions[index] * params.scale, 0.0, 1.0);
    }
    @fragment fn fragmentMain() -> @location(0) vec4f {
      return vec4f(params.color, 1.0);
    }`,
});
const pipeline = device.createRenderPipeline({
  label: 'triángulo con parámetros', layout: 'auto',
  vertex: { module }, fragment: { module, targets: [{ format: views[0].format }] },
});
const uniformBuffer = (label, size) => device.createBuffer({ label, size, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
const bindGroupFor = (buffer) => device.createBindGroup({
  label: buffer.label, layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer } }],
});
const color = [225 / 255, 29 / 255, 72 / 255]; // #e11d48

// 🐛 1. El búfer del tamaño de un Float32Array de 4 (escala + color): 16 bytes
const small = uniformBuffer('parámetros de 16 bytes', 16);
log(`🐛 búfer de 16 bytes → ${await validationError(device, () => bindGroupFor(small))}`);

// 🐛 2. 32 bytes, pero sin el hueco: el color cae en los bytes 4-15 y el shader lo lee del 16
const packed = uniformBuffer('parámetros sin hueco', 32);
device.queue.writeBuffer(packed, 0, new Float32Array([0.8, ...color]));
// ✅ 3. Siguiendo el mapa: la escala en el byte 0, el color en el 16 (posición 4 del Float32Array)
const padded = uniformBuffer('parámetros con hueco', 32);
device.queue.writeBuffer(padded, 0, new Float32Array([0.8, 0, 0, 0, ...color, 0]));

function draw({ context }, buffer) {
  const texture = context.getCurrentTexture();
  const encoder = device.createCommandEncoder({ label: buffer.label });
  const pass = encoder.beginRenderPass({
    colorAttachments: [{ view: texture.createView(), clearValue: clearColor(15, 23, 42), loadOp: 'clear', storeOp: 'store' }],
  });
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroupFor(buffer));
  pass.draw(3);
  pass.end();
  device.queue.submit([encoder.finish()]);
  return readPixels(device, texture, [[Math.floor(texture.width / 2), Math.floor(texture.height / 2)]]);
}
const [[packedCenter], [paddedCenter]] = await Promise.all([draw(views[0], packed), draw(views[1], padded)]);
log(`🐛 32 bytes sin hueco → centro: ${packedCenter.join(', ')} (el color leyó ceros)`);
log(`✅ 32 bytes con hueco → centro: ${paddedCenter.join(', ')}`);
```

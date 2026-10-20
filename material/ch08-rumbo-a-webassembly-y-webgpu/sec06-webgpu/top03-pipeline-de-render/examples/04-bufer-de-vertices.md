---
example_description: "Los vértices desde un búfer: un Float32Array con posición y color intercalados (5 floats, 20 bytes por vértice) en un búfer VERTEX, descrito en el pipeline con arrayStride, offset, format: 'float32x2'/'float32x3' y shaderLocation, y conectado con setVertexBuffer. El color llega interpolado al fragment shader: en el centro, mitad azul y mitad rojo"
example_tags: "javascript|webgpu|vertex-buffer|arraystride|attributes|interpolacion|setvertexbuffer"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Vértices desde un búfer</h1>
  <canvas id="stage" role="img" aria-label="Un cuadrado con un degradado de azul a la izquierda a rojo a la derecha"></canvas>
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
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Usa assets/webgpu/utils.js (léelo con «Assets»).
import { getDevice, setupCanvas, readPixels, clearColor } from './webgpu/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const { device } = await getDevice({ label: 'vértices' });
const { context, format } = setupCanvas(document.querySelector('#stage'), device);

// x, y, r, g, b por vértice: un cuadrado (2 triángulos, 6 vértices), azul a la izquierda, rojo a la derecha
const vertices = new Float32Array([
  -0.8, -0.8, 0, 0, 1,
  0.8, -0.8, 1, 0, 0,
  -0.8, 0.8, 0, 0, 1,
  -0.8, 0.8, 0, 0, 1,
  0.8, -0.8, 1, 0, 0,
  0.8, 0.8, 1, 0, 0,
]);
const vertexBuffer = device.createBuffer({
  label: 'vértices', size: vertices.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(vertexBuffer, 0, vertices);

const module = device.createShaderModule({
  label: 'degradado',
  code: /* wgsl */ `
    struct VertexOutput {
      @builtin(position) position: vec4f,
      @location(0) color: vec3f, // de un shader al otro: llega INTERPOLADO
    }
    @vertex
    fn vertexMain(@location(0) position: vec2f, @location(1) color: vec3f) -> VertexOutput {
      var output: VertexOutput;
      output.position = vec4f(position, 0.0, 1.0);
      output.color = color;
      return output;
    }
    @fragment
    fn fragmentMain(vertexOut: VertexOutput) -> @location(0) vec4f {
      return vec4f(vertexOut.color, 1.0);
    }`,
});
const pipeline = device.createRenderPipeline({
  label: 'degradado',
  layout: 'auto',
  vertex: {
    module,
    buffers: [{
      arrayStride: 5 * 4, // BYTES de un vértice al siguiente
      attributes: [
        { shaderLocation: 0, offset: 0, format: 'float32x2' },     // x, y → @location(0)
        { shaderLocation: 1, offset: 2 * 4, format: 'float32x3' }, // r, g, b → @location(1)
      ],
    }],
  },
  fragment: { module, targets: [{ format }] },
});

const texture = context.getCurrentTexture();
const encoder = device.createCommandEncoder({ label: 'degradado' });
const pass = encoder.beginRenderPass({
  colorAttachments: [{ view: texture.createView(), clearValue: clearColor(15, 23, 42), loadOp: 'clear', storeOp: 'store' }],
});
pass.setPipeline(pipeline);
pass.setVertexBuffer(0, vertexBuffer); // el búfer 0 de la lista «buffers» del pipeline
pass.draw(6);
pass.end();
device.queue.submit([encoder.finish()]);

const [center, corner] = await readPixels(device, texture, [[Math.floor(texture.width / 2), Math.floor(texture.height / 2)], [0, 0]]);
log(`un vértice → ${5 * 4} bytes (arrayStride) · el color empieza en el byte ${2 * 4} (offset)`);
log(`búfer de vértices → ${vertexBuffer.size} bytes`);
log(`centro → ${center.join(', ')}`);
log(`esquina de arriba a la izquierda → ${corner.join(', ')}`);
```

---
example_description: "La transparencia se configura en el pipeline: targets: [{ format, blend }]. El mismo cuadrado ámbar al 60 % (premultiplicado), en dos mitades del lienzo con setViewport: sin blend sustituye al fondo (147, 95, 7, 153: el color premultiplicado, a pelo); con blend { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' } se mezcla con él (153, 104, 23, 255), los mismos números que en WebGL"
example_tags: "javascript|webgpu|blending|transparencia|premultiplicado|render-pipeline|setviewport"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Ámbar al 60 % sobre azul noche</h1>
  <canvas id="stage" role="img" aria-label="Dos cuadrados ámbar: el de la izquierda, oscuro y opaco; el de la derecha, mezclado con el fondo"></canvas>
  <p class="labels"><span>sin blend</span><span>con blend</span></p>
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
  height: 120px;
  outline: 1px solid #334155;
}
.labels {
  display: flex;
  width: 240px;
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
}
.labels span {
  flex: 1;
  text-align: center;
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

const { device } = await getDevice({ label: 'mezcla' });
const { context, format } = setupCanvas(document.querySelector('#stage'), device);
const module = device.createShaderModule({
  label: 'cuadrado ámbar',
  code: /* wgsl */ `
    @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
      var quad = array<vec2f, 6>(vec2f(-0.6, -0.6), vec2f(0.6, -0.6), vec2f(-0.6, 0.6),
                                 vec2f(-0.6, 0.6), vec2f(0.6, -0.6), vec2f(0.6, 0.6));
      return vec4f(quad[index], 0.0, 1.0);
    }
    @fragment fn fragmentMain() -> @location(0) vec4f {
      let amber = vec3f(245.0, 158.0, 11.0) / 255.0; // #f59e0b
      let alpha = 0.6;
      return vec4f(amber * alpha, alpha); // PREmultiplicado: el color ya va multiplicado por su alfa
    }`,
});
// La mezcla es parte del pipeline: resultado = nuevo × srcFactor + lo que había × dstFactor
const premultipliedOver = { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' };
const pipelineFor = (blend) => device.createRenderPipeline({
  label: blend ? 'con mezcla' : 'sin mezcla',
  layout: 'auto',
  vertex: { module },
  fragment: { module, targets: [blend ? { format, blend } : { format }] },
});
const opaque = pipelineFor(null);
const blended = pipelineFor({ color: premultipliedOver, alpha: premultipliedOver });

const texture = context.getCurrentTexture();
const half = texture.width / 2;
const encoder = device.createCommandEncoder({ label: 'mezcla' });
const pass = encoder.beginRenderPass({
  colorAttachments: [{ view: texture.createView(), clearValue: clearColor(15, 23, 42), loadOp: 'clear', storeOp: 'store' }],
});
pass.setViewport(0, 0, half, texture.height, 0, 1); // mitad izquierda
pass.setPipeline(opaque);
pass.draw(6);
pass.setViewport(half, 0, half, texture.height, 0, 1); // mitad derecha
pass.setPipeline(blended);
pass.draw(6);
pass.end();
device.queue.submit([encoder.finish()]);

const y = Math.floor(texture.height / 2);
const [left, right] = await readPixels(device, texture, [[Math.floor(half / 2), y], [Math.floor(half * 1.5), y]]);
log(`sin blend → ${left.join(', ')}`);
log(`con blend → ${right.join(', ')}`);
// 147 = 245 × 0,6 · con blend: 245 × 0,6 + 15 × 0,4 = 153, y el alfa: 0,6 + 1 × 0,4 = 1 → 255
```

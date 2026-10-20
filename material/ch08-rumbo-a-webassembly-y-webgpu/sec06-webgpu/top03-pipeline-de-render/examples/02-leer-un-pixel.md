---
example_description: "Leer un píxel del lienzo de WebGPU: configure() con usage COPY_SRC y copyTextureToBuffer en el mismo encargo que el dibujo. Dos trampas: bytesPerRow tiene que ser múltiplo de 256 (y el error se contagia al submit: lee el primero), y el lienzo es bgra8unorm, así que #e11d48 llega como 72, 29, 225, 255: hay que dar la vuelta a los bytes"
example_tags: "javascript|webgpu|copytexturetobuffer|bgra8unorm|bytesperrow|pixeles|canvas|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>¿De qué color es el centro?</h1>
  <canvas id="stage" role="img" aria-label="Un triángulo rojo frambuesa sobre fondo azul noche"></canvas>
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
// Usa assets/webgpu/utils.js (léelo con «Assets»): getDevice y firstLine, de la lección 1.
import { getDevice, firstLine } from './webgpu/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const { device } = await getDevice({ label: 'leer un píxel' });
const canvas = document.querySelector('#stage');
const context = canvas.getContext('webgpu');
canvas.width = Math.round(canvas.clientWidth * devicePixelRatio);
canvas.height = Math.round(canvas.clientHeight * devicePixelRatio);
const format = navigator.gpu.getPreferredCanvasFormat();
// COPY_SRC: sin él, la textura del lienzo no puede ser el origen de una copia
context.configure({ device, format, alphaMode: 'opaque', usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });

const module = device.createShaderModule({
  label: 'triángulo',
  code: /* wgsl */ `
    @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
      var positions = array<vec2f, 3>(vec2f(0.0, 0.75), vec2f(-0.75, -0.5), vec2f(0.75, -0.5));
      return vec4f(positions[index], 0.0, 1.0);
    }
    @fragment fn fragmentMain() -> @location(0) vec4f {
      return vec4f(0.882, 0.114, 0.282, 1.0); // #e11d48 = 225, 29, 72
    }`,
});
const pipeline = device.createRenderPipeline({
  label: 'triángulo', layout: 'auto',
  vertex: { module }, fragment: { module, targets: [{ format }] },
});

const texture = context.getCurrentTexture();
const origin = { x: Math.floor(texture.width / 2), y: Math.floor(texture.height / 2) }; // y desde ARRIBA
const pixel = device.createBuffer({ label: 'un píxel', size: 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });

// 🐛 Una copia con bytesPerRow 400: dos errores en cadena. El que importa es el PRIMERO.
const careless = device.createCommandEncoder();
careless.copyTextureToBuffer({ texture, origin }, { buffer: pixel, bytesPerRow: 400 }, { width: 1, height: 1 });
device.pushErrorScope('validation');
const carelessCommands = careless.finish(); // el codificador avisa al cerrarse
const finishError = device.popErrorScope();
device.pushErrorScope('validation');
device.queue.submit([carelessCommands]); // y el envío, por usar algo inválido
const submitError = device.popErrorScope();

// ✅ Dibujar y copiar en el MISMO encargo (la textura del lienzo caduca al mostrarse)
const encoder = device.createCommandEncoder({ label: 'dibujar y leer' });
const pass = encoder.beginRenderPass({
  colorAttachments: [{ view: texture.createView(), clearValue: [15 / 255, 23 / 255, 42 / 255, 1], loadOp: 'clear', storeOp: 'store' }],
});
pass.setPipeline(pipeline);
pass.draw(3);
pass.end();
encoder.copyTextureToBuffer({ texture, origin }, { buffer: pixel, bytesPerRow: 256 }, { width: 1, height: 1 });
device.queue.submit([encoder.finish()]);

log(`🐛 bytesPerRow 400, 1.er error → ${firstLine((await finishError).message)}`);
log(`   2.º error → ${firstLine((await submitError).message)}`);
await pixel.mapAsync(GPUMapMode.READ);
const bytes = [...new Uint8Array(pixel.getMappedRange())];
pixel.unmap();
log(`🐛 los 4 bytes, tal cual → ${bytes.join(', ')} · ¿es 225, 29, 72? ${bytes[0] === 225}`);
// ✅ En bgra8unorm los bytes van azul, verde, rojo, alfa: se ordenan antes de interpretarlos
const [b, g, r, a] = bytes;
const rgba = format === 'bgra8unorm' ? [r, g, b, a] : bytes;
log(`✅ en orden RGBA (${format}) → ${rgba.join(', ')}`);
```

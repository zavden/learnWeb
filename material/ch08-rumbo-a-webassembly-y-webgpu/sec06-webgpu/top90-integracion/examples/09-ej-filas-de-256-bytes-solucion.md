---
example_description: "Solución: BYTES_PER_ROW = 256 (cada fila de la copia ocupa 256 bytes aunque tenga un solo píxel) y la fila «row» empieza en el byte row × 256. La copia ya no da error y las cuatro comprobaciones salen ✅"
example_tags: "javascript|webgpu|copytexturetobuffer|bytesperrow|alineacion|pixeles|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>La bandera del festival, fila a fila</h1>
  <canvas id="stage" role="img" aria-label="Una bandera de tres franjas horizontales: verde azulado, blanco y frambuesa"></canvas>
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
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Usa assets/webgpu/utils.js (léelo con «Assets»). Lección «El pipeline de render»: leer píxeles.
import { getDevice, setupCanvas, validationError } from './webgpu/utils.js';

const { device } = await getDevice({ label: 'bandera' });
const { context, format } = setupCanvas(document.querySelector('#stage'), device);
const module = device.createShaderModule({
  label: 'bandera',
  code: /* wgsl */ `
    @group(0) @binding(0) var<uniform> canvasHeight: f32;
    @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
      var corners = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
      return vec4f(corners[index], 0.0, 1.0);
    }
    @fragment fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
      var bands = array<vec3f, 3>(vec3f(13.0, 148.0, 136.0), vec3f(248.0, 250.0, 252.0), vec3f(225.0, 29.0, 72.0));
      let band = min(u32(position.y / (canvasHeight / 3.0)), 2u); // y = 0 arriba: la primera franja
      return vec4f(bands[band] / 255.0, 1.0);
    }`,
});
const pipeline = device.createRenderPipeline({
  label: 'bandera', layout: 'auto', vertex: { module }, fragment: { module, targets: [{ format }] },
});
const texture = context.getCurrentTexture();
const heightBuffer = device.createBuffer({ label: 'alto del lienzo', size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
device.queue.writeBuffer(heightBuffer, 0, new Float32Array([texture.height]));
const bindGroup = device.createBindGroup({
  label: 'alto', layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: heightBuffer } }],
});

// Copiar la columna x = 10 entera (1 píxel de ancho, todas las filas) a un búfer
const BYTES_PER_ROW = 256; // ✅ un múltiplo de 256, aunque la fila tenga 4 bytes útiles
const column = device.createBuffer({
  label: 'columna', size: BYTES_PER_ROW * (texture.height - 1) + 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
});
const encoder = device.createCommandEncoder({ label: 'dibujar y copiar' });
const pass = encoder.beginRenderPass({
  colorAttachments: [{ view: texture.createView(), clearValue: [0, 0, 0, 1], loadOp: 'clear', storeOp: 'store' }],
});
pass.setPipeline(pipeline);
pass.setBindGroup(0, bindGroup);
pass.draw(3);
pass.end();
encoder.copyTextureToBuffer(
  { texture, origin: { x: 10, y: 0 } },
  { buffer: column, bytesPerRow: BYTES_PER_ROW },
  { width: 1, height: texture.height },
);
const copyError = await validationError(device, () => device.queue.submit([encoder.finish()]));
await column.mapAsync(GPUMapMode.READ);
const bytes = new Uint8Array(column.getMappedRange().slice(0));
column.unmap();
// El píxel de la fila «row»: 4 bytes. ¿En qué posición del búfer empieza cada fila?
function pixelOfRow(row) {
  const start = row * BYTES_PER_ROW; // ✅ cada fila, 256 bytes después de la anterior
  const [b0, b1, b2, b3] = bytes.subarray(start, start + 4);
  return (format === 'bgra8unorm' ? [b2, b1, b0, b3] : [b0, b1, b2, b3]).join(', '); // el lienzo puede ser BGRA
}

// ── Comprobaciones (no hace falta tocarlas) ───────────────────────────────────────────
const logList = document.querySelector('#log');
function check(description, actual, expected) {
  const ok = actual === expected;
  if (ok) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', expected, 'y obtuve', actual);
  logList.append(Object.assign(document.createElement('li'), { textContent: `${ok ? '✅' : '❌'} ${description}` }));
}
const rows = [1, 3, 5].map((sixths) => Math.floor((texture.height * sixths) / 6)); // el centro de cada franja
check('la copia, sin error de validación', copyError, null);
check(`fila ${rows[0]}: la franja de arriba, verde azulado`, pixelOfRow(rows[0]), '13, 148, 136, 255');
check(`fila ${rows[1]}: la franja del medio, blanco`, pixelOfRow(rows[1]), '248, 250, 252, 255');
check(`fila ${rows[2]}: la franja de abajo, frambuesa`, pixelOfRow(rows[2]), '225, 29, 72, 255');
```

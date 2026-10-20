---
example_description: "Una imagen como textura: createImageBitmap de un <img> con crossOrigin, una textura rgba8unorm, copyExternalImageToTexture para subirla, un sampler con filtro «nearest» y textureSample en el fragment shader. En WebGPU la fila 0 de una textura es la de ARRIBA, como en la imagen: no hay que voltear nada. Los colores del PNG llegan exactos"
example_tags: "javascript|webgpu|texturas|sampler|copyexternalimagetotexture|imagebitmap|crossorigin|texturesample"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Una imagen en una textura</h1>
  <canvas id="stage" role="img" aria-label="Una escena de 16 por 12 píxeles ampliada: cielo, sol, una casa y hierba"></canvas>
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
  height: 180px;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Usa assets/webgpu/utils.js (léelo con «Assets») y la imagen assets/scene.png, de 16 × 12
// píxeles: cielo arriba (filas 0-7), sol, una casa y hierba abajo (filas 8-11). Sin perfil de color.
import { getDevice, setupCanvas, readPixels } from './webgpu/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// La imagen: crossOrigin ANTES de src (en las tarjetas es de otro origen, y una imagen
// «contaminada» no se puede subir a la GPU), y un ImageBitmap ya decodificado
const img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'scene.png';
await img.decode();
const bitmap = await createImageBitmap(img);

const { device } = await getDevice({ label: 'textura' });
const { context, format } = setupCanvas(document.querySelector('#stage'), device);

// La textura: tamaño, formato y usos (para copiar una imagen hacen falta COPY_DST y RENDER_ATTACHMENT)
const sceneTexture = device.createTexture({
  label: 'escena',
  size: [bitmap.width, bitmap.height],
  format: 'rgba8unorm',
  usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
});
device.queue.copyExternalImageToTexture({ source: bitmap }, { texture: sceneTexture }, [bitmap.width, bitmap.height]);
// El sampler: CÓMO se lee (filtro, repetición). En WebGPU es un objeto aparte de la textura.
const sampler = device.createSampler({ label: 'píxeles nítidos', magFilter: 'nearest', minFilter: 'nearest' });

const module = device.createShaderModule({
  label: 'imagen',
  code: /* wgsl */ `
    struct VertexOutput {
      @builtin(position) position: vec4f,
      @location(0) uv: vec2f,
    }
    @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> VertexOutput {
      var corners = array<vec2f, 6>(vec2f(-1, -1), vec2f(1, -1), vec2f(-1, 1), vec2f(-1, 1), vec2f(1, -1), vec2f(1, 1));
      let p = corners[index];
      var output: VertexOutput;
      output.position = vec4f(p, 0.0, 1.0);
      output.uv = vec2f(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5); // v = 0 ARRIBA, como la fila 0 de la imagen
      return output;
    }
    @group(0) @binding(0) var pixelSampler: sampler;
    @group(0) @binding(1) var scene: texture_2d<f32>;
    @fragment fn fragmentMain(vertexOut: VertexOutput) -> @location(0) vec4f {
      return textureSample(scene, pixelSampler, vertexOut.uv);
    }`,
});
const pipeline = device.createRenderPipeline({
  label: 'imagen', layout: 'auto', vertex: { module }, fragment: { module, targets: [{ format }] },
});
const bindGroup = device.createBindGroup({
  label: 'escena',
  layout: pipeline.getBindGroupLayout(0),
  entries: [
    { binding: 0, resource: sampler },
    { binding: 1, resource: sceneTexture.createView() },
  ],
});

const texture = context.getCurrentTexture();
const encoder = device.createCommandEncoder({ label: 'imagen' });
const pass = encoder.beginRenderPass({
  colorAttachments: [{ view: texture.createView(), clearValue: [0, 0, 0, 1], loadOp: 'clear', storeOp: 'store' }],
});
pass.setPipeline(pipeline);
pass.setBindGroup(0, bindGroup);
pass.draw(6);
pass.end();
device.queue.submit([encoder.finish()]);

// El centro de un píxel de la imagen (columna, fila) en el lienzo: cada uno ocupa varios
const at = (column, row) => [Math.floor(((column + 0.5) * texture.width) / bitmap.width), Math.floor(((row + 0.5) * texture.height) / bitmap.height)];
const [sky, sun, grass] = await readPixels(device, texture, [at(1, 1), at(12, 2), at(14, 10)]);
log(`imagen → ${bitmap.width} × ${bitmap.height} · textura ${sceneTexture.format}`);
log(`arriba a la izquierda (cielo) → ${sky.join(', ')}`);
log(`el sol → ${sun.join(', ')}`);
log(`abajo a la derecha (hierba) → ${grass.join(', ')}`);
```

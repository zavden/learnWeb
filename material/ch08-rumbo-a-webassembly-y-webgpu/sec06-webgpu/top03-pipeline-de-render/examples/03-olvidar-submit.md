---
example_description: "Grabar un dibujo no es dibujarlo: los dos lienzos tienen el mismo pipeline y la misma pasada, pero el de la izquierda se queda sin queue.submit() y no muestra nada (su textura sigue a cero, 0, 0, 0, 0). Ningún error lo avisa: el encargo grabado, sencillamente, nunca llegó a la GPU"
example_tags: "javascript|webgpu|submit|command-encoder|render-pass|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>¿Y el submit?</h1>
  <div class="pair">
    <figure>
      <canvas id="forgotten" role="img" aria-label="Un lienzo vacío: el dibujo no se envió"></canvas>
      <figcaption>🐛 sin submit</figcaption>
    </figure>
    <figure>
      <canvas id="sent" role="img" aria-label="Un triángulo rojo frambuesa sobre fondo azul noche"></canvas>
      <figcaption>✅ con submit</figcaption>
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
import { getDevice, setupCanvas, readPixels } from './webgpu/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const { device } = await getDevice({ label: 'enviar' });
// Un dispositivo para dos lienzos: cada uno con su contexto, el mismo formato
const forgotten = setupCanvas(document.querySelector('#forgotten'), device);
const sent = setupCanvas(document.querySelector('#sent'), device);
const module = device.createShaderModule({
  label: 'triángulo',
  code: /* wgsl */ `
    @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
      var positions = array<vec2f, 3>(vec2f(0.0, 0.75), vec2f(-0.75, -0.5), vec2f(0.75, -0.5));
      return vec4f(positions[index], 0.0, 1.0);
    }
    @fragment fn fragmentMain() -> @location(0) vec4f {
      return vec4f(0.882, 0.114, 0.282, 1.0);
    }`,
});
const pipeline = device.createRenderPipeline({
  label: 'triángulo', layout: 'auto',
  vertex: { module }, fragment: { module, targets: [{ format: sent.format }] },
});

// Graba el dibujo en un codificador y devuelve lo grabado, SIN enviarlo
function recordTriangle(texture) {
  const encoder = device.createCommandEncoder({ label: 'triángulo' });
  const pass = encoder.beginRenderPass({
    colorAttachments: [{ view: texture.createView(), clearValue: [15 / 255, 23 / 255, 42 / 255, 1], loadOp: 'clear', storeOp: 'store' }],
  });
  pass.setPipeline(pipeline);
  pass.draw(3);
  pass.end();
  return encoder.finish();
}

const leftTexture = forgotten.context.getCurrentTexture();
recordTriangle(leftTexture); // 🐛 grabado… y olvidado: falta device.queue.submit([…])
const rightTexture = sent.context.getCurrentTexture();
device.queue.submit([recordTriangle(rightTexture)]); // ✅

// Leer el centro de los dos, en esta misma tarea (las texturas del lienzo caducan al mostrarse)
const center = [Math.floor(leftTexture.width / 2), Math.floor(leftTexture.height / 2)];
const [[left], [right]] = await Promise.all([
  readPixels(device, leftTexture, [center]),
  readPixels(device, rightTexture, [center]),
]);
log(`🐛 sin submit → centro: ${left.join(', ')} (la textura, sin tocar)`);
log(`✅ con submit → centro: ${right.join(', ')}`);
```

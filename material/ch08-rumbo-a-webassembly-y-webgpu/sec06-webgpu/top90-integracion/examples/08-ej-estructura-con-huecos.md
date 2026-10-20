---
example_description: "Ejercicio: la insignia del club debería salir verde azulado, arriba a la derecha, pero sale en otro sitio y de otro color: el Float32Array de sus uniforms va sin huecos, y struct Badge { scale: f32, offset: vec2f, color: vec3f } los tiene. Calcula en qué byte empieza cada campo y deja los huecos; las comprobaciones leen tres píxeles"
example_tags: "javascript|webgpu|uniform|struct|alineacion|vec2f|vec3f|padding|ejercicio"
exercise: true
exercise_title: "Una estructura con huecos"
exercise_instructions: "Ejecuta el ejemplo: la insignia sale descolocada y de un color raro || Calcula el byte en que empieza cada campo de Badge: scale (f32), offset (vec2f, se alinea a 8) y color (vec3f, se alinea a 16) || Escribe el Float32Array con ceros en los huecos: 8 números, 32 bytes || Ejecuta hasta que las cuatro comprobaciones salgan ✅"
exercise_hints: "scale ocupa los bytes 0-3; offset no puede empezar en el 4 || offset empieza en el byte 8 (posición 2 del Float32Array) y color en el 16 (posición 4) || Lección «Búferes y compute», sección «Estructuras en un búfer»"
exercise_solution_example: 08-ej-estructura-con-huecos-solucion.md
exercise_locked_files: index.html,styles.css
example_stage: exercise
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>La insignia del club de ajedrez</h1>
  <canvas id="stage" role="img" aria-label="Una insignia cuadrada verde azulado, arriba a la derecha del lienzo"></canvas>
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
// Usa assets/webgpu/utils.js (léelo con «Assets»). Lecciones «Búferes y compute» (estructuras en un
// búfer) y «El pipeline de render» (uniforms).
import { getDevice, setupCanvas, readPixels, clearColor } from './webgpu/utils.js';

const { device } = await getDevice({ label: 'insignia' });
const { context, format } = setupCanvas(document.querySelector('#stage'), device);
const module = device.createShaderModule({
  label: 'insignia',
  code: /* wgsl */ `
    struct Badge {
      scale: f32,
      offset: vec2f,
      color: vec3f,
    }
    @group(0) @binding(0) var<uniform> badge: Badge;
    @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
      var quad = array<vec2f, 6>(vec2f(-1, -1), vec2f(1, -1), vec2f(-1, 1), vec2f(-1, 1), vec2f(1, -1), vec2f(1, 1));
      return vec4f(quad[index] * badge.scale + badge.offset, 0.0, 1.0);
    }
    @fragment fn fragmentMain() -> @location(0) vec4f {
      return vec4f(badge.color, 1.0);
    }`,
});
const pipeline = device.createRenderPipeline({
  label: 'insignia', layout: 'auto', vertex: { module }, fragment: { module, targets: [{ format }] },
});

// La insignia: escala 0.4, centrada en (0.5, 0.3) y de color #0d9488 (13, 148, 136)
// TODO: struct Badge { scale: f32, offset: vec2f, color: vec3f }. ¿En qué byte empieza cada campo?
// Así, sin huecos, el shader lee offset y color de los bytes equivocados.
const badge = new Float32Array([0.4, 0.5, 0.3, 13 / 255, 148 / 255, 136 / 255]);
const badgeBuffer = device.createBuffer({ label: 'insignia', size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
device.queue.writeBuffer(badgeBuffer, 0, badge);
const bindGroup = device.createBindGroup({
  label: 'insignia', layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: badgeBuffer } }],
});

const texture = context.getCurrentTexture();
const encoder = device.createCommandEncoder({ label: 'insignia' });
const pass = encoder.beginRenderPass({
  colorAttachments: [{ view: texture.createView(), clearValue: clearColor(15, 23, 42), loadOp: 'clear', storeOp: 'store' }],
});
pass.setPipeline(pipeline);
pass.setBindGroup(0, bindGroup);
pass.draw(6);
pass.end();
device.queue.submit([encoder.finish()]);

// De coordenadas de recorte (x, y) a un píxel de la textura (y = 0 es la fila de ARRIBA)
const pixelAt = (x, y) => [Math.floor(((x + 1) / 2) * texture.width), Math.floor(((1 - y) / 2) * texture.height)];
const [inside, outside, corner] = (await readPixels(device, texture, [pixelAt(0.5, 0.3), pixelAt(-0.05, 0), pixelAt(-0.95, -0.95)])).map((rgba) => rgba.join(', '));

// ── Comprobaciones (no hace falta tocarlas) ───────────────────────────────────────────
const logList = document.querySelector('#log');
function check(description, actual, expected) {
  const ok = actual === expected;
  if (ok) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', expected, 'y obtuve', actual);
  logList.append(Object.assign(document.createElement('li'), { textContent: `${ok ? '✅' : '❌'} ${description}` }));
}
check('el Float32Array tiene 8 números (32 bytes, como la estructura)', badge.length, 8);
check('la insignia está en (0.5, 0.3) y es verde azulado', inside, '13, 148, 136, 255');
check('en (-0.05, 0), fuera de la insignia, se ve el fondo', outside, '15, 23, 42, 255');
check('la esquina de abajo a la izquierda sigue siendo fondo', corner, '15, 23, 42, 255');
```

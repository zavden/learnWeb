---
example_description: "Un gráfico de barras con UN draw: un rectángulo de 6 vértices (sacados del propio shader) repetido 12 veces con draw(6, 12). Cada barra lee su altura y si va resaltada de un búfer de instancias (stepMode: 'instance', 8 bytes por barra) y su posición de @builtin(instance_index). Las visitas mensuales de un museo, con la tabla de datos al lado"
example_tags: "javascript|webgpu|instancias|instance-index|stepmode|vertex-buffer|grafico-de-barras|visualizacion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Visitas al museo, 2025 (miles)</h1>
  <canvas id="chart" role="img" aria-label="Gráfico de barras de las visitas mensuales; agosto, resaltada en ámbar, es la más alta con 95 000"></canvas>
  <details>
    <summary>Datos</summary>
    <table id="data">
      <thead><tr><th scope="col">Mes</th><th scope="col">Visitas (miles)</th></tr></thead>
      <tbody></tbody>
    </table>
  </details>
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
details {
  margin-top: 0.5rem;
  font-size: 0.85rem;
}
summary:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
table {
  border-collapse: collapse;
}
th,
td {
  padding: 0.1rem 0.6rem;
  text-align: end;
  border-bottom: 1px solid #334155;
}
th:first-child,
td:first-child {
  text-align: start;
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

const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const visits = [42, 38, 51, 57, 63, 71, 88, 95, 66, 54, 47, 59];
document.querySelector('#data tbody').append(...months.map((month, i) => {
  const row = document.createElement('tr');
  row.append(Object.assign(document.createElement('td'), { textContent: month }), Object.assign(document.createElement('td'), { textContent: visits[i] }));
  return row;
}));

// Por barra (instancia): altura de 0 a 1 y 1 si va resaltada. 2 floats = 8 bytes por barra.
const tallest = Math.max(...visits);
const instances = new Float32Array(visits.flatMap((value) => [value / tallest, value === tallest ? 1 : 0]));

const { device } = await getDevice({ label: 'barras' });
const { context, format } = setupCanvas(document.querySelector('#chart'), device);
const instanceBuffer = device.createBuffer({
  label: 'barras', size: instances.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(instanceBuffer, 0, instances);

const module = device.createShaderModule({
  label: 'barras',
  code: /* wgsl */ `
    struct VertexOutput {
      @builtin(position) position: vec4f,
      @location(0) color: vec3f,
    }
    const BARS = ${visits.length}.0;

    @vertex
    fn vertexMain(@builtin(vertex_index) corner: u32, @builtin(instance_index) bar: u32,
                  @location(0) height: f32, @location(1) highlight: f32) -> VertexOutput {
      // Las 6 esquinas de un rectángulo de 0 a 1 (dos triángulos): las mismas para todas las barras
      var quad = array<vec2f, 6>(vec2f(0, 0), vec2f(1, 0), vec2f(0, 1), vec2f(0, 1), vec2f(1, 0), vec2f(1, 1));
      let q = quad[corner];
      let slot = 2.0 / BARS;                                // cada barra tiene su hueco de ancho
      let x = -1.0 + (f32(bar) + 0.15 + q.x * 0.7) * slot; // la barra: el 70 % central del hueco
      let y = -1.0 + q.y * height * 2.0;                    // de abajo (-1) hasta su altura
      var output: VertexOutput;
      output.position = vec4f(x, y, 0.0, 1.0);
      let gray = vec3f(148.0, 163.0, 184.0) / 255.0;        // #94a3b8
      let amber = vec3f(245.0, 158.0, 11.0) / 255.0;        // #f59e0b
      output.color = mix(gray, amber, highlight);
      return output;
    }
    @fragment fn fragmentMain(vertexOut: VertexOutput) -> @location(0) vec4f {
      return vec4f(vertexOut.color, 1.0);
    }`,
});
const pipeline = device.createRenderPipeline({
  label: 'barras',
  layout: 'auto',
  vertex: {
    module,
    buffers: [{
      arrayStride: 2 * 4,
      stepMode: 'instance', // avanza una vez por BARRA, no una vez por vértice
      attributes: [
        { shaderLocation: 0, offset: 0, format: 'float32' }, // altura
        { shaderLocation: 1, offset: 4, format: 'float32' }, // ¿resaltada?
      ],
    }],
  },
  fragment: { module, targets: [{ format }] },
});

const texture = context.getCurrentTexture();
const encoder = device.createCommandEncoder({ label: 'barras' });
const pass = encoder.beginRenderPass({
  colorAttachments: [{ view: texture.createView(), clearValue: clearColor(15, 23, 42), loadOp: 'clear', storeOp: 'store' }],
});
pass.setPipeline(pipeline);
pass.setVertexBuffer(0, instanceBuffer);
pass.draw(6, visits.length); // 6 vértices × 12 instancias, en un solo encargo
pass.end();
device.queue.submit([encoder.finish()]);

// Comprobar: el centro de cada hueco es (barra + 0,5) × ancho del hueco; y = 0 es la fila de ARRIBA
const slotWidth = texture.width / visits.length;
const xOf = (bar) => Math.floor((bar + 0.5) * slotWidth);
const [august, februaryInside, februaryAbove] = await readPixels(device, texture, [
  [xOf(7), Math.floor(texture.height / 2)],
  [xOf(1), texture.height - 4],
  [xOf(1), 4],
]);
log(`${visits.length} barras → draw(6, ${visits.length}): 6 vértices × ${visits.length} instancias`);
log(`búfer de instancias → ${instanceBuffer.size} bytes (8 por barra)`);
log(`agosto, la más alta, por dentro → ${august.join(', ')}`);
log(`febrero, por dentro → ${februaryInside.join(', ')}`);
log(`febrero, por encima → ${februaryAbove.join(', ')}`);
```

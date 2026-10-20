---
example_description: "El panel de un almacén con 1200 sensores de temperatura y humedad: un solo draw(6, 1200) con instancias (20 bytes por sensor en un búfer de vértices con stepMode «instance»), círculos con función de distancia y borde suavizado, color por temperatura y tamaño por humedad. Las zonas se filtran con casillas (una máscara de bits en un uniform), el puntero dice qué sensor hay debajo, y las cinco peores alertas son botones que lo señalan. Una autocomprobación lee el centro de un sensor en la GPU"
example_tags: "javascript|webgpu|instancias|visualizacion-de-datos|sdf|blending|mascara-de-bits|formularios|accesibilidad|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="panel">
  <h1>Almacén central: sensores</h1>
  <canvas id="stage" role="img" aria-label="Plano del almacén con 1200 sensores; el color va del azul (frío) al rosa (calor) y el tamaño, con la humedad" aria-describedby="hover"></canvas>
  <p id="hover" class="hover" aria-live="polite">Pasa el puntero por un sensor para ver sus datos.</p>
  <fieldset id="zones" class="zones">
    <legend>Zonas</legend>
    <label><input type="checkbox" value="0" checked> Cámara fría (A)</label>
    <label><input type="checkbox" value="1" checked> Almacén seco (B)</label>
    <label><input type="checkbox" value="2" checked> Muelle de carga (C)</label>
  </fieldset>
  <section aria-labelledby="alerts-title">
    <h2 id="alerts-title">Las cinco peores alertas</h2>
    <ol id="alerts" class="alerts"></ol>
  </section>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root {
  color-scheme: dark;
  --text: #e2e8f0;
  --muted: #94a3b8;
  --surface: #0f172a;
  --line: #334155;
  --focus: #60a5fa;
  --alert: #fda4af;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--text);
  background: var(--surface);
}
.panel {
  max-width: 36rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin-top: 0;
}
h2 {
  font-size: 1rem;
  margin: 0.75rem 0 0.25rem;
}
canvas {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 6px;
}
.hover {
  min-height: 1.4em;
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
}
.zones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  border: 1px solid var(--line);
  border-radius: 6px;
}
.alerts {
  padding-left: 1.4rem;
  margin: 0;
}
.alerts button {
  font: inherit;
  margin: 0.15rem 0;
  padding: 0.2rem 0.5rem;
  color: var(--alert);
  background: none;
  border: 1px solid var(--line);
  border-radius: 4px;
  cursor: pointer;
}
input:focus-visible,
button:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.78rem;
}
```

# JavaScript

```javascript
// Usa assets/gpu/kit.js (léelo con «Assets»).
//
// Decisiones de diseño:
//   · Un sensor = una instancia: posición, temperatura, humedad y zona (20 bytes) en un búfer de
//     vértices con stepMode: 'instance'. Las 6 esquinas del cuadrado salen del vertex_index.
//   · El círculo es una función de distancia en el fragment shader, con el borde suavizado y
//     mezcla premultiplicada; en el centro el alfa es 1 y el color es exacto (la autocomprobación).
//   · Filtrar no toca los datos: un uniform con una máscara de bits (lección «Bits y bytes») y el
//     vertex shader saca del lienzo los sensores de las zonas ocultas.
//   · Lo que no es dibujo (qué sensor hay bajo el puntero, las alertas) se calcula en la CPU.
import { createView, structLayout, writeStruct, seededRandom } from './gpu/kit.js';

const COLUMNS = 40;
const ROWS = 30;
const ZONES = [
  { id: 'A', name: 'cámara fría', base: 4, spread: 2, limit: 8 },
  { id: 'B', name: 'almacén seco', base: 20, spread: 4, limit: 27 },
  { id: 'C', name: 'muelle de carga', base: 24, spread: 6, limit: 34 },
];
const SCALE = [[0, [56, 189, 248]], [18, [163, 230, 53]], [36, [244, 63, 94]]]; // °C → color
const BOARD = structLayout({ pixelToClip: 'vec2f', zones: 'u32', selected: 'u32' });
const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Los datos de la última lectura (sintéticos, con semilla)
const random = seededRandom(1200);
const sensors = [];
for (let row = 0; row < ROWS; row++) {
  for (let column = 0; column < COLUMNS; column++) {
    const zone = column < 14 ? 0 : column < 30 ? 1 : 2;
    const { base, spread } = ZONES[zone];
    const fault = random() < 0.012 ? 6 + random() * 6 : 0; // un fallo de vez en cuando: unos grados de más
    sensors.push({
      id: `${ZONES[zone].id}-${String(row * COLUMNS + column).padStart(4, '0')}`,
      x: (column + 0.5 + (random() - 0.5) * 0.3) / COLUMNS,
      y: (row + 0.5 + (random() - 0.5) * 0.3) / ROWS,
      temperature: Math.round((base + (random() - 0.5) * spread + fault) * 10) / 10,
      humidity: Math.round(35 + random() * 50),
      zone,
    });
  }
}
const excess = (sensor) => sensor.temperature - ZONES[sensor.zone].limit;
const alerts = sensors.filter((sensor) => excess(sensor) > 0).sort((a, b) => excess(b) - excess(a));
const instanceData = new ArrayBuffer(sensors.length * 20);
const dataView = new DataView(instanceData);
sensors.forEach((sensor, i) => {
  const at = i * 20;
  dataView.setFloat32(at, sensor.x * 2 - 1, true); // de 0..1 a coordenadas de recorte
  dataView.setFloat32(at + 4, 1 - sensor.y * 2, true);
  dataView.setFloat32(at + 8, sensor.temperature, true);
  dataView.setFloat32(at + 12, sensor.humidity, true);
  dataView.setUint32(at + 16, sensor.zone, true);
});
let visibleZones = 0b111; // un bit por zona
let selected = sensors.indexOf(alerts[0]);

const view = createView(document.querySelector('#stage'), {
  label: 'panel',
  setup({ device, format }) {
    const instances = device.createBuffer({ label: 'sensores', size: instanceData.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(instances, 0, instanceData);
    const board = device.createBuffer({ label: 'tablero', size: BOARD.size, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    const stop = ([celsius, rgb]) => `vec4f(${celsius}.0, ${rgb.map((c) => `${c}.0 / 255.0`).join(', ')})`;
    const module = device.createShaderModule({
      label: 'sensores',
      code: /* wgsl */ `
        struct Board { pixelToClip: vec2f, zones: u32, selected: u32 }
        @group(0) @binding(0) var<uniform> board: Board;
        struct VertexOutput {
          @builtin(position) position: vec4f,
          @location(0) inQuad: vec2f,       // de -1 a 1 dentro del cuadrado del sensor
          @location(1) color: vec3f,
          @location(2) radiusPx: f32,
          @location(3) @interpolate(flat) isSelected: u32,
        }
        fn temperatureColor(celsius: f32) -> vec3f {
          var stops = array<vec4f, 3>(${SCALE.map(stop).join(', ')}); // (°C, r, g, b)
          let upper = select(1u, 2u, celsius > stops[1].x);
          let lower = stops[upper - 1u];
          let t = clamp((celsius - lower.x) / (stops[upper].x - lower.x), 0.0, 1.0);
          return mix(lower.yzw, stops[upper].yzw, t);
        }
        @vertex fn vertexMain(@builtin(vertex_index) corner: u32, @builtin(instance_index) index: u32,
                              @location(0) position: vec2f, @location(1) temperature: f32,
                              @location(2) humidity: f32, @location(3) zone: u32) -> VertexOutput {
          var quad = array<vec2f, 6>(vec2f(-1, -1), vec2f(1, -1), vec2f(-1, 1), vec2f(-1, 1), vec2f(1, -1), vec2f(1, 1));
          var output: VertexOutput;
          output.isSelected = select(0u, 1u, index == board.selected);
          output.radiusPx = (3.0 + humidity / 100.0 * 2.5) * select(1.0, 1.8, output.isSelected == 1u);
          output.inQuad = quad[corner];
          output.color = temperatureColor(temperature);
          let visible = (board.zones & (1u << zone)) != 0u; // la máscara de bits de las casillas
          let center = select(vec2f(4.0, 4.0), position, visible); // oculto: fuera del lienzo
          output.position = vec4f(center + quad[corner] * output.radiusPx * board.pixelToClip, 0.0, 1.0);
          return output;
        }
        @fragment fn fragmentMain(vertexOut: VertexOutput) -> @location(0) vec4f {
          let d = length(vertexOut.inQuad);
          if (d > 1.0) { discard; }
          let edge = 1.0 / vertexOut.radiusPx; // un píxel de borde suavizado
          let alpha = 1.0 - smoothstep(1.0 - edge, 1.0, d);
          var color = vertexOut.color;
          if (vertexOut.isSelected == 1u && d > 0.7) { color = vec3f(1.0); } // el anillo del elegido
          return vec4f(color * alpha, alpha); // premultiplicado
        }`,
    });
    const over = { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' };
    const pipeline = device.createRenderPipeline({
      label: 'sensores',
      layout: 'auto',
      vertex: {
        module,
        buffers: [{
          arrayStride: 20,
          stepMode: 'instance', // avanza una vez por SENSOR
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x2' },
            { shaderLocation: 1, offset: 8, format: 'float32' },
            { shaderLocation: 2, offset: 12, format: 'float32' },
            { shaderLocation: 3, offset: 16, format: 'uint32' },
          ],
        }],
      },
      fragment: { module, targets: [{ format, blend: { color: over, alpha: over } }] },
    });
    const bindGroup = device.createBindGroup({
      label: 'tablero', layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: board } }],
    });
    return { instances, board, pipeline, bindGroup };
  },
  render({ device, resources: gpu, view: current, pass }) {
    const { canvas } = current;
    device.queue.writeBuffer(gpu.board, 0, writeStruct(BOARD, {
      pixelToClip: [2 / canvas.clientWidth, 2 / canvas.clientHeight], zones: visibleZones, selected,
    }));
    const renderPass = pass({ label: 'sensores', clearValue: [15 / 255, 23 / 255, 42 / 255, 1] });
    renderPass.setPipeline(gpu.pipeline);
    renderPass.setBindGroup(0, gpu.bindGroup);
    renderPass.setVertexBuffer(0, gpu.instances);
    renderPass.draw(6, sensors.length); // los 1200 sensores en un encargo
    renderPass.end();
  },
});

// La misma escala de color en JavaScript, para comprobar
function temperatureColor(celsius) {
  const upper = celsius > SCALE[1][0] ? 2 : 1;
  const [fromC, fromRgb] = SCALE[upper - 1];
  const [toC, toRgb] = SCALE[upper];
  const t = Math.min(1, Math.max(0, (celsius - fromC) / (toC - fromC)));
  return fromRgb.map((c, k) => Math.round(c + (toRgb[k] - c) * t));
}
const canvas = document.querySelector('#stage');
const describeSensor = (sensor) => `sensor ${sensor.id} (zona ${ZONES[sensor.zone].id}, ${ZONES[sensor.zone].name}) · ${sensor.temperature.toFixed(1)} °C · ${sensor.humidity} %`;
async function checkSensor(sensor) {
  const center = [Math.floor(sensor.x * canvas.width), Math.floor(sensor.y * canvas.height)];
  const [pixel] = await view.renderNow({ readPixels: [center] });
  const visible = (visibleZones & (1 << sensor.zone)) !== 0;
  const expected = visible ? temperatureColor(sensor.temperature) : [15, 23, 42];
  const ok = expected.every((c, k) => Math.abs(c - pixel[k]) <= 1);
  return `${visible ? 'su centro, del color de su temperatura' : 'su centro, el fondo'} ${ok ? '✅' : `❌ (${pixel.slice(0, 3).join(', ')})`}`;
}

// El puntero: el sensor visible más cercano, a menos de 8 px
canvas.addEventListener('pointermove', (event) => {
  const box = canvas.getBoundingClientRect();
  const [px, py] = [event.clientX - box.left, event.clientY - box.top];
  let best = null;
  let bestDistance = 8;
  for (const sensor of sensors) {
    if ((visibleZones & (1 << sensor.zone)) === 0) continue;
    const distance = Math.hypot(sensor.x * box.width - px, sensor.y * box.height - py);
    if (distance < bestDistance) [best, bestDistance] = [sensor, distance];
  }
  document.querySelector('#hover').textContent = best ? describeSensor(best) : 'Ningún sensor bajo el puntero.';
});
document.querySelector('#zones').addEventListener('change', async (event) => {
  visibleZones ^= 1 << Number(event.target.value); // XOR: cambia solo el bit de esa zona
  log(`zonas visibles → 0b${visibleZones.toString(2).padStart(3, '0')} · ${sensors[selected].id}: ${await checkSensor(sensors[selected])}`);
});
document.querySelector('#alerts').append(...alerts.slice(0, 5).map((sensor) => {
  const button = Object.assign(document.createElement('button'), {
    type: 'button',
    textContent: `${sensor.id}: ${sensor.temperature.toFixed(1)} °C (${excess(sensor).toFixed(1)} °C por encima del límite)`,
  });
  button.addEventListener('click', async () => {
    selected = sensors.indexOf(sensor);
    document.querySelector('#hover').textContent = describeSensor(sensor);
    log(`${describeSensor(sensor)} · ${await checkSensor(sensor)}`);
  });
  const item = document.createElement('li');
  item.append(button);
  return item;
}));

await view.ready;
log(`sensores → ${sensors.length} en 3 zonas · 1 draw(6, ${sensors.length}) · 20 bytes por sensor · ${alerts.length} alertas`);
log(`${describeSensor(sensors[selected])} · ${await checkSensor(sensors[selected])}`);
log('Listo: pasa el puntero por el plano, filtra las zonas o elige una alerta');
```

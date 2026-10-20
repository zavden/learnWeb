---
example_description: "Un mapa de calor de la demanda eléctrica de una ciudad en 2025 (8760 horas sintéticas, con semilla): un compute shader calcula la media de cada mes a cada hora (12 × 24 celdas, bucles de 31 días como mucho) y un fragment shader pinta cada celda con una escala de cinco colores, más el contorno de la celda elegida. Se explora con el puntero o con las flechas; la celda elegida se anuncia en texto, hay una tabla con el pico de cada mes, y una autocomprobación compara la media y el color de la GPU con JavaScript"
example_tags: "javascript|webgpu|compute-shader|visualizacion-de-datos|mapa-de-calor|teclado|accesibilidad|tablas|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="heatmap">
  <h1>Demanda eléctrica, 2025: media por mes y hora</h1>
  <div class="frame">
    <span class="axis axis-y" aria-hidden="true">ene → dic</span>
    <canvas id="stage" tabindex="0" role="img" aria-label="Mapa de calor de 12 filas (meses) por 24 columnas (horas). Con el foco, las flechas eligen una celda" aria-describedby="selection"></canvas>
  </div>
  <p class="axis axis-x" aria-hidden="true">00:00 → 23:00</p>
  <p id="selection" class="selection" aria-live="polite"></p>
  <details>
    <summary>La hora pico de cada mes</summary>
    <table>
      <thead><tr><th scope="col">Mes</th><th scope="col">Hora pico</th><th scope="col">Media (MW)</th></tr></thead>
      <tbody id="peaks"></tbody>
    </table>
  </details>
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
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--text);
  background: var(--surface);
}
.heatmap {
  max-width: 36rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.15rem;
  margin-top: 0;
}
.frame {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.25rem;
}
canvas {
  display: block;
  width: 100%;
  height: 192px;
  border-radius: 4px;
  cursor: crosshair;
}
canvas:focus-visible,
summary:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}
.axis {
  font-size: 0.75rem;
  color: var(--muted);
}
.axis-y {
  writing-mode: vertical-rl;
}
.axis-x {
  margin: 0.2rem 0 0;
  text-align: center;
}
.selection {
  font-variant-numeric: tabular-nums;
}
table {
  border-collapse: collapse;
  font-size: 0.85rem;
}
th,
td {
  padding: 0.15rem 0.6rem;
  border-bottom: 1px solid var(--line);
  text-align: end;
}
th:first-child,
td:first-child {
  text-align: start;
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
//   · Los datos crudos (8760 horas) viven en la GPU; un compute shader hace las 288 medias, un
//     hilo por celda, con un bucle que como mucho da 31 vueltas (los días del mes).
//   · El dibujo es un fragment shader sobre un solo triángulo: cada píxel sabe en qué celda cae y
//     lee su media del búfer. La escala de color son 5 paradas interpoladas.
//   · La interacción no recalcula nada: elegir otra celda cambia un uniform y redibuja.
//   · Lo que se ve también se lee: la celda elegida en un texto que se anuncia, y la tabla.
import { createView, readBuffer, structLayout, writeStruct, seededRandom } from './gpu/kit.js';

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 2025 no es bisiesto
const STOPS = [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]];
const HEAT = structLayout({ size: 'vec2f', range: 'vec2f', selected: 'vec2f' });
const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// 8760 horas sintéticas: verano más caluroso (aire acondicionado), pico de la tarde, valle de madrugada
const random = seededRandom(2025);
const demand = new Float32Array(365 * 24);
for (let day = 0; day < 365; day++) {
  for (let hour = 0; hour < 24; hour++) {
    demand[day * 24 + hour] = 32 + 9 * Math.cos((2 * Math.PI * (day - 196)) / 365)
      + 14 * Math.exp(-((hour - 19) ** 2) / 6) + 7 * Math.exp(-((hour - 9) ** 2) / 5)
      - 6 * Math.exp(-((hour - 4) ** 2) / 8) + (random() - 0.5) * 4;
  }
}
// Las mismas medias en JavaScript: para la escala, la tabla y la autocomprobación
const averages = new Float32Array(12 * 24);
DAYS_IN_MONTH.reduce((firstDay, days, month) => {
  for (let hour = 0; hour < 24; hour++) {
    let sum = 0;
    for (let day = 0; day < days; day++) sum += demand[(firstDay + day) * 24 + hour];
    averages[month * 24 + hour] = sum / days;
  }
  return firstDay + days;
}, 0);
const low = Math.min(...averages);
const high = Math.max(...averages);
const cellName = (month, hour) => `${MONTHS[month]}, ${String(hour).padStart(2, '0')}:00`;
const mw = (value) => `${value.toFixed(1)} MW`;
let selected = { month: 6, hour: 19 };

const view = createView(document.querySelector('#stage'), {
  label: 'mapa de calor',
  setup({ device, format }) {
    const { STORAGE, COPY_SRC, UNIFORM, COPY_DST } = GPUBufferUsage;
    const hourly = device.createBuffer({ label: 'demanda por hora', size: demand.byteLength, usage: STORAGE | COPY_DST });
    device.queue.writeBuffer(hourly, 0, demand);
    const firstDays = new Uint32Array(12);
    DAYS_IN_MONTH.reduce((first, days, month) => { firstDays[month] = first; return first + days; }, 0);
    const calendar = device.createBuffer({ label: 'calendario', size: 2 * 12 * 4, usage: STORAGE | COPY_DST });
    device.queue.writeBuffer(calendar, 0, new Uint32Array([...firstDays, ...DAYS_IN_MONTH]));
    const cells = device.createBuffer({ label: 'medias', size: averages.byteLength, usage: STORAGE | COPY_SRC });
    const heat = device.createBuffer({ label: 'escala y selección', size: HEAT.size, usage: UNIFORM | COPY_DST });

    const average = device.createComputePipeline({
      label: 'medias', layout: 'auto',
      compute: {
        module: device.createShaderModule({
          label: 'medias',
          code: /* wgsl */ `
            @group(0) @binding(0) var<storage, read> hourly: array<f32>;
            @group(0) @binding(1) var<storage, read> calendar: array<u32, 24>; // 12 primeros días + 12 duraciones
            @group(0) @binding(2) var<storage, read_write> cells: array<f32, 288>;
            @compute @workgroup_size(24) fn main(@builtin(global_invocation_id) id: vec3u) {
              let hour = id.x;
              let month = id.y; // 12 grupos de 24 hilos: uno por celda
              var sum = 0.0;
              for (var day = 0u; day < 31u; day++) { // 31 vueltas como mucho
                if (day >= calendar[12u + month]) { break; }
                sum += hourly[(calendar[month] + day) * 24u + hour];
              }
              cells[month * 24u + hour] = sum / f32(calendar[12u + month]);
            }`,
        }),
      },
    });
    const toWgsl = (rgb) => `vec3f(${rgb.join('.0, ')}.0) / 255.0`;
    const drawModule = device.createShaderModule({
      label: 'celdas',
      code: /* wgsl */ `
        struct Heat { size: vec2f, range: vec2f, selected: vec2f }
        @group(0) @binding(0) var<storage, read> cells: array<f32, 288>;
        @group(0) @binding(1) var<uniform> heat: Heat;
        @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
          var corners = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
          return vec4f(corners[index], 0.0, 1.0);
        }
        fn colorScale(t: f32) -> vec3f { // 5 paradas, de violeta a amarillo
          var stops = array<vec3f, 5>(${STOPS.map(toWgsl).join(', ')});
          let scaled = clamp(t, 0.0, 1.0) * 4.0;
          let segment = min(u32(scaled), 3u);
          return mix(stops[segment], stops[segment + 1u], scaled - f32(segment));
        }
        @fragment fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
          let cellSize = heat.size / vec2f(24.0, 12.0);
          let cell = min(vec2u(position.xy / cellSize), vec2u(23u, 11u)); // (hora, mes)
          let inCell = position.xy - vec2f(cell) * cellSize; // posición dentro de la celda, en píxeles
          let isSelected = all(vec2f(cell) == heat.selected);
          let border = min(min(inCell.x, inCell.y), min(cellSize.x - inCell.x, cellSize.y - inCell.y));
          if (isSelected && border < 3.0) { return vec4f(1.0, 1.0, 1.0, 1.0); } // el contorno de la elegida
          let value = cells[cell.y * 24u + cell.x];
          return vec4f(colorScale((value - heat.range.x) / (heat.range.y - heat.range.x)), 1.0);
        }`,
    });
    const draw = device.createRenderPipeline({
      label: 'celdas', layout: 'auto', vertex: { module: drawModule }, fragment: { module: drawModule, targets: [{ format }] },
    });
    const group = (pipeline, buffers) => device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0), entries: buffers.map((buffer, binding) => ({ binding, resource: { buffer } })),
    });
    return { cells, heat, average, averageGroup: group(average, [hourly, calendar, cells]), draw, drawGroup: group(draw, [cells, heat]), dirty: true };
  },
  render({ encoder, device, resources: gpu, view: current, pass }) {
    if (gpu.dirty) { // las medias, una sola vez (y otra si se recupera el dispositivo)
      gpu.dirty = false;
      const computePass = encoder.beginComputePass({ label: 'medias' });
      computePass.setPipeline(gpu.average);
      computePass.setBindGroup(0, gpu.averageGroup);
      computePass.dispatchWorkgroups(1, 12);
      computePass.end();
    }
    device.queue.writeBuffer(gpu.heat, 0, writeStruct(HEAT, {
      size: [current.canvas.width, current.canvas.height], range: [low, high], selected: [selected.hour, selected.month],
    }));
    const renderPass = pass({ label: 'celdas' });
    renderPass.setPipeline(gpu.draw);
    renderPass.setBindGroup(0, gpu.drawGroup);
    renderPass.draw(3);
    renderPass.end();
  },
});

// La misma escala de color en JavaScript
function colorScale(t) {
  const scaled = Math.min(1, Math.max(0, t)) * 4;
  const segment = Math.min(Math.floor(scaled), 3);
  const local = scaled - segment;
  return STOPS[segment].map((c, k) => Math.round(c + (STOPS[segment + 1][k] - c) * local));
}
const canvas = document.querySelector('#stage');
async function select(month, hour, announceInLog) {
  selected = { month, hour };
  const value = averages[month * 24 + hour];
  document.querySelector('#selection').textContent = `${cellName(month, hour)} → ${mw(value)} de media`;
  if (!announceInLog) return view.invalidate();
  // El centro de la celda (lejos del contorno), leído en el mismo encargo que el dibujo
  const center = [Math.floor(((hour + 0.5) * canvas.width) / 24), Math.floor(((month + 0.5) * canvas.height) / 12)];
  const [[pixel], gpuCells] = await Promise.all([view.renderNow({ readPixels: [center] }), readBuffer(view.device, view.resources.cells)]);
  const expected = colorScale((value - low) / (high - low));
  const colorOk = expected.every((c, k) => Math.abs(c - pixel[k]) <= 1);
  const averageOk = Math.abs(gpuCells[month * 24 + hour] - value) < 0.01;
  log(`selección → ${cellName(month, hour)} · ${mw(value)} · ¿la media y el color de la GPU coinciden con JavaScript? ${colorOk && averageOk ? '✅' : '❌'}`);
}

// Puntero: elegir al pasar; teclado: flechas
canvas.addEventListener('pointermove', (event) => {
  const box = canvas.getBoundingClientRect();
  const hour = Math.min(23, Math.floor(((event.clientX - box.left) / box.width) * 24));
  const month = Math.min(11, Math.floor(((event.clientY - box.top) / box.height) * 12));
  if (hour !== selected.hour || month !== selected.month) select(month, hour, false);
});
canvas.addEventListener('keydown', (event) => {
  const moves = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
  if (!moves[event.key]) return;
  event.preventDefault();
  const [dMonth, dHour] = moves[event.key];
  select((selected.month + dMonth + 12) % 12, (selected.hour + dHour + 24) % 24, true);
});

// La tabla: la hora pico de cada mes
document.querySelector('#peaks').append(...MONTHS.map((month, m) => {
  const row = averages.slice(m * 24, m * 24 + 24);
  const peak = row.indexOf(Math.max(...row));
  const tr = document.createElement('tr');
  tr.append(...[month, `${String(peak).padStart(2, '0')}:00`, row[peak].toFixed(1)].map((text) => Object.assign(document.createElement('td'), { textContent: text })));
  return tr;
}));

await view.ready;
const peakIndex = averages.indexOf(high);
const lowIndex = averages.indexOf(low);
log(`datos → ${demand.length} horas de 2025 · medias por mes y hora en un compute shader: 12 × 24 celdas`);
log(`pico → ${cellName(Math.floor(peakIndex / 24), peakIndex % 24)} · ${mw(high)} · valle → ${cellName(Math.floor(lowIndex / 24), lowIndex % 24)} · ${mw(low)}`);
await select(6, 19, true);
log('Listo: pasa el puntero por el mapa o, con el foco en él, muévete con las flechas');
```

---
example_description: "El banco de pruebas de GPUKit, la biblioteca de los ejemplos profesionales: una estructura de uniforms calculada con structLayout y llenada con writeStruct, una vista que dibuja bajo demanda y lee píxeles en el mismo encargo, errores de validación convertidos en un GPUKitError con el nombre del paso, y la recuperación automática cuando se pierde el dispositivo (simulada con un botón)"
example_tags: "javascript|webgpu|biblioteca|errores|device-lost|uniforms|struct|accesibilidad|profesional"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="bench">
  <h1>GPUKit: el banco de pruebas</h1>
  <canvas id="stage" role="img" aria-label="Un rombo de color sobre fondo azul noche; el color se elige abajo"></canvas>
  <fieldset class="colors">
    <legend>Color del rombo</legend>
    <label><input type="radio" name="color" value="225,29,72" checked> Frambuesa</label>
    <label><input type="radio" name="color" value="245,158,11"> Ámbar</label>
    <label><input type="radio" name="color" value="13,148,136"> Verde azulado</label>
  </fieldset>
  <div class="actions">
    <button id="fail" type="button">Provocar un error de validación</button>
    <button id="lose" type="button">Simular la pérdida del dispositivo</button>
  </div>
  <p id="status" class="status" role="status"></p>
  <ol id="log" class="log"></ol>
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
.bench {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin-top: 0;
}
canvas {
  display: block;
  width: 100%;
  height: 180px;
  border: 1px solid var(--line);
  border-radius: 6px;
}
.colors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin: 0.75rem 0;
  border: 1px solid var(--line);
  border-radius: 6px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.35rem 0.8rem;
}
button:focus-visible,
input:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}
.status {
  min-height: 1.4em;
  color: var(--muted);
  font-size: 0.9rem;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.78rem;
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
// GPUKit (assets/gpu/kit.js, léelo con «Assets») junta las lecciones del módulo en una biblioteca
// pequeña. Este banco de pruebas enseña sus piezas una a una:
//   · structLayout/writeStruct: el mapa de bytes de un struct de WGSL, calculado y no a ojo;
//   · createView: lienzo nítido, dibujo bajo demanda y píxeles leídos en el mismo encargo;
//   · checked: un error de validación se convierte en una excepción con el nombre del paso;
//   · la recuperación: si se pierde el dispositivo, la vista pide otro y vuelve a crearlo todo.
import { createView, structLayout, writeStruct, checked, GPUKitError } from './gpu/kit.js';

const logList = document.querySelector('#log');
const statusLine = document.querySelector('#status');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
  statusLine.textContent = text; // la región role="status" lo anuncia
}

// El struct de WGSL y su mapa de bytes: el f32 llena el hueco del vec3f; el vec2f empieza en el 16
const STYLE = structLayout({ color: 'vec3f', scale: 'f32', offset: 'vec2f' });
const offsets = Object.entries(STYLE.fields).map(([name, { offset }]) => `${name} en el byte ${offset}`).join(', ');
log(`Style → ${offsets} · ${STYLE.size} bytes`);

const form = document.querySelector('.colors');
const NAMES = { '225,29,72': 'frambuesa', '245,158,11': 'ámbar', '13,148,136': 'verde azulado' };
const currentColor = () => form.querySelector('input:checked').value.split(',').map(Number);

const view = createView(document.querySelector('#stage'), {
  label: 'banco de pruebas',
  // TODO lo que vive en la GPU se crea aquí: si se pierde el dispositivo, se vuelve a llamar
  setup({ device, format }) {
    const module = device.createShaderModule({
      label: 'rombo',
      code: /* wgsl */ `
        struct Style {
          color: vec3f,  // byte 0
          scale: f32,    // byte 12: el hueco del vec3f
          offset: vec2f, // byte 16
        }                // 32 bytes (múltiplo de 16, la mayor alineación)
        @group(0) @binding(0) var<uniform> style: Style;
        @vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
          var diamond = array<vec2f, 6>(vec2f(0, -1), vec2f(1, 0), vec2f(0, 1), vec2f(0, -1), vec2f(0, 1), vec2f(-1, 0));
          return vec4f(diamond[index] * style.scale + style.offset, 0.0, 1.0);
        }
        @fragment fn fragmentMain() -> @location(0) vec4f {
          return vec4f(style.color, 1.0);
        }`,
    });
    const pipeline = device.createRenderPipeline({
      label: 'rombo', layout: 'auto', vertex: { module }, fragment: { module, targets: [{ format }] },
    });
    const styleBuffer = device.createBuffer({ label: 'estilo', size: STYLE.size, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    const bindGroup = device.createBindGroup({
      label: 'estilo', layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: styleBuffer } }],
    });
    return { pipeline, styleBuffer, bindGroup };
  },
  render({ device, resources, pass }) {
    const [r, g, b] = currentColor();
    device.queue.writeBuffer(resources.styleBuffer, 0, writeStruct(STYLE, { color: [r / 255, g / 255, b / 255], scale: 0.8, offset: [0, 0] }));
    const renderPass = pass({ label: 'rombo', clearValue: [15 / 255, 23 / 255, 42 / 255, 1] });
    renderPass.setPipeline(resources.pipeline);
    renderPass.setBindGroup(0, resources.bindGroup);
    renderPass.draw(6);
    renderPass.end();
  },
  onStatus(status, detail) {
    if (status === 'lost') log(`dispositivo ${view.generation} perdido (${detail}) → recreando…`);
    if (status === 'restored') reportCenter(`dispositivo ${detail} listo`);
  },
});

const canvas = document.querySelector('#stage');
async function reportCenter(prefix) {
  const [center] = await view.renderNow({ readPixels: [[Math.floor(canvas.width / 2), Math.floor(canvas.height / 2)]] });
  log(`${prefix} · centro: ${center.join(', ')}`);
}

form.addEventListener('change', () => reportCenter(`color ${NAMES[currentColor().join(',')]}`));
document.querySelector('#fail').addEventListener('click', async () => {
  try {
    // Un búfer que el shader escriba y JavaScript lea directamente: no existe (lección 2)
    await checked(view.device, 'búfer de resultados', () => view.device.createBuffer({
      label: 'resultados', size: 16, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.STORAGE,
    }));
    log('sin errores');
  } catch (error) {
    if (!(error instanceof GPUKitError)) throw error;
    log(`${error.name} (${error.kind}): ${error.message}`);
  }
});
document.querySelector('#lose').addEventListener('click', () => view.simulateLoss());

await view.ready;
await reportCenter(`dispositivo ${view.generation} listo`);
log('Listo: cambia el color, provoca un error o simula la pérdida del dispositivo');
```

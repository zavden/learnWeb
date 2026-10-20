---
example_description: "Un editor de fotos en la GPU: una cadena de seis filtros (exposición, contraste, saturación, temperatura, viñeta y enfoque) que se activan, se ajustan y se reordenan; cada filtro es un trozo de GLSL dentro de la misma plantilla y una pasada que escribe en uno de dos framebuffers que se turnan (ping-pong). Un deslizador «Antes | después» (o arrastrar sobre la foto) compara con el original. Una autocomprobación pasa un color de prueba por la cadena en la GPU y por la misma cadena escrita en JavaScript"
example_tags: "javascript|webgl2|shaders|framebuffers|ping-pong|filtros|cadena|antes-despues|accesibilidad|profesional"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="editor">
  <h1>Editor de fotos</h1>
  <div class="stage">
    <canvas id="photo" role="img" aria-label="La gran ola de Kanagawa: a la izquierda de la línea, la foto original; a la derecha, con los filtros"></canvas>
    <span class="tag tag--before" aria-hidden="true">Antes</span>
    <span class="tag tag--after" aria-hidden="true">Después</span>
  </div>
  <p class="split">
    <label for="split">Antes | después</label>
    <input id="split" type="range" min="0" max="100" value="50">
    <output id="split-value" for="split">50 %</output>
  </p>
  <h2 id="chain-title">Cadena de filtros <small>(se aplican de arriba abajo)</small></h2>
  <ol id="chain" class="chain" aria-labelledby="chain-title"></ol>
  <button id="reset" type="button">Restablecer</button>
  <p id="status" class="status" role="status"></p>
  <p class="credit">Katsushika Hokusai, <cite>La gran ola de Kanagawa</cite>, c. 1831. Dominio público.</p>
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
.editor {
  max-width: 30rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
h2 {
  font-size: 1rem;
  margin: 1rem 0 0.4rem;
}
h2 small {
  font-weight: normal;
  color: #94a3b8;
}
.stage {
  position: relative;
}
#photo {
  display: block;
  width: 100%;
  aspect-ratio: 480 / 323;
  touch-action: pan-y; /* arrastrar en horizontal mueve la línea; en vertical, la página */
  cursor: ew-resize;
}
.tag {
  position: absolute;
  top: 0.4rem;
  padding: 0.1rem 0.4rem;
  font-size: 0.75rem;
  background: #0f172a;
  border-radius: 0.25rem;
}
.tag--before {
  left: 0.4rem;
}
.tag--after {
  right: 0.4rem;
}
.split {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0 0;
}
.split input {
  flex: 1;
}
.chain {
  display: grid;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.filter {
  display: grid;
  grid-template-columns: 8.5rem 1fr 4.2rem auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.4rem;
  border: 1px solid #475569;
  border-radius: 0.3rem;
}
.filter output {
  font-variant-numeric: tabular-nums;
  font-size: 0.85rem;
}
.filter:has(input[type="checkbox"]:not(:checked)) {
  color: #94a3b8;
  border-style: dashed;
}
.filter__move {
  display: flex;
  gap: 0.2rem;
}
button {
  font: inherit;
  padding: 0.15rem 0.5rem;
}
#reset {
  margin-top: 0.6rem;
}
input:focus-visible,
button:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.status {
  min-height: 2.6em;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.75rem;
}
.credit {
  font-size: 0.8rem;
  color: #94a3b8;
}
```

# JavaScript

```javascript
// Editor de fotos con una cadena de filtros en la GPU.
//
// Decisiones de diseño:
// - Un filtro es un objeto: nombre, control, un trozo de GLSL y su versión en JavaScript. Los
//   seis fragment shaders salen de la MISMA plantilla (filterShader): añadir un filtro es
//   añadir un objeto a FILTERS, sin tocar el resto.
// - La cadena: una pasada por filtro activo. Cada pasada lee una textura y escribe en uno de
//   dos framebuffers del tamaño de la foto, que se turnan (ping-pong): nunca se escribe en la
//   textura que se lee (lección «Texturas y framebuffers»). El original no se toca nunca.
// - La cadena solo se recalcula cuando cambia un filtro; mover «Antes | después» solo repite
//   la última pasada, la que compone el original y el resultado en el lienzo.
// - Autocomprobación: un color de prueba recorre la cadena en la GPU y en JavaScript (con el
//   mismo redondeo a bytes entre pasadas, porque los destinos son RGBA8) y se comparan con
//   una tolerancia de 2 unidades (la GPU calcula en float32; JavaScript, en float64).
// - Accesible: casillas, deslizadores y botones de orden nativos; el resultado se dice en
//   texto en una región role="status"; la línea se mueve también con el teclado.
//
// Usa assets/gl/kit.js (léelo con «Assets») y assets/great-wave.jpg.
// Alcance: HTML, CSS, JavaScript, DOM, eventos, formularios y este módulo.
import { createView, createProgram, createQuad, createTexture, createTarget, bindCanvas, loadImage, readPixel } from './gl/kit.js';

const VERTEX = `#version 300 es
layout(location = 0) in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

// La plantilla: lee el píxel, aplica el trozo de GLSL del filtro y recorta a 0..1
const filterShader = (body) => `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform float u_amount;
in vec2 v_uv;
out vec4 outColor;
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
void main() {
  vec3 color = texture(u_image, v_uv).rgb;
  ${body}
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;

// La última pasada: el original a la izquierda de la línea, el resultado a la derecha
const COMPARE = `#version 300 es
precision highp float;
uniform sampler2D u_before;
uniform sampler2D u_after;
uniform float u_split;     // dónde está la línea, de 0 a 1
uniform float u_lineWidth; // su ancho, en unidades de uv
in vec2 v_uv;
out vec4 outColor;
void main() {
  vec3 before = texture(u_before, v_uv).rgb;
  vec3 after = texture(u_after, v_uv).rgb;
  vec3 color = v_uv.x < u_split ? before : after;
  float line = 1.0 - smoothstep(0.0, u_lineWidth, abs(v_uv.x - u_split));
  outColor = vec4(mix(color, vec3(1.0), line), 1.0);
}`;

const LUMA = [0.2126, 0.7152, 0.0722];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const smoothstep = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const signed = (v, digits) => `${v > 0 ? '+' : ''}${v.toFixed(digits)}`;

const FILTERS = [
  { id: 'exposure', label: 'Exposición', min: -2, max: 2, step: 0.1, value: 0.3, on: true,
    format: (v) => `${signed(v, 1)} EV`,
    glsl: 'color *= exp2(u_amount); // cada «paso» (EV) dobla o parte por la mitad la luz',
    cpu: (c, a) => c.map((v) => v * 2 ** a) },
  { id: 'contrast', label: 'Contraste', min: 0, max: 2, step: 0.05, value: 1.15, on: true,
    format: (v) => `${v.toFixed(2)}×`,
    glsl: 'color = (color - 0.5) * u_amount + 0.5;',
    cpu: (c, a) => c.map((v) => (v - 0.5) * a + 0.5) },
  { id: 'saturation', label: 'Saturación', min: 0, max: 2, step: 0.05, value: 1.3, on: true,
    format: (v) => `${v.toFixed(2)}×`,
    glsl: 'color = mix(vec3(dot(color, LUMA)), color, u_amount);',
    cpu: (c, a) => c.map((v) => dot(c, LUMA) + (v - dot(c, LUMA)) * a) },
  { id: 'temperature', label: 'Temperatura', min: -1, max: 1, step: 0.05, value: 0.25, on: true,
    format: (v) => signed(v, 2),
    glsl: 'color += vec3(0.08, 0.0, -0.08) * u_amount; // más rojo y menos azul: más cálida',
    cpu: (c, a) => [c[0] + 0.08 * a, c[1], c[2] - 0.08 * a] },
  { id: 'vignette', label: 'Viñeta', min: 0, max: 1, step: 0.05, value: 0.5, on: true,
    format: (v) => `${Math.round(v * 100)} %`,
    glsl: 'color *= 1.0 - u_amount * smoothstep(0.25, 0.75, distance(v_uv, vec2(0.5)));',
    cpu: (c, a, uv) => c.map((v) => v * (1 - a * smoothstep(0.25, 0.75, Math.hypot(uv[0] - 0.5, uv[1] - 0.5)))) },
  { id: 'sharpen', label: 'Enfoque', min: 0, max: 2, step: 0.1, value: 0.6, on: false,
    format: (v) => v.toFixed(1),
    // El único que lee vecinos: el píxel menos la media de sus 4 vecinos, amplificado
    glsl: `vec2 texel = 1.0 / vec2(textureSize(u_image, 0));
  vec3 around = texture(u_image, v_uv + vec2(texel.x, 0.0)).rgb + texture(u_image, v_uv - vec2(texel.x, 0.0)).rgb
    + texture(u_image, v_uv + vec2(0.0, texel.y)).rgb + texture(u_image, v_uv - vec2(0.0, texel.y)).rgb;
  color += u_amount * (4.0 * color - around);`,
    cpu: (c) => c }, // en un color liso, los vecinos son iguales: enfocar no cambia nada
];
const byId = Object.fromEntries(FILTERS.map((filter) => [filter.id, filter]));
const defaults = () => ({
  order: FILTERS.map((filter) => filter.id),
  settings: Object.fromEntries(FILTERS.map((filter) => [filter.id, { on: filter.on, amount: filter.value }])),
});
let { order, settings } = defaults();
let split = 0.5;
const activeFilters = () => order.map((id) => byId[id]).filter((filter) => settings[filter.id].on);

// La misma cadena en JavaScript, con el redondeo a bytes de cada destino RGBA8
const PROBE = { hex: '#9f6c30', rgb: [159, 108, 48] }; // un tono caramelo, lejos de los extremos
const PROBE_PIXEL = [120, 80];
function referenceChain(rgb, filters, uv) {
  let color = rgb.map((v) => v / 255);
  for (const filter of filters) {
    color = filter.cpu(color, settings[filter.id].amount, uv)
      .map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255) / 255);
  }
  return color.map((v) => Math.round(v * 255));
}

// --- La GPU ---------------------------------------------------------------------------------
const statusLine = document.querySelector('#status');
function say(text) {
  statusLine.textContent = text;
  console.log(text);
}
const image = await loadImage('great-wave.jpg');
const { naturalWidth: width, naturalHeight: height } = image;
const canvas = document.querySelector('#photo');

function runChain(gl, res, source) {
  let input = source;
  let target = null;
  activeFilters().forEach((filter, index) => {
    target = res.targets[index % 2]; // 0, 1, 0, 1…: se lee de uno y se escribe en el otro
    target.bind();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, input);
    res.programs[filter.id].set({ u_image: 0, u_amount: settings[filter.id].amount });
    gl.bindVertexArray(res.quad);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    input = target.texture;
  });
  return { texture: input, target };
}

const view = createView(canvas, {
  setup(gl) {
    return {
      programs: Object.fromEntries(FILTERS.map((filter) => [filter.id,
        createProgram(gl, { name: filter.label, vertex: VERTEX, fragment: filterShader(filter.glsl) })])),
      compare: createProgram(gl, { name: 'antes y después', vertex: VERTEX, fragment: COMPARE }),
      quad: createQuad(gl),
      photo: createTexture(gl, { source: image }),
      probe: createTexture(gl, { width: 1, height: 1, data: Uint8Array.of(...PROBE.rgb, 255) }),
      targets: [0, 1].map(() => createTarget(gl, width, height, { filter: gl.LINEAR })),
      result: null, // la textura con la cadena aplicada a la foto (null: hay que calcularla)
    };
  },
  render(gl, res) {
    res.result ??= runChain(gl, res, res.photo).texture;
    bindCanvas(gl);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, res.photo);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, res.result);
    res.compare.set({ u_before: 0, u_after: 1, u_split: split, u_lineWidth: (1.5 * devicePixelRatio) / canvas.width });
    gl.bindVertexArray(res.quad);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindTexture(gl.TEXTURE_2D, null); // la unidad 1 queda libre: ningún destino sigue enlazado como fuente
    gl.activeTexture(gl.TEXTURE0);
  },
  onStatus(status) {
    say(status === 'lost' ? '⚠️ contexto WebGL perdido: la foto vuelve en cuanto se recupere' : '✅ contexto recuperado: programas, texturas y destinos creados de nuevo');
  },
});

function selfTest() {
  const res = view.resources;
  if (!res) return 'prueba pendiente: no hay contexto';
  const filters = activeFilters();
  if (filters.length === 0) return 'sin filtros: la foto tal cual';
  const [px, py] = PROBE_PIXEL;
  const expected = referenceChain(PROBE.rgb, filters, [(px + 0.5) / width, (py + 0.5) / height]);
  const { gl } = view;
  const { target } = runChain(gl, res, res.probe);
  target.bind();
  const gpu = readPixel(gl, px, py).slice(0, 3); // en la misma tarea que el dibujo
  bindCanvas(gl);
  res.result = null; // los destinos tienen ahora la prueba: la foto se recalcula
  view.invalidate();
  const ok = gpu.every((v, i) => Math.abs(v - expected[i]) <= 2);
  return `prueba ${PROBE.hex} en (${px}, ${py}) → ${expected.join(', ')} ${ok ? '✅' : `❌ GPU ${gpu.join(', ')}`}`;
}

function chainLine() {
  const filters = activeFilters();
  const names = filters.map((filter) => filter.label).join(' → ') || 'ningún filtro';
  return `cadena → ${names} · ${filters.length} pasada${filters.length === 1 ? '' : 's'} + 1 al lienzo · ${selfTest()}`;
}

// --- La lista de filtros ------------------------------------------------------------------------
const list = document.querySelector('#chain');
const items = new Map(FILTERS.map((filter) => {
  const item = document.createElement('li');
  item.className = 'filter';
  item.dataset.id = filter.id;
  item.innerHTML = `
    <label><input type="checkbox"> ${filter.label}</label>
    <input type="range" min="${filter.min}" max="${filter.max}" step="${filter.step}" aria-label="${filter.label}: cantidad">
    <output></output>
    <span class="filter__move">
      <button type="button" data-move="-1" aria-label="Subir ${filter.label} en la cadena">↑</button>
      <button type="button" data-move="1" aria-label="Bajar ${filter.label} en la cadena">↓</button>
    </span>`;
  return [filter.id, item];
}));

function syncList() {
  list.replaceChildren(...order.map((id) => items.get(id)));
  order.forEach((id, index) => {
    const item = items.get(id);
    const { on, amount } = settings[id];
    item.querySelector('input[type="checkbox"]').checked = on;
    item.querySelector('input[type="range"]').value = amount;
    item.querySelector('output').textContent = byId[id].format(amount);
    item.querySelector('[data-move="-1"]').disabled = index === 0;
    item.querySelector('[data-move="1"]').disabled = index === order.length - 1;
  });
}

list.addEventListener('input', (event) => {
  const id = event.target.closest('.filter').dataset.id;
  if (event.target.type === 'checkbox') settings[id].on = event.target.checked;
  else settings[id].amount = event.target.valueAsNumber;
  items.get(id).querySelector('output').textContent = byId[id].format(settings[id].amount);
  if (view.resources) view.resources.result = null;
  view.invalidate(); // mientras se arrastra: como mucho un dibujo por fotograma
});
list.addEventListener('change', () => say(chainLine())); // al soltar: comprobar y anotar
list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-move]');
  if (!button) return;
  const id = button.closest('.filter').dataset.id;
  const from = order.indexOf(id);
  const to = from + Number(button.dataset.move);
  order.splice(to, 0, ...order.splice(from, 1));
  syncList();
  // El foco sigue al filtro; si su botón queda desactivado (primero o último), pasa al otro
  const moved = items.get(id);
  (button.disabled ? moved.querySelector(`[data-move="${-button.dataset.move}"]`) : button).focus();
  if (view.resources) view.resources.result = null;
  say(chainLine());
});
document.querySelector('#reset').addEventListener('click', () => {
  ({ order, settings } = defaults());
  syncList();
  if (view.resources) view.resources.result = null;
  say(chainLine());
});

// --- Antes | después: el deslizador, o arrastrar sobre la foto --------------------------------
const splitInput = document.querySelector('#split');
const splitOutput = document.querySelector('#split-value');
function setSplit(value) {
  split = Math.min(1, Math.max(0, value));
  splitInput.value = Math.round(split * 100);
  splitOutput.textContent = `${Math.round(split * 100)} %`;
  view.invalidate(); // solo la última pasada: la cadena no cambia
}
splitInput.addEventListener('input', () => setSplit(splitInput.valueAsNumber / 100));
let dragging = false;
const pointerSplit = (event) => {
  const box = canvas.getBoundingClientRect();
  return (event.clientX - box.left) / box.width;
};
canvas.addEventListener('pointerdown', (event) => {
  canvas.setPointerCapture(event.pointerId);
  dragging = true;
  setSplit(pointerSplit(event));
});
canvas.addEventListener('pointermove', (event) => {
  if (dragging) setSplit(pointerSplit(event));
});
canvas.addEventListener('pointerup', () => {
  dragging = false;
});

syncList();
say(`foto → ${width} × ${height} · 2 destinos de ${width} × ${height} (RGBA8) que se turnan`);
say(chainLine());
view.renderNow(); // el primer dibujo, ya (sin esperar a un fotograma)
say('Listo: ajusta los filtros, cambia su orden con ↑ ↓ y desliza «Antes | después»');
```

---
example_description: "Un carrusel de tres fotos con cinco transiciones en la GPU (fundido, cortinilla, disolución, iris y píxeles). Cada transición es una función de GLSL que mezcla dos texturas según u_progress, sobre un trozo común que encuadra cada foto como object-fit: cover. Una autocomprobación lee píxeles con readPixels y confirma que cada transición empieza exactamente en la foto A y acaba en la B (sin saltos al final). Dura 1,2 s, se completa al ocultar la página y, con «reducir movimiento», cambia de foto sin animar"
example_tags: "javascript|webgl2|shaders|transiciones|texturas|object-fit|carrusel|readpixels|reduced-motion|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="gallery">
  <h1>Tres imágenes, cinco transiciones</h1>
  <figure class="slide">
    <canvas id="slide" role="img" aria-label=""></canvas>
    <figcaption id="caption" aria-live="polite"></figcaption>
  </figure>
  <div class="controls">
    <button id="previous" type="button">◀ Anterior</button>
    <button id="next" type="button">Siguiente ▶</button>
    <label for="transition">Transición</label>
    <select id="transition">
      <option value="fade">Fundido</option>
      <option value="wipe">Cortinilla</option>
      <option value="dissolve">Disolución</option>
      <option value="iris">Iris</option>
      <option value="pixels">Píxeles</option>
    </select>
  </div>
  <p id="status" class="status" role="status"></p>
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
.gallery {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.slide {
  margin: 0;
}
#slide {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 2;
  background: #020617;
}
figcaption {
  min-height: 2.6em;
  margin-top: 0.4rem;
  font-size: 0.85rem;
}
figcaption small {
  display: block;
  color: #94a3b8;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
button,
select {
  font: inherit;
  padding: 0.25rem 0.6rem;
}
button:focus-visible,
select:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.status {
  min-height: 1.4em;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.75rem;
}
```

# JavaScript

```javascript
// Transiciones entre fotos en la GPU.
//
// Decisiones de diseño:
// - Cada foto es una textura y conserva su tamaño: el trozo común COMMON la encuadra como
//   object-fit: cover (llena el lienzo sin deformar, recorta lo que sobra), así que las fotos
//   pueden tener proporciones distintas (480 × 330, 480 × 323 y 480 × 501).
// - Una transición es una función de GLSL que recibe las dos fotos y u_progress (0 → 1). Un
//   programa por transición, todos con el mismo trozo común: añadir una es añadir una entrada.
// - El patrón de las tres «de máscara» (cortinilla, disolución e iris) es el mismo: cada píxel
//   tiene un umbral n entre 0 y 1 y cambia de foto cuando el progreso lo alcanza:
//   smoothstep(n, n + borde, progreso × (1 + borde)). Con progreso 0 vale 0 en TODOS los
//   píxeles y con progreso 1 vale 1: la animación no salta al principio ni al final.
// - La autocomprobación lo demuestra: con readPixels, cada transición en 0 y en 1 contra la
//   foto sola, en 5 puntos (tolerancia de 1 unidad por los redondeos de mix en float32).
// - Animación de 1,2 s con un botón; si la página se oculta, la transición se completa al
//   instante. Con «reducir movimiento», el cambio es directo (también es una decisión de diseño:
//   el contenido nunca depende de ver la animación).
//
// Usa assets/gl/kit.js (léelo con «Assets») y tres fotos de assets/.
// Alcance: HTML, CSS, JavaScript, DOM, eventos, formularios y este módulo.
import { createView, createProgram, createQuad, createTexture, loadImage, readPixel, createAnimation } from './gl/kit.js';

const PHOTOS = [
  { file: 'valley-of-mexico.jpg', title: 'Valle de México', credit: 'José María Velasco, 1877. Dominio público.',
    alt: 'José María Velasco, Valle de México: el valle visto desde un cerro, con el lago y los volcanes al fondo' },
  { file: 'great-wave.jpg', title: 'La gran ola de Kanagawa', credit: 'Katsushika Hokusai, c. 1831. Dominio público.',
    alt: 'Katsushika Hokusai, La gran ola de Kanagawa: una ola enorme sobre tres barcas, con el monte Fuji al fondo' },
  { file: 'pillars-of-creation.jpg', title: 'Pilares de la creación', credit: 'NASA, ESA y Hubble Heritage Team, 2014. Dominio público.',
    alt: 'Los Pilares de la creación: columnas de gas y polvo de la nebulosa del Águila, vistas por el Hubble' },
];
const DURATION = 1.2; // segundos

const VERTEX = `#version 300 es
layout(location = 0) in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
const COMMON = `#version 300 es
precision highp float;
uniform sampler2D u_from;
uniform sampler2D u_to;
uniform vec2 u_fromSize;   // tamaño de cada foto, en píxeles
uniform vec2 u_toSize;
uniform vec2 u_resolution; // tamaño del lienzo, en píxeles físicos
uniform float u_progress;  // 0: la foto A; 1: la foto B
out vec4 outColor;
// object-fit: cover — escala la foto para cubrir el lienzo y centra el recorte
vec4 cover(sampler2D image, vec2 size, vec2 uv) {
  float canvasAspect = u_resolution.x / u_resolution.y;
  float imageAspect = size.x / size.y;
  vec2 scale = imageAspect > canvasAspect ? vec2(canvasAspect / imageAspect, 1.0) : vec2(1.0, imageAspect / canvasAspect);
  return texture(image, (uv - 0.5) * scale + 0.5);
}
vec4 from(vec2 uv) { return cover(u_from, u_fromSize, uv); }
vec4 to(vec2 uv) { return cover(u_to, u_toSize, uv); }
// El patrón «de máscara»: 0 con progreso 0, 1 con progreso 1, para cualquier umbral n de 0..1
float reveal(float n, float edge) {
  return smoothstep(n, n + edge, u_progress * (1.0 + edge));
}
`;
const TRANSITIONS = {
  show: { label: 'foto sola', body: 'return from(uv);' },
  fade: { label: 'fundido', body: 'return mix(from(uv), to(uv), u_progress);' },
  wipe: { label: 'cortinilla', body: 'return mix(from(uv), to(uv), reveal(uv.x, 0.08)); // de izquierda a derecha' },
  dissolve: { label: 'disolución', body: `vec2 cell = floor(gl_FragCoord.xy / 8.0); // bloques de 8 × 8 píxeles físicos
  float n = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453); // un umbral «al azar» por bloque
  return mix(from(uv), to(uv), reveal(n, 0.05));` },
  iris: { label: 'iris', body: `vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  float n = length((uv - 0.5) * aspect) / length(0.5 * aspect); // 0 en el centro, 1 en las esquinas
  return mix(from(uv), to(uv), reveal(n, 0.06));` },
  pixels: { label: 'píxeles', body: `float block = 1.0 + 47.0 * (1.0 - abs(2.0 * u_progress - 1.0)); // 1 → 48 → 1 píxeles
  vec2 center = (floor(gl_FragCoord.xy / block) + 0.5) * block; // con block = 1, el propio píxel
  vec2 blockUv = center / u_resolution;
  return u_progress < 0.5 ? from(blockUv) : to(blockUv);` },
};
const fragmentFor = (body) => `${COMMON}
vec4 transition(vec2 uv) {
  ${body}
}
void main() {
  outColor = transition(gl_FragCoord.xy / u_resolution);
}`;

// --- Estado y GPU ---------------------------------------------------------------------------------
const statusLine = document.querySelector('#status');
function say(text) {
  statusLine.textContent = text;
  console.log(text);
}
const images = await Promise.all(PHOTOS.map(({ file }) => loadImage(file)));
const canvas = document.querySelector('#slide');
const select = document.querySelector('#transition');
const state = { index: 0, from: 0, to: 0, transition: 'show', progress: 0 };

const view = createView(canvas, {
  setup(gl) {
    return {
      quad: createQuad(gl),
      textures: images.map((image) => createTexture(gl, { source: image })),
      programs: Object.fromEntries(Object.entries(TRANSITIONS).map(([id, { label, body }]) => [id,
        createProgram(gl, { name: label, vertex: VERTEX, fragment: fragmentFor(body) })])),
    };
  },
  render(gl, res) {
    const program = res.programs[state.transition];
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, res.textures[state.from]);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, res.textures[state.to]);
    const values = { u_from: 0, u_fromSize: sizeOf(state.from), u_resolution: [canvas.width, canvas.height] };
    if (state.transition !== 'show') Object.assign(values, { u_to: 1, u_toSize: sizeOf(state.to), u_progress: state.progress });
    program.set(values); // «show» no usa u_to ni u_progress: el compilador los quitó, y GLKit lo sabe
    gl.bindVertexArray(res.quad);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  },
  onStatus(status) {
    say(status === 'lost' ? '⚠️ contexto WebGL perdido: la foto vuelve en cuanto se recupere' : '✅ contexto recuperado: 3 texturas y 6 programas creados de nuevo');
  },
});
const sizeOf = (index) => [images[index].naturalWidth, images[index].naturalHeight];

// --- Autocomprobación: ¿empieza en A y acaba en B? ------------------------------------------------
function sample(setup) {
  Object.assign(state, setup);
  view.renderNow();
  return [[0.5, 0.5], [0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8]]
    .map(([fx, fy]) => readPixel(view.gl, fx * canvas.width, fy * canvas.height));
}
const samePixels = (a, b) => a.every((pixel, i) => pixel.every((v, c) => Math.abs(v - b[i][c]) <= 1));
function selfTest() {
  const photoA = sample({ transition: 'show', from: 0, to: 0 });
  const photoB = sample({ transition: 'show', from: 1, to: 1 });
  let passed = 0;
  let total = 0;
  for (const id of Object.keys(TRANSITIONS).filter((id) => id !== 'show')) {
    for (const [progress, expected] of [[0, photoA], [1, photoB]]) {
      total += 1;
      if (samePixels(sample({ transition: id, from: 0, to: 1, progress }), expected)) passed += 1;
      else console.warn(`❌ ${TRANSITIONS[id].label} con progreso ${progress} no coincide con la foto ${progress ? 'B' : 'A'}`);
    }
  }
  Object.assign(state, { transition: 'show', from: state.index, to: state.index, progress: 0 });
  view.renderNow();
  return `autocomprobación: cada transición empieza en la foto A y acaba en la B → ${passed} de ${total} ${passed === total ? '✅' : '❌'}`;
}

// --- El carrusel ------------------------------------------------------------------------------------
const caption = document.querySelector('#caption');
function showCaption() {
  const photo = PHOTOS[state.index];
  caption.innerHTML = `${photo.title} <small>${photo.credit} · ${state.index + 1} de ${PHOTOS.length}</small>`;
  canvas.setAttribute('aria-label', photo.alt);
}
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2); // lento-rápido-lento
const animation = createAnimation({
  frame(seconds) {
    state.progress = ease(Math.min(1, seconds / DURATION));
    view.renderNow();
    return seconds < DURATION;
  },
  onStop() { // al terminar, al pararla o al ocultar la página: queda la foto nueva
    finish();
  },
});
function finish() {
  Object.assign(state, { transition: 'show', from: state.index, to: state.index, progress: 0 });
  view.renderNow();
  showCaption();
  say(`✅ ${PHOTOS[state.index].title} (${state.index + 1} de ${PHOTOS.length})`);
}
function go(step) {
  animation.stop(); // si había una a medias, se completa
  const from = state.index;
  state.index = (state.index + step + PHOTOS.length) % PHOTOS.length;
  const id = select.value;
  Object.assign(state, { transition: id, from, to: state.index, progress: 0 });
  if (animation.start() === 'reduced') {
    say(`cambio directo (movimiento reducido): ${PHOTOS[from].title} → ${PHOTOS[state.index].title}`);
    finish();
    return;
  }
  say(`▶ ${TRANSITIONS[id].label}: ${PHOTOS[from].title} → ${PHOTOS[state.index].title} (${DURATION} s)`);
}
document.querySelector('#next').addEventListener('click', () => go(1));
document.querySelector('#previous').addEventListener('click', () => go(-1));

const names = Object.entries(TRANSITIONS).filter(([id]) => id !== 'show').map(([, { label }]) => label);
say(`${PHOTOS.length} fotos · ${names.length} transiciones (${names.join(', ')}), 1 programa por transición`);
say(selfTest());
showCaption();
say('Listo: elige una transición y pulsa «Siguiente ▶» (o «◀ Anterior»)');
```

---
example_description: "Un visor de zoom profundo para el cuadro de Velasco a 960 × 660: la obra es una textura con mipmaps (la pirámide de niveles de un visor de teselas, calculada por la GPU), se acerca hasta 64 veces alrededor del puntero (Ctrl + rueda o pellizco), se arrastra, se recorre con el teclado y tiene una visita guiada a cinco detalles. Al ampliar mucho, NEAREST y una rejilla dejan ver los píxeles reales; un minimapa, dibujado con un segundo viewport en el mismo lienzo, dice dónde estás"
example_tags: "javascript|webgl2|mipmaps|zoom|pan|viewport|minimapa|texturas|accesibilidad|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="viewer">
  <h1>El valle de México, de cerca</h1>
  <canvas id="painting" tabindex="0" role="img" aria-label="José María Velasco, Valle de México: el valle visto desde un cerro, con el lago, los volcanes y un gran cúmulo de nubes" aria-describedby="where"></canvas>
  <p id="where" class="where"></p>
  <div class="tools">
    <button id="zoom-in" type="button" aria-label="Acercar">＋</button>
    <button id="zoom-out" type="button" aria-label="Alejar">－</button>
    <button id="reset" type="button">Toda la obra</button>
    <label><input id="pixels" type="checkbox" checked> Ver los píxeles al ampliar</label>
  </div>
  <nav class="tour" aria-label="Visita guiada">
    <span>Visita guiada:</span>
    <button type="button" data-spot="0">Los volcanes</button>
    <button type="button" data-spot="1">La gran nube</button>
    <button type="button" data-spot="2">El camino</button>
    <button type="button" data-spot="3">El nopal</button>
    <button type="button" data-spot="4">El ave</button>
  </nav>
  <p class="help">Arrastra para moverte; <kbd>Ctrl</kbd> + rueda o pellizca para acercar; haz clic en el minimapa para saltar. Con el teclado: flechas, <kbd>+</kbd> y <kbd>−</kbd>, <kbd>0</kbd> para ver toda la obra.</p>
  <p id="status" class="status" role="status"></p>
  <p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
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
.viewer {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
#painting {
  display: block;
  width: 100%;
  aspect-ratio: 960 / 660;
  background: #020617;
  touch-action: none; /* arrastrar y pellizcar son del visor, no de la página */
  cursor: grab;
}
#painting:focus-visible,
button:focus-visible,
input:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.where {
  min-height: 1.4em;
  margin: 0.4rem 0;
  font-size: 0.85rem;
}
.tools,
.tour {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.4rem;
}
.tour span {
  font-size: 0.85rem;
  color: #94a3b8;
}
button {
  font: inherit;
  padding: 0.2rem 0.6rem;
}
.help,
.credit {
  font-size: 0.8rem;
  color: #94a3b8;
}
.status {
  min-height: 1.4em;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.75rem;
}
```

# JavaScript

```javascript
// Un visor de zoom profundo.
//
// Decisiones de diseño:
// - La obra es UNA textura con mipmaps. Los visores de imágenes gigantes (mapas, escaneos de
//   museo) guardan la misma pirámide en disco, cortada en teselas de 256 × 256, porque la foto
//   entera no cabe: MAX_TEXTURE_SIZE limita cada textura (16384 px por lado en el Mac del curso).
//   Esta cabe, y generateMipmap calcula la pirámide en la GPU.
// - La cámara son 3 números: el píxel de la obra que está en el centro y el zoom (1 = la obra
//   entera). El fragment shader convierte cada píxel de la pantalla en un píxel de la obra; la
//   GPU elige el nivel de mipmap según cuánto se reduce (sin muaré al alejar).
// - Al ampliar: MAG_FILTER NEAREST (cuadrados nítidos: los píxeles reales del archivo) y, desde
//   12 píxeles de pantalla por píxel, una rejilla. Es un ajuste de la textura, no del shader.
// - Acercar alrededor de un punto: el píxel de la obra que está bajo el puntero no se mueve.
// - El minimapa es otra pasada del mismo programa en un viewport más pequeño del mismo lienzo
//   (gl.viewport): no hace falta otro lienzo ni otro contexto.
// - La visita guiada vuela 1 s hasta cada detalle (zoom en escala logarítmica); con «reducir
//   movimiento», salta. Se dibuja solo cuando algo cambia, como mucho una vez por fotograma.
//
// Usa assets/gl/kit.js (léelo con «Assets») y assets/valley-of-mexico-960.jpg.
// Alcance: HTML, CSS, JavaScript, DOM, eventos de puntero, rueda y teclado y este módulo.
import { createView, createProgram, createQuad, createTexture, loadImage, createAnimation } from './gl/kit.js';

const MAX_ZOOM = 64;
const SPOTS = [ // píxeles de la obra (y hacia abajo, como en el archivo)
  { name: 'Los volcanes', x: 188, y: 236, zoom: 6 },
  { name: 'La gran nube', x: 520, y: 160, zoom: 3 },
  { name: 'El camino', x: 455, y: 350, zoom: 4 },
  { name: 'El nopal', x: 268, y: 514, zoom: 8 },
  { name: 'El ave', x: 598, y: 514, zoom: 16 },
];

const VERTEX = `#version 300 es
layout(location = 0) in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
const FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform vec2 u_imageSize; // en píxeles de la obra
uniform vec4 u_viewport;  // x, y, ancho y alto de esta pasada, en píxeles del lienzo
uniform vec2 u_center;    // el píxel de la obra que queda en el centro (y hacia abajo)
uniform float u_scale;    // píxeles de pantalla por píxel de la obra
uniform bool u_grid;
uniform vec4 u_rect;      // solo en el minimapa: la vista principal (x0, y0, x1, y1)
out vec4 outColor;
void main() {
  vec2 local = gl_FragCoord.xy - u_viewport.xy - 0.5 * u_viewport.zw; // desde el centro, y hacia arriba
  vec2 image = u_center + vec2(local.x, -local.y) / u_scale;            // píxeles de la obra
  vec2 uv = vec2(image.x / u_imageSize.x, 1.0 - image.y / u_imageSize.y); // subida con FLIP_Y
  vec3 color = texture(u_image, uv).rgb; // con mipmaps: la GPU elige el nivel
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) color = vec3(2.0, 6.0, 23.0) / 255.0;
  if (u_grid && u_scale >= 12.0) {
    vec2 inside = fract(image) * u_scale; // dentro del píxel de la obra, en píxeles de pantalla
    if (inside.x < 1.0 || inside.y < 1.0) color *= 0.6;
  }
  if (u_rect.z > u_rect.x) { // el minimapa: oscurece lo que no se ve y marca el borde de la vista
    float edge = min(min(image.x - u_rect.x, u_rect.z - image.x), min(image.y - u_rect.y, u_rect.w - image.y)) * u_scale;
    if (edge < 0.0) color *= 0.45;
    else if (edge < 2.0) color = vec3(1.0);
    vec2 border = 0.5 * u_viewport.zw - abs(local);
    if (min(border.x, border.y) < 1.5) color = vec3(0.58, 0.64, 0.72);
  }
  outColor = vec4(color, 1.0);
}`;

// --- Carga y GPU ------------------------------------------------------------------------------
const statusLine = document.querySelector('#status');
function say(text) {
  statusLine.textContent = text;
  console.log(text);
}
const image = await loadImage('valley-of-mexico-960.jpg');
const IMAGE = [image.naturalWidth, image.naturalHeight];
const canvas = document.querySelector('#painting');
const pixelsBox = document.querySelector('#pixels');
const camera = { cx: IMAGE[0] / 2, cy: IMAGE[1] / 2, zoom: 1 };

// Cuánto de la obra cabe en el lienzo, en píxeles de la obra
const fitScale = () => Math.min(canvas.width / IMAGE[0], canvas.height / IMAGE[1]);
const scale = () => fitScale() * camera.zoom;
const visible = () => [canvas.width / scale(), canvas.height / scale()];
function clampCamera() {
  camera.zoom = Math.min(MAX_ZOOM, Math.max(1, camera.zoom));
  const [w, h] = visible();
  camera.cx = w >= IMAGE[0] ? IMAGE[0] / 2 : Math.min(IMAGE[0] - w / 2, Math.max(w / 2, camera.cx));
  camera.cy = h >= IMAGE[1] ? IMAGE[1] / 2 : Math.min(IMAGE[1] - h / 2, Math.max(h / 2, camera.cy));
}
const minimap = () => { // en píxeles del lienzo, con y hacia arriba (como gl.viewport)
  const width = Math.round(canvas.width * 0.26);
  const height = Math.round((width * IMAGE[1]) / IMAGE[0]);
  const margin = Math.round(8 * devicePixelRatio);
  return { x: canvas.width - width - margin, y: margin, width, height };
};

const view = createView(canvas, {
  setup(gl) {
    return {
      quad: createQuad(gl),
      program: createProgram(gl, { name: 'visor', vertex: VERTEX, fragment: FRAGMENT }),
      texture: createTexture(gl, { source: image, mipmaps: true }), // + LINEAR_MIPMAP_LINEAR
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    };
  },
  render(gl, res) {
    clampCamera();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, res.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, pixelsBox.checked ? gl.NEAREST : gl.LINEAR);
    gl.bindVertexArray(res.quad);
    // 1.ª pasada: la vista, en todo el lienzo
    gl.viewport(0, 0, canvas.width, canvas.height);
    const [w, h] = visible();
    res.program.set({
      u_image: 0, u_imageSize: IMAGE, u_viewport: [0, 0, canvas.width, canvas.height],
      u_center: [camera.cx, camera.cy], u_scale: scale(), u_grid: pixelsBox.checked, u_rect: [0, 0, 0, 0],
    });
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // 2.ª pasada: el minimapa, la obra entera en un viewport pequeño, con la vista marcada
    if (camera.zoom > 1.01) {
      const mini = minimap();
      gl.viewport(mini.x, mini.y, mini.width, mini.height);
      res.program.set({
        u_viewport: [mini.x, mini.y, mini.width, mini.height], u_center: [IMAGE[0] / 2, IMAGE[1] / 2],
        u_scale: mini.width / IMAGE[0], u_grid: false,
        u_rect: [camera.cx - w / 2, camera.cy - h / 2, camera.cx + w / 2, camera.cy + h / 2],
      });
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    where.textContent = describe(); // solo texto en la página: la consola, al terminar un gesto
  },
  onStatus(status) {
    say(status === 'lost' ? '⚠️ contexto WebGL perdido: la obra vuelve en cuanto se recupere' : '✅ contexto recuperado: textura y mipmaps creados de nuevo');
  },
});

// --- Texto -----------------------------------------------------------------------------------------
const where = document.querySelector('#where');
function describe() {
  const [w, h] = visible();
  const zoom = Math.round(camera.zoom * 10) / 10;
  if (zoom === 1) return `vista: toda la obra · centro → píxel (${Math.round(camera.cx)}, ${Math.round(camera.cy)}) · zoom ×1`;
  return `vista: zoom ×${zoom} · centro → píxel (${Math.round(camera.cx)}, ${Math.round(camera.cy)}) · se ven ${Math.round(w)} × ${Math.round(h)} píxeles de la obra`;
}
function changed(log = true) {
  clampCamera();
  view.invalidate();
  if (log) say(describe());
}

// --- Acercar alrededor de un punto (fracciones del lienzo, y hacia abajo) ---------------------------
function zoomAt(factor, fx = 0.5, fy = 0.5) {
  const [w, h] = visible();
  const anchor = [camera.cx + (fx - 0.5) * w, camera.cy + (fy - 0.5) * h]; // el píxel de la obra bajo el punto
  camera.zoom = Math.min(MAX_ZOOM, Math.max(1, camera.zoom * factor));
  const [w2, h2] = visible();
  camera.cx = anchor[0] - (fx - 0.5) * w2; // que siga bajo el mismo punto
  camera.cy = anchor[1] - (fy - 0.5) * h2;
}
const fractionAt = (event) => {
  const box = canvas.getBoundingClientRect();
  return [(event.clientX - box.left) / box.width, (event.clientY - box.top) / box.height];
};
// ¿Está el punto (fracciones) dentro del minimapa? Devuelve el píxel de la obra, o null
function minimapPixel([fx, fy]) {
  if (camera.zoom <= 1.01) return null;
  const mini = minimap();
  const x = fx * canvas.width - mini.x;
  const y = (1 - fy) * canvas.height - mini.y;
  if (x < 0 || y < 0 || x > mini.width || y > mini.height) return null;
  return [(x / mini.width) * IMAGE[0], (1 - y / mini.height) * IMAGE[1]];
}

// --- Puntero: arrastrar, pellizcar, clic en el minimapa ----------------------------------------------
const pointers = new Map();
let gesture = null;
canvas.addEventListener('pointerdown', (event) => {
  flight.stop();
  const point = fractionAt(event);
  const jump = minimapPixel(point);
  if (jump) {
    [camera.cx, camera.cy] = jump;
    return changed();
  }
  canvas.setPointerCapture(event.pointerId);
  pointers.set(event.pointerId, point);
  gesture = { start: new Map(pointers), camera: { ...camera } };
});
canvas.addEventListener('pointermove', (event) => {
  if (!pointers.has(event.pointerId)) return;
  pointers.set(event.pointerId, fractionAt(event));
  const starts = [...gesture.start.values()];
  Object.assign(camera, gesture.camera);
  if (gesture.start.size === 1) { // arrastrar: la obra sigue al dedo
    const [now] = pointers.values();
    const [w, h] = visible();
    camera.cx -= (now[0] - starts[0][0]) * w;
    camera.cy -= (now[1] - starts[0][1]) * h;
  } else if (pointers.size === 2) { // pellizcar: zoom alrededor del punto medio
    const [p, q] = [...pointers.values()];
    const factor = Math.hypot(p[0] - q[0], p[1] - q[1]) / Math.max(0.01, Math.hypot(starts[0][0] - starts[1][0], starts[0][1] - starts[1][1]));
    zoomAt(factor, (starts[0][0] + starts[1][0]) / 2, (starts[0][1] + starts[1][1]) / 2);
  }
  changed(false);
});
function endPointer(event) {
  if (!pointers.delete(event.pointerId) || pointers.size > 0) return;
  gesture = null;
  say(describe());
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
let wheelTimer = 0;
canvas.addEventListener('wheel', (event) => {
  if (!event.ctrlKey && !event.metaKey) { // la rueda sola desplaza la página
    statusLine.textContent = 'Para acercar, usa Ctrl + rueda (o pellizca en el trackpad)';
    return;
  }
  event.preventDefault();
  flight.stop();
  zoomAt(Math.exp(-event.deltaY * 0.01), ...fractionAt(event));
  changed(false);
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => say(describe()), 300);
}, { passive: false });

// --- Teclado y botones ---------------------------------------------------------------------------------
canvas.addEventListener('keydown', (event) => {
  const [w, h] = visible();
  const pans = { ArrowLeft: [-0.1 * w, 0], ArrowRight: [0.1 * w, 0], ArrowUp: [0, -0.1 * h], ArrowDown: [0, 0.1 * h] };
  if (pans[event.key]) {
    camera.cx += pans[event.key][0];
    camera.cy += pans[event.key][1];
  } else if (event.key === '+' || event.key === '=') zoomAt(2);
  else if (event.key === '-') zoomAt(0.5);
  else if (event.key === '0') Object.assign(camera, { cx: IMAGE[0] / 2, cy: IMAGE[1] / 2, zoom: 1 });
  else return;
  event.preventDefault();
  flight.stop();
  changed();
});
document.querySelector('#zoom-in').addEventListener('click', () => { flight.stop(); zoomAt(2); changed(); });
document.querySelector('#zoom-out').addEventListener('click', () => { flight.stop(); zoomAt(0.5); changed(); });
document.querySelector('#reset').addEventListener('click', () => {
  flight.stop();
  Object.assign(camera, { cx: IMAGE[0] / 2, cy: IMAGE[1] / 2, zoom: 1 });
  changed();
});
pixelsBox.addEventListener('change', () => view.invalidate());

// --- La visita guiada: un vuelo de 1 s (o un salto, con «reducir movimiento») ---------------------------
let trip = null;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const flight = createAnimation({
  frame(seconds) {
    const t = ease(Math.min(1, seconds));
    camera.cx = trip.from.cx + (trip.to.x - trip.from.cx) * t;
    camera.cy = trip.from.cy + (trip.to.y - trip.from.cy) * t;
    camera.zoom = trip.from.zoom * (trip.to.zoom / trip.from.zoom) ** t; // logarítmico: cada paso multiplica
    view.renderNow();
    return seconds < 1;
  },
  onStop() { // al llegar, al interrumpirlo o al ocultar la página: en el destino
    Object.assign(camera, { cx: trip.to.x, cy: trip.to.y, zoom: trip.to.zoom });
    changed(false);
    say(`📍 ${trip.to.name} → ${describe().replace('vista: ', '')}`);
  },
});
document.querySelector('.tour').addEventListener('click', (event) => {
  const button = event.target.closest('[data-spot]');
  if (!button) return;
  flight.stop();
  trip = { from: { ...camera }, to: SPOTS[Number(button.dataset.spot)] };
  if (flight.start() === 'reduced') {
    Object.assign(camera, { cx: trip.to.x, cy: trip.to.y, zoom: trip.to.zoom });
    changed(false);
    say(`📍 ${trip.to.name} → ${describe().replace('vista: ', '')} (sin vuelo: movimiento reducido)`);
  }
});

const levels = Math.floor(Math.log2(Math.max(...IMAGE))) + 1;
let mipBytes = 0;
for (let level = 1, w = IMAGE[0], h = IMAGE[1]; level < levels; level++) {
  w = Math.max(1, Math.floor(w / 2));
  h = Math.max(1, Math.floor(h / 2));
  mipBytes += w * h * 4;
}
const bytes = IMAGE[0] * IMAGE[1] * 4;
say(`obra → ${IMAGE[0]} × ${IMAGE[1]} · ${levels} niveles de mipmap (${IMAGE.join(' × ')} … 1 × 1) · ${bytes} bytes + ${mipBytes} de mipmaps (+${Math.round((mipBytes / bytes) * 100)} %)`);
const max = view.resources.maxTextureSize;
say(`MAX_TEXTURE_SIZE → ${max} px por lado: una imagen de 40000 × 30000 px necesitaría ${Math.ceil(40000 / max)} × ${Math.ceil(30000 / max)} texturas (o teselas)`);
view.renderNow();
say(describe());
say('Listo: arrastra, usa Ctrl + rueda o pellizca, el teclado o la visita guiada');
```

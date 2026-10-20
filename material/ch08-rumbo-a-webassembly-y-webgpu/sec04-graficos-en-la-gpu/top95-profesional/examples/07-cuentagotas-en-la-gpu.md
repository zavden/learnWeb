---
example_description: "Un cuentagotas para una carta de colores que dibuja la GPU (8 colores con nombre y un degradado HSL): la carta vive en un framebuffer propio, así que readPixels puede leerla en cualquier momento, sin redibujar y sin preserveDrawingBuffer. Pasa de coordenadas del puntero a píxeles de la carta (con la y al revés), lee una lupa de 11 × 11 píxeles, da el color en hexadecimal con su contraste WCAG y lo comprueba contra la misma fórmula en JavaScript. Funciona con el teclado (flechas, Mayús y Enter), y un botón muestra el error clásico: leer el lienzo en otra tarea"
example_tags: "javascript|webgl2|readpixels|framebuffers|cuentagotas|hsl|contraste|teclado|preserve-drawing-buffer|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="dropper">
  <h1>Cuentagotas en la GPU</h1>
  <canvas id="chart" tabindex="0" role="img" aria-label="Carta de colores: arriba, ocho colores con nombre; abajo, un degradado de tonos y luminosidades" aria-describedby="help"></canvas>
  <p id="help" class="help">Pasa el puntero y haz clic para guardar un color. Con el teclado: Tab hasta la carta, flechas (con Mayús, de 10 en 10 píxeles) y Enter.</p>
  <div class="reading">
    <canvas id="loupe" aria-hidden="true"></canvas>
    <p id="sample" class="sample"></p>
  </div>
  <button id="canvas-read" type="button">🐛 Leer del lienzo, no del framebuffer</button>
  <h2>Paleta</h2>
  <ul id="palette" class="palette"></ul>
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
.dropper {
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
  margin: 0.8rem 0 0.3rem;
}
#chart {
  display: block;
  width: 100%;
  aspect-ratio: 320 / 200;
  cursor: crosshair;
}
#chart:focus-visible,
button:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.help {
  font-size: 0.8rem;
  color: #94a3b8;
}
.reading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.6rem;
}
#loupe {
  width: 88px;
  height: 88px;
  image-rendering: pixelated; /* 11 × 11 píxeles de verdad, ampliados sin suavizar */
  border: 1px solid #475569;
  background: #020617;
}
.sample {
  margin: 0;
  padding: 0.4rem 0.6rem;
  border-radius: 0.3rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
button {
  font: inherit;
  padding: 0.25rem 0.7rem;
}
.palette {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.75rem;
}
.palette li {
  padding: 0.3rem 0.5rem;
  border-radius: 0.3rem;
}
.status {
  min-height: 2.6em;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.75rem;
}
```

# JavaScript

```javascript
// Un cuentagotas que lee lo que ha dibujado la GPU.
//
// Decisiones de diseño:
// - La carta (320 × 200 píxeles) se dibuja UNA vez en un framebuffer propio, y el lienzo solo
//   la muestra ampliada, con el cursor encima. Ventajas: el cursor nunca ensucia lo que se lee,
//   y readPixels sobre ese framebuffer funciona en cualquier evento. El lienzo, en cambio, se
//   borra cada vez que el navegador lo presenta (preserveDrawingBuffer: false, el valor por
//   defecto y el más rápido): el botón 🐛 lo lee en otra tarea y no encuentra la carta.
// - Coordenadas: el puntero da px CSS con la y hacia abajo; la carta se mide en sus píxeles con
//   la y hacia arriba. chartPixelAt() hace la conversión (y no necesita devicePixelRatio: es
//   una proporción entre la caja y la carta).
// - La lupa: readPixels de 11 × 11 píxeles a un ImageData, dando la vuelta a las filas (las de
//   readPixels empiezan por abajo). Lo que cae fuera de la carta queda a 0: transparente.
// - Cada lectura se comprueba con expectedColor(), la misma fórmula del shader en JavaScript:
//   iguales en las muestras de color (bytes exactos) y con ±1 en el degradado (float32).
// - Contraste WCAG con blanco y negro, como en el cuentagotas de canvas 2D de «Gráficos y
//   animación»; aquí la imagen no existe en la CPU: está en la memoria de la GPU.
//
// Usa assets/gl/kit.js (léelo con «Assets»).
// Alcance: HTML, CSS, JavaScript, DOM, eventos de puntero y teclado, canvas 2D y este módulo.
import { createView, createProgram, createQuad, createTarget, bindCanvas, readPixel } from './gl/kit.js';

const CHART_WIDTH = 320;
const CHART_HEIGHT = 200;
const SWATCHES = [ // la fila de arriba: y de 120 a 199, 40 píxeles de ancho cada una
  { name: 'rosa mexicano', rgb: [228, 0, 124] },
  { name: 'cempasúchil', rgb: [255, 159, 28] },
  { name: 'azul talavera', rgb: [30, 58, 138] },
  { name: 'verde nopal', rgb: [77, 124, 15] },
  { name: 'amarillo maíz', rgb: [250, 204, 21] },
  { name: 'turquesa', rgb: [13, 148, 136] },
  { name: 'barro', rgb: [154, 52, 18] },
  { name: 'añil', rgb: [49, 46, 129] },
];
const GRADIENT_TOP = 120; // debajo, el degradado: tono en horizontal, luminosidad en vertical
const SATURATION = 0.85;

// --- La carta: la misma fórmula en GLSL y en JavaScript ----------------------------------------
const VERTEX = `#version 300 es
layout(location = 0) in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
const SCENE = `#version 300 es
precision highp float;
uniform vec3 u_swatches[8];
out vec4 outColor;
// hsl() de CSS (Color 4): h en grados; s y l de 0 a 1
vec3 hsl(float h, float s, float l) {
  vec3 k = mod(vec3(0.0, 8.0, 4.0) + h / 30.0, 12.0);
  return l - s * min(l, 1.0 - l) * max(min(min(k - 3.0, 9.0 - k), 1.0), -1.0);
}
void main() {
  vec2 p = gl_FragCoord.xy; // el viewport es la carta: 320 × 200, un fragmento por píxel
  if (p.y >= ${GRADIENT_TOP}.0) {
    outColor = vec4(u_swatches[int(p.x / 40.0)], 1.0);
  } else {
    outColor = vec4(hsl(p.x / ${CHART_WIDTH}.0 * 360.0, ${SATURATION}, 0.15 + 0.7 * p.y / ${GRADIENT_TOP}.0), 1.0);
  }
}`;
function hslToRgb(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  return [0, 8, 4].map((n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  });
}
// Qué debería haber en el píxel (x, y) de la carta, y cómo se llama
function expectedColor(x, y) {
  if (y >= GRADIENT_TOP) {
    const { name, rgb } = SWATCHES[Math.floor(x / 40)];
    return { name, rgb, exact: true };
  }
  const hue = ((x + 0.5) / CHART_WIDTH) * 360; // el centro del píxel, como gl_FragCoord
  const lightness = 0.15 + (0.7 * (y + 0.5)) / GRADIENT_TOP;
  return {
    name: `degradado hsl(${Math.round(hue)}°, ${SATURATION * 100} %, ${Math.round(lightness * 100)} %)`,
    rgb: hslToRgb(hue, SATURATION, lightness).map((v) => Math.round(v * 255)),
    exact: false,
  };
}
// La vista: la carta ampliada con NEAREST y, encima, el cursor (un cuadrado de 7 × 7 píxeles)
const DISPLAY = `#version 300 es
precision highp float;
uniform sampler2D u_chart;
uniform ivec2 u_cursor;
in vec2 v_uv;
out vec4 outColor;
void main() {
  ivec2 size = textureSize(u_chart, 0);
  ivec2 pixel = ivec2(v_uv * vec2(size));
  vec3 color = texelFetch(u_chart, pixel, 0).rgb;
  ivec2 d = abs(pixel - u_cursor);
  if (max(d.x, d.y) == 3) color = vec3(1.0); // el borde del cuadrado
  if (max(d.x, d.y) == 4) color = vec3(0.0); // y un contorno negro: se ve sobre cualquier color
  outColor = vec4(color, 1.0);
}`;

// --- Contraste WCAG ---------------------------------------------------------------------------------
const toHex = ([r, g, b]) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
function luminance(rgb) {
  const linear = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Math.round(((light + 0.05) / (dark + 0.05)) * 100) / 100;
}
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
const textFor = (rgb) => (contrast(rgb, WHITE) >= contrast(rgb, BLACK) ? '#ffffff' : '#000000');

// --- La GPU -------------------------------------------------------------------------------------------
const statusLine = document.querySelector('#status');
function say(text) {
  statusLine.textContent = text;
  console.log(text);
}
const canvas = document.querySelector('#chart');
let cursor = [20, 160]; // en píxeles de la carta, y hacia arriba: en el primer color
let showCursor = false;

const view = createView(canvas, {
  setup(gl) {
    const quad = createQuad(gl);
    const chart = createTarget(gl, CHART_WIDTH, CHART_HEIGHT); // RGBA8, NEAREST
    const scene = createProgram(gl, { name: 'carta', vertex: VERTEX, fragment: SCENE });
    chart.bind(); // la carta se dibuja una vez, aquí (y otra vez si se recupera el contexto)
    scene.set({ u_swatches: SWATCHES.flatMap(({ rgb }) => rgb.map((c) => c / 255)) });
    gl.bindVertexArray(quad);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    bindCanvas(gl);
    return { quad, chart, display: createProgram(gl, { name: 'vista', vertex: VERTEX, fragment: DISPLAY }) };
  },
  render(gl, res) {
    bindCanvas(gl);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, res.chart.texture);
    res.display.set({ u_chart: 0, u_cursor: showCursor ? cursor : [-100, -100] });
    gl.bindVertexArray(res.quad);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  },
  onStatus(status) {
    say(status === 'lost' ? '⚠️ contexto WebGL perdido: la carta vuelve en cuanto se recupere' : '✅ contexto recuperado: carta dibujada de nuevo en su framebuffer');
  },
});

// Leer del framebuffer de la carta: un píxel, o un bloque para la lupa
function readChart(x, y, width = 1, height = 1) {
  const { gl, resources: res } = view;
  const pixels = new Uint8Array(width * height * 4); // lo que quede fuera de la carta: 0
  res.chart.bind();
  gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  bindCanvas(gl);
  return pixels;
}

const loupe = document.querySelector('#loupe');
const loupeCtx = loupe.getContext('2d');
loupe.width = 11;
loupe.height = 11;
const sampleLine = document.querySelector('#sample');
function sample() {
  if (!view.resources) return null;
  const [x, y] = cursor;
  const block = readChart(x - 5, y - 5, 11, 11);
  const image = new ImageData(11, 11);
  for (let row = 0; row < 11; row++) { // readPixels: fila 0 = abajo; ImageData: fila 0 = arriba
    image.data.set(block.subarray(row * 44, row * 44 + 44), (10 - row) * 44);
  }
  loupeCtx.putImageData(image, 0, 0);
  const rgb = Array.from(block.subarray(5 * 44 + 20, 5 * 44 + 23)); // el píxel del centro
  const expected = expectedColor(x, y);
  const ok = rgb.every((v, i) => Math.abs(v - expected.rgb[i]) <= (expected.exact ? 0 : 1));
  const text = `(${x}, ${y}) → ${toHex(rgb)} · rgb(${rgb.join(', ')}) · ${expected.name} · contraste: blanco ${contrast(rgb, WHITE)}, negro ${contrast(rgb, BLACK)} ${ok ? '✅' : `❌ esperado ${expected.rgb.join(', ')}`}`;
  sampleLine.textContent = text;
  sampleLine.style.background = toHex(rgb);
  sampleLine.style.color = textFor(rgb); // el texto que mejor se lee sobre ese color
  return { rgb, text };
}
function moveTo(x, y) {
  cursor = [Math.min(CHART_WIDTH - 1, Math.max(0, x)), Math.min(CHART_HEIGHT - 1, Math.max(0, y))];
  view.invalidate();
  return sample();
}

const palette = [];
function save() {
  const result = sample();
  if (!result) return;
  const hex = toHex(result.rgb);
  if (!palette.includes(hex)) palette.unshift(hex);
  palette.length = Math.min(palette.length, 8);
  document.querySelector('#palette').replaceChildren(...palette.map((color) => {
    const item = document.createElement('li');
    const rgb = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
    Object.assign(item.style, { background: color, color: textFor(rgb) });
    item.textContent = color;
    return item;
  }));
  say(`💧 ${result.text}`);
}

// --- Puntero y teclado ---------------------------------------------------------------------------------
function chartPixelAt(event) {
  const box = canvas.getBoundingClientRect();
  return [
    Math.floor(((event.clientX - box.left) / box.width) * CHART_WIDTH),
    CHART_HEIGHT - 1 - Math.floor(((event.clientY - box.top) / box.height) * CHART_HEIGHT), // y al revés
  ];
}
canvas.addEventListener('pointermove', (event) => {
  showCursor = true;
  moveTo(...chartPixelAt(event));
});
canvas.addEventListener('pointerleave', () => {
  showCursor = document.activeElement === canvas;
  view.invalidate();
});
canvas.addEventListener('click', (event) => {
  moveTo(...chartPixelAt(event));
  save();
});
canvas.addEventListener('focus', () => {
  showCursor = true;
  moveTo(...cursor);
});
canvas.addEventListener('blur', () => {
  showCursor = false;
  view.invalidate();
});
canvas.addEventListener('keydown', (event) => {
  const step = event.shiftKey ? 10 : 1;
  const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
  if (moves[event.key]) {
    const result = moveTo(cursor[0] + moves[event.key][0], cursor[1] + moves[event.key][1]);
    if (result) statusLine.textContent = result.text; // se anuncia (role="status"), sin llenar la consola
  } else if (event.key === 'Enter' || event.key === ' ') {
    save();
  } else {
    return;
  }
  event.preventDefault();
});

// 🐛 El lienzo, leído en otra tarea (un clic, mucho después del último dibujo)
document.querySelector('#canvas-read').addEventListener('click', () => {
  if (!view.resources) return;
  const [x, y] = cursor;
  const fromCanvas = readPixel(view.gl, ((x + 0.5) / CHART_WIDTH) * canvas.width, ((y + 0.5) / CHART_HEIGHT) * canvas.height);
  const fromChart = Array.from(readChart(x, y));
  say(`🐛 lienzo, en otra tarea → ${fromCanvas.join(', ')} · ✅ framebuffer de la carta → ${fromChart.join(', ')}`);
});

say(`carta → ${CHART_WIDTH} × ${CHART_HEIGHT} píxeles en un framebuffer propio · ${SWATCHES.length} colores con nombre y un degradado HSL`);
view.renderNow(); // el primer dibujo, ya (sin esperar a un fotograma)
sample();
say('Listo: mueve el puntero (clic para guardar) o entra con Tab: flechas (Mayús: de 10 en 10) y Enter');
```

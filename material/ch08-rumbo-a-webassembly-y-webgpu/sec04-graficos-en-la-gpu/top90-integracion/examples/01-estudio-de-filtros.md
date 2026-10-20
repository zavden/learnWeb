---
example_description: "Un estudio de filtros en la GPU: una sola textura (el cuadro de Velasco) y tres programas (ajustes de brillo, contraste y saturación; duotono con dos colores; pixelado) que se eligen con botones de radio; los controles del formulario son uniforms. Tras cada dibujo, readPixels lee la imagen y JavaScript calcula su histograma de luminancia, como en la lección «Píxeles»"
example_tags: "javascript|webgl2|shaders|uniforms|texturas|readpixels|histograma|formularios"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="studio">
  <h1>Estudio de filtros</h1>
  <canvas id="photo" role="img" aria-label="José María Velasco, Valle de México, con el filtro elegido"></canvas>
  <form id="filters">
    <fieldset class="modes">
      <legend>Filtro</legend>
      <label><input type="radio" name="mode" value="adjust" checked> Ajustes</label>
      <label><input type="radio" name="mode" value="duotone"> Duotono</label>
      <label><input type="radio" name="mode" value="pixelate"> Pixelado</label>
    </fieldset>
    <div class="group" data-mode="adjust">
      <label for="brightness">Brillo</label>
      <input id="brightness" name="brightness" type="range" min="-0.5" max="0.5" step="0.05" value="0">
      <label for="contrast">Contraste</label>
      <input id="contrast" name="contrast" type="range" min="0" max="2" step="0.05" value="1">
      <label for="saturation">Saturación</label>
      <input id="saturation" name="saturation" type="range" min="0" max="2" step="0.05" value="1">
    </div>
    <div class="group" data-mode="duotone" hidden>
      <label for="shadow">Sombras</label>
      <input id="shadow" name="shadow" type="color" value="#1e1b4b">
      <label for="light">Luces</label>
      <input id="light" name="light" type="color" value="#ff9f1c">
    </div>
    <div class="group" data-mode="pixelate" hidden>
      <label for="block">Tamaño del bloque</label>
      <input id="block" name="block" type="range" min="1" max="24" step="1" value="8">
    </div>
  </form>
  <figure class="histogram">
    <canvas id="chart" role="img" aria-label="Histograma de luminancia de la imagen filtrada"></canvas>
    <figcaption id="summary" aria-live="polite"></figcaption>
  </figure>
  <p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
layout(location = 0) in vec2 a_position; // la misma location en los tres programas
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="adjust-shader">
#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform float u_brightness; // se suma
uniform float u_contrast;   // aleja (o acerca) cada canal del gris medio
uniform float u_saturation; // 0 = escala de grises, 1 = original, 2 = el doble de color
in vec2 v_uv;
out vec4 outColor;
void main() {
  vec3 color = texture(u_image, v_uv).rgb + u_brightness;
  color = (color - 0.5) * u_contrast + 0.5;
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  outColor = vec4(clamp(mix(vec3(luma), color, u_saturation), 0.0, 1.0), 1.0);
}
</script>

<script type="x-shader/x-fragment" id="duotone-shader">
#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform vec3 u_shadow; // el color de lo oscuro
uniform vec3 u_light;  // el color de lo claro
in vec2 v_uv;
out vec4 outColor;
void main() {
  float luma = dot(texture(u_image, v_uv).rgb, vec3(0.2126, 0.7152, 0.0722));
  outColor = vec4(mix(u_shadow, u_light, luma), 1.0);
}
</script>

<script type="x-shader/x-fragment" id="pixelate-shader">
#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform float u_block; // lado del bloque, en píxeles de la imagen
in vec2 v_uv;
out vec4 outColor;
void main() {
  vec2 cells = vec2(textureSize(u_image, 0)) / u_block;
  vec2 center = (floor(v_uv * cells) + 0.5) / cells; // todos los píxeles de un bloque leen su centro
  outColor = texture(u_image, center);
}
</script>
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
.studio {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
#photo {
  display: block;
  width: 240px;
  height: 165px;
}
fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 0.75rem 0 0.5rem;
  border: 1px solid #475569;
}
.group {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.4rem 0.75rem;
  align-items: center;
  max-width: 22rem;
}
.group[hidden] {
  display: none;
}
input:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.histogram {
  margin: 0.75rem 0 0;
}
#chart {
  display: block;
  width: 256px;
  height: 80px;
  background: #1e293b;
}
figcaption {
  margin-top: 0.25rem;
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
// Usa assets/webgl/utils.js y assets/valley-of-mexico.jpg (léelos con «Assets»).
import { createProgram, shaderFromScript, fullScreenQuad, loadImage, releaseOnPageHide } from './webgl/utils.js';

const LABELS = { adjust: 'Ajustes', duotone: 'Duotono', pixelate: 'Pixelado' };
const form = document.querySelector('#filters');
const summary = document.querySelector('#summary');

// --- La foto, en una textura; un programa por filtro -------------------------
const image = await loadImage('valley-of-mexico.jpg');
const canvas = document.querySelector('#photo');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
canvas.width = image.naturalWidth; // 480 × 330: un píxel del lienzo = un píxel de la foto
canvas.height = image.naturalHeight;
gl.viewport(0, 0, canvas.width, canvas.height);
const vertexSource = shaderFromScript('vertex-shader');
const programs = Object.fromEntries(['adjust', 'duotone', 'pixelate']
  .map((mode) => [mode, createProgram(gl, vertexSource, shaderFromScript(`${mode}-shader`))]));
fullScreenQuad(gl, programs.adjust); // a_position está en la location 0 en los tres
gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

// --- El histograma, en un canvas 2D -------------------------------------------
const chart = document.querySelector('#chart');
chart.width = 256 * devicePixelRatio;
chart.height = 80 * devicePixelRatio;
const chartCtx = chart.getContext('2d');
chartCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
const pixels = new Uint8Array(canvas.width * canvas.height * 4); // un búfer, reutilizado

function histogram() {
  // readPixels justo después de dibujar, en la misma tarea; luego, el bucle de «Píxeles»
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  const bins = new Uint32Array(256);
  for (let i = 0; i < pixels.length; i += 4) {
    bins[Math.round(0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2])] += 1;
  }
  const max = Math.max(...bins);
  chartCtx.clearRect(0, 0, 256, 80);
  chartCtx.fillStyle = '#fbbf24';
  chartCtx.beginPath();
  bins.forEach((count, value) => chartCtx.rect(value, 80 - (count / max) * 80, 1, (count / max) * 80));
  chartCtx.fill();
  const total = canvas.width * canvas.height;
  const share = (from, to) => Math.round((bins.slice(from, to + 1).reduce((s, c) => s + c, 0) / total) * 100);
  return `${total} píxeles · sombras (0-63): ${share(0, 63)} % · medios (64-191): ${share(64, 191)} % · luces (192-255): ${share(192, 255)} % · en 255: ${bins[255]}`;
}

// --- Dibujar con el filtro y los controles actuales -----------------------------
const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
function settings(mode) {
  const { brightness, contrast, saturation, shadow, light, block } = form.elements;
  if (mode === 'adjust') return `brillo ${brightness.value}, contraste ${contrast.value}, saturación ${saturation.value}`;
  if (mode === 'duotone') return `${shadow.value} → ${light.value}`;
  return `bloques de ${block.value} px`;
}
function render() {
  const mode = form.elements.mode.value;
  const program = programs[mode];
  const uniform = (name) => gl.getUniformLocation(program, name);
  const { brightness, contrast, saturation, shadow, light, block } = form.elements;
  gl.useProgram(program); // primero el programa, después sus uniforms
  if (mode === 'adjust') {
    gl.uniform1f(uniform('u_brightness'), brightness.valueAsNumber);
    gl.uniform1f(uniform('u_contrast'), contrast.valueAsNumber);
    gl.uniform1f(uniform('u_saturation'), saturation.valueAsNumber);
  } else if (mode === 'duotone') {
    gl.uniform3fv(uniform('u_shadow'), hexToRgb(shadow.value));
    gl.uniform3fv(uniform('u_light'), hexToRgb(light.value));
  } else {
    gl.uniform1f(uniform('u_block'), block.valueAsNumber);
  }
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  summary.textContent = histogram();
  return summary.textContent;
}

// Mientras se arrastra un control: como mucho un dibujo por fotograma. Al soltar: a la consola.
let scheduled = false;
form.addEventListener('input', (event) => {
  if (event.target.name === 'mode') {
    for (const group of form.querySelectorAll('.group')) group.hidden = group.dataset.mode !== form.elements.mode.value;
  }
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    render();
  });
});
form.addEventListener('change', () => {
  const mode = form.elements.mode.value;
  console.log(`${LABELS[mode]} (${settings(mode)}): ${render()}`);
});

console.log(`Original: ${render()}`);
console.log('Listo: elige un filtro y mueve los controles');
```

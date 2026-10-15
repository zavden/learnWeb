---
example_description: "Un desenfoque de caja separable: en lugar de leer (2r + 1)² vecinos en una pasada, una pasada horizontal escribe en una textura (un framebuffer) y una vertical lee de ella y escribe en el lienzo: 2 · (2r + 1) lecturas. Una imagen de prueba de 9 × 9 comprueba con readPixels que las dos formas dan los mismos bytes; el deslizador desenfoca el cuadro de Velasco"
example_tags: "javascript|webgl2|framebuffer|pasadas|desenfoque|separable|texturas|rendimiento"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Desenfoque en dos pasadas</h1>
  <canvas id="photo" role="img" aria-label="José María Velasco, Valle de México, desenfocado"></canvas>
  <label class="radius" for="radius">Radio <output id="radius-value" for="radius">6</output></label>
  <input id="radius" type="range" min="0" max="15" step="1" value="6">
  <p id="cost" class="cost" aria-live="polite"></p>
  <p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
layout(location = 0) in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<!-- Una pasada en UNA dirección: u_step es un píxel hacia la derecha o un píxel hacia arriba -->
<script type="x-shader/x-fragment" id="line-shader">
#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform vec2 u_step;
uniform int u_radius;
in vec2 v_uv;
out vec4 outColor;
void main() {
  vec3 sum = vec3(0.0);
  for (int i = -u_radius; i <= u_radius; i++) {
    sum += texture(u_image, v_uv + float(i) * u_step).rgb;
  }
  outColor = vec4(sum / float(2 * u_radius + 1), 1.0);
}
</script>

<!-- La versión directa, para comparar: el cuadrado entero en una pasada -->
<script type="x-shader/x-fragment" id="square-shader">
#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform int u_radius;
in vec2 v_uv;
out vec4 outColor;
void main() {
  vec2 onePixel = 1.0 / vec2(textureSize(u_image, 0));
  vec3 sum = vec3(0.0);
  for (int y = -u_radius; y <= u_radius; y++) {
    for (int x = -u_radius; x <= u_radius; x++) {
      sum += texture(u_image, v_uv + vec2(x, y) * onePixel).rgb;
    }
  }
  float side = float(2 * u_radius + 1);
  outColor = vec4(sum / (side * side), 1.0);
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
main {
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
  margin-bottom: 0.75rem;
}
.radius {
  display: block;
}
input:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.cost {
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
.credit {
  font-size: 0.8rem;
  color: #94a3b8;
}
```

# JavaScript

```javascript
// Usa assets/webgl/utils.js y assets/valley-of-mexico.jpg (léelos con «Assets»).
import { createProgram, shaderFromScript, fullScreenQuad, textureFromBytes, loadImage, releaseOnPageHide } from './webgl/utils.js';

const canvas = document.querySelector('#photo');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
const vertexSource = shaderFromScript('vertex-shader');
const lineProgram = createProgram(gl, vertexSource, shaderFromScript('line-shader'));
const squareProgram = createProgram(gl, vertexSource, shaderFromScript('square-shader'));
fullScreenQuad(gl, lineProgram);

// Un destino de dibujo: una textura (vacía) enganchada a un framebuffer
function createTarget(width, height) {
  const texture = textureFromBytes(gl, width, height, null); // NEAREST + CLAMP_TO_EDGE
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { texture, framebuffer, width, height };
}
function drawInto(target, program, source, uniforms) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null); // null: el lienzo
  gl.viewport(0, 0, target ? target.width : canvas.width, target ? target.height : canvas.height);
  gl.useProgram(program);
  gl.bindTexture(gl.TEXTURE_2D, source);
  gl.uniform1i(gl.getUniformLocation(program, 'u_radius'), uniforms.radius);
  if (uniforms.step) gl.uniform2fv(gl.getUniformLocation(program, 'u_step'), uniforms.step);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
// Las dos pasadas: fuente → (horizontal) → intermedia → (vertical) → destino
function separableBlur(source, middle, destination, width, height, radius) {
  drawInto(middle, lineProgram, source, { radius, step: [1 / width, 0] });
  drawInto(destination, lineProgram, middle.texture, { radius, step: [0, 1 / height] });
}

// --- 1. La prueba: un píxel blanco en el centro de una imagen negra de 9 × 9 ---------------
const SIZE = 9;
const testBytes = new Uint8Array(SIZE * SIZE * 4);
for (let i = 3; i < testBytes.length; i += 4) testBytes[i] = 255; // negro opaco
testBytes.set([255, 255, 255, 255], (4 * SIZE + 4) * 4);          // el píxel (4, 4), blanco
const testImage = textureFromBytes(gl, SIZE, SIZE, testBytes);
const testMiddle = createTarget(SIZE, SIZE);
const testOut = createTarget(SIZE, SIZE);
const readRed = (target) => {
  const pixels = new Uint8Array(SIZE * SIZE * 4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
  gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return pixels.filter((_, i) => i % 4 === 0);
};
separableBlur(testImage, testMiddle, testOut, SIZE, SIZE, 2);
const twoPasses = readRed(testOut);
drawInto(testOut, squareProgram, testImage, { radius: 2 });
const onePass = readRed(testOut);
console.log(`prueba 9 × 9, radio 2 → centro: una pasada ${onePass[40]} · dos pasadas ${twoPasses[40]}`);
console.log(`¿los 81 píxeles iguales? ${onePass.every((value, i) => value === twoPasses[i])} · píxeles no negros: ${twoPasses.filter((v) => v > 0).length}`);

// --- 2. El cuadro, con un deslizador -------------------------------------------------------
const image = await loadImage('valley-of-mexico.jpg');
canvas.width = image.naturalWidth;
canvas.height = image.naturalHeight;
const photo = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, photo);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
for (const [name, value] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) {
  gl.texParameteri(gl.TEXTURE_2D, name, value);
}
const photoMiddle = createTarget(canvas.width, canvas.height);

const slider = document.querySelector('#radius');
const cost = document.querySelector('#cost');
function render() {
  const radius = slider.valueAsNumber;
  separableBlur(photo, photoMiddle, null, canvas.width, canvas.height, radius);
  document.querySelector('#radius-value').value = radius;
  const side = 2 * radius + 1;
  cost.textContent = `radio ${radius} → ${2 * side} lecturas por píxel en dos pasadas, en lugar de ${side * side} en una`;
  return cost.textContent;
}
console.log(render());
console.log('Listo: mueve el deslizador «Radio»');
slider.addEventListener('input', render);
slider.addEventListener('change', () => console.log(cost.textContent));
```

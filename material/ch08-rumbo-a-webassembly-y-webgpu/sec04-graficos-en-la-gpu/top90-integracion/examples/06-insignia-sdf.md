---
example_description: "Un diseñador de insignias: un formulario (forma, colores de relleno y borde, grosor del borde, radio de las esquinas) cuyos controles son uniforms de un fragment shader que dibuja con funciones de distancia (círculo, caja redondeada, hexágono). El borde sale de la misma distancia desplazada; los colores de los <input type=color> pasan de hexadecimal a vec3, y readPixels comprueba que el centro y el borde tienen exactamente esos bytes"
example_tags: "javascript|webgl2|sdf|uniforms|formularios|color|readpixels|diseño"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="badge-designer">
  <h1>Diseña la insignia del club</h1>
  <canvas id="badge" role="img" aria-label="La insignia, con la forma y los colores elegidos"></canvas>
  <form id="controls">
    <label for="shape">Forma</label>
    <select id="shape" name="shape">
      <option value="0">Círculo</option>
      <option value="1">Caja redondeada</option>
      <option value="2">Hexágono</option>
    </select>
    <label for="fill">Relleno</label>
    <input id="fill" name="fill" type="color" value="#e11d48">
    <label for="border-color">Borde</label>
    <input id="border-color" name="borderColor" type="color" value="#fef3c7">
    <label for="border">Grosor del borde</label>
    <input id="border" name="border" type="range" min="0" max="0.1" step="0.01" value="0.04">
    <label for="corner">Radio de las esquinas</label>
    <input id="corner" name="corner" type="range" min="0" max="0.2" step="0.01" value="0.08">
  </form>
  <p id="check" class="check" aria-live="polite"></p>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
layout(location = 0) in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform int u_shape;      // 0 círculo · 1 caja redondeada · 2 hexágono
uniform vec3 u_fill;
uniform vec3 u_borderColor;
uniform float u_border;   // grosor, en unidades (el alto del lienzo = 1)
uniform float u_corner;
out vec4 outColor;

const float SIZE = 0.35; // radio del círculo, semilado de la caja, apotema del hexágono

float sdBox(vec2 p, vec2 halfSize) {
  vec2 d = abs(p) - halfSize;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}
float sdHexagon(vec2 p, float apothem) { // de Inigo Quilez: lados planos arriba y abajo
  const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
  p = abs(p);
  p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
  p -= vec2(clamp(p.x, -k.z * apothem, k.z * apothem), apothem);
  return length(p) * sign(p.y);
}
float shapeDistance(vec2 p) {
  if (u_shape == 1) return sdBox(p, vec2(SIZE - u_corner)) - u_corner;
  if (u_shape == 2) return sdHexagon(p, SIZE);
  return length(p) - SIZE;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y; // lección 2: unidades cuadradas
  float pixel = 1.0 / u_resolution.y;
  float d = shapeDistance(p);
  float inShape = 1.0 - smoothstep(-0.5 * pixel, 0.5 * pixel, d);          // la forma entera
  float inFill = 1.0 - smoothstep(-0.5 * pixel, 0.5 * pixel, d + u_border); // la forma, encogida
  vec3 color = mix(vec3(15.0, 23.0, 42.0) / 255.0, u_borderColor, inShape);
  outColor = vec4(mix(color, u_fill, inFill), 1.0);
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
.badge-designer {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
#badge {
  display: block;
  width: 200px;
  height: 200px;
  margin-bottom: 0.75rem;
}
form {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.4rem 0.75rem;
  align-items: center;
  max-width: 22rem;
}
select {
  font: inherit;
}
select:focus-visible,
input:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.check {
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Usa assets/webgl/utils.js (léelo con «Assets»).
import { createProgram, shaderFromScript, fullScreenQuad, fitCanvas, readPixel, releaseOnPageHide } from './webgl/utils.js';

const form = document.querySelector('#controls');
const check = document.querySelector('#check');
const SIZE = 0.35; // el mismo que en el shader

const canvas = document.querySelector('#badge');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
const [width, height] = fitCanvas(canvas);
gl.viewport(0, 0, width, height);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
fullScreenQuad(gl, program);
gl.useProgram(program);
const uniform = (name) => gl.getUniformLocation(program, name);
gl.uniform2f(uniform('u_resolution'), width, height);

// #e11d48 → [225, 29, 72] (bytes) → [0.882…, 0.113…, 0.282…] (lección «Tu primer fragment shader»)
const hexToBytes = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function render() {
  const { shape, fill, borderColor, border, corner } = form.elements;
  gl.uniform1i(uniform('u_shape'), Number(shape.value));
  gl.uniform3fv(uniform('u_fill'), hexToBytes(fill.value).map((b) => b / 255));
  gl.uniform3fv(uniform('u_borderColor'), hexToBytes(borderColor.value).map((b) => b / 255));
  gl.uniform1f(uniform('u_border'), border.valueAsNumber);
  gl.uniform1f(uniform('u_corner'), corner.valueAsNumber);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Comprobar dos puntos: el centro (relleno) y el centro del borde de abajo
  const center = readPixel(gl, Math.floor(width / 2), Math.floor(height / 2));
  const borderY = Math.floor(height / 2 - (SIZE - border.valueAsNumber / 2) * height);
  const edge = readPixel(gl, Math.floor(width / 2), borderY);
  const expected = (hex) => `${hexToBytes(hex).join(', ')}, 255`;
  const centerOk = center === expected(fill.value) ? '✅' : '❌';
  const edgeOk = border.valueAsNumber === 0 ? '(sin borde)' : (edge === expected(borderColor.value) ? '✅' : '❌');
  check.textContent = `centro → ${center} = ${fill.value} ${centerOk} · borde → ${edge} = ${borderColor.value} ${edgeOk}`;
  return `${shape.selectedOptions[0].text} · relleno ${fill.value} · borde ${borderColor.value} (${border.value}) → centro ${centerOk} · borde ${edgeOk}`;
}

form.addEventListener('input', render);           // redibujar en cada cambio
form.addEventListener('change', () => console.log(render()));
render();
console.log(check.textContent);
console.log('Listo: cambia la forma, los colores y los grosores');
```

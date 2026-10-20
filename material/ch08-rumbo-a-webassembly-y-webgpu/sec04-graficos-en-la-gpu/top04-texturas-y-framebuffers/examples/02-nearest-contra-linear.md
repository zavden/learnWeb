---
example_description: "El filtro decide qué color da una textura entre sus píxeles. NEAREST toma el más cercano: al ampliar, cuadrados nítidos (pixel art). LINEAR mezcla los cuatro vecinos según la distancia: degradados suaves y bordes borrosos. El mismo corazón de 8 × 8, ampliado 20 veces de las dos formas; dentro de una zona lisa los dos dan el mismo color, en los bordes solo LINEAR da colores intermedios"
example_tags: "javascript|webgl2|texturas|filtrado|nearest|linear|texparameteri|pixel-art"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>NEAREST o LINEAR</h1>
  <canvas id="stage" role="img" aria-label="El mismo corazón de 8 por 8 píxeles ampliado: a la izquierda con píxeles nítidos, a la derecha borroso"></canvas>
  <p class="labels"><span>NEAREST</span><span>LINEAR</span></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
uniform sampler2D u_texture;
in vec2 v_uv;
out vec4 outColor;
void main() {
  outColor = texture(u_texture, v_uv);
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
canvas {
  display: block;
  width: 320px;
  height: 160px;
}
.labels {
  display: flex;
  width: 320px;
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
}
.labels span {
  flex: 1;
  text-align: center;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Usa assets/webgl/utils.js (léelo con «Assets»).
import { createProgram, shaderFromScript, readPixel, fullScreenQuad, textureFromBytes, releaseOnPageHide } from './webgl/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// El corazón del ejemplo 01, ya de abajo arriba (la primera fila es la de abajo)
const SPRITE = ['........', '...RR...', '..RRRR..', '.RRRRRR.', 'RRRRRRRR', 'RRRRRRRR', '.RR..RR.', '........'];
const COLORS = { R: [225, 29, 72, 255], '.': [15, 23, 42, 255] };
const bytes = new Uint8Array(SPRITE.flatMap((row) => [...row].flatMap((cell) => COLORS[cell])));

const canvas = document.querySelector('#stage');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
canvas.width = Math.round(canvas.clientWidth * devicePixelRatio);
canvas.height = Math.round(canvas.clientHeight * devicePixelRatio);
const half = canvas.width / 2; // cada mitad es un cuadrado de half × half
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
fullScreenQuad(gl, program);
gl.useProgram(program);
const texture = textureFromBytes(gl, 8, 8, bytes);

// El filtro es un ajuste de la TEXTURA: se cambia entre un dibujo y el siguiente
for (const [index, filter] of [gl.NEAREST, gl.LINEAR].entries()) {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter); // MAG: al ampliar
  gl.viewport(index * half, 0, half, canvas.height);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// Dos puntos de cada mitad: el centro (rojo por todas partes) y el borde izquierdo del corazón
const at = (index, u, v) => readPixel(gl, Math.floor(index * half + u * half), Math.floor(v * canvas.height));
const isBetween = (rgba) => {
  const red = Number(rgba.split(', ')[0]);
  return red > 15 && red < 225; // ni fondo ni rojo: una mezcla
};
log(`centro → NEAREST: ${at(0, 0.5, 0.5)} · LINEAR: ${at(1, 0.5, 0.5)}`);
log(`borde (u = 0.125) → ¿color intermedio? NEAREST: ${isBetween(at(0, 0.125, 0.44))} · LINEAR: ${isBetween(at(1, 0.125, 0.44))}`);
// La textura no ha cambiado: solo cómo se lee. Y texture() con LINEAR hace 4 lecturas y
// una media ponderada por cada píxel de la pantalla, gratis: lo hace el hardware.
```

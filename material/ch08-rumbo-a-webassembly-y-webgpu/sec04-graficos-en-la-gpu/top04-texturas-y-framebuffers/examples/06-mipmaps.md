---
example_description: "Un suelo de ajedrez que se aleja: a lo lejos, cada píxel de la pantalla cubre decenas de píxeles de la textura. Sin mipmaps (izquierda), la GPU lee uno cualquiera y sale ruido (moiré, y parpadeo al moverse); con generateMipmap y LINEAR_MIPMAP_LINEAR (derecha), lee versiones reducidas ya promediadas y lo lejano se funde en gris. Cuestan un 33 % más de memoria"
example_tags: "javascript|webgl2|texturas|mipmaps|generatemipmap|filtrado|moire|perspectiva"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Un suelo que se aleja</h1>
  <canvas id="stage" role="img" aria-label="Dos suelos de ajedrez en perspectiva: el de la izquierda con ruido al fondo, el de la derecha liso y gris"></canvas>
  <p class="labels"><span>sin mipmaps</span><span>con mipmaps</span></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>

<script type="x-shader/x-vertex" id="vertex-shader">
#version 300 es
in vec2 a_position; // las 4 esquinas: (-1,-1) (1,-1) (-1,1) (1,1)
out vec2 v_uv;
void main() {
  // El borde de arriba está «lejos»: w = 10 lo divide entre 10 (perspectiva, como en CSS 3D)
  bool isFar = a_position.y > 0.0;
  float w = isFar ? 10.0 : 1.0;
  float x = a_position.x * (isFar ? 2.0 : 1.0); // arriba, 2 / 10 = 0.2: el suelo se estrecha
  gl_Position = vec4(x, a_position.y * w, 0.0, w);
  v_uv = (a_position * 0.5 + 0.5) * vec2(12.0, 60.0); // 12 tableros de ancho, 60 de fondo
}
</script>

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
uniform sampler2D u_texture;
in vec2 v_uv;
out vec4 outColor;
void main() {
  outColor = texture(u_texture, v_uv); // la GPU elige el nivel de mipmap según cuánto se reduce
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
import { createProgram, shaderFromScript, fullScreenQuad, releaseOnPageHide } from './webgl/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Un tablero de 64 × 64 píxeles con casillas de 8 × 8: crema (241) y pizarra (30)
const SIZE = 64;
const bytes = new Uint8Array(SIZE * SIZE * 4);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const light = ((x >> 3) + (y >> 3)) % 2 === 0;
    bytes.set(light ? [241, 245, 249, 255] : [30, 41, 59, 255], (y * SIZE + x) * 4);
  }
}

const canvas = document.querySelector('#stage');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
canvas.width = Math.round(canvas.clientWidth * devicePixelRatio);
canvas.height = Math.round(canvas.clientHeight * devicePixelRatio);
const half = canvas.width / 2;
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
fullScreenQuad(gl, program);
gl.useProgram(program);

gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIZE, SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
gl.generateMipmap(gl.TEXTURE_2D); // los niveles 32 × 32, 16 × 16… hasta 1 × 1, promediando
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.clearColor(15 / 255, 23 / 255, 42 / 255, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

const sides = [['sin mipmaps', gl.LINEAR], ['con mipmaps', gl.LINEAR_MIPMAP_LINEAR]];
sides.forEach(([label, minFilter], index) => {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter); // MIN: al reducir
  gl.viewport(index * half, 0, half, canvas.height);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
});

const levels = Math.log2(SIZE) + 1;
const sizes = Array.from({ length: levels }, (_, level) => SIZE >> level);
const mipBytes = sizes.slice(1).reduce((sum, side) => sum + side * side * 4, 0);
log(`textura → ${SIZE} × ${SIZE} · ${levels} niveles (${sizes.join(', ')})`);
log(`memoria → ${bytes.length} bytes + ${mipBytes} de mipmaps (+${Math.round((mipBytes / bytes.length) * 100)} %)`);

// Al fondo (del 82 % al 95 % de la altura, en el centro de cada mitad): ¿quedan crema o pizarra puros?
const column = new Uint8Array(4);
sides.forEach(([label], index) => {
  let extremes = 0;
  for (let y = Math.floor(canvas.height * 0.82); y < Math.floor(canvas.height * 0.95); y++) {
    gl.readPixels(Math.floor(index * half + half / 2), y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, column);
    if (column[0] < 60 || column[0] > 210) extremes += 1;
  }
  log(`al fondo, ${label} → ¿píxeles casi crema o casi pizarra? ${extremes > 0}`);
});
```

---
example_description: "Un editor de pixel art de 16 × 16 cuyo dibujo vive en una textura: se amplía con NEAREST, la rejilla y el cursor los pinta el fragment shader, y cada píxel pintado sube a la GPU con texSubImage2D (4 bytes, no la imagen entera). Se pinta con el ratón o con las flechas, Espacio y los números de la paleta; readPixels comprueba que el color llegó a la pantalla"
example_tags: "javascript|webgl2|texturas|texsubimage2d|nearest|pixel-art|teclado|pointer-events"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Cempasúchil en pixel art</h1>
  <fieldset class="palette">
    <legend>Color (teclas 1-6)</legend>
    <div id="palette" class="swatches"></div>
  </fieldset>
  <canvas id="board" tabindex="0" role="img" aria-label="Lienzo de 16 por 16 píxeles con una flor de cempasúchil" aria-describedby="help"></canvas>
  <p id="help" class="help">Pinta con el ratón, o entra con Tab, muévete con las flechas y pinta con Espacio.</p>
  <button id="reset" type="button">Volver a la flor</button>
  <p id="status" class="status" role="status"></p>
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

<script type="x-shader/x-fragment" id="fragment-shader">
#version 300 es
precision highp float;
uniform sampler2D u_sprite; // 16 × 16, con NEAREST: cada píxel, un cuadrado nítido
uniform vec2 u_cursor;      // celda del cursor: columna y fila DESDE ABAJO
in vec2 v_uv;
out vec4 outColor;
void main() {
  vec3 color = texture(u_sprite, v_uv).rgb;
  vec2 grid = v_uv * 16.0;
  vec2 inCell = fract(grid);
  if (min(inCell.x, inCell.y) < 0.04) color = mix(color, vec3(0.2, 0.25, 0.33), 0.6); // rejilla
  bool edge = min(inCell.x, inCell.y) < 0.1 || max(inCell.x, inCell.y) > 0.9;
  if (floor(grid) == u_cursor && edge) color = vec3(1.0); // el cursor del teclado
  outColor = vec4(color, 1.0);
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
.palette {
  margin: 0 0 0.75rem;
  border: 1px solid #475569;
}
.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.swatches label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
}
.swatch {
  width: 1rem;
  height: 1rem;
  border: 1px solid #e2e8f0;
}
#board {
  display: block;
  width: 256px;
  height: 256px;
  touch-action: none; /* que pintar con el dedo no desplace la página */
  cursor: crosshair;
}
#board:focus-visible,
button:focus-visible,
input:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.help {
  font-size: 0.85rem;
  color: #94a3b8;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
.status {
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Usa assets/webgl/utils.js (léelo con «Assets»).
import { createProgram, shaderFromScript, fullScreenQuad, fitCanvas, readPixel, releaseOnPageHide } from './webgl/utils.js';

const SIZE = 16;
const PALETTE = [
  ['fondo', [15, 23, 42]], ['cempasúchil', [255, 159, 28]], ['amarillo', [250, 204, 21]],
  ['naranja tostado', [194, 65, 12]], ['verde', [22, 163, 74]], ['rosa mexicano', [228, 0, 124]],
];
const statusLine = document.querySelector('#status');
function say(text) {
  statusLine.textContent = text;
  console.log(text);
}

// --- El dibujo en bytes: fila 0 = la de ARRIBA en pantalla -------------------------------
function flower() {
  const indices = new Uint8Array(SIZE * SIZE); // un índice de la paleta por píxel
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const d = Math.hypot(x - 7.5, y - 6.5);
      let color = 0;
      if (y > 10 && (x === 7 || x === 8)) color = 4;           // tallo
      if (y === 12 && x >= 4 && x <= 6) color = 4;            // hoja
      if (d < 5.5) color = 1;                                 // pétalos
      if (d < 3.5) color = 2;
      if (d < 1.5) color = 3;                                 // el centro
      indices[y * SIZE + x] = color;
    }
  }
  return indices;
}
let indices = flower();
// Bytes RGBA en el orden de la TEXTURA: su fila 0 es la de abajo, así que se suben al revés
function toBytes() {
  const bytes = new Uint8Array(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) bytes.set([...PALETTE[indices[y * SIZE + x]][1], 255], ((SIZE - 1 - y) * SIZE + x) * 4);
  }
  return bytes;
}

const canvas = document.querySelector('#board');
const gl = canvas.getContext('webgl2');
releaseOnPageHide(gl);
const [width, height] = fitCanvas(canvas);
gl.viewport(0, 0, width, height);
const program = createProgram(gl, shaderFromScript('vertex-shader'), shaderFromScript('fragment-shader'));
fullScreenQuad(gl, program);
gl.useProgram(program);
gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIZE, SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, toBytes());
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
const cursorLocation = gl.getUniformLocation(program, 'u_cursor');

let cursor = { x: 0, y: 0 };
let colorIndex = 1;
function draw() {
  gl.uniform2f(cursorLocation, cursor.x, SIZE - 1 - cursor.y); // la fila, contada desde abajo
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
// Pinta un píxel: el array, 4 bytes a la GPU y comprobar en pantalla el centro de la celda
function paint(x, y) {
  indices[y * SIZE + x] = colorIndex;
  const [name, rgb] = PALETTE[colorIndex];
  gl.texSubImage2D(gl.TEXTURE_2D, 0, x, SIZE - 1 - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([...rgb, 255]));
  draw();
  const onScreen = readPixel(gl, Math.floor(((x + 0.5) / SIZE) * width), Math.floor(((SIZE - 1 - y + 0.5) / SIZE) * height));
  return `(${x}, ${y}) → ${name} · texSubImage2D de 1 × 1 (4 bytes) · en pantalla: ${onScreen} ${onScreen === `${rgb.join(', ')}, 255` ? '✅' : '❌'}`;
}

// --- La paleta, como botones de radio -------------------------------------------------------
const palette = document.querySelector('#palette');
PALETTE.forEach(([name, rgb], index) => {
  const label = document.createElement('label');
  label.innerHTML = `<input type="radio" name="color" value="${index}"${index === colorIndex ? ' checked' : ''}><span class="swatch" style="background: rgb(${rgb.join(' ')})"></span>${index + 1} ${name}`;
  palette.append(label);
});
palette.addEventListener('change', (event) => {
  colorIndex = Number(event.target.value);
  say(`color: ${PALETTE[colorIndex][0]}`);
});
function chooseColor(index) {
  palette.querySelectorAll('input')[index].checked = true;
  colorIndex = index;
  say(`color: ${PALETTE[index][0]}`);
}

// --- Ratón (y dedo): la celda bajo el puntero, con la y de CSS (hacia abajo) -------------------
let stroke = 0;
function cellAt(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.min(SIZE - 1, Math.floor(((event.clientX - rect.left) / rect.width) * SIZE)),
    y: Math.min(SIZE - 1, Math.floor(((event.clientY - rect.top) / rect.height) * SIZE)),
  };
}
canvas.addEventListener('pointerdown', (event) => {
  canvas.setPointerCapture(event.pointerId);
  cursor = cellAt(event);
  statusLine.textContent = paint(cursor.x, cursor.y);
  stroke = 1;
});
canvas.addEventListener('pointermove', (event) => {
  if (!canvas.hasPointerCapture(event.pointerId)) return;
  const cell = cellAt(event);
  if (cell.x === cursor.x && cell.y === cursor.y) return; // solo al entrar en otra celda
  cursor = cell;
  statusLine.textContent = paint(cell.x, cell.y);
  stroke += 1;
});
canvas.addEventListener('pointerup', () => console.log(`trazo de ${stroke} píxeles; el último: ${statusLine.textContent}`));

// --- Teclado ---------------------------------------------------------------------------------
canvas.addEventListener('keydown', (event) => {
  const moves = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
  if (moves[event.key]) {
    event.preventDefault();
    cursor = {
      x: Math.min(SIZE - 1, Math.max(0, cursor.x + moves[event.key][0])),
      y: Math.min(SIZE - 1, Math.max(0, cursor.y + moves[event.key][1])),
    };
    draw();
    statusLine.textContent = `(${cursor.x}, ${cursor.y}): ${PALETTE[indices[cursor.y * SIZE + cursor.x]][0]}`;
  } else if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    say(paint(cursor.x, cursor.y));
  } else if (event.key >= '1' && event.key <= String(PALETTE.length)) {
    chooseColor(Number(event.key) - 1);
  }
});
document.querySelector('#reset').addEventListener('click', () => {
  indices = flower();
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIZE, SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, toBytes()); // la imagen entera
  draw();
  say('la flor de nuevo: texImage2D de 16 × 16 (1024 bytes)');
});

draw();
say(`Listo: ${SIZE} × ${SIZE} píxeles = ${SIZE * SIZE * 4} bytes en la GPU; pinta con el ratón, o con las flechas y Espacio`);
```

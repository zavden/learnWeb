---
example_description: "El juego de la vida de Conway en la GPU: el tablero de 128 × 80 células vive en dos texturas R8 que se turnan (ping-pong); un fragment shader calcula la generación siguiente de todas las células a la vez con texelFetch y bordes que dan la vuelta. Cada «Paso» se comprueba en la CPU: readPixels del antes y del después, y el mismo paso en JavaScript, célula a célula. 100 generaciones animadas a 12 por segundo con un botón (nunca con «reducir movimiento»), y el tablero se edita con el ratón o con las flechas y Espacio"
example_tags: "javascript|webgl2|framebuffers|ping-pong|texelfetch|juego-de-la-vida|simulacion|readpixels|accesibilidad|profesional"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="life">
  <h1>El juego de la vida</h1>
  <canvas id="board" tabindex="0" role="img" aria-label="Tablero de 128 por 80 células; las vivas, en turquesa" aria-describedby="rules"></canvas>
  <p id="rules" class="rules">Una célula viva con 2 o 3 vecinas vivas sigue viva; una muerta con exactamente 3, nace; las demás mueren o siguen muertas. Los bordes dan la vuelta: la columna de la derecha es vecina de la de la izquierda.</p>
  <div class="controls">
    <button id="step" type="button">Paso</button>
    <button id="step10" type="button">+10</button>
    <button id="play" type="button" aria-pressed="false">▶ 100 generaciones</button>
    <button id="reseed" type="button">Siembra nueva</button>
    <button id="clear" type="button">Vaciar</button>
  </div>
  <p class="help">Haz clic en una célula para cambiarla, o entra en el tablero con Tab: flechas para moverte, Espacio para cambiar la célula marcada.</p>
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
.life {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
#board {
  display: block;
  width: 100%;
  aspect-ratio: 128 / 80;
  cursor: pointer;
}
#board:focus-visible,
button:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.rules,
.help {
  font-size: 0.8rem;
  color: #94a3b8;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
button {
  font: inherit;
  padding: 0.25rem 0.7rem;
}
.status {
  min-height: 2.6em;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.75rem;
}
```

# JavaScript

```javascript
// El juego de la vida en la GPU, comprobado en la CPU.
//
// Decisiones de diseño:
// - El tablero son bytes: 0 (muerta) o 255 (viva), una célula por píxel de una textura R8 de
//   128 × 80 (10 240 bytes). Hay dos, enganchadas a dos framebuffers: cada paso lee una y
//   escribe la otra, y cambian los papeles (ping-pong). Una textura nunca es a la vez fuente y
//   destino (lección «Texturas y framebuffers»).
// - El shader del paso lee sus 8 vecinas con texelFetch (coordenadas enteras: sin filtros ni
//   uv) y el módulo % hace que los bordes den la vuelta (un toro). Cada célula se calcula
//   sin saber nada de las demás: por eso el paso entero es UN dibujo.
// - La comprobación: readPixels del tablero antes y después de un paso, y el mismo paso en
//   JavaScript (stepCPU) sobre el «antes». Si las 10 240 células coinciden, ✅.
// - Animación: 12 generaciones por segundo, 100 y se para (o con «Parar», o al ocultar la
//   página); con «reducir movimiento» no arranca: «Paso» y «+10» hacen lo mismo sin moverse.
//   Mientras se anima no se lee nada (readPixels espera a la GPU): solo al terminar.
// - Si se pierde el contexto, se pierden las texturas: al recuperarlo se sube la última copia
//   que tiene la CPU.
//
// Usa assets/gl/kit.js (léelo con «Assets»).
// Alcance: HTML, CSS, JavaScript, DOM, eventos de puntero y teclado y este módulo.
import { createView, createProgram, createQuad, createTarget, bindCanvas, createAnimation } from './gl/kit.js';

const COLS = 128;
const ROWS = 80;
const PER_SECOND = 12;
const PLAY_GENERATIONS = 100;

// --- El tablero en la CPU: sembrar y un paso (la referencia) ------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedGrid(seed, density = 0.3) {
  const random = mulberry32(seed);
  const cells = new Uint8Array(COLS * ROWS); // fila 0 = la de ABAJO, como en la textura
  for (let i = 0; i < cells.length; i++) cells[i] = random() < density ? 255 : 0;
  return cells;
}
function stepCPU(cells) {
  const next = new Uint8Array(cells.length);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let neighbours = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          if (cells[((y + dy + ROWS) % ROWS) * COLS + ((x + dx + COLS) % COLS)]) neighbours += 1;
        }
      }
      const alive = cells[y * COLS + x] !== 0;
      next[y * COLS + x] = neighbours === 3 || (alive && neighbours === 2) ? 255 : 0;
    }
  }
  return next;
}
const population = (cells) => cells.reduce((sum, v) => sum + (v ? 1 : 0), 0);
const sameCells = (a, b) => a.every((v, i) => v === b[i]);

// --- Los shaders ------------------------------------------------------------------------------------
const VERTEX = `#version 300 es
layout(location = 0) in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
const STEP = `#version 300 es
precision highp float;
uniform sampler2D u_state;
out vec4 outColor;
void main() {
  ivec2 size = textureSize(u_state, 0);
  ivec2 cell = ivec2(gl_FragCoord.xy); // el viewport mide 128 × 80: un fragmento por célula
  int neighbours = 0;
  for (int dy = -1; dy <= 1; dy++) {
    for (int dx = -1; dx <= 1; dx++) {
      if (dx == 0 && dy == 0) continue;
      ivec2 n = (cell + ivec2(dx, dy) + size) % size; // los bordes dan la vuelta
      neighbours += texelFetch(u_state, n, 0).r > 0.5 ? 1 : 0;
    }
  }
  bool alive = texelFetch(u_state, cell, 0).r > 0.5;
  bool next = neighbours == 3 || (alive && neighbours == 2);
  outColor = vec4(next ? 1.0 : 0.0, 0.0, 0.0, 1.0);
}`;
const DISPLAY = `#version 300 es
precision highp float;
uniform sampler2D u_state;
uniform ivec2 u_cursor; // (-1, -1): sin cursor
uniform float u_gap;    // hueco entre células, en fracción de célula
in vec2 v_uv;
out vec4 outColor;
void main() {
  vec2 grid = vec2(textureSize(u_state, 0));
  ivec2 cell = ivec2(v_uv * grid);
  vec2 local = fract(v_uv * grid); // dónde está el píxel dentro de su célula
  bool alive = texelFetch(u_state, cell, 0).r > 0.5;
  bool inside = all(greaterThan(local, vec2(u_gap))) && all(lessThan(local, vec2(1.0 - u_gap)));
  vec3 color = vec3(2.0, 6.0, 23.0) / 255.0;                     // las rendijas
  if (inside) color = alive ? vec3(34.0, 211.0, 238.0) / 255.0   // viva: turquesa
                            : vec3(15.0, 23.0, 42.0) / 255.0;    // muerta
  float edge = min(min(local.x, local.y), min(1.0 - local.x, 1.0 - local.y));
  if (cell == u_cursor && edge < 0.2) color = vec3(251.0, 191.0, 36.0) / 255.0; // el cursor
  outColor = vec4(color, 1.0);
}`;

// --- Estado -----------------------------------------------------------------------------------------
const statusLine = document.querySelector('#status');
function say(text) {
  statusLine.textContent = text;
  console.log(text);
}
let seed = 1;
let cells = seedGrid(seed); // la última copia del tablero en la CPU
let cellsGeneration = 0;    // de qué generación es esa copia
let generation = 0;
let current = 0;            // qué destino tiene la generación actual
let cursor = [-1, -1];
const canvas = document.querySelector('#board');

function upload(gl, texture, data, x = 0, y = 0, width = COLS, height = ROWS) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); // filas de 1 byte por píxel: sin relleno a 4 bytes
  gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.RED, gl.UNSIGNED_BYTE, data);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
}

const view = createView(canvas, {
  setup(gl) {
    const targets = [0, 1].map(() => createTarget(gl, COLS, ROWS, { internalFormat: gl.R8, format: gl.RED }));
    current = 0;
    generation = cellsGeneration;
    upload(gl, targets[0].texture, cells);
    return {
      targets,
      quad: createQuad(gl),
      step: createProgram(gl, { name: 'paso', vertex: VERTEX, fragment: STEP }),
      display: createProgram(gl, { name: 'tablero', vertex: VERTEX, fragment: DISPLAY }),
    };
  },
  render(gl, res) {
    bindCanvas(gl);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, res.targets[current].texture);
    const cellPixels = canvas.width / COLS;
    const showCursor = document.activeElement === canvas; // el cursor, solo con el foco en el tablero
    res.display.set({ u_state: 0, u_cursor: showCursor ? cursor : [-1, -1], u_gap: cellPixels >= 4 ? 1 / cellPixels : 0 });
    gl.bindVertexArray(res.quad);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  },
  onStatus(status) {
    say(status === 'lost'
      ? '⚠️ contexto WebGL perdido: las texturas del tablero ya no existen'
      : `✅ contexto recuperado: tablero de la generación ${cellsGeneration} subido desde la copia de la CPU`);
  },
});

// Un paso en la GPU: lee del destino actual y escribe en el otro
function gpuStep() {
  const { gl, resources: res } = view;
  if (!res) return false;
  const next = res.targets[1 - current];
  next.bind();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, res.targets[current].texture);
  res.step.set({ u_state: 0 });
  gl.bindVertexArray(res.quad);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  current = 1 - current;
  generation += 1;
  return true;
}
// El tablero tal como está en la GPU (readPixels de una textura R8: r, 0, 0, 255 por célula)
const pixels = new Uint8Array(COLS * ROWS * 4);
function readBoard() {
  const { gl, resources: res } = view;
  res.targets[current].bind();
  gl.readPixels(0, 0, COLS, ROWS, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  bindCanvas(gl);
  cells = pixels.filter((_, i) => i % 4 === 0); // un Uint8Array con los rojos
  cellsGeneration = generation;
  return cells;
}
function checkedSteps(count) {
  if (!view.resources) return say('sin contexto WebGL: espera a que se recupere');
  let matches = 0;
  for (let i = 0; i < count; i++) {
    const expected = stepCPU(readBoard()); // la CPU calcula el paso desde el «antes» de la GPU
    gpuStep();
    if (sameCells(readBoard(), expected)) matches += 1;
  }
  view.renderNow();
  const check = count === 1 ? `la CPU calcula lo mismo en las ${COLS * ROWS} células` : `la CPU calcula lo mismo en ${matches} de ${count} pasos`;
  say(`generación ${generation} · ${population(cells)} vivas · ${check} ${matches === count ? '✅' : '❌'}`);
}

// --- Botones -----------------------------------------------------------------------------------------
const playButton = document.querySelector('#play');
let playFrom = 0;
const player = createAnimation({
  frame(seconds) {
    if (!view.resources) return false; // contexto perdido: se para
    const goal = playFrom + Math.min(PLAY_GENERATIONS, Math.floor(seconds * PER_SECOND));
    for (let i = 0; i < 3 && generation < goal; i++) gpuStep(); // como mucho 3 por fotograma
    view.renderNow();
    return generation < playFrom + PLAY_GENERATIONS;
  },
  onStop(reason) {
    playButton.textContent = '▶ 100 generaciones';
    playButton.setAttribute('aria-pressed', 'false');
    if (!view.resources) return;
    readBoard(); // ahora sí: una lectura al final
    const why = reason === 'done' ? `${PLAY_GENERATIONS} generaciones` : reason === 'hidden' ? 'parado: página oculta' : 'parado';
    say(`⏹ ${why} · generación ${generation} · ${population(cells)} vivas`);
  },
});
playButton.addEventListener('click', () => {
  if (player.running) return player.stop();
  playFrom = generation;
  const result = player.start();
  if (result === 'reduced') return say('movimiento reducido: el tablero no se anima; usa «Paso» o «+10»');
  playButton.textContent = '⏹ Parar';
  playButton.setAttribute('aria-pressed', 'true');
  say(`▶ ${PER_SECOND} generaciones por segundo, 1 dibujo por generación`);
});
document.querySelector('#step').addEventListener('click', () => checkedSteps(1));
document.querySelector('#step10').addEventListener('click', () => checkedSteps(10));

function replaceBoard(next, label) {
  player.stop();
  cells = next;
  generation = 0;
  cellsGeneration = 0;
  const { gl, resources: res } = view;
  if (res) upload(gl, res.targets[current].texture, cells);
  view.renderNow();
  say(`${label} · generación 0 · ${population(cells)} vivas`);
}
document.querySelector('#reseed').addEventListener('click', () => {
  seed += 1;
  replaceBoard(seedGrid(seed), `siembra ${seed}`);
});
document.querySelector('#clear').addEventListener('click', () => replaceBoard(new Uint8Array(COLS * ROWS), 'tablero vacío'));

// --- Editar: clic, o cursor con flechas y Espacio -----------------------------------------------------
function toggle(x, y) {
  const { gl, resources: res } = view;
  if (!res) return;
  const board = readBoard();
  const value = board[y * COLS + x] ? 0 : 255;
  board[y * COLS + x] = value;
  upload(gl, res.targets[current].texture, Uint8Array.of(value), x, y, 1, 1); // 1 byte, no 10 240
  view.renderNow();
  say(`(${x}, ${y}) → ${value ? 'viva' : 'muerta'} · ${population(board)} vivas`);
}
canvas.addEventListener('click', (event) => {
  const box = canvas.getBoundingClientRect();
  const x = Math.min(COLS - 1, Math.floor(((event.clientX - box.left) / box.width) * COLS));
  const y = Math.min(ROWS - 1, Math.floor((1 - (event.clientY - box.top) / box.height) * ROWS)); // y hacia arriba
  cursor = [x, y];
  toggle(x, y);
});
canvas.addEventListener('focus', () => {
  if (cursor[0] < 0) cursor = [COLS / 2, ROWS / 2];
  view.invalidate();
});
canvas.addEventListener('blur', () => view.invalidate());
canvas.addEventListener('keydown', (event) => {
  const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
  if (moves[event.key]) {
    cursor = [(cursor[0] + moves[event.key][0] + COLS) % COLS, (cursor[1] + moves[event.key][1] + ROWS) % ROWS];
    view.invalidate();
  } else if (event.key === ' ' || event.key === 'Enter') {
    toggle(...cursor);
  } else {
    return;
  }
  event.preventDefault();
});

say(`tablero → ${COLS} × ${ROWS} = ${COLS * ROWS} células · 2 texturas R8 de ${COLS * ROWS} bytes que se turnan`);
say(`siembra ${seed} · generación 0 · ${population(cells)} vivas`);
view.renderNow(); // el primer dibujo, ya (sin esperar a un fotograma)
say('Listo: pulsa «Paso», «+10» o «▶ 100 generaciones»; con Tab entras en el tablero (flechas y Espacio)');
```

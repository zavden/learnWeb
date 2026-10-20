---
example_description: "El juego de la vida con el tablero en la memoria de WebAssembly: dos tableros de 48 × 32 bytes, una función step() que calcula la generación siguiente con bordes que dan la vuelta y devuelve la población, y un canvas que dibuja la vista; una segunda instancia del mismo módulo comprueba 50 generaciones contra JavaScript"
example_tags: "javascript|webassembly|wasm|juego-de-la-vida|canvas|memoria|instancias|animacion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="life">
  <h1>El juego de la vida, en la memoria</h1>
  <canvas id="board" width="480" height="320" role="img" aria-label="Tablero del juego de la vida"></canvas>
  <div class="controls">
    <button id="step" type="button">Un paso</button>
    <button id="play" type="button">Reproducir 100 generaciones</button>
    <button id="reset" type="button">Reiniciar</button>
  </div>
  <p id="status" role="status"></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
.life { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.75rem; }
canvas { display: block; inline-size: 100%; block-size: auto; border-radius: 0.4rem; background: #0f172a; image-rendering: pixelated; }
.controls { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-block-start: 0.75rem; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:disabled { cursor: not-allowed; color: #475569; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
#status { margin: 0.5rem 0 0; font-size: 0.9rem; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, memArg, i32Const, I32, VOID } from './wasm/emit.js';

const W = 48;
const H = 32;
const OTHER = 2048; // el segundo tablero empieza en el byte 2048; el primero, en el 0
//   (module
//     (memory (export "memory") 1)
//     (global $cur (export "current") (mut i32) (i32.const 0))   ;; dónde está el tablero actual
//     (func $at (param $x i32) (param $y i32) (result i32)       ;; la celda, con bordes que dan la vuelta
//       global.get $cur
//       local.get $y  i32.const 32  i32.add  i32.const 32  i32.rem_u  i32.const 48  i32.mul  i32.add
//       local.get $x  i32.const 48  i32.add  i32.const 48  i32.rem_u  i32.add
//       i32.load8_u)
//     (func (export "step") (result i32) …                       ;; 32 × 48 vueltas, siempre las mismas
//       … para cada celda: n = las 8 vecinas; viva = (n == 3) | (era viva & (n == 2)) …
//       … escribe en el otro tablero, cuenta la población y cambia $cur …))
const at = (dx, dy) => [op.local_get, 0, ...i32Const(dx), op.i32_add, op.local_get, 1, ...i32Const(dy), op.i32_add, op.call, 0];
const counted = (variable, limit, inner) => [ // for (variable = 0; variable < limit; variable++) { inner }
  ...i32Const(0), op.local_set, variable,
  op.block, VOID, op.loop, VOID,
    op.local_get, variable, ...i32Const(limit), op.i32_ge_u, op.br_if, 1,
    ...inner,
    op.local_get, variable, ...i32Const(1), op.i32_add, op.local_set, variable,
    op.br, 0,
  op.end, op.end,
];
// step: locales 0 = $x, 1 = $y, 2 = $n, 3 = $alive, 4 = $next, 5 = $count
const neighbours = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
const bytes = encodeModule({
  types: [[[I32, I32], [I32]], [[], [I32]]],
  memory: { min: 1, max: 1 },
  globals: [{ type: I32, mutable: true, init: i32Const(0) }],
  funcs: [
    { type: 0, body: [
      op.global_get, 0,
      op.local_get, 1, ...i32Const(H), op.i32_add, ...i32Const(H), op.i32_rem_u, ...i32Const(W), op.i32_mul, op.i32_add,
      op.local_get, 0, ...i32Const(W), op.i32_add, ...i32Const(W), op.i32_rem_u, op.i32_add,
      op.i32_load8_u, ...memArg(0),
    ] },
    { type: 1, locals: [I32, I32, I32, I32, I32, I32], body: [
      op.global_get, 0, ...i32Const(OTHER), op.i32_xor, op.local_set, 4, // el otro tablero: 0 ↔ 2048
      ...counted(1, H, counted(0, W, [
        // $at necesita (x, y): sus parámetros son las locales 0 y 1 de step
        ...at(...neighbours[0]), ...neighbours.slice(1).flatMap(([dx, dy]) => [...at(dx, dy), op.i32_add]), op.local_set, 2,
        op.local_get, 2, ...i32Const(3), op.i32_eq,
        ...at(0, 0), op.local_get, 2, ...i32Const(2), op.i32_eq, op.i32_and,
        op.i32_or, op.local_set, 3,
        op.local_get, 4, op.local_get, 1, ...i32Const(W), op.i32_mul, op.i32_add, op.local_get, 0, op.i32_add,
        op.local_get, 3, op.i32_store8, ...memArg(0),
        op.local_get, 5, op.local_get, 3, op.i32_add, op.local_set, 5,
      ])),
      op.local_get, 4, op.global_set, 0,
      op.local_get, 5,
    ] },
  ],
  exports: { memory: { memory: 0 }, current: { global: 0 }, step: { func: 1 } },
});

// La generación 0: un planeador, un R-pentominó y un parpadeador.
const SEED = [[2, 1], [3, 2], [1, 3], [2, 3], [3, 3], [25, 14], [26, 14], [24, 15], [25, 15], [25, 16], [40, 5], [41, 5], [42, 5]];
function seedInto(cells) {
  cells.fill(0);
  for (const [x, y] of SEED) cells[y * W + x] = 1;
}
// La referencia en JavaScript: las mismas reglas, en dos arrays.
function stepJs(cells) {
  const next = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let n = 0;
      for (const [dx, dy] of neighbours) n += cells[((y + dy + H) % H) * W + ((x + dx + W) % W)];
      next[y * W + x] = n === 3 || (cells[y * W + x] === 1 && n === 2) ? 1 : 0;
    }
  }
  return next;
}

const module = await WebAssembly.compile(bytes);
const shown = await WebAssembly.instantiate(module); // la que se dibuja
const { memory, current, step } = shown.exports;
const board = (instance) => new Uint8Array(instance.exports.memory.buffer, instance.exports.current.value, W * H);
const canvas = document.querySelector('#board');
const context = canvas.getContext('2d');
const statusLine = document.querySelector('#status');
const logList = document.querySelector('#log');
let generation = 0;
let population = SEED.length;
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function draw() {
  const cells = board(shown);
  const size = canvas.width / W;
  context.fillStyle = '#0f172a';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#22d3ee';
  for (let i = 0; i < cells.length; i++) if (cells[i]) context.fillRect((i % W) * size + 1, Math.floor(i / W) * size + 1, size - 2, size - 2);
  statusLine.textContent = `Generación ${generation} · población ${population}`;
  canvas.setAttribute('aria-label', `Tablero del juego de la vida: generación ${generation}, ${population} celdas vivas`);
}
function resetBoard() {
  current.value = 0;
  seedInto(new Uint8Array(memory.buffer, 0, W * H));
  generation = 0;
  population = SEED.length;
  draw();
}

// La comprobación, en OTRA instancia del mismo módulo: su memoria es suya.
const check = await WebAssembly.instantiate(module);
seedInto(new Uint8Array(check.exports.memory.buffer, 0, W * H));
let reference = new Uint8Array(W * H);
seedInto(reference);
let checkPopulation = 0;
for (let i = 0; i < 50; i++) {
  checkPopulation = check.exports.step();
  reference = stepJs(reference);
}
const same = board(check).every((cell, index) => cell === reference[index]);

resetBoard();
logLine(`${W} × ${H} = ${W * H} celdas · dos tableros de ${W * H} bytes en la memoria (en 0 y en ${OTHER})`);
logLine(`generación 0 → población ${population}`);
logLine(`¿igual que en JavaScript tras 50 generaciones? ${same} · población ${checkPopulation}`);

function advance() {
  population = step();
  generation += 1;
  draw();
}
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const playButton = document.querySelector('#play');
let playing = false;
document.querySelector('#step').addEventListener('click', () => {
  advance();
  logLine(`generación ${generation} → población ${population}`);
});
document.querySelector('#reset').addEventListener('click', () => { playing = false; resetBoard(); });
if (reduceMotion) {
  playButton.disabled = true;
  playButton.title = 'Con «reducir movimiento», avanza con «Un paso»';
}
playButton.addEventListener('click', () => {
  if (playing) return;
  playing = true;
  playButton.disabled = true;
  const target = generation + 100; // 100 generaciones, 10 por segundo: unos 10 s
  let last = performance.now();
  const frame = (now) => {
    if (!playing || document.hidden || generation >= target) { // se para al terminar o al ocultar la página
      playing = false;
      playButton.disabled = reduceMotion;
      logLine(`⏹ generación ${generation} → población ${population}`);
      return;
    }
    if (now - last >= 100) { last = now; advance(); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
});
logLine('Listo: pulsa «Un paso» o «Reproducir 100 generaciones»');
```

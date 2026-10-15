// WORKER DEL EJEMPLO 04 (de módulo): el tablero, la simulación, el bucle de
// animación y el dibujo viven aquí. La página solo envía órdenes y recibe un
// resumen ({ type: 'state', … }) cada vez que algo cambia.
import { PATTERNS, place, step, population } from './life.js';

const MAX_GENERATIONS_PER_PLAY = 300; // ninguna animación dura para siempre
let ctx = null;
let cols = 0;
let rows = 0;
let cells = null;
let next = null;
let generation = 0;
let running = false;
let stopAt = 0;
let speed = 15;          // generaciones por segundo
let previous = null;     // instante del frame anterior
let accumulator = 0;     // ms acumulados para el paso fijo (lección «El bucle de animación»)
let frameId = 0;
let cursor = { x: 0, y: 0 };
let showCursor = false;

function draw() {
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, cols, rows);
  ctx.fillStyle = '#1e3a8a';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (cells[y * cols + x]) ctx.fillRect(x + 0.08, y + 0.08, 0.84, 0.84);
    }
  }
  if (showCursor) {
    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 0.18;
    ctx.strokeRect(cursor.x + 0.09, cursor.y + 0.09, 0.82, 0.82);
  }
}

function report() {
  self.postMessage({
    type: 'state', generation, running, population: population(cells),
    cursor: { ...cursor, alive: cells[cursor.y * cols + cursor.x] === 1 },
  });
}

function advance() {
  step(cells, next, cols, rows);
  [cells, next] = [next, cells];
  generation += 1;
}

function frame(now) {
  if (!running) return;
  accumulator += previous === null ? 0 : Math.min(now - previous, 250);
  previous = now;
  let changed = false;
  while (accumulator >= 1000 / speed && generation < stopAt) {
    advance();
    accumulator -= 1000 / speed;
    changed = true;
  }
  if (changed) {
    draw();
    report();
  }
  if (generation >= stopAt) {
    running = false;
    report();
    return;
  }
  frameId = requestAnimationFrame(frame); // el rAF de un worker dedicado (Chrome)
}

const commands = {
  init({ canvas, columns, lines, scale }) {
    cols = columns;
    rows = lines;
    cells = new Uint8Array(cols * rows);
    next = new Uint8Array(cols * rows);
    ctx = canvas.getContext('2d');
    ctx.setTransform(scale, 0, 0, scale, 0, 0); // 1 unidad = 1 celda
    commands.pattern({ name: 'gosper', left: 2, top: 2 });
  },
  pattern({ name, left, top }) {
    cells.fill(0);
    place(cells, cols, rows, PATTERNS[name], left, top);
    generation = 0;
    draw();
    report();
  },
  clear() {
    cells.fill(0);
    generation = 0;
    draw();
    report();
  },
  play() {
    if (running) return;
    running = true;
    stopAt = generation + MAX_GENERATIONS_PER_PLAY;
    previous = null;
    accumulator = 0;
    frameId = requestAnimationFrame(frame);
    report();
  },
  pause() {
    running = false;
    cancelAnimationFrame(frameId);
    report();
  },
  step() {
    advance();
    draw();
    report();
  },
  speed({ value }) {
    speed = value;
  },
  toggle({ x, y }) {
    cursor = { x, y };
    cells[y * cols + x] ^= 1; // XOR con 1: viva ↔ muerta
    draw();
    report();
  },
  cursor({ x, y, visible }) {
    cursor = { x: (x + cols) % cols, y: (y + rows) % rows };
    showCursor = visible;
    draw();
    report();
  },
  // Sin dibujar y sobre una copia: ¿cuántas vivas habrá dentro de n generaciones?
  simulate({ generations }) {
    let a = cells.slice();
    let b = new Uint8Array(a.length);
    const counts = {};
    for (let g = 1; g <= Math.max(...generations); g++) {
      step(a, b, cols, rows);
      [a, b] = [b, a];
      if (generations.includes(g)) counts[g] = population(a);
    }
    self.postMessage({ type: 'simulated', counts });
  },
};

self.onmessage = (event) => commands[event.data.type](event.data);

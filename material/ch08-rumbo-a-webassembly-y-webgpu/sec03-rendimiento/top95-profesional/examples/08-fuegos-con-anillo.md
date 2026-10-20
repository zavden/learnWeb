---
example_description: "Fuegos artificiales con un pool en anillo: 2048 chispas en typed arrays creados una vez, cada chispa nueva ocupa la casilla siguiente y, si el anillo está lleno, pisa a la más vieja (la que ya se apagaba). El gran final pide 3200 chispas y nunca hay más de 2048 ni un objeto nuevo. Dibujo por lotes con mezcla aditiva; empieza con un botón, dura 3 s o hasta «Parar», se para al ocultar la pestaña y respeta «reducir movimiento»"
example_tags: "javascript|rendimiento|canvas|typed-arrays|ring-buffer|object-pooling|requestanimationframe|profesional"
example_stage: professional
example_importance: important
console: true
loop_protect: false
---

# HTML

```html
<main class="show">
  <h1>Fiestas patrias en la plaza</h1>
  <canvas id="sky" width="320" height="200" role="img" aria-label="Cielo nocturno sobre la plaza; los fuegos empiezan al pulsar el botón"></canvas>
  <p class="controls">
    <button id="start" type="button">Lanzar fuegos (3 s)</button>
    <button id="stop" type="button" disabled>Parar</button>
  </p>
  <p id="hud" class="hud">Anillo: 0 de 2048 chispas encendidas</p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --accent: #1d4ed8; --paper: #ffffff; --page: #f8fafc; }
body { margin: 0; font-family: system-ui, sans-serif; color: var(--ink); background: var(--page); }
.show { max-width: 34rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
canvas { display: block; inline-size: 100%; max-inline-size: 320px; aspect-ratio: 320 / 200; border-radius: 0.5rem; background: #020617; }
.controls { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--paper); color: var(--ink); cursor: pointer; }
button:disabled { cursor: not-allowed; color: #64748b; }
button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.hud { color: var(--muted); font-variant-numeric: tabular-nums; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--paper); font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// FUEGOS ARTIFICIALES CON UN ANILLO DE CHISPAS
// - Las chispas viven en un ANILLO de 2048 casillas (typed arrays creados al empezar): cada chispa
//   nueva ocupa la casilla siguiente y, al llegar al final, se vuelve al principio. Pedir una
//   casilla cuesta siempre lo mismo (no se buscan huecos ni se compacta) y la memoria es fija.
// - Si el anillo está lleno, la chispa nueva pisa a la más vieja, que es la que ya se apagaba. El
//   gran final pide 3200 chispas: nunca hay más de 2048, y ni las chispas ni los cohetes crean
//   objetos por frame (solo el texto del contador, cada 6 frames). Es la alternativa al pool de
//   «Integración» (intercambiar la muerta con la última): allí el tope rechaza las nuevas; aquí
//   se sacrifican las viejas.
// - 2048 = 2^11: dar la vuelta es un `& MASK`, sin división ni if.
// - Se dibuja por lotes: las chispas se ordenan por color y brillo (15 lotes, ordenación por
//   conteo en un Uint16Array reutilizado) y cada lote es un solo fill(), con mezcla aditiva.
// - Empieza con un botón, dura 3 s (o hasta «Parar»), se para al ocultar la pestaña y, con
//   «reducir movimiento», enseña una imagen fija del mismo espectáculo.
// - Al cargar, el espectáculo se simula SIN dibujar, con un paso fijo de 1/60 s y azar con
//   semilla: así sus conteos se pueden comprobar. (loop_protect: false porque se mide el trabajo
//   de cada frame; todos los bucles terminan.)

const WIDTH = 320;
const HEIGHT = 200;
const CAPACITY = 2048;
const MASK = CAPACITY - 1;
const GRAVITY = 55;   // px/s²
const DRAG = 0.985;   // frenado por cada 1/60 s
const FUSE = 0.6;     // segundos de subida antes de estallar
const COLORS = ['#fb7185', '#fbbf24', '#4ade80', '#38bdf8', '#c084fc'];
const BANDS = 3;      // tres niveles de brillo por color
// El programa: cuándo sale cada cohete (s), desde dónde (fracción del ancho), color y chispas.
const SHOW = [
  ...[0.2, 0.7, 0.45, 0.85, 0.3, 0.6, 0.15, 0.5].map((x, k) => ({ at: k * 0.25, x, color: k % 5, sparks: 200 })),
  ...[0.2, 0.4, 0.6, 0.8].map((x, k) => ({ at: 2, x, color: (k + 2) % 5, sparks: 400 })), // el gran final, a la vez
];
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function mulberry32(seed) { // azar con semilla: el espectáculo es siempre el mismo
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── El anillo: 7 typed arrays de 2048 casillas (life ≤ 0 = casilla apagada) ──
const x = new Float32Array(CAPACITY);
const y = new Float32Array(CAPACITY);
const vx = new Float32Array(CAPACITY);
const vy = new Float32Array(CAPACITY);
const life = new Float32Array(CAPACITY);  // de 1 (recién nacida) a 0 (apagada)
const fade = new Float32Array(CAPACITY);  // cuánta vida pierde por segundo
const color = new Uint8Array(CAPACITY);
const ringBytes = [x, y, vx, vy, life, fade, color].reduce((sum, array) => sum + array.byteLength, 0);
const ring = { head: 0, written: 0, overwrittenLit: 0, lit: 0, maxLit: 0, bursts: 0 };

function spawnSpark(px, py, pvx, pvy, perSecond, colorIndex) {
  const i = ring.head;
  ring.head = (ring.head + 1) & MASK; // la vuelta al principio
  ring.written += 1;
  if (life[i] > 0) ring.overwrittenLit += 1; // anillo lleno: se pisa la más vieja
  x[i] = px; y[i] = py; vx[i] = pvx; vy[i] = pvy;
  life[i] = 1;
  fade[i] = perSecond;
  color[i] = colorIndex;
}
function burst(px, py, colorIndex, count, random) {
  for (let k = 0; k < count; k++) {
    const angle = (k / count) * Math.PI * 2;
    const speed = 30 + random() * 60;
    spawnSpark(px, py, Math.cos(angle) * speed, Math.sin(angle) * speed, 1 / (1 + random() * 0.6), colorIndex); // vive de 1 a 1,6 s
  }
  ring.bursts += 1;
}

// Los cohetes: 12 objetos creados una vez y reutilizados en cada espectáculo.
const rockets = SHOW.map(() => ({ x: 0, y: 0, vy: 0, fuse: 0, color: 0, sparks: 0, active: false }));
let nextLaunch = 0;
let showTime = 0;
function resetShow() {
  life.fill(0);
  Object.assign(ring, { head: 0, written: 0, overwrittenLit: 0, lit: 0, maxLit: 0, bursts: 0 });
  for (const rocket of rockets) rocket.active = false;
  nextLaunch = 0;
  showTime = 0;
}
function step(dt, random) {
  showTime += dt;
  while (nextLaunch < SHOW.length && SHOW[nextLaunch].at <= showTime) {
    const plan = SHOW[nextLaunch];
    const rocket = rockets[nextLaunch];
    rocket.x = plan.x * WIDTH;
    rocket.y = HEIGHT;
    rocket.vy = -(HEIGHT * 0.55) / FUSE; // sube el 55 % del cielo en FUSE segundos
    rocket.fuse = FUSE;
    rocket.color = plan.color;
    rocket.sparks = plan.sparks;
    rocket.active = true;
    nextLaunch += 1;
  }
  for (let r = 0; r < rockets.length; r++) { // bucles con índice: ni siquiera un iterador por frame
    const rocket = rockets[r];
    if (!rocket.active) continue;
    rocket.y += rocket.vy * dt;
    rocket.fuse -= dt;
    if (rocket.fuse <= 0) {
      rocket.active = false;
      burst(rocket.x, rocket.y, rocket.color, rocket.sparks, random);
    }
  }
  const drag = DRAG ** (dt * 60);
  let lit = 0;
  for (let i = 0; i < CAPACITY; i++) {
    if (life[i] <= 0) continue;
    vy[i] = (vy[i] + GRAVITY * dt) * drag;
    vx[i] *= drag;
    x[i] += vx[i] * dt;
    y[i] += vy[i] * dt;
    life[i] -= fade[i] * dt;
    if (life[i] > 0) lit += 1;
  }
  ring.lit = lit;
  ring.maxLit = Math.max(ring.maxLit, lit);
}

// ── Prueba al cargar: el espectáculo entero, sin dibujar, con paso fijo y semilla ──
resetShow();
const testRandom = mulberry32(2026);
for (let frame = 0; frame < 180; frame++) step(1 / 60, testRandom);
logLine(`simulación de prueba (3 s a 60 Hz, sin dibujar): ${ring.bursts} cohetes · ${ring.written} chispas en un anillo de ${CAPACITY} casillas`);
logLine(`casillas reutilizadas: ${ring.written - CAPACITY} · chispas pisadas aún encendidas: ${ring.overwrittenLit} · encendidas a la vez, como mucho: ${ring.maxLit}`);
logLine(`memoria de las chispas: ${ringBytes} bytes, reservada una vez y la misma al final`);
resetShow();

// ── El dibujo: por lotes de color y brillo ──
const canvas = document.querySelector('#sky');
canvas.width = WIDTH * devicePixelRatio;
canvas.height = HEIGHT * devicePixelRatio;
const ctx = canvas.getContext('2d');
ctx.scale(devicePixelRatio, devicePixelRatio);
const BATCHES = COLORS.length * BANDS;
const batchStart = new Uint16Array(BATCHES + 1);
const cursor = new Uint16Array(BATCHES);
const order = new Uint16Array(CAPACITY); // índices de las chispas encendidas, ordenados por lote
const batchOf = (i) => color[i] * BANDS + Math.min(BANDS - 1, Math.floor(life[i] * BANDS));
function draw(trails) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.fillStyle = trails ? 'rgb(2 6 23 / 0.3)' : '#020617'; // con estela: el frame anterior se oscurece
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  batchStart.fill(0); // ordenación por conteo: cuántas en cada lote, dónde empieza cada uno, y a su sitio
  for (let i = 0; i < CAPACITY; i++) if (life[i] > 0) batchStart[batchOf(i) + 1] += 1;
  for (let b = 1; b <= BATCHES; b++) batchStart[b] += batchStart[b - 1];
  for (let b = 0; b < BATCHES; b++) cursor[b] = batchStart[b];
  for (let i = 0; i < CAPACITY; i++) if (life[i] > 0) order[cursor[batchOf(i)]++] = i;
  ctx.globalCompositeOperation = 'lighter'; // mezcla aditiva: donde se cruzan, brilla más
  for (let b = 0; b < BATCHES; b++) {
    if (batchStart[b] === batchStart[b + 1]) continue;
    ctx.beginPath();
    for (let k = batchStart[b]; k < batchStart[b + 1]; k++) ctx.rect(x[order[k]], y[order[k]], 2, 2);
    ctx.globalAlpha = ((b % BANDS) + 1) / BANDS;
    ctx.fillStyle = COLORS[Math.floor(b / BANDS)];
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fef9c3';
  for (let r = 0; r < rockets.length; r++) if (rockets[r].active) ctx.fillRect(rockets[r].x - 1, rockets[r].y, 2, 5);
}
draw(false);

// ── El espectáculo: 3 s, «Parar», pestaña oculta y «reducir movimiento» ──
const startButton = document.querySelector('#start');
const stopButton = document.querySelector('#stop');
const hud = document.querySelector('#hud');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let frameId = null;
let previous = null;
let random = null;
let stats = { frames: 0, worst: 0 };
function frame(now) {
  const dt = previous === null ? 1 / 60 : Math.min((now - previous) / 1000, 0.05); // tope: tras una pausa, no salta
  previous = now;
  const workStart = performance.now();
  step(dt, random);
  draw(true);
  stats.worst = Math.max(stats.worst, performance.now() - workStart);
  stats.frames += 1;
  if (stats.frames % 6 === 0) hud.textContent = `Anillo: ${ring.lit} de ${CAPACITY} chispas encendidas`;
  if (showTime >= 3) return finish('🎆 fin del espectáculo');
  frameId = requestAnimationFrame(frame);
}
function finish(reason) {
  cancelAnimationFrame(frameId);
  frameId = null;
  startButton.disabled = false;
  stopButton.disabled = true;
  hud.textContent = `Anillo: ${ring.lit} de ${CAPACITY} chispas encendidas`;
  canvas.setAttribute('aria-label', `Fuegos artificiales: ${ring.bursts} cohetes estallaron sobre la plaza`);
  logLine(`${reason} · cohetes: ${ring.bursts} · chispas: ${ring.written} · encendidas a la vez, como mucho: ${ring.maxLit}`);
  logLine(`frames: ≈ ${stats.frames} · chispas pisadas aún encendidas: ≈ ${ring.overwrittenLit} · peor frame: ≈ ${stats.worst.toFixed(1)} ms de trabajo`);
}
startButton.addEventListener('click', () => {
  resetShow();
  random = mulberry32(2026);
  if (reduceMotion.matches) { // una imagen fija: el cielo justo después del gran final
    for (let k = 0; k < 160; k++) step(1 / 60, random);
    draw(false);
    canvas.setAttribute('aria-label', `Fuegos artificiales congelados: ${ring.bursts} cohetes estallados`);
    logLine(`🎆 imagen fija («reducir movimiento» está activado) · cohetes: ${ring.bursts} · chispas encendidas: ${ring.lit}`);
    return;
  }
  previous = null;
  stats = { frames: 0, worst: 0 };
  startButton.disabled = true;
  stopButton.disabled = false;
  logLine('▶ ¡empiezan los fuegos!');
  frameId = requestAnimationFrame(frame);
});
stopButton.addEventListener('click', () => { if (frameId !== null) finish('⏹ parado'); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && frameId !== null) finish('⏹ parado (pestaña oculta)');
});
console.log('Listo: pulsa «Lanzar fuegos (3 s)»; «Parar» los detiene antes');
```

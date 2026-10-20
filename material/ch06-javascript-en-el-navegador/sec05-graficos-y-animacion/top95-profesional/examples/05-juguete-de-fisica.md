---
example_description: "Un juguete de física: pelotas con gravedad que rebotan en las paredes y chocan entre sí (impulso a lo largo de la normal, con restitución), en pasos fijos de 10 ms con acumulador. Pausa, «Paso a paso», añadir pelotas con un clic donde apuntas, semilla para empezar siempre igual y un límite de 60 s"
example_tags: "javascript|canvas|fisica|colisiones|paso-fijo|requestanimationframe|prng|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="toy">
  <h1>Caja de pelotas</h1>
  <canvas id="box" class="toy__box" tabindex="0" role="img" aria-label="Caja con pelotas de colores" aria-describedby="toy-help"></canvas>
  <p id="toy-help" class="toy__help">Haz clic en la caja para añadir una pelota donde apuntas (con el teclado: Tab hasta la caja y Enter).</p>
  <div class="toy__controls">
    <button id="play" type="button">▶ Empezar</button>
    <button id="step" type="button">Paso a paso (+100 ms)</button>
    <button id="reset" type="button">Reiniciar</button>
  </div>
  <p id="status" class="toy__status" role="status"></p>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
.toy {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.toy__box {
  display: block;
  width: 320px;
  max-width: 100%;
  aspect-ratio: 16 / 10;
  background: #0f172a;
  border-radius: 0.5rem;
  cursor: crosshair;
}
.toy__help,
.toy__status {
  font-size: 0.9rem;
  color: #52606d;
}
.toy__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
button:focus-visible,
.toy__box:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Caja de pelotas.
//
// Decisiones de diseño:
// - El mundo mide 320 × 200 unidades y se dibuja escalado a la caja (que puede encoger en un
//   móvil): el clic se convierte con la proporción entre el mundo y la caja.
// - Física en pasos fijos de 10 ms (acumulador con tope de 100 ms por frame): igual en
//   cualquier pantalla, y «Paso a paso» da 10 pasos exactos.
// - Choque entre pelotas de la misma masa: se separan lo que se solapan y se intercambia el
//   impulso a lo largo de la línea que une sus centros, con restitución 0,9.
// - Semilla fija: «Reiniciar» vuelve siempre a la misma caja. Nada se mueve sin pulsar, la
//   pestaña oculta pausa, y el bucle se detiene solo a los 60 s.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const WORLD = { width: 320, height: 200 };
const GRAVITY = 400;
const RESTITUTION = 0.9;
const STEP_MS = 10;
const COLORS = ['#f472b6', '#fde047', '#38bdf8', '#4ade80', '#fb923c'];

function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Física pura ──────────────────────────────────────────────────────────
function collide(a, b, restitution) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  const overlap = a.r + b.r - distance;
  if (overlap <= 0 || distance === 0) return;
  const nx = dx / distance;
  const ny = dy / distance;
  a.x -= (nx * overlap) / 2;                       // separarlas, mitad y mitad
  a.y -= (ny * overlap) / 2;
  b.x += (nx * overlap) / 2;
  b.y += (ny * overlap) / 2;
  const approach = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  if (approach >= 0) return;                       // ya se alejan
  const impulse = (-(1 + restitution) * approach) / 2;
  a.vx -= impulse * nx;
  a.vy -= impulse * ny;
  b.vx += impulse * nx;
  b.vy += impulse * ny;
}
function step(balls, dt) {
  for (const ball of balls) {
    ball.vy += GRAVITY * dt;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    if (ball.x < ball.r) { ball.x = ball.r; ball.vx = -ball.vx * RESTITUTION; }
    if (ball.x > WORLD.width - ball.r) { ball.x = WORLD.width - ball.r; ball.vx = -ball.vx * RESTITUTION; }
    if (ball.y > WORLD.height - ball.r) { ball.y = WORLD.height - ball.r; ball.vy = -ball.vy * RESTITUTION; }
    if (ball.y < ball.r) { ball.y = ball.r; ball.vy = -ball.vy * RESTITUTION; }
  }
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) collide(balls[i], balls[j], RESTITUTION);
  }
}
const energy = (balls) => Math.round(balls.reduce((sum, b) => sum + 0.5 * (b.vx ** 2 + b.vy ** 2) + GRAVITY * (WORLD.height - b.y), 0));
function makeBalls(seed, count) {
  const random = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => ({
    x: 30 + random() * 260, y: 20 + random() * 80, vx: (random() - 0.5) * 200, vy: 0,
    r: 10 + Math.floor(random() * 8), color: COLORS[i % COLORS.length],
  }));
}

// Comprobaciones con números
const a = { x: 0, y: 0, vx: 100, vy: 0, r: 12 };
const b = { x: 20, y: 0, vx: 0, vy: 0, r: 12 };
collide(a, b, 1);
console.log(`choque elástico de frente → A: ${a.vx} · B: ${b.vx} (se intercambian las velocidades)`);
const c = { x: 0, y: 0, vx: 100, vy: 0, r: 12 };
const d = { x: 20, y: 0, vx: 0, vy: 0, r: 12 };
collide(c, d, RESTITUTION);
console.log(`con restitución ${RESTITUTION} → A: ${c.vx} · B: ${d.vx} · cantidad de movimiento: ${c.vx + d.vx}`);
const simulated = makeBalls(41, 6);
const before = energy(simulated);
for (let i = 0; i < 500; i++) step(simulated, STEP_MS / 1000);
console.log('energía tras 5 s simulados < al empezar →', energy(simulated) < before);

// ── Dibujo ───────────────────────────────────────────────────────────────
const canvas = document.querySelector('#box');
const ctx = canvas.getContext('2d');
let balls = makeBalls(41, 6);
function fit() {
  const dpr = window.devicePixelRatio;
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
  const scale = (canvas.clientWidth / WORLD.width) * dpr; // mundo → caja → mapa de bits
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  draw();
}
function draw() {
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);
  for (const ball of balls) {
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);
    ctx.fill();
  }
}

// ── Bucle ────────────────────────────────────────────────────────────────
const playButton = document.querySelector('#play');
const statusLine = document.querySelector('#status');
let frameId = null;
let previous = null;
let accumulator = 0;
let stopTimer = null;
function report(prefix) {
  statusLine.textContent = `${prefix}: ${balls.length} pelota(s) · energía ${energy(balls)}`;
  console.log(statusLine.textContent);
}
function frame(now) {
  if (previous !== null) accumulator += Math.min(now - previous, 100);
  previous = now;
  while (accumulator >= STEP_MS) {
    step(balls, STEP_MS / 1000);
    accumulator -= STEP_MS;
  }
  draw();
  frameId = requestAnimationFrame(frame);
}
function setRunning(running, reason) {
  clearTimeout(stopTimer);
  if (running) {
    previous = null;
    frameId = requestAnimationFrame(frame);
    stopTimer = setTimeout(() => setRunning(false, 'límite de 60 s'), 60000);
    playButton.textContent = '⏸ Pausa';
    statusLine.textContent = 'En marcha';
    console.log('▶ en marcha');
  } else {
    cancelAnimationFrame(frameId);
    frameId = null;
    playButton.textContent = '▶ Seguir';
    report(`⏸ en pausa (${reason})`);
  }
}
playButton.addEventListener('click', () => setRunning(frameId === null, 'botón'));
document.querySelector('#step').addEventListener('click', () => {
  if (frameId !== null) setRunning(false, 'paso a paso');
  for (let i = 0; i < 10; i++) step(balls, STEP_MS / 1000);
  draw();
  report('⏭️ +100 ms');
});
document.querySelector('#reset').addEventListener('click', () => {
  balls = makeBalls(41, 6);
  draw();
  report('↩️ reiniciada');
});
function addBall(x, y) {
  if (balls.length >= 20) {
    statusLine.textContent = 'La caja está llena (20 pelotas).';
    return;
  }
  balls.push({ x, y, vx: 0, vy: 0, r: 12, color: COLORS[balls.length % COLORS.length] });
  draw();
  report(`➕ pelota en (${Math.round(x)}, ${Math.round(y)})`);
}
canvas.addEventListener('click', (event) => {
  const box = canvas.getBoundingClientRect();
  const toWorld = WORLD.width / box.width;          // px CSS → unidades del mundo
  addBall((event.clientX - box.left) * toWorld, (event.clientY - box.top) * toWorld);
});
canvas.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  addBall(WORLD.width / 2, 30);
});
document.addEventListener('visibilitychange', () => { if (document.hidden && frameId !== null) setRunning(false, 'pestaña oculta'); });
let resizePending = null;
window.addEventListener('resize', () => {
  resizePending ??= requestAnimationFrame(() => { resizePending = null; fit(); });
});
fit();
report('Listo');
console.log('Pulsa «Paso a paso» dos veces, luego «Empezar»; haz clic en la caja para añadir pelotas');
```

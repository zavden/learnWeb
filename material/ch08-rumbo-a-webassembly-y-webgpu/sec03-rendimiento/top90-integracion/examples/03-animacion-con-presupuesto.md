---
example_description: "Una lluvia de confeti que vigila su presupuesto: las partículas viven en Float32Array (un pool sin objetos, que retira las muertas intercambiándolas con la última), se dibujan por lotes, y un controlador baja la calidad cuando el trabajo de un frame pasa de 8 ms tres veces seguidas y la sube tras 60 frames holgados. Dura 3 segundos, se pausa, respeta «reducir movimiento» y se para al ocultar la pestaña"
example_tags: "javascript|rendimiento|canvas|float32array|object-pooling|requestanimationframe|presupuesto|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Fiesta de lanzamiento</h1>
  <canvas id="sky" width="320" height="180" role="img" aria-label="Confeti de colores que cae"></canvas>
  <p class="controls">
    <button id="start" type="button">Lanzar confeti (3 s)</button>
    <button id="pause" type="button" disabled>⏸ Pausa</button>
  </p>
  <p id="hud" class="hud" role="status">Calidad 0 · 0 partículas</p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
canvas { display: block; inline-size: 320px; block-size: 180px; background: #0f172a; border-radius: 0.5rem; }
.controls { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:disabled { cursor: not-allowed; color: #64748b; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.hud { font-variant-numeric: tabular-nums; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const WIDTH = 320;
const HEIGHT = 180;
const CAPACITY = 3000;
const QUALITY = [3000, 1500, 750, 300];      // partículas por nivel de calidad
const COLORS = ['#f43f5e', '#f59e0b', '#22c55e', '#38bdf8', '#a78bfa'];
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function mulberry32(seed) { // azar con semilla: la simulación de prueba da siempre lo mismo
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Partículas: un pool en typed arrays. Las vivas ocupan [0, count); al morir una, la última
//    ocupa su sitio (intercambio), así que nunca hay huecos ni objetos nuevos. ──
const x = new Float32Array(CAPACITY);
const y = new Float32Array(CAPACITY);
const vx = new Float32Array(CAPACITY);
const vy = new Float32Array(CAPACITY);
const life = new Float32Array(CAPACITY);
const color = new Uint8Array(CAPACITY);
let count = 0;
let recycled = 0; // huecos reutilizados: partículas que murieron y dejaron sitio a otra
function spawn(random) {
  const i = count++;
  x[i] = random() * WIDTH;
  y[i] = -5;
  vx[i] = (random() - 0.5) * 40;
  vy[i] = 40 + random() * 80;
  life[i] = 1.5 + random() * 2;
  color[i] = Math.floor(random() * COLORS.length);
}
function update(dt, target, random) {
  for (let i = 0; i < count; i++) {
    x[i] += vx[i] * dt;
    y[i] += vy[i] * dt;
    life[i] -= dt;
    if (life[i] <= 0 || y[i] > HEIGHT + 5) {
      count -= 1; // la última pasa a este hueco
      recycled += 1;
      x[i] = x[count]; y[i] = y[count]; vx[i] = vx[count]; vy[i] = vy[count]; life[i] = life[count]; color[i] = color[count];
      i -= 1;
    }
  }
  while (count < target) spawn(random);
}

// ── El controlador del presupuesto: una función pura, fácil de probar sin pantalla. ──
const BUDGET_MS = 8; // la mitad de un frame a 60 Hz: el resto es para el navegador
function nextQuality(state, workMs) {
  const over = workMs > BUDGET_MS ? state.over + 1 : 0;
  const calm = workMs < BUDGET_MS / 3 ? state.calm + 1 : 0;
  if (over >= 3 && state.level < QUALITY.length - 1) return { level: state.level + 1, over: 0, calm: 0 };
  if (calm >= 60 && state.level > 0) return { level: state.level - 1, over: 0, calm: 0 };
  return { level: state.level, over, calm };
}

// Prueba al cargar: un frame pesado suelto no cambia nada; tres seguidos bajan la calidad.
let probe = { level: 0, over: 0, calm: 0 };
const workTimes = [3, 9, 4, 9, 10, 11, 5, 9, 9, 12, ...Array(60).fill(1)];
workTimes.forEach((ms, frame) => {
  const next = nextQuality(probe, ms);
  if (next.level !== probe.level) logLine(`frame ${frame + 1}: calidad ${probe.level} → ${next.level} (${QUALITY[next.level]} partículas)`);
  probe = next;
});
// Y la física, con semilla: 120 pasos sin crear un solo objeto.
const seeded = mulberry32(2026);
for (let step = 0; step < 120; step++) update(1 / 60, 1500, seeded);
logLine(`tras 120 pasos de prueba: ${count} partículas vivas, ${recycled} retiradas y sustituidas, 0 objetos creados (6 typed arrays de ${CAPACITY} casillas)`);
count = 0;

// ── La animación real: 3 s, con pausa, «reducir movimiento» y parada al ocultar la pestaña. ──
const canvas = document.querySelector('#sky');
const dpr = window.devicePixelRatio;
canvas.width = WIDTH * dpr;
canvas.height = HEIGHT * dpr;
const ctx = canvas.getContext('2d');
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  for (let c = 0; c < COLORS.length; c++) { // por lotes: un fill() por color
    ctx.beginPath();
    for (let i = 0; i < count; i++) if (color[i] === c) ctx.rect(x[i], y[i], 3, 3);
    ctx.fillStyle = COLORS[c];
    ctx.fill();
  }
}

const hud = document.querySelector('#hud');
const startButton = document.querySelector('#start');
const pauseButton = document.querySelector('#pause');
const random = mulberry32(Date.now());
let frameId = null;
let previous = null;
let elapsed = 0;
let quality = { level: 0, over: 0, calm: 0 };
let stats = { frames: 0, changes: 0, worst: 0 };
function frame(now) {
  const dt = previous === null ? 0 : Math.min((now - previous) / 1000, 0.1);
  previous = now;
  elapsed += dt;
  const workStart = performance.now();
  update(dt, QUALITY[quality.level], random);
  draw();
  const workMs = performance.now() - workStart;
  const next = nextQuality(quality, workMs);
  if (next.level !== quality.level) stats.changes += 1;
  quality = next;
  stats.frames += 1;
  stats.worst = Math.max(stats.worst, workMs);
  hud.textContent = `Calidad ${quality.level} · ${count} partículas · trabajo ${workMs.toFixed(1)} ms`;
  if (elapsed >= 3) return finish('🎉 fin del confeti');
  frameId = requestAnimationFrame(frame);
}
function pauseLoop(text) {
  cancelAnimationFrame(frameId);
  frameId = null;
  pauseButton.textContent = '▶ Seguir';
  logLine(text);
}
function finish(text) {
  pauseLoop(text);
  pauseButton.disabled = true;
  startButton.disabled = false;
  logLine(`frames: ≈ ${stats.frames} · cambios de calidad: ≈ ${stats.changes} · peor frame: ≈ ${stats.worst.toFixed(1)} ms de trabajo`);
}
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
startButton.addEventListener('click', () => {
  count = 0;
  if (reduceMotion) { // una imagen fija en lugar de la animación
    for (let step = 0; step < 90; step++) update(1 / 60, QUALITY[2], random);
    draw();
    logLine('🎉 confeti quieto («reducir movimiento» está activado)');
    return;
  }
  elapsed = 0;
  previous = null;
  quality = { level: 0, over: 0, calm: 0 };
  stats = { frames: 0, changes: 0, worst: 0 };
  startButton.disabled = true;
  pauseButton.disabled = false;
  pauseButton.textContent = '⏸ Pausa';
  logLine('▶ lanzado');
  frameId = requestAnimationFrame(frame);
});
pauseButton.addEventListener('click', () => {
  if (frameId === null) {
    previous = null;
    pauseButton.textContent = '⏸ Pausa';
    frameId = requestAnimationFrame(frame);
  } else {
    pauseLoop('⏸ en pausa');
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && frameId !== null) pauseLoop('⏸ en pausa (pestaña oculta)');
});
console.log('Listo: pulsa «Lanzar confeti (3 s)»');
```

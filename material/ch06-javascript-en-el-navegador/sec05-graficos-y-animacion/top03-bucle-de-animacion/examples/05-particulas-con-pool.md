---
example_description: "Confeti con un pool de partículas: los 200 objetos se crean al empezar y se reutilizan (ninguna asignación por frame), un generador con semilla los hace reproducibles, y se dibujan por lotes, un fill() por color. El bucle se detiene solo cuando no queda ninguna partícula viva"
example_tags: "javascript|canvas|particulas|object-pooling|prng|rendimiento|requestanimationframe"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Pedido P-3051</h1>
  <canvas id="confetti" width="300" height="200" role="img" aria-label="Confeti de colores que sale disparado y cae"></canvas>
  <p class="controls">
    <button id="confirm" type="button">Confirmar pedido</button>
    <button id="pause" type="button" disabled>⏸ Pausa</button>
  </p>
  <p id="status" aria-live="polite"></p>
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
  background: #ffffff;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Generador con semilla (mulberry32): la misma semilla, siempre la misma secuencia
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;   // de 0 a 1, como Math.random()
  };
}
const COLORS = ['#e11d48', '#f59e0b', '#16a34a', '#2563eb', '#9333ea'];

// EL POOL: todos los objetos, creados una vez. Una partícula «muere» poniendo active = false.
let created = 0;
const pool = Array.from({ length: 200 }, () => {
  created += 1;
  return { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, color: 0 };
});
function burst(count, random) {
  let launched = 0;
  for (const p of pool) {
    if (launched === count) break;
    if (p.active) continue;                       // reutiliza solo las que están libres
    Object.assign(p, { active: true, x: 150, y: 150, vx: (random() - 0.5) * 400, vy: -250 - random() * 250 });
    p.life = 1.2 + random() * 0.8;                // segundos de vida
    p.color = Math.floor(random() * COLORS.length);
    launched += 1;
  }
}
function update(dt) {
  let alive = 0;
  for (const p of pool) {
    if (!p.active) continue;
    p.vy += 900 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) p.active = false;            // vuelve a estar libre: no se borra nada
    else alive += 1;
  }
  return alive;
}

// Simulación exacta: 80 partículas con la semilla 2026, a 60 pasos por segundo
burst(80, mulberry32(2026));
for (let i = 1; i <= 120; i++) {
  const alive = update(1 / 60);
  if (i % 30 === 0) console.log(`tras ${i / 60} s → ${alive} vivas`);
}
console.log(`objetos creados: ${created}, todos al empezar (0 durante la animación)`);

// DIBUJO POR LOTES: un trazado y un fill() por color, no uno por partícula
const canvas = document.querySelector('#confetti');
const dpr = window.devicePixelRatio;
canvas.style.width = '300px';
canvas.style.height = '200px';
canvas.width = 300 * dpr;
canvas.height = 200 * dpr;
const ctx = canvas.getContext('2d');
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
function draw() {
  ctx.clearRect(0, 0, 300, 200);
  COLORS.forEach((color, c) => {
    ctx.beginPath();
    for (const p of pool) if (p.active && p.color === c) ctx.rect(p.x - 3, p.y - 3, 6, 6);
    ctx.fillStyle = color;
    ctx.fill();                                   // 5 fill() por frame, haya 10 o 200 partículas
  });
}

const random = mulberry32(Date.now());            // en vivo, cada lanzamiento distinto
const statusLine = document.querySelector('#status');
const pauseButton = document.querySelector('#pause');
let frameId = null;
let previous = null;
function frame(now) {
  const dt = previous === null ? 0 : Math.min((now - previous) / 1000, 0.1);
  previous = now;
  const alive = update(dt);
  draw();
  if (alive === 0) { stopLoop('🎉 confeti terminado'); pauseButton.disabled = true; return; }
  frameId = requestAnimationFrame(frame);
}
function startLoop() { previous = null; frameId = requestAnimationFrame(frame); pauseButton.disabled = false; pauseButton.textContent = '⏸ Pausa'; }
function stopLoop(text) { cancelAnimationFrame(frameId); frameId = null; pauseButton.textContent = '▶ Seguir'; statusLine.textContent = text; console.log(text); }

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches; // matchMedia: módulo siguiente
document.querySelector('#confirm').addEventListener('click', () => {
  burst(80, random);
  if (reduceMotion) { update(0.3); draw(); statusLine.textContent = '🎉 Pedido confirmado (confeti quieto)'; return; }
  if (frameId === null) startLoop();
  statusLine.textContent = '🎉 Pedido confirmado';
});
pauseButton.addEventListener('click', () => (frameId === null ? startLoop() : stopLoop('⏸ en pausa')));
document.addEventListener('visibilitychange', () => { if (document.hidden && frameId !== null) stopLoop('⏸ en pausa (pestaña oculta)'); });
console.log('Listo: pulsa «Confirmar pedido»');
```

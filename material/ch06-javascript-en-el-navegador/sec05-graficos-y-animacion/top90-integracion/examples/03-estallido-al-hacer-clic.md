---
example_description: "Un estallido de chispas donde haces clic: la posición del puntero pasa a coordenadas del canvas, un pool de 300 partículas evita crear objetos, el bucle arranca con el primer clic y se detiene solo cuando no queda ninguna viva. Con «reducir movimiento», una imagen quieta del estallido; con el teclado, Enter estalla en el centro"
example_tags: "javascript|canvas|particulas|object-pooling|puntero|prefers-reduced-motion|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Fuegos artificiales de las fiestas</h1>
  <canvas id="sky" width="320" height="180" tabindex="0" role="img" aria-label="Cielo nocturno: haz clic (o pulsa Enter) para lanzar un cohete"></canvas>
  <p class="controls">
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
  background: #0f172a;
  cursor: crosshair;
}
canvas:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
```

# JavaScript

```javascript
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const COLORS = ['#fde047', '#f472b6', '#38bdf8', '#4ade80'];
const pool = Array.from({ length: 300 }, () => ({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, color: 0 }));

function burst(x, y, random) {
  let launched = 0;
  for (const p of pool) {
    if (launched === 60) break;
    if (p.active) continue;
    const angle = random() * 2 * Math.PI;
    const speed = 60 + random() * 120;
    Object.assign(p, { active: true, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
    p.life = 0.8 + random() * 0.6;
    p.color = Math.floor(random() * COLORS.length);
    launched += 1;
  }
  return launched;
}
function update(dt) {
  let alive = 0;
  for (const p of pool) {
    if (!p.active) continue;
    p.vy += 120 * dt;                     // un poco de gravedad
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) p.active = false;
    else alive += 1;
  }
  return alive;
}

// Simulación exacta: un estallido con semilla, a 60 pasos por segundo
burst(160, 90, mulberry32(16));
for (let i = 1; i <= 90; i++) {
  const alive = update(1 / 60);
  if (i % 30 === 0) console.log(`tras ${i / 60} s → ${alive} chispas vivas`);
}

// El dibujo (alta densidad) y el bucle
const canvas = document.querySelector('#sky');
const dpr = window.devicePixelRatio;
canvas.style.width = '320px';
canvas.style.height = '180px';
canvas.width = 320 * dpr;
canvas.height = 180 * dpr;
const ctx = canvas.getContext('2d');
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
function draw() {
  ctx.clearRect(0, 0, 320, 180);
  COLORS.forEach((color, c) => {           // por lotes: un fill() por color
    ctx.beginPath();
    for (const p of pool) if (p.active && p.color === c) ctx.rect(p.x - 1.5, p.y - 1.5, 3, 3);
    ctx.fillStyle = color;
    ctx.fill();
  });
}

const random = mulberry32(Date.now());
const statusLine = document.querySelector('#status');
const pauseButton = document.querySelector('#pause');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let frameId = null;
let previous = null;
function frame(now) {
  const dt = previous === null ? 0 : Math.min((now - previous) / 1000, 0.1);
  previous = now;
  const alive = update(dt);
  draw();
  if (alive === 0) { stopLoop('✨ el cielo vuelve a estar oscuro'); pauseButton.disabled = true; return; }
  frameId = requestAnimationFrame(frame);
}
function startLoop() { previous = null; frameId = requestAnimationFrame(frame); pauseButton.disabled = false; pauseButton.textContent = '⏸ Pausa'; }
function stopLoop(text) { cancelAnimationFrame(frameId); frameId = null; pauseButton.textContent = '▶ Seguir'; statusLine.textContent = text; console.log(text); }

function launch(x, y) {
  const launched = burst(x, y, random);
  console.log(`🎆 cohete en (${Math.round(x)}, ${Math.round(y)}) · ${launched} chispas`);
  if (reduceMotion) {                     // una imagen quieta: el estallido a los 0,3 s
    update(0.3);
    draw();
    pool.forEach((p) => { p.active = false; });
    statusLine.textContent = 'Movimiento reducido: el estallido, quieto';
    return;
  }
  if (frameId === null) startLoop();
}
canvas.addEventListener('click', (event) => {
  const box = canvas.getBoundingClientRect();
  launch(event.clientX - box.left, event.clientY - box.top); // px CSS: dibujamos con setTransform(dpr)
});
canvas.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  launch(160, 90);
});
pauseButton.addEventListener('click', () => (frameId === null ? startLoop() : stopLoop('⏸ en pausa')));
document.addEventListener('visibilitychange', () => { if (document.hidden && frameId !== null) stopLoop('⏸ en pausa (pestaña oculta)'); });
draw();
console.log('Listo: haz clic en el cielo (o Tab y Enter)');
```

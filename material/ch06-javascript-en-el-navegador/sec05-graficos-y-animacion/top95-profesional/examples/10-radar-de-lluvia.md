---
example_description: "Un radar de lluvia: 12 fotogramas precalculados (canvas aparte con degradados radiales, generados con semilla) sobre un mapa base, reproducidos con un bucle de paso fijo; Play/Pausa, velocidad, una barra para recorrerlos (con la hora como aria-valuetext) y tres vueltas como máximo. Las horas, con Intl en la zona de Ciudad de México"
example_tags: "javascript|canvas|requestanimationframe|paso-fijo|degradados|intl|range|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="radar">
  <h1>Radar de lluvia · Valle de México</h1>
  <div class="radar__layout">
    <canvas id="radar" class="radar__map" role="img" aria-label="Radar de lluvia"></canvas>
    <div class="radar__side">
      <p id="time" class="radar__time" aria-live="off">14:00</p>
      <ul class="radar__legend" aria-label="Leyenda">
        <li><span style="background: #16a34a"></span>Débil</li>
        <li><span style="background: #f59e0b"></span>Moderada</li>
        <li><span style="background: #dc2626"></span>Fuerte</li>
      </ul>
    </div>
  </div>
  <div class="radar__controls">
    <button id="play" type="button">▶ Reproducir</button>
    <label>Velocidad
      <select id="speed"><option value="1">×1</option><option value="2">×2</option></select></label>
  </div>
  <label class="radar__scrub">Fotograma
    <input id="scrub" type="range" min="0" max="11" step="1" value="0"></label>
  <p id="status" class="radar__status" role="status"></p>
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
.radar {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.15rem;
  margin-top: 0;
}
.radar__layout {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: start;
}
.radar__map {
  width: 240px;
  height: 240px;
  border-radius: 0.5rem;
}
.radar__time {
  margin: 0 0 0.5rem;
  font-size: 2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.radar__legend {
  display: grid;
  gap: 0.3rem;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;
}
.radar__legend span {
  display: inline-block;
  width: 0.9rem;
  height: 0.9rem;
  margin-right: 0.4rem;
  vertical-align: -0.1rem;
  border-radius: 50%;
}
.radar__controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-top: 0.75rem;
}
.radar__scrub {
  display: grid;
  gap: 0.2rem;
  margin-top: 0.5rem;
}
.radar__status {
  color: #52606d;
  font-size: 0.9rem;
}
button,
select {
  font: inherit;
  padding: 0.3rem 0.7rem;
}
button:focus-visible,
select:focus-visible,
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Radar de lluvia.
//
// Decisiones de diseño:
// - Los 12 fotogramas se calculan una vez, al cargar, cada uno en su propio canvas; reproducir
//   es dibujar el mapa base y el fotograma que toque (drawImage), sin recalcular nada.
// - El estado es el índice del fotograma; el bucle avanza con un acumulador (500 ms por
//   fotograma a ×1, 250 ms a ×2) y se detiene solo tras tres vueltas.
// - La barra es un <input type="range"> de verdad (teclado, lectores de pantalla) con la hora
//   en aria-valuetext; moverla pausa la reproducción.
// - Las horas se construyen con su desfase (-06:00) y se formatean en America/Mexico_City.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const SIZE = 240;
const FRAMES = 12;
const SCALE = 2;                                  // fotogramas al doble: nítidos en pantallas × 2
const START = new Date('2026-10-14T14:00:00-06:00');
const clock = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Mexico_City' });
const timeOf = (index) => clock.format(new Date(START.getTime() + index * 15 * 60 * 1000));

function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(1410);
const cells = Array.from({ length: 7 }, () => ({
  x: -40 + random() * 200, y: 30 + random() * 180, radius: 18 + random() * 24, intensity: 0.3 + random() * 0.7,
}));
const colorFor = (intensity) => (intensity > 0.75 ? '220 38 38' : intensity > 0.5 ? '245 158 11' : '22 163 74');
const strong = cells.filter((cell) => cell.intensity > 0.75).length;
console.log(`${FRAMES} fotogramas, de ${timeOf(0)} a ${timeOf(FRAMES - 1)} (hora de Ciudad de México)`);
console.log(`${cells.length} celdas de lluvia, ${strong} fuerte(s)`);

// ── Mapa base y fotogramas, una sola vez ─────────────────────────────────
function makeLayer(draw) {
  const layer = document.createElement('canvas');
  layer.width = SIZE * SCALE;
  layer.height = SIZE * SCALE;
  const ctx = layer.getContext('2d');
  ctx.scale(SCALE, SCALE);
  draw(ctx);
  return layer;
}
const base = makeLayer((ctx) => {
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();                                // dos vías rápidas y un anillo
  ctx.moveTo(0, 130); ctx.lineTo(SIZE, 110);
  ctx.moveTo(120, 0); ctx.lineTo(110, SIZE);
  ctx.moveTo(190, 120);
  ctx.arc(120, 120, 70, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#1f2933';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('CDMX', 126, 136);
});
const radarFrames = Array.from({ length: FRAMES }, (_, f) => makeLayer((ctx) => {
  for (const cell of cells) {
    const x = cell.x + f * 7;                      // el viento lleva las celdas al este…
    const y = cell.y - f * 2;                      // …y un poco al norte
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, cell.radius);
    gradient.addColorStop(0, `rgb(${colorFor(cell.intensity)} / 0.85)`);
    gradient.addColorStop(1, `rgb(${colorFor(cell.intensity)} / 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(x - cell.radius, y - cell.radius, cell.radius * 2, cell.radius * 2);
  }
}));

// ── Dibujo ───────────────────────────────────────────────────────────────
const canvas = document.querySelector('#radar');
const dpr = window.devicePixelRatio;
canvas.width = SIZE * dpr;
canvas.height = SIZE * dpr;
const ctx = canvas.getContext('2d');
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
const scrub = document.querySelector('#scrub');
let index = 0;
function show(i) {
  index = i;
  ctx.drawImage(base, 0, 0, SIZE, SIZE);
  ctx.drawImage(radarFrames[i], 0, 0, SIZE, SIZE);
  document.querySelector('#time').textContent = timeOf(i);
  canvas.setAttribute('aria-label', `Radar de lluvia a las ${timeOf(i)}`);
  scrub.value = i;
  scrub.setAttribute('aria-valuetext', timeOf(i));
}

// ── Reproducción ─────────────────────────────────────────────────────────
const playButton = document.querySelector('#play');
const statusLine = document.querySelector('#status');
let frameId = null;
let previous = null;
let accumulator = 0;
let advanced = 0;                                 // fotogramas avanzados en esta reproducción
function frame(now) {
  if (previous !== null) accumulator += Math.min(now - previous, 100);
  previous = now;
  const msPerFrame = 500 / Number(document.querySelector('#speed').value);
  while (accumulator >= msPerFrame) {
    accumulator -= msPerFrame;
    advanced += 1;
    show((index + 1) % FRAMES);
  }
  if (advanced >= FRAMES * 3) {
    setPlaying(false, 'tres vueltas');
    return;
  }
  frameId = requestAnimationFrame(frame);
}
function setPlaying(playing, reason = '') {
  if (playing) {
    previous = null;
    accumulator = 0;
    advanced = 0;
    frameId = requestAnimationFrame(frame);
  } else {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
  playButton.textContent = playing ? '⏸ Pausa' : '▶ Reproducir';
  statusLine.textContent = playing ? 'Reproduciendo' : `En pausa a las ${timeOf(index)}${reason ? ` (${reason})` : ''}`;
  console.log(playing ? '▶ reproduciendo' : `⏸ ${statusLine.textContent}`);
}
playButton.addEventListener('click', () => setPlaying(frameId === null));
scrub.addEventListener('input', () => {
  if (frameId !== null) setPlaying(false, 'barra');
  show(Number(scrub.value));
});
scrub.addEventListener('change', () => console.log(`🕒 ${timeOf(index)}`));
document.addEventListener('visibilitychange', () => { if (document.hidden && frameId !== null) setPlaying(false, 'pestaña oculta'); });

show(0);
console.log('Listo: pulsa «Reproducir», o mueve la barra (con el teclado: Tab y las flechas)');
```

---
example_description: "Un bucle de animación en canvas con requestAnimationFrame: update(dt) cambia el estado y draw() lo pinta; empieza con un botón, se pausa con cancelAnimationFrame y también al ocultarse la página. Un disco a 33⅓ rpm da una vuelta cada 1,8 s en cualquier pantalla"
example_tags: "javascript|canvas|requestanimationframe|cancelanimationframe|delta-time|bucle"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Tocadiscos</h1>
  <canvas id="record" width="180" height="180" role="img" aria-label="Disco de vinilo con etiqueta roja"></canvas>
  <button id="toggle" type="button">▶ Reproducir</button>
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
  margin-bottom: 0.75rem;
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
const canvas = document.querySelector('#record');
const dpr = window.devicePixelRatio;
canvas.style.width = '180px';
canvas.style.height = '180px';
canvas.width = 180 * dpr;
canvas.height = 180 * dpr;
const ctx = canvas.getContext('2d');
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

// ESTADO y sus dos funciones: update cambia el estado con el tiempo; draw lo pinta
const SPEED = (100 / 3) * 2 * Math.PI / 60;    // 33⅓ vueltas por minuto, en radianes por segundo
let angle = 0;
const advance = (current, dt) => (current + SPEED * dt) % (2 * Math.PI);
function draw() {
  ctx.clearRect(0, 0, 180, 180);
  ctx.save();
  ctx.translate(90, 90);
  ctx.rotate(angle);
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(0, 0, 85, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = '#be123c';                  // la etiqueta, con una marca para ver el giro
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(-3, -26, 6, 18);
  ctx.restore();
}

// EL BUCLE: un frame pide el siguiente; frameId = null significa «parado»
let frameId = null;
let previous = null;
function frame(now) {
  const dt = previous === null ? 0 : Math.min((now - previous) / 1000, 0.1); // segundos, con tope
  previous = now;
  angle = advance(angle, dt);
  draw();
  frameId = requestAnimationFrame(frame);
}
const toggle = document.querySelector('#toggle');
const statusLine = document.querySelector('#status');
function say(text) { statusLine.textContent = text; console.log(text); }
let stopTimer = null;
function play() {
  if (frameId !== null) return;                // ya está en marcha
  previous = null;                             // que el primer dt sea 0, no el tiempo en pausa
  frameId = requestAnimationFrame(frame);
  stopTimer = setTimeout(() => pause('1 minuto'), 60000); // nada gira para siempre
  toggle.textContent = '⏸ Pausa';
  say('▶ girando');
}
function pause(reason) {
  if (frameId === null) return;
  clearTimeout(stopTimer);
  cancelAnimationFrame(frameId);               // cancela el frame ya pedido
  frameId = null;
  toggle.textContent = '▶ Reproducir';
  say(`⏸ en pausa (${reason})`);
}
toggle.addEventListener('click', () => (frameId === null ? play() : pause('botón')));
// Page Visibility (módulo siguiente): pausa si la pestaña se oculta
document.addEventListener('visibilitychange', () => { if (document.hidden) pause('pestaña oculta'); });

draw();                                        // un primer frame quieto: nada se mueve sin pulsar
// La misma función, sin pantalla: 60 frames por segundo simulados
let simulated = 0;
for (let i = 1; i <= 108; i++) {
  simulated = advance(simulated, 1 / 60);
  if (i === 54 || i === 108) console.log(`tras ${i} frames (${i / 60} s) → ${Math.round(simulated * 180 / Math.PI)}°`);
}
say('Listo: pulsa «Reproducir»');
```

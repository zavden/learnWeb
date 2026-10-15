---
example_description: "Física sencilla con una función pura step(pelota, dt): la gravedad cambia la velocidad, la velocidad la posición, y al tocar el suelo la pelota rebota con el 70 % de su velocidad y el roce frena su avance. El bucle se detiene solo cuando la pelota se para; con «reducir movimiento», se dibuja la trayectoria quieta"
example_tags: "javascript|canvas|fisica|gravedad|rebote|paso-fijo|prefers-reduced-motion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Una pelota que bota</h1>
  <canvas id="court" width="300" height="200" role="img" aria-label="Una pelota que cae, bota cada vez menos y se para junto a la pared derecha"></canvas>
  <p class="controls">
    <button id="launch" type="button">Lanzar</button>
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
// LA FÍSICA, sin DOM: px y segundos. y crece hacia abajo; el suelo está en y = 180.
const GRAVITY = 1200;     // px/s²
const RESTITUTION = 0.7;  // en cada bote conserva el 70 % de la velocidad
const FRICTION = 0.8;     // y el roce le deja el 80 % de la velocidad horizontal
const FLOOR = 180;
function step(ball, dt) {
  let { x, y, vx, vy } = ball;
  vy += GRAVITY * dt;                           // 1. la gravedad cambia la velocidad
  x += vx * dt;                                 // 2. la velocidad cambia la posición
  y += vy * dt;
  if (y > FLOOR) {                              // 3. ¿atravesó el suelo en este paso?
    y = FLOOR;                                  //    vuelve encima…
    vy = Math.abs(vy) * RESTITUTION < 40 ? 0 : -vy * RESTITUTION; // …y rebota (o se queda)
    vx *= FRICTION;
  }
  if (x > 290) { x = 290; vx = -vx * RESTITUTION; }               // la pared derecha
  return { x, y, vx, vy };
}
const START = { x: 20, y: 30, vx: 150, vy: 0 };
const atRest = (ball) => ball.y === FLOOR && ball.vy === 0 && Math.abs(ball.vx) < 1;

// La misma física, simulada en pasos de 10 ms: resultados exactos
let simulated = START;
const heights = [];
let steps = 0;
while (!atRest(simulated)) {
  const next = step(simulated, 0.01);
  if (simulated.vy < 0 && next.vy >= 0) heights.push(Math.round(FLOOR - next.y)); // la cima de un bote
  simulated = next;
  steps += 1;
}
console.log('alturas de los botes →', heights.filter((h) => h > 0).join(', '), 'px');
console.log(`se para a los ${steps / 100} s, en x = ${Math.round(simulated.x)} px`);

// EL DIBUJO y EL BUCLE (paso fijo de 10 ms, como en el ejemplo 02)
const canvas = document.querySelector('#court');
const dpr = window.devicePixelRatio;
canvas.style.width = '300px';
canvas.style.height = '200px';
canvas.width = 300 * dpr;
canvas.height = 200 * dpr;
const ctx = canvas.getContext('2d');
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
function draw(ball) {
  ctx.clearRect(0, 0, 300, 200);
  ctx.fillStyle = '#52606d';
  ctx.fillRect(0, 190, 300, 10);
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, 10, 0, 2 * Math.PI);
  ctx.fill();
}

let ball = START;
let frameId = null;
let previous = null;
let accumulator = 0;
const statusLine = document.querySelector('#status');
const pauseButton = document.querySelector('#pause');
function frame(now) {
  if (previous !== null) accumulator += Math.min(now - previous, 100);
  previous = now;
  while (accumulator >= 10) { ball = step(ball, 0.01); accumulator -= 10; }
  draw(ball);
  if (atRest(ball)) {                          // el bucle termina solo
    stopLoop('🏁 la pelota se ha parado');
    pauseButton.disabled = true;
    return;
  }
  frameId = requestAnimationFrame(frame);
}
function startLoop() { previous = null; frameId = requestAnimationFrame(frame); pauseButton.disabled = false; pauseButton.textContent = '⏸ Pausa'; }
function stopLoop(text) { cancelAnimationFrame(frameId); frameId = null; pauseButton.textContent = '▶ Seguir'; statusLine.textContent = text; console.log(text); }

// Con «reducir movimiento» (matchMedia lo verás en el módulo siguiente): la trayectoria, quieta
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function drawTrajectory() {
  draw(START);
  for (let b = START, i = 0; !atRest(b); b = step(b, 0.01), i++) {
    if (i % 4 === 0) ctx.fillRect(b.x - 1.5, b.y - 1.5, 3, 3);   // un punto cada 40 ms
  }
}
document.querySelector('#launch').addEventListener('click', () => {
  if (reduceMotion) {
    drawTrajectory();
    statusLine.textContent = 'Movimiento reducido: la trayectoria, sin animar';
    return;
  }
  ball = START;
  accumulator = 0;
  if (frameId === null) startLoop();
  statusLine.textContent = '▶ en el aire';
});
pauseButton.addEventListener('click', () => {
  if (frameId === null) { startLoop(); statusLine.textContent = '▶ en el aire'; return; }
  stopLoop('⏸ en pausa');
});
document.addEventListener('visibilitychange', () => { if (document.hidden && frameId !== null) stopLoop('⏸ en pausa (pestaña oculta)'); });
draw(START);
console.log('Listo: pulsa «Lanzar»');
```

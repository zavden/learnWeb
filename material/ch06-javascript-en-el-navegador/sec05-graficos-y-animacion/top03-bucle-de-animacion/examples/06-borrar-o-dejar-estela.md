---
example_description: "Cada frame empieza borrando: clearRect deja el lienzo limpio; un fillRect del color de fondo con poca opacidad solo lo oscurece un poco, y lo de los frames anteriores se desvanece poco a poco: una estela"
example_tags: "javascript|canvas|requestanimationframe|clearrect|estela|globalalpha"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Satélite en órbita</h1>
  <canvas id="orbit" width="220" height="220" role="img" aria-label="Un satélite que gira alrededor de un planeta"></canvas>
  <fieldset>
    <legend>Al empezar cada frame</legend>
    <label><input type="radio" name="mode" value="clear" checked> borrar (clearRect)</label>
    <label><input type="radio" name="mode" value="trail"> oscurecer un 15 % (estela)</label>
  </fieldset>
  <button id="toggle" type="button">▶ Empezar</button>
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
  background: #0f172a;   /* el mismo color que la «pintura» de la estela */
}
fieldset {
  margin: 0.75rem 0;
  border: 1px solid #cbd2d9;
}
label {
  display: block;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
button:focus-visible,
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
const canvas = document.querySelector('#orbit');
const dpr = window.devicePixelRatio;
canvas.style.width = '220px';
canvas.style.height = '220px';
canvas.width = 220 * dpr;
canvas.height = 220 * dpr;
const ctx = canvas.getContext('2d');
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

let angle = -Math.PI / 2;
function draw() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  if (mode === 'clear') {
    ctx.clearRect(0, 0, 220, 220);              // todo a transparente: se ve el fondo del CSS
  } else {
    ctx.fillStyle = 'rgb(15 23 42 / 0.15)';     // el color del fondo, al 15 %: lo viejo se apaga poco a poco
    ctx.fillRect(0, 0, 220, 220);
  }
  ctx.fillStyle = '#2563eb';                    // el planeta se repinta entero en cada frame
  ctx.beginPath();
  ctx.arc(110, 110, 30, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = '#fde047';                    // el satélite, en su posición actual
  ctx.beginPath();
  ctx.arc(110 + 80 * Math.cos(angle), 110 + 80 * Math.sin(angle), 7, 0, 2 * Math.PI);
  ctx.fill();
}

let frameId = null;
let previous = null;
function frame(now) {
  const dt = previous === null ? 0 : Math.min((now - previous) / 1000, 0.1);
  previous = now;
  angle += 1.5 * dt;                            // 1,5 radianes por segundo
  draw();
  frameId = requestAnimationFrame(frame);
}
const toggle = document.querySelector('#toggle');
let stopTimer = null;
function setRunning(running) {
  clearTimeout(stopTimer);
  if (running) {
    previous = null;
    frameId = requestAnimationFrame(frame);
    stopTimer = setTimeout(() => setRunning(false), 30000); // nunca más de 30 s seguidos
  } else {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
  toggle.textContent = running ? '⏸ Pausa' : '▶ Empezar';
  console.log(running ? '▶ en órbita' : '⏸ en pausa');
}
toggle.addEventListener('click', () => setRunning(frameId === null));
document.addEventListener('visibilitychange', () => { if (document.hidden && frameId !== null) setRunning(false); });

draw();
// Cuánto queda de algo pintado hace n frames: cada frame conserva el 85 %
for (const n of [5, 10, 20]) console.log(`hace ${n} frames → queda un ${Math.round(100 * 0.85 ** n)} %`);
console.log('Listo: pulsa «Empezar» y cambia el modo');
```

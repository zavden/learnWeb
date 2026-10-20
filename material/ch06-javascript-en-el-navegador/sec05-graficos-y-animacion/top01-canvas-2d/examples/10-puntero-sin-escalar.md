---
example_description: "Un canvas de 800 × 400 mostrado a 320 × 160 px CSS: si usas la posición del puntero (offsetX/offsetY, en px CSS) como coordenada del mapa de bits, la marca cae lejos del clic. Hay que multiplicar por canvas.width / ancho de la caja"
example_tags: "javascript|canvas|puntero|getboundingclientrect|coordenadas|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>¿Dónde aparcaste?</h1>
  <p class="hint">Haz clic en una plaza de cada plano.</p>
  <figure>
    <canvas id="buggy" width="800" height="400" role="img" aria-label="Plano del estacionamiento (versión con el error)"></canvas>
    <figcaption>🐛 offsetX tal cual</figcaption>
  </figure>
  <figure>
    <canvas id="fixed" width="800" height="400" role="img" aria-label="Plano del estacionamiento (versión corregida)"></canvas>
    <figcaption>✅ × canvas.width / ancho de la caja</figcaption>
  </figure>
  <ol id="log" class="log" aria-live="polite"></ol>
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
  margin: 0;
}
.hint {
  color: #52606d;
}
figure {
  margin: 0 0 0.75rem;
}
/* El mapa de bits mide 800 × 400; la caja, 320 × 160: cada px CSS son 2,5 px del mapa de bits */
canvas {
  display: block;
  width: 320px;
  height: 160px;
  background: #e4e7eb;
  cursor: crosshair;
}
.log {
  margin: 0;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Este plano dibuja en SU sistema de 800 × 400 (sin transformación), como muchos juegos.
function drawLot(ctx) {
  ctx.clearRect(0, 0, 800, 400);
  ctx.strokeStyle = '#52606d';
  ctx.lineWidth = 6;
  ctx.font = '36px system-ui, sans-serif';
  ctx.fillStyle = '#1f2933';
  for (let i = 0; i < 8; i++) {
    ctx.strokeRect(i * 100, 0, 100, 150);    // fila de arriba: A1…A8
    ctx.strokeRect(i * 100, 250, 100, 150);  // fila de abajo: B1…B8
    ctx.fillText(`A${i + 1}`, i * 100 + 25, 90);
    ctx.fillText(`B${i + 1}`, i * 100 + 25, 340);
  }
}
function drawPin(ctx, x, y) {
  ctx.fillStyle = '#be123c';
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, 2 * Math.PI);
  ctx.fill();
}

const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.prepend(entry);
}

function setup(canvas, scaled) {
  const ctx = canvas.getContext('2d');
  drawLot(ctx);
  canvas.addEventListener('click', (event) => {
    const box = canvas.getBoundingClientRect();
    const cssX = event.clientX - box.left;   // posición en px CSS (lo mismo que offsetX sin bordes)
    const cssY = event.clientY - box.top;
    // 🐛 px CSS usados como px del mapa de bits · ✅ convertidos con la proporción de los dos tamaños
    const x = scaled ? cssX * (canvas.width / box.width) : cssX;
    const y = scaled ? cssY * (canvas.height / box.height) : cssY;
    drawLot(ctx);
    drawPin(ctx, x, y);
    logLine(`${scaled ? '✅' : '🐛'} clic en (${Math.round(cssX)}, ${Math.round(cssY)}) px CSS → marca en (${Math.round(x)}, ${Math.round(y)}) del mapa de bits`);
  });
}

setup(document.querySelector('#buggy'), false);
setup(document.querySelector('#fixed'), true);
const sample = document.querySelector('#fixed');
logLine(`mapa de bits ${sample.width} × ${sample.height} · caja ${sample.clientWidth} × ${sample.clientHeight} px CSS → × ${sample.width / sample.clientWidth}`);
logLine('Listo: haz clic en una plaza de cada plano');
```

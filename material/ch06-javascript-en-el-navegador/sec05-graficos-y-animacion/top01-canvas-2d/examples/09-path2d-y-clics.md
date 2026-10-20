---
example_description: "Path2D guarda una forma para dibujarla y para preguntar después si un punto cae dentro (isPointInPath): el plano de un mercado en el que se elige un puesto con el ratón o con botones. El punto va en píxeles del mapa de bits"
example_tags: "javascript|canvas|path2d|ispointinpath|eventos|accesibilidad"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Mercado de la colonia</h1>
  <canvas id="map" width="300" height="180" role="img" aria-label="Plano con cuatro puestos: frutas, flores, tacos y café"></canvas>
  <!-- La alternativa de teclado: los mismos puestos como botones de verdad -->
  <div id="stall-buttons" class="buttons" role="group" aria-label="Puestos"></div>
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
  margin-top: 0;
}
canvas {
  display: block;
  background: #ffffff;
}
.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.75rem 0;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.log {
  margin: 0;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const canvas = document.querySelector('#map');
const dpr = window.devicePixelRatio;
canvas.style.width = '300px';
canvas.style.height = '180px';
canvas.width = 300 * dpr;
canvas.height = 180 * dpr;
const ctx = canvas.getContext('2d');
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

function shape(build) { const path = new Path2D(); build(path); return path; } // Path2D tiene moveTo, arc, rect…
const stalls = [
  { label: 'Frutas', color: '#fde68a', x: 30, y: 50, path: shape((p) => p.rect(10, 10, 120, 70)) },
  { label: 'Flores', color: '#fbcfe8', x: 175, y: 50, path: shape((p) => p.roundRect(150, 10, 140, 70, 12)) },
  { label: 'Tacos', color: '#fed7aa', x: 50, y: 140, path: shape((p) => p.arc(70, 135, 35, 0, 2 * Math.PI)) },
  { label: 'Café', color: '#d6d3d1', x: 205, y: 155, path: shape((p) => { p.moveTo(160, 170); p.lineTo(225, 100); p.lineTo(290, 170); p.closePath(); }) },
];
let selected = null;

function draw() {
  ctx.clearRect(0, 0, 300, 180);
  ctx.font = '14px system-ui, sans-serif';
  for (const stall of stalls) {
    ctx.fillStyle = stall.color;
    ctx.fill(stall.path);                 // la misma forma, sin volver a describirla
    ctx.lineWidth = stall === selected ? 4 : 1;
    ctx.strokeStyle = stall === selected ? '#1d4ed8' : '#52606d';
    ctx.stroke(stall.path);
    ctx.fillStyle = '#1f2933';
    ctx.fillText(stall.label, stall.x, stall.y);
  }
}

const logList = document.querySelector('#log');
function choose(stall, how) {
  selected = stall;
  draw();
  const text = `${how} → ${stall ? stall.label : 'ningún puesto'}`;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.prepend(entry);
}

canvas.addEventListener('click', (event) => {
  const box = canvas.getBoundingClientRect();
  const x = event.clientX - box.left;      // píxeles CSS dentro del canvas
  const y = event.clientY - box.top;
  // isPointInPath aplica la transformación actual a la FORMA, pero no al punto: el punto va en
  // píxeles del mapa de bits, así que se multiplica por devicePixelRatio.
  const hit = stalls.find((stall) => ctx.isPointInPath(stall.path, x * dpr, y * dpr));
  choose(hit ?? null, `clic en (${Math.round(x)}, ${Math.round(y)})`);
});
for (const stall of stalls) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = stall.label;
  button.addEventListener('click', () => choose(stall, 'botón'));
  document.querySelector('#stall-buttons').append(button);
}

draw();
const tacos = stalls[2].path;
console.log('centro de Tacos (70, 135) sin × dpr →', ctx.isPointInPath(tacos, 70, 135));
console.log('centro de Tacos × dpr →', ctx.isPointInPath(tacos, 70 * dpr, 135 * dpr));
console.log('Listo: haz clic en un puesto del plano (o usa los botones)');
```

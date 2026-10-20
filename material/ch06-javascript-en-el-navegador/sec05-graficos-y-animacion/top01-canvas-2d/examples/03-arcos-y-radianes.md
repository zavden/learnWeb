---
example_description: "arc(x, y, radio, inicio, fin, antihorario) mide los ángulos en radianes, desde las 3 en punto y en el sentido de las agujas del reloj (la y crece hacia abajo): un gráfico de sectores con sus datos también en una lista"
example_tags: "javascript|canvas|arc|radianes|graficos|accesibilidad"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Ventas de la panadería (sábado)</h1>
  <div class="chart">
    <canvas id="pie" width="160" height="160" role="img" aria-labelledby="pie-data"></canvas>
    <!-- Los datos, también como texto: el canvas solo tiene píxeles -->
    <ul id="pie-data" class="legend"></ul>
  </div>
  <h2>Sentido de giro</h2>
  <canvas id="direction" width="220" height="100" role="img" aria-label="Dos arcos de 0 a 90 grados: horario, un cuarto de vuelta; antihorario, tres cuartos"></canvas>
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
h1,
h2 {
  font-size: 1.1rem;
  margin-top: 0;
}
.chart {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.legend {
  margin: 0;
  padding-left: 1.2rem;
}
.legend span {
  display: inline-block;
  width: 0.8em;
  height: 0.8em;
  margin-right: 0.4em;
  border-radius: 2px;
}
```

# JavaScript

```javascript
function hiDPI(canvas) {
  const dpr = window.devicePixelRatio;
  const { width, height } = canvas;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
const toDegrees = (radians) => Math.round(radians * 180 / Math.PI);

const sales = [
  { label: 'Conchas', percent: 45, color: '#b45309' },
  { label: 'Bolillos', percent: 30, color: '#0e7490' },
  { label: 'Pan de muerto', percent: 25, color: '#be123c' },
];

const pie = hiDPI(document.querySelector('#pie'));
let start = -Math.PI / 2; // las 12 en punto: un cuarto de vuelta ANTES del 0 (las 3 en punto)
for (const slice of sales) {
  const end = start + (slice.percent / 100) * 2 * Math.PI; // una vuelta entera = 2π radianes
  pie.beginPath();
  pie.moveTo(80, 80);              // el centro: sin esto, el sector sería solo un «gajo» de arco
  pie.arc(80, 80, 75, start, end);  // centro, radio, ángulo inicial y final (en radianes)
  pie.closePath();
  pie.fillStyle = slice.color;
  pie.fill();
  console.log(`${slice.label}: de ${toDegrees(start)}° a ${toDegrees(end)}°`);
  const item = document.createElement('li');
  item.innerHTML = `<span style="background: ${slice.color}"></span>${slice.label}: ${slice.percent} %`;
  document.querySelector('#pie-data').append(item);
  start = end;
}

// El mismo arco de 0 a π/2 (90°) en los dos sentidos
const direction = hiDPI(document.querySelector('#direction'));
direction.lineWidth = 6;
direction.strokeStyle = '#1d4ed8';
direction.beginPath();
direction.arc(50, 50, 35, 0, Math.PI / 2);        // horario (por defecto): un cuarto de vuelta
direction.stroke();
direction.beginPath();
direction.arc(165, 50, 35, 0, Math.PI / 2, true); // antihorario: los otros tres cuartos
direction.stroke();
console.log('90° en radianes →', Math.PI / 2);
```

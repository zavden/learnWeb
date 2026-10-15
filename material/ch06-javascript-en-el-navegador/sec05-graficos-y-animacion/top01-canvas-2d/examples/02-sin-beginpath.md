---
example_description: "Sin beginPath, cada stroke() vuelve a pintar TODOS los subtrazados acumulados con el estilo actual: las tres líneas de metro salen del color de la última. beginPath() empieza un trazado nuevo"
example_tags: "javascript|canvas|beginpath|paths|stroke|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Tres líneas de metro</h1>
  <div class="pair">
    <figure>
      <canvas id="buggy" width="210" height="120" role="img" aria-label="Líneas 1, 2 y 3, pero las tres salen moradas"></canvas>
      <figcaption>🐛 sin beginPath</figcaption>
    </figure>
    <figure>
      <canvas id="fixed" width="210" height="120" role="img" aria-label="Línea 1 roja, línea 2 verde, línea 3 morada"></canvas>
      <figcaption>✅ beginPath en cada línea</figcaption>
    </figure>
  </div>
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
.pair {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
figure {
  margin: 0;
}
canvas {
  display: block;
  background: #ffffff;
  border: 1px solid #cbd2d9;
}
```

# JavaScript

```javascript
// Alta densidad: la caja se queda en width × height px CSS; el mapa de bits, × devicePixelRatio.
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

const lines = [
  { y: 30, color: '#dc2626' },  // línea 1, roja
  { y: 60, color: '#16a34a' },  // línea 2, verde
  { y: 90, color: '#7c3aed' },  // línea 3, morada
];

function drawLines(ctx, useBeginPath) {
  ctx.lineWidth = 8;
  for (const line of lines) {
    if (useBeginPath) ctx.beginPath(); // ✅ vacía el trazado: lo que venga es solo esta línea
    ctx.moveTo(20, line.y);
    ctx.lineTo(190, line.y);
    ctx.strokeStyle = line.color;
    ctx.stroke(); // 🐛 sin beginPath, el trazado tiene 1, luego 2, luego 3 líneas: repinta todas
  }
}

// El color que quedó en el centro de la línea 1 (getImageData: lección siguiente)
function colorAt(ctx, x, y) {
  const dpr = window.devicePixelRatio;
  const [r, g, b] = ctx.getImageData(Math.floor(x * dpr), Math.floor(y * dpr), 1, 1).data;
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

const buggy = hiDPI(document.querySelector('#buggy'));
const fixed = hiDPI(document.querySelector('#fixed'));
drawLines(buggy, false);
drawLines(fixed, true);
console.log('🐛 color de la línea 1 →', colorAt(buggy, 105, 30), '(el de la línea 3)');
console.log('✅ color de la línea 1 →', colorAt(fixed, 105, 30));
```

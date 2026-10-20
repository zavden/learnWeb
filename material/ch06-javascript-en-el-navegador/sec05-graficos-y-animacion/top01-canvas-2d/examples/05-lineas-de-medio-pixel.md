---
example_description: "El trazo se centra en la línea matemática: una línea de 1 px en y = 6 cubre medio píxel arriba y medio abajo, y el antialiasing pinta dos filas grises; en y = 6.5 (o con el mapa de bits × devicePixelRatio) cae entera en píxeles y sale nítida"
example_tags: "javascript|canvas|linewidth|antialiasing|devicepixelratio|nitidez"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Líneas de 1 px, ampliadas 6 veces</h1>
  <div class="pair">
    <figure>
      <canvas id="plain" width="40" height="20" role="img" aria-label="Mapa de bits 1:1: arriba, una línea gris de dos filas; abajo, una línea negra de una fila"></canvas>
      <figcaption>1:1 · y = 6 (arriba) e y = 14.5 (abajo)</figcaption>
    </figure>
    <figure>
      <canvas id="dense" width="40" height="20" role="img" aria-label="Mapa de bits × devicePixelRatio: las dos líneas, negras y nítidas"></canvas>
      <figcaption>× devicePixelRatio · las mismas líneas</figcaption>
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
  font-size: 0.85rem;
}
/* Ampliados 6 veces SIN suavizar: cada píxel del mapa de bits se ve como un cuadrado */
canvas {
  display: block;
  width: 240px;
  height: 120px;
  image-rendering: pixelated;
  background: #ffffff;
  border: 1px solid #cbd2d9;
}
```

# JavaScript

```javascript
function drawLines(ctx) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(4, 6);      // y entera: el trazo va de 5.5 a 6.5 → medio píxel en dos filas
  ctx.lineTo(36, 6);
  ctx.moveTo(4, 14.5);   // y + 0.5: el trazo va de 14 a 15 → exactamente una fila
  ctx.lineTo(36, 14.5);
  ctx.stroke();
}

// Cuenta, en la columna x del MAPA DE BITS, las filas pintadas (alfa > 0) y las opacas (alfa 255)
function rows(ctx, x, fromY, toY) {
  const { data } = ctx.getImageData(x, fromY, 1, toY - fromY); // lección siguiente
  let touched = 0;
  let solid = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0) touched += 1;
    if (data[i] === 255) solid += 1;
  }
  return `filas tocadas: ${touched} · opacas: ${solid}`;
}

// 1. Mapa de bits 1:1 (40 × 20): como en una pantalla con devicePixelRatio 1
const plain = document.querySelector('#plain').getContext('2d');
drawLines(plain);
console.log('1:1, y = 6 →', rows(plain, 20, 2, 10));
console.log('1:1, y = 14.5 →', rows(plain, 20, 10, 19));

// 2. Mapa de bits × devicePixelRatio, dibujando en las mismas coordenadas
const dpr = window.devicePixelRatio;
const denseCanvas = document.querySelector('#dense');
denseCanvas.width = 40 * dpr;
denseCanvas.height = 20 * dpr;
const dense = denseCanvas.getContext('2d');
dense.setTransform(dpr, 0, 0, dpr, 0, 0);
drawLines(dense);
console.log(`× ${dpr}, y = 6 →`, rows(dense, 20 * dpr, 2 * dpr, 10 * dpr));
// Con devicePixelRatio 2, 1 px CSS son 2 filas del mapa de bits: y = 6 va de 11 a 13, filas enteras.
```

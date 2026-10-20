---
example_description: "Solución: toBitmapPoint multiplica la posición dentro de la caja por canvas.width / box.width (y en vertical por canvas.height / box.height), y rideAt pregunta a isPointInPath con ese punto del mapa de bits. Las cinco comprobaciones salen ✓ y la marca cae bajo el puntero"
example_tags: "javascript|canvas|puntero|getboundingclientrect|path2d|ispointinpath|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Plano de la feria</h1>
  <canvas id="fair" width="640" height="320" role="img" aria-label="Plano de la feria: la rueda de la fortuna a la izquierda y el carrusel a la derecha"></canvas>
  <p id="status" aria-live="polite">Haz clic en el plano.</p>
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
/* El mapa de bits mide 640 × 320; la caja, la mitad */
canvas {
  display: block;
  width: 320px;
  height: 160px;
  background: #fef9c3;
  cursor: crosshair;
}
```

# JavaScript

```javascript
const canvas = document.querySelector('#fair');
const ctx = canvas.getContext('2d');          // sin transformación: se dibuja en píxeles del mapa de bits
const rides = [
  { name: 'Rueda de la fortuna', color: '#fda4af', path: new Path2D() },
  { name: 'Carrusel', color: '#93c5fd', path: new Path2D() },
];
rides[0].path.arc(160, 160, 110, 0, 2 * Math.PI);
rides[1].path.roundRect(360, 60, 200, 200, 24);

function drawMap(marker) {
  ctx.clearRect(0, 0, 640, 320);
  ctx.font = '28px system-ui, sans-serif';
  ctx.textAlign = 'center';
  for (const ride of rides) {
    ctx.fillStyle = ride.color;
    ctx.fill(ride.path);
  }
  ctx.fillStyle = '#1f2933';
  ctx.fillText('Rueda', 160, 170);
  ctx.fillText('Carrusel', 460, 170);
  if (marker) {
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, 10, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function toBitmapPoint(clientX, clientY) {
  const box = canvas.getBoundingClientRect();
  // ✅ px CSS dentro de la caja × (píxeles del mapa de bits por px CSS)
  return {
    x: (clientX - box.left) * (canvas.width / box.width),
    y: (clientY - box.top) * (canvas.height / box.height),
  };
}

function rideAt(clientX, clientY) {
  const { x, y } = toBitmapPoint(clientX, clientY);
  // ✅ el canvas no tiene transformación: el punto y las formas están en el mismo sistema
  return rides.find((ride) => ctx.isPointInPath(ride.path, x, y))?.name ?? null;
}

canvas.addEventListener('click', (event) => {
  drawMap(toBitmapPoint(event.clientX, event.clientY));
  const name = rideAt(event.clientX, event.clientY);
  document.querySelector('#status').textContent = name ?? 'Ninguna atracción';
  console.log('clic →', name ?? 'ninguna atracción');
});
drawMap(null);

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  const [a, e] = [JSON.stringify(actual), JSON.stringify(expected)];
  if (a === e) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', e, 'y obtuve', a);
}
const box = canvas.getBoundingClientRect();
check('100, 50 px dentro de la caja → 200, 100 del mapa de bits', toBitmapPoint(box.left + 100, box.top + 50), { x: 200, y: 100 });
check('la esquina inferior derecha → 640, 320', toBitmapPoint(box.right, box.bottom), { x: 640, y: 320 });
check('el centro de la rueda (80, 80 en la caja)', rideAt(box.left + 80, box.top + 80), 'Rueda de la fortuna');
check('el centro del carrusel (230, 80 en la caja)', rideAt(box.left + 230, box.top + 80), 'Carrusel');
check('una esquina vacía (300, 150 en la caja)', rideAt(box.left + 300, box.top + 150), null);
```

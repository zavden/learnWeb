---
example_description: "Ejercicio: el plano de una feria dibuja en un mapa de bits de 640 × 320 que el CSS muestra a 320 × 160. Escribe la conversión de la posición del puntero a píxeles del mapa de bits y la búsqueda de la atracción con Path2D e isPointInPath; las comprobaciones usan posiciones de la propia página"
example_tags: "javascript|canvas|puntero|getboundingclientrect|path2d|ispointinpath|ejercicio"
exercise: true
exercise_title: "¿Qué atracción hay bajo el puntero?"
exercise_instructions: "Ejecuta el ejemplo: cuatro comprobaciones salen ✗ y, al hacer clic en el plano, la marca cae lejos del puntero || Completa toBitmapPoint: la posición dentro de la caja (clientX menos box.left, y lo mismo en vertical) multiplicada por la proporción entre el mapa de bits y la caja (canvas.width / box.width, canvas.height / box.height) || Completa rideAt: convierte el punto con toBitmapPoint y devuelve el name de la primera atracción cuya forma lo contiene (ctx.isPointInPath(ride.path, x, y)), o null si no hay ninguna || Ejecuta hasta que las cinco comprobaciones salgan ✓ y haz clic en el plano para comprobarlo a mano"
exercise_hints: "box.width es el ancho de la caja en px CSS (320) y canvas.width el del mapa de bits (640): la proporción es 2 || Este canvas no tiene transformación, así que isPointInPath espera exactamente los píxeles del mapa de bits || Array.prototype.find devuelve undefined si nadie cumple: ?.name ?? null lo convierte en null"
exercise_solution_example: 08-ej-del-puntero-al-canvas-solucion.md
example_stage: exercise
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
  // TODO 1: multiplica por la proporción entre el mapa de bits y la caja
  return { x: clientX - box.left, y: clientY - box.top };
}

function rideAt(clientX, clientY) {
  // TODO 2: convierte el punto y busca la atracción con ctx.isPointInPath(ride.path, x, y)
  return null;
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

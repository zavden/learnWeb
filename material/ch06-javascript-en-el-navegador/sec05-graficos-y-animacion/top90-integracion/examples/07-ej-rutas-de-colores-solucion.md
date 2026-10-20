---
example_description: "Solución: beginPath() al empezar cada ruta (cada stroke() pinta solo su línea) y restore() al final de drawLabel (el giro de la etiqueta no se escapa). Las cinco comprobaciones salen ✓"
example_tags: "javascript|canvas|beginpath|save|restore|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Rutas del Metrobús</h1>
  <canvas id="map" width="320" height="150" role="img" aria-label="Cuatro rutas horizontales con su nombre al final"></canvas>
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
```

# JavaScript

```javascript
const routes = [
  { name: 'L1', y: 30, color: '#b91c1c' },
  { name: 'L2', y: 60, color: '#7c3aed' },
  { name: 'L3', y: 90, color: '#15803d' },
  { name: 'L4', y: 120, color: '#c2410c' },
];

const canvas = document.querySelector('#map');
const dpr = window.devicePixelRatio;
canvas.style.width = '320px';
canvas.style.height = '150px';
canvas.width = 320 * dpr;
canvas.height = 150 * dpr;
const ctx = canvas.getContext('2d');
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
const initialTransform = ctx.getTransform().toString();

function drawRoute(route) {
  ctx.beginPath();                    // ✅ un trazado nuevo: stroke() pintará solo esta línea
  ctx.moveTo(20, route.y);
  ctx.lineTo(250, route.y);
  ctx.strokeStyle = route.color;
  ctx.lineWidth = 8;
  ctx.stroke();
}

function drawLabel(route) {
  ctx.save();
  ctx.translate(266, route.y);
  ctx.rotate(-0.3);
  ctx.fillStyle = route.color;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(route.name, 0, 5);
  ctx.restore();                      // ✅ el save() del principio, deshecho: sin giro ni traslación
}

for (const route of routes) {
  drawRoute(route);
  drawLabel(route);
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  if (actual === expected) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
function colorAt(x, y) {
  const [r, g, b, a] = ctx.getImageData(Math.floor(x * dpr), Math.floor(y * dpr), 1, 1).data;
  return a === 0 ? 'transparente' : '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}
for (const route of routes) check(`ruta ${route.name}: el centro de su línea es ${route.color}`, colorAt(135, route.y), route.color);
check('al terminar, la transformación es la del principio', ctx.getTransform().toString(), initialTransform);
```

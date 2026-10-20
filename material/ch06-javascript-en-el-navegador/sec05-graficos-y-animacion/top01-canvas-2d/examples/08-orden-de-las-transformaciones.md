---
example_description: "translate, rotate y scale se acumulan en una matriz, y el orden importa: trasladar y luego girar gira en el sitio; girar y luego trasladar mueve en diagonal. setTransform fija la matriz entera; resetTransform vuelve a la identidad (y pierde la escala de alta densidad)"
example_tags: "javascript|canvas|transformaciones|rotate|translate|settransform|dommatrix"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>El reloj de la estación</h1>
  <canvas id="clock" width="300" height="160" role="img" aria-label="Reloj con doce marcas que marca las 10:10, y dos cuadrados: uno girado en su sitio y otro desplazado en diagonal"></canvas>
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
const canvas = document.querySelector('#clock');
const dpr = window.devicePixelRatio;
canvas.style.width = '300px';
canvas.style.height = '160px';
canvas.width = 300 * dpr;
canvas.height = 160 * dpr;
const ctx = canvas.getContext('2d');
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

// 1. Doce marcas: llevar el origen al centro, girar, dibujar la marca «hacia arriba»
ctx.fillStyle = '#1f2933';
for (let hour = 0; hour < 12; hour++) {
  ctx.save();
  ctx.translate(80, 80);                // el origen, al centro del reloj
  ctx.rotate(hour * Math.PI / 6);       // 30° por hora (en radianes)
  ctx.fillRect(-2, -66, 4, hour % 3 === 0 ? 16 : 9);
  ctx.restore();
}
function hand(angle, length, width) {   // una aguja: mismo patrón
  ctx.save();
  ctx.translate(80, 80);
  ctx.rotate(angle);
  ctx.fillRect(-width / 2, -length, width, length);
  ctx.restore();
}
hand(10 * Math.PI / 6 + Math.PI / 36, 38, 5); // 10 h (+5° por los 10 minutos)
hand(2 * Math.PI / 6, 55, 3);                 // 10 min = 60°

// 2. El orden importa: el mismo cuadrado con las dos órdenes cambiadas
ctx.fillStyle = '#0e7490';
ctx.save();
ctx.translate(200, 40);                 // ✅ primero mover, luego girar: gira en su sitio
ctx.rotate(Math.PI / 9);
ctx.fillRect(-10, -10, 20, 20);
ctx.restore();
ctx.fillStyle = '#be123c';
ctx.save();
ctx.rotate(Math.PI / 9);                // girar primero: los ejes ya están inclinados…
ctx.translate(200, 40);                 // …y «200 a la derecha» va en diagonal hacia abajo
ctx.fillRect(-10, -10, 20, 20);
ctx.restore();

// 3. DOMMatrix hace las mismas cuentas (¡en grados!): dónde acaba el punto (10, 0)
const fmt = ({ x, y }) => `(${Math.round(x)}, ${Math.round(y)})`;
const point = new DOMPoint(10, 0);
console.log('translate(100, 0) y luego rotate 90° →', fmt(new DOMMatrix().translate(100, 0).rotate(90).transformPoint(point)));
console.log('rotate 90° y luego translate(100, 0) →', fmt(new DOMMatrix().rotate(90).translate(100, 0).transformPoint(point)));

// 4. Las transformaciones se ACUMULAN; setTransform reemplaza la matriz entera
console.log('al empezar → a =', ctx.getTransform().a);   // la escala horizontal de la matriz
ctx.scale(dpr, dpr);                                     // 🐛 escalar otra vez (en cada redibujado…)
console.log('tras otro scale(dpr) → a =', ctx.getTransform().a);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);                  // ✅ no acumula
console.log('tras setTransform → a =', ctx.getTransform().a);
ctx.resetTransform();                                    // la identidad: adiós a la alta densidad
console.log('tras resetTransform → a =', ctx.getTransform().a);
```

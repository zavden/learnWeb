---
example_description: "fillStyle también acepta degradados (lineal, radial, cónico) y patrones; las coordenadas de un degradado son las del canvas, no las de la forma: usado en otra forma, pinta otro tramo (o solo su color final)"
example_tags: "javascript|canvas|degradados|createlineargradient|createradialgradient|createpattern"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Invernadero</h1>
  <canvas id="scene" width="300" height="170" role="img" aria-label="Dos barras de temperatura, un sol con degradado radial, una rueda de color y un rótulo rayado de agotado"></canvas>
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
const canvas = document.querySelector('#scene');
const dpr = window.devicePixelRatio;
canvas.style.width = '300px';
canvas.style.height = '170px';
canvas.width = 300 * dpr;
canvas.height = 170 * dpr;
const ctx = canvas.getContext('2d');
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

// 1. Lineal: de (10, 0) a (140, 0), EN COORDENADAS DEL CANVAS
const heat = ctx.createLinearGradient(10, 0, 140, 0);
heat.addColorStop(0, '#2563eb');    // frío
heat.addColorStop(0.5, '#facc15');
heat.addColorStop(1, '#dc2626');    // calor
ctx.fillStyle = heat;
ctx.fillRect(10, 15, 130, 30);      // ✅ la barra ocupa justo el tramo del degradado
ctx.fillRect(160, 15, 130, 30);     // ⚠️ esta barra está más allá del final: solo el último color

// 2. Radial: entre un círculo interior (centro, radio 5) y otro exterior (radio 40)
const sun = ctx.createRadialGradient(60, 115, 5, 60, 115, 40);
sun.addColorStop(0, '#fef9c3');
sun.addColorStop(1, '#f59e0b');
ctx.fillStyle = sun;
ctx.beginPath();
ctx.arc(60, 115, 40, 0, 2 * Math.PI);
ctx.fill();

// 3. Cónico: el color gira alrededor de un centro (ángulo inicial en radianes)
const wheel = ctx.createConicGradient(0, 150, 115);
['#dc2626', '#facc15', '#16a34a', '#2563eb', '#dc2626'].forEach((color, i) => wheel.addColorStop(i / 4, color));
ctx.fillStyle = wheel;
ctx.beginPath();
ctx.arc(150, 115, 35, 0, 2 * Math.PI);
ctx.fill();

// 4. Patrón: un canvas pequeño (el «azulejo») que se repite
const tile = document.createElement('canvas');
tile.width = 8;
tile.height = 8;
const tileCtx = tile.getContext('2d');
tileCtx.fillStyle = '#fde68a';
tileCtx.fillRect(0, 0, 8, 8);
tileCtx.fillStyle = '#92400e';
tileCtx.fillRect(0, 0, 4, 8);       // media columna oscura: rayas verticales
ctx.fillStyle = ctx.createPattern(tile, 'repeat');
ctx.fillRect(205, 85, 85, 60);
ctx.fillStyle = '#ffffff';
ctx.fillRect(215, 104, 65, 22);
ctx.fillStyle = '#92400e';
ctx.font = 'bold 13px system-ui, sans-serif';
ctx.fillText('AGOTADO', 219, 120);

// getImageData (lección siguiente): el centro de la segunda barra
const [r, g, b] = ctx.getImageData(225 * dpr, 30 * dpr, 1, 1).data;
console.log(`centro de la 2.ª barra → rgb(${r}, ${g}, ${b}): el color final, #dc2626`);
console.log('un degradado es un objeto →', heat.constructor.name);
```

---
example_description: "El contexto 2D: fillRect, strokeRect y clearRect con fillStyle, strokeStyle y lineWidth; el canvas se ajusta a su caja × devicePixelRatio y se redibuja al cambiar el tamaño de la ventana"
example_tags: "javascript|canvas|api-2d|fillrect|clearrect|devicepixelratio"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Boleto de entrada</h1>
  <!-- role="img" + aria-label: para un lector de pantalla, el canvas es una imagen (capítulo de HTML) -->
  <canvas id="ticket" role="img" aria-label="Boleto del Museo de Arte Popular, sala 3"></canvas>
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
/* La CAJA del canvas: el CSS decide cuánto mide en la página */
#ticket {
  display: block;
  width: 100%;
  max-width: 360px;
  height: 140px;
}
```

# JavaScript

```javascript
const canvas = document.querySelector('#ticket');
const ctx = canvas.getContext('2d'); // el contexto: el objeto con todas las órdenes de dibujo

// Alta densidad (lección «Canvas y gráficos» del capítulo de HTML): mapa de bits = caja ×
// devicePixelRatio, y setTransform hace que el resto del código dibuje en píxeles CSS.
function fitToBox() {
  const dpr = window.devicePixelRatio;
  canvas.width = Math.round(canvas.clientWidth * dpr);  // asignar width borra y reinicia el contexto…
  canvas.height = Math.round(canvas.clientHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);                // …así que la escala va DESPUÉS
}

function draw() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.fillStyle = '#fef3c7';          // 1. el fondo: un rectángulo relleno (x, y, ancho, alto)
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#b45309';          // 2. la matriz del boleto, a la derecha
  ctx.fillRect(w - 90, 0, 90, h);
  ctx.strokeStyle = '#78350f';        // 3. strokeRect pinta solo el contorno, con lineWidth
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w - 4, h - 4);
  ctx.clearRect(w - 55, 20, 20, 20);  // 4. un agujero: clearRect deja píxeles TRANSPARENTES
  ctx.fillStyle = '#78350f';          // (el texto, en el ejemplo 04)
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillText('Museo de Arte Popular', 16, 44);
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('Sala 3 · sábado 10:00', 16, 74);
}

fitToBox();
draw();
// La caja mide 100 % del ancho (hasta 360 px): al cambiar la ventana, nuevo mapa de bits y a redibujar.
window.addEventListener('resize', () => {
  fitToBox();
  draw();
});

const dpr = window.devicePixelRatio;
console.log('devicePixelRatio →', dpr);
console.log('mapa de bits = caja × devicePixelRatio →', canvas.width === Math.round(canvas.clientWidth * dpr));
// getImageData lee píxeles del mapa de bits (lección siguiente): el centro del agujero
const holeX = Math.round((canvas.clientWidth - 45) * dpr);
const [r, g, b, a] = ctx.getImageData(holeX, 30 * dpr, 1, 1).data;
console.log(`centro del agujero → rgba(${r}, ${g}, ${b}, ${a}): transparente, se ve la página`);
// El contexto guarda el color ya interpretado, en hexadecimal
ctx.fillStyle = 'goldenrod';
console.log("fillStyle = 'goldenrod' →", ctx.fillStyle);
```

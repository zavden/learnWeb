---
example_description: "getImageData devuelve un ImageData: width, height y data, un Uint8ClampedArray con 4 números por píxel (rojo, verde, azul, alfa) fila a fila. El píxel (x, y) empieza en el índice (y * width + x) * 4"
example_tags: "javascript|canvas|getimagedata|imagedata|rgba|pixeles"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Cuatro colores del mercado</h1>
  <!-- Mapa de bits 1:1 a propósito: aquí una coordenada CSS es un píxel del mapa de bits -->
  <canvas id="swatches" width="250" height="50" role="img" aria-label="Muestras: rojo, azul petróleo, amarillo, verde y un hueco transparente"></canvas>
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
  border: 1px dashed #9aa5b1;
}
```

# JavaScript

```javascript
const ctx = document.querySelector('#swatches').getContext('2d');
['#e11d48', '#0e7490', '#facc15', '#16a34a'].forEach((color, i) => {
  ctx.fillStyle = color;
  ctx.fillRect(i * 50, 0, 50, 50);   // el quinto hueco (200-250) se queda sin pintar
});

const image = ctx.getImageData(0, 0, 250, 50);   // x, y, ancho, alto: una COPIA de esos píxeles
console.log(`ImageData → ${image.width} × ${image.height}, data con ${image.data.length} números`);
console.log('tipo de data →', image.data.constructor.name);

// Los píxeles van fila a fila, y cada uno ocupa 4 posiciones: R, G, B, A (de 0 a 255)
function pixelAt(x, y) {
  const index = (y * image.width + x) * 4;       // dónde empieza el rojo del píxel (x, y)
  return { index, rgba: Array.from(image.data.slice(index, index + 4)).join(', ') };
}
for (const [x, y] of [[25, 25], [60, 10], [225, 25]]) {
  const { index, rgba } = pixelAt(x, y);
  console.log(`píxel (${x}, ${y}) → índice ${index} → ${rgba}`);
}

// Los bytes de un color hexadecimal (capítulo de CSS, lección «Color») son esos números
const hexBytes = ['e1', '1d', '48'].map((pair) => parseInt(pair, 16));
console.log('#e11d48 → e1 1d 48 →', hexBytes.join(', '));
```

---
example_description: "Una convolución 3×3 calcula cada píxel con sus 8 vecinos multiplicados por los pesos de un núcleo: desenfocar (todos 1/9), enfocar y detectar bordes. En los bordes de la imagen, el vecino que falta se sustituye por el píxel más cercano"
example_tags: "javascript|canvas|pixeles|convolucion|desenfoque|bordes"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Convolución 3×3</h1>
  <canvas id="photo" width="480" height="323" role="img" aria-label="Katsushika Hokusai, La gran ola de Kanagawa: una ola enorme con espuma sobre tres barcas y el monte Fuji al fondo"></canvas>
  <p class="credit">Katsushika Hokusai, <cite>La gran ola de Kanagawa</cite>, c. 1831. Dominio público.</p>
  <div class="buttons" role="group" aria-label="Núcleos">
    <button type="button" data-kernel="identity">Original</button>
    <button type="button" data-kernel="blur">Desenfocar</button>
    <button type="button" data-kernel="sharpen">Enfocar</button>
    <button type="button" data-kernel="edges">Bordes</button>
  </div>
  <p id="status" aria-live="polite"></p>
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
  width: 240px;
  height: auto;
}
.credit {
  margin: 0.25rem 0 0.75rem;
  font-size: 0.8rem;
  color: #52606d;
}
.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.6rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Núcleos: los pesos de los 9 píxeles (el central es el del medio), fila a fila
const kernels = {
  identity: [0, 0, 0, 0, 1, 0, 0, 0, 0],
  blur: Array(9).fill(1 / 9),                 // la media de los 9: suaviza
  sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],   // el centro menos sus vecinos: exagera las diferencias
  edges: [-1, -1, -1, -1, 8, -1, -1, -1, -1], // 0 donde todo es igual; mucho donde hay un borde
};

function convolve(source, kernel) {
  const { width, height, data: src } = source;
  const result = new ImageData(width, height);  // ← el resultado va APARTE (ejemplo 06)
  const out = result.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let k = 0; k < 9; k++) {
        // El vecino (x - 1…x + 1, y - 1…y + 1); fuera de la imagen, el píxel del borde más cercano
        const sx = Math.min(width - 1, Math.max(0, x + (k % 3) - 1));
        const sy = Math.min(height - 1, Math.max(0, y + Math.floor(k / 3) - 1));
        const i = (sy * width + sx) * 4;
        r += src[i] * kernel[k];
        g += src[i + 1] * kernel[k];
        b += src[i + 2] * kernel[k];
      }
      const o = (y * width + x) * 4;
      out[o] = r;                               // el Uint8ClampedArray redondea y satura
      out[o + 1] = g;
      out[o + 2] = b;
      out[o + 3] = src[o + 3];
    }
  }
  return result;
}

// Prueba con números: 3 filas iguales, gris oscuro a la izquierda y claro a la derecha
const row = [40, 40, 40, 200, 200];
const test = new ImageData(5, 3);
[...row, ...row, ...row].forEach((v, p) => test.data.set([v, v, v, 255], p * 4));
const middleRow = (image) => Array.from({ length: 5 }, (_, x) => image.data[(5 + x) * 4]).join(', ');
console.log('fila de prueba →', middleRow(test));
const names = { blur: 'desenfocar', sharpen: 'enfocar', edges: 'bordes' };
for (const key of ['blur', 'sharpen', 'edges']) console.log(`${names[key]} →`, middleRow(convolve(test, kernels[key])));

const canvas = document.querySelector('#photo');
const ctx = canvas.getContext('2d');
const img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'great-wave.jpg';
await img.decode();
ctx.drawImage(img, 0, 0);
const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
const statusLine = document.querySelector('#status');
document.querySelector('.buttons').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  ctx.putImageData(convolve(original, kernels[button.dataset.kernel]), 0, 0);
  statusLine.textContent = `${button.textContent}: ${original.width * original.height * 9} multiplicaciones por canal`;
  console.log(statusLine.textContent);
});
statusLine.textContent = 'Listo: elige un núcleo';
console.log(statusLine.textContent);
```

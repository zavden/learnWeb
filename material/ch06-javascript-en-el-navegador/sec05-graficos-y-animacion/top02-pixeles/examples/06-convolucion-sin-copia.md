---
example_description: "Una convolución que escribe en el mismo array que lee usa, para cada píxel, vecinos de arriba y de la izquierda YA desenfocados: el desenfoque se arrastra hacia abajo y a la derecha. Hay que leer de una copia y escribir en otra"
example_tags: "javascript|canvas|pixeles|convolucion|copia|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Desenfocar, tres pasadas</h1>
  <div class="pair">
    <figure>
      <canvas id="buggy" width="200" height="100" role="img" aria-label="La palabra OLA desenfocada con una estela hacia abajo y a la derecha"></canvas>
      <figcaption>🐛 lee y escribe en el mismo array</figcaption>
    </figure>
    <figure>
      <canvas id="fixed" width="200" height="100" role="img" aria-label="La palabra OLA desenfocada por igual en todas direcciones"></canvas>
      <figcaption>✅ lee de una copia</figcaption>
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
canvas {
  display: block;
}
```

# JavaScript

```javascript
// Desenfoque 3×3 (la media de los 9). Con inPlace, «out» es el MISMO array que «src».
function boxBlur(image, inPlace) {
  const { width, height, data: src } = image;
  const out = inPlace ? src : new Uint8ClampedArray(src.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sums = [0, 0, 0];
      for (let k = 0; k < 9; k++) {
        const sx = Math.min(width - 1, Math.max(0, x + (k % 3) - 1));
        const sy = Math.min(height - 1, Math.max(0, y + Math.floor(k / 3) - 1));
        const i = (sy * width + sx) * 4;
        // 🐛 con inPlace, los vecinos de ARRIBA y de la IZQUIERDA ya son valores desenfocados
        for (let c = 0; c < 3; c++) sums[c] += src[i + c] / 9;
      }
      const o = (y * width + x) * 4;
      out[o] = sums[0];
      out[o + 1] = sums[1];
      out[o + 2] = sums[2];
      out[o + 3] = src[o + 3];
    }
  }
  return inPlace ? image : new ImageData(out, width, height);
}

// 1. Con números: un único punto de valor 90 en una imagen de 5 × 5
function dotImage() {
  const image = new ImageData(5, 5);
  for (let p = 0; p < 25; p++) image.data.set(p === 12 ? [90, 90, 90, 255] : [0, 0, 0, 255], p * 4);
  return image;
}
function printRows(label, image) {
  console.log(label);
  for (let y = 0; y < 5; y++) {
    const values = Array.from({ length: 5 }, (_, x) => String(image.data[(y * 5 + x) * 4]).padStart(2));
    console.log(`fila ${y} → ${values.join(' ')}`);
  }
}
printRows('✅ con copia: un cuadrado de 3 × 3, simétrico', boxBlur(dotImage(), false));
printRows('🐛 en el mismo array: la mancha se arrastra abajo a la derecha', boxBlur(dotImage(), true));

// 2. Con una imagen: la palabra OLA, desenfocada tres veces de cada forma
function drawWord(canvas, inPlace) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 200, 100);
  ctx.fillStyle = '#e0f2fe';
  ctx.font = 'bold 56px system-ui, sans-serif';
  ctx.fillText('OLA', 40, 72);
  let image = ctx.getImageData(0, 0, 200, 100);
  for (let pass = 0; pass < 3; pass++) image = boxBlur(image, inPlace);
  ctx.putImageData(image, 0, 0);
}
drawWord(document.querySelector('#buggy'), true);
drawWord(document.querySelector('#fixed'), false);
```

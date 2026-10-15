---
example_description: "Solución: una función luma con los pesos de la luminancia, y dos filtros que copian los números en un ImageData nuevo antes de tocarlos (el original se conserva) y no cambian el alfa. Las seis comprobaciones salen ✓"
example_tags: "javascript|canvas|pixeles|imagedata|escala-de-grises|umbral|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Gris y umbral</h1>
  <div class="trio">
    <figure><canvas width="240" height="165" role="img" aria-label="Valle de México en color"></canvas><figcaption>original</figcaption></figure>
    <figure><canvas width="240" height="165" role="img" aria-label="Valle de México en escala de grises"></canvas><figcaption>grayscale</figcaption></figure>
    <figure><canvas width="240" height="165" role="img" aria-label="Valle de México en blanco y negro puros"></canvas><figcaption>threshold(128)</figcaption></figure>
  </div>
  <p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
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
.trio {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
figure {
  margin: 0;
  font-size: 0.8rem;
}
canvas {
  display: block;
  width: 140px;
  height: auto;
}
.credit {
  font-size: 0.8rem;
  color: #52606d;
}
```

# JavaScript

```javascript
const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

// ✅ Una copia de los números: el ImageData que nos pasan no se toca
const copyOf = (image) => new ImageData(new Uint8ClampedArray(image.data), image.width, image.height);

function grayscale(image) {
  const result = copyOf(image);
  const { data } = result;
  for (let i = 0; i < data.length; i += 4) {
    const y = luma(data[i], data[i + 1], data[i + 2]); // ✅ la luminancia, no la media
    data[i] = y;
    data[i + 1] = y;
    data[i + 2] = y;                                   // data[i + 3], el alfa, se queda igual
  }
  return result;
}

function threshold(image, limit) {
  const result = copyOf(image);
  const { data } = result;
  for (let i = 0; i < data.length; i += 4) {
    const value = luma(data[i], data[i + 1], data[i + 2]) >= limit ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
  return result;
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  const [a, e] = [JSON.stringify(actual), JSON.stringify(expected)];
  if (a === e) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', e, 'y obtuve', a);
}
const pixels = (...rgba) => new ImageData(new Uint8ClampedArray(rgba), rgba.length / 4, 1);
const values = (image) => Array.from(image.data);

check('gris del rojo 225, 29, 72 → 74', values(grayscale(pixels(225, 29, 72, 255))), [74, 74, 74, 255]);
check('gris del verde 0, 200, 0 → 143 (el verde pesa más)', values(grayscale(pixels(0, 200, 0, 255))), [143, 143, 143, 255]);
const source = pixels(225, 29, 72, 255);
grayscale(source);
check('grayscale no cambia la imagen original', values(source), [225, 29, 72, 255]);
check('umbral 128: un gris claro → blanco, uno oscuro → negro',
  values(threshold(pixels(200, 200, 200, 255, 100, 100, 100, 255), 128)), [255, 255, 255, 255, 0, 0, 0, 255]);
check('umbral 128: el azul puro (luminancia 18) → negro', values(threshold(pixels(0, 0, 255, 255), 128)), [0, 0, 0, 255]);
check('el alfa se conserva', values(threshold(pixels(250, 250, 250, 128), 128)), [255, 255, 255, 128]);

// Las tres versiones del cuadro, con tus funciones
const [originalCanvas, grayCanvas, thresholdCanvas] = document.querySelectorAll('canvas');
const img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'valley-of-mexico.jpg';
await img.decode();
const ctx = originalCanvas.getContext('2d');
ctx.drawImage(img, 0, 0, 240, 165);
const photo = ctx.getImageData(0, 0, 240, 165);
grayCanvas.getContext('2d').putImageData(grayscale(photo), 0, 0);
thresholdCanvas.getContext('2d').putImageData(threshold(photo, 128), 0, 0);
```

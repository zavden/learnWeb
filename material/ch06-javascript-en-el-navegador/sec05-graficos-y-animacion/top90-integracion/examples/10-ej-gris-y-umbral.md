---
example_description: "Ejercicio: dos filtros de píxeles, escala de grises y umbral, comprobados con píxeles conocidos. El gris de partida es la media de los tres canales y modifica la imagen original; el umbral no hace nada. Hay que usar los pesos de la luminancia, trabajar sobre una copia y conservar el alfa"
example_tags: "javascript|canvas|pixeles|imagedata|escala-de-grises|umbral|ejercicio"
exercise: true
exercise_title: "Gris y umbral, píxel a píxel"
exercise_instructions: "Ejecuta el ejemplo: las seis comprobaciones salen ✗ || grayscale debe devolver un ImageData NUEVO (copia los números con new Uint8ClampedArray(image.data)) y dejar el original como estaba || En cada píxel, el gris es la luminancia 0.2126 R + 0.7152 G + 0.0722 B, no la media; el alfa (i + 3) no se toca || Completa threshold: también sobre una copia, cada píxel pasa a blanco (255, 255, 255) si su luminancia es mayor o igual que limit, y a negro si no || Ejecuta hasta que las seis comprobaciones salgan ✓; las dos versiones del cuadro se dibujan con tus funciones"
exercise_hints: "new ImageData(datos, ancho, alto) crea un ImageData con los números que le des || No hace falta Math.round: el Uint8ClampedArray redondea al guardar || Una función luma(r, g, b) que usen las dos evita repetir los pesos"
exercise_solution_example: 10-ej-gris-y-umbral-solucion.md
example_stage: exercise
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
function grayscale(image) {
  // TODO 1: trabaja sobre una copia y usa la luminancia en vez de la media
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) {
    const average = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = average;
    data[i + 1] = average;
    data[i + 2] = average;
  }
  return image;
}

function threshold(image, limit) {
  // TODO 2: blanco si la luminancia es ≥ limit, negro si no (sobre una copia)
  return image;
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

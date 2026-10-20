---
example_description: "Filtros que miran cada píxel por separado: escala de grises con los pesos de la luminancia, negativo, umbral y brillo (el Uint8ClampedArray satura solo). Se aplican sobre una copia de los píxeles originales de un cuadro de Velasco"
example_tags: "javascript|canvas|pixeles|filtros|escala-de-grises|imagedata"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Filtros píxel a píxel</h1>
  <canvas id="photo" width="480" height="330" role="img" aria-label="José María Velasco, Valle de México, 1877: un valle con lagos y volcanes bajo un cielo con nubes"></canvas>
  <p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
  <div class="buttons" role="group" aria-label="Filtros">
    <button type="button" data-filter="original">Original</button>
    <button type="button" data-filter="grayscale">Escala de grises</button>
    <button type="button" data-filter="invert">Negativo</button>
    <button type="button" data-filter="threshold">Umbral</button>
    <button type="button" data-filter="brighten">Más brillo</button>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
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
/* Mapa de bits de 480 × 330 en una caja de 240 × 165: nítido con devicePixelRatio 2 */
canvas {
  display: block;
  width: 240px;
  height: 165px;
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
.log {
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Cada filtro recibe el rojo, el verde y el azul de UN píxel y devuelve los nuevos.
const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b; // el ojo ve más el verde
const filters = {
  original: (r, g, b) => [r, g, b],
  grayscale: (r, g, b) => { const y = luma(r, g, b); return [y, y, y]; },
  invert: (r, g, b) => [255 - r, 255 - g, 255 - b],
  threshold: (r, g, b) => (luma(r, g, b) >= 128 ? [255, 255, 255] : [0, 0, 0]),
  brighten: (r, g, b) => [r + 60, g + 60, b + 60],   // el Uint8ClampedArray satura en 255
};
const labels = { original: 'Original', grayscale: 'Escala de grises', invert: 'Negativo', threshold: 'Umbral', brighten: 'Más brillo' };
for (const [key, filter] of Object.entries(filters)) {
  console.log(`${labels[key]}: 225, 29, 72 → ${Array.from(Uint8ClampedArray.from(filter(225, 29, 72))).join(', ')}`);
}

function applyFilter(source, filter) {
  // Una copia: el original se conserva para el siguiente filtro
  const result = new ImageData(new Uint8ClampedArray(source.data), source.width, source.height);
  const { data } = result;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = filter(data[i], data[i + 1], data[i + 2]);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;                                  // data[i + 3], el alfa, no se toca
  }
  return result;
}

const canvas = document.querySelector('#photo');
const ctx = canvas.getContext('2d');
const img = new Image();
img.crossOrigin = 'anonymous'; // ANTES de src: en las tarjetas, la imagen es de otro origen (ejemplo 09)
img.src = 'valley-of-mexico.jpg';
await img.decode();            // espera a que la imagen esté lista para dibujarse
ctx.drawImage(img, 0, 0);
const original = ctx.getImageData(0, 0, canvas.width, canvas.height);

const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.replaceChildren(Object.assign(document.createElement('li'), { textContent: text }));
}
document.querySelector('.buttons').addEventListener('click', (event) => {
  const key = event.target.closest('button')?.dataset.filter;
  if (!key) return;
  ctx.putImageData(applyFilter(original, filters[key]), 0, 0);
  logLine(`${labels[key]}: ${original.width * original.height} píxeles recalculados`);
});
logLine('Listo: elige un filtro');
```

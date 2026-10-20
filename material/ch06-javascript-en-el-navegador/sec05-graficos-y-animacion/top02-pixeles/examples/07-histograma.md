---
example_description: "Un histograma cuenta cuántos píxeles hay de cada luminancia (0-255) y lo dibuja como 256 barras; con «Más brillo» se ve desplazarse a la derecha y amontonarse en 255 (los blancos que se saturan). Los datos, también como texto"
example_tags: "javascript|canvas|pixeles|histograma|luminancia|graficos"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Histograma de luminancia</h1>
  <canvas id="photo" width="480" height="330" role="img" aria-label="José María Velasco, Valle de México, 1877"></canvas>
  <p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
  <canvas id="chart" width="256" height="100" role="img" aria-labelledby="summary"></canvas>
  <p id="summary" aria-live="polite"></p>
  <button id="toggle" type="button" aria-pressed="false">Más brillo (+60)</button>
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
#photo {
  display: block;
  width: 240px;
  height: 165px;
}
#chart {
  display: block;
  background: #ffffff;
  border-bottom: 1px solid #52606d;
}
.credit {
  margin: 0.25rem 0 0.75rem;
  font-size: 0.8rem;
  color: #52606d;
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
const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function histogram(image) {
  const bins = new Array(256).fill(0);              // bins[v] = píxeles con luminancia v
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) bins[Math.round(luma(data[i], data[i + 1], data[i + 2]))] += 1;
  return bins;
}

const chart = document.querySelector('#chart');
const dpr = window.devicePixelRatio;
chart.style.width = '256px';
chart.style.height = '100px';
chart.width = 256 * dpr;
chart.height = 100 * dpr;
const chartCtx = chart.getContext('2d');
chartCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

function drawHistogram(bins) {
  const max = Math.max(...bins);
  chartCtx.clearRect(0, 0, 256, 100);
  chartCtx.fillStyle = '#334e68';
  chartCtx.beginPath();                              // las 256 barras en un solo trazado
  bins.forEach((count, value) => chartCtx.rect(value, 100 - (count / max) * 100, 1, (count / max) * 100));
  chartCtx.fill();
  const total = bins.reduce((sum, count) => sum + count, 0);
  const share = (from, to) => Math.round((bins.slice(from, to + 1).reduce((s, c) => s + c, 0) / total) * 100);
  const text = `${total} píxeles · sombras (0-63): ${share(0, 63)} % · medios (64-191): ${share(64, 191)} % · luces (192-255): ${share(192, 255)} % · en 255: ${bins[255]}`;
  document.querySelector('#summary').textContent = text;
  console.log(text);
}

const photo = document.querySelector('#photo').getContext('2d');
const img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'valley-of-mexico.jpg';
await img.decode();
photo.drawImage(img, 0, 0);
const original = photo.getImageData(0, 0, 480, 330);
const brighter = new ImageData(original.data.map((v, i) => (i % 4 === 3 ? v : v + 60)), 480, 330);
drawHistogram(histogram(original));

const toggle = document.querySelector('#toggle');
toggle.addEventListener('click', () => {
  const on = toggle.getAttribute('aria-pressed') === 'false';
  toggle.setAttribute('aria-pressed', String(on));
  const image = on ? brighter : original;
  photo.putImageData(image, 0, 0);
  drawHistogram(histogram(image));
});
console.log('Listo: pulsa «Más brillo (+60)» y mira cómo se mueve el histograma');
```

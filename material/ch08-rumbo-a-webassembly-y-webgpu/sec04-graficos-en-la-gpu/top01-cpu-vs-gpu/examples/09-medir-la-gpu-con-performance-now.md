---
example_description: "Medir la GPU con performance.now() alrededor de drawArrays mide solo el ENCARGO: la llamada vuelve en cuanto anota el trabajo y la GPU lo hace después. Para medir de verdad hay que esperar al resultado (readPixels, aunque sea de un píxel). La imagen es la misma en las dos mediciones; los tiempos, muy distintos"
example_tags: "javascript|webgl2|gpu|rendimiento|performance-now|asincronia|readpixels|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>¿Cuánto tarda la GPU?</h1>
  <canvas id="view" role="img" aria-label="Valle de México, desenfocado en la GPU"></canvas>
  <button id="measure" type="button">Medir</button>
  <ol id="log" class="log" aria-live="polite"></ol>
  <p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
</main>
```

# CSS

```css
:root {
  color-scheme: dark;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #e2e8f0;
  background: #0f172a;
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
button {
  font: inherit;
  margin-top: 0.75rem;
  padding: 0.3rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
.credit {
  font-size: 0.8rem;
  color: #94a3b8;
}
```

# JavaScript

```javascript
// Usa assets/gpu/blur.js (léelo con «Assets»): un desenfoque de caja en la GPU con WebGL2.
import { createGpuBlur } from './gpu/blur.js';

const DRAWS = 10;  // diez desenfoques seguidos: trabajo de sobra para que se note
const RADIUS = 8;  // 17 × 17 = 289 vecinos por píxel
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const img = new Image();
img.crossOrigin = 'anonymous'; // ANTES de src: en las tarjetas, la imagen es de otro origen
img.src = 'valley-of-mexico.jpg';
await img.decode();
const { naturalWidth: width, naturalHeight: height } = img;
const view = document.querySelector('#view');
view.width = width;
view.height = height;
view.getContext('2d').drawImage(img, 0, 0);
const original = view.getContext('2d').getImageData(0, 0, width, height);

const blur = createGpuBlur(width, height);
blur.upload(original.data);
blur.warmUp();
addEventListener('pagehide', () => blur.release());
logLine('Listo: pulsa «Medir»');

document.querySelector('#measure').addEventListener('click', () => {
  // 🐛 El cronómetro solo rodea los encargos: drawArrays vuelve en cuanto ANOTA el trabajo
  //    en la cola de la GPU, mucho antes de que la GPU lo haga.
  let start = performance.now();
  for (let i = 0; i < DRAWS; i++) blur.draw(RADIUS);
  const queuedMs = performance.now() - start;
  const first = blur.read(); // aquí sí se espera, pero ya fuera del cronómetro

  // ✅ El cronómetro llega hasta el resultado: leer un solo píxel obliga a esperar a que la
  //    GPU termine todo lo encargado antes.
  start = performance.now();
  for (let i = 0; i < DRAWS; i++) blur.draw(RADIUS);
  blur.waitForGpu();
  const finishedMs = performance.now() - start;
  const second = blur.read();

  view.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(second.buffer), width, height), 0, 0);
  logLine(`🐛 encargar ${DRAWS} dibujos → ${queuedMs.toFixed(2)} ms`);
  logLine(`✅ encargarlos y esperar el resultado → ${finishedMs.toFixed(1)} ms`);
  logLine(`¿la misma imagen las dos veces? → ${first.every((byte, i) => byte === second[i])}`);
});
// Cada dibujo parte de la imagen original, así que los diez dan el mismo resultado:
// son trabajo repetido a propósito, para que el tiempo de la GPU se pueda medir.
```

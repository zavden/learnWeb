---
example_description: "El mismo desenfoque de 9 × 9 vecinos sobre un cuadro de Velasco, hecho por un bucle de JavaScript en la CPU y por un fragment shader en la GPU: el mismo resultado, y la GPU tarda mucho menos porque calcula todos los píxeles a la vez. Se ejecuta al pulsar un botón"
example_tags: "javascript|webgl2|gpu|cpu|shader|desenfoque|convolucion|rendimiento"
example_stage: intermediate
example_importance: critical
console: true
loop_protect: false
---

# HTML

```html
<main>
  <h1>Desenfoque de 9 × 9: CPU contra GPU</h1>
  <div class="pair">
    <figure>
      <canvas id="cpu-view" role="img" aria-label="Valle de México, desenfocado en la CPU"></canvas>
      <figcaption>CPU: un bucle de JavaScript</figcaption>
    </figure>
    <figure>
      <canvas id="gpu-view" role="img" aria-label="Valle de México, desenfocado en la GPU"></canvas>
      <figcaption>GPU: un fragment shader</figcaption>
    </figure>
  </div>
  <button id="compare" type="button">Comparar</button>
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
.pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
figure {
  margin: 0;
  font-size: 0.8rem;
}
canvas {
  display: block;
  width: 100%;
  height: auto;
  margin-bottom: 0.25rem;
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
// Usa assets/gpu/blur.js (léelo con «Assets»): el mismo desenfoque, hecho en la GPU con WebGL2.
import { createGpuBlur } from './gpu/blur.js';

const RADIUS = 4; // un cuadrado de 9 × 9 = 81 vecinos por píxel
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// La CPU: el bucle de la lección «Píxeles», píxel a píxel, con 81 vecinos cada uno.
// (loop_protect: false en la cabecera: la guarda de bucles de LearnWeb haría más lento el bucle medido.)
function boxBlurCpu(source, radius) {
  const { width, height, data } = source;
  const out = new ImageData(width, height);
  const count = (2 * radius + 1) ** 2;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const row = Math.min(height - 1, Math.max(0, y + dy)) * width; // fuera: el píxel del borde
        for (let dx = -radius; dx <= radius; dx++) {
          const i = (row + Math.min(width - 1, Math.max(0, x + dx))) * 4;
          r += data[i]; g += data[i + 1]; b += data[i + 2];
        }
      }
      const o = (y * width + x) * 4;
      out.data[o] = r / count; // Uint8ClampedArray: redondea
      out.data[o + 1] = g / count;
      out.data[o + 2] = b / count;
      out.data[o + 3] = 255;
    }
  }
  return out;
}

const img = new Image();
img.crossOrigin = 'anonymous'; // ANTES de src: en las tarjetas, la imagen es de otro origen
img.src = 'valley-of-mexico.jpg';
await img.decode();
const { naturalWidth: width, naturalHeight: height } = img;
const views = [document.querySelector('#cpu-view'), document.querySelector('#gpu-view')];
for (const view of views) {
  view.width = width;
  view.height = height;
  view.getContext('2d').drawImage(img, 0, 0);
}
const original = views[0].getContext('2d').getImageData(0, 0, width, height);

// Crear el contexto y compilar el shader, al cargar y fuera del cronómetro
const gpuBlur = createGpuBlur(width, height);
gpuBlur.upload(original.data);
gpuBlur.warmUp();
addEventListener('pagehide', () => gpuBlur.release());

logLine(`imagen: ${width} × ${height} = ${width * height} píxeles · ${(2 * RADIUS + 1) ** 2} vecinos por píxel`);
logLine('Listo: pulsa «Comparar»');

document.querySelector('#compare').addEventListener('click', () => {
  let start = performance.now();
  const cpuResult = boxBlurCpu(original, RADIUS); // un píxel detrás de otro
  const cpuMs = performance.now() - start;

  start = performance.now();
  gpuBlur.upload(original.data);   // CPU → memoria de la GPU
  gpuBlur.draw(RADIUS);            // todos los píxeles a la vez
  const gpuBytes = gpuBlur.read(); // GPU → CPU (aquí espera a que la GPU termine)
  const gpuMs = performance.now() - start;

  views[0].getContext('2d').putImageData(cpuResult, 0, 0);
  views[1].getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(gpuBytes.buffer), width, height), 0, 0);
  let maxDiff = 0;
  for (let i = 0; i < gpuBytes.length; i++) maxDiff = Math.max(maxDiff, Math.abs(gpuBytes[i] - cpuResult.data[i]));
  logLine(`CPU, un bucle → ${cpuMs.toFixed(0)} ms`);
  logLine(`GPU, subir + dibujar + leer → ${gpuMs.toFixed(1)} ms`);
  logLine(`¿los mismos píxeles? (diferencia ≤ 1) → ${maxDiff <= 1}`);
});
```

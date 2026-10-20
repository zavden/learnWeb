---
example_description: "Un compute shader recorre los 158 400 píxeles del cuadro de Velasco a la vez: escribe cada uno en grises (la luminancia de la lección «Píxeles», en enteros) y cuenta cuántos hay de cada nivel con atomicAdd sobre un array<atomic<u32>, 256>. JavaScript hace lo mismo con un bucle: los mismos píxeles y el mismo histograma. Sin atómicos, los hilos que cuentan a la vez se pisan y se pierden cuentas"
example_tags: "javascript|webgpu|compute-shader|atomicadd|histograma|pixeles|escala-de-grises|carrera-de-datos|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Grises e histograma en la GPU</h1>
  <div class="pair">
    <figure>
      <canvas id="original" role="img" aria-label="Valle de México, en color"></canvas>
      <figcaption>Original</figcaption>
    </figure>
    <figure>
      <canvas id="gray" role="img" aria-label="Valle de México en escala de grises, calculada en la GPU"></canvas>
      <figcaption>Grises, en la GPU</figcaption>
    </figure>
  </div>
  <canvas id="histogram" role="img" aria-label="Histograma: cuántos píxeles hay de cada nivel de gris, de 0 a 255"></canvas>
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
}
#histogram {
  margin-top: 0.75rem;
  aspect-ratio: 4 / 1;
  background: #1e293b;
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
// Usa assets/webgpu/utils.js (léelo con «Assets») y assets/valley-of-mexico.jpg.
import { getDevice, createStorageBuffer, createComputeJob, dispatch, readBuffer } from './webgpu/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Los píxeles, como en la lección «Píxeles»: la imagen en un canvas 2D y getImageData
const img = new Image();
img.crossOrigin = 'anonymous'; // ANTES de src: en las tarjetas, la imagen es de otro origen
img.src = 'valley-of-mexico.jpg';
await img.decode();
const { naturalWidth: width, naturalHeight: height } = img;
const original = document.querySelector('#original');
Object.assign(original, { width, height });
original.getContext('2d').drawImage(img, 0, 0);
const imageData = original.getContext('2d').getImageData(0, 0, width, height);
// Los 4 bytes de cada píxel, leídos como UN Uint32: en little-endian (lección «DataView y
// endianness») el rojo es el byte bajo: r | g << 8 | b << 16 | a << 24
const pixels = new Uint32Array(imageData.data.buffer);
log(`imagen → ${width} × ${height} = ${pixels.length} píxeles`);

const { device } = await getDevice({ label: 'grises' });
const code = /* wgsl */ `
  @group(0) @binding(0) var<storage, read> pixels: array<u32>;
  @group(0) @binding(1) var<storage, read_write> gray: array<u32>;
  @group(0) @binding(2) var<storage, read_write> bins: array<atomic<u32>, 256>;
  @group(0) @binding(3) var<storage, read_write> racyBins: array<u32, 256>;

  @compute @workgroup_size(64)
  fn main(@builtin(global_invocation_id) id: vec3u) {
    let i = id.x;
    if (i >= arrayLength(&pixels)) { return; }
    let p = pixels[i];
    let r = p & 0xffu;                 // máscaras y desplazamientos (lección «Bits y bytes»)
    let g = (p >> 8u) & 0xffu;
    let b = (p >> 16u) & 0xffu;
    // Luminancia Rec. 709 en enteros: pesos × 256 (54 + 183 + 19 = 256) y redondeo
    let luma = (54u * r + 183u * g + 19u * b + 128u) >> 8u;
    gray[i] = luma | (luma << 8u) | (luma << 16u) | (p & 0xff000000u); // el alfa, tal cual
    atomicAdd(&bins[luma], 1u);           // ✅ leer, sumar y escribir en UN paso
    racyBins[luma] = racyBins[luma] + 1u; // 🐛 tres pasos: otro hilo se cuela en medio
  }`;
const buffers = [
  createStorageBuffer(device, 'píxeles', pixels),
  createStorageBuffer(device, 'grises', new Uint32Array(pixels.length)),
  createStorageBuffer(device, 'histograma', new Uint32Array(256)),
  createStorageBuffer(device, 'histograma sin atómicos', new Uint32Array(256)),
];
dispatch(device, createComputeJob(device, { label: 'grises e histograma', code, buffers }), Math.ceil(pixels.length / 64));
const [gpuGray, gpuBins, racyBins] = await Promise.all(buffers.slice(1).map((buffer) => readBuffer(device, buffer, Uint32Array)));

// Lo mismo en JavaScript, un píxel detrás de otro
const cpuGray = new Uint32Array(pixels.length);
const cpuBins = new Uint32Array(256);
for (let i = 0; i < pixels.length; i++) {
  const p = pixels[i];
  const luma = (54 * (p & 0xff) + 183 * ((p >>> 8) & 0xff) + 19 * ((p >>> 16) & 0xff) + 128) >>> 8;
  cpuGray[i] = luma | (luma << 8) | (luma << 16) | (p & 0xff000000); // Uint32Array: sin signo
  cpuBins[luma] += 1;
}

// Pintar el resultado de la GPU, y el histograma: una barra por nivel de gris, de 0 a 255
const grayCanvas = document.querySelector('#gray');
Object.assign(grayCanvas, { width, height });
grayCanvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(gpuGray.buffer), width, height), 0, 0);
const chart = document.querySelector('#histogram');
Object.assign(chart, { width: 512, height: 128 });
const chartContext = chart.getContext('2d');
const tallest = Math.max(...gpuBins);
chartContext.fillStyle = '#cbd5e1';
gpuBins.forEach((count, level) => {
  const barHeight = (count / tallest) * chart.height;
  chartContext.fillRect(level * 2, chart.height - barHeight, 2, barHeight);
});

const sum = (counts) => counts.reduce((total, count) => total + count, 0);
log(`¿los mismos grises que en JavaScript? → ${gpuGray.every((value, i) => value === cpuGray[i])}`);
log(`✅ atomicAdd: ¿el mismo histograma? → ${gpuBins.every((count, i) => count === cpuBins[i])} · suma ${sum(gpuBins)}`);
log(`🐛 sin atómicos: ¿suman ${pixels.length}? → ${sum(racyBins) === pixels.length}`);
```

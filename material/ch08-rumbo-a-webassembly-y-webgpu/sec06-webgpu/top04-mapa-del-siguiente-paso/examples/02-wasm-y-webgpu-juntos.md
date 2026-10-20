---
example_description: "WebAssembly y WebGPU en la misma página, compartiendo bytes: la foto vive en la memoria de un módulo wasm escrito a mano (93 bytes, con una función sum), writeBuffer la lleva directamente de esa memoria a la GPU, un compute shader calcula la luminancia de cada píxel y el resultado vuelve a la memoria de wasm, que lo suma. JavaScript comprueba la suma"
example_tags: "javascript|webassembly|webgpu|memoria-lineal|writebuffer|compute-shader|pixeles"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Un exposímetro: WebAssembly y WebGPU</h1>
  <div class="pair">
    <figure>
      <canvas id="photo" role="img" aria-label="Valle de México, en color"></canvas>
      <figcaption>La foto, en la memoria de WebAssembly</figcaption>
    </figure>
    <figure>
      <canvas id="luma" role="img" aria-label="La luminancia de cada píxel, en grises, calculada en la GPU"></canvas>
      <figcaption>Su luminancia, calculada en la GPU</figcaption>
    </figure>
  </div>
  <p>Brillo medio, sumado en WebAssembly: <output id="mean">calculando…</output></p>
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
output {
  font-weight: 600;
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
const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// 1. WebAssembly: un módulo de 93 bytes escrito a mano (el formato, en el módulo «WebAssembly»).
// Exporta su memoria (20 páginas de 64 KiB) y sum(ptr, len), que suma len bytes desde ptr.
// Los bucles de wasm no tienen la guarda de LearnWeb: este termina porque len baja hasta 0.
const wasmBytes = Uint8Array.from([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, // «\0asm», versión 1
  0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f, // tipos: (i32, i32) → i32
  0x03, 0x02, 0x01, 0x00, // funciones: una, de ese tipo
  0x05, 0x03, 0x01, 0x00, 0x14, // memoria: 20 páginas (1,25 MiB)
  0x07, 0x10, 0x02, 0x03, 0x73, 0x75, 0x6d, 0x00, 0x00, // exporta «sum»…
  0x06, 0x6d, 0x65, 0x6d, 0x6f, 0x72, 0x79, 0x02, 0x00, // …y «memory»
  0x0a, 0x2f, 0x01, 0x2d, 0x01, 0x01, 0x7f, // código: una función con un local i32 (el total)
  0x02, 0x40, 0x03, 0x40, // block, loop
  0x20, 0x01, 0x41, 0x00, 0x4c, 0x0d, 0x01, // si len <= 0, salir
  0x20, 0x02, 0x20, 0x00, 0x2d, 0x00, 0x00, 0x6a, 0x21, 0x02, // total += byte en ptr
  0x20, 0x00, 0x41, 0x01, 0x6a, 0x21, 0x00, // ptr += 1
  0x20, 0x01, 0x41, 0x01, 0x6b, 0x21, 0x01, // len -= 1
  0x0c, 0x00, 0x0b, 0x0b, // otra vuelta; fin del loop y del block
  0x20, 0x02, 0x0b, // devolver el total
]);
const { instance } = await WebAssembly.instantiate(wasmBytes);
const { memory, sum } = instance.exports;

// 2. La foto, DENTRO de la memoria de wasm: así la tendría una biblioteca de imagen en C o Rust
const img = new Image();
img.crossOrigin = 'anonymous'; // en las tarjetas, la imagen es de otro origen
img.src = 'valley-of-mexico.jpg';
await img.decode();
const { naturalWidth: width, naturalHeight: height } = img;
const photo = document.querySelector('#photo');
Object.assign(photo, { width, height });
photo.getContext('2d').drawImage(img, 0, 0);
const pixelCount = width * height;
const imageBytes = pixelCount * 4;
const PHOTO_PTR = 0; // «punteros»: posiciones en la memoria de wasm
const LUMA_PTR = imageBytes;
new Uint8Array(memory.buffer, PHOTO_PTR, imageBytes).set(photo.getContext('2d').getImageData(0, 0, width, height).data);
log(`memoria de wasm → ${memory.buffer.byteLength} bytes · la foto ocupa ${imageBytes}`);

// 3. WebGPU: de la memoria de wasm a la GPU SIN copias en JavaScript (writeBuffer acepta un
// ArrayBuffer con su offset y su tamaño), un compute shader y la copia de vuelta
const adapter = await navigator.gpu?.requestAdapter();
if (!adapter) throw new Error('WebGPU no está disponible en este equipo');
const device = await adapter.requestDevice({ label: 'exposímetro' });
addEventListener('pagehide', () => device.destroy());
device.addEventListener('uncapturederror', (event) => console.warn('GPU →', event.error.message));
const { STORAGE, COPY_SRC, COPY_DST, MAP_READ } = GPUBufferUsage;
const pixelBuffer = device.createBuffer({ label: 'foto', size: imageBytes, usage: STORAGE | COPY_DST });
const lumaBuffer = device.createBuffer({ label: 'luminancia', size: imageBytes, usage: STORAGE | COPY_SRC });
const readBuffer = device.createBuffer({ label: 'lectura', size: imageBytes, usage: MAP_READ | COPY_DST });
device.queue.writeBuffer(pixelBuffer, 0, memory.buffer, PHOTO_PTR, imageBytes);

const module = device.createShaderModule({
  label: 'luminancia',
  code: /* wgsl */ `
    @group(0) @binding(0) var<storage, read> pixels: array<u32>;
    @group(0) @binding(1) var<storage, read_write> luma: array<u32>;
    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) id: vec3u) {
      let i = id.x;
      if (i >= arrayLength(&pixels)) { return; }
      let p = pixels[i];
      // La luminancia en enteros de la lección «Búferes y compute»: de 0 a 255, en un u32
      luma[i] = (54u * (p & 0xffu) + 183u * ((p >> 8u) & 0xffu) + 19u * ((p >> 16u) & 0xffu) + 128u) >> 8u;
    }`,
});
const pipeline = device.createComputePipeline({ label: 'luminancia', layout: 'auto', compute: { module } });
const bindGroup = device.createBindGroup({
  label: 'foto y luminancia',
  layout: pipeline.getBindGroupLayout(0),
  entries: [{ binding: 0, resource: { buffer: pixelBuffer } }, { binding: 1, resource: { buffer: lumaBuffer } }],
});
const encoder = device.createCommandEncoder({ label: 'exposímetro' });
const pass = encoder.beginComputePass({ label: 'luminancia' });
pass.setPipeline(pipeline);
pass.setBindGroup(0, bindGroup);
pass.dispatchWorkgroups(Math.ceil(pixelCount / 64));
pass.end();
encoder.copyBufferToBuffer(lumaBuffer, 0, readBuffer, 0, imageBytes);
device.queue.submit([encoder.finish()]);
await readBuffer.mapAsync(GPUMapMode.READ);
const lumaWords = new Uint32Array(readBuffer.getMappedRange().slice(0));
readBuffer.unmap();

// 4. De vuelta a la memoria de wasm, y que sume wasm. Cada u32 lleva la luminancia en su byte
// bajo (little-endian) y tres ceros, que no suman.
new Uint8Array(memory.buffer, LUMA_PTR, imageBytes).set(new Uint8Array(lumaWords.buffer));
const wasmTotal = sum(LUMA_PTR, imageBytes);
const jsTotal = lumaWords.reduce((total, value) => total + value, 0);
log(`píxeles → ${pixelCount}`);
log(`suma de luminancias: ¿WebAssembly = JavaScript? → ${wasmTotal === jsTotal}`);
document.querySelector('#mean').textContent = `${(wasmTotal / pixelCount).toFixed(1)} de 255`;

// La luminancia, en grises: el mismo valor en rojo, verde y azul, y alfa 255
const lumaCanvas = document.querySelector('#luma');
Object.assign(lumaCanvas, { width, height });
const grayPixels = lumaWords.map((value) => value | (value << 8) | (value << 16) | 0xff000000);
lumaCanvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(grayPixels.buffer), width, height), 0, 0);
```

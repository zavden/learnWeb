---
example_description: "La textura del lienzo dura un fotograma: getCurrentTexture() da una nueva cada vez que el navegador muestra la anterior, y del tamaño que tenga el lienzo en ese momento (aquí, su tamaño CSS × devicePixelRatio, al día con un ResizeObserver). Guardarla para reutilizarla falla en el fotograma siguiente: la textura vieja ya está destruida. Se prueba con dos botones"
example_tags: "javascript|webgpu|getcurrenttexture|canvas|devicepixelratio|resizeobserver|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Una textura por fotograma</h1>
  <canvas id="stage" role="img" aria-label="Un lienzo de un solo color, que cambia al redibujarse"></canvas>
  <div class="actions">
    <button id="saved" type="button">🐛 Con la textura guardada</button>
    <button id="current" type="button">✅ Con getCurrentTexture()</button>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
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
  width: 100%;
  height: 120px;
  outline: 1px solid #334155;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
button {
  font: inherit;
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
```

# JavaScript

```javascript
// Usa assets/webgpu/utils.js (léelo con «Assets»).
import { getDevice, setupCanvas, clearColor, validationError } from './webgpu/utils.js';

const logList = document.querySelector('#log');
function log(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const { device } = await getDevice({ label: 'fotogramas' });
const canvas = document.querySelector('#stage');
const { context } = setupCanvas(canvas, device); // tamaño inicial: CSS × devicePixelRatio
const colors = [clearColor(15, 118, 110), clearColor(124, 58, 237), clearColor(180, 83, 9)]; // teal, violeta, ámbar
let colorIndex = 0;

// Una pasada que solo borra (sin pipeline): basta para ver en qué textura se dibuja
function paint(texture) {
  return validationError(device, () => {
    const encoder = device.createCommandEncoder({ label: 'pintar' });
    encoder.beginRenderPass({
      colorAttachments: [{ view: texture.createView(), clearValue: colors[colorIndex], loadOp: 'clear', storeOp: 'store' }],
    }).end();
    device.queue.submit([encoder.finish()]);
  });
}

const savedTexture = context.getCurrentTexture(); // 🐛 guardada «para no pedirla cada vez»
const sizeMatches = canvas.width === Math.round(canvas.clientWidth * devicePixelRatio);
const textureMatches = savedTexture.width === canvas.width && savedTexture.height === canvas.height;
await paint(savedTexture);
log(`¿lienzo = CSS × devicePixelRatio? → ${sizeMatches}`);
log(`¿textura = lienzo? → ${textureMatches}`);
log('Listo: pulsa uno de los dos botones');

document.querySelector('#saved').addEventListener('click', async () => {
  colorIndex = (colorIndex + 1) % colors.length;
  const error = await paint(savedTexture); // la del primer fotograma: ya se mostró
  // La textura del lienzo lleva un nombre interno del navegador, distinto en cada sistema
  // ([Texture "IOSurface(…)"] en macOS): se quita para que el mensaje sea el mismo en todos
  log(`🐛 textura guardada → ${error?.replace(/\[Texture "[^"]*"\]/, '[Texture]') ?? 'sin errores'}`);
});
document.querySelector('#current').addEventListener('click', async () => {
  colorIndex = (colorIndex + 1) % colors.length;
  const texture = context.getCurrentTexture(); // ✅ una nueva, del tamaño actual del lienzo
  const error = await paint(texture);
  log(`✅ getCurrentTexture() → ${error ?? 'sin errores'} · ¿la misma que al cargar? ${texture === savedTexture}`);
});

// Si cambia el tamaño CSS, el mapa de bits lo sigue; el siguiente getCurrentTexture() ya lo tiene
new ResizeObserver(([entry]) => {
  const exact = entry.devicePixelContentBoxSize?.[0]; // píxeles físicos exactos (Chrome)
  const width = exact ? exact.inlineSize : Math.round(entry.contentBoxSize[0].inlineSize * devicePixelRatio);
  const height = exact ? exact.blockSize : Math.round(entry.contentBoxSize[0].blockSize * devicePixelRatio);
  if (width === canvas.width && height === canvas.height) return;
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  paint(context.getCurrentTexture());
}).observe(canvas, { box: 'device-pixel-content-box' });
```

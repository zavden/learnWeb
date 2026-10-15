---
example_description: "Una cadena de filtros entre dos workers: la página transfiere los píxeles al primero (blanco y negro), este los pasa al segundo (viñeta) por un MessageChannel y el segundo los devuelve a la página; el mismo búfer recorre cuatro manos sin una sola copia"
example_tags: "javascript|workers|messagechannel|transferibles|pixeles|imagebitmap|pipeline|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Una cadena de filtros</h1>
  <canvas id="photo" role="img" aria-label="José María Velasco, Valle de México, 1877, en blanco y negro con las esquinas oscurecidas"></canvas>
  <div class="buttons">
    <button id="run" type="button">Aplicar la cadena</button>
    <button id="reset" type="button">Ver el original</button>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
canvas { display: block; inline-size: 100%; block-size: auto; border-radius: 0.4rem; }
.buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-block-start: 0.75rem; }
button { font: inherit; padding: 0.35rem 0.8rem; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { padding-inline-start: 1.25rem; font-size: 0.85rem; }
```

# JavaScript

```javascript
// Usa valley-of-mexico.jpg y 03-pipeline/filter-worker.js («Assets»): el mismo
// archivo hace de primer y de segundo eslabón, cada uno con su filtro.
const $ = (selector) => document.querySelector(selector);
const fmt = (n) => n.toLocaleString('es-MX');
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

const canvas = $('#photo');
const ctx = canvas.getContext('2d');
const bitmap = await createImageBitmap(await (await fetch('valley-of-mexico.jpg')).blob());
canvas.width = bitmap.width;
canvas.height = bitmap.height;
ctx.drawImage(bitmap, 0, 0);
const original = ctx.getImageData(0, 0, canvas.width, canvas.height); // se queda en la página

// Dos workers unidos por un canal: la salida del primero es la entrada del segundo.
const first = new Worker('03-pipeline/filter-worker.js', { type: 'module' });
const second = new Worker('03-pipeline/filter-worker.js', { type: 'module' });
const { port1, port2 } = new MessageChannel();
first.postMessage({ type: 'setup', filter: 'blanco y negro', output: port1 }, [port1]);
second.postMessage({ type: 'setup', filter: 'viñeta', input: port2 }, [port2]);
addEventListener('pagehide', () => { first.terminate(); second.terminate(); });

function runChain() {
  return new Promise((resolve) => {
    second.onmessage = (event) => resolve(event.data); // el último eslabón responde a la página
    const pixels = new Uint8ClampedArray(original.data); // una copia: el original no se toca
    first.postMessage({ pixels, width: original.width, height: original.height, path: ['página'] }, [pixels.buffer]);
    report(`📤 enviado: a la página le quedan ${pixels.byteLength} bytes de esa copia`);
  });
}
const isGray = (pixels) => {
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i] !== pixels[i + 1] || pixels[i + 1] !== pixels[i + 2]) return false;
  }
  return true;
};

async function apply() {
  $('#run').disabled = true;
  const { pixels, width, height, path } = await runChain();
  ctx.putImageData(new ImageData(pixels, width, height), 0, 0);
  report(`🔗 ${[...path, 'página'].join(' → ')} · ${fmt(pixels.byteLength)} bytes, sin copias por el camino`);
  report(`¿todos los píxeles grises? ${isGray(pixels)}`);
  $('#run').disabled = false;
}
$('#run').addEventListener('click', apply);
$('#reset').addEventListener('click', () => {
  ctx.putImageData(original, 0, 0);
  report('↩️ original');
});

await apply();
report('Listo: pulsa «Ver el original» y luego «Aplicar la cadena»');
```

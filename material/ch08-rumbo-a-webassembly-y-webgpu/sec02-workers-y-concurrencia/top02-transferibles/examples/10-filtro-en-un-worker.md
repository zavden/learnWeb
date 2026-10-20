---
example_description: "Un filtro de imagen en un worker: createImageBitmap convierte la foto en un ImageBitmap, que se transfiere al worker; el worker la dibuja en un OffscreenCanvas, aplica 60 pasadas de desenfoque y devuelve otro ImageBitmap transferido. El reloj de la página sigue andando; con el mismo filtro en el hilo principal, se para"
example_tags: "javascript|workers|imagebitmap|offscreencanvas|transferibles|pixeles|filtros"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Desenfocar sin congelar la página</h1>
  <canvas id="photo" role="img" aria-label="José María Velasco, Valle de México, 1877: un valle con lagos y volcanes bajo un cielo con nubes"></canvas>
  <div class="buttons">
    <button id="worker" type="button">Desenfocar en un worker</button>
    <button id="main" type="button">Desenfocar en el hilo principal</button>
    <button id="reset" type="button">Restaurar</button>
  </div>
  <p>Reloj de la página: <output id="clock">0.00 s</output></p>
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
output { font-variant-numeric: tabular-nums; font-weight: 600; }
.log { padding-inline-start: 1.25rem; font-size: 0.85rem; }
```

# JavaScript

```javascript
// Usa valley-of-mexico.jpg, 10-filter/blur.js y 10-filter/blur-worker.js («Assets»).
import { boxBlur } from './10-filter/blur.js';

const PASSES = 60; // ≈ 0,3 s de cálculo en el M1 del curso
const $ = (selector) => document.querySelector(selector);
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}
const canvas = $('#photo');
const ctx = canvas.getContext('2d');

// La foto como ImageBitmap: una imagen ya decodificada, lista para dibujar… y transferible.
const original = await createImageBitmap(await (await fetch('valley-of-mexico.jpg')).blob());
canvas.width = original.width;
canvas.height = original.height;
ctx.drawImage(original, 0, 0);
report(`📷 el «Valle de México» de José María Velasco: ${original.width} × ${original.height} px`);

const worker = new Worker('10-filter/blur-worker.js', { type: 'module' });
addEventListener('pagehide', () => worker.terminate());
function blurInWorker(passes) {
  return new Promise((resolve) => {
    worker.onmessage = (event) => resolve(event.data);
    createImageBitmap(original).then((copy) => { // una copia: el original se queda aquí
      worker.postMessage({ bitmap: copy, passes }, [copy]);
      report(`   la copia enviada, en la página → ${copy.width} × ${copy.height}`);
    });
  });
}

function startClock() {
  const start = performance.now();
  let ticks = 0;
  const id = setInterval(() => { ticks += 1; $('#clock').textContent = `${((performance.now() - start) / 1000).toFixed(2)} s`; }, 25);
  return { ticks: () => ticks, stop: () => clearInterval(id) };
}
const setBusy = (busy) => document.querySelectorAll('button').forEach((button) => { button.disabled = busy; });

$('#worker').addEventListener('click', async () => {
  setBusy(true);
  const clock = startClock();
  const { result, ms } = await blurInWorker(PASSES);
  ctx.drawImage(result, 0, 0);
  result.close();
  report(`worker: ${PASSES} pasadas en ${ms.toFixed(0)} ms · ticks del reloj mientras tanto: ${clock.ticks()}`);
  clock.stop();
  setBusy(false);
});
$('#main').addEventListener('click', () => {
  setBusy(true);
  const clock = startClock();
  setTimeout(() => { // deja andar el reloj un momento… y bloquea
    ctx.drawImage(original, 0, 0);
    const ticksBefore = clock.ticks();
    const start = performance.now();
    ctx.putImageData(boxBlur(ctx.getImageData(0, 0, canvas.width, canvas.height), PASSES), 0, 0);
    report(`hilo principal: ${PASSES} pasadas en ${(performance.now() - start).toFixed(0)} ms · ticks del reloj mientras tanto: ${clock.ticks() - ticksBefore}`);
    clock.stop();
    setBusy(false);
  }, 100);
});
$('#reset').addEventListener('click', () => ctx.drawImage(original, 0, 0));

// Al cargar, una sola pasada en el worker: el viaje de ida y vuelta de un ImageBitmap.
const first = await blurInWorker(1);
ctx.drawImage(first.result, 0, 0);
first.result.close();
report('🔁 ida y vuelta: 1 pasada en el worker, y la foto (casi igual) de vuelta en el canvas');
report('Listo: pulsa «Desenfocar en un worker» y luego «Desenfocar en el hilo principal»; mira el reloj');
```

---
example_description: "OffscreenCanvas: la página transfiere el control de su canvas a un worker (transferControlToOffscreen) y el worker dibuja el conjunto de Mandelbrot por bandas; mientras tanto, el reloj y el botón «+1» de la página responden, y el dibujo se puede pausar o detener porque el worker cede el turno entre bandas"
example_tags: "javascript|workers|offscreencanvas|canvas|transferibles|mandelbrot|fractal"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Un fractal dibujado en otro hilo</h1>
  <canvas id="fractal" role="img" aria-label="El conjunto de Mandelbrot: una figura negra con bordes en espiral sobre un fondo azul, naranja y amarillo"></canvas>
  <progress id="progress" max="100" value="0" aria-label="Filas dibujadas"></progress>
  <div class="buttons">
    <button id="draw" type="button">Dibujar con detalle</button>
    <button id="pause" type="button" disabled>Pausa</button>
    <button id="stop" type="button" disabled>Detener</button>
    <button id="plus" type="button">+1</button>
    <output id="count" aria-live="polite">0</output>
  </div>
  <p>Reloj de la página: <output id="clock">0.0 s</output></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 28rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
canvas { display: block; inline-size: 100%; block-size: auto; aspect-ratio: 440 / 260; background: #0b1026; border-radius: 0.4rem; }
progress { inline-size: 100%; }
.buttons { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
button { font: inherit; padding: 0.35rem 0.8rem; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
output { font-variant-numeric: tabular-nums; font-weight: 600; }
.log { padding-inline-start: 1.25rem; font-size: 0.85rem; }
```

# JavaScript

```javascript
// El worker es 08-fractal/fractal-worker.js («Assets»). No hay animación: el
// dibujo aparece por bandas, una vez, y solo al pulsar se dibuja con detalle.
const $ = (selector) => document.querySelector(selector);
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

// El tamaño se fija ANTES de transferir: después, el canvas de la página ya no se
// puede tocar (ni redimensionar ni pedirle un contexto).
const canvas = $('#fractal');
canvas.width = 440 * devicePixelRatio;
canvas.height = 260 * devicePixelRatio;
const offscreen = canvas.transferControlToOffscreen(); // un OffscreenCanvas unido a este canvas
const worker = new Worker('08-fractal/fractal-worker.js', { type: 'module' });
worker.postMessage({ type: 'init', canvas: offscreen }, [offscreen]); // se TRANSFIERE
addEventListener('pagehide', () => worker.terminate());

// Un reloj de JavaScript mientras el worker dibuja: si el hilo principal se bloqueara, se pararía.
let clockId = 0;
function setDrawing(drawing) {
  $('#draw').disabled = drawing;
  $('#pause').disabled = !drawing;
  $('#stop').disabled = !drawing;
  $('#pause').textContent = 'Pausa';
  clearInterval(clockId);
  if (drawing) {
    const start = performance.now();
    clockId = setInterval(() => { $('#clock').textContent = `${((performance.now() - start) / 1000).toFixed(1)} s`; }, 100);
  }
}

worker.onmessage = (event) => {
  const message = event.data;
  if (message.type === 'progress') {
    $('#progress').value = (100 * message.done) / message.total;
  } else if (message.type === 'done' && message.maxIter === 40) {
    report('🖼️ vista previa: 40 iteraciones por píxel');
    report('Listo: pulsa «Dibujar con detalle» y, mientras dibuja, «+1», «Pausa» o «Detener»');
  } else if (message.type === 'done') {
    setDrawing(false);
    report(`🖼️ ${message.maxIter} iteraciones por píxel en ${message.ms.toFixed(0)} ms, sin bloquear la página`);
  } else if (message.type === 'stopped') {
    setDrawing(false);
    report('⏹ detenido: el dibujo se queda a medias');
  }
};

$('#draw').addEventListener('click', () => {
  setDrawing(true);
  worker.postMessage({ type: 'draw', maxIter: 800 });
});
$('#pause').addEventListener('click', (event) => {
  const paused = event.currentTarget.textContent === 'Pausa';
  worker.postMessage({ type: paused ? 'pause' : 'resume' });
  event.currentTarget.textContent = paused ? 'Seguir' : 'Pausa';
});
$('#stop').addEventListener('click', () => worker.postMessage({ type: 'stop' }));
let clicks = 0;
$('#plus').addEventListener('click', () => { $('#count').textContent = ++clicks; });
```

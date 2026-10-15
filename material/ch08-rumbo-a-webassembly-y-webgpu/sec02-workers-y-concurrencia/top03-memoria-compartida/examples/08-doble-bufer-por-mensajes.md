---
example_description: "La alternativa a la memoria compartida: doble búfer por mensajes. Un worker simula cómo se calienta un comal y la página lo pinta; dos marcos (Float32Array) van y vuelven transferidos, así que mientras la página pinta uno el worker llena el otro, sin copias por fotograma ni datos compartidos"
example_tags: "javascript|workers|transferibles|doble-bufer|canvas|simulacion|requestanimationframe"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>El calor en un comal</h1>
  <canvas id="plate" width="80" height="50" role="img" aria-label="Mapa de calor de un comal: el centro, sobre el quemador, está al rojo y el calor se extiende hacia los bordes"></canvas>
  <p class="legend"><span>25 °C</span><span class="scale" aria-hidden="true"></span><span>250 °C</span></p>
  <div class="buttons">
    <button id="start" type="button">Calentar</button>
    <button id="pause" type="button" disabled>Pausa</button>
    <button id="stop" type="button" disabled>Detener</button>
  </div>
  <p id="status" role="status">Paso 0 de 600</p>
  <p class="hint">Unos 2,5 s de simulación. Con «reducir movimiento» activado, solo se pinta el resultado final.</p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 28rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
canvas { display: block; inline-size: 100%; block-size: auto; aspect-ratio: 80 / 50; border-radius: 0.4rem; }
.legend { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }
.scale { flex: 1; block-size: 0.6rem; border-radius: 0.3rem; background: linear-gradient(to right, rgb(30 58 138), rgb(190 24 93), rgb(249 115 22), rgb(253 224 71)); }
.buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { font: inherit; padding: 0.35rem 0.8rem; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.hint { color: #475569; font-size: 0.85rem; }
.log { padding-inline-start: 1.25rem; font-size: 0.85rem; }
```

# JavaScript

```javascript
// Usa 08-heat/heat.js (la simulación) y 08-heat/heat-worker.js (el worker), en «Assets».
import { WIDTH, HEIGHT, AMBIENT, BURNER, createPlate } from './08-heat/heat.js';

const TOTAL = 600; // pasos de simulación: 4 por fotograma → 150 fotogramas
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (selector) => document.querySelector(selector);
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Pintar: cada temperatura → un color de la escala (azul, magenta, naranja, amarillo).
const STOPS = [[30, 58, 138], [190, 24, 93], [249, 115, 22], [253, 224, 71]];
function color(t) {
  const position = Math.min(Math.max(t, 0), 1) * (STOPS.length - 1);
  const index = Math.min(Math.floor(position), STOPS.length - 2);
  const mix = position - index;
  return STOPS[index].map((channel, c) => channel + (STOPS[index + 1][c] - channel) * mix);
}
const ctx = $('#plate').getContext('2d');
const image = ctx.createImageData(WIDTH, HEIGHT);
function draw(temperatures) {
  temperatures.forEach((celsius, i) => {
    image.data.set([...color(Math.sqrt((celsius - AMBIENT) / (BURNER - AMBIENT))), 255], i * 4);
  });
  ctx.putImageData(image, 0, 0);
}

let worker = null;
let frameId = null;
let ready = [];      // marcos ya llenos que esperan a ser pintados
let frames = 0;
let created = 0;
function setButtons(running) {
  $('#start').disabled = running;
  $('#pause').disabled = !running;
  $('#stop').disabled = !running;
  $('#pause').textContent = 'Pausa';
}

function tick() {
  frameId = requestAnimationFrame(tick);
  const filled = ready.shift();
  if (!filled) return; // el worker aún no ha llenado el siguiente: se queda el anterior en pantalla
  frames += 1;
  if (!reducedMotion || filled.done) draw(filled.frame);
  $('#status').textContent = `Paso ${filled.steps} de ${TOTAL}`;
  if (filled.done) return finish(filled.frame);
  worker.postMessage({ type: 'fill', frame: filled.frame }, [filled.frame.buffer]); // vuelve a llenarse
}
function stopLoop() {
  cancelAnimationFrame(frameId);
  frameId = null;
  worker?.terminate();
  worker = null;
  ready = [];
  setButtons(false);
}
function finish(frame) {
  const mean = frame.reduce((sum, celsius) => sum + celsius, 0) / frame.length;
  report(`🔥 ${TOTAL} pasos en ${frames} fotogramas · temperatura media ${mean.toFixed(1)} °C · marcos creados: ${created}`);
  stopLoop();
}

$('#start').addEventListener('click', () => {
  worker = new Worker('08-heat/heat-worker.js', { type: 'module' });
  worker.onmessage = (event) => ready.push(event.data);
  worker.postMessage({ type: 'start', total: TOTAL });
  frames = 0;
  created = 0;
  for (let i = 0; i < 2; i++) { // DOS marcos: mientras la página pinta uno, el worker llena el otro
    const frame = new Float32Array(WIDTH * HEIGHT);
    created += 1;
    worker.postMessage({ type: 'fill', frame }, [frame.buffer]);
  }
  setButtons(true);
  frameId = requestAnimationFrame(tick);
});
$('#pause').addEventListener('click', (event) => {
  const pausing = frameId !== null;
  if (pausing) {
    cancelAnimationFrame(frameId);
    frameId = null;
  } else {
    frameId = requestAnimationFrame(tick);
  }
  event.currentTarget.textContent = pausing ? 'Seguir' : 'Pausa';
});
$('#stop').addEventListener('click', () => {
  report(`⏹ detenido: ${$('#status').textContent.toLowerCase()}`);
  stopLoop();
});
addEventListener('pagehide', stopLoop);

draw(createPlate()); // el estado inicial, quieto: nada se mueve sin pulsar
report('Listo: pulsa «Calentar»; prueba también «Pausa» y «Detener»');
```

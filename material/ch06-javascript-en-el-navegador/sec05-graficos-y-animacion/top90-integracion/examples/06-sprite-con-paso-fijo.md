---
example_description: "Una animación de sprites: una hoja con 6 fotogramas de un colibrí (dibujada con la API 2D en un canvas aparte, al doble de resolución) y drawImage para recortar el fotograma de cada momento. El reloj es un paso fijo de 10 ms en milisegundos enteros, así que «Paso a paso» y la simulación dan siempre lo mismo"
example_tags: "javascript|canvas|sprites|drawimage|paso-fijo|requestanimationframe|integracion"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Colibrí del jardín</h1>
  <canvas id="garden" width="320" height="110" role="img" aria-label="Un colibrí que vuela de izquierda a derecha batiendo las alas"></canvas>
  <p class="controls">
    <button id="play" type="button">▶ Volar</button>
    <button id="step" type="button">Paso a paso (+100 ms)</button>
  </p>
  <p id="status" aria-live="polite"></p>
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
canvas {
  display: block;
  background: #ecfccb;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// 1. LA HOJA DE SPRITES: 6 fotogramas de 48 × 48 px, dibujados al doble (96 × 96) para pantallas × 2
const FRAME = 48;
const WING_ANGLES = [-1.1, -0.6, 0, 0.6, 0.2, -0.5];  // el ala, en cada fotograma
const sheet = document.createElement('canvas');
sheet.width = FRAME * 2 * WING_ANGLES.length;
sheet.height = FRAME * 2;
const sheetCtx = sheet.getContext('2d');
sheetCtx.scale(2, 2);
WING_ANGLES.forEach((angle, f) => {
  sheetCtx.save();
  sheetCtx.translate(f * FRAME, 0);                    // cada fotograma, en su casilla
  sheetCtx.save();
  sheetCtx.translate(22, 24);
  sheetCtx.rotate(angle);
  sheetCtx.fillStyle = '#5eead4';                      // el ala, debajo del cuerpo
  sheetCtx.beginPath();
  sheetCtx.ellipse(0, -10, 5, 12, 0, 0, 2 * Math.PI);
  sheetCtx.fill();
  sheetCtx.restore();
  sheetCtx.fillStyle = '#0f766e';                      // cuerpo y cabeza
  sheetCtx.beginPath();
  sheetCtx.ellipse(22, 27, 12, 7, 0, 0, 2 * Math.PI);
  sheetCtx.moveTo(39, 22);                             // un subtrazado nuevo: sin línea entre los dos
  sheetCtx.arc(34, 22, 5, 0, 2 * Math.PI);
  sheetCtx.fill();
  sheetCtx.strokeStyle = '#1f2933';                    // el pico
  sheetCtx.lineWidth = 1.5;
  sheetCtx.beginPath();
  sheetCtx.moveTo(38, 21);
  sheetCtx.lineTo(47, 20);
  sheetCtx.stroke();
  sheetCtx.restore();
});
console.log(`hoja de sprites → ${sheet.width} × ${sheet.height} px (${WING_ANGLES.length} fotogramas de ${FRAME * 2})`);
const [r, g, b] = sheetCtx.getImageData(22 * 2, 27 * 2, 1, 1).data;
console.log(`centro del cuerpo, fotograma 0 → rgb(${r}, ${g}, ${b})`);

// 2. EL ESTADO Y SU PASO: el tiempo en ms enteros; todo lo demás se deduce de él
const STEP_MS = 10;
const step = (state) => ({ timeMs: state.timeMs + STEP_MS });
const spriteFrame = (state) => Math.floor(state.timeMs / 100) % WING_ANGLES.length; // 10 fotogramas por segundo
const positionX = (state) => 20 + ((80 * state.timeMs) / 1000) % 300;               // 80 px/s, y vuelta a empezar
for (const ms of [250, 1000, 4000]) {
  let simulated = { timeMs: 0 };
  while (simulated.timeMs < ms) simulated = step(simulated);
  console.log(`t = ${ms / 1000} s → fotograma ${spriteFrame(simulated)}, x = ${positionX(simulated)}`);
}

// 3. EL DIBUJO: drawImage recorta el fotograma de la hoja (origen) y lo pinta en el canvas (destino)
const canvas = document.querySelector('#garden');
const dpr = window.devicePixelRatio;
canvas.style.width = '320px';
canvas.style.height = '110px';
canvas.width = 320 * dpr;
canvas.height = 110 * dpr;
const ctx = canvas.getContext('2d');
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
let state = { timeMs: 0 };
function draw() {
  ctx.clearRect(0, 0, 320, 110);
  const f = spriteFrame(state);
  ctx.drawImage(sheet, f * FRAME * 2, 0, FRAME * 2, FRAME * 2, positionX(state) - FRAME / 2, 30, FRAME, FRAME);
}

// 4. EL BUCLE: acumulador de paso fijo, tope por frame, pausa y límite de 30 s
const playButton = document.querySelector('#play');
const statusLine = document.querySelector('#status');
let frameId = null;
let previous = null;
let accumulator = 0;
let stopTimer = null;
function frame(now) {
  if (previous !== null) accumulator += Math.min(now - previous, 100);
  previous = now;
  while (accumulator >= STEP_MS) {
    state = step(state);
    accumulator -= STEP_MS;
  }
  draw();
  frameId = requestAnimationFrame(frame);
}
function setPlaying(playing) {
  clearTimeout(stopTimer);
  if (playing) {
    previous = null;
    frameId = requestAnimationFrame(frame);
    stopTimer = setTimeout(() => setPlaying(false), 30000);
  } else {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
  playButton.textContent = playing ? '⏸ Pausa' : '▶ Volar';
  statusLine.textContent = playing ? 'Volando' : `En pausa: fotograma ${spriteFrame(state)}, x = ${Math.round(positionX(state))}`;
  console.log(playing ? '▶ volando' : `⏸ ${statusLine.textContent}`);
}
playButton.addEventListener('click', () => setPlaying(frameId === null));
document.querySelector('#step').addEventListener('click', () => {
  if (frameId !== null) setPlaying(false);
  for (let i = 0; i < 10; i++) state = step(state);   // 10 pasos de 10 ms
  draw();
  const text = `t = ${state.timeMs / 1000} s → fotograma ${spriteFrame(state)}, x = ${positionX(state)}`;
  statusLine.textContent = text;
  console.log(text);
});
document.addEventListener('visibilitychange', () => { if (document.hidden && frameId !== null) setPlaying(false); });
draw();
console.log('Listo: pulsa «Paso a paso» varias veces, o «Volar»');
```

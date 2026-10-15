---
example_description: "El juego de la vida en un OffscreenCanvas: el tablero, las reglas, el bucle con requestAnimationFrame y el dibujo viven en un worker; la página solo envía órdenes (reproducir, paso, velocidad, cambiar una célula con el ratón o el teclado) y recibe un resumen. Se para sola a las 300 generaciones, se pausa al ocultar la pestaña y respeta «reducir movimiento»"
example_tags: "javascript|workers|offscreencanvas|requestanimationframe|canvas|accesibilidad|simulacion|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>El juego de la vida</h1>
  <p class="intro">Cada célula mira a sus 8 vecinas: con 3 vecinas, nace; con 2 o 3, sigue viva; si no, muere. Los bordes se tocan: lo que sale por la derecha entra por la izquierda.</p>
  <canvas id="board" tabindex="0" aria-label="Tablero de 64 × 40 células" aria-describedby="keys"></canvas>
  <p id="keys" class="note">Con el teclado: Tab hasta el tablero, flechas para moverte, Espacio para cambiar la célula, N para avanzar una generación.</p>
  <p class="counters">Generación <output id="generation">0</output> · <output id="population">0</output> células vivas</p>
  <div class="controls">
    <button id="play" type="button">Reproducir</button>
    <button id="step" type="button">Paso</button>
    <button id="clear" type="button">Vaciar</button>
    <label>Patrón
      <select id="pattern">
        <option value="gosper">Cañón de Gosper</option>
        <option value="pulsar">Púlsar</option>
        <option value="glider">Planeador</option>
      </select>
    </label>
    <label class="speed">Velocidad <input id="speed" type="range" min="1" max="30" value="15"> <output id="speed-value" for="speed">15</output> gen/s</label>
  </div>
  <p id="motion-note" class="note" hidden>«Reducir movimiento» está activado: el tablero no se anima solo; avanza con «Paso» o con la tecla N.</p>
  <p id="announce" class="visually-hidden" aria-live="polite"></p>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.app { max-width: 30rem; margin: 0 auto; padding: 1rem; display: grid; gap: 0.6rem; }
h1 { margin: 0; font-size: 1.25rem; }
.intro, .note { margin: 0; color: var(--muted); font-size: 0.85rem; }
canvas { display: block; inline-size: 100%; block-size: auto; aspect-ratio: 64 / 40; border: 1px solid var(--line); border-radius: 0.4rem; cursor: pointer; }
.counters { margin: 0; font-weight: 600; font-variant-numeric: tabular-nums; }
.controls { display: flex; flex-wrap: wrap; gap: 0.5rem 0.75rem; align-items: center; }
label { display: flex; gap: 0.35rem; align-items: center; font-size: 0.9rem; }
input, select, button { font: inherit; color: var(--ink); }
select, button { padding: 0.3rem 0.6rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.6; }
:is(canvas, input, select, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.visually-hidden { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-size: 0.8rem; }
```

# JavaScript

```javascript
// EL JUEGO DE LA VIDA EN UN OFFSCREENCANVAS
//
// Decisiones de diseño:
// - El worker (04-life/life-worker.js) tiene el tablero, las reglas (04-life/life.js),
//   el bucle (requestAnimationFrame de un worker dedicado, en Chrome) con paso fijo y el
//   dibujo en el OffscreenCanvas transferido. La página no calcula ni dibuja nada: envía
//   órdenes y pinta los contadores que le llegan.
// - Nada se mueve sin pulsar, y una reproducción se para sola a las 300 generaciones.
//   Al ocultar la pestaña se pausa. Con «reducir movimiento», no hay reproducción:
//   se avanza generación a generación.
// - Accesible con teclado: el tablero es enfocable; las flechas mueven un cursor que
//   dibuja el worker, Espacio cambia la célula y una región aria-live dice su estado.
//   Los contadores no son aria-live: cambiarían 15 veces por segundo.
// - El tamaño del canvas se fija antes de transferirlo (después ya no se puede).
//
// Alcance: HTML, CSS, el capítulo de JavaScript, canvas, eventos y matchMedia del
// capítulo 6, y este módulo.
const COLS = 64;
const ROWS = 40;
const CELL = 7; // px por célula
const START = { gosper: [2, 2], pulsar: [25, 13], glider: [30, 18] };
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (selector) => document.querySelector(selector);
const fmt = (n) => n.toLocaleString('es-MX');
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

const canvas = $('#board');
canvas.width = COLS * CELL * devicePixelRatio;
canvas.height = ROWS * CELL * devicePixelRatio;
const offscreen = canvas.transferControlToOffscreen();
const worker = new Worker('04-life/life-worker.js', { type: 'module' });
worker.postMessage({ type: 'init', canvas: offscreen, columns: COLS, lines: ROWS, scale: CELL * devicePixelRatio }, [offscreen]);
const send = (type, data = {}) => worker.postMessage({ type, ...data });
addEventListener('pagehide', () => worker.terminate());
document.addEventListener('visibilitychange', () => { if (document.hidden) send('pause'); });

let state = null;
let announceCursor = false;
let playFrom = null; // generación en la que empezó la reproducción en curso
worker.addEventListener('message', (event) => {
  const message = event.data;
  if (message.type !== 'state') return;
  const wasRunning = state?.running;
  state = message;
  $('#generation').textContent = fmt(message.generation);
  $('#population').textContent = fmt(message.population);
  $('#play').textContent = message.running ? 'Pausa' : 'Reproducir';
  if (wasRunning && !message.running) {
    const reason = message.generation - playFrom >= 300 ? 'se paró sola' : 'pausa';
    report(`⏸ ${reason} en la generación ${fmt(message.generation)} · ${fmt(message.population)} células vivas`);
  }
  if (announceCursor) {
    const { x, y, alive } = message.cursor;
    $('#announce').textContent = `Célula ${x + 1}, ${y + 1}: ${alive ? 'viva' : 'muerta'}`;
    announceCursor = false;
  }
});

if (reducedMotion) {
  $('#play').disabled = true;
  $('#motion-note').hidden = false;
}
$('#play').addEventListener('click', () => {
  if (state?.running) {
    send('pause');
  } else {
    playFrom = state?.generation ?? 0;
    send('play');
  }
});
$('#step').addEventListener('click', () => send('step'));
$('#clear').addEventListener('click', () => send('clear'));
$('#pattern').addEventListener('change', () => {
  const name = $('#pattern').value;
  const [left, top] = START[name];
  send('pattern', { name, left, top });
});
$('#speed').addEventListener('input', () => {
  $('#speed-value').textContent = $('#speed').value;
  send('speed', { value: $('#speed').valueAsNumber });
});

// Ratón: de la posición del clic a la célula.
canvas.addEventListener('click', (event) => {
  const box = canvas.getBoundingClientRect();
  const x = Math.min(COLS - 1, Math.floor(((event.clientX - box.left) / box.width) * COLS));
  const y = Math.min(ROWS - 1, Math.floor(((event.clientY - box.top) / box.height) * ROWS));
  send('toggle', { x, y });
});
// Teclado: un cursor que dibuja el worker.
let cursor = { x: 0, y: 0 };
const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
canvas.addEventListener('focus', () => send('cursor', { ...cursor, visible: true }));
canvas.addEventListener('blur', () => send('cursor', { ...cursor, visible: false }));
canvas.addEventListener('keydown', (event) => {
  if (moves[event.key]) {
    const [dx, dy] = moves[event.key];
    cursor = { x: (cursor.x + dx + COLS) % COLS, y: (cursor.y + dy + ROWS) % ROWS };
    send('cursor', { ...cursor, visible: true });
  } else if (event.key === ' ') {
    send('toggle', cursor);
  } else if (event.key === 'n' || event.key === 'N') {
    send('step');
    return;
  } else {
    return;
  }
  event.preventDefault(); // que las flechas y el Espacio no desplacen la página
  announceCursor = true;
});

// Al cargar: el patrón inicial y una simulación sin dibujar, en el worker.
const first = await new Promise((resolve) => worker.addEventListener('message', (event) => {
  if (event.data.type === 'state') resolve(event.data);
}, { once: true }));
report(`🧬 cañón de planeadores de Gosper: generación ${first.generation} · ${first.population} células vivas`);
const counts = await new Promise((resolve) => {
  const listener = (event) => {
    if (event.data.type !== 'simulated') return;
    worker.removeEventListener('message', listener);
    resolve(event.data.counts);
  };
  worker.addEventListener('message', listener);
  send('simulate', { generations: [30, 120] });
});
report(`🔮 simulado en el worker, sin dibujar: ${counts[30]} vivas tras 30 generaciones · ${counts[120]} tras 120`);
report(reducedMotion
  ? 'Listo: avanza con «Paso» (o la tecla N) y haz clic en el tablero para cambiar células'
  : 'Listo: pulsa «Reproducir» (se para sola a las 300 generaciones) o haz clic en el tablero para cambiar células');
```

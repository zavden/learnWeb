---
example_description: "Un panel de firma: Pointer Events con captura y touch-action: none, trazos guardados como datos (no como píxeles) y suavizados con curvas cuadráticas a través de los puntos medios, grosor según la presión del lápiz, alta densidad y redibujado al cambiar el ancho, deshacer (también con Ctrl/⌘ + Z), exportar PNG y una alternativa escrita para quien no puede dibujar"
example_tags: "javascript|canvas|pointer-events|setpointercapture|path2d|toblob|accesibilidad|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="sign">
  <h1>Recibí conforme: pedido P-4120</h1>
  <p id="pad-help" class="sign__help">Firma con el ratón, el dedo o un lápiz dentro del recuadro. Si prefieres, escribe tu nombre más abajo.</p>
  <canvas id="pad" class="sign__pad" tabindex="0" role="img" aria-label="Recuadro de firma, vacío" aria-describedby="pad-help"></canvas>
  <div class="sign__actions">
    <button id="undo" type="button" disabled>↶ Deshacer</button>
    <button id="clear" type="button" disabled>Borrar</button>
    <button id="export" type="button" disabled>Descargar PNG</button>
  </div>
  <form id="typed" class="sign__typed">
    <label for="typed-name">O escribe tu nombre</label>
    <input id="typed-name" name="name" autocomplete="name" required>
    <button type="submit">Usar como firma</button>
  </form>
  <p id="status" class="sign__status" role="status"></p>
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
.sign {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.sign__help,
.sign__status {
  color: #52606d;
  font-size: 0.9rem;
}
/* touch-action: none → con el dedo, el gesto es para la firma, no para desplazar la página */
.sign__pad {
  display: block;
  width: 100%;
  height: 180px;
  border: 2px dashed #9aa5b1;
  border-radius: 0.5rem;
  background: #ffffff;
  touch-action: none;
  cursor: crosshair;
}
.sign__pad:focus-visible,
button:focus-visible,
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.sign__actions,
.sign__typed {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.75rem;
}
button,
input {
  font: inherit;
  padding: 0.3rem 0.7rem;
}
```

# JavaScript

```javascript
// Panel de firma.
//
// Decisiones de diseño:
// - La firma se guarda como DATOS: una lista de trazos, cada uno con sus puntos en px CSS y su
//   grosor. Los píxeles se pueden rehacer en cualquier momento: al cambiar el ancho (nuevo mapa
//   de bits × devicePixelRatio), al deshacer o al exportar.
// - Suavizado: una curva cuadrática por punto, con el punto como control y el punto medio con el
//   siguiente como destino; el resultado es un texto de path de SVG que Path2D entiende tal cual.
// - setPointerCapture: el trazo sigue aunque el puntero salga del recuadro; touch-action: none
//   evita que el dedo desplace la página. pointercancel termina el trazo como si se soltara.
// - Accesibilidad: el canvas dice en su aria-label cuántos trazos tiene, los botones se activan
//   cuando hay algo que deshacer, y la firma escrita es una alternativa de verdad.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

function smoothPath(points) {
  const [first] = points;
  if (points.length < 3) return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const commands = [`M ${first.x} ${first.y}`];
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    commands.push(`Q ${points[i].x} ${points[i].y} ${midX} ${midY}`);
  }
  const last = points.at(-1);
  commands.push(`L ${last.x} ${last.y}`);
  return commands.join(' ');
}
console.log('suavizado de 4 puntos →', smoothPath([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 10 }, { x: 30, y: 10 }]));

const pad = document.querySelector('#pad');
const ctx = pad.getContext('2d');
const statusLine = document.querySelector('#status');
const strokes = [];                             // { points: [{ x, y }], width } o { text }
let current = null;

function resizePad() {
  const dpr = window.devicePixelRatio;
  pad.width = Math.round(pad.clientWidth * dpr);
  pad.height = Math.round(pad.clientHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redraw();
}
function drawStroke(context, stroke) {
  if (stroke.text) {
    context.fillStyle = '#1e3a8a';
    context.font = 'italic 40px "Segoe Script", "Brush Script MT", cursive';
    context.textBaseline = 'middle';
    context.fillText(stroke.text, 20, 90, pad.clientWidth - 40);
    return;
  }
  context.strokeStyle = '#1e3a8a';
  context.lineWidth = stroke.width;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.stroke(new Path2D(smoothPath(stroke.points)));
}
function redraw() {
  ctx.clearRect(0, 0, pad.clientWidth, pad.clientHeight);
  ctx.strokeStyle = '#cbd2d9';                  // la línea de firma
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, 140.5);
  ctx.lineTo(pad.clientWidth - 20, 140.5);
  ctx.stroke();
  for (const stroke of strokes) drawStroke(ctx, stroke);
  if (current) drawStroke(ctx, current);
}
function updateState(message) {
  const empty = strokes.length === 0;
  for (const id of ['undo', 'clear', 'export']) document.querySelector(`#${id}`).disabled = empty;
  pad.setAttribute('aria-label', empty ? 'Recuadro de firma, vacío' : `Recuadro de firma con ${strokes.length} trazo(s)`);
  statusLine.textContent = message;
  console.log(message);
}

// ── Dibujar con el puntero ───────────────────────────────────────────────
function pointFrom(event) {
  const box = pad.getBoundingClientRect();
  return { x: Math.round(event.clientX - box.left - pad.clientLeft), y: Math.round(event.clientY - box.top - pad.clientTop) };
}
pad.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  pad.setPointerCapture(event.pointerId);
  const pressure = event.pointerType === 'pen' ? event.pressure : 0.5; // el ratón dice 0.5
  current = { points: [pointFrom(event)], width: 1 + pressure * 4 };
});
pad.addEventListener('pointermove', (event) => {
  if (!current) return;
  current.points.push(pointFrom(event));
  redraw();
});
function endStroke() {
  if (!current) return;
  if (current.points.length > 1) strokes.push(current);
  current = null;
  redraw();
  updateState(`✍️ trazo ${strokes.length} guardado`);
}
pad.addEventListener('pointerup', endStroke);
pad.addEventListener('pointercancel', endStroke);

// ── Deshacer, borrar, firma escrita ──────────────────────────────────────
function undo() {
  if (strokes.length === 0) return;
  strokes.pop();
  redraw();
  updateState(`↶ deshecho: quedan ${strokes.length} trazo(s)`);
}
document.querySelector('#undo').addEventListener('click', undo);
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.target.closest('input')) {
    event.preventDefault();
    undo();
  }
});
document.querySelector('#clear').addEventListener('click', () => {
  strokes.length = 0;
  redraw();
  updateState('🧽 firma borrada');
});
document.querySelector('#typed').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = event.target.elements.name.value.trim();
  if (!name) return;
  strokes.length = 0;
  strokes.push({ text: name });
  redraw();
  updateState(`⌨️ firma escrita: ${name}`);
});

// ── Exportar: fondo blanco (el canvas es transparente) y PNG ─────────────
document.querySelector('#export').addEventListener('click', () => {
  const copy = document.createElement('canvas');
  copy.width = pad.width;
  copy.height = pad.height;
  const copyCtx = copy.getContext('2d');
  copyCtx.fillStyle = '#ffffff';
  copyCtx.fillRect(0, 0, copy.width, copy.height);
  copyCtx.drawImage(pad, 0, 0);
  copy.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'firma-P-4120.png' }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    updateState(`💾 firma-P-4120.png (${blob.type}) con ${strokes.length} trazo(s)`);
  }, 'image/png');
});

let resizePending = null;
window.addEventListener('resize', () => {
  resizePending ??= requestAnimationFrame(() => {
    resizePending = null;
    resizePad();
  });
});
resizePad();
updateState('Listo: firma en el recuadro, prueba ↶ Deshacer y «Descargar PNG»');
```

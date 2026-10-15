---
example_description: "Un bucle de animación que se detiene con un AbortSignal, como fetch o addEventListener: una sola señal cancela el frame pendiente y quita los listeners del bucle, y AbortSignal.any la combina con un plazo (AbortSignal.timeout) para que nunca corra para siempre"
example_tags: "javascript|requestanimationframe|abortcontroller|abortsignal|cancelanimationframe|bucle"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Ecualizador</h1>
  <canvas id="bars" width="300" height="120" role="img" aria-label="Doce barras de un ecualizador que suben y bajan"></canvas>
  <p class="hint">Mueve el puntero sobre las barras para cambiar el volumen. Se detiene solo a los 15 s.</p>
  <button id="toggle" type="button">▶ Empezar</button>
  <ol id="log" class="log" aria-live="polite"></ol>
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
  background: #111827;
}
.hint {
  color: #52606d;
  font-size: 0.9rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.log {
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Un bucle que se detiene con una señal: el mismo contrato que fetch(url, { signal })
function animationLoop(onFrame, signal) {
  if (signal.aborted) return;
  let frameId = requestAnimationFrame(function frame(now) {
    onFrame(now);
    frameId = requestAnimationFrame(frame);
  });
  signal.addEventListener('abort', () => cancelAnimationFrame(frameId), { once: true });
}

const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// 1. Prueba sin pantalla: abortar cancela el frame pendiente y quita los listeners con esa señal
const test = new AbortController();
let testFrames = 0;
let resizes = 0;
animationLoop(() => { testFrames += 1; }, test.signal);
window.addEventListener('resize', () => { resizes += 1; }, { signal: test.signal });
test.abort();
window.dispatchEvent(new Event('resize'));
logLine(`al abortar → aborted: ${test.signal.aborted} · motivo: ${test.signal.reason.name}`);
logLine(`resize después de abortar → el listener se ejecutó ${resizes} veces`);
setTimeout(() => logLine(`frames del bucle cancelado → ${testFrames}`), 200);

// 2. El ecualizador: una señal para el bucle y para el listener del puntero
const canvas = document.querySelector('#bars');
const dpr = window.devicePixelRatio;
canvas.style.width = '300px';
canvas.style.height = '120px';
canvas.width = 300 * dpr;
canvas.height = 120 * dpr;
const ctx = canvas.getContext('2d');
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
let volume = 0.6;
function drawBars(now) {
  ctx.clearRect(0, 0, 300, 120);
  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const level = volume * (0.55 + 0.45 * Math.sin(now / (180 + i * 37) + i));
    ctx.rect(8 + i * 24, 120 - level * 110, 18, level * 110);
  }
  ctx.fill();
}
drawBars(0);

const toggle = document.querySelector('#toggle');
let controller = null;
toggle.addEventListener('click', () => {
  if (controller) { controller.abort(); return; }            // «Parar»: una sola llamada
  controller = new AbortController();
  const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]);
  animationLoop(drawBars, signal);
  canvas.addEventListener('pointermove', (event) => {
    volume = 1 - (event.clientY - canvas.getBoundingClientRect().top) / 120;
  }, { signal });
  document.addEventListener('visibilitychange', () => controller?.abort(), { signal });
  signal.addEventListener('abort', () => {
    logLine(`⏹ detenido (${signal.reason.name})`);         // AbortError o TimeoutError
    controller = null;
    toggle.textContent = '▶ Empezar';
  });
  toggle.textContent = '⏹ Parar';
  logLine('▶ sonando');
});
logLine('Listo: pulsa «Empezar»');
```

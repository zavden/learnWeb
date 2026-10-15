---
example_description: "Un búfer circular de un productor y un consumidor sobre memoria compartible (la de WebAssembly, en Chrome): contadores de escritura y lectura con Atomics, capacidad potencia de 2 y una simulación a cámara lenta de un hilo de audio que necesita 128 muestras por paso y un productor que a veces se para; compara cortes de sonido y retraso según la capacidad, y explica las cabeceras que harían falta para usarlo con dos hilos de verdad"
example_tags: "javascript|atomics|sharedarraybuffer|bufer-circular|audio|svg|concurrencia|profesional"
example_stage: professional
example_importance: useful
console: true
---

# HTML

```html
<main class="app">
  <h1>Un búfer circular para audio</h1>
  <p class="intro">El hilo del audio pide 128 muestras cada 2,7 ms y no puede esperar: si no las hay, se oye un corte. Un worker las fabrica y las deja en un búfer circular, pero a veces se para unos milisegundos. Aquí, a cámara lenta y en un solo hilo: un paso por fotograma.</p>
  <div class="controls">
    <label>Capacidad
      <select id="capacity">
        <option value="256">256 muestras</option>
        <option value="512">512 muestras</option>
        <option value="1024" selected>1024 muestras</option>
        <option value="2048">2048 muestras</option>
      </select>
    </label>
    <button id="run" type="button">Simular 600 pasos</button>
    <button id="step" type="button">Paso</button>
    <button id="hundred" type="button">+100 pasos de golpe</button>
    <button id="stop" type="button" disabled>Detener</button>
  </div>
  <figure class="ring-figure">
    <svg id="ring" viewBox="-110 -110 220 220" role="img" aria-labelledby="fill-text"></svg>
    <figcaption id="fill-text"></figcaption>
  </figure>
  <dl class="stats">
    <div><dt>Pasos</dt><dd id="ticks">0</dd></div>
    <div><dt>Cortes de sonido</dt><dd id="underruns">0</dd></div>
    <div><dt>Retraso medio</dt><dd id="latency">0 ms</dd></div>
  </dl>
  <p id="motion-note" class="note" hidden>«Reducir movimiento» está activado: usa «Paso» o «+100 pasos de golpe».</p>
  <details>
    <summary>Con dos hilos de verdad</summary>
    <p>El productor estaría en un worker y el consumidor en un <code>AudioWorklet</code>, los dos con el mismo <code>SharedArrayBuffer</code>. Para eso, la página tiene que servirse aislada, con estas dos cabeceras HTTP:</p>
    <pre><code>Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp</code></pre>
    <p>La vista previa del curso no las envía, así que aquí la memoria no se comparte con nadie: se simula el turno de cada hilo.</p>
  </details>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --empty: #e2e8f0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.app { max-width: 34rem; margin: 0 auto; padding: 1rem; display: grid; gap: 0.75rem; }
h1 { margin: 0; font-size: 1.25rem; }
.intro, .note { margin: 0; color: var(--muted); font-size: 0.9rem; }
.controls { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: end; }
label { display: grid; gap: 0.2rem; font-size: 0.9rem; }
select, button { font: inherit; color: var(--ink); padding: 0.3rem 0.6rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.6; }
:is(select, button, summary):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.ring-figure { margin: 0; display: grid; justify-items: center; gap: 0.25rem; }
#ring { inline-size: min(100%, 15rem); }
.segment { fill: var(--empty); }
.segment.filled { fill: var(--accent); }
figcaption { font-weight: 600; font-variant-numeric: tabular-nums; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin: 0; text-align: center; }
.stats div { padding: 0.4rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); }
dt { color: var(--muted); font-size: 0.8rem; }
dd { margin: 0; font-weight: 600; font-variant-numeric: tabular-nums; }
details { padding: 0.5rem 0.75rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-size: 0.9rem; }
pre { overflow-x: auto; padding: 0.5rem; border-radius: 0.4rem; background: #0f172a; color: #e2e8f0; font-size: 0.8rem; }
.log { margin: 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-size: 0.8rem; white-space: pre-wrap; }
```

# JavaScript

```javascript
// UN BÚFER CIRCULAR PARA AUDIO
//
// Decisiones de diseño:
// - 07-ring/ring-buffer.js es el búfer de verdad (un productor, un consumidor, sin
//   cerrojos: solo Atomics.load/store sobre dos contadores) y una simulación con semilla.
// - La memoria es la compartible de WebAssembly, que en Chrome se puede crear sin
//   aislamiento; si no se pudiera, un ArrayBuffer (Atomics también funciona sobre él).
//   Nadie más la ve: productor y consumidor se turnan en este hilo.
// - El dibujo es un anillo SVG de 32 segmentos; cada uno se pinta si el tramo del búfer
//   que representa tiene muestras. Un paso por fotograma, 600 como mucho, y nada se
//   mueve sin pulsar; con «reducir movimiento», solo pasos sueltos o de cien en cien.
// - Al cargar se comparan las cuatro capacidades con 1000 pasos sin dibujar: más
//   capacidad, menos cortes y más retraso. No hay una capacidad «correcta».
//
// Alcance: HTML, CSS, SVG con JavaScript y requestAnimationFrame del capítulo 6,
// typed arrays y Atomics de este capítulo.
import { RingBuffer, createSimulation } from './07-ring/ring-buffer.js';

const SEGMENTS = 32;
const MAX_TICKS = 600;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (selector) => document.querySelector(selector);
const fmt = (n) => n.toLocaleString('es-MX');
const cuts = (n) => `${n} corte${n === 1 ? '' : 's'}`;
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

function createMemory() {
  try {
    return new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true }).buffer; // 64 KiB
  } catch {
    return new ArrayBuffer(65_536);
  }
}

// El anillo: 32 trozos de corona circular.
const svgNS = 'http://www.w3.org/2000/svg';
const point = (radius, angle) => `${(radius * Math.cos(angle)).toFixed(2)} ${(radius * Math.sin(angle)).toFixed(2)}`;
const segments = Array.from({ length: SEGMENTS }, (_, i) => {
  const from = (i / SEGMENTS) * 2 * Math.PI - Math.PI / 2;
  const to = ((i + 1) / SEGMENTS) * 2 * Math.PI - Math.PI / 2 - 0.04;
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', `M ${point(100, from)} A 100 100 0 0 1 ${point(100, to)} L ${point(68, to)} A 68 68 0 0 0 ${point(68, from)} Z`);
  path.setAttribute('class', 'segment');
  $('#ring').append(path);
  return path;
});

let ring = null;
let simulation = null;
let frameId = null;
let runUntil = 0;

function reset() {
  ring = new RingBuffer(createMemory(), Number($('#capacity').value));
  simulation = createSimulation(ring);
  draw();
}
function draw() {
  const available = ring.available();
  const readPosition = Atomics.load(ring.indices, 1) & ring.mask;
  const perSegment = ring.capacity / SEGMENTS;
  segments.forEach((segment, i) => {
    const center = (i + 0.5) * perSegment;
    const filled = (center - readPosition + ring.capacity) % ring.capacity < available;
    segment.classList.toggle('filled', filled);
  });
  const { ticks, underruns, averageFill } = simulation.stats;
  $('#fill-text').textContent = `${fmt(available)} de ${fmt(ring.capacity)} muestras en el búfer`;
  $('#ticks').textContent = fmt(ticks);
  $('#underruns').textContent = fmt(underruns);
  $('#latency').textContent = `${(averageFill / 48).toFixed(1)} ms`;
}
function summary() {
  const { ticks, underruns, averageFill } = simulation.stats;
  return `${fmt(ticks)} pasos con ${fmt(ring.capacity)} muestras: ${cuts(underruns)} · retraso medio ${(averageFill / 48).toFixed(1)} ms`;
}

function setRunning(running) {
  $('#run').disabled = running || reducedMotion;
  $('#stop').disabled = !running;
  for (const id of ['#step', '#hundred', '#capacity']) $(id).disabled = running;
}
function frame() {
  simulation.tick();
  draw();
  if (simulation.stats.ticks >= runUntil) return stop();
  frameId = requestAnimationFrame(frame);
}
function stop() {
  cancelAnimationFrame(frameId);
  frameId = null;
  setRunning(false);
  report(`⏹ ${summary()}`);
}
$('#run').addEventListener('click', () => {
  runUntil = simulation.stats.ticks + MAX_TICKS;
  setRunning(true);
  frameId = requestAnimationFrame(frame);
});
$('#stop').addEventListener('click', stop);
$('#step').addEventListener('click', () => {
  simulation.tick();
  draw();
});
$('#hundred').addEventListener('click', () => {
  for (let i = 0; i < 100; i++) simulation.tick();
  draw();
  report(`⏭️ ${summary()}`);
});
$('#capacity').addEventListener('change', () => {
  reset();
  report(`🔄 capacidad: ${fmt(ring.capacity)} muestras (${fmt(RingBuffer.bytesFor(ring.capacity))} bytes)`);
});
document.addEventListener('visibilitychange', () => { if (document.hidden && frameId !== null) stop(); });
addEventListener('pagehide', () => cancelAnimationFrame(frameId));
if (reducedMotion) $('#motion-note').hidden = false;

// Al cargar: qué memoria hay y la comparación de capacidades, sin dibujar.
const memory = createMemory();
report(`🧠 memoria: ${Object.prototype.toString.call(memory)} de ${fmt(memory.byteLength)} bytes; el búfer usa 8 + 4 × capacidad`);
report('📏 1000 pasos con los mismos tropiezos del productor:');
for (const capacity of [256, 512, 1024, 2048]) {
  const sim = createSimulation(new RingBuffer(createMemory(), capacity));
  for (let i = 0; i < 1000; i++) sim.tick();
  report(`   ${String(capacity).padStart(4)} muestras → ${cuts(sim.stats.underruns).padStart(10)} · retraso medio ${(sim.stats.averageFill / 48).toFixed(1)} ms`);
}
reset();
setRunning(false);
report(reducedMotion ? 'Listo: avanza con «Paso» o «+100 pasos de golpe»; cambia la capacidad y compara' : 'Listo: pulsa «Simular 600 pasos» (unos 10 s) o «+100 pasos de golpe»; cambia la capacidad y compara');
```

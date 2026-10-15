---
example_description: "Asignar en el bucle caliente: una simulación de 2000 gotas con vectores inmutables {x, y} pide 8000 objetos nuevos por frame (480 000 por segundo a 60 Hz); la misma física sobre dos Float32Array reutilizados no crea ninguno y va varias veces más rápida por frame"
example_tags: "javascript|rendimiento|memoria|recolector-de-basura|float32array|asignaciones|bug"
example_stage: common-error
example_importance: critical
console: true
loop_protect: false
---

# HTML

```html
<main>
  <h1>Lluvia: 2000 gotas</h1>
  <p>La misma física de dos maneras: objetos <code>{x, y}</code> nuevos en cada paso, o dos <code>Float32Array</code> creados una sola vez.</p>
  <button id="run" type="button">Simular</button>
  <output id="state" for="run">Sin medir todavía</output>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:disabled { cursor: progress; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
output { margin-inline-start: 0.5rem; color: #475569; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// loop_protect: false (en la cabecera): la guarda de bucles falsearía la medida.

// El ayudante bench de la lección «Medir antes de optimizar», tal cual.
let benchSink;
function bench(label, fn, { runs = 15, warmup = 3 } = {}) {
  for (let i = 0; i < warmup; i++) benchSink = fn();
  const times = [];
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    benchSink = fn();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  return { label, median: times[Math.floor(times.length / 2)], min: times[0], max: times.at(-1) };
}

const DROPS = 2000;
const DT = 1 / 60;
const GRAVITY = 98; // px/s²

// 🐛 Vectores inmutables: cada operación devuelve un objeto NUEVO. Contamos cuántos pide el código.
let requested = 0;
const vec = (x, y) => { requested += 1; return { x, y }; };
const add = (a, b) => vec(a.x + b.x, a.y + b.y);
const scale = (v, k) => vec(v.x * k, v.y * k);
const GRAVITY_VEC = { x: 0, y: GRAVITY };
function createObjectDrops() {
  return Array.from({ length: DROPS }, (_, i) => ({
    pos: vec(i % 100, (i * 7) % 100),
    vel: vec(((i * 13) % 21) - 10, ((i * 17) % 21) - 10),
  }));
}
function stepObjects(drops) {
  for (const drop of drops) {
    drop.vel = add(drop.vel, scale(GRAVITY_VEC, DT)); // 2 objetos nuevos
    drop.pos = add(drop.pos, scale(drop.vel, DT));    // 2 más
  }
}

// ✅ Los mismos datos en dos Float32Array: [x0, y0, x1, y1, …]. Se crean una vez y se
//    reescriben en cada frame. Es además lo que se envía a la GPU (capítulo 8, «Gráficos en la GPU»).
function createArrayDrops() {
  const pos = new Float32Array(DROPS * 2);
  const vel = new Float32Array(DROPS * 2);
  for (let i = 0; i < DROPS; i++) {
    pos[2 * i] = i % 100;
    pos[2 * i + 1] = (i * 7) % 100;
    vel[2 * i] = ((i * 13) % 21) - 10;
    vel[2 * i + 1] = ((i * 17) % 21) - 10;
  }
  return { pos, vel };
}
function stepArrays({ pos, vel }) {
  for (let i = 0; i < DROPS; i++) {
    vel[2 * i + 1] += GRAVITY * DT;
    pos[2 * i] += vel[2 * i] * DT;
    pos[2 * i + 1] += vel[2 * i + 1] * DT;
  }
}

// Un frame de cada uno, para contar.
const objectDrops = createObjectDrops();
const arrayDrops = createArrayDrops();
requested = 0;
stepObjects(objectDrops);
console.log(`🐛 objetos {x, y} pedidos en un frame → ${requested} (${requested * 60} por segundo a 60 Hz)`);
const before = requested;
stepArrays(arrayDrops);
console.log(`✅ objetos pedidos en un frame → ${requested - before} (2 Float32Array de ${arrayDrops.pos.byteLength} bytes, creados al empezar)`);

// Los objetos {x, y} de este bucle ocupan unos 44 bytes cada uno (el objeto y sus dos números):
// 30 frames son unos 10 MB de basura. Por eso la versión 🐛 simula menos frames y se compara
// el coste POR FRAME (límite de la demostración: ~45 MB por clic).
const OBJECT_FRAMES = 30;
const ARRAY_FRAMES = 120;
function simulateObjects(frames = OBJECT_FRAMES) {
  const drops = createObjectDrops();
  for (let f = 0; f < frames; f++) stepObjects(drops);
  return drops;
}
function simulateArrays(frames = ARRAY_FRAMES) {
  const drops = createArrayDrops();
  for (let f = 0; f < frames; f++) stepArrays(drops);
  return drops;
}

const runButton = document.querySelector('#run');
const state = document.querySelector('#state');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
runButton.addEventListener('click', () => {
  runButton.disabled = true;
  state.textContent = 'midiendo…';
  requestAnimationFrame(() => setTimeout(() => { // deja pintar «midiendo…» (~20 ms de trabajo)
    const objects = bench('🐛 objetos {x, y}', simulateObjects, { runs: 3, warmup: 1 });
    const objectResult = benchSink;
    const arrays = bench('✅ Float32Array', simulateArrays, { runs: 7, warmup: 2 });
    // float32 guarda menos cifras que number (lección «Float32 y precisión»): se compara con margen.
    const sameFrames = simulateArrays(OBJECT_FRAMES);
    const same = objectResult.every((drop, i) =>
      Math.abs(drop.pos.x - sameFrames.pos[2 * i]) < 0.01 && Math.abs(drop.pos.y - sameFrames.pos[2 * i + 1]) < 0.01);
    const objectFrameMs = objects.median / OBJECT_FRAMES;
    const arrayFrameMs = arrays.median / ARRAY_FRAMES;
    logLine(`¿las mismas posiciones tras ${OBJECT_FRAMES} frames (±0.01 px)? ${same}`);
    logLine(`¿el Float32Array es ≥ 3 veces más rápido por frame? ${objectFrameMs >= 3 * arrayFrameMs}`);
    logLine(`${objects.label}: ≈ ${(objectFrameMs * 1000).toFixed(0)} µs por frame · ${arrays.label}: ≈ ${(arrayFrameMs * 1000).toFixed(1)} µs por frame`);
    state.textContent = 'Listo: pulsa otra vez para repetir';
    runButton.disabled = false;
  }, 0));
});
console.log('Listo: pulsa «Simular»');

// Los objetos de vida corta salen baratos al recolector (lección: «generación joven»), pero
// medio millón por segundo lo obliga a trabajar sin parar. Ojo: V8 puede ahorrarse los que no
// salen de la función (análisis de escape); los que se guardan en drop.pos, no.
```

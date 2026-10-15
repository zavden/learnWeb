---
example_description: "El calentamiento del JIT: la primera tanda de llamadas a una función recién cargada es varias veces más lenta que las siguientes, porque V8 empieza interpretándola y la optimiza mientras se usa. Al pulsar otra vez, la función ya está optimizada. Y el procesador también se calienta: tras un rato sin trabajo va más despacio, así que el ejemplo lo despierta antes de medir (se puede desactivar para verlo)"
example_tags: "javascript|rendimiento|jit|v8|calentamiento|benchmark|bug"
example_stage: common-error
example_importance: important
console: true
loop_protect: false
---

# HTML

```html
<main>
  <h1>Longitud de la ruta de reparto</h1>
  <p>12 tandas de 4 llamadas a <code>routeLength()</code> sobre 50 000 puntos. Cada barra es una tanda.</p>
  <p class="controls">
    <button id="run" type="button">Medir 12 tandas</button>
    <label><input id="wake" type="checkbox" checked> Despertar antes la CPU (150 ms)</label>
  </p>
  <ol id="bars" class="bars" aria-label="Duración de cada tanda"></ol>
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
button:focus-visible, input:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.bars { display: flex; align-items: flex-end; gap: 4px; block-size: 8rem; margin: 0.75rem 0 0; padding: 0; list-style: none; border-block-end: 1px solid #64748b; }
.bars li { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; block-size: 100%; font-size: 0.65rem; }
.bars .bar { inline-size: 100%; background: #1d4ed8; border-radius: 3px 3px 0 0; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// loop_protect: false (en la cabecera): la guarda de bucles falsearía la medida.

// Una ruta de 50 000 puntos (en metros), generada sin azar para que el resultado sea fijo.
const POINTS = 50_000;
const xs = new Float64Array(POINTS);
const ys = new Float64Array(POINTS);
for (let i = 0; i < POINTS; i++) {
  xs[i] = (i * 37) % 1000;
  ys[i] = (i * 91) % 700;
}

// Nadie llama a esta función hasta que pulsas el botón: empieza «fría».
function routeLength(pointsX, pointsY) {
  let total = 0;
  for (let i = 1; i < pointsX.length; i++) {
    const dx = pointsX[i] - pointsX[i - 1];
    const dy = pointsY[i] - pointsY[i - 1];
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

const BATCHES = 12;
const CALLS_PER_BATCH = 4;
// El procesador también «se duerme»: tras un rato sin trabajo baja su frecuencia (o el sistema
// pasa la hebra a un núcleo de eficiencia) y tarda decenas de milisegundos en volver a toda
// velocidad. 150 ms de cálculo sin relación con la ruta lo despiertan antes de medir.
function wakeCpu(ms) {
  const end = performance.now() + ms;
  let mix = 0;
  while (performance.now() < end) {
    for (let k = 0; k < 1000; k++) mix = (mix * 31 + k) | 0;
  }
  return mix;
}

const runButton = document.querySelector('#run');
const wakeBox = document.querySelector('#wake');
const barList = document.querySelector('#bars');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function drawBars(times) {
  const tallest = Math.max(...times);
  barList.replaceChildren(...times.map((ms) => {
    const item = document.createElement('li');
    const bar = document.createElement('span');
    bar.className = 'bar';
    bar.style.blockSize = `${(ms / tallest) * 85}%`;
    item.append(bar, ms.toFixed(1));
    return item;
  }));
}

let clicks = 0;
runButton.addEventListener('click', () => {
  clicks += 1;
  runButton.disabled = true;
  if (wakeBox.checked) wakeCpu(150);
  const times = [];
  let meters = 0;
  for (let batch = 0; batch < BATCHES; batch++) {
    const start = performance.now();
    for (let call = 0; call < CALLS_PER_BATCH; call++) meters = routeLength(xs, ys);
    times.push(performance.now() - start);
  }
  drawBars(times);
  const median = times.toSorted((a, b) => a - b)[BATCHES / 2];
  logLine(`clic ${clicks} · la ruta mide → ${(meters / 1000).toFixed(1)} km`);
  if (clicks === 1) {
    // 🐛 Medir solo una vez, sin calentar, habría dado este primer número.
    logLine(`clic 1 · ¿la primera tanda fue la más lenta? ${times[0] === Math.max(...times)}`);
  }
  logLine(`clic ${clicks}${wakeBox.checked ? '' : ' (sin despertar la CPU)'} · primera tanda ≈ ${times[0].toFixed(1)} ms · mediana ≈ ${median.toFixed(1)} ms`);
  runButton.disabled = false;
});
console.log('Listo: pulsa «Medir 12 tandas»; después, pulsa otra vez (y prueba a desmarcar «Despertar antes la CPU»)');

// Qué pasa por dentro (V8, el motor de Chrome): la primera llamada compila la función a
// bytecode y la INTERPRETA; mientras se ejecuta, V8 cuenta vueltas y tipos y, cuando la
// función está «caliente», la recompila con compiladores cada vez más optimizadores
// (Sparkplug, Maglev, TurboFan), incluso a mitad del bucle. Las tandas siguientes ya usan
// código máquina optimizado. ✅ Por eso bench() calienta antes de medir.
// Sin despertar la CPU, las pulsaciones siguientes salen más lentas que la primera: no es el
// JIT, es el procesador, que en la primera pulsación «despertó» con la tanda lenta.
```

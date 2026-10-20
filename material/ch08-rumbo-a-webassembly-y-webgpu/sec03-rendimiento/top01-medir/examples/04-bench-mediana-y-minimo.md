---
example_description: "Un ayudante de microbenchmarks honesto: bench(nombre, fn, { runs, warmup }) calienta sin medir, repite y devuelve la mediana, el mínimo y el máximo; la media engaña cuando una ejecución sufre una pausa. Lo usa para comparar un Intl.NumberFormat nuevo por precio con uno reutilizado"
example_tags: "javascript|rendimiento|benchmark|mediana|intl|python"
example_stage: intermediate
example_importance: critical
console: true
loop_protect: false
---

# HTML

```html
<main>
  <h1>Formatear 100 precios</h1>
  <p>¿Cuesta algo crear un <code>Intl.NumberFormat</code> para cada precio? Mídelo con <code>bench</code>.</p>
  <button id="run" type="button">Medir</button>
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

// ── bench: el ayudante de esta lección (los ejemplos siguientes lo copian tal cual) ──
// Ejecuta fn `warmup` veces sin medir (calentamiento, ejemplo 05) y después `runs` veces
// midiendo cada una. Guarda el resultado de fn para que no sea «código muerto» (ejemplo 06).
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

// ¿Por qué la mediana? Siete medidas de una misma función; en la cuarta se coló una pausa
// del recolector de basura (o cualquier otra tarea del navegador).
const samples = [2.1, 2.0, 2.2, 14.8, 2.1, 2.0, 2.1];
const sorted = samples.toSorted((a, b) => a - b);
const mean = samples.reduce((sum, ms) => sum + ms, 0) / samples.length;
console.log(`media ${mean.toFixed(1)} · mediana ${sorted[3].toFixed(1)} · mínimo ${sorted[0].toFixed(1)} · máximo ${sorted[6].toFixed(1)} (ms)`);
console.log('¿alguna ejecución tardó lo que dice la media? →', samples.some((ms) => Math.abs(ms - mean) < 0.05));

// El caso real: 100 precios en pesos mexicanos.
const prices = Array.from({ length: 100 }, (_, i) => 99 + i * 12.5);
const options = { style: 'currency', currency: 'MXN' };
const sharedFormatter = new Intl.NumberFormat('es-MX', options);
const REPEAT = 20; // la versión rápida repite 20 veces: un solo pase duraría menos que un salto del reloj
function formatWithNewFormatter() {
  return prices.map((price) => new Intl.NumberFormat('es-MX', options).format(price));
}
function formatWithSharedFormatter() {
  let texts;
  for (let r = 0; r < REPEAT; r++) texts = prices.map((price) => sharedFormatter.format(price));
  return texts;
}

const runButton = document.querySelector('#run');
const state = document.querySelector('#state');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function perPrice(ms, count) {
  const micros = (ms / count) * 1000;
  return `${micros.toFixed(micros >= 10 ? 0 : 2)} µs por precio`;
}

runButton.addEventListener('click', () => {
  runButton.disabled = true;
  state.textContent = 'midiendo…';
  // Espera al próximo pintado (rAF + setTimeout) para que «midiendo…» se vea antes de
  // bloquear el hilo unos 110 ms en Chrome (lección «Frames de animación y tiempo»).
  requestAnimationFrame(() => setTimeout(() => {
    const fresh = bench('nuevo en cada precio', formatWithNewFormatter, { runs: 9, warmup: 2 });
    const freshTexts = benchSink;
    const shared = bench('uno reutilizado', formatWithSharedFormatter, { runs: 9, warmup: 2 });
    logLine(`¿mismo texto? ${freshTexts.join() === benchSink.join()} · primer precio → ${benchSink[0]}`);
    const freshPerPrice = fresh.median / prices.length;
    const sharedPerPrice = shared.median / (prices.length * REPEAT);
    logLine(`¿reutilizar el formateador es ≥ 5 veces más rápido? ${freshPerPrice >= 5 * sharedPerPrice}`);
    for (const [result, count] of [[fresh, prices.length], [shared, prices.length * REPEAT]]) {
      logLine(`${result.label}: mediana ≈ ${result.median.toFixed(1)} ms (mín ${result.min.toFixed(1)} · máx ${result.max.toFixed(1)}) → ≈ ${perPrice(result.median, count)}`);
    }
    state.textContent = 'Listo: pulsa otra vez para repetir';
    runButton.disabled = false;
  }, 0));
});
console.log('Listo: pulsa «Medir» (unos 110 ms de trabajo)');

// Desde Python: timeit.repeat(stmt, number=…, repeat=…) y min() de los resultados es la misma
// idea: un lote por medida, varias medidas y el mejor caso como referencia estable.
```

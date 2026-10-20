---
example_description: "Medir con la caché caliente: un benchmark que cotiza el envío al mismo código postal 2000 veces solo mide la caché (1 cálculo y 1999 aciertos) y sale decenas de veces más rápido que con los códigos postales de pedidos reales. Los datos del benchmark deben parecerse a los de verdad"
example_tags: "javascript|rendimiento|benchmark|cache|memoizacion|map|bug"
example_stage: common-error
example_importance: important
console: true
loop_protect: false
---

# HTML

```html
<main>
  <h1>Cotizar envíos</h1>
  <p>Cada cotización recorre 4000 tarifas; un <code>Map</code> guarda las ya calculadas.</p>
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

// El ayudante del ejemplo 04, tal cual.
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

// 4000 rangos de códigos postales con su tarifa: cotizar es recorrerlos todos.
const rates = Array.from({ length: 4000 }, (_, i) => ({
  from: 1000 + i * 24, to: 1000 + i * 24 + 23, base: 79 + (i % 13) * 6, perKg: 9 + (i % 5),
}));
function quoteShipping(zip, kilos = 2) {
  let best = null;
  for (const rate of rates) {
    if (zip >= rate.from && zip <= rate.to && (best === null || rate.base < best.base)) best = rate;
  }
  return best === null ? 0 : best.base + best.perKg * kilos;
}
// Memoización: cada código postal se calcula una vez y luego sale del Map.
const quoteCache = new Map();
let computed = 0;
function cachedQuote(zip) {
  if (!quoteCache.has(zip)) {
    computed += 1;
    quoteCache.set(zip, quoteShipping(zip));
  }
  return quoteCache.get(zip);
}

const ORDERS = 2000;
// Códigos postales de 2000 pedidos de muestra: unos se repiten mucho, otros aparecen una vez.
const sampleZips = Array.from({ length: ORDERS }, (_, i) => 1000 + ((i * i * 7 + i * 13) % 2400) * 40);
// Cada ejecución empieza con la caché vacía, como una página recién abierta.
function quoteSameZip() {
  quoteCache.clear();
  computed = 0;
  let total = 0;
  for (let i = 0; i < ORDERS; i++) total += cachedQuote(72000); // 🐛 siempre el mismo
  return total;
}
function quoteSampleOrders() {
  quoteCache.clear();
  computed = 0;
  let total = 0;
  for (let i = 0; i < ORDERS; i++) total += cachedQuote(sampleZips[i]); // ✅ datos realistas
  return total;
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
  requestAnimationFrame(() => setTimeout(() => { // deja pintar «midiendo…» (~25 ms de trabajo)
    const hot = bench('🐛 el mismo código postal', quoteSameZip, { runs: 9 });
    logLine(`🐛 ${ORDERS} cotizaciones del mismo código postal → cálculos: ${computed} · aciertos de caché: ${ORDERS - computed}`);
    const real = bench('✅ pedidos de muestra', quoteSampleOrders, { runs: 9 });
    logLine(`✅ ${ORDERS} pedidos de muestra → cálculos: ${computed} · aciertos de caché: ${ORDERS - computed}`);
    logLine(`¿la medida 🐛 sale ≥ 5 veces más rápida? ${real.median >= 5 * hot.median}`);
    for (const result of [hot, real]) logLine(`${result.label}: mediana ≈ ${result.median.toFixed(2)} ms`);
    state.textContent = 'Listo: pulsa otra vez para repetir';
    runButton.disabled = false;
  }, 0));
});
console.log(`Listo: ${new Set(sampleZips).size} códigos postales distintos en los ${ORDERS} pedidos de muestra; pulsa «Medir»`);

// La medida 🐛 no es falsa: mide lo rápida que es la caché. Pero tus usuarios no piden
// siempre lo mismo. Lo mismo pasa con otras cachés: la del navegador (la segunda carga de
// un archivo no va a la red), la de la CPU (datos recién leídos) y la del propio JIT.
```

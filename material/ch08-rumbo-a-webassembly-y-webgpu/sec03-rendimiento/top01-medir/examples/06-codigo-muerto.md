---
example_description: "Eliminación de código muerto: un benchmark que calcula distancias y tira el resultado puede salir decenas de veces más rápido que el que lo usa, porque el compilador optimizador de V8 borra los cálculos cuyo resultado nadie lee. Hay que consumir el resultado (sumarlo, devolverlo o mostrarlo)"
example_tags: "javascript|rendimiento|jit|v8|codigo-muerto|benchmark|bug"
example_stage: common-error
example_importance: important
console: true
loop_protect: false
---

# HTML

```html
<main>
  <h1>Distancias de reparto</h1>
  <p>Distancia en línea recta (fórmula del haversine) desde la tienda del Zócalo a 100 000 direcciones.</p>
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

const ADDRESSES = 100_000;
const latitudes = new Float64Array(ADDRESSES);
const longitudes = new Float64Array(ADDRESSES);
for (let i = 0; i < ADDRESSES; i++) {
  latitudes[i] = 19.3 + ((i * 7919) % 1000) / 4000;    // Ciudad de México, sin azar
  longitudes[i] = -99.25 + ((i * 104729) % 1000) / 4000;
}
const SHOP = { lat: 19.4326, lon: -99.1332 };
const RAD = Math.PI / 180;
function distanceKm(lat1, lon1, lat2, lon2) {
  const sinLat = Math.sin(((lat2 - lat1) * RAD) / 2);
  const sinLon = Math.sin(((lon2 - lon1) * RAD) / 2);
  const a = sinLat * sinLat + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * sinLon * sinLon;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 🐛 El resultado no se usa: para el compilador, todo ese cálculo no sirve para nada.
function distancesUnused() {
  for (let i = 0; i < ADDRESSES; i++) {
    distanceKm(SHOP.lat, SHOP.lon, latitudes[i], longitudes[i]);
  }
}
// ✅ El resultado se suma y se devuelve: el cálculo tiene que hacerse de verdad.
function distancesUsed() {
  let total = 0;
  for (let i = 0; i < ADDRESSES; i++) {
    total += distanceKm(SHOP.lat, SHOP.lon, latitudes[i], longitudes[i]);
  }
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
  requestAnimationFrame(() => setTimeout(() => { // deja pintar «midiendo…» (~130 ms de trabajo en Chrome)
    const unused = bench('🐛 resultado sin usar', distancesUnused, { runs: 5, warmup: 2 });
    const used = bench('✅ resultado sumado', distancesUsed, { runs: 5, warmup: 2 });
    logLine(`✅ distancia total → ${benchSink.toFixed(1)} km`);
    logLine(`¿la versión 🐛 es ≥ 5 veces más rápida, con «el mismo» trabajo? ${used.median >= 5 * unused.median}`);
    for (const result of [unused, used]) logLine(`${result.label}: mediana ≈ ${result.median.toFixed(2)} ms`);
    state.textContent = 'Listo: pulsa otra vez para repetir';
    runButton.disabled = false;
  }, 0));
});
console.log('Listo: pulsa «Medir»');

// Lo que ocurre: TurboFan, el compilador que optimiza las funciones calientes, ve que
// Math.sin, Math.cos y la aritmética no tienen efectos y que nadie lee su resultado, y
// los borra. Queda un bucle casi vacío. Si una versión «optimizada» sale sospechosamente
// rápida, comprueba que su resultado se usa: súmalo, devuélvelo o enséñalo.
// Que ocurra o no depende del motor y de su versión: no lo des por hecho, mídelo.
```

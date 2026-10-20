---
example_description: "Un pool que recibe búferes y los devuelve: las lecturas de 24 estaciones meteorológicas, cada una en su Float32Array, se transfieren a varios workers (la página se queda con 0 de 24), cada worker resume las suyas y devuelve el búfer transferido; los resultados se ordenan por estación, no por llegada"
example_tags: "javascript|workers|pool|transferibles|float32array|estadistica|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Estaciones meteorológicas</h1>
  <p>Lecturas de temperatura cada 5 minutos, resumidas en paralelo.</p>
  <button id="big" type="button">Analizar 24 × 250 000 lecturas</button>
  <div class="table-wrap" tabindex="0" role="region" aria-labelledby="caption">
    <table>
      <caption id="caption">Resumen por estación (°C)</caption>
      <thead><tr><th scope="col">Estación</th><th scope="col">Mín.</th><th scope="col">Máx.</th><th scope="col">Media</th><th scope="col">≥ 30 °C</th></tr></thead>
      <tbody id="rows"></tbody>
    </table>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
button { font: inherit; padding: 0.35rem 0.8rem; }
:is(button, .table-wrap):focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.table-wrap { max-block-size: 12rem; overflow: auto; margin-block-start: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.4rem; }
table { inline-size: 100%; border-collapse: collapse; font-size: 0.85rem; font-variant-numeric: tabular-nums; }
caption { text-align: start; font-weight: 600; padding: 0.3rem 0.5rem; }
th, td { padding: 0.2rem 0.5rem; text-align: end; border-block-start: 1px solid #e2e8f0; }
th:first-child, td:first-child { text-align: start; }
.log { padding-inline-start: 1.25rem; font-size: 0.85rem; }
```

# JavaScript

```javascript
// El worker es 05-stats/stats-worker.js («Assets»).
const $ = (selector) => document.querySelector(selector);
const fmt = (n) => n.toLocaleString('es-MX');
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Lecturas inventadas pero reproducibles: un ciclo de día y noche más ruido con semilla.
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeStation(station, count) {
  const random = mulberry32(1000 + station);
  const readings = new Float32Array(count);
  const base = 14 + ((station * 7) % 15); // cada estación, su clima
  for (let i = 0; i < count; i++) readings[i] = base + 6 * Math.sin(2 * Math.PI * ((i % 288) / 288 - 0.25)) + (random() - 0.5) * 3;
  return readings;
}

const poolSize = Math.min(4, navigator.hardwareConcurrency || 2);
const workers = Array.from({ length: poolSize }, () => new Worker('05-stats/stats-worker.js', { type: 'module' }));
addEventListener('pagehide', () => workers.forEach((worker) => worker.terminate()));

// Todas las estaciones salen a la vez (repartidas en turno) y vuelven en cualquier orden.
function analyze(stations) {
  return new Promise((resolve) => {
    const results = new Array(stations.length);
    let finished = 0;
    for (const worker of workers) {
      worker.onmessage = (event) => {
        const { station, readings, ...summary } = event.data;
        stations[station - 1] = readings;          // el búfer vuelve a la página
        results[station - 1] = { station, ...summary }; // y el resumen, a SU sitio
        finished += 1;
        if (finished === stations.length) resolve(results);
      };
    }
    stations.forEach((readings, index) => {
      workers[index % workers.length].postMessage({ station: index + 1, readings }, [readings.buffer]);
    });
    report(`📤 enviadas: a la página le quedan ${stations.filter((readings) => readings.byteLength > 0).length} de ${stations.length} búferes con datos`);
  });
}

function show(results, stations) {
  const back = stations.filter((readings) => readings.byteLength > 0).length;
  report(`🔙 de vuelta: ${back} de ${stations.length} búferes, con sus ${fmt(stations[0].length)} lecturas`);
  const byMean = results.toSorted((a, b) => b.mean - a.mean);
  const [warmest, coldest] = [byMean[0], byMean.at(-1)];
  report(`🌡️ la más cálida: estación ${warmest.station} (media ${warmest.mean.toFixed(1)} °C, ${fmt(warmest.hot)} lecturas ≥ 30 °C) · la más fría: estación ${coldest.station} (media ${coldest.mean.toFixed(1)} °C)`);
  $('#rows').replaceChildren(...results.map(({ station, min, max, mean, deviation, hot }) => {
    const row = document.createElement('tr');
    for (const text of [`Estación ${station}`, min.toFixed(1), max.toFixed(1), `${mean.toFixed(1)} ± ${deviation.toFixed(1)}`, fmt(hot)]) {
      row.append(Object.assign(document.createElement('td'), { textContent: text }));
    }
    return row;
  }));
}

async function run(count, { timed = false } = {}) {
  const stations = Array.from({ length: 24 }, (_, index) => makeStation(index + 1, count));
  report(`📦 24 estaciones × ${fmt(count)} lecturas: 24 búferes de ${fmt(count * 4)} bytes`);
  const start = performance.now();
  const results = await analyze(stations);
  if (timed) report(`⏱️ resumidas en ${(performance.now() - start).toFixed(0)} ms`);
  show(results, stations);
}

$('#big').addEventListener('click', async () => {
  $('#big').disabled = true;
  await run(250_000, { timed: true }); // 24 MB: generarlos en la página tarda unas décimas
  $('#big').disabled = false;
});

await run(10_000);
report('Listo: pulsa «Analizar 24 × 250 000 lecturas»');
```

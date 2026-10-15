---
example_description: "Un banco de pruebas reutilizable: cada batería compara variantes de una misma tarea (quitar duplicados, dar formato a fechas, construir un CSV), comprueba que todas dan el mismo resultado, despierta la CPU, mide en rondas intercaladas con calentamiento y presenta mediana, mínimo, máximo y la relación con la más rápida en una tabla accesible y en Markdown para pegar en un informe"
example_tags: "javascript|rendimiento|benchmark|mediana|tablas|profesional"
example_stage: professional
example_importance: important
console: true
loop_protect: false
---

# HTML

```html
<main class="bench">
  <h1>Banco de pruebas</h1>
  <form id="bench-form" class="controls">
    <fieldset>
      <legend>Batería</legend>
      <label><input type="radio" name="suite" value="dedupe" checked> Quitar duplicados de 2000 SKU</label>
      <label><input type="radio" name="suite" value="dates"> Dar formato a 80 fechas</label>
      <label><input type="radio" name="suite" value="csv"> Construir un CSV de 5000 filas</label>
    </fieldset>
    <button id="run" type="button">Ejecutar</button>
    <output id="state" for="run" role="status">Elige una batería y pulsa «Ejecutar»</output>
  </form>
  <table id="results" class="results" hidden>
    <caption id="results-caption"></caption>
    <thead>
      <tr><th scope="col">Variante</th><th scope="col">Mediana</th><th scope="col">Mín</th><th scope="col">Máx</th><th scope="col">Relación</th></tr>
    </thead>
    <tbody id="result-rows"></tbody>
  </table>
  <details id="markdown-box" hidden>
    <summary>Resultados en Markdown</summary>
    <pre id="markdown"></pre>
  </details>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --accent: #1d4ed8; --paper: #ffffff; --page: #f8fafc; }
body { margin: 0; font-family: system-ui, sans-serif; color: var(--ink); background: var(--page); }
.bench { max-width: 40rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.25rem; margin-top: 0; }
.controls { display: flex; flex-wrap: wrap; align-items: end; gap: 0.75rem 1rem; }
fieldset { display: grid; gap: 0.25rem; margin: 0; padding: 0.5rem 0.75rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--paper); }
legend { font-weight: 600; }
button { font: inherit; padding: 0.4rem 0.9rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--paper); color: var(--ink); cursor: pointer; }
button:disabled { cursor: progress; }
button:focus-visible, input:focus-visible, summary:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
output { color: var(--muted); }
.results { inline-size: 100%; margin-top: 1rem; border-collapse: collapse; background: var(--paper); font-variant-numeric: tabular-nums; }
.results[hidden], #markdown-box[hidden] { display: none; }
caption { text-align: start; font-weight: 600; padding-block: 0.4rem; }
th, td { padding: 0.3rem 0.5rem; border-block-end: 1px solid var(--line); text-align: end; }
th:first-child, td:first-child { text-align: start; }
.ratio { display: flex; align-items: center; justify-content: end; gap: 0.4rem; }
.ratio span { display: inline-block; block-size: 0.5rem; background: var(--accent); border-radius: 2px; }
pre { overflow-x: auto; padding: 0.5rem; background: var(--paper); border: 1px solid var(--line); border-radius: 0.4rem; font-size: 0.8rem; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--paper); font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
@media (max-width: 30rem) { th:nth-child(3), td:nth-child(3), th:nth-child(4), td:nth-child(4) { display: none; } }
```

# JavaScript

```javascript
// BANCO DE PRUEBAS
// - Cada batería define sus variantes y sus datos; el banco no sabe nada de ellas.
// - Antes de medir se comprueba que todas las variantes devuelven lo mismo: comparar código
//   que hace cosas distintas no sirve de nada.
// - Se despierta la CPU (100 ms) y se mide en RONDAS INTERCALADAS, con 2 rondas de
//   calentamiento: el estado del procesador y del JIT afecta a todas por igual.
// - Se informa la mediana (la media se la lleva una pausa), el mínimo y el máximo.
// - Solo se nombra un ganador con un margen de 5 veces o más: por debajo, es ruido.
// - Un clic gasta como mucho unos 300 ms de CPU (loop_protect: false porque la guarda de
//   bucles de LearnWeb falsearía las medidas; todos los bucles terminan).

const SKUS = Array.from({ length: 2000 }, (_, i) => `SKU-${(i * 7919) % 1000}`); // la mitad, repetidos
const DATES = Array.from({ length: 80 }, (_, i) => new Date(Date.UTC(2026, 0, 1 + i, 15)));
const ORDERS = Array.from({ length: 5000 }, (_, i) => ({ id: 40000 + i, city: ['Puebla', 'Mérida', 'Oaxaca'][i % 3], total: ((i * 37) % 5000) / 10 }));
const DATE_OPTIONS = { dateStyle: 'medium', timeZone: 'America/Mexico_City' };
const sharedDateFormat = new Intl.DateTimeFormat('es-MX', DATE_OPTIONS);

const SUITES = {
  dedupe: {
    title: 'Quitar duplicados de 2000 SKU',
    variants: {
      'filter + indexOf': () => SKUS.filter((sku, i) => SKUS.indexOf(sku) === i),
      'new Set': () => [...new Set(SKUS)],
    },
  },
  dates: {
    title: 'Dar formato a 80 fechas',
    variants: {
      'toLocaleDateString': () => DATES.map((date) => date.toLocaleDateString('es-MX', DATE_OPTIONS)),
      'un DateTimeFormat': () => DATES.map((date) => sharedDateFormat.format(date)),
    },
  },
  csv: {
    title: 'Construir un CSV de 5000 filas',
    variants: {
      '+= en un bucle': () => {
        let csv = 'id,ciudad,total\n';
        for (const order of ORDERS) csv += `${order.id},${order.city},${order.total.toFixed(2)}\n`;
        return csv;
      },
      'push + join': () => {
        const lines = ['id,ciudad,total'];
        for (const order of ORDERS) lines.push(`${order.id},${order.city},${order.total.toFixed(2)}`);
        return `${lines.join('\n')}\n`;
      },
    },
  },
};

// ── El motor del banco: reutilizable con cualquier batería ──
let benchSink; // los resultados se guardan: nada de código muerto
function wakeCpu(ms) {
  const end = performance.now() + ms;
  let mix = 0;
  while (performance.now() < end) for (let k = 0; k < 1000; k++) mix = (mix * 31 + k) | 0;
  return mix;
}
function sameResults(variants) {
  const outputs = Object.values(variants).map((run) => JSON.stringify(run()));
  return outputs.every((output) => output === outputs[0]);
}
function runInterleaved(variants, { rounds = 9, warmupRounds = 2 } = {}) {
  const names = Object.keys(variants);
  const times = new Map(names.map((name) => [name, []]));
  for (let round = -warmupRounds; round < rounds; round++) {
    for (const name of names) {
      const start = performance.now();
      benchSink = variants[name]();
      if (round >= 0) times.get(name).push(performance.now() - start);
    }
  }
  const results = names.map((name) => {
    const sorted = times.get(name).toSorted((a, b) => a - b);
    return { name, median: sorted[Math.floor(sorted.length / 2)], min: sorted[0], max: sorted.at(-1) };
  });
  const fastest = Math.max(Math.min(...results.map((result) => result.median)), 0.01); // el reloj no baja de 0,1 ms
  for (const result of results) result.ratio = result.median / fastest;
  return results;
}
const formatMs = (ms) => `${ms.toFixed(ms < 10 ? 2 : 1)} ms`;

// ── La interfaz ──
const form = document.querySelector('#bench-form');
const runButton = document.querySelector('#run');
const state = document.querySelector('#state');
const table = document.querySelector('#results');
const resultRows = document.querySelector('#result-rows');
const markdownBox = document.querySelector('#markdown-box');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function showResults(suite, results) {
  document.querySelector('#results-caption').textContent = suite.title;
  resultRows.replaceChildren(...results.map((result) => {
    const row = document.createElement('tr');
    const ratioCell = document.createElement('td');
    const ratio = Object.assign(document.createElement('div'), { className: 'ratio' });
    const bar = document.createElement('span');
    bar.style.inlineSize = `${Math.min(6, 6 * (1 / result.ratio))}rem`;
    bar.setAttribute('aria-hidden', 'true');
    ratio.append(bar, `×${result.ratio.toFixed(1)}`);
    ratioCell.append(ratio);
    const header = Object.assign(document.createElement('th'), { scope: 'row', textContent: result.name });
    row.append(header, ...[result.median, result.min, result.max].map((ms) => Object.assign(document.createElement('td'), { textContent: formatMs(ms) })), ratioCell);
    return row;
  }));
  table.hidden = false;
  document.querySelector('#markdown').textContent = [
    `| ${suite.title} | mediana | mín | máx | relación |`,
    '|---|---:|---:|---:|---:|',
    ...results.map((result) => `| ${result.name} | ${formatMs(result.median)} | ${formatMs(result.min)} | ${formatMs(result.max)} | ×${result.ratio.toFixed(1)} |`),
  ].join('\n');
  markdownBox.hidden = false;
}

// Un clic, no un submit: en las tarjetas aisladas (sin allow-forms) los formularios no se envían.
runButton.addEventListener('click', () => {
  const suite = SUITES[new FormData(form).get('suite')];
  runButton.disabled = true;
  state.textContent = 'midiendo…';
  requestAnimationFrame(() => setTimeout(() => { // deja pintar «midiendo…»
    const same = sameResults(suite.variants);
    wakeCpu(100);
    const results = runInterleaved(suite.variants);
    const ranked = results.toSorted((a, b) => a.median - b.median);
    const margin = ranked[1].median / Math.max(ranked[0].median, 0.01);
    logLine(`${suite.title} · ¿mismo resultado en todas las variantes? ${same}`);
    logLine(margin >= 5 ? `ganadora con margen (≥ 5×): ${ranked[0].name}` : 'sin ganadora clara: menos de 5× de diferencia');
    logLine(results.map((result) => `${result.name}: ≈ ${formatMs(result.median)}`).join(' · '));
    showResults(suite, results);
    state.textContent = `Listo: ${suite.title}`;
    runButton.disabled = false;
  }, 0));
});
console.log('Listo: elige una batería y pulsa «Ejecutar» (cada una, como mucho unos 300 ms)');
```

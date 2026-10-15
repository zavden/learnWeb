---
example_description: "La API User Timing: performance.mark() pone una marca con nombre en el reloj de la página y performance.measure() mide de una marca a otra, con datos propios en detail. Las medidas salen en el panel Performance de DevTools y se borran con clearMarks/clearMeasures"
example_tags: "javascript|rendimiento|performance-mark|performance-measure|user-timing|devtools"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Importar el catálogo</h1>
  <p>2000 discos llegan como JSON; la tienda muestra los 12 primeros con existencias.</p>
  <button id="import" type="button">Importar otra vez</button>
  <table>
    <caption>Medidas de la última importación</caption>
    <tbody id="timings"></tbody>
  </table>
  <ul id="records" class="records"></ul>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
table { margin-top: 0.75rem; border-collapse: collapse; font-variant-numeric: tabular-nums; }
caption { text-align: start; font-weight: 600; padding-block: 0.25rem; }
th, td { border: 1px solid #cbd5e1; padding: 0.25rem 0.5rem; text-align: start; }
.records { columns: 2; font-size: 0.85rem; padding-inline-start: 1.2rem; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const recordList = document.querySelector('#records');
const timingRows = document.querySelector('#timings');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// El catálogo llega como texto JSON, como si viniera de un fetch (capítulo 6).
const genres = ['son jarocho', 'bolero', 'cumbia', 'jazz', 'rock', 'trova'];
const catalogJson = JSON.stringify(Array.from({ length: 2000 }, (_, i) => ({
  sku: `LP-${1000 + i}`,
  title: `${genres[i % genres.length]}, vol. ${Math.floor(i / genres.length) + 1}`,
  price: 349 + (i % 9) * 50,
  stock: (i * 7) % 5, // de 0 a 4 copias
})));

const MARKS = ['catalogo:inicio', 'catalogo:parseado', 'catalogo:pintado'];
const MEASURES = ['catalogo:parsear', 'catalogo:construir-lista'];

function importCatalog() {
  performance.mark('catalogo:inicio');
  const records = JSON.parse(catalogJson);
  performance.mark('catalogo:parseado');
  const inStock = records.filter((record) => record.stock > 0).slice(0, 12);
  recordList.replaceChildren(...inStock.map((record) =>
    Object.assign(document.createElement('li'), { textContent: `${record.title} · $${record.price}` })));
  performance.mark('catalogo:pintado');
  // Una medida va de una marca a otra; `detail` guarda tus propios datos junto a ella.
  performance.measure('catalogo:parsear', { start: 'catalogo:inicio', end: 'catalogo:parseado', detail: { discos: records.length } });
  performance.measure('catalogo:construir-lista', 'catalogo:parseado', 'catalogo:pintado');
  return inStock.length;
}

// Lee las medidas por su nombre, enséñalas en la tabla y bórralas: el búfer no crece.
function collectTimings() {
  const lines = MEASURES.map((measureName) => {
    const [entry] = performance.getEntriesByName(measureName);
    return `${measureName}: ≈ ${entry.duration.toFixed(1)} ms`;
  });
  timingRows.replaceChildren(...lines.map((line) => {
    const row = document.createElement('tr');
    row.append(Object.assign(document.createElement('td'), { textContent: line }));
    return row;
  }));
  for (const markName of MARKS) performance.clearMarks(markName);
  for (const measureName of MEASURES) performance.clearMeasures(measureName);
  return lines;
}

const shown = importCatalog();
const ourMarks = performance.getEntriesByType('mark').filter((mark) => mark.name.startsWith('catalogo:'));
console.log('marcas →', ourMarks.map((mark) => mark.name).join(', '));
const [parse] = performance.getEntriesByName('catalogo:parsear');
console.log(`catalogo:parsear → entryType: ${parse.entryType} · detail: ${JSON.stringify(parse.detail)}`);
console.log("getEntriesByName('catalogo:parsear') →", performance.getEntriesByName('catalogo:parsear').length, 'entrada');
// startTime cuenta desde performance.timeOrigin, el instante en que empezó a cargar la página.
const absolute = performance.timeOrigin + ourMarks[0].startTime;
console.log('¿la marca está en el reloj de la página? timeOrigin + startTime ≈ Date.now() →', Math.abs(absolute - Date.now()) < 1000);
console.log('discos con existencias mostrados →', shown);
collectTimings(); // los tiempos de la carga van a la tabla, no a la consola
console.log('marcas del catálogo tras clearMarks →', performance.getEntriesByType('mark').filter((mark) => mark.name.startsWith('catalogo:')).length);
console.log('Listo: abre el ejemplo con ↗, graba en DevTools › Performance y pulsa «Importar otra vez»');

let imports = 1;
document.querySelector('#import').addEventListener('click', () => {
  imports += 1;
  const count = importCatalog();
  const saved = performance.getEntriesByType('measure').filter((entry) => entry.name.startsWith('catalogo:')).length;
  logLine(`importación ${imports} · discos mostrados → ${count} · medidas guardadas → ${saved}`);
  logLine(`importación ${imports} · ${collectTimings().join(' · ')}`);
});
// En la grabación de DevTools, las medidas aparecen como barras con su nombre en la
// pista «Timings», encima de la actividad del hilo principal («Main»).
```

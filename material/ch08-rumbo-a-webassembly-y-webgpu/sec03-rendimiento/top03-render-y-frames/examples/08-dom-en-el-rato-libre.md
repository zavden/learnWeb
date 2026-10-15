---
example_description: "Tocar el DOM dentro de requestIdleCallback rompe su promesa: el callback mira timeRemaining() para no pasarse, pero añadir 2000 filas a una tabla y leer su altura obliga a un layout que nadie había contado, y el rato libre se pasa de su plazo. El trabajo puro va en el rato libre; el DOM, en requestAnimationFrame"
example_tags: "javascript|rendimiento|requestidlecallback|requestanimationframe|layout|dom|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Índice de recetas</h1>
  <p>2000 recetas se indexan en los ratos libres y se listan en la tabla, que baja sola hasta la última.</p>
  <p>
    <button id="run" type="button">Indexar con 🐛 y con ✅</button>
    <output id="state" for="run">Sin indexar todavía</output>
  </p>
  <div id="viewport" class="viewport" tabindex="0" role="region" aria-label="Recetas indexadas">
    <table>
      <thead><tr><th scope="col">Receta</th><th scope="col">Región</th><th scope="col">Clave</th></tr></thead>
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
h1 { font-size: 1.2rem; margin-top: 0; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:disabled { cursor: progress; }
button:focus-visible, .viewport:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
output { margin-inline-start: 0.5rem; color: #475569; }
.viewport { block-size: 10rem; overflow: auto; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; }
table { inline-size: 100%; border-collapse: collapse; font-size: 0.8rem; }
th, td { padding: 0.15rem 0.4rem; text-align: start; border-block-end: 1px solid #e2e8f0; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const RECIPES = 2000;
const viewport = document.querySelector('#viewport');
const rowsBody = document.querySelector('#rows');
const runButton = document.querySelector('#run');
const state = document.querySelector('#state');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

const dishes = ['mole', 'pozole', 'chiles en nogada', 'cochinita pibil', 'tamales', 'enchiladas', 'sopa de lima', 'tlayudas'];
const regions = ['Puebla', 'Jalisco', 'Yucatán', 'Oaxaca', 'Veracruz', 'Michoacán'];
// Indexar una receta: trabajo puro (sin DOM), unas decenas de microsegundos.
function indexRecipe(i) {
  const title = `${dishes[i % dishes.length]} n.º ${i + 1}`;
  let hash = 0;
  for (let k = 0; k < 4000; k++) hash = (hash * 31 + title.charCodeAt(k % title.length)) | 0;
  return { title, region: regions[i % regions.length], key: (hash >>> 0).toString(16).padStart(8, '0') };
}
function makeRow(recipe) {
  const row = document.createElement('tr');
  for (const text of [recipe.title, recipe.region, recipe.key]) row.append(Object.assign(document.createElement('td'), { textContent: text }));
  return row;
}

function indexWhenIdle(kind) {
  return new Promise((resolve) => {
    let next = 0;
    const stats = { rounds: 0, overruns: 0, worst: 0 };
    function work(deadline) {
      stats.rounds += 1;
      const deadlineAt = performance.now() + deadline.timeRemaining(); // el plazo que nos dan
      const batch = [];
      while (next < RECIPES && deadline.timeRemaining() > 1) batch.push(indexRecipe(next++));
      if (kind === '🐛') {
        rowsBody.append(...batch.map(makeRow));     // 🐛 escribe el DOM en el rato libre…
        viewport.scrollTop = viewport.scrollHeight; // 🐛 …y lee una medida: layout AHORA, sin contar con él
      } else {
        requestAnimationFrame(() => {               // ✅ el DOM, en el frame, donde toca
          rowsBody.append(...batch.map(makeRow));
          viewport.scrollTop = viewport.scrollHeight;
        });
      }
      const late = performance.now() - deadlineAt;
      if (late > 1) stats.overruns += 1;
      stats.worst = Math.max(stats.worst, late);
      if (next < RECIPES) requestIdleCallback(work);
      else requestAnimationFrame(() => resolve(stats)); // tras la última escritura del DOM
    }
    requestIdleCallback(work);
  });
}

runButton.addEventListener('click', async () => {
  runButton.disabled = true;
  const results = {};
  for (const kind of ['🐛', '✅']) {
    state.textContent = `indexando ${kind}…`;
    rowsBody.replaceChildren();
    results[kind] = await indexWhenIdle(kind);
    results[kind].rows = rowsBody.children.length;
  }
  logLine(`🐛 filas en la tabla: ${results['🐛'].rows} · ¿algún rato libre se pasó de su plazo (más de 1 ms)? ${results['🐛'].overruns > 0}`);
  logLine(`✅ filas en la tabla: ${results['✅'].rows} · ratos libres que se pasaron de su plazo: ${results['✅'].overruns}`);
  for (const [kind, stats] of Object.entries(results)) {
    logLine(`${kind} ratos libres: ≈ ${stats.rounds} · el peor se pasó ≈ ${Math.max(0, stats.worst).toFixed(1)} ms`);
  }
  state.textContent = 'Listo: pulsa otra vez para repetir';
  runButton.disabled = false;
});
console.log('Listo: pulsa «Indexar con 🐛 y con ✅»');

// El navegador da un rato libre cuando ya ha pintado el frame y no tiene nada urgente.
// timeRemaining() solo cuenta TU código: el estilo y el layout que provoca tocar el DOM
// no están en la cuenta. Si además lees una medida, los pagas dentro del rato libre.
```

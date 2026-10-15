---
example_description: "El presupuesto de un frame: 1000 ms entre los hercios de la pantalla (16,7 ms a 60 Hz, 8,3 ms a 120 Hz). El botón mide tu pantalla con 60 callbacks de requestAnimationFrame y la mediana de sus intervalos, sin animar nada"
example_tags: "javascript|rendimiento|frames|requestanimationframe|presupuesto|hz"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>¿Cuánto dura un frame?</h1>
  <table>
    <caption>Presupuesto por frecuencia de pantalla</caption>
    <thead><tr><th scope="col">Pantalla</th><th scope="col">Un frame</th></tr></thead>
    <tbody id="budgets"></tbody>
  </table>
  <p>
    <button id="run" type="button">Medir mi pantalla</button>
    <output id="state" for="run">Sin medir todavía</output>
  </p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
table { border-collapse: collapse; font-variant-numeric: tabular-nums; }
caption { text-align: start; font-weight: 600; padding-block: 0.25rem; }
th, td { border: 1px solid #cbd5e1; padding: 0.25rem 0.6rem; text-align: start; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:disabled { cursor: progress; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
output { margin-inline-start: 0.5rem; color: #475569; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const budgetRows = document.querySelector('#budgets');
const runButton = document.querySelector('#run');
const state = document.querySelector('#state');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// El presupuesto: el tiempo entre dos refrescos de la pantalla. En ese tiempo el navegador
// ejecuta tu JavaScript, recalcula estilos, hace layout, pinta y compone.
for (const hz of [60, 90, 120, 144]) {
  const ms = (1000 / hz).toFixed(1);
  console.log(`${hz} Hz → ${ms} ms por frame`);
  const row = document.createElement('tr');
  row.append(Object.assign(document.createElement('td'), { textContent: `${hz} Hz` }),
    Object.assign(document.createElement('td'), { textContent: `${ms} ms` }));
  budgetRows.append(row);
}

// Medir: 61 callbacks seguidos de rAF dan 60 intervalos. No se mueve nada en pantalla.
function measureDisplay() {
  return new Promise((resolve, reject) => {
    const stamps = [];
    function onFrame(now) {
      if (document.hidden) return reject(new Error('la pestaña se ocultó'));
      stamps.push(now);
      if (stamps.length < 61) requestAnimationFrame(onFrame);
      else resolve(stamps.slice(1).map((stamp, i) => stamp - stamps[i]));
    }
    requestAnimationFrame(onFrame);
  });
}

runButton.addEventListener('click', async () => {
  runButton.disabled = true;
  state.textContent = 'midiendo…';
  try {
    const intervals = await measureDisplay();
    const median = intervals.toSorted((a, b) => a - b)[30];
    const slow = intervals.filter((ms) => ms > median * 1.5).length;
    logLine(`intervalos medidos: ${intervals.length}`);
    logLine(`tu pantalla: ≈ ${median.toFixed(1)} ms entre frames → ≈ ${Math.round(1000 / median)} Hz · frames que llegaron tarde: ${slow}`);
    state.textContent = 'Listo';
  } catch (error) {
    logLine(`medida cancelada: ${error.message}`);
    state.textContent = 'Cancelada';
  }
  runButton.disabled = false;
});
console.log('Listo: pulsa «Medir mi pantalla» (tarda un segundo y no anima nada)');

// Del presupuesto, tu JavaScript no puede gastarlo entero: el navegador necesita su parte
// para estilos, layout, pintado y composición. Una guía habitual: ~10 ms a 60 Hz.
```

---
example_description: "Un listener de window que nadie quita mantiene vivo su closure, y con él todo lo que capturó: al cerrar la tarjeta de un informe, sus 5 MB de ventas siguen en memoria, porque otra función creada en la misma llamada usaba ese array y V8 guarda las variables capturadas en un contexto compartido. Un AbortController por tarjeta y no capturar los datos grandes lo arreglan"
example_tags: "javascript|memoria|closures|fugas|listeners|abortcontroller|v8|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Informes de ventas</h1>
  <p>Cada informe carga 5 MB de ventas por minuto, calcula un resumen y se ajusta al ancho de la ventana.</p>
  <p class="actions">
    <button id="open-buggy" type="button">Abrir informe 🐛</button>
    <button id="open-fixed" type="button">Abrir informe ✅</button>
    <button id="clean" type="button">Limpiar</button>
  </p>
  <div id="cards" class="cards"></div>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
h2 { font-size: 1rem; margin: 0 0 0.25rem; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { font: inherit; padding: 0.3rem 0.7rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:disabled { cursor: not-allowed; color: #64748b; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.cards { display: grid; gap: 0.5rem; }
.card { padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; }
.card p { margin: 0.25rem 0; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const MINUTES = 655_360; // 655 360 valores × 8 bytes = 5 MB (Float64Array)
const MAX_LEAKS = 4;     // límite de la demostración: como mucho 20 MB retenidos
const cardList = document.querySelector('#cards');
const openBuggyButton = document.querySelector('#open-buggy');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Nuestro propio registro: cuántas tarjetas hay abiertas y cuántos listeners de resize viven.
const openCards = { '🐛': 0, '✅': 0 };
const resizeListeners = { '🐛': 0, '✅': 0 };
// Cada listener 🐛 vivo mantiene en memoria su array de 5 MB; los ✅ solo guardan el resumen.
const report = (kind) => `tarjetas abiertas: ${openCards[kind]} · listeners de resize vivos: ${resizeListeners[kind]}`
  + ` · ventas en memoria: ${kind === '🐛' ? resizeListeners[kind] * 5 : 0} MB`;
const leakedCleanups = []; // solo para «Limpiar»: la app con la fuga no tendría esto

function loadSales(id) {
  const rows = new Float64Array(MINUTES);
  for (let i = 0; i < MINUTES; i++) rows[i] = 100 + ((i * 7 + id * 131) % 900) / 10;
  return rows;
}
function summarize(rows) {
  let total = 0;
  let best = 0;
  for (let i = 0; i < rows.length; i++) {
    total += rows[i];
    if (rows[i] > best) best = rows[i];
  }
  return { total: Math.round(total), best };
}
function renderCard(id, summary, kind) {
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `<h2>Informe ${id} ${kind}</h2>
    <p>Total: $${summary.total.toLocaleString('es-MX')} · minuto récord: $${summary.best.toFixed(2)}</p>
    <p><button type="button" class="export">Preparar CSV</button> <button type="button" class="close">Cerrar</button></p>`;
  cardList.append(card);
  return card;
}
const fitToWidth = (card) => { card.dataset.width = String(card.clientWidth); }; // aquí iría redibujar el gráfico

let nextId = 1;
// 🐛 Todo en una función: el botón «Preparar CSV» usa `rows`, así que V8 guarda `rows` en el
//    contexto que comparten TODAS las funciones creadas en esta llamada. onResize no usa `rows`,
//    pero comparte ese contexto: mientras window la tenga registrada, `rows` (5 MB) sigue vivo.
function openReportBuggy() {
  const id = nextId++;
  const rows = loadSales(id);
  const summary = summarize(rows);
  const card = renderCard(id, summary, '🐛');
  card.querySelector('.export').addEventListener('click', () => logLine(`🐛 CSV del informe ${id}: ${rows.length} filas`));
  const onResize = () => fitToWidth(card);
  window.addEventListener('resize', onResize);
  resizeListeners['🐛'] += 1;
  leakedCleanups.push(() => window.removeEventListener('resize', onResize));
  card.querySelector('.close').addEventListener('click', () => {
    card.remove(); // 🐛 la tarjeta sale de la página… y el listener de window la sigue apuntando
    openCards['🐛'] -= 1;
    logLine(`🐛 informe ${id} cerrado · ${report('🐛')}`);
  });
  openCards['🐛'] += 1;
  logLine(`🐛 informe ${id} abierto · ${report('🐛')}`);
  openBuggyButton.disabled = resizeListeners['🐛'] >= MAX_LEAKS;
}

// ✅ Los datos grandes no se capturan (se resumen en otra función y se vuelven a cargar solo
//    si hacen falta) y todos los listeners de la tarjeta usan una señal que se aborta al cerrar.
function openReportFixed() {
  const id = nextId++;
  const summary = summarize(loadSales(id)); // el array vive y muere en esta línea
  const card = renderCard(id, summary, '✅');
  const controller = new AbortController();
  const { signal } = controller;
  card.querySelector('.export').addEventListener('click', () => logLine(`✅ CSV del informe ${id}: ${loadSales(id).length} filas`), { signal });
  window.addEventListener('resize', () => fitToWidth(card), { signal });
  resizeListeners['✅'] += 1;
  card.querySelector('.close').addEventListener('click', () => {
    controller.abort(); // quita los tres listeners de una vez, también el de window
    resizeListeners['✅'] -= 1;
    card.remove();
    openCards['✅'] -= 1;
    logLine(`✅ informe ${id} cerrado · ${report('✅')}`);
  }, { signal });
  openCards['✅'] += 1;
  logLine(`✅ informe ${id} abierto · ${report('✅')}`);
}

openBuggyButton.addEventListener('click', openReportBuggy);
document.querySelector('#open-fixed').addEventListener('click', () => {
  if (openCards['✅'] < MAX_LEAKS) openReportFixed();
});
document.querySelector('#clean').addEventListener('click', () => {
  for (const closeButton of cardList.querySelectorAll('.close')) closeButton.click();
  for (const cleanup of leakedCleanups.splice(0)) cleanup();
  resizeListeners['🐛'] = 0;
  openBuggyButton.disabled = false;
  logLine(`🧹 limpio · 🐛 ${report('🐛')} · ✅ ${report('✅')}`);
});
console.log('Listo: abre dos informes 🐛 y ciérralos; después, dos ✅ y ciérralos');

// Para verlo de verdad: ábrelo con ↗, DevTools › Memory › Heap snapshot y filtra por
// «Float64Array»: tras cerrar dos informes 🐛 siguen ahí dos arrays de 5 MB, y en
// «Retainers» aparece el contexto (system / Context) que los une al listener de resize.
```

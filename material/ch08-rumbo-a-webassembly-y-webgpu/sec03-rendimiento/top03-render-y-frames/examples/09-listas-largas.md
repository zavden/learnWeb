---
example_description: "Una lista de 10 000 canciones de tres formas: todas en el DOM, todas con content-visibility: auto (el navegador se salta el layout y el pintado de las que no se ven) y virtualizada (solo existen las filas visibles y unas pocas de margen: 13 de 10 000). El botón compara el primer layout de cada una"
example_tags: "javascript|rendimiento|virtualizacion|content-visibility|listas|scroll|dom"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Biblioteca: 10 000 canciones</h1>
  <div id="viewport" class="viewport" tabindex="0" role="region" aria-label="Canciones, lista virtualizada">
    <ul id="spacer" class="spacer"></ul>
  </div>
  <p class="actions">
    <button id="jump" type="button">Ir a la canción 5000</button>
    <button id="compare" type="button">Comparar las tres formas</button>
  </p>
  <div id="lab" class="lab" aria-hidden="true"></div>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
.viewport { position: relative; overflow-y: auto; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; }
.viewport:focus-visible, button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.spacer { position: relative; margin: 0; padding: 0; list-style: none; }
.song { position: absolute; inset-block-start: 0; inset-inline: 0; block-size: 32px; padding: 0 0.6rem; display: flex; align-items: center; justify-content: space-between; border-block-end: 1px solid #e2e8f0; font-size: 0.85rem; box-sizing: border-box; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:disabled { cursor: progress; }
/* El laboratorio de la comparación: una caja con scroll donde se montan las listas completas. */
.lab { block-size: 6rem; overflow: auto; }
.lab li { block-size: 32px; font-size: 0.85rem; }
.lab .skippable { content-visibility: auto; contain-intrinsic-size: auto 32px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const TOTAL = 10_000;
const ROW = 32;          // alto fijo de cada fila, en px
const VIEWPORT = 288;    // alto de la zona visible (9 filas); una lista real lo mediría
const OVERSCAN = 4;      // filas de margen por arriba y por abajo, para que el scroll no enseñe huecos
const viewport = document.querySelector('#viewport');
const spacer = document.querySelector('#spacer');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const artists = ['Lila Downs', 'Natalia Lafourcade', 'Café Tacvba', 'Chavela Vargas', 'Los Ángeles Azules', 'Julieta Venegas'];
const songTitle = (i) => `Canción ${i + 1} · ${artists[i % artists.length]}`;

// ── Lista virtualizada: el espaciador da la altura total (y la barra de scroll), y solo
//    existen las filas que se ven, colocadas con translate. ──
viewport.style.blockSize = `${VIEWPORT}px`;
spacer.style.blockSize = `${TOTAL * ROW}px`;
function renderVisible() {
  const first = Math.max(0, Math.floor(viewport.scrollTop / ROW) - OVERSCAN);
  const last = Math.min(TOTAL, Math.ceil((viewport.scrollTop + VIEWPORT) / ROW) + OVERSCAN);
  const rows = [];
  for (let i = first; i < last; i++) {
    const row = document.createElement('li');
    row.className = 'song';
    row.style.translate = `0 ${i * ROW}px`;
    row.setAttribute('aria-setsize', String(TOTAL)); // los lectores de pantalla saben el total…
    row.setAttribute('aria-posinset', String(i + 1)); // …y la posición de cada fila
    row.textContent = songTitle(i);
    rows.push(row);
  }
  spacer.replaceChildren(...rows);
  return { first, count: rows.length };
}
// Un render por frame como mucho, aunque lleguen muchos eventos de scroll (ejemplo 10).
let renderPending = false;
viewport.addEventListener('scroll', () => {
  if (renderPending) return;
  renderPending = true;
  requestAnimationFrame(() => { renderPending = false; renderVisible(); });
}, { passive: true });

const initial = renderVisible();
logLine(`filas en el DOM: ${initial.count} de ${TOTAL} · la primera es la ${initial.first + 1}`);
console.log('Listo: pulsa «Ir a la canción 5000» y después «Comparar las tres formas»');

document.querySelector('#jump').addEventListener('click', () => {
  viewport.scrollTop = 4999 * ROW;
  const shown = renderVisible();
  logLine(`filas en el DOM: ${shown.count} de ${TOTAL} · la primera es la ${shown.first + 1}`);
});

// ── La comparación: monta cada lista en el laboratorio y mide hasta su primer layout. ──
const lab = document.querySelector('#lab');
function timeFullList(className) {
  const list = document.createElement('ul');
  for (let i = 0; i < TOTAL; i++) {
    const item = document.createElement('li');
    if (className) item.className = className;
    item.textContent = songTitle(i);
    list.append(item);
  }
  const start = performance.now();
  lab.replaceChildren(list);
  void lab.scrollHeight; // fuerza el layout para poder medirlo
  const ms = performance.now() - start;
  const count = list.children.length;
  lab.replaceChildren();
  return { ms, count };
}
const compareButton = document.querySelector('#compare');
compareButton.addEventListener('click', () => {
  compareButton.disabled = true;
  const plain = timeFullList('');
  const skippable = timeFullList('skippable');
  const start = performance.now();
  const virtual = renderVisible();
  void viewport.scrollHeight;
  const virtualMs = performance.now() - start;
  logLine(`filas en el DOM → todas: ${plain.count} · content-visibility: ${skippable.count} · virtualizada: ${virtual.count}`);
  logLine(`primer layout → todas: ≈ ${plain.ms.toFixed(1)} ms · content-visibility: ≈ ${skippable.ms.toFixed(1)} ms · virtualizada: ≈ ${virtualMs.toFixed(1)} ms`);
  compareButton.disabled = false;
});
```

---
example_description: "Layout thrashing escondido en componentes: cada tarjeta de producto lee su ancho y escribe su alto en su propio fit(), y recorrer 240 obliga a 240 layouts; un pequeño planificador que agrupa todas las lecturas y después todas las escrituras en el siguiente frame deja un solo layout, con el mismo resultado"
example_tags: "javascript|rendimiento|layout-thrashing|reflow|componentes|requestanimationframe|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Catálogo de cerámica</h1>
  <p>Cada tarjeta ajusta su foto a 3:4 de su ancho, que decide el grid.</p>
  <p>
    <button id="run" type="button">Ajustar 240 tarjetas</button>
    <output id="state" for="run">Sin medir todavía</output>
  </p>
  <ol id="log" class="log" aria-live="polite"></ol>
  <div id="grid" class="grid"></div>
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
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(4.5rem, 1fr)); gap: 6px; margin-top: 0.75rem; }
.card { font-size: 0.7rem; }
.photo { block-size: 1rem; border-radius: 4px; background: linear-gradient(135deg, #1d4ed8, #0e7490); }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const CARDS = 240; // bastan para ver el efecto sin congelar la página demasiado tiempo
const grid = document.querySelector('#grid');
const runButton = document.querySelector('#run');
const state = document.querySelector('#state');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Nuestro propio contador: una lectura de medidas con una escritura pendiente obliga al
// navegador a calcular el layout EN ESE MOMENTO (lección «Medidas y layout»).
let layoutPending = false;
let forcedLayouts = 0;

class ProductCard {
  constructor(index) {
    this.element = document.createElement('article');
    this.element.className = 'card';
    this.photo = document.createElement('div');
    this.photo.className = 'photo';
    this.element.append(this.photo, `Pieza ${index + 1}`);
  }
  measure() { // LEER
    if (layoutPending) {
      forcedLayouts += 1;
      layoutPending = false;
    }
    return this.photo.offsetWidth;
  }
  apply(width) { // ESCRIBIR
    this.photo.style.blockSize = `${Math.round(width * 0.75)}px`;
    layoutPending = true;
  }
  // 🐛 Cada tarjeta «se ajusta sola»: lee y escribe. Correcto para una; en un bucle, thrashing.
  fit() {
    this.apply(this.measure());
  }
  // ✅ La misma tarjeta, pero pide su lectura y su escritura al planificador.
  fitLater() {
    frameTasks.read(() => {
      const width = this.measure();
      frameTasks.write(() => this.apply(width));
    });
  }
}

// ✅ Un planificador por fases (la idea de la biblioteca fastdom): en el próximo frame,
//    primero TODAS las lecturas y después TODAS las escrituras, vengan de quien vengan.
const frameTasks = {
  reads: [],
  writes: [],
  scheduled: false,
  read(task) { this.reads.push(task); this.schedule(); },
  write(task) { this.writes.push(task); this.schedule(); },
  schedule() {
    if (this.scheduled) return;
    this.scheduled = true;
    requestAnimationFrame(() => this.flush());
  },
  flush() {
    for (const task of this.reads.splice(0)) task();   // las lecturas encolan escrituras…
    for (const task of this.writes.splice(0)) task();  // …que se ejecutan todas después
    this.scheduled = false; // al final: las escrituras encoladas arriba no piden otro frame
    this.onFlush?.();
  },
};

let cards = [];
function buildCards() {
  cards = Array.from({ length: CARDS }, (_, i) => new ProductCard(i));
  grid.replaceChildren(...cards.map((card) => card.element));
  layoutPending = true; // se acaban de insertar
}
const heights = () => cards.map((card) => card.photo.style.blockSize).join();

runButton.addEventListener('click', () => {
  runButton.disabled = true;
  state.textContent = 'midiendo…';
  buildCards();
  // 🐛 Cada tarjeta, una detrás de otra.
  forcedLayouts = 0;
  let start = performance.now();
  for (const card of cards) card.fit();
  const buggyMs = performance.now() - start;
  const buggyLayouts = forcedLayouts;
  const buggyHeights = heights();
  // ✅ Se deshace y se repite con el planificador.
  for (const card of cards) card.photo.style.blockSize = '';
  layoutPending = true;
  forcedLayouts = 0;
  frameTasks.onFlush = () => {
    const fixedMs = performance.now() - start;
    logLine(`tarjetas ajustadas: ${CARDS} · lecturas que forzaron un layout: 🐛 ${buggyLayouts} · ✅ ${forcedLayouts}`);
    logLine(`¿el mismo resultado final? ${heights() === buggyHeights}`);
    logLine(`¿por fases es ≥ 5 veces más rápido? ${buggyMs >= 5 * fixedMs}`);
    logLine(`🐛 fit() en un bucle: ≈ ${buggyMs.toFixed(1)} ms · ✅ por fases: ≈ ${fixedMs.toFixed(1)} ms`);
    state.textContent = 'Listo: pulsa otra vez para repetir';
    runButton.disabled = false;
  };
  for (const card of cards) card.fitLater();
  frameTasks.reads.unshift(() => { start = performance.now(); }); // cronometra solo el flush
});
console.log('Listo: pulsa «Ajustar 240 tarjetas»');

// En DevTools › Performance (con ↗), la versión 🐛 es una fila de barras moradas «Layout»
// con el aviso «Forced reflow»; la ✅, un solo layout dentro del frame.
```

---
example_description: "Un tablero kanban: las tarjetas se arrastran por su asa con Pointer Events (setPointerCapture, touch-action, columnas medidas una vez al empezar) o se mueven con las flechas desde el asa; un solo listener delegado y un evento card:move que anuncia cada cambio"
example_tags: "javascript|eventos|integracion|kanban|pointer-events|delegacion|teclado|customevent"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Proyecto: tienda de café</h1>
  <div id="board" class="board">
    <section class="column" data-column="todo" aria-labelledby="col-todo">
      <h2 id="col-todo">Por hacer</h2>
      <ul class="cards">
        <li class="card" data-card-id="T-12"><button type="button" class="grip" aria-label="Mover «Fotos de los tuestes»">⠿</button> Fotos de los tuestes</li>
        <li class="card" data-card-id="T-15"><button type="button" class="grip" aria-label="Mover «Página de suscripción»">⠿</button> Página de suscripción</li>
      </ul>
    </section>
    <section class="column" data-column="doing" aria-labelledby="col-doing">
      <h2 id="col-doing">En curso</h2>
      <ul class="cards">
        <li class="card" data-card-id="T-09"><button type="button" class="grip" aria-label="Mover «Carta de otoño»">⠿</button> Carta de otoño</li>
      </ul>
    </section>
    <section class="column" data-column="done" aria-labelledby="col-done">
      <h2 id="col-done">Hecho</h2>
      <ul class="cards"></ul>
    </section>
  </div>
  <p id="announcer" class="announcer" aria-live="polite"></p>
  <p class="hint">Arrastra una tarjeta por su asa ⠿. Con el teclado: Tab hasta el asa y las flechas ← →.</p>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 44rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
h2 {
  font-size: 0.95rem;
  margin: 0 0 0.5rem;
}
.board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}
.column {
  padding: 0.5rem;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  background: #e4e7eb;
}
.column.is-target {
  border-color: #1d4ed8;
}
.cards {
  display: grid;
  gap: 0.4rem;
  min-height: 3rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.card {
  padding: 0.4rem;
  border-radius: 0.4rem;
  background: #ffffff;
  font-size: 0.9rem;
}
.card.is-dragging {
  position: relative;
  z-index: 1;
  box-shadow: 0 6px 16px rgb(0 0 0 / 0.2);
}
.grip {
  font: inherit;
  padding: 0 0.3rem;
  border: 1px solid #7b8794;
  border-radius: 0.3rem;
  background: #ffffff;
  color: #1f2933;
  cursor: grab;
  touch-action: none; /* el gesto sobre el asa es para el arrastre */
}
.grip:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.hint,
.announcer {
  color: #52606d;
  font-size: 0.9rem;
}
.log {
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const board = document.querySelector('#board');
const columns = [...board.querySelectorAll('.column')];
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
const columnName = (column) => column.querySelector('h2').textContent;

// Mover una tarjeta a otra columna: cambia el DOM y AVISA (después de cambiar).
function moveCard(card, toColumn, how) {
  const fromColumn = card.closest('.column');
  if (toColumn === fromColumn) return;
  const grip = card.querySelector('.grip');
  toColumn.querySelector('.cards').append(card); // mover el nodo: no se duplica
  grip.focus(); // al sacar el nodo del documento se pierde el foco: lo devolvemos
  card.dispatchEvent(new CustomEvent('card:move', {
    bubbles: true,
    detail: { id: card.dataset.cardId, from: columnName(fromColumn), to: columnName(toColumn), how },
  }));
}

// ── Teclado: flechas con el foco en el asa (delegado en el tablero).
board.addEventListener('keydown', (event) => {
  const grip = event.target.closest('.grip');
  if (!grip || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
  event.preventDefault();
  const card = grip.closest('.card');
  const index = columns.indexOf(card.closest('.column')) + (event.key === 'ArrowRight' ? 1 : -1);
  if (columns[index]) moveCard(card, columns[index], 'teclado');
});

// ── Puntero: arrastrar por el asa.
let drag = null; // { card, grip, startX, startY, rects, target }
board.addEventListener('pointerdown', (event) => {
  const grip = event.target.closest('.grip');
  if (!grip || event.button !== 0) return;
  grip.setPointerCapture(event.pointerId); // todos los pointermove, al asa
  const card = grip.closest('.card');
  card.classList.add('is-dragging');
  // Medimos las columnas UNA vez al empezar (lecturas agrupadas, «Medidas y layout»).
  const rects = columns.map((column) => column.getBoundingClientRect());
  drag = { card, grip, startX: event.clientX, startY: event.clientY, rects, target: null };
});
board.addEventListener('pointermove', (event) => {
  if (!drag) return;
  drag.card.style.translate = `${event.clientX - drag.startX}px ${event.clientY - drag.startY}px`;
  const index = drag.rects.findIndex((rect) => event.clientX >= rect.left && event.clientX <= rect.right);
  drag.target = columns[index] ?? null;
  columns.forEach((column) => column.classList.toggle('is-target', column === drag.target));
});
function endDrag(drop) {
  if (!drag) return;
  const { card, target } = drag;
  card.classList.remove('is-dragging');
  card.style.translate = '';
  columns.forEach((column) => column.classList.remove('is-target'));
  drag = null;
  if (drop && target) moveCard(card, target, 'arrastre');
}
board.addEventListener('pointerup', () => endDrag(true));
board.addEventListener('pointercancel', () => endDrag(false));

// ── Quien quiera enterarse de los cambios escucha card:move (aquí, el anunciador).
board.addEventListener('card:move', (event) => {
  const { id, from, to, how } = event.detail;
  document.querySelector('#announcer').textContent = `${id} movida a «${to}».`;
  logLine(`➡️ ${id}: ${from} → ${to} (${how})`);
});
logLine('Listo: arrastra una tarjeta por su asa ⠿, o Tab hasta un asa y ← →');
```

---
example_description: "Arrastrar y soltar nativo entre columnas: draggable=\"true\", dragstart guarda el id con dataTransfer.setData y effectAllowed, las columnas aceptan con preventDefault en dragover y leen el id en drop; cada comanda tiene además botones ◀ ▶ para moverla con el teclado"
example_tags: "javascript|drag-and-drop|draggable|datatransfer|dragover|drop|accesibilidad"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Comandas de cocina</h1>
  <div id="board" class="board"></div>
  <ol id="log" class="log" aria-live="polite"></ol>
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
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem;
}
.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.column {
  min-height: 9rem;
  padding: 0.4rem;
  border: 2px dashed transparent;
  border-radius: 0.5rem;
  background: #e4e7eb;
}
/* La columna sobre la que se arrastra, para que se vea dónde caerá. */
.column.over {
  border-color: #1d4ed8;
  background: #dbeafe;
}
.column h2 {
  margin: 0 0 0.4rem;
  font-size: 0.9rem;
}
.cards {
  display: grid;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.card {
  padding: 0.35rem 0.5rem;
  border-radius: 0.375rem;
  background: #ffffff;
  font-size: 0.85rem;
  cursor: grab;
}
.card.dragging {
  opacity: 0.5;
}
.moves {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
}
.moves button {
  font: inherit;
  padding: 0 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
.moves button:disabled {
  visibility: hidden;
}
.moves button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 1px;
}
.log {
  margin: 0.75rem 0 0;
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
const COLUMNS = [['pending', 'Pendientes'], ['cooking', 'En cocina'], ['ready', 'Listas']];
const ORDERS = [['order-2', 'Mesa 2 · Pozole rojo'], ['order-3', 'Mesa 3 · Tacos al pastor'], ['order-4', 'Mesa 4 · Enchiladas']];
const board = document.querySelector('#board');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
const columnTitle = (index) => COLUMNS[index][1];

// Pintar el tablero: tres columnas y las comandas en la primera.
for (const [id, title] of COLUMNS) {
  const column = document.createElement('section');
  column.className = 'column';
  column.dataset.column = id;
  column.setAttribute('aria-label', title);
  const heading = document.createElement('h2');
  heading.textContent = title;
  const list = document.createElement('ul');
  list.className = 'cards';
  column.append(heading, list);
  board.append(column);
}
for (const [id, label] of ORDERS) {
  const card = document.createElement('li');
  card.className = 'card';
  card.draggable = true; // ← el atributo draggable="true"
  card.dataset.id = id;
  const name = document.createElement('span');
  name.textContent = label;
  const moves = document.createElement('span');
  moves.className = 'moves';
  for (const [dir, arrow] of [[-1, '◀'], [1, '▶']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.dir = dir;
    button.textContent = arrow;
    moves.append(button);
  }
  card.append(name, moves);
  board.querySelector('.cards').append(card);
}

// Una sola función mueve la comanda, venga del arrastre o de los botones.
function moveOrder(id, columnIndex, how) {
  const card = board.querySelector(`[data-id="${id}"]`);
  board.querySelectorAll('.cards')[columnIndex].append(card);
  updateButtons(card);
  logLine(`✅ ${card.firstChild.textContent} → ${columnTitle(columnIndex)} (${how})`);
}
function columnIndexOf(element) {
  return COLUMNS.findIndex(([id]) => id === element.closest('.column').dataset.column);
}
function updateButtons(card) {
  const index = columnIndexOf(card);
  for (const button of card.querySelectorAll('button')) {
    const target = index + Number(button.dataset.dir);
    button.disabled = target < 0 || target >= COLUMNS.length;
    if (!button.disabled) button.setAttribute('aria-label', `Mover ${card.firstChild.textContent} a ${columnTitle(target)}`);
  }
}
board.querySelectorAll('.card').forEach(updateButtons);

// ── Arrastre nativo ──────────────────────────────────────────────────────
board.addEventListener('dragstart', (event) => {
  const card = event.target.closest('.card');
  event.dataTransfer.setData('text/plain', card.dataset.id); // el dato que viaja
  event.dataTransfer.effectAllowed = 'move';                 // qué operaciones permite el origen
  card.classList.add('dragging');
  logLine(`dragstart → ${card.firstChild.textContent} · effectAllowed: move`);
});
board.addEventListener('dragover', (event) => {
  const column = event.target.closest('.column');
  if (!column) return;
  event.preventDefault();               // «aquí se puede soltar» (siguiente ejemplo)
  event.dataTransfer.dropEffect = 'move'; // el cursor que verá la persona
  column.classList.add('over');
});
board.addEventListener('dragleave', (event) => {
  const column = event.target.closest('.column');
  if (column && !column.contains(event.relatedTarget)) column.classList.remove('over');
});
board.addEventListener('drop', (event) => {
  const column = event.target.closest('.column');
  if (!column) return;
  event.preventDefault();
  column.classList.remove('over');
  const id = event.dataTransfer.getData('text/plain');
  logLine(`drop en «${column.getAttribute('aria-label')}» → getData: ${id}`);
  moveOrder(id, columnIndexOf(column), 'arrastre');
});
board.addEventListener('dragend', (event) => {
  event.target.closest('.card').classList.remove('dragging');
  logLine(`dragend → dropEffect: ${event.dataTransfer.dropEffect}`); // 'none' si se canceló
});

// ── Teclado: los mismos movimientos con botones ──────────────────────────
board.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const card = button.closest('.card');
  moveOrder(card.dataset.id, columnIndexOf(card) + Number(button.dataset.dir), 'botón');
  // Mover el nodo le quita el foco: se lo devolvemos (o al otro botón, si
  // este se ha desactivado en el borde del tablero).
  if (button.disabled) card.querySelector('button:not(:disabled)').focus();
  else button.focus();
});
logLine('Listo: arrastra una comanda a otra columna, o usa sus botones ◀ ▶');
```

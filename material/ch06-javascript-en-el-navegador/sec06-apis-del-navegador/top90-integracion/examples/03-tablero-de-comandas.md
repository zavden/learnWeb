---
example_description: "Tablero de comandas que junta tres lecciones: arrastrar y soltar con un tipo propio (la columna decide con dataTransfer.types), botones ◀ ▶ para el teclado, un MutationObserver que recuenta las columnas venga de donde venga el cambio (un solo aviso por lote) y un botón que copia el resumen de la comanda al portapapeles"
example_tags: "javascript|drag-and-drop|mutationobserver|clipboard|teclado|kanban|accesibilidad"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Comandas de cocina</h1>
  <div id="board" class="board"></div>
  <p id="announcer" class="visually-hidden" aria-live="polite"></p>
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
  min-height: 10rem;
  padding: 0.4rem;
  border: 2px dashed transparent;
  border-radius: 0.5rem;
  background: #e4e7eb;
}
.column.over {
  border-color: #1d4ed8;
  background: #dbeafe;
}
.column h2 {
  display: flex;
  justify-content: space-between;
  margin: 0 0 0.4rem;
  font-size: 0.9rem;
}
.count {
  min-width: 1.4rem;
  border-radius: 1rem;
  background: #ffffff;
  text-align: center;
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
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
}
.actions button {
  font: inherit;
  padding: 0 0.4rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
.actions button:disabled {
  visibility: hidden;
}
.actions button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 1px;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
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
const ORDER_TYPE = 'application/x-order'; // solo nuestras comandas llevan este tipo
const COLUMNS = [['pending', 'Pendientes'], ['cooking', 'En cocina'], ['ready', 'Listas']];
const ORDERS = [['order-2', 'Mesa 2 · Pozole rojo'], ['order-3', 'Mesa 3 · Tacos al pastor'], ['order-4', 'Mesa 4 · Enchiladas suizas']];
const board = document.querySelector('#board');
const announcer = document.querySelector('#announcer');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
const titleOf = (index) => COLUMNS[index][1];
const nameOf = (card) => card.querySelector('.name').textContent;
const columnIndexOf = (element) => COLUMNS.findIndex(([id]) => id === element.closest('.column').dataset.column);

function makeButton(text, action, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  button.dataset.action = action;
  if (label) button.setAttribute('aria-label', label);
  return button;
}
for (const [id, title] of COLUMNS) {
  const column = document.createElement('section');
  column.className = 'column';
  column.dataset.column = id;
  column.setAttribute('aria-label', title);
  const heading = document.createElement('h2');
  const count = document.createElement('span');
  count.className = 'count';
  heading.append(title, count);
  const list = document.createElement('ul');
  list.className = 'cards';
  column.append(heading, list);
  board.append(column);
}
for (const [id, text] of ORDERS) {
  const card = document.createElement('li');
  card.className = 'card';
  card.draggable = true;
  card.dataset.id = id;
  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = text;
  const actions = document.createElement('span');
  actions.className = 'actions';
  actions.append(makeButton('◀', 'left'), makeButton('📋', 'copy', `Copiar ${text}`), makeButton('▶', 'right'));
  card.append(name, actions);
  board.querySelector('.cards').append(card);
}

// ── Los contadores: un MutationObserver, venga de donde venga el cambio ──
function counts() {
  return [...board.querySelectorAll('.column')].map((column, index) => {
    const total = column.querySelector('.cards').children.length;
    column.querySelector('.count').textContent = total;
    return `${titleOf(index)} ${total}`;
  }).join(' · ');
}
logLine(`🧮 al cargar → ${counts()}`);
// Observa solo las listas de comandas: counts() escribe en los contadores, y
// si el observer también los vigilara, se llamaría a sí mismo sin fin.
const countObserver = new MutationObserver((records) => {
  logLine(`🧮 MutationObserver · ${records.length} registros → ${counts()}`);
});
for (const list of board.querySelectorAll('.cards')) countObserver.observe(list, { childList: true });

// ── Mover: una sola función para el arrastre y los botones ───────────────
function updateButtons(card) {
  const index = columnIndexOf(card);
  const [left, , right] = card.querySelectorAll('button');
  left.disabled = index === 0;
  right.disabled = index === COLUMNS.length - 1;
  if (!left.disabled) left.setAttribute('aria-label', `Mover ${nameOf(card)} a ${titleOf(index - 1)}`);
  if (!right.disabled) right.setAttribute('aria-label', `Mover ${nameOf(card)} a ${titleOf(index + 1)}`);
}
function moveOrder(id, columnIndex, how) {
  const card = board.querySelector(`[data-id="${id}"]`);
  board.querySelectorAll('.cards')[columnIndex].append(card);
  updateButtons(card);
  announcer.textContent = `${nameOf(card)}, movida a ${titleOf(columnIndex)}`;
  logLine(`✅ ${nameOf(card)} → ${titleOf(columnIndex)} (${how})`);
}
board.querySelectorAll('.card').forEach(updateButtons);

// ── Arrastrar y soltar (lección «Portapapeles, arrastrar y soltar…») ─────
board.addEventListener('dragstart', (event) => {
  const card = event.target.closest('.card');
  event.dataTransfer.setData(ORDER_TYPE, card.dataset.id);
  event.dataTransfer.effectAllowed = 'move';
});
board.addEventListener('dragover', (event) => {
  const column = event.target.closest('.column');
  if (!column || !event.dataTransfer.types.includes(ORDER_TYPE)) return; // durante el arrastre, solo los tipos
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
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
  moveOrder(event.dataTransfer.getData(ORDER_TYPE), columnIndexOf(column), 'arrastre');
});

// ── Botones: mover con el teclado y copiar el resumen ────────────────────
board.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const card = button.closest('.card');
  if (button.dataset.action === 'copy') {
    const summary = `${nameOf(card)} — ${titleOf(columnIndexOf(card))}`;
    try {
      await navigator.clipboard.writeText(summary);
      logLine(`📋 copiado → ${summary}`);
    } catch (error) {
      logLine(`⚠️ ${error.name}: ${window.origin === 'null' ? 'esta tarjeta no tiene portapapeles; ábrela con ▶' : 'no se pudo copiar'}`);
    }
    return;
  }
  moveOrder(card.dataset.id, columnIndexOf(card) + (button.dataset.action === 'right' ? 1 : -1), 'botón');
  if (button.disabled) card.querySelector('button:not(:disabled)').focus();
  else button.focus(); // mover el nodo le quita el foco: se lo devolvemos
});

// ── Simulación al cargar: lo que haría el navegador con un arrastre real ─
function simulateDrag(card, columnIndex) {
  const data = new DataTransfer();
  const column = board.querySelectorAll('.column')[columnIndex];
  card.dispatchEvent(new DragEvent('dragstart', { dataTransfer: data, bubbles: true }));
  const accepted = !column.dispatchEvent(new DragEvent('dragover', { dataTransfer: data, bubbles: true, cancelable: true }));
  if (accepted) column.dispatchEvent(new DragEvent('drop', { dataTransfer: data, bubbles: true, cancelable: true }));
}
logLine('— simulado: arrastrar la mesa 2 a «En cocina» —');
simulateDrag(board.querySelector('[data-id="order-2"]'), 1);
logLine('— simulado: ▶ en la mesa 4 —');
board.querySelector('[data-id="order-4"] [data-action="right"]').click();
logLine('Listo: arrastra las comandas o usa ◀ ▶; 📋 copia el resumen de una comanda');
```

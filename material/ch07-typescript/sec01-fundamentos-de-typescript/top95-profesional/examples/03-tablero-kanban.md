---
example_description: "Un tablero kanban gobernado por un reductor: el estado es readonly, cada cambio es una acción de una unión discriminada y reduce la trata con un switch exhaustivo; la interfaz solo despacha acciones, con botones accesibles y foco que no se pierde"
example_tags: "typescript|profesional|reductor|uniones-discriminadas|never|readonly|as-const|kanban|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Revista «Fogón» · número 42</h1>
  <form id="add-form" class="add">
    <label for="title">Nueva tarea</label>
    <input id="title" required maxlength="60" autocomplete="off">
    <button type="submit">Añadir</button>
  </form>
  <div class="board" id="board">
    <section aria-labelledby="col-todo"><h2 id="col-todo">Por hacer</h2><ul data-column="todo"></ul></section>
    <section aria-labelledby="col-doing"><h2 id="col-doing">En curso</h2><ul data-column="doing"></ul></section>
    <section aria-labelledby="col-done"><h2 id="col-done">Hecho</h2><ul data-column="done"></ul></section>
  </div>
  <button type="button" id="clear-done">Archivar las terminadas</button>
  <ol id="log" class="log" aria-label="Registro" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --soft: #cbd2d9; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.4; color: var(--ink); background: #f5f7fa; }
.app { max-width: 46rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.25rem; margin: 0 0 0.75rem; }
.add { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
.add input { flex: 1 1 12rem; }
input, button { font: inherit; }
input { padding: 0.35rem 0.5rem; border: 1px solid var(--line); border-radius: 0.4rem; }
button { padding: 0.3rem 0.65rem; border: 1px solid var(--line); border-radius: 0.4rem; background: #fff; color: var(--ink); cursor: pointer; }
button:disabled { opacity: 0.45; cursor: not-allowed; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.board { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: 0.75rem; margin-bottom: 1rem; }
.board section { padding: 0.5rem; background: #e4e7eb; border-radius: 0.75rem; }
.board h2 { font-size: 1rem; margin: 0.25rem 0.25rem 0.5rem; }
.board ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; min-height: 2rem; }
.card { padding: 0.5rem; background: #fff; border: 1px solid var(--soft); border-radius: 0.5rem; }
.card p { margin: 0 0 0.4rem; }
.card .id { color: var(--muted); font-size: 0.8rem; }
.card .tools { display: flex; gap: 0.35rem; }
.log { font-size: 0.85rem; color: var(--muted); }
```

# TypeScript

```typescript
// ── El modelo: datos readonly y acciones como unión discriminada ──────────
const COLUMNS = ['todo', 'doing', 'done'] as const;
type Column = (typeof COLUMNS)[number]; // operadores de tipo: módulo 2
const COLUMN_LABEL = { todo: 'Por hacer', doing: 'En curso', done: 'Hecho' } as const;
type Direction = 'left' | 'right';

type Card = { readonly id: string; readonly title: string; readonly column: Column };
type BoardState = { readonly cards: readonly Card[]; readonly nextNumber: number };
type BoardAction =
  | { type: 'add'; title: string }
  | { type: 'move'; id: string; direction: Direction }
  | { type: 'remove'; id: string }
  | { type: 'clear-done' };

function assertNever(value: never): never {
  throw new Error(`Acción no prevista: ${JSON.stringify(value)}`);
}

function neighbour(column: Column, direction: Direction): Column {
  const index = COLUMNS.indexOf(column) + (direction === 'left' ? -1 : 1);
  return COLUMNS[Math.min(COLUMNS.length - 1, Math.max(0, index))];
}

// El reductor: (estado, acción) → estado nuevo. Nunca modifica el anterior.
function reduce(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'add': {
      const card: Card = { id: `T-${state.nextNumber}`, title: action.title, column: 'todo' };
      return { cards: [...state.cards, card], nextNumber: state.nextNumber + 1 };
    }
    case 'move':
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === action.id ? { ...card, column: neighbour(card.column, action.direction) } : card,
        ),
      };
    case 'remove':
      return { ...state, cards: state.cards.filter((card) => card.id !== action.id) };
    case 'clear-done':
      return { ...state, cards: state.cards.filter((card) => card.column !== 'done') };
    default:
      return assertNever(action); // una acción nueva sin tratar es un error de tipos aquí
  }
}

function describeAction(action: BoardAction, before: BoardState, after: BoardState): string {
  const titleOf = (id: string): string => before.cards.find((card) => card.id === id)?.title ?? id;
  switch (action.type) {
    case 'add':
      return `➕ T-${before.nextNumber} «${action.title}» en ${COLUMN_LABEL.todo}`;
    case 'move': {
      const from = before.cards.find((card) => card.id === action.id)?.column ?? 'todo';
      return `➡️ ${action.id} «${titleOf(action.id)}»: ${COLUMN_LABEL[from]} → ${COLUMN_LABEL[neighbour(from, action.direction)]}`;
    }
    case 'remove':
      return `🗑️ ${action.id} «${titleOf(action.id)}» borrada`;
    case 'clear-done':
      return `🗄️ archivadas ${before.cards.length - after.cards.length} tarea(s) terminada(s)`;
    default:
      return assertNever(action);
  }
}

// ── La interfaz: pinta el estado y convierte clics en acciones ────────────
function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`Falta el elemento #${id}`);
  return element;
}
function inputById(id: string): HTMLInputElement {
  const element = byId(id);
  if (!(element instanceof HTMLInputElement)) throw new Error(`#${id} no es un <input>`);
  return element;
}
const titleInput = inputById('title');
const board = byId('board');
const logList = byId('log');

let state: BoardState = {
  cards: [
    { id: 'T-1', title: 'Entrevista a la chef de Teotitlán', column: 'todo' },
    { id: 'T-2', title: 'Fotos del mercado de Tlacolula', column: 'doing' },
    { id: 'T-3', title: 'Corrección del reportaje del cacao', column: 'done' },
    { id: 'T-4', title: 'Portada: elegir la fotografía', column: 'todo' },
  ],
  nextNumber: 5,
};

function toolButton(card: Card, command: Direction | 'remove', text: string, label: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  button.setAttribute('aria-label', label);
  button.dataset.id = card.id;
  button.dataset.command = command;
  button.disabled =
    (command === 'left' && card.column === COLUMNS[0]) || (command === 'right' && card.column === COLUMNS[COLUMNS.length - 1]);
  return button;
}

function render(): void {
  for (const column of COLUMNS) {
    const list = board.querySelector(`ul[data-column="${column}"]`);
    if (!(list instanceof HTMLUListElement)) continue;
    list.replaceChildren(
      ...state.cards
        .filter((card) => card.column === column)
        .map((card) => {
          const item = document.createElement('li');
          item.className = 'card';
          const title = document.createElement('p');
          const code = document.createElement('span');
          code.className = 'id';
          code.textContent = card.id;
          title.append(code, ` ${card.title}`);
          const tools = document.createElement('div');
          tools.className = 'tools';
          tools.append(
            toolButton(card, 'left', '←', `Mover «${card.title}» a ${COLUMN_LABEL[neighbour(card.column, 'left')]}`),
            toolButton(card, 'right', '→', `Mover «${card.title}» a ${COLUMN_LABEL[neighbour(card.column, 'right')]}`),
            toolButton(card, 'remove', '🗑', `Borrar «${card.title}»`),
          );
          item.append(title, tools);
          return item;
        }),
    );
  }
}

function dispatch(action: BoardAction): void {
  const before = state;
  state = reduce(state, action);
  render();
  const message = describeAction(action, before, state);
  console.log(message);
  const item = document.createElement('li');
  item.textContent = message;
  logList.append(item);
}

const toCommand = (value: string | undefined): Direction | 'remove' | null =>
  value === 'left' || value === 'right' || value === 'remove' ? value : null;

board.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest('button');
  const command = toCommand(button?.dataset.command);
  const id = button?.dataset.id;
  if (command === null || id === undefined) return;
  dispatch(command === 'remove' ? { type: 'remove', id } : { type: 'move', id, direction: command });
  // El botón pulsado se ha vuelto a crear: devolvemos el foco a su tarjeta.
  const same = board.querySelector(`button[data-id="${id}"][data-command="${command}"]`);
  const fallback = board.querySelector(`button[data-id="${id}"]:not(:disabled)`);
  const target = same instanceof HTMLButtonElement && !same.disabled ? same : fallback;
  if (target instanceof HTMLButtonElement) target.focus();
  else titleInput.focus();
});

byId('add-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (title === '') return;
  dispatch({ type: 'add', title });
  titleInput.value = '';
});

byId('clear-done').addEventListener('click', () => dispatch({ type: 'clear-done' }));

render();
console.log('Listo: añade una tarea, muévela con ← → o archiva las terminadas');
```

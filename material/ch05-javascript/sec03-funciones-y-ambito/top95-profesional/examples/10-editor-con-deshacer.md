---
example_description: "Lista de la compra con deshacer y rehacer: historial en un closure, actualizadores puros y currificados, instantáneas inmutables que comparten lo que no cambia, atajos de teclado y foco conservado al repintar"
example_tags: "javascript|profesional|inmutabilidad|closures|deshacer|interfaz"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <header class="app-header">
    <h1>Lista de la compra</h1>
    <div class="history-buttons" role="group" aria-label="Historial">
      <button type="button" id="undo">↶ Deshacer</button>
      <button type="button" id="redo">↷ Rehacer</button>
    </div>
  </header>
  <p class="hint">Atajos: <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Z</kbd> deshace y, con <kbd>Mayús</kbd>, rehace.</p>

  <form id="add-form" class="add-form">
    <label for="item-name">Producto</label>
    <input id="item-name" name="name" autocomplete="off" maxlength="40" required>
    <button type="submit">Añadir</button>
  </form>

  <section aria-labelledby="list-title">
    <h2 id="list-title">Por comprar <span id="counter" class="counter"></span></h2>
    <ul id="items" class="items"></ul>
    <button type="button" id="clear-bought" class="secondary">Quitar los comprados</button>
  </section>

  <section aria-labelledby="versions-title" class="versions">
    <h2 id="versions-title">Versiones</h2>
    <ol id="versions"></ol>
    <p id="sharing" class="hint"></p>
  </section>
  <p id="announcer" class="visually-hidden" aria-live="polite"></p>
</main>
```

# CSS

```css
:root {
  --text: #1f2933;
  --muted: #52606d;
  --page: #f5f7fa;
  --surface: #ffffff;
  --border: #c3cad3;
  --accent: #1d4ed8;
  --accent-text: #ffffff;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--page);
}
.app {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
}
.app-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
h1 {
  margin: 0;
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
}
h2 {
  font-size: 1.1rem;
}
.hint,
.counter {
  color: var(--muted);
  font-size: 0.92rem;
}
button,
input {
  font: inherit;
}
button {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--accent);
  border-radius: 0.5rem;
  background: var(--accent);
  color: var(--accent-text);
  cursor: pointer;
}
button.secondary,
.items button,
.history-buttons button {
  background: var(--surface);
  color: var(--accent);
}
button:disabled {
  border-color: var(--border);
  color: var(--muted);
  cursor: not-allowed;
}
button:focus-visible,
input:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.add-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.add-form input {
  flex: 1 1 12rem;
  padding: 0.45rem 0.7rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
}
.items {
  list-style: none;
  padding: 0;
  margin: 0 0 0.75rem;
}
.items li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  margin-bottom: 0.35rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
}
.items label {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.items .bought span {
  text-decoration: line-through;
  color: var(--muted);
}
.items button {
  padding: 0.15rem 0.5rem;
}
.versions ol {
  padding-left: 1.5rem;
  font-size: 0.92rem;
}
.versions [aria-current='step'] {
  font-weight: 700;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

# JavaScript

```javascript
// LISTA DE LA COMPRA CON DESHACER Y REHACER.
//
// Decisiones:
// - El estado es INMUTABLE: { nextId, items: [{ id, name, bought }] }. Cada acción es un
//   actualizador puro y currificado (datos → estado → estado nuevo).
// - El historial vive en un closure (createHistory) con los estados pasados, el presente
//   y los futuros; avisa a sus suscriptores cuando cambia el presente.
// - Un actualizador que no cambia nada devuelve el MISMO estado: === lo detecta y no se
//   ensucia el historial (por ejemplo, subir el primer elemento).
// - Lo que no cambia se comparte entre versiones; la página lo cuenta para que se vea.
// - Se repinta todo desde el estado. Para no perder el foco del teclado al repintar,
//   cada control lleva una clave (data-focus-key) y se vuelve a enfocar después.
//
// Alcance: módulos 1-3. querySelector, createElement, closest, los eventos (submit,
// click, change, keydown) y preventDefault se estudian en el capítulo 6.

// ── Historial (closure) ─────────────────────────────────────────────────
function createHistory(initial, { limit = 100 } = {}) {
  let past = [];
  let present = { state: initial, label: 'lista inicial' };
  let future = [];
  const listeners = new Set();
  const notify = () => listeners.forEach((listener) => listener());

  return {
    current: () => present.state,
    versions: () => [...past, present, ...future].map((entry) => entry.label),
    position: () => past.length,
    undoLabel: () => (past.length > 0 ? present.label : null),
    redoLabel: () => future[0]?.label ?? null,
    apply(update, label) {
      const next = update(present.state);
      if (next === present.state) return false;
      past = [...past, present].slice(-limit);
      present = { state: next, label };
      future = [];
      notify();
      return true;
    },
    undo() {
      if (past.length === 0) return null;
      const undone = present.label;
      future = [present, ...future];
      present = past.at(-1);
      past = past.slice(0, -1);
      notify();
      return undone;
    },
    redo() {
      if (future.length === 0) return null;
      past = [...past, present];
      [present, ...future] = future;
      notify();
      return present.label;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

// ── Actualizadores puros ────────────────────────────────────────────────
const indexOfId = (state, id) => state.items.findIndex((item) => item.id === id);

const addItem = (name) => (state) => ({
  nextId: state.nextId + 1,
  items: [...state.items, { id: state.nextId, name, bought: false }],
});
const toggleItem = (id) => (state) => {
  const index = indexOfId(state, id);
  return { ...state, items: state.items.with(index, { ...state.items[index], bought: !state.items[index].bought }) };
};
const removeItem = (id) => (state) => ({ ...state, items: state.items.toSpliced(indexOfId(state, id), 1) });
const moveItem = (id, offset) => (state) => {
  const from = indexOfId(state, id);
  const to = from + offset;
  if (to < 0 || to >= state.items.length) return state; // fuera de la lista: nada cambia
  return { ...state, items: state.items.with(from, state.items[to]).with(to, state.items[from]) };
};
const clearBought = () => (state) =>
  state.items.some((item) => item.bought) ? { ...state, items: state.items.filter((item) => !item.bought) } : state;

// ── Interfaz ────────────────────────────────────────────────────────────
const listHistory = createHistory({
  nextId: 4,
  items: [
    { id: 1, name: 'Pan de centeno', bought: false },
    { id: 2, name: 'Tomates', bought: true },
    { id: 3, name: 'Aceite de oliva', bought: false },
  ],
});
const ui = {
  form: document.querySelector('#add-form'),
  nameInput: document.querySelector('#item-name'),
  list: document.querySelector('#items'),
  counter: document.querySelector('#counter'),
  undo: document.querySelector('#undo'),
  redo: document.querySelector('#redo'),
  clearBoughtButton: document.querySelector('#clear-bought'),
  versions: document.querySelector('#versions'),
  sharing: document.querySelector('#sharing'),
  announcer: document.querySelector('#announcer'),
};

function button(text, label, action, id) {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = text;
  element.setAttribute('aria-label', label);
  element.dataset.action = action;
  element.dataset.id = id;
  element.dataset.focusKey = `${action}-${id}`;
  return element;
}

function renderItem(item, index, items) {
  const li = document.createElement('li');
  li.className = item.bought ? 'bought' : '';
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = item.bought;
  checkbox.dataset.id = item.id;
  checkbox.dataset.focusKey = `toggle-${item.id}`;
  const name = document.createElement('span');
  name.textContent = item.name;
  label.append(checkbox, name);
  const up = button('↑', `Subir ${item.name}`, 'up', item.id);
  const down = button('↓', `Bajar ${item.name}`, 'down', item.id);
  up.disabled = index === 0;
  down.disabled = index === items.length - 1;
  li.append(label, up, down, button('✕', `Quitar ${item.name}`, 'remove', item.id));
  return li;
}

let previousState = listHistory.current();
function render() {
  const focusKey = document.activeElement?.dataset?.focusKey; // ¿qué control tenía el foco?
  const state = listHistory.current();
  ui.list.replaceChildren(...state.items.map(renderItem));
  const pending = state.items.filter((item) => !item.bought).length;
  ui.counter.textContent = `(${pending} de ${state.items.length})`;
  ui.clearBoughtButton.disabled = !state.items.some((item) => item.bought);

  const undoLabel = listHistory.undoLabel();
  const redoLabel = listHistory.redoLabel();
  ui.undo.disabled = undoLabel === null;
  ui.redo.disabled = redoLabel === null;
  ui.undo.title = undoLabel ? `Deshacer: ${undoLabel}` : 'Nada que deshacer';
  ui.redo.title = redoLabel ? `Rehacer: ${redoLabel}` : 'Nada que rehacer';

  ui.versions.replaceChildren(...listHistory.versions().map((label, i) => {
    const li = document.createElement('li');
    li.textContent = label;
    if (i === listHistory.position()) li.setAttribute('aria-current', 'step');
    return li;
  }));
  const reused = state.items.filter((item) => previousState.items.includes(item)).length;
  ui.sharing.textContent = `Objetos reutilizados de la versión anterior: ${reused} de ${state.items.length}.`;
  previousState = state;

  // Si el control ya no existe (se quitó el elemento) o está desactivado, el foco va al campo.
  if (focusKey) {
    const target = document.querySelector(`[data-focus-key="${focusKey}"]`);
    (target && !target.disabled ? target : ui.nameInput).focus();
  }
}

function run(update, label) {
  if (listHistory.apply(update, label)) {
    ui.announcer.textContent = label;
    console.log(`✎ ${label}`);
  }
}
function undo() {
  const label = listHistory.undo();
  if (label) ui.announcer.textContent = `Deshecho: ${label}`;
}
function redo() {
  const label = listHistory.redo();
  if (label) ui.announcer.textContent = `Rehecho: ${label}`;
}

listHistory.subscribe(render);

ui.form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = ui.nameInput.value.trim();
  if (name === '') return;
  run(addItem(name), `añadir «${name}»`);
  ui.nameInput.value = '';
  ui.nameInput.focus();
});
ui.list.addEventListener('change', (event) => {
  const id = Number(event.target.dataset.id);
  const item = listHistory.current().items.find((candidate) => candidate.id === id);
  run(toggleItem(id), `${item.bought ? 'desmarcar' : 'marcar'} «${item.name}»`);
});
ui.list.addEventListener('click', (event) => {
  const target = event.target.closest('button[data-action]');
  if (!target) return;
  const id = Number(target.dataset.id);
  const { name } = listHistory.current().items.find((item) => item.id === id);
  const actions = {
    up: () => run(moveItem(id, -1), `subir «${name}»`),
    down: () => run(moveItem(id, +1), `bajar «${name}»`),
    remove: () => run(removeItem(id), `quitar «${name}»`),
  };
  actions[target.dataset.action]();
});
ui.clearBoughtButton.addEventListener('click', () => run(clearBought(), 'quitar los comprados'));
ui.undo.addEventListener('click', undo);
ui.redo.addEventListener('click', redo);
document.addEventListener('keydown', (event) => {
  if (event.target === ui.nameInput) return; // en el campo de texto, Ctrl+Z es del navegador
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
    event.preventDefault();
    if (event.shiftKey) redo();
    else undo();
  }
});

render();
```

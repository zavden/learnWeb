---
example_description: "Un editor de tareas con deshacer y rehacer basado en comandos: añadir, marcar, renombrar en el sitio (Editar, F2 o doble clic; Enter guarda, Escape cancela) y quitar; un historial que extiende EventTarget avisa con history:change, los botones dicen qué deshacen, Ctrl/⌘ + Z y Ctrl/⌘ + Shift + Z (o Ctrl + Y), y el foco nunca se pierde al volver a pintar"
example_tags: "javascript|eventos|profesional|deshacer|comandos|eventtarget|delegacion|teclado|foco"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="todo">
  <h1>Tareas de la tostaduría</h1>
  <form id="add-form" class="add-form">
    <label for="new-task">Nueva tarea</label>
    <input id="new-task" name="task" required maxlength="80">
    <button type="submit">Añadir</button>
  </form>
  <ul id="tasks" class="tasks" aria-label="Tareas"></ul>
  <p class="history">
    <button type="button" id="undo" aria-keyshortcuts="Control+Z Meta+Z">↶ Deshacer</button>
    <button type="button" id="redo" aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z Control+Y">↷ Rehacer</button>
  </p>
  <p id="announcer" class="visually-hidden" aria-live="polite"></p>
  <template id="task-template">
    <li class="task">
      <span class="text"></span>
      <span class="task-actions">
        <button type="button" data-action="toggle" aria-pressed="false">Hecha</button>
        <button type="button" data-action="edit" aria-keyshortcuts="F2">Editar</button>
        <button type="button" data-action="remove">Quitar</button>
      </span>
    </li>
  </template>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root {
  --ink: #1f2933;
  --muted: #52606d;
  --line: #cbd2d9;
  --surface: #ffffff;
  --page: #f5f7fa;
  --accent: #1d4ed8;
  --accent-soft: #dbeafe;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: var(--ink);
  background: var(--page);
}
.todo {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin-top: 0;
}
.add-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.add-form input {
  flex: 1 1 12rem;
}
input {
  font: inherit;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--muted);
  border-radius: 0.375rem;
}
.tasks {
  display: grid;
  gap: 0.35rem;
  padding: 0;
  list-style: none;
}
.task {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface);
}
.task .text,
.task input {
  flex: 1 1 10rem;
}
.task.is-done .text {
  color: var(--muted);
  text-decoration: line-through;
}
.task-actions {
  display: flex;
  gap: 0.3rem;
}
button {
  font: inherit;
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--muted);
  border-radius: 0.4rem;
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
}
button[aria-pressed="true"] {
  border-color: var(--accent);
  background: var(--accent-soft);
}
button:disabled {
  color: var(--muted);
  cursor: not-allowed;
}
.history {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.log {
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface);
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Editor de tareas con deshacer/rehacer (patrón «comando»).
//
// Decisiones de diseño:
// - El estado es un array de tareas; la lista se vuelve a pintar entera desde
//   él (plantilla + replaceChildren). Cada cambio es un COMANDO con apply() y
//   revert(), y el historial guarda comandos, no copias del estado.
// - El historial extiende EventTarget y avisa con history:change; los botones
//   se suscriben y muestran qué deshacen («Deshacer: quitar «Tostar»»).
// - Un listener delegado (click y keydown) atiende todas las tareas. Editar en
//   el sitio: botón «Editar», F2 o doble clic; Enter guarda, Escape cancela y
//   salir del campo guarda.
// - Volver a pintar destruye los botones: render() recuerda qué control tenía
//   el foco (tarea + acción) y se lo devuelve. Al quitar una tarea, el foco
//   pasa a la siguiente (o a la anterior), nunca se pierde en el <body>.
// - Ctrl/⌘ + Z deshace y Ctrl/⌘ + Shift + Z o Ctrl + Y rehacen, salvo dentro de
//   un campo, donde deshacer es cosa del texto.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM y este módulo.

const logList = document.querySelector('#log');
let quiet = false;
function logLine(text) {
  if (quiet) return;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// ── Estado y comandos.
let nextId = 1;
const tasks = ['Tostar el lote 104', 'Etiquetar bolsas de 500 g', 'Llamar al proveedor de vainilla']
  .map((text) => ({ id: `t${nextId++}`, text, done: false }));
const findTask = (id) => tasks.find((task) => task.id === id); // «find» ya existe en window

const commands = {
  add: (text) => {
    const task = { id: `t${nextId++}`, text, done: false };
    return { label: `añadir «${text}»`, apply: () => tasks.push(task), revert: () => tasks.splice(tasks.indexOf(task), 1) };
  },
  remove: (id) => {
    const task = findTask(id);
    const index = tasks.indexOf(task);
    return { label: `quitar «${task.text}»`, apply: () => tasks.splice(index, 1), revert: () => tasks.splice(index, 0, task) };
  },
  toggle: (id) => {
    const task = findTask(id);
    return { label: `marcar «${task.text}»`, apply: () => { task.done = !task.done; }, revert: () => { task.done = !task.done; } };
  },
  rename: (id, text) => {
    const task = findTask(id);
    const before = task.text;
    return { label: `renombrar «${before}»`, apply: () => { task.text = text; }, revert: () => { task.text = before; } };
  },
};

class UndoHistory extends EventTarget { // «History» ya es un nombre del navegador
  #done = [];
  #undone = [];
  constructor(limit = 50) {
    super();
    this.limit = limit;
  }
  execute(command) {
    command.apply();
    this.#done.push(command);
    if (this.#done.length > this.limit) this.#done.shift();
    this.#undone = [];
    this.#emit('execute', command);
  }
  undo() {
    const command = this.#done.pop();
    if (!command) return;
    command.revert();
    this.#undone.push(command);
    this.#emit('undo', command);
  }
  redo() {
    const command = this.#undone.pop();
    if (!command) return;
    command.apply();
    this.#done.push(command);
    this.#emit('redo', command);
  }
  clear() {
    this.#done = [];
    this.#undone = [];
  }
  get nextUndo() { return this.#done.at(-1)?.label ?? null; }
  get nextRedo() { return this.#undone.at(-1)?.label ?? null; }
  #emit(kind, command) {
    this.dispatchEvent(new CustomEvent('history:change', { detail: { kind, label: command.label } }));
  }
}
const undoHistory = new UndoHistory();

// ── Pintar desde el estado, devolviendo el foco a donde estaba.
const list = document.querySelector('#tasks');
const template = document.querySelector('#task-template');
let pendingFocus = null; // { id, action } que debe recibir el foco tras pintar

function render() {
  const active = document.activeElement;
  const focusWasInside = list.contains(active);
  const remembered = pendingFocus ?? (focusWasInside
    ? { id: active.closest('[data-id]')?.dataset.id, action: active.dataset.action }
    : null);
  pendingFocus = null;
  list.replaceChildren(...tasks.map((task) => {
    const item = template.content.firstElementChild.cloneNode(true);
    item.dataset.id = task.id;
    item.classList.toggle('is-done', task.done);
    item.querySelector('.text').textContent = task.text;
    const toggle = item.querySelector('[data-action="toggle"]');
    toggle.setAttribute('aria-pressed', String(task.done));
    for (const button of item.querySelectorAll('button')) {
      button.setAttribute('aria-label', `${button.textContent}: ${task.text}`);
    }
    return item;
  }));
  if (!remembered || !(focusWasInside || remembered.force)) return;
  const target = list.querySelector(`[data-id="${remembered.id}"] [data-action="${remembered.action}"]`)
    ?? list.querySelector('[data-action="toggle"]')
    ?? document.querySelector('#new-task');
  target.focus();
}

// ── Editar en el sitio.
function startEditing(item) {
  const task = findTask(item.dataset.id);
  const input = document.createElement('input');
  input.value = task.text;
  input.setAttribute('aria-label', `Nuevo nombre para «${task.text}»`);
  item.querySelector('.text').replaceWith(input);
  input.focus();
  input.select();
  let finished = false;
  const finish = (save) => {
    if (finished) return;
    finished = true;
    const text = input.value.trim();
    pendingFocus = { id: task.id, action: 'edit', force: true };
    if (save && text && text !== task.text) undoHistory.execute(commands.rename(task.id, text));
    else render();
  };
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') finish(true);
    if (event.key === 'Escape') {
      event.preventDefault();
      finish(false);
    }
  });
  input.addEventListener('blur', () => finish(true));
}

// ── Un listener delegado para todas las tareas.
list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const item = button.closest('[data-id]');
  const { id } = item.dataset;
  if (button.dataset.action === 'edit') return startEditing(item);
  if (button.dataset.action === 'toggle') return undoHistory.execute(commands.toggle(id));
  // Quitar: el foco pasa a la tarea siguiente (o a la anterior).
  const neighbour = item.nextElementSibling ?? item.previousElementSibling;
  pendingFocus = neighbour ? { id: neighbour.dataset.id, action: 'remove', force: list.contains(document.activeElement) } : null;
  undoHistory.execute(commands.remove(id));
});
list.addEventListener('dblclick', (event) => {
  const text = event.target.closest('.text');
  if (text) startEditing(text.closest('[data-id]'));
});
list.addEventListener('keydown', (event) => {
  if (event.key === 'F2' && event.target.matches('button')) {
    event.preventDefault();
    startEditing(event.target.closest('[data-id]'));
  }
});

document.querySelector('#add-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const field = event.currentTarget.elements.task;
  const text = field.value.trim();
  if (!text) return; // required deja pasar «   »
  undoHistory.execute(commands.add(text));
  field.value = '';
});

// ── Botones y atajos del historial.
const undoButton = document.querySelector('#undo');
const redoButton = document.querySelector('#redo');
function updateHistoryButtons() {
  undoButton.disabled = !undoHistory.nextUndo;
  redoButton.disabled = !undoHistory.nextRedo;
  undoButton.title = undoHistory.nextUndo ? `Deshacer: ${undoHistory.nextUndo}` : 'Nada que deshacer';
  redoButton.title = undoHistory.nextRedo ? `Rehacer: ${undoHistory.nextRedo}` : 'Nada que rehacer';
}
undoButton.addEventListener('click', () => undoHistory.undo());
redoButton.addEventListener('click', () => undoHistory.redo());
document.addEventListener('keydown', (event) => {
  if (!(event.ctrlKey || event.metaKey) || event.altKey || event.target.matches('input, textarea')) return;
  const key = event.key.toLowerCase();
  const redo = (key === 'z' && event.shiftKey) || (key === 'y' && event.ctrlKey);
  if (key !== 'z' && !redo) return;
  event.preventDefault();
  if (redo) undoHistory.redo();
  else undoHistory.undo();
});

undoHistory.addEventListener('history:change', (event) => {
  render();
  updateHistoryButtons();
  const verbs = { execute: '✎', undo: '↶ deshecho:', redo: '↷ rehecho:' };
  const message = `${verbs[event.detail.kind]} ${event.detail.label}`;
  document.querySelector('#announcer').textContent = message;
  logLine(message);
});
render();
updateHistoryButtons();

// ── Autocomprobación (simulada; vuelve al estado inicial).
function audit() {
  quiet = true;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  const snapshot = () => tasks.map((task) => `${task.text}${task.done ? ' ✓' : ''}`).join(' | ');
  const initial = snapshot();
  const click = (selector) => list.querySelector(selector).dispatchEvent(new MouseEvent('click', { bubbles: true }));
  click('[data-id="t1"] [data-action="toggle"]');
  click('[data-id="t2"] [data-action="remove"]');
  undoHistory.execute(commands.rename('t3', 'Pedir vainilla de Papantla'));
  expect('tres cambios con clics simulados y un comando', snapshot() === 'Tostar el lote 104 ✓ | Pedir vainilla de Papantla');
  expect('el botón dice qué deshará', undoButton.title === 'Deshacer: renombrar «Llamar al proveedor de vainilla»');
  const pressZ = (shiftKey) => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: shiftKey ? 'Z' : 'z', ctrlKey: true, shiftKey, bubbles: true, cancelable: true }));
  pressZ(false);
  pressZ(false);
  pressZ(false);
  expect('Ctrl + Z tres veces vuelve al estado inicial (la tarea quitada, en su sitio)', snapshot() === initial);
  pressZ(true);
  expect('Ctrl + Shift + Z rehace el primero', snapshot().startsWith('Tostar el lote 104 ✓'));
  undoHistory.undo();
  expect('deshecho otra vez: se puede rehacer pero no deshacer', undoButton.disabled && !redoButton.disabled);
  undoHistory.clear(); // el historial de la prueba no es del usuario
  updateHistoryButtons();
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: marca una tarea, renombra otra (Editar, F2 o doble clic) y quita la tercera; luego Ctrl/⌘ + Z tres veces');
```

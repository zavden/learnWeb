---
example_description: "Una lista de tareas con deshacer y rehacer: cada cambio anuncia un evento todo:change con sus funciones undo/redo en detail, un historial lo apila, Ctrl/⌘ + Z y Ctrl/⌘ + Shift + Z funcionan fuera de los campos y «Pausar el historial» quita todos sus listeners con un abort()"
example_tags: "javascript|eventos|integracion|deshacer|customevent|teclado|abortcontroller|delegacion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Tareas del huerto</h1>
  <form id="add-form" class="row">
    <label for="new-task">Nueva tarea</label>
    <input id="new-task" name="task" required>
    <button type="submit">Añadir</button>
  </form>
  <ul id="tasks" class="tasks"></ul>
  <p class="row">
    <button type="button" id="undo" aria-keyshortcuts="Control+Z Meta+Z" disabled>↶ Deshacer</button>
    <button type="button" id="redo" aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z" disabled>↷ Rehacer</button>
    <button type="button" id="pause">Pausar el historial</button>
  </p>
  <template id="task-template">
    <li><span class="text"></span> <button type="button" data-action="remove">Quitar</button></li>
  </template>
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
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
input {
  flex: 1;
  min-width: 8rem;
  font: inherit;
  padding: 0.3rem 0.5rem;
}
.tasks {
  display: grid;
  gap: 0.3rem;
  padding: 0;
  list-style: none;
}
.tasks li {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0.5rem;
  border-radius: 0.4rem;
  background: #ffffff;
}
button {
  font: inherit;
  padding: 0.25rem 0.6rem;
  border: 1px solid #7b8794;
  border-radius: 0.4rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:disabled {
  color: #52606d;
  cursor: not-allowed;
}
button:focus-visible,
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
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
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
const tasksList = document.querySelector('#tasks');
const template = document.querySelector('#task-template');

// ── La lista: cada cambio se hace y se ANUNCIA con cómo deshacerlo.
function createTask(text) {
  const item = template.content.firstElementChild.cloneNode(true);
  item.querySelector('.text').textContent = text;
  return item;
}
function announce(label, undo, redo) {
  tasksList.dispatchEvent(new CustomEvent('todo:change', { bubbles: true, detail: { label, undo, redo } }));
}
function addTask(text) {
  const item = createTask(text);
  tasksList.append(item);
  announce(`añadir «${text}»`, () => item.remove(), () => tasksList.append(item));
}
function removeTask(item) {
  const next = item.nextElementSibling; // para volver a ponerla en su sitio
  item.remove();
  announce(`quitar «${item.querySelector('.text').textContent}»`,
    () => tasksList.insertBefore(item, next), () => item.remove());
}
document.querySelector('#add-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const field = event.currentTarget.elements.task;
  addTask(field.value.trim());
  field.value = '';
});
tasksList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="remove"]');
  if (button) removeTask(button.closest('li'));
});

// ── El historial: escucha los avisos y los atajos, con UNA señal.
const undoButton = document.querySelector('#undo');
const redoButton = document.querySelector('#redo');
function createHistory() {
  const done = [];
  const undone = [];
  const life = new AbortController();
  const { signal } = life;
  const refresh = () => {
    undoButton.disabled = done.length === 0;
    redoButton.disabled = undone.length === 0;
  };
  const undo = () => {
    const change = done.pop();
    if (!change) return;
    change.undo();
    undone.push(change);
    refresh();
    logLine(`↶ deshecho: ${change.label}`);
  };
  const redo = () => {
    const change = undone.pop();
    if (!change) return;
    change.redo();
    done.push(change);
    refresh();
    logLine(`↷ rehecho: ${change.label}`);
  };
  document.addEventListener('todo:change', (event) => {
    done.push(event.detail);
    undone.length = 0; // un cambio nuevo invalida lo que se podía rehacer
    refresh();
    logLine(`✎ ${event.detail.label}`);
  }, { signal });
  document.addEventListener('keydown', (event) => {
    const isZ = event.key.toLowerCase() === 'z'; // con Shift, key es 'Z'
    if (!isZ || !(event.ctrlKey || event.metaKey) || event.altKey) return;
    if (event.target.matches('input, textarea')) return; // ahí, Ctrl+Z es del campo
    event.preventDefault();
    if (event.shiftKey) redo();
    else undo();
  }, { signal });
  undoButton.addEventListener('click', undo, { signal });
  redoButton.addEventListener('click', redo, { signal });
  refresh();
  return life;
}
let historyLife = null; // (no se llama «history»: window.history ya existe)
['Regar los tomates', 'Atar las judías'].forEach(addTask); // antes del historial: no se apilan
historyLife = createHistory();

document.querySelector('#pause').addEventListener('click', (event) => {
  if (historyLife) {
    historyLife.abort(); // fuera: todo:change, keydown y los dos clics
    historyLife = null;
    undoButton.disabled = redoButton.disabled = true;
    event.currentTarget.textContent = 'Reanudar el historial';
    logLine('⏸️ historial en pausa: los cambios ya no se apilan');
  } else {
    historyLife = createHistory();
    event.currentTarget.textContent = 'Pausar el historial';
    logLine('▶ historial reanudado (vacío)');
  }
});
logLine('Listo: añade «Abonar las calabazas», quita «Atar las judías», pulsa Ctrl/⌘ + Z dos veces y Ctrl/⌘ + Shift + Z');
```

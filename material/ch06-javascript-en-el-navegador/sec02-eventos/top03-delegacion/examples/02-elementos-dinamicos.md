---
example_description: "Listeners por elemento frente a delegación con elementos que se añaden después: los botones ✓ de las tareas nuevas no responden en la lista con un listener por botón, y sí en la lista que delega en su contenedor"
example_tags: "javascript|eventos|delegacion|elementos-dinamicos|createelement|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Tareas del huerto</h1>
  <button id="add" type="button">Añadir una tarea a las dos listas</button>
  <div class="columns">
    <section>
      <h2>🐛 Un listener por botón</h2>
      <ul id="per-item" class="tasks">
        <li><button type="button">✓</button> Regar los tomates</li>
        <li><button type="button">✓</button> Atar las judías</li>
      </ul>
    </section>
    <section>
      <h2>✅ Delegación</h2>
      <ul id="delegated" class="tasks">
        <li><button type="button">✓</button> Regar los tomates</li>
        <li><button type="button">✓</button> Atar las judías</li>
      </ul>
    </section>
  </div>
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
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
h2 {
  font-size: 0.95rem;
  margin: 0.75rem 0 0.25rem;
}
.columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 0.75rem;
}
.tasks {
  margin: 0;
  padding: 0;
  list-style: none;
}
.tasks li {
  padding: 0.2rem 0;
}
.tasks li.done {
  color: #52606d;
  text-decoration: line-through;
}
button {
  font: inherit;
  padding: 0.2rem 0.55rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
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
const perItemList = document.querySelector('#per-item');
const delegatedList = document.querySelector('#delegated');
const logList = document.querySelector('#log');
const newTasks = ['Abonar las calabazas', 'Cosechar cilantro', 'Revisar el riego'];
let added = 0;
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
function markDone(item, where) {
  item.classList.toggle('done');
  logLine(`${where}: «${item.textContent.slice(2)}» ${item.classList.contains('done') ? 'hecha' : 'pendiente'}`);
}

// 🐛 Un listener en CADA botón que existe AHORA. Los que se creen después
//    no tendrán ninguno.
for (const button of perItemList.querySelectorAll('button')) {
  button.addEventListener('click', () => markDone(button.closest('li'), '🐛 por botón'));
}

// ✅ Un listener en la lista: vale para los botones de hoy y de mañana.
delegatedList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button) markDone(button.closest('li'), '✅ delegado');
});

function createTask(text) {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '✓';
  item.append(button, ` ${text}`);
  return item;
}
document.querySelector('#add').addEventListener('click', () => {
  const text = newTasks[added % newTasks.length];
  added += 1;
  perItemList.append(createTask(text));
  delegatedList.append(createTask(text));
  logLine(`➕ «${text}» añadida a las dos listas`);
});
logLine('Listo: pulsa «Añadir…» y después el ✓ de la tarea nueva en cada lista');
```

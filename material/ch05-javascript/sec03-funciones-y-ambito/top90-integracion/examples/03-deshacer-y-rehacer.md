---
example_description: "Deshacer y rehacer en una lista de tareas: historial privado en un closure, actualizadores puros y currificados, estados inmutables que comparten lo que no cambia y === para detectar cambios"
example_tags: "javascript|integracion|inmutabilidad|closures|currying|deshacer"
example_stage: intermediate
example_importance: critical
console: true
---

# JavaScript

```javascript
// DESHACER / REHACER en una lista de tareas.
// Integra: estado privado en un closure («Closures»), funciones puras e
// inmutabilidad, actualizadores currificados («Funciones de orden superior»),
// with / toSpliced / spread («Arrays», «Objetos literales») y === («JSON y copias»).

function createHistory(initialState, { limit = 50 } = {}) {
  let past = [];      // estados anteriores, con la etiqueta del cambio que los dejó atrás
  let present = initialState;
  let future = [];    // estados deshechos, listos para rehacer

  return {
    current: () => present,
    apply(update, label) {
      const next = update(present); // update es PURA: devuelve un estado nuevo o el mismo
      if (next === present) {
        console.log(`  · sin cambios: ${label}`);
        return;
      }
      past = [...past, { state: present, label }].slice(-limit);
      present = next;
      future = []; // un cambio nuevo invalida lo que se había deshecho
    },
    undo() {
      const last = past.at(-1);
      if (!last) return null;
      past = past.slice(0, -1);
      future = [{ state: present, label: last.label }, ...future];
      present = last.state;
      return last.label;
    },
    redo() {
      const [next, ...rest] = future;
      if (!next) return null;
      future = rest;
      past = [...past, { state: present, label: next.label }];
      present = next.state;
      return next.label;
    },
  };
}

// Actualizadores: reciben los datos del cambio y devuelven una función PURA estado → estado.
const addTask = (title) => (state) => ({
  ...state,
  nextId: state.nextId + 1,
  tasks: [...state.tasks, { id: state.nextId, title, done: false }],
});
const toggleTask = (id) => (state) => ({
  ...state,
  tasks: state.tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
});
const renameTask = (id, title) => (state) => {
  const index = state.tasks.findIndex((task) => task.id === id);
  if (index === -1 || state.tasks[index].title === title) return state; // nada que hacer
  return { ...state, tasks: state.tasks.with(index, { ...state.tasks[index], title }) };
};
const removeTask = (id) => (state) => {
  const index = state.tasks.findIndex((task) => task.id === id);
  return index === -1 ? state : { ...state, tasks: state.tasks.toSpliced(index, 1) };
};

const show = (state) =>
  console.log('   ', state.tasks.map((task) => `${task.done ? '☑' : '☐'} ${task.title}`).join(' | ') || '(vacía)');

const todoHistory = createHistory({ nextId: 1, tasks: [] });
const firstState = todoHistory.current();

todoHistory.apply(addTask('Comprar pan'), 'añadir «Comprar pan»');
todoHistory.apply(addTask('Llamar al taller'), 'añadir «Llamar al taller»');
todoHistory.apply(toggleTask(1), 'marcar «Comprar pan»');
todoHistory.apply(renameTask(2, 'Llamar al taller'), 'renombrar con el mismo título'); // no cambia nada
todoHistory.apply(renameTask(2, 'Llamar al taller (ITV)'), 'renombrar la tarea 2');
show(todoHistory.current());

const beforeRemove = todoHistory.current();
todoHistory.apply(removeTask(1), 'borrar «Comprar pan»');
show(todoHistory.current());
console.log('¿la tarea 2 se ha copiado? →', todoHistory.current().tasks[0] !== beforeRemove.tasks[1]); // false: compartida

console.log('↶ deshacer →', todoHistory.undo());
console.log('↶ deshacer →', todoHistory.undo());
show(todoHistory.current());
console.log('↷ rehacer →', todoHistory.redo());
show(todoHistory.current());

todoHistory.apply(addTask('Pagar la luz'), 'añadir «Pagar la luz»');
console.log('↷ rehacer tras un cambio nuevo →', todoHistory.redo()); // null: el futuro se ha descartado
show(todoHistory.current());
console.log('¿el primer estado sigue intacto? →', firstState.tasks.length === 0); // true
```

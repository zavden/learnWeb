---
example_description: "La ficha de un producto en un store con Proxy que guarda un historial de deshacer y rehacer; los cambios de un bloque using se agrupan en un solo paso al liberarse ([Symbol.dispose]) y el historial se recorre con un generador y helpers"
example_tags: "javascript|proxy|reflect|using|symbol-dispose|generadores|deshacer|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// EL EDITOR DE UNA FICHA DE PRODUCTO con deshacer y rehacer.
// Lecciones: Proxy con Reflect (el store del módulo), using + Symbol.dispose
// (agrupar cambios; Chrome 134+) y un generador para recorrer el historial.
function createHistoryStore(initial) {
  const undoStack = []; // cada paso: { label, changes: [{ key, previous, value }] }
  const redoStack = [];
  const listeners = new Set();
  let openBatch = null; // el lote en curso, si lo hay
  let replaying = false; // undo/redo también pasan por la trampa: no deben apilar

  const notify = (step) => {
    for (const listener of [...listeners]) listener(step);
  };

  const state = new Proxy({ ...initial }, {
    set(target, key, value, receiver) {
      const previous = target[key];
      if (Object.is(previous, value)) return true;
      const ok = Reflect.set(target, key, value, receiver);
      if (!replaying) {
        redoStack.length = 0; // un cambio nuevo invalida lo deshecho
        const change = { key, previous, value };
        if (openBatch) openBatch.changes.push(change);
        else {
          undoStack.push({ label: key, changes: [change] });
          notify(undoStack.at(-1));
        }
      }
      return ok;
    },
  });

  function replay(step, direction) {
    const changes = direction === 'undo'
      ? step.changes.toReversed().map(({ key, previous, value }) => ({ key, previous: value, value: previous }))
      : step.changes;
    replaying = true;
    for (const { key, value } of changes) state[key] = value;
    replaying = false;
    notify({ label: `${direction === 'undo' ? '↩️ deshacer' : '↪️ rehacer'} «${step.label}»`, changes });
  }

  return {
    state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    undo() {
      const step = undoStack.pop();
      if (step) {
        replay(step, 'undo');
        redoStack.push(step);
      }
      return Boolean(step);
    },
    redo() {
      const step = redoStack.pop();
      if (step) {
        replay(step, 'redo');
        undoStack.push(step);
      }
      return Boolean(step);
    },
    // Un objeto desechable: los cambios hasta que se libere forman UN paso.
    batch(label) {
      openBatch = { label, changes: [] };
      return {
        [Symbol.dispose]() {
          const step = openBatch;
          openBatch = null;
          if (step.changes.length > 0) {
            undoStack.push(step);
            notify(step);
          }
        },
      };
    },
    *history() { // del paso más reciente al más antiguo
      for (let i = undoStack.length - 1; i >= 0; i--) yield undoStack[i];
    },
  };
}

const product = createHistoryStore({ name: 'Café de Chiapas', cents: 21000, stock: 12, published: false });
product.subscribe(({ label, changes }) => {
  const detail = changes.map(({ key, previous, value }) => `${key}: ${JSON.stringify(previous)} → ${JSON.stringify(value)}`);
  console.log(`  🔔 ${label} (${detail.join(', ')})`);
});
const show = () => console.log('  estado →', JSON.stringify(product.state));

console.log('▶ ediciones sueltas: un paso cada una');
product.state.cents = 23500;
product.state.stock = 10;

console.log('▶ «publicar» cambia tres campos en UN paso');
{
  using publishing = product.batch('publicar');
  product.state.name = 'Café de Chiapas 500 g';
  product.state.published = true;
  product.state.stock = 9;
} // ← aquí se llama a publishing[Symbol.dispose](): un solo aviso
show();
console.log('  historial →', product.history().map((step) => step.label).toArray());

console.log('▶ deshacer dos pasos');
product.undo();
product.undo();
show();

console.log('▶ rehacer uno');
product.redo();
show();

console.log('▶ un cambio nuevo borra lo que quedaba por rehacer');
product.state.cents = 22000;
console.log('  ¿se puede rehacer? →', product.redo());
console.log('  los 2 pasos más recientes →', product.history().take(2).map((step) => step.label).toArray());
```

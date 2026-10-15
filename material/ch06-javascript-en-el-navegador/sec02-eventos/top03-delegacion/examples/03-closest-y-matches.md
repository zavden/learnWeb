---
example_description: "Un tablero kanban con un solo listener: closest('.card') encuentra la tarjeta desde cualquier punto de su interior y matches decide qué botón se pulsó (etiqueta o «Mover →»); las tarjetas movidas siguen funcionando"
example_tags: "javascript|eventos|delegacion|closest|matches|kanban"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Proyecto: tienda de café</h1>
  <div id="board" class="board">
    <section class="column" data-column="todo">
      <h2>Por hacer</h2>
      <article class="card" data-card-id="T-12">
        <h3>Fotos de los tuestes</h3>
        <button type="button" class="tag">diseño</button>
        <button type="button" class="move">Mover →</button>
      </article>
      <article class="card" data-card-id="T-15">
        <h3>Página de suscripción</h3>
        <button type="button" class="tag">web</button>
        <button type="button" class="tag">urgente</button>
        <button type="button" class="move">Mover →</button>
      </article>
    </section>
    <section class="column" data-column="doing">
      <h2>En curso</h2>
    </section>
    <section class="column" data-column="done">
      <h2>Hecho</h2>
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
  max-width: 40rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
h2 {
  font-size: 0.9rem;
  margin: 0 0 0.5rem;
}
h3 {
  font-size: 0.95rem;
  margin: 0 0 0.4rem;
}
.board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}
.column {
  min-height: 6rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: #e4e7eb;
}
.card {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.4rem;
  background: #ffffff;
}
button {
  font: inherit;
  font-size: 0.8rem;
  margin: 0.15rem 0;
  padding: 0.15rem 0.45rem;
  border: 1px solid #7b8794;
  border-radius: 0.4rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
.tag {
  border-radius: 1rem;
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
const board = document.querySelector('#board');
const logList = document.querySelector('#log');
const nextColumn = { todo: 'doing', doing: 'done', done: 'todo' };
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

board.addEventListener('click', (event) => {
  // closest: de target hacia arriba, el primer antepasado (o él mismo) que encaje.
  const card = event.target.closest('.card');
  if (!card) return; // clic en una columna vacía o en un título de columna
  const id = card.dataset.cardId;

  // matches: ¿target encaja con este selector? (sin subir)
  if (event.target.matches('.tag')) {
    logLine(`🏷️ ${id}: filtro por «${event.target.textContent}»`);
  } else if (event.target.matches('.move')) {
    const column = card.closest('.column');
    const destination = board.querySelector(`[data-column="${nextColumn[column.dataset.column]}"]`);
    destination.append(card); // append de un nodo que ya está en la página lo MUEVE
    logLine(`➡️ ${id}: ${column.dataset.column} → ${destination.dataset.column}`);
  } else {
    logLine(`📄 ${id}: clic en la tarjeta (${event.target.tagName})`);
  }
});
logLine('Listo: pulsa una etiqueta, «Mover →» dos veces y el título de una tarjeta');

// Aquí target siempre es el botón (solo contienen texto), así que matches
// basta. Si los botones tuvieran iconos dentro, usarías
// event.target.closest('.tag') en vez de matches (lección «Propagación»).
// La tarjeta movida sigue respondiendo: el listener está en el tablero.
```

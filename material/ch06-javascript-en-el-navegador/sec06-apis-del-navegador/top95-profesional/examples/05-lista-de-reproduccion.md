---
example_description: "Una lista de reproducción que se reordena de tres formas con una sola función: arrastrando (tipo propio, línea de inserción calculada con el puntero), con Alt + ↑/↓ y con botones; cada cambio se anima con FLIP (element.animate, nada si se pide menos movimiento), se anuncia en una región aria-live y conserva el foco en la canción movida"
example_tags: "javascript|drag-and-drop|teclado|flip|web-animations|aria-live|prefers-reduced-motion|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Boleros para la sobremesa</h1>
  <p id="help" class="help">Arrastra una canción, o enfócala y pulsa Alt + ↑ / Alt + ↓. También tienes los botones de cada fila.</p>
  <ol id="playlist" class="playlist" aria-describedby="help"></ol>
  <p class="total">Duración total: <output id="total">—</output></p>
  <p id="announcer" class="visually-hidden" aria-live="assertive"></p>
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
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
}
.help {
  margin: 0 0 0.75rem;
  color: #52606d;
}
.playlist {
  display: grid;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.track {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.6rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  cursor: grab;
}
.track.dragging {
  opacity: 0.4;
}
/* La línea de inserción: dónde caerá la canción. */
.track.drop-before::before,
.track.drop-after::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  height: 3px;
  border-radius: 2px;
  background: #1d4ed8;
}
.track.drop-before::before {
  top: -0.3rem;
}
.track.drop-after::after {
  bottom: -0.3rem;
}
.grip {
  color: #7b8794;
}
.title strong {
  display: block;
}
.title span,
.duration {
  font-size: 0.85rem;
  color: #52606d;
  font-variant-numeric: tabular-nums;
}
.moves {
  display: flex;
  gap: 0.25rem;
}
.moves button {
  font: inherit;
  padding: 0.1rem 0.4rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
.moves button:disabled {
  visibility: hidden;
}
.track:focus-visible,
.moves button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.total {
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
// LISTA DE REPRODUCCIÓN QUE SE REORDENA.
//
// Decisiones de diseño:
// - Una sola función, moveTrack(id, posición, cómo), para las tres entradas:
//   arrastre nativo, Alt + flechas y botones. Las entradas solo calculan la
//   posición de destino.
// - El arrastre lleva un tipo propio (application/x-track); en dragover se
//   comprueba con types y se calcula si el puntero está en la mitad de arriba
//   o de abajo de la fila: la línea de inserción enseña dónde caerá.
// - FLIP con element.animate (módulo «Gráficos y animación»): medir antes,
//   mover en el DOM, medir después y animar translate de la diferencia a 0.
//   Con prefers-reduced-motion (leído con matchMedia, en vivo), sin animación.
// - Accesibilidad: cada fila es enfocable y describe el atajo; tras mover, el
//   foco sigue en la fila (mover un nodo le quita el foco) y una región
//   aria-live anuncia la nueva posición, que no se ve si no miras.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos,
// gráficos y animación, y este módulo.

const TRACK_TYPE = 'application/x-track';
const TRACKS = [
  { id: 'cielito', title: 'Cielito lindo', author: 'Quirino Mendoza y Cortés', seconds: 196 },
  { id: 'besame', title: 'Bésame mucho', author: 'Consuelo Velázquez', seconds: 214 },
  { id: 'llorona', title: 'La llorona', author: 'Tradicional', seconds: 245 },
  { id: 'sabor', title: 'Sabor a mí', author: 'Álvaro Carrillo', seconds: 187 },
  { id: 'solamente', title: 'Solamente una vez', author: 'Agustín Lara', seconds: 203 },
  { id: 'granada', title: 'Granada', author: 'Agustín Lara', seconds: 255 },
];
const playlist = document.querySelector('#playlist');
const announcer = document.querySelector('#announcer');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

// ── Pintar ───────────────────────────────────────────────────────────────
for (const track of TRACKS) {
  const item = document.createElement('li');
  item.className = 'track';
  item.draggable = true;
  item.tabIndex = 0;
  item.dataset.id = track.id;
  item.setAttribute('aria-label', `${track.title}, de ${track.author}`);
  const grip = document.createElement('span');
  grip.className = 'grip';
  grip.setAttribute('aria-hidden', 'true');
  grip.textContent = '⠿';
  const title = document.createElement('span');
  title.className = 'title';
  const name = document.createElement('strong');
  name.textContent = track.title;
  const author = document.createElement('span');
  author.textContent = track.author;
  title.append(name, author);
  const duration = document.createElement('span');
  duration.className = 'duration';
  duration.textContent = clock(track.seconds);
  const moves = document.createElement('span');
  moves.className = 'moves';
  for (const [direction, text, label] of [[-1, '▲', 'Subir'], [1, '▼', 'Bajar']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.direction = direction;
    button.textContent = text;
    button.setAttribute('aria-label', `${label} ${track.title}`);
    moves.append(button);
  }
  item.append(grip, title, duration, moves);
  playlist.append(item);
}
document.querySelector('#total').textContent = clock(TRACKS.reduce((sum, track) => sum + track.seconds, 0));

const items = () => [...playlist.children];
const titleOf = (item) => item.querySelector('strong').textContent;
function updateButtons() {
  const all = items();
  all.forEach((item, index) => {
    const [up, down] = item.querySelectorAll('button');
    up.disabled = index === 0;
    down.disabled = index === all.length - 1;
  });
}
updateButtons();

// ── La única función que mueve, con FLIP ─────────────────────────────────
function moveTrack(id, targetIndex, how, focus = 'item') {
  const all = items();
  const item = all.find((candidate) => candidate.dataset.id === id);
  const from = all.indexOf(item);
  const to = Math.max(0, Math.min(all.length - 1, targetIndex));
  if (from === to) return;
  const first = new Map(all.map((element) => [element, element.getBoundingClientRect().top])); // F
  all.forEach((element) => element.getAnimations().forEach((animation) => animation.cancel()));
  const rest = all.filter((element) => element !== item);
  rest.splice(to, 0, item);
  playlist.append(...rest); // L: el DOM cambia de una vez
  for (const element of rest) {
    const dy = first.get(element) - element.getBoundingClientRect().top; // I
    if (dy !== 0 && !reduceMotion.matches) {
      element.animate([{ translate: `0 ${dy}px` }, { translate: '0 0' }], { duration: 300, easing: 'cubic-bezier(0.2, 0, 0, 1)' }); // P
    }
  }
  updateButtons();
  const message = `${titleOf(item)}, posición ${to + 1} de ${rest.length}`;
  announcer.textContent = message;
  console.log(`🎵 ${message} (${how})`);
  // Mover el nodo le quita el foco: se lo devolvemos (o al botón, si venía de ahí).
  if (focus === 'item') item.focus({ preventScroll: true });
  else {
    const button = item.querySelector(`[data-direction="${focus}"]`);
    (button.disabled ? item : button).focus({ preventScroll: true });
  }
}

// ── Teclado y botones ────────────────────────────────────────────────────
playlist.addEventListener('keydown', (event) => {
  const item = event.target.closest('.track');
  if (!item || event.target !== item || !event.altKey) return;
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
  event.preventDefault();
  moveTrack(item.dataset.id, items().indexOf(item) + (event.key === 'ArrowDown' ? 1 : -1), 'teclado');
});
playlist.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const item = button.closest('.track');
  moveTrack(item.dataset.id, items().indexOf(item) + Number(button.dataset.direction), 'botón', button.dataset.direction);
});

// ── Arrastre nativo ──────────────────────────────────────────────────────
let dropTarget = null;
function clearMarker() {
  dropTarget?.item.classList.remove('drop-before', 'drop-after');
  dropTarget = null;
}
playlist.addEventListener('dragstart', (event) => {
  const item = event.target.closest('.track');
  event.dataTransfer.setData(TRACK_TYPE, item.dataset.id);
  event.dataTransfer.effectAllowed = 'move';
  item.classList.add('dragging');
});
playlist.addEventListener('dragover', (event) => {
  const item = event.target.closest('.track');
  if (!item || !event.dataTransfer.types.includes(TRACK_TYPE)) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  const rect = item.getBoundingClientRect();
  const after = event.clientY > rect.top + rect.height / 2; // ¿mitad de abajo?
  if (dropTarget?.item === item && dropTarget.after === after) return;
  clearMarker();
  dropTarget = { item, after };
  item.classList.add(after ? 'drop-after' : 'drop-before');
});
playlist.addEventListener('dragleave', (event) => {
  if (!playlist.contains(event.relatedTarget)) clearMarker();
});
playlist.addEventListener('drop', (event) => {
  if (!dropTarget) return;
  event.preventDefault();
  const id = event.dataTransfer.getData(TRACK_TYPE);
  const all = items();
  const dragged = all.find((item) => item.dataset.id === id);
  let index = all.indexOf(dropTarget.item) + (dropTarget.after ? 1 : 0);
  if (all.indexOf(dragged) < index) index -= 1; // al sacarla, las de detrás suben una
  clearMarker();
  moveTrack(id, index, 'arrastre');
});
playlist.addEventListener('dragend', (event) => {
  event.target.closest('.track')?.classList.remove('dragging');
  clearMarker();
});

// ── Comprobaciones al cargar ─────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const order = () => items().map((item) => item.dataset.id).join(' ');
const itemOf = (id) => playlist.querySelector(`[data-id="${id}"]`);
audit('6 canciones · duración total', `${items().length} · ${document.querySelector('#total').textContent}`, '6 · 21:40');
itemOf('cielito').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }));
audit('Alt + ↓ en «Cielito lindo»', `${items().indexOf(itemOf('cielito')) + 1} · ${announcer.textContent}`, '2 · Cielito lindo, posición 2 de 6');
audit('el foco sigue en la canción movida', document.activeElement === itemOf('cielito'), true);
itemOf('granada').querySelector('[data-direction="-1"]').click();
audit('▲ en «Granada»', order(), 'besame cielito llorona sabor granada solamente');
const data = new DataTransfer();
const first = items()[0];
itemOf('sabor').dispatchEvent(new DragEvent('dragstart', { dataTransfer: data, bubbles: true }));
first.dispatchEvent(new DragEvent('dragover', { dataTransfer: data, bubbles: true, cancelable: true, clientY: first.getBoundingClientRect().top + 2 }));
first.dispatchEvent(new DragEvent('drop', { dataTransfer: data, bubbles: true, cancelable: true }));
itemOf('sabor').dispatchEvent(new DragEvent('dragend', { dataTransfer: data, bubbles: true }));
audit('arrastrar «Sabor a mí» encima de la primera', order(), 'sabor besame cielito llorona granada solamente');
audit('los botones de los extremos se ocultan', `${items()[0].querySelector('button').disabled} · ${items().at(-1).querySelectorAll('button')[1].disabled}`, 'true · true');
console.log('Listo: arrastra las canciones, usa Alt + ↑/↓ con una fila enfocada, o los botones ▲ ▼');
```

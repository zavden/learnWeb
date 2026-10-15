---
example_description: "Una lista reordenable: se arrastra por el asa con Pointer Events (captura, touch-action, posiciones medidas una vez, una línea que marca dónde caerá) o con el teclado (Espacio para agarrar, ↑ ↓ para mover, Espacio para soltar, Escape para cancelar); cada paso se anuncia en una región aria-live y el resultado sale en un evento list:reorder"
example_tags: "javascript|eventos|profesional|reordenar|pointer-events|teclado|aria-live|customevent"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="route">
  <h1>Ruta de reparto del jueves</h1>
  <p id="route-help" class="help">Arrastra una parada por su asa ⠿. Con el teclado: Tab hasta el asa, Espacio para agarrarla, ↑ ↓ para moverla, Espacio para soltarla y Escape para cancelar.</p>
  <ol id="stops" class="stops">
    <li data-stop-id="S1"><button type="button" class="handle" aria-describedby="route-help">⠿<span class="visually-hidden">Mover «Mercado de San Juan»</span></button> Mercado de San Juan</li>
    <li data-stop-id="S2"><button type="button" class="handle" aria-describedby="route-help">⠿<span class="visually-hidden">Mover «Café El Jarocho»</span></button> Café El Jarocho</li>
    <li data-stop-id="S3"><button type="button" class="handle" aria-describedby="route-help">⠿<span class="visually-hidden">Mover «Panadería Rosetta»</span></button> Panadería Rosetta</li>
    <li data-stop-id="S4"><button type="button" class="handle" aria-describedby="route-help">⠿<span class="visually-hidden">Mover «Restaurante Azul Histórico»</span></button> Restaurante Azul Histórico</li>
    <li data-stop-id="S5"><button type="button" class="handle" aria-describedby="route-help">⠿<span class="visually-hidden">Mover «Tostaduría La Ceiba»</span></button> Tostaduría La Ceiba</li>
  </ol>
  <p id="announcer" class="visually-hidden" aria-live="assertive"></p>
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
.route {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin-top: 0;
}
.help {
  color: var(--muted);
  font-size: 0.9rem;
}
.stops {
  display: grid;
  gap: 0.4rem;
  padding-left: 1.75rem;
}
.stops li {
  position: relative;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface);
}
.stops li.is-grabbed {
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 6px 16px rgb(0 0 0 / 0.18);
  z-index: 1;
}
/* La línea que marca dónde caerá la parada. */
.stops li.drop-before::before,
.stops li.drop-after::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent);
}
.stops li.drop-before::before {
  top: -0.3rem;
}
.stops li.drop-after::after {
  bottom: -0.3rem;
}
.handle {
  font: inherit;
  padding: 0 0.35rem;
  border: 1px solid var(--muted);
  border-radius: 0.3rem;
  background: var(--surface);
  color: var(--ink);
  cursor: grab;
  touch-action: none;
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
// Lista reordenable con puntero y con teclado.
//
// Decisiones de diseño:
// - Durante el arrastre la parada NO se mueve en el DOM: sigue al puntero con
//   translate y una línea marca dónde caerá. Solo al soltar se mueve (con
//   insertBefore), una vez. Así las posiciones medidas al empezar (un solo
//   getBoundingClientRect por parada) siguen valiendo todo el arrastre.
// - El teclado tiene su propio «modo agarrado»: Espacio/Enter en el asa.
//   Cancelamos el keydown de esas teclas para que no se convierta en click.
// - Cada paso se anuncia en una región aria-live (para quien no ve la línea).
// - Al terminar, la lista avisa con list:reorder; no sabe quién lo guarda.
// - Mover un nodo que tiene el foco le quita el foco: se le devuelve, pero
//   solo si ya estaba en la lista (la autocomprobación no lo mueve).
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

function createSortable(list, announcer) {
  const items = () => [...list.children];
  const nameOf = (item) => item.lastChild.textContent.trim(); // el texto tras el asa
  const position = (item) => `${items().indexOf(item) + 1} de ${items().length}`;
  const say = (text) => { announcer.textContent = text; };
  let grabbed = null;   // teclado: { item, originalNext }
  let dragging = null;  // puntero: { item, startY, mids, target }

  function moveTo(item, index) {
    const focusWasInside = list.contains(document.activeElement);
    const others = items().filter((other) => other !== item);
    list.insertBefore(item, others[index] ?? null);
    if (focusWasInside) item.querySelector('.handle').focus();
  }
  function finish(item, from) {
    const to = items().indexOf(item);
    if (from !== to) {
      list.dispatchEvent(new CustomEvent('list:reorder', {
        bubbles: true,
        detail: { id: item.dataset.stopId, from, to, order: items().map((each) => each.dataset.stopId) },
      }));
    }
  }

  // ── Teclado
  list.addEventListener('keydown', (event) => {
    const handle = event.target.closest('.handle');
    if (!handle) return;
    const item = handle.closest('li');
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault(); // ni click ni desplazamiento con Espacio
      if (!grabbed) {
        grabbed = { item, from: items().indexOf(item), originalNext: item.nextElementSibling };
        item.classList.add('is-grabbed');
        say(`Agarrada «${nameOf(item)}», posición ${position(item)}.`);
      } else {
        item.classList.remove('is-grabbed');
        say(`«${nameOf(item)}» soltada en la posición ${position(item)}.`);
        const { from } = grabbed;
        grabbed = null;
        finish(item, from);
      }
    } else if (grabbed && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      const index = items().indexOf(item) + (event.key === 'ArrowDown' ? 1 : -1);
      if (index < 0 || index >= items().length) return;
      moveTo(item, index);
      say(`Posición ${position(item)}.`);
    } else if (grabbed && event.key === 'Escape') {
      const focusWasInside = list.contains(document.activeElement);
      list.insertBefore(item, grabbed.originalNext);
      item.classList.remove('is-grabbed');
      grabbed = null;
      if (focusWasInside) handle.focus();
      say(`Cancelado: «${nameOf(item)}» vuelve a la posición ${position(item)}.`);
    }
  });

  // ── Puntero
  function clearMarks() {
    items().forEach((each) => each.classList.remove('drop-before', 'drop-after'));
  }
  list.addEventListener('pointerdown', (event) => {
    const handle = event.target.closest('.handle');
    if (!handle || event.button !== 0 || grabbed) return;
    handle.setPointerCapture(event.pointerId);
    const item = handle.closest('li');
    // Todas las lecturas juntas, al empezar.
    const mids = items().map((each) => {
      const box = each.getBoundingClientRect();
      return box.top + box.height / 2;
    });
    dragging = { item, from: items().indexOf(item), startY: event.clientY, mids, target: null };
    item.classList.add('is-grabbed');
  });
  list.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const { item, startY, mids, from } = dragging;
    item.style.translate = `0 ${event.clientY - startY}px`;
    // Índice de destino: cuántos centros quedan por encima del puntero.
    let target = mids.filter((mid) => mid < event.clientY).length;
    if (target > from) target -= 1; // la propia parada no cuenta
    dragging.target = target;
    clearMarks();
    const others = items().filter((other) => other !== item);
    if (others[target]) others[target].classList.add('drop-before');
    else others.at(-1).classList.add('drop-after');
  });
  function endDrag(drop) {
    if (!dragging) return;
    const { item, from, target } = dragging;
    dragging = null;
    item.classList.remove('is-grabbed');
    item.style.translate = '';
    clearMarks();
    if (drop && target !== null) {
      moveTo(item, target);
      say(`«${nameOf(item)}» soltada en la posición ${position(item)}.`);
      finish(item, from);
    }
  }
  list.addEventListener('pointerup', () => endDrag(true));
  list.addEventListener('pointercancel', () => endDrag(false));

  return { order: () => items().map((each) => each.dataset.stopId) };
}

const stops = createSortable(document.querySelector('#stops'), document.querySelector('#announcer'));
document.addEventListener('list:reorder', (event) => {
  const { id, from, to, order } = event.detail;
  logLine(`↕ ${id}: posición ${from + 1} → ${to + 1} · ruta ${order.join(' ')}`);
});

// ── Autocomprobación (simulada con teclas; deja la ruta como estaba).
function audit() {
  quiet = true;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  const original = stops.order().join(' ');
  const handleOf = (id) => document.querySelector(`[data-stop-id="${id}"] .handle`);
  const press = (id, key) => {
    const keydown = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    handleOf(id).dispatchEvent(keydown);
    return keydown.defaultPrevented;
  };
  expect('5 paradas, cada asa es un botón con nombre', document.querySelectorAll('#stops .handle').length === 5);
  expect('Espacio agarra la parada (y no se convierte en click)', press('S1', ' '));
  press('S1', 'ArrowDown');
  press('S1', 'ArrowDown');
  press('S1', ' ');
  expect('↓ ↓ y Espacio: S1 pasa a la tercera posición', stops.order().join(' ') === 'S2 S3 S1 S4 S5');
  press('S4', 'Enter');
  press('S4', 'ArrowUp');
  press('S4', 'Escape');
  expect('Escape cancela y la devuelve a su sitio', stops.order().join(' ') === 'S2 S3 S1 S4 S5');
  expect('la región aria-live anunció la cancelación', document.querySelector('#announcer').textContent.startsWith('Cancelado'));
  // Restaurar la ruta original.
  const list = document.querySelector('#stops');
  original.split(' ').forEach((id) => list.append(list.querySelector(`[data-stop-id="${id}"]`)));
  document.querySelector('#announcer').textContent = '';
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: arrastra «Panadería Rosetta» al principio; luego Tab hasta un asa, Espacio, ↓ y Espacio');
```

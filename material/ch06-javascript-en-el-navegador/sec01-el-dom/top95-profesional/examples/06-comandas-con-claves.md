---
example_description: "Un tablero de comandas de cocina que se actualiza desde datos con un renderizador por claves: reutiliza el <li> de cada comanda (su nota escrita sigue ahí), crea solo las nuevas, quita las servidas y reordena moviendo nodos con moveBefore en Chrome (conserva el foco) o insertBefore como alternativa"
example_tags: "javascript|dom|profesional|render|claves|movebefore|insertbefore|reutilizar-nodos"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="kitchen">
  <h1>Comandas en cocina</h1>
  <p class="controls">
    <button type="button" id="next">Siguiente actualización</button>
    <span class="field">
      <input type="checkbox" id="live">
      <label for="live">Actualizar sola cada 3 s</label>
    </span>
  </p>
  <ol class="tickets" id="tickets" aria-label="Comandas, de la más urgente a la menos"></ol>
  <p id="stats" role="status"></p>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
.kitchen {
  max-width: 34rem;
  padding: 1rem;
}
h1 {
  margin-top: 0;
  font-size: 1.3rem;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  align-items: center;
}
button,
input {
  font: inherit;
}
.tickets {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;
  list-style: none;
}
/* Rejilla con áreas fijas: código, plato y estado en la primera línea; la nota,
   siempre en su propia línea a todo el ancho. Igual en cualquier anchura. */
.ticket {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    "code dish state"
    "note note note";
  gap: 0.25rem 0.75rem;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-left: 6px solid #94a3b8;
  border-radius: 0.375rem;
}
.ticket[data-state="cocinando"] {
  border-left-color: #b45309;
}
.ticket[data-state="listo"] {
  border-left-color: #15803d;
}
.code {
  grid-area: code;
  font-variant-numeric: tabular-nums;
  color: #475569;
}
.dish {
  grid-area: dish;
  font-weight: 600;
}
.state {
  grid-area: state;
}
.ticket label {
  grid-area: note;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.ticket input {
  flex: 1;
  min-width: 0;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// COMANDAS: UN RENDERIZADOR POR CLAVES.
//
// Decisiones:
// - Cada comanda tiene una clave estable (su código). reconcile() compara la
//   lista nueva con los <li> que ya hay (un Map clave → nodo):
//   · quita los nodos cuya clave ya no está;
//   · reutiliza los que siguen (update() cambia solo su texto y su estado);
//   · crea los que faltan;
//   · y los coloca en orden, MOVIÉNDOLOS (lección «Crear y modificar elementos»).
// - Reutilizar conserva lo que el usuario hizo en el nodo: la nota escrita
//   (la propiedad value) y, con moveBefore (en Chrome), también el foco al
//   moverlo. Sin moveBefore se usa insertBefore, que mueve igual pero hace
//   perder el foco.
// - Nunca innerHTML: los textos de las comandas van con textContent.
// - Las «actualizaciones» son tres fotos fijas del estado de la cocina, que se
//   repiten en ciclo; en una app real llegarían del servidor (módulo «Red y
//   almacenamiento»).
//
// Alcance: HTML, CSS (módulos 1-7), el capítulo de JavaScript y el módulo «El DOM».

const snapshots = [
  [
    { code: 'P-101', dish: 'Tacos al pastor ×3', state: 'en cola' },
    { code: 'P-102', dish: 'Pozole rojo', state: 'en cola' },
    { code: 'P-103', dish: 'Enchiladas suizas', state: 'en cola' },
  ],
  [
    { code: 'P-102', dish: 'Pozole rojo', state: 'cocinando' },
    { code: 'P-104', dish: 'Sopa de lima', state: 'en cola' },
    { code: 'P-101', dish: 'Tacos al pastor ×3', state: 'en cola' },
    { code: 'P-103', dish: 'Enchiladas suizas', state: 'en cola' },
  ],
  [
    { code: 'P-104', dish: 'Sopa de lima', state: 'cocinando' },
    { code: 'P-102', dish: 'Pozole rojo', state: 'listo' },
    { code: 'P-103', dish: 'Enchiladas suizas', state: 'en cola' },
  ],
];

const canMove = typeof Element.prototype.moveBefore === 'function';

function reconcile(list, items, { keyOf, create, update }) {
  const stats = { created: 0, kept: 0, moved: 0, removed: 0 };
  const nodes = new Map([...list.children].map((node) => [node.dataset.key, node]));
  const wanted = new Set(items.map(keyOf));
  for (const [key, node] of nodes) {
    if (!wanted.has(key)) {
      node.remove();
      nodes.delete(key);
      stats.removed += 1;
    }
  }
  items.forEach((item, index) => {
    let node = nodes.get(keyOf(item));
    const isNew = node === undefined;
    if (isNew) {
      node = create(item);
      stats.created += 1;
    } else {
      stats.kept += 1;
    }
    update(node, item);
    const reference = list.children[index] ?? null; // children es viva: siempre la posición actual
    if (reference === node) return; // ya está en su sitio
    if (!isNew && canMove) list.moveBefore(node, reference); // mueve sin sacarlo del documento
    else list.insertBefore(node, reference);
    if (!isNew) stats.moved += 1;
  });
  return stats;
}

function createTicket(order) {
  const item = document.createElement('li');
  item.className = 'ticket';
  item.dataset.key = order.code;
  const code = document.createElement('span');
  code.className = 'code';
  code.textContent = order.code;
  const dish = document.createElement('span');
  dish.className = 'dish';
  const state = document.createElement('span');
  state.className = 'state';
  const label = document.createElement('label');
  const note = document.createElement('input');
  note.type = 'text';
  note.name = `note-${order.code}`;
  label.append('Nota ', note);
  item.append(code, dish, state, label);
  return item;
}

function updateTicket(item, order) {
  item.querySelector('.dish').textContent = order.dish;
  item.querySelector('.state').textContent = order.state;
  item.dataset.state = order.state;
}

const list = document.querySelector('#tickets');
const statsLine = document.querySelector('#stats');
let step = 0;

function showSnapshot(index) {
  const stats = reconcile(list, snapshots[index], { keyOf: (order) => order.code, create: createTicket, update: updateTicket });
  statsLine.textContent = `Actualización ${index + 1}: ${stats.created} nuevas, ${stats.kept} reutilizadas, ${stats.moved} movidas, ${stats.removed} servidas`;
  return stats;
}

// Botón y casilla (eventos: módulo siguiente); setInterval, módulo «Asincronía».
let timer = null;
const next = () => {
  step = (step + 1) % snapshots.length;
  showSnapshot(step);
};
document.querySelector('#next').addEventListener('click', next);
const live = document.querySelector('#live');
live.addEventListener('change', () => {
  clearInterval(timer);
  timer = live.checked ? setInterval(next, 3000) : null;
});

// ── Comprobaciones al cargar ────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const order = () => [...list.children].map((item) => item.dataset.key).join(' ');
const summary = (stats) => `+${stats.created} =${stats.kept} ↕${stats.moved} −${stats.removed}`;

console.log('cómo se mueven los nodos →', canMove ? 'moveBefore (conserva el foco)' : 'insertBefore');
const s1 = showSnapshot(0);
audit('actualización 1', `${order()} | ${summary(s1)}`, 'P-101 P-102 P-103 | +3 =0 ↕0 −0');
const pozole = list.querySelector('[data-key="P-102"]');
pozole.querySelector('input').value = 'sin rábano'; // lo que escribiría un cocinero
const s2 = showSnapshot(1);
audit('actualización 2', `${order()} | ${summary(s2)}`, 'P-102 P-104 P-101 P-103 | +1 =3 ↕1 −0');
const s3 = showSnapshot(2);
audit('actualización 3', `${order()} | ${summary(s3)}`, 'P-104 P-102 P-103 | +0 =3 ↕1 −1');
audit('el pozole es el mismo <li> de siempre', list.querySelector('[data-key="P-102"]') === pozole, true);
audit('su nota sigue escrita', pozole.querySelector('input').value, 'sin rábano');
audit('estado del pozole', pozole.dataset.state, 'listo');
step = 2;
```

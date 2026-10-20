---
example_description: "Una lista de 10 000 pedidos que solo tiene en el DOM las filas que se ven (y unas pocas de margen): un espaciador con la altura total da la barra de scroll, y en cada scroll se reutiliza un grupo fijo de <li> colocados con top; aria-setsize y aria-posinset dicen a los lectores de pantalla dónde están"
example_tags: "javascript|dom|profesional|virtualizacion|scroll|rendimiento|aria|medidas"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="orders">
  <h1>Pedidos de 2026</h1>
  <p class="jump">
    <label for="jump-to">Ir al pedido</label>
    <input id="jump-to" type="number" min="1" max="10000" value="5000">
    <button type="button" id="go">Ir</button>
  </p>
  <div class="viewport" id="viewport" tabindex="0" role="region" aria-label="Lista de pedidos">
    <ol class="spacer" id="spacer"></ol>
  </div>
  <p id="info" role="status"></p>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
.orders {
  max-width: 40rem;
  padding: 1rem;
}
h1 {
  margin-top: 0;
  font-size: 1.3rem;
}
.jump {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
input,
button {
  font: inherit;
}
input {
  width: 6rem;
}
.viewport {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #94a3b8;
}
.spacer {
  position: relative; /* las filas se colocan con top dentro de él */
  margin: 0;
  padding: 0;
  list-style: none;
}
.order {
  position: absolute;
  left: 0;
  right: 0;
  box-sizing: border-box;
  height: 36px;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0 0.75rem;
  white-space: nowrap;
  border-bottom: 1px solid #e2e8f0;
}
.number {
  min-width: 4rem;
  font-variant-numeric: tabular-nums;
}
.customer {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}
.total {
  font-variant-numeric: tabular-nums;
}
.status-cancelado {
  color: #475569;
  text-decoration: line-through;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// LISTA VIRTUALIZADA: 10 000 PEDIDOS, UNAS 15 FILAS EN EL DOM.
//
// Decisiones:
// - Crear 10 000 <li> funcionaría, pero cada medida y cada estilo tendría que
//   recorrerlos. Aquí el DOM solo tiene las filas visibles + OVERSCAN por
//   arriba y por abajo; el <ol> mide lo que medirían todas (COUNT × alto),
//   así que la barra de scroll es la de verdad.
// - El alto de fila se MIDE una vez con una fila de prueba (el CSS dice 36px).
// - Las filas forman un grupo que se reutiliza: al hacer scroll solo cambian
//   su texto y su top. Nada se crea ni se destruye salvo que haga falta más.
// - En cada scroll: primero las lecturas (scrollTop, clientHeight), después
//   las escrituras (lección «Medidas y layout»).
// - Fechas con timeZone 'UTC' y formato numérico: la salida es la misma en
//   cualquier zona horaria.
//
// Alcance: HTML, CSS (módulos 1-7), el capítulo de JavaScript y el módulo «El DOM».

const COUNT = 10_000;
const OVERSCAN = 4;
const CUSTOMERS = ['Ana López', 'Bruno Díaz', 'Carmen Ruiz', 'Diego Pérez', 'Elena Gómez', 'Fernando Vega', 'Gabriela Soto'];
const STATUSES = ['Entregado', 'En camino', 'Preparando', 'Cancelado'];
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const shortDate = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });

function makeOrder(number) {
  return {
    number,
    customer: CUSTOMERS[(number * 3) % CUSTOMERS.length],
    status: STATUSES[(number * 7) % STATUSES.length],
    date: shortDate.format(Date.UTC(2026, 0, 1 + ((number * 11) % 365))),
    total: 120 + ((number * 7919) % 2880),
  };
}
const orders = Array.from({ length: COUNT }, (_, index) => makeOrder(index + 1));

const viewport = document.querySelector('#viewport');
const spacer = document.querySelector('#spacer');
const info = document.querySelector('#info');
const pool = []; // las filas reutilizables

function createRow() {
  const row = document.createElement('li');
  row.className = 'order';
  row.setAttribute('aria-setsize', COUNT);
  for (const part of ['number', 'date', 'customer', 'status', 'total']) {
    const span = document.createElement('span');
    span.className = part;
    row.append(span);
  }
  return row;
}

function fillRow(row, order, rowHeight) {
  row.style.top = `${(order.number - 1) * rowHeight}px`;
  row.setAttribute('aria-posinset', order.number);
  const [number, date, customer, status, total] = row.children;
  number.textContent = `#${order.number}`;
  date.textContent = order.date;
  customer.textContent = order.customer;
  status.textContent = order.status;
  total.textContent = money.format(order.total);
  row.classList.toggle('status-cancelado', order.status === 'Cancelado');
  row.hidden = false;
}

// El alto de una fila, medido (no copiado del CSS).
const probe = createRow();
spacer.append(probe);
const ROW_HEIGHT = probe.getBoundingClientRect().height;
probe.remove();
spacer.style.height = `${COUNT * ROW_HEIGHT}px`;

function renderWindow() {
  // Lecturas
  const scrollTop = viewport.scrollTop;
  const height = viewport.clientHeight;
  // Cálculos
  const first = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const last = Math.min(COUNT - 1, Math.ceil((scrollTop + height) / ROW_HEIGHT) + OVERSCAN - 1);
  const needed = last - first + 1;
  // Escrituras
  while (pool.length < needed) {
    const row = createRow();
    pool.push(row);
    spacer.append(row);
  }
  pool.forEach((row, offset) => {
    if (offset < needed) fillRow(row, orders[first + offset], ROW_HEIGHT);
    else row.hidden = true; // sobra: se esconde, no se borra
  });
  info.textContent = `Pedidos ${first + 1}–${last + 1} de ${COUNT} en el DOM`;
  return { first, last, needed };
}

function jumpTo(number) {
  viewport.scrollTop = (number - 1) * ROW_HEIGHT;
  return renderWindow();
}

// Eventos (módulo siguiente): el scroll de la lista y el botón «Ir».
viewport.addEventListener('scroll', renderWindow);
const jumpInput = document.querySelector('#jump-to');
document.querySelector('#go').addEventListener('click', () => {
  const number = Math.min(COUNT, Math.max(1, Math.round(Number(jumpInput.value)) || 1));
  jumpTo(number);
});

// ── Comprobaciones al cargar ────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const rowAtTop = () => {
  const top = viewport.getBoundingClientRect().top + viewport.clientTop;
  return pool.find((row) => !row.hidden && Math.abs(row.getBoundingClientRect().top - top) < 0.5);
};

renderWindow();
audit('alto de fila medido', ROW_HEIGHT, 36);
audit('alto total del scroll', viewport.scrollHeight, COUNT * 36);
audit('filas en el DOM al empezar', spacer.children.length, 13);
const rowsBefore = new Set(pool);
jumpTo(5000);
const rowText = (row) => (row === undefined ? '(ninguna)' : [...row.children].map((part) => part.textContent).join(' · '));
audit('arriba tras ir al 5000', rowText(rowAtTop()), '#5000 · 08/09 · Gabriela Soto · Entregado · $880.00');
audit('filas en el DOM en mitad de la lista', spacer.children.length, 17);
audit('las 13 primeras filas se reutilizan', [...rowsBefore].every((row) => row.isConnected), true);
jumpTo(10000);
audit('el último pedido', [...spacer.querySelectorAll('[aria-posinset]:not([hidden])')].at(-1).getAttribute('aria-posinset'), '10000');
audit('filas visibles al final', pool.filter((row) => !row.hidden).length, 13);
jumpTo(1);
```

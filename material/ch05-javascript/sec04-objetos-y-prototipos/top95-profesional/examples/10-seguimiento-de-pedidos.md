---
example_description: "Seguimiento de pedidos con una máquina de estados: cada estado es un objeto congelado que delega en un estado base que rechaza todo, las acciones disponibles se deducen de los métodos propios y una interfaz accesible muestra botones, avisos y la línea de tiempo"
example_tags: "javascript|profesional|maquina-de-estados|delegacion|accesibilidad|interfaz"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Seguimiento de pedidos</h1>
  <p class="intro">Cada pedido avanza por sus estados con los botones. Los que no se pueden usar en el estado actual siguen siendo pulsables: al pulsarlos, el aviso explica por qué no.</p>
  <div class="orders" id="orders"></div>
</main>
```

# CSS

```css
:root {
  --text: #1f2933;
  --muted: #52606d;
  --page: #f5f7fa;
  --surface: #ffffff;
  --border: #c3cad3;
  --accent: #1d4ed8;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--page);
}
.app {
  max-width: 64rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
}
h1 {
  margin: 0;
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
}
.intro {
  color: var(--muted);
  max-width: 60ch;
}
.orders {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
}
.order {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
}
.order-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}
.order h2 {
  margin: 0;
  font-size: 1.15rem;
}
.summary {
  margin: 0.25rem 0 0.75rem;
  color: var(--muted);
}
.status {
  margin: 0;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
}
.status[data-tone='warning'] { background: #fef3c7; color: #92400e; }
.status[data-tone='info'] { background: #dbeafe; color: #1e40af; }
.status[data-tone='success'] { background: #dcfce7; color: #166534; }
.status[data-tone='danger'] { background: #fee2e2; color: #991b1b; }
.status[data-tone='neutral'] { background: #f1f5f9; color: #334155; }
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.actions button,
.wait {
  font: inherit;
  font-size: 0.95rem;
  padding: 0.4rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #ffffff;
  cursor: pointer;
}
.actions button[aria-disabled='true'] {
  background: var(--surface);
  color: var(--muted);
  border-color: #7b8794;
  border-style: dashed;
  cursor: not-allowed;
}
.wait {
  margin-top: 0.75rem;
  background: var(--surface);
  color: var(--accent);
}
.actions button:focus-visible,
.wait:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.message {
  min-height: 1.5em;
  margin: 0.75rem 0 0;
  font-weight: 600;
}
.message.is-error {
  color: #991b1b;
}
.message.is-ok {
  color: #166534;
}
.timeline {
  margin: 0.75rem 0 0;
  padding-left: 1.25rem;
  font-size: 0.95rem;
}
.timeline time {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
```

# JavaScript

```javascript
// SEGUIMIENTO DE PEDIDOS con una máquina de estados.
//
// Decisiones:
// - Cada estado es un objeto CONGELADO que delega en baseState. baseState tiene un
//   método por acción que rechaza (lanza un error con un mensaje claro); cada estado solo
//   escribe los métodos de las acciones que SÍ admite, y así sombrea el rechazo.
// - Las acciones disponibles no se apuntan en ninguna lista aparte: son los métodos
//   PROPIOS del estado (Object.hasOwn). Añadir una transición es escribir un método.
// - Un estado puede aceptar con condiciones y, si no se cumplen, volver al rechazo del
//   padre nombrándolo (baseState.reject.call(this, …)): la devolución, con plazo.
// - Los estados son compartidos por todos los pedidos; los datos (estado actual, reloj,
//   historial) son de cada OrderTracker.
// - El reloj es simulado (cada acción suma un tiempo fijo) y las horas se muestran con
//   Intl en Europe/Madrid: la salida es la misma en cualquier ordenador.
// - Accesible: los botones no disponibles usan aria-disabled (siguen recibiendo el foco
//   y explican por qué no), los avisos van en una región role="status" y la línea de
//   tiempo es una lista ordenada con <time datetime>.
//
// Alcance: módulos 1-4. createElement, append, replaceChildren, dataset y
// addEventListener se estudian en el capítulo 6.

function extendPrototype(Type, members) {
  for (const [key, value] of Object.entries(members)) {
    Object.defineProperty(Type.prototype, key, { value, writable: true, enumerable: false, configurable: true });
  }
}
const DAY_MS = 86_400_000;
const RETURN_DAYS = 14;
const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const clock = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Madrid' });

const ACTIONS = Object.freeze({
  pay: { button: 'Registrar pago', verb: 'pagar', done: 'Pago registrado', minutes: 12 },
  ship: { button: 'Enviar', verb: 'enviar', done: 'Enviado con Correos Express', minutes: 26 * 60 },
  deliver: { button: 'Confirmar entrega', verb: 'entregar', done: 'Entregado', minutes: 2 * 24 * 60 },
  requestReturn: { button: 'Pedir devolución', verb: 'devolver', done: 'Devolución solicitada', minutes: 3 * 24 * 60 },
  refund: { button: 'Reembolsar', verb: 'reembolsar', done: 'Importe reembolsado', minutes: 2 * 24 * 60 },
  cancel: { button: 'Cancelar', verb: 'cancelar', done: 'Pedido cancelado', minutes: 20 },
});

// ── Estados ─────────────────────────────────────────────────────────────
const baseState = {
  name: 'base',
  label: '—',
  tone: 'neutral',
  enter() {}, // gancho: por defecto, nada
  reject(action, reason = '') {
    throw new Error(`No se puede ${ACTIONS[action].verb} un pedido «${this.label.toLowerCase()}»${reason ? `: ${reason}` : ''}.`);
  },
};
for (const action of Object.keys(ACTIONS)) {
  baseState[action] = function () {
    return this.reject(action); // this: el estado concreto que delega aquí
  };
}
Object.freeze(baseState);

// Object.create con DESCRIPTORES, no Object.assign: baseState está congelado, y una
// asignación no puede sombrear una propiedad heredada de solo lectura (fallaría).
const defineState = (name, members) =>
  Object.freeze(Object.create(baseState, Object.getOwnPropertyDescriptors({ name, ...members })));
const STATES = Object.freeze({
  pending: defineState('pending', {
    label: 'Pendiente de pago', tone: 'warning',
    pay: () => 'paid',
    cancel: () => 'cancelled',
  }),
  paid: defineState('paid', {
    label: 'Pagado', tone: 'info',
    ship: () => 'shipped',
    cancel: () => 'refunded', // cancelar tras pagar devuelve el dinero
  }),
  shipped: defineState('shipped', {
    label: 'En camino', tone: 'info',
    enter(order) { order.tracking = `CEX-${order.id}-ES`; },
    deliver: () => 'delivered',
  }),
  delivered: defineState('delivered', {
    label: 'Entregado', tone: 'success',
    enter(order, now) { order.deliveredAt = now; },
    requestReturn(order, now) {
      const days = Math.floor((now - order.deliveredAt) / DAY_MS);
      if (days > RETURN_DAYS) return baseState.reject.call(this, 'requestReturn', `el plazo de ${RETURN_DAYS} días terminó hace ${days - RETURN_DAYS} días`);
      return 'returnRequested';
    },
  }),
  returnRequested: defineState('returnRequested', {
    label: 'Devolución en curso', tone: 'warning',
    refund: () => 'refunded',
  }),
  cancelled: defineState('cancelled', { label: 'Cancelado', tone: 'neutral' }),
  refunded: defineState('refunded', { label: 'Reembolsado', tone: 'danger' }),
});

// ── El seguimiento de un pedido ─────────────────────────────────────────
function OrderTracker(order, createdAt) {
  this.order = order;
  this.now = Date.parse(createdAt);
  this.state = STATES.pending;
  Object.defineProperty(this, 'history', { value: [] });
  this.record('Pedido creado');
}
extendPrototype(OrderTracker, {
  can(action) {
    return Object.hasOwn(this.state, action); // propio = admitido; heredado = el rechazo de baseState
  },
  dispatch(action) {
    const at = this.now + ACTIONS[action].minutes * 60_000;
    const nextName = this.state[action](this.order, at); // lanza si el estado no lo admite
    const previous = this.state;
    this.now = at;
    this.state = STATES[nextName];
    this.state.enter(this.order, at);
    this.record(ACTIONS[action].done);
    console.log(`#${this.order.id}: ${previous.name} → ${this.state.name} (${action})`);
  },
  wait(days) {
    this.now += days * DAY_MS;
    this.record(`Pasan ${days} días`);
  },
  record(text) {
    this.history.push({ at: this.now, text });
  },
});

// ── Interfaz ────────────────────────────────────────────────────────────
function renderCard(tracker) {
  const { id, customer, items, totalCents } = tracker.order;
  const card = document.createElement('article');
  card.className = 'order';
  card.setAttribute('aria-labelledby', `order-${id}-title`);
  // La plantilla solo lleva el número de pedido; los textos de los datos van con textContent.
  card.innerHTML = `
    <div class="order-header">
      <h2 id="order-${id}-title">Pedido #${id}</h2>
      <p class="status"></p>
    </div>
    <p class="summary"></p>
    <div class="actions" role="group" aria-label="Acciones del pedido #${id}"></div>
    <button class="wait" type="button">⏩ Avanzar 15 días</button>
    <p class="message" role="status"></p>
    <ol class="timeline" aria-label="Historial del pedido #${id}"></ol>`;
  card.querySelector('.summary').textContent = `${customer} · ${items} artículos · ${euros.format(totalCents / 100)}`;
  const status = card.querySelector('.status');
  const actions = card.querySelector('.actions');
  const message = card.querySelector('.message');
  const timeline = card.querySelector('.timeline');

  const say = (text, kind) => {
    message.textContent = text;
    message.className = `message is-${kind}`;
  };
  const update = () => {
    status.textContent = tracker.state.label;
    status.dataset.tone = tracker.state.tone;
    for (const button of actions.children) button.setAttribute('aria-disabled', String(!tracker.can(button.dataset.action)));
    timeline.replaceChildren(...tracker.history.map(({ at, text }) => {
      const item = document.createElement('li');
      const time = document.createElement('time');
      time.dateTime = new Date(at).toISOString();
      time.textContent = clock.format(at);
      item.append(time, ` — ${text}`);
      return item;
    }));
  };

  // Los botones se crean UNA vez y solo cambian sus atributos: el foco no se pierde.
  for (const [action, { button: text, done }] of Object.entries(ACTIONS)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.action = action;
    button.textContent = text;
    button.addEventListener('click', () => {
      try {
        tracker.dispatch(action);
        say(`✓ ${done}${action === 'ship' ? ` (seguimiento ${tracker.order.tracking})` : ''}.`, 'ok');
      } catch (error) {
        say(error.message, 'error');
      }
      update();
    });
    actions.append(button);
  }
  card.querySelector('.wait').addEventListener('click', () => {
    tracker.wait(15);
    say('Han pasado 15 días.', 'ok');
    update();
  });
  update();
  return card;
}

const trackers = [
  new OrderTracker({ id: 1042, customer: 'Lucía Moreno', items: 3, totalCents: 6490 }, '2026-10-05T09:15:00Z'),
  new OrderTracker({ id: 1043, customer: 'Iker Sanz', items: 1, totalCents: 12900 }, '2026-10-05T10:40:00Z'),
];
document.querySelector('#orders').append(...trackers.map(renderCard));

// En la consola: las acciones de cada estado salen de sus métodos PROPIOS.
const table = {};
for (const state of Object.values(STATES)) {
  table[state.name] = { etiqueta: state.label, acciones: Object.keys(ACTIONS).filter((action) => Object.hasOwn(state, action)).join(', ') || '— (final)' };
}
console.table(table);
console.log('¿todos delegan en baseState? →', Object.values(STATES).every((state) => Object.getPrototypeOf(state) === baseState));
```

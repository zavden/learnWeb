---
example_description: "El ciclo de vida de un pedido como máquina de estados: los eventos se llaman order.pay, order.ship… (tipos de plantilla), la tabla de transiciones es as const satisfies un tipo mapeado sobre los estados, EventsFrom<S> da los eventos posibles en cada estado y la interfaz solo ofrece botones para esos"
example_tags: "typescript|profesional|maquina-de-estados|template-literal-types|infer|satisfies|tipos-mapeados|keyof|dom|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Pedido P-3107 · Mezcal espadín ×2</h1>
  <ol id="steps" class="steps" aria-label="Estado del pedido"></ol>
  <p id="state" class="state" role="status"></p>
  <div id="actions" class="actions" role="group" aria-label="Acciones posibles"></div>
  <p><button type="button" id="restart">Empezar otro pedido</button></p>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --soft: #d9e2ec; --accent: #1d4ed8; --done: #166534; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
.app { max-width: 34rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.75rem; }
.steps { list-style: none; display: flex; flex-wrap: wrap; gap: 0.35rem; margin: 0; padding: 0; counter-reset: step; }
.steps li { padding: 0.2rem 0.6rem; border: 1px solid var(--soft); border-radius: 1rem; background: #fff; color: var(--muted); font-size: 0.9rem; }
.steps li.done { border-color: var(--done); color: var(--done); }
.steps li[aria-current="step"] { border: 2px solid var(--accent); color: var(--ink); font-weight: 700; }
.state { margin: 0.75rem 0 0.5rem; font-weight: 600; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; min-height: 2.2rem; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; color: var(--ink); cursor: pointer; }
.actions button { border-color: var(--accent); background: var(--accent); color: #fff; }
.actions button.danger { border-color: #b91c1c; background: #fff; color: #b91c1c; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.log { font-size: 0.85rem; color: var(--muted); }
```

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// ── Estados y eventos ─────────────────────────────────────────────────────
const STATES = ['cart', 'checkout', 'paid', 'shipped', 'delivered', 'cancelled'] as const;
type OrderState = (typeof STATES)[number];
const VERBS = ['checkout', 'pay', 'ship', 'deliver', 'cancel', 'reopen'] as const;
type Verb = (typeof VERBS)[number];
type OrderEvent = `order.${Verb}`; // 'order.checkout' | 'order.pay' | …
type VerbOf<E> = E extends `order.${infer V}` ? V : never; // y de vuelta, con infer

// La máquina: para CADA estado (tipo mapeado), los eventos que acepta y a dónde lleva cada uno.
const MACHINE = {
  cart: { 'order.checkout': 'checkout' },
  checkout: { 'order.pay': 'paid', 'order.cancel': 'cancelled' },
  paid: { 'order.ship': 'shipped', 'order.cancel': 'cancelled' },
  shipped: { 'order.deliver': 'delivered' },
  delivered: {},
  cancelled: { 'order.reopen': 'cart' },
} as const satisfies { [S in OrderState]: Partial<Record<OrderEvent, OrderState>> };

type EventsFrom<S extends OrderState> = keyof (typeof MACHINE)[S];
type Checks = [
  Expect<Equal<EventsFrom<'paid'>, 'order.ship' | 'order.cancel'>>,
  Expect<Equal<EventsFrom<'delivered'>, never>>, // un pedido entregado ya no acepta nada
  Expect<Equal<VerbOf<'order.ship'>, 'ship'>>,
];

// Cuando el estado se conoce al escribir el código, el tipo dice a dónde se llega:
function next<S extends OrderState, E extends EventsFrom<S>>(state: S, event: E): (typeof MACHINE)[S][E] {
  return MACHINE[state][event];
}
const afterPay = next('checkout', 'order.pay'); // → 'paid'
type Checks2 = [Expect<Equal<typeof afterPay, 'paid'>>];
// next('delivered', 'order.cancel') sería un error: 'order.cancel' no es un evento de delivered.

// En ejecución el estado es un OrderState cualquiera: la tabla se lee como Partial<Record<…>>.
function send(state: OrderState, event: OrderEvent): OrderState | null {
  const table: Partial<Record<OrderEvent, OrderState>> = MACHINE[state];
  return table[event] ?? null;
}
const isOrderEvent = (value: string): value is OrderEvent => VERBS.some((verb) => `order.${verb}` === value);
const eventsFrom = (state: OrderState): OrderEvent[] => Object.keys(MACHINE[state]).filter(isOrderEvent);

const LABELS = {
  cart: 'Carrito', checkout: 'Pago', paid: 'Pagado', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
} satisfies Record<OrderState, string>;
const ACTION_LABELS = {
  checkout: 'Ir a pagar', pay: 'Pagar $1,080.00', ship: 'Marcar como enviado', deliver: 'Confirmar entrega', cancel: 'Cancelar pedido', reopen: 'Volver al carrito',
} satisfies Record<Verb, string>;
const verbOf = <E extends OrderEvent>(event: E): VerbOf<E> => event.slice('order.'.length) as VerbOf<E>;

// ── La interfaz ───────────────────────────────────────────────────────────
function byId<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) throw new Error(`Falta #${id} o no es del tipo esperado`);
  return element;
}
const actions = byId('actions', HTMLDivElement);
const logList = byId('log', HTMLOListElement);
const HAPPY_PATH: readonly OrderState[] = ['cart', 'checkout', 'paid', 'shipped', 'delivered'];
let state: OrderState = 'cart';

function report(message: string): void {
  console.log(message);
  logList.append(Object.assign(document.createElement('li'), { textContent: message }));
}

function render(moveFocus = false): void {
  const reached = HAPPY_PATH.indexOf(state);
  byId('steps', HTMLOListElement).replaceChildren(...HAPPY_PATH.map((step, index) => {
    const item = Object.assign(document.createElement('li'), { textContent: LABELS[step] });
    if (step === state) item.setAttribute('aria-current', 'step');
    else if (reached > index) item.className = 'done';
    return item;
  }));
  const possible = eventsFrom(state);
  byId('state', HTMLParagraphElement).textContent = `Estado: ${LABELS[state]}${possible.length === 0 ? ' (final)' : ''}`;
  actions.replaceChildren(...possible.map((event) => {
    const control = Object.assign(document.createElement('button'), { type: 'button', textContent: ACTION_LABELS[verbOf(event)] });
    control.dataset.event = event;
    if (event === 'order.cancel') control.className = 'danger';
    return control;
  }));
  // El botón pulsado desaparece: el foco pasa a la siguiente acción posible (o al botón de reinicio).
  if (moveFocus) (actions.querySelector('button') ?? byId('restart', HTMLButtonElement)).focus();
}

actions.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLButtonElement)) return;
  const name = event.target.dataset.event ?? '';
  if (!isOrderEvent(name)) return;
  const target = send(state, name);
  if (target === null) return report(`⛔ ${name} no se acepta en ${state}`);
  report(`📦 ${state} --${name}--> ${target}`);
  state = target;
  render(true);
});
byId('restart', HTMLButtonElement).addEventListener('click', () => {
  state = 'cart';
  render();
  report('🔁 pedido nuevo: cart');
});

render();
console.log(`Listo: el pedido está en «${LABELS[state]}»; pulsa las acciones posibles (solo aparecen las válidas)`);
```

---
example_description: "Un bus de eventos con eventos declarados (se valida cada carga), comodín e historial, y un store con estado congelado, reductor puro, middleware y suscripciones con selectores que solo avisan cuando cambia su parte"
example_tags: "javascript|profesional|clases|observador|store|inmutabilidad|privados"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// EL ESTADO DE UN CARRITO DE COMPRA, como lo organizan las librerías de estado
// (Redux, Pinia…): un store con un estado inmutable que solo cambia con acciones,
// y un bus de eventos para que las partes de la app se enteren sin conocerse.
// - EventBus: eventos declarados en un esquema; emitir uno desconocido, o con
//   datos que faltan, es un error inmediato (el «tipado» que dará TypeScript).
// - Store: reductor puro (estado + acción → estado nuevo), estado congelado en
//   profundidad, middleware encadenado y suscripciones con selector.
// - Todo el estado interno es #privado; las suscripciones devuelven su baja.

class EventBus {
  static HISTORY_SIZE = 4;
  #schema;
  #listeners = new Map();
  #history = [];

  constructor(schema) {
    this.#schema = Object.freeze({ ...schema }); // evento → claves obligatorias
  }

  #assertDeclared(eventName) {
    if (eventName !== '*' && !Object.hasOwn(this.#schema, eventName)) throw new TypeError(`Evento no declarado: «${eventName}»`);
  }

  on(eventName, listener) {
    this.#assertDeclared(eventName);
    if (!this.#listeners.has(eventName)) this.#listeners.set(eventName, new Set());
    this.#listeners.get(eventName).add(listener);
    return () => this.#listeners.get(eventName).delete(listener);
  }

  once(eventName, listener) {
    const off = this.on(eventName, (payload, name) => {
      off();
      listener(payload, name);
    });
    return off;
  }

  emit(eventName, payload = {}) {
    this.#assertDeclared(eventName);
    const missing = this.#schema[eventName].filter((key) => !Object.hasOwn(payload, key));
    if (missing.length > 0) throw new TypeError(`«${eventName}» necesita: ${missing.join(', ')}`);
    this.#history = [...this.#history, eventName].slice(-EventBus.HISTORY_SIZE);
    const listeners = [...(this.#listeners.get(eventName) ?? []), ...(this.#listeners.get('*') ?? [])];
    for (const listener of listeners) {
      try {
        listener(payload, eventName);
      } catch (error) {
        console.warn(`⚠️ un oyente de «${eventName}» falló: ${error.message}`);
      }
    }
  }

  get history() {
    return [...this.#history];
  }
}

function deepFreeze(value) {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

class ActionError extends Error {
  constructor(action, reason) {
    super(`Acción «${action.type}» rechazada: ${reason}`);
    this.name = 'ActionError';
    this.action = action;
  }
}

class Store {
  #state;
  #reducer;
  #subscriptions = new Set();
  #dispatchChain;

  constructor({ reducer, initialState, middleware = [] }) {
    this.#reducer = reducer;
    this.#state = deepFreeze(initialState);
    // Cada middleware recibe la acción y next (el siguiente de la cadena).
    const core = (action) => this.#apply(action);
    this.#dispatchChain = middleware.reduceRight((next, layer) => (action) => layer(this, action, next), core);
  }

  get state() {
    return this.#state;
  }

  dispatch(action) {
    this.#dispatchChain(action);
  }

  #apply(action) {
    const next = this.#reducer(this.#state, action);
    if (next === this.#state) return; // el reductor no cambió nada
    this.#state = deepFreeze(next);
    for (const notify of [...this.#subscriptions]) notify();
  }

  // Solo avisa cuando el valor SELECCIONADO cambia (comparado con Object.is).
  subscribe(selector, listener) {
    let current = selector(this.#state);
    const notify = () => {
      const next = selector(this.#state);
      if (Object.is(next, current)) return;
      const previous = current;
      current = next;
      listener(next, previous);
    };
    this.#subscriptions.add(notify);
    return () => this.#subscriptions.delete(notify);
  }
}

// ── El dominio: un reductor puro y sus selectores ─────────────────────
const initialCart = { items: [], coupon: null };
function cartReducer(state, action) {
  switch (action.type) {
    case 'cart/add': {
      const existing = state.items.find((item) => item.sku === action.sku);
      const items = existing
        ? state.items.map((item) => (item === existing ? { ...item, quantity: item.quantity + action.quantity } : item))
        : [...state.items, { sku: action.sku, name: action.name, cents: action.cents, quantity: action.quantity }];
      return { ...state, items };
    }
    case 'cart/remove':
      return { ...state, items: state.items.filter((item) => item.sku !== action.sku) };
    case 'coupon/apply':
      return state.coupon === action.code ? state : { ...state, coupon: action.code };
    default:
      return state; // acción desconocida: el mismo objeto
  }
}
const selectCount = (state) => state.items.reduce((sum, item) => sum + item.quantity, 0);
const selectTotal = (state) => {
  const subtotal = state.items.reduce((sum, item) => sum + item.cents * item.quantity, 0);
  return state.coupon === 'CAFE10' ? Math.round(subtotal * 0.9) : subtotal;
};
const money = (cents) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100);

// ── Montaje: bus, middleware y store ──────────────────────────────────
const bus = new EventBus({
  'cart/changed': ['type'],
  'checkout/started': ['totalCents'],
});
const validate = (store, action, next) => {
  if (action.type === 'cart/add' && !(Number.isInteger(action.quantity) && action.quantity > 0)) {
    throw new ActionError(action, `cantidad ${action.quantity}`);
  }
  next(action);
};
const announce = (store, action, next) => {
  const before = store.state;
  next(action);
  if (store.state !== before) bus.emit('cart/changed', { type: action.type });
};
const store = new Store({ reducer: cartReducer, initialState: initialCart, middleware: [validate, announce] });

// Tres partes de la interfaz, cada una atenta a SU parte del estado.
const stopBadge = store.subscribe(selectCount, (count, before) => console.log(`  🛒 contador: ${before} → ${count}`));
store.subscribe(selectTotal, (total) => console.log(`  💲 total: ${money(total)}`));
store.subscribe((state) => state.coupon, (coupon) => console.log(`  🎟️ cupón aplicado: ${coupon}`));
bus.on('*', (payload, eventName) => console.log(`  📡 ${eventName} ${JSON.stringify(payload)}`));
bus.once('checkout/started', ({ totalCents }) => console.log(`  🎉 primer pago de la sesión: ${money(totalCents)}`));

console.group('Acciones');
const actions = [
  { type: 'cart/add', sku: 'CAF-CHIA-500', name: 'Café de Chiapas 500 g', cents: 21000, quantity: 1 },
  { type: 'cart/add', sku: 'CAF-CHIA-500', name: 'Café de Chiapas 500 g', cents: 21000, quantity: 1 },
  { type: 'coupon/apply', code: 'CAFE10' },
  { type: 'coupon/apply', code: 'CAFE10' }, // el mismo cupón: el reductor devuelve el mismo estado
  { type: 'cart/add', sku: 'MOL-RUTA-01', name: 'Molinillo manual Ruta', cents: 89900, quantity: 0 },
  { type: 'ui/theme', theme: 'oscuro' }, // acción desconocida: nadie se entera
];
for (const action of actions) {
  console.log(`▶ ${action.type}${action.quantity !== undefined ? ` ×${action.quantity}` : ''}`);
  try {
    store.dispatch(action);
  } catch (error) {
    console.warn(`  ⛔ ${error.name}: ${error.message}`);
  }
}
stopBadge();
console.log('▶ cart/remove (el contador ya se dio de baja)');
store.dispatch({ type: 'cart/remove', sku: 'CAF-CHIA-500' });
console.groupEnd();

console.group('Pagos');
bus.emit('checkout/started', { totalCents: 37800 });
bus.emit('checkout/started', { totalCents: 12000 }); // once ya se dio de baja
for (const attempt of [() => bus.emit('checkout/finished', {}), () => bus.emit('checkout/started', {})]) {
  try {
    attempt();
  } catch (error) {
    console.warn(`⛔ ${error.name}: ${error.message}`);
  }
}
console.groupEnd();

const snapshot = store.state;
try {
  snapshot.items.push({ sku: 'GRATIS' }); // push sobre un array congelado lanza, también en un script clásico
} catch (error) {
  console.warn(`⛔ ${error.name}: ${error.message}`);
}
console.log('estado final →', JSON.stringify(store.state));
console.log('historial del bus →', bus.history);
```

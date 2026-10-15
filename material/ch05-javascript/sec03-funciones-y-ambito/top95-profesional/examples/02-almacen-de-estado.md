---
example_description: "Almacén de estado funcional sin clases: reducers puros combinados por rebanadas, suscripciones con función de baja, middlewares currificados y selectores memoizados por referencia"
example_tags: "javascript|profesional|estado|reducers|closures|inmutabilidad"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// ALMACÉN DE ESTADO para la sesión, el carrito y las preferencias de una tienda
// (la idea de Redux, en unas pocas funciones).
//
// Decisiones:
// - El estado es INMUTABLE y solo cambia con acciones { type, payload }.
// - Un reducer es una función pura (estado, acción) → estado nuevo. Si la acción no
//   le concierne, devuelve el MISMO estado: así === basta para saber si algo cambió.
// - combineReducers reparte el estado en «rebanadas», una por reducer, y conserva el
//   objeto raíz si ninguna rebanada cambia.
// - createStore guarda el estado y los oyentes en un closure; subscribe devuelve la
//   función de baja, y los oyentes solo se avisan cuando el estado ha cambiado.
// - Los middlewares son funciones currificadas store → next → acción: se intercalan
//   entre dispatch y el reducer (registro, validación) sin tocar ninguno de los dos.
// - Los selectores se memoizan por la referencia del estado que reciben.
//
// Alcance: módulos 1-3 (closures, orden superior, currying, inmutabilidad).

// ── Núcleo ──────────────────────────────────────────────────────────────

function createStore(reducer, middlewares = []) {
  let state = reducer(undefined, { type: '@@init' }); // cada reducer pone su valor inicial
  const listeners = new Set();

  const getState = () => state;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const baseDispatch = (action) => {
    const previous = state;
    state = reducer(state, action);
    if (state !== previous) listeners.forEach((listener) => listener(state, previous, action));
    return action;
  };

  // Cada middleware recibe { getState, dispatch } y el «siguiente» paso de la cadena.
  // reduceRight los anida: el primero de la lista es el primero en ver la acción.
  let dispatch = baseDispatch;
  const middlewareApi = { getState, dispatch: (action) => dispatch(action) };
  dispatch = middlewares
    .map((middleware) => middleware(middlewareApi))
    .reduceRight((next, middleware) => middleware(next), baseDispatch);

  return { getState, subscribe, dispatch: (action) => dispatch(action) };
}

const combineReducers = (reducers) => (state = {}, action) => {
  let changed = false;
  const next = {};
  for (const [key, reducer] of Object.entries(reducers)) {
    next[key] = reducer(state[key], action);
    if (next[key] !== state[key]) changed = true;
  }
  return changed ? next : state;
};

function memoizeLast(selector) {
  let lastInput;
  let lastResult;
  let computations = 0;
  const selectMemo = (input) => {
    if (computations === 0 || input !== lastInput) {
      lastInput = input;
      lastResult = selector(input);
      computations += 1;
    }
    return lastResult;
  };
  selectMemo.computations = () => computations; // las funciones admiten propiedades
  return selectMemo;
}

// ── Reducers (puros) ────────────────────────────────────────────────────

const PRODUCTS = new Map([
  ['TE-01', { name: 'Té verde sencha 100 g', cents: 690 }],
  ['CA-07', { name: 'Café de Etiopía 250 g', cents: 895 }],
  ['AC-03', { name: 'Tetera de hierro 0,8 l', cents: 3450 }],
]);

function session(state = { user: null }, action) {
  switch (action.type) {
    case 'session/login':
      return { user: action.payload };
    case 'session/logout':
      return state.user === null ? state : { user: null };
    default:
      return state;
  }
}

function cart(state = [], action) {
  switch (action.type) {
    case 'cart/add': {
      const index = state.findIndex((line) => line.sku === action.payload);
      if (index === -1) return [...state, { sku: action.payload, qty: 1 }];
      return state.with(index, { ...state[index], qty: state[index].qty + 1 });
    }
    case 'cart/setQty': {
      const { sku, qty } = action.payload;
      const index = state.findIndex((line) => line.sku === sku);
      if (index === -1 || state[index].qty === qty) return state;
      return state.with(index, { ...state[index], qty });
    }
    case 'cart/remove':
      return state.some((line) => line.sku === action.payload) ? state.filter((line) => line.sku !== action.payload) : state;
    case 'session/logout': // otra rebanada también puede reaccionar a una acción
      return state.length === 0 ? state : [];
    default:
      return state;
  }
}

function preferences(state = { theme: 'claro' }, action) {
  return action.type === 'preferences/toggleTheme'
    ? { ...state, theme: state.theme === 'claro' ? 'oscuro' : 'claro' }
    : state;
}

// ── Middlewares (currificados) ──────────────────────────────────────────

const KNOWN_TYPES = new Set(['session/login', 'session/logout', 'cart/add', 'cart/setQty', 'cart/remove', 'preferences/toggleTheme']);

const validator = () => (next) => (action) => {
  if (!KNOWN_TYPES.has(action.type)) {
    console.log(`    ⚠️ acción desconocida «${action.type}»: se ignora`);
    return action;
  }
  if (action.type === 'cart/setQty' && !(Number.isInteger(action.payload.qty) && action.payload.qty >= 1)) {
    console.log(`    ⚠️ cantidad no válida (${action.payload.qty}): usa cart/remove para quitar`);
    return action;
  }
  if (action.type === 'cart/add' && !PRODUCTS.has(action.payload)) {
    console.log(`    ⚠️ producto desconocido «${action.payload}»`);
    return action;
  }
  return next(action);
};

const logger = (store) => (next) => (action) => {
  console.log(`▶ ${action.type}`);
  const before = store.getState();
  const result = next(action);
  if (store.getState() === before) console.log('    · sin cambios');
  return result;
};

// ── Selectores ──────────────────────────────────────────────────────────

const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const selectCartSummary = memoizeLast((cartLines) => {
  const units = cartLines.reduce((sum, line) => sum + line.qty, 0);
  const cents = cartLines.reduce((sum, line) => sum + PRODUCTS.get(line.sku).cents * line.qty, 0);
  return { units, cents };
});

// ── Uso ─────────────────────────────────────────────────────────────────

const store = createStore(combineReducers({ session, cart, preferences }), [logger, validator]);

// La «insignia del carrito» solo se repinta cuando cambia la rebanada del carrito.
const unsubscribeBadge = store.subscribe((state, previous) => {
  if (state.cart === previous.cart) return;
  const { units, cents } = selectCartSummary(state.cart);
  console.log(`    🛒 ${units} ${units === 1 ? 'unidad' : 'unidades'} · ${money.format(cents / 100)}`);
});

const initialState = store.getState();
store.dispatch({ type: 'session/login', payload: { name: 'Lucía', email: 'lucia@example.com' } });
store.dispatch({ type: 'cart/add', payload: 'TE-01' });
store.dispatch({ type: 'cart/add', payload: 'TE-01' });
store.dispatch({ type: 'cart/add', payload: 'CA-07' });
store.dispatch({ type: 'cart/add', payload: 'XX-99' });
const cartBeforeTheme = store.getState().cart;
store.dispatch({ type: 'preferences/toggleTheme' });
console.log('    ¿el tema ha tocado el carrito? →', store.getState().cart !== cartBeforeTheme); // false
store.dispatch({ type: 'cart/setQty', payload: { sku: 'CA-07', qty: 0 } });
store.dispatch({ type: 'cart/setQty', payload: { sku: 'CA-07', qty: 3 } });
store.dispatch({ type: 'cart/setQty', payload: { sku: 'CA-07', qty: 3 } });
store.dispatch({ type: 'cart/clear' });
store.dispatch({ type: 'session/logout' });

const finalState = store.getState();
console.log('estado final →', JSON.stringify(finalState));
console.log('¿el estado inicial sigue intacto? →', JSON.stringify(initialState));
console.log('cálculos del resumen →', selectCartSummary.computations(), '(uno por cada carrito distinto)');
unsubscribeBadge();
store.dispatch({ type: 'cart/add', payload: 'AC-03' }); // ya no hay insignia que repintar
```

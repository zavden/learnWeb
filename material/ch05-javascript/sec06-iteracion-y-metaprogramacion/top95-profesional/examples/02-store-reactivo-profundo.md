---
example_description: "Un store reactivo profundo: proxies anidados creados al leer y guardados en un WeakMap (identidad estable), avisos con la ruta del cambio filtrados por prefijo, lotes que agrupan avisos y valores calculados que registran sus dependencias y solo se recalculan cuando cambian"
example_tags: "javascript|profesional|proxy|reflect|reactividad|store|weakmap|symbol"
example_stage: professional
example_importance: critical
console: true
---

# JavaScript

```javascript
// STORE REACTIVO PROFUNDO para la app de una tienda (usuario, carrito, interfaz).
//
// Decisiones:
// - reactive() envuelve en proxies de forma PEREZOSA: la trampa get envuelve un
//   objeto anidado la primera vez que se lee. Un WeakMap (objetivo → proxy)
//   devuelve siempre el mismo proxy, así que state.cart === state.cart.
// - Cada cambio lleva su RUTA ('cart.items.0.qty'); los suscriptores se apuntan
//   a un prefijo ('cart') y reciben solo lo que cuelga de él.
// - batch(fn) agrupa los avisos de varios cambios en uno solo, al final.
// - computed(fn) registra qué rutas lee mientras calcula (la trampa get apunta
//   las lecturas en `tracking`) y se marca como sucio solo si cambia una de ellas.
// - Lo que se guarda es siempre el objeto real: si te asignan un proxy, se
//   desenvuelve con la clave symbol RAW. (Un objeto al que se llega por dos
//   rutas avisa con la primera por la que se leyó: es una simplificación.) Por eso structuredClone(state[RAW])
//   funciona, y structuredClone(state) no (un proxy no se puede clonar).
// - Nunca se imprime un proxy: se imprimen valores o JSON.stringify(state).
//
// Alcance: módulos 1-6. En el capítulo 6 cada aviso redibujará una parte de la
// página; así funcionan, a grandes rasgos, Vue 3 y MobX.

const RAW = Symbol('reactive.raw');
const isObject = (value) => typeof value === 'object' && value !== null;
const affects = (changedPath, readPath) =>
  changedPath === readPath || changedPath.startsWith(`${readPath}.`) || readPath.startsWith(`${changedPath}.`);

function createStore(initialState) {
  const proxies = new WeakMap(); // objetivo → su proxy (identidad estable)
  const listeners = new Set();   // { prefix, callback }
  let tracking = null;           // Set de rutas leídas durante un computed
  let pending = null;            // cambios acumulados en un lote

  function deliver(changes) {
    for (const { prefix, callback } of [...listeners]) {
      const relevant = prefix === '' ? changes : changes.filter((change) => affects(change.path, prefix));
      if (relevant.length > 0) callback(relevant);
    }
  }

  function emit(change) {
    if (pending) pending.push(change);
    else deliver([change]);
  }

  function reactive(target, path) {
    if (proxies.has(target)) return proxies.get(target);
    const join = (key) => (path ? `${path}.${key}` : key);
    const proxy = new Proxy(target, {
      get(obj, key, receiver) {
        if (key === RAW) return obj;
        const value = Reflect.get(obj, key, receiver);
        if (typeof key === 'symbol' || typeof value === 'function') return value;
        tracking?.add(join(key));
        return isObject(value) ? reactive(value, join(key)) : value;
      },
      set(obj, key, value, receiver) {
        const raw = isObject(value) ? (value[RAW] ?? value) : value;
        const previous = obj[key];
        if (Object.is(previous, raw)) return true; // sin cambio (p. ej. el length tras un push)
        const ok = Reflect.set(obj, key, raw, receiver);
        emit({ path: join(key), previous, value: raw });
        return ok;
      },
      deleteProperty(obj, key) {
        if (!Object.hasOwn(obj, key)) return true;
        const previous = obj[key];
        const ok = Reflect.deleteProperty(obj, key);
        emit({ path: join(key), previous, value: undefined });
        return ok;
      },
    });
    proxies.set(target, proxy);
    return proxy;
  }

  const state = reactive(structuredClone(initialState), '');

  return {
    state,
    subscribe(prefix, callback) {
      const entry = { prefix, callback };
      listeners.add(entry);
      return () => listeners.delete(entry);
    },
    batch(fn) {
      if (pending) return fn(); // un lote dentro de otro: entrega el de fuera
      pending = [];
      try {
        return fn();
      } finally {
        const changes = pending;
        pending = null;
        if (changes.length > 0) deliver(changes);
      }
    },
    computed(fn) {
      let cached;
      let dirty = true;
      let dependencies = new Set();
      let recomputations = 0;
      listeners.add({
        prefix: '',
        callback: (changes) => {
          if (changes.some((change) => [...dependencies].some((path) => affects(change.path, path)))) dirty = true;
        },
      });
      return {
        get value() {
          if (dirty) {
            const outer = tracking;
            tracking = new Set();
            cached = fn();
            dependencies = tracking;
            tracking = outer;
            dirty = false;
            recomputations += 1;
          }
          return cached;
        },
        get recomputations() {
          return recomputations;
        },
      };
    },
  };
}

// ── La tienda ──────────────────────────────────────────────────────────────
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const money = (cents) => pesos.format(cents / 100);

const store = createStore({
  user: { name: 'Lucía Ortega', city: 'Puebla' },
  cart: { items: [{ sku: 'CAF-500', name: 'Café de Chiapas', cents: 21000, qty: 1 }], coupon: null },
  ui: { theme: 'claro' },
});
const { state } = store;

store.subscribe('cart', (changes) => console.log(`  🛒 carrito → ${changes.map((change) => change.path).join(', ')}`));
store.subscribe('ui', (changes) => console.log(`  🎨 interfaz → ${changes.map((change) => `${change.path} = ${change.value}`).join(', ')}`));

const total = store.computed(() => {
  const subtotal = state.cart.items.reduce((sum, item) => sum + item.cents * item.qty, 0);
  return state.cart.coupon === 'CAFE10' ? Math.round(subtotal * 0.9) : subtotal;
});
const itemCount = store.computed(() => state.cart.items.reduce((count, item) => count + item.qty, 0));
const summary = () => `${itemCount.value} artículo(s), ${money(total.value)} | recálculos del total: ${total.recomputations}`;

console.log('inicio →', summary());
console.log('identidad estable →', state.cart === state.cart, state.cart.items[0] === state.cart.items[0]);

console.log('▶ un cambio anidado');
state.cart.items[0].qty = 2;
console.log('  →', summary());

console.log('▶ un lote: tres cambios, UN aviso');
store.batch(() => {
  state.cart.items.push({ sku: 'MOL-250', name: 'Mole poblano', cents: 16000, qty: 1 });
  state.cart.coupon = 'CAFE10';
  state.cart.items[0].qty = 3;
});
console.log('  →', summary());

console.log('▶ cambios que no tocan el total (no se recalcula)');
state.ui.theme = 'oscuro';
state.user.city = 'Oaxaca';
console.log('  →', summary());

console.log('▶ asignar un objeto que ya era un proxy');
state.user.lastViewed = state.cart.items[1]; // se guarda el objeto real, no el proxy
console.log('  ¿se guardó el objeto real? →', state[RAW].user.lastViewed === state[RAW].cart.items[1]);
console.log('  ¿y se lee el mismo proxy? →', state.user.lastViewed === state.cart.items[1]);

console.log('▶ quitar el cupón');
delete state.cart.coupon;
console.log('  →', summary());

// Copias y JSON.
try {
  structuredClone(state);
} catch (error) {
  console.log('structuredClone(state) →', error.name, '(un proxy no se puede clonar)');
}
const snapshot = structuredClone(state[RAW]);
console.log('copia del estado real →', JSON.stringify(snapshot.cart));
console.log('JSON a través del proxy →', JSON.stringify(state.ui));
```

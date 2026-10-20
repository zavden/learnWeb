---
example_description: "Un produce() al estilo de immer: la receta modifica un borrador hecho de proxies y el resultado es un estado nuevo, congelado, que comparte por identidad todo lo que no cambió; copia al escribir, borradores revocables con Proxy.revocable y un historial de versiones"
example_tags: "javascript|profesional|proxy|reflect|inmutabilidad|immer|copia-al-escribir"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// produce(estado, receta) AL ESTILO DE IMMER, para el estado de una tienda.
//
// Decisiones:
// - La receta recibe un BORRADOR y lo modifica con asignaciones, push, delete…
//   como si fuera mutable. El estado original no se toca nunca.
// - Copia al escribir: cada nivel se envuelve en un borrador al LEERLO (perezoso)
//   y se copia (superficialmente) solo la primera vez que se ESCRIBE en él; esa
//   escritura marca como modificados a todos sus padres, hasta la raíz.
// - Al terminar, lo que no cambió se devuelve tal cual (la misma identidad: se
//   comparte entre versiones) y lo nuevo se congela. Si no cambió nada, produce
//   devuelve el MISMO estado de entrada.
// - El objetivo de cada proxy es un objeto VACÍO, no el original: el original
//   está congelado, y las invariantes (lección «Proxy y Reflect») impedirían
//   devolver un borrador donde el objetivo garantiza otro valor.
// - Los borradores se crean con Proxy.revocable(objetivo, manejador), que
//   devuelve { proxy, revoke }. Al terminar se revocan todos: usar un borrador
//   que se escapó de la receta lanza un TypeError en vez de corromper nada.
//
// Alcance: módulos 1-6 (Proxy.revocable se presenta aquí).

const DRAFT = Symbol('produce.draft');
const isPlainData = (value) => typeof value === 'object' && value !== null;
const isDraft = (value) => isPlainData(value) && Boolean(value[DRAFT]);

function deepFreeze(value) {
  if (isPlainData(value) && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) deepFreeze(value[key]);
  }
  return value;
}

function produce(base, recipe) {
  const revokers = [];

  function createDraft(baseValue, parent) {
    const state = { base: baseValue, copy: null, parent, children: new Map() };
    const latest = () => state.copy ?? state.base;
    state.markChanged = () => {
      if (state.copy) return;
      state.copy = Array.isArray(state.base) ? [...state.base] : { ...state.base };
      for (const [key, child] of state.children) state.copy[key] = child.proxy;
      state.parent?.markChanged();
    };

    const { proxy, revoke } = Proxy.revocable(Array.isArray(baseValue) ? [] : {}, {
      get(target, key) {
        if (key === DRAFT) return state;
        const source = latest();
        const value = Reflect.get(source, key);
        if (typeof key === 'symbol' || !Object.hasOwn(source, key) || !isPlainData(value) || isDraft(value)) return value;
        if (!state.children.has(key)) { // primer acceso a un hijo: su borrador
          const child = createDraft(value, state);
          state.children.set(key, child);
          if (state.copy) state.copy[key] = child.proxy;
        }
        return state.children.get(key).proxy;
      },
      set(target, key, value) {
        if (Object.is(latest()[key], value)) return true; // asignar lo mismo no es un cambio
        state.markChanged();
        state.children.delete(key);
        state.copy[key] = value;
        return true;
      },
      deleteProperty(target, key) {
        if (!Object.hasOwn(latest(), key)) return true;
        state.markChanged();
        state.children.delete(key);
        delete state.copy[key];
        return true;
      },
      has: (target, key) => key in latest(),
      ownKeys: () => Reflect.ownKeys(latest()),
      getOwnPropertyDescriptor(target, key) {
        const descriptor = Reflect.getOwnPropertyDescriptor(latest(), key);
        if (!descriptor) return undefined;
        // El objetivo vacío es extensible: lo que se informa debe ser configurable,
        // salvo el length de un array, que en el objetivo no lo es.
        const isLength = key === 'length' && Array.isArray(target);
        return { ...descriptor, writable: true, configurable: !isLength };
      },
    });
    state.proxy = proxy;
    revokers.push(revoke);
    return state;
  }

  function finalize(state) {
    if (!state.copy) return state.base; // sin cambios: el mismo objeto de antes
    for (const key of Object.keys(state.copy)) {
      const value = state.copy[key];
      state.copy[key] = isDraft(value) ? finalize(value[DRAFT]) : deepFreeze(value);
    }
    return Object.freeze(state.copy);
  }

  const root = createDraft(base, null);
  try {
    recipe(root.proxy);
    return finalize(root);
  } finally {
    for (const revoke of revokers) revoke(); // ningún borrador sobrevive a la receta
  }
}

// ── El estado de una tienda ────────────────────────────────────────────────
const v1 = deepFreeze({
  user: { name: 'Elena Canul', city: 'Mérida' },
  cart: { items: [{ sku: 'CAF-500', qty: 1 }, { sku: 'MOL-250', qty: 2 }], coupon: null },
  catalog: {
    'CAF-500': { name: 'Café de Chiapas 500 g', cents: 21000 },
    'MOL-250': { name: 'Mole poblano 250 g', cents: 16000 },
    'CAC-070': { name: 'Chocolate de mesa 70 %', cents: 9500 },
  },
});

const v2 = produce(v1, (draft) => {
  draft.cart.items[0].qty += 1;
  draft.cart.items.push({ sku: 'CAC-070', qty: 1 });
  draft.cart.coupon = 'CAFE10';
});

console.table({
  'estado': { '¿mismo objeto que v1?': v2 === v1 },
  'user (no se tocó)': { '¿mismo objeto que v1?': v2.user === v1.user },
  'catalog (no se tocó)': { '¿mismo objeto que v1?': v2.catalog === v1.catalog },
  'cart': { '¿mismo objeto que v1?': v2.cart === v1.cart },
  'cart.items[0] (cambió qty)': { '¿mismo objeto que v1?': v2.cart.items[0] === v1.cart.items[0] },
  'cart.items[1] (no se tocó)': { '¿mismo objeto que v1?': v2.cart.items[1] === v1.cart.items[1] },
});
console.log('v1.cart →', JSON.stringify(v1.cart));
console.log('v2.cart →', JSON.stringify(v2.cart));
console.log('¿todo congelado? →', Object.isFrozen(v2.cart.items), Object.isFrozen(v2.cart.items[2]));

const v3 = produce(v2, (draft) => {
  draft.cart.items.splice(1, 1); // quitar el mole
  delete draft.cart.coupon;
});
console.log('v3.cart →', JSON.stringify(v3.cart));

const same = produce(v3, (draft) => {
  draft.user.city = 'Mérida'; // el mismo valor: no es un cambio
});
console.log('sin cambios, ¿devuelve el mismo estado? →', same === v3);

let leaked;
produce(v3, (draft) => {
  leaked = draft.cart; // un borrador que se escapa de la receta
});
try {
  console.log(leaked.items);
} catch (error) {
  console.log('borrador usado fuera →', error.name, '|', error.message);
}

// Historial: cada versión es un valor completo que comparte lo que no cambió.
const versions = [v1, v2, v3];
const shared = (a, b) => Object.keys(a).filter((key) => a[key] === b[key]);
for (let i = 1; i < versions.length; i++) {
  console.log(`v${i} → v${i + 1}: comparten ${shared(versions[i - 1], versions[i]).join(', ')}`);
}
console.log('deshacer hasta v1 →', JSON.stringify(versions[0].cart.items));
```

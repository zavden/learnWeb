---
example_description: "El store reactivo con Proxy del módulo de metaprogramación, conectado por fin al DOM: cada clave del estado tiene sus funciones de pintado, y un cambio solo redibuja las partes de la página que dependen de esa clave (asignar el mismo valor no redibuja nada)"
example_tags: "javascript|dom|integracion|proxy|store|reactividad|render"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main class="cart">
  <h1>Tu carrito</h1>
  <p class="totals">🛒 <span data-view="count">0</span> productos · <strong data-view="total">$0.00</strong></p>
  <p class="coupon" data-view="coupon" hidden></p>
  <ul class="items" data-view="list"></ul>
  <p class="actions">
    <button type="button" id="add-coffee">Añadir café ($210)</button>
    <button type="button" id="add-grinder">Añadir molinillo ($549)</button>
    <button type="button" id="toggle-coupon">Cupón BUENFIN (−10 %)</button>
  </p>
</main>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
.cart {
  max-width: 32rem;
}
h1 {
  font-size: 1.3rem;
}
.coupon {
  padding: 0.25rem 0.5rem;
  color: #14532d;
  background: #dcfce7;
}
.items {
  padding-left: 1.25rem;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
```

# JavaScript

```javascript
// 1. El store de la lección «Proxy y Reflect»: la trampa set avisa de cada
//    cambio real (Object.is: el mismo valor no avisa).
function createStore(initialState) {
  const listeners = new Set();
  const state = new Proxy({ ...initialState }, {
    set(target, key, value, receiver) {
      const previous = target[key];
      if (Object.is(previous, value)) return true;
      const ok = Reflect.set(target, key, value, receiver);
      for (const listener of listeners) listener(key, value, previous);
      return ok;
    },
  });
  return { state, subscribe: (listener) => listeners.add(listener) };
}

const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const view = (name) => document.querySelector(`[data-view="${name}"]`);

// 2. Las vistas: cada una pinta UNA parte de la página a partir del estado.
let painted = []; // qué vistas se han pintado en la acción actual
const paintCounts = { list: 0, count: 0, total: 0, coupon: 0 };
const views = {
  list(state) {
    view('list').replaceChildren(...state.items.map((item) => {
      const row = document.createElement('li');
      row.textContent = `${item.name} · ${formatter.format(item.price)}`;
      return row;
    }));
  },
  count(state) {
    view('count').textContent = state.items.length;
  },
  total(state) {
    const subtotal = state.items.reduce((sum, item) => sum + item.price, 0);
    view('total').textContent = formatter.format(state.coupon ? subtotal * 0.9 : subtotal);
  },
  coupon(state) {
    view('coupon').hidden = state.coupon === null;
    view('coupon').textContent = state.coupon ? `🎟️ Cupón ${state.coupon} aplicado` : '';
  },
};

// 3. De qué claves depende cada vista: un cambio solo pinta lo que le afecta.
const dependencies = { items: ['list', 'count', 'total'], coupon: ['coupon', 'total'] };

const cart = createStore({ items: [], coupon: null });
cart.subscribe((key) => {
  for (const name of dependencies[key] ?? []) {
    views[name](cart.state);
    paintCounts[name] += 1;
    painted.push(name);
  }
});

// 4. Acciones: siempre ASIGNAN un valor nuevo (un array nuevo, no push: el
//    proxy solo ve las asignaciones a sus propiedades).
const addItem = (name, price) => { cart.state.items = [...cart.state.items, { name, price }]; };
const setCoupon = (code) => { cart.state.coupon = code; };

function act(label, action) {
  painted = [];
  action();
  console.log(`▶ ${label} → pinta: ${painted.length > 0 ? painted.join(', ') : '(nada)'}`);
}
act('añadir Café de Chiapas', () => addItem('Café de Chiapas 500 g', 210));
act('añadir Molinillo manual', () => addItem('Molinillo manual', 549));
act('cupón BUENFIN', () => setCoupon('BUENFIN'));
act('el mismo cupón otra vez', () => setCoupon('BUENFIN'));
act('quitar el cupón', () => setCoupon(null));
console.log('en pantalla →', document.querySelector('.totals').textContent);
console.log('veces que se pintó cada vista →', paintCounts);

// Los botones usan las mismas acciones (eventos: módulo siguiente).
document.querySelector('#add-coffee').addEventListener('click', () => addItem('Café de Chiapas 500 g', 210));
document.querySelector('#add-grinder').addEventListener('click', () => addItem('Molinillo manual', 549));
document.querySelector('#toggle-coupon').addEventListener('click', () => {
  setCoupon(cart.state.coupon === null ? 'BUENFIN' : null);
});
```

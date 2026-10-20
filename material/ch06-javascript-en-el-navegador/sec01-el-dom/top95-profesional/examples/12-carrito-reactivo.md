---
example_description: "Un carrito completo con estado reactivo: un store con Proxy avisa de cada cambio, cada vista depende de unas claves y solo se repinta lo afectado; las líneas del carrito salen de un <template> y se reconcilian por SKU (el <li> de cada producto se reutiliza), los botones de productos agotados se desactivan y los totales se recalculan"
example_tags: "javascript|dom|profesional|carrito|proxy|store|template|claves|modulos"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="shop">
  <h1>Tostadores del Sur</h1>
  <div class="layout">
    <section class="catalog" aria-labelledby="catalog-title">
      <h2 id="catalog-title">Cafés y accesorios</h2>
      <ul class="products" id="products"></ul>
    </section>
    <section class="cart" aria-labelledby="cart-title">
      <h2 id="cart-title">Tu carrito (<span id="cart-count">0</span>)</h2>
      <ul class="lines" id="cart-lines"></ul>
      <p class="empty" id="cart-empty">Todavía no has añadido nada.</p>
      <dl class="totals">
        <dt>Subtotal</dt><dd id="subtotal">$0.00</dd>
        <dt id="discount-label" hidden>Cupón BUENFIN (−10 %)</dt><dd id="discount" hidden></dd>
        <dt>Total</dt><dd id="total">$0.00</dd>
      </dl>
      <p><button type="button" id="coupon">Aplicar cupón BUENFIN</button></p>
      <p id="cart-status" role="status"></p>
    </section>
  </div>
</main>

<template id="line-template">
  <li class="line">
    <span class="line-name"></span>
    <label class="line-qty">Cantidad <input type="number" min="0" step="1"></label>
    <span class="line-total"></span>
    <button type="button" class="line-remove">Quitar</button>
  </li>
</template>
```

# CSS

```css
[hidden] {
  display: none !important;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #f8fafc;
}
.shop {
  max-width: 64rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  margin-top: 0;
  font-size: 1.4rem;
}
h2 {
  font-size: 1.1rem;
}
.layout {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.catalog {
  flex: 999 1 20rem;
}
.cart {
  flex: 1 1 18rem;
  padding: 0 1rem 1rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
}
.products,
.lines {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;
  list-style: none;
}
.products li {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
}
.line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  align-items: center;
}
.line-name {
  flex: 1 1 100%;
  font-weight: 600;
}
.line-qty input {
  width: 4rem;
}
.totals {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.25rem;
}
.totals dd {
  margin: 0;
  text-align: end;
  font-variant-numeric: tabular-nums;
}
button,
input {
  font: inherit;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// CARRITO REACTIVO.
//
// Archivo que usa: assets/01-catalogo/products.js (el catálogo del ejemplo 01).
// Decisiones:
// - Estado único: { lines: [{ sku, qty }], coupon }. Solo las acciones lo
//   cambian, y siempre ASIGNAN valores nuevos (el Proxy no ve un push).
// - El store avisa de cada clave que cambia; un mapa de dependencias decide
//   qué vistas repintar (la integración de este módulo, «El store reactivo,
//   conectado al DOM»).
// - Las líneas del carrito se reconcilian por SKU: el <li> de cada producto se
//   crea una vez desde el <template> y después solo cambia su texto y su
//   cantidad. Si el campo de cantidad tiene el foco, no se le pisa el valor.
// - Los textos van con textContent; las cantidades y los precios, con Intl.
// - Eventos (click y change) con addEventListener: módulo siguiente.
//
// Alcance: HTML, CSS (módulos 1-7), el capítulo de JavaScript y el módulo «El DOM».
import { products } from './01-catalogo/products.js';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const COUPON_RATE = 0.1;
const offer = products.filter((product) => ['CAF-CHI-500', 'CAF-VER-500', 'CAF-OAX-500', 'MOL-MAN', 'PRE-1L'].includes(product.sku));
const bySku = new Map(products.map((product) => [product.sku, product]));

// ── El store (lección «Proxy y Reflect») ────────────────────────────────
function createStore(initialState) {
  const listeners = new Set();
  const state = new Proxy({ ...initialState }, {
    set(target, key, value, receiver) {
      if (Object.is(target[key], value)) return true;
      const ok = Reflect.set(target, key, value, receiver);
      for (const listener of listeners) listener(key);
      return ok;
    },
  });
  return { state, subscribe: (listener) => listeners.add(listener) };
}
const store = createStore({ lines: [], coupon: false });

// ── Acciones: la única forma de cambiar el estado ───────────────────────
function setQty(sku, qty) {
  const product = bySku.get(sku);
  const clamped = Math.max(0, Math.min(product.stock, Math.trunc(qty) || 0));
  const exists = store.state.lines.some((line) => line.sku === sku);
  if (clamped === 0) {
    store.state.lines = store.state.lines.filter((line) => line.sku !== sku);
  } else if (exists) {
    store.state.lines = store.state.lines.map((line) => (line.sku === sku ? { sku, qty: clamped } : line));
  } else {
    store.state.lines = [...store.state.lines, { sku, qty: clamped }];
  }
}
function addToCart(sku) {
  const current = store.state.lines.find((line) => line.sku === sku)?.qty ?? 0;
  if (current >= bySku.get(sku).stock) return false; // agotado o en el límite: nada cambia
  setQty(sku, current + 1);
  return true;
}
const removeLine = (sku) => setQty(sku, 0);
const toggleCoupon = () => { store.state.coupon = !store.state.coupon; };

// ── El catálogo (se pinta una vez) ──────────────────────────────────────
const productList = document.querySelector('#products');
const addButtons = new Map();
for (const product of offer) {
  const item = document.createElement('li');
  const name = document.createElement('span');
  name.textContent = `${product.name} · ${money.format(product.price)}`;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = product.stock === 0 ? 'Agotado' : 'Añadir';
  button.setAttribute('aria-label', `${button.textContent}: ${product.name}`);
  button.addEventListener('click', () => addToCart(product.sku));
  addButtons.set(product.sku, button);
  item.append(name, button);
  productList.append(item);
}

// ── Vistas ──────────────────────────────────────────────────────────────
const lineTemplate = document.querySelector('#line-template');
const cartLines = document.querySelector('#cart-lines');
const lineNodes = new Map(); // sku → <li>

function createLine(sku) {
  const item = lineTemplate.content.firstElementChild.cloneNode(true);
  const product = bySku.get(sku);
  item.dataset.sku = sku;
  item.querySelector('.line-name').textContent = product.name;
  const input = item.querySelector('input');
  input.max = product.stock;
  input.addEventListener('change', () => setQty(sku, Number(input.value)));
  const remove = item.querySelector('.line-remove');
  remove.setAttribute('aria-label', `Quitar ${product.name}`);
  remove.addEventListener('click', () => removeLine(sku));
  return item;
}

const views = {
  lines({ lines }) {
    const wanted = new Set(lines.map((line) => line.sku));
    for (const [sku, node] of lineNodes) {
      if (!wanted.has(sku)) {
        node.remove();
        lineNodes.delete(sku);
      }
    }
    lines.forEach((line, index) => {
      let node = lineNodes.get(line.sku);
      if (node === undefined) {
        node = createLine(line.sku);
        lineNodes.set(line.sku, node);
      }
      const input = node.querySelector('input');
      if (document.activeElement !== input) input.value = line.qty; // no pisar lo que se escribe
      node.querySelector('.line-total').textContent = money.format(line.qty * bySku.get(line.sku).price);
      const reference = cartLines.children[index] ?? null;
      if (reference !== node) cartLines.insertBefore(node, reference);
    });
    document.querySelector('#cart-empty').hidden = lines.length > 0;
  },
  count({ lines }) {
    document.querySelector('#cart-count').textContent = lines.reduce((sum, line) => sum + line.qty, 0);
  },
  buttons({ lines }) {
    for (const [sku, button] of addButtons) {
      const inCart = lines.find((line) => line.sku === sku)?.qty ?? 0;
      button.disabled = inCart >= bySku.get(sku).stock;
    }
  },
  totals({ lines, coupon }) {
    const subtotal = lines.reduce((sum, line) => sum + line.qty * bySku.get(line.sku).price, 0);
    const discount = coupon ? Math.round(subtotal * COUPON_RATE * 100) / 100 : 0;
    document.querySelector('#subtotal').textContent = money.format(subtotal);
    document.querySelector('#discount').textContent = `−${money.format(discount)}`;
    document.querySelector('#discount').hidden = !coupon;
    document.querySelector('#discount-label').hidden = !coupon;
    document.querySelector('#total').textContent = money.format(subtotal - discount);
  },
  coupon({ coupon }) {
    const button = document.querySelector('#coupon');
    button.textContent = coupon ? 'Quitar cupón BUENFIN' : 'Aplicar cupón BUENFIN';
    button.setAttribute('aria-pressed', String(coupon));
  },
};
const dependencies = { lines: ['lines', 'count', 'buttons', 'totals'], coupon: ['coupon', 'totals'] };

let painted = [];
store.subscribe((key) => {
  for (const name of dependencies[key] ?? []) {
    views[name](store.state);
    painted.push(name);
  }
});
for (const render of Object.values(views)) render(store.state); // primer pintado
document.querySelector('#coupon').addEventListener('click', toggleCoupon);

// ── Comprobaciones al cargar ────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
function act(label, action) {
  painted = [];
  action();
  console.log(`▶ ${label} → pinta: ${painted.length > 0 ? painted.join(', ') : '(nada)'}`);
}
const text = (selector) => document.querySelector(selector).textContent;

audit('el botón de un agotado está desactivado', addButtons.get('CAF-VER-500').disabled, true);
act('añadir Café de Chiapas', () => addToCart('CAF-CHI-500'));
const chiapasLine = cartLines.querySelector('[data-sku="CAF-CHI-500"]');
act('otro Café de Chiapas', () => addToCart('CAF-CHI-500'));
act('añadir el molinillo', () => addToCart('MOL-MAN'));
act('5 cafés de Chiapas', () => setQty('CAF-CHI-500', 5));
act('intentar añadir uno agotado', () => addToCart('CAF-VER-500'));
act('aplicar el cupón', toggleCoupon);
act('quitar el molinillo', () => removeLine('MOL-MAN'));
audit('líneas', [...cartLines.children].map((line) => `${line.dataset.sku}×${line.querySelector('input').value}`).join(' '), 'CAF-CHI-500×5');
audit('la línea de Chiapas es el mismo <li> desde el principio', cartLines.querySelector('[data-sku="CAF-CHI-500"]') === chiapasLine, true);
audit('contador', text('#cart-count'), '5');
audit('subtotal · descuento · total', `${text('#subtotal')} · ${text('#discount')} · ${text('#total')}`, '$1,050.00 · −$105.00 · $945.00');
audit('pedir más de lo que hay se limita a las existencias', (setQty('MOL-MAN', 99), cartLines.querySelector('[data-sku="MOL-MAN"] input').value), '4');
audit('con todas las existencias, el botón se desactiva', addButtons.get('MOL-MAN').disabled, true);
removeLine('MOL-MAN');
document.querySelector('#cart-status').textContent = 'Carrito de prueba listo: cambia cantidades, quita productos o aplica el cupón.';
```

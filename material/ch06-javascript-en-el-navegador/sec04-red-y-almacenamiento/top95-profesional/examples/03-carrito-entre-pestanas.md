---
example_description: "Un carrito que se guarda en localStorage (JSON con versión, validado al leer) y se mantiene igual en todas las pestañas con el evento storage; cantidades limitadas por las existencias, total anunciado con aria-live y un listener delegado para todos los botones. Persiste a propósito; «Vaciar» lo borra"
example_tags: "javascript|localstorage|evento-storage|carrito|delegacion|aria-live|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<div class="shop">
  <header class="bar">
    <h1>Tostador de la sierra</h1>
    <p class="badge">🛒 <output id="count">0</output> artículo(s)</p>
  </header>
  <section aria-labelledby="products-title">
    <h2 id="products-title">Cafés</h2>
    <ul id="products" class="products"></ul>
  </section>
  <section aria-labelledby="cart-title" class="cart">
    <h2 id="cart-title">Tu carrito</h2>
    <ul id="cart-lines" class="lines"></ul>
    <p class="total">Total: <output id="total" aria-live="polite">$0</output></p>
    <button type="button" data-action="empty">Vaciar</button>
  </section>
  <ol id="log" class="log" aria-live="polite"></ol>
</div>
```

# CSS

```css
:root { --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --surface: #ffffff; --page: #f5f7fa; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.shop { max-width: 34rem; margin: 0 auto; padding: 1rem; }
.bar { display: flex; justify-content: space-between; align-items: center; }
h1 { margin: 0; font-size: 1.25rem; }
h2 { font-size: 1rem; margin: 0.75rem 0 0.4rem; }
.badge { margin: 0; font-weight: 600; }
.products, .lines { display: grid; gap: 0.35rem; margin: 0; padding: 0; list-style: none; }
.products li, .lines li { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.5rem; padding: 0.4rem 0.6rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); }
.muted { color: var(--muted); font-size: 0.85rem; }
.stepper { display: flex; align-items: center; gap: 0.35rem; }
button { font: inherit; padding: 0.25rem 0.6rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: var(--surface); color: var(--ink); cursor: pointer; }
button:disabled { color: #616e7c; cursor: not-allowed; }
button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.cart { padding: 0.25rem 0.75rem 0.75rem; border-radius: 0.75rem; background: #e4e7eb; margin-top: 0.75rem; }
.total { font-weight: 700; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Carrito persistente y sincronizado entre pestañas.
//
// Decisiones de diseño:
// - Una sola fuente de verdad: localStorage («lw-red-carrito»). Cada cambio
//   se escribe ahí y la interfaz se pinta a partir de lo guardado, así que
//   esta pestaña y las demás pintan siempre lo mismo.
// - El evento storage avisa a las OTRAS pestañas; esta no lo recibe, por eso
//   pinta ella misma después de guardar.
// - Lo guardado se valida al leer: versión conocida, SKUs que existen y
//   cantidades enteras entre 1 y las existencias. Un valor roto o de otra
//   versión cuenta como carrito vacío; nunca rompe la página.
// - Un listener delegado atiende todos los botones (data-action, data-sku).
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const CART_KEY = 'lw-red-carrito';
const shop = document.querySelector('.shop');
const logList = document.querySelector('#log');
let products = new Map(); // sku → producto (de assets/coffees.json)
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const money = (amount) => `$${amount.toLocaleString('es-MX')}`;

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    if (saved?.version !== 1) return new Map();
    const valid = Object.entries(saved.items ?? {}).filter(([sku, quantity]) =>
      products.has(sku) && Number.isInteger(quantity) && quantity >= 1 && quantity <= products.get(sku).stock);
    return new Map(valid);
  } catch {
    return new Map();
  }
}
function writeCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify({ version: 1, items: Object.fromEntries(cart) }));
  } catch (error) {
    logLine(`⚠️ no se pudo guardar el carrito (${error.name})`);
  }
}
const totals = (cart) => [...cart].reduce((sum, [sku, quantity]) => ({
  units: sum.units + quantity,
  amount: sum.amount + quantity * products.get(sku).price,
}), { units: 0, amount: 0 });

function button(text, action, sku, label) {
  const element = Object.assign(document.createElement('button'), { type: 'button', textContent: text });
  element.dataset.action = action;
  element.dataset.sku = sku;
  if (label) element.setAttribute('aria-label', label);
  return element;
}
function render(cart) {
  const lines = [...cart].map(([sku, quantity]) => {
    const product = products.get(sku);
    const item = document.createElement('li');
    const stepper = Object.assign(document.createElement('span'), { className: 'stepper' });
    const plus = button('+', 'add', sku, `Uno más de ${product.name}`);
    plus.disabled = quantity >= product.stock;
    stepper.append(button('−', 'remove', sku, `Uno menos de ${product.name}`), String(quantity), plus);
    item.append(`${product.name} · ${money(quantity * product.price)}`, stepper);
    return item;
  });
  document.querySelector('#cart-lines').replaceChildren(...lines);
  const { units, amount } = totals(cart);
  document.querySelector('#count').textContent = units;
  document.querySelector('#total').textContent = money(amount);
}
function renderProducts() {
  document.querySelector('#products').replaceChildren(...[...products.values()].slice(0, 6).map((product) => {
    const item = document.createElement('li');
    const add = button('Añadir', 'add', product.sku, `Añadir ${product.name}`);
    add.disabled = product.stock === 0;
    const details = Object.assign(document.createElement('span'), { className: 'muted', textContent: product.stock ? ` ${money(product.price)} · ${product.grams} g` : ' agotado' });
    item.append(product.name, details, add);
    return item;
  }));
}

shop.addEventListener('click', (event) => {
  const target = event.target.closest('button[data-action]');
  if (!target) return;
  const cart = readCart(); // siempre lo último guardado (otra pestaña pudo cambiarlo)
  const { action, sku } = target.dataset;
  if (action === 'empty') {
    cart.clear();
  } else {
    const product = products.get(sku);
    const next = (cart.get(sku) ?? 0) + (action === 'add' ? 1 : -1);
    if (next > product.stock) {
      logLine(`⚠️ solo quedan ${product.stock} de ${product.name}`);
      return;
    }
    if (next <= 0) cart.delete(sku);
    else cart.set(sku, next);
  }
  writeCart(cart);
  render(cart);
  const { amount } = totals(cart);
  logLine(action === 'empty' ? '🗑️ carrito vaciado' : `${action === 'add' ? '➕' : '➖'} ${products.get(sku).name} → ${cart.get(sku) ?? 0} · total ${money(amount)}`);
});

window.addEventListener('storage', (event) => {
  if (event.key !== CART_KEY && event.key !== null) return;
  const cart = readCart();
  render(cart);
  const { units, amount } = totals(cart);
  logLine(`📨 otra pestaña cambió el carrito: ${units} artículo(s) · total ${money(amount)}`);
});

async function start() {
  try {
    const response = await fetch('coffees.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    products = new Map((await response.json()).map((product) => [product.sku, product]));
  } catch (error) {
    logLine(`⛔ no se pudo cargar el catálogo (${error.message})`);
    return;
  }
  renderProducts();
  const cart = readCart();
  render(cart);
  logLine(`🛒 carrito recuperado: ${totals(cart).units} artículo(s)`);
  logLine('Listo: añade cafés; abre el ejemplo con ↗, cambia el carrito allí y vuelve a esta pestaña');
}
start();
```

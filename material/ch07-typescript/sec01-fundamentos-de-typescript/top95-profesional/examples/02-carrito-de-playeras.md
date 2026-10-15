---
example_description: "Un carrito de playeras con líneas readonly y funciones puras que devuelven un carrito nuevo, tallas y modelos como uniones de literales validadas desde el formulario, y precios en pesos o dólares con un switch exhaustivo e Intl.NumberFormat"
example_tags: "typescript|profesional|readonly|inmutabilidad|tipos-literales|as-const|formularios|intl"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="shop">
  <h1>Playeras del Festival de Jazz de Xalapa</h1>
  <form id="add-form" class="product">
    <fieldset>
      <legend>Modelo</legend>
      <label><input type="radio" name="model" value="classic" checked> Clásica · $349</label>
      <label><input type="radio" name="model" value="vintage"> Vintage · $429</label>
    </fieldset>
    <fieldset>
      <legend>Talla</legend>
      <label><input type="radio" name="size" value="S"> S</label>
      <label><input type="radio" name="size" value="M" checked> M</label>
      <label><input type="radio" name="size" value="L"> L</label>
      <label><input type="radio" name="size" value="XL"> XL</label>
    </fieldset>
    <label class="quantity">Cantidad <input id="quantity" type="number" min="1" max="5" value="1" required></label>
    <button type="submit" class="primary">Añadir al carrito</button>
    <p id="form-error" class="form-error" role="alert"></p>
  </form>
  <section class="cart" aria-labelledby="cart-title">
    <h2 id="cart-title" tabindex="-1">Carrito</h2>
    <label>Moneda
      <select id="currency">
        <option value="MXN">Pesos (MXN)</option>
        <option value="USD">Dólares (USD)</option>
      </select>
    </label>
    <ul id="cart-lines" class="lines"></ul>
    <p class="total">Total: <output id="total" aria-live="polite"></output></p>
  </section>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --soft: #cbd2d9; --accent: #1d4ed8; --danger: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.5; color: var(--ink); background: #f5f7fa; }
.shop { max-width: 34rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.25rem; margin: 0 0 0.75rem; }
h2 { font-size: 1.05rem; margin: 0 0 0.5rem; }
.product, .cart { padding: 0.75rem 1rem; background: #fff; border: 1px solid var(--soft); border-radius: 0.75rem; margin-bottom: 1rem; }
fieldset { display: flex; flex-wrap: wrap; gap: 0.25rem 1rem; border: 1px solid var(--soft); border-radius: 0.5rem; margin: 0 0 0.5rem; }
.quantity input { width: 4rem; margin-inline: 0.5rem 1rem; }
input, select, button { font: inherit; }
button { padding: 0.35rem 0.8rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; color: var(--ink); cursor: pointer; }
button.primary { border-color: var(--accent); background: var(--accent); color: #fff; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.form-error { min-height: 1.5em; margin: 0.25rem 0 0; color: var(--danger); font-weight: 600; }
.lines { list-style: none; padding: 0; margin: 0.5rem 0; display: grid; gap: 0.35rem; }
.lines li { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding-bottom: 0.35rem; border-bottom: 1px solid var(--soft); }
.lines .empty { color: var(--muted); border: 0; }
.total { font-size: 1.1rem; font-weight: 700; text-align: end; margin: 0; }
.log { font-size: 0.85rem; color: var(--muted); }
```

# TypeScript

```typescript
// Los valores válidos se escriben UNA vez y los tipos salen de ellos (lección 5).
const SIZES = ['S', 'M', 'L', 'XL'] as const;
type Size = (typeof SIZES)[number]; // operadores de tipo: módulo 2
type ModelId = 'classic' | 'vintage';
type Currency = 'MXN' | 'USD';
const MODELS = {
  classic: { label: 'Clásica', priceCents: 34900 },
  vintage: { label: 'Vintage', priceCents: 42900 },
} as const;
const MXN_PER_USD = 18.5; // tipo de cambio de ejemplo
const MAX_PER_LINE = 5;

// El carrito es inmutable: cada cambio crea un carrito nuevo (lección 3).
type CartLine = { readonly model: ModelId; readonly size: Size; readonly quantity: number };
type Cart = readonly CartLine[];

function addToCart(cart: Cart, line: CartLine): Cart {
  const existing = cart.find((item) => item.model === line.model && item.size === line.size);
  if (existing === undefined) return [...cart, line];
  return cart.map((item) =>
    item === existing ? { ...item, quantity: Math.min(MAX_PER_LINE, item.quantity + line.quantity) } : item,
  );
}
const removeFromCart = (cart: Cart, model: ModelId, size: Size): Cart =>
  cart.filter((item) => !(item.model === model && item.size === size));
const lineCents = (line: CartLine): number => MODELS[line.model].priceCents * line.quantity;
const totalCents = (cart: Cart): number => cart.reduce((sum, line) => sum + lineCents(line), 0);

const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const decimals = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatPrice(cents: number, currency: Currency): string {
  switch (currency) {
    case 'MXN':
      return pesos.format(cents / 100);
    case 'USD':
      return `${decimals.format(Math.round(cents / MXN_PER_USD) / 100)} USD`;
  }
}

// De los strings del HTML a las uniones del programa (o null).
const toSize = (value: string | undefined): Size | null => SIZES.find((size) => size === value) ?? null;
const toModel = (value: string | undefined): ModelId | null => (value === 'classic' || value === 'vintage' ? value : null);
const toCurrency = (value: string): Currency => (value === 'USD' ? 'USD' : 'MXN');

function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`Falta el elemento #${id}`);
  return element;
}
function inputById(id: string): HTMLInputElement {
  const element = byId(id);
  if (!(element instanceof HTMLInputElement)) throw new Error(`#${id} no es un <input>`);
  return element;
}
function selectById(id: string): HTMLSelectElement {
  const element = byId(id);
  if (!(element instanceof HTMLSelectElement)) throw new Error(`#${id} no es un <select>`);
  return element;
}
function checkedValue(form: HTMLElement, name: string): string | undefined {
  const input = form.querySelector(`input[name="${name}"]:checked`);
  return input instanceof HTMLInputElement ? input.value : undefined;
}

const form = byId('add-form');
const quantityInput = inputById('quantity');
const currencySelect = selectById('currency');
const cartTitle = byId('cart-title');
const linesList = byId('cart-lines');
const totalOutput = byId('total');
const formError = byId('form-error');
const logList = byId('log');

let cart: Cart = [];

const currency = (): Currency => toCurrency(currencySelect.value);

function report(message: string): void {
  console.log(message);
  const item = document.createElement('li');
  item.textContent = message;
  logList.append(item);
}

function render(): void {
  const items = cart.map((line) => {
    const li = document.createElement('li');
    const label = `${MODELS[line.model].label} ${line.size} ×${line.quantity}`;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Quitar';
    remove.setAttribute('aria-label', `Quitar ${label}`);
    remove.dataset.model = line.model;
    remove.dataset.size = line.size;
    li.append(`${label} · ${formatPrice(lineCents(line), currency())}`, remove);
    return li;
  });
  if (items.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'Todavía no hay playeras en el carrito.';
    items.push(empty);
  }
  linesList.replaceChildren(...items);
  totalOutput.textContent = formatPrice(totalCents(cart), currency());
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const model = toModel(checkedValue(form, 'model'));
  const size = toSize(checkedValue(form, 'size'));
  const quantity = Number(quantityInput.value);
  if (model === null || size === null || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_PER_LINE) {
    formError.textContent = `Elige modelo y talla, y una cantidad de 1 a ${MAX_PER_LINE}.`;
    return;
  }
  formError.textContent = '';
  cart = addToCart(cart, { model, size, quantity });
  render();
  report(`➕ ${MODELS[model].label} ${size} ×${quantity} → total ${totalOutput.textContent}`);
});

linesList.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest('button');
  if (button === null) return;
  const model = toModel(button.dataset.model);
  const size = toSize(button.dataset.size);
  if (model === null || size === null) return;
  cart = removeFromCart(cart, model, size);
  render();
  report(`➖ ${MODELS[model].label} ${size} → total ${totalOutput.textContent}`);
  // El botón pulsado ya no existe: el foco vuelve al título del carrito.
  cartTitle.focus();
});

currencySelect.addEventListener('change', () => {
  render();
  report(`💱 ${currency()} → total ${totalOutput.textContent}`);
});

render();
console.log('Listo: elige modelo, talla y cantidad y pulsa «Añadir al carrito»');
```

---
example_description: "Un carrito cuyos componentes no se conocen: la lista de productos (delegación + data-action) llama al store, un CartStore que extiende EventTarget y avisa con change; el minicarrito y el total se suscriben con { signal } y uno se puede desmontar con abort()"
example_tags: "javascript|eventos|integracion|eventtarget|customevent|delegacion|abortcontroller|carrito"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="shop">
  <section aria-labelledby="products-title">
    <h1 id="products-title">Tostaduría La Ceiba</h1>
    <ul id="products" class="products">
      <li data-sku="CAF-500">Café de Chiapas 500 g · $210.00
        <button type="button" data-action="add">Añadir</button></li>
      <li data-sku="CAC-250">Cacao de Tabasco 250 g · $145.00
        <button type="button" data-action="add">Añadir</button></li>
      <li data-sku="VAI-001">Vainilla de Papantla · $98.50
        <button type="button" data-action="add">Añadir</button></li>
    </ul>
  </section>
  <aside class="cart" aria-labelledby="cart-title">
    <h2 id="cart-title">Tu carrito</h2>
    <ul id="cart-lines" class="cart-lines"></ul>
    <p>Total: <output id="cart-total">$0.00</output></p>
    <button type="button" id="unmount-total">Desmontar el total</button>
  </aside>
  <template id="line-template">
    <li><span class="line-name"></span> × <span class="line-qty"></span>
      <button type="button" data-action="remove">Quitar uno</button></li>
  </template>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
.shop {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
  max-width: 44rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
h2 {
  font-size: 1rem;
  margin-top: 0;
}
.products,
.cart-lines {
  display: grid;
  gap: 0.4rem;
  padding: 0;
  list-style: none;
}
.cart {
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
button {
  font: inherit;
  padding: 0.2rem 0.6rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.log {
  grid-column: 1 / -1;
  margin: 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const catalog = {
  'CAF-500': { name: 'Café de Chiapas', price: 210 },
  'CAC-250': { name: 'Cacao de Tabasco', price: 145 },
  'VAI-001': { name: 'Vainilla de Papantla', price: 98.5 },
};

// ── El store: el estado del carrito y nada más. Avisa con «change».
class CartStore extends EventTarget {
  #lines = new Map(); // sku → cantidad
  add(sku) {
    this.#lines.set(sku, (this.#lines.get(sku) ?? 0) + 1);
    this.#emit('add', sku);
  }
  remove(sku) {
    const quantity = (this.#lines.get(sku) ?? 0) - 1;
    if (quantity > 0) this.#lines.set(sku, quantity);
    else this.#lines.delete(sku);
    this.#emit('remove', sku);
  }
  get lines() {
    return [...this.#lines].map(([sku, quantity]) => ({ sku, quantity, ...catalog[sku] }));
  }
  #emit(action, sku) {
    this.dispatchEvent(new CustomEvent('change', { detail: { action, sku } }));
  }
}
const store = new CartStore();

// ── Componente: la lista de productos (un listener delegado).
document.querySelector('#products').addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="add"]');
  if (button) store.add(button.closest('[data-sku]').dataset.sku);
});

// ── Componente: las líneas del carrito (plantilla + replaceChildren).
function mountCartLines(root, { signal }) {
  const template = document.querySelector('#line-template');
  const render = () => {
    root.replaceChildren(...store.lines.map((line) => {
      const item = template.content.firstElementChild.cloneNode(true);
      item.dataset.sku = line.sku;
      item.querySelector('.line-name').textContent = line.name;
      item.querySelector('.line-qty').textContent = line.quantity;
      return item;
    }));
  };
  store.addEventListener('change', render, { signal });
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="remove"]');
    if (button) store.remove(button.closest('[data-sku]').dataset.sku);
  }, { signal });
}

// ── Componente: el total.
function mountTotal(output, { signal }) {
  store.addEventListener('change', () => {
    const total = store.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    output.textContent = money.format(total);
  }, { signal });
}

const linesLife = new AbortController();
const totalLife = new AbortController();
mountCartLines(document.querySelector('#cart-lines'), linesLife);
mountTotal(document.querySelector('#cart-total'), totalLife);

// ── Un registro de depuración, suscrito el ÚLTIMO: los listeners se ejecutan
//    en orden de registro, así que cuando escribe, el total ya está al día.
store.addEventListener('change', (event) => {
  const { action, sku } = event.detail;
  logLine(`${action === 'add' ? '➕' : '➖'} ${sku} · total ${document.querySelector('#cart-total').textContent}`);
});

// Desmontar un componente = abortar su señal: se van TODOS sus listeners.
document.querySelector('#unmount-total').addEventListener('click', (event) => {
  totalLife.abort();
  event.currentTarget.disabled = true;
  logLine('⏏️ total desmontado: ya no se actualiza (las líneas sí)');
}, { once: true });
logLine('Listo: añade dos cafés y un cacao, quita un café; luego desmonta el total y añade otro');
```

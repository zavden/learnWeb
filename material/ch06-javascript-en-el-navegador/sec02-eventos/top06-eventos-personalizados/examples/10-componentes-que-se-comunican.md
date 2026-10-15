---
example_description: "Tres componentes que no se conocen entre sí (lista de productos, minicarrito y aviso) se comunican con eventos personalizados que burbujean: cart:add sube de la lista, el carrito responde con cart:change, y un monitor en captura muestra el flujo"
example_tags: "javascript|eventos|customevent|componentes|arquitectura|bubbles|captura"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="shop">
  <section id="product-list" aria-labelledby="products-title">
    <h2 id="products-title">Productos</h2>
    <ul class="products">
      <li>Café de Chiapas 500 g · $210.00 <button type="button" data-sku="CAF-500" data-name="Café de Chiapas" data-price="210">Añadir</button></li>
      <li>Cacao de Tabasco 250 g · $145.00 <button type="button" data-sku="CAC-250" data-name="Cacao de Tabasco" data-price="145">Añadir</button></li>
      <li>Vainilla de Papantla · $98.50 <button type="button" data-sku="VAI-001" data-name="Vainilla de Papantla" data-price="98.5">Añadir</button></li>
    </ul>
  </section>
  <aside id="mini-cart" class="mini-cart" aria-labelledby="cart-title">
    <h2 id="cart-title">Carrito</h2>
    <p class="summary">Vacío</p>
    <button type="button" data-action="clear">Vaciar</button>
  </aside>
  <p id="toast" class="toast" role="status"></p>
  <ol id="log" class="log" aria-live="polite"></ol>
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
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 0.75rem;
  max-width: 40rem;
  margin: 0 auto;
  padding: 1rem;
}
h2 {
  font-size: 1rem;
  margin-top: 0;
}
.products {
  display: grid;
  gap: 0.4rem;
  padding: 0;
  list-style: none;
}
.mini-cart {
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
.toast {
  grid-column: 1 / -1;
  min-height: 1.5em;
  margin: 0;
  font-weight: 600;
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

// ── Componente 1: la lista de productos. Avisa hacia ARRIBA: «quieren esto».
function createProductList(root) {
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-sku]');
    if (!button) return;
    const { sku, name, price } = button.dataset;
    root.dispatchEvent(new CustomEvent('cart:add', { bubbles: true, detail: { sku, name, price: Number(price) } }));
  });
}

// ── Componente 2: el minicarrito. Escucha cart:add y avisa de su nuevo estado.
function createMiniCart(root) {
  const items = [];
  const announce = () => {
    const total = items.reduce((sum, item) => sum + item.price, 0);
    root.querySelector('.summary').textContent = items.length ? `${items.length} productos · $${total.toFixed(2)}` : 'Vacío';
    root.dispatchEvent(new CustomEvent('cart:change', { bubbles: true, detail: { count: items.length, total } }));
  };
  document.addEventListener('cart:add', (event) => {
    items.push(event.detail);
    announce();
  });
  root.querySelector('[data-action="clear"]').addEventListener('click', () => {
    items.length = 0;
    announce();
  });
}

// ── Componente 3: el aviso. Solo le interesa cart:change.
function createToast(root) {
  document.addEventListener('cart:change', (event) => {
    root.textContent = event.detail.count ? `✔ Carrito actualizado: ${event.detail.count} productos` : 'Carrito vacío';
  });
}

// ── Un monitor de depuración: en CAPTURA, ve pasar todos los avisos.
for (const type of ['cart:add', 'cart:change']) {
  document.addEventListener(type, (event) => {
    logLine(`📡 ${event.type} · desde #${event.target.id} · ${JSON.stringify(event.detail)}`);
  }, { capture: true });
}

createProductList(document.querySelector('#product-list'));
createMiniCart(document.querySelector('#mini-cart'));
createToast(document.querySelector('#toast'));
logLine('Listo: añade el café y la vainilla; luego pulsa «Vaciar»');

// Ningún componente llama a otro: se pueden quitar, duplicar o reordenar.
// La regla habitual: DATOS hacia abajo (métodos y propiedades del hijo) y
// EVENTOS hacia arriba (el hijo avisa; quien le contiene decide).
// Ojo con los nombres: un 'change' propio que burbujea se mezclaría con los
// 'change' nativos de los <input> que haya dentro (sin detail). Prefijo propio.
```

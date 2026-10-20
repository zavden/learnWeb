---
example_description: "new CustomEvent('cart:add', { bubbles: true, detail }) y dispatchEvent: la tarjeta del producto anuncia lo que pasó con sus datos en detail, y el contador del carrito lo escucha en document sin conocer a las tarjetas"
example_tags: "javascript|eventos|customevent|dispatchevent|detail|bubbles|componentes"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <header class="top">
    <h1>Tostaduría La Ceiba</h1>
    <p id="cart-badge" class="badge" aria-live="polite">🛒 0 productos · $0.00</p>
  </header>
  <ul id="catalog" class="catalog">
    <li id="card-caf" class="card">Café de Chiapas 500 g · $210.00
      <button type="button" data-sku="CAF-500" data-name="Café de Chiapas" data-price="210">Añadir</button></li>
    <li id="card-cac" class="card">Cacao de Tabasco 250 g · $145.00
      <button type="button" data-sku="CAC-250" data-name="Cacao de Tabasco" data-price="145">Añadir</button></li>
  </ul>
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
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
.top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0;
}
.badge {
  margin: 0;
  padding: 0.25rem 0.6rem;
  border-radius: 1rem;
  background: #dbeafe;
  font-weight: 600;
}
.catalog {
  display: grid;
  gap: 0.5rem;
  padding: 0;
  list-style: none;
}
.card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
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
  margin: 0.75rem 0 0;
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

// ── Componente 1: el catálogo. Solo ANUNCIA lo que pasó; no sabe nada del carrito.
document.querySelector('#catalog').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-sku]');
  if (!button) return;
  const { sku, name, price } = button.dataset;
  button.dispatchEvent(new CustomEvent('cart:add', {
    bubbles: true,                                  // que suba hasta document
    detail: { sku, name, price: Number(price) },    // los datos del aviso
  }));
});

// ── Componente 2: el contador del carrito. Escucha en document, sin conocer
//    las tarjetas: vale para las de hoy y para las que se añadan.
const badge = document.querySelector('#cart-badge');
let count = 0;
let total = 0;
document.addEventListener('cart:add', (event) => {
  count += 1;
  total += event.detail.price;
  badge.textContent = `🛒 ${count} productos · $${total.toFixed(2)}`;
  logLine(`cart:add · ${event.detail.name} (${event.detail.sku}) · desde #${event.target.closest('li').id}`
    + ` · isTrusted: ${event.isTrusted}`);
});
logLine('Listo: pulsa «Añadir» en los dos productos');

// CustomEvent es un Event con una propiedad más, detail, para los datos.
// Nombres: en minúsculas y con un prefijo propio («cart:add», «cart-add»),
// para no chocar con los eventos del navegador.
```

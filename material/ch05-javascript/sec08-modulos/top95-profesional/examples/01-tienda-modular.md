---
example_description: "Una tienda partida en módulos con responsabilidades claras (api, store, ui, format), una API pública en un barrel y un script de entrada que solo conecta: la API se inyecta en el store, el store avisa a la interfaz y la interfaz solo llama a acciones"
example_tags: "javascript|profesional|modulos|arquitectura|barrel|inyeccion-de-dependencias|observador"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="shop" aria-labelledby="shop-title">
  <header class="shop-header">
    <h1 id="shop-title">Café La Huasteca</h1>
    <p>Café de especialidad de Chiapas y Veracruz, y todo para prepararlo.</p>
  </header>
  <div id="shop"></div>
</main>
```

# CSS

```css
:root {
  --ink: #1c1917;
  --muted: #57534e;
  --paper: #fafaf9;
  --card: #ffffff;
  --line: #d6d3d1;
  --brand: #7c2d12;
  --brand-ink: #ffffff;
  --focus: #2563eb;
  --notice: #fef3c7;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; color: var(--ink); background: var(--paper); line-height: 1.45; }
.shop { max-width: 64rem; margin: 0 auto; padding: 1.25rem 1rem 2rem; }
.shop-header h1 { margin: 0; font-size: clamp(1.4rem, 1rem + 2vw, 2rem); }
.shop-header p { margin: 0.25rem 0 1rem; color: var(--muted); }
button { font: inherit; cursor: pointer; border-radius: 0.5rem; }
button:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
button:disabled { cursor: not-allowed; opacity: 0.55; }
.filters { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
.filters button { padding: 0.4rem 0.9rem; border: 1px solid var(--line); background: var(--card); color: var(--ink); }
.filters button[aria-pressed="true"] { background: var(--brand); border-color: var(--brand); color: var(--brand-ink); }
.layout { display: grid; gap: 1rem; grid-template-columns: 1fr; }
@media (min-width: 48rem) { .layout { grid-template-columns: 1fr 18rem; align-items: start; } }
.products { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); }
.products[aria-busy="true"] { opacity: 0.6; }
.product { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.9rem; border: 1px solid var(--line); border-radius: 0.75rem; background: var(--card); }
.product h3 { margin: 0; font-size: 1rem; }
.product p { margin: 0; }
.price { font-weight: 700; }
.stock { color: var(--muted); font-size: 0.9rem; }
.product button { margin-top: auto; padding: 0.45rem; border: 0; background: var(--brand); color: var(--brand-ink); }
.cart { padding: 1rem; border: 1px solid var(--line); border-radius: 0.75rem; background: var(--card); }
.catalog h2, .cart h2 { margin: 0 0 0.5rem; font-size: 1.1rem; }
.cart-lines { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; }
.cart-lines li { display: flex; justify-content: space-between; gap: 0.5rem; align-items: center; }
.remove { padding: 0.15rem 0.5rem; border: 1px solid var(--line); background: transparent; color: var(--ink); }
.cart-total { font-weight: 700; }
.pay { width: 100%; padding: 0.6rem; border: 0; background: var(--brand); color: var(--brand-ink); }
.status { min-height: 1.5em; margin-top: 1rem; padding: 0.5rem 0.75rem; border-radius: 0.5rem; background: var(--notice); }
.status:empty { background: transparent; }
```

# JavaScript

```javascript
// UNA TIENDA PARTIDA EN MÓDULOS.
//
// Archivos (assets/01-tienda/), de abajo arriba:
//   format.js → formatPrice, formatCount: funciones puras
//   api.js    → createApi({ latencyMs }): el «servidor», con existencias
//   store.js  → createStore(api): estado privado, acciones, subscribe()
//   ui.js     → mountShop(root, store): pinta el estado, llama a acciones
//   index.js  → el barrel: la API pública, nombre a nombre
//
//   este script (composición) ──→ index.js
//                                  ├─ api.js
//                                  ├─ store.js
//                                  ├─ ui.js ──→ store.js, format.js
//                                  └─ format.js
//
// Decisiones:
// - El estado tiene UN dueño (store.js) y se cambia solo con sus acciones;
//   getState() devuelve instantáneas congeladas.
// - El store RECIBE la API (inyección): ningún módulo importa a un «servidor»
//   fijo, así que una prueba puede pasar una API falsa.
// - La interfaz no guarda estado propio: se repinta entera con cada aviso.
// - Este script no tiene lógica: crea las piezas, las conecta y arranca.
//
// Alcance: módulos 1-8. Lo poco de DOM que usa ui.js es del capítulo 6.
import { createApi, createStore, mountShop, formatPrice, cartTotalCents } from './01-tienda/index.js';

const api = createApi({ latencyMs: 60 });
const store = createStore(api);
mountShop(document.querySelector('#shop'), store);
await store.loadProducts('all');

// ── Demostración: un recorrido completo, desde el código ────────────────
const state = () => store.getState();
console.log('productos →', state().products.length, '| categoría →', state().category);

store.addToCart('CAF-500');
store.addToCart('CAF-500');
store.addToCart('MOL-001');
console.log('carrito →', formatPrice(cartTotalCents(state())), '|', state().message);
console.log('añadir un producto agotado →', store.addToCart('CAF-250'), '|', state().message);

try {
  state().cart['TAZ-002'] = 5; // la instantánea está congelada
} catch (error) {
  console.log('⛔ cambiar el estado desde fuera →', error.name);
}

const orderId = await store.checkout();
console.log('pedido →', orderId, '|', state().message);
console.log('existencias del molinillo tras el pedido →', state().products.find((product) => product.sku === 'MOL-001').stock);

// Mientras tanto, otro cliente compra los dos molinillos que quedaban.
store.addToCart('MOL-001');
await api.placeOrder([{ sku: 'MOL-001', quantity: 2 }]);
console.log('pedido sin existencias →', await store.checkout(), '|', state().status, '|', state().message);

await store.loadProducts('equipo');
console.log('filtro «equipo» →', state().products.map((product) => product.sku).join(', '));

// Ahora usa la tienda con el ratón o el teclado: filtra, añade, quita, paga.
```

---
example_description: "Una tienda repartida en módulos (datos, carrito dueño del estado, formato, interfaz) con un barrel de lista explícita; la interfaz se conecta desde el módulo, sin onclick, y el contador exportado es un enlace vivo que atraviesa el barrel"
example_tags: "javascript|modulos|arquitectura|barrel|live-bindings|observador"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main class="shop">
  <h1>Café La Huasteca</h1>
  <ul id="catalog" class="catalog" aria-label="Productos"></ul>
  <p id="summary" class="summary" role="status"></p>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1c1917; background: #fafaf9; }
.shop { max-width: 34rem; margin: 0 auto; padding: 1.25rem 1rem; }
.shop h1 { margin-block: 0 1rem; font-size: 1.4rem; }
.catalog { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
.catalog li { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.6rem 0.8rem; border: 1px solid #d6d3d1; border-radius: 0.6rem; background: #fff; }
.catalog button { font: inherit; padding: 0.35rem 0.8rem; border: 0; border-radius: 0.4rem; background: #7c2d12; color: #fff; cursor: pointer; }
.catalog button:focus-visible { outline: 3px solid #2563eb; outline-offset: 2px; }
.summary { margin-top: 1rem; padding: 0.75rem; border-radius: 0.6rem; background: #fef3c7; }
```

# JavaScript

```javascript
// Archivos que usa (assets/01-tienda/):
//   products.js → PRODUCTS (congelado), findProduct()          datos
//   cart.js     → dueño del estado: itemCount (let), addToCart(), onCartChange()
//   format.js   → formatPrice(), plural()                       funciones puras
//   index.js    → el barrel: la API pública, nombre a nombre
//   ui.js       → renderCatalog(), renderSummary(): lo único que toca el DOM
//
//   este script ──→ index.js ──→ products.js, cart.js, format.js
//        └────────→ ui.js ─────→ cart.js, format.js (hermanos, sin pasar por el barrel)
import { PRODUCTS, addToCart, onCartChange, itemCount } from './01-tienda/index.js';
import { renderCatalog, renderSummary } from './01-tienda/ui.js';

// querySelector: capítulo 6. Como es un módulo, el HTML ya está leído.
const catalogList = document.querySelector('#catalog');
const summary = document.querySelector('#summary');

renderCatalog(catalogList, PRODUCTS, addToCart); // los botones llaman a addToCart
onCartChange(() => renderSummary(summary)); // el resumen se repinta con cada cambio
renderSummary(summary);

// Demostración: dos «clics» desde el código.
console.log('productos →', PRODUCTS.length, '| itemCount al empezar →', itemCount);
addToCart('CAF-500');
addToCart('MOL-001');
console.log('itemCount tras dos productos →', itemCount, '(enlace vivo, a través del barrel)');
console.log('en pantalla →', summary.textContent);

try {
  PRODUCTS[0].cents = 1; // otro módulo «ajustando» un precio
} catch (error) {
  console.log('⛔ los datos están congelados →', error.name);
}

// Pulsa los botones: el resumen se actualiza sin que este script haga nada
// más. Ningún módulo usa window ni onclick, y cart.js no sabe que existe ui.js.
```

---
example_description: "Una tienda repartida por responsabilidades: datos (catalog.js), reglas y estado (cart.js), formato (format.js) y presentación (receipt.js); las dependencias van en un solo sentido"
example_tags: "javascript|modulos|arquitectura|responsabilidades|dependencias"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/01-tienda/):
//   catalog.js → los productos y findProduct()          (datos)
//   cart.js    → createCart(): cantidades y total       (reglas y estado)
//   format.js  → formatPrice(), padLine()               (formato, funciones puras)
//   receipt.js → renderReceipt(cart): líneas de texto   (presentación)
//
//                 este script (arranca y conecta)
//                 ┌──────────┴──────────┐
//              cart.js              receipt.js
//                 │                     │
//            catalog.js             format.js
//
// Cada flecha va hacia abajo: los datos no saben del carrito, el carrito no
// sabe cómo se muestra, el formato no sabe de nadie.
import { createCart } from './01-tienda/cart.js';
import { renderReceipt } from './01-tienda/receipt.js';

const cart = createCart();
cart.add('CAF-500', 2);
cart.add('MOL-001');
cart.add('CAF-500');

for (const line of renderReceipt(cart)) console.log(line);

try {
  cart.add('TE-404');
} catch (error) {
  console.log('⛔', error.message);
}

// Cambiar el ticket (otro formato, HTML en vez de texto) solo toca
// receipt.js; cambiar de dónde salen los productos solo toca catalog.js.
// Y format.js se puede probar solo: no depende de nada.
```

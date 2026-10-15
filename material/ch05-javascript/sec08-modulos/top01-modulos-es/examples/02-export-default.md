---
example_description: "export default: una exportación sin nombre por módulo, que se importa sin llaves y con el nombre que elija quien importa; convive con las exportaciones con nombre"
example_tags: "javascript|python|modulos|export-default|import"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivo que usa: assets/02-carrito/cart.js
//   export default class Cart { … }   ← la exportación por defecto
//   export const MAX_ITEMS = 20;      ← una exportación con nombre
// La por defecto va SIN llaves y con el nombre que tú quieras; las demás,
// entre llaves y con su nombre exacto.
import ShoppingCart, { MAX_ITEMS } from './02-carrito/cart.js';
import Cart from './02-carrito/cart.js'; // otro nombre para lo mismo

const cart = new ShoppingCart()
  .add('Café de Chiapas 500 g', 21000, 2)
  .add('Molinillo manual', 54900);

console.log('productos →', cart.count, '| total en centavos →', cart.totalCents);
console.log('¿la misma clase con dos nombres? →', ShoppingCart === Cart);
console.log('su nombre de verdad →', ShoppingCart.name);
console.log('límite →', MAX_ITEMS);

try {
  cart.add('Taza de barro', 12000, 18);
} catch (error) {
  console.log('⛔', error.message);
}

// «export default» es azúcar para exportar con el nombre especial «default»:
//   import Cart from './02-carrito/cart.js'
//   import { default as Cart } from './02-carrito/cart.js'   ← lo mismo
// Como cada archivo elige el nombre, el mismo módulo puede llamarse Cart en
// un sitio y ShoppingCart en otro: buscar «Cart» en el proyecto no lo encuentra
// todo. Por eso muchos equipos prefieren solo exportaciones con nombre.
// > Desde Python no hay equivalente: todo se importa por su nombre.
```

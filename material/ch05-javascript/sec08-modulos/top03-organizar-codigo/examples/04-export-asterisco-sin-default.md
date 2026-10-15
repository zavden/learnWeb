---
example_description: "export * from reexporta las exportaciones con nombre, pero no la exportación por defecto: el barrel pierde la clase Cart y quien la importa recibe un SyntaxError; hay que reexportarla con export { default as Cart }"
example_tags: "javascript|modulos|barrel|export-default|reexportar|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/04-barril-roto/):
//   cart.js        → export default class Cart; export const MAX_ITEMS
//   index.js       → 🐛 export * from './cart.js';
//   index-fixed.js → ✅ también export { default as Cart } from './cart.js';
//   checkout.js    → 🐛 import Cart from './index.js';
import * as broken from './04-barril-roto/index.js';
import * as fixed from './04-barril-roto/index-fixed.js';

console.log('🐛 index.js exporta →', Object.keys(broken));
console.log('✅ index-fixed.js exporta →', Object.keys(fixed));

// checkout.js pide el default del barrel roto: falla al enlazar.
try {
  await import('./04-barril-roto/checkout.js');
} catch (error) {
  console.log('🐛 checkout.js →', error.name, '|', error.message);
}

const cart = new fixed.Cart().add().add();
console.log('✅ new Cart() desde el barrel arreglado →', cart.count, 'productos');

// La razón: «export *» reexporta los NOMBRES de otro módulo, y «default»
// no cuenta como uno de ellos (si contara, dos «export *» chocarían siempre
// por sus default). La exportación por defecto hay que reexportarla a mano,
// y de paso darle un nombre.
```

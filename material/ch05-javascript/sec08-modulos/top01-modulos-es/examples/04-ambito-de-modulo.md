---
example_description: "Cada módulo tiene su propio ámbito y siempre está en modo estricto: los var y function de nivel superior no van a window, this vale undefined y asignar a una variable sin declarar es un error"
example_tags: "javascript|modulos|ambito|modo-estricto|this|var"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivos que usa: assets/04-ambito/shop.js y assets/04-ambito/blog.js.
// Los dos declaran «var visits» y «const title» en su nivel superior.
import { visit as visitShop } from './04-ambito/shop.js';
import { visit as visitBlog } from './04-ambito/blog.js';

console.log(visitShop());
console.log(visitShop());
console.log(visitBlog()); // sin choques: cada archivo tiene sus variables

// En un script clásico, estas dos líneas crearían propiedades de window.
var cartId = 'C-1001';
function greet() {
  return 'Hola';
}
console.log('¿cartId en window? →', 'cartId' in window);
console.log('¿greet en window? →', 'greet' in window);
console.log('¿visits en window? →', 'visits' in window);

// En el nivel superior de un módulo, this no es window.
console.log('this →', this);

// Modo estricto siempre, sin escribir 'use strict': una errata ya no crea
// una variable global en silencio.
let total = 0;
try {
  totl = 100; // 🐛 errata
} catch (error) {
  console.log('⛔', error.name, '|', error.message);
}
console.log('total →', total);

// Otra consecuencia: la consola de LearnWeb (y la de DevTools) no ve las
// variables de un módulo. Escribe «cartId» en ella: ReferenceError.
```

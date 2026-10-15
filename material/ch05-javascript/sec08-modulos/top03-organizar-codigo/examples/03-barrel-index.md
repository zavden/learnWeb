---
example_description: "Un barrel file (index.js) reúne la API pública de una carpeta: export * from, export { x } from y export { default as Cart } from; importar una sola función de él evalúa todos sus módulos"
example_tags: "javascript|python|modulos|barrel|reexportar|api-publica"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/03-tienda/):
//   money.js   → formatPrice, addVat
//   catalog.js → findProduct, normalizeSku (interna)
//   cart.js    → export default class Cart
//   index.js   → el barrel: reexporta la API pública de la carpeta
//
//   import … from './03-tienda/index.js'
//                      │
//        ┌─────────────┼──────────────┐
//    money.js      catalog.js      cart.js
import { Cart, formatPrice, findProduct } from './03-tienda/index.js';
import * as shop from './03-tienda/index.js';

console.log('1. el script empieza');
const cart = new Cart().add('CAF-500').add('MOL-001');
console.log('total →', formatPrice(cart.totalCents));
console.log('findProduct(\'CAF-500\') →', findProduct('CAF-500').name);

// La API pública: solo lo que index.js decidió reexportar.
console.log('API de la tienda →', Object.keys(shop));
console.log('¿normalizeSku es pública? →', 'normalizeSku' in shop);

// Fíjate en las tres líneas «(evaluando …)» de antes del paso 1: aunque este
// script solo usa tres nombres, el barrel carga TODOS sus módulos. Sin
// empaquetador, eso son tres descargas más por cada barrel.
// > Desde Python: index.js es el __init__.py de un paquete, con
//   «from .money import *» y «from .catalog import find_product». Pero el
//   navegador no busca index.js solo: hay que escribir la ruta completa.
```

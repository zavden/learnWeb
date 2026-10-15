---
example_description: "Un módulo se evalúa una sola vez por URL: dos archivos que importan el mismo store.js comparten su estado, los imports se evalúan antes que la primera línea del script, y la misma ruta con ?copia es otro módulo"
example_tags: "javascript|python|modulos|evaluacion|estado-compartido|cache"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/07-una-vez/):
//   store.js        → el array items y add(); avisa cuando se evalúa
//   header.js       → importa store.js para mostrar el contador
//   product-page.js → importa store.js para añadir productos
//
//          este script
//          ┌────┴──────┐
//      header.js  product-page.js
//          └────┬──────┘
//            store.js          ← un solo módulo, compartido
import { badge } from './07-una-vez/header.js';
import { buy } from './07-una-vez/product-page.js';
import * as store from './07-una-vez/store.js';
import * as storeCopy from './07-una-vez/store.js?copia'; // otra URL → otro módulo

// Los imports se resuelven y evalúan ANTES de esta línea, aunque estén
// escritos arriba como si fueran instrucciones normales.
console.log('1. primera línea del script');

console.log('cabecera →', badge());
buy('Café de Chiapas 500 g');
buy('Molinillo manual');
console.log('cabecera tras comprar en la ficha →', badge()); // ve el mismo array
console.log('store.items →', store.items);
console.log('¿storeCopy es el mismo módulo? →', storeCopy === store, '| sus productos →', storeCopy.items.length);

// El navegador guarda cada módulo en un «mapa de módulos» con su URL como
// clave: importarlo otra vez (desde aquí o desde otro archivo) devuelve el
// que ya existe. Una URL distinta (?copia) crea otro, con su propio estado.
// > Desde Python: sys.modules hace lo mismo; la clave es el nombre del
//   módulo («store»), no la ruta del archivo.
```

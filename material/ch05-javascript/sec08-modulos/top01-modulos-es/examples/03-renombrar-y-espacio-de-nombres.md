---
example_description: "Renombrar con as al exportar y al importar, e import * as: el objeto «espacio de nombres» del módulo, con sus claves ordenadas, la clave default y sin poder modificarse"
example_tags: "javascript|python|modulos|import|namespace|as"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivo que usa: assets/03-envios/shipping.js
// Exporta standard, express, inStore (que dentro se llama pickup) y un default.

// Renombrar al importar: standard llega aquí como standardShipping.
import { standard as standardShipping, inStore } from './03-envios/shipping.js';
// Importar el módulo entero: un objeto con TODAS sus exportaciones.
import * as shipping from './03-envios/shipping.js';

console.log('estándar para $845.00 →', standardShipping(84500));
console.log('estándar para $1,200.00 →', standardShipping(120000));
console.log('recoger en tienda →', inStore());

console.log('claves del módulo →', Object.keys(shipping)); // ordenadas
console.log('shipping.express() →', shipping.express());
console.log('¿default es standard? →', shipping.default === shipping.standard);
console.log('etiqueta →', shipping[Symbol.toStringTag]);

// El espacio de nombres es de solo lectura: ni cambiar ni añadir.
try {
  shipping.express = () => 0;
} catch (error) {
  console.log('⛔', error.name, '|', error.message);
}

// > Desde Python:
//   import shipping                    → import * as shipping from './shipping.js'
//   from shipping import standard as s → import { standard as s } from './shipping.js'
//   Un módulo de Python es un objeto que SÍ se puede modificar desde fuera
//   (shipping.express = …); el de JavaScript, no.
```

---
example_description: "Romper la dependencia circular: lo que necesitaban los dos módulos (el IVA) pasa a un tercero, tax.js, y el grafo queda sin ciclos; ahora funciona importe quien importe primero"
example_tags: "javascript|modulos|dependencias-circulares|refactorizar|arquitectura"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/08-sin-ciclo/):
//   tax.js       → TAX_RATE y withTax(); no importa nada
//   customers.js → importa tax.js
//   orders.js    → importa customers.js y tax.js
//
//   antes:  orders.js ⇄ customers.js
//
//   ahora:  orders.js ──→ customers.js
//               │              │
//               └──→ tax.js ←──┘
//
// Se importa primero orders.js: el orden que fallaba en el ejemplo 06.
import { orderSummary } from './08-sin-ciclo/orders.js';
import { TAX_NOTE } from './08-sin-ciclo/customers.js';

console.log(TAX_NOTE);
console.log(orderSummary({ id: 'P-1042', customerId: 'C-1', netCents: 42000 }));
console.log(orderSummary({ id: 'P-1043', customerId: 'C-2', netCents: 54900 }));

// Las tres salidas de un ciclo, de mejor a peor:
//   1. Extraer lo compartido a un módulo nuevo (aquí, tax.js).
//   2. Invertir una dependencia: que orders.js RECIBA la función que necesita
//      (un parámetro) en vez de importarla.
//   3. Usar lo importado solo dentro de funciones, nunca en el nivel
//      superior (ejemplo 07): funciona, pero el ciclo sigue ahí.
```

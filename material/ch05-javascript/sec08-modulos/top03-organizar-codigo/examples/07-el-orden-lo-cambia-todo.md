---
example_description: "Los mismos dos archivos con el ciclo, importados en el otro orden, funcionan: orders.js se evalúa primero y no usa nada de customers.js en su nivel superior; un bug que aparece o desaparece al reordenar los imports"
example_tags: "javascript|modulos|dependencias-circulares|evaluacion|orden"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivos que usa: assets/06-ciclo/orders.js y customers.js (los del
// ejemplo 06, sin cambiar ni una línea). Solo cambia QUÉ se importa primero.
//
//   1. customers.js necesita orders.js → se evalúa orders.js PRIMERO
//   2. orders.js necesita customers.js → «en curso»: no se espera
//   3. orders.js solo usa customerName DENTRO de una función: su nivel
//      superior no toca nada de customers.js → termina bien
//   4. customers.js lee TAX_RATE, que ya está inicializado → termina bien
import { TAX_NOTE } from './06-ciclo/customers.js';
import { orderSummary } from './06-ciclo/orders.js';

console.log(TAX_NOTE);
console.log(orderSummary({ id: 'P-1042', customerId: 'C-1', netCents: 42000 }));

// Funciona… por casualidad. Si alguien reordena estos dos import (a mano,
// o un editor que los ordena alfabéticamente), o si otro archivo de la
// aplicación importa orders.js antes que este, vuelve el ReferenceError
// del ejemplo 06. Un ciclo no es un error en sí, pero hace que el código
// dependa de un orden de evaluación que nadie ve. El arreglo: ejemplo 08.
```

---
example_description: "Paqueterías que se registran solas al importarse: imports por sus efectos en un barrel, un registro compartido (el módulo se evalúa una vez), el orden de evaluación como orden de registro y un plugin más cargado con import()"
example_tags: "javascript|modulos|efectos-secundarios|registro|plugins|evaluacion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/04-envios/):
//   registry.js           → un Map compartido, registerCarrier(), quoteAll()
//   carriers/index.js     → import './estafeta.js'; import './dhl.js'; import './pickup.js';
//   carriers/estafeta.js, dhl.js, pickup.js → se registran al evaluarse
//   carriers/same-day.js  → un «plugin» que se carga después, con import()
//
//   este script ─┬─ carriers/index.js ─┬─ estafeta.js ─┐
//                │                     ├─ dhl.js ──────┼─→ registry.js (uno solo)
//                │                     └─ pickup.js ───┘
//                └─ registry.js
import './04-envios/carriers/index.js'; // por sus efectos: registra las paqueterías
import { carrierIds, quoteAll } from './04-envios/registry.js';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

function printQuotes(order) {
  console.group(`▶ ${order.weightGrams / 1000} kg a ${order.city}`);
  for (const quote of quoteAll(order)) console.log(`${money.format(quote.cents / 100).padStart(8)}  ${quote.label}`);
  console.groupEnd();
}

console.log('registradas →', carrierIds().join(', '));
printQuotes({ weightGrams: 2500, city: 'Ciudad de México' });
printQuotes({ weightGrams: 25000, city: 'Monterrey' });

// La tienda activa el envío en el día: se carga el plugin y se registra en
// el MISMO Map, porque registry.js ya está evaluado.
await import('./04-envios/carriers/same-day.js');
console.log('registradas →', carrierIds().join(', '));
printQuotes({ weightGrams: 2500, city: 'Ciudad de México' });

// Ojo: un empaquetador no puede quitar un import «por sus efectos», aunque
// no se use ningún nombre suyo (no sabe si sus efectos importan). Y si
// alguien importa registry.js pero no carriers/index.js, el registro está
// vacío: el orden y la presencia de esos imports SON parte del programa.
```

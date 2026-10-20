---
example_description: "En qué orden se evalúan los módulos: primero las dependencias, en profundidad y en el orden de los import, cada una una sola vez, y el script principal al final; un import sin nombres se usa solo por sus efectos"
example_tags: "javascript|modulos|evaluacion|orden|efectos-secundarios"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/02-orden/); cada uno imprime su número al evaluarse:
//   polyfills.js  → no exporta nada (import solo por sus efectos)
//   config.js     → no importa nada
//   api.js        → importa config.js
//   cart.js       → importa api.js y config.js
//   analytics.js  → importa config.js
//
//   este script ─┬─ polyfills.js
//                ├─ cart.js ──┬─ api.js ── config.js
//                │            └─ config.js (ya evaluado)
//                └─ analytics.js ── config.js (ya evaluado)
import './02-orden/polyfills.js';
import { cartUrl } from './02-orden/cart.js';
import { track } from './02-orden/analytics.js';

console.log('6. el script principal, el último');
console.log('cartUrl(\'C-77\') →', cartUrl('C-77'));
console.log('track(\'checkout\') →', track('checkout'));

// La regla: antes de evaluar un módulo se evalúan sus dependencias, en el
// orden en que aparecen sus import, bajando en profundidad; un módulo que
// ya se evaluó no se repite. Es un recorrido en profundidad en «postorden»:
// las hojas primero, el script principal al final.
// Por eso «import './polyfills.js'» va el primero: su código se ejecuta
// antes que el de cualquier otro módulo del grafo.
```

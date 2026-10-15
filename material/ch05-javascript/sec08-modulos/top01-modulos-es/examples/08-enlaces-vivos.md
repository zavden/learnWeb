---
example_description: "Live bindings: un let importado cambia cuando el módulo que lo exporta lo reasigna; una copia en una const, o un valor calculado al evaluar el módulo, se queda con el valor viejo (en Python, from x import y siempre copia)"
example_tags: "javascript|python|modulos|live-bindings|import|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/08-vivas/):
//   settings.js  → export let currency = 'MXN'; export function setCurrency(code)
//   price-tag.js → importa currency; staleLabel() lo leyó al evaluarse,
//                  liveLabel() lo lee en cada llamada
import { currency, setCurrency } from './08-vivas/settings.js';
import { staleLabel, liveLabel } from './08-vivas/price-tag.js';

const copy = currency; // una copia del valor de ESTE momento

setCurrency('USD'); // el módulo de ajustes reasigna su let

console.log('currency (el import) →', currency); // ✅ USD: es un enlace vivo
console.log('copy (una const local) →', copy); // 🐛 MXN: se copió antes del cambio
console.log('🐛 staleLabel() →', staleLabel()); // calculado al evaluar price-tag.js
console.log('✅ liveLabel() →', liveLabel());

// Un import no es una variable con una copia del valor: es una VENTANA a la
// variable del otro módulo. Si el módulo la reasigna, el import lo ve.
// Lo que no se actualiza es lo que tú copiaste: una const, un parámetro, o un
// valor calculado en el nivel superior de un módulo (se ejecuta una vez).
//
// > Desde Python, al revés:
//     from settings import currency     → copia: sigue valiendo 'MXN'
//     import settings; settings.currency → 'USD' (se lee en el momento)
//   En JavaScript, las dos formas de importar dan enlaces vivos.
```

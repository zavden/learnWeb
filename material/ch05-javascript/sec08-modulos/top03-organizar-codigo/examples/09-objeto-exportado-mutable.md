---
example_description: "Un objeto exportado es compartido y modificable: una promoción cambia settings.freeShippingFromCents y la caja de toda la tienda lo nota; congelarlo convierte el cambio en un TypeError y obliga a crear un objeto nuevo"
example_tags: "javascript|python|modulos|estado-compartido|inmutabilidad|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/09-ajustes/):
//   settings.js        → 🐛 export const settings = { … } (modificable)
//   checkout.js        → shippingCents(): lee settings
//   promo.js           → 🐛 previewSummerPromo(): cambia settings
//   settings-frozen.js → ✅ SETTINGS congelado y withOverrides()
import { settings } from './09-ajustes/settings.js';
import { shippingCents } from './09-ajustes/checkout.js';
import { previewSummerPromo } from './09-ajustes/promo.js';
import { SETTINGS, withOverrides } from './09-ajustes/settings-frozen.js';

console.log('envío de un pedido de $500.00 →', shippingCents(50000));
console.log(previewSummerPromo());
// 🐛 promo.js cambió el objeto que comparten TODOS los módulos.
console.log('🐛 envío de un pedido de $500.00 →', shippingCents(50000));
console.log('🐛 settings.freeShippingFromCents →', settings.freeShippingFromCents);

// ✅ Un objeto congelado no se puede cambiar: en un módulo (modo estricto)
//    el intento lanza un TypeError justo donde está el error.
try {
  SETTINGS.freeShippingFromCents = 0;
} catch (error) {
  console.log('✅', error.name, '|', error.message);
}
// ✅ Quien necesita otros valores crea un objeto NUEVO, solo para él.
const summer = withOverrides({ freeShippingFromCents: 0 });
console.log('✅ promo →', summer.freeShippingFromCents, '| tienda →', SETTINGS.freeShippingFromCents);

// «export const» impide reasignar la variable (lección «Módulos ES»), no
// cambiar el objeto. Ojo: Object.freeze es superficial (lección
// «Propiedades a fondo»): los objetos de dentro habría que congelarlos aparte.
// > Desde Python, igual: un dict de nivel superior de un módulo es
//   compartido y cualquiera que lo importe puede modificarlo.
```

---
example_description: "export default de un objeto con funciones no es lo mismo que exportaciones con nombre: import { formatPrice } de ese módulo es un SyntaxError al enlazar, y un empaquetador no puede descartar las funciones que nadie usa"
example_tags: "javascript|modulos|export-default|tree-shaking|syntaxerror|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/10-default/):
//   format.js       → 🐛 export default { formatPrice, formatWeight };
//   format-named.js → ✅ export function formatPrice … export function formatWeight …
//   checkout.js     → 🐛 import { formatPrice } from './format.js';
import format from './10-default/format.js';
import { formatPrice, formatWeight } from './10-default/format-named.js';

// Con el objeto por defecto, las funciones son propiedades del objeto:
console.log('format.formatPrice(21000) →', format.formatPrice(21000));
const { formatWeight: weightOf } = format; // desestructurar DESPUÉS sí funciona
console.log('desestructurando después →', weightOf(500));

// 🐛 Pero las llaves de import NO son desestructuración: piden una
//    exportación con ese nombre. checkout.js lo intenta y falla al enlazar,
//    antes de ejecutar ninguna línea. (import() se explica en la lección
//    siguiente; aquí carga checkout.js sin detener este script.)
try {
  await import('./10-default/checkout.js');
} catch (error) {
  console.log('🐛 checkout.js →', error.name, '|', error.message);
}

// ✅ Con exportaciones con nombre, cada función se importa por separado.
console.log('✅ formatPrice(21000) →', formatPrice(21000), '| formatWeight(500) →', formatWeight(500));

// Otra razón para preferir nombres: un EMPAQUETADOR (lección «Rutas, import
// maps y herramientas») ve qué exportaciones se importan y descarta las demás
// (tree-shaking). Con un objeto por defecto no puede: el objeto entero, con
// todas sus funciones, viaja al navegador aunque solo uses una.
```

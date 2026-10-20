---
example_description: "Dos export * con un nombre repetido: el nombre ambiguo desaparece del barrel en silencio, e importarlo explícitamente es un SyntaxError (conflicting star exports); se arregla reexportando con nombres propios"
example_tags: "javascript|modulos|barrel|reexportar|conflicto|bug"
example_stage: common-error
example_importance: useful
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/05-conflicto/):
//   money.js       → format(cents), CURRENCY
//   weight.js      → format(grams), UNIT
//   index.js       → 🐛 export * from './money.js'; export * from './weight.js';
//   index-fixed.js → ✅ además, format as formatMoney / format as formatWeight
//   label.js       → 🐛 import { format } from './index.js';
import * as units from './05-conflicto/index.js';
import * as fixedUnits from './05-conflicto/index-fixed.js';

// 🐛 Ningún error al cargar el barrel… pero format no está.
console.log('🐛 index.js exporta →', Object.keys(units));
console.log('🐛 units.format →', units.format);

// 🐛 Pedirlo por su nombre sí es un error, al enlazar.
try {
  await import('./05-conflicto/label.js');
} catch (error) {
  console.log('🐛 label.js →', error.name, '|', error.message);
}

// ✅ Las exportaciones explícitas ganan a las de export *.
console.log('✅ index-fixed.js exporta →', Object.keys(fixedUnits));
console.log('✅', fixedUnits.formatMoney(48720), '·', fixedUnits.formatWeight(1500));

// Un barrel con muchos «export *» puede perder nombres así sin que nadie
// lo note hasta que alguien los importa. Un barrel con la lista explícita
// de lo que exporta es más largo, pero no tiene sorpresas.
```

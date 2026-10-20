---
example_description: "import() entrega el espacio de nombres del módulo, no su exportación por defecto: la función está en la clave default y se saca con { default: nombre }"
example_tags: "javascript|modulos|import-dinamico|export-default|namespace|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivo que usa: assets/04-slug/slugify.js
//   export default function slugify(text) { … }   ← solo un export default

// 🐛 Con el import estático, «import slugify from …» daría la función.
//    Pero import() entrega SIEMPRE el espacio de nombres (como import * as).
const slugify = await import('./04-slug/slugify.js');
console.log('🐛 typeof slugify →', typeof slugify);
console.log('🐛 sus claves →', Object.keys(slugify));
try {
  slugify('Café de Olla 500 g');
} catch (error) {
  console.log('🐛', error.name, '|', error.message);
}

// ✅ La exportación por defecto está en la clave «default».
const { default: toSlug } = await import('./04-slug/slugify.js');
console.log('✅', toSlug('Café de Olla 500 g'));

// ✅ O sin desestructurar:
const slugModule = await import('./04-slug/slugify.js');
console.log('✅', slugModule.default('Mole   poblano en pasta'));

// Las exportaciones con nombre no tienen este problema:
//   const { renderPdf } = await import('./pdf-export.js');
```

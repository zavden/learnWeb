---
example_description: "Dentro de un módulo creado desde un Blob, una ruta relativa como './07-blobs/prices.js' no se puede resolver (una URL blob: no es una carpeta); se arregla resolviendo la ruta antes con import.meta.resolve"
example_tags: "javascript|modulos|import-dinamico|blob|import-meta|bug"
example_stage: common-error
example_importance: useful
console: true
---

# JavaScript

```javascript
// Archivo que usa: assets/07-blobs/prices.js (exporta priceOf).
function moduleUrl(code) {
  return URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
}

// 🐛 Una ruta relativa se resuelve contra la URL del módulo que importa.
//    La de un blob es blob:<origen>/<uuid>: no tiene carpetas, y
//    './07-blobs/prices.js' no tiene contra qué resolverse.
const brokenUrl = moduleUrl(`
import { priceOf } from './07-blobs/prices.js';
export const coffeeCents = priceOf('café de Chiapas');
`);
try {
  await import(brokenUrl);
} catch (error) {
  console.log('🐛', error.name, '| ¿«Failed to resolve module specifier…»? →', error.message.startsWith('Failed to resolve module specifier'));
}

// ✅ Resuelve la ruta AQUÍ, donde sí hay una URL con carpetas, y escribe la
//    URL completa en el texto del módulo. import.meta.resolve(ruta) hace la
//    misma resolución que haría un import desde este script.
const pricesHref = import.meta.resolve('./07-blobs/prices.js');
console.log('✅ ruta resuelta → empieza por http:', pricesHref.startsWith('http'), '| termina en:', pricesHref.split('/').slice(-2).join('/'));

const fixedUrl = moduleUrl(`
import { priceOf } from '${pricesHref}';
export const coffeeCents = priceOf('café de Chiapas');
`);
const { coffeeCents } = await import(fixedUrl);
console.log('✅ precio del café desde el blob →', coffeeCents);

// Lo mismo pasa con los módulos de una URL data: (ejemplo 08).
```
